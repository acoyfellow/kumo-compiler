#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { resolve, relative, isAbsolute, sep } from 'node:path';
import { createHash } from 'node:crypto';
const stable = value => JSON.stringify(value, (_, v) => v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.entries(v).sort(([a],[b]) => a.localeCompare(b))) : v, 2) + '\n';
const sha = value => `sha256:${createHash('sha256').update(value).digest('hex')}`;
function contained(root, input) { const full=resolve(root,input); const rel=relative(root,full); if (isAbsolute(input)||rel==='..'||rel.startsWith(`..${sep}`)||isAbsolute(rel)||input.includes('\0')) throw new Error(`unsafe path: ${input}`); return full; }
async function main() {
  const [command, ...args]=process.argv.slice(2); const json=args.includes('--json');
  if (!['manifest','check','diff','update'].includes(command)) throw Object.assign(new Error('usage: kumo <manifest|check|diff|update --dry-run --json> [--root PATH]'),{code:2});
  if (command==='update' && !args.includes('--dry-run')) throw Object.assign(new Error('update is read-only; --dry-run is required'),{code:2});
  const ri=args.indexOf('--root'); const root=resolve(ri>=0 ? args[ri+1] : process.cwd());
  let config; try { config=JSON.parse(await readFile(contained(root,'project.json'),'utf8')); } catch { config=JSON.parse(await readFile(contained(root,'kumo.config.json'),'utf8')); }
  const entries=[];
  for (const path of Object.keys(config.expected||{}).sort()) { const target=contained(root,path); let actual=null; try { actual=await readFile(target,'utf8'); } catch {} const expected=config.expected[path]; if(actual!==expected) entries.push({actualHash:actual===null?null:sha(actual),expectedHash:sha(expected),ownership:config.ownership,path,status:'drifted'}); }
  const report={entries,schemaVersion:1,status:entries.length?'drifted':'passed'};
  let out;
  if(command==='manifest') out={framework:config.framework,ownership:config.ownership,root:config.root,schemaVersion:1};
  else if(command==='check') out={schemaVersion:1,status:report.status};
  else if(command==='diff') out=report;
  else out={dryRun:true,operations:entries.map(({path,ownership,actualHash:beforeHash,expectedHash:afterHash})=>({afterHash,beforeHash,op:beforeHash?'replace':'create',ownership,path})),schemaVersion:1};
  process.stdout.write(stable(out)); if(entries.length && command==='check') process.stderr.write(`drift: ${entries.length} file(s)\n`);
  if(entries.length && ['check','diff'].includes(command)) process.exitCode=1;
}
main().catch(e=>{process.stderr.write(`${e.message}\n`); process.exitCode=e.code||2});
