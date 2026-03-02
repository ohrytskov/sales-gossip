# PageSpeed / Lighthouse notes

This repo is meant to be a clean SEO + performance example (SSR + good metadata), while keeping the UI 1:1.

## How to measure (recommended)

Measure **production-like output**, not `yarn dev`.

### Option A: local Worker preview (Cloudflare runtime)

```bash
yarn preview
```

Then run Lighthouse against the preview URL (OpenNext preview usually binds to `http://127.0.0.1:8787`).

### Option B: production (PageSpeed Insights)

Run PageSpeed Insights for:
- `https://corpgossip.com/`
- `https://corpgossip.com/about`
- `https://corpgossip.com/companies`
- `https://corpgossip.com/tags`

## Implemented improvements (high impact)

### SSR for key routes (better crawlability and faster first content)

Key pages render meaningful HTML on the server:
- `/` (`src/pages/index.jsx`)
- `/companies` (`src/pages/companies.jsx`)
- `/tags` (`src/pages/tags.jsx`)
- `/postDetails` (`src/pages/postDetails.jsx`)

The RTDB hook supports SSR hydration to avoid “spinner-first” UX:
- `src/hooks/useRtdbData.js`

### Fonts: faster, more consistent rendering

Google Fonts are preconnected + preloaded and include the required weights to avoid mismatched rendering:
- `src/pages/_document.jsx`

If we want to go further later, we can self-host fonts or migrate to `next/font` to reduce render-blocking CSS.

### Basic regression protection

CI runs:
- `yarn lint`
- `yarn test` (includes robots/sitemap tests)
- `yarn cf:build` (OpenNext build)

Smoke checks validate that core pages have title/description/canonical/OG/Twitter + JSON-LD:
- `tests/puppeteer/smoke.js`

## Next performance steps (prioritized)

1. Image optimization
   - Use `next/image` for hero/marketing images and set `priority` for the single LCP image.
   - Ensure explicit `width`/`height` everywhere to reduce CLS.
2. Reduce main-thread work on long feeds
   - Consider list virtualization or `content-visibility: auto` for below-the-fold cards.
3. Reduce JS on initial routes
   - Ensure heavy editor code (Quill) is only loaded on routes that need it (dynamic import).
4. Edge caching for SSR data
   - Add cache headers where safe (e.g. `/about` can be cached aggressively; feeds can use short TTL + SWR).

## What not to “hide”

Firebase web `apiKey` is not a secret in the browser. It’s an identifier, and security comes from Firebase Auth + Database Rules.
If we add any truly private keys (OpenAI, admin credentials), they must stay server-side (Worker env vars) and never ship to the client.

