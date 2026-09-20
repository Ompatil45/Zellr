# Launch Zellr on Render

## What this Blueprint deploys

`render.yaml` creates four control-plane services in Singapore: the dashboard, upload API, build worker, and wildcard edge handler, plus Render Key Value for the queue and status hash. The three public services get `onrender.com` URLs immediately; attach the branded domains after their first successful deploy.

Import the GitHub repository in **Render → New → Blueprint** and select `render.yaml`. Render prompts for the R2 secrets. Create the R2 bucket and a scoped read/write API token first.

The worker runs user repository builds. Keep this installation private until the worker is isolated with hard CPU, memory, process, and network limits. A normal Render worker is not a safe public multi-tenant build sandbox.

Zellr intentionally has no application login. Before exposing the deployment form or upload API on the public internet, restrict both to your email with Cloudflare Access or an equivalent gateway.

## Custom domains and wildcard DNS

After all services are healthy, add these domains in Render:

| Render service | Domain |
| --- | --- |
| `zellr-web` | `zellr.nikhilwho.in` |
| `zellr-api` | `api.zellr.nikhilwho.in` |
| `zellr-edge` | `*.zellr.nikhilwho.in` |

For the wildcard domain, copy the exact DNS values displayed by Render into the `nikhilwho.in` DNS zone. Render currently requires all three CNAME records:

| Name | Target |
| --- | --- |
| `*` | the edge service's `onrender.com` hostname |
| `_acme-challenge` | the edge service's `verify.renderdns.com` hostname |
| `_cf-custom-hostname` | the edge service's `hostname.renderdns.com` hostname |

Render also requires the root domain to point to Render for wildcard validation. Since this project uses `*.zellr.nikhilwho.in`, that means `zellr.nikhilwho.in` must be on Render (the dashboard service does this). Do not invent these targets: they are unique per Render service. If Cloudflare manages the zone, begin with DNS-only/gray-cloud records until verification completes; use Full (strict) TLS if Cloudflare remains proxied afterward.

## Serving model

The wildcard belongs to `zellr-edge`, not to each deployed site. Zellr only serves static builds: the worker uploads the build output to `dist/{id}/` in R2, and the edge maps the first hostname label to that prefix. There is no database and no per-deployment Render service.

## Go-live checks

1. Add the R2 secrets in Render and redeploy.
2. Add and verify the three domains above.
3. Deploy a known Vite repository and check `https://<id>.zellr.nikhilwho.in/`.
4. Confirm `https://api.zellr.nikhilwho.in/health` and `https://<id>.zellr.nikhilwho.in/health` return 200.

The only account-specific inputs still needed are the Render workspace/project authorization, Cloudflare DNS access, and R2 credentials. They must be added in Render/Cloudflare rather than committed to this repository.
