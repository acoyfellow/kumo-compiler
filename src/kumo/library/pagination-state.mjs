import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

export const PAGINATION_STATE_VERSION='kumo.pagination-state/v1';
const here=path.dirname(fileURLToPath(import.meta.url));
const sha=value=>crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const integer=(value,name)=>{if(!Number.isSafeInteger(value)||value<1)throw new Error(`invalid ${name}`);return value;};

export function maxPage(totalCount,perPage){
 if(!Number.isSafeInteger(totalCount)||totalCount<0)throw new Error('invalid total count');
 integer(perPage,'page size');
 return Math.max(1,Math.ceil(totalCount/perPage));
}
export function clampPage(page,maximum){integer(maximum,'maximum page');return Math.min(maximum,Math.max(1,integer(page,'page')));}
export function paginationState({page,perPage,totalCount}){
 const maximum=maxPage(totalCount,perPage),current=clampPage(page,maximum);
 return Object.freeze({page:current,perPage,totalCount,maxPage:maximum,previousDisabled:current===1,nextDisabled:current===maximum,firstDisabled:current===1,lastDisabled:current===maximum});
}
export function proposePage(current,target,maximum,{controlled=true}={}){
 const previous=clampPage(current,maximum),proposal=clampPage(target,maximum);
 return {previous,proposal,value:controlled?previous:proposal,committed:!controlled,changed:proposal!==previous,ownership:controlled?'controlled':'uncontrolled'};
}
export function previousPage(current,maximum,options){return proposePage(current,Math.max(1,current-1),maximum,options);}
export function nextPage(current,maximum,options){return proposePage(current,Math.min(maximum,current+1),maximum,options);}
export function parsePageInput(value){
 if(typeof value!=='string')return null;
 const text=value.trim();if(!/^[0-9]+$/.test(text))return null;
 const parsed=Number(text);return Number.isSafeInteger(parsed)?parsed:null;
}
export function commitPageInput(current,input,maximum,{trigger='Enter',controlled=true}={}){
 if(trigger!=='Enter'&&trigger!=='blur')return {previous:current,proposal:null,value:current,committed:false,changed:false,ownership:controlled?'controlled':'uncontrolled',input:String(current),trigger:'ignored'};
 const parsed=parsePageInput(input);
 if(parsed===null)return {previous:current,proposal:null,value:current,committed:false,changed:false,ownership:controlled?'controlled':'uncontrolled',input:String(current),trigger};
 const result=proposePage(current,Math.min(maximum,Math.max(1,parsed)),maximum,{controlled});
 return {...result,input:String(result.proposal),trigger};
}
export function proposePageSize(currentSize,nextSize,{controlled=true}={}){
 integer(currentSize,'page size');integer(nextSize,'page size');
 return {previous:currentSize,proposal:nextSize,value:controlled?currentSize:nextSize,committed:!controlled,changed:nextSize!==currentSize,ownership:controlled?'controlled':'uncontrolled'};
}
export function legacySSRState(page){integer(page,'page');return Object.freeze({serverEditingPage:1,hydratedEditingPage:page,nodeIdentity:true});}

export function derivePaginationState(contract){
 if(contract?.component!=='pagination'||contract.schemaVersion!=='kumo.observable/v1')throw new Error('canonical pagination contract required');
 const value={schemaVersion:PAGINATION_STATE_VERSION,navigation:{previous:'page-1',next:'page+1',target:'clamped-to-inclusive-[1,maxPage]',boundaries:'disable-first/previous-at-1-and-next/last-at-maxPage'},ownership:'controlled-proposes-uncontrolled-commits',pageSize:{maximum:'max(1,ceil(totalCount/perPage))',selection:'numeric-change-proposal'},input:{syntax:'trimmed-unsigned-base-10-integer',commitTriggers:['Enter','blur'],commit:'parse-clamp-propose',invalid:'restore-current-without-proposal'},legacySSR:{editingPage:1,hydration:'synchronize-to-controlled-page-preserving-node'},unknowns:[...contract.unknowns,{field:'invalidPageInputUserFeedback',status:'unknown',reason:'The canonical vectors do not establish announcements or validation UI for invalid page text.'},{field:'pageSizePageReset',status:'unknown',reason:'The canonical contract establishes numeric page-size change only; resulting page reset behavior is not observed.'}],provenance:{component:'pagination',contractPath:'contracts/kumo.observable/v1/components/pagination.json',contractSchema:contract.schemaVersion,canonical:contract.canonical,vectorIds:contract.vectors.map(vector=>vector.id),contractDigest:sha(contract)}};
 return {...value,capabilityDigest:sha(value)};
}
export function validatePaginationState(value){
 if(value?.schemaVersion!==PAGINATION_STATE_VERSION||value.navigation?.previous!=='page-1'||value.input?.commitTriggers?.join(',')!=='Enter,blur'||value.legacySSR?.editingPage!==1||!Array.isArray(value.unknowns))throw new Error('invalid pagination state capability');
 const p=value.provenance;if(p?.component!=='pagination'||p.contractSchema!=='kumo.observable/v1'||!p.contractPath||!p.canonical?.typesSha256||!p.canonical?.runtimeSha256||p.vectorIds?.length!==8||!/^[a-f0-9]{64}$/.test(p.contractDigest??''))throw new Error('pagination state provenance required');
 const {capabilityDigest,...unsigned}=value;if(capabilityDigest!==sha(unsigned))throw new Error('pagination state capability digest mismatch');return value;
}
export function loadPaginationState(file=path.join(here,'capabilities/pagination-state.json')){return validatePaginationState(JSON.parse(fs.readFileSync(file,'utf8')));}
