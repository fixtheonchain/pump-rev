# Terminal (formerly Padre)

`term9YPb9mzAsABaqN71A4xdbxHmpBNZavpBiQKZzN3` ("Terminal (formerly Padre) Program" on Solscan)

The on-chain program of pump.fun's trading terminal.

| Field | Value | Source |
| --- | --- | --- |
| ProgramData | `Dw3aPJma3ZaaRgTorVE2scvJtArdQuM2WjTPZXRYwPt6`, 1,485,057 bytes, 7.54 SOL rent | [chain] |
| Upgrade authority | `5oJNGGDxGGTt2eXuwaqtuM1AXqvWg7dCs626QnYC8xDn` (off-curve, system-owned, 2.32 SOL: the multisig-vault pattern; not confirmed which multisig) | [chain] |
| Last deploy | slot 458,774,985, **2026-10-19 08:57:48 UTC** | [chain] |
| IDL | none published, none on chain | [chain] |

`pump-rust-client` 0.4.1 loads it into its local validator as `terminal_proxy` next to Pump, PumpSwap, Pump Fees,
Mayhem and agent payments [sdk]. It touches the money flow in one place found here: Squads Competition rankings count
Terminal trades along with app and web trades [press: PetrAnto, 2026-10-25]. Its fee logic is not readable without an
IDL.

## Re-verified 2026-10-28

Read again at slot 462,377,442 (2026-10-28 06:37 UTC) by `scripts/read-live.mjs` [chain]. Upgrade authority `5oJNGGDx…` and last deploy (slot 458,774,985) are
unchanged [chain].

### Instructions, from the program binary and live transactions

The `terminal_proxy` build in `pump-rust-client` 0.5.0 (source path `programs/terminal-proxy/src/lib.rs`) names
[sdk-bin]: `initialize`, `validate_nonce`; curve buys `buy_exact_in_pump_fun`, `buy_exact_in_pump_fun_v3`,
`buy_exact_in_pump_fun_v3_wsol`, `v2_buy_exact_in_pump_fun`, `v2_buy_exact_in_pump_fun_wsol`; curve sells
`sell_exact_in_pump_fun(_v2|_v3|_wsol)`, `sell_exact_out_pump_fun(_v2|_v3|_wsol)`, `v2_sell_exact_in_pump_fun(_wsol)`,
`v2_sell_exact_out_pump_fun(_wsol)`; PumpSwap `sell_exact_out_pump_swap(_v2|_v3)`; Raydium `sell_all_via_raydium_v4`,
`sell_all_via_raydium_clmm`, `swap_v2_raydium_clmm`.

The deployed program is newer (the ProgramData hash differs). The three newest Terminal transactions on 2026-10-28
each run `validate_nonce` followed by an instruction with discriminator `e517cb977ae3ad2a` = **`route`**. `route`
reached PumpSwap and Raydium CLMM in one, Raydium CPMM in another, and Meteora DLMM plus Pump in the third. Each had a
single signer, the trader [tx `Uqi2P4fa…`, `5TcY57x3…`, `2rKxp9xp…`; `../data/extra-snapshot.json`]. `validate_nonce`
first suggests a replay guard on server-built transactions [inferred].

### The app around it

Terminal runs at `trade.padre.gg`, which requires sign-in (`/sign-in`, Cloudflare Turnstile). Its own backend hosts are
`backend.padre.gg` (`/app-info/get-runtime-config`, `/time/get-server-time`, `/csp-report/report`),
`txn-service.padre.gg`, `candles.padre.gg`, `content.padre.gg`, `twitter-public.padre.gg`, `thumbnails.padre.gg`,
`media-cache.padre.gg`, `cards.padre.gg` and `dd.padre.gg`. Its bundle also references
`https://frontend-api-v3.pump.fun`, `https://app.pump.fun` and `wss://mainnet.helius-rpc.com` [capture]. See
[../backend/mobile-and-terminal.md](../backend/mobile-and-terminal.md).
