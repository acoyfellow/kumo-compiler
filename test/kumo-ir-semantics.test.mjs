import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
execFileSync('npx',['tsc','-p','tsconfig.kumo.json'],{stdio:'inherit'});
const {catalog}=await import('../dist/kumo/catalog.js');
const {validateComponentIR}=await import('../dist/kumo/validate.js');
const clone=x=>structuredClone(x);

test('all 41 catalog components satisfy normative kumo.ir/v1 semantics',()=>{
 assert.equal(catalog.length,41);
 for(const component of catalog) assert.deepEqual(validateComponentIR(component),{valid:true,diagnostics:[]},component.id);
});

test('diagnostics are deterministic, path-addressed, and reject unsafe structure',()=>{
 const cases=[
  [x=>x.schemaVersion='kumo.ir/v2','$.schemaVersion','version'],
  [x=>x.root.tag='script','$.root.tag','tag'],
  [x=>x.root.attrs.onclick='evil()','$.root.attrs.onclick','attribute'],
  [x=>{x.root={kind:'element',tag:'a',attrs:{href:'javascript:alert(1)'},children:[]}},'$.root.attrs.href','url'],
  [x=>{x.root.children.push({kind:'element',tag:'span',attrs:{id:'x'},children:[]},{kind:'element',tag:'span',attrs:{id:'x'},children:[]})},'duplicate-id'],
  [x=>{x.root={kind:'element',tag:'label',attrs:{for:'absent'},children:[]}},'missing-reference'],
  [x=>{x.root={kind:'element',tag:'input',attrs:{},children:[{kind:'text',value:'bad'}]}},'void-children'],
  [x=>{x.root.attrs['aria-current']='banana'},'aria-value'],
 ];
 for(const [mutate,...wanted] of cases){const x=clone(catalog[0]);mutate(x);const a=validateComponentIR(x),b=validateComponentIR(x);assert.equal(a.valid,false);assert.deepEqual(a,b);for(const token of wanted)assert.ok(a.diagnostics.some(d=>d.path===token||d.code===token),`${token}: ${JSON.stringify(a.diagnostics)}`)}
});

test('behavior collections and policy compatibility are normative',()=>{
 const roving=clone(catalog.find(x=>x.id==='tabs'));roving.behavior.labels=[];assert.ok(validateComponentIR(roving).diagnostics.some(x=>x.code==='nonempty'));
 const select=clone(catalog.find(x=>x.id==='select'));select.behavior.options=[];assert.ok(validateComponentIR(select).diagnostics.some(x=>x.path==='$.behavior.options'));
 const incompatible=clone(catalog.find(x=>x.id==='tabs'));incompatible.behavior.itemRole='menuitem';assert.ok(validateComponentIR(incompatible).diagnostics.some(x=>x.code==='behavior-compatibility'));
 const contradictory=clone(catalog.find(x=>x.id==='button'));contradictory.policy.events.push('click');assert.ok(validateComponentIR(contradictory).diagnostics.some(x=>x.code==='contradictory-policy'));
});
