import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {deriveResponsiveSidebar,loadResponsiveSidebar,validateResponsiveSidebar} from '../src/kumo/library/responsive-sidebar.mjs';

const contract = JSON.parse(fs.readFileSync('contracts/kumo.observable/v1/components/sidebar.json'));

test('responsive sidebar is canonical, deterministic, and digest bound twice', () => {
  const first = deriveResponsiveSidebar(contract);
  const second = deriveResponsiveSidebar(contract);
  assert.deepEqual(first, second);
  assert.deepEqual(loadResponsiveSidebar(), first);
  assert.deepEqual(loadResponsiveSidebar(), second);
});

test('desktop/mobile transitions and ownership remain separate', () => {
  const value = loadResponsiveSidebar();
  assert.equal(value.viewport.breakpoint.value, 768);
  assert.equal(value.viewport.desktop.value.root, 'aside');
  assert.equal(value.viewport.mobile.value.openState, 'openMobile');
  assert.equal(value.disclosure.controlledOwnership.value.rule, 'controlled prop remains authoritative; requests call onOpenChange');
  assert.equal(value.disclosure.controlledOwnership.value.mobile, 'openMobile remains internal and independent');
});

test('mounted hidden content, focus migration, and service boundaries are explicit', () => {
  const value = loadResponsiveSidebar();
  assert.deepEqual(value.visibility.mobileClosed.value, {mounted:true,'aria-hidden':true,inert:'imperative ref effect'});
  assert.equal(value.visibility.inactiveSlidingView.value.pointerEvents, 'none');
  assert.equal(value.focus.mobileOpen.value, 'focus first focusable descendant, otherwise nav');
  assert.equal(value.browserServices.matchMedia.value.subscription, 'change listener');
  assert.equal(value.browserServices.resize.value.viewportMode, 'not derived from resize events directly');
  assert.equal(value.ssr.initialViewport.value, 'desktop (isMobile=false when window is absent)');
});

test('unknown browser behavior fails closed and digest mutation is rejected', () => {
  const value = loadResponsiveSidebar();
  assert.equal(value.visibility.inertSerialization.supported, false);
  assert.equal(value.focus.exactOrdering.supported, false);
  assert.equal(value.ssr.hydration.supported, false);
  assert.ok(value.blockers.every(x => x.reason));
  const unsupported = structuredClone(value);
  unsupported.ssr.hydration = {supported:true,value:'stable'};
  assert.throws(() => validateResponsiveSidebar(unsupported), /evidence/);
  const changed = structuredClone(value);
  changed.viewport.breakpoint.value = 640;
  assert.throws(() => validateResponsiveSidebar(changed), /digest mismatch/);
});
