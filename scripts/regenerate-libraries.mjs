#!/usr/bin/env node
// Regenerate the ACTUAL emitted component output in generated/libraries/{svelte,vue,solid}.
//
// IMPORTANT: `node src/kumo/library/generate.mjs` only rewrites model/capability JSON
// (src/kumo/library/models/*.json, capabilities/*.json). It does NOT call the emitter
// `emit*Library()` functions and therefore does NOT touch generated/libraries/* component
// source. Every "regenerate" step that only ran generate.mjs left component output stale
// relative to committed emitter source changes (e.g. a full toast-API rewrite silently
// measured as unchanged because the .tsx/.vue/.svelte files on disk hadn't moved).
//
// This script is the correct one-shot "regenerate everything the sweep/tests actually
// read" command. Run it after ANY edit to src/kumo/emitters/{svelte,vue,solid}/index.mjs
// before trusting a cascade/sweep result.
import { emitSvelteLibrary } from '../src/kumo/emitters/svelte/index.mjs';
import { generateVueLibrary } from '../src/kumo/emitters/vue/index.mjs';
import { emitSolidLibrary } from '../src/kumo/emitters/solid/index.mjs';

const svelte = emitSvelteLibrary();
const vue = generateVueLibrary();
const solid = emitSolidLibrary();

console.log(JSON.stringify({
  svelte: { count: svelte?.components?.length ?? svelte?.count },
  vue: { count: vue?.components?.length ?? vue?.count },
  solid: { count: solid?.components?.length ?? solid?.count },
}, null, 2));
