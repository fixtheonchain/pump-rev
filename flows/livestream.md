# Flow: a livestream

Entirely off chain apart from the coin it belongs to. Viewer-side requests were captured. The streamer side was not
exercised (it needs a signed-in, approved creator), so those steps come from the API shapes and are marked.

```mermaid
sequenceDiagram
    autonumber
    actor S as Creator (streamer)
    actor V as Viewer
    participant W as pump.fun web
    participant LS as livestream-api
    participant MS as Media server (room per coin)
    participant LC as livechat (wss)
    participant API as frontend-api-v3
    participant S3 as Recording storage (S3) + HLS

    S->>W: open the coin page, Go live
    W->>LS: GET /livestream/is-approved-creator?mintId
    W->>LS: start a stream (session id, title) [inferred]
    S->>MS: publish audio/video into room = mint [inferred]
    LS-->>API: coin flag is_currently_live, listed in GET /coins/currently-live
    V->>W: open /live or the coin page
    W->>LS: GET /livestream?mintId (current stream)
    V->>MS: subscribe to the room [inferred]
    V->>LC: wss://livechat.pump.fun (chat)
    MS->>S3: record HLS renditions (1080p "high", …) per session
    LS-->>W: GET /clips/{mint}?clipType=COMPLETE|HIGHLIGHT, /clips/{mint}/{clipId} (playlistUrl, variants, thumbnail)
    W->>LS: GET /livestream/history?mintId (past sessions)
    W->>LS: GET /bounties/v2/tasks?coinAddress (stream bounties)
```

| Step | Detail | Source |
| --- | --- | --- |
| Who may stream | `GET /livestream/is-approved-creator?mintId` → `{isApprovedCreator}` | [capture] |
| Live list | `GET frontend-api-v3/coins/currently-live`; `/live` is server-rendered (RSC) and made no client API call | [contract] [capture] |
| Room | `roomName` is the coin's mint; sessions have numeric ids (e.g. 2,612,298) and titles | [capture] |
| Recording | `clipId = <start>:<sessionId>`; HLS `playlistUrl` and `variants[{name, height, playlistUrl, playlistS3Key}]`, `mp4S3Key`, `thumbnailUrl`, `viewCount`, `deletionStatus` | [capture] |
| Chat | `wss://livechat.pump.fun` plus REST on `https://livechat.pump.fun` with the session cookie | [config] [bundle] |
| Moderation | `livestream_ban_expiry` on the coin; clips `hidden` / soft-deleted counts | [capture] |
| Bounties | Tasks per coin with phases `OPEN`, `PENDING_RESOLUTION`, `IN_DISPUTE_PERIOD`, `CLOSED`; page `/bounties/[taskId]` | [capture] [bundle] |
| Media server | Not named in any viewer request. The room/session/S3 vocabulary matches a LiveKit-style service | [inferred] |
