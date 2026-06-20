import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdir,readFile,stat,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {inflateSync} from 'node:zlib';
import {manifest,frameworks as allFrameworks} from './catalog-browser-manifest.mjs';

const hash=x=>createHash('sha256').update(x).digest('hex');
export function validateEvidence(e){
 if(e?.schemaVersion!=='kumo.browser-evidence/v1'||e.synthetic===true)throw Error('synthetic or invalid browser evidence');
 for(const k of ['runtime','console','network','dom','aria','behavior','ssr','hydration','screenshot','pixels','assets','styles','package','provenance'])if(e.checks?.[k]!==true)throw Error(`missing proof check: ${k}`);
 if(!e.screenshot?.sha256||!e.screenshot?.pixelSha256||!e.snapshots?.preHydration||!e.snapshots?.postHydration)throw Error('missing browser artifacts');
 if(e.failures?.length)throw Error(`browser failures: ${e.failures.join('; ')}`);
 return true;
}
const sleep=n=>new Promise(r=>setTimeout(r,n));
async function connect(wsUrl){
 const ws=new WebSocket(wsUrl),pending=new Map();let seq=0;await new Promise((ok,no)=>{ws.onopen=ok;ws.onerror=no});
 ws.onmessage=({data})=>{const m=JSON.parse(data);if(m.id&&pending.has(m.id)){pending.get(m.id)(m);pending.delete(m.id)}else onEvent(m)};
 const listeners=[];function onEvent(m){for(const f of listeners)f(m)}
 const send=(method,params={})=>new Promise((ok,no)=>{const id=++seq;pending.set(id,m=>m.error?no(Error(m.error.message)):ok(m.result));ws.send(JSON.stringify({id,method,params}))});
 return {send,on:f=>listeners.push(f),close:()=>ws.close()};
}
export function hasSuccessfulNetworkEvidence({responses=[],failedRequests=[]}){
 return failedRequests.length===0&&responses.length>0&&responses.every(x=>x.status>=200&&x.status<400);
}
async function chromium(url,chrome){
 const port=46000+Math.floor(Math.random()*1000),proc=spawn(chrome,['--headless=new','--no-sandbox','--disable-gpu','--hide-scrollbars','--window-size=900,700',`--remote-debugging-port=${port}`,'about:blank'],{stdio:'ignore'});
 try{
  let endpoint;for(let i=0;i<60;i++){try{endpoint=await (await fetch(`http://127.0.0.1:${port}/json/version`)).json();break}catch{await sleep(50)}}if(!endpoint)throw Error('Chromium debugging endpoint unavailable');
  // Attach to a blank target before navigation. Creating the target at `url`
  // races Network.enable, and a subsequent same-URL Page.navigate can be a no-op,
  // leaving a healthy page with zero captured requests.
  const target=await (await fetch(`http://127.0.0.1:${port}/json/new?about%3Ablank`,{method:'PUT'})).json(),cdp=await connect(target.webSocketDebuggerUrl);
  const consoleMessages=[],pageErrors=[],failedRequests=[],responses=[];
  cdp.on(m=>{if(m.method==='Runtime.consoleAPICalled'&&['error','warning'].includes(m.params.type))consoleMessages.push(m.params.type);if(m.method==='Runtime.exceptionThrown')pageErrors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);if(m.method==='Network.loadingFailed')failedRequests.push(m.params.errorText);if(m.method==='Network.responseReceived')responses.push({url:m.params.response.url,status:m.params.response.status,mime:m.params.response.mimeType})});
  await Promise.all(['Page.enable','Runtime.enable','Network.enable'].map(x=>cdp.send(x)));await cdp.send('Page.navigate',{url});await sleep(900);
  const expression=`(()=>{const a=[...document.querySelectorAll('[role],[aria-label],[aria-expanded],[aria-selected],[aria-checked]')].map(e=>({tag:e.tagName.toLowerCase(),role:e.getAttribute('role'),label:e.getAttribute('aria-label'),expanded:e.getAttribute('aria-expanded'),selected:e.getAttribute('aria-selected'),checked:e.getAttribute('aria-checked')}));const b=document.querySelector('button,[role=button],input,select,a');if(b){b.focus();b.click();b.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}))}return {html:document.documentElement.outerHTML,aria:a,behavior:{target:!!b,active:document.activeElement?.tagName,checked:b?.checked??null},styles:[...document.styleSheets].map(s=>s.href||'inline')}})()`;
  const post=(await cdp.send('Runtime.evaluate',{expression,returnByValue:true})).result.value;await sleep(100);
  const shot=await cdp.send('Page.captureScreenshot',{format:'png'});cdp.close();
  return {png:Buffer.from(shot.data,'base64'),post,consoleMessages,pageErrors,failedRequests,responses};
 }finally{proc.kill('SIGKILL')}
}
function pngPixelHash(png){
 if(png.readUInt32BE(0)!==0x89504e47)throw Error('invalid PNG screenshot');let p=8,width,height,type,idat=[];
 while(p<png.length){const n=png.readUInt32BE(p),kind=png.toString('ascii',p+4,p+8),data=png.subarray(p+8,p+8+n);p+=12+n;if(kind==='IHDR'){width=data.readUInt32BE(0);height=data.readUInt32BE(4);type=data[9]}if(kind==='IDAT')idat.push(data);if(kind==='IEND')break}
 const bpp=type===6?4:type===2?3:0;if(!bpp)throw Error(`unsupported screenshot PNG color type ${type}`);const raw=inflateSync(Buffer.concat(idat)),stride=width*bpp,out=Buffer.alloc(stride*height);let at=0;
 for(let y=0;y<height;y++){const filter=raw[at++];for(let x=0;x<stride;x++){const v=raw[at++],left=x>=bpp?out[y*stride+x-bpp]:0,up=y?out[(y-1)*stride+x]:0,ul=y&&x>=bpp?out[(y-1)*stride+x-bpp]:0;let q=v;if(filter===1)q+=left;else if(filter===2)q+=up;else if(filter===3)q+=Math.floor((left+up)/2);else if(filter===4){const z=left+up-ul,pa=Math.abs(z-left),pb=Math.abs(z-up),pc=Math.abs(z-ul);q+=pa<=pb&&pa<=pc?left:pb<=pc?up:ul}else if(filter!==0)throw Error(`unsupported PNG filter ${filter}`);out[y*stride+x]=q&255}}
 return hash(out);
}
async function immutableWrite(path,body){await mkdir(resolve(path,'..'),{recursive:true});try{const old=await readFile(path);if(!old.equals(body))throw Error(`immutable evidence collision: ${path}`)}catch(e){if(e.code!=='ENOENT')throw e;await writeFile(path,body,{flag:'wx'})}}
export async function run({frameworks=allFrameworks,ids=manifest.components.map(x=>x.id),base=process.env.PROOF_BASE||'http://127.0.0.1:4260',chrome=process.env.CHROME||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',out='generated/browser-evidence'}={}){
 for(const framework of frameworks)if(!allFrameworks.includes(framework))throw Error(`unknown framework ${framework}`);
 for(const component of manifest.components.filter(x=>ids.includes(x.id)))for(const framework of frameworks){
  const dir=resolve(`runtime/${component.id}/${framework}`),built=resolve(dir,'public-runtime/index.html'),pre=await readFile(built,'utf8'),provenance=JSON.parse(await readFile(resolve(dir,'provenance.json'),'utf8')),pkg=JSON.parse(await readFile('package.json','utf8'));await stat(resolve(dir,'vite.config.mjs'));
  if(!pre.includes('<main')||provenance.framework!==framework||!pkg.devDependencies?.vite)throw Error(`${component.id}/${framework}: invalid built package/provenance/SSR`);
  const url=base+component.route.replace('{framework}',framework),r=await chromium(url,chrome),failures=[...r.consoleMessages,...r.pageErrors,...r.failedRequests,...r.responses.filter(x=>x.status>=400).map(x=>`${x.status} ${x.url}`)];
  const assets=r.responses.filter(x=>/javascript|css/.test(x.mime)),hasStyle=r.post.styles.length>0||pre.includes('<style');
  if(!r.post.html.includes('<main')||!assets.some(x=>/javascript/.test(x.mime))||!hasStyle)failures.push('runtime DOM, linked asset, or style missing');
  const evidence={schemaVersion:'kumo.browser-evidence/v1',synthetic:false,component:component.id,framework,url,checks:{runtime:true,console:!r.consoleMessages.length,network:hasSuccessfulNetworkEvidence(r),dom:r.post.html.includes('<main'),aria:Array.isArray(r.post.aria),behavior:!component.behavior||r.post.behavior.target,ssr:pre.includes('<main'),hydration:r.post.html.includes('<main'),screenshot:r.png.length>1000,pixels:true,assets:assets.length>0,styles:hasStyle,package:!!pkg.devDependencies.vite,provenance:provenance.framework===framework},snapshots:{preHydration:hash(pre),postHydration:hash(r.post.html),aria:r.post.aria,behaviorVector:{policy:component.behavior?.kind||null,...r.post.behavior}},screenshot:{sha256:hash(r.png),pixelSha256:pngPixelHash(r.png),bytes:r.png.length},assets,failures};
  validateEvidence(evidence);const digest=hash(JSON.stringify(evidence));await immutableWrite(resolve(out,framework,component.id,digest,'evidence.json'),Buffer.from(JSON.stringify(evidence,null,2)+'\n'));await immutableWrite(resolve(out,framework,component.id,digest,'screenshot.png'),r.png);
 }
}
if(import.meta.url===`file://${process.argv[1]}`){const arg=n=>process.argv.find(x=>x.startsWith(`--${n}=`))?.split('=')[1];await run({frameworks:arg('frameworks')?.split(',')||allFrameworks,ids:arg('components')?.split(',')||undefined});console.log('catalog browser proof passed')}
