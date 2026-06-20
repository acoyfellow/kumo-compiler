#!/usr/bin/env node
import {spawnSync} from 'node:child_process';
import path from 'node:path';
const binary=path.resolve(new URL('../../compilers/zig/zig-out/bin/kumo-zig',import.meta.url).pathname);
const p=spawnSync(binary,process.argv.slice(2),{encoding:'utf8'});
process.stdout.write(p.stdout??'');process.stderr.write(p.stderr??'');process.exitCode=p.status??1;
