#!/usr/bin/env node
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const here=path.dirname(fileURLToPath(import.meta.url));
const p=spawnSync(path.join(here,'target/release/kumo-rust-planner'),process.argv.slice(2),{stdio:'inherit'});
process.exit(p.status??1);
