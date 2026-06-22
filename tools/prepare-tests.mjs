import {spawnSync} from 'node:child_process'
import {fileURLToPath} from 'node:url'

const root=fileURLToPath(new URL('..',import.meta.url))
const commands=[
  [process.execPath,['src/kumo/library/generate.mjs']],
  [process.execPath,['src/kumo/emitters/vue/index.mjs']],
  [process.execPath,['src/kumo/emitters/svelte/index.mjs']],
  [process.execPath,['src/kumo/emitters/solid/generate.mjs']],
  [process.execPath,['scripts/libraries/build.mjs']],
  [process.execPath,['scripts/build-from-manifest.mjs','runtimes']],
  [process.execPath,['scripts/build-canonical-react-runtimes.mjs']],
  [process.execPath,['scripts/rebuild-disposable-assets.mjs']],
]
for(const[command,args]of commands){const result=spawnSync(command,args,{cwd:root,stdio:'inherit'});if(result.status)process.exit(result.status??1)}
