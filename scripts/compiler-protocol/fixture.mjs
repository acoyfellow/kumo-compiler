#!/usr/bin/env node
import {readFile,writeFile} from 'node:fs/promises';
import {sha256} from './lib.mjs';
const source=new URL('../../generated/catalog.ir.json',import.meta.url),dest=new URL('../../protocol/fixtures/current-catalog.fixture.json',import.meta.url),body=await readFile(source),catalog=JSON.parse(body),frameworks=['react','vue','svelte','solid'];
if(catalog.schemaVersion!=='kumo.ir/v1'||catalog.components.length!==41)throw new Error('expected current 41-component kumo.ir/v1 catalog');
const fixture={schemaVersion:'kumo.compiler.fixture-pack/v1',source:'generated/catalog.ir.json',sourceSha256:sha256(body),catalog,expected:{componentCount:catalog.components.length,componentIds:catalog.components.map(x=>x.id),frameworks,plannedTargets:catalog.components.flatMap(x=>frameworks.map(framework=>({component:x.id,framework})))}};
await writeFile(dest,JSON.stringify(fixture,null,2)+'\n');console.log(`wrote ${catalog.components.length} components`);
