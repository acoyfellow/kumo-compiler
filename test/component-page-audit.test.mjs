import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('all component pages use one package-backed fixture authority across four frameworks',async()=>{
 const receipt=JSON.parse(await readFile('proof/component-pages/latest.json','utf8'));
 assert.equal(receipt.schemaVersion,'kumo.component-page-audit/v1');
 assert.equal(receipt.status,'passed');
 assert.equal(receipt.componentCount,41);
 assert.equal(receipt.pages.length,41);
 assert.equal(receipt.failures.length,0);
 for(const page of receipt.pages){
  assert.equal(page.frameworks.length,4);
  assert.equal(page.failures.length,0);
  const digests=new Set(page.frameworks.map(x=>x.digest));
  assert.equal(digests.size,1,`${page.component}: fixture authority diverged`);
  assert.ok([...digests][0]);
  for(const runtime of page.frameworks)assert.equal(runtime.failures.length,0,`${page.component}/${runtime.framework}`);
 }
});
