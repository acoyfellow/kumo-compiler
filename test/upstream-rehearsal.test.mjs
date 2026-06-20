import test from 'node:test';
import assert from 'node:assert/strict';
import { SCENARIOS, runScenario } from '../rehearsals/upstream/lib/rehearsal.mjs';

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
