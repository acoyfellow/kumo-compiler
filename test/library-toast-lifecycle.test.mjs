import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {deriveToastLifecycle,loadToastLifecycle,validateToastLifecycle} from '../src/kumo/library/toast-lifecycle.mjs';

const contract=JSON.parse(fs.readFileSync('contracts/kumo.observable/v1/components/toasty.json'));

test('toast lifecycle derives the canonical vectors deterministically twice',()=>{
  const first=deriveToastLifecycle(contract),second=deriveToastLifecycle(contract);
  assert.deepEqual(first,second);
  assert.deepEqual(loadToastLifecycle(),first);
  assert.deepEqual(first.provenance.vectorIds,['provider-ssr','notify-default','action-remains-visible','close-dismiss']);
});

test('only observed create, action, dismissal, portal and live-region behavior is supported',()=>{
  const value=loadToastLifecycle();
  assert.equal(value.operations.create.value.title,'Saved');
  assert.equal(value.operations.action.value.remainsVisible,true);
  assert.equal(value.operations.dismiss.value.visibleAfterWait,false);
  assert.equal(value.operations.update.supported,false);
  assert.equal(value.portal.value.containerDefault,'provider container or document.body');
  assert.equal(value.liveRegion.value.priority,'polite');
  assert.equal(value.liveRegion.value.closeCheckpointRetainsAnnouncement,'Saved Changes saved');
  assert.equal(value.cleanup.explicitClose.supported,true);
});

test('stable IDs, queue, timers, pause/resume and vendor cleanup remain explicit unknowns',()=>{
  const value=loadToastLifecycle();
  assert.equal(value.support,'requirements-only');
  assert.equal(value.identity.returnedId.supported,false);
  assert.equal(value.queue.insertionOrder.supported,false);
  assert.equal(value.timeout.durationMs.supported,false);
  assert.equal(value.timeout.pause.supported,false);
  assert.equal(value.timeout.resume.supported,false);
  assert.deepEqual(value.vendorUnknowns.map(x=>x.field),['managerIdGenerationAndDedupe','timerScheduler','queuePolicy','liveRegionLifecycle']);
  const optimistic=structuredClone(value); optimistic.timeout.durationMs={supported:true,value:5000};
  assert.throws(()=>validateToastLifecycle(optimistic),/vector provenance/);
  const mutated=structuredClone(value); mutated.operations.create.value.title='Guessed';
  assert.throws(()=>validateToastLifecycle(mutated),/digest mismatch/);
});
