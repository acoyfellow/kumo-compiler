import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {digest} from './index.mjs';

export const CONTROLLED_STATE_VERSION = 'kumo.controlled-state/v1';
const here = path.dirname(fileURLToPath(import.meta.url));

export function createControlledState(spec, props = {}) {
  validateControlledStateSpec(spec);
  const controlled = Object.prototype.hasOwnProperty.call(props, spec.controlledProp);
  let internal = Object.prototype.hasOwnProperty.call(props, spec.defaultProp) ? props[spec.defaultProp] : spec.initial;
  return Object.freeze({
    ownership: controlled ? 'controlled' : 'uncontrolled',
    read(nextProps = props) { return controlled ? nextProps[spec.controlledProp] : internal; },
    transition(next, nextProps = props) {
      const previous = controlled ? nextProps[spec.controlledProp] : internal;
      if (!controlled) internal = next;
      return {previous, next, committed: !controlled, event: spec.event, ownership: controlled ? 'controlled' : 'uncontrolled'};
    }
  });
}

export function deriveControlledState(contracts) {
  const byName = new Map(contracts.map(contract => [contract.component, contract]));
  const specs = [];
  for (const name of ['checkbox','switch']) {
    const contract = byName.get(name); if (!contract) throw new Error(`${name} contract required`);
    specs.push({component:name, controlledProp:'checked', defaultProp:'defaultChecked', initial:contract.publicApi.defaults.checked, event:'checked-change', ownership:'property-presence', indeterminate:name === 'checkbox' ? {prop:'indeterminate', initial:false, activationResult:true} : null, disabled:{prop:'disabled', suppresses:['transition','event','focus']}, vectorIds:contract.vectors.map(x=>x.id)});
  }
  const radio = byName.get('radio'); if (!radio) throw new Error('radio contract required');
  specs.push({component:'radio', controlledProp:'value', defaultProp:'defaultValue', initial:null, event:'value-change', ownership:'property-presence', indeterminate:null, disabled:{prop:'disabled', itemProp:'disabled', suppresses:['transition','event','focus']}, vectorIds:radio.vectors.map(x=>x.id)});
  const value = {schemaVersion:CONTROLLED_STATE_VERSION,specs};
  return {...value,capabilityDigest:digest(value)};
}

export function validateControlledStateSpec(spec) {
  if (!spec || !['checked','value'].includes(spec.controlledProp) || !spec.defaultProp || !spec.event || spec.ownership !== 'property-presence') throw new Error('invalid controlled state specification');
  if (!Array.isArray(spec.disabled?.suppresses) || spec.disabled.suppresses.join(',') !== 'transition,event,focus') throw new Error('invalid disabled state semantics');
  return spec;
}
export function validateControlledState(value) {
  if (value?.schemaVersion !== CONTROLLED_STATE_VERSION || !Array.isArray(value.specs) || value.specs.length !== 3) throw new Error('invalid controlled state capability');
  for (const spec of value.specs) { validateControlledStateSpec(spec); if (!spec.component || !spec.vectorIds?.length) throw new Error('controlled state provenance required'); }
  const {capabilityDigest,...unsigned}=value; if (capabilityDigest !== digest(unsigned)) throw new Error('controlled state capability digest mismatch');
  return value;
}
export function loadControlledState(file=path.join(here,'capabilities/controlled-state.json')) { return validateControlledState(JSON.parse(fs.readFileSync(file,'utf8'))); }
