#!/usr/bin/env node
import { performance } from 'node:perf_hooks';
import { lower } from './lower.mjs';
const start = performance.now(); await lower({ write: true }); const cold = performance.now() - start;
const samples = [];
for (let i=0;i<200;i++) { const at=performance.now(); await lower({ write: false }); samples.push(performance.now()-at); }
samples.sort((a,b)=>a-b);
console.log(JSON.stringify({ coldMs:+cold.toFixed(3), warmIterations:samples.length, warmMedianMs:+samples[Math.floor(samples.length/2)].toFixed(3), warmP95Ms:+samples[Math.floor(samples.length*.95)].toFixed(3) }, null, 2));
