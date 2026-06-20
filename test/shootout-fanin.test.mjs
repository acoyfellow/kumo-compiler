import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
test('shootout fan-in is exact and fail closed',()=>{
 const output=path.join(fs.mkdtempSync(path.join(os.tmpdir(),'shootout-fan-in-')),'selected.json');
 execFileSync(process.execPath,['scripts/shootout/fan-in/build.mjs'],{cwd:root,env:{...process.env,SHOOTOUT_FAN_IN_OUTPUT:output}});
 const x=JSON.parse(fs.readFileSync(output));
 assert.equal(x.axisA.recordCount,8);assert.equal(x.axisA.winnerSupported,false);assert.equal(x.axisB.cellCount,32);assert.deepEqual(x.axisB.gateCounts,{passed:87,failed:5,blocked:212,'not-run':80});assert.equal(x.axisB.weightsApplied,false);assert.equal(x.axisB.winner,null);assert.deepEqual(x.consumers.counts,{passed:10,failed:0,blocked:21,'not-run':6});assert.equal(x.baselineAuthority.coverage,'164/164');
});
