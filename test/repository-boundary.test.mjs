import test from 'node:test'
import assert from 'node:assert/strict'
import {execFileSync} from 'node:child_process'
import {readFile} from 'node:fs/promises'
import {resolve} from 'node:path'
const root=resolve(import.meta.dirname,'..')
const tracked=()=>execFileSync('git',['ls-files','--cached','--others','--exclude-standard'],{cwd:root,encoding:'utf8'}).trim().split('\n')
test('generated authority and disposable package staging cannot duplicate',async()=>{
 const files=tracked()
 assert(files.includes('generated/libraries/README.md'))
 assert.equal(files.filter(x=>/^dx\/packages\/kumo-(vue|svelte|solid)\/package\//.test(x)).length,0)
 for(const framework of ['vue','svelte','solid']) assert(files.includes(`dx/packages/kumo-${framework}/build.mjs`))
 const map=JSON.parse(await readFile(resolve(root,'repository-map.json')))
 assert.equal(map.authority.generatedFrameworks,'generated/libraries/')
})
test('compiled publication assets are untracked except immutable gates',()=>{
 const files=tracked().filter(x=>/^(deploy\/.*\/assets\/|(?:runtime|runtime-canonical)\/.*\/public-runtime\/)/.test(x))
 assert.deepEqual(files.sort(),['runtime/checkbox/react/public-runtime/assets/react-checkbox.js','runtime/switch/react/public-runtime/assets/react-switch.js'])
})
test('active documentation does not treat archive as authority',async()=>{
 const map=await readFile(resolve(root,'repository-map.json'),'utf8')
 assert(!map.includes('docs/archive/'))
 assert(tracked().includes('docs/archive/README.md'))
})
