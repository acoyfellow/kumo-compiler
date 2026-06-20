# Deploy

No production deployment procedure is authoritative at this revision.

You may prepare and validate local output:

```sh
npm ci
npm run deploy:prepare
npm run release:check
```

`deploy:prepare` builds runtimes and the benchmark catalog. `wrangler.jsonc` points at `worker.mjs` and `deploy/`, but the repository does not specify a production account, environment, URL, deployment command, approver, or post-deploy checks. Do not guess them or run `wrangler deploy` from this document.

An authorized operator must supply those facts and follow the [deployment runbook](../runbooks/deployment.md). Record artifact revision and receipt set so rollback can select a known predecessor.
