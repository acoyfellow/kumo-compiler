# Reproduce evidence

Use a clean worktree and Node 22.

```sh
npm ci
npm test
npm run build:migration-status
git diff --exit-code -- generated/migration-status.json
npm run catalog:validate
npm run release:check
```

For browser evidence across the catalog, the repository exposes:

```sh
npm run proof:catalog-browser
```

This may require browser dependencies and rewrites generated evidence. Framework filtering exists in the underlying script, but only checked-in package scripts are documented as stable commands.

After a run:

1. Inspect `generated/browser-evidence/run-summary.json` and affected receipt paths.
2. Confirm hashes/revisions refer to the inputs actually tested.
3. Compare `git status` and review every generated change.
4. Treat failures or missing evidence as unproved, not as permission to retain an older status.

See [manifests and receipts](../reference/manifests.md) for field meanings and [evidence authority](../explanation/evidence-authority.md) for claim boundaries.
