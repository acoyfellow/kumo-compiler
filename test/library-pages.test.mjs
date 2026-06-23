import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const root=resolve(import.meta.dirname,'..');
const manifest=JSON.parse(await readFile(resolve(root,'library-artifacts/manifest.json'),'utf8'));
test('library pages derive production artifacts and package evidence from the selected manifest',async()=>{for(const entry of manifest.packages){const page=await readFile(resolve(root,`astro/src/pages/libraries/${entry.framework}/index.astro`),'utf8');assert.match(page,/library-artifacts\/manifest\.json/);assert.match(page,new RegExp(`framework === '${entry.framework}'`));assert.match(page,/sha256=\{artifact\.sha256\}/);assert.match(page,/receiptDigest=\{artifact\.receiptDigest\}/);const bytes=await readFile(resolve(root,'library-artifacts',entry.friendlyName));assert.equal(createHash('sha256').update(bytes).digest('hex'),entry.sha256)}});
test('gallery builder installs tarballs without source aliases or placeholders',async()=>{const source=await readFile(resolve(root,'scripts/libraries/build-gallery.mjs'),'utf8');for(const entry of manifest.packages)assert.match(source,/file:\$\{resolve\(artifacts,\s*entry\.friendlyName\)\}/);assert.doesNotMatch(source,/dx\/packages|alias\s*:/);const component=await readFile(resolve(root,'astro/src/components/LibraryGallery.astro'),'utf8');assert.match(component,/https:\/\/kumo-compiler\.coey\.dev\/packages\/kumo-\$\{framework\}-0\.0\.1\.tgz/);assert.match(component,/41 executable components/);assert.doesNotMatch(component,/Select is not included|placeholder/i)});
