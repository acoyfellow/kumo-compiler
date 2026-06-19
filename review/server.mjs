import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import React from '/Users/jcoeyman/cloudflare/kumo-port-lab-SLOP/node_modules/react/index.js';
import { renderToStaticMarkup } from '/Users/jcoeyman/cloudflare/kumo-port-lab-SLOP/node_modules/react-dom/server.node.js';
const app=new Hono(),root=resolve(import.meta.dirname,'..'),frameworks=new Set(['vue','svelte','solid']);
const css=readFileSync(resolve(root,'public/styles.css'),'utf8');
const cases=[{label:'Extra small',size:'xs',placeholder:'Choose fruit'},{label:'Small',size:'sm',value:'Apple'},{label:'Base',size:'base',placeholder:'Choose fruit',description:'Choose the closest region.'},{label:'Large',size:'lg',value:'Cherry'},{label:'Loading',loading:true,placeholder:'Loading…'},{label:'Hidden label',hideLabel:true,placeholder:'Hidden label'},{label:'Disabled',disabled:true,placeholder:'Unavailable'},{label:'Error',placeholder:'Select an option',error:'Selection required'}];
function Select(p){const id=p.label.toLowerCase().replace(/[^a-z0-9]+/g,'-')+'-listbox';return React.createElement('div',{className:'kumo-field'},React.createElement('label',{htmlFor:id+'-trigger',className:p.hideLabel?'sr-only':undefined},p.label),React.createElement('button',{type:'button',role:'combobox',id:id+'-trigger','aria-controls':id,'aria-expanded':'false','aria-haspopup':'listbox','aria-busy':p.loading||undefined,'aria-invalid':p.error?true:undefined,disabled:p.disabled||p.loading,className:`kumo-trigger ${p.size||'base'}`},React.createElement('span',null,p.value||p.placeholder),React.createElement('svg',{'aria-hidden':'true',width:16,height:16,viewBox:'0 0 16 16'},React.createElement('path',{fill:'currentColor',d:'m4 6 4 4 4-4z'}))),p.error?React.createElement('p',{className:'error'},p.error):p.description?React.createElement('p',{className:'description'},p.description):null)}
const canonical=renderToStaticMarkup(React.createElement('main',{className:'shell'},React.createElement('h1',{className:'title'},'Select'),React.createElement('section',{className:'matrix'},cases.map((p,i)=>React.createElement(Select,{...p,key:i})) )));
const reactPage=`<!doctype html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Select React</title><style>${css}</style></head><body>${canonical}</body></html>`;
app.get('/select/react',c=>c.html(reactPage));
for(const f of frameworks)app.get(`/select/${f}`,c=>c.html(readFileSync(resolve(root,`runtime/${f}/public-runtime/index.html`),'utf8')));
app.get('/select/:framework/assets/:file',c=>{const{framework,file}=c.req.param();if(!frameworks.has(framework)||!/^[\w.-]+$/.test(file))return c.notFound();const body=readFileSync(resolve(root,`runtime/${framework}/public-runtime/assets/${file}`));return c.body(body,200,{'Content-Type':file.endsWith('.css')?'text/css':'text/javascript'});});
app.get('/select/compare',c=>c.html(`<div>${['react','vue','svelte','solid'].map(f=>`<iframe src="/select/${f}"></iframe>`).join('')}</div>`));
serve({fetch:app.fetch,port:Number(process.env.PORT||4260)},({port})=>console.log(`review server http://localhost:${port}/select/compare`));
