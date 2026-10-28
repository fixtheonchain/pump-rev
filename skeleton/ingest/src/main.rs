mod decoder;
mod geyser;
mod model;
mod sink;
mod source;

use anyhow::{Context, Result, bail};
use base64::{Engine, engine::general_purpose::STANDARD};
use decoder::{Decoder, normalize};
use model::version;
use source::{EventSource, Input, ReplaySource};
use std::{env, time::Duration};

#[tokio::main]
async fn main() -> Result<()> {
    dotenvy::dotenv().ok();
    let arguments: Vec<String> = env::args().skip(1).collect();
    let command = arguments.first().map(String::as_str).unwrap_or("run");
    let sink = sink::Sink::connect().await?;
    if command == "health" {
        println!("{}", sink.health().await?);
        return Ok(());
    }
    let decoder = Decoder::new()?;
    let mut source: Box<dyn EventSource> = match command {
        "replay" => Box::new(
            ReplaySource::open(
                arguments
                    .get(1)
                    .context("replay needs a local JSONL path")?,
            )
            .await?,
        ),
        "run" => match env::var("INGEST_SOURCE").as_deref().unwrap_or("replay") {
            "replay" => Box::new(
                ReplaySource::open(
                    &env::var("INGEST_REPLAY_FILE")
                        .context("INGEST_REPLAY_FILE must be configured")?,
                )
                .await?,
            ),
            "geyser" => Box::new(geyser::GeyserSource::connect(decoder.programs()).await?),
            _ => bail!("INGEST_SOURCE must be replay or geyser"),
        },
        _ => bail!("usage: pump-ingest [run|health|replay FILE [--delay-ms N]]"),
    };
    let delay_ms = if let Some(i) = arguments.iter().position(|x| x == "--delay-ms") {
        arguments
            .get(i + 1)
            .context("--delay-ms needs an integer")?
            .parse()?
    } else {
        0_u64
    };
    let mut state = sink.restore().await?;
    println!(
        "{}",
        serde_json::json!({"service":"ingest","event":"ready","restored_ordinals":state.events.len()})
    );
    let mut writes = 0_u64;
    while let Some(input) = source.next().await? {
        let candidates = match input {
            Input::Event {
                program,
                data,
                ordinal,
                commitment,
                revision,
                signature,
                context,
            } => {
                let bytes = STANDARD.decode(data).context("invalid event base64")?;
                let Some((name, fields)) = decoder.decode(&program, &bytes)? else {
                    continue;
                };
                vec![normalize(
                    name, fields, context, ordinal, commitment, revision, signature,
                )?]
            }
            Input::Drop { ordinal, revision } => {
                let key = format!("{}:{}", model::SOLANA, ordinal.key());
                let Some(previous) = state.events.get(&key) else {
                    bail!("drop references unknown ordinal {}", ordinal.key())
                };
                let mut event = previous.clone();
                event.ordinal = ordinal;
                event.deleted = true;
                event.commitment = "confirmed".into();
                event.version = version("confirmed", revision)?;
                event.kind = "CORRECTION".into();
                vec![event]
            }
            Input::ConfirmedBlock { block_id, seen } => state.dropped_in_block(block_id, &seen),
        };
        for candidate in candidates {
            if let Some(event) = state.apply(candidate)? {
                // Every table uses the same versioned ordinal. Replaying repairs a partially
                // completed fan-out; JetStream de-duplicates its acknowledged message id.
                sink.write(&event).await?;
                writes += 1;
                println!(
                    "{}",
                    serde_json::json!({"service":"ingest","event":"persisted","ordinal":event.ordinal.key(),"kind":event.kind,"commitment":event.commitment,"deleted":event.deleted})
                );
            }
        }
        if delay_ms > 0 {
            tokio::time::sleep(Duration::from_millis(delay_ms)).await
        }
    }
    println!(
        "{}",
        serde_json::json!({"service":"ingest","event":"complete","writes":writes})
    );
    Ok(())
}
