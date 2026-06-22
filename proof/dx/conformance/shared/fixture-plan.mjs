import crypto from'node:crypto';
export const FIXTURE_PLAN_VERSION='kumo.fixture-plan/v1';
const sha=/^[a-f0-9]{64}$/;
const allowed=new Set(['schemaVersion','component','vector','contract','fixture','setup','actions','probes','assertions','capabilities','bundle']);
const setupKinds=new Set(['controlled-state','uncontrolled-state','event-recorder','clipboard','date-environment','portal-target','viewport']);
const actionTypes=new Set(['click','outside-pointer','focus','blur','key','type','type-replace','select','scroll','viewport','wait']);
const nodeKinds=new Set(['element','component','text','fragment','portal']);
const assertKinds=new Set(['equals','includes','absent','sequence','identity']);
const probeKinds=new Set(['dom','aria','state','focus','events','portal','node-identity']);
const safeFile=file=>typeof file==='string'&&file&&!file.startsWith('/')&&!file.split(/[\\/]/).includes('..');
const canonical=value=>Array.isArray(value)?`[${value.map(canonical).join(',')}]`:value&&typeof value==='object'?`{${Object.keys(value).sort().map(key=>`${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`:JSON.stringify(value);
export const fixturePlanDigest=value=>crypto.createHash('sha256').update(canonical(value)).digest('hex');
function fail(message){throw new Error(`invalid fixture plan: ${message}`)}
function validateNode(node){if(!node||!nodeKinds.has(node.kind))fail('unsupported fixture node');if(node.children&&!Array.isArray(node.children))fail('fixture children must be an array');for(const child of node.children??[])validateNode(child)}
export function validateFixturePlan(plan){
 if(!plan||typeof plan!=='object'||Array.isArray(plan))fail('plan must be an object');for(const key of Object.keys(plan))if(!allowed.has(key))fail(`unsupported field ${key}`);
 if(plan.schemaVersion!==FIXTURE_PLAN_VERSION)fail('schemaVersion');if(typeof plan.component!=='string'||!plan.component||typeof plan.vector!=='string'||!plan.vector)fail('component/vector');
 if(plan.contract?.schemaVersion!=='kumo.observable/v1'||!sha.test(plan.contract?.sha256??'')||typeof plan.contract?.path!=='string')fail('contract provenance');
 validateNode(plan.fixture);if(!Array.isArray(plan.setup)||!Array.isArray(plan.actions)||!Array.isArray(plan.probes)||!Array.isArray(plan.assertions)||!Array.isArray(plan.capabilities))fail('operation arrays required');
 for(const item of plan.setup)if(!setupKinds.has(item?.kind))fail(`unsupported setup ${item?.kind}`);
 for(const item of plan.actions)if(!actionTypes.has(item?.type))fail(`unsupported action ${item?.type}`);
 for(const item of plan.probes)if(!probeKinds.has(item?.kind))fail(`unsupported probe ${item?.kind}`);
 for(const item of plan.assertions)if(!assertKinds.has(item?.kind))fail(`unsupported assertion ${item?.kind}`);
 if(plan.capabilities.some(id=>typeof id!=='string'||!id)||new Set(plan.capabilities).size!==plan.capabilities.length)fail('capability IDs');
 const bundle=plan.bundle;if(!bundle||!safeFile(bundle.entry)||!safeFile(bundle.viteConfig)||typeof bundle.files!=='object'||Array.isArray(bundle.files))fail('bundle');
 for(const[file,source]of Object.entries(bundle.files))if(!safeFile(file)||typeof source!=='string')fail(`unsafe bundle file ${file}`);
 for(const key of ['headHtml','beforeAppHtml'])if(typeof bundle[key]!=='string')fail(key);if(!bundle.buildEnv||typeof bundle.buildEnv!=='object'||Array.isArray(bundle.buildEnv))fail('buildEnv');
 return plan;
}
