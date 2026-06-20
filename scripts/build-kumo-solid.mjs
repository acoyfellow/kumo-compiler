import {spawn} from 'node:child_process';
import {cp,mkdir,readFile,rm,writeFile} from 'node:fs/promises';
import {once} from 'node:events';
const ids=['select','button','dialog','popover','badge','checkbox','switch','field','input','input-group','input-area','sensitive-input','clipboard-text','tabs','menu-bar','sidebar','breadcrumbs','table-of-contents','banner','surface','layer-card','grid','grid-item','loader','meter','empty','label','link','text','cloudflare-logo','code','table','radio','autocomplete','combobox','command-palette','date-picker','date-range-picker','dropdown-menu','toasty','pagination'];
for(const id of ids){
 const dir=`runtime/${id}/solid`,ssr=`${dir}/ssr-runtime`;await rm(ssr,{recursive:true,force:true});
 const run=async args=>{const child=spawn('npx',['vite','build',dir,...args],{stdio:'inherit'});const [code]=await once(child,'exit');if(code)throw Error(`vite ${id} failed`)};
 await run([]);await run(['--ssr','src/server.tsx','--outDir','ssr-runtime','--emptyOutDir']);
 const server=await import(`../${ssr}/assets/solid-${id}.js?${Date.now()}`),rendered=server.render();
 const source=await readFile(`${dir}/index.html`,'utf8');
 const page=source.replace('<!--HYDRATION-->',rendered.hydration).replace(/<!--APP-->[\s\S]*?<!--\/APP-->/,`<!--APP--><div id="app">${rendered.html}</div><!--/APP-->`).replace('/src/client.tsx',`/${id}/solid/assets/solid-${id}.js`);
 await writeFile(`${dir}/public-runtime/index.html`,page);
 if(['button','dialog','popover'].includes(id)){const deploy=`deploy/${id}/solid`;await rm(deploy,{recursive:true,force:true});await mkdir(deploy,{recursive:true});await cp(`${dir}/public-runtime`,deploy,{recursive:true});}
 await rm(ssr,{recursive:true,force:true});
}
console.log(`built Solid client hydration and real SSR for ${ids.length} components`);
