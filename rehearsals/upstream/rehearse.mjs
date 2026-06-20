#!/usr/bin/env node
import { SCENARIOS, runScenario } from './lib/rehearsal.mjs';
const selected=process.argv[2]??'all';
const ids=selected==='all'?Object.keys(SCENARIOS):[selected];
const receipts=[];
for(const id of ids) receipts.push(await runScenario(id));
console.log(JSON.stringify({status:'ok',scenarios:receipts.map(r=>({id:r.scenario,semver:r.diff.classification.semver,compatible:r.diff.classification.compatible,planDelta:r.conformance.planDelta,receiptSha256:r.receiptSha256}))},null,2));
