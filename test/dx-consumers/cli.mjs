import test from 'node:test';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'../../dx/fixtures'),cli=resolve(import.meta.dirname,'../../dx/cli/kumo.mjs');
for(const args of [['manifest','--json'],['check','--json'],['update','--dry-run','--json']])test(args.join(' '),()=>{const x=spawnSync(process.execPath,[cli,...args,'--root',root],{encoding:'utf8'});assert.ok([0,1].includes(x.status));assert.doesNotThrow(()=>JSON.parse(x.stdout));});
test('update refuses mutation',()=>assert.equal(spawnSync(process.execPath,[cli,'update','--root',root]).status,2));
