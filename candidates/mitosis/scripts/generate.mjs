import fs from 'node:fs';
import { parseJsx, componentToReact, componentToVue, componentToSvelte, componentToSolid } from '@builder.io/mitosis';

const components = {
  Button: `export default function Button(props) { return <button type="button" disabled={props.disabled} onClick={() => props.onClick()}>{props.children}</button>; }`,
  Field: `export default function Field(props) { return <label>{props.label}<input value={props.value} onInput={(event) => props.onInput(event.target.value)} /></label>; }`,
  Tabs: `import { useStore } from '@builder.io/mitosis'; export default function Tabs(props) { const state = useStore({ active: 0 }); return <div><div role="tablist">{props.labels.map((label, index) => <button role="tab" aria-selected={state.active === index} onClick={() => state.active = index}>{label}</button>)}</div><div role="tabpanel">{props.labels[state.active]}</div></div>; }`,
  Select: `export default function Select(props) { return <label>{props.label}<select value={props.value} onChange={(event) => props.onChange(event.target.value)}>{props.options.map(option => <option value={option}>{option}</option>)}</select></label>; }`,
  Dialog: `export default function Dialog(props) { return <div role="dialog" aria-modal="true" aria-label={props.title} hidden={!props.open}>{props.children}<button onClick={() => props.onClose()}>Close</button></div>; }`,
  Popover: `import { useStore } from '@builder.io/mitosis'; export default function Popover(props) { const state = useStore({ open: false }); return <div><button aria-expanded={state.open} onClick={() => state.open = !state.open}>{props.label}</button><div hidden={!state.open}>{props.children}</div></div>; }`,
  DatePicker: `export default function DatePicker(props) { return <label>{props.label}<input type="date" value={props.value} onInput={(event) => props.onChange(event.target.value)} /></label>; }`,
};
const targets = {
  react: { extension: 'tsx', generate: componentToReact({ typescript: true }) },
  vue: { extension: 'vue', generate: componentToVue({ typescript: true }) },
  svelte: { extension: 'svelte', generate: componentToSvelte({ typescript: true }) },
  solid: { extension: 'tsx', generate: componentToSolid({ typescript: true }) },
};
const root = new URL('../generated/', import.meta.url);
fs.rmSync(root, { recursive: true, force: true });
for (const [name, source] of Object.entries(components)) {
  const model = parseJsx(source, { typescript: true });
  for (const [target, { extension, generate }] of Object.entries(targets)) {
    const dir = new URL(`${target}/`, root);
    fs.mkdirSync(dir, { recursive: true });
    try {
      // 0.13.2's Transpiler receives TranspilerArgs, not a bare MitosisComponent.
      const output = generate({ component: model, path: `${name}.lite.tsx` });
      fs.writeFileSync(new URL(`${name}.${extension}`, dir), output);
    } catch (error) {
      fs.writeFileSync(new URL(`${name}.blocked.txt`, dir), error.stack ?? String(error));
      process.exitCode = 1;
    }
  }
}
