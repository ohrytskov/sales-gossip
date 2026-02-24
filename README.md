# CorpGossip (Sales Gossip)

Live: `https://corpgossip.com`

Anonymous workplace gossip feed built with Next.js, Firebase (Auth + RTDB + Storage), TailwindCSS, and Cloudflare Pages.

## Local development

```bash
yarn
yarn dev
```

## Build

```bash
yarn build:data
yarn build
```

## Deploy (Cloudflare Pages)

```bash
yarn build && yarn export && yarn wrangler-deploy
```

## Configuration

Copy `.env.local.example` to `.env.local` if you need to override endpoints locally.

## Security notes

- Do not commit secrets (`.env.local` is ignored).
- Avoid shipping API keys to the browser. Any 3rd-party API integrations (e.g. OpenAI) should be done server-side.

## License

MIT (see `LICENSE`).
