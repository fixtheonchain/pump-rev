use crate::model::{CanonicalState, Event};
use anyhow::{Context, Result, ensure};
use async_nats::{
    HeaderMap,
    jetstream::{self, stream::Config},
};
use reqwest::Client;
use serde_json::Value;
use std::env;

fn required(name: &str) -> Result<String> {
    env::var(name)
        .ok()
        .filter(|s| !s.is_empty())
        .with_context(|| format!("{name} must be configured"))
}
pub struct Sink {
    http: Client,
    url: String,
    database: String,
    user: String,
    password: String,
    jetstream: jetstream::Context,
}
impl Sink {
    pub async fn connect() -> Result<Self> {
        let mut options = async_nats::ConnectOptions::new()
            .name("pumpskel:ingest")
            .custom_inbox_prefix("_INBOX.ingest");
        match required("NATS_AUTH_MODE")?.as_str() {
            "off" => {}
            "on" => {
                let manifest_path = required("NATS_CREDENTIALS_FILE")?;
                let contents = tokio::fs::read_to_string(manifest_path)
                    .await
                    .map_err(|_| anyhow::anyhow!("NATS credential manifest unavailable"))?;
                let manifest: Value = serde_json::from_str(&contents)
                    .map_err(|_| anyhow::anyhow!("NATS credential manifest invalid"))?;
                let user = manifest["clients"]["ingest"]["user"]
                    .as_str()
                    .context("NATS ingest identity missing")?;
                let password = manifest["clients"]["ingest"]["password"]
                    .as_str()
                    .filter(|value| !value.is_empty())
                    .context("NATS ingest credential missing")?;
                options = options.user_and_password(user.to_owned(), password.to_owned());
            }
            _ => anyhow::bail!("NATS_AUTH_MODE must be off or on"),
        }
        let nats = options
            .connect(required("NATS_URL")?)
            .await
            .map_err(|_| anyhow::anyhow!("NATS connection failed"))?;
        ensure!(
            required("NATS_AUTH_MODE")? != "on" || nats.server_info().auth_required,
            "NATS_AUTH_MODE=on requires authentication to be enabled on the broker"
        );
        let jetstream = jetstream::new(nats);
        jetstream
            .get_or_create_stream(Config {
                name: "TRADING_EVENTS".into(),
                subjects: vec!["trading.events.>".into()],
                ..Default::default()
            })
            .await
            .map_err(|_| anyhow::anyhow!("JetStream stream initialization failed"))?;
        Ok(Self {
            http: Client::new(),
            url: required("CLICKHOUSE_URL")?,
            database: required("CLICKHOUSE_DATABASE")?,
            user: required("CLICKHOUSE_USER")?,
            password: required("CLICKHOUSE_PASSWORD")?,
            jetstream,
        })
    }
    async fn query(&self, sql: &str, body: Option<String>) -> Result<String> {
        let body = body.unwrap_or_default();
        let request = self
            .http
            .post(&self.url)
            .basic_auth(&self.user, Some(&self.password))
            .query(&[("database", self.database.as_str()), ("query", sql)])
            .header(reqwest::header::CONTENT_LENGTH, body.len())
            .body(body);
        let response = request
            .send()
            .await
            .map_err(|_| anyhow::anyhow!("ClickHouse request failed"))?;
        let status = response.status();
        let text = response
            .text()
            .await
            .map_err(|_| anyhow::anyhow!("ClickHouse response read failed"))?;
        // Do not include URLs, request credentials or row contents in the error.
        ensure!(
            status.is_success(),
            "ClickHouse returned HTTP {}",
            status.as_u16()
        );
        Ok(text)
    }
    pub async fn restore(&self) -> Result<CanonicalState> {
        let text = self
            .query("SELECT * FROM event_log FINAL FORMAT JSONEachRow", None)
            .await?;
        let mut state = CanonicalState::default();
        for line in text.lines().filter(|line| !line.is_empty()) {
            let event = Event::from_row(serde_json::from_str(line)?)?;
            if event.metadata.get("_superseded") == Some(&Value::Bool(true)) {
                continue;
            }
            if state
                .events
                .get(&event.key())
                .is_none_or(|old| old.version <= event.version)
            {
                state.events.insert(event.key(), event);
            }
        }
        Ok(state)
    }
    pub async fn write(&self, event: &Event) -> Result<()> {
        let row = event.row().to_string() + "\n";
        self.query(
            "INSERT INTO event_log FORMAT JSONEachRow",
            Some(row.clone()),
        )
        .await?;
        // The descriptor is persisted with the new row before projections, so
        // replay can repair an interrupted cross-mint or event-type correction.
        if let Some(previous) = event.metadata.get("_replaces") {
            let mut tombstone = event.clone();
            tombstone.mint = previous["mint"]
                .as_str()
                .context("invalid replacement mint")?
                .into();
            tombstone.event_name = previous["event_name"]
                .as_str()
                .context("invalid replacement event")?
                .into();
            tombstone.deleted = true;
            tombstone
                .metadata
                .as_object_mut()
                .context("metadata must be object")?
                .remove("_replaces");
            tombstone
                .metadata
                .as_object_mut()
                .unwrap()
                .insert("_superseded".into(), true.into());
            let old_row = tombstone.row().to_string() + "\n";
            if tombstone.mint != event.mint {
                self.query(
                    "INSERT INTO event_log FORMAT JSONEachRow",
                    Some(old_row.clone()),
                )
                .await?;
                self.publish(&tombstone).await?;
            }
            if tombstone.is_trade() {
                for table in ["trades", "fee_events", "position_deltas"] {
                    self.query(
                        &format!("INSERT INTO {table} FORMAT JSONEachRow"),
                        Some(old_row.clone()),
                    )
                    .await?;
                }
            }
        }
        if event.is_trade() {
            for table in ["trades", "fee_events", "position_deltas"] {
                self.query(
                    &format!("INSERT INTO {table} FORMAT JSONEachRow"),
                    Some(row.clone()),
                )
                .await?;
            }
        }
        self.publish(event).await
    }
    async fn publish(&self, event: &Event) -> Result<()> {
        let mut headers = HeaderMap::new();
        headers.insert(
            "Nats-Msg-Id",
            format!(
                "{}:{}:{}:{}",
                event.chain,
                event.mint,
                event.ordinal.key(),
                event.version
            )
            .as_str(),
        );
        self.jetstream
            .publish_with_headers(
                format!("trading.events.{}", event.mint),
                headers,
                serde_json::to_vec(event)?.into(),
            )
            .await
            .map_err(|_| anyhow::anyhow!("JetStream publish failed"))?
            .await
            .map_err(|_| anyhow::anyhow!("JetStream publish acknowledgement failed"))?;
        Ok(())
    }
    pub async fn health(&self) -> Result<Value> {
        self.query("SELECT 1", None).await?;
        self.jetstream
            .get_stream("TRADING_EVENTS")
            .await
            .map_err(|_| anyhow::anyhow!("JetStream health check failed"))?;
        Ok(
            serde_json::json!({"status":"ok","service":"ingest","stores":["clickhouse","jetstream"]}),
        )
    }
}
