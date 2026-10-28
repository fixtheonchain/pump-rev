# Donation Relay

`RLAYHr9TRFcKB2ubYQhspcnXiaGpaVzNQvHytt47RZu`

A donation pipeline that Pump Fees calls into. A coin's sharing config can list a `DonationFeePda` as a shareholder.
`crank_donation_fee_pda` forwards that PDA's balance here, and a relayer swaps it through Jupiter and pays it out to
recipients. The pump SDK calls it "the external Donation Relay program", deployed at different addresses on mainnet and
devnet (`DRLYxueWz6iymdsaRCER6iv6v9zL7gFWANwDL2V5VUx1` on devnet) [sdk `pda.ts`].

| Field | Value | Source |
| --- | --- | --- |
| ProgramData | `5QH8Ay11KgpRMyECYofHwAr6SzfFEGkbtPoM6eXv8V7B`, 830,493 bytes, 5.78 SOL rent | [chain] |
| Upgrade authority | `9rmqZkmn3Bzd4jAL5uw3TXCgWvbHwH1VyW6fdFtimASu` (off-curve, 0.10 SOL). Not one of pump's program keys | [chain] |
| Last deploy | slot 415,422,992, **2026-04-24 20:54:08 UTC** | [chain] |
| On-chain Anchor IDL | `6mCmANHqUcqWCLAUtB3DFJSDv14yWPq4wXUzDhdMj3Ge`, authority `prodARfLWf9ch7yfzQr6Z8tqiee38BHyMi6TW7puYHJ` (single keypair). `donation_relay` v0.6.0, "Donation Relay Program". Saved in [`idl/onchain/donation_relay.json`](../idl/onchain/donation_relay.json) | [chain] |

## Instructions (from its on-chain IDL)

| Who | Instructions |
| --- | --- |
| Anyone (`from` signs) | `donate_v1`, `donate_pubkey_config_id_v1`, `donate_pubkey_config_id_with_payer_v1`, `donate_native_v1`, `donate_native_pubkey_config_id_v1`: deposit into a per-config, per-epoch debouncer |
| Relayer only | `close_donation_epoch_v1`, `swap_then_distribute_v1` (Jupiter), `just_swap_v1`, `distribute_after_just_swapping_v1`, `distribute_non_swap_output_mint_v1`, `upsert_mint_whitelist_v1` |

Accounts: `DebouncerV1`, `EpochTrackerV1`, `DistributionV1`, `SwapReceiptV1`, `MintWhitelistV1`. Events carry a
`daas_event_discriminator` field. Who operates the relayer is not stated in any source found. A third-party
reconstruction of pump's programs lists Donation Relay among them [press: github.com/lalalune/pumpfun-source README,
via tokenpost.com/news/technology/40426, 2026-10-25].

## Re-verified 2026-10-28

Read again at slot 462,377,442 (2026-10-28 06:37 UTC) by `scripts/read-live.mjs` [chain]. Upgrade authority `9rmqZkmn…`, last deploy (slot 415,422,992) and the
on-chain IDL (11 instructions, authority `prodARfL…`) are unchanged [chain]. The web bundle carries the devnet
address `DRLYxueWz6iymdsaRCER6iv6v9zL7gFWANwDL2V5VUx1` next to the mainnet one [bundle].
