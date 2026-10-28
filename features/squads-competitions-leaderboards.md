# Squads, competitions, leaderboards, achievements, share videos

All of these run on boards that `coin-communities` (`cc`) builds from PnL folds. A "fold" is a periodic aggregate
build: responses carry `builtAtMs` / `generatedAt`, and an empty board means "no fold published yet" [contract].

## Squads (`groups`)

| Point | How it works | Source |
| --- | --- | --- |
| Model | A group has an owner, admins and members (`ACTIVE` or `INVITED`), a username, bio, profile and header images, and an optional linked X account. Pages at `/squads/<username>` | [contract] [capture] |
| Lifecycle | `POST /groups` (owner = caller), invite (`POST /groups/{id}/invites`, owner/admin), respond (`accept`, optionally `leaveCurrentGroup`), remove or self-leave, role change (owner only; setting `OWNER` transfers ownership), delete (owner, idempotent) | [contract] |
| Limits | A user can be in a capped number of groups (`ALREADY_IN_GROUP`); a group has a seat cap (`GROUP_FULL`); usernames follow `cc` charset rules and some are reserved | [contract] error registry |
| Acting as a squad | Callouts take `asGroupId`; the caller must be the squad's admin or owner (`NOT_GROUP_ADMIN`, `GROUP_ACTOR_REQUIRED`) | [contract] |
| Squad PnL | `GET /groups/{id}/members/pnl?period`: members ranked by windowed PnL; `/portfolio-summary` and `/user-portfolio` accept a group id or username and serve the members' aggregate | [contract] [bundle] |
| X link | `POST /groups/{id}/x-link-request` (owner/admin): support links it from the admin panel | [contract] |
| Board | `GET /pnl-leaderboard/groups?period`; moderators can hide a group from it | [contract] |

## Trading competitions

| Point | How it works | Source |
| --- | --- | --- |
| Kinds | Person competitions and squad competitions (`COMPETITION_KIND_MISMATCH` when the body does not match) | [contract] |
| Phases | `upcoming` → registration → `live` → past. `GET /competitions` returns three viewer-independent buckets | [contract] |
| Terms | A competition ToS acceptance per user (`GET /competitions/tos`, `POST …/accept`, idempotent, echoes the first acceptance time) | [contract] |
| Register | `POST /competitions/{id}/register` with `groupId` for a squad (owner only) or nothing for a person; idempotent. Refusals: registration not open or closed, entry cap reached, squad too small or too big after excluding members another entry already counts, board wallet banned, squad hidden, no Solana board wallet. `429 COMPETITION_REGISTER_BUSY` with `Retry-After` when `cc` is saturated | [contract] error registry |
| Roster | The roster is **snapshotted** at `startsAt` (or immediately when registering after the start); members already counted by another entry are excluded and listed back | [contract] |
| Scoring | Each entry's "legs" (per-token PnL of its members' trades inside the window) are summed; the board is rebuilt periodically and frozen at `endsAt` (`startSec`, `endSec`, `builtAtMs`, `totalRanked`) | [contract] |
| Views | Entry detail with counted legs, an entry's highlight reel (top tokens by PnL), merged positions per token, and competition-wide highlights (biggest winning legs) | [contract] |
| Moderation | Moderators with `pump.competitions.moderate` see every entry, strike (disqualify) and unstrike; a PnL kill list and a mint blocklist (up to 50 per call) keep wallets and mints off every board | [contract] |
| Cadence | A `squadCupInterval` flag (2026-10-26) sets the recurring Squad Cup | [bundle flag registry] |

## PnL leaderboards

- `GET /pnl-leaderboard?period&sort&limit`: periods `daily` / `weekly` / … (labels `1d`, `7d`), sorted by
  `combined` and other keys; each row has realized and unrealized PnL in SOL and USD, buy spend, position count and
  top positions; `viewer` (your own rank on the same snapshot) only on signed-in reads [capture] [contract].
- `GET /pnl-leaderboard/positions`: best single positions [contract].
- `GET /pnl-leaderboard/top-trader-trades/{mint}`: trades in one coin by accounts ranked top 50 in any period, across
  all their wallets; the coin chart draws them as markers [capture] [contract].
- Trading streaks: `GET /users/streaks/leaderboard`, `GET /users/{address}/streak` (daily history) [contract].

## Achievements

- A catalog of 46 achievements (`GET /achievements/catalog`: `id, family, tier, name, description, imageUrl, metric,
  threshold`) [capture].
- Per user: unlocks with `unlockedAt`, `value`, holder count and percent of users holding it, plus live progress on
  every track (`metric, currentValue, nextThreshold, nextAchievementId`); `POST /users/achievements/seen` clears the
  new-badge dot; `POST /achievements/overlays` returns the top badge per avatar for lists [capture] [contract].
- Avatar decorations (border effects) are set with `POST /users/avatar-decoration` [contract].

## Share videos and replays

| Point | How it works | Source |
| --- | --- | --- |
| Renders | `POST /share-video/replay` (a wallet's trades in one coin), `/pack-replay` (a pack opening), `/scene/{kind}` (planned scenes), `/profile` and `/pnl` (multipart composites) | [contract] |
| Cache | The render id is **content-addressed** (a hash of the render props): the same request returns the cached video; clients poll `GET /share-video/replay/{renderId}` for `rendering` → `done` with `videoUrl` | [contract] |
| Inputs | Wallet, mint (or an HL coin key for perps, with leverage, margin and liquidation price), CAIP-2 chain, cut (`full` or `social`), optional profit overrides from the position sheet, market cap for the end card | [contract] |
| Replay data | `GET /replay?wallet&mint&from&to`: the wallet's trades in the coin with the coin card, price history and the position after the window | [contract] |
| Generated media | Verified profiles carry a pre-rendered PnL loop and replay intro (`generatedMedia`), acknowledged with `POST /profiles/generated-media/seen` | [capture] [contract] |
