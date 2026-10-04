import {DatabaseSync} from 'node:sqlite';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import worker from './dist/server/index.js';

export const clone=v=>JSON.parse(JSON.stringify(v));
export class LocalD1 {
  constructor(){
    this.sql=new DatabaseSync(':memory:');
    for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())this.sql.exec(fs.readFileSync('drizzle/'+f,'utf8'));
    this.failHistory=false;
  }
  prepare(sql){
    if(sql.split(';').filter(x=>x.trim()).length!==1)throw new Error('One SQL statement per D1 prepare.');
    const owner=this,prepared=this.sql.prepare(sql);let bindings=[];
    return {sql,bind(...values){bindings=values;return this;},async first(){return prepared.get(...bindings)||null;},async all(){return {results:prepared.all(...bindings)};},run(){
      if(owner.failHistory&&sql.startsWith('INSERT OR IGNORE INTO apartment_design_history'))throw new Error('Injected local database failure');
      const r=prepared.run(...bindings);return {success:true,meta:{changes:Number(r.changes)}};
    }};
  }
  async batch(statements){this.sql.exec('BEGIN');try{const results=statements.map(s=>s.run());this.sql.exec('COMMIT');return results;}catch(e){this.sql.exec('ROLLBACK');throw e;}}
}
export const auth=owner=>({'oai-authenticated-user-id':owner,'oai-authenticated-user-email':owner+'@example.test'});
export async function api(env,owner,path='/api/design',method='GET',body,headers={}){
  const r=await worker.fetch(new Request('https://example.test'+path,{method,headers:{...(owner?auth(owner):{}),'Content-Type':'application/json',...headers},...(body?{body:JSON.stringify(body)}:{})}),env);
  return {status:r.status,data:await r.json()};
}
export async function rpc(env,owner,name,args={}){
  const r=await worker.fetch(new Request('https://example.test/mcp',{method:'POST',headers:{...auth(owner),'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/call',params:{name,arguments:args}})}),env);
  return (await r.json()).result;
}
export const saveInput=(saved,layout,request_id)=>({layout,request_id,expected_storage_revision:saved.initialized?saved.storage_revision:0,expected_scene_revision:saved.initialized?saved.scene_revision:null});
export const proposal=(saved,operations)=>({...saved.brief.proposal_template,author:'Local QA agent',operations});
export const applyArgs=(saved,p,request_id)=>({proposal:p,request_id,expected_storage_revision:saved.storage_revision});
export const key=layout=>{let h=2166136261;for(const c of JSON.stringify(layout)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return 'scene-'+(h>>>0).toString(16);};
export async function settle(predicate){for(let i=0;i<100;i++){if(predicate())return;await new Promise(r=>setTimeout(r,5));}throw new Error('Cloud operation did not settle.');}
export async function viewer(env,owner,local={},network={}){
  const require=createRequire(import.meta.url),{JSDOM}=require('jsdom');
  const html=fs.readFileSync('dist/index.html','utf8'),dom=new JSDOM(html,{url:'https://example.test/#2d',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window,c=dom.getInternalVMContext();
  w.structuredClone=globalThis.structuredClone;w.matchMedia=q=>({matches:false,media:q,addEventListener(){},removeEventListener(){}});
  w.ResizeObserver=class{constructor(cb){this.cb=cb;}observe(){this.cb();}disconnect(){}};
  w.URL.createObjectURL=()=>'';w.URL.revokeObjectURL=()=>{};w.confirm=()=>true;
  w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.show=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;};
  w.HTMLElement.prototype.setPointerCapture=function(){};w.HTMLElement.prototype.releasePointerCapture=function(){};
  for(const id of ['stage','plan','view3d']){const el=w.document.getElementById(id);Object.defineProperty(el,'clientWidth',{get:()=>900});Object.defineProperty(el,'clientHeight',{get:()=>700});el.getBoundingClientRect=()=>({left:0,top:0,right:900,bottom:700,width:900,height:700});}
  w.setInterval=()=>0;
  w.fetch=async(url,options={})=>{
    if(network.offline)throw new Error('Offline local network test');
    const response=await worker.fetch(new Request(new URL(url,'https://example.test'),{method:options.method||'GET',headers:{...auth(owner),...(options.headers||{})},...(options.body?{body:options.body}:{})}),env);
    if(network.dropAfterCommit&&options.method==='PUT'){network.dropAfterCommit=false;throw new Error('Response lost after commit');}
    return response;
  };
  for(const [k,v] of Object.entries(local))w.localStorage.setItem(k,v);
  vm.runInContext(fs.readFileSync('dist/apartment-model.js','utf8'),c);
  const classic=[...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)].find(m=>!m[1].trim())[2];
  vm.runInContext(classic,c);
  const evaluate=s=>vm.runInContext(s,c);
  await settle(()=>evaluate('cloud.ready&&!cloud.busy&&(!!cloud.conflict||!cloud.dirty)'));
  return {w,evaluate,dom,storage:()=>Object.fromEntries(Array.from({length:w.localStorage.length},(_,i)=>{const k=w.localStorage.key(i);return [k,w.localStorage.getItem(k)];}))};
}
