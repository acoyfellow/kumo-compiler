import { mkdir, readdir, readFile, rm, utimes, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { resolve, relative } from 'node:path';
import { createHash } from 'node:crypto';

const root=resolve(import.meta.dirname,'..'), frameworks=['vue','svelte','solid'], output=resolve(root,'example-artifacts');
const run=(command,args,cwd)=>{const result=spawnSync(command,args,{cwd,stdio:'inherit'});if(result.status!==0)throw Error(`${command} ${args.join(' ')} failed (${result.status})`)};
async function files(dir){const out=[];for(const entry of await readdir(dir,{withFileTypes:true})){const path=resolve(dir,entry.name);entry.isDirectory()?out.push(...await files(path)):out.push(path)}return out}
await rm(output,{recursive:true,force:true});await mkdir(output,{recursive:true});
const receipts=[];
for(const framework of frameworks){const dir=resolve(root,'examples',framework);run('npm',['ci','--ignore-scripts','--no-audit','--no-fund'],dir);run('npm',['run','build'],dir);const sourceFiles=(await files(dir)).filter(path=>!path.includes('/node_modules/')&&!path.includes('/dist/')).sort();for(const path of sourceFiles)await utimes(path,0,0);const archive=resolve(output,`kumo-${framework}-example.zip`);run('zip',['-q','-X','-r',archive,...sourceFiles.map(path=>relative(dir,path))],dir);const bytes=await readFile(archive),sha256=createHash('sha256').update(bytes).digest('hex');const built=(await files(resolve(dir,'dist'))).map(path=>relative(resolve(dir,'dist'),path)).sort();receipts.push({framework,status:'passed',packageUrl:JSON.parse(await readFile(resolve(dir,'package.json'),'utf8')).dependencies[`@cloudflare/kumo-${framework}`],archive:`kumo-${framework}-example.zip`,bytes:bytes.length,sha256,built});}
const receipt={schemaVersion:1,status:'passed',examples:receipts};receipt.receiptHash=createHash('sha256').update(JSON.stringify(receipt)).digest('hex');await writeFile(resolve(output,'manifest.json'),JSON.stringify(receipt,null,2)+'\n');console.log(`Built ${receipts.length} complete example projects (${receipt.receiptHash})`);
