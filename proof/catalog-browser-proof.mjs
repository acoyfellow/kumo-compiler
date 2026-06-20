import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import {existsSync} from 'node:fs';
import {mkdir,mkdtemp,readFile,rename,rm,stat,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname,resolve} from 'node:path';
import {inflateSync} from 'node:zlib';
import {manifest,frameworks as allFrameworks} from './catalog-browser-manifest.mjs';

const hash=x=>createHash('sha256').update(x).digest('hex');
export function validateEvidence(e){
 if(!['kumo.browser-evidence/v1','kumo.browser-evidence/v2'].includes(e?.schemaVersion)||e.synthetic===true)throw Error('synthetic or invalid browser evidence');
 if(e.schemaVersion==='kumo.browser-evidence/v2'&&(!e.browser?.executable||!e.browser?.product||!e.browser?.userAgent||!e.browser?.protocolVersion))throw Error('missing browser version provenance');
 for(const k of ['runtime','console','network','dom','aria','behavior','ssr','hydration','screenshot','pixels','assets','styles','package','provenance'])if(e.checks?.[k]!==true)throw Error(`missing proof check: ${k}`);
 if(!e.screenshot?.sha256||!e.screenshot?.pixelSha256||!e.snapshots?.preHydration||!e.snapshots?.postHydration)throw Error('missing browser artifacts');
 if(e.failures?.length)throw Error(`browser failures: ${e.failures.join('; ')}`);
 return true;
}
const sleep=n=>new Promise(r=>setTimeout(r,n));
const TIMEOUT=Number(process.env.PROOF_TIMEOUT_MS||10000);
const bounded=(promise,label,ms=TIMEOUT)=>Promise.race([promise,new Promise((_,reject)=>setTimeout(()=>reject(Error(`${label} timed out after ${ms}ms`)),ms))]);
const fetchBounded=(url,options={})=>fetch(url,{...options,signal:AbortSignal.timeout(TIMEOUT)});
async function connect(wsUrl){
 const ws=new WebSocket(wsUrl),pending=new Map(),listeners=[];let seq=0,closed=false;
 await bounded(new Promise((ok,no)=>{ws.onopen=ok;ws.onerror=()=>no(Error('CDP WebSocket connection failed'))}),'CDP WebSocket connection');
 function rejectPending(error){for(const {no} of pending.values())no(error);pending.clear()}
 ws.onclose=()=>{closed=true;rejectPending(Error('CDP WebSocket closed'))};ws.onerror=()=>rejectPending(Error('CDP WebSocket failed'));
 ws.onmessage=({data})=>{const m=JSON.parse(data);if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);m.error?p.no(Error(m.error.message)):p.ok(m.result)}else for(const f of listeners)f(m)};
 const send=(method,params={})=>bounded(new Promise((ok,no)=>{if(closed)return no(Error('CDP WebSocket is closed'));const id=++seq;pending.set(id,{ok,no});ws.send(JSON.stringify({id,method,params}))}),`CDP ${method}`);
 return {send,on:f=>listeners.push(f),close:()=>{closed=true;rejectPending(Error('CDP connection closed'));ws.close()}};
}
export function hasSuccessfulNetworkEvidence({responses=[],failedRequests=[]}){
 return failedRequests.length===0&&responses.length>0&&responses.every(x=>x.status>=200&&x.status<400);
}
export function isRetryableBrowserInfrastructureError(error){
 return /Chromium exited before startup|debugging endpoint unavailable|CDP (?:WebSocket|connection|Page\.|Runtime\.|Network\.).*(?:closed|failed|timed out)|fetch failed|ECONNREFUSED/i.test(String(error?.message||error));
}
export async function withBrowserInfrastructureRetries(operation,{maxRetries=2,delayMs=50}={}){
 let attempt=0;for(;;){try{return await operation(attempt)}catch(error){if(attempt>=maxRetries||!isRetryableBrowserInfrastructureError(error))throw error;attempt++;await sleep(delayMs)}}
}
async function chromium(url,chrome,profileRoot){
 await mkdir(profileRoot||tmpdir(),{recursive:true});
 const profile=await mkdtemp(resolve(profileRoot||tmpdir(),'kumo-browser-')),portFile=resolve(profile,'DevToolsActivePort');
 const args=['--headless=new','--disable-gpu','--hide-scrollbars','--window-size=900,700','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'];
 // Chrome's sandbox is supported on macOS/Linux when not running as root.
 if(process.platform==='linux'&&process.getuid?.()===0)args.unshift('--no-sandbox');
 const proc=spawn(chrome,args,{stdio:'ignore'});let cdp;
 try{
  const deadline=Date.now()+TIMEOUT;let port;
  while(Date.now()<deadline){if(proc.exitCode!==null)throw Error(`Chromium exited before startup (${proc.exitCode})`);try{port=Number((await readFile(portFile,'utf8')).split('\n')[0]);if(port)break}catch{}await sleep(50)}
  if(!port)throw Error('Chromium debugging endpoint unavailable');
  const version=await (await fetchBounded(`http://127.0.0.1:${port}/json/version`)).json();
  // Attach to a blank target before navigation. Creating the target at `url`
  // races Network.enable, and a subsequent same-URL Page.navigate can be a no-op,
  // leaving a healthy page with zero captured requests.
  const target=await (await fetchBounded(`http://127.0.0.1:${port}/json/new?about%3Ablank`,{method:'PUT'})).json();cdp=await connect(target.webSocketDebuggerUrl);
  const consoleMessages=[],pageErrors=[],failedRequests=[],responses=[];
  cdp.on(m=>{if(m.method==='Runtime.consoleAPICalled'&&['error','warning'].includes(m.params.type))consoleMessages.push(`${m.params.type}: ${m.params.args?.map(x=>x.value??x.description??x.type).join(' ')||'unknown console message'}`);if(m.method==='Runtime.exceptionThrown')pageErrors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);if(m.method==='Network.loadingFailed')failedRequests.push(m.params.errorText);if(m.method==='Network.responseReceived')responses.push({url:m.params.response.url,status:m.params.response.status,mime:m.params.response.mimeType})});
  await Promise.all(['Page.enable','Runtime.enable','Network.enable'].map(x=>cdp.send(x)));await cdp.send('Page.navigate',{url});await sleep(900);
  const expression=`(()=>{const a=[...document.querySelectorAll('[role],[aria-label],[aria-expanded],[aria-selected],[aria-checked]')].map(e=>({tag:e.tagName.toLowerCase(),role:e.getAttribute('role'),label:e.getAttribute('aria-label'),expanded:e.getAttribute('aria-expanded'),selected:e.getAttribute('aria-selected'),checked:e.getAttribute('aria-checked')}));const b=document.querySelector('button,[role=button],input,select,a');if(b){b.focus();b.click();b.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}))}return {html:document.documentElement.outerHTML,aria:a,behavior:{target:!!b,active:document.activeElement?.tagName,checked:b?.checked??null},styles:[...document.styleSheets].map(s=>s.href||'inline')}})()`;
  const post=(await cdp.send('Runtime.evaluate',{expression,returnByValue:true})).result.value;await sleep(100);
  const shot=await cdp.send('Page.captureScreenshot',{format:'png'});
  return {png:Buffer.from(shot.data,'base64'),post,consoleMessages,pageErrors,failedRequests,responses,browser:{executable:chrome,product:version.Browser,userAgent:version['User-Agent'],protocolVersion:version['Protocol-Version']}};
 }finally{cdp?.close();if(proc.exitCode===null){proc.kill('SIGTERM');await Promise.race([new Promise(r=>proc.once('exit',r)),sleep(1000)]);if(proc.exitCode===null)proc.kill('SIGKILL')}await rm(profile,{recursive:true,force:true})}
}
function pngPixelHash(png){
 if(png.readUInt32BE(0)!==0x89504e47)throw Error('invalid PNG screenshot');let p=8,width,height,type,idat=[];
 while(p<png.length){const n=png.readUInt32BE(p),kind=png.toString('ascii',p+4,p+8),data=png.subarray(p+8,p+8+n);p+=12+n;if(kind==='IHDR'){width=data.readUInt32BE(0);height=data.readUInt32BE(4);type=data[9]}if(kind==='IDAT')idat.push(data);if(kind==='IEND')break}
 const bpp=type===6?4:type===2?3:0;if(!bpp)throw Error(`unsupported screenshot PNG color type ${type}`);const raw=inflateSync(Buffer.concat(idat)),stride=width*bpp,out=Buffer.alloc(stride*height);let at=0;
 for(let y=0;y<height;y++){const filter=raw[at++];for(let x=0;x<stride;x++){const v=raw[at++],left=x>=bpp?out[y*stride+x-bpp]:0,up=y?out[(y-1)*stride+x]:0,ul=y&&x>=bpp?out[(y-1)*stride+x-bpp]:0;let q=v;if(filter===1)q+=left;else if(filter===2)q+=up;else if(filter===3)q+=Math.floor((left+up)/2);else if(filter===4){const z=left+up-ul,pa=Math.abs(z-left),pb=Math.abs(z-up),pc=Math.abs(z-ul);q+=pa<=pb&&pa<=pc?left:pb<=pc?up:ul}else if(filter!==0)throw Error(`unsupported PNG filter ${filter}`);out[y*stride+x]=q&255}}
 return hash(out);
}
async function immutableWrite(path,body){await mkdir(resolve(path,'..'),{recursive:true});try{const old=await readFile(path);if(!old.equals(body))throw Error(`immutable evidence collision: ${path}`)}catch(e){if(e.code!=='ENOENT')throw e;await writeFile(path,body,{flag:'wx'})}}
const defaultChrome=()=>['/Applications/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing','/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find(existsSync)||'google-chrome';
export async function run({frameworks=allFrameworks,ids=manifest.components.map(x=>x.id),base=process.env.PROOF_BASE||'http://127.0.0.1:4260',chrome=process.env.CHROME||defaultChrome(),root=process.cwd(),out='generated/browser-evidence',summary:summaryPath,profileRoot}={}){
 root=resolve(root);out=resolve(root,out);summaryPath=summaryPath&&resolve(root,summaryPath);profileRoot=profileRoot&&resolve(root,profileRoot);
 for(const framework of frameworks)if(!allFrameworks.includes(framework))throw Error(`unknown framework ${framework}`);
 const results=[];
 for(const component of manifest.components.filter(x=>ids.includes(x.id)))for(const framework of frameworks){
  try{
  const canonical=framework==='react',dir=resolve(root,canonical?`runtime-canonical/${component.id}`:`runtime/${component.id}/${framework}`),built=resolve(dir,'public-runtime/index.html'),pre=await readFile(built,'utf8'),provenance=canonical?JSON.parse(await readFile(resolve(root,'audit/kumo-react-2.5.2.provenance.json'),'utf8')):JSON.parse(await readFile(resolve(dir,'provenance.json'),'utf8')),pkg=JSON.parse(await readFile(resolve(root,'package.json'),'utf8'));await stat(resolve(dir,'vite.config.mjs'));
  const provenanceOk=canonical?provenance.package?.name==='@cloudflare/kumo':provenance.framework===framework;
  if(!pre.includes('<main')||!provenanceOk||!pkg.devDependencies?.vite)throw Error(`${component.id}/${framework}: invalid built package/provenance/SSR`);
  const url=base+component.route.replace('{framework}',framework),r=await withBrowserInfrastructureRetries(()=>chromium(url,chrome,profileRoot)),failures=[...r.consoleMessages,...r.pageErrors,...r.failedRequests,...r.responses.filter(x=>x.status>=400).map(x=>`${x.status} ${x.url}`)];
  const assets=r.responses.filter(x=>/javascript|css/.test(x.mime)),hasStyle=r.post.styles.length>0||pre.includes('<style');
  if(!r.post.html.includes('<main')||!assets.some(x=>/javascript/.test(x.mime))||!hasStyle)failures.push('runtime DOM, linked asset, or style missing');
  const evidence={schemaVersion:'kumo.browser-evidence/v2',synthetic:false,component:component.id,framework,url,browser:r.browser,checks:{runtime:true,console:!r.consoleMessages.length,network:hasSuccessfulNetworkEvidence(r),dom:r.post.html.includes('<main'),aria:Array.isArray(r.post.aria),behavior:!component.behavior||r.post.behavior.target,ssr:pre.includes('<main'),hydration:r.post.html.includes('<main'),screenshot:r.png.length>1000,pixels:true,assets:assets.length>0,styles:hasStyle,package:!!pkg.devDependencies.vite,provenance:provenanceOk},snapshots:{preHydration:hash(pre),postHydration:hash(r.post.html),aria:r.post.aria,behaviorVector:{policy:component.behavior?.kind||null,...r.post.behavior}},screenshot:{sha256:hash(r.png),pixelSha256:pngPixelHash(r.png),bytes:r.png.length},assets,failures};
  const digest=hash(JSON.stringify(evidence));await immutableWrite(resolve(out,framework,component.id,digest,'evidence.json'),Buffer.from(JSON.stringify(evidence,null,2)+'\n'));await immutableWrite(resolve(out,framework,component.id,digest,'screenshot.png'),r.png);validateEvidence(evidence);results.push({component:component.id,framework,status:'passed',evidence:`${out}/${framework}/${component.id}/${digest}/evidence.json`});
  }catch(error){results.push({component:component.id,framework,status:'failed',error:String(error?.stack||error)});console.error(`${component.id}/${framework}: ${error.message}`)}
 }
 const runId=`${new Date().toISOString().replace(/[:.]/g,'-')}-${process.pid}`,summary={schemaVersion:'kumo.browser-proof-run/v2',runId,createdAt:new Date().toISOString(),frameworks,components:ids,browserExecutable:chrome,results};
 const runPath=summaryPath||resolve(out,'runs',`${runId}.json`);await mkdir(dirname(runPath),{recursive:true});await writeFile(runPath,JSON.stringify(summary,null,2)+'\n',{flag:'wx'});
 if(!summaryPath){const latest=resolve(out,'run-summary.json'),temporary=`${latest}.${runId}.tmp`;await writeFile(temporary,JSON.stringify(summary,null,2)+'\n');await rename(temporary,latest);}
 return results;
}
if(import.meta.url===`file://${process.argv[1]}`){const arg=n=>process.argv.find(x=>x.startsWith(`--${n}=`))?.slice(n.length+3);const results=await run({frameworks:arg('frameworks')?.split(',')||allFrameworks,ids:(arg('components')||arg('component'))?.split(',')||undefined,root:arg('root')||process.cwd(),out:arg('output')||arg('out')||'generated/browser-evidence',summary:arg('summary'),profileRoot:arg('profile')});const failed=results.filter(x=>x.status!=='passed');if(failed.length){console.error(`catalog browser proof failed: ${failed.length}/${results.length} targets`);process.exitCode=1}else console.log(`catalog browser proof passed: ${results.length} targets`)}
