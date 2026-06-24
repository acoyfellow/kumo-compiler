#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { lower, validatePlan, stable } from './core.mjs';
import { guardSource } from './guard.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));
const fixture = JSON.parse(fs.readFileSync(path.resolve(here, '../../ir/fixtures/components.json'), 'utf8'));
const ids = { componentIds: fixture.components.map(item => item.name), partIds: [...new Set(fixture.components.flatMap(item => item.parts.map(part => part.id)))] };
const one = lower(fixture), two = lower(JSON.parse(JSON.stringify(fixture)));
assert.equal(stable(one), stable(two), 'lowering must be deterministic');
assert.deepEqual(validatePlan(one), { valid: true, errors: [] });
assert.equal(guardSource("if (component === 'button') emit()", ids).valid, false);
assert.equal(guardSource(`switch (part) { case ${JSON.stringify(ids.partIds.find(id=>id.includes('control')))}: emit() }`, ids).valid, false);
assert.equal(guardSource('for (const component of components) emit(component)', ids).valid, true);
const kinds = new Set(one.shards.flatMap(shard => shard.operations.map(operation => operation.kind)));
for (const required of ['state.init', 'state.transition', 'node.create', 'node.text', 'attribute.set', 'class.add']) assert(kinds.has(required));
const shard=name=>one.shards.find(item=>item.key===name), component=name=>fixture.components.find(item=>item.name===name), matches=(when,state,viewport)=>!when||when.states?.includes(state)||when.cells?.some(cell=>cell.state===state&&(!viewport||cell.viewport===viewport)), creates=(name,state,viewport=390)=>shard(name).operations.filter(item=>item.kind==='node.create'&&matches(item.when,state,viewport)).map(item=>item.part);
const onlyIn=(name,state)=>component(name).parts.filter(part=>new Set(part.samples.map(sample=>sample.state)).size===1&&part.samples[0]?.state===state).map(part=>part.id);
const loadingOnly=onlyIn('button','loading');assert(loadingOnly.length);for(const id of loadingOnly){assert(!creates('button','default').includes(id));assert(creates('button','loading').includes(id))}
assert(shard('checkbox').operations.some(item=>item.kind==='attribute.set'&&item.name==='aria-checked'&&matches(item.when,'checked')));
const errorOnly=onlyIn('field','error');assert(errorOnly.length);for(const id of errorOnly)assert(creates('field','error').includes(id));
const openOnly=onlyIn('popover','open');assert(openOnly.length);for(const id of openOnly){assert(!creates('popover','closed').includes(id));assert(creates('popover','open').includes(id))}
const bad=structuredClone(one), button=bad.shards.find(item=>item.key==='button'), creation=button.operations.find(item=>item.kind==='node.create'&&item.when);creation.when=null;const payload={initialState:button.initialState,states:button.states,viewports:button.viewports,inputs:button.inputs,operations:button.operations};button.contentDigest=(await import('./core.mjs')).digest(payload);button.shard=`sha256-${button.contentDigest}.json`;bad.manifestDigest=(await import('./core.mjs')).digest(bad.shards.map(({key,contentDigest,shard})=>({key,contentDigest,shard})));
assert.equal(validatePlan(bad).valid,false,'subset-state creation without presence must fail');
const rich = lower({ schemaVersion: 'kumo.core-ir/v1', components: [{ name: 'sample', inputs: {}, stateMachine: { initial: 'off', states: ['off', 'on'], transitions: [{ event: 'toggle', from: '*', to: 'on' }] }, parts: [{ id: 'host', parent: null, kind: 'element', semantics: 'dialog', conditions: [], bindings: [{ type: 'portal', target: 'document.body' }, { type: 'attribute', name: 'aria-expanded', value: true }, { type: 'class', value: 'active' }, { type: 'event', event: 'click', dispatch: 'toggle' }] }], provenance: {} }] });
const richKinds = new Set(rich.shards[0].operations.map(item => item.kind));
for (const required of ['portal.mount', 'attribute.set', 'class.add', 'event.listen']) assert(richKinds.has(required));
assert.equal(validatePlan({ ...one, manifestDigest: '0'.repeat(64) }).valid, false);
console.log(JSON.stringify({ status: 'passed', shards: one.shards.length, manifestDigest: one.manifestDigest }, null, 2));
