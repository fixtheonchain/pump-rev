-- Workflow ownership follows reconstruction/blueprint.md; amounts are atomic integers or decimals.
CREATE EXTENSION IF NOT EXISTS citext;
CREATE TABLE users (
  id uuid PRIMARY KEY, username citext NOT NULL UNIQUE, bio text NOT NULL DEFAULT '',
  kind text NOT NULL DEFAULT 'PERSON' CHECK(kind IN ('PERSON','GROUP')),
  canonical_svm_wallet text UNIQUE, canonical_evm_wallet text UNIQUE, x_username citext UNIQUE,
  banned_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE wallets (
  address text PRIMARY KEY, user_id uuid NOT NULL REFERENCES users(id), chain text NOT NULL,
  custody text NOT NULL CHECK(custody IN ('privy','external')), reserved boolean NOT NULL DEFAULT false
);
CREATE INDEX wallets_user ON wallets(user_id);
CREATE TABLE sessions (
  jti uuid PRIMARY KEY, user_id uuid REFERENCES users(id), wallet text NOT NULL,
  expires_at timestamptz NOT NULL, revoked_at timestamptz
);
CREATE TABLE follows (
  follower uuid NOT NULL REFERENCES users(id), followee uuid NOT NULL REFERENCES users(id),
  trade_notifications boolean NOT NULL DEFAULT false, origin text, created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(follower,followee), CHECK(follower <> followee)
);
CREATE INDEX follows_reverse ON follows(followee,follower);
CREATE TABLE groups (
  id uuid PRIMARY KEY, username citext NOT NULL UNIQUE, bio text NOT NULL DEFAULT '',
  owner uuid NOT NULL REFERENCES users(id), seats integer NOT NULL CHECK(seats>0), created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE group_members (
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE, user_id uuid NOT NULL REFERENCES users(id),
  role text NOT NULL CHECK(role IN ('OWNER','ADMIN','MEMBER')), status text NOT NULL CHECK(status IN ('ACTIVE','INVITED')),
  PRIMARY KEY(group_id,user_id)
);
CREATE TABLE coins (
  chain text NOT NULL, address text NOT NULL, name text NOT NULL, symbol text NOT NULL,
  description text NOT NULL DEFAULT '', creator text NOT NULL, decimals integer NOT NULL CHECK(decimals BETWEEN 0 AND 38),
  quote_mint text NOT NULL, quote_decimals integer NOT NULL CHECK(quote_decimals BETWEEN 0 AND 38),
  total_supply numeric(78,0) NOT NULL CHECK(total_supply>=0), complete boolean NOT NULL DEFAULT false,
  mayhem_mode boolean NOT NULL DEFAULT false, mayhem_ends_at timestamptz,
  security_verdict jsonb NOT NULL DEFAULT '{"verdict":"allow"}', metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(chain,address),
  CHECK(NOT mayhem_mode OR mayhem_ends_at IS NOT NULL)
);
CREATE TABLE callout_media (
  id uuid PRIMARY KEY, owner uuid NOT NULL REFERENCES users(id), kind text NOT NULL,
  status text NOT NULL CHECK(status IN ('pending','clean','rejected')), object_key text, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE callouts (
  id uuid PRIMARY KEY, author uuid NOT NULL REFERENCES users(id), acting_group uuid REFERENCES groups(id),
  chain text NOT NULL, coin text NOT NULL, thesis text NOT NULL DEFAULT '', media_id uuid REFERENCES callout_media(id),
  quoted_callout uuid REFERENCES callouts(id), source_ref text,
  price_usd_at_call numeric(78,36) NOT NULL CHECK(price_usd_at_call>0),
  mcap_usd_at_call numeric(78,36) NOT NULL CHECK(mcap_usd_at_call>0), max_multiplier numeric,
  status text NOT NULL DEFAULT 'live' CHECK(status IN ('live','closed','removed')),
  created_at timestamptz NOT NULL DEFAULT now(), FOREIGN KEY(chain,coin) REFERENCES coins(chain,address)
);
CREATE UNIQUE INDEX one_live_callout ON callouts(author,chain,coin) WHERE status='live';
CREATE UNIQUE INDEX one_callout_per_pull ON callouts(author,source_ref) WHERE source_ref IS NOT NULL;
CREATE INDEX callouts_recent ON callouts(created_at DESC,id);
CREATE TABLE callout_write_attempts (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, author uuid NOT NULL REFERENCES users(id), created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX callout_attempt_window ON callout_write_attempts(author,created_at DESC);
CREATE TABLE communities_outbox (
  id uuid PRIMARY KEY, subject text NOT NULL, payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(), published_at timestamptz
);
CREATE INDEX communities_outbox_pending ON communities_outbox(created_at) WHERE published_at IS NULL;
CREATE TABLE competitions (
  id uuid PRIMARY KEY, slug text NOT NULL UNIQUE, kind text NOT NULL CHECK(kind IN ('person','squad')),
  registration_opens_at timestamptz, starts_at timestamptz, ends_at timestamptz,
  entry_cap integer, min_size integer, max_size integer,
  CHECK(ends_at IS NULL OR starts_at IS NULL OR ends_at>starts_at)
);
CREATE TABLE competition_entries (
  id uuid PRIMARY KEY, competition_id uuid NOT NULL REFERENCES competitions(id), user_id uuid REFERENCES users(id),
  group_id uuid REFERENCES groups(id), struck_at timestamptz, CHECK((user_id IS NULL)<>(group_id IS NULL))
);
CREATE UNIQUE INDEX competition_person_entry ON competition_entries(competition_id,user_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX competition_squad_entry ON competition_entries(competition_id,group_id) WHERE group_id IS NOT NULL;
CREATE TABLE competition_roster (
  entry_id uuid NOT NULL REFERENCES competition_entries(id), user_id uuid NOT NULL REFERENCES users(id), wallet text NOT NULL,
  PRIMARY KEY(entry_id,user_id)
);
CREATE TABLE payouts (
  id uuid PRIMARY KEY, user_id uuid NOT NULL REFERENCES users(id), class text NOT NULL CHECK(class IN ('reward','referral')),
  amount_usdc_micros bigint NOT NULL CHECK(amount_usdc_micros>=0), status text NOT NULL, tx text,
  idempotency_key text NOT NULL UNIQUE, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE referrals (
  referee uuid PRIMARY KEY REFERENCES users(id), referrer uuid NOT NULL REFERENCES users(id), code text NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now(), CHECK(referee<>referrer)
);
CREATE TABLE api_orgs (
  id uuid PRIMARY KEY, owner uuid NOT NULL UNIQUE REFERENCES users(id),
  status text NOT NULL CHECK(status IN ('applied','approved','closed','suspended')),
  contact_email text, email_verified_at timestamptz, terms_version text, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE api_keys (
  id uuid PRIMARY KEY, org_id uuid NOT NULL REFERENCES api_orgs(id), name text NOT NULL,
  prefix text NOT NULL, last4 text NOT NULL, hash bytea NOT NULL UNIQUE, scopes text[] NOT NULL,
  daily_limit integer NOT NULL CHECK(daily_limit>=0), burst integer NOT NULL CHECK(burst>0),
  status text NOT NULL CHECK(status IN ('active','rotating','revoked')), rotated_from uuid REFERENCES api_keys(id),
  grace_until timestamptz, last_used_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE api_terms_acceptances (
  org_id uuid NOT NULL REFERENCES api_orgs(id), version text NOT NULL, acceptor uuid NOT NULL REFERENCES users(id),
  accepted_at timestamptz NOT NULL DEFAULT now(), ip inet, PRIMARY KEY(org_id,version)
);
CREATE TABLE api_audit (
  id uuid PRIMARY KEY, org_id uuid REFERENCES api_orgs(id), actor uuid REFERENCES users(id), action text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE limit_orders (
  order_address text PRIMARY KEY, user_wallet text NOT NULL, mint text NOT NULL, quote_mint text NOT NULL,
  order_type text NOT NULL, amount_in numeric(78,0) NOT NULL CHECK(amount_in>0), trigger_mcap_usd numeric(78,36) NOT NULL,
  min_quote_out numeric(78,0), nonce_account text NOT NULL, nonce_landed_slot numeric(20,0),
  signed_tx bytea NOT NULL, status text NOT NULL CHECK(status IN ('active','executing','success','cancelled','failure','expired')),
  settlement jsonb, idempotency_key text NOT NULL UNIQUE, deadline timestamptz, executed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX limit_active_nonce ON limit_orders(nonce_account) WHERE status IN ('active','executing');
CREATE TABLE livestreams (
  id uuid PRIMARY KEY, chain text NOT NULL, coin text NOT NULL, creator uuid NOT NULL REFERENCES users(id),
  room text NOT NULL, status text NOT NULL, started_at timestamptz, ended_at timestamptz,
  FOREIGN KEY(chain,coin) REFERENCES coins(chain,address)
);
CREATE UNIQUE INDEX one_live_room ON livestreams(room) WHERE ended_at IS NULL;
CREATE TABLE clips (
  id uuid PRIMARY KEY, stream_id uuid NOT NULL REFERENCES livestreams(id), session_id text NOT NULL,
  start_ms bigint NOT NULL, end_ms bigint NOT NULL CHECK(end_ms>start_ms), variants jsonb NOT NULL DEFAULT '{}',
  thumbnail_key text, type text NOT NULL, views bigint NOT NULL DEFAULT 0, pinned boolean NOT NULL DEFAULT false,
  deletion_status text NOT NULL DEFAULT 'active', deleted_at timestamptz
);
CREATE TABLE bounty_tasks (
  id uuid PRIMARY KEY, poster uuid NOT NULL REFERENCES users(id), title text NOT NULL, markdown text NOT NULL,
  phase text NOT NULL CHECK(phase IN ('DRAFT','OPEN','PENDING_RESOLUTION','IN_DISPUTE_PERIOD','CLOSED')),
  chain text, coin_address text, expires_at timestamptz, moderation_state text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE bounty_escrows (
  task_id uuid PRIMARY KEY REFERENCES bounty_tasks(id), mint text NOT NULL, amount_atomic numeric(78,0) NOT NULL CHECK(amount_atomic>=0),
  purpose text NOT NULL, settled boolean NOT NULL DEFAULT false, settled_at timestamptz,
  refund_bps integer NOT NULL DEFAULT 0 CHECK(refund_bps BETWEEN 0 AND 10000),
  refund_owed_atomic numeric(78,0) NOT NULL DEFAULT 0, refund_claimed boolean NOT NULL DEFAULT false
);
CREATE TABLE bounty_submissions (
  id uuid PRIMARY KEY, task_id uuid NOT NULL REFERENCES bounty_tasks(id), author uuid NOT NULL REFERENCES users(id),
  markdown text NOT NULL, moderation_state text NOT NULL DEFAULT 'pending', payout_atomic numeric(78,0),
  payout_tx text UNIQUE, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE keeper_runs (
  job text NOT NULL, run_id text NOT NULL, inputs jsonb NOT NULL, txs jsonb NOT NULL DEFAULT '[]', status text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(job,run_id)
);
CREATE TABLE external_identities (
  provider text NOT NULL, subject text NOT NULL, user_id uuid NOT NULL REFERENCES users(id),
  wallet text NOT NULL REFERENCES wallets(address), PRIMARY KEY(provider,subject)
);
