import test from 'node:test'; import assert from 'node:assert/strict'; import fs from 'node:fs';
const matrix=JSON.parse(fs.readFileSync(new URL('../benchmarks/bakeoff/mitosis/matrix.json',import.meta.url)));
const targetStatuses=new Set(['passed','partial','failed','blocked']);
const gateStatuses=new Set(['passed','failed','not-run','blocked']);
test('mitosis matrix has complete bound identities and non-optimistic statuses',()=>{
  assert.equal(matrix.rows.length,28);
  for(const r of matrix.rows){
    assert.equal(r.candidate,'mitosis'); assert.ok(r.component&&r.framework&&r.kumoRevision&&r.candidateRevision&&r.runId);
    assert.equal(r.candidateRevision,'d1bcccf'); assert.equal(r.runId,'ter_20260620185824227_x67sdt');
    assert.ok(targetStatuses.has(r.status));
    for(const value of Object.values(r.evidence)){assert.equal(typeof value,'string');assert.ok(gateStatuses.has(value));}
    assert.equal(r.evidence.generated,'passed'); assert.equal(r.evidence.provenance,'passed');
    if(['Button','Field','Tabs'].includes(r.component)) {assert.equal(r.status,'blocked');assert.equal(r.evidence.build,'passed');assert.equal(r.evidence.runtime,'passed');assert.equal(r.evidence.ssr,'blocked');}
    else {assert.equal(r.status,'partial');assert.equal(r.evidence.build,'not-run');assert.equal(r.evidence.runtime,'not-run');}
    if(r.status==='passed') assert.ok(r.evidence.build==='passed'&&r.evidence.runtime==='passed'&&r.evidence.behavior==='passed');
    if(r.status==='blocked') assert.ok(Object.values(r.evidence).includes('blocked'));
  }
  const gates={passed:0,failed:0,'not-run':0,blocked:0}; for(const r of matrix.rows)for(const v of Object.values(r.evidence))gates[v]++;
  const targets={passed:0,partial:0,failed:0,blocked:0}; for(const r of matrix.rows)targets[r.status]++;
  assert.deepEqual(matrix.counts,gates); assert.deepEqual(matrix.targetCounts,targets); assert.deepEqual(targets,{passed:0,partial:16,failed:0,blocked:12}); assert.equal(matrix.adaptationFrequency,36);
});
