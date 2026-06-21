import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const root=resolve(import.meta.dirname,'..');
const manifest=JSON.parse(await readFile(resolve(root,'library-artifacts/manifest.json'),'utf8'));
test('library pages advertise exact production artifacts and package evidence',async()=>{for(const entry of manifest.packages){const page=await readFile(resolve(root,`astro/src/pages/libraries/${entry.framework}/index.astro`),'utf8');assert.match(page,new RegExp(entry.sha256));assert.match(page,new RegExp(entry.receiptDigest));const bytes=await readFile(resolve(root,'library-artifacts',entry.friendlyName));assert.equal(createHash('sha256').update(bytes).digest('hex'),entry.sha256)}});
test('gallery builder installs tarballs without source aliases or placeholders',async()=>{const source=await readFile(resolve(root,'scripts/libraries/build-gallery.mjs'),'utf8');for(const entry of manifest.packages)assert.match(source,/file:\$\{resolve\(artifacts, entry\.friendlyName\)\}/);assert.doesNotMatch(source,/dx\/packages|alias\s*:/);const component=await readFile(resolve(root,'astro/src/components/LibraryGallery.astro'),'utf8');assert.match(component,/https:\/\/kumo-compiler\.coey\.dev\/packages\/kumo-\$\{framework\}-0\.0\.1\.tgz/);assert.match(component,/Select is not included/);assert.doesNotMatch(component,/placeholder/i)});
