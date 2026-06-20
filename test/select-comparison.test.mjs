import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const json=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8').then(JSON.parse);

test('Select comparison is derived from authoritative receipt counts',async()=>{
 const [comparison,select,dx]=await Promise.all([json('proof/select/comparison.json'),json('proof/select/summary.json'),json('proof/dx/consumer-receipts.json')]);
 assert.deepEqual(comparison.sharedCore.gateCounts,{passed:select.gateCounts.passed,failed:select.gateCounts.failed,blocked:select.gateCounts.blocked,notRun:select.gateCounts['not-run']});
 const counts=dx.receipts.reduce((a,r)=>(a[r.status]++,a),{passed:0,blocked:0,'not-run':0});
 assert.deepEqual(comparison.consumerDx,{passed:counts.passed,blocked:counts.blocked,notRun:counts['not-run']});
 assert.equal(comparison.sharedCore.browser.solid.observedFailures.length,4);
 assert.equal(comparison.verdict.startsWith('No winner.'),true);
});

test('Select comparison provenance files exist',async()=>{
 const comparison=await json('proof/select/comparison.json');
 await Promise.all(comparison.generatedFrom.map(path=>readFile(new URL(`../${path}`,import.meta.url))));
});
