# Add a component

The authoritative identities of the current **2 pending and 2 excluded** inventory entries are pending. Do not add one based only on the 45/41/2/2 totals.

For an approved component:

1. Bind its canonical React export and source bytes in the provenance/audit flow.
2. Add normalized data in `src/kumo/catalog.ts` conforming to `src/kumo/schema.ts`; avoid framework syntax in IR.
3. Extend each applicable emitter and runtime fixture. Preserve SSR/hydration, keyboard, state, and ARIA policy.
4. Add proof expectations and generate receipts for React, Vue, Svelte, and Solid.
5. Run the relevant family proof, `npm test`, and `npm run release:check`.
6. Review generated diffs. Migration status must be receipt-derived; never hand-edit it to claim success.
7. Add the Astro directory grouping/route only after receipts validate.

Component-specific generator commands vary by family; use scripts in `package.json`. There is no single supported `add-component` command at this revision.
