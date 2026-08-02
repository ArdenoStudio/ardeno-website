# Ardeno Website Audit - 2026-05-27

Scope:
- Live site: https://www.ardenostudio.online/
- Local checkout: `C:\Users\suven\Desktop\OneDriveBackupFiles\Documents\ARDENO STUDIO\ardeno-website-main\ardeno-website-main`
- Stack: Vite, React 19, TypeScript, Framer Motion, Vercel serverless API routes.

## Executive Summary

Ardeno Studio presents itself as a premium Colombo/global digital design studio building custom-coded websites, redesigns, portals/systems, and high-polish brand experiences. The live visual direction is strong on desktop: cinematic, premium, dark/red, and differentiated from ordinary local agency templates.

The site is not production-safe enough yet for public lead generation and AI usage. The main risks are not a database/auth breach, because this repo has no database and no auth surface. The main risks are public abuse of paid/serverless endpoints, weak form validation, HTML email injection, missing Vercel security headers, incomplete privacy disclosures, crawl/SEO gaps, and mobile/accessibility defects.

## Current Verification

Commands/checks run:
- `npm run build` - passed.
- `npx tsc --noEmit` - failed.
- `npm audit --omit=dev --json` - passed, 0 production vulnerabilities.
- `npm audit --json` - failed, 9 dev/build-chain advisories, mostly through `@vercel/node`.
- Live `curl -I https://www.ardenostudio.online/` - only HSTS visible among core security headers.
- Live `/robots.txt` and `/sitemap.xml` - both return SPA HTML, not valid robots/sitemap files.
- Lighthouse live mobile - Performance 0.71, Accessibility 0.89, Best Practices 1.00, SEO 0.92.
- Lighthouse live desktop - Performance 0.94, Accessibility 0.89, Best Practices 1.00, SEO 0.92.
- Headless Chrome screenshots captured:
  - `C:\tmp\ardeno-live-desktop-loaded-20260527.png`
  - `C:\tmp\ardeno-live-mobile-loaded-20260527.png`
- Lighthouse JSON artifacts:
  - `C:\tmp\ardeno-lh-mobile-20260527.json`
  - `C:\tmp\ardeno-lh-desktop-20260527.json`

## What The Site Says Ardeno Does

Based on the live render and code content, Ardeno says it:
- Builds premium custom-coded websites and digital systems.
- Does not use WordPress, Wix, Squarespace, page builders, or templates.
- Helps businesses with websites, redesigns, service sites, booking/ecommerce-style experiences, portals, dashboards, and optional smart/AI features.
- Positions around design quality, UX, performance, business credibility, conversions, and brand presence.
- Targets Colombo/Sri Lanka clients but claims global capability.
- Shows six live builds across hospitality, fitness, sports/events, salon/luxury, restaurants, and private aviation.

Recommendation: if the six builds are demos/spec work, label them as "concept builds" or "demo builds". If they are real client work, add proof: client goal, Ardeno role, launch date, measurable result, and testimonial. The current copy can read as real client claims.

## Launch Checklist Mapping

| Checklist item | Current status | Action |
| --- | --- | --- |
| Privacy policy if collecting user data | Exists in Docs, but too thin and partly inaccurate | Update before more lead capture |
| Know where user data is stored | Not fully documented | Map Formspree, Resend, Vercel, Google Analytics, cookies, localStorage, email inbox, Google Drive/Figma/Notion |
| Security headers | Incomplete on live Vercel | Add Vercel headers |
| OWASP basics | Partially okay, but API abuse/input gaps remain | Harden API routes |
| SQL injection | Not applicable: no SQL/database in repo | No action unless backend is added |
| XSS/auth issues | React rendering mostly safe, but email HTML injection exists; no auth | Escape email HTML; no auth testing needed |
| `.env` leakage | No live/dist secret found; stale code has dangerous patterns | Remove stale frontend API-key widget and risky Vite define |
| Sensitive API responses | Mostly generic, but vendor messages/IDs leak some internals | Normalize errors and responses |
| Secrets in logs | Server routes log full provider responses | Redact/minimize logs |
| API keys in frontend | Active widget uses server proxy; stale root widget would expose Groq key if imported | Delete/retire stale root widget; remove Vite GEMINI define |
| Rate limits | None visible | Add rate limits to `/api/chat`, `/api/send-email`, and forms |
| CAPTCHA | None visible | Add Turnstile/hCaptcha to public forms and maybe AI widget |
| CORS restrictions | API does not set CORS; root sends `Access-Control-Allow-Origin: *` | Keep APIs same-origin; remove broad static CORS unless needed |
| Auth failure tests | Not applicable: no auth | Revisit when portal/auth is part of this repo |
| Supabase RLS | Not applicable: no Supabase/database | Revisit if a DB is added |

## Findings

### P0 - Public paid AI endpoint has no abuse protection

Location:
- `api/chat.ts:8-31`
- `components/AI/ArdenoAIWidget.tsx:460-467`

Evidence:
- The public widget posts directly to `/api/chat`.
- The API accepts any `messages` array and forwards it to Groq.
- There is no IP/user rate limit, CAPTCHA, daily cap enforcement, message-count cap, role validation, input length cap, origin check, or server-owned system prompt.

Impact:
- Anyone can script requests to burn Groq/serverless spend.
- Attackers can send arbitrary message arrays, including their own system/developer-like content, because the server trusts the client-sent `messages`.
- Long prompts can increase cost and latency.

Fix:
- Move the system prompt construction fully server-side.
- Accept only a single user message or a strictly validated short conversation schema.
- Add Zod validation with length limits.
- Add IP-based rate limiting, ideally Upstash/Vercel KV/Redis or a Vercel edge/WAF rule.
- Set a daily usage cap in Groq.
- Return generic provider errors.

### P0 - Public email endpoints/forms have no anti-spam controls

Location:
- `api/send-email.ts:8-36`
- `components/FAQ/FAQPage.tsx:176-180`
- `components/Home/ContactModal.tsx:81-88`

Evidence:
- FAQ form posts to `/api/send-email`.
- Contact modal posts directly to Formspree.
- No CAPTCHA/Turnstile, no server rate limit, no length limit, no honeypot, no origin validation, no submission throttling.

Impact:
- Spam can flood the inbox.
- Resend/Formspree usage can be abused.
- Public form endpoints are among the easiest launch-day abuse targets.

Fix:
- Add Cloudflare Turnstile to both public forms.
- Add server-side validation and rate limits.
- Prefer routing all lead capture through one hardened server endpoint instead of direct Formspree from the browser.

### P1 - HTML email injection in FAQ enquiry route

Location:
- `api/send-email.ts:24-32`

Evidence:
- `name`, `email`, and `message` are inserted directly into an HTML email template.
- Only newline replacement is applied to `message`.

Impact:
- Submitted HTML can alter the email body, hide content, insert links, or create phishing-looking messages in the admin inbox.

Fix:
- Validate `name`, `email`, and `message` with Zod.
- Escape HTML before interpolating into the email body.
- Enforce max lengths.
- Validate `reply_to` as a real email.

### P1 - Live Vercel security headers are incomplete

Location:
- `vercel.json:1-5`
- `netlify.toml:49-55`

Evidence:
- Live response has `Strict-Transport-Security` but no visible `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, or `Permissions-Policy`.
- Netlify config defines some headers, but the live site is on Vercel and `vercel.json` only has an SPA rewrite.

Impact:
- We lose browser defense-in-depth against XSS, clickjacking, MIME sniffing, referrer leakage, and unnecessary browser APIs.

Fix:
- Add Vercel `headers` config.
- Start CSP in report-only if needed, then enforce.
- Include GTM/Google Fonts/API endpoints explicitly in CSP.

### P1 - Privacy policy does not match actual data flows

Location:
- `components/Docs/DocsPage.tsx:354-363`
- `components/Home/ContactModal.tsx:60-88`
- `components/FAQ/FAQPage.tsx:176-180`
- `index.html:19-37`
- `components/AI/ArdenoAIWidget.tsx:321-350`

Evidence:
- The policy says data is not shared with third parties.
- The site uses Formspree, Resend, Vercel, Google Analytics, Google Fonts, browser cookies, and localStorage chat history.
- Contact payload includes UTM fields, page URL, referrer, and timestamp.

Impact:
- Legal/compliance risk is real because the site collects names, emails, project details, cookies/UTM, and AI chat content.

Fix:
- Replace the plain-language policy with a real policy covering processors, retention, regions, rights, analytics, cookies, localStorage, contact forms, AI chat, and deletion requests.
- Add a real cookie policy and make the banner visible before optional analytics is activated or document the scroll-triggered banner clearly.

### P1 - Build passes but TypeScript quality gate fails

Location:
- `ArdenoAIWidget.tsx:2-3`
- `components/UI/GlassSurface.tsx:164-186`
- `video/ArdenoWebsiteDemo.tsx:369`

Evidence:
- `npx tsc --noEmit` fails:
  - root `ArdenoAIWidget.tsx` imports `../../ardeno-ai-prompt` and `../../ardeno-ai-context`, which do not resolve from the root file.
  - `GlassSurface.tsx` uses `React.*` types without a namespace import/type import.
  - Remotion sequence tuple uses 3 numbers where a 2-tuple is expected.

Impact:
- The repo can ship while type drift accumulates.
- The duplicate root widget makes audits confusing and can reintroduce frontend API key exposure if someone imports it later.

Fix:
- Remove or exclude the stale root `ArdenoAIWidget.tsx`.
- Add the missing React type import or switch to imported types.
- Fix the Remotion tuple typing.
- Add `typecheck` and `verify` scripts.

### P1 - SEO crawl files are missing and unknown paths return HTML 200s

Location:
- `vercel.json:1-5`
- missing `public/robots.txt`
- missing `public/sitemap.xml`
- missing `public/llms.txt` if you want AI-agent discovery support

Evidence:
- `/robots.txt` returns `text/html` and the app shell.
- `/sitemap.xml` returns `text/html` and the app shell.
- Lighthouse flags invalid robots and llms recommendations.
- Unknown paths like a `.js.map` also return index HTML with 200.

Impact:
- Search crawlers receive invalid crawler directives.
- The SPA fallback can create soft-404/indexing noise.

Fix:
- Add real `robots.txt`, `sitemap.xml`, and optionally `llms.txt`.
- Keep SPA fallback for app routes, but avoid returning HTML 200 for known machine-readable files.

### P2 - Mobile hero copy clips on the right

Location:
- `components/Home/Hero.tsx:481-489`

Evidence:
- Mobile screenshot at 390px shows the paragraph ending as "load fas..." with the right side clipped.

Impact:
- The first viewport feels broken on mobile, even though desktop is visually strong.

Fix:
- Audit the hero layout for overflow and animation transforms.
- Ensure body copy has normal wrapping, `max-width: 100%`, and no parent clipping that cuts text.
- Recheck at 360, 390, 430, and 768 widths.

### P2 - Accessibility failures in project controls and contrast

Location:
- `components/Home/FeaturedWork.tsx:268-284`
- `components/Home/FeaturedWork.tsx:419-462`

Evidence:
- Lighthouse flags project arrow buttons with no accessible name.
- Lighthouse flags low contrast on small category labels.

Impact:
- Screen reader users cannot understand some icon-only project controls.
- Low-contrast 9px/10px text is hard to read.

Fix:
- Add `aria-label` to icon-only buttons.
- Increase contrast and/or size of category/tag text.
- Add a dedicated `npm run a11y` or Lighthouse CI check.

### P2 - Mobile performance is below the standard Ardeno claims

Location:
- `App.tsx:43-50`
- `index.html:19-47`

Evidence:
- Live mobile Lighthouse: Performance 0.71, LCP 4.9s, Speed Index 5.3s, TBT 250ms, main-thread work 3.5s.
- Main app JS is about 440 KB uncompressed, 137 KB gzip.
- Google Tag Manager script downloads about 475 KB resource size.
- Four Google font families/variants are loaded.
- `preloadChunks()` imports many below-fold sections once the sentinel appears.

Impact:
- "Built to load fast" is visible in copy, but mobile lab performance currently undercuts that promise.

Fix:
- Reduce fonts and weights.
- Delay analytics until consent and/or after main content.
- Audit `preloadChunks()` timing.
- Split the AI widget and heavy animation code further.
- Consider self-hosted/subset fonts.

### P2 - Dangerous/stale secret exposure patterns remain in the repo

Location:
- `ArdenoAIWidget.tsx:6`
- `ArdenoAIWidget.tsx:509-515`
- `vite.config.ts:14-16`

Evidence:
- The stale root widget reads `import.meta.env.VITE_GROQ_API_KEY` and sends it to Groq from the browser.
- Vite `define` maps `GEMINI_API_KEY` into client-replaceable `process.env.*` names.
- Current live bundle and `dist` did not contain detected secrets, but the pattern is still unsafe.

Impact:
- Future imports/refactors can accidentally expose secret keys to the browser.

Fix:
- Delete the stale root widget or move it to an archive outside TS/build scope.
- Remove the Vite `define` entries for secret-looking env vars.
- Keep all secret provider calls behind server routes.

### P2 - Dev/build dependency advisories are open

Location:
- `package.json:25-35`
- `package-lock.json`

Evidence:
- `npm audit --omit=dev` is clean.
- Full `npm audit` reports 9 advisories, mostly through `@vercel/node` and transitive packages: `undici`, `path-to-regexp`, `minimatch`, `ajv`, `smol-toml`.

Impact:
- Lower immediate runtime risk than production dependencies, but still build-chain/security debt.

Fix:
- Evaluate whether `@vercel/node` is needed as a dev dependency or can be replaced by type-only declarations.
- Test the semver-major fix path carefully because audit suggests `@vercel/node@4.0.0`.

### P3 - Desktop portal button should use safe new-window behavior

Location:
- `components/Layout/Navbar.tsx:503-508`

Evidence:
- Desktop Portal uses `window.open("https://ardeno-portal.vercel.app", "_blank")`.
- Mobile Portal uses a normal anchor.

Impact:
- `window.open` should explicitly use `noopener,noreferrer` for new tabs.

Fix:
- Use an anchor for desktop too, or call `window.open(url, "_blank", "noopener,noreferrer")`.

## Recommended Improvement Roadmap

### First 1 day: legal/security baseline

1. Add Vercel security headers.
2. Add real `robots.txt`, `sitemap.xml`, and optional `llms.txt`.
3. Harden `/api/send-email` with Zod, HTML escaping, generic errors, and length limits.
4. Harden `/api/chat` with server-owned prompt, schema validation, message limits, and generic errors.
5. Add rate limiting and Turnstile to public forms and AI.
6. Update privacy/cookie policy to match real processors and data flows.

### Next 2-3 days: quality and conversion

1. Fix `tsc --noEmit`.
2. Add `typecheck`, `audit:prod`, and `verify` scripts.
3. Fix mobile hero clipping.
4. Fix Lighthouse accessibility issues.
5. Reduce mobile LCP by trimming font/script load and deferring non-critical JS.
6. Decide whether portfolio items are real client work or concept demos, then label them honestly.

### Brand/content repositioning

1. Keep the premium visual system, but make the proof stronger.
2. Add a first-screen line that says exactly who Ardeno helps: Sri Lankan businesses that need a modern custom website, redesign, or digital system.
3. Convert portfolio cards into proof-led case studies: problem, solution, stack, outcome, live link.
4. Add service pages for:
   - Website redesigns for outdated Sri Lankan businesses.
   - Booking/order/lead systems.
   - AI-assisted lead capture and guided quote flows.
   - Performance/SEO rebuilds.
5. Add trust signals: founder story, process, response time, WhatsApp/email, launch checklist, maintenance plan, post-launch support.

## What From The Vibe-Coder Checklist Applies Here

Applies directly:
- Privacy policy and data-location clarity.
- Security headers.
- OWASP basics.
- Sensitive data/API response review.
- Secret handling.
- API-key server-side proxying.
- Rate limits.
- CAPTCHA on public forms.
- CORS/origin discipline.

Not currently applicable:
- Supabase RLS, because this repo has no Supabase/database.
- SQL injection, because there are no SQL queries.
- Auth failure tests, because this site has no auth flow. The separate portal may need that audit.

Current bottom line:
- The site is a strong visual portfolio shell.
- It is not yet hardened enough to treat the AI assistant and lead forms as public production surfaces.
- The next best move is a small hardening sprint, not a full redesign rewrite.

## Hardening Implementation Status - 2026-05-28

Code-side production hardening completed:

1. Security headers added in `vercel.json`, including CSP, frame blocking, nosniff, referrer policy, permissions policy, and immutable asset caching.
2. Public crawl files added: `public/robots.txt`, `public/sitemap.xml`, and `public/llms.txt`.
3. `/api/chat` now validates request shape and body size, rate limits by IP, rejects unapproved origins, keeps the AI prompt server-side, caps history, and returns generic provider errors.
4. `/api/send-email` now validates and limits lead fields, escapes email HTML, uses a honeypot, supports optional Turnstile verification, rate limits by IP, and avoids returning provider IDs.
5. Contact modal and FAQ form now post to the same hardened server endpoint instead of direct Formspree.
6. Google Analytics now loads only after cookie consent; pre-consent smoke test confirmed no GTM script is injected.
7. Vite no longer maps `GEMINI_API_KEY` into browser-replaceable `process.env` values.
8. `@vercel/node` was removed; API route types are local, and the previous dev audit chain is gone from `package-lock.json`.
9. Typecheck blockers were fixed in `GlassSurface`, the stale root AI widget was deleted, and the Remotion tuple type issue was fixed.
10. Mobile hero width and key project-card accessibility labels/contrast were improved.
11. Privacy policy copy now documents lead data, AI chat flow, Vercel, Resend, analytics consent, Turnstile, browser storage, retention, and deletion requests.
12. `.env.example` documents required production variables without committing secrets.

Verification run:

- `npm run typecheck` - passed.
- `npm run test:api` - passed, 11 API route security checks.
- `npm run scan:secrets` - passed.
- `npm run build` - passed.
- `npm run verify:local` - passed.
- `npm audit --omit=dev --offline` - passed, 0 vulnerabilities.
- `npm audit --offline` - passed, 0 vulnerabilities.
- `node --check scripts/check-production-env.mjs` - passed.
- `node --check scripts/scan-secrets.mjs` - passed.
- `node --check scripts/test-api-routes.mjs` - passed.
- `node --check scripts/verify-production.mjs` - passed.
- PowerShell parser check for `scripts/deploy-production.ps1` - passed.
- `node scripts/check-production-env.mjs` with dummy process-level production values - passed.
- `node scripts/check-production-env.mjs .env.example` - failed as expected because example placeholders do not contain production secrets.
- Online `npm audit --omit=dev` was retried but the npm advisory endpoint returned `ECONNRESET` in this environment.
- Secret-pattern scan over source files found no committed API keys/private keys.
- Local rendered smoke with Playwright over the production build passed:
  - `/` returned 200.
  - `robots.txt` returned `User-agent: *`.
  - `sitemap.xml` includes `https://www.ardenostudio.online/`.
  - `llms.txt` returned `# Ardeno Studio`.
  - Desktop and mobile screenshots were generated in `reports/`.
  - Desktop/mobile scroll width matched viewport width.
  - Icon-only button accessible-name check returned 0 missing labels.
  - Hero image smoke returned 0 broken images when external images were allowed.

Production dashboard/env work still required before final public sign-off:

1. Set Vercel env vars: `GROQ_API_KEY`, `RESEND_API_KEY`, `RESEND_FROM`, `ADMIN_EMAIL`, and `ALLOWED_ORIGINS`.
2. Configure Cloudflare Turnstile and set `TURNSTILE_SECRET_KEY` plus `VITE_TURNSTILE_SITE_KEY`.
3. Configure Upstash Redis and set `UPSTASH_REDIS_REST_URL` plus `UPSTASH_REDIS_REST_TOKEN` for durable rate limits across serverless instances.
4. Set hard usage caps/alerts in Groq/AI provider and Resend dashboards.
5. Redeploy, then rerun live header/Lighthouse checks against `https://www.ardenostudio.online/`.

## Deployment Continuation Status - 2026-05-28

Current live evidence:

- `https://www.ardenostudio.online/` still returns the pre-hardening deployment.
- Live headers are missing the new CSP and `X-Frame-Options`.
- Live `robots.txt`, `sitemap.xml`, and `llms.txt` still return SPA HTML instead of the new static files.

Deployment attempt:

- A clean temporary clone was created from `ArdenoStudio/ardeno-website`.
- The hardening changes were applied and committed locally as `bcf3c37 fix: harden Ardeno website for production`.
- Pushing that commit was blocked because this environment has no usable GitHub push credentials. `git push` with OpenSSL reached GitHub, but with terminal prompts disabled Git reported it could not read a username. `gh auth status` reports the stored `SuvenSeo` token is invalid.
- Vercel CLI is installed, but no `VERCEL_TOKEN` is available, no `.vercel/project.json` exists in this checkout, and the normal Vercel auth path is not writable in this sandbox.
- GitHub connector fallback was also tested after the local Git push failed. The connector can read repository metadata, but GitHub returned `403 Resource not accessible by integration` for create-tree, create-branch, and contents create-file writes.
- Added `scripts/deploy-production.ps1`, `scripts/verify-production.mjs`, `.env.deploy.example`, `.vercelignore`, and `reports/production-deploy-handoff-2026-05-28.md` so the remaining credential-dependent deploy can be run and verified mechanically. `.vercelignore` excludes local reports, generated builds, dependency folders, env files, and tool cache folders from the Vercel upload.
- Added `scripts/check-production-env.mjs` and wired it into `npm run deploy:production` so deployment fails before upload if the pulled Vercel production environment is missing Groq, Resend, allowed origins, Turnstile, or Upstash Redis settings.
- Added `npm run verify:local` as a stable local preflight that uses the offline production dependency audit while keeping the stricter online audit in `npm run verify` and `npm run deploy:production`.
- Added `scripts/test-api-routes.mjs` and wired `npm run test:api` into `npm run verify`, `npm run verify:local`, and `npm run deploy:production`. The harness compiles the API/security TypeScript files into ignored `.tmp/` output and directly tests method/origin rejection, request validation, server-owned AI prompt behavior, provider-key containment, rate limiting, honeypot behavior, Turnstile enforcement, HTML email escaping, and provider ID redaction.
- Added `scripts/scan-secrets.mjs`, wired `npm run scan:secrets` into `npm run verify`, `npm run verify:local`, and `npm run deploy:production`, and added `.github/workflows/production-readiness.yml`. The GitHub Actions workflow runs typecheck, API security tests, production build, online production dependency audit, and secret scan on pull requests and pushes to `main`/`master`; it can also run live production verification manually through `workflow_dispatch`.
- Updated `README.md` with the local release gate, production deploy command, and post-deploy live verification requirement.
- Rechecked live production after the env-gate addition. `node scripts/verify-production.mjs https://www.ardenostudio.online` still fails because the public domain is serving the old deployment, not this hardened checkout.
- `node scripts/verify-production.mjs https://www.ardenostudio.online` currently fails as expected against the old live deployment, catching missing security headers, SPA fallbacks for crawl files, pre-consent GTM HTML, and missing API origin rejection.
- `.vercel-global/` is ignored by Git and excluded from Vercel deployments because the Vercel CLI probe recreated a local auth/cache folder. The sandbox blocked deleting it, but it is no longer stageable or deployable from this checkout.

Next production action:

1. Re-authenticate GitHub CLI or provide a usable GitHub/Vercel token in the environment.
2. Push the local hardening changes to `main` or deploy directly with Vercel.
3. Poll the live site until headers/static crawl files reflect this version.
4. Run the live Lighthouse/header/API smoke checks after deploy.
