use crate::model::Ordinal;
use anyhow::{Context, Result};
use async_trait::async_trait;
use serde::Deserialize;
use serde_json::Value;
use tokio::{
    fs::File,
    io::{AsyncBufReadExt, BufReader, Lines},
};

#[derive(Debug, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum Input {
    Event {
        program: String,
        data: String,
        ordinal: Ordinal,
        commitment: String,
        revision: u64,
        signature: String,
        context: Value,
    },
    Drop {
        ordinal: Ordinal,
        revision: u64,
    },
    ConfirmedBlock {
        block_id: u64,
        seen: Vec<String>,
    },
}
#[async_trait]
pub trait EventSource: Send {
    async fn next(&mut self) -> Result<Option<Input>>;
}
pub struct ReplaySource {
    lines: Lines<BufReader<File>>,
    line: u64,
}
impl ReplaySource {
    pub async fn open(path: &str) -> Result<Self> {
        Ok(Self {
            lines: BufReader::new(File::open(path).await?).lines(),
            line: 0,
        })
    }
}
#[async_trait]
impl EventSource for ReplaySource {
    async fn next(&mut self) -> Result<Option<Input>> {
        loop {
            let Some(line) = self.lines.next_line().await? else {
                return Ok(None);
            };
            self.line += 1;
            if line.trim().is_empty() {
                continue;
            }
            return serde_json::from_str(&line)
                .with_context(|| format!("invalid replay record at line {}", self.line))
                .map(Some);
        }
    }
}
