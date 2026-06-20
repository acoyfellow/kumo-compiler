import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const forbidden=[
 'astro/.astro',
 'astro/dist',
 'dist',
 'proof/button-artifacts',
 'proof/data-presentational-artifacts',
 'proof/dialog-artifacts',
 'proof/form-artifacts',
 'proof/native-control-artifacts',
 'proof/navigation-artifacts',
 'proof/popover-artifacts',
 'proof/selection-command-date-artifacts',
];
const tracked=execFileSync('git',['ls-files','--',...forbidden],{cwd:root,encoding:'utf8'}).trim();
if(tracked)throw new Error(`reproducible artifacts are tracked:\n${tracked}`);
const status=execFileSync('git',['status','--porcelain','--untracked-files=all'],{cwd:root,encoding:'utf8'});
const temporary=status.split('\n').filter(line=>/\.public-runtime\.(?:tmp|backup)-/.test(line));
if(temporary.length)throw new Error(`temporary publication trees remain:\n${temporary.join('\n')}`);
console.log('artifact boundary verified: caches and legacy proof output are untracked');
