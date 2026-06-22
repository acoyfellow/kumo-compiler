import {createHash} from 'node:crypto'
import {cp, mkdir, readFile, readdir, rm, writeFile} from 'node:fs/promises'
import {resolve} from 'node:path'

const here=import.meta.dirname
const root=resolve(here,'../../..')
const source=resolve(root,'generated/libraries/solid')
const output=resolve(here,'package')
const assets=resolve(here,'.package-assets')
const legacy=resolve(here,'.package-legacy')
const sha256=value=>createHash('sha256').update(value).digest('hex')
const json=value=>JSON.stringify(value,null,2)+'\n'

await rm(output,{recursive:true,force:true})
await mkdir(resolve(output,'components'),{recursive:true})
const generated=JSON.parse(await readFile(resolve(source,'manifest.json'),'utf8'))
for(const component of generated.components){
  await cp(resolve(source,component.source),resolve(output,'components',component.source))
  await cp(resolve(source,component.declaration),resolve(output,'components',component.declaration))
}
for(const file of ['styles.css','tokens.css']) await cp(resolve(assets,file),resolve(output,file))
const rewriteImports=text=>text.replace(/from "\.\//g,'from "./components/')
await writeFile(resolve(output,'index.tsx'),rewriteImports(await readFile(resolve(source,'index.ts'),'utf8')))
await writeFile(resolve(output,'index.d.ts'),rewriteImports(await readFile(resolve(source,'index.d.ts'),'utf8')))

const migrations=(await readdir(legacy)).filter(file=>file.endsWith('.tsx')).map(file=>file.slice(0,-4)).sort()
for(const component of migrations){
  const model=JSON.parse(await readFile(resolve(root,'src/kumo/library/models',`${component}.json`),'utf8'))
  const variants=(model.draftImplementation.semanticVariants??[]).map(({id,when})=>({id,when}))
  await cp(resolve(output,'components',`${component}.tsx`),resolve(output,'components',`${component}.semantic.tsx`))
  await cp(resolve(legacy,`${component}.tsx`),resolve(output,'components',`${component}.legacy.tsx`))
  const declaration=(await readFile(resolve(legacy,`${component}.d.ts`),'utf8')).replace(/[a-f0-9]{64}/g,model.modelDigest)
  await writeFile(resolve(output,'components',`${component}.d.ts`),declaration)
  const symbol=model.public.symbol
  const bridge=`import{createComponent}from'solid-js';import Semantic from'./${component}.semantic';import Legacy from'./${component}.legacy';\nconst variants=${JSON.stringify(variants)};const equal=(a:unknown,b:unknown)=>JSON.stringify(a)===JSON.stringify(b);const content=(v:any):string=>Array.isArray(v)?v.map(content).join(''):v==null||typeof v==='boolean'?'':typeof v==='string'||typeof v==='number'?String(v):content(v.children);const matches=(when:any[],props:Record<string,any>)=>when.every((p:any)=>p.kind==='prop-equals'?equal(p.name==='children'?content(props.children):props[p.name],p.value):p.kind==='fixture-equals'?equal(props.fixture,p.value):false);export function ${symbol}(props:Record<string,any>){return createComponent(variants.some(v=>matches(v.when,props))?Semantic:Legacy,props)}export default ${symbol};\n`
  await writeFile(resolve(output,'components',`${component}.tsx`),bridge)
}

for(const component of generated.components){
  component.sourceSha256=sha256(await readFile(resolve(output,'components',component.source)))
  component.declarationSha256=sha256(await readFile(resolve(output,'components',component.declaration)))
}
const manifest={...generated,migrationBridges:migrations}
await writeFile(resolve(here,'kumo.manifest.json'),json(manifest))
console.log(`built ${manifest.components.length} Solid components and ${manifest.components.reduce((n,item)=>n+(item.compoundPaths?.length??0),0)} compounds`)
