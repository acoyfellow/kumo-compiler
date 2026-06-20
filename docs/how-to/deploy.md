# Deploy

Production is `https://kumo-compiler.coey.dev`; external requests are protected by Cloudflare Access.

```sh
npm ci
npm run release:check
npm run deploy:dry-run
npm run deploy                 # authorized operator only
CF_ACCESS_CLIENT_ID=… CF_ACCESS_CLIENT_SECRET=… npm run proof:production
```

`deploy:prepare` builds Astro, replaces `deploy/` from `astro/dist`, and validates the deploy manifest inventory. It does not run proofs or deploy. Preserve the source revision, manifest identity, immutable artifact, receipts, production proof, and predecessor Worker version.

The service token is external secret material. The outstanding operational gate is obtaining an authorized token and completing a live rollback rehearsal. Follow the [deployment runbook](../runbooks/deployment.md).
