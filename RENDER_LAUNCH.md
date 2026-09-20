# Launch Zellr on Render

## What this Blueprint deploys

`render.yaml` creates four control-plane services in Singapore: the dashboard, upload API, build worker, and wildcard edge handler, plus Render Key Value for the queue and status hash. The three public services get `onrender.com` URLs immediately; attach the branded domains after their first successful deploy.

Import the GitHub repository in **Render → New → Blueprint** and select `render.yaml`. Render prompts for the R2 secrets. Create the R2 bucket and a scoped read/write API token first.

The worker runs user repository builds. Keep this installation private until the worker is isolated with hard CPU, memory, process, and network limits. A normal Render worker is not a safe public multi-tenant build sandbox.

Zellr intentionally has no application login. Before exposing the deployment form or upload API on the public internet, restrict both to your email with Cloudflare Access or an equivalent gateway.

## Local-only hostname setup

This version does not require a purchased domain or public DNS. The local hostnames are:

| Service | Local address |
| --- | --- |
| Dashboard | `http://localhost:3000` |
| Upload API | `http://localhost:4000` |
| Deployed sites | `http://{id}.zellr.localhost:3001` |

Do not add custom domains or wildcard DNS records when running the project locally. The `.localhost` names resolve to the current machine.

## Serving model

The wildcard belongs to `zellr-edge`, not to each deployed site. Zellr only serves static builds: the worker uploads the build output to `dist/{id}/` in R2, and the edge maps the first hostname label to that prefix. There is no database and no per-deployment Render service.

## Go-live checks

1. Add the R2 secrets in Render and redeploy.
2. Start the local services with Docker Compose.
3. Deploy a known Vite repository and check `http://<id>.zellr.localhost:3001/`.
4. Confirm `http://localhost:4000/health` and `http://<id>.zellr.localhost:3001/health` return 200.

The only account-specific inputs still needed are the Render workspace/project authorization, Cloudflare DNS access, and R2 credentials. They must be added in Render/Cloudflare rather than committed to this repository.
