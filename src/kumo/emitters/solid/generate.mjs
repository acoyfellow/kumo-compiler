#!/usr/bin/env node
import {emitSolidLibrary} from './index.mjs';
const result = emitSolidLibrary({outputPath: process.argv[2]});
process.stdout.write(`${result.components.length} Solid components emitted to ${result.output}\n`);
