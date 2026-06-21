import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {digest,loadLibrary} from '../src/kumo/library/index.mjs';
import {validateExpression,validateNode} from '../src/kumo/library/algebra.mjs';
import {matchSemanticVariant,validateSemanticVariant} from '../src/kumo/library/semantic-implementation.mjs';

const base=path.resolve('src/kumo/library');
const capability=JSON.parse(fs.readFileSync(path.join(base,'capabilities/semantic-render.json')));
const models=new Map(loadLibrary(base).models.map(model=>[model.component,model]));
const sha256=/^[a-f0-9]{64}$/;
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);

function evaluate(expression,props,fixture) {
  validateExpression(expression);
  if(expression.kind==='literal') return expression.value;
  if(expression.kind==='prop') return props[expression.name];
  if(expression.kind==='consumer-children') return props.children;
  if(expression.kind==='fixture') return fixture;
  throw new Error(`test simulator does not support ${expression.kind}`);
}
function fixtureText(value) {
  if(!value || typeof value!=='object') return '';
  return (typeof value.text==='string'?value.text:'')+(value.children??[]).map(fixtureText).join('');
}
function simulate(node,props,fixture) {
  validateNode(node);
  if(node.kind==='text') return {kind:'text',text:String(evaluate(node.value,props,fixture)??'')};
  if(node.kind==='fixture-children') return {kind:'text',text:fixtureText(evaluate(node.value,props,fixture))};
  assert.equal(node.kind,'semantic-element');
  return {kind:'element',tag:evaluate(node.tag,props,fixture),attributes:Object.fromEntries(Object.entries(node.attributes).map(([k,v])=>[k,evaluate(v,props,fixture)])),classes:node.classes.map(v=>evaluate(v,props,fixture)),children:node.children.map(v=>simulate(v,props,fixture))};
}
const textContent=node=>node.kind==='text'?node.text:node.children.map(textContent).join('');
const descendants=(node,out=[])=>{ for(const child of node.children??[]) if(child.kind==='element'){out.push(child);descendants(child,out);} return out; };
function assertRequirement(nodes,require,label) {
  if(require.count!==undefined) assert.equal(nodes.length,require.count,`${label}: count`);
  for(const node of nodes) {
    if(require.tag!==undefined) assert.equal(node.tag,require.tag,`${label}: tag`);
    for(const [name,value] of Object.entries(require.attributes?.includes??{})) assert.ok(name in node.attributes&&equal(node.attributes[name],value),`${label}: attribute ${name}`);
    for(const value of require.classes?.includes??[]) assert.ok(node.classes.includes(value),`${label}: class ${value}`);
    if(require.text!==undefined) assert.equal(textContent(node),require.text,`${label}: text`);
  }
}

test('all 66 vectors are accounted for exactly once without silent drops',()=>{
  const source=capability.components.flatMap(c=>c.vectors.map(v=>`${c.component}#${v.id}`));
  assert.equal(source.length,66);
  const accounted=[];
  for(const component of capability.components) {
    const model=models.get(component.component);
    for(const variant of model.draftImplementation.semanticVariants??[]) accounted.push(`${component.component}#${variant.id}`);
    for(const unresolved of model.unresolvedSemanticOperations) {
      assert.equal(typeof unresolved.reason,'string'); assert.ok(unresolved.reason.trim());
      accounted.push(`${component.component}#${unresolved.vectorId}`);
    }
  }
  assert.equal(accounted.length,66);
  assert.deepEqual(accounted.toSorted(),source.toSorted());
  assert.equal(new Set(accounted).size,66);
});

test('compiled trees satisfy every source root and descendant constraint including text allocation',()=>{
  for(const component of capability.components) {
    const variants=models.get(component.component).draftImplementation.semanticVariants??[];
    for(const vector of component.vectors) {
      const variant=variants.find(v=>v.id===vector.id); if(!variant) continue;
      const props=Object.fromEntries(vector.when.filter(p=>p.kind==='prop-equals').map(p=>[p.name,p.value]));
      const fixture=vector.when.find(p=>p.kind==='fixture-equals')?.value;
      const matched=variants.filter(v=>matchSemanticVariant([v],props,fixture)===v);
      assert.ok(matched.includes(variant),`${component.component}#${vector.id}: predicate match`);
      const root=simulate(variant.tree,props,fixture), all=descendants(root);
      for(const constraint of vector.nodes) {
        const selected=constraint.selector===':root'?[root]:all.filter(n=>constraint.selector.startsWith('[')?false:n.tag===constraint.selector);
        assertRequirement(selected,constraint.require,`${component.component}#${vector.id}/${constraint.selector}`);
      }
    }
  }
});

test('variants carry SHA256 provenance and expectations and validators fail closed',()=>{
  for(const component of capability.components) for(const variant of models.get(component.component).draftImplementation.semanticVariants??[]) {
    validateSemanticVariant(variant);
    assert.match(variant.provenance.contractDigest,sha256);
    assert.match(variant.expectationDigest,sha256);
    assert.equal(variant.expectationDigest,digest(component.vectors.find(v=>v.id===variant.id).nodes));
  }
  const sample=structuredClone([...models.values()].find(m=>m.draftImplementation.semanticVariants?.length).draftImplementation.semanticVariants[0]);
  sample.when[0]={...sample.when[0],unknown:true};
  assert.equal(matchSemanticVariant([sample],{},undefined),null);
  const unknownPredicate=structuredClone(sample); unknownPredicate.when=[{kind:'unknown'}];
  assert.equal(matchSemanticVariant([unknownPredicate],{},undefined),null);
  const unknownNode=structuredClone(sample); unknownNode.tree.unknown=true;
  assert.throws(()=>validateSemanticVariant(unknownNode),/unknown field/);
});

test('semantic implementation contains no branch maps and remains non-ready and byte deterministic',()=>{
  const source=fs.readFileSync(path.join(base,'semantic-implementation.mjs'),'utf8');
  assert.doesNotMatch(source,/['"`]\s*<\/?[a-z][^>]*>|React|Vue|Svelte|Solid|switch\s*\(|component\s*===|\.component\s*\]/i);
  for(const model of models.values()) assert.equal(model.componentRoot.implementationReady,false);
  const files=['manifest.json',...fs.readdirSync(path.join(base,'models')).sort().map(file=>`models/${file}`)];
  const before=new Map(files.map(file=>[file,fs.readFileSync(path.join(base,file))]));
  execFileSync(process.execPath,[path.join(base,'generate.mjs')]);
  for(const file of files) assert.deepEqual(fs.readFileSync(path.join(base,file)),before.get(file),file);
});
