# Container images and AWS Kubernetes configuration

The deployment layout follows [the blueprint](../../reconstruction/blueprint.md)
sections 1, 5, 7 and 8. This directory contains container build definitions,
Kubernetes templates, and an environment-driven manifest renderer.

## Images

`images/<name>/Dockerfile` defines an image for each of the twelve Node services,
the holder-rewards keeper, and Rust ingest. The keyed API uses the client-server
image with `node services/client-server/dist/main.js --keyed`. Set
`PUMPSKEL_API_HOST_MODE=keyed` when running that image directly so its health
check selects the keyed port; the Kubernetes renderer sets this value.

Each Node image runs `npm ci`, the workspace build, and `npm prune --omit=dev`
in its build stage. Prisma generation runs during the build without a database
connection. The runtime retains workspace manifests and npm links and runs as
the `node` user. Node images share a full-workspace runtime and differ in their
entry point, allowing Docker to reuse their common build stages.

The ingest image builds the locked crate with `rust:1.99.1-bookworm` and runs
the release binary as an unprivileged user in Debian slim. Its IDLs and replay
fixtures are included in the build context. All images use the backend project root
as their build context; the parent research directory is not required. The
Solana IDL module is included in `packages/solana/src`.

Build images from the backend project root:

```bash
docker build -f infra/images/client-server/Dockerfile -t <registry>/client-server:<tag> .
docker build -f infra/images/ingest/Dockerfile -t <registry>/ingest:<tag> .
```

Use the same form for each image in `k8s/catalog.json`, excluding the keyed alias.
`node infra/images/generate.mjs` regenerates the thirteen Node Dockerfiles from
the shared recipe. The Rust Dockerfile is maintained separately. The manifest
renderer does not build or push images.

## Render configuration

Copy `infra/k8s/deploy.env.example` to `.local/deploy.env`. Set
`PUMPSKEL_APP_ENV_FILE` to an application environment file inside the backend project
with the settings from the root `.env.example`. Keep application secrets in
that ignored file.

The renderer replaces loopback endpoints with Kubernetes service DNS, binds
servers to `0.0.0.0`, enables NATS authentication and secure cookies, and
terminates public TLS at ALB. It clears the gateway's local certificate paths
so ALB forwards private HTTP/WS traffic.

Required inputs include the image registry and tag, release name, hostnames,
ACM certificate, ALB TLS policy and idle timeout, IAM role ARN, external
Postgres, ClickHouse and Redis settings, resource requests and limits,
replicas, probe settings, and Job retry limit. Missing required values stop
rendering. `PUMPSKEL_SERVICE_ROLES_JSON` assigns IAM roles per application and
bootstrap Job; `AWS_SERVICE_ROLE_ARN` supplies a shared fallback. Each workload
has its own ServiceAccount with Kubernetes API token mounting disabled. EKS
node IAM or an existing image-pull Secret supplies registry access.

`PUMPSKEL_RESOURCES_JSON` covers every catalog name and `migrate`,
`provision-bus`, and `replay-fixture`, plus `nats` when using the embedded broker.
Each entry contains `requests.cpu`, `requests.memory`, `limits.cpu`, and
`limits.memory`. `PUMPSKEL_REPLICAS_JSON` covers the catalog. Notify,
holder-rewards, and ingest each support at most one replica. The example uses
one replica for enabled services and zero for live ingest.

Probe settings contain `periodSeconds`, `timeoutSeconds`, `failureThreshold`,
`startupFailureThreshold`, and `terminationGracePeriodSeconds`.
`PUMPSKEL_HEALTHCHECK_TIMEOUT_MS` must be shorter than the Kubernetes probe
timeout. The Node probe uses each service's `/health` endpoint or domain
`Health` RPC. These RPCs are distinct from `grpc.health.v1`. The Rust probe
uses the ingest `health` subcommand. Readiness and liveness use the same
service dependency check.

Validate templates and render manifests:

```bash
node infra/render-deploy.mjs --check
node infra/render-deploy.mjs --env-file .local/deploy.env
```

Rendering writes Kubernetes `List` documents and an index into ignored
`.local/k8s`. These documents contain Secrets. Output contains filenames and
counts without credential values. Environment and key-file inputs must resolve
inside the backend project. `k8s/application-env.json` classifies settings as public
or secret. Regenerate that inventory after changing the root environment example:

```bash
node infra/k8s/build-env-files.mjs
```

## NATS credentials and ingest

Generate NATS credentials and configuration before rendering:

```bash
npm run prepare:nats-auth
```

The renderer splits the generated client manifest and key files into one
Kubernetes Secret per service identity. Application pods receive only their own
credentials. The BFF receives the account issuer seed used to mint user grants.
The auth worker receives its bootstrap identity, issuer, and curve key. The
provisioning Job receives the maintenance identity. A file-based signer mounts
its configured keypair only into the holder-rewards keeper; set
`PUMPSKEL_HOLDER_SIGNER_FILE` when selecting that adapter.

`PUMPSKEL_NATS_MODE=embedded` renders a private NATS 2.11 StatefulSet with
persistent JetStream storage. Configure an existing EBS storage class and
volume size. EBS CSI and the AWS Load Balancer Controller are prerequisites.
The embedded broker uses one node. `external` selects a broker configured with
the same accounts, exports, callout keys, and service credentials.
`PUMPSKEL_NATS_PUBLIC_URL` is the client-reachable NATS endpoint returned by the
BFF. Its transport and TLS configuration is separate from the HTTP ALB; the
embedded broker has no public ingress in these manifests.

The ingest Deployment uses `INGEST_SOURCE=geyser`. Enabling a replica requires
endpoint and token Secrets, queue and frame limits, and an asset metadata JSON
file shaped as `{ "assets": { ... }, "pools": { ... } }`. The renderer mounts
metadata as a ConfigMap. Rendering does not contact RPC or Geyser endpoints.
The fixture replay Job is suspended and finite, so replay completion does not
restart a Deployment.

## Manifest layout

Generated documents group namespace creation, configuration and Secrets,
optional NATS, bootstrap Jobs, application workloads and Services, ALB ingress,
network policy, and fixture replay. `manifest-index.json` lists each document.
The namespace is `pumpfun-skeleton`; pods select nodes in `us-east-1`.

Deployment order is namespace and configuration, broker, bootstrap Jobs, then
applications. The migration Job applies Postgres and ClickHouse migrations;
migrations do not run during image builds. Bus provisioning preserves existing
subjects and creates the three application streams, including the notify
consumer's DM family. Both bootstrap Jobs must complete before applications
start. Job names include the configured release suffix.

The ALB routes `https://<BFF host>/stream` as WSS to stream-gateway, other BFF
paths to client-server, and the keyed hostname to its separate Deployment.
Ports 4345, 4353, and 4346 accept ingress from outside the namespace. Internal
gRPC and domain HTTP services use ClusterIP Services. Egress and managed-store
access use the cluster's VPC policies and security groups.

Media, escrow, push, bridge, and transaction integrations use their configured
adapters. The local adapters provide fixture behavior. External endpoints,
trust settings, signing authority, and resource limits come from environment
configuration.
