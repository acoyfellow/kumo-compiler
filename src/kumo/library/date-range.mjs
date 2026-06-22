import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

export const DATE_RANGE_VERSION = 'kumo.date-range/v1';
const here = path.dirname(fileURLToPath(import.meta.url));
const sha = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const pad = n => String(n).padStart(2, '0');

export function parseISODate(value) {
  if (typeof value !== 'string' || !/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(value)) throw new Error('invalid ISO date');
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (year < 1 || date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) throw new Error('invalid ISO date');
  return Object.freeze({year, month, day, iso:value, epochDay:Math.floor(date.getTime() / 86400000)});
}
export function formatISODate(epochDay) {
  if (!Number.isSafeInteger(epochDay)) throw new Error('invalid epoch day');
  const d = new Date(epochDay * 86400000);
  return `${String(d.getUTCFullYear()).padStart(4,'0')}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())}`;
}
export function calendarGrid(monthISO, {weekStartsOn=0}={}) {
  if (!Number.isInteger(weekStartsOn) || weekStartsOn < 0 || weekStartsOn > 6) throw new Error('invalid week start');
  const month = parseISODate(monthISO); if (month.day !== 1) throw new Error('month must be first day');
  const first = new Date(Date.UTC(month.year,month.month-1,1));
  const offset = (first.getUTCDay()-weekStartsOn+7)%7;
  const start = month.epochDay-offset;
  return Object.freeze(Array.from({length:42},(_,index)=>{const iso=formatISODate(start+index);const d=parseISODate(iso);return Object.freeze({iso,row:Math.floor(index/7),column:index%7,inMonth:d.month===month.month&&d.year===month.year});}));
}
export function isDateDisabled(iso,{min=null,max=null,disabled=[]}={}) {
  const day=parseISODate(iso).epochDay;
  if (min!==null && day<parseISODate(min).epochDay) return true;
  if (max!==null && day>parseISODate(max).epochDay) return true;
  return disabled.some(item=>parseISODate(item).epochDay===day);
}
export function selectSingle(current,iso,options={}) { parseISODate(iso); return isDateDisabled(iso,options)?{value:current,proposal:null,committed:false}:{value:iso,proposal:iso,committed:true}; }
export function selectRange(range,iso,options={}) {
  parseISODate(iso); if(isDateDisabled(iso,options)) return {value:range,proposal:null,committed:false,phase:'blocked'};
  if(!range?.start || range.end) return {value:{start:iso,end:null},proposal:{start:iso,end:null},committed:true,phase:'start'};
  if(parseISODate(iso).epochDay < parseISODate(range.start).epochDay) return {value:{start:iso,end:null},proposal:{start:iso,end:null},committed:true,phase:'restart'};
  return {value:{start:range.start,end:iso},proposal:{start:range.start,end:iso},committed:true,phase:'end'};
}
export function resetRange(){return {value:{start:null,end:null},proposal:{start:null,end:null},committed:true,phase:'reset'};}
export function createSelection({controlled=false,value=null}={}) { let internal=value; return Object.freeze({read(external=value){return controlled?external:internal;},propose(next,external=value){const previous=controlled?external:internal;if(!controlled)internal=next;return {previous,proposal:next,value:controlled?previous:next,committed:!controlled,ownership:controlled?'controlled':'uncontrolled'};}}); }

export function deriveDateRange(contracts) {
  const picker=contracts.find(x=>x.component==='date-picker'), range=contracts.find(x=>x.component==='date-range-picker');
  if(!picker||!range) throw new Error('canonical date contracts required');
  const value={schemaVersion:DATE_RANGE_VERSION,calendar:{dateSyntax:'YYYY-MM-DD',arithmetic:'proleptic-gregorian-utc-epoch-day',grid:{cells:42,rows:6,columns:7,weekStartsOn:'explicit-0-through-6'}},boundaries:{min:'inclusive',max:'inclusive',disabled:'exact-ISO-date',blockedEffect:'no-proposal-no-commit'},selection:{single:'replace',range:['start','end','restart-when-before-start','reset'],ownership:'controlled-proposes-uncontrolled-commits'},keyboard:{'date-picker':['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Enter','Space'],'date-range-picker':['Enter','Space']},unknowns:[...picker.unknowns,...range.unknowns,{field:'timezoneConversion',status:'unknown',reason:'Canonical contracts do not define conversion of ISO calendar dates through the timezone prop.'},{field:'vendorCalendarInternals',status:'unknown',reason:'react-day-picker/browser behavior beyond observed vectors remains vendor-owned.'}],provenance:[picker,range].map(c=>({component:c.component,contractPath:`contracts/kumo.observable/v1/components/${c.component}.json`,contractSchema:c.schemaVersion,canonical:c.canonical,vectorIds:c.vectors.map(v=>v.id),contractDigest:sha(c)}))};
  return {...value,capabilityDigest:sha(value)};
}
export function validateDateRange(value) {
  if(!value || value.schemaVersion!==DATE_RANGE_VERSION || !Array.isArray(value.provenance) || value.provenance.length!==2 || !Array.isArray(value.unknowns) || value.calendar?.grid?.cells!==42) throw new Error('invalid date range capability');
  for(const p of value.provenance) if(!p.component||!p.contractPath||p.contractSchema!=='kumo.observable/v1'||!p.canonical?.typesSha256||!p.canonical?.runtimeSha256||!p.vectorIds?.length||!p.contractDigest) throw new Error('date range provenance required');
  const {capabilityDigest,...unsigned}=value;if(capabilityDigest!==sha(unsigned))throw new Error('date range capability digest mismatch');return value;
}
export function loadDateRange(file=path.join(here,'capabilities/date-range.json')){return validateDateRange(JSON.parse(fs.readFileSync(file,'utf8')));}
