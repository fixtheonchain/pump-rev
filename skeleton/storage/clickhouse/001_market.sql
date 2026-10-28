-- Identity excludes timestamp so confirmation may correct block time without duplicating an event.
CREATE TABLE IF NOT EXISTS event_log (
  chain LowCardinality(String), mint String, block_id UInt64, tx_index UInt32, event_index UInt32,
  block_time_ms Int64, commitment LowCardinality(String), event_name String,
  version UInt64, deleted UInt8, wallet String, side LowCardinality(String),
  base_amount UInt128, quote_amount UInt128, quote_mint String,
  price_usd Decimal128(18), market_cap_usd Decimal128(18), fee_protocol UInt64, fee_creator UInt64,
  signature String, metadata_json String
) ENGINE=ReplacingMergeTree(version) ORDER BY(chain,mint,block_id,tx_index,event_index);
CREATE TABLE IF NOT EXISTS trades AS event_log
ENGINE=ReplacingMergeTree(version) ORDER BY(chain,mint,block_id,tx_index,event_index);
CREATE TABLE IF NOT EXISTS fee_events AS event_log
ENGINE=ReplacingMergeTree(version) ORDER BY(chain,mint,block_id,tx_index,event_index);
CREATE TABLE IF NOT EXISTS position_deltas AS event_log
ENGINE=ReplacingMergeTree(version) ORDER BY(chain,mint,block_id,tx_index,event_index);
ALTER TABLE position_deltas ADD COLUMN IF NOT EXISTS delta Int128 MATERIALIZED if(side='buy',toInt128(base_amount),-toInt128(base_amount));
-- Round 1 folds canonical trades FINAL so corrections cannot leave stale bars.
CREATE TABLE IF NOT EXISTS candles (
  chain LowCardinality(String), mint String, res LowCardinality(String), measure LowCardinality(String),
  time_ms Int64, commitment LowCardinality(String), version UInt64, deleted UInt8,
  open Decimal128(18), high Decimal128(18), low Decimal128(18), close Decimal128(18),
  volume_base UInt128, volume_quote UInt128, trade_count UInt64
) ENGINE=ReplacingMergeTree(version) ORDER BY(chain,mint,res,measure,time_ms,commitment);
