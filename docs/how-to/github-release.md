# Distribute the libraries from one GitHub repository

This repository remains the single source repository. GitHub installation uses exact npm tarballs attached to one GitHub Release; npm does not install a package from an arbitrary monorepo subdirectory.

## Prepare the release bundle

```sh
npm ci
npm run libraries:build
KUMO_GITHUB_OWNER=<owner> KUMO_GITHUB_REPO=kumo-compiler npm run release:github
npm run release:github:verify
```

The output is `release/github/libraries-v0.0.1/`:

- `kumo-vue-0.0.1.tgz`
- `kumo-svelte-0.0.1.tgz`
- `kumo-solid-0.0.1.tgz`
- `SHA256SUMS`
- `manifest.json`
- `RELEASE_NOTES.md`

These tarballs are byte-identical to the package artifacts already exercised by the packed consumer proofs.

## Create the GitHub release

After the GitHub remote exists:

```sh
git push origin main
git tag libraries-v0.0.1
git push origin libraries-v0.0.1

gh release create libraries-v0.0.1 \
  release/github/libraries-v0.0.1/kumo-*.tgz \
  release/github/libraries-v0.0.1/SHA256SUMS \
  release/github/libraries-v0.0.1/manifest.json \
  --notes-file release/github/libraries-v0.0.1/RELEASE_NOTES.md
```

Do not rebuild between proof and upload. Upload the checked release directory.

## Install from GitHub

```sh
npm install https://github.com/<owner>/kumo-compiler/releases/download/libraries-v0.0.1/kumo-svelte-0.0.1.tgz
```

Use the corresponding Vue or Solid filename. Pinning the release URL plus npm lockfile integrity gives a reproducible dependency; `SHA256SUMS` independently binds the download bytes.

## Why not `github:<owner>/kumo-compiler#...`?

npm Git dependencies install the package at the repository root. The framework packages live below `dx/packages/`, so the repository root is not any one framework package. Package-root orphan refs are possible but create three parallel release histories. Release tarballs preserve one repository and the exact proven bytes.

## Human-only blockers

The agent can prepare and verify all files. A human must provide the GitHub remote and permission to push/create the release. npm publication is separate and optional.
