# Publish the prepared packages to npm

GitHub Release installation works without npm publication. Public npm publication is optional, but it is required for bare package imports in registry-only tools such as svelte.dev Playground.

## Preflight without publishing

```sh
npm ci
npm run libraries:build
npm run release:npm:preflight
```

This runs `npm publish --dry-run --json --access public` against each exact tarball. It checks package identity, included files, exports, and publish shape. It does not authenticate or publish.

## Confirm namespace authorization

The packages retain these names:

```text
@acoyfellow/kumo-vue
@acoyfellow/kumo-svelte
@acoyfellow/kumo-solid
```

Publish them only while authenticated as the npm account that owns the personal `@acoyfellow` scope. The packages intentionally avoid Cloudflare's npm namespace while preserving canonical `@cloudflare/kumo@2.5.2` provenance inside the project evidence.

## Publish manually

After authenticating:

```sh
npm whoami --registry=https://registry.npmjs.org
npm publish library-artifacts/kumo-vue-0.0.1.tgz --access public
npm publish library-artifacts/kumo-svelte-0.0.1.tgz --access public
npm publish library-artifacts/kumo-solid-0.0.1.tgz --access public
```

Then verify registry metadata, fresh installs, examples, and the svelte.dev Playground import. Never treat the dry run as publication evidence.
