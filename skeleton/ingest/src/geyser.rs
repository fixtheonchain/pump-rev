//! Minimal interoperable Yellowstone Geyser Subscribe transport. Prost handles
//! unknown fields, so no Solana SDK or system protoc installation is required.
//! Wire field numbers follow the official rpcpool/yellowstone-grpc geyser.proto
//! and solana-storage.proto. Only the block/transaction subset used here is read.
use crate::{
    decoder::Decoder,
    model::{Ordinal, SOLANA},
    source::{EventSource, Input},
};
use anyhow::{Context, Result, ensure};
use async_trait::async_trait;
use base64::{Engine, engine::general_purpose::STANDARD};
use bytes::Bytes;
use futures_util::StreamExt;
use prost::Message;
use serde_json::{Value, json};
use std::{
    collections::{HashMap, VecDeque},
    env,
};
use tokio::sync::mpsc;
use tokio_stream::wrappers::ReceiverStream;

pub struct GeyserSource {
    receiver: mpsc::Receiver<Result<Input>>,
}
impl GeyserSource {
    pub async fn connect(programs: Vec<String>) -> Result<Self> {
        let endpoint = env::var("GEYSER_ENDPOINT")
            .ok()
            .filter(|s| !s.is_empty())
            .context("GEYSER_ENDPOINT must be configured for INGEST_SOURCE=geyser")?;
        let token = env::var("GEYSER_TOKEN")
            .ok()
            .filter(|s| !s.is_empty())
            .context("GEYSER_TOKEN must be configured for INGEST_SOURCE=geyser")?;
        let metadata_path = env::var("GEYSER_ASSET_METADATA")
            .context("GEYSER_ASSET_METADATA must name a local account/mark snapshot JSON file")?;
        let metadata: Value =
            serde_json::from_str(&tokio::fs::read_to_string(metadata_path).await?)?;
        let queue_capacity: usize = env::var("GEYSER_QUEUE_CAPACITY")
            .context("GEYSER_QUEUE_CAPACITY must be configured")?
            .parse()?;
        ensure!(queue_capacity > 0, "GEYSER_QUEUE_CAPACITY must be positive");
        ensure!(
            queue_capacity <= tokio::sync::Semaphore::MAX_PERMITS,
            "GEYSER_QUEUE_CAPACITY exceeds the runtime capacity"
        );
        let (tx, receiver) = mpsc::channel(queue_capacity);
        // Separate commitment cursors are necessary; processed data never stands
        // in for confirmed truth. Endpoint remains completely unused in replay.
        for commitment in [0, 1] {
            let (endpoint, token, programs, metadata, tx) = (
                endpoint.clone(),
                token.clone(),
                programs.clone(),
                metadata.clone(),
                tx.clone(),
            );
            tokio::spawn(async move {
                if let Err(error) = subscribe(
                    &endpoint,
                    &token,
                    programs,
                    metadata,
                    commitment,
                    tx.clone(),
                )
                .await
                {
                    let _ = tx.send(Err(error)).await;
                }
            });
        }
        drop(tx);
        Ok(Self { receiver })
    }
}
#[async_trait]
impl EventSource for GeyserSource {
    async fn next(&mut self) -> Result<Option<Input>> {
        self.receiver.recv().await.transpose()
    }
}

fn grpc_frame(message: &impl Message) -> Vec<u8> {
    let bytes = message.encode_to_vec();
    let mut frame = vec![0];
    frame.extend((bytes.len() as u32).to_be_bytes());
    frame.extend(bytes);
    frame
}
async fn subscribe(
    endpoint: &str,
    token: &str,
    programs: Vec<String>,
    metadata: Value,
    commitment: i32,
    output: mpsc::Sender<Result<Input>>,
) -> Result<()> {
    let max_frame_bytes: usize = env::var("GEYSER_MAX_FRAME_BYTES")
        .context("GEYSER_MAX_FRAME_BYTES must be configured")?
        .parse()?;
    ensure!(
        max_frame_bytes > 0 && max_frame_bytes <= u32::MAX as usize,
        "GEYSER_MAX_FRAME_BYTES must fit a positive protobuf frame length"
    );
    let (send, receive) = mpsc::channel::<std::result::Result<Bytes, std::io::Error>>(1);
    let mut blocks = HashMap::new();
    blocks.insert(
        "pump_programs".into(),
        BlockFilter {
            account_include: programs.clone(),
            include_transactions: Some(true),
            include_accounts: Some(false),
            include_entries: Some(false),
        },
    );
    let request = SubscribeRequest {
        blocks,
        commitment: Some(commitment),
        ping: None,
    };
    send.send(Ok(grpc_frame(&request).into())).await?;
    let mut builder = reqwest::Client::builder().http2_adaptive_window(true);
    if endpoint.starts_with("http://") {
        builder = builder.http2_prior_knowledge()
    }
    let response = builder
        .build()
        .map_err(|_| anyhow::anyhow!("Geyser HTTP/2 client configuration failed"))?
        .post(format!(
            "{}/geyser.Geyser/Subscribe",
            endpoint.trim_end_matches('/')
        ))
        .header("content-type", "application/grpc")
        .header("te", "trailers")
        .header("x-token", token)
        .body(reqwest::Body::wrap_stream(ReceiverStream::new(receive)))
        .send()
        .await
        .map_err(|_| anyhow::anyhow!("Geyser Subscribe transport failed"))?;
    ensure!(
        response.status().is_success(),
        "Geyser Subscribe returned HTTP {}",
        response.status().as_u16()
    );
    if let Some(status) = response.headers().get("grpc-status") {
        ensure!(status == "0", "Geyser Subscribe rejected the stream")
    }
    let mut stream = response.bytes_stream();
    let mut buffer = VecDeque::new();
    let decoder = Decoder::new()?;
    while let Some(chunk) = stream.next().await {
        buffer.extend(chunk.map_err(|_| anyhow::anyhow!("Geyser stream read failed"))?);
        while buffer.len() >= 5 {
            let header: Vec<_> = buffer.iter().take(5).copied().collect();
            ensure!(header[0] == 0, "compressed Geyser frames are not enabled");
            let length = u32::from_be_bytes(header[1..5].try_into()?) as usize;
            ensure!(
                length <= max_frame_bytes,
                "Geyser frame exceeds GEYSER_MAX_FRAME_BYTES"
            );
            if buffer.len() < length + 5 {
                break;
            }
            buffer.drain(..5);
            let message: Vec<_> = buffer.drain(..length).collect();
            let update = SubscribeUpdate::decode(message.as_slice())?;
            if update.ping.is_some() {
                send.send(Ok(grpc_frame(&SubscribeRequest {
                    ping: Some(Ping { id: 1 }),
                    ..Default::default()
                })
                .into()))
                    .await?;
            }
            if let Some(block) = update.block {
                process_block(block, commitment, &programs, &metadata, &decoder, &output).await?;
            }
        }
    }
    anyhow::bail!("Geyser stream ended; restart from the provider's replay cursor before resuming")
}
async fn process_block(
    block: Block,
    commitment: i32,
    programs: &[String],
    metadata: &Value,
    decoder: &Decoder,
    output: &mpsc::Sender<Result<Input>>,
) -> Result<()> {
    let time = block
        .block_time
        .context("Geyser block omitted block_time")?
        .timestamp
        .checked_mul(1000)
        .context("block time overflow")?;
    let commitment_name = if commitment == 0 {
        "processed"
    } else {
        "confirmed"
    };
    let mut seen = Vec::new();
    for transaction in block.transactions {
        let Some(meta) = transaction.meta else {
            continue;
        };
        if meta.err.is_some() {
            continue;
        }
        let mut accounts = transaction
            .transaction
            .and_then(|t| t.message)
            .map(|m| m.account_keys)
            .unwrap_or_default();
        accounts.extend(meta.loaded_writable_addresses);
        accounts.extend(meta.loaded_readonly_addresses);
        let signature = bs58::encode(&transaction.signature).into_string();
        for (index, instruction) in meta
            .inner_instructions
            .iter()
            .flat_map(|x| x.instructions.iter())
            .enumerate()
        {
            let Some(program) = accounts.get(instruction.program_id_index as usize) else {
                continue;
            };
            let program = bs58::encode(program).into_string();
            if !programs.contains(&program) {
                continue;
            }
            let Some((name, fields)) = decoder.decode(&program, &instruction.data)? else {
                continue;
            };
            let mint = if let Some(mint) = fields["mint"]
                .as_str()
                .or_else(|| fields["base_mint"].as_str())
            {
                mint.to_owned()
            } else {
                let pool = fields["pool"].as_str().context("AMM event missing pool")?;
                metadata["pools"][pool]
                    .as_str()
                    .with_context(|| {
                        format!("GEYSER_ASSET_METADATA has no base mint for pool {pool}")
                    })?
                    .into()
            };
            let mut context = metadata["assets"][&mint]
                .as_object()
                .cloned()
                .with_context(|| {
                    format!("GEYSER_ASSET_METADATA has no asset context for {mint}")
                })?;
            context.insert("mint".into(), mint.into());
            context.insert("chain".into(), SOLANA.into());
            let ordinal = Ordinal {
                block_id: block.slot,
                tx_index: transaction
                    .index
                    .try_into()
                    .context("transaction index exceeds uint32")?,
                event_index: index.try_into().context("event index exceeds uint32")?,
                block_time_ms: time,
            };
            seen.push(ordinal.key());
            let revision = block.bank_id.max(1);
            output
                .send(Ok(Input::Event {
                    program,
                    data: STANDARD.encode(&instruction.data),
                    ordinal,
                    commitment: commitment_name.into(),
                    revision,
                    signature: signature.clone(),
                    context: json!(context),
                }))
                .await?;
            let _ = name;
        }
    }
    if commitment == 1 {
        output
            .send(Ok(Input::ConfirmedBlock {
                block_id: block.slot,
                seen,
            }))
            .await?;
    }
    Ok(())
}

#[derive(Clone, PartialEq, Message)]
struct SubscribeRequest {
    #[prost(map = "string,message", tag = "4")]
    blocks: HashMap<String, BlockFilter>,
    #[prost(int32, optional, tag = "6")]
    commitment: Option<i32>,
    #[prost(message, optional, tag = "9")]
    ping: Option<Ping>,
}
#[derive(Clone, PartialEq, Message)]
struct BlockFilter {
    #[prost(string, repeated, tag = "1")]
    account_include: Vec<String>,
    #[prost(bool, optional, tag = "2")]
    include_transactions: Option<bool>,
    #[prost(bool, optional, tag = "3")]
    include_accounts: Option<bool>,
    #[prost(bool, optional, tag = "4")]
    include_entries: Option<bool>,
}
#[derive(Clone, PartialEq, Message)]
struct Ping {
    #[prost(int32, tag = "1")]
    id: i32,
}
#[derive(Clone, PartialEq, Message)]
struct Empty {}
#[derive(Clone, PartialEq, Message)]
struct SubscribeUpdate {
    #[prost(message, optional, tag = "5")]
    block: Option<Block>,
    #[prost(message, optional, tag = "6")]
    ping: Option<Empty>,
}
#[derive(Clone, PartialEq, Message)]
struct Block {
    #[prost(uint64, tag = "1")]
    slot: u64,
    #[prost(message, optional, tag = "4")]
    block_time: Option<BlockTime>,
    #[prost(message, repeated, tag = "6")]
    transactions: Vec<TransactionInfo>,
    #[prost(uint64, tag = "14")]
    bank_id: u64,
}
#[derive(Clone, PartialEq, Message)]
struct BlockTime {
    #[prost(int64, tag = "1")]
    timestamp: i64,
}
#[derive(Clone, PartialEq, Message)]
struct TransactionInfo {
    #[prost(bytes = "vec", tag = "1")]
    signature: Vec<u8>,
    #[prost(message, optional, tag = "3")]
    transaction: Option<Transaction>,
    #[prost(message, optional, tag = "4")]
    meta: Option<TransactionMeta>,
    #[prost(uint64, tag = "5")]
    index: u64,
}
#[derive(Clone, PartialEq, Message)]
struct Transaction {
    #[prost(message, optional, tag = "2")]
    message: Option<TransactionMessage>,
}
#[derive(Clone, PartialEq, Message)]
struct TransactionMessage {
    #[prost(bytes = "vec", repeated, tag = "2")]
    account_keys: Vec<Vec<u8>>,
}
#[derive(Clone, PartialEq, Message)]
struct TransactionMeta {
    #[prost(message, optional, tag = "1")]
    err: Option<Empty>,
    #[prost(message, repeated, tag = "5")]
    inner_instructions: Vec<InnerInstructions>,
    #[prost(bytes = "vec", repeated, tag = "12")]
    loaded_writable_addresses: Vec<Vec<u8>>,
    #[prost(bytes = "vec", repeated, tag = "13")]
    loaded_readonly_addresses: Vec<Vec<u8>>,
}
#[derive(Clone, PartialEq, Message)]
struct InnerInstructions {
    #[prost(message, repeated, tag = "2")]
    instructions: Vec<InnerInstruction>,
}
#[derive(Clone, PartialEq, Message)]
struct InnerInstruction {
    #[prost(uint32, tag = "1")]
    program_id_index: u32,
    #[prost(bytes = "vec", tag = "3")]
    data: Vec<u8>,
}
