import test from 'node:test';import assert from 'node:assert/strict';
import {tabs,select,disclosure,calendar,aria} from '../dist/index.js';
test('tabs skip disabled and activate',()=>assert.deepEqual(tabs({active:0,focus:0,activation:'automatic'},{type:'key',key:'ArrowRight'},[{id:'a'},{id:'b',disabled:true},{id:'c'}]),{active:2,focus:2,activation:'automatic'}));
test('select keyboard chooses',()=>{let s=select({open:false,highlighted:-1,selected:null,query:''},{type:'key',key:'ArrowDown'},[{id:'a',label:'A'}]);assert.equal(select(s,{type:'key',key:'Enter'},[{id:'a',label:'A'}]).selected,0)});
test('escape closes layers',()=>assert.deepEqual(disclosure({open:true},{type:'escape'}),{open:false}));
test('calendar arrows are deterministic UTC',()=>assert.equal(calendar({focused:'2026-06-20',selected:null},{type:'key',key:'ArrowDown'}).focused,'2026-06-27'));
test('aria vectors',()=>assert.deepEqual(aria.tab('x',true),{id:'x',role:'tab','aria-selected':true,tabIndex:0,'aria-controls':'x-panel'}));
