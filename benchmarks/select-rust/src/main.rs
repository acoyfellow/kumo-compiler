use serde::Deserialize;
use std::{env, fs, path::PathBuf, time::Instant};

#[derive(Deserialize)]
struct Spec { name: String, items: Vec<Item>, styles: Styles }
#[derive(Deserialize)]
struct Item { #[serde(default)] value: Option<serde_json::Value>, #[serde(default)] label: Option<String> }
#[derive(Deserialize)]
struct Styles { control: String }

const ICON: &str = r#"<svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16"><path fill="currentColor" d="m4 6 4 4 4-4z"/></svg>"#;
const VUE: &str = r#"<script setup>
import {ref} from 'vue'; const p=defineProps({id:String,label:String,hideLabel:Boolean,size:String,loading:Boolean,disabled:Boolean,value:[String,Object],placeholder:String,error:String,description:String,items:Array}); const options=['Apple','Banana','Cherry']; const open=ref(false), selected=ref(p.value||''); const id=(p.label||'select').toLowerCase().replace(/[^a-z0-9]+/g,'-')+'-listbox'; function key(e){if(['ArrowDown','Enter',' '].includes(e.key)){e.preventDefault();open.value=true}else if(e.key==='Escape')open.value=false} function choose(v){selected.value=v;open.value=false}
</script>
<template><div class="kumo-field"><label :for="id+'-trigger'" :class="p.hideLabel?'sr-only':''">{{p.label}}</label><button type="button" role="combobox" :id="id+'-trigger'" :aria-controls="id" :aria-expanded="open" aria-haspopup="listbox" :disabled="p.disabled||p.loading" :aria-busy="p.loading||undefined" :aria-invalid="p.error?true:undefined" @click="open=!open" @keydown="key" :class="['__TRIGGER__',p.size||'base']"><span>{{selected||p.placeholder}}</span>__ICON__</button><ul v-if="open" :id="id" role="listbox"><li v-for="o in options" role="option" :aria-selected="selected===o" tabindex="-1" @click="choose(o)">{{o}}</li></ul><p v-if="p.error" class="error">{{p.error}}</p><p v-else-if="p.description" class="description">{{p.description}}</p></div></template>
"#;
const SVELTE: &str = r#"<script>export let label='';export let disabled=false;export let value='';export let placeholder='';export let error='';export let description='';export let hideLabel=false;export let size='base';export let loading=false;export let id='select-listbox';let open=false;let selected=value;$: id=(label||'select').toLowerCase().replace(/[^a-z0-9]+/g,'-')+'-listbox';const options=__OPTIONS__;function key(e){if(['ArrowDown','Enter',' '].includes(e.key)){e.preventDefault();open=true}else if(e.key==='Escape')open=false}function choose(v){selected=v;open=false}</script>
<div class="kumo-field"><label for={id+'-trigger'} class:sr-only={hideLabel}>{label}</label><button type="button" role="combobox" id={id+'-trigger'} aria-controls={id} aria-expanded={open} aria-haspopup="listbox" aria-busy={loading||undefined} aria-invalid={error?true:undefined} disabled={disabled||loading} onclick={()=>open=!open} onkeydown={key} class="__TRIGGER__ {size}"><span>{selected||placeholder}</span>__ICON__</button>{#if open}<ul id={id} role="listbox">{#each options as o}<li role="option" aria-selected={selected===o} tabindex="-1" onclick={()=>choose(o)} onkeydown={(e)=>['Enter',' '].includes(e.key)&&choose(o)}>{o}</li>{/each}</ul>{/if}{#if error}<p class="error">{error}</p>{:else if description}<p class="description">{description}</p>{/if}</div>
"#;
const SOLID: &str = r#"import {createSignal} from 'solid-js'; export default function Select(p){const [open,setOpen]=createSignal(false),[selected,setSelected]=createSignal(p.value||'');const id=()=> (p.label||'select').toLowerCase().replace(/[^a-z0-9]+/g,'-')+'-listbox';const key=e=>{if(['ArrowDown','Enter',' '].includes(e.key)){e.preventDefault();setOpen(true)}else if(e.key==='Escape')setOpen(false)};const choose=o=>{setSelected(o);setOpen(false)};return <div class="kumo-field"><label for={id()+'-trigger'} class={p.hideLabel?'sr-only':''}>{p.label}</label><button type="button" role="combobox" id={id()+'-trigger'} aria-controls={id()} aria-expanded={open()} aria-haspopup="listbox" aria-busy={p.loading||undefined} aria-invalid={p.error?true:undefined} disabled={p.disabled||p.loading} onClick={()=>setOpen(!open())} onKeyDown={key} class={'__TRIGGER__ '+(p.size||'base')}><span>{selected()||p.placeholder}</span>__ICON__</button>{open()&&<ul id={id()} role="listbox">{__OPTIONS__.map(o=><li role="option" aria-selected={selected()===o} tabIndex="-1" onClick={()=>choose(o)}>{o}</li>)}</ul>}{p.error?<p class="error">{p.error}</p>:p.description?<p class="description">{p.description}</p>:null}</div>}
"#;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let args: Vec<String> = env::args().collect();
    let spec_path = PathBuf::from(args.get(1).map(String::as_str).unwrap_or("specs/select.json"));
    let output = PathBuf::from(args.get(2).map(String::as_str).unwrap_or("benchmarks/select-rust/.generated"));
    let started = Instant::now();
    let spec: Spec = serde_json::from_str(&fs::read_to_string(spec_path)?)?;
    let options: Vec<String> = spec.items.into_iter().filter(|i| i.value.is_some()).filter_map(|i| i.label).collect();
    let options_json = serde_json::to_string(&options)?;
    let render = |template: &str| template.replace("__TRIGGER__", &spec.styles.control).replace("__ICON__", ICON).replace("__OPTIONS__", &options_json);
    let files = [("vue/Select.vue", render(VUE)), ("svelte/Select.svelte", render(SVELTE)), ("solid/Select.tsx", render(SOLID))];
    for (relative, source) in &files { let path = output.join(relative); fs::create_dir_all(path.parent().unwrap())?; fs::write(path, source)?; }
    let bytes: usize = files.iter().map(|(_, source)| source.len()).sum();
    eprintln!("generated {} sources", spec.name);
    println!(r#"{{"generationNs":{},"outputBytes":{}}}"#, started.elapsed().as_nanos(), bytes);
    Ok(())
}
