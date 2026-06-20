import {cp,mkdir,readFile,rm,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'../..');
const frameworks=['vue','svelte','solid'];
const run=(cmd,args,cwd=root)=>execFileSync(cmd,args,{cwd,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
const receipts=[];
for(const framework of frameworks){
 const source=resolve(root,'dx/packages/kumo-'+framework), stage=resolve(source,'dist'); await rm(stage,{recursive:true,force:true}); await mkdir(stage,{recursive:true});
 const shared=resolve(root,'candidates/shared-core/src/views'); await cp(resolve(shared,'native.ts'),resolve(stage,'native.ts'));
 if(framework==='svelte'){for(const f of ['Button.svelte','Field.svelte','Tabs.svelte','index.ts']) await cp(resolve(shared,'svelte',f),resolve(stage,f));}
 else {const f=framework==='solid'?'components.tsx':'index.ts'; await cp(resolve(shared,framework,f),resolve(stage,f)); if(framework==='solid') await cp(resolve(shared,framework,'index.ts'),resolve(stage,'index.ts'));}
 await cp(resolve(root,'candidates/shared-core/styles.css'),resolve(stage,'styles.css')); await writeFile(resolve(stage,'tokens.css'),':root{--kumo-component-source:shared-core}\n');
 const manifest=JSON.parse(await readFile(resolve(source,'kumo.manifest.json'))); manifest.ownership={authority:'candidates/shared-core',scope:['Button','Field','Tabs'],pilot:true,publishReady:false}; await writeFile(resolve(source,'kumo.manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 const pkg=JSON.parse(await readFile(resolve(source,'package.json'))); pkg.version='0.0.0-consumer-dx-pilot'; pkg.private=true; pkg.files=['dist','kumo.manifest.json']; pkg.exports={'.':{types:'./dist/index.ts',import:'./dist/index.ts'},'./button':{types:'./dist/index.ts',import:'./dist/index.ts'},'./field':{types:'./dist/index.ts',import:'./dist/index.ts'},'./tabs':{types:'./dist/index.ts',import:'./dist/index.ts'},'./styles.css':'./dist/styles.css','./tokens.css':'./dist/tokens.css','./manifest':'./kumo.manifest.json'}; await writeFile(resolve(source,'package.json'),JSON.stringify(pkg,null,2)+'\n');
 const out=run('npm',['pack','--json','--pack-destination',resolve(root,'proof/dx')],source); const packed=JSON.parse(out)[0]; const tar=resolve(root,'proof/dx',packed.filename); const bytes=await readFile(tar); receipts.push({framework,package:pkg.name,version:pkg.version,frameworkVersion:pkg.peerDependencies[framework],status:'passed',case:'packed-tarball',command:`npm pack --json --pack-destination proof/dx`,tarball:`proof/dx/${packed.filename}`,sha256:createHash('sha256').update(bytes).digest('hex')});
}
for(const framework of frameworks){for(const name of ['exports-and-root-subpaths','types','vite-production-build','server-import-ssr','hydration-warnings-node-preservation','hmr-dev-smoke','css-once','tree-shaking-metafile']) receipts.push({framework,case:name,status:'not-run',command:null,reason:'Requires installing framework toolchain in isolated fixture; pilot records this truthfully.'});}
receipts.push({framework:'npm-workspace',case:'workspace-fixture',status:'not-run',command:null,reason:'Fixture scaffolded; install not executed.'});
await writeFile(resolve(root,'proof/dx/consumer-receipts.json'),JSON.stringify({schemaVersion:1,publishReady:false,receipts},null,2)+'\n');
console.log(`packed ${frameworks.length} pilot packages; wrote ${receipts.length} receipts`);
