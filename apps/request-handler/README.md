# request-handler

Serves built static sites from R2 using **subdomain → deployment id** routing.

Listens on **`:3001`**. In production, nginx proxies `*.zellr.nikhilwho.in` here.

---

## How a URL works

Example:

```
http://6g3xo.zellr.nikhilwho.in:3001/
```

(or `https://6g3xo.zellr.nikhilwho.in/` behind nginx)

| Step | Detail |
|------|--------|
| Host | `6g3xo.zellr.nikhilwho.in` |
| ID | First hostname label → `6g3xo` |
| Path `/` | Rewritten to `/index.html` |
| R2 key | `dist/6g3xo/index.html` |
| Response | File bytes + MIME type |

Asset example: `/assets/app.js` → `dist/6g3xo/assets/app.js`.

```
Browser
  │  Host: 6g3xo.zellr.nikhilwho.in
  ▼
nginx (optional)  ──proxy──▶  request-handler :3001
                                  │
                                  │  id = host.split(".")[0]
                                  │  Key = dist/${id}${path}
                                  ▼
                              Cloudflare R2
```

### MIME mapping

| Extension | `Content-Type` |
|-----------|----------------|
| `.html` | `text/html` |
| `.css` | `text/css` |
| `.js` | `application/javascript` |
| other | `application/octet-stream` |

Missing objects surface as a 500 from the S3 error path (not a clean 404 in all cases).

---

## Role in the pipeline

This service does **not** build or upload. It only reads `dist/{id}/…` after the deploy worker has finished and set Redis status to `deployed`.

---

## Tech stack

- Express.js
- AWS SDK `GetObject` → Cloudflare R2

No Redis dependency.

---

## Env

| Variable | Required | Notes |
|----------|----------|-------|
| `ACCESS_KEY_ID` | yes | R2 S3 API token |
| `SECRET_ACCESS_KEY` | yes | |
| `ENDPOINT` | yes | |
| `R2_BUCKET_NAME` | no | Default `zellr-bucket` |

See the repo root [`.env.example`](../../.env.example).

---

## Run

```bash
npx turbo run dev --filter=request-handler
# or
docker compose up request-handler   # 127.0.0.1:3001
```

### Local curl without DNS

```bash
curl -H "Host: 6g3xo.zellr.nikhilwho.in" http://127.0.0.1:3001/
```

That hits the same code path as opening `http://6g3xo.zellr.nikhilwho.in:3001/` when DNS points at your machine.
