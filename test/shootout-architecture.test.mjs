import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
test('Axis B inventory fails closed without selecting a winner',()=>{
 const out=JSON.parse(execFileSync(process.execPath,['scripts/shootout/architectures/inventory.mjs'],{encoding:'utf8'}));
 assert.equal(out.status,'prepared'); assert.equal(out.execution,'deferred'); assert.equal(out.winner,null); assert.equal(out.candidates.length,4);
});
test('hybrid references native Select instead of duplicating views',()=>{
 const text=fs.readFileSync('candidates/hybrid/src/native/select.ts','utf8');
 assert.match(text,/shared-core\/src\/views\/select/); assert.doesNotMatch(text,/dangerouslySetInnerHTML|innerHTML\s*=/);
});
