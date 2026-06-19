import { Show } from 'solid-js';

export default function Select(p) {
  return <label class="kumo-label">{p.label}<select class="kumo-control" disabled={p.disabled} value={p.value}><Show when={p.placeholder}><option disabled>{p.placeholder}</option></Show><option>Apple</option><option>Banana</option><option>Cherry</option></select><Show when={p.error}><span class="kumo-error">{p.error}</span></Show><Show when={!p.error && p.description}><span class="kumo-description">{p.description}</span></Show></label>;
}
