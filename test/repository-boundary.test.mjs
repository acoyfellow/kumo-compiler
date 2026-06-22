import test from 'node:test'
import assert from 'node:assert/strict'
import {execFileSync} from 'node:child_process'
import {createHash} from 'node:crypto'
import {readFile,readdir} from 'node:fs/promises'
import {resolve} from 'node:path'
const root=resolve(import.meta.dirname,'..')
const tracked=()=>execFileSync('git',['ls-files','--cached','--others','--exclude-standard'],{cwd:root,encoding:'utf8'}).trim().split('\n')
test('generated authority and disposable package staging cannot duplicate',async()=>{
 const files=tracked()
 assert(files.includes('generated/libraries/README.md'))
 assert.equal(files.filter(x=>/^dx\/packages\/kumo-(vue|svelte|solid)\/package\//.test(x)).length,0)
 for(const framework of ['vue','svelte','solid']) assert(files.includes(`dx/packages/kumo-${framework}/build.mjs`))
 const map=JSON.parse(await readFile(resolve(root,'repository-map.json')))
 assert.equal(map.zones.generatedFrameworks.path,'generated/libraries/')
 assert.equal(map.zones.generatedFrameworks.editable,false)
})
test('compiled publication assets are untracked except immutable gates',()=>{
 const files=tracked().filter(x=>/^(deploy\/.*\/assets\/|(?:runtime|runtime-canonical)\/.*\/public-runtime\/)/.test(x))
 assert.deepEqual(files.sort(),['runtime/checkbox/react/public-runtime/assets/react-checkbox.js','runtime/switch/react/public-runtime/assets/react-switch.js'])
})
test('generated source files declare their boundary',async()=>{
 for(const framework of ['vue','svelte','solid']){
  const base=resolve(root,'generated/libraries',framework),queue=[base];
  while(queue.length){const dir=queue.pop();for(const entry of await readdir(dir,{withFileTypes:true})){const file=resolve(dir,entry.name);if(entry.isDirectory())queue.push(file);else if(/\.(?:vue|svelte|tsx|ts|js)$/.test(entry.name)){const source=await readFile(file,'utf8');assert.match(source,/^(?:<!--|\/\/) @generated /,file)}}}
 }
})
test('cleanup receipt is content-addressed and records a real reduction',async()=>{
 const receipt=JSON.parse(await readFile(resolve(root,'docs/archive/cleanup-receipt.json'),'utf8')),hash=receipt.canonicalSha256;delete receipt.canonicalSha256;
 const stable=value=>Array.isArray(value)?value.map(stable):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,stable(value[key])])):value;
 assert.equal(hash,createHash('sha256').update(JSON.stringify(stable(receipt))).digest('hex'));
 for(const metric of ['trackedFiles','trackedBytes','authoredLoc'])assert.ok(receipt.measurement.after[metric]<receipt.measurement.before[metric],metric);
})
test('active documentation does not treat archive as authority',async()=>{
 const map=JSON.parse(await readFile(resolve(root,'repository-map.json'),'utf8'))
 assert.equal(map.zones.archive.path,'docs/archive/')
 assert.equal(map.zones.archive.authority,false)
 assert.equal(map.zones.receipts.authority,true)
 assert(tracked().includes('docs/archive/README.md'))
})
