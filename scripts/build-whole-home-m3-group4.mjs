/** Issue75, independent reversible kitchen review; never a fabrication or cloud scene. */
import fs from 'node:fs';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';
import {createApartmentDomain} from '../studio/domain/apartment.mjs';
export const dir='design-development/whole-home-m3/group4';
export const baseline='e4bf637abd449cfa034710499a04fc56b6a18cf7';
export const sha=b=>createHash('sha256').update(b).digest('hex');
export const domain=createApartmentDomain(process.cwd());
export const source=JSON.parse(fs.readFileSync('render-snapshots/current.json'));
export const lead=JSON.parse(fs.readFileSync('design-development/kitchen-r6/L2.json'));
export const prepared=JSON.parse(fs.readFileSync('design-development/whole-home-m3/group4-preparation/SOURCE_BASELINE.json'));
export const F=id=>source.layout.furniture.find(f=>f.id===id);
export const profiles={A:{id:'A',title:'Ivory / closed storage / olive stone',ivory:'#E8E2D7',wood:'#AE9271',stone:'#D7D0C2',splash:'#A8AD9C',floor:'#C6C2B7',metal:'#A2A7A4',open_cubby:false,south_front:'SLIDING_FIXED_SHELVES'},B:{id:'B',title:'Ivory / one oak cubby / warm quartz',ivory:'#E8E2D7',wood:'#AE9271',stone:'#D7D0C2',splash:'#D9D2C5',floor:'#C6C2B7',metal:'#A2A7A4',open_cubby:true,south_front:'DRAWERS450'}};
export function candidate(key){
 const s=structuredClone(source);s.name='M3 Group4 '+key+' / local unapproved review';
 if(key!=='SOURCE'){
  for(const f of s.layout.furniture.filter(f=>f.room_id==='KIT-01')){const l=lead.layout.furniture.find(x=>x.id===f.id);f.color=l.color;if(l.material_id)f.material_id=l.material_id;}
  s.render_experiment=structuredClone(lead.render_experiment);s.kitchen_r6_study=structuredClone(lead.kitchen_r6_study);
 }
 s.group4_profile=profiles[key]||(key==='RECOMMENDED'?{...profiles.A,south_front:'DRAWERS450',title:'Recommended local selection: A finish/closed uppers plus B450 drawer hypothesis'}:null);
 s.group4_detail={version:2,oven:'600mm visual reservation aligned with unchanged hob; not fitted appliance',drawer_stroke_mm:450,open_state:'CLOSED',continuous_facing:'reversible nominal facing from source860 worktop to1480 upper; no build-up approval',approvals:{owner:false,construction:false,procurement:false,cloud:false}};
 if(key==='RECOMMENDED'){s.name='M3Group4 provisional recommendation / already tested local choices';s.group4_detail.version=3;s.group4_detail.recommendation_basis='Full-access cookware; terrace door operating HOLD persists. Slider insufficient flat280/300 access.';}
 const c=(p,h)=>[(p[0]-domain.model.width_mm/2)/1000,h/1000,(p[1]-domain.model.depth_mm/2)/1000];
 const work=structuredClone(lead.views.find(v=>v.id==='kitchen-work'));
 work.id='work';
 const sink=structuredClone(work);sink.id='sink';sink.camera.position=c([12050,8020],1620);sink.camera.target=c([10490,6850],1200);sink.camera.fov=67;
 const night=structuredClone(work);night.id='night';night.camera.viewer.night=true;night.camera.viewer.hour=20;
 const entry=structuredClone(lead.views.find(v=>v.id==='kitchen-relationship'));entry.id='entry';
 const access=structuredClone(work);access.id='access';access.camera.position=c([10060,7490],1680);access.camera.target=c([12180,8510],1250);access.camera.fov=70;
 s.views=[work,sink,night,entry,access];
 // Actual source leaf remains, closed for composition controls (not hidden/removed).
 for(const v of s.views){const leaf=v.camera.viewer.doors.find(d=>d.id==='OP-KIT-TERSVC');leaf.open=false;leaf.position=0;}
 s.scene_revision=domain.revision(s.layout);
 assert.deepEqual(s.layout.furniture.filter(f=>f.room_id!=='KIT-01'),source.layout.furniture.filter(f=>f.room_id!=='KIT-01'));
 assert.deepEqual(s.layout.interior,source.layout.interior);assert.deepEqual(s.layout.demolished,[]);
 for(const f of s.layout.furniture.filter(f=>f.room_id==='KIT-01'))for(const k of ['cx','cy','w','d','rot'])assert.equal(f[k],F(f.id)[k]);
 return s;
}
if(process.argv[1]?.endsWith('build-whole-home-m3-group4.mjs')){
 fs.mkdirSync(dir+'/plans',{recursive:true});fs.mkdirSync('work/group4',{recursive:true});fs.copyFileSync('dist/index.html','work/group4/built-viewer.html');
 const result={schema:'M3Group4Design/1',checkpoint:baseline,source_sha256:sha(fs.readFileSync('render-snapshots/current.json')),canonical_sha256:source.canonical_sha256,ceiling_mm:2500,provisional_lead:'A / closed upper storage, limited oak lower fronts, muted olive washable facing; R4/R5D1/R6L2 retained',inheritance:'All1241 inherited files including120 Group3 additions retained; no option accepted or executed',m1_intents:prepared.m1_intents,options:[]};
 for(const key of ['SOURCE','LEAD','A','B','RECOMMENDED']){const s=candidate(key);fs.writeFileSync(dir+'/'+key+'.json',JSON.stringify(s,null,2)+'\n');let v;try{v=domain.validate(s.layout)}catch(e){v=e.validation;if(!v)throw e;}const failures=v.checks.filter(x=>x.status==='FAIL');assert.equal(failures.length,0);result.options.push({id:key,scene:s.scene_revision,snapshot_sha256:sha(fs.readFileSync(dir+'/'+key+'.json')),geometry_failures:failures,validation_summary:v.summary});}
 fs.writeFileSync(dir+'/DESIGN.json',JSON.stringify(result,null,2)+'\n');console.log('Four scoped controls/proposals; kitchen geometry and other rooms preserved.');
}
