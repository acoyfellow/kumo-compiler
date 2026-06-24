import crypto from 'node:crypto';

export const SCHEMA_VERSION = 'kumo.lowering-plan/v1';
export const OP_KINDS = Object.freeze(['node.create', 'node.text', 'state.init', 'state.transition', 'portal.mount', 'portal.unmount', 'attribute.set', 'attribute.remove', 'class.add', 'class.remove', 'event.listen']);
const stable = value => JSON.stringify(value, (_key, item) => item && typeof item === 'object' && !Array.isArray(item) ? Object.fromEntries(Object.entries(item).sort(([a], [b]) => a.localeCompare(b))) : item);
export const digest = value => crypto.createHash('sha256').update(typeof value === 'string' ? value : stable(value)).digest('hex');
const sort = values => [...values].sort((a, b) => stable(a).localeCompare(stable(b)));
const op = (kind, part, data = {}) => ({ kind, part, ...data });
const whenCell = sample => ({states:[sample.state],viewports:[sample.viewport]});

function observedOperations(part) {
  if (!part.samples?.length) return [];
  const createWhen=part.presence??null, first=part.samples[0];
  const operations=[op('node.create',part.id,{parent:part.parent??null,order:part.order??first.order??0,tag:part.tag??first.tag,namespace:part.namespace??first.namespace??null,role:part.role??first.role??'generic',semantics:part.semantics??first.semantics??first.tag,explicitPart:part.explicitPart??(part.id.startsWith('part:')?part.id.slice(5):null),when:createWhen})];
  for(const sample of part.samples){
    const when=whenCell(sample);
    operations.push(op('node.text',part.id,{value:sample.text??'',when}));
    for(const [name,attribute] of Object.entries(sample.attrs??{}))operations.push(op('attribute.set',part.id,{name,value:attribute?.value??attribute,valueType:attribute?.type??typeof attribute,when}));
    for(const value of sample.classes??[])operations.push(op('class.add',part.id,{value,when}));
  }
  if(part.portalOwner)operations.push(op('portal.mount',part.id,{target:part.portalOwner,when:createWhen}));
  return operations;
}
function partOperations(part) {
  if(part.samples?.length)return observedOperations(part);
  const kind=part.kind??'element', when=part.presence??null;
  const operations=[op(kind==='text'?'node.text':'node.create',part.id,{parent:part.parent??null,tag:part.tag??null,namespace:part.namespace??null,semantics:part.semantics??'generic',explicitPart:part.explicitPart??(part.id.startsWith('part:')?part.id.slice(5):null),when})];
  for (const binding of part.bindings ?? []) {
    const condition = binding.when ?? when;
    if (binding.type === 'attribute') operations.push(op(binding.remove ? 'attribute.remove' : 'attribute.set', part.id, { name: binding.name, value: binding.value ?? null, when:condition }));
    else if (binding.type === 'class') operations.push(op(binding.remove ? 'class.remove' : 'class.add', part.id, { value: binding.value, when:condition }));
    else if (binding.type === 'event') operations.push(op('event.listen', part.id, { event: binding.event, dispatch: binding.dispatch, when:condition }));
    else if (binding.type === 'portal') operations.push(op(binding.remove ? 'portal.unmount' : 'portal.mount', part.id, { target: binding.target ?? 'document.body', when:condition }));
  }
  return operations;
}

/** Turn any valid part-first component into a target-neutral, state-specialized plan. */
export function lower(ir) {
  const components = sort(ir.components).map(component => {
    const state = component.stateMachine ?? component.states;
    const stateValues = state.states ?? state.values;
    const transitions = state.transitions ?? component.behavior?.map(item => ({ event: item.event, from: item.state, to: item.event?.stateAfter ?? item.state, when:{states:[item.state],viewports:[item.viewport]} })) ?? [];
    const operations = [op('state.init', null, { value: state.initial }), ...sort(transitions).map(transition => op('state.transition', null, transition)), ...sort(component.parts).flatMap(partOperations)];
    const payload = { initialState: state.initial, states: sort(stateValues), viewports:sort(component.viewports??[]), inputs: component.inputs ?? {}, operations };
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
    const payload = { initialState: shard.initialState, states: shard.states, viewports:shard.viewports, inputs: shard.inputs, operations: shard.operations };
    const expected = digest(payload);
    if (shard.contentDigest !== expected || shard.shard !== `sha256-${expected}.json`) errors.push(`${at}: content address mismatch`);
    if (!shard.states?.includes(shard.initialState)) errors.push(`${at}: initial state is undeclared`);
    const nodes=shard.operations?.filter(item=>item.kind==='node.create'||item.kind==='node.text')??[], parts=new Set(nodes.map(item=>item.part));
    for (const [opIndex, operation] of (shard.operations ?? []).entries()) {
      if (!OP_KINDS.includes(operation.kind)) errors.push(`${at}.operations[${opIndex}]: unknown operation`);
      if (operation.part !== null && !parts.has(operation.part)) errors.push(`${at}.operations[${opIndex}]: unknown part`);
      const states=operation.when?.states, viewports=operation.when?.viewports;
      if(states?.some(value=>!shard.states.includes(value)))errors.push(`${at}.operations[${opIndex}]: undeclared condition state`);
      if(viewports?.some(value=>!shard.viewports.includes(value)))errors.push(`${at}.operations[${opIndex}]: undeclared condition viewport`);
    }
    for(const part of parts){const creates=nodes.filter(item=>item.part===part&&item.kind==='node.create');if(!creates.length)continue;const observedStates=new Set((shard.operations??[]).filter(item=>item.part===part&&item.when?.states).flatMap(item=>item.when.states));if(observedStates.size&&observedStates.size<shard.states.length&&creates.some(item=>item.when==null))errors.push(`${at}: subset-state part ${part} lacks presence condition`)}
  }
  const manifest = (plan?.shards ?? []).map(({ key, contentDigest, shard }) => ({ key, contentDigest, shard }));
  if (plan?.manifestDigest !== digest(manifest)) errors.push('manifestDigest mismatch');
  return { valid: errors.length === 0, errors };
}

export { stable };
