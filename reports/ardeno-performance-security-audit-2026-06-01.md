# Ardeno Website Performance and Security Audit

Date: 2026-06-01
Scope: current local checkout plus live production at `https://www.ardenostudio.online/`
Mode: single-agent audit using the Codex Security repository-scan guidance where available.

Note: the formal Codex Security repository-wide workflow requires explicitly authorized subagents. The current subagent tool contract only allows spawning when the user explicitly asks for subagents, so this report does not claim a formal multi-agent Codex Security scan.

## Executive Summary

The current Ardeno Website build is in a much stronger security state than the older audit memory. The active serverless routes now have origin checks, body limits, rate limiting, generic provider errors, HTML escaping, Turnstile support, and dedicated API security tests.

The main remaining production concern is performance resilience, not an obvious exploitable security bug. Browser timing on both local preview and live production showed first paint delayed to about 30 seconds when the Google Fonts CSS request timed out. Because the font stylesheet is render-blocking in `index.html`, a third-party font outage or regional connectivity issue can make the site look blank for too long.

## Verification Run

Passed:

- `npm run typecheck`
- `npm run test:api` - 11 API route security checks passed
- `npm run scan:secrets`
- `npm run build`
- `npm run check:seo`
- `npm audit --omit=dev --offline --json` - 0 production vulnerabilities
- `npm run verify:live`
- Live header/API probe:
  - Home returned 200 with CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy, COOP, and Vercel HSTS.
  - `/robots.txt`, `/sitemap.xml`, and `/llms.txt` returned real text/XML, not SPA HTML.
  - `/api/chat` and `/api/send-email` rejected `Origin: https://example.invalid` with 403.

Blocked or degraded:

- Online `npm audit --omit=dev --json` failed with registry `ECONNRESET`; offline audit succeeded with 0 production vulnerabilities.
- Lighthouse ran twice and wrote JSON artifacts, but both runs are invalid because Chrome reported `NO_FCP`. Direct Chrome CDP browser timing was used for performance evidence instead.

Evidence artifacts:

- `reports/lighthouse-local-2026-06-01.json` - invalid Lighthouse run, `NO_FCP`
- `reports/lighthouse-local-retry-2026-06-01.json` - invalid Lighthouse retry, `NO_FCP`
- `reports/browser-perf-metrics-2026-06-01.json` - local Chrome timing/resource evidence
- `reports/browser-live-home-2026-06-01.json` - live Chrome timing/resource evidence
- `reports/browser-home-desktop-2026-06-01.png`
- `reports/browser-home-mobile-2026-06-01.png`
- `reports/browser-faq-desktop-2026-06-01.png`
- `reports/browser-live-home-2026-06-01.png`

## Findings

### P1 Performance - Google Fonts can block first paint for about 30 seconds

Evidence:

- `index.html:108-112` loads Google Fonts as a normal stylesheet.
- `public/founders.html:28-32` uses the same pattern.
- Local Chrome timing: home desktop FCP about 30352 ms, LCP about 34904 ms.
- Local Chrome timing: home mobile FCP about 30232 ms, LCP about 30820 ms.
- Live Chrome timing: production home FCP about 30636 ms, LCP about 31384 ms.
- Browser log on live production: `https://fonts.googleapis.com/...` failed with `net::ERR_TIMED_OUT`.

Impact:

Users in networks where Google Fonts is slow, blocked, or intermittently unavailable may see a blank or near-blank page until the stylesheet request times out. This affects the core landing page and undermines perceived speed even though bundle size is reasonable.

Recommendation:

Self-host the required font files under `public/fonts` and load them via `@font-face`, or change the external font CSS to a non-render-blocking loading strategy with strong system-font fallback. Self-hosting is the more reliable option for a Sri Lanka-focused business site.

### P2 Performance - large PNG logo is fetched on first load

Evidence:

- `index.html:105` declares `/ardeno-logo.png` as the apple touch icon.
- The production browser run fetched `https://www.ardenostudio.online/ardeno-logo.png` at about 387 KB.
- The same file appears as the largest first-page local resource after the font wait.

Impact:

This is unnecessary first-load weight for an icon-class asset. It is not as severe as the font block, but it is easy weight to remove.

Recommendation:

Create a smaller apple touch icon, typically 180x180 PNG, and keep the large 1200-style brand image only for OG/social metadata if needed.

### P2 UX/Performance - cookie banner covers too much of mobile first viewport

Evidence:

- `components/UI/CookieBanner.tsx` renders a large fixed bottom panel.
- The mobile screenshot `reports/browser-home-mobile-2026-06-01.png` shows the banner covering much of the hero CTA/stat area.

Impact:

On mobile, the banner competes with the primary conversion action and makes the first viewport feel cramped. It also causes repeated paint/composition work because of blur, transparency, and animation.

Recommendation:

Use a compact mobile-specific banner: shorter copy, one-line title, tighter buttons, and no heavy blur at small widths. Keep the detailed copy behind a privacy/preferences link or in the docs/privacy section.

### P2 Quality - CookieBanner is mounted twice on standalone routes

Evidence:

- `App.tsx:185` mounts `CookieBanner` inside `pageShell`.
- `App.tsx:271` mounts another `CookieBanner` globally.
- Routes using `pageShell` include FAQ, case studies, brand, and humble beginnings.

Impact:

The visible result currently appears as one banner, but two React components run the same consent/read/timer logic on standalone routes. That is avoidable duplicate work and can become a UI race if the timing diverges.

Recommendation:

Keep one global `CookieBanner` mount and remove the `pageShell` copy, or pass a flag so pageShell does not render it when the global shell is active.

### P3 Local DX/Performance noise - Speed Insights 404s in local preview

Evidence:

- `App.tsx:277` always mounts `<SpeedInsights />`.
- Local preview logs `/_vercel/speed-insights/script.js` as 404, with a console message from Vercel Speed Insights.
- Live production did not show this error in the direct browser run.

Impact:

This is local-preview noise rather than a production bug, but it makes browser/performance testing look dirtier than it needs to be.

Recommendation:

Gate `<SpeedInsights />` to production/Vercel runtime only.

### P3 Shipping hygiene - unused video asset is copied to dist

Evidence:

- `dist/demo-video/ardeno-studio-demo.mp4` is about 28.5 MB after build.
- Current source search found no page reference to `demo-video/ardeno-studio-demo.mp4`.
- `package.json:22-23` only references it as Remotion output.

Impact:

It does not appear to affect first-page network payload, but it bloats deployment output and can increase upload/deploy time or storage footprint.

Recommendation:

Exclude `public/demo-video/ardeno-studio-demo.mp4` from production deployment unless it is intentionally linked from the site. Store the demo video outside `public` or generate it only for campaigns.

## Security Assessment

No active critical or high-confidence exploitable issue was found in the current code during this pass.

Security strengths verified:

- `api/chat.ts` rejects non-POST, disallowed origins, oversized/invalid bodies, and rate-limited clients.
- `api/send-email.ts` rejects disallowed origins, invalid lead payloads, and rate-limited clients.
- `api/send-email.ts` escapes lead HTML before building the Resend email body.
- `api/send-email.ts` removes CR/LF from email subjects.
- `server/request-security.ts` sets `Cache-Control: no-store`, `X-Content-Type-Options: nosniff`, and `Vary: Origin` for API responses.
- `vercel.json` sets a meaningful CSP, clickjacking protection, referrer policy, permissions policy, and long cache headers for immutable assets.
- `scripts/check-production-env.mjs` requires Groq, Resend, allowed origins, Turnstile, and Upstash production environment values.

Residual security risks:

- If production lacks Upstash values despite the checker, rate limiting falls back to in-memory per-instance state and is weaker under serverless scaling.
- If production lacks Turnstile values despite the checker, contact form verification becomes optional. The code handles this intentionally, so production readiness depends on the env gate being enforced before deploy.
- `Access-Control-Allow-Origin: *` appears on static page responses from Vercel. This is not an API data leak by itself because the API routes still enforce origin checks, but it is worth leaving API responses separately controlled.

## Performance Snapshot

Local preview, desktop home:

- FCP: about 30352 ms
- LCP: about 34904 ms
- CLS: 0.0003
- Transfer: about 1035 KB
- Horizontal overflow: false
- Long tasks: 8, about 1289 ms total

Local preview, mobile home:

- FCP: about 30232 ms
- LCP: about 30820 ms
- CLS: 0.0001
- Transfer: about 762 KB
- Horizontal overflow: false
- Long tasks: 5, about 616 ms total

Live production, desktop home:

- FCP: about 30636 ms
- LCP: about 31384 ms
- CLS: 0.0002
- Transfer: about 1044 KB
- Horizontal overflow: false

The very high FCP/LCP numbers in this run are dominated by the Google Fonts timeout. After fonts are fixed, the next meaningful targets are logo/icon weight, mobile cookie banner footprint, and keeping below-fold chunks lazy.

## Recommended Fix Order

1. Self-host fonts or make font CSS non-render-blocking.
2. Replace `/ardeno-logo.png` with a right-sized icon asset.
3. Compact the mobile cookie banner.
4. Remove the duplicate `CookieBanner` mount from `pageShell`.
5. Gate Vercel Speed Insights to production/Vercel runtime.
6. Exclude or relocate the 28.5 MB Remotion demo video from production static output if unused.

