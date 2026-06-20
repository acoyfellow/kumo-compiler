import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { components, frameworks, fixture } from './fixtures.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const out = path.join(root, 'proof/bakeoff/shared-core/evidence');

// This candidate currently has no target framework SSR/client build or Chrome/CDP
// runner. Record that fact; never substitute generated HTML for target execution.
fs.rmSync(out, { recursive: true, force: true });
for (const component of components) for (const framework of frameworks) {
  const dir = path.join(out, framework, component);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'not-run.json'), JSON.stringify({
    schemaVersion: 1,
    candidate: 'shared-core',
    component,
    framework,
    fixture: fixture[component],
    execution: { kind: 'not-run', reason: 'No target-native SSR/client bundle and no real Chrome/CDP execution are implemented.' },
    gates: {
      build: 'not-run', browser: 'not-run', ssr: 'not-run', hydration: 'not-run',
      nodePreservation: 'not-run', network: 'not-run', console: 'not-run'
    }
  }, null, 2) + '\n');
}
console.log(`recorded ${components.length * frameworks.length} truthful not-run records`);
