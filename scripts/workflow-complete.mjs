#!/usr/bin/env node
import { resolve } from 'node:path';
import { advanceWorkflow } from '../workflow/runner.mjs';

const options = Object.fromEntries(process.argv.slice(2).map(argument => {
  const [key, ...value] = argument.replace(/^--/, '').split('=');
  return [key, value.join('=')];
}));

if (!options.step || !options['run-id'] || !options.status) {
  console.error('Usage: node scripts/workflow-complete.mjs --step=<id> --run-id=<id> --status=<succeeded|failed|cancelled>');
  process.exit(2);
}

try {
  const result = await advanceWorkflow({
    workflowPath: resolve(options.workflow ?? 'workflow.json'),
    statePath: resolve(options.state ?? '.workflow/state.json'),
    receipt: {
      stepId: options.step,
      runId: options['run-id'],
      status: options.status,
      ...(options.note ? { note: options.note } : {})
    }
  });
  console.log(JSON.stringify(result.next));
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
