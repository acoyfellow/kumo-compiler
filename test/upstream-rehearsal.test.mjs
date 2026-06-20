import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { SCENARIOS, ROOT, runScenario } from '../rehearsals/upstream/lib/rehearsal.mjs';

for (const [id, expected] of Object.entries(SCENARIOS)) test(`upstream rehearsal: ${id}`, async () => {
  const r=await runScenario(id,{writeReceipt:false});
  assert.equal(r.diff.classification.semver,expected.semver);
  assert.equal(r.diff.classification.compatible,expected.compatible);
  assert.deepEqual(r.diff.classification.reasons,expected.reasons);
  assert.equal(r.conformance.planDelta,expected.planDelta);
  assert.equal(r.conformance.baseline.status,'ok');
  assert.equal(r.conformance.candidate.status,'ok');
  assert.equal(r.assertions.existingComponentsUnchanged,true);
  assert.deepEqual(r.assertions.authoritativeDiffs,[]);
  assert.deepEqual(r.diff.changes,[...r.diff.changes].sort((a,b)=>a.path.localeCompare(b.path)||a.kind.localeCompare(b.kind)));
  assert.equal(r.browser.status,'not-run'); assert.equal(r.browser.claimed,false);
  assert.equal(r.containment.noSymlinks,true); assert.equal(r.containment.baselineWrites,false);
  if(id==='add-status-chip') assert.equal(r.conformance.planDelta,4);
  else assert.equal(r.conformance.baseline.planHash,r.conformance.candidate.planHash);
  if(id==='button-icon-position') assert.equal(r.assertions.omittedButtonBehaviorUnchanged,true);
  if(id==='css-token-rename') { assert.notEqual(r.baseline.tokensHash,r.candidate.tokensHash); assert.deepEqual(r.diff.classification.reasons,['token-removed','token-value-changed']); }
  if(id==='button-export-rename') assert.notEqual(r.baseline.exportsHash,r.candidate.exportsHash);
});

test('upstream receipts are byte-identical across runs and invocation CWDs', async () => {
  for (const id of Object.keys(SCENARIOS)) {
    const first=await runScenario(id,{writeReceipt:false});
    const second=await runScenario(id,{writeReceipt:false});
    assert.equal(JSON.stringify(first),JSON.stringify(second),id);
    assert.equal(first.receiptSha256,second.receiptSha256,id);
    const committed=JSON.parse(await readFile(path.join(ROOT,'rehearsals/upstream/receipts',`${id}.json`),'utf8'));
    assert.deepEqual(first,committed,id);
  }
  const cwd=await mkdtemp(path.join(tmpdir(),'kumo-rehearsal-cwd-'));
  try {
    const output=execFileSync(process.execPath,[path.join(ROOT,'rehearsals/upstream/rehearse.mjs'),'all'],{cwd,encoding:'utf8'});
    assert.equal(JSON.parse(output).status,'ok');
  } finally { await rm(cwd,{recursive:true,force:true}); }
});
