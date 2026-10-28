# Sources

Every fact in this folder carries one of the tags below. "Observed" tags are things read or captured directly;
`[inferred]` marks a reading the sources do not state outright.

## Observed

| Tag | What it is | Where the raw material is |
| --- | --- | --- |
| `[chain]` | Mainnet accounts read through `https://api.mainnet-beta.solana.com` on **2026-10-28 06:37–06:48 UTC** (slot 462,377,442 onward): `scripts/read-live.mjs` (15 calls), `scripts/read-flows.mjs keys` (4), `scripts/read-extra.mjs` (16). Values carried over from 2026-10-26 (slot 461,522,470) are the previous research's reads, re-checked where the docs say "Re-verified" | `data/live-snapshot.json`, `data/flows-snapshot.json`, `data/extra-snapshot.json`; 2026-10-26 in `data/previous/` |
| `[tx]` | A decoded mainnet transaction, signature given (2026-10-26 ones decoded by the previous research; 2026-10-28 ones by `read-extra.mjs`) | `data/previous/flows-snapshot.json`, `data/extra-snapshot.json` |
| `[idl]` | Anchor IDLs: `idl/pump.json`, `pump_amm.json`, `pump_fees.json`, `pump_agent_payments.json` from `pump-rust-client` 0.5.0 (crates.io, 2026-10-19); `idl/previous-docs-repo-639b87f/` from github.com/pump-fun/pump-public-docs `639b87f`; `idl/onchain/` the Anchor IDL accounts read from chain (Pump, PumpSwap, Pump Fees, Donation Relay) | `idl/` |
| `[docs]` | Published by pump.fun: github.com/pump-fun/pump-public-docs (no commit after `639b87f` of 2026-10-13, checked through the GitHub API on 2026-10-28), github.com/pump-fun/pump-fun-skills (`create-coin`, `swap`, `coin-fees`, `tokenized-agents`), github.com/pump-fun/pump-segments-sdk, github.com/pump-fun/transfer-hook-authority, the pump-fun GitHub org's repo list | read as text; the skills' scripts were not run |
| `[sdk]` | `@pump-fun/pump-sdk` 4.3.1 (2026-10-22), `@pump-fun/pump-swap-sdk` 2.2.0 (2026-10-19), `@pump-fun/agent-payments-sdk` 3.0.3 (npm); `pump-rust-client` 0.5.0 (crates.io). Unpacked and read, not run | `scripts/idl-diff.mjs` compares their IDLs |
| `[sdk-bin]` | Printable strings from the program builds that `pump-rust-client` 0.5.0 ships for its local validator (`artifacts/mayhem_program.so`, `pump_stables_router.so`, `terminal_proxy.so`), read as bytes by `scripts/so-strings.mjs`. These builds are **not** byte-identical to the deployed programs (sha256 compared against ProgramData in `read-extra.mjs`), so names from them describe the interface, and deployed code may have more | — |
| `[capture]` | Network traffic of pump.fun's web app in a desktop browser on 2026-10-28, signed out, no wallet, terms dialog unanswered. An in-page hook logged method, URL, status, request body and a JSON type skeleton for the app's own `fetch` / XHR / WebSocket calls. One visit to `trade.padre.gg` listed only the hosts it loads | [`data/capture-log.md`](data/capture-log.md) |
| `[bundle]` | Text of the web app's JavaScript chunks, read from the browser cache inside the page (a direct download is blocked by Cloudflare) | quoted in `data/capture-log.md` and the backend docs |
| `[contract]` | The typed route contract inside chunk `2cr_aqnw2j4n5.js`: 330 `"METHOD /path"` keys with summaries and zod schemas (field names and `describe` texts read in a second pass), the 106-code error registry, API scopes and the deprecation rule. The chunk was fetched again from the browser cache on the later pass | [`data/frontend-api-v3-contract.md`](data/frontend-api-v3-contract.md) |
| `[site-docs]` | pump.fun's own pages under `pump.fun/docs/*` read as text on 2026-10-28: `fees` (updated 2026-10-17), `custom-pairs` (2026-10-09), `callout-reward-terms` (2026-08-13), `go-fun-terms` (2026-05-13), `mayhem-mode`, `tokenized-agent-disclaimer`, `wallet-login-changes`, `charitycoins`, `onramp`, `livestream-moderation-policy`, `create-coin`, `bonding-curve`; plus `robots.txt` and `sitemap.xml` | summarized in `features/` |
| `[page]` | Values rendered on a public pump.fun page (server-rendered), read on 2026-10-28: `/pump-token` | `features/rewards-and-referrals.md` |
| `[bundle flag registry]` | The rollout-flag registry in the web bundle (95 flags with created dates; owner handles not copied), and the chain registry (19 chains with Relay and DexScreener slugs and admission notes) | `features/README.md`, `features/perps-and-multichain.md` |
| `[config]` | Runtime config in the page HTML (RSC payload): service URLs and NATS cluster settings | `data/capture-log.md` |
| `[html]` | Inline scripts in the page HTML | — |
| `[headers]` | Response headers: same-origin and CORS-exposed headers read in the page; `curl` with one request per host for the rest | `backend/web-and-edge.md` |
| `[dns]` | `nslookup` and Node `dns.resolve*` on 2026-10-28 | `backend/web-and-edge.md` |

## Press and third-party pages

| Topic | URL |
| --- | --- |
| Mayhem mode (2 B supply, 24 h agent, burn) | https://www.kucoin.com/news/flash/pump-fun-launches-mayhem-mode-with-ai-agents-to-boost-meme-token-trading · https://en.cryptonomist.ch/2025/11/12/pump-fun-mayhem-ai-trading |
| Boost mode | theblock.co, 2026-07-29 (cited by the previous research) |
| 0.45% app fee | tokenpost.com/news/business/33804, 2026-10-17 (cited by the previous research) |
| Padre acquisition, Terminal | https://cointelegraph.com/news/pumpfun-acquires-padre-trading-terminal-solana-memecoins · https://cryptobriefing.com/pump-fun-acquires-padre-trading-terminal-multi-chain-expansion |
| Vyper merged into Terminal | https://sqmagazine.co.uk/pumpfun-buys-vyper-cross-chain-trading/ |
| Squads Competition counts app, web and Terminal | PetrAnto via KuCoin, 2026-10-25 (cited by the previous research) |
| Tokenized Agent option removed | cryptopolitan.com, 2026-06-30 (cited by the previous research) |
| KIMCHI's deployer bought the whole curve at creation (`[press]` in `onchain/lifecycle.md`) | Press report cited by the previous research |
| PumpPortal | https://github.com/thetateman/Pump-Fun-API · https://www.quicknode.com/builders-guide/tools/pumpportal-by-pumpportal-team |
| Bitquery | https://docs.bitquery.io/docs/blockchain/Solana/Pumpfun/ · https://github.com/bitquery/Pump-Fun-API |

## Inferred

`[inferred]` marks readings of names, shapes or code that no source states outright. For example: the role of the
`pfn…` tip addresses, the media server behind livestreams, who signs a free creation, what `validate_nonce` guards.
Each is written next to the evidence it rests on.

## Method

- RPC: 35 calls on public mainnet, no `getProgramAccounts`, no polling.
- Browser: public pages only. No sign-in, wallet, signature or transaction; the terms dialog was left unanswered.
  Each public endpoint was hit only by the app itself, plus one in-page call each to `/api/server-time`,
  `/sol-price` and `/referrals/fee-rates` to read headers.
- Second pass: the app's own JavaScript chunks (293 on the home page, more on `/perps`, `/go/bounties` and a coin
  page) were re-read from the browser cache inside the page and searched as text; pump.fun's `/docs/*` pages,
  `robots.txt` and `sitemap.xml` were fetched once each; `/perps`, `/holder-rewards`, `/pump-token`, `/go/bounties`
  and one coin page were opened. No new RPC calls; DNS lookups for 17 hosts.
- Downloads (SDK tarballs, the crate, GitHub files) are not part of this repository; they were read as text or bytes
  only.
