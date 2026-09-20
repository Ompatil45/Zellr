# web

Minimal Next.js landing for Zellr. Use the deployment form on `/#deploy`, paste a public GitHub URL, watch status, and open the live subdomain when deployment finishes. There is no application login or GitHub OAuth flow.

Local dashboard: **`http://localhost:3000`**.

---

## What it does

1. `POST ${NEXT_PUBLIC_UPLOAD_API_URL}/upload` with `{ repoUrl }`
2. Receives `{ id }` (e.g. `6g3xo`)
3. Polls `GET …/status?id={id}` every 2 seconds
4. When status is `deployed`, shows:

```
http://{id}.{NEXT_PUBLIC_SITE_DOMAIN}:3001
```

With defaults that is `http://6g3xo.zellr.localhost:3001`.

The page itself does not serve the deployed site — that is the request-handler on `{id}.zellr.localhost:3001`.

---

## Env (build-time)

These are baked into the Next.js client bundle:

| Variable | Example | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_UPLOAD_API_URL` | `http://localhost:4000` | Upload / status API |
| `NEXT_PUBLIC_SITE_DOMAIN` | `zellr.localhost` | Live link domain |

Local Docker Compose often uses:

```bash
NEXT_PUBLIC_UPLOAD_API_URL=http://localhost:4000
NEXT_PUBLIC_SITE_DOMAIN=zellr.localhost
```

See root [`.env.example`](../../.env.example). Compose passes these as Docker build args.

---

## Tech stack

- Next.js (App Router)
- React, TypeScript, Tailwind
- Axios for upload + status polling
- `next-themes` for dark / light mode

Main UI: `app/page.tsx` and `components/Deploy.tsx`. Legacy dashboard URLs redirect to `/#deploy`.

---

## Run

```bash
npx turbo run dev --filter=web
# or
docker compose up web
```

Open http://localhost:3000. Upload-service (and deploy-service + Redis + R2) must be reachable for a real deploy.
