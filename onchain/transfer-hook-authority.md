# transfer-hook-authority

`333UA891CYPpAJAthphPT3hg1EkUBLhNFoP9HoWW3nug`

A program pump.fun published on GitHub (`github.com/pump-fun/transfer-hook-authority`, last pushed 2026-02-22). Its
whole source is one Anchor module with no instructions:

```rust
declare_id!("333UA891CYPpAJAthphPT3hg1EkUBLhNFoP9HoWW3nug");

#[program]
pub mod transfer_hook_authority {}
```

[docs github.com/pump-fun/transfer-hook-authority `programs/transfer-hook-authority/src/lib.rs`, `Anchor.toml`]

| Field | Value | Source |
| --- | --- | --- |
| Program | `333UA891CYPpAJAthphPT3hg1EkUBLhNFoP9HoWW3nug`, executable, BPF Upgradeable Loader | [chain] |
| ProgramData | `J97GHGFf2Dvf6bAEpkXbZTc4XkXprpqQG63j8dZVJMWK`, 227,709 bytes, 1.59 SOL rent | [chain] |
| Upgrade authority | **none**: the program is immutable | [chain] |
| Last deploy | slot 353,292,884, 2025-07-14 17:43:43 UTC | [chain] |
| IDL | none on chain | [chain] |

## What it is for

A program with no instructions can never sign for its PDAs or change anything. Set as an authority, such as a
Token-2022 transfer-hook authority, one of its PDAs therefore stays fixed forever while still being a valid,
program-owned address [inferred from the source and the repo name]. The pump.fun coin mint read on 2026-10-28 carries
no TransferHook extension at all (see [token-and-modes.md](token-and-modes.md)). The bundle and the API do expose a
`transfer_hook_program` field per coin (empty for pump coins), so the field appears to describe quote or listed mints
from elsewhere [capture `coins-v3`] [inferred].
