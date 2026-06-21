# Check and apply a Kumo upstream update

This procedure checks `@cloudflare/kumo` without changing the checkout. It does not deploy or publish anything.

## Prerequisites

- Node 22 and npm 11
- system Chrome available to the browser proof
- network access to the npm registry
- a clean worktree

```sh
node --version
npm --version
git status --short
npm ci
```

## Run the checks

Use temporary untracked directories inside the checkout; the scripts reject arbitrary external output paths. Remove the directories after inspection so receipt generation leaves the worktree clean.

```sh
OUT=".upstream-check-$$"
mkdir "$OUT"
node scripts/upstream-check.mjs --from 2.5.1 --to 2.5.2 --scenario real --out "$OUT/real"
node scripts/upstream-check.mjs --from 2.5.1 --to 2.5.2 --scenario synthetic-export-break --out "$OUT/synthetic" || test $? -eq 2
ROLLBACK_OUT=".upstream-rollback-$$"
node scripts/upstream-rollback.mjs --out "$ROLLBACK_OUT"
rm -rf "$ROLLBACK_OUT"
```

The check output may be in system temporary storage. `upstream-rollback` requires its receipt output beneath the repository, so use the temporary path above and remove it afterward. Do not pass `--no-install` for an operator drill: the default performs a real isolated `npm ci --ignore-scripts`. The rollback drill applies 2.5.1 only in a temporary workspace, restores 2.5.2 byte-for-byte, reruns the check, and requires identical output manifests.

## Inspect and rerun

```sh
node -e 'const fs=require("fs"),crypto=require("crypto"); for (const f of process.argv.slice(1)) { const r=JSON.parse(fs.readFileSync(f)); const claimed=r.receiptSha256; delete r.receiptSha256; const sort=v=>Array.isArray(v)?v.map(sort):v&&typeof v==="object"?Object.fromEntries(Object.keys(v).sort().map(k=>[k,sort(v[k])])):v; const actual=crypto.createHash("sha256").update(JSON.stringify(sort(r))).digest("hex"); console.log(f, claimed===actual?"hash-ok":"HASH-FAIL", claimed); }' "$OUT/real/receipt.json" "$OUT/synthetic/receipt.json"
rm -rf "$OUT"
git status --short
```

Run the same commands into fresh output directories. Real and synthetic receipts are deterministic for the same source tree; rollback requires `validation.repeatManifestIdentical: true`. See [upstream receipt reference](../reference/upstream.md) for status interpretation.

## Apply boundary

A passed real receipt is review evidence, not an update. The workflow never edits `package.json`, `package-lock.json`, or selected browser authority. To apply, make a separate reviewed change to the pin and lockfile on the main branch, run the repository's normal proof/release checks, and review generated evidence. Stop before deployment or publication; those are separate authorized procedures.
