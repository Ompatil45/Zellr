# deploy-service

Background worker. No HTTP port — it only consumes Redis jobs and talks to R2.

---

## Role in the pipeline

```
BRPOP build-queue 0          # wait for an id (e.g. 6g3xo)
  → download R2 prefix output/{id}/ to local disk
  → cd output/{id} && npm install && npm run build
  → upload local dist/** to R2 as dist/{id}/…
  → HSET status {id} deployed
```

After this, the request-handler can serve:

```
http://6g3xo.zellr.localhost:3001/   →   dist/6g3xo/index.html
```

---

## Build contract

The cloned repo **must**:

1. Be installable with `npm install`
2. Produce a **`dist/`** directory via `npm run build` (Vite / CRA-style)

If the build fails, the queue item is already consumed and status may stay at `uploaded`.

---

## Tech stack

- Node.js worker loop
- Redis (`BRPOP` on `build-queue`)
- AWS SDK → Cloudflare R2
- `child_process` for the build shell

---

## Env

| Variable | Required | Notes |
|----------|----------|-------|
| `REDIS_URL` | yes | Compose: `redis://redis:6379` |
| `ACCESS_KEY_ID` | yes | Same R2 creds as upload-service |
| `SECRET_ACCESS_KEY` | yes | |
| `ENDPOINT` | yes | |
| `R2_BUCKET_NAME` | no | Default `zellr-bucket` |

---

## Run

```bash
npx turbo run dev --filter=deploy-service
# or
docker compose up deploy-service
```

Keep this running alongside upload-service and Redis or jobs will sit forever in `build-queue` with status `uploaded`.
