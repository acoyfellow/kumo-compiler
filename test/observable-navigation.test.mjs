import test from'node:test';
import assert from'node:assert/strict';
import{renderToString}from'react-dom/server';
import{loadContracts,verifyCanonical}from'../scripts/observable-contracts.mjs';
import{navigationFixtureElement,navigationNames,renderNavigationSSR}from'../scripts/observable-adapters/navigation.mjs';

const navigation=loadContracts().filter(x=>navigationNames.includes(x.component));
const paths={'menu-bar':'menubar',sidebar:'sidebar','table-of-contents':'table-of-contents',tabs:'tabs'};
test('navigation inventory and canonical provenance',()=>{assert.deepEqual(navigation.map(x=>x.component),navigationNames);assert.equal(navigation.reduce((n,c)=>n+c.vectors.length,0),13);navigation.forEach(verifyCanonical)});
test('navigation constructs exactly one canonical SSR vector root',async()=>{const{vectors,html}=await renderNavigationSSR(navigation);assert.equal(vectors.length,13);assert.equal((html.match(/<section id="v\d+"/g)||[]).length,13);vectors.forEach((_,i)=>assert.equal((html.match(new RegExp(`id="v${i}"`,'g'))||[]).length,1))});
test('navigation SSR construction equals isolated canonical fixtures action-free',async()=>{const{vectors,html}=await renderNavigationSSR(navigation);for(let i=0;i<vectors.length;i++){const s=vectors[i],contract=navigation.find(x=>x.component===s.component),module=await import(`@cloudflare/kumo/components/${paths[s.component]}`),Component=module[contract.publicApi.exports[0]],isolated=renderToString(navigationFixtureElement(s,Component)),match=html.match(new RegExp(`<section id="v${i}">([\\s\\S]*?)</section>`));assert.ok(match,`${s.component}/${s.id}`);const stable=x=>x.replace(/<style data-precedence="base-ui:low"[\s\S]*?<\/style>/g,'').replace(/ (?:id|data-id)="base-ui-[^"]+"/g,' data-base-ui-id="generated"').replace(/ id="_R_[^"]+"/g,' id="react-generated"');assert.equal(stable(match[1]),stable(isolated),`${s.component}/${s.id}`)}});
test('navigation adapter delegates lifecycle and trusted actions to shared runner',async()=>{const source=await import('node:fs/promises').then(x=>x.readFile('scripts/observable-adapters/navigation.mjs','utf8'));assert.match(source,/runObservableBrowser\(/);assert.doesNotMatch(source,/dispatchEvent|new\s+(?:Event|MouseEvent|KeyboardEvent)|Chrome|DevTools|Input\.dispatch/);assert.match(source,/api\.action\(i,action\)/)});
