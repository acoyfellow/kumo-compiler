import {spawnSync} from 'node:child_process'
import {fileURLToPath} from 'node:url'

const root=fileURLToPath(new URL('..',import.meta.url))
const flows={
  contract:[
    [process.execPath,['--test','test/observable-contracts.test.mjs','test/observable-status.test.mjs']],
  ],
  generate:[
    [process.execPath,['scripts/build-visual-contract.mjs']],
    [process.execPath,['src/kumo/library/generate.mjs']],
    [process.execPath,['src/kumo/emitters/vue/index.mjs']],
    [process.execPath,['src/kumo/emitters/svelte/index.mjs']],
    [process.execPath,['src/kumo/emitters/solid/generate.mjs']],
  ],
  conformance:[
    ['npm',['test']],
  ],
  package:[
    [process.execPath,['--test','test/library-artifacts.test.mjs']],
  ],
  release:[
    ['npm',['run','release:check']],
  ],
}
const name=process.argv[2],steps=flows[name]
if(!steps)throw new Error(`expected one of: ${[...Object.keys(flows),'deploy'].join(', ')}`)
for(const[command,args]of steps){const result=spawnSync(command,args,{cwd:root,stdio:'inherit'});if(result.status)process.exit(result.status??1)}
