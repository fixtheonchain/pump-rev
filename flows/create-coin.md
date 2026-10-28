# Flow: create a coin

Three ways in. The web app's two paths come from its bundle; the agents API comes from pump.fun's published skills.
Program steps are from the IDL and docs, and the indexer side from captured API shapes. Tags are defined in
[../sources.md](../sources.md).

```mermaid
sequenceDiagram
    autonumber
    actor U as Creator (browser + wallet)
    participant W as pump.fun web (Next.js on Vercel)
    participant API as frontend-api-v3
    participant PIN as Pinata / IPFS
    participant BS as blockchain-swap
    participant RPC as solana-mainnet.pump.fun
    participant TX as Nozomi / Jito
    participant P as Pump program
    participant IDX as Indexers (advanced-indexer, swap-api, profile-api)
    participant N as NATS / boards

    U->>W: fill name, ticker, image, socials, quote, first buy
    W->>BS: GET /supported/coin-create-mints (226 quote assets)
    W->>API: GET /ipfs/pinata-presigned
    API-->>W: presignedUri
    W->>PIN: upload image (presigned) → CID
    W->>API: GET /ipfs/pinata-presigned
    W->>PIN: upload metadata JSON → CID (uri = https://ipfs.io/ipfs/CID)
    alt no first buy ("free" creation, signed in)
        W->>API: POST /coins/create-v2 {name, ticker, metadataUri, image, …} + session cookie
        API->>P: server builds, signs and sends create_v2
        API-->>W: {mint}
    else with a first buy (SOL or USDC pair)
        W->>API: GET /vanity/random-mint-public-key
        API-->>W: mint pubkey ending in "pump" (server keeps the key)
        W->>RPC: getAddressLookupTable(Hyif6eWb…), simulate draft (1.4M CU), getPriorityFeeEstimate
        W->>W: createV2AndBuyV2Instructions → v0 tx (compute budget, tip, create_v2, buy_v2)
        W->>API: POST /coins/sign-create-tx {serializedTx, mint}
        API-->>W: tx with the mint's signature
        U->>W: wallet signs
        W->>TX: send (Nozomi regions, or /api/jito with front-running protection)
        TX->>P: create_v2 + buy_v2 land in one transaction
    end
    P->>P: Token-2022 mint (metadata ext.), BondingCurve, 1B to curve ATA, CreateEvent
    P-->>IDX: transaction logs and events
    IDX-->>N: new coin on the boards and feeds
    W->>RPC: accountSubscribe(curve, mint) for the coin page
```

## Steps and where each fact comes from

| # | Step | Detail | Source |
| --- | --- | --- | --- |
| 1 | Quote options | `GET blockchain-swap.pump.fun/supported/coin-create-mints`: SOL, USDC, stocks and other quote assets with prices and minimum buys | [capture] |
| 2–6 | Media and metadata | Presigned Pinata uploads from the browser; `metadataUri = https://ipfs.io/ipfs/<cid>`; gateway `pump.mypinata.cloud` | [bundle] [contract] |
| 7–9 | Free creation | `POST /coins/create-v2` ("Create a coin without captcha"); the app records `isFree: true, tokensBought: 0`. No wallet signature is requested on this path, so the server signs and pays | [contract] [bundle]; signer and payer [inferred] |
| 10–11 | Vanity mint | `GET /vanity/random-mint-public-key`, from a pool the server checks with `GET /coins/check-vanity-store/{mint}` | [contract] [bundle] |
| 12–13 | Client build | `PUMP_SDK.createV2AndBuyV2Instructions({global, mint, name, symbol, uri, creator, user, amount, quoteAmount, mayhemMode, quoteMint})`, lookup table `Hyif6eWb…`, CU = simulated × factor ≤ 1.4M, priority fee from `getPriorityFeeEstimate` | [bundle] |
| 14–15 | Mint signature | `POST /coins/sign-create-tx` returns the transaction with the vanity key's signature. Without a vanity key, the browser signs with a fresh mint keypair | [contract] [bundle] |
| 16–18 | Sign and send | Wallet signs; sent to 7 Nozomi regions with a tip to a `pfn…` address, or to `/api/jito` with a Jito tip and `jitodontfront…` | [bundle] |
| 19 | On chain | `create_v2`: Token-2022 mint with MetadataPointer + TokenMetadata (no authorities), `BondingCurve` from `Global` (30 SOL / 1.073 B virtual, 793.1 M for sale), 1 B minted to the curve's ATA, Mayhem accounts passed, `CreateEvent`. `buy_v2` in the same transaction | [idl] [chain] [docs `COIN_CREATION.md`] |
| 20–21 | Indexing | The coin appears in `coins-v3`, `boards/trending`, `home-feed`, `in-memory-coin` (with `sniperCount`, `numKolsTraded`, …) | [capture] |
| 22 | Live page | `accountSubscribe` at `processed` on the curve and mint over pump.fun's RPC WebSocket | [capture] |

**Other creation paths.** Custom pairs (stocks, pump coins as quote, a custom creator fee, holder rewards) use a
separate builder that first swaps into the quote asset ("prep swap") [bundle]. Coins with creator-reward recipients
add a fee-sharing transaction (`create_fee_sharing_config` + `update_fee_shares_v2`), sent with front-running
protection [bundle] [idl]. The App router has `create_coin_and_buy_bonding_curve_v2` [sdk-bin]. Outside the web app,
`POST fun-block.pump.fun/agents/create-coin` returns a create + first-buy transaction already signed by a mint key
the server generated [docs pump-fun-skills].
