import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('native demo fidelity receipt covers all 41 components in Vue, Svelte, and Solid', async () => {
  const receipt=JSON.parse(await readFile('proof/native-demo-fidelity/latest.json','utf8'));
  assert.equal(receipt.schemaVersion,'kumo.native-demo-fidelity/v1');
  assert.equal(receipt.status,'passed');
  assert.equal(receipt.componentCount,41);
  assert.deepEqual(receipt.frameworks.map(x=>x.framework),['vue','svelte','solid']);
  assert.equal(receipt.failures.length,0);
  for(const framework of receipt.frameworks){
    assert.equal(framework.components.length,41);
    assert.equal(framework.failures.length,0);
    assert.ok(framework.components.every(component=>component.failures.length===0));
    for(const required of ['checkbox','switch','tabs','date-picker','date-range-picker','select','dialog','popover','dropdown-menu','toasty','autocomplete','combobox','command-palette','input','input-area','input-group','pagination','radio','sensitive-input','sidebar']) {
      assert.ok(framework.interaction[required],`${framework.framework}: missing ${required} interaction`);
      assert.ok(framework.interaction[required+'After'],`${framework.framework}: missing ${required} result`);
    }
  }
});
