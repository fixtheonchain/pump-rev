# frontend-api-v3 route contract (extracted)

Source: the pump.fun web bundle chunk `/_next/static/immutable/chunks/2cr_aqnw2j4n5.js`, read from the browser cache on
2026-10-28. The chunk carries the API's typed route contract: 73 `defineRoutes({...})` groups whose keys are
`"METHOD /path"` with a `summary` string and zod schemas for `query`, `params`, `body`, `multipart` and `response`.
259 route keys were extracted with a regex over the text in the first pass (330 in the second pass below); the summary is cut at 115 characters. The contract names no
host; the routes match the calls the app makes to `https://frontend-api-v3.pump.fun` (several confirmed by capture,
see `capture-log.md`). Group names are the contract's own (`<name>Routes`), corrected by path where the regex's group
boundary fell one route late.

Inputs: `q` query, `p` path params, `b` JSON body, `m` multipart upload, `D` marked deprecated.

| Group | Route | In | Summary (contract text) |
| --- | --- | --- | --- |
| achievements | GET /achievements/catalog | | The full achievement catalog: definitions and display metadata |
| appBanner | GET /app-banner | | Get the in-app announcement banner, if one is live |
| articles | GET /articles/latest | q | Get the latest article for a mint and locale |
| articles | GET /articles/list | q | List published articles for a locale |
| articles | GET /articles/{id} | qp | Get an article by id and locale |
| articles | POST /articles/cms-webhook | b | Handle a Strapi CMS content-change webhook |
| auth | POST /auth/login | b | Authenticate and issue a session token (superseded by /auth/login/token and /auth/login/session) |
| auth | POST /auth/login/token | b | Authenticate and return the session token as a bearer token |
| auth | POST /auth/login/session | b | Authenticate and establish the auth_token cookie session |
| auth | GET /auth/my-profile | | Get the current session profile |
| auth | POST /auth/switch-wallet | b | Re-scope the session to another linked wallet (flagged) |
| auth | POST /auth/register | b | Create the account for a proven wallet and issue its session token |
| auth | GET /auth/is-valid-jurisdiction | | Check if the caller jurisdiction is allowed |
| auth | GET /auth/disabled-features | | Get disabled features for the caller |
| auth | POST /auth/logout | | Clear the session cookie and revoke the session |
| auth | POST /auth/add-admin | b | Grant an admin role |
| auth | DELETE /auth/admins/{address} | pb | Revoke an admin role |
| blocks | POST /blocks/{userId} | p | Block a user: they can no longer reply in your callout threads |
| blocks | DELETE /blocks/{userId} | p | Unblock a user |
| blocks | GET /blocks | | List the users you have blocked, newest first |
| bookmarks | POST /bookmarks | b | Create a bookmark folder |
| bookmarks | GET /bookmarks | q | List the user bookmark folders |
| bookmarks | PUT /bookmarks/{bookmarkId} | pb | Rename a bookmark folder |
| bookmarks | DELETE /bookmarks/{bookmarkId} | p | Delete a bookmark folder |
| bookmarks | POST /bookmarks/items/add | b | Add an item to multiple bookmark folders |
| bookmarks | POST /bookmarks/items/remove | b | Remove an item from multiple bookmark folders |
| bookmarks | POST /bookmarks/{bookmarkId}/items | pb | Add an item to a bookmark folder |
| bookmarks | DELETE /bookmarks/{bookmarkId}/items/{itemId} | p | Remove an item from a bookmark folder |
| bookmarks | DELETE /bookmarks/default/{itemId} | p | Remove an item from the default bookmark folder |
| bookmarks | DELETE /bookmarks/{bookmarkId}/{itemId} | p | Remove an item from a bookmark folder |
| calloutTranslation | GET /callouts/{calloutId}/translation | qp | Translate a callout's content into the caller's locale |
| callout | POST /callout/create | bm | Create a callout, optionally with an image upload |
| callout | POST /callout/media | m | Upload a callout video for screening; poll the returned mediaId until clean, then attach it on POST /callout/create |
| callout | POST /callout/voice | m | Upload a callout voice note (audio-only m4a, AAC, 10 MiB, 120 s) for transcription; resolves synchronously with the |
| callout | GET /callout/media/{mediaId} | p | Poll a callout video or voice-note upload (owner only) |
| callout | POST /callout/{calloutId}/replies | pbm | Reply to a callout, optionally with an image upload |
| callout | GET /callout/eligibility/{coinMint} | qp | Check callout eligibility for a coin; chain=hlcore:* evaluates the perp arm |
| callout | POST /callout/{calloutId}/repost | pb | Repost a callout, or one of its replies via replyId (author reposts freely; others must hold ≥$1 of the token). Ide |
| callout | DELETE /callout/{calloutId}/repost | qp | Undo a plain repost of a callout or reply |
| callout | POST /callout/{calloutId}/like | p | Like a callout |
| callout | DELETE /callout/{calloutId}/like | p | Unlike a callout |
| callout | POST /callout/replies/{replyId}/like | p | Like a callout reply |
| callout | DELETE /callout/replies/{replyId}/like | p | Unlike a callout reply |
| callout | GET /callout/onboarding | q | Get the onboarding callout for the authenticated user |
| candles | GET /candles/{chainId}/{address} | qp | A coin's OHLCV bars, oldest first |
| candles | GET /candles/{chainId}/{address}/line | qp | A coin's close-price line, LTTB-capped |
| changelog | GET /changelog | q | Get the live changelog entries for this client, already targeted by platform and app version |
| coinsGrpc | GET /coins-v2/{mint} | qp | Get an enriched coin by mint |
| coinsGrpc | GET /coins-v2/{mint}/mayhem-state | p | Get the mayhem-mode state for a coin |
| coinsGrpc | POST /coins-v2/mints | b | Get enriched coins by mint addresses |
| coinsGrpc | GET /coins-v2/user-created-coins/{creator} | qp | Get coins created by an address |
| coinsGrpc | GET /coins-v3/{address} | qp | Resolve a coin by address |
| coins | POST /coins/sign-create-tx | bD | Sign a coin-creation transaction (client-only, deprecated) |
| coins | POST /coins/add-banner | b | Add a banner to a coin |
| coins | POST /coins/create-v2 | b | Create a coin without captcha |
| coins | GET /coins/currently-live | q | List currently-live coins |
| coins | GET /coins/mayhem-mode | q | List mayhem-mode coins |
| coins | GET /coins/bookmarks/default | q | Get coins in the default bookmark list |
| coins | GET /coins/bookmarks/{id} | qp | Get coins in a bookmark list |
| coins | GET /coins/protected | q | Admin: list coins with creator metadata |
| coins | POST /coins/mints | b | Get enriched coins by mint addresses |
| coins | GET /coins/similar | q | Get coins similar to a mint |
| coins | GET /coins/search-v2 | q | Search coins (7-day recency filter) |
| coins | GET /coins/search-unrestricted | q | Search coins without recency filter |
| coins | GET /coins/search-quote-facets | q | Quote-currency facet counts for a coin search |
| coins | GET /coins/great-coins | q | Get great coins |
| coins | GET /coins/recommendations | q | Ranked coin recommendations for a client surface (deposit_success: the rail on the deposit success screen; search_e |
| coins | GET /coins/hot-coin | | Get the currently surfaced hot coin, if any |
| coins | GET /coins/top-tokens/mints | q | Get the top-tokens mint list |
| coins | GET /coins/perps | q | Get the HyperCore perps screener |
| coins | GET /coins/boards/{board} | qp | Get a fold-ranked coin board |
| coins | GET /coins/{mint}/canonical-image | p | Get the canonical image for a mint |
| coins | POST /coins/raw/batch | b | Get raw coins by mint addresses |
| coins | GET /coins/check-vanity-store/{mint} | p | Check if a mint key came from the vanity pool |
| coins | GET /coins | q | List coins with creator metadata |
| competitions | GET /competitions/tos | | Whether the authenticated user accepted the trade competition terms (and when) |
| competitions | POST /competitions/tos/accept | | Record the authenticated user's trade competition terms acceptance (idempotent; echoes the original acceptance time |
| competitions | POST /competitions/{id}/register | pb | Register for a competition: the caller's squad (owner only, groupId) or the caller; idempotent. A 429 COMPETITION_R |
| competitions | GET /competitions/{id}/moderation/entries | p | Moderator roster: every entry, struck and hidden ones included (pump.competitions.moderate) |
| competitions | POST /competitions/{id}/entries/{entryId}/strike | pb | Strike (disqualify) a competition entry (pump.competitions.moderate) |
| competitions | POST /competitions/{id}/entries/{entryId}/unstrike | pb | Lift a competition entry strike (pump.competitions.moderate) |
| creatorRewardsTos | GET /creator-rewards-tos | | Whether the authenticated user accepted the creator-rewards ToS (and when) |
| creatorRewardsTos | POST /creator-rewards-tos/accept | | Record the authenticated user's creator-rewards ToS acceptance (idempotent; echoes the original acceptance time) |
| developer | GET /developer/org | | The session owner's developer org and its newest application |
| developer | POST /developer/org/apply | b | Apply for a developer org (status applied; ops approve or reject in the review queue) |
| developer | POST /developer/org/email/verify/request | | Send a 6-digit one-time code to the contact email (60 s resend lock, 600 s validity, 5 attempts) |
| developer | POST /developer/org/email/verify/confirm | b | Confirm the one-time code and mark the contact email verified |
| developer | GET /developer/keys | | List the org's keys (prefix + last 4, scopes, limits, status, last use) |
| developer | POST /developer/keys | b | Create a named key; the plaintext is returned once. Needs an approved org, a verified email, the current terms acce |
| developer | POST /developer/keys/{keyId}/rotate | pb | Issue a sibling key (same name, scopes and limits; rotated_from set); the old key becomes rotating, is served until |
| developer | DELETE /developer/keys/{keyId} | p | Revoke a key (idempotent); the data plane refuses it on the next request (verdict tombstoned in the same request) |
| developer | GET /developer/keys/{keyId}/usage | qp | A key's usage from the Redis counters: 24h per minute or 30d per hour |
| developer | GET /developer/terms | | The current API terms text and version, with the caller’s acceptance state |
| developer | POST /developer/terms/accept | b | Record acceptance of the current API terms version (version, acceptor, time, IP) |
| dms | POST /dms/to/{userId}/messages | pbm | Send a direct message, optionally with an image upload |
| dms | GET /dms/inbox | q | Conversation list, newest activity first, with unread counts, a preview of the latest message, and the caller's own |
| dms | PATCH /dms/conversations/{conversationId} | pb | Set the caller's private archive/mute/pin prefs on a conversation (partial update: omitted fields keep their stored |
| dms | GET /dms/conversations/{conversationId}/messages | qp | One conversation's messages, newest first (viewer must be a participant) |
| dms | GET /dms/with/{userId}/messages | qp | The caller's conversation with a specific user, newest first |
| dms | POST /dms/conversations/{conversationId}/read | pb | Zero the caller's unread count and advance their read pointer in a conversation |
| dms | GET /dms/eligibility/{userId} | p | Whether the caller and the given user can DM right now (mutual follow, both directions) |
| fees | GET /fees/coin/{chainId}/{address} | qp | A coin's fee-sharing config and fee events, newest first |
| fees | GET /fees/creator/{address} | qp | A creator's fee earnings, claimable balance and series |
| fees | GET /fees/creator/{address}/unswept | p | A creator's coins with creator fees still in the on-chain bucket (unswept), by USD; what a claim must sweep |
| fees | GET /fees/referral/{wallet} | qp | A referrer's referral-vault withdrawals: per-quote totals with USD at the block-time mark, and the withdrawal page |
| fees | GET /fees/shareholder/{id} | qp | A wallet's fee-sharing earnings per coin, with wallet totals |
| fees | GET /fees/holder-rewards | q | One page of the holder-rewards book per request: fees accrued to each vault, payouts, and book totals |
| fees | GET /fees/me | | The authenticated user's platform-fee bypass: how much of the platform fee they are exempt from, in whole basis poi |
| flags | GET /internal/flags | | Internal flag-store snapshot: the source, its load state and every resolved flag with its outcome |
| followedHolders | GET /followed-holders/suggestions | q | Accounts to follow for a viewer whose Most holders board is empty: the engagement-scored onboarding pool minus the |
| followedHolders | GET /followed-holders/recent-entries | | Coins ranked by how many accounts the viewer follows net-bought them inside a trailing window ('get caught up'), mo |
| followedHolders | GET /followed-holders/coins | q | Coins ranked by how many accounts the viewer follows hold them ('coins my follows hold'), most-held first — each ro |
| followedHolders | GET /followed-holders/{mint} | qp | Accounts the viewer follows that hold a live position in the mint ('holders you follow'), largest position first (s |
| followingFeed | GET /following-feed/by-mint/{mint} | qp | Get the following feed for a specific mint |
| followingPositions | GET /following-positions/alerts | q | The unified alerts feed: everything the signed-in user's followed accounts did as first-class rows — callouts, upda |
| followingPositions | POST /following-positions/alerts/presence | b | Registers (or renews) live-stream presence and returns the subscription contract: the exact NATS subject to consume |
| followingPositions | DELETE /following-positions/alerts/presence | | Counts a stream stop (screen blur / app background); presence itself is never removed here and expires by its TTL, |
| following | POST /following/v2/bulk | b | Follow multiple users in one request |
| following | POST /following/v2/{userId} | qp | Follow a user |
| following | DELETE /following/bulk-trade-notifications | | Disable trade notifications for all followed users |
| following | DELETE /following/{userId} | p | Unfollow a user |
| following | GET /following/trade-notification-status | q | List followed users with their trade-notification status |
| following | GET /following/v2/trade-notification-status | q | List followed users with their trade-notification status, as an offset page with an end-of-set signal |
| following | POST /following/single/batch | b | Get follow state for several users at once |
| following | GET /following/suggestions/{userId} | qp | Suggest accounts to follow after following a user — accounts co-followed by that user’s followers, PnL-credibility |
| following | GET /following/followers/{userId} | qp | List a user's followers, or search within them via searchTerm (superseded by /following/v3/followers/{userId} and / |
| following | GET /following/{userId} | qp | List the users a user is following (superseded by /following/v3/following/{userId}) |
| following | GET /following/v2/following/{userId} | qp | List the users a user is following (paginated), or search within them via searchTerm (superseded by /following/v3/f |
| following | PUT /following/bulk-trade-notifications | | Enable trade notifications for all followed users |
| following | PUT /following/{userId}/trade-notifications | p | Enable trade notifications for a followed user |
| following | DELETE /following/{userId}/trade-notifications | p | Disable trade notifications for a followed user |
| gachaInventory | GET /gacha-inventory | | Get the inventory level and per-tier stock of every Collector Crypt pack machine |
| globalParams | GET /global-params/{timestamp} | p | Get bonding-curve global params at a timestamp |
| groups | GET /groups/search | q | Search squads by name or linked X handle |
| groups | POST /groups | b | Create a group owned by the authenticated user |
| groups | GET /groups/me | q | The authenticated user's group memberships (ACTIVE) and pending invites (INVITED) |
| groups | GET /groups/of/{id} | qp | A user's group memberships by cc user id or wallet (INVITED rows included when unfiltered) |
| groups | POST /groups/{groupId}/invites | pb | Invite a person into the group (owner/admin only) |
| groups | POST /groups/{groupId}/invites/respond | pb | Accept or decline the authenticated user's pending invite |
| groups | DELETE /groups/{groupId}/members/{userId} | p | Remove a member or revoke an invite; removing yourself is self-leave |
| groups | PATCH /groups/{groupId}/members/{userId}/role | pb | Set an active member's role (owner only); OWNER transfers ownership |
| groups | PATCH /groups/{groupId} | pb | Update the group's settings and profile info (username/bio/profileImageUrl are owner-only) |
| groups | DELETE /groups/{groupId} | p | Delete the group and its content (owner only); idempotent upstream |
| health | GET /health | | Liveness health check |
| holderStats | GET /coins/holder-stats/{mint} | p | A mint's holder-distribution stats for the coin About tab: holder count, top-10 / dev / sniper / bundler share of s |
| homeFeed | GET /home-feed/new/count | q | How many "New" feed callouts arrived after the pinned `since` under the same filters — the pill's reconnect/resum |
| intercom | GET /intercom/hmac | q | Get the Intercom identity to boot with, and the HMAC minted over it |
| internalApiPlatform | GET /internal/api-platform/applications | q | Internal: review queue, orgs by status (newest first, cursor paged) or status=all (bounded overview: 25 per status, |
| internalApiPlatform | GET /internal/api-platform/orgs/{orgId} | p | Internal: org detail with its newest application and every key |
| internalApiPlatform | POST /internal/api-platform/orgs/{orgId}/approve | pb | Internal: approve an applied (or re-admit a suspended) org: status approved; the pending application is decided |
| internalApiPlatform | POST /internal/api-platform/orgs/{orgId}/reject | pb | Internal: reject an org: status closed with a note to the applicant |
| internalApiPlatform | POST /internal/api-platform/orgs/{orgId}/suspend | pb | Internal: suspend an org: status suspended, every key’s verdict tombstoned; approve re-admits it |
| internalApiPlatform | PATCH /internal/api-platform/keys/{keyId} | pb | Internal: edit a key's scopes and limits (0 = kill switch); the verdict is tombstoned in the same request |
| internalApiPlatform | POST /internal/api-platform/orgs/{orgId}/revoke-all | pb | Internal: revoke every active or rotating key of the org; verdicts tombstoned in the same request |
| internalApiPlatform | GET /internal/api-platform/orgs/{orgId}/usage | qp | Internal: org usage, per-key totals and the summed series; 24h/30d from Redis, 90d from BigQuery behind apiPlatform |
| internalApiPlatform | GET /internal/api-platform/audit | q | Internal: an org's audit log, newest first, cursor-paged (25 per page) |
| internalModeration | GET /internal/moderation/coin-verified/{mint} | p | Internal: read the verified flag on a coin |
| internalModeration | POST /internal/moderation/mark-as-verified/{mint} | pb | Internal: set the verified flag on a coin |
| internalModeration | GET /internal/moderation/hot-coin | | Internal: read the hot-coin surface state |
| internalModeration | POST /internal/moderation/hot-coin/approvals/{approvalId}/approve | p | Internal: approve a pending hot-coin surfacing |
| internalModeration | POST /internal/moderation/hot-coin/approvals/{approvalId}/decline | p | Internal: decline a pending hot-coin surfacing |
| internalModeration | GET /internal/moderation/trending-approvals | | Internal: list pending quiet-trending approvals |
| internalModeration | POST /internal/moderation/trending-approvals/{approvalId}/approve | p | Internal: approve a pending quiet-trending notification |
| internalModeration | POST /internal/moderation/trending-approvals/{approvalId}/decline | p | Internal: decline a pending quiet-trending notification |
| internalUsers | POST /internal/users/{address}/invalidate-cache | p | Internal: purge a user profile from the cache |
| ipfs | POST /ipfs/token-metadata | bm | Upload token image + metadata JSON to IPFS |
| ipfs | POST /ipfs/image | m | Upload a single file to IPFS |
| ipfs | GET /ipfs/pinata-presigned | | Get a presigned Pinata upload URL |
| market | GET /market/listings | q | Get the active marketplace listings of graded cards our pack providers mint, paged and filtered |
| mayhemApi | GET /mayhem/overview | | Get mayhem landing-page overview tiles |
| mayhemApi | GET /mayhem/top-coins | q | Get top mayhem coins |
| mayhemApi | GET /mayhem/top-traders | q | Get top mayhem traders |
| mayhemApi | POST /mayhem/{mint}/mode | pb | Toggle a coin between auto and manual mayhem mode |
| mayhemApi | POST /mayhem/{mint}/emote | pb | Send a party emote on a multiplayer mayhem coin |
| mayhemApi | POST /mayhem/{mint}/trigger-trade | p | Trigger a single manual mayhem trade for a coin |
| mayhemPartner | POST /mayhem/partner/{mint}/trigger | pb | Trigger a manual Mayhem trade for a coin as the wallet the partner asserts |
| mayhemPartner | GET /mayhem/partner/{mint}/eligibility | qp | Read a wallet's trigger eligibility on a coin and the served re-activation rule |
| moderation | GET /moderation/logs | q | List moderator action logs |
| moderation | POST /moderation/ban/address/{address} | pb | Ban a wallet address |
| moderation | POST /moderation/mark-as-nsfw/{mint} | pb | Mark a coin as NSFW or SFW |
| moderation | GET /moderation/ban-users | q | List banned users |
| moderation | POST /moderation/delete-photo/{mint} | pb | Delete a coin photo |
| moderation | POST /moderation/delete-banner/{mint} | pb | Delete a coin banner |
| mutes | POST /mutes/{userId} | p | Mute a user, hiding them from your For You feed |
| mutes | DELETE /mutes/{userId} | p | Unmute a user |
| mutes | GET /mutes | | List the users you have muted, newest first |
| natsAuth | POST /nats/token | | Mint a 1h bearer user JWT for the CORE NATS cluster (SEC-1908 per-user auth), scoped by the auth-callout worker to |
| packs | GET /packs | q | Get the merged pack catalog across every pack provider and the tier slots the hub shows |
| packs | GET /packs/holdings | q | Get the Phygitals cards a wallet holds, each with a USD mark off the live marketplace listings |
| payouts | GET /payouts | q | The authenticated user's payout history (paged, newest first) plus the confirmed-only USDC total, for ONE class of |
| perps | POST /perps/account/activate | | Activate the authed user's HyperCore account: asks cc to probe the user's canonical EVM wallet on Hyperliquid now a |
| perps | GET /perps/orders/{userId} | qp | A user's resting HyperCore orders (TP, SL, limit) over TradeApi GetOpenOrders. 200 with orders [] when the user has |
| pnlLeaderboard | POST /pnl-leaderboard/ban | b | Ban a wallet from every PNL leaderboard |
| pnlLeaderboard | POST /pnl-leaderboard/unban | b | Unban a wallet from every PNL leaderboard |
| pnlLeaderboard | POST /pnl-leaderboard/groups/ban | b | Hide a group from the group PNL leaderboard |
| pnlLeaderboard | POST /pnl-leaderboard/groups/unban | b | Unhide a group from the group PNL leaderboard |
| pnlLeaderboard | GET /pnl-leaderboard/blocklist/mints | | Active PnL-board mint blocklist (pump.competitions.moderate) |
| pnlLeaderboard | POST /pnl-leaderboard/blocklist/mints/add | b | Hide up to 50 mints from every PnL board (pump.competitions.moderate) |
| pnlLeaderboard | POST /pnl-leaderboard/blocklist/mints/remove | b | Unhide up to 50 mints on every PnL board (pump.competitions.moderate) |
| presence | GET /presence/settings | | The caller's presence settings (owner-only) |
| presence | PATCH /presence/settings | b | Update the caller's presence settings (partial: omitted fields keep their stored value). Echoes the post-write stat |
| privyLink | POST /privy-link/import/init | b | Start importing a wallet key into Privy; with the optional x-privy-id-token header, a wallet that Privy user alread |
| privyLink | POST /privy-link/import/submit | b | Submit an HPKE-encrypted wallet key to Privy; a Privy user with two-factor authentication enabled is refused |
| privyLink | POST /privy-link/signup-import/init | b | Start importing a device-minted wallet key into a wallet-less Privy user; authorized by the x-privy-id-token header |
| privyLink | POST /privy-link/signup-import/submit | b | Submit an HPKE-encrypted device-minted wallet key for a wallet-less Privy user; authorized by the x-privy-id-token |
| privyLink | POST /privy-link/export | b | Have Privy export one of the session user's TEE wallets, HPKE-sealed to a recipient key the device minted; authoriz |
| privyLink | GET /privy-link/status | | Whether the session wallet is already a Privy account, and the login method that owns it |
| privyLink | POST /privy-link/finalize | b | Record a completed non-custodial → Privy link |
| privyLink | POST /privy-link/owner-lookup | b | Which Privy login owns each wallet, for wallets whose key the caller proves it holds |
| profiles | POST /profiles/generated-media/seen | | Acknowledge the caller's generated media (clears `unseen` on their own generated-media entry). Once per row: idempo |
| referral | GET /referral/me | q | Referral state of the authenticated user, or of the account named by ?userId (cc user id or wallet): who referred t |
| referral | GET /referral/me/referees | q | The accounts the authenticated user has referred, newest first, one keyset page at a time: each referee's id, curre |
| referral | POST /referral/apply | b | Apply a referral code (the referrer's username) for the authenticated user. Idempotent: a referee who already has a |
| replay | GET /replay | q | A wallet's trades in one coin with the coin card, price history and position after the window |
| retailGrowth | GET /retail-growth/wallets | q | Pump Retail Growth wallets statistic (internal): daily Solana/pump wallet counts with the corrected and excl-Pump d |
| shareVideo | POST /share-video/profile | bm | Composite a shareable profile-card video |
| shareVideo | POST /share-video/pnl | bm | Composite a shareable PnL-card video |
| shareVideo | POST /share-video/replay | b | Start (or fetch a cached) trade-replay render |
| shareVideo | POST /share-video/pack-replay | b | Start (or fetch a cached) pack-opening replay render |
| shareVideo | POST /share-video/scene/{kind} | pb | Start (or fetch a cached) planned scene render |
| shareVideo | GET /share-video/replay/{renderId} | p | Poll a replay render (trade, pack opening or planned scene) |
| solPrice | GET /sol-price | | Get the current SOL price |
| tokenHolders | GET /token-holders/{mint}/count | qp | Get a token's unique holder count: TradeApi GetHolders holder_count, the coin-communities composite |
| topHolders | GET /coins/top-holders-v2/{mint} | qp | A mint's top holders, decorated, and its total holder count |
| trades | GET /trades/wallet/{userId} | qp | A wallet's perp trade history, newest first |
| trades | GET /trades/{chainId}/{address} | qp | A coin's trade tape, newest first |
| userActivity | GET /user-activity/{id} | qp | One page of an account's coin creates and fee claims, newest first, proxied from profile-service — id is a Solana w |
| userPortfolio | GET /user-portfolio/dust-floor | | The authed wallet's dust floor in USD, or null when none is set |
| userPortfolio | POST /user-portfolio/dust-floor | b | Set the authed wallet's dust floor: on the owner's own authed /user-portfolio read (OptionalAuthGuard, JWT wallet = |
| userPortfolio | DELETE /user-portfolio/dust-floor | | Remove the authed wallet's dust floor: every /user-portfolio position serves dustFloorFiltered false again on the o |
| userPortfolio | POST /user-portfolio/spam/{mint} | p | Mark a mint as spam for the authed wallet: its /user-portfolio positions report potentialSpam true (the owner's ver |
| userPortfolio | DELETE /user-portfolio/spam/{mint} | p | Remove the authed wallet's spam mark for a mint: potentialSpam reverts to the scam gate's own verdict (a "not spam |
| users | DELETE /users | | Delete the current user account (Privy dissociation plus the local row); empty 200 |
| users | GET /users/mention-candidates | q | Mention-picker candidates for the @ composer |
| users | GET /users/streaks/leaderboard | q | Get the trading streak leaderboard |
| users | GET /users/{address}/streak | qp | Get trading streak and daily history for a user |
| users | GET /users/{address}/trader-stats | p | Get a wallet's trader stats |
| users | GET /users/{address}/social-stats | p | A wallet's nightly social-engagement stats (profile views, callout engagement, followers) |
| users | GET /users/{id}/socials | p | A user's linked social accounts (X handle + stored X avatar), from coin-communities |
| users | GET /users/{id}/mutual-followers | qp | Accounts the viewer follows that also follow this user ('followed by people you follow'), most-followed first. |
| users | POST /users/achievements/seen | b | Acknowledge the caller's freshly unlocked achievements (clears the 'new badge' dot). Idempotent: already-seen ids a |
| users | POST /users | b | Update the current user profile |
| users | POST /users/profile-image | b | Update profile image |
| users | POST /users/header-image | b | Update profile header image |
| users | POST /users/avatar-decoration | b | Update profile avatar decoration (border effect) |
| users | POST /users/{userAddress}/remove-avatar | p | Admin: remove a user avatar |
| vanityKeys | GET /vanity/random-mint-public-key | | Allocate a random vanity mint public key |
| videos | GET /videos/get-signed-url | q | Get a presigned upload URL for a video |
| walletLabels | PUT /wallet-labels/{wallet} | pb | Set or replace your label for a wallet |
| walletLabels | DELETE /wallet-labels/{wallet} | p | Remove your label for a wallet |
| walletLabels | POST /wallet-labels/batch | b | Batch-resolve label decoration (personal label, global label, registration state) for a page of wallets |
| walletMapping | POST /wallet-mapping/challenge | b | Issue the single-use v2 link message the EVM key signs (EIP-191) before POST /wallet-mapping/link with messageVersi |
| walletMapping | POST /wallet-mapping/link | b | Link an EVM wallet to the caller's account, proven by an EIP-191 signature from the EVM key. The Solana side is alw |
| walletScreening | GET /check/{address} | qp | Screen a wallet address against the blocklist |
| xLink | POST /users/me/x-link-request | b | Queue a request to link an X account to the caller's profile. The caller's Solana wallet address must already appea |
| xLink | GET /users/me/x-link-request | | The caller's X-link request state: what the app shows as pending (a queued request, or a rejected one still inside |
| xLink | POST /groups/{groupId}/x-link-request | pb | Queue a request to link an X account to a squad (owner/admin only). Support links it from the admin panel; one requ |
| xLink | GET /groups/{groupId}/x-link-request | p | A squad's X-link request state (owner/admin only): what the app shows as pending (a queued request, or a rejected o |
| xLink | DELETE /users/me/socials/twitter | | Unlink the caller's X account. Idempotent; refused only when the account has no wallet and X is its last identity a |

The regex catches route keys written as `"METHOD /path":{summary:"…"`. Routes the capture saw that this table lacks
(`GET /home-feed`, `GET /mint-positions/{mint}`, `GET /pnl-leaderboard`, `GET /pnl-leaderboard/top-trader-trades/{mint}`,
`GET /profiles/verified`, `POST /profiles/verified`, `POST /users/batch`, `GET /users/{id}`, `GET /portfolio-summary`,
`GET /user-portfolio/{userId}`, `GET /user-trades/{id}`, `GET /search/resolve`, `GET /users/search-v2`, `GET /groups/*`
members/pnl) are written in the chunk without a summary or in another form, and are listed from the capture and the
typed-client strings instead.

## Second pass (2026-10-28, later the same day): 68 public routes and the error registry

The first regex missed route keys written as `"METHOD /path": publicRead("<scope>", {summary: …})` and keys whose
summary is in single quotes. A second pass over the same chunk found **330 route keys** in total: the 259 above, 67
wrapped in `publicRead` with a double-quoted summary, and 4 with a single-quoted summary, one of which
(`GET /home-feed/new`) is also `publicRead`. That makes **68 public routes**, served on the keyed developer host
`api.pump.fun` under an API scope and on the first-party host as usual. The chunk also holds the error-code registry (106 codes, each with `status`, `owner`, `summary`,
`actionable`, `retryable`), the API scopes, `KEYED_ROUTE_CODES`, and the deprecation rule (`MIN_DEPRECATION_NOTICE_DAYS`
90). Feature pages in [`../features/`](../features/README.md) use the zod schemas behind these routes.

| Scope | Route | Summary (shortened) |
| --- | --- | --- |
| profiles.read | POST /achievements/overlays | Top badge ids for a batch of avatars |
| content.read | GET /callout/list/{userId} | A user's callouts (legacy shape); `window=daily|weekly|monthly|last_round` |
| content.read | GET /callout/leaderboard-stats/{userId} | A user's leaderboard stats |
| content.read | GET /callout/user/{userId}/mint/{coinMint} | A user's callout on a coin; `quotesLimit` adds carousel quotes |
| content.read | GET /callout/coin/{coin} | Top callouts on a coin; `chain=hlcore:*` for perps, also TON, NEAR, Starknet |
| content.read | GET /callout/replies/{replyId}/chain | A reply's ancestor chain |
| content.read | GET /callout/replies/list/{userId} | A user's replies with thread context (ALL, REPLIES, QUOTES) |
| graph.read | GET /callout/replies/{replyId}/likers | Likers of a reply |
| graph.read | GET /callout/replies/{replyId}/reposters | Reposters of a reply |
| content.read | GET /callout/reposts/list/{userId} | A user's reposts |
| content.read | GET /callout/{calloutId}/replies | Replies on a callout |
| graph.read | GET /callout/{calloutId}/likers | Likers of a callout |
| content.read | GET /callout/{calloutId}/tailers | Wallets that tailed a callout |
| graph.read | GET /callout/{calloutId}/reposters | Reposters of a callout |
| content.read | GET /callout/{calloutId}/quotes | Quote posts of a callout |
| content.read | GET /callout/{calloutId} | A callout with its author |
| leaderboards.read | GET /competitions | Upcoming, live and past competitions |
| leaderboards.read | GET /competitions/{idOrSlug} | One competition with its ranked board; `viewer` only when signed in |
| leaderboards.read | GET /competitions/{id}/entries/{entryId} | An entry with its roster snapshot and counted legs |
| leaderboards.read | GET /competitions/{id}/entries/{entryId}/highlights | An entry's top tokens by PnL in the window |
| leaderboards.read | GET /competitions/{id}/entries/{entryId}/positions | An entry's scored legs merged per token |
| leaderboards.read | GET /competitions/{id}/highlights | The biggest winning legs across entries |
| content.read | GET /feed/video-feed | Curated clips and live coins |
| graph.read | GET /following/single/{id} | One follow relationship |
| graph.read | GET /following/v3/followers/{userId} | A page of followers |
| graph.read | GET /following/v3/followers/search/{userId} | Search followers |
| graph.read | GET /following/v3/following/{userId} | A page of followees |
| graph.read | GET /following/v3/following/search/{userId} | Search followees |
| graph.read | GET /following/v3/followers/count/{userId} | Follower count |
| graph.read | GET /following/v3/following/count/{userId} | Following count |
| graph.read | GET /groups/{groupId}/members | A page of a group's members |
| graph.read | GET /groups/{groupId}/members/pnl | Members ranked by windowed PnL |
| content.read | GET /home-feed | Home feed of trending coins and callout positions |
| content.read | GET /home-feed/new | The global "New" callouts feed, newest first |
| leaderboards.read | GET /mayhem/{mint}/top-traders | A Mayhem coin's trader board |
| positions.read | GET /mint-positions/{mint} | Users holding a position in a mint |
| moderation.read | GET /moderation/ban/address/{address} | Whether a wallet is banned |
| leaderboards.read | GET /payouts/leaderboard | Confirmed-payout board (top 500; all-time, 1d, 1w, 1m) |
| leaderboards.read | GET /pnl-leaderboard | PnL board for a period |
| leaderboards.read | GET /pnl-leaderboard/groups | Group PnL board |
| graph.read | GET /pnl-leaderboard/follow-suggestions | Follow suggestions sampled from the PnL board |
| graph.read | GET /pnl-leaderboard/onboarding-suggestions | Scored suggestions for mobile onboarding |
| leaderboards.read | GET /pnl-leaderboard/positions | Position board for a period |
| leaderboards.read | GET /pnl-leaderboard/top-trader-trades/{mint} | A coin's trades by top-50 accounts |
| positions.read | GET /portfolio-summary | Merged Solana + EVM portfolio PnL for a wallet, username, user or group |
| positions.read | POST /portfolio-summary/balances | Balance totals for a page of wallets |
| positions.read | GET /portfolio-summary/chart | Portfolio value series |
| content.read | GET /posts | Posts by id (≤ 100) with one-level embeds |
| content.read | GET /posts/{postId} | One post |
| content.read | GET /posts/{postId}/replies | Live replies, keyset-paged |
| content.read | GET /posts/{postId}/quotes | Live quotes, keyset-paged |
| graph.read | GET /posts/{postId}/likers | Likers, offset-paged |
| graph.read | GET /posts/{postId}/reposters | Reposters, offset-paged |
| profiles.read | GET /users/{id}/overview | Profile header in one read |
| profiles.read | POST /profiles/verified | Verified status for wallets or user ids |
| profiles.read | POST /profiles/generated-media | Verified badge plus generated share media |
| profiles.read | GET /profiles/verified | The ten top daily PnL leaders |
| profiles.read | GET /search/resolve | Classify 1–5 identifiers in one hop |
| positions.read | GET /user-portfolio/{userId} | Whole-portfolio positions with net PnL |
| positions.read | GET /user-positions/{userId} | Position per given mint; a group id serves member aggregates |
| positions.read | GET /user-trades/{id} | An account's trades by wallet, user id or squad id |
| profiles.read | GET /users/{id} | A user by wallet or id |
| profiles.read | GET /users | List users |
| profiles.read | GET /users/search-v2 | Search users |
| profiles.read | POST /users/batch | Users by addresses |
| profiles.read | GET /users/{address}/callout-stats | Callout performance stats |
| profiles.read | GET /users/{address}/achievements | Achievement unlocks and progress |
| profiles.read | GET /users/username-exists/{username} | Username availability |

Single-quoted summaries: `POST /reports` (report a coin, user, callout or reply), `POST /user-portfolio/non-spam/{mint}`
and `DELETE /user-portfolio/non-spam/{mint}` ("not spam" mark), and `GET /home-feed/new` (listed above).
