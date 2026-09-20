# Zellr deployment runbook

This is the implementation guide for evolving Zellr from a static `dist/` host into a framework-aware deployment platform for static sites and dynamic applications.

## Current state

Zellr clones a public GitHub repository, creates a persistent project/release record in Postgres, and queues the release in Redis. Static releases are built and stored in Cloudflare R2; dynamic repositories with a Dockerfile run as Render private services. The wildcard edge looks up the active release and either streams R2 or proxies privately.

Known gaps:

- Dynamic MVP deployments require a repository Dockerfile and a public repository that Render can access.
- Framework support remains intentionally conservative: a repository Dockerfile, Next standalone, and recognized Node server presets are supported.
- Add a rollback endpoint and runtime cleanup job before public multi-tenant traffic.

## Target architecture

```text
GitHub repository
  -> API and deployment registry
  -> isolated build runner
  -> framework detection
       static  -> R2 deployments/{project}/{release}/ -> static handler
       dynamic -> Docker image -> ECR/GHCR -> ECS, Lambda, or Render
  -> registry-backed reverse proxy
  -> Cloudflare wildcard hostname
```

Use a stable project slug for the hostname and a unique release ID for each build. Set a release active only after its upload or runtime health check succeeds. Rollback then switches the active release rather than rebuilding it.

## Framework detection

Detection must be visible, advisory, and user-overridable. Detect from the selected root directory so monorepos work correctly. Use this order: user override, repo Dockerfile, framework config file, `package.json` dependency/script, then a plain-static fallback.

| Signals | Type | Build and output/runtime |
|---|---|---|
| `next.config.*` with `output: 'export'` | Static | install; `npm run build`; `out/` |
| Next.js without static export | Dynamic SSR | Docker; generated image requires `output: 'standalone'` |
| `vite.config.*` or `vite` | Static | install; `npm run build`; `dist/` |
| `react-scripts` | Static | install; `npm run build`; `build/` |
| `astro.config.*` / `astro` | Static unless server adapter | usually `dist/` |
| `gatsby-config.*` / `gatsby` | Static | `public/` |
| `angular.json` / `@angular/core` | Static | parse `angular.json` for `dist/<project>` |
| `svelte.config.*` / `@sveltejs/kit` | Config-dependent | static only with `adapter-static`; otherwise dynamic |
| `nuxt.config.*` / `nuxt` | Config-dependent | generated static output or dynamic `.output` |
| Vue CLI | Static | `dist/` |
| Express, Fastify, Hono, Koa, server start script | Dynamic | Docker image binding `0.0.0.0:$PORT` |
| no package manager/framework | Static | repo root or chosen public folder |

### Detection requirements

1. Prefer a repository Dockerfile for dynamic applications. Never overwrite it.
2. Pick the package manager from its lockfile: `package-lock.json` -> `npm ci`; `pnpm-lock.yaml` -> frozen pnpm; `yarn.lock` -> frozen Yarn; Bun lock -> frozen Bun.
3. Treat Next.js static export and SSR as different deployment types. Warn/fail a generated SSR image if `output: 'standalone'` is absent.
4. Verify the static output directory and `index.html` exist before uploading.
5. Persist framework, confidence/signals, commit SHA, root directory, commands, output directory, package manager, and user overrides with every release.

## Static deployment path

1. Clone the requested commit into an ephemeral build workspace.
2. Install and build with CPU, memory, process, network, and time limits. The runner must have no Docker socket and only a scoped R2 write credential.
3. Validate output and upload each file to `deployments/{projectSlug}/{releaseId}/` in R2 with `Content-Type` and cache headers. Use immutable caching for fingerprinted assets.
4. Atomically activate the release after the complete upload succeeds.
5. Resolve the hostname to the active release, stream R2 responses, rewrite `/` to `index.html`, and use SPA fallback only when explicitly enabled.

## Dynamic deployment path

Dynamic applications need a running process, not an R2 folder:

1. Build from the repository Dockerfile; generate a Dockerfile only for known, supported cases.
2. Push an immutable image digest to ECR or GHCR.
3. Start it on the selected runtime, inject runtime secrets, and require a health check and startup timeout.
4. Save the private upstream target only after it becomes healthy; then activate the release.
5. Keep the previous healthy release available for rollback.

### Generated Next.js SSR image

Use only when the repository has no Dockerfile and `next.config.*` sets `output: 'standalone'`.

```dockerfile
FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-slim AS run
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
USER node
EXPOSE 3000
CMD ["node", "server.js"]
```

For Express/Fastify/Hono/Koa, prefer the repository's Dockerfile. Any future generated template must use production dependencies, bind `$PORT`, run as non-root, and validate the selected start script.

## Runtime choices

| Runtime | Suitable for | Operational guidance |
|---|---|---|
| Render web services | Making Zellr itself live quickly | Deploy dashboard, API, request handler, and worker as separate services. |
| ECS Fargate + ALB | Multi-tenant dynamic containers | Preferred persistent-container path; private upstreams and host routing. |
| Lambda container + Function URL | Request-driven SSR/API | Use for compatible Next.js SSR; avoid persistent connections and long jobs. |
| Render image-backed services | Small managed dynamic fleet | Build `linux/amd64`, push an immutable image, and call deploy hook; one service per project has cost/domain limits. |
| VPS + Docker | Early low-cost environment | Requires strong isolation, quotas, and scheduler work before public builds. |

### Render control-plane deployment

- Create Docker web services for `web`, `upload-service`, and `request-handler`.
- Create `deploy-service` as a background worker.
- Provision Render Postgres and Redis-compatible storage, or connect managed equivalents.
- Store R2, Redis, and other sensitive values as secret environment variables. Configure `NEXT_PUBLIC_*` variables during the web image build.
- Use private service URLs for control-plane communication.
- Do not give the worker a Docker socket or broad cloud credentials. Dynamic user projects should use ECS/Lambda or a deliberately managed image-service model.

## Cloudflare DNS and TLS

Assume `example.com` is the zone and deployment hosts are `slug.deploy.example.com`.

1. Add dashboard and API custom domains, such as `zellr.example.com` and `api.zellr.example.com`.
2. Point `*.deploy.example.com` to the single reverse-proxy ingress, not directly to each user application.
3. For a Render wildcard custom domain, copy the exact records shown by Render: wildcard CNAME, `_acme-challenge` CNAME, and `_cf-custom-hostname` CNAME. The root domain must also point to Render for its wildcard flow.
4. For an ECS/VPS origin, create a wildcard CNAME/A record to the load balancer or ingress.
5. Enable Cloudflare proxying only after domain verification succeeds. Use Full (strict) TLS; Render manages its custom-domain TLS, while a direct origin needs a public certificate or Cloudflare Origin CA.
6. Verify dashboard, API health, static deployment, dynamic deployment, unknown-host response, and SSL mode with `curl -I`.

## Reverse proxy behavior

The proxy must use a deployment registry, not derive routes directly from the first hostname label:

```text
Host: cool-app.deploy.example.com
  -> validate base domain and extract slug
  -> lookup active release in database/Redis cache
  -> STATIC: stream R2 object at active release prefix
  -> DYNAMIC: proxy unchanged path to private runtime upstream
  -> unknown/inactive: 404; unhealthy upstream: 502 or 503
```

Required controls: validate hostnames, preserve forwarding/client-IP headers, add a request ID, use connection/read/write timeouts, cap body size, rate-limit public deployment hostnames, and remove hop-by-hop headers. Lambda Function URLs need origin-host rewriting; host-routed ECS/Render targets should preserve or set the expected `Host` header.

## GitHub Actions and Render deploy hook

Use one deploy mechanism per Render service:

- Render Git integration with **After CI Checks Pass**, or
- GitHub Actions using `RENDER_DEPLOY_HOOK_URL` as a repository secret.

```yaml
name: ci-and-render-deploy
on:
  pull_request:
  push:
    branches: [main]
permissions:
  contents: read
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run build
  deploy:
    needs: test
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Render after CI
        run: curl --fail --silent --show-error -X POST "$RENDER_DEPLOY_HOOK_URL"
        env:
          RENDER_DEPLOY_HOOK_URL: ${{ secrets.RENDER_DEPLOY_HOOK_URL }}
```

For image-backed deployment, build `linux/amd64`, push a commit-SHA/digest image to ECR/GHCR, and call the deploy hook with that immutable reference. Do not use `latest` for releases that need rollback. Use GitHub OIDC for AWS instead of long-lived AWS keys.

## Remaining work

Zellr currently ships the static path only: Redis holds the queue and status, and the edge serves `dist/{id}/` from R2. Everything below is still ahead of us.

- [x] Implement initial framework presets for static builds.
- [ ] Add a Postgres deployment registry and active-release state machine.
- [ ] Add Render Git-backed private-service provisioning for Dockerfile-based dynamic releases.
- [ ] Stream active static R2 releases and route dynamic releases through the registry.
- [ ] Add GHCR image build/push and Render private-service provisioning with health polling.
- [ ] Add per-deployment runtime secret injection, a rollback endpoint, and cleanup of superseded private services/images.
- [ ] Deploy the control plane to Render and complete Cloudflare domain verification.
- [ ] Add GitHub Actions CI plus one deploy trigger.
- [ ] Add observability, audit logging, rate limits, validation, and abuse controls before public repository deployments.

## References

- [Render custom domains](https://render.com/docs/custom-domains)
- [Render Docker deployment](https://render.com/docs/docker)
- [Render deploy hooks](https://render.com/docs/deploy-hooks)
- [Cloudflare wildcard DNS](https://developers.cloudflare.com/dns/manage-dns-records/reference/wildcard-dns-records/)
- [Cloudflare Origin CA](https://developers.cloudflare.com/ssl/origin-configuration/origin-ca/)
