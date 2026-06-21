import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {deriveCompoundExports, fixtureComponentRefs, loadCompoundExports, validateCompoundExports} from '../src/kumo/library/compound-exports.mjs';
import {loadLibrary} from '../src/kumo/library/index.mjs';

const capability = loadCompoundExports();
const refs = capability.roots.flatMap(root => root.paths.map(item => `${root.canonicalRoot}.${item.path}`));

test('capability contains exactly every shared packed compound fixture ref', () => {
  const packed = JSON.parse(fs.readFileSync('proof/dx/conformance/shared/packed-fixtures.json'));
  const expected = [...new Set(packed.vectors.flatMap(vector => fixtureComponentRefs(vector.fixture)).filter(ref => ref.includes('.')))].sort();
  assert.deepEqual(refs.sort(), expected);
  assert.deepEqual(deriveCompoundExports(), capability);
});

test('all historically broken compound families are represented', () => {
  for (const ref of ['Autocomplete.Item','Breadcrumbs.Current','Combobox.TriggerInput','CommandPalette.Root','Dialog.Trigger','DropdownMenu.SubContent','Field.NativeInput','InputGroup.Addon','LayerCard.Primary','Popover.Content','Select.Option','Sidebar.Provider','Table.Head','Table.Row','Table.Cell','TableOfContents.Item']) assert.ok(refs.includes(ref), ref);
});

test('models carry the canonical structured compound graph', () => {
  const {models} = loadLibrary();
  for (const root of capability.roots) {
    const graph = models.find(model => model.component === root.component).composition.compoundExports;
    assert.equal(graph.canonicalRoot, root.canonicalRoot);
    assert.deepEqual(graph.tree, root.tree);
    assert.deepEqual(graph.paths, root.paths);
  }
});

test('generation is deterministic and capability validation fails closed', () => {
  const before = fs.readFileSync('src/kumo/library/capabilities/compound-exports.json');
  execFileSync(process.execPath, ['src/kumo/library/generate.mjs']);
  assert.deepEqual(fs.readFileSync('src/kumo/library/capabilities/compound-exports.json'), before);
  assert.throws(() => validateCompoundExports({...capability, digest:'0'.repeat(64)}), /digest/);
  const duplicate = structuredClone(capability); duplicate.roots.push(duplicate.roots[0]);
  assert.throws(() => validateCompoundExports(duplicate), /duplicate/);
});

test('compound capability is data-driven, not component-ID source mapping', () => {
  const source = fs.readFileSync('src/kumo/library/compound-exports.mjs', 'utf8');
  assert.doesNotMatch(source, /Breadcrumbs|Dialog|Table|Autocomplete|Sidebar/);
});
