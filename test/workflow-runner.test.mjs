import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { advanceWorkflow, recordRunReceipt, resolveNextStep } from '../workflow/runner.mjs';

const workflow = {
  version: 1,
  steps: [
    { id: 'benchmark', command: 'benchmark' },
    { id: 'catalog', command: 'catalog', dependsOn: ['benchmark'] },
    { id: 'validate', command: 'validate', dependsOn: ['catalog'] }
  ]
};

test('moves through steps after successful receipts', () => {
  let state = { version: 1, runs: {} };
  assert.equal(resolveNextStep(workflow, state).step.id, 'benchmark');
  state = recordRunReceipt(workflow, state, { stepId: 'benchmark', runId: 'run-1', status: 'succeeded' });
  assert.equal(resolveNextStep(workflow, state).step.id, 'catalog');
  state = recordRunReceipt(workflow, state, { stepId: 'catalog', runId: 'run-2', status: 'succeeded' });
  state = recordRunReceipt(workflow, state, { stepId: 'validate', runId: 'run-3', status: 'succeeded' });
  assert.equal(resolveNextStep(workflow, state).status, 'complete');
});

test('reports running and failed steps as non-runnable', () => {
  const running = { runs: { benchmark: { status: 'running', runId: 'run-1' } } };
  assert.deepEqual(resolveNextStep(workflow, running), {
    status: 'running', step: workflow.steps[0], runId: 'run-1'
  });

  const failed = { runs: { benchmark: { status: 'failed', runId: 'run-1' } } };
  assert.deepEqual(resolveNextStep(workflow, failed), {
    status: 'blocked', step: null, blockedBy: 'benchmark', reason: 'failed'
  });
});

test('blocks a step whose dependency is incomplete', () => {
  const outOfOrderWorkflow = {
    steps: [
      { id: 'one' },
      { id: 'two', dependsOn: ['one'] }
    ]
  };
  const state = { runs: { one: { status: 'running', runId: 'r' }, two: {} } };
  assert.equal(resolveNextStep(outOfOrderWorkflow, state).status, 'running');

  assert.throws(() => resolveNextStep({ steps: [{ id: 'two', dependsOn: ['missing'] }] }, { runs: {} }), /unknown or forward dependency/);
});

test('completion callback persists state and an idempotent receipt', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'kumo-workflow-'));
  const workflowPath = join(directory, 'workflow.json');
  const statePath = join(directory, 'state.json');
  await writeFile(workflowPath, JSON.stringify(workflow));
  await writeFile(statePath, JSON.stringify({ version: 1, runs: {} }));
  const receipt = { stepId: 'benchmark', runId: 'terrarium-1', status: 'succeeded', recordedAt: '2026-01-01T00:00:00.000Z' };

  const first = await advanceWorkflow({ workflowPath, statePath, receipt });
  const second = await advanceWorkflow({ workflowPath, statePath, receipt });
  assert.equal(first.next.step.id, 'catalog');
  assert.equal(second.next.step.id, 'catalog');
  assert.deepEqual(JSON.parse(await readFile(first.receiptPath, 'utf8')), receipt);
  assert.equal(JSON.parse(await readFile(statePath, 'utf8')).runs.benchmark.status, 'succeeded');
});

test('rejects a receipt for a different active run', () => {
  const state = { runs: { benchmark: { status: 'running', runId: 'expected' } } };
  assert.throws(
    () => recordRunReceipt(workflow, state, { stepId: 'benchmark', runId: 'other', status: 'succeeded' }),
    /does not match active run/
  );
});
