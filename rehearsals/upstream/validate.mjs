#!/usr/bin/env node
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
const dir=new URL('./receipts/',import.meta.url), sha=v=>crypto.createHash('sha256').update(v).digest('hex');
function sort(v){if(Array.isArray(v))return v.map(sort);if(v&&typeof v==='object')return Object.fromEntries(Object.keys(v).sort().map(k=>[k,sort(v[k])]));return v}
const names=(await readdir(dir)).filter(x=>x.endsWith('.json')).sort();
if(names.length!==5) throw new Error(`expected five receipts, got ${names.length}`);
for(const name of names){const r=JSON.parse(await readFile(new URL(name,dir),'utf8')), {receiptSha256,...core}=r; if(r.schemaVersion!=='kumo.upstream.receipt/v1'||sha(JSON.stringify(sort(core)))!==receiptSha256)throw new Error(`invalid receipt ${name}`);if(r.browser.status!=='not-run'||r.browser.claimed)throw new Error('false browser claim');if(r.assertions.authoritativeDiffs.length)throw new Error('authoritative diff');}
console.log(JSON.stringify({status:'ok',receipts:names.length}));
