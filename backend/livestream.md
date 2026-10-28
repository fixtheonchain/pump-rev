# Livestreaming: livestream-api and livechat

| Host | Role | Source |
| --- | --- | --- |
| `https://livestream-api.pump.fun` | Streams, history, clips, approval, bounties (`livestreamsUrl` in the page config) | [config] [capture] |
| `wss://livechat.pump.fun` | Stream chat over WebSocket; REST on the `https` form of the same host, cookie or bearer auth | [config] [bundle] |
| `frontend-api-v3` `GET /coins/currently-live` | List of live coins | [contract] |
| `/livestream/playlist-map` (path in the bundle) | Playlist lookup for playback | [bundle] |

All three hosts sit behind Cloudflare [dns].

## Endpoints observed (signed out)

| Method | Path | Purpose | Auth | Response shape |
| --- | --- | --- | --- | --- |
| GET | `/livestream?mintId={mint}` | The coin's current stream | none | `""` when offline |
| GET | `/livestream/history?mintId&limit&offset` | Past streams | none | `{items:[{id, streamStartTimestamp, streamEndTimestamp, title}], total}` |
| GET | `/livestream/is-approved-creator?mintId` | Whether the coin's creator may stream | none | `{isApprovedCreator}` |
| GET | `/clips/{mint}?limit&clipType=HIGHLIGHT\|COMPLETE` | Clips and full recordings | none | `{clips:[…], hasMore}` |
| GET | `/clips/{mint}/counts` | Clip counts | none | `{total, hidden, visible, clips, softDeleted}` |
| GET | `/clips/{mint}/{clipId}` | One recording | none | `{roomName: <mint>, clipId: "<start>:<sessionId>", sessionId, startTime, endTime, duration, playlistUrl, variants:[{name:"high", height:1080, playlistUrl, playlistS3Key}], mp4S3Key, thumbnailUrl, playlistS3Key, title, clipType, deletionStatus, viewCount}` |
| GET | `/bounties/v2/tasks?coinAddress&phase=OPEN,PENDING_RESOLUTION,CLOSED,IN_DISPUTE_PERIOD&limit` | Stream bounties on a coin | none | `{items:[…]}` |

[capture 2026-10-28, coin `6xc3RU6U…`]

## How a stream is structured, from these shapes

- One room per coin: `roomName` is the mint [capture].
- Recordings are HLS playlists with renditions (1080p "high" and others), stored under S3 keys
  (`playlistS3Key`, `mp4S3Key`, `thumbnailS3Key`) and served from playlist URLs [capture].
- `clipId` = start timestamp + `sessionId` (`20261028_031719:2612298_20261028_031638`), and `history.items[].id`
  is the session's numeric id (2,612,298) [capture].
- Moderation: coins carry `livestream_ban_expiry`, and recordings carry `hidden` / `deletionStatus` [capture].
- Stream bounties have phases `OPEN`, `PENDING_RESOLUTION`, `IN_DISPUTE_PERIOD`, `CLOSED`; a bounty page lives at
  `/bounties/[taskId]` [capture] [bundle].
- The media server that ingests the stream is not named in any request a signed-out viewer makes. The `roomName`,
  session and S3-recording vocabulary matches a LiveKit-style room service [inferred].

Livestreams are off chain. The chain holds only the coin. See [../flows/livestream.md](../flows/livestream.md).
