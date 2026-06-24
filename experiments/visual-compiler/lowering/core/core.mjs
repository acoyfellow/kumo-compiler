import crypto from 'node:crypto';

export const SCHEMA_VERSION = 'kumo.lowering-plan/v1';
export const OP_KINDS = Object.freeze(['node.create', 'node.text', 'state.init', 'state.transition', 'portal.mount', 'portal.unmount', 'attribute.set', 'attribute.remove', 'class.add', 'class.remove', 'event.listen']);
const stable = value => JSON.stringify(value, (_key, item) => item && typeof item === 'object' && !Array.isArray(item) ? Object.fromEntries(Object.entries(item).sort(([a], [b]) => a.localeCompare(b))) : item);
export const digest = value => crypto.createHash('sha256').update(typeof value === 'string' ? value : stable(value)).digest('hex');
const sort = values => [...values].sort((a, b) => stable(a).localeCompare(stable(b)));
const op = (kind, part, data = {}) => ({ kind, part, ...data });

function partOperations(part) {
  const sample = part.samples?.[0];
  const kind = part.kind ?? (sample?.tag ? 'element' : 'text');
  const operations = [op(kind === 'text' ? 'node.text' : 'node.create', part.id, { parent: part.parent ?? null, semantics: part.semantics ?? sample?.tag ?? 'generic' })];
  for (const binding of part.bindings ?? []) {
    const when = binding.when ?? null;
    if (binding.type === 'attribute') operations.push(op(binding.remove ? 'attribute.remove' : 'attribute.set', part.id, { name: binding.name, value: binding.value ?? null, when }));
    else if (binding.type === 'class') operations.push(op(binding.remove ? 'class.remove' : 'class.add', part.id, { value: binding.value, when }));
    else if (binding.type === 'event') operations.push(op('event.listen', part.id, { event: binding.event, dispatch: binding.dispatch, when }));
    else if (binding.type === 'portal') operations.push(op(binding.remove ? 'portal.unmount' : 'portal.mount', part.id, { target: binding.target ?? 'document.body', when }));
  }
  for (const condition of part.conditions ?? []) operations.push(op('attribute.set', part.id, { name: condition.attribute ?? 'hidden', value: condition.value ?? true, when: condition.when ?? condition }));
  return operations;
}

/** Turn any valid part-first component into a target-neutral, state-specialized plan. */
export function lower(ir) {
  const components = sort(ir.components).map(component => {
    const state = component.stateMachine ?? component.states;
    const stateValues = state.states ?? state.values;
    const transitions = state.transitions ?? component.behavior?.map(item => ({ event: item.event, from: item.state, to: item.event?.stateAfter ?? item.state })) ?? [];
    const operations = [op('state.init', null, { value: state.initial }), ...sort(transitions).map(transition => op('state.transition', null, transition)), ...sort(component.parts).flatMap(partOperations)];
    const payload = { initialState: state.initial, states: sort(stateValues), inputs: component.inputs ?? {}, operations };
    const contentDigest = digest(payload);
    return { key: component.name, contentDigest, shard: `sha256-${contentDigest}.json`, ...payload, provenance: component.provenance ?? {} };
  });
  const manifestPayload = components.map(({ key, contentDigest, shard }) => ({ key, contentDigest, shard }));
  return { schemaVersion: SCHEMA_VERSION, algorithm: 'sha256', manifestDigest: digest(manifestPayload), shards: components };
}

export function validatePlan(plan) {
  const errors = [];
  if (plan?.schemaVersion !== SCHEMA_VERSION) errors.push('invalid schemaVersion');
  if (!Array.isArray(plan?.shards) || !plan.shards.length) errors.push('shards must be a non-empty array');
  const names = new Set();
  for (const [index, shard] of (plan?.shards ?? []).entries()) {
    const at = `shards[${index}]`;
    if (names.has(shard.key)) errors.push(`${at}: duplicate key`); else names.add(shard.key);
    const payload = { initialState: shard.initialState, states: shard.states, inputs: shard.inputs, operations: shard.operations };
    const expected = digest(payload);
    if (shard.contentDigest !== expected || shard.shard !== `sha256-${expected}.json`) errors.push(`${at}: content address mismatch`);
    if (!shard.states?.includes(shard.initialState)) errors.push(`${at}: initial state is undeclared`);
    const parts = new Set(shard.operations?.filter(item => item.kind === 'node.create' || item.kind === 'node.text').map(item => item.part));
    for (const [opIndex, operation] of (shard.operations ?? []).entries()) {
      if (!OP_KINDS.includes(operation.kind)) errors.push(`${at}.operations[${opIndex}]: unknown operation`);
      if (operation.part !== null && !parts.has(operation.part)) errors.push(`${at}.operations[${opIndex}]: unknown part`);
    }
  }
  const manifest = (plan?.shards ?? []).map(({ key, contentDigest, shard }) => ({ key, contentDigest, shard }));
  if (plan?.manifestDigest !== digest(manifest)) errors.push('manifestDigest mismatch');
  return { valid: errors.length === 0, errors };
}

export { stable };
