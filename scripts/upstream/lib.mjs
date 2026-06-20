import crypto from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdir, readFile, readdir, lstat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { createGunzip } from 'node:zlib';
import { spawn } from 'node:child_process';

export const PACKAGE='@cloudflare/kumo';
export const FRAMEWORKS=Object.freeze(['react','solid','svelte','vue']);
export const sha=v=>crypto.createHash('sha256').update(v).digest('hex');
export const stable=v=>JSON.stringify(sort(v));
function sort(v){return Array.isArray(v)?v.map(sort):v&&typeof v==='object'&&!Buffer.isBuffer(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,sort(v[k])])):v}
export function contained(root,target){const rel=path.relative(path.resolve(root),path.resolve(target));return rel!==''&&!rel.startsWith('..'+path.sep)&&!path.isAbsolute(rel)}
export async function fetchVersion(version){
 const url=`https://registry.npmjs.org/${encodeURIComponent(PACKAGE)}/${encodeURIComponent(version)}`;
 const r=await fetch(url,{headers:{accept:'application/json'}}); if(!r.ok) throw new Error(`registry metadata ${r.status}: ${url}`);
 const m=await r.json(); if(m.name!==PACKAGE||m.version!==version||!m.dist?.tarball||!m.dist?.integrity) throw new Error(`invalid registry metadata for ${version}`);
 const t=await fetch(m.dist.tarball); if(!t.ok) throw new Error(`tarball ${t.status}: ${m.dist.tarball}`); const body=Buffer.from(await t.arrayBuffer());
 const [algorithm,digest]=m.dist.integrity.split('-',2); if(!algorithm||!digest||crypto.createHash(algorithm).update(body).digest('base64')!==digest) throw new Error(`integrity mismatch for ${version}`);
 return {metadata:m,body,sha256:sha(body)};
}
export async function extractTarball(buffer,dest){await mkdir(dest,{recursive:true}); const archive=path.join(dest,'package.tgz'); await writeFile(archive,buffer); await new Promise((resolve,reject)=>{const p=spawn('tar',['-xzf',archive,'--strip-components=1','-C',dest]);p.on('exit',c=>c?reject(new Error(`tar exited ${c}`)):resolve());p.on('error',reject)});}
async function walk(root,dir=root,out=[]){for(const n of (await readdir(dir)).sort()){if(n==='package.tgz')continue;const full=path.join(dir,n),s=await lstat(full);if(s.isSymbolicLink())throw new Error(`symlink forbidden: ${full}`);if(s.isDirectory())await walk(root,full,out);else{const body=await readFile(full);out.push({path:path.relative(root,full).split(path.sep).join('/'),sha256:sha(body)});}}return out}
function exportsList(value,prefix='.') {if(typeof value==='string'||value===null)return [prefix];if(Array.isArray(value))return value.flatMap(v=>exportsList(v,prefix));if(value&&typeof value==='object'){const keys=Object.keys(value);return keys.some(k=>k.startsWith('.'))?keys.flatMap(k=>exportsList(value[k],k)):keys.flatMap(k=>exportsList(value[k],prefix));}return []}
export async function inventory(root){const pkg=JSON.parse(await readFile(path.join(root,'package.json'),'utf8'));const files=await walk(root);const declarations=[];const tokens=[];for(const f of files){if(f.path.endsWith('.d.ts')){const text=await readFile(path.join(root,f.path),'utf8');for(const m of text.matchAll(/\b(?:export\s+)?(?:declare\s+)?(?:interface|type|class|function|const|enum)\s+([\w$]+)/g))declarations.push(m[1]);}if(f.path.endsWith('.css')){const text=await readFile(path.join(root,f.path),'utf8');for(const m of text.matchAll(/(--[\w-]+)\s*:\s*([^;}]+)/g))tokens.push({name:m[1],value:m[2].trim(),file:f.path});}}return {package:{name:pkg.name,version:pkg.version},exports:[...new Set(exportsList(pkg.exports??pkg.main))].sort(),declarations:[...new Set(declarations)].sort(),tokens:tokens.sort((a,b)=>a.name.localeCompare(b.name)||a.file.localeCompare(b.file)),files};}
export function diffInventories(a,b){const changes=[];for(const field of ['exports','declarations']){for(const x of a[field].filter(x=>!b[field].includes(x)))changes.push({kind:'removed',path:`${field}.${x}`,impact:'breaking'});for(const x of b[field].filter(x=>!a[field].includes(x)))changes.push({kind:'added',path:`${field}.${x}`,impact:'compatible'});}const amap=new Map(a.tokens.map(x=>[`${x.file}:${x.name}`,x.value])),bmap=new Map(b.tokens.map(x=>[`${x.file}:${x.name}`,x.value]));for(const [k,v] of amap)if(!bmap.has(k))changes.push({kind:'removed',path:`tokens.${k}`,impact:'breaking'});else if(bmap.get(k)!==v)changes.push({kind:'changed',path:`tokens.${k}`,impact:'review-required'});for(const k of bmap.keys())if(!amap.has(k))changes.push({kind:'added',path:`tokens.${k}`,impact:'compatible'});return changes.sort((x,y)=>x.path.localeCompare(y.path)||x.kind.localeCompare(y.kind));}
export async function writeImmutable(file,body){await mkdir(path.dirname(file),{recursive:true});try{await writeFile(file,body,{flag:'wx'});}catch(e){if(e.code!=='EEXIST')throw e;const old=await readFile(file,'utf8');if(old!==body)throw new Error(`receipt collision: ${file}`);}}
