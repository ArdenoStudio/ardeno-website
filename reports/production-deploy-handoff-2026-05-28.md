# Ardeno Website Production Deploy Handoff - 2026-05-28

## Current State

- Code-side hardening is implemented in the local checkout.
- Local verification passes: `npm run verify:local`, `npm run test:api`, `npm run scan:secrets`, script syntax checks, and the production environment checker with dummy process-level values.
- Live `https://www.ardenostudio.online` is still the old deployment.
- Live verification currently fails because headers, static crawl files, consent-gated analytics, and API origin rejection are not yet deployed.

## Required Credentials

Create `.env.deploy.local` from `.env.deploy.example` and fill in:

```ini
VERCEL_TOKEN=
VERCEL_ORG_ID=
VERCEL_PROJECT_ID=
```

`VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` are optional if `vercel pull` can link the project interactively. `VERCEL_TOKEN` is required.

## Deploy Command

From the repo root:

```powershell
npm run deploy:production
```

The script runs:

- `npm run typecheck`
- `npm run test:api`
- `npm run scan:secrets`
- `npm run build`
- `npm audit --omit=dev`
- `vercel pull --environment=production`
- `node scripts/check-production-env.mjs .vercel/.env.production.local`
- Vercel production deploy
- live verification against `https://www.ardenostudio.online`

Note: in the Codex sandbox, the online npm audit endpoint repeatedly returned `ECONNRESET`, while `npm audit --omit=dev --offline` passed with 0 vulnerabilities. Rerun the online audit from a normal terminal before deploy if the registry endpoint is reachable there.

The environment checker was also run against `.env.example` and failed as expected because example placeholders do not contain real production secrets.

For local preflight without the npm advisory endpoint, run:

```powershell
npm run verify:local
```

That local preflight now runs TypeScript, direct API security tests, secret scan, production build, and offline production dependency audit.

## Repository Gate

`.github/workflows/production-readiness.yml` runs typecheck, API security tests, production build, online production dependency audit, and secret scan on pull requests and pushes to `main`/`master`. It also has a manual `workflow_dispatch` live-verification job for checking `https://www.ardenostudio.online` after deployment.

## Post-Deploy Proof Required

This command must pass:

```powershell
npm run verify:live
```

It checks:

- CSP, `X-Frame-Options`, `X-Content-Type-Options`, referrer policy, and permissions policy.
- `robots.txt`, `sitemap.xml`, and `llms.txt` are real static files, not SPA HTML.
- Google Analytics is not statically loaded before consent.
- `/api/chat` and `/api/send-email` reject disallowed origins.

`npm run test:api` is a direct local handler harness. It covers API method/origin rejection, request validation, server-owned AI prompt behavior, provider-key containment, rate limiting, honeypot behavior, Turnstile enforcement, HTML email escaping, and provider ID redaction.

## Dashboard Settings Still Needed

Set these in the Vercel project environment:

- `GROQ_API_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM`
- `ADMIN_EMAIL`
- `ALLOWED_ORIGINS`
- `TURNSTILE_SECRET_KEY`
- `VITE_TURNSTILE_SITE_KEY`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Also set provider-level caps and alerts in Groq/AI provider, Resend, and Upstash.

The deploy script now fails before deployment if the pulled Vercel production environment is missing Groq, Resend, allowed origins, Turnstile, or Upstash Redis settings.
