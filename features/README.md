# Features beyond create, buy and sell

How each of pump.fun's other features works, read from the API contract (330 routes, 106 error codes), the builder
endpoints and stream client in the web bundle, pump.fun's own docs pages, public page renders and the program IDLs.
Signed out, 2026-10-28. Tags are defined in [../sources.md](../sources.md).

| Feature | One-line mechanism | Page |
| --- | --- | --- |
| Callouts, posts, feeds | A callout is a public call priced at the moment it is made and backed by a held position; `coin-communities` stores it, ranks feeds, and pushes to followers over NATS | [social-and-callouts.md](social-and-callouts.md) |
| Follows, alerts, DMs | Follow graph in `cc`; the live alerts feed is a presence heartbeat that returns a NATS subject; DMs need a mutual follow and ride `dm.user.<uid>` plus web push | [social-and-callouts.md](social-and-callouts.md) |
| Squads and competitions | Groups with roles and seats; competitions snapshot a roster at the start and rank summed PnL "legs" on periodically rebuilt boards | [squads-competitions-leaderboards.md](squads-competitions-leaderboards.md) |
| Leaderboards, streaks, achievements, share videos | Boards built by periodic folds; 46 achievements with live progress; content-addressed video renders | [squads-competitions-leaderboards.md](squads-competitions-leaderboards.md) |
| Creator fees, fee sharing, holder rewards, cashback | On-chain vaults and PDAs plus an off-chain ledger; claims are server-built; holder rewards are paid by a keeper key | [rewards-and-referrals.md](rewards-and-referrals.md) |
| Referrals, callout rewards, PUMP buyback | Username as code, 0.40% fee with a referrer share into an on-chain referral vault; USDC payout rounds; half of revenue buys and burns PUMP | [rewards-and-referrals.md](rewards-and-referrals.md) |
| Perps | Hyperliquid HyperCore through pump.fun's builders; the Privy EVM wallet signs an allowlisted set of EIP-712 actions; Relay moves funds | [perps-and-multichain.md](perps-and-multichain.md) |
| Multichain | 19-chain registry (Solana, 11 EVM chains, HyperCore, TON, NEAR, Starknet); Relay for cross-chain buys; `intents.pump.fun` bridge; EVM wallet linking | [perps-and-multichain.md](perps-and-multichain.md) |
| Limit orders | Swaps presigned against a durable nonce, held and sent by a keeper when market cap crosses the trigger | [trading-tools.md](trading-tools.md) |
| Custom pairs, discovery, portfolio, screening | 226 quote assets; fold-ranked boards; ranking service; scam gate and wallet blocklist | [trading-tools.md](trading-tools.md) |
| Packs and graded cards | Collector Crypt and Phygitals packs bought, opened, sold back and listed through server-built transactions | [packs-mayhem-agents-bounties.md](packs-mayhem-agents-bounties.md) |
| Mayhem, tokenized agents, Go.fun bounties | A 24-hour trading agent with manual and multiplayer triggers; hourly agent buy-and-burn; an escrowed bounty board run by livestream-api | [packs-mayhem-agents-bounties.md](packs-mayhem-agents-bounties.md) |
| Accounts | Privy email/social sign-in since 2026-09-25, HPKE key import, `cc` user ids, X and EVM linking, onramps | [accounts-and-identity.md](accounts-and-identity.md) |
| Developer API | `api.pump.fun` with `pf_live_` keys, six scopes over 68 public routes, an org console with review, rotation and Redis usage | [developer-api.md](developer-api.md) |
| Livestreams, clips, voice rooms | LiveKit rooms named by mint, HLS clips on CloudFront, livechat | [../backend/livestream.md](../backend/livestream.md), [../flows/livestream.md](../flows/livestream.md) |

How the backend behind all of this is likely built is reconstructed in [../reconstruction/](../reconstruction/README.md).

## Rollout timeline from the flag registry

The web bundle ships a registry of 95 rollout flags with creation dates (and owners, not copied here). Grouped by
area, the dates show the order features arrived in 2026 [bundle flag registry]:

| Area | Flags (created) |
| --- | --- |
| Social | `bountyComments` 06-25, `webHermesNotifications` 06-25, `webVoiceChatV2` 07-08, `webUserVoiceRooms` 07-09, `userVideos` 07-09, `xFeaturesEnabled` 08-13, `webDirectMessages` 08-27, `webSquads` 08-27, `natsPerUserAuth` 09-28 |
| Profile and rewards | `webProfileAchievements` 09-21, `webProfilePortfolioChart` 09-21, `webRewardsPage` 09-22, `webProfileReferralsTab` 09-22, `webReferralCodeOnboarding` 09-29, `webAvatarDecorations` 09-30, `webHolderRewardsAscendingFloor` 10-01, `webProfileLeaderboardRank` 10-02 |
| Trading | `homeFeedQuickBuyV3` 07-08, `webBlockchainLimitOrders` 09-01, `webCoinFloatingTrade` 09-09, `webCoinTerminalFrame` 09-09, `webV1Transactions` 09-26, `webSafeMode` 09-30, `webTradeSpotRefresh` 09-30, `ramAndCacheImprovementsForSwaps` 10-13, `webInstantCoinChart` 10-14 |
| Wallets and sign-in | `returningSignIn` 06-15, `webBuyCryptoMoonpay` 05-08, `webWalletAdapterDeprecationNotice` 09-09, `webWalletAdapterCutover` 09-09, `webPrivyWalletMigration` 10-02, `webTwoFactorAuth` 10-09 |
| Streaming data (uapi) | `uapiStreamHeader`, `uapiStreamTape`, `uapiStreamChart`, `uapiStreamLists`, `uapiStreamHolders`, `uapiStreamBoards` 09-30, `webTrendingBoard` 09-25, `portfolioLiveReprice` 10-15, `candlesShadowReadPercent` 10-12 |
| Chains | `webMegaethChain` 10-08, `webXlayerChain` 10-12, `webNearChain` 10-15, `webPolygonChain` 10-16, `webTonChain` 10-16, `webStarknetChain` 10-22, `webArbitrumChain` 10-26, `bridgeStockRegionRouting` 10-15, `bridgeConnectionPoolWarmup` 10-13, `webDepositEvmNetworks` 10-21, `webEvmWithdrawGasTopup` 10-21, `webNativeConvert` 10-21 |
| Perps | `webPerps` 10-07, `webPerpsOptimisticPosition`, `webPerpsPresignEntry`, `webPerpsMarginTopUp` 10-17, `webPerpsCalloutFeed` 10-19, `webPerpsCalloutCompose`, `webPerpsClosePayoutAsset`, `webPerpsVenueSwitch` 10-21, `webPerpsCloseOnFill`, `webPerpsPayoutFastSign`, `webPerpsPayoutBuildFirst`, `webPerpsPresignOpen`, `webPerpsPresignClose`, `webPerpsBridgeRail` 10-27 |
| Other | `webMayhemMultiplayer` 09-17, `webPacks` 10-19, `webPhygitalsMigration` 10-23, `squadCupInterval` 10-26, `blockchainCoinScamBlacklistMints` 09-29, `webModerationLegacyPagesRetired` 09-23, `webExploreSocialTerminal` 09-23 |

Flags are served by LaunchDarkly ([../backend/web-and-edge.md](../backend/web-and-edge.md)); server-side flags
(`uapiCoinLists`, `natsTokenMint`, `calloutVoiceUploads`, `MAYHEM_PARTNER_ROUTES_ENABLED`, …) make routes answer 404
or a "dark" error until they are switched on [contract].
