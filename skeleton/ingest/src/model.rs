use anyhow::{Result, ensure};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::BTreeMap;

pub const SOLANA: &str = "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp";

// Ordering is numeric, never a lexicographic comparison of decimal strings.
#[derive(Clone, Debug, Deserialize, Serialize, Eq, PartialEq, Ord, PartialOrd)]
pub struct Ordinal {
    #[serde(with = "string_u64")]
    pub block_id: u64,
    pub tx_index: u32,
    pub event_index: u32,
    #[serde(with = "string_i64")]
    pub block_time_ms: i64,
}
impl Ordinal {
    pub fn key(&self) -> String {
        format!("{}-{}-{}", self.block_id, self.tx_index, self.event_index)
    }
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq)]
pub struct Event {
    pub chain: String,
    pub mint: String,
    pub event_name: String,
    pub kind: String,
    pub commitment: String,
    pub ordinal: Ordinal,
    #[serde(with = "string_u64")]
    pub version: u64,
    pub deleted: bool,
    pub wallet: String,
    pub side: String,
    pub base_amount: String,
    pub quote_amount: String,
    pub quote_mint: String,
    pub price_usd: String,
    pub market_cap_usd: String,
    pub fee_protocol: String,
    pub fee_creator: String,
    pub signature: String,
    pub metadata: Value,
}
impl Event {
    pub fn key(&self) -> String {
        format!("{}:{}", self.chain, self.ordinal.key())
    }
    pub fn is_trade(&self) -> bool {
        matches!(
            self.event_name.as_str(),
            "TradeEvent" | "BuyEvent" | "SellEvent"
        )
    }
    pub fn changed_from(&self, previous: &Self) -> bool {
        let mut a = self.clone();
        let mut b = previous.clone();
        a.version = 0;
        b.version = 0;
        a.commitment.clear();
        b.commitment.clear();
        a.kind.clear();
        b.kind.clear();
        for event in [&mut a, &mut b] {
            if let Some(metadata) = event.metadata.as_object_mut() {
                metadata.remove("_replaces");
            }
        }
        a != b
    }
    pub fn row(&self) -> Value {
        let mut row = serde_json::to_value(self).expect("serializable event");
        let object = row.as_object_mut().unwrap();
        object.remove("kind");
        object.remove("ordinal");
        object.remove("metadata");
        object.insert("block_id".into(), self.ordinal.block_id.to_string().into());
        object.insert("tx_index".into(), self.ordinal.tx_index.into());
        object.insert("event_index".into(), self.ordinal.event_index.into());
        object.insert(
            "block_time_ms".into(),
            self.ordinal.block_time_ms.to_string().into(),
        );
        object.insert("deleted".into(), (self.deleted as u8).into());
        let mut metadata = self.metadata.clone();
        metadata
            .as_object_mut()
            .expect("object metadata")
            .insert("_frame_kind".into(), self.kind.clone().into());
        object.insert("metadata_json".into(), metadata.to_string().into());
        row
    }
    pub fn from_row(mut row: Value) -> Result<Self> {
        let o = row
            .as_object_mut()
            .ok_or_else(|| anyhow::anyhow!("invalid event_log row"))?;
        // ClickHouse JSON quotes 64/128-bit integers by default, while Decimal
        // output may be JSON numbers. Preserve their lexical decimal strings.
        for field in [
            "base_amount",
            "quote_amount",
            "price_usd",
            "market_cap_usd",
            "fee_protocol",
            "fee_creator",
        ] {
            if let Some(value) = o.get_mut(field) {
                if value.is_number() {
                    *value = value.to_string().into();
                }
            }
        }
        let ordinal = serde_json::json!({"block_id":o.remove("block_id"),"tx_index":o.remove("tx_index"),"event_index":o.remove("event_index"),"block_time_ms":o.remove("block_time_ms")});
        let metadata = o
            .remove("metadata_json")
            .and_then(|x| x.as_str().map(str::to_owned))
            .unwrap_or_else(|| "{}".into());
        let deleted = o.get("deleted").and_then(Value::as_u64).unwrap_or(0) != 0;
        let mut metadata: Value = serde_json::from_str(&metadata)?;
        let kind = metadata
            .as_object_mut()
            .and_then(|m| m.remove("_frame_kind"))
            .unwrap_or_else(|| "LIVE".into());
        o.insert("ordinal".into(), ordinal);
        o.insert("deleted".into(), deleted.into());
        o.insert("metadata".into(), metadata);
        o.insert("kind".into(), kind);
        Ok(serde_json::from_value(row)?)
    }
}

#[derive(Default)]
pub struct CanonicalState {
    pub events: BTreeMap<String, Event>,
}
impl CanonicalState {
    pub fn apply(&mut self, mut next: Event) -> Result<Option<Event>> {
        ensure!(
            next.commitment == "processed" || next.commitment == "confirmed",
            "unknown commitment"
        );
        if let Some(previous) = self.events.get(&next.key()) {
            if next.version < previous.version {
                return Ok(None);
            }
            // Equal-version replay is republished with the same message id to repair a crash
            // between the ClickHouse write and the JetStream acknowledgement.
            if next.version == previous.version {
                ensure!(
                    !next.changed_from(previous),
                    "conflicting payload at identical source revision"
                );
                return Ok(Some(previous.clone()));
            }
            if next.changed_from(previous) {
                next.kind = "CORRECTION".into();
            }
            if next.mint != previous.mint || next.event_name != previous.event_name {
                next.metadata
                    .as_object_mut()
                    .expect("object metadata")
                    .insert(
                        "_replaces".into(),
                        serde_json::json!({"mint":previous.mint,"event_name":previous.event_name}),
                    );
            }
        }
        self.events.insert(next.key(), next.clone());
        Ok(Some(next))
    }
    pub fn dropped_in_block(&self, block: u64, seen: &[String]) -> Vec<Event> {
        self.events
            .values()
            .filter(|e| {
                e.ordinal.block_id == block
                    && !e.deleted
                    && e.commitment == "processed"
                    && !seen.contains(&e.ordinal.key())
            })
            .map(|e| {
                let mut e = e.clone();
                e.deleted = true;
                e.commitment = "confirmed".into();
                e.kind = "CORRECTION".into();
                e.version = (1_u64 << 63) | 1;
                e
            })
            .collect()
    }
}

pub fn version(commitment: &str, revision: u64) -> Result<u64> {
    ensure!(
        revision > 0 && revision < (1_u64 << 63),
        "revision must fit a positive 63-bit integer"
    );
    match commitment {
        "processed" => Ok(revision),
        "confirmed" => Ok((1_u64 << 63) | revision),
        _ => anyhow::bail!("unknown commitment"),
    }
}

mod string_u64 {
    use serde::{Deserialize, Deserializer, Serializer};
    pub fn serialize<S: Serializer>(value: &u64, serializer: S) -> Result<S::Ok, S::Error> {
        serializer.serialize_str(&value.to_string())
    }
    pub fn deserialize<'de, D: Deserializer<'de>>(d: D) -> Result<u64, D::Error> {
        let v = serde_json::Value::deserialize(d)?;
        match v {
            serde_json::Value::String(s) => s.parse().map_err(serde::de::Error::custom),
            v => v
                .as_u64()
                .ok_or_else(|| serde::de::Error::custom("expected uint64")),
        }
    }
}
mod string_i64 {
    use serde::{Deserialize, Deserializer, Serializer};
    pub fn serialize<S: Serializer>(value: &i64, serializer: S) -> Result<S::Ok, S::Error> {
        serializer.serialize_str(&value.to_string())
    }
    pub fn deserialize<'de, D: Deserializer<'de>>(d: D) -> Result<i64, D::Error> {
        let v = serde_json::Value::deserialize(d)?;
        match v {
            serde_json::Value::String(s) => s.parse().map_err(serde::de::Error::custom),
            v => v
                .as_i64()
                .ok_or_else(|| serde::de::Error::custom("expected int64")),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    fn event() -> Event {
        Event {
            chain: SOLANA.into(),
            mint: "mint".into(),
            event_name: "TradeEvent".into(),
            kind: "LIVE".into(),
            commitment: "processed".into(),
            ordinal: Ordinal {
                block_id: 9,
                tx_index: 2,
                event_index: 0,
                block_time_ms: 1,
            },
            version: 1,
            deleted: false,
            wallet: "wallet".into(),
            side: "buy".into(),
            base_amount: "100".into(),
            quote_amount: "10".into(),
            quote_mint: "quote".into(),
            price_usd: "1".into(),
            market_cap_usd: "1000".into(),
            fee_protocol: "0".into(),
            fee_creator: "0".into(),
            signature: "signature".into(),
            metadata: serde_json::json!({}),
        }
    }
    #[test]
    fn ordinals_compare_numerically() {
        let mut a = event().ordinal;
        let mut b = a.clone();
        a.block_id = 10;
        b.block_id = 9;
        assert!(a > b);
        b.block_id = 10;
        b.tx_index = 10;
        assert!(b > a);
    }
    #[test]
    fn confirmation_corrects_and_processed_cannot_restore() {
        let mut state = CanonicalState::default();
        let a = event();
        state.apply(a.clone()).unwrap();
        let mut b = a.clone();
        b.commitment = "confirmed".into();
        b.version = version("confirmed", 1).unwrap();
        b.quote_amount = "12".into();
        assert_eq!(state.apply(b.clone()).unwrap().unwrap().kind, "CORRECTION");
        assert!(state.apply(a).unwrap().is_none());
        assert_eq!(state.events.values().next().unwrap().quote_amount, "12");
        assert!(state.dropped_in_block(9, &[]).is_empty());
    }
    #[test]
    fn disappeared_processed_event_becomes_tombstone() {
        let mut state = CanonicalState::default();
        state.apply(event()).unwrap();
        let tombstone = state.dropped_in_block(9, &[]).pop().unwrap();
        assert!(tombstone.deleted);
        assert_eq!(state.apply(tombstone).unwrap().unwrap().kind, "CORRECTION");
    }
    #[test]
    fn cross_mint_correction_remembers_old_projection_for_replay() {
        let mut state = CanonicalState::default();
        let original = event();
        state.apply(original.clone()).unwrap();
        let mut replacement = original.clone();
        replacement.mint = "replacement".into();
        replacement.commitment = "confirmed".into();
        replacement.version = version("confirmed", 1).unwrap();
        let corrected = state.apply(replacement.clone()).unwrap().unwrap();
        assert_eq!(corrected.kind, "CORRECTION");
        assert_eq!(corrected.metadata["_replaces"]["mint"], "mint");
        // Restoring the canonical row must retain enough information to finish
        // old projections if the previous attempt stopped after its event_log write.
        let restored = Event::from_row(corrected.row()).unwrap();
        let mut resumed = CanonicalState::default();
        resumed.events.insert(restored.key(), restored);
        assert!(
            resumed
                .apply(replacement)
                .unwrap()
                .unwrap()
                .metadata
                .get("_replaces")
                .is_some()
        );
    }
}
