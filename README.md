# thearena.show

Canonical source for **The Arena — Business Services Trade Show in Dubai**.
The current site release is `v6.08`.

The application uses Next.js and React, is compiled by
[vinext](https://github.com/cloudflare/vinext), and runs as a Cloudflare Worker
with static assets.

## Prerequisites

- Node.js `>=22.13.0`

## Quick Start

```bash
npm ci
npm run dev
```

Use Node.js `22.13.0` or newer. The pinned version is also recorded in `.nvmrc`.

## Project structure

- `app/` — page components and styles
- `public/` — production images, video and static pages
- `worker/` — Cloudflare Worker entry point and API handlers
- `tests/` — server-rendered v6.08 contract tests
- `.github/workflows/` — CI and isolated preview deployment
- `.openai/hosting.json` — legacy Sites project association

## Workspace Auth Headers

OpenAI workspace sites can read the current user's email from
`oai-authenticated-user-email`.

SIWC-authenticated workspace sites may also receive
`oai-authenticated-user-full-name` when the user's SIWC profile has a non-empty
`name` claim. The full-name value is percent-encoded UTF-8 and is accompanied by
`oai-authenticated-user-full-name-encoding: percent-encoded-utf-8`.

Treat the full name as optional and fall back to email when it is absent.

## Checks

- `npm run build` — create the Cloudflare-compatible vinext build
- `npm test` — build and run the rendered-page contract tests
- `npm run lint` — report ESLint findings
- `npm audit --omit=dev --audit-level=high` — audit production dependencies

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md). GitHub deploys only to an isolated
Cloudflare preview Worker; production cutover is deliberately separate.
