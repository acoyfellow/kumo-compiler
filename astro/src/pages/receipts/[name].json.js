import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import catalog from '../../../../benchmarks/catalog.json';
const frameworks=['react','vue','svelte','solid'];
const shootout={
 'shootout-language':'benchmarks/shootout/languages/latest.json',
 'shootout-architecture':'proof/shootout/architectures/matrix.json',
 'shootout-consumers':'proof/dx/consumer-receipts.json',
 'shootout-selected':'proof/shootout/fan-in/selected.json'
};
export function getStaticPaths(){return [...catalog.components.flatMap(({id})=>frameworks.map(framework=>({params:{name:`${id}.${framework}`}}))),...Object.keys(shootout).map(name=>({params:{name}}))]}
export async function GET({params}){
 const source=shootout[params.name];
 const body=await readFile(source?resolve(process.cwd(),'..',source):resolve(process.cwd(),'../generated/receipts',`${params.name}.json`),'utf8');
 return new Response(body,{headers:{'content-type':'application/json; charset=utf-8'}});
}
