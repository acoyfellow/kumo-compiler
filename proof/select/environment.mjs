import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../..');
const names=['vite','@vitejs/plugin-react','@vitejs/plugin-vue','@sveltejs/vite-plugin-svelte','vite-plugin-solid','react','react-dom','vue','svelte','solid-js'];
const packages={};
for(const name of names){const file=path.join(root,'node_modules',name,'package.json');const body=fs.readFileSync(file);packages[name]={version:JSON.parse(body).version,packageJsonSha256:crypto.createHash('sha256').update(body).digest('hex')};}
const chrome=process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const manifest={schemaVersion:1,dependencyRoot:'node_modules',node:process.version,npm:execFileSync('npm',['--version'],{encoding:'utf8'}).trim(),chrome:execFileSync(chrome,['--version'],{encoding:'utf8'}).trim(),packages};
fs.writeFileSync(path.join(here,'environment.json'),JSON.stringify(manifest,null,2)+'\n');
