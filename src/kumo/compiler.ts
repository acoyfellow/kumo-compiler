import {createHash} from 'node:crypto';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {catalog} from './catalog.js';
import type {Node,Provenance} from './schema.js';
const hash=(x:string)=>createHash('sha256').update(x).digest('hex');
const escapeText=(x:string)=>x.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const escapeAttr=(x:string)=>escapeText(x).replaceAll('"','&quot;');
function emit(n:Node):string {if(n.kind==='text')return escapeText(n.value);const attrs=Object.entries(n.attrs??{}).map(([k,v])=>` ${k}="${escapeAttr(String(v))}"`).join('');return `<${n.tag}${attrs}>${(n.children??[]).map(emit).join('')}</${n.tag}>`;}
const emitterSource=await readFile('src/kumo/compiler.ts','utf8');
const catalogSource=await readFile('src/kumo/catalog.ts','utf8');
for(const ir of catalog.filter(x=>x.root)){
 const dir=`runtime/${ir.id}/vue`, template=emit(ir.root!); await mkdir(`${dir}/src`,{recursive:true});
 const outputs:Record<string,string>={
  'src/App.vue':`<template>\n${template}\n</template>\n`,
  'src/runtime-entry.ts':`import App from './App.vue';\nexport default App;\n`,
  'src/main.ts':`import './style.css';\nimport {createSSRApp} from 'vue';\nimport App from './App.vue';\ncreateSSRApp(App).mount('#app');\n`,
  'index.html':`<!doctype html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width"><title>${ir.name} · vue</title></head><body><div id="app">${template}</div><script type="module" src="/src/main.ts"></script></body></html>\n`
 };
 for(const [file,body] of Object.entries(outputs))await writeFile(`${dir}/${file}`,body);
 const provenance:Provenance={schemaVersion:ir.schemaVersion,component:ir.id,framework:'vue',sourceHash:hash(catalogSource),irHash:hash(JSON.stringify(ir)),emitterHash:hash(emitterSource),outputs:Object.fromEntries(Object.entries(outputs).map(([k,v])=>[k,hash(v)]))};
 await writeFile(`${dir}/provenance.json`,JSON.stringify(provenance,null,2)+'\n');
}
await mkdir('generated',{recursive:true});
await writeFile('generated/catalog.ir.json',JSON.stringify({schemaVersion:'kumo.ir/v1',components:catalog},null,2)+'\n');
console.log(`emitted ${catalog.filter(x=>x.root).length} Vue candidates from ${catalog.length} catalog records`);
