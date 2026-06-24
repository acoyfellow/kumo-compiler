import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {resolve} from 'node:path';

const root=resolve(import.meta.dirname,'..');
const origin=process.env.KUMO_SMOKE_ORIGIN||'http://127.0.0.1:4321';
const chrome=process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const catalog=JSON.parse(await readFile(resolve(root,'generated/catalog.ir.json'),'utf8'));
const names=catalog.components.map(x=>x.id).sort();

async function browser(){
 const profile=`/tmp/kumo-native-fidelity-${process.pid}-${Date.now()}`;
 const child=spawn(chrome,['--headless=new','--no-first-run','--disable-extensions',`--user-data-dir=${profile}`,'--remote-debugging-port=0','about:blank'],{stdio:'ignore'});
 let port;for(let i=0;i<100;i++){try{port=(await readFile(`${profile}/DevToolsActivePort`,'utf8')).split(/\s/)[0];break}catch{await sleep(50)}}
 if(!port)throw new Error('Chrome CDP unavailable');
 const pages=await fetch(`http://127.0.0.1:${port}/json`).then(r=>r.json());
 const ws=new WebSocket(pages.find(x=>x.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
 let id=0;const pending=new Map(),diagnostics=[];
 ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){pending.get(m.id)?.(m);pending.delete(m.id);return}if(m.method==='Runtime.exceptionThrown')diagnostics.push({kind:'exception',text:m.params.exceptionDetails?.text});if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')diagnostics.push({kind:'console',text:m.params.args.map(x=>x.value??x.description).join(' ')});if(m.method==='Network.loadingFailed')diagnostics.push({kind:'network',text:m.params.errorText});if(m.method==='Network.responseReceived'&&m.params.response.status>=400)diagnostics.push({kind:'http',status:m.params.response.status,url:m.params.response.url})};
 const send=(method,params={})=>new Promise((ok,no)=>{const n=++id;pending.set(n,m=>m.error?no(new Error(m.error.message)):ok(m.result));ws.send(JSON.stringify({id:n,method,params}))});
 await send('Runtime.enable');await send('Network.enable');await send('Page.enable');await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
 return{child,ws,send,diagnostics};
}
const evalValue=(send,expression)=>send('Runtime.evaluate',{expression,returnByValue:true}).then(x=>x.result.value);
async function inspect(send,framework){
 await send('Page.navigate',{url:`${origin}/library-gallery/${framework}/`});await sleep(850);
 const staticResult=await evalValue(send,`(()=>{const names=${JSON.stringify(names)};return names.map(name=>{const fx=document.querySelector('[data-native-fixture="'+name+'"]');const r=fx?.getBoundingClientRect();const visible=[...fx?.querySelectorAll('*')??[]].filter(e=>{const x=e.getBoundingClientRect(),s=getComputedStyle(e);return x.width>0&&x.height>0&&s.display!=='none'&&s.visibility!=='hidden'});const text=(fx?.innerText||'').replace(/\\s+/g,' ').trim();const html=fx?.innerHTML||'';const expected=name.split('-').map(x=>x[0].toUpperCase()+x.slice(1)).join('');const failures=[];if(!fx)failures.push('missing-fixture');else{if(!fx.children.length)failures.push('empty-fixture');if(!visible.length)failures.push('no-visible-descendant');if(/undefined|NaN|HomeHereHomeHere|day-[0-9]{2}/.test(text+html))failures.push('placeholder-or-invalid-literal');if(text.toLowerCase()===name.toLowerCase()||text===expected)failures.push('raw-component-name');for(const e of fx.querySelectorAll('button,input,textarea,select,[role=checkbox],[role=switch],[role=tab],[role=radio],[role=option]')){const x=e.getBoundingClientRect(),s=getComputedStyle(e);if(!e.closest('[hidden]')&&s.display!=='none'&&s.visibility!=='hidden'&&(x.width===0||x.height===0))failures.push('zero-size-control')}}return{name,text:text.slice(0,160),visible:visible.length,width:Math.round(r?.width||0),height:Math.round(r?.height||0),failures:[...new Set(failures)]}})})()`);
 const interaction={};
 const run=async(name,expression,wait=120)=>{interaction[name]=await evalValue(send,expression);await sleep(wait);interaction[name+'After']=await evalValue(send,`(()=>{const fx=document.querySelector('[data-native-fixture="${name}"]');return {checked:fx.querySelector('[aria-checked]')?.getAttribute('aria-checked'),selected:[...fx.querySelectorAll('[aria-selected=true]')].map(x=>x.getAttribute('data-day')||x.textContent.trim()),expanded:fx.querySelector('[aria-expanded]')?.getAttribute('aria-expanded'),dialog:!!document.querySelector('[role=dialog]'),menu:!!document.querySelector('[role=menu]'),listbox:!!document.querySelector('[role=listbox]'),status:!!fx.querySelector('[role=status]'),live:fx.querySelector('[aria-live]')?.textContent}})()`)};
 await run('checkbox',`(()=>{const e=document.querySelector('[data-native-fixture="checkbox"] [role=checkbox]');const before=e?.getAttribute('aria-checked');e?.click();return{before}})()`);
 await run('switch',`(()=>{const e=document.querySelector('[data-native-fixture="switch"] [role=switch]');const before=e?.getAttribute('aria-checked');e?.click();return{before}})()`);
 await run('tabs',`(()=>{const fx=document.querySelector('[data-native-fixture="tabs"]');const tabs=[...fx.querySelectorAll('[role=tab]')];const before=tabs.find(x=>x.getAttribute('aria-selected')==='true')?.textContent.trim();tabs[1]?.click();return{before,count:tabs.length}})()`);
 await run('date-picker',`(()=>{const fx=document.querySelector('[data-native-fixture="date-picker"]');const b=[...fx.querySelectorAll('button[data-day]:not(:disabled)')][5];b?.click();return{day:b?.dataset.day,count:fx.querySelectorAll('button[data-day]').length}})()`);
 await evalValue(send,`(()=>{const fx=document.querySelector('[data-native-fixture="date-range-picker"]');const bs=[...fx.querySelectorAll('button[data-day]')];bs.find(b=>b.dataset.day==='2026-06-10')?.click();return bs.length})()`);await sleep(80);
 await run('date-range-picker',`(()=>{const fx=document.querySelector('[data-native-fixture="date-range-picker"]');const b=[...fx.querySelectorAll('button[data-day]')].find(b=>b.dataset.day==='2026-06-15');b?.click();return{count:fx.querySelectorAll('button[data-day]').length,synthetic:fx.innerText.includes('day-')}})()`,160);
 await run('select',`(()=>{const e=document.querySelector('[data-native-fixture="select"] [role=combobox]');e?.click();return{before:e?.getAttribute('aria-expanded')}})()`);
 await run('dialog',`(()=>{document.querySelector('[data-native-fixture="dialog"] button')?.click();return{}})()`);
 await run('popover',`(()=>{document.querySelector('[data-native-fixture="popover"] button')?.click();return{}})()`);
 await run('dropdown-menu',`(()=>{document.querySelector('[data-native-fixture="dropdown-menu"] button')?.click();return{}})()`);
 await run('toasty',`(()=>{document.querySelector('[data-native-fixture="toasty"] button')?.click();return{}})()`);
 await run('autocomplete',`(()=>{const fx=document.querySelector('[data-native-fixture="autocomplete"]');const e=fx.querySelector('input');e?.focus();if(e){const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;setter.call(e,'Ap');e.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:'p'}));}return{input:!!e}})()`);
 await run('combobox',`(()=>{const fx=document.querySelector('[data-native-fixture="combobox"]');const e=fx.querySelector('input,[role=combobox]');e?.click();e?.focus();e?.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true}));return{input:!!e}})()`);
 await run('command-palette',`(()=>{const fx=document.querySelector('[data-native-fixture="command-palette"]');const e=fx.querySelector('input');e?.focus();if(e){const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;setter.call(e,'Audit');e.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:'t'}));}return{input:!!e}})()`);
 await run('input',`(()=>{const e=document.querySelector('[data-native-fixture="input"] input');const before=e?.value;if(e){const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;setter.call(e,'changed');e.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:'d'}));}return{before,input:!!e}})()`);
 await run('input-area',`(()=>{const e=document.querySelector('[data-native-fixture="input-area"] textarea');const before=e?.value;if(e){const setter=Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set;setter.call(e,'changed notes');e.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:'s'}));}return{before,input:!!e}})()`);
 await run('input-group',`(()=>{const e=document.querySelector('[data-native-fixture="input-group"] input');e?.focus();return{input:!!e}})()`);
 await run('pagination',`(()=>{const fx=document.querySelector('[data-native-fixture="pagination"]');const e=[...fx.querySelectorAll('button')].find(x=>(x.getAttribute('aria-label')||x.textContent).toLowerCase().includes('next'));const before=fx.querySelector('input')?.value;e?.click();return{before,button:!!e}})()`);
 await run('radio',`(()=>{const fx=document.querySelector('[data-native-fixture="radio"]');const es=[...fx.querySelectorAll('[role=radio]')];const before=es.find(x=>x.getAttribute('aria-checked')==='true')?.getAttribute('aria-label');es[1]?.click();return{before,count:es.length}})()`);
 await run('sensitive-input',`(()=>{const fx=document.querySelector('[data-native-fixture="sensitive-input"]');const e=fx.querySelector('input');const before=e?.type;[...fx.querySelectorAll('button')].find(x=>x.textContent.toLowerCase().includes('reveal'))?.click();return{before,input:!!e}})()`);
 await run('sidebar',`(()=>{const fx=document.querySelector('[data-native-fixture="sidebar"]');const e=[...fx.querySelectorAll('button')].find(x=>(x.getAttribute('aria-label')||x.textContent).toLowerCase().includes('collapse'));const before=fx.querySelector('[data-state]')?.getAttribute('data-state');e?.click();return{before,button:!!e}})()`);
 const failures=[];
 for(const item of staticResult)for(const reason of item.failures)failures.push({component:item.name,reason});
 const changed=(name,key)=>interaction[name]?.before!==interaction[name+'After']?.[key];
 if(!changed('checkbox','checked'))failures.push({component:'checkbox',reason:'click-does-not-toggle'});
 if(!changed('switch','checked'))failures.push({component:'switch',reason:'click-does-not-toggle'});
 if((interaction.tabs?.count??0)<2||(interaction.tabsAfter?.selected??[]).length!==1)failures.push({component:'tabs',reason:'tab-selection-failed'});
 if(!(interaction['date-pickerAfter']?.selected??[]).length)failures.push({component:'date-picker',reason:'date-selection-failed'});
 if(interaction['date-range-picker']?.count!==84||interaction['date-range-picker']?.synthetic||(interaction['date-range-pickerAfter']?.selected??[]).length!==2)failures.push({component:'date-range-picker',reason:'range-selection-failed'});
 if(interaction.select?.before!=='true'&&interaction.selectAfter?.expanded!=='true')failures.push({component:'select',reason:'open-failed'});
 if(!interaction.dialogAfter?.dialog)failures.push({component:'dialog',reason:'open-failed'});
 if(!interaction.popoverAfter?.dialog)failures.push({component:'popover',reason:'open-failed'});
 if(!interaction['dropdown-menuAfter']?.menu)failures.push({component:'dropdown-menu',reason:'open-failed'});
 if(!interaction.toastyAfter?.status)failures.push({component:'toasty',reason:'notify-failed'});
 if(!interaction.autocomplete?.input||!interaction.autocompleteAfter?.listbox)failures.push({component:'autocomplete',reason:'filter-open-failed'});
 if(!interaction.combobox?.input||!interaction.comboboxAfter?.listbox)failures.push({component:'combobox',reason:'open-failed'});
 if(!interaction['command-palette']?.input||!interaction['command-paletteAfter']?.listbox)failures.push({component:'command-palette',reason:'search-failed'});
 if(!interaction.input?.input)failures.push({component:'input',reason:'edit-fixture-missing'});
 if(!interaction['input-area']?.input)failures.push({component:'input-area',reason:'edit-fixture-missing'});
 if(!interaction['input-group']?.input)failures.push({component:'input-group',reason:'focus-fixture-missing'});
 if(!interaction.pagination?.button)failures.push({component:'pagination',reason:'next-control-missing'});
 if((interaction.radio?.count??0)<2||interaction.radio?.before===interaction.radioAfter?.checked)failures.push({component:'radio',reason:'selection-failed'});
 if(!interaction['sensitive-input']?.input)failures.push({component:'sensitive-input',reason:'reveal-control-missing'});
 if(!interaction.sidebar?.button)failures.push({component:'sidebar',reason:'collapse-control-missing'});
 return{framework,components:staticResult,interaction,failures};
}
export async function audit(){const b=await browser();try{const frameworks=[];for(const framework of ['vue','svelte','solid'])frameworks.push(await inspect(b.send,framework));const failures=[...frameworks.flatMap(x=>x.failures),...b.diagnostics.map(x=>({component:'runtime',reason:x.kind,detail:x.text??x.url}))];const report={schemaVersion:'kumo.native-demo-fidelity/v1',observedAt:new Date().toISOString(),componentCount:41,frameworks,failures,status:failures.length?'failed':'passed'};await mkdir(resolve(root,'proof/native-demo-fidelity'),{recursive:true});await writeFile(resolve(root,'proof/native-demo-fidelity/latest.json'),JSON.stringify(report,null,2)+'\n');return report}finally{b.ws.close();b.child.kill()}}
if(import.meta.url===`file://${process.argv[1]}`)audit().then(r=>{console.log(`Native demo fidelity: ${r.status}; failures=${r.failures.length}`);for(const f of r.failures.slice(0,80))console.log(`${f.component}: ${f.reason}`);if(r.status!=='passed')process.exit(1)}).catch(e=>{console.error(e.stack);process.exit(1)});
