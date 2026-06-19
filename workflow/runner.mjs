import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const terminalStatuses = new Set(['succeeded', 'failed', 'cancelled']);

export function resolveNextStep(workflow, state) {
  validateWorkflow(workflow);
  const runs = state.runs ?? {};

  for (const step of workflow.steps) {
    const run = runs[step.id];
    if (run?.status === 'failed' || run?.status === 'cancelled') {
      return { status: 'blocked', step: null, blockedBy: step.id, reason: run.status };
    }
    if (run?.status === 'running') {
      return { status: 'running', step, runId: run.runId };
    }
    if (run?.status === 'succeeded') continue;

    const dependency = (step.dependsOn ?? []).find(id => runs[id]?.status !== 'succeeded');
    if (dependency) {
      return { status: 'blocked', step: null, blockedBy: dependency, reason: 'dependency' };
    }
    return { status: 'ready', step };
  }

  return { status: 'complete', step: null };
}

export function recordRunReceipt(workflow, state, receipt) {
  validateWorkflow(workflow);
  const { stepId, runId, status } = receipt;
  if (!workflow.steps.some(step => step.id === stepId)) throw new Error(`Unknown workflow step: ${stepId}`);
  if (!runId) throw new Error('A runId is required');
  if (!terminalStatuses.has(status)) throw new Error(`Invalid terminal status: ${status}`);

  const previous = state.runs?.[stepId];
  if (previous?.receipt?.runId === runId) return state;
  if (previous?.status === 'running' && previous.runId !== runId) {
    throw new Error(`Run ${runId} does not match active run ${previous.runId} for ${stepId}`);
  }
  if (previous?.status === 'succeeded') throw new Error(`Step ${stepId} is already complete`);

  return {
    ...state,
    runs: {
      ...(state.runs ?? {}),
      [stepId]: {
        status,
        runId,
        receipt: { ...receipt, recordedAt: receipt.recordedAt ?? new Date().toISOString() }
      }
    }
  };
}

export async function advanceWorkflow({ workflowPath, statePath, receipt, receiptsDirectory }) {
  const [workflow, state] = await Promise.all([readJson(workflowPath), readJson(statePath)]);
  const nextState = recordRunReceipt(workflow, state, receipt);
  await writeJsonAtomic(statePath, nextState);
  const receiptPath = join(receiptsDirectory ?? join(dirname(statePath), 'receipts'), `${receipt.runId}.json`);
  await writeJsonAtomic(receiptPath, nextState.runs[receipt.stepId].receipt);
  return { state: nextState, next: resolveNextStep(workflow, nextState), receiptPath };
}

function validateWorkflow(workflow) {
  if (!Array.isArray(workflow?.steps)) throw new Error('workflow.steps must be an array');
  const ids = new Set();
  for (const step of workflow.steps) {
    if (!step.id || ids.has(step.id)) throw new Error(`Invalid or duplicate workflow step: ${step.id}`);
    for (const dependency of step.dependsOn ?? []) {
      if (!ids.has(dependency)) throw new Error(`Step ${step.id} has unknown or forward dependency: ${dependency}`);
    }
    ids.add(step.id);
  }
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

async function writeJsonAtomic(path, value) {
  await mkdir(dirname(path), { recursive: true });
  const temporary = `${path}.${process.pid}.tmp`;
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`);
  await rename(temporary, path);
}
