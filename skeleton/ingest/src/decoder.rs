use crate::model::{Event, Ordinal, SOLANA, version};
use anyhow::{Context, Result, bail, ensure};
use rust_decimal::{Decimal, RoundingStrategy};
use serde_json::{Map, Value, json};
use std::{collections::HashMap, str::FromStr};

const EVENTS: &[&str] = &[
    "TradeEvent",
    "CreateEvent",
    "CompleteEvent",
    "BuyEvent",
    "SellEvent",
    "CreatePoolEvent",
];
pub struct Decoder {
    idls: HashMap<String, Value>,
}
impl Decoder {
    pub fn new() -> Result<Self> {
        let mut idls = HashMap::new();
        for source in [
            include_str!("../idl/pump.json"),
            include_str!("../idl/pump_amm.json"),
            include_str!("../idl/pump_fees.json"),
        ] {
            let idl: Value = serde_json::from_str(source)?;
            idls.insert(
                idl["address"]
                    .as_str()
                    .context("IDL missing address")?
                    .into(),
                idl,
            );
        }
        Ok(Self { idls })
    }
    pub fn programs(&self) -> Vec<String> {
        self.idls.keys().cloned().collect()
    }
    pub fn decode(&self, program: &str, data: &[u8]) -> Result<Option<(String, Value)>> {
        let idl = self.idls.get(program).context("program has no local IDL")?;
        // Anchor self-CPI puts the fixed event instruction tag before the event discriminator.
        // Direct event bytes (fixtures/log data) start at offset zero.
        const EVENT_CPI_TAG: [u8; 8] = [0xe4, 0x45, 0xa5, 0x2e, 0x51, 0xcb, 0x9a, 0x1d];
        let data = if data.starts_with(&EVENT_CPI_TAG) {
            &data[8..]
        } else {
            data
        };
        if data.len() < 8 {
            return Ok(None);
        }
        for e in idl["events"].as_array().context("IDL events missing")? {
            let name = e["name"].as_str().context("event name missing")?;
            if !EVENTS.contains(&name) {
                continue;
            }
            let discriminator: Vec<u8> = serde_json::from_value(e["discriminator"].clone())?;
            if !data.starts_with(&discriminator) {
                continue;
            }
            let definition = idl["types"]
                .as_array()
                .context("IDL types missing")?
                .iter()
                .find(|t| t["name"] == name)
                .context("event type missing")?;
            let mut reader = Reader {
                bytes: &data[8..],
                offset: 0,
            };
            let fields = self.read_struct(idl, &definition["type"], &mut reader)?;
            ensure!(
                reader.offset == reader.bytes.len(),
                "unexpected trailing bytes for {name}"
            );
            return Ok(Some((name.into(), fields)));
        }
        Ok(None)
    }
    fn read_struct(
        &self,
        idl: &Value,
        definition: &Value,
        reader: &mut Reader<'_>,
    ) -> Result<Value> {
        ensure!(definition["kind"] == "struct", "unsupported IDL definition");
        let mut object = Map::new();
        for f in definition["fields"]
            .as_array()
            .context("IDL struct missing fields")?
        {
            object.insert(
                f["name"].as_str().context("field name missing")?.into(),
                self.read_type(idl, &f["type"], reader)?,
            );
        }
        Ok(Value::Object(object))
    }
    fn read_type(&self, idl: &Value, t: &Value, reader: &mut Reader<'_>) -> Result<Value> {
        if let Some(t) = t.as_str() {
            return Ok(match t {
                "pubkey" => bs58::encode(reader.take(32)?).into_string().into(),
                "bool" => {
                    let x = reader.take(1)?[0];
                    ensure!(x <= 1, "invalid Borsh bool");
                    (x == 1).into()
                }
                "u8" => reader.take(1)?[0].to_string().into(),
                "u16" => u16::from_le_bytes(reader.take(2)?.try_into()?)
                    .to_string()
                    .into(),
                "u32" => u32::from_le_bytes(reader.take(4)?.try_into()?)
                    .to_string()
                    .into(),
                "u64" => u64::from_le_bytes(reader.take(8)?.try_into()?)
                    .to_string()
                    .into(),
                "i64" => i64::from_le_bytes(reader.take(8)?.try_into()?)
                    .to_string()
                    .into(),
                "u128" => u128::from_le_bytes(reader.take(16)?.try_into()?)
                    .to_string()
                    .into(),
                "i128" => i128::from_le_bytes(reader.take(16)?.try_into()?)
                    .to_string()
                    .into(),
                "string" => {
                    let len = reader.length()?;
                    String::from_utf8(reader.take(len)?.to_vec())?.into()
                }
                other => bail!("unsupported IDL primitive {other}"),
            });
        }
        if let Some(inner) = t.get("vec") {
            let len = reader.length()?;
            ensure!(len <= reader.bytes.len(), "invalid Borsh vector length");
            return (0..len)
                .map(|_| self.read_type(idl, inner, reader))
                .collect::<Result<Vec<_>>>()
                .map(Value::Array);
        }
        if let Some(name) = t.pointer("/defined/name").and_then(Value::as_str) {
            let def = idl["types"]
                .as_array()
                .context("types missing")?
                .iter()
                .find(|x| x["name"] == name)
                .context("defined type missing")?;
            return self.read_struct(idl, &def["type"], reader);
        }
        bail!("unsupported IDL field type {t}")
    }
}
struct Reader<'a> {
    bytes: &'a [u8],
    offset: usize,
}
impl<'a> Reader<'a> {
    fn take(&mut self, n: usize) -> Result<&'a [u8]> {
        let end = self
            .offset
            .checked_add(n)
            .context("Borsh offset overflow")?;
        ensure!(end <= self.bytes.len(), "truncated Anchor event");
        let b = &self.bytes[self.offset..end];
        self.offset = end;
        Ok(b)
    }
    fn length(&mut self) -> Result<usize> {
        Ok(u32::from_le_bytes(self.take(4)?.try_into()?) as usize)
    }
}

fn string(value: &Value, key: &str) -> Result<String> {
    value[key]
        .as_str()
        .map(str::to_owned)
        .with_context(|| format!("missing decoded field {key}"))
}
fn decimal(value: &Value, key: &str) -> Result<Decimal> {
    Ok(Decimal::from_str(&string(value, key)?)?)
}
fn formatted(value: Decimal) -> String {
    value
        .round_dp_with_strategy(18, RoundingStrategy::ToZero)
        .normalize()
        .to_string()
}
pub fn normalize(
    name: String,
    fields: Value,
    context: Value,
    ordinal: Ordinal,
    commitment: String,
    revision: u64,
    signature: String,
) -> Result<Event> {
    let mint = match name.as_str() {
        "BuyEvent" | "SellEvent" => string(&context, "mint")?,
        "CreatePoolEvent" => string(&fields, "base_mint")?,
        _ => string(&fields, "mint")?,
    };
    let quote_mint = context
        .get("quote_mint")
        .and_then(Value::as_str)
        .map(str::to_owned)
        .or_else(|| fields["quote_mint"].as_str().map(str::to_owned))
        .context("quote mint must come from event/account metadata")?;
    let is_trade = matches!(name.as_str(), "TradeEvent" | "BuyEvent" | "SellEvent");
    let (base, quote, side, fee, creator) = match name.as_str() {
        "TradeEvent" => (
            string(&fields, "token_amount")?,
            string(&fields, "quote_amount")?,
            if fields["is_buy"] == true {
                "buy"
            } else {
                "sell"
            },
            string(&fields, "fee")?,
            string(&fields, "creator_fee")?,
        ),
        "BuyEvent" => (
            string(&fields, "base_amount_out")?,
            string(&fields, "quote_amount_in")?,
            "buy",
            string(&fields, "protocol_fee")?,
            string(&fields, "coin_creator_fee")?,
        ),
        "SellEvent" => (
            string(&fields, "base_amount_in")?,
            string(&fields, "quote_amount_out")?,
            "sell",
            string(&fields, "protocol_fee")?,
            string(&fields, "coin_creator_fee")?,
        ),
        _ => ("0".into(), "0".into(), "buy", "0".into(), "0".into()),
    };
    let mut metadata = context
        .as_object()
        .cloned()
        .context("asset context must be an object")?;
    metadata.insert("decoded".into(), fields.clone());
    for key in [
        "name",
        "symbol",
        "uri",
        "creator",
        "is_mayhem_mode",
        "is_holder_reward",
    ] {
        if let Some(v) = fields.get(key) {
            metadata.insert(key.into(), v.clone());
        }
    }
    let (price, mcap) = if is_trade {
        let base_decimals = context["base_decimals"]
            .as_u64()
            .context("base_decimals must be configured")?;
        let quote_decimals = context["quote_decimals"]
            .as_u64()
            .context("quote_decimals must be configured")?;
        ensure!(
            base_decimals <= 18 && quote_decimals <= 18,
            "unsupported decimal count"
        );
        let base_value = Decimal::from_str(&base)?;
        ensure!(base_value > Decimal::ZERO, "zero trade amount");
        let mark = decimal(&context, "quote_usd")?;
        let supply = decimal(&context, "supply_atomic")?;
        ensure!(
            mark > Decimal::ZERO && supply > Decimal::ZERO,
            "quote mark and atomic supply must be positive"
        );
        let base_scale = Decimal::from(10_u64.pow(base_decimals as u32));
        let quote_scale = Decimal::from(10_u64.pow(quote_decimals as u32));
        let base_units = base_value
            .checked_div(base_scale)
            .context("base amount arithmetic overflow")?;
        let quote_units = Decimal::from_str(&quote)?
            .checked_div(quote_scale)
            .context("quote amount arithmetic overflow")?;
        let price = quote_units
            .checked_div(base_units)
            .and_then(|ratio| ratio.checked_mul(mark))
            .context("USD price arithmetic overflow")?;
        let supply_units = supply
            .checked_div(base_scale)
            .context("supply arithmetic overflow")?;
        let mcap = price
            .checked_mul(supply_units)
            .context("market cap arithmetic overflow")?;
        (formatted(price), formatted(mcap))
    } else {
        ("0".into(), "0".into())
    };
    Ok(Event {
        chain: context["chain"].as_str().unwrap_or(SOLANA).into(),
        mint,
        event_name: name,
        kind: "LIVE".into(),
        commitment: commitment.clone(),
        ordinal,
        version: version(&commitment, revision)?,
        deleted: false,
        wallet: fields["user"]
            .as_str()
            .or_else(|| fields["creator"].as_str())
            .unwrap_or("")
            .into(),
        side: side.into(),
        base_amount: base,
        quote_amount: quote,
        quote_mint,
        price_usd: price,
        market_cap_usd: mcap,
        fee_protocol: fee,
        fee_creator: creator,
        signature,
        metadata: json!(metadata),
    })
}
