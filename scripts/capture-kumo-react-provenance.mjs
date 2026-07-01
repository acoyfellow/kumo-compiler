import {createHash} from 'node:crypto';
import {readFile,readdir,stat,writeFile,mkdir} from 'node:fs/promises';
import {resolve,relative} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const packageRoot=resolve(process.env.KUMO_PACKAGE_ROOT??resolve(root,'node_modules/@cloudflare/kumo'));
const lockPath=resolve(packageRoot,'../../../package-lock.json');
const pkgBytes=await readFile(resolve(packageRoot,'package.json'));const pkg=JSON.parse(pkgBytes);
if(pkg.name!=='@cloudflare/kumo'||pkg.version!=='2.6.0')throw new Error(`expected @cloudflare/kumo 2.6.0, found ${pkg.name} ${pkg.version}`);
const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
const lock=JSON.parse(await readFile(lockPath));const locked=lock.packages?.['node_modules/@cloudflare/kumo'];
if(locked?.version!=='2.6.0'||!locked.resolved||!locked.integrity)throw new Error('npm lock does not bind Kumo 2.6.0 with URL and integrity');
const ids=JSON.parse(await readFile(resolve(root,'generated/catalog.ir.json'))).components.map(x=>x.id);
// Nested compiler concepts are bound to their machine-verifiable parent public
// export. The named symbol is recorded by the canonical mapping manifest.
const aliases={'menu-bar':'menubar','dropdown-menu':'dropdown','input-area':'input','grid-item':'grid','toasty':'toast','table-of-contents':'table-of-contents'};
const walk=async dir=>{let out=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=resolve(dir,e.name);out.push(...(e.isDirectory()?await walk(p):[p]))}return out};
const all=await walk(resolve(packageRoot,'dist'));
const files={};for(const id of ids){const slug=aliases[id]??id;const exportPath=`./components/${slug}`;const exp=pkg.exports?.[exportPath]??null;const targets=exp?[exp.import,exp.types].filter(Boolean).map(x=>x.replace(/^\.\//,'')):[];
 const relevant=all.filter(p=>{const r=relative(packageRoot,p);return targets.includes(r)||targets.some(t=>r===`${t}.map`)||r.split('/').some(part=>part===slug||part.startsWith(`${slug}-`)||part===`${slug}.js`||part===`${slug}.d.ts`)});
 files[id]={exportPath,export:exp,files:await Promise.all([...new Set(relevant)].sort().map(async p=>{const b=await readFile(p);return{path:relative(packageRoot,p),sha256:sha256(b),bytes:(await stat(p)).size}}))};}
const manifest={schemaVersion:'kumo.canonical-react-provenance/v1',package:{name:pkg.name,version:pkg.version,repository:pkg.repository,packageJsonSha256:sha256(pkgBytes)},npmLock:{resolved:locked.resolved,integrity:locked.integrity},sourceInstallation:{kind:'preserved-npm-package',note:'Absolute installation location is intentionally not evidence; every relevant byte is bound below.'},gitRevision:null,gitTag:null,components:files};
await mkdir(resolve(root,'audit'),{recursive:true});await writeFile(resolve(root,`audit/kumo-react-${pkg.version}.provenance.json`),JSON.stringify(manifest,null,2)+'\n');
console.log(`Bound ${ids.length} components to ${pkg.name}@${pkg.version}; ${Object.values(files).filter(x=>x.export).length} component exports found`);
