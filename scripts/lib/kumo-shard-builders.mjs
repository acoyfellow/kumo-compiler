import {readdir,readFile,rm,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';

async function assetFiles(html,out){for(const pattern of [/<script\b[^>]*\bsrc=["']([^"'#?]+)["']/g,/<link\b[^>]*\bhref=["']([^"'#?]+)["']/g])for(const match of html.matchAll(pattern)){const value=match[1];if(/^(?:https?:|data:|#)/.test(value))continue;const clean=value.split('?')[0],path=clean.startsWith('/')?resolve(out,'assets',clean.split('/').pop()):resolve(out,clean);try{await readFile(path)}catch{throw Error(`linked asset missing: ${value}`)}}}
export async function preflightStagedOutput({root,dir,out,framework,component}){
 const html=await readFile(resolve(out,'index.html'),'utf8');
 if(!/<main(?:\s[^>]*)?>[\s\S]*?\S[\s\S]*?<\/main>/.test(html))throw Error(`${framework}/${component}: SSR <main> missing or empty`);
 if(!/<script[^>]+(?:src=|data-hk=)/.test(html))throw Error(`${framework}/${component}: hydration entry missing`);
 if(framework==='react'&&!html.includes('data-canonical-component'))throw Error(`react/${component}: canonical SSR identity missing`);
 if(framework==='solid'&&(!html.includes('data-hk=')||html.includes('<!--HYDRATION-->')))throw Error(`solid/${component}: hydration SSR missing`);
 if(framework!=='react'){const p=JSON.parse(await readFile(resolve(dir,'provenance.json'),'utf8'));if(p.component!==component||p.framework!==framework)throw Error(`${framework}/${component}: stale provenance`);for(const [file,hash] of Object.entries(p.outputs||{})){const bytes=await readFile(resolve(dir,file));const actual=(await import('node:crypto')).createHash('sha256').update(bytes).digest('hex');if(actual!==hash)throw Error(`${framework}/${component}: provenance mismatch ${file}`)}}
 else {const source=await readFile(resolve(dir,'entry.jsx'),'utf8');if(!source.includes(`data-canonical-component=${JSON.stringify(component)}`)||!source.includes('@cloudflare/kumo/components/'))throw Error(`react/${component}: package provenance missing`)}
 await assetFiles(html,out);
}
export async function buildStagedComponent({root,dir,out,framework,component,runCommand}){
 const vite=resolve(root,'node_modules/.bin/vite'),run=args=>runCommand({command:vite,args,cwd:dir,env:{...process.env}}),entry=framework==='react'?'server.jsx':framework==='solid'?'src/server.tsx':'src/ssr-entry.'+(framework==='vue'?'ts':'js'),ssr=resolve(dir,'server-runtime');
 await run(['build','.','--outDir',out,'--emptyOutDir']);await run(['build','.','--ssr',entry,'--outDir',ssr,'--emptyOutDir']);
 const files=await readdir(ssr,{recursive:true}),js=files.find(x=>x.endsWith('.js'));if(!js)throw Error(`${framework}/${component}: SSR bundle missing`);
 const mod=await import(`${new URL('file://'+resolve(ssr,js))}?v=${Date.now()}`),rendered=await mod.render();let html=await readFile(resolve(out,'index.html'),'utf8');
 if(framework==='solid')html=html.replace('<!--HYDRATION-->',rendered.hydration).replace(/<!--APP-->[\s\S]*?<!--\/APP-->/,`<!--APP--><div id="app">${rendered.html}</div><!--/APP-->`);
 else {const markup=typeof rendered==='string'?rendered:rendered.body,rx=framework==='react'?/<div id="root">[\s\S]*?<\/div>/:/<div id="app">[\s\S]*?<\/div>/;const id=framework==='react'?'root':'app';if(!rx.test(html))throw Error(`${framework}/${component}: SSR mount missing`);html=html.replace(rx,`<div id="${id}">${markup}</div>`)}
 await writeFile(resolve(out,'index.html'),html);await rm(ssr,{recursive:true,force:true});await preflightStagedOutput({root,dir,out,framework,component});
}
