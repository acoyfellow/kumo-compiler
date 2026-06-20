import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';

const root=resolve(import.meta.dirname,'..');
test('reproducible cache and legacy proof outputs are not tracked',()=>{
 const result=spawnSync(process.execPath,['scripts/check-artifact-boundary.mjs'],{cwd:root,encoding:'utf8'});
 assert.equal(result.status,0,result.stderr||result.stdout);
 assert.match(result.stdout,/artifact boundary verified/);
});
