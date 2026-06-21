import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const contractDir=path.join(root,'contracts/kumo.observable/v1/components');
const required=['schemaVersion','component','canonical','publicApi','semantics','initialState','transitions','keyboardFocus','ssrHydration','stylingAssets','vectors','unknowns'];
const exact={canonical:['package','version','exportPath','typesPath','runtimePath','typesSha256','runtimeSha256','irSchemaVersion'],semantics:['root','aria'],keyboardFocus:['focusable','keys'],ssrHydration:['ssr','hydration'],stylingAssets:['classes','assets']};
const object=x=>x&&typeof x==='object'&&!Array.isArray(x);
function keysExactly(value,keys,where){if(!object(value)||Object.keys(value).sort().join()!==[...keys].sort().join()) throw Error(`${where}: unexpected or missing fields`)}
export function validateContract(c){
 keysExactly(c,required,'contract'); if(c.schemaVersion!=='kumo.observable/v1') throw Error('unsupported schemaVersion'); if(!/^[a-z][a-z-]*$/.test(c.component)) throw Error('invalid component');
 for(const [k,v] of Object.entries(exact)) keysExactly(c[k],v,k);
 const p=c.canonical; if(p.package!=='@cloudflare/kumo'||p.version!=='2.5.2'||p.irSchemaVersion!=='kumo.ir/v1') throw Error('canonical binding mismatch'); for(const h of ['typesSha256','runtimeSha256']) if(!/^[a-f0-9]{64}$/.test(p[h])) throw Error(`invalid ${h}`);
 if(!object(c.publicApi)||!Array.isArray(c.publicApi.exports)||!object(c.publicApi.props)||!object(c.publicApi.defaults)) throw Error('invalid publicApi');
 if(!Array.isArray(c.semantics.aria)||!Array.isArray(c.transitions)||typeof c.keyboardFocus.focusable!=='boolean'||!Array.isArray(c.keyboardFocus.keys)) throw Error('invalid behavior fields');
 if(!['supported','unknown','blocked'].includes(c.ssrHydration.ssr)||!['identical','unknown','blocked'].includes(c.ssrHydration.hydration)) throw Error('invalid SSR status');
 if(!Array.isArray(c.vectors)||!c.vectors.length) throw Error('vectors required'); const ids=new Set(); for(const v of c.vectors){keysExactly(v,['id','props','expected'],'vector');keysExactly(v.expected,['root','attributes','text'],'expected');if(ids.has(v.id))throw Error('duplicate vector');ids.add(v.id);if(v.expected.root!==c.semantics.root&&v.props.as===undefined&&v.props.asContent!==true&&c.component!=='text')throw Error('vector root conflicts with semantics')}
 if(!Array.isArray(c.unknowns))throw Error('unknowns required'); for(const u of c.unknowns){keysExactly(u,['field','status','reason'],'unknown');if(!['unknown','blocked'].includes(u.status)||!u.reason)throw Error('invalid unknown')}
 return c;
}
export function loadContracts(){return fs.readdirSync(contractDir).filter(x=>x.endsWith('.json')).sort().map(x=>validateContract(JSON.parse(fs.readFileSync(path.join(contractDir,x),'utf8'))));}
export function sha(file){return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')}
export function verifyCanonical(c){const provenance=JSON.parse(fs.readFileSync(path.join(root,'audit/kumo-react-2.5.2.provenance.json')));const p=provenance.components[c.component];if(!p||p.exportPath!==c.canonical.exportPath)throw Error(`${c.component}: provenance export mismatch`);for(const [kind,key] of [['types','typesSha256'],['runtime','runtimeSha256']]){const rel=c.canonical[`${kind}Path`],f=p.files.find(x=>x.path===rel);if(!f||f.sha256!==c.canonical[key])throw Error(`${c.component}: provenance ${kind} mismatch`);const installed=path.join(root,'node_modules/@cloudflare/kumo',rel);if(fs.existsSync(installed)&&sha(installed)!==f.sha256)throw Error(`${c.component}: installed ${kind} drift`)}}
if(process.argv[1]===fileURLToPath(import.meta.url)){const cs=loadContracts();cs.forEach(verifyCanonical);console.log(`validated ${cs.length} contracts / ${cs.reduce((n,c)=>n+c.vectors.length,0)} vectors`)}
