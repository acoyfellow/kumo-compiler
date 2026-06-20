# Intermediate representation reference

The checked-in contract is `src/kumo/schema.ts`; the materialized catalog is `generated/catalog.ir.json`.

## Version and component

`schemaVersion` is `kumo.ir/v1`. A `ComponentIR` contains `id`, `name`, `family`, `root`, optional `behavior`, optional interaction `policy`, optional `presentation`, normalized source revision, and Vue migration state.

`root` is an element tree or `null`. Nodes are:

- `element`: HTML `tag`, optional primitive `attrs`, optional child nodes
- `text`: string `value`

Attributes are strings, numbers, or booleans. The schema has no arbitrary script node.

## Behavior and policy

Behavior is a closed tagged union covering sensitive toggle, clipboard copy, native checks, roving focus, current links, selection modes, and the rich select/button/dialog/popover models. `InteractionPolicy` records expected state, events, keyboard behavior, ARIA, and `hydration: "ssr-identical"`.

`PresentationModel` records semantic element, variant, constrained layout, state values, and content.

## Provenance

`Provenance` applies to Vue, Svelte, or Solid output and records component, source/IR/emitter hashes, and output hashes. Receipt schemas add proof results; they are documented separately in [manifests](manifests.md).

The current IR contains 41 records. The wider inventory is 45 (41 represented, 2 pending, 2 excluded), but the identities of the latter groups are not authoritative in this revision.
