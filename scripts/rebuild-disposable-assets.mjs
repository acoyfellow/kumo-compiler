import {cp,mkdir,readFile,rm,writeFile} from 'node:fs/promises'
import {existsSync} from 'node:fs'
import {resolve} from 'node:path'

const root=resolve(import.meta.dirname,'..')
const catalog=JSON.parse(await readFile(resolve(root,'generated/catalog.ir.json'),'utf8'))
const frameworks=['vue','svelte','solid']
for(const {id} of catalog.components){
  const canonical=resolve(root,'runtime-canonical',id,'public-runtime','assets')
  if(!existsSync(canonical))throw new Error(`${id}: canonical assets were not rebuilt`)
  const reactTarget=resolve(root,'deploy',id,'react','assets')
  await rm(reactTarget,{recursive:true,force:true});await mkdir(resolve(reactTarget,'..'),{recursive:true});await cp(canonical,reactTarget,{recursive:true})
  for(const framework of frameworks){
    const source=resolve(root,'runtime',id,framework,'public-runtime','assets')
    if(!existsSync(source))throw new Error(`${id}/${framework}: runtime assets were not rebuilt`)
    const target=resolve(root,'deploy',id,framework,'assets')
    await rm(target,{recursive:true,force:true});await mkdir(resolve(target,'..'),{recursive:true});await cp(source,target,{recursive:true})
  }
}
const packages=resolve(root,'deploy/packages')
await rm(packages,{recursive:true,force:true});await cp(resolve(root,'library-artifacts'),packages,{recursive:true})
const packageManifest=JSON.parse(await readFile(resolve(root,'library-artifacts/manifest.json'),'utf8'))
const deployManifestPath=resolve(root,'deploy-manifest.json'),deployManifest=JSON.parse(await readFile(deployManifestPath,'utf8')),packageRoute=deployManifest.routes.find(route=>route.id==='library-packages')
if(!packageRoute)throw new Error('deploy manifest package route missing')
packageRoute.artifacts=['manifest.json',...packageManifest.packages.flatMap(entry=>[entry.friendlyName,entry.artifact])]
await writeFile(deployManifestPath,JSON.stringify(deployManifest,null,2)+'\n')
console.log(`rebuilt disposable deploy assets for ${catalog.components.length} components`)
