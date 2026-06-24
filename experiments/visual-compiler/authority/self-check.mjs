#!/usr/bin/env node
import {createHash} from 'node:crypto';
import {readFile,readdir,writeFile} from 'node:fs/promises';
import {resolve,relative} from 'node:path';

const HERE=import.meta.dirname, ROOT=resolve(HERE,'..');
const sha=b=>createHash('sha256').update(b).digest('hex');
const canonical=x=>JSON.stringify(sort(x));
function sort(x){if(Array.isArray(x))return x.map(sort);if(x&&typeof x==='object')return Object.fromEntries(Object.keys(x).sort().map(k=>[k,sort(x[k])]));return x}
async function text(p){return readFile(resolve(ROOT,p),'utf8')}
async function json(p){return JSON.parse(await text(p))}
async function files(dir){const out=[];for(const e of await readdir(resolve(ROOT,dir),{withFileTypes:true})){const p=`${dir}/${e.name}`;e.isDirectory()?out.push(...await files(p)):out.push(p)}return out.sort()}
const checks=[];const check=(id,ok,detail,evidence=[])=>checks.push({id,status:ok?'passed':'failed',detail,evidence});
let tracer={},ir={},front=[];
try{tracer=await json('tracer/results.json')}catch{}
for(const p of ['frontend/typescript/results.json','frontend/oxc/results.json'])try{const b=await readFile(resolve(ROOT,p));front.push({path:p,sha256:sha(b),value:JSON.parse(b)})}catch{}
try{ir=await json('ir/results.json')}catch{}
const tracerSource=await text('tracer/tracer.mjs').catch(()=>''), verifier=await text('verification/verifier.mjs').catch(()=>''), lowererFiles=(await files('lowering').catch(()=>[])).filter(p=>/\/lower\.mjs$/.test(p));
const lowerers=await Promise.all(lowererFiles.map(async p=>({p,s:await text(p)})));
const hash=/^[a-f0-9]{64}$/;
const a=tracer.authority||{};
check('tracer-real-package',a.package==='@cloudflare/kumo'&&a.version==='2.5.2'&&a.synthetic===false&&a.execution?.servedHttp===true&&a.execution?.actualPackageImports===true,'must attest execution of actual @cloudflare/kumo@2.5.2 imports over served HTTP',['tracer/results.json']);
check('tracer-content-bindings',['packageSha256','sourceSha256','cssSha256'].every(k=>hash.test(a[k]||''))&&['executableSha256','productSha256'].every(k=>hash.test(tracer.browser?.[k]||'')),'package, source, CSS, executable, and browser product hashes are mandatory',['tracer/results.json']);
check('tracer-trusted-cdp',tracer.interactions?.trusted===true&&tracer.interactions?.driver==='CDP'&&Array.isArray(tracer.interactions?.actions)&&tracer.interactions.actions.length>0&&tracer.interactions.actions.every(x=>/^Input\./.test(x)),'journeys must name trusted CDP Input actions',['tracer/results.json']);
const forbidden=[['data-url',/data:text\/html/i],['fixture-markup',/\bfixture\s*\(|fixture-generated/i],['dispatch-event',/dispatchEvent\s*\(/],['inline-markup',/const\s+html\s*=|outerHTML\s*:/i]];
for(const [id,re] of forbidden)check(`tracer-no-${id}`,!re.test(tracerSource),`tracer source must not contain ${id}`,['tracer/tracer.mjs']);
const tracerBytes=await readFile(resolve(ROOT,'tracer/results.json')).catch(()=>Buffer.alloc(0));
const bindings=ir.authority?.inputs||{};
check('ir-artifact-bindings',hash.test(bindings.tracerResultsSha256||'')&&bindings.tracerResultsSha256===sha(tracerBytes)&&front.length>0&&front.every(x=>bindings.frontend?.[x.path]===x.sha256),'IR must bind accepted tracer and frontend result bytes',['ir/results.json']);
const candidates=ir.candidates||[];
check('ir-measured-scores',candidates.length>0&&candidates.every(c=>c.measurements&&Object.keys(c.scores||{}).every(k=>Number.isFinite(c.measurements[k])&&c.scores[k]===c.measurements[k])),'every score must equal a recorded measured check',['ir/results.json']);
const ids=['button','checkbox','field','popover'];
check('generic-lowerers',lowerers.length===3&&lowerers.every(({s})=>!ids.some(id=>new RegExp(`(?:===|case\\s+)[^\\n]{0,40}[\"']${id}[\"']`,'i').test(s))), 'lowerers may not branch on component IDs',lowererFiles);
const copyRisk=/copyFile|cp\s|readFile\([^\n]*(?:TRACER|canonicalPath)|resolve\([^\n]*TRACER/i;
check('verifier-generated-origin',!copyRisk.test(verifier)&&/outputProvenance|generatedByLowerer/.test(verifier),'verifier must require lowerer provenance and must not accept copied canonical traces',['verification/verifier.mjs']);
const failures=checks.filter(x=>x.status==='failed');
const result={schemaVersion:'kumo.visual-compiler-authority/v1',status:failures.length?'failed':'passed',failClosed:true,deterministic:true,policyVersion:'1',inputDigest:sha(canonical({tracer:sha(tracerBytes),front:front.map(x=>[x.path,x.sha256]),ir:sha(Buffer.from(canonical(ir))),sources:sha(Buffer.from(tracerSource+verifier+lowerers.map(x=>x.s).join('')))})),checks,summary:{passed:checks.length-failures.length,failed:failures.length,total:checks.length},failures:failures.map(x=>`${x.id}: ${x.detail}`),commands:{check:'node experiments/visual-compiler/authority/self-check.mjs'}};
await writeFile(resolve(HERE,'results.json'),JSON.stringify(result,null,2)+'\n');
console.log(`${result.status}: ${result.summary.passed}/${result.summary.total} authority checks`);if(failures.length)process.exitCode=1;
