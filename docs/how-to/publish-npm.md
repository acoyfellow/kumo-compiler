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
@cloudflare/kumo-vue
@cloudflare/kumo-svelte
@cloudflare/kumo-solid
```

Only publish them with explicit authorization and an npm identity allowed to publish under `@cloudflare`. If that authorization does not exist, rename the packages and regenerate every receipt, artifact hash, manifest, example lockfile, GitHub release bundle, and documentation reference before publishing.

## Publish manually

After authenticating:

```sh
npm whoami --registry=https://registry.npmjs.org
npm publish library-artifacts/kumo-vue-0.0.1.tgz --access public
npm publish library-artifacts/kumo-svelte-0.0.1.tgz --access public
npm publish library-artifacts/kumo-solid-0.0.1.tgz --access public
```

Then verify registry metadata, fresh installs, examples, and the svelte.dev Playground import. Never treat the dry run as publication evidence.
