#!/usr/bin/env node
import path from 'node:path';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { PACKAGE,FRAMEWORKS,contained,diffInventories,extractTarball,fetchVersion,inventory,sha,stable,writeImmutable } from './upstream/lib.mjs';

const ROOT=path.resolve(new URL('..',import.meta.url).pathname);
export function parseArgs(argv){const o={scenario:'real'};for(let i=0;i<argv.length;i++){const k=argv[i];if(!['--from','--to','--scenario','--out'].includes(k))throw new Error(`unknown argument: ${k}`);if(!argv[i+1]||argv[i+1].startsWith('--'))throw new Error(`missing value: ${k}`);o[k.slice(2)]=argv[++i];}if(!o.from||!o.to)throw new Error('--from and --to are required');if(!['real','synthetic-export-break'].includes(o.scenario))throw new Error(`unknown scenario: ${o.scenario}`);return o;}
export async function run(opts){
 const workspace=await mkdtemp(path.join(tmpdir(),'kumo-upstream-check-')); const requested=opts.out?path.resolve(process.cwd(),opts.out):path.join(workspace,'result');
 if(!contained(ROOT,requested)&&!contained(workspace,requested))throw new Error('--out must be inside the repository or isolated workspace');
 const before=gitTree();
 try{const oldFetched=await fetchVersion(opts.from),newFetched=await fetchVersion(opts.to);const oldDir=path.join(workspace,'old'),newDir=path.join(workspace,'new');await extractTarball(oldFetched.body,oldDir);await extractTarball(newFetched.body,newDir);const oldInv=await inventory(oldDir),newInv=await inventory(newDir);
  if(oldInv.package.name!==PACKAGE||oldInv.package.version!==opts.from||newInv.package.name!==PACKAGE||newInv.package.version!==opts.to)throw new Error('extracted package identity mismatch');
  if(opts.scenario==='synthetic-export-break'){const pkgPath=path.join(newDir,'package.json'),pkg=JSON.parse(await readFile(pkgPath,'utf8'));if(typeof pkg.exports==='object'&&pkg.exports){const key=Object.keys(pkg.exports).sort()[0];if(!key)throw new Error('fixture has no export to mutate');delete pkg.exports[key];}else{delete pkg.main;}await writeFile(pkgPath,JSON.stringify(pkg,null,2)+'\n');Object.assign(newInv,await inventory(newDir));}
  const changes=diffInventories(oldInv,newInv);const ids=new Set();for(const c of changes){const m=c.path.match(/(?:components?|exports|declarations)\.([\w-]+)/);if(m)ids.add(m[1].replace(/([a-z])([A-Z])/g,'$1-$2').toLowerCase());}const affected=[...ids].sort();
  const targets=FRAMEWORKS.map(framework=>({framework,componentIds:affected,status:affected.length?'blocked':'not-run',reason:affected.length?'upstream package semantics cannot safely update hand-authored IR':'no mapped component change',outputHashes:[]}));
  const source={revision:gitRevision(),treeDigest:sha(before)};const core={schemaVersion:'kumo.upstream.receipt/v1',scenario:opts.scenario,status:changes.some(c=>c.impact==='breaking')?'blocked':'passed',source,package:PACKAGE,baseline:pkgRecord(oldFetched),candidate:pkgRecord(newFetched),inventories:{baseline:oldInv,candidate:newInv},diff:{changes,affectedComponentIds:affected},authority:{status:affected.length?'failed':'passed',failClosed:true,selectedAuthorityMutated:false,cells:targets.map(t=>({framework:t.framework,status:t.status,reason:t.reason}))},targets,behavior:{status:'not-run',reason:'no explicit behavior vector selected'},dom:{status:'not-run',reason:'no explicit DOM vector selected'},commands:[`node scripts/upstream-check.mjs --from ${opts.from} --to ${opts.to} --scenario ${opts.scenario}`]};const receipt={...core,receiptSha256:sha(stable(core))};await mkdir(requested,{recursive:true});await writeImmutable(path.join(requested,'receipt.json'),JSON.stringify(receipt,null,2)+'\n');if(gitTree()!==before)throw new Error('main worktree changed during isolated run');return {receipt,out:requested};
 }finally{if(!opts.out)await rm(workspace,{recursive:true,force:true});}
}
function pkgRecord(x){return {version:x.metadata.version,resolved:x.metadata.dist.tarball,integrity:x.metadata.dist.integrity,tarballSha256:x.sha256};}
function gitRevision(){try{return execFileSync('git',['rev-parse','HEAD'],{cwd:ROOT,encoding:'utf8'}).trim()}catch{return 'unknown'}}
function gitTree(){try{return execFileSync('git',['status','--porcelain=v1','--untracked-files=no'],{cwd:ROOT,encoding:'utf8'})}catch{return ''}}
if(import.meta.url===new URL(`file://${process.argv[1]}`).href){try{const r=await run(parseArgs(process.argv.slice(2)));console.log(JSON.stringify({status:r.receipt.status,out:r.out,receiptSha256:r.receipt.receiptSha256}));if(r.receipt.status!=='passed')process.exitCode=2;}catch(e){console.error(e.message);process.exitCode=1;}}
