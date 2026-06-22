import {spawnSync} from 'node:child_process'
const flows={
 contract:['node scripts/verify-package.mjs'],
 generate:['node scripts/libraries/build.mjs'],
 conformance:['node --test test/*.test.mjs'],
 package:['node dx/packages/kumo-vue/build.mjs','node dx/packages/kumo-svelte/build.mjs','node dx/packages/kumo-solid/build.mjs','node scripts/verify-package.mjs'],
 release:['npm run release:check'],
 deploy:['npm run deploy:dry-run'],
}
const name=process.argv[2], steps=flows[name]
if(!steps) throw new Error(`expected one of: ${Object.keys(flows).join(', ')}`)
for(const command of steps){const result=spawnSync(command,{cwd:new URL('..',import.meta.url),shell:true,stdio:'inherit'});if(result.status)process.exit(result.status??1)}
