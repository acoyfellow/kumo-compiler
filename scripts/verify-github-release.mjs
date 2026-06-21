import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const root=resolve(import.meta.dirname,'..'),dir=resolve(root,'release/github/libraries-v0.0.1'),manifest=JSON.parse(await readFile(resolve(dir,'manifest.json'),'utf8')),sha=b=>createHash('sha256').update(b).digest('hex');
if(manifest.tag!=='libraries-v0.0.1'||manifest.assets.length!==3||manifest.npmPublish.performed!==false)throw Error('invalid GitHub release manifest');
for(const asset of manifest.assets){const bytes=await readFile(resolve(dir,asset.file));if(bytes.length!==asset.bytes||sha(bytes)!==asset.sha256)throw Error(`${asset.file}: bytes/hash mismatch`);if(!asset.githubUrl.includes(`/releases/download/${manifest.tag}/`))throw Error(`${asset.file}: invalid GitHub URL`);if(!asset.package.startsWith('@acoyfellow/kumo-')||asset.components.join(',')!=='Button,Field')throw Error(`${asset.file}: package contract`)}
console.log(`Verified ${manifest.assets.length} GitHub release assets (${manifest.status})`);
