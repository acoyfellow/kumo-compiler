import {digest} from './index.mjs';
import {validateExpression, validateNode} from './algebra.mjs';

const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const literal = value => ({kind:'literal',value});
const prop = name => ({kind:'prop',name});
const fixture = () => ({kind:'fixture'});
const text = value => ({kind:'text',value});
const element = (tag, attributes={}, classes=[], children=[]) => ({kind:'semantic-element',tag:literal(tag),attributes:Object.fromEntries(Object.entries(attributes).map(([k,v])=>[k,literal(v)])),classes:classes.map(literal),children});

function sourceExpression(value, predicates) {
  const candidates=predicates.filter(p=>p.kind==='prop-equals' && JSON.stringify(p.value)===JSON.stringify(value));
  if (candidates.length===1) return candidates[0].name==='children' ? {kind:'consumer-children'} : prop(candidates[0].name);
  if (candidates.length>1) return null;
  return literal(value);
}
function fixtureTexts(value, out=[]) {
  if (!object(value)) return out;
  if (typeof value.text==='string') out.push(value.text);
  for (const child of value.children??[]) fixtureTexts(child,out);
  return out;
}
export function compileSemanticVector(vector) {
  const root=vector.nodes.find(n=>n.selector===':root');
  if (!root?.require.tag) return {unresolved:{vectorId:vector.id,reason:'root tag is not constrained',provenance:vector.provenance}};
  const descendantNodes=[];
  for (const node of vector.nodes.filter(n=>n.selector!==':root')) {
    if (node.selector.startsWith('[')) return {unresolved:{vectorId:vector.id,reason:`attribute selector ${node.selector} cannot determine an element tag`,provenance:vector.provenance}};
    if (!Number.isInteger(node.require.count) || node.require.count<0) return {unresolved:{vectorId:vector.id,reason:`descendant ${node.selector} has no exact non-negative count`,provenance:vector.provenance}};
    for(let i=0;i<node.require.count;i++) descendantNodes.push(element(node.selector,node.require.attributes?.includes??{},node.require.classes?.includes??[],node.require.text===undefined?[]:[text(sourceExpression(node.require.text,vector.when)??literal(node.require.text))]));
  }
  let children=descendantNodes;
  const expectedText=root.require.text;
  if (expectedText!==undefined) {
    const descendantText=descendantNodes.map(n=>n.children.map(c=>c.value.value??'').join('')).join('');
    if (descendantText && descendantText!==expectedText) return {unresolved:{vectorId:vector.id,reason:'root and descendant text constraints have ambiguous or contradictory allocation',provenance:vector.provenance}};
    if (!descendantText && expectedText!=='') {
      const expression=sourceExpression(expectedText,vector.when);
      if (!expression) return {unresolved:{vectorId:vector.id,reason:'text matches multiple props and cannot be allocated without guessing',provenance:vector.provenance}};
      const fixturePredicate=vector.when.find(p=>p.kind==='fixture-equals');
      if (fixturePredicate) {
        const values=fixtureTexts(fixturePredicate.value);
        if (values.join('')===expectedText) children.push({kind:'fixture-children',value:fixture()});
        else return {unresolved:{vectorId:vector.id,reason:'fixture text does not uniquely explain root text',provenance:vector.provenance}};
      } else children.push(text(expression));
    }
  }
  const tree=element(root.require.tag,root.require.attributes?.includes??{},root.require.classes?.includes??[],children);
  const expectationDigest=digest(vector.nodes);
  return {variant:{id:vector.id,when:vector.when,tree,provenance:vector.provenance,expectationDigest}};
}
export function compileSemanticVariants(component) {
  const semanticVariants=[], unresolvedSemanticOperations=[];
  for (const vector of component.vectors) { const result=compileSemanticVector(vector); if(result.variant) semanticVariants.push(result.variant); else unresolvedSemanticOperations.push(result.unresolved); }
  return {semanticVariants,unresolvedSemanticOperations};
}
export function matchSemanticVariant(variants, props, fixtureValue) {
  const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
  const matches=variants.filter(v=>v.when.every(p=>p.kind==='prop-equals'?Object.hasOwn(props,p.name)&&equal(props[p.name],p.value):p.kind==='fixture-equals'?equal(fixtureValue,p.value):false));
  if(matches.length!==1) return null;
  return matches[0];
}
export function validateSemanticVariant(variant) {
  if(!variant || typeof variant.id!=='string' || !Array.isArray(variant.when) || !variant.provenance || typeof variant.expectationDigest!=='string') throw new Error('invalid semantic variant');
  validateNode(variant.tree,'semanticVariant.tree');
  return variant;
}
