#!/usr/bin/env node
/**
 * Solid's native verification harness contract.
 *
 * The generated shards are compiled by Vite's Solid plugin in SSR and browser
 * modes.  Browser capture must navigate to the HTTP URL emitted by this
 * harness, hydrate the SSR markup, and perform state changes through CDP
 * Input.dispatchMouseEvent/Input.dispatchKeyEvent (never DOM `.click()`).
 */
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';

// CELLS derive from the IR fixture (single source of truth) so the harness scales
// with the compiler automatically; no hardcoded component list.
const IR_PATH=resolve(import.meta.dirname,'../../ir/fixtures/components.json');
export const CELLS=Object.fromEntries(JSON.parse(await readFile(IR_PATH,'utf8')).components.map(c=>[c.name,c.states.values]));
export const VIEWPORTS=[390,768,1440];
export const cells=()=>Object.entries(CELLS).flatMap(([component,states])=>states.flatMap(state=>VIEWPORTS.map(viewport=>({component,state,viewport}))));
export const sha=value=>createHash('sha256').update(value).digest('hex');
export async function compilerDigest(){
 const files=['node_modules/solid-js/package.json','node_modules/vite/package.json','node_modules/vite-plugin-solid/package.json'];
 return sha((await Promise.all(files.map(path=>readFile(resolve(path))))).map(String).join('\n'));
}
export function assertTrustedCDP(log){
 if(!log.some(entry=>entry.method==='Input.dispatchMouseEvent'||entry.method==='Input.dispatchKeyEvent'))throw new Error('capture did not use trusted CDP Input');
 if(log.some(entry=>/evaluate/i.test(entry.method)&&/\.click\s*\(/.test(JSON.stringify(entry.params))))throw new Error('synthetic DOM click is forbidden');
}
if(import.meta.url===`file://${process.argv[1]}`)console.log(JSON.stringify({schemaVersion:'kumo.solid-native-harness/v1',cells:cells(),capture:'trusted-cdp-input',transport:'served-http',render:['ssr','hydrate']},null,2));
