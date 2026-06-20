use serde::{Deserialize, Serialize};
use serde_json::Value;
use sha2::{Digest, Sha256};
use std::{collections::HashSet, env, fs, io::Write, path::{Component, Path, PathBuf}, process::ExitCode};

const REQUEST: &str = "kumo.compiler.request/v1";
const IR: &str = "kumo.ir/v1";
const FRAMEWORKS: [&str; 4] = ["react", "vue", "svelte", "solid"];

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Request { #[serde(rename="schemaVersion")] schema_version: String, #[serde(rename="inputRoot")] input_root: String, #[serde(rename="outputRoot")] output_root: String, catalog: Value, frameworks: Vec<String> }
#[derive(Serialize, Clone)] struct Diagnostic { severity: &'static str, code: String, message: String, path: String }
#[derive(Serialize)] struct Compiler { name: &'static str, version: &'static str, toolchain: &'static str }
#[derive(Serialize)] struct Roots { input: String, output: String }
#[derive(Serialize, Clone, PartialEq, Eq, PartialOrd, Ord)] struct Plan { component: String, framework: String }
#[derive(Serialize, PartialEq, Eq, PartialOrd, Ord)] struct Output { path: String, sha256: String, bytes: usize }
#[derive(Serialize)] struct Receipt { #[serde(rename="schemaVersion")] schema_version: &'static str, compiler: Compiler, roots: Roots, status: &'static str, diagnostics: Vec<Diagnostic>, plan: Vec<Plan>, outputs: Vec<Output> }

fn diag(code: &str, message: impl Into<String>, path: &str) -> Diagnostic { Diagnostic { severity:"error", code:code.into(), message:message.into(), path:path.into() } }
fn receipt(input:String, output:String, status:&'static str, diagnostics:Vec<Diagnostic>, plan:Vec<Plan>, outputs:Vec<Output>) -> Receipt { Receipt { schema_version:"kumo.compiler.receipt/v1", compiler:Compiler{name:"kumo-rust-planner",version:"1.0.0",toolchain:"rustc 1.94.1"}, roots:Roots{input,output}, status, diagnostics, plan, outputs } }
fn emit(r:&Receipt) { println!("{}", serde_json::to_string(r).expect("receipt serialization")); }
fn absolute_clean(s:&str) -> bool { let p=Path::new(s); p.is_absolute() && !p.components().any(|c| matches!(c, Component::ParentDir)) }
fn safe_rel(s:&str) -> bool { !s.is_empty() && !s.contains('\\') && { let p=Path::new(s); !p.is_absolute() && p.components().all(|c| matches!(c, Component::Normal(_))) } }
fn hash(bytes:&[u8])->String { format!("{:x}", Sha256::digest(bytes)) }
fn fail(input:String, output:String, d:Diagnostic, code:u8)->ExitCode { emit(&receipt(input,output,"error",vec![d],vec![],vec![])); ExitCode::from(code) }
fn parse_catalog(req:&Request, input:&Path)->Result<Value,Diagnostic> {
    if req.catalog.is_string() { let rel=req.catalog.as_str().unwrap(); if !safe_rel(rel) { return Err(diag("path-escape","catalog path must be a safe relative path","$.catalog")); } let path=input.join(rel); let canonical_input=fs::canonicalize(input).map_err(|e|diag("invalid-root",e.to_string(),"$.inputRoot"))?; let canonical=fs::canonicalize(&path).map_err(|e|diag("catalog-read",e.to_string(),"$.catalog"))?; if !canonical.starts_with(&canonical_input) { return Err(diag("path-escape","catalog escapes input root","$.catalog")); } let bytes=fs::read(canonical).map_err(|e|diag("catalog-read",e.to_string(),"$.catalog"))?; serde_json::from_slice(&bytes).map_err(|e|diag("invalid-catalog",e.to_string(),"$.catalog"))
    } else if req.catalog.is_object() { Ok(req.catalog.clone()) } else { Err(diag("invalid-catalog","catalog must be an object or relative path","$.catalog")) }
}
fn promote(staging:&Path, output:&Path)->std::io::Result<()> { if output.exists() { let backup=output.with_extension(format!("kumo-backup-{}",std::process::id())); if backup.exists(){fs::remove_dir_all(&backup)?;} fs::rename(output,&backup)?; match fs::rename(staging,output) { Ok(())=>{fs::remove_dir_all(backup)?;Ok(())}, Err(e)=>{let _=fs::rename(backup,output);Err(e)} } } else { fs::rename(staging,output) } }
fn run()->ExitCode {
    let Some(arg)=env::args_os().nth(1) else { return fail("unknown".into(),"unknown".into(),diag("missing-request","expected one positional request file","$"),2); };
    if env::args_os().nth(2).is_some() { return fail("unknown".into(),"unknown".into(),diag("invalid-arguments","expected exactly one positional request file","$"),2); }
    let bytes=match fs::read(arg){Ok(x)=>x,Err(e)=>return fail("unknown".into(),"unknown".into(),diag("request-read",e.to_string(),"$"),2)};
    let req:Request=match serde_json::from_slice(&bytes){Ok(x)=>x,Err(e)=>return fail("unknown".into(),"unknown".into(),diag("malformed-request",e.to_string(),"$"),2)};
    let input=req.input_root.clone(); let output=req.output_root.clone();
    if req.schema_version!=REQUEST { return fail(input,output,diag("unsupported-protocol",format!("expected {REQUEST}"),"$.schemaVersion"),3); }
    if !absolute_clean(&input) { return fail(input,output,diag("absolute-root-required","inputRoot must be an absolute normalized path","$.inputRoot"),3); }
    if !absolute_clean(&output) { return fail(input,output,diag("absolute-root-required","outputRoot must be an absolute normalized path","$.outputRoot"),3); }
    if req.frameworks.is_empty() { return fail(input,output,diag("invalid-frameworks","at least one framework is required","$.frameworks"),3); }
    let mut fw_seen=HashSet::new(); for (i,f) in req.frameworks.iter().enumerate() { if !FRAMEWORKS.contains(&f.as_str()) { return fail(input,output,diag("unsupported-framework",format!("unsupported framework {f}"),&format!("$.frameworks[{i}]")),3); } if !fw_seen.insert(f) { return fail(input,output,diag("duplicate-framework","duplicate framework",&format!("$.frameworks[{i}]")),3); } }
    let catalog=match parse_catalog(&req,Path::new(&input)){Ok(x)=>x,Err(d)=>return fail(input,output,d,3)};
    if catalog.get("schemaVersion").and_then(Value::as_str)!=Some(IR) { return fail(input,output,diag("invalid-catalog",format!("expected {IR} catalog"),"$.catalog.schemaVersion"),3); }
    let Some(components)=catalog.get("components").and_then(Value::as_array) else { return fail(input,output,diag("invalid-catalog","components must be an array","$.catalog.components"),3); };
    let mut ids=HashSet::new(); let mut plan=Vec::new();
    for (i,c) in components.iter().enumerate() { let base=format!("$.catalog.components[{i}]"); if c.get("schemaVersion").and_then(Value::as_str)!=Some(IR) || c.get("root").is_none() { return fail(input,output,diag("invalid-component",format!("expected {IR} component with root"),&base),3); } let Some(id)=c.get("id").and_then(Value::as_str) else{return fail(input,output,diag("invalid-component","component id must be a string",&format!("{base}.id")),3)}; if !safe_rel(id) || id.contains('/') { return fail(input,output,diag("unsafe-component-id","component id must be one safe path segment",&format!("{base}.id")),3); } if !ids.insert(id.to_owned()) { return fail(input,output,diag("duplicate-component","duplicate component id",&format!("{base}.id")),3); } for f in &req.frameworks { plan.push(Plan{component:id.into(),framework:f.clone()}); } }
    plan.sort();
    let output_path=PathBuf::from(&output); let parent=output_path.parent().unwrap_or(Path::new("/")); if let Err(e)=fs::create_dir_all(parent) { return fail(input,output,diag("output-write",e.to_string(),"$.outputRoot"),4); } let staging=parent.join(format!(".kumo-stage-{}",std::process::id())); let _=fs::remove_dir_all(&staging); if let Err(e)=fs::create_dir(&staging) { return fail(input,output,diag("output-write",e.to_string(),"$.outputRoot"),4); }
    let mut outputs=Vec::new(); for item in &plan { let rel=format!("plans/{}/{}.json",item.component,item.framework); let body=serde_json::to_vec_pretty(&serde_json::json!({"schemaVersion":"kumo.compiler.plan/v1","component":item.component,"framework":item.framework,"ir":catalog.get("components").and_then(Value::as_array).and_then(|cs|cs.iter().find(|c|c.get("id").and_then(Value::as_str)==Some(&item.component)))})).unwrap(); let mut body_nl=body; body_nl.push(b'\n'); let dest=staging.join(&rel); if let Some(p)=dest.parent(){if let Err(e)=fs::create_dir_all(p){let _=fs::remove_dir_all(&staging);return fail(input,output,diag("output-write",e.to_string(),"$.outputRoot"),4)}} match fs::File::create(&dest).and_then(|mut f|{f.write_all(&body_nl)?;f.sync_all()}) {Ok(())=>{},Err(e)=>{let _=fs::remove_dir_all(&staging);return fail(input,output,diag("output-write",e.to_string(),"$.outputRoot"),4)}} outputs.push(Output{path:rel,sha256:hash(&body_nl),bytes:body_nl.len()}); }
    outputs.sort(); if let Err(e)=promote(&staging,&output_path){let _=fs::remove_dir_all(&staging);return fail(input,output,diag("atomic-promotion",e.to_string(),"$.outputRoot"),4)} emit(&receipt(input,output,"ok",vec![],plan,outputs)); ExitCode::SUCCESS
}
fn main()->ExitCode { run() }
