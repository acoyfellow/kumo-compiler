#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const catalogPath=path.join(root,'benchmarks/catalog.json');
const provenancePath=path.join(root,'audit/kumo-react-2.6.0.provenance.json');
const componentsDir=path.join(root,'contracts/kumo.observable/v1/components');

function readJson(file,label){
  let text;
  try{text=fs.readFileSync(file,'utf8')}catch(error){throw new Error(`${label} unavailable: ${error.message}`)}
  try{return JSON.parse(text)}catch(error){throw new Error(`${label} is not valid JSON: ${error.message}`)}
}
function catalogIds(){
  const value=readJson(catalogPath,'catalog');
  if(!Array.isArray(value.components))throw new Error('catalog components inventory is missing');
  const ids=value.components.map(item=>item?.id);
  if(ids.length!==41||new Set(ids).size!==41||ids.some(id=>typeof id!=='string'||!/^[a-z][a-z-]*$/.test(id)))throw new Error('catalog must contain the exact 41 unique component IDs');
  return ids;
}
function shaFor(component,filePath,label){
  const normalized=filePath.replace(/^\.\//,'');
  const file=component.files?.find(item=>item.path===normalized);
  if(!file||typeof file.sha256!=='string'||!/^[a-f0-9]{64}$/.test(file.sha256))throw new Error(`provenance has no valid SHA-256 for ${label} path ${filePath}`);
  return file.sha256;
}
export function buildSkeleton(id){
  const ids=catalogIds();
  if(!ids.includes(id))throw new Error(`unknown component ID ${JSON.stringify(id)}; expected one of the exact 41 catalog IDs`);
  const provenance=readJson(provenancePath,'canonical provenance');
  if(provenance.schemaVersion!=='kumo.canonical-react-provenance/v1'||provenance.package?.name!=='@cloudflare/kumo'||provenance.package?.version!=='2.6.0')throw new Error('canonical provenance package binding must be @cloudflare/kumo@2.6.0');
  const component=provenance.components?.[id];
  const typesPath=component?.export?.types;
  const runtimePath=component?.export?.import;
  if(!component||typeof component.exportPath!=='string'||typeof typesPath!=='string'||typeof runtimePath!=='string')throw new Error(`canonical provenance entry is incomplete for ${id}`);
  const declarations=path.resolve(root,'node_modules/@cloudflare/kumo',typesPath);
  if(!declarations.startsWith(path.resolve(root,'node_modules/@cloudflare/kumo')+path.sep))throw new Error(`unsafe types path in provenance for ${id}`);
  let declarationText;
  try{declarationText=fs.readFileSync(declarations,'utf8')}catch(error){throw new Error(`package declarations unavailable for ${id}: ${error.message}`)}
  if(!/\bexport\b/.test(declarationText))throw new Error(`package declarations expose no inspectable exports for ${id}`);
  return {
    schemaVersion:'kumo.observable/v1',component:id,
    canonical:{package:'@cloudflare/kumo',version:'2.6.0',exportPath:component.exportPath,typesPath,runtimePath,typesSha256:shaFor(component,typesPath,'types'),runtimeSha256:shaFor(component,runtimePath,'runtime'),irSchemaVersion:'kumo.ir/v1'},
    publicApi:{exports:['UNRESOLVED: inspect package declarations; replace before validation'],props:{},defaults:{}},
    semantics:{root:'unknown',aria:[]},initialState:{},transitions:[],keyboardFocus:{focusable:false,keys:[]},
    ssrHydration:{ssr:'unknown',hydration:'unknown'},stylingAssets:{classes:[],assets:[]},
    vectors:[{id:'starter-blocked',props:{},expected:{root:{}}}],
    unknowns:[
      {field:'publicApi.exports',status:'blocked',reason:'Package declarations were inspected, but public runtime exports require human resolution.'},
      {field:'publicApi.props/defaults',status:'unknown',reason:'No props or defaults are inferred by scaffolding.'},
      {field:'semantics/initialState/transitions/keyboardFocus',status:'unknown',reason:'Observable behavior requires evidence; no semantics are fabricated.'},
      {field:'stylingAssets',status:'unknown',reason:'Classes and assets require observable evidence.'},
      {field:'vectors.starter-blocked',status:'blocked',reason:'Starter vector is a placeholder and must not be treated as passing evidence.'}
    ]
  };
}
export function missingContracts(){return catalogIds().filter(id=>!fs.existsSync(path.join(componentsDir,`${id}.json`)))}
function usage(){return 'Usage: npm run contract:new -- <component-id> [--write|--check]\n       npm run contract:new -- --all-missing';}
export function main(args=process.argv.slice(2)){
  const flags=args.filter(arg=>arg.startsWith('--'));
  const positional=args.filter(arg=>!arg.startsWith('--'));
  const known=new Set(['--write','--check','--dry-run','--all-missing','--help']);
  if(flags.some(flag=>!known.has(flag)))throw new Error(`unknown option ${flags.find(flag=>!known.has(flag))}`);
  if(flags.includes('--help')){console.log(usage());return}
  if(flags.includes('--all-missing')){
    if(positional.length||flags.some(x=>['--write','--check','--dry-run'].includes(x)))throw new Error('--all-missing is a report-only mode');
    console.log(JSON.stringify({schemaVersion:'kumo.observable-scaffold-report/v1',missing:missingContracts()},null,2));return;
  }
  if(positional.length!==1)throw new Error(usage());
  const id=positional[0];
  // Reject path syntax before catalog lookup so traversal errors are explicit.
  if(id.includes('/')||id.includes('\\')||id.includes('..'))throw new Error('component ID must not contain path traversal');
  if(flags.includes('--write')&&(flags.includes('--check')||flags.includes('--dry-run')))throw new Error('--write cannot be combined with --check/--dry-run');
  const output=path.join(componentsDir,`${id}.json`);
  if(fs.existsSync(output))throw new Error(`contract already exists: ${path.relative(root,output)}; existing contracts are never overwritten`);
  const text=JSON.stringify(buildSkeleton(id),null,2)+'\n';
  if(flags.includes('--check')||flags.includes('--dry-run'))return;
  if(flags.includes('--write')){fs.mkdirSync(componentsDir,{recursive:true});fs.writeFileSync(output,text,{flag:'wx'});console.error(`created ${path.relative(root,output)}`);return}
  process.stdout.write(text);
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{main()}catch(error){console.error(`contract:new: ${error.message}`);process.exitCode=1}
}
