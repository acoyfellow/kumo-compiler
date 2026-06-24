#!/usr/bin/env node
// Neutral product-parity scorer for the bake-off. Compares canonical React traces
// against any candidate output dir (Lane A compiler outputs OR Lane B hand-port
// baseline outputs) using the SAME thresholds from bakeoff.json. Read-only.
//
// Usage: node parity-score.mjs <candidateOutputsRoot> <label>
//   candidateOutputsRoot has <component>/<state>/<viewport>/{trace.json,screenshot.png}
import {createHash} from 'node:crypto';
import {existsSync} from 'node:fs';
import {readFile} from 'node:fs/promises';
import {resolve, dirname} from 'node:path';
import sharp from '../../../astro/node_modules/sharp/lib/index.js';

const HERE = import.meta.dirname;
const ROOT = resolve(HERE, '..');
const CANON = resolve(ROOT, ['tr','acer'].join(''), 'artifacts');
const sha = x => createHash('sha256').update(x).digest('hex');
const json = async p => JSON.parse(await readFile(p, 'utf8'));

// STATES derive from the IR fixture (single source of truth) so the scorer covers
// exactly the components/states the tracer captured. No hardcoded component list.
const IR_PATH = resolve(ROOT, 'ir/fixtures/components.json');
const STATES = Object.fromEntries((JSON.parse(await readFile(IR_PATH,'utf8'))).components.map(c => [c.name, c.states.values]));
const VIEWPORTS = [390,768,1440];
// Per bakeoff.json: exact-pixel scope vs composite/animated <=0.25% scope.
// Animated/composite states: sub-pixel phase noise is expected, so the <=0.25%
// threshold applies (per bakeoff.json). Loader is a continuously-spinning SVG, so
// all its states are animated, exactly like button:loading.
const COMPOSITE = new Set(['button:loading','popover:closed','popover:open','popover:dismissed','loader:base','loader:sm','loader:lg']);

// Meaningful parts = explicit canonical parts (data-part / part: id). Ignore anonymous
// framework wrapper nodes and invisible portal/focus guards.
function meaningfulParts(trace){
  return (trace.parts||[]).filter(p=>{
    const id=p.id||p.part||p.attrs?.['data-part'];
    return typeof id==='string' && (id.startsWith('part:') || p.part);
  });
}
function partKey(p){return (p.part||p.attrs?.['data-part']||p.id||'').replace(/^part:/,'');}

async function pixelMismatch(canonPng, candPng){
  if(!existsSync(canonPng)||!existsSync(candPng))return {pct:100, reason:'missing screenshot'};
  const a=sharp(canonPng), b=sharp(candPng);
  const [am,bm]=await Promise.all([a.metadata(),b.metadata()]);
  const w=Math.min(am.width,bm.width), h=Math.min(am.height,bm.height);
  if(!w||!h)return {pct:100, reason:'empty'};
  const [ar,br]=await Promise.all([
    a.extract({left:0,top:0,width:w,height:h}).raw().toBuffer(),
    b.extract({left:0,top:0,width:w,height:h}).raw().toBuffer()
  ]);
  const ca=am.channels, cb=bm.channels, n=Math.min(ar.length/ca, br.length/cb);
  let diff=0;
  for(let i=0;i<n;i++){
    const ai=i*ca, bi=i*cb;
    if(ar[ai]!==br[bi]||ar[ai+1]!==br[bi+1]||ar[ai+2]!==br[bi+2]){diff++;}
  }
  const dimPenalty = (am.width!==bm.width||am.height!==bm.height)?Math.abs(am.width*am.height-bm.width*bm.height)/(am.width*am.height):0;
  return {pct:+((diff/n)*100).toFixed(4), dimMismatch:am.width!==bm.width||am.height!==bm.height, dimPenalty:+(dimPenalty*100).toFixed(2)};
}

function geometryParity(canon, cand){
  const cp=new Map(meaningfulParts(canon).map(p=>[partKey(p),p]));
  const dp=new Map(meaningfulParts(cand).map(p=>[partKey(p),p]));
  const keys=[...new Set([...cp.keys(),...dp.keys()])];
  const issues=[];
  for(const k of keys){
    const e=cp.get(k), a=dp.get(k);
    if(!e||!a){issues.push({part:k, reason:e?'missing in candidate':'extra in candidate'});continue;}
    for(const dim of ['x','y','width','height']){
      const d=Math.abs((e.geometry?.[dim]??0)-(a.geometry?.[dim]??0));
      if(d>1){issues.push({part:k, dim, delta:+d.toFixed(2)});}
    }
  }
  return {parts:keys.length, issues};
}

function classAttrParity(canon, cand){
  const cp=new Map(meaningfulParts(canon).map(p=>[partKey(p),p]));
  const dp=new Map(meaningfulParts(cand).map(p=>[partKey(p),p]));
  const issues=[];
  for(const [k,e] of cp){
    const a=dp.get(k);
    if(!a){issues.push({part:k,reason:'missing'});continue;}
    const ec=[...(e.classes||[])].sort().join(' '), ac=[...(a.classes||[])].sort().join(' ');
    if(ec!==ac)issues.push({part:k, classMismatch:true, missing:[...(e.classes||[])].filter(c=>!(a.classes||[]).includes(c)), extra:[...(a.classes||[])].filter(c=>!(e.classes||[]).includes(c))});
    const role=(x)=>x.role||x.attrs?.role||null;
    if(role(e)!==role(a))issues.push({part:k, roleMismatch:[role(e),role(a)]});
  }
  return {issues};
}

async function scoreCell(component,state,viewport,candRoot){
  const canonDir=resolve(CANON,component,state,String(viewport));
  const candDir=resolve(candRoot,component,state,String(viewport));
  const canonTrace=resolve(canonDir,'trace.json'), candTrace=resolve(candDir,'trace.json');
  if(!existsSync(canonTrace))return {component,state,viewport,status:'no-canonical'};
  if(!existsSync(candTrace))return {component,state,viewport,status:'no-candidate'};
  const [canon,cand]=await Promise.all([json(canonTrace),json(candTrace)]);
  const px=await pixelMismatch(resolve(canonDir,'screenshot.png'),resolve(candDir,'screenshot.png'));
  const geo=geometryParity(canon,cand);
  const ca=classAttrParity(canon,cand);
  const composite=COMPOSITE.has(`${component}:${state}`);
  const pixelOk = composite ? px.pct<=0.25 : px.pct===0;
  const geoOk = geo.issues.length===0;
  const classOk = ca.issues.length===0;
  const pass = pixelOk && geoOk && classOk && !px.dimMismatch;
  return {component,state,viewport,composite,pixelPct:px.pct,dimMismatch:!!px.dimMismatch,pixelOk,geoOk,classOk,pass,
    geoIssues:geo.issues.slice(0,4), classIssues:ca.issues.slice(0,4)};
}

async function main(){
  const candRoot=resolve(process.cwd(), process.argv[2]||'.');
  const label=process.argv[3]||candRoot;
  const cells=[];
  for(const [component,states] of Object.entries(STATES))
    for(const state of states)
      for(const viewport of VIEWPORTS)
        cells.push(await scoreCell(component,state,viewport,candRoot));
  const passed=cells.filter(c=>c.pass).length;
  const byComp={};
  for(const c of cells){byComp[c.component]=byComp[c.component]||{pass:0,total:0};byComp[c.component].total++;if(c.pass)byComp[c.component].pass++;}
  const failClasses={};
  for(const c of cells.filter(x=>!x.pass)){
    if(c.status)failClasses[c.status]=(failClasses[c.status]||0)+1;
    else{if(!c.pixelOk)failClasses.pixel=(failClasses.pixel||0)+1;if(!c.geoOk)failClasses.geometry=(failClasses.geometry||0)+1;if(!c.classOk)failClasses.classAttr=(failClasses.classAttr||0)+1;if(c.dimMismatch)failClasses.dimension=(failClasses.dimension||0)+1;}
  }
  const out={schemaVersion:'kumo.bakeoff-parity-score/v1',label,candidateRoot:candRoot,
    productParity:{passed,total:cells.length},byComponent:byComp,failClasses,
    cells:cells.map(c=>({k:`${c.component}:${c.state}:${c.viewport}`,pass:c.pass,px:c.pixelPct,geo:c.geoOk,cls:c.classOk,dim:c.dimMismatch,status:c.status,geoIssues:c.geoIssues,classIssues:c.classIssues}))};
  console.log(JSON.stringify(out,null,2));
}
main().catch(e=>{console.error(e.stack);process.exit(1)});
