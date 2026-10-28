# Media and coin metadata

## Where each kind of file lives

| What | Upload path | Stored at | Served from | Source |
| --- | --- | --- | --- | --- |
| Coin image | `GET frontend-api-v3/ipfs/pinata-presigned` → the browser uploads straight to Pinata with the presigned URL (`pinata` SDK, `upload.public.file(…).url(presigned)`) | IPFS (pinned on Pinata) | `https://pump.mypinata.cloud/ipfs/<cid>` (dedicated gateway, Cloudflare); resized copies at `https://images.pump.fun/{imageType}/{mint}?variant=…` | [bundle] [capture] |
| Coin metadata JSON | same, `upload.public.json(…)` | IPFS; the mint's `uri` is set to `https://ipfs.io/ipfs/<cid>` | any IPFS gateway | [bundle] |
| Image + JSON in one call | `POST frontend-api-v3/ipfs/token-metadata` (multipart) | IPFS | — | [contract] |
| Single file | `POST frontend-api-v3/ipfs/image` (multipart) | IPFS | — | [contract] |
| Coin video | `GET frontend-api-v3/videos/get-signed-url` | S3 (presigned) | the metadata's `video` field "may use S3 URL for video" | [contract] [docs pump-fun-skills `METADATA.md`] |
| Coin banner | `POST frontend-api-v3/coins/add-banner` | — | — | [contract] |
| Profile images, community media | `POST frontend-api-v3/users/profile-image`, `/users/header-image`; callout media `POST /callout/create` (multipart), `/callout/media`, `/callout/voice` | — | `https://socialimages.pump.fun/profile-images/…`, `/community-media/…` (CloudFront `d2u88euyc8uisd.cloudfront.net`) | [contract] [capture] [dns] |
| Stream recordings | — | S3 keys in clip records | HLS playlist URLs | [capture] |
| App images | — | — | `https://pump.fun/_next/image?url=…` (Next.js image optimizer) | [capture] |

`images.pump.fun` is CloudFront (`d39w9554j5ohjb.cloudfront.net`, `X-Cache: Hit from cloudfront`,
`x-amzn-RequestId`, so an AWS service behind it renders the variants). It is the one pump.fun host a plain `curl`
reads without a challenge [headers] [dns].

## Metadata JSON

`{name, symbol, description, image, showName, createdOn: "https://pump.fun", twitter, telegram, website, video}`
[docs github.com/pump-fun/pump-fun-skills `create-coin/references/METADATA.md`]. On chain the same `name`, `symbol` and
`uri` sit in the mint's Token-2022 metadata extension, with no update authority [chain]. See
[../onchain/token-and-modes.md](../onchain/token-and-modes.md).

The API's coin record carries both: `image_uri` and `metadata_uri` as written at creation, plus moderation state
(`nsfw`, `is_banned`, `hidden`, `hide_banner`) and `GET /coins/{mint}/canonical-image` [capture] [contract].
Moderators can delete a coin's photo or banner (`POST /moderation/delete-photo/{mint}`, `/delete-banner/{mint}`). That
changes what pump.fun shows, not the mint's on-chain `uri` [contract] [chain].
