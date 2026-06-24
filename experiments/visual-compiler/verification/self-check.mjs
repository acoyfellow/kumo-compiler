import assert from 'node:assert/strict';
import {mkdtemp,mkdir,readFile,rm,writeFile,copyFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname,resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {run,verifyCell} from './verifier.mjs';

const sha=x=>createHash('sha256').update(x).digest('hex');
const first=await run({write:true});
const bytes1=await readFile(resolve(import.meta.dirname,'matrix-receipt.json'),'utf8');
const second=await run({write:false});
assert.equal(first.matrix.summary.total,108);
assert.deepEqual(first.matrix.cells.map(x=>x.cacheKey),second.matrix.cells.map(x=>x.cacheKey));
assert.equal(second.cache.warmHits,108,'warm scheduler must hit every cell');
assert.equal(first.status,first.nativeHarnessesPresent&&first.matrix.summary.failed===0?'passed':'failed');
assert.equal(first.nativeHarnessesPresent,false,'do not report green until all native harnesses exist');
assert.ok(first.matrix.cells.every(c=>c.status==='passed'||c.diagnostics.length),'failure diagnostics are mandatory');
assert.equal(bytes1,JSON.stringify(first.matrix,null,2)+'\n','receipt must be deterministic');

const record=JSON.parse(await readFile(resolve(import.meta.dirname,'../tracer/results.json'),'utf8')).records[0];
const root=await mkdtemp(resolve(tmpdir(),'kumo-verifier-'));
try{
 const missing=await verifyCell(record,'vue',{base:root});
 assert.equal(missing.status,'failed','missing output must fail closed');
 assert.equal(missing.diagnostics[0].stage,'provenance');
 const canonicalTrace=resolve(import.meta.dirname,'../tracer',record.trace),canonicalShot=resolve(dirname(canonicalTrace),'screenshot.png');
 const out=resolve(root,'lowering/outputs/vue',record.component,record.state,String(record.viewport));
 await mkdir(out,{recursive:true});
 await copyFile(canonicalTrace,resolve(out,'trace.json'));
 await copyFile(canonicalShot,resolve(out,'screenshot.png'));
 const trace=await readFile(canonicalTrace),shot=await readFile(canonicalShot),fake='a'.repeat(64);
 await writeFile(resolve(out,'provenance.json'),JSON.stringify({schemaVersion:'kumo.native-harness-provenance/v1',target:'vue',generatedSourceDigest:fake,canonicalSourceDigest:fake,lowererDigest:fake,nativeCompilerDigest:fake,nativeBuildDigest:fake,servedHarnessDigest:fake,captureDigest:fake,traceDigest:sha(trace),screenshotDigest:sha(shot),generatedBuild:{digest:fake},servedHarness:{url:'http://127.0.0.1/native',buildDigest:fake},capture:{id:'copy',capturedAt:'2026-01-01T00:00:00Z',independent:true,buildDigest:fake,harnessDigest:fake,canonicalArtifactUsed:false}}));
 const attack=await verifyCell(record,'vue',{base:root});
 assert.equal(attack.status,'failed','canonical copy attack must fail');
 assert.match(attack.diagnostics[0].message,/copy attack/);
}finally{await rm(root,{recursive:true,force:true})}
console.log(`self-check passed: fail-closed receipt; missing-output and copy-attack tests rejected`);
