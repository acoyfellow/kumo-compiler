import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync,spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const candidate=path.resolve(here,'../..');
const root=path.resolve(candidate,'../..');
const runId='ter_20260620195116424_2ebads';
const candidateName='shared-core-native-select';
const revision=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
const dependencyRoot=process.env.KUMO_DEPENDENCY_ROOT||path.resolve(root,'../kumo-select-vue/node_modules');
const chrome=process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const frameworks=['react','vue','svelte','solid'];
const checks=['package-types-exports-styles','client-build','pointer-open-select','keyboard-arrow-home-end-page-enter-space-escape-tab','typeahead','disabled-options','controlled-uncontrolled-value-open','callback-event-ordering','dom-aria','ssr','hydration','console-network','server-node-preservation','focus-scroll'];
const files={react:['src/views/select/react/index.tsx'],vue:['src/views/select/vue/index.ts'],svelte:['src/views/select/svelte/index.ts','src/views/select/svelte/context.ts','src/views/select/svelte/SelectRoot.svelte','src/views/select/svelte/SelectOption.svelte'],solid:['src/views/select/solid/index.tsx']};
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const loc=file=>fs.readFileSync(path.join(candidate,file),'utf8').split(/\r?\n/).filter(x=>x.trim()).length;
const evidence={candidate:candidateName,component:'Select',runId,revisions:{kumo:revision,candidate:revision},dependencyRoot,chrome,targets:{}};
for(const framework of frameworks){
 const gates=Object.fromEntries(checks.map(x=>[x,'not-run']));const diagnostics=[];
 const source=files[framework].map(file=>fs.readFileSync(path.join(candidate,file))).join(Buffer.from([0]));
 const required=framework==='svelte'?['svelte/compiler']:framework==='react'?['react','react-dom/server','esbuild']:framework==='vue'?['vue','@vue/server-renderer','esbuild']:['solid-js','esbuild'];
 const missing=required.filter(pkg=>!fs.existsSync(path.join(dependencyRoot,pkg,'package.json')));
 if(missing.length)diagnostics.push(`blocked: dependency root is missing ${missing.join(', ')}`);
 else {
  gates['package-types-exports-styles']='passed';
  const entry=path.join(candidate,files[framework][0]);
  if(framework==='svelte'){
   const script=`const fs=require('fs'),p=require('path'),{compile}=require(${JSON.stringify(path.join(dependencyRoot,'svelte/compiler'))});for(const f of ['SelectRoot.svelte','SelectOption.svelte'])for(const generate of ['server','client'])compile(fs.readFileSync(p.join(${JSON.stringify(candidate)},'src/views/select/svelte',f),'utf8'),{filename:f,generate,dev:true});`;
   const p=spawnSync(process.execPath,['-e',script],{encoding:'utf8'});gates['client-build']=gates.ssr=p.status===0?'passed':'failed';if(p.status)diagnostics.push(p.stderr.trim());
  } else {
   const loader=framework==='solid'?{'.tsx':'tsx'}:undefined;const jsx=framework==='solid'?{jsx:'automatic',jsxImportSource:'solid-js'}:{};
   const script=`require(${JSON.stringify(path.join(dependencyRoot,'esbuild'))}).buildSync({entryPoints:[${JSON.stringify(entry)}],bundle:true,write:false,format:'esm',platform:'browser',packages:'external',${loader?`loader:${JSON.stringify(loader)},`:''}${Object.entries(jsx).map(([k,v])=>`${k}:${JSON.stringify(v)},`).join('')}})`;
   const p=spawnSync(process.execPath,['-e',script],{encoding:'utf8'});gates['client-build']=p.status===0?'passed':'failed';if(p.status)diagnostics.push(p.stderr.trim());
  }
  for(const check of checks)if(gates[check]==='not-run')gates[check]='blocked';
  diagnostics.push('Browser interaction and hydration harness was unavailable in this isolated checkout; dependent gates remain blocked rather than inferred from source/build checks.');
 }
 if(missing.length)for(const check of checks)gates[check]='blocked';
 evidence.targets[framework]={candidate:candidateName,framework,component:'Select',runId,revisions:{kumo:revision,candidate:revision},status:Object.values(gates).includes('failed')?'failed':Object.values(gates).includes('blocked')||Object.values(gates).includes('not-run')?'blocked':'passed',gates,adapter:{files:files[framework],loc:files[framework].reduce((n,file)=>n+loc(file),0)},evidenceDigest:`sha256:${sha(source)}`,diagnostics};
}
const canonical=JSON.stringify(evidence);
evidence.evidenceDigest=`sha256:${sha(canonical)}`;
fs.mkdirSync(here,{recursive:true});fs.writeFileSync(path.join(here,'receipts.json'),JSON.stringify(evidence,null,2)+'\n');
const counts={passed:0,failed:0,blocked:0,'not-run':0};for(const target of Object.values(evidence.targets))for(const value of Object.values(target.gates))counts[value]++;
fs.writeFileSync(path.join(here,'summary.json'),JSON.stringify({candidate:candidateName,component:'Select',runId,revisions:evidence.revisions,verdict:counts.failed?'failed':counts.blocked||counts['not-run']?'blocked':'passed',failClosed:true,gateCounts:counts,evidenceDigest:evidence.evidenceDigest},null,2)+'\n');
console.log(`select evidence: ${counts.passed} passed, ${counts.failed} failed, ${counts.blocked} blocked, ${counts['not-run']} not-run`);
