import { spawnSync } from 'node:child_process';

const execute = process.argv.includes('--execute');
const versionId = process.env.CLOUDFLARE_WORKER_VERSION_ID;
if (!versionId) {
  console.error('CLOUDFLARE_WORKER_VERSION_ID is required (obtain it from Cloudflare deployment history)');
  process.exitCode = 2;
} else {
  const args = ['wrangler', 'rollback', versionId];
  if (!execute) {
    console.log(JSON.stringify({ dryRun: true, command: ['npx', ...args], versionId }));
  } else {
    const result = spawnSync('npx', args, { stdio: 'inherit' });
    process.exitCode = result.status ?? 1;
  }
}
