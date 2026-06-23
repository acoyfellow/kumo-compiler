import test from'node:test';
import assert from'node:assert/strict';
import{mkdtemp,cp,readFile,writeFile}from'node:fs/promises';
import{tmpdir}from'node:os';
import{join}from'node:path';
import{createHash}from'node:crypto';
import{buildReadiness}from'../scripts/build-readiness.mjs';
test('readiness is receipt-derived, terminal, and content-addressed',async()=>{const r=await buildReadiness();assert.equal(r.count,41);assert.equal(r.implementationReadyCount,41);assert.ok(r.components.every(x=>x.implementationReady));assert.ok(r.components.every(x=>r.dimensions.every(d=>['passed','not-applicable'].includes(x.dimensions[d].status))));const copy=structuredClone(r);delete copy.digest;assert.equal(r.digest,createHash('sha256').update(JSON.stringify(copy)).digest('hex'))});
test('readiness fails closed on a mutated target digest',async()=>{const root=await mkdtemp(join(tmpdir(),'kumo-readiness-'));for(const p of ['src/kumo/library','generated/libraries','library-artifacts','proof/dx'])await cp(p,join(root,p),{recursive:true});const path=join(root,'generated/libraries/vue/manifest.json'),m=JSON.parse(await readFile(path,'utf8'));m.components[0].modelDigest='0'.repeat(64);await writeFile(path,JSON.stringify(m));await assert.rejects(buildReadiness({root,write:false}),/model digest mismatch/)});
