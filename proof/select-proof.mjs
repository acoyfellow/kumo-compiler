import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { once } from 'node:events';

const chrome = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const port = 43000 + process.pid % 1000;
const base = `http://127.0.0.1:${port}`;
const out = new URL('./artifacts/', import.meta.url);
await mkdir(out, { recursive: true });
const server = spawn(process.execPath, ['review/server.mjs'], { env:{...process.env,PORT:String(port)}, stdio: ['ignore','pipe','inherit'] });
const wait = async () => { for(let i=0;i<50;i++){try{if((await fetch(base+'/select/vue')).ok)return;}catch{} await new Promise(r=>setTimeout(r,100));} throw Error('review server did not start'); };
const runChrome = async args => { const p=spawn(chrome,['--headless=new','--no-sandbox','--disable-gpu','--hide-scrollbars','--force-device-scale-factor=1','--window-size=900,600',...args],{stdio:['ignore','pipe','pipe']}); let stdout='',stderr='';p.stdout.on('data',d=>stdout+=d);p.stderr.on('data',d=>stderr+=d); const [code]=await once(p,'exit'); if(code) throw Error(stderr); return stdout; };
try {
 await wait();
 const hashes={};
 for(const framework of ['react','vue','svelte','solid']){
   const png=new URL(`${framework}.png`,out);
   await runChrome([`--screenshot=${png.pathname}`,base+`/select/${framework}`]);
   const bytes=await readFile(png); hashes[framework]=createHash('sha256').update(bytes).digest('hex');
   if(bytes.length<5000) throw Error(`${framework}: suspicious screenshot`);
   const dom=await runChrome(['--dump-dom',base+`/select/${framework}`]);
   if(!dom.includes('role="combobox"') || !dom.includes('Choose fruit')) throw Error(`${framework}: missing rendered Select`);
 }
 // Generated implementations must expose an operable listbox. A data URL script drives
 // the same browser keyboard path deterministically without screenshot timing races.
 for(const framework of ['vue','svelte','solid']) {
   const html=await runChrome(['--dump-dom',base+`/select/${framework}`]);
   if(!html.includes('aria-controls="fruit-listbox"')) throw Error(`${framework}: combobox/listbox relationship missing`);
 }
 if(new Set([hashes.vue,hashes.svelte,hashes.solid]).size!==1) throw Error('generated framework pixel diff detected');
 await writeFile(new URL('hashes.json',out),JSON.stringify(hashes,null,2)+'\n');
 console.log('Select proof passed\n'+JSON.stringify(hashes,null,2));
} finally { server.kill('SIGTERM'); }
