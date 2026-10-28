-- Remaining domain workflows; local adapter receipts are explicitly simulated, never chain signatures.
CREATE TABLE domain_idempotency (
  domain text NOT NULL, actor text NOT NULL, request_id text NOT NULL, request_hash text NOT NULL,
  response jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(domain,actor,request_id)
);
ALTER TABLE livestreams ADD COLUMN title text NOT NULL DEFAULT '';
ALTER TABLE livestreams ADD COLUMN provider_room_id text;
ALTER TABLE livestreams ADD COLUMN playback_url text;
ALTER TABLE livestreams ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE clips ADD COLUMN title text NOT NULL DEFAULT '';
ALTER TABLE clips ADD COLUMN hidden boolean NOT NULL DEFAULT false;
ALTER TABLE clips ADD COLUMN clip_key text UNIQUE;
ALTER TABLE clips ADD COLUMN thumbnail_url text;
ALTER TABLE clips ADD COLUMN mp4_url text;
ALTER TABLE clips ADD COLUMN created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE bounty_tasks ADD COLUMN pump_follower_gate boolean NOT NULL DEFAULT false;
ALTER TABLE bounty_tasks ADD COLUMN dispute_ends_at timestamptz;
ALTER TABLE bounty_tasks ADD COLUMN decision jsonb;
ALTER TABLE bounty_tasks ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE bounty_escrows ADD COLUMN funding_ref text UNIQUE;
ALTER TABLE bounty_escrows ADD COLUMN settlement_ref text UNIQUE;
ALTER TABLE bounty_escrows ADD COLUMN simulated boolean NOT NULL DEFAULT false;
CREATE TABLE bounty_ledger (
  id uuid PRIMARY KEY, task_id uuid NOT NULL REFERENCES bounty_tasks(id), operation text NOT NULL,
  direction text NOT NULL CHECK(direction IN ('credit','debit')), mint text NOT NULL,
  amount_atomic numeric(78,0) NOT NULL CHECK(amount_atomic>=0), beneficiary uuid REFERENCES users(id),
  provider_ref text NOT NULL UNIQUE, simulated boolean NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(task_id,operation)
);
CREATE TABLE bridge_quotes (
  id uuid PRIMARY KEY, owner uuid NOT NULL REFERENCES users(id), request_data jsonb NOT NULL,
  provider_quote jsonb NOT NULL, expires_at timestamptz NOT NULL,
  status text NOT NULL CHECK(status IN ('quoted','executing','success','failure','unknown')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE bridge_requests (
  id uuid PRIMARY KEY, quote_id uuid NOT NULL UNIQUE REFERENCES bridge_quotes(id), owner uuid NOT NULL REFERENCES users(id),
  status text NOT NULL CHECK(status IN ('executing','success','failure','unknown')), provider_request_id text UNIQUE,
  result jsonb, simulated boolean NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE notification_devices (
  user_id uuid NOT NULL REFERENCES users(id), device_id text NOT NULL, platform text NOT NULL,
  token_ciphertext bytea NOT NULL, token_hash bytea NOT NULL UNIQUE, active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(user_id,device_id)
);
CREATE TABLE notifications (
  id uuid PRIMARY KEY, user_id uuid NOT NULL REFERENCES users(id), source_key text NOT NULL UNIQUE,
  kind text NOT NULL, payload jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX notifications_user_page ON notifications(user_id,created_at DESC,id);
CREATE TABLE notification_deliveries (
  notification_id uuid NOT NULL REFERENCES notifications(id), device_id text NOT NULL, user_id uuid NOT NULL REFERENCES users(id),
  status text NOT NULL CHECK(status IN ('pending','delivered','failed')), attempts integer NOT NULL DEFAULT 0,
  next_attempt_at timestamptz NOT NULL DEFAULT now(), delivered_at timestamptz, provider_ref text,
  PRIMARY KEY(notification_id,device_id), FOREIGN KEY(user_id,device_id) REFERENCES notification_devices(user_id,device_id)
);
CREATE TABLE notification_receipts (
  notification_id uuid NOT NULL REFERENCES notifications(id), user_id uuid NOT NULL REFERENCES users(id), device_id text NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(notification_id,device_id),
  FOREIGN KEY(user_id,device_id) REFERENCES notification_devices(user_id,device_id)
);
ALTER TABLE notifications ADD COLUMN in_app_published_at timestamptz;
