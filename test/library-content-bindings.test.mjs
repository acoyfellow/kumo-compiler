import test from 'node:test';
import assert from 'node:assert/strict';
import {deriveContentBindings,resolveContentBinding,validateContentBindings} from '../src/kumo/library/content-bindings.mjs';
import {compileSemanticVector} from '../src/kumo/library/semantic-implementation.mjs';
import {loadLibrary} from '../src/kumo/library/index.mjs';

const capability=deriveContentBindings();
const walk=(value,out=[])=>{if(Array.isArray(value))value.forEach(x=>walk(x,out));else if(value&&typeof value==='object'){if(value.kind==='consumer-children'||value.kind==='fixture-children')out.push(value);Object.values(value).forEach(x=>walk(x,out));}return out};

test('versioned neutral roles normalize deterministically',()=>{
 assert.deepEqual(deriveContentBindings(),capability);
 assert.deepEqual(capability.bindings.map(({role,mode})=>[role,mode]),[['consumer-content','content'],['compound-slot','slot'],['fixture-children','collection']]);
 assert.doesNotMatch(JSON.stringify(capability),/vue|svelte|solid/i);
});

test('button default-native allocates consumer content once with explicit source',()=>{
 const model=loadLibrary().models.find(x=>x.component==='button');
 const variant=model.draftImplementation.semanticVariants.find(x=>x.id==='default-native');
 const nodes=walk(variant.tree);
 assert.equal(nodes.length,1);
 assert.deepEqual(nodes[0],{kind:'consumer-children',contentRole:'consumer-content',predicateSource:{kind:'prop-equals',name:'children',value:'Save'}});
});

test('all compiled semantic content resolves exactly once',()=>{
 const library=loadLibrary();
 for(const model of library.models) for(const variant of model.draftImplementation.semanticVariants??[]){
   const nodes=walk(variant.tree);
   for(const node of nodes) assert.ok(node.kind==='fixture-children'||(node.contentRole==='consumer-content'&&node.predicateSource));
   assert.equal(new Set(nodes.map(node=>JSON.stringify(node))).size,nodes.length,`${model.component}/${variant.id}`);
 }
});

test('unknown and ambiguous roles fail closed',()=>{
 assert.throws(()=>resolveContentBinding(capability,'other'),/unknown content role/);
 const duplicate=structuredClone(capability); duplicate.bindings.push(duplicate.bindings[0]);
 assert.throws(()=>validateContentBindings(duplicate),/ambiguous content allocation/);
});
