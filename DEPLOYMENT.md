# Deployment

The repository is the canonical source for `thearena.show`. The application is
Next.js/React compiled by vinext into a Cloudflare Worker plus static assets.

## Continuous integration

`.github/workflows/ci.yml` runs for every pull request and every push to `main`:

1. install the exact `package-lock.json` dependency graph with `npm ci`;
2. build the vinext Worker and run the v6.08 contract tests with `npm test`;
3. fail on high or critical production dependency advisories.

## Preview deployment

Production cutover is intentionally not automatic. The current public domain is
already live through an older Sites/Cloudflare publication, while the local
Sites project identifier is not visible to the currently connected Sites
account. A direct deploy must therefore prove itself under a separate Worker
name before it can replace the live route.

The manual `Deploy Cloudflare preview` workflow deploys
`the-arena-v2-github-preview`. Its generated `dist/server/wrangler.json` has no
custom-domain route, so this workflow cannot take over `thearena.show`.

### One-time GitHub setup

Create the `cloudflare-preview` GitHub Environment and add these environment
secrets:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN` — an account-scoped token with the minimum Workers
  Scripts edit permission required by Wrangler

Do not store either value in source files, workflow YAML, issues, or logs.

### One-time Cloudflare setup

The preview Worker also needs the same runtime integrations as production:

- `WAITLIST_LOG_URL`
- `WAITLIST_LOG_TOKEN`
- `DIDME_LOG_URL`
- `DIDME_LOG_TOKEN`

The repository declares both the generated static-assets binding (`ASSETS`) and
the Cloudflare Images binding (`IMAGES`) in `vite.config.ts`. Images must be
available for the Cloudflare account used by the preview Worker.

Configure these directly as Worker secrets/bindings in Cloudflare. The deploy
workflow uses `--keep-vars` so dashboard-managed variables are retained.

### Run a preview deployment

1. Open **Actions → Deploy Cloudflare preview** in GitHub.
2. Choose **Run workflow** on `main`.
3. Inspect the deployment URL written by the Wrangler action.
4. Verify the landing page, `/api/waitlist`, `/api/didme-counter`, and image
   optimization before considering a production cutover.

## Production cutover

Do not attach `thearena.show` or rename the preview Worker to `the-arena-v2`
until the Cloudflare account, runtime secrets, `IMAGES` binding, and rollback
route have been verified. That cutover is a separate production change; it is
not performed by the preview workflow.
