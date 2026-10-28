# Accounts, identity, sign-in, onramps

## Sign-in moved to Privy

Since 2026-09-25 (15:00 UTC) the web app signs users in with email, Google, Apple or GitHub through **Privy**, the
same as the mobile app; browser-wallet sign-in was retired. An existing wallet account keeps its address by importing
the wallet's private key into Privy ("Link email & socials"); the key is encrypted in the browser and held end-to-end
encrypted by Privy [site-docs wallet-login-changes].

| Point | How it works | Source |
| --- | --- | --- |
| Privy domains | `privy.pump.fun` (CNAME to Privy's API), `privy-wallet.pump.fun` (wallet UI), recovery at `privy.pump.fun/recovery` | [dns] [bundle] |
| Import | `POST /privy-link/import/init` returns a P-256 public key; the browser HPKE-encrypts the wallet key to it; `POST /privy-link/import/submit`; `POST /privy-link/finalize` records the non-custodial → Privy link. An EVM key being imported needs an EIP-191 proof unless it is the account's registered EVM mapping. Refused when the Privy user has 2FA | [contract] |
| Device-minted keys | `signup-import/init|submit` import a key the mobile device minted into a wallet-less Privy user (authorized by the `x-privy-id-token` header) | [contract] |
| Export | `POST /privy-link/export`: Privy exports one TEE wallet HPKE-sealed to a key the device minted | [contract] |
| Ownership | `POST /privy-link/owner-lookup`: which Privy login owns each wallet whose key the caller proves | [contract] |
| 2FA | `webTwoFactorAuth` (2026-10-09) rolls out Privy MFA across pump.fun, privy-wallet.pump.fun and token.pump.fun | [bundle flag registry] |
| Privy's own API | The bundle includes Privy's client for SIWS/SIWE, passkeys, OAuth, Telegram, Farcaster, MFA, embedded wallets, and its onramps (MoonPay, Coinbase, Stripe) | [bundle] |

## Sessions

- `POST /auth/login/session` sets an `auth_token` cookie (needs an `Origin` header); `POST /auth/login/token` returns
  the same JWT as a bearer token; `POST /auth/register` accepts the same signed challenge body when login answers
  `ACCOUNT_NOT_FOUND` [contract].
- The JWT carries a wallet and, once the account exists in `coin-communities`, a **cc user id** claim. Account
  creation in `cc` has a "signup mint budget": under load it is shed (`REGISTER_THROTTLED`) and the session stays
  "claimless" until a retry lands; features that need a user id answer `PROFILE_NOT_MIRRORED`,
  `API_PLATFORM_ACCOUNT_REQUIRED` or `NATS_AUTH_USER_SCOPE_REQUIRED` meanwhile [contract].
- `POST /auth/switch-wallet` re-scopes a session to another linked wallet; `DELETE /users` deletes the account
  (Privy dissociation and the local row) [contract].
- Every request from the web carries `x-pump-source: WEB`, `x-pump-platform: web` and `x-device-id` [bundle].

## Linked identities

| Identity | How it is proven | Source |
| --- | --- | --- |
| EVM wallet | EIP-191 signature over a link message naming the Solana wallet (v2 adds version, audience, nonce, expiry) | [contract] |
| X account | The user puts their Solana address verbatim in the X bio; `POST /users/me/x-link-request` verifies the bio, queues the request, and an admin links it after re-verifying. One request per 7 days; one X account per profile. Squads have the same flow | [contract] |
| X public display | `PUT x/public-display {public}` and `GET x/connection` on livestream-api | [bundle] |

## Profile

`POST /users` (username, bio), profile image, header image, avatar decoration; usernames checked with
`GET /users/username-exists/{username}`, reserved names refused, and a race lost at write time answers
`USERNAME_TAKEN` [contract].

## Onramps and deposits

- The Deposit button opens fiat onramps through Privy: MoonPay (`api.moonpay.com`), Coinbase Onramp and Stripe
  [bundle]. pump.fun's onramp terms put KYC and payments with the provider [site-docs onramp].
- EVM deposits and the bridge go through Relay and `intents.pump.fun`
  ([perps-and-multichain.md](perps-and-multichain.md)).
- The deposit-success screen shows recommended coins (`/coins/recommendations?surface=deposit_success`) [contract].

## Support and messaging

- Intercom: `GET /intercom/hmac` returns the identity and the HMAC to boot the messenger with (identity verification)
  [contract].
- In-app banner (`GET /app-banner`), changelog cards targeted by platform and app version (`GET /changelog`),
  articles from a Strapi CMS (`/articles/*`, with a CMS webhook) [contract].
- Web push through hermes (Firebase installation headers in the bundle) [bundle].
