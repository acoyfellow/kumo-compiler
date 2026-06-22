import {createHash} from 'node:crypto'
import {cp, mkdir, readFile, readdir, rm, writeFile} from 'node:fs/promises'
import {dirname, resolve} from 'node:path'

const here=import.meta.dirname
const root=resolve(here,'../../..')
const source=resolve(root,'generated/libraries/svelte')
const output=resolve(here,'package')
const assets=resolve(here,'.package-assets')
const legacy=resolve(here,'.package-legacy')
const sha256=value=>createHash('sha256').update(value).digest('hex')
const json=value=>JSON.stringify(value,null,2)+'\n'

await rm(output,{recursive:true,force:true})
await mkdir(output,{recursive:true})
for(const entry of (await readdir(source)).sort()) await cp(resolve(source,entry),resolve(output,entry),{recursive:true})
for(const file of ['styles.css','tokens.css']) await cp(resolve(assets,file),resolve(output,file))
const generated=JSON.parse(await readFile(resolve(source,'manifest.json'),'utf8'))

for(const component of generated.components){
  const symbol=component.exports[0]
  const wrapper=`export { default } from './components/${component.component}.svelte';\nexport { default as ${symbol} } from './components/${component.component}.svelte';\nexport { modelDigest } from './components/${component.component}.svelte';\n`
  await writeFile(resolve(output,`${component.component}.js`),wrapper)
  await writeFile(resolve(output,`${component.component}.d.ts`),wrapper)
}
for(const compound of generated.compoundExports){
  const relative=compound.subpath.slice(2)
  const target=resolve(output,`${relative}.js`)
  await mkdir(dirname(target),{recursive:true})
  const componentPath=`../${compound.file.replace(/^\.\//,'')}`
  const wrapper=`export { default } from '${componentPath}';\nexport { default as ${compound.binding} } from '${componentPath}';\nexport { modelDigest } from '${componentPath}';\n`
  await writeFile(target,wrapper)
  await writeFile(target.replace(/\.js$/,'.d.ts'),wrapper)
}
// Preserve the two browser-proven migration components until behavior algebra replaces them.
for(const file of ['button.js','button.d.ts','field.js','field.d.ts']) await cp(resolve(legacy,file),resolve(output,file))
for(const file of ['button.svelte','button.svelte.d.ts','field.svelte','field.svelte.d.ts']) await cp(resolve(legacy,'components',file),resolve(output,'components',file))

const packageJson=JSON.parse(await readFile(resolve(here,'package.json'),'utf8'))
const manifest={schemaVersion:3,name:packageJson.name,version:packageJson.version,framework:'svelte',algebraVersion:generated.algebraVersion,components:generated.components.map(component=>({component:component.component,symbol:component.exports[0],subpath:`./${component.component}`,modelDigest:component.modelDigest,contentBindingDigest:component.contentBindingDigest,semanticVariants:component.semanticVariants,unresolvedSemanticOperations:component.unresolvedSemanticOperations,sha256:component.sha256,exports:component.exports})),compoundExports:generated.compoundExports,exports:packageJson.exports}
await writeFile(resolve(here,'kumo.manifest.json'),json(manifest))
console.log(`built ${manifest.components.length} Svelte components and ${manifest.compoundExports.length} compounds`)
