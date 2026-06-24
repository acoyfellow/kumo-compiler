#!/usr/bin/env node
// Persistent Chrome owner protocol prototype. One process owns Chrome/CDP; clients use JSON lines.
import { createInterface } from 'node:readline';
import { stdin, stdout } from 'node:process';
const session={id:`chrome-${process.pid}`,createdAt:new Date().toISOString(),pages:new Map()};
const reply=x=>stdout.write(`${JSON.stringify(x)}\n`);
createInterface({input:stdin}).on('line',line=>{ try { const m=JSON.parse(line); if(m.op==='hello') return reply({id:m.id,ok:true,protocol:'json-lines/v1',sessionId:session.id,capabilities:['page.acquire','page.release','session.status']}); if(m.op==='page.acquire'){const key=m.key??'default'; const page=session.pages.get(key)??{key,generation:0}; page.generation++; session.pages.set(key,page); return reply({id:m.id,ok:true,page});} if(m.op==='page.release'){session.pages.delete(m.key);return reply({id:m.id,ok:true});} if(m.op==='session.status')return reply({id:m.id,ok:true,sessionId:session.id,pages:[...session.pages.values()]}); reply({id:m.id,ok:false,error:'unknown op'}); } catch(e){reply({ok:false,error:e.message});} });
