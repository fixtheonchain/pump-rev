# Deployed program binaries

The ELF of each pump.fun program as deployed on mainnet, read from its ProgramData account on 2026-10-28 (slots
462,493,028–462,493,060) by [`scripts/dump-programs.mjs`](../scripts/dump-programs.mjs). Each `.so` is the ProgramData
contents after the 45-byte loader header, cut at the end of the ELF image its own headers describe; everything after
that point in the account is zero padding. [`manifest.json`](manifest.json) holds each program's ProgramData address,
upgrade authority, read slot and padded length alongside the values below.

| Program | File | Program id | Deploy slot (UTC) | Bytes |
| --- | --- | --- | --- | --- |
| [Pump](../onchain/pump.md) | [`pump.so`](pump.so) | `6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P` | 458,921,440 (2026-10-19 17:47) | 1,934,800 |
| [PumpSwap](../onchain/pump-amm.md) | [`pump_amm.so`](pump_amm.so) | `pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA` | 458,921,517 (2026-10-19 17:47) | 1,268,504 |
| [Pump Fees](../onchain/pump-fees.md) | [`pump_fees.so`](pump_fees.so) | `pfeeUxB6jkeY1Hxd7CsFCAjcbHA9rWtchMGdZ6VojVZ` | 456,132,171 (2026-10-12 17:40) | 873,256 |
| [Mayhem](../onchain/mayhem.md) | [`mayhem.so`](mayhem.so) | `MAyhSmzXzV1pTf7LsNkrNwkWKTo4ougAJ1PPg47MD4e` | 452,655,053 (2026-10-02 15:47) | 775,416 |
| [Agent Payments](../onchain/pump-agent-payments.md) | [`pump_agent_payments.so`](pump_agent_payments.so) | `AgenTMiC2hvxGebTsgmsD4HHBa8WEcqGFf87iwRRxLo7` | 429,909,554 (2026-06-30 15:58) | 512,448 |
| [Pump App router](../onchain/pump-app-router.md) | [`pump_stables_router.so`](pump_stables_router.so) | `6Vo3245eszAb5wuqEMw8mGdbfRUdKbHhDHP5LcaGuTAB` | 454,846,926 (2026-10-09 11:01) | 2,191,048 |
| [Terminal](../onchain/terminal.md) | [`terminal_proxy.so`](terminal_proxy.so) | `term9YPb9mzAsABaqN71A4xdbxHmpBNZavpBiQKZzN3` | 458,774,985 (2026-10-19 08:57) | 1,081,320 |
| [Donation Relay](../onchain/donation-relay.md) | [`donation_relay.so`](donation_relay.so) | `RLAYHr9TRFcKB2ubYQhspcnXiaGpaVzNQvHytt47RZu` | 415,422,992 (2026-04-24 20:54) | 818,280 |
| [transfer-hook-authority](../onchain/transfer-hook-authority.md) | [`transfer_hook_authority.so`](transfer_hook_authority.so) | `333UA891CYPpAJAthphPT3hg1EkUBLhNFoP9HoWW3nug` | 353,292,884 (2025-07-14 17:43) | 174,688 |

## Hashes

| File | sha256 of the file | `solana-verify` hash |
| --- | --- | --- |
| `pump.so` | `05249b60f8ddf02a53d0f8a43980fde40cce33f73526355b4ef08e292279819f` | `756c04ab1ac76122dcdcf2eeb0073bb139087b23d58d3f0d6c895510ab59d582` |
| `pump_amm.so` | `51a5f6a7fb5a812de7686e593ce6159f6ee59b15771a3d5d37ab661c46d64586` | `4d5fc41918374b24b16d8372d14a1ac64c768c83a2971bfeef1c8660dad649e7` |
| `pump_fees.so` | `5b6ceda57863f0dcc3e0e3623052f8342c2c81883379699e71d7ed5383cb3dcf` | `8ad2ca93c7ae97a7fb0de8a99de4d8825ccfdf89f73138cd49bda948e124b8b8` |
| `mayhem.so` | `9af9e3b1cbc9d89340af4d9d46e4c88d3dc2fc67e0090f9370047d97532ff09d` | `38ce9f996b6d9eea79b583cf5ed0b9c9cfe8b931a901d4a7d468dffb46994cca` |
| `pump_agent_payments.so` | `71711e13d8e5a547e6374f6bb0083809b6ebe0f961a669b081114a8493def600` | `52a5b53194c9be73f6f1662407fde78f25a07cfadfbeda8e57b1088492c26694` |
| `pump_stables_router.so` | `1ada810f38b2303daedca3450d5926300841bd9030651ec951b2fe87c682c01c` | `ca52ecd74ba2152047abb67ca651ff4594958322a7a8fec731a50028dda85f5c` |
| `terminal_proxy.so` | `ad102727af62c216c832a9674b9c53b5c5cac7f82c0dbedd60dd0d79e888e9d0` | `9f502273889e014270d798f1e52887bff5f6a4e60564fac048d06d0ab7db0047` |
| `donation_relay.so` | `56d81ec64a0ba070d3d23f3c1547b31d659e85716dfa2198ec4b0ce6cd355333` | `8808a0a6e19992e661540107ec7fcb760ec6a7f60d807cecde6a6b9f52669d8e` |
| `transfer_hook_authority.so` | `ab01516eef291b162f028da501e19fa5971ef0ed7af5ad33567c556a8e914f5b` | `3430ea82b8211f90dc28aa2d4b469c9a73dabb750a2b26a33406682d4b2c9ee0` |

- **sha256 of the file** hashes the `.so` exactly as stored here.
- **`solana-verify` hash** hashes the ProgramData contents with trailing zeros trimmed, the convention
  `solana-verify get-program-hash <program id>` uses. Every ELF here ends in 15 zero bytes, which is the only
  difference between the two columns.
- The deploy slot is the slot stored in the ProgramData header; a later upgrade changes it and both hashes.

## Reproduce

```bash
node scripts/dump-programs.mjs
```

Ten RPC calls to public mainnet (`RPC_URL` overrides the endpoint): one `getMultipleAccounts` for the program
accounts, then one `getAccountInfo` per ProgramData account.
