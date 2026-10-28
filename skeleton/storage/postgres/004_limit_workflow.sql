-- Extends the round-one presigned-order model; never edits an applied migration.
CREATE TABLE limit_preparations (
  prepared_id uuid PRIMARY KEY,
  request_id text NOT NULL UNIQUE,
  request_hash text NOT NULL,
  user_wallet text NOT NULL,
  mint text NOT NULL,
  quote_mint text NOT NULL,
  order_type text NOT NULL,
  side text NOT NULL CHECK(side IN ('buy','sell')),
  direction text NOT NULL CHECK(direction IN ('above','below')),
  amount_in numeric(78,0) NOT NULL CHECK(amount_in>0),
  min_quote_out numeric(78,0) NOT NULL CHECK(min_quote_out>=0),
  trigger_mcap_usd numeric(78,36) NOT NULL CHECK(trigger_mcap_usd>0),
  nonce_account text NOT NULL,
  nonce_value text NOT NULL,
  nonce_authority text NOT NULL,
  nonce_landed_slot numeric(20,0) NOT NULL,
  deadline timestamptz NOT NULL,
  response jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE limit_orders ADD COLUMN prepared_id uuid REFERENCES limit_preparations(prepared_id);
ALTER TABLE limit_orders ADD COLUMN signed_signature text;
ALTER TABLE limit_orders ADD COLUMN nonce_value text;
ALTER TABLE limit_orders ADD COLUMN nonce_authority text;
ALTER TABLE limit_orders ADD COLUMN direction text CHECK(direction IN ('above','below'));
CREATE UNIQUE INDEX one_order_per_preparation ON limit_orders(prepared_id) WHERE prepared_id IS NOT NULL;
CREATE TABLE limit_settlements (
  order_address text PRIMARY KEY REFERENCES limit_orders(order_address),
  signature text NOT NULL,
  state text NOT NULL CHECK(state IN ('reserved','pending','success','failure','expired')),
  reason text,
  attempts integer NOT NULL DEFAULT 0,
  finalized_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
