# Fan-out worker brief — build ONE overlay component, all 3 frameworks, to full parity

You build ONE component (given) as native Vue + Svelte + Solid packages on Ark/Zag
behavior + Kumo presentation, reaching FULL product parity vs canonical React.
Work ONLY in experiments/fanout/. One writer per path: packages/<fw>/<component>/.

## Proven pattern (mirror dropdown-menu and select exactly)

Reference working examples:
- packages/vue/dropdown-menu/DropdownMenu.vue, packages/solid/dropdown-menu/dropdown-menu.tsx, packages/svelte/dropdown-menu/DropdownMenu.svelte
- packages/vue/select/Select.vue (+ solid/svelte)

Each component wraps the named Ark primitive (@ark-ui/<fw>/<module>) and puts the
canonical Kumo class strings (from substrate/contracts/<component>.json, per part per
state) onto data-part anchors. Rules learned:
- Trigger with canonical classes=[] => UNSTYLED trigger (no class).
- Conditional-mount content matching canonical mount/unmount (e.g. {#if open}).
- Ark MenuSeparator is <hr> (default border) => add `border-0` to separator class.
- If canonical data-part=X is an UNSTYLED role=presentation wrapper with the styled
  element inside, map data-part=X to the wrapper (e.g. positioner) and keep Ark's styled
  element (role=menu/dialog) inside with the classes.
- State-conditional classes: canonical may add classes only in certain states (e.g.
  select disabled adds `opacity-50`). Diff per state and add conditionally.
- Indicator icons (chevron etc.): replicate the exact canonical svg (path, viewBox).
- Value text: match what canonical shows (e.g. select shows raw value not label =>
  itemToString -> value).

## Framework specifics
- Vue: <script setup>, defineProps({state,viewport}), Ark @ark-ui/vue/<module>.
- Solid: export function PascalName(props), Ark @ark-ui/solid/<module>, signals () => props.state.
- Svelte 5: let {state,viewport}=$props(), Ark @ark-ui/svelte/<module>.

## Build + score loop (per framework)
1. Write packages/<fw>/<component>/ source.
2. Capture: node experiments/fanout/jobs/capture-<fw>.mjs <component>
   - If <component> not in the capture STATES map, ADD it (states from the substrate
     contract) to jobs/capture-{vue,svelte,solid}.mjs.
3. Score: node experiments/visual-compiler/results/parity-score.mjs experiments/fanout/outputs/<fw> fanout-<fw>
   - Read the component's byComponent entry; iterate to 9/9.
4. Diagnose any pixel diff with sharp crops (astro/node_modules/sharp): crop the failing
   part region in canonical vs candidate screenshots and LOOK. Every real defect has been
   found this way.

## Hard rules
- NO React runtime (capture selfcheck must show reactRuntime:false).
- Never relax parity-score.mjs / gate.mjs. Web-standard principle: judge focus/transient
  indicators by a11y semantics, not pixel; do not chase cosmetic capture artifacts.
- Never fake captures/selfcheck. If Ark genuinely lacks a needed part, record in
  results/blocked.json with the concrete reason.
- Do NOT touch other components' packages, the visual-compiler exact tier, or protected
  files. Do NOT commit (the orchestrator commits). Do NOT deploy/publish.

## Done
All 3 frameworks at 9/9 for your component (parity-score byComponent shows pass==total).
Report the final per-framework scores.
