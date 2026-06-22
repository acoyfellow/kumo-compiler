import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {derivePaginationControls, validatePaginationControls, loadPaginationControls, PAGINATION_CONTROLS_COMPONENTS} from '../src/kumo/library/pagination-controls.mjs';

const contractDir = path.resolve('contracts/kumo.observable/v1/components');
const contracts = PAGINATION_CONTROLS_COMPONENTS.map(name => JSON.parse(fs.readFileSync(path.join(contractDir, `${name}.json`), 'utf8')));

test('pagination controls derive the supported compound behavior and are stable twice', () => {
  const a = derivePaginationControls(contracts);
  const b = derivePaginationControls(contracts);
  assert.equal(a.capabilityDigest, b.capabilityDigest);
  assert.deepEqual(loadPaginationControls(), a);
  assert.equal(a.support, 'supported');
});

test('root is div[data-slot=pagination] with a labelled nav, four buttons, and a page-number input', () => {
  const value = loadPaginationControls();
  assert.equal(value.root.tag, 'div');
  assert.equal(value.root.attributes['data-slot'], 'pagination');
  assert.equal(value.legacy.nav.ariaLabel, 'Pagination');
  assert.deepEqual(value.legacy.buttons, ['first', 'previous', 'next', 'last']);
  assert.equal(value.legacy.pageInput.ariaLabel, 'Page number');
});

test('state algebra binds canonical clamping (maxPage 4, next 3, enter/blur clamp 4/1)', () => {
  const a = loadPaginationControls().stateAlgebra;
  assert.equal(a.maxPage, 4);
  assert.equal(a.next, 3);
  assert.equal(a.enterClamp, 4);
  assert.equal(a.blurClamp, 1);
  assert.equal(a.clampAbove, 4);
  assert.equal(a.clampBelow, 1);
});

test('page-size popup and invalid-input feedback remain explicit unknowns', () => {
  const fields = loadPaginationControls().unknowns.map(u => u.field).sort();
  assert.deepEqual(fields, ['invalidPageInputFeedback', 'pageSizeDropdownPresentation']);
});

test('validator fails closed for support downgrade, algebra mutation, and digest mutation', () => {
  const downgrade = structuredClone(loadPaginationControls());
  downgrade.support = 'requirements-only';
  assert.throws(() => validatePaginationControls(downgrade));
  const algebra = structuredClone(loadPaginationControls());
  algebra.stateAlgebra.next = 2;
  assert.throws(() => validatePaginationControls(algebra));
  const digestMutated = structuredClone(loadPaginationControls());
  digestMutated.capabilityDigest = 'x'.repeat(64);
  assert.throws(() => validatePaginationControls(digestMutated));
});
