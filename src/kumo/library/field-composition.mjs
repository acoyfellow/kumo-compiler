import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {digest} from './index.mjs';

export const FIELD_COMPOSITION_VERSION = 'kumo.field-composition/v1';
const here = path.dirname(fileURLToPath(import.meta.url));
const CONTRACT_VERSION = 'kumo.observable/v1';
// Components whose canonical contracts establish a Field composition with a focusable, label-associated native control.
export const FIELD_COMPOSITION_COMPONENTS = ['field', 'input', 'input-area'];
const note = (field, reason) => ({field, status: 'unknown', reason});

function provenance(contract) {
  return {
    component: contract.component,
    contractPath: `contracts/kumo.observable/v1/components/${contract.component}.json`,
    contractDigest: digest(contract),
    vectorIds: contract.vectors.map(vector => vector.id)
  };
}

// A control entry describes how a component's Field-composition vector is lowered:
// a container div, a label associated to a focusable native control by id/for,
// where a trusted label click moves focus to the control.
function control(contract, {trigger, root, ownsControl}) {
  const vectors = contract.vectors.filter(vector => trigger(vector.id));
  if (!vectors.length) throw new Error(`${contract.component}: no field-composition vector`);
  return {
    component: contract.component,
    container: 'div',
    control: root,
    ownsControl,
    label: {associates: 'id/for', activatesControl: true, clickFocusesControl: true},
    focus: {target: root, trigger: 'trusted label click'},
    vectors: vectors.map(vector => vector.id)
  };
}

export function deriveFieldComposition(contracts) {
  const byName = new Map(contracts.map(contract => [contract.component, contract]));
  for (const name of FIELD_COMPOSITION_COMPONENTS) {
    if (byName.get(name)?.schemaVersion !== CONTRACT_VERSION) throw new Error(`${name} canonical contract required`);
  }
  const field = byName.get('field'), input = byName.get('input'), area = byName.get('input-area');
  const controls = [
    // Standalone Field wraps a caller-provided native control (Field.NativeInput) by its explicit id.
    control(field, {trigger: id => id === 'optional', root: 'native-input', ownsControl: false}),
    // Input/InputArea render their own native control under a Field wrapper when label is present.
    control(input, {trigger: id => id === 'field-label', root: 'input', ownsControl: true}),
    control(area, {trigger: id => id === 'field-error', root: 'textarea', ownsControl: true})
  ];
  const value = {
    schemaVersion: FIELD_COMPOSITION_VERSION,
    support: 'supported',
    // The observable, asserted behavior across all three vectors.
    behavior: {
      container: 'div',
      labelAssociation: 'id/for',
      labelClickFocusesControl: true,
      ownedControlIdMechanism: 'stable generated id assigned to the native control and referenced by the label for attribute',
      providedControlIdMechanism: 'caller-supplied id on Field.NativeInput referenced by the label for attribute'
    },
    controls,
    // Properties present in fixtures whose exact serialization is not asserted by the canonical vectors.
    unknowns: [
      note('generatedIdValue', 'Canonical vectors assert label-click focus, not the exact generated id string, precedence, or uniqueness policy.'),
      note('describedBySerialization', 'description and error are present in fixtures but their exact aria-describedby id wiring and ordering are not asserted by the canonical expected observations.'),
      note('requiredSerialization', 'required is present in fixtures but exact native required / aria-required serialization is not asserted by the canonical expected observations.')
    ],
    provenance: FIELD_COMPOSITION_COMPONENTS.map(name => provenance(byName.get(name)))
  };
  return {...value, capabilityDigest: digest(value)};
}

export function validateFieldComposition(value) {
  if (value?.schemaVersion !== FIELD_COMPOSITION_VERSION) throw new Error('invalid field-composition capability');
  if (value.support !== 'supported') throw new Error('field-composition must prove supported label-focus behavior');
  if (!Array.isArray(value.controls) || value.controls.map(x => x.component).join(',') !== 'field,input,input-area') throw new Error('field-composition requires field,input,input-area controls');
  for (const control of value.controls) {
    if (!control.vectors?.length) throw new Error(`${control.component}: vector-backed control required`);
    if (control.container !== 'div' || control.label?.associates !== 'id/for' || control.label.clickFocusesControl !== true) throw new Error(`${control.component}: label/for focus association required`);
    if (control.focus?.trigger !== 'trusted label click') throw new Error(`${control.component}: trusted label click focus required`);
  }
  if (!value.behavior || value.behavior.container !== 'div' || value.behavior.labelClickFocusesControl !== true) throw new Error('field-composition behavior must assert label-click focus');
  if (!Array.isArray(value.unknowns) || value.unknowns.some(x => !x.field || x.status !== 'unknown' || !x.reason)) throw new Error('field-composition unknowns must remain explicit');
  const {capabilityDigest, ...unsigned} = value;
  if (capabilityDigest !== digest(unsigned)) throw new Error('field-composition capability digest mismatch');
  return value;
}

export function loadFieldComposition(file = path.join(here, 'capabilities/field-composition.json')) {
  return validateFieldComposition(JSON.parse(fs.readFileSync(file, 'utf8')));
}
