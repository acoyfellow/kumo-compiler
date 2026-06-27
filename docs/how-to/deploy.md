# How to deploy the gallery

Goal: publish this gallery / referencer site. It is a fully static site served
by Cloudflare static assets.

## Prerequisites

- A Cloudflare account
- [`wrangler`](https://developers.cloudflare.com/workers/wrangler/) available
  (it runs via `npx`, no global install required)
- Authenticated: `npx wrangler login`

## 1. Review the config

Deployment is configured in [`wrangler.jsonc`](../../wrangler.jsonc):

```jsonc
{
  "name": "kumo-compiler",
  "assets": {
    "directory": "./",
    "not_found_handling": "404-page",
    "html_handling": "auto-trailing-slash"
  },
  "routes": [
    { "pattern": "kumo-compiler.coey.dev", "custom_domain": true }
  ]
}
```

The whole repository root is served as static assets. `.assetsignore` keeps
build-only files (`build.mjs`, `wrangler.jsonc`, `.assetsignore`) out of the
deployed asset set.

## 2. Deploy

From the repository root:

```bash
npx wrangler deploy
```

This uploads `index.html`, `styles.css`, and every compiled cell under
`cells/` to Cloudflare and binds the custom domain.

## 3. Verify

Visit <https://kumo-compiler.coey.dev>. Each tile should render a live
compiled component; open an interactive one (e.g. a `Dialog` or `Select`) to
confirm its overlay works.

## Rebuilding the gallery

The gallery HTML and the per-cell pages are assembled by
[`build.mjs`](../../build.mjs) from the frozen native cells. Re-run it after the
cells change, then deploy:

```bash
node build.mjs
npx wrangler deploy
```
