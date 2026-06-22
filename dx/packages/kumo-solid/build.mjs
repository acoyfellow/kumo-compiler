import {cp, mkdir, readdir, rm} from 'node:fs/promises'
import {resolve} from 'node:path'
const here=import.meta.dirname, source=resolve(here,'../../../generated/libraries/solid'), output=resolve(here,'package')
await rm(output,{recursive:true,force:true});await mkdir(output,{recursive:true})
for(const entry of (await readdir(source)).sort()) await cp(resolve(source,entry),resolve(output,entry),{recursive:true})
console.log('built @acoyfellow/kumo-solid from generated/libraries/solid')
