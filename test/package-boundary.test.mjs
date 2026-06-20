import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtemp,readFile,writeFile,cp,mkdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');

test('private package boundary is independently verifiable',()=>{
 const result=spawnSync(process.execPath,[path.join(root,'scripts/verify-package.mjs'),'--root',root],{encoding:'utf8'});
 assert.equal(result.status,0,result.stderr);
 assert.match(result.stdout,/41 components × 4 frameworks/);
});

test('verification rejects package-consumer claims without an SDK',async()=>{
 const temp=await mkdtemp(path.join(tmpdir(),'kumo-package-'));
 for(const dir of ['manifests','generated','src/kumo','scripts/lib'])await mkdir(path.join(temp,dir),{recursive:true});
 for(const file of ['package-lock.json','manifests/components.json','manifests/build.json','generated/catalog.ir.json','scripts/verify-package.mjs','scripts/lib/manifest.mjs'])await cp(path.join(root,file),path.join(temp,file));
 await writeFile(path.join(temp,'src/kumo/compiler.ts'),'// boundary marker\n');
 const pkg=JSON.parse(await readFile(path.join(root,'package.json'),'utf8'));pkg.exports='./dist/index.js';await writeFile(path.join(temp,'package.json'),JSON.stringify(pkg));
 const result=spawnSync(process.execPath,[path.join(temp,'scripts/verify-package.mjs'),'--root',temp],{encoding:'utf8'});
 assert.notEqual(result.status,0);assert.match(result.stderr,/must not advertise package-consumer boundaries/);
});
