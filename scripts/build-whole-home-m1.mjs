import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {ROOM_INPUT,FLOOR_INPUT,REMAPS,PARKED,REACH_REVIEW,LAYERS} from './whole-home-m1-input.mjs';

export const OUT='design-development/whole-home-m1';
export const SOURCE='render-snapshots/current.json';
export const M0='design-development/whole-home-m0/ROOM_MATRIX.json';
export const A15='design-development/advisor/cases/typeb-wholehome-firstfix.json';
export const hash=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const poly=p=>p.map(x=>x.join(',')).join(' ');
const ref=(p,pointer='')=>({path:p,pointer,sha256:hash(p)});
const repo='https://github.com/Mostafatalaat770/flat-designer';
const head='37e88444761919cb8323e51039ed9201328b8e48';
const evidenceURL=p=>`${repo}/blob/${head}/${p.split('/').map(encodeURIComponent).join('/')}`;
export function verifyPreservation(){
 const lock=read(`${OUT}/SOURCE_LOCK.json`);
 assert.equal(lock.starting_head,head);
 for(const [p,sha] of Object.entries(lock.files))assert.equal(hash(p),sha,`Preserved file changed: ${p}`);
 assert.equal(hash(lock.automation_exception.path),lock.automation_exception.after_sha256,'Only the documented M0 continuity-verifier edit is permitted');
 return Object.keys(lock.files).length;
}
const signoff=layer=>({E:'Qualified electrician; wet/outdoor engineer where relevant',L:'Lighting designer + qualified electrician; wet/outdoor engineer where relevant',H:'Qualified HVAC / plumbing engineer + developer for façade/routes',F:'Qualified wet/finishes engineer + installer; developer for slab/terraces'}[layer]);
const pointer=(v,p)=>p.split('/').slice(1).reduce((o,k)=>o[k.replace(/~1/g,'/').replace(/~0/g,'~')],v);

export function reconcile(){
 verifyPreservation();
 const m0=read(M0),snapshot=read(SOURCE),model=read('dist/apartment-model.json'),a15=read(A15);
 assert.equal(hash(SOURCE),m0.source.sha256);
 assert.equal(snapshot.scene_revision,'scene-9cf45a73');
 assert.equal(snapshot.storage_revision,55);assert.equal(snapshot.source_scene_revision,'scene-4821689');
 assert.deepEqual(snapshot.layout.demolished,[]);assert.equal(snapshot.architecture_variant,undefined);
 assert.equal(model.height_m,2.5);
 assert.deepEqual(Object.keys(ROOM_INPUT).sort(),model.rooms.map(r=>r.id).sort());
 const objects=new Map(m0.rooms.flatMap(r=>r.furniture).map(o=>[o.id,o]));
 for(const o of objects.values())assert.deepEqual(o.source_record,pointer(snapshot,o.source.pointer));
 const intents=[];
 const rooms=m0.rooms.map(r=>{
  const input=ROOM_INPUT[r.id],n={E:0,L:0,H:0,F:0};
  const zones=input.zones.map(z=>{
   const code=z.layer+(++n[z.layer]);
   for(const id of z.objects)assert.equal(objects.get(id)?.room_id,r.id,`Unsupported furniture context ${id}`);
   const evidence_source=[r.geometry.model_source,...z.objects.map(id=>objects.get(id).source),
    ...input.evidence.flatMap(id=>m0.evidence.find(e=>e.id===id).sources)];
   const intent={id:`${r.id}.${code}`,room_id:r.id,code,service:LAYERS[z.layer].english,layer:z.layer,label:z.label,
    original_ids:z.history,current_object_ids:z.objects,owner_use:z.use,furniture_reason:z.objects.length?
     `Source context ${z.objects.join(', ')}; ${z.use}`:`Room/opening use only; ${z.use}`,
    operational_tradeoff:z.tradeoff,confidence:'SOURCE_CONTEXT_VERIFIED; DESIGN_HYPOTHESIS; SITE_HOLD',
    survey_step:z.survey,trade_signoff:signoff(z.layer),evidence_source,
    measurement_status:'NOT_SURVEYED',TBD_AS_BUILT:true,placement_status:'RELATIVE_USE_ZONE_ONLY; NO_INSTALLATION_COORDINATES',construction_approved:false};
   intents.push(intent);return intent;
  });
  const f=FLOOR_INPUT[r.id];assert.equal(f[0],r.source_floor.value);
  const floor={id:`${r.id}.F1`,room_id:r.id,code:'F1',service:LAYERS.F.english,layer:'F',label:'حدود وخيارات أرضية',original_ids:[],current_object_ids:[],
   owner_use:f[3],furniture_reason:'Source room surface and canonical opening lines; no new slab or floor heights.',
   operational_tradeoff:f[4],confidence:'SOURCE_SURFACE_VERIFIED; TWO_DESIGN_INTENTS; SITE_HOLD',
   survey_step:'ارفع مناسيب جانبي كل فتحة، حركة الضلفة، drain/رطوبة/عتبة قائمة؛ عينة حقيقية وqualified waterproofing/door review قبل التفاصيل.',
   trade_signoff:signoff('F'),evidence_source:[r.source_floor.source,...r.openings.map(o=>o.source)],
   measurement_status:'NOT_SURVEYED',TBD_AS_BUILT:true,placement_status:'BOUNDARY_INTENT_ONLY; NO_BUILDUP_DIMENSIONS',construction_approved:false};
  intents.push(floor);zones.push(floor);
  return {id:r.id,name_ar:r.name_ar,decision:input.decision,polygon_mm:r.geometry.polygon_mm,bbox_mm:r.geometry.model_bbox_mm,
   source_floor:r.source_floor,floor_treatments:{A:f[1],B:f[2],boundary:f[3],tradeoff:f[4]},furniture:r.furniture,openings:r.openings,
   zones,evidence_ids:input.evidence,ceiling_target_mm:r.id.startsWith('TER-')?null:2500,
   ceiling_status:r.id.startsWith('TER-')?'OUTDOOR; NO_MODELED_CEILING; COVER_TBD_AS_BUILT':'MODEL_FINISHED_TARGET_NOT_MEASURED',site_status:'TBD_AS_BUILT'};
 });
 const dispositions=a15.equipment_points.map((p,i)=>{
  const initial=m0.a15_reanchor.find(x=>x.id===p.id);assert.ok(initial);
  const associated=intents.filter(z=>z.original_ids.includes(p.id));
  let current_ids=[],disposition;
  if(PARKED[p.id]){disposition='PARK_ALTERNATIVE';assert.equal(associated.length,0);}
  else if(p.anchor){disposition='REANCHOR_WITH_EVIDENCE';current_ids=REMAPS[p.id]??[p.anchor.id];}
  else disposition='KEEP_ROOM_LEVEL';
  for(const id of current_ids)assert.equal(objects.get(id)?.room_id,p.room_id);
  if(!PARKED[p.id])assert.equal(associated.length,1,`Exactly one coordinated zone required: ${p.id}`);
  const related=p.id==='svc-washer'?['KIT-01.E4','KIT-01.H2']:p.id==='kit-oven'?['KIT-01.E3']:[];
  return {original_id:p.id,original_scope:a15.reference_scene_revision,original_room_id:p.room_id,original_anchor:p.anchor,
   original_kind:p.kind,original_intent:p.intent,current_room_id:p.room_id,current_object_ids:current_ids,
   disposition,source_classification:initial.current_anchor_state,active_intent_ids:associated.map(z=>z.id),
   separately_proposed_intent_ids:related,owner_use:PARKED[p.id]??associated[0].owner_use,
   service_side:PARKED[p.id]?'NONE_ACTIVE':associated[0].owner_use,
   reach_and_occlusion_review:REACH_REVIEW[p.id]??(PARKED[p.id]?'No active placement.':associated[0].survey_step),
   operational_tradeoff:PARKED[p.id]??associated[0].operational_tradeoff,
   source_model_screen:{proof:'INHERITED_MODEL_TEST; NOT_HUMAN_REACH_APPROVAL',
    source:ref(M0,`/rooms/${m0.rooms.findIndex(r=>r.id===p.room_id)}/model_checks`),
    checks:m0.rooms.find(r=>r.id===p.room_id).model_checks.checks.filter(c=>
     c.kind==='circulation'||current_ids.includes(c.object_id)||c.object_ids?.some(id=>current_ids.includes(id))),
    limitation:'Nearest furniture gap is not a route; 125mm grid and 2-degree inferred hinge samples are conservative model checks. Cabinet doors/drawers, standing human and reach are not surveyed.'},
   reach_confirmation:'NOT_PHYSICALLY_CONFIRMED; TARGETED_OCCLUSION_REVIEW_AND_SITE_TEST_REQUIRED',
   evidence_source:[ref(A15,`/equipment_points/${i}`),ref(M0,`/a15_reanchor/${m0.a15_reanchor.indexOf(initial)}`),...current_ids.map(id=>objects.get(id).source),...associated.flatMap(z=>z.evidence_source)],
   measurement_status:'NOT_SURVEYED; SOURCE_CONTEXT_ONLY',TBD_AS_BUILT:true,construction_approved:false};
 });
 assert.equal(dispositions.length,65);assert.equal(new Set(dispositions.map(x=>x.original_id)).size,65);
 return {schema:'TypeBWholeHomeM1/1',issue:70,starting_head:head,source:m0.source,
  source_inventory:ref(M0),historical_input:ref(A15),approvals:structuredClone(m0.approvals),
  summary:{historical_intents:65,room_level:38,same_envelope_unverified:14,changed_envelope:5,absent_old_anchors:8,
   disposition_counts:Object.fromEntries(['REANCHOR_WITH_EVIDENCE','KEEP_ROOM_LEVEL','PARK_ALTERNATIVE','RETIRE_DUPLICATE'].map(k=>[k,dispositions.filter(p=>p.disposition===k).length])),
   spaces:13,current_objects:77,coordinated_zones:intents.length,source_model_warnings:75},
  drawing_policy:'Exact source polygons/openings/furniture; dashed highlights and badges refer to functional context, not equipment mounting points. Graphic label positions are illustration only. No geographic north known. P0 canonical architecture only.',
  ceiling_policy:'2500mm source finished target, not measured. No whole-home dropped ceiling. Selective surface/wall/portable lighting; any local service enclosure requires measured headroom/access review.',
  flooring_options:{A:'A • Warm continuity: timber-look public/private appearance; distinct kitchen/wet/outdoor surfaces.',B:'B • Durable public spine: stone-look RECP/HALL/KIT; timber-look bedrooms/WIC; distinct wet/outdoor surfaces.',approval:'DESIGN_INTENT_ONLY; no product, slip class, level, screed or waterproofing approval'},
  control_policy:'Groups describe owner functions, not electrical circuits. Local manual on/off always; entry/bedside and hall-end shared control function, dimming/automation only if chosen and compatible. Sensor failure must not disable basic light.',
  rooms,dispositions,intents,evidence:m0.evidence,handoff:{next_issue:71,room_review:72,professional_release:19},
  intersections:[
   {id:'X1',rooms:['RECP-01','KIT-01'],note:'P0 باب المطبخ ↔ ست كراسي/معلّق السفرة ↔ عتبة/تنظيف. P1-F1 خيار مستقل HOLD؛ لا ترسمه كفتحة حالية.'},
   {id:'X2',rooms:['RECP-01'],note:'دولاب الجزمة/مستخدم/ضلفة باب المدخل + كرسي مسحوب: تحذير تشغيل مصدر. اختبر مفتاح الوصول ومرور شخص معًا.'},
   {id:'X3',rooms:['MBR-01','WIC-01','BATH-M01'],note:'طريق ليل + ضلفة dressing/shower splash + driver وخشب الأرضية؛ يحتفظ بشاور M0 800 الحالي.'},
   {id:'X4',rooms:['HALL-01','BR-02','BATH-C01'],note:'تحكم طرفي الطرقة + أبواب نوم/حمام + ceiling/access. صفر grid BR02 ليس عرض ممر مقاس؛ راجع مستخدمًا وكرسيًا.'},
   {id:'X5',rooms:['KIT-01','TER-SVC'],note:'DW/نيش غسالة داخلية + محابس وفصل + door/drain التراس. غسالة التراس القديمة parked، لا ازدواج أجهزة.'},
   {id:'X6',rooms:['RECP-01','TER-MAIN','MBR-01','TER-MBR'],note:'ستارة وزجاج كامل الارتفاع + إنارة وHVAC + weather threshold؛ لا bulkhead أو condenser location معتمد.'}
  ]};
}

export const csv=(rows,columns)=>'\uFEFF'+columns.join(',')+'\n'+rows.map(r=>columns.map(k=>'"'+String(typeof r[k]==='object'?JSON.stringify(r[k]):r[k]??'').replaceAll('"','""')+'"').join(',')).join('\n')+'\n';
const dispositionColumns=['original_id','original_scope','original_room_id','original_anchor','source_classification','current_room_id','current_object_ids','disposition','active_intent_ids','separately_proposed_intent_ids','owner_use','service_side','reach_and_occlusion_review','source_model_screen','reach_confirmation','operational_tradeoff','evidence_source','measurement_status','TBD_AS_BUILT'];
const issueColumns=['id','room_id','layer','label','original_ids','current_object_ids','service','owner_use','furniture_reason','operational_tradeoff','confidence','survey_step','trade_signoff','evidence_source','measurement_status','TBD_AS_BUILT'];
export function writeReconciliation(data){
 fs.mkdirSync(OUT,{recursive:true});
 fs.writeFileSync(`${OUT}/A15_DISPOSITION.json`,JSON.stringify({schema:'A15M1Disposition/1',source:data.historical_input,summary:data.summary,dispositions:data.dispositions},null,2)+'\n');
 fs.writeFileSync(`${OUT}/A15_DISPOSITION.csv`,csv(data.dispositions,dispositionColumns));
}

function defs(prefix){return `<defs><pattern id="${prefix}-keep" width="160" height="160" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><path d="M0 0V160" stroke="#bb625c" stroke-width="24" opacity=".55"/></pattern><pattern id="${prefix}-timber" width="500" height="240" patternUnits="userSpaceOnUse"><path d="M0 0H500V240H0Z" fill="#efe4cc" stroke="#d8c7a8" stroke-width="9"/></pattern><pattern id="${prefix}-stone" width="600" height="600" patternUnits="userSpaceOnUse"><path d="M0 0H600V600H0Z" fill="#e3e2dc" stroke="#c2c2bc" stroke-width="9"/></pattern><pattern id="${prefix}-wet" width="300" height="300" patternUnits="userSpaceOnUse"><path d="M0 0H300V300H0Z" fill="#d8e8e8" stroke="#accbcb" stroke-width="10"/></pattern><pattern id="${prefix}-out" width="200" height="200" patternUnits="userSpaceOnUse"><path d="M0 0L200 200M-100 100L100 300" fill="none" stroke="#b6c8b0" stroke-width="24"/></pattern></defs>`;}
const center=o=>o.placement.centre_mm??o.placement.resolved_model_centre_mm;
const roomLabel={
 'RECP-01':[14070,5800],'KIT-01':[10800,8130],'MBR-01':[2500,5800],'BR-01':[3800,3520],'BR-02':[6920,3700],
 'HALL-01':[6450,5560],'WIC-01':[4730,7680],'BATH-M01':[6230,7860],'BATH-C01':[7890,8250],
 'WC-01':[11620,9800],'TER-SVC':[9700,9780],'TER-MBR':[960,4410],'TER-MAIN':[14300,540]
};
const floorFamily=(room,option)=>room.id.startsWith('TER-')?'out':/^(BATH|WC)/.test(room.id)?'wet':room.id==='KIT-01'||option==='B'&&['RECP-01','HALL-01'].includes(room.id)?'stone':'timber';
export function drawing(data,layer,{roomId=null,option='A',prefix='m1'}={}){
 const model=read('dist/apartment-model.json');
 const rooms=roomId?data.rooms.filter(r=>r.id===roomId):data.rooms;
 let body=defs(prefix);
 for(const r of rooms){
  body+=`<g data-room="${r.id}"><polygon points="${poly(r.polygon_mm)}" fill="${layer==='F'?`url(#${prefix}-${floorFamily(r,option)})`:'#fcfbf8'}" stroke="#afb7b4" stroke-width="22"/>`;
  if(layer==='L')body+=`<polygon points="${poly(r.polygon_mm)}" fill="#e7bd55" opacity=".12"/>`;
  for(const o of r.furniture){
   const rug=o.kind==='rug',wall=o.placement.mode==='wall';
   body+=`<polygon data-source-object="${esc(o.id)}" points="${poly(o.plan_envelope)}" fill="${rug?'#eeece5':wall?'#d6dad6':'#e1e1da'}" stroke="#8d9690" stroke-width="${rug?9:17}" ${wall?'stroke-dasharray="40 20"':''} opacity="${layer==='F'?(rug?.2:.65):1}"><title>${esc(o.id)} — SOURCE context</title></polygon>`;
  }
  if(layer==='H')for(const o of r.furniture.filter(o=>['bed','sofa'].includes(o.kind)))body+=`<polygon data-air-avoid="${o.id}" points="${poly(o.plan_envelope)}" fill="url(#${prefix}-keep)" stroke="#b56460" stroke-width="28"><title>تجنب النفخ المباشر؛ source bed/sofa، وليس zone بحجم قانوني</title></polygon>`;
  if(layer==='F')for(const o of r.furniture.filter(o=>o.kind==='shower'))body+=`<polygon data-wet-boundary="${o.id}" points="${poly(o.plan_envelope)}" fill="none" stroke="#75528e" stroke-width="40" stroke-dasharray="65 35"><title>Source shower footprint; wet-floor edge concept; drain/slope/levels TBD_AS_BUILT</title></polygon>`;
  for(const z of r.zones.filter(z=>z.layer===layer&&layer!=='F')){
   const ids=z.current_object_ids,targets=ids.map(id=>r.furniture.find(o=>o.id===id));
   if(ids.length){
    for(const o of targets)body+=`<polygon data-intent="${z.id}" points="${poly(o.plan_envelope)}" fill="${LAYERS[layer].color}" fill-opacity=".07" stroke="${LAYERS[layer].color}" stroke-width="${layer==='L'?45:32}" stroke-dasharray="75 40"><title>${esc(z.label)} — functional context only; TBD_AS_BUILT</title></polygon>`;
    const p=center(targets[0]);body+=badge(z,p[0],p[1],layer);
   }else{
    // Broad room-level review label; no implied wall-device coordinate.
    const p=roomLabel[r.id],offset=r.zones.filter(a=>a.layer===layer&&!a.current_object_ids.length).indexOf(z);
    body+=badge(z,p[0]-300+offset*400,p[1]+340,layer);
   }
  }
  if(layer==='H'&&['MBR-01','BR-01','BR-02','RECP-01'].includes(r.id)){
   const [x0,y0,x1,y1]=r.bbox_mm;
   const east=['MBR-01','BR-01','RECP-01'].includes(r.id);
   const pts=east?[[x1-190,y0+400],[x1-190,y1-400]]:[[x0+400,y1-190],[x1-400,y1-190]];
   body+=`<path data-wall-review="${r.id}" d="M${pts[0].join(' ')}L${pts[1].join(' ')}" stroke="#00766d" opacity=".45" stroke-width="120" stroke-dasharray="180 110"><title>حائط مرشح للمراجعة فقط؛ قد تعوقه نجارة/فتحة. لا رأس أو pipe route مثبت</title></path>`;
  }
  const label=roomLabel[r.id];
  body+=`<text x="${label[0]}" y="${label[1]}" text-anchor="middle" font-family="Arial" font-size="${r.id==='HALL-01'?160:190}" fill="#263e40" font-weight="bold">${r.id}</text>`;
  if(layer==='F')body+=`<text x="${label[0]}" y="${label[1]+210}" text-anchor="middle" font-family="Arial" font-size="150" fill="#4c6262">source: ${r.source_floor.value} • ${option}</text>`;
  body+='</g>';
 }
 for(const w of model.wall_segments.filter(w=>!roomId||w.rooms.includes(roomId)))body+=`<path d="M${w.from.join(' ')}L${w.to.join(' ')}" stroke="#586860" stroke-width="${w.kind==='low'?35:75}" fill="none"/>`;
 for(const o of model.openings.filter(o=>!roomId||o.between.includes(roomId))){
  const [x,y,x1,y1]=o.rect;
  const glazing=o.type.includes('glaz')||o.type==='exterior_window';
  const threshold=layer==='F'&&o.type!=='exterior_window';
  body+=`<path data-opening="${o.id}" ${threshold?`data-threshold="${o.id}"`:''} d="M${o.from.join(' ')}L${o.to.join(' ')}" stroke="${threshold?'#75528e':glazing?'#70a9be':'#d8a789'}" stroke-width="${threshold?70:40}" ${threshold?'stroke-dasharray="70 40"':''}><title>${esc(o.id)} — original opening; ${threshold?'threshold level TBD_AS_BUILT':'clear/operable width unverified'}</title></path>`;
  if(layer==='E'&&!glazing)body+=`<rect data-control-review="${o.id}" x="${x-140}" y="${y-140}" width="${x1-x+280}" height="${y1-y+280}" fill="none" stroke="#235cab" stroke-width="25" stroke-dasharray="50 45"><title>Door approach / control reach review; not a selected switch location</title></rect>`;
  if(layer==='L'&&!glazing)body+=`<rect x="${x-110}" y="${y-110}" width="${x1-x+220}" height="${y1-y+220}" fill="#cf9d2b" opacity=".16"><title>Circulation/night/control connection only, not a ceiling fixture</title></rect>`;
 }
 for(const d of model.doors.filter(d=>!roomId||rooms[0].openings.some(o=>o.id===d.id))){
  const a=[d.h[0]+d.c[0]*d.len,d.h[1]+d.c[1]*d.len],b=[d.h[0]+d.o[0]*d.len,d.h[1]+d.o[1]*d.len];
  const cross=d.c[0]*d.o[1]-d.c[1]*d.o[0];
  body+=`<path data-door-sweep="${d.id}" d="M${a.join(' ')} A${d.len} ${d.len} 0 0 ${cross>0?1:0} ${b.join(' ')} L${d.h.join(' ')}" fill="none" stroke="#a78b7f" stroke-width="20" stroke-dasharray="35 25"><title>Source inferred hinge arc; installed handedness/leaf unknown</title></path>`;
 }
 return body;
}
function badge(z,x,y,layer){return `<g data-zone="${z.id}"><circle cx="${x}" cy="${y}" r="142" fill="#fffdf6" stroke="${LAYERS[layer].color}" stroke-width="30" stroke-dasharray="40 22"/><text x="${x}" y="${y+48}" text-anchor="middle" font-family="Arial" font-size="140" font-weight="bold" fill="${LAYERS[layer].color}">${z.code}</text><title>${esc(z.label)} — ${esc(z.owner_use)} — TBD_AS_BUILT</title></g>`;}
function svgFrame(body,viewBox,title){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img" aria-label="${esc(title)}" style="font-family:Arial,sans-serif">${body}</svg>`;}
function wrapText(text,max=40){const out=[];let line='';for(const word of text.split(' ')){if((line+' '+word).length>max){out.push(line);line=word;}else line+=(line?' ':'')+word;}if(line)out.push(line);return out;}
function lines(text,x,y,max=40,size=16,limit=6){return wrapText(text,max).slice(0,limit).map((t,i)=>`<text x="${x}" y="${y+i*(size+9)}" text-anchor="start" direction="rtl" font-family="Arial" font-size="${size}" fill="#304d50">${esc(t)}</text>`).join('');}
export function standalonePlan(data,layer){
 let body=`<rect width="1200" height="1900" fill="#f6f3eb"/><text x="1155" y="48" text-anchor="start" direction="rtl" font-size="29" fill="${LAYERS[layer].color}" font-weight="bold">${esc(LAYERS[layer].title)} • Type B / M1</text><text x="45" y="78" font-size="15" fill="#415f62">scene-9cf45a73 • P0 original • 13 spaces • SOURCE CONTEXT + CONCEPT / TBD_AS_BUILT</text>`;
 if(layer==='F'){
  body+=`<text x="45" y="112" font-size="18">A • Warm continuity</text><text x="630" y="112" font-size="18">B • Durable public spine</text>`;
  body+=`<g transform="translate(38 135) scale(.034)">${drawing(data,layer,{option:'A',prefix:'floorA'})}</g><g transform="translate(630 135) scale(.034)">${drawing(data,layer,{option:'B',prefix:'floorB'})}</g>`;
 }else body+=`<g transform="translate(155 115) scale(.055)">${drawing(data,layer,{prefix:'sheet'+layer})}</g>`;
 const legend=layer==='E'?'الأزرق المتقطع = أثاث مرجعي وحاجة استخدام؛ إطار الباب = اختبار وصول، مش موقع مفتاح.':layer==='L'?'ذهبي عام/مهمة؛ اتصال الفتحات = طريق ليل. السقف 2500 مصدر؛ لا توزيع fixtures أو سقف ساقط شامل.':layer==='H'?'تهشير أحمر = تجنب نفخ على سرير/كنبة؛ أخضر متقطع = سياق خدمة/حائط مرشح، بلا وحدات أو مواسير مثبتة.':'اللون/النقشة تصور بديل؛ source code الحالي مكتوب. البنفسجي على الفتحة = فاصل/عتبة، لا منسوب أو waterproofing.';
 body+=lines(legend,1155,layer==='F'?530:710,100,17,2);
 body+=lines('الرمادي = الأثاث الحالي؛ الأقواس = اتجاه باب مستنتج من المصدر، مش رفع موقع. الترقيم يحيل لجدول الغرفة في HTML؛ كل التركيبات HOLD #19.',1155,layer==='F'?590:770,100,16,2);
 const top=layer==='F'?675:850,cardH=190;
 data.rooms.forEach((r,i)=>{
  const x=35+(i%3)*390,y=top+Math.floor(i/3)*cardH;
  body+=`<rect x="${x}" y="${y}" width="370" height="170" rx="8" fill="#fffdf8" stroke="#cfd8d2"/>`;
  body+=lines(`${r.id} • ${r.name_ar}`,x+350,y+27,32,17,2);
  const text=layer==='F'?`Source ${r.source_floor.value}؛ A: ${r.floor_treatments.A}؛ B: ${r.floor_treatments.B}. ${r.floor_treatments.boundary}`:r.zones.filter(z=>z.layer===layer).map(z=>`${z.code}: ${z.label}`).join(' • ')+'. '+(layer==='H'?'الخارج والصرف والوصول للصيانة TBD_AS_BUILT.':layer==='L'?'عام/مهمة/ليل بتحكم يدوي؛ تفاصيل wet/سقف HOLD.':'الوصول/الضلفة/حماية wet-outdoor TBD_AS_BUILT.');
  body+=lines(text,x+350,y+78,38,15,4);
 });
 const height=top+5*cardH+50;
 return svgFrame(body,`0 0 1200 ${height}`,`${LAYERS[layer].title}; all 13 source spaces; conceptual only`);
}

export function ownerHTML(data){
 const embedded={};
 for(const layer of Object.keys(LAYERS)){
  embedded[layer]={};
  for(const option of layer==='F'?['A','B']:['A']){
   embedded[layer][option]={ALL:svgFrame(drawing(data,layer,{prefix:`all${layer}${option}`,option}),'-200 -200 16450 10700',LAYERS[layer].title)};
   for(const r of data.rooms){const [x,y,x1,y1]=r.bbox_mm;
    embedded[layer][option][r.id]=svgFrame(drawing(data,layer,{roomId:r.id,option,prefix:`${layer}${option}${r.id}`}),`${x-180} ${y-180} ${x1-x+360} ${y1-y+360}`,`${r.name_ar} • ${LAYERS[layer].title}`);
   }
  }
 }
 const tables=data.dispositions.map(p=>`<tr data-original="${p.original_id}"><td dir="ltr">${p.original_id}<br><small>${p.original_scope}</small></td><td>${esc(p.disposition)}<br>${esc(p.current_room_id)}<br><small dir="ltr">${esc(p.current_object_ids.join(', ')||'ROOM / NONE ACTIVE')}</small></td><td>${esc(p.owner_use)}<br><small>${esc(p.reach_and_occlusion_review)}</small></td><td dir="ltr">${esc([...p.active_intent_ids,...p.separately_proposed_intent_ids.map(id=>id+' (NEW)')].join(', ')||'PARKED')}</td></tr>`).join('');
 const roomCards=data.rooms.map(r=>`<article id="room-${r.id}" data-room-schedule="${r.id}"><h2>${r.name_ar} <small dir="ltr">${r.id}</small></h2><p>${esc(r.decision)}</p><p class="hold">TBD_AS_BUILT • ${r.ceiling_target_mm===null?'OUTDOOR COVER UNKNOWN; NO MODELED CEILING':'source ceiling target 2500mm'} • owner / construction / cloud approvals HOLD</p>${r.zones.map(z=>`<details data-service="${z.id}" open><summary><b dir="ltr">${z.code}</b> ${esc(z.label)} <span class="chip">${LAYERS[z.layer].title}</span></summary><p><b>الاستخدام والمكان النسبي:</b> ${esc(z.owner_use)}</p><p><b>التوازن التشغيلي:</b> ${esc(z.operational_tradeoff)}</p><p><b>رفع الموقع:</b> ${esc(z.survey_step)}</p><small dir="ltr">${esc(z.current_object_ids.join(' / ')||'ROOM / OPENING CONTEXT')} • ${esc(z.trade_signoff)} • SITE-HOLD</small></details>`).join('')}<div class="choice"><b>الأرضية المصدر:</b> ${r.source_floor.value}<p>A: ${esc(r.floor_treatments.A)}<br>B: ${esc(r.floor_treatments.B)}</p><p>${esc(r.floor_treatments.tradeoff)}</p></div></article>`).join('');
 const safeJSON=JSON.stringify({embedded,rooms:data.rooms.map(r=>({id:r.id,name:r.name_ar,zones:r.zones,floor:r.floor_treatments})),layers:LAYERS}).replaceAll('<','\\u003c');
 return `<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Type B M1 — مراجعة الخدمات والأرضيات</title><style>
 *{box-sizing:border-box}body{margin:0;background:#f3f0e8;color:#243f42;font:17px/1.75 Arial,sans-serif}main{max-width:1200px;margin:auto;padding:28px 20px}h1{font-size:34px;line-height:1.35}h2{font-size:25px}section,article{background:#fffdf9;border:1px solid #d7d9d0;border-radius:12px;padding:24px;margin:22px 0}.hold{background:#f7e9d8;border-right:5px solid #c88a4b;padding:13px}.meta,small{font-size:13px;color:#53696b;overflow-wrap:anywhere}a{color:#205e99;overflow-wrap:anywhere}.chip{display:inline-block;background:#e6eeeb;border-radius:5px;padding:2px 7px;font-size:12px}button,select{font:inherit;max-width:100%;border:1px solid #adbeba;border-radius:7px;background:#f6f7f0;color:#294f52;padding:9px 12px;cursor:pointer}button[aria-pressed=true]{background:#2a5156;color:white}.tabs,nav,.tools{display:flex;gap:9px;flex-wrap:wrap;align-items:center}nav a{font-size:14px}.plan{direction:ltr;background:#fcfbf7;border:1px solid #d1d8cf;margin-top:18px}.plan svg{width:100%;height:auto;display:block}.legend{padding:12px;background:#eef2eb}.zone{border-right:4px solid #5e8688;padding:12px;background:#f5f5ee;margin:12px 0}.scroll{overflow:auto}table{border-collapse:collapse;width:100%;min-width:850px;font-size:14px}th,td{border-bottom:1px solid #ddd;padding:10px;text-align:start;vertical-align:top}td{overflow-wrap:anywhere}details{padding:12px 0;border-top:1px solid #d9ded5}summary{cursor:pointer}summary b{background:#eef0e7;padding:4px 8px}.choice{background:#efece3;padding:14px}code{direction:ltr;unicode-bidi:embed;overflow-wrap:anywhere;font-size:13px}li{margin:10px 0}section[id],article[id]{scroll-margin-top:12px}@media(max-width:600px){main{padding:12px}section,article{padding:16px}h1{font-size:27px}.tabs button{flex:1 1 44%;font-size:15px}button,select{font-size:15px}h2{font-size:22px}.meta{font-size:12px}}@media print{button,select,.tools{display:none}details{break-inside:avoid}section,article{border-radius:0}.plan{break-inside:avoid}}
 </style><main><h1>Type B • نراجع أول fixing<br>قبل ما نحدد أي تركيب</h1><p>أربع مخططات مستقلة من M0 الحالي، مع وظائف الأثاث والتشغيل ومجهولات الموقع. الرموز مناطق احتياج، وليست إحداثيات مأخذ أو إنارة أو وحدة تكييف.</p><p class="meta" dir="ltr">HEAD input 37e8844 • scene-9cf45a73 • cloud origin scene-4821689 / storage55<br>Source SHA256 ${data.source.sha256}<br>Canonical SHA256 ${data.source.canonical_sha256}</p><p class="hold">كل ما يخص موقع/حماية/ارتفاع/صرف/حمل فعلي هو <b>TBD_AS_BUILT</b>. الحالي P0 المقفول، الزجاج والسقف 2500 محفوظين؛ بوابة التنفيذ <b>#19</b>. مفيش موافقة بناء أو شراء أو تغيير سحابة.</p>
 <nav><a href="#disposition">65 قرار A15 أولًا</a><a href="#plans">الأربع مخططات</a><a href="#rooms">جدول الـ13 مساحة</a><a href="#intersections">تقاطعات ومسح</a><a href="#evidence">الأدلة والتسليم</a></nav>
 <section id="disposition"><h2>65/65 احتياج تاريخي: القرار قبل الرسم</h2><p>38 room-level محفوظة وظيفيًا، 14 غلافًا مطابقًا يحتاج اختبار وصول، 5 أغلفة متغيرة اتراجعت تشغيليًا، 8 غائبة اتفصلوا: 5 احتياجات مطبخ أعيد ربطها بالدليل و3 بدائل parked. الناتج <b>24 reanchor + 38 room-level + 3 parked</b>؛ مفيش إسقاط صامت.</p><p>الجزيرة القديمة مالهاش intent نشط. عمود الفرن قديم parked؛ الاحتياطي الجديد للمطبخ بلا مكان فرن. غسالة التراس parked؛ الغسالة الداخلية حاجة جديدة عند النيش المصدر، مش جهاز متثبت.</p><details><summary>افتح جدول جميع القرارات الأصلية وروابط الاحتياجات الحالية</summary><div class="scroll"><table><thead><tr><th>original_id / scope</th><th>القرار / current IDs</th><th>استخدام ومراجعة وصول</th><th>coordinated intent</th></tr></thead><tbody>${tables}</tbody></table></div></details><p class="meta">A15_DISPOSITION.csv/JSON في الحزمة يسجلوا المصدر + JSON pointer + SHA ومراجعة التشغيل لكل صف. الغلاف المطابق مش إثبات وصول إنسان.</p></section>
 <section id="plans"><h2>أربع طبقات — اختار مساحة علشان التفاصيل تبان</h2><div class="tabs">${Object.entries(LAYERS).map(([k,v])=>`<button data-layer="${k}" aria-pressed="${k==='E'}">${v.title}</button>`).join('')}</div><div class="tools"><label>المساحة <select id="room-select"><option value="ALL">الشقة كلها • للمقارنة</option>${data.rooms.map(r=>`<option value="${r.id}">${r.name_ar} • ${r.id}</option>`).join('')}</select></label><label id="floor-choice" hidden>تصور الأرضية <select id="floor-select"><option value="A">A • استمرارية دافئة</option><option value="B">B • حيز عام حجري</option></select></label><button id="download-plan">احفظ مخطط الطبقة كامل SVG</button></div><p id="plan-title"></p><div id="plan-host" class="plan"></div><div class="legend" id="legend"></div><div id="zone-summary"></div><p class="meta">كل الأثاث الرمادي source موجود؛ الهايلايت المتقطع سياق حاجة تشغيلية. الأقواس اتجاه باب مستنتج، مش رفع موقع. شمال جغرافي غير معروف. المخطط بالموقع الحالي، لا P1 أو K12.</p></section>
 <section id="rooms"><h2>الـ13 مساحة: الوظيفة، التوازن، وطلب المسح</h2><nav>${data.rooms.map(r=>`<a href="#room-${r.id}">${r.name_ar}</a>`).join('')}</nav><p>الجداول المنسقة ${data.intents.length} منطقة وظيفية، منها احتياجات جديدة مرتبطة بالمصدر؛ في FIRST_FIX_ISSUES.csv/JSON. مجموعات الإضاءة تصف وظائف المالك، مش دوائر كهربائي.</p></section>${roomCards}
 <section id="intersections"><h2>تقاطعات لازم تتحل في الموقع</h2><ol>${data.intersections.map(x=>`<li><b>${x.id} • ${x.rooms.join(' / ')}</b><br>${x.note}</li>`).join('')}</ol><p>اطلب صور الحائط كاملًا والخدمات الموجودة، السقف والكمر، كل باب مفتوح/مقفول مع مستخدم وأثاث عامل، جانبي العتبة والمصرف، shaft وخروج العادم ومواقع المكثف المسموح بها. لازم المهندس الكهربائي وHVAC والسباك/مهندس wet يوقعوا الجزء الخاص بكل trade قبل #19.</p></section>
 <section id="evidence"><h2>الأدلة والاختيار التالي</h2><p>المخططات جديدة مصدرية؛ لا حاجة لصور WebGL جديدة لحسم نيات الخدمة. أدلة R4/R5/R6 والريسبشن والحمّامات محفوظة وبنفس البصمات؛ R6 L2 اتجاه بصري فقط. دراسات الأجهزة القديمة مرجع مؤجل.</p><ul>${data.evidence.filter(e=>['reception','entry','r4','r5','r6','master-bath','family-bath','guest-wc','a15'].includes(e.id)).map(e=>`<li><b>${e.id}</b> — ${esc(e.source_scope)}<br>${e.sources.map(s=>`<a href="${evidenceURL(s.path)}">${esc(s.path)}</a>`).join('<br>')}</li>`).join('')}</ul><p><b>NEXT #71:</b> ثلاث لغات تصميم ومودبوردات من نفس M0، تستخدم مجموعات الضوء وخياري الأرضية كقيود تنسيق. مراجعة الغرف #72؛ #19 للمسح والتوقيع التنفيذي.</p><p class="meta">الملف يعمل بدون إنترنت؛ الروابط للأدلة اختيارية فقط. README / VALIDATION / BROWSER_VALIDATION داخل ZIP يوضحوا نتائج الاختبار المحلي. GitHub CI حالة مستقلة، وليست شهادة تنفيذ.</p></section></main>
 <script id="embedded-data" type="application/json">${safeJSON}</script><script>
 const d=JSON.parse(document.getElementById('embedded-data').textContent);let layer='E';const room=document.getElementById('room-select'),floor=document.getElementById('floor-select');
 const notes={E:'أزرق متقطع = سياق أثاث/حاجة استخدام. الإطار حول الفتحة = اختبار وصول مفتاح؛ لا موضع جهاز. wet/outdoor كلها HOLD.',L:'عام ذهبي diffuse + مهمة على الأثاث + طريق ليل عند الفتحات. لا fixture layout أو lux؛ 2500 هدف مصدر وmanual fallback لكل مجموعة.',H:'الأحمر المهشر على الأسرة/الكنبة = تجنب نفخ مباشر. أخضر = سياق خدمة وحائط مرشح للمراجعة، لا وحدات أو pipe routes. الخارج والshaft والdrain TBD.',F:'source code الحالي ظاهر؛ A وB خيارات مظهر فقط. البنفسجي على الفتحات = حدود/عتبات. wet/outdoor منفصلين؛ لا height أو slip rating أو waterproofing معتمد.'};
 function update(){const opt=layer==='F'?floor.value:'A';document.getElementById('plan-host').innerHTML=d.embedded[layer][opt][room.value];document.getElementById('floor-choice').hidden=layer!=='F';document.getElementById('plan-title').textContent=d.layers[layer].title+' • '+(room.value==='ALL'?'الـ13 مساحة':d.rooms.find(r=>r.id===room.value).name)+' • TBD_AS_BUILT';document.getElementById('legend').textContent=notes[layer];for(const b of document.querySelectorAll('[data-layer]'))b.setAttribute('aria-pressed',b.dataset.layer===layer);const rows=room.value==='ALL'?d.rooms:d.rooms.filter(r=>r.id===room.value);document.getElementById('zone-summary').replaceChildren();for(const r of rows){const section=document.createElement('div');section.className='zone';const h=document.createElement('b');h.textContent=r.name+' • '+r.id;section.append(h);for(const z of r.zones.filter(z=>z.layer===layer)){const p=document.createElement('p');p.textContent=z.code+' '+z.label+' — '+z.owner_use;section.append(p);}if(layer==='F'){const p=document.createElement('p');p.textContent=opt+': '+r.floor[opt]+' — '+r.floor.boundary;section.append(p);}document.getElementById('zone-summary').append(section);}}
 room.onchange=update;floor.onchange=update;for(const b of document.querySelectorAll('[data-layer]'))b.onclick=()=>{layer=b.dataset.layer;update();};if(innerWidth<650)room.value='RECP-01';update();
 document.getElementById('download-plan').onclick=()=>{const opt=layer==='F'?floor.value:'A',blob=new Blob([d.embedded[layer][opt].ALL],{type:'image/svg+xml'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='TypeB-M1-'+layer+(layer==='F'?'-'+opt:'')+'.svg';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 </script></html>`;
}

export function build(){
 const data=reconcile();writeReconciliation(data);
 fs.writeFileSync(`${OUT}/COORDINATION.json`,JSON.stringify(data,null,2)+'\n');
 fs.writeFileSync(`${OUT}/FIRST_FIX_ISSUES.json`,JSON.stringify({schema:'TypeBFirstFixQuestions/1',issue:70,source:data.source,questions:data.intents},null,2)+'\n');
 fs.writeFileSync(`${OUT}/FIRST_FIX_ISSUES.csv`,csv(data.intents,issueColumns));
 for(const [key,layer] of Object.entries(LAYERS))fs.writeFileSync(`${OUT}/${layer.file}`,standalonePlan(data,key)+'\n');
 fs.writeFileSync(`${OUT}/Owner-Review.html`,ownerHTML(data));
 fs.writeFileSync(`${OUT}/README.md`,`# Type B M1 — مراجعة أول fixing\n\nالمدخل هو HEAD \`${head}\` / M0 issue69. [Owner-Review.html](Owner-Review.html) يعمل أوفلاين: أربع طبقات مستقلة، تكبير لكل واحدة من 13 مساحة، خيارا أرضية، وقرارات A15 كاملة. حمّل [Owner-Review-Package.zip](Owner-Review-Package.zip) وافتح HTML؛ لا اعتماد على الإنترنت.\n\n- [A15_DISPOSITION.csv](A15_DISPOSITION.csv) / JSON: 65/65، 24 reanchor +38 room-level +3 parked. old K12 island/oven-column/terrace-washer لا يوجدوا في الرسم النشط. نيش غسالة indoor احتياج جديد، ليس جهازًا مركبًا.\n- [01-Power-Controls.svg](01-Power-Controls.svg)؛ [02-Lighting-RCP.svg](02-Lighting-RCP.svg)؛ [03-HVAC-Services.svg](03-HVAC-Services.svg)؛ [04-Floors-Thresholds.svg](04-Floors-Thresholds.svg). الرموز مناطق وظيفية وأثاث source، مش إحداثيات fixing. SVG الأرضية يقارن A/B معًا؛ HTML يكبر البديل/الغرفة.\n- [FIRST_FIX_ISSUES.csv](FIRST_FIX_ISSUES.csv) / JSON: ${data.intents.length} منطقة استعمال، سبب ربطها بالأثاث، tradeoff، دليل confidence وخطوة مسح وتوقيع trade. جدول الغرف داخل HTML. [COORDINATION.json](COORDINATION.json) يشمل exact source object records وأدلة المصدر.\n- [SOURCE_LOCK.json](SOURCE_LOCK.json): حفظ كل ملفات HEAD الموروثة، بما فيها كل نتائج M0. تعديل automation واحد يسمح فقط ببصمتي تحديث docs المالك37e8844 داخل verifier M0؛ لا إعادة توليد M0.\n\nSource scene \`scene-9cf45a73\` SHA \`${data.source.sha256}\`، cloud origin \`scene-4821689\`/storage55؛ canonical \`${data.source.canonical_sha256}\`. Architecture P0، demolished=[]، الزجاج كامل الارتفاع وسقف مصدر2500 محفوظين. NORTH unknown؛ arcs source inferred؛ nominal openings ليست finished clear. 75 warnings موروثة ومشكلة entry/chair وBR02 grid ليست إثباتًا للموقع. كل approvals false/HOLD.\n\nالتصميم الجديد يفصل bedside/work/TV/دخول، ambient/task/accent/night/manual fallback، مناطق no-draught والخدمة، وخياري floor public/private/wet/outdoor. R4 ivory/R5 D1/R6 L2 أدلة kitchen visual lead فقط؛ لا رأي مصنّعين جديد أو دوائر أو أحمال أو cable/breaker/lux/AC tonnage. الأدلة السابقة مرتبطة من HTML ببصماتها. كل equipment/shaft/threshold/wet protection \`TBD_AS_BUILT\` و#19 لتوقيع مهني.\n\nNEXT #71: ثلاث لغات تصميم ومودبوردات من نفس M0 وقيود M1؛ #72 مراجعات الغرف؛ #19 رفع موقع وإصدار مهني لاحق. اتجاه المشروع لم يتغير، لذا Master Plan وAGENTS محفوظين؛ issue board #41 مصدر handoff التشغيلي.\n\nإعادة التوليد: \`node scripts/build-whole-home-m1.mjs\`؛ اختبارات \`node --test --test-isolation=none scripts/whole-home-m1.test.mjs\`. تحقق محلي/بصري وتغليف في [VALIDATION.md](VALIDATION.md).\n`);
 verifyPreservation();return data;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const data=process.argv.includes('--reconcile')?reconcile():build();
 if(process.argv.includes('--reconcile'))writeReconciliation(data);
 console.log(JSON.stringify(data.summary));
}
