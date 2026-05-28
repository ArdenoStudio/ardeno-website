# Ardeno Studio | Official Website

Ardeno Studio isn't just a design agency; it’s our vision for a digital landscape that refuses to be boring. We founded this studio to prove that websites shouldn't just be functional—they should be cinematic. This is our home on the web, where we showcase what happens when you combine "quiet luxury" with high-performance engineering.

In this project, we’ve pushed the boundaries of liquid-smooth animations and premium aesthetics to create an experience that feels alive. This is where we share our latest works, from high-end hospitality to elite fitness.

## 👁️ Our Vision
- **No More Templates:** We believe every brand deserves a bespoke digital identity, not a pre-packaged one.
- **Cinematic Detail:** We use depth, grain, and micro-interactions to create a feeling, not just a layout.
- **Performance First:** We demand that our high-fidelity visuals never come at the cost of speed.

## Production Readiness

Run the local release gate before pushing or deploying:

```powershell
npm run verify:local
```

For production deploys, create `.env.deploy.local` from `.env.deploy.example`, then run:

```powershell
npm run deploy:production
```

The deploy script typechecks, runs direct API security tests, scans for secret-shaped tokens, builds, audits production dependencies, pulls Vercel production env metadata, checks required production env vars, deploys, and then runs the live verifier.

Required Vercel production env vars are documented in `.env.example`. After any deployment, `npm run verify:live` must pass against `https://www.ardenostudio.online`.
