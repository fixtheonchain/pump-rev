# Packs, Mayhem, tokenized agents, Go.fun bounties

## Packs and graded cards

pump.fun sells graded trading-card packs from two vendors and lists the cards for resale. `coin-communities` owns the
catalog; `blockchain-api-service` builds every transaction [contract] [bundle].

| Point | How it works | Source |
| --- | --- | --- |
| Vendors | `collector_crypt` (gacha.collectorcrypt.com, ids `cc:`) and `phygitals` (api.phygitals.com, ids `phy:`) | [contract] |
| Catalog | `GET /packs?category`: every servable pack from every loaded vendor plus a tier router's slots (one per category and price tier); categories pokemon, one_piece, sports, watch, riftbound, dragon_ball, yugioh, other; per-vendor `fetched_at` and a `degraded` list | [contract] |
| Odds | Each pack lists tiers with rank, `weight_pct` (chance), and card value range in USD | [contract] |
| Machines | `GET /gacha-inventory`: stock per rarity tier for every Collector Crypt machine, cached 30 s | [contract] |
| Buy and open | `transactions/cc-pack-machines`, `cc-pack-build` → user signs → `cc-pack-submit` → `cc-pack-open`; an expired pack or an unknown submit outcome is its own error | [bundle] |
| Buyback | `cc-pack-buyback` → `cc-pack-buyback-submit`: sell a pulled card back to the vendor | [bundle] |
| Market | `cc-market-listings`, `cc-market-card`, `cc-market-list`, `cc-market-update`, `cc-market-cancel`, `cc-market-buy`, `cc-market-submit`; `GET /market/listings` serves Tensor listings filtered by collection (Phygitals Core collection `phygZDQZ…`) and category | [bundle] [contract] |
| Holdings | `GET /packs/holdings?wallet`: the wallet's Phygitals cards (Metaplex Core assets read from chain by `cc`), marked in USD off live listings | [contract] |
| Social | A pull can be called out (`sourceRef collectible:<opening_uuid>`), shows in alerts as a collectible leg, and renders as a pack-opening replay video | [contract] |
| Rollout | `webPacks` 2026-10-19, `webPhygitalsMigration` 2026-10-23 | [bundle flag registry] |

## Mayhem

| Point | How it works | Source |
| --- | --- | --- |
| What it is | An autonomous trading agent that trades opted-in coins during their first 24 hours. It mints a second billion tokens (2 B supply) for itself, buys and sells in a random walk, and burns what it holds at 24 h, including tokens sent to it during the window | [site-docs mayhem-mode] |
| Caps | Hard caps on SOL bought per coin, SOL sold per coin and trades per period; profit goes to an insurance fund; protocol fees from Mayhem coins go to a separate recipient (`GesfTA3X…`) and are left out of fees.pump.fun | [site-docs mayhem-mode] |
| Wallets | Agent `BwWK17cb…`, program `MAyh…` (see [../onchain/mayhem.md](../onchain/mayhem.md)) | [site-docs mayhem-mode] [chain] |
| Modes | `POST /mayhem/{mint}/mode {mode: auto | manual, multiplayer}`; in manual mode the creator fires single trades (`POST /mayhem/{mint}/trigger-trade`); **Multiplayer** ("Party" coins, recorded once at creation) lets any holder above `trigger_min_holding` fire the trigger, one at a time under a per-mint lock | [contract] |
| Emotes | `POST /mayhem/{mint}/emote` on multiplayer coins | [contract] |
| Partner API | `POST /mayhem/partner/{mint}/trigger {wallet, request_id}`: a partner app asserts a wallet it has verified in its own custody; answers with the lane (`creator` or `holder`); refusals `below_threshold` and `trigger_in_progress`; edge rate limit per partner; dark unless `MAYHEM_PARTNER_ROUTES_ENABLED` | [contract] |
| Data | `/mayhem/overview`, `/mayhem/top-coins`, `/mayhem/top-traders`, `/mayhem/{mint}/top-traders`, `GET /coins-v2/{mint}/mayhem-state` | [contract] |

## Tokenized agents

| Point | How it works | Source |
| --- | --- | --- |
| Setting | A creator opts a coin in at launch and uploads a `skills.md` file describing the agent | [site-docs tokenized-agent-disclaimer] |
| Deposits | Each agent token has a deposit address that accepts SOL, USDC, USDT and USD1; the creator sets the share used for buyback and can claim the rest | [site-docs tokenized-agent-disclaimer] |
| Buyback | Hourly: the Tokenized Agent Authority converts deposits (non-SOL assets routed to SOL first), buys the agent token and burns it | [site-docs tokenized-agent-disclaimer] |
| On chain | Agent Payments program (`AgenT…`): `agent_accept_payment`, `agent_distribute_payments`, `agent_buyback_trigger(swap_instruction_data)`, `agent_update_buyback_bps`, `agent_withdraw` | [idl] → [../onchain/pump-agent-payments.md](../onchain/pump-agent-payments.md) |
| Records | Coin records carry `tokenized_agent`; the coin page has a `tokenizedAgentOnboarding` step | [capture] [bundle] |

## Go.fun bounties

Go.fun is a bounty board inside pump.fun (`/go`, `/go/bounties`, `/go/submissions`, `/go/mine`, `/go/drafts`). Its
backend is `livestream-api.pump.fun`, the same service that runs livestreams [bundle].

| Point | How it works | Source |
| --- | --- | --- |
| Tasks | A poster writes a title and markdown body, funds a reward and publishes; phases `OPEN`, `PENDING_RESOLUTION`, `IN_DISPUTE_PERIOD`, `CLOSED` | [bundle] |
| Escrow | Each funded task has an escrow record: `mint`, `amountAtomic`, `purpose`, `settled`, `settledAt`, `refundBps`, `refundOwedAtomic`, `refundClaimed`; quotes per task with `feesEnabled` | [bundle] |
| Lifecycle | `POST bounties/tasks/{id}/resolve`, `finalize-expired`, `recover`; drafts and "pending attention" lists per user | [bundle] |
| Gates | Submissions can be gated on following the poster on pump.fun (`bountyPumpFollowerGate`); percentage-based bounty fees (`bountyPercentageFees`) | [bundle flag registry] |
| Moderation | Approve, ban, unban, NSFW, dismiss reports for tasks, submissions and comments; decision proposals with a decision context; "web detection" on a submission; reconcile steps for decision, fees, payout and finalize | [bundle] |
| Public stats | `bounties/v2/stats`, `tasks`, `top-earners`, `top-spenders`, `top-coins`, `recent-payouts`, `feed/trending` | [bundle] |
| Coin tab | `bounties/v2/tasks?coinAddress={mint}&phase=…` on the coin page | [capture] |
| Terms | Go.fun can approve, withhold, reverse or reallocate transfers, and decisions on submissions are final | [site-docs go-fun-terms] |
