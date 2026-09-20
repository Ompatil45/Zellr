# upload-service

Accepts a GitHub repo URL, clones it, uploads source to Cloudflare R2, and enqueues a build job.

Locally this is exposed as **`http://localhost:4000`** (host `:4000` → container `:3000`).

---

## Role in the pipeline

```
POST /upload { repoUrl }
  → generate 5-char id (e.g. 6g3xo)
  → git clone into local output/{id}
  → upload files to R2 under output/{id}/
  → HSET status {id} uploaded
  → LPUSH build-queue {id}
  → respond { message, id }
```

The deploy worker picks the id off `build-queue` and continues the pipeline. The dashboard polls `GET /status?id=6g3xo` until status becomes `deployed`.

---

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/upload` | Body: `{ "repoUrl": "https://github.com/org/repo" }`. Returns `{ message, id }`. |
| `GET` | `/status?id={id}` | Returns `{ status }` — `uploaded`, `deployed`, or not found. |

---

## Tech stack

- Express.js
- Redis (`build-queue` list, `status` hash)
- AWS SDK → Cloudflare R2
- simple-git

---

## Env

| Variable | Required | Notes |
|----------|----------|-------|
| `REDIS_URL` | yes | Compose: `redis://redis:6379` |
| `ACCESS_KEY_ID` | yes | R2 S3 API token |
| `SECRET_ACCESS_KEY` | yes | |
| `ENDPOINT` | yes | `https://<ACCOUNT_ID>.r2.cloudflarestorage.com` |
| `R2_BUCKET_NAME` | no | Default `zellr-bucket` |

Copy the repo root [`.env.example`](../../.env.example) to `.env` and fill in the required values.

---

## Run

From the monorepo root (preferred):

```bash
npx turbo run dev --filter=upload-service
```

Or with Docker Compose (binds `127.0.0.1:4000`):

```bash
docker compose up upload-service
```

Requires Redis and R2 credentials. Source lands at R2 prefix `output/{id}/`; the worker later writes `dist/{id}/`.
