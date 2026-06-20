import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import catalog from '../../../../benchmarks/catalog.json';
const frameworks=['react','vue','svelte','solid'];
export function getStaticPaths(){return catalog.components.flatMap(({id})=>frameworks.map(framework=>({params:{name:`${id}.${framework}`}})))}
export async function GET({params}){
 const body=await readFile(resolve(process.cwd(),'../generated/receipts',`${params.name}.json`),'utf8');
 return new Response(body,{headers:{'content-type':'application/json; charset=utf-8'}});
}
