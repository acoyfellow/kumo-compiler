import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root=resolve(import.meta.dirname,'..'), out=resolve(root,'release/github/libraries-v0.0.1');
const owner=process.env.KUMO_GITHUB_OWNER||'OWNER', repo=process.env.KUMO_GITHUB_REPO||'kumo-compiler', tag='libraries-v0.0.1';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
await rm(resolve(root,'release/github'),{recursive:true,force:true});await mkdir(out,{recursive:true});
const manifest=JSON.parse(await readFile(resolve(root,'library-artifacts/manifest.json'),'utf8')), assets=[];
for(const entry of manifest.packages){const bytes=await readFile(resolve(root,'library-artifacts',entry.friendlyName));if(sha(bytes)!==entry.sha256)throw Error(`${entry.friendlyName}: source artifact hash mismatch`);await copyFile(resolve(root,'library-artifacts',entry.friendlyName),resolve(out,entry.friendlyName));assets.push({package:entry.package,framework:entry.framework,version:entry.version,file:entry.friendlyName,bytes:bytes.length,sha256:entry.sha256,integrity:entry.integrity,components:entry.components,githubUrl:`https://github.com/${owner}/${repo}/releases/download/${tag}/${entry.friendlyName}`,npmRegistryPublishPrepared:true});}
const checksums=assets.map(x=>`${x.sha256}  ${x.file}`).join('\n')+'\n';await writeFile(resolve(out,'SHA256SUMS'),checksums);
const release={schemaVersion:1,status:owner==='OWNER'?'prepared':'ready',tag,repository:`${owner}/${repo}`,assets,humanSteps:owner==='OWNER'?['Set KUMO_GITHUB_OWNER or replace OWNER after the GitHub repository exists.','Create and push tag libraries-v0.0.1.','Upload all files in this directory as GitHub Release assets.']:[],npmPublish:{performed:false,command:'npm publish <tarball> --access public',requiresAuthorizedScopeOwner:true}};release.receiptHash=sha(Buffer.from(JSON.stringify(release)));await writeFile(resolve(out,'manifest.json'),JSON.stringify(release,null,2)+'\n');
const notes=`# Kumo framework libraries 0.0.1\n\nFramework-native Button and Field packages derived from canonical @cloudflare/kumo@2.5.2. Select is intentionally not included.\n\n## Install from this GitHub release\n\n${assets.map(x=>`\`\`\`sh\nnpm install ${x.githubUrl}\n\`\`\``).join('\n\n')}\n\nVerify downloads with \`SHA256SUMS\`. See \`manifest.json\` for package identity and integrity.\n`;
await writeFile(resolve(out,'RELEASE_NOTES.md'),notes);
console.log(`Prepared ${assets.length} GitHub release assets in release/github/${tag}/ (${release.receiptHash})`);
