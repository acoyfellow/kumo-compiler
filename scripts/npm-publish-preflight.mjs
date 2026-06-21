import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
const root=resolve(import.meta.dirname,'..'),manifest=JSON.parse(await readFile(resolve(root,'library-artifacts/manifest.json'),'utf8'));
for(const entry of manifest.packages){const tarball=resolve(root,'library-artifacts',entry.friendlyName),dir=await mkdtemp(resolve(tmpdir(),`kumo-publish-${entry.framework}-`));try{const result=spawnSync('npm',['publish',tarball,'--access','public','--dry-run','--json'],{cwd:dir,encoding:'utf8'});if(result.status!==0)throw Error(`${entry.package}: npm publish --dry-run failed\n${result.stderr}`);const output=JSON.parse(result.stdout);if(output.id!==`${entry.package}@${entry.version}`)throw Error(`${entry.package}: publish identity mismatch`);console.log(`${entry.package}@${entry.version}: npm publish dry-run passed`)}finally{await rm(dir,{recursive:true,force:true})}}
console.log('No package was published. Authentication and real npm publish remain manual.');
