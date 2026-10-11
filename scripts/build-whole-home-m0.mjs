/** Read-only source extraction for #69. Writes only the separate M0 review folder. */
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {createApartmentDomain, LOCKED_CANONICAL} from '../studio/domain/apartment.mjs';

export const OUT='design-development/whole-home-m0';
export const SOURCE='render-snapshots/current.json';
export const CANONICAL='dist/sources/Apartment_Master_Spec_Type_B_v0.2.2_Geometry_Heights_Glazing(1).json';
export const TAGS=['SOURCE-VERIFIED','MODEL-TESTED','DESIGN-LEAD','EXPERIMENTAL','SITE-HOLD'];
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
export const hash=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const round=n=>+n.toFixed(1);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const repo='https://github.com/Mostafatalaat770/flat-designer';
const branch='integration/owner-review-gates-r1-20261010';
const url=p=>`${repo}/blob/${branch}/${p.split('/').map(encodeURIComponent).join('/')}`;
const ref=(p,pointer)=>({path:p,pointer,sha256:hash(p)});

export function verifyLocks(){
  const locks=read(`${OUT}/SOURCE_LOCK.json`);
  assert.equal(locks.starting_head,'f5ad15f37a25ca91b598810e195fcacc777d6600');
  // Owner-authored 37e8844 updates continuity docs only, after M0 completion.
  // Keep M0's historical manifest/results intact. Permit these exact document hashes,
  // never arbitrary new edits and never geometry, inventory, approvals or design sources.
  const continuity37={
    'AGENTS.md':'f26ac8391b5abc9e05d2bd658b24538bfcab841b080e93e44b5f068834ba4337',
    'design-development/WHOLE_HOME_MASTER_PLAN.md':'8078dbb6875aa8f0b8d0b541cb72d6623dfceeddca860fe0866c052b3bb92a4c'
  };
  for(const [p,sha] of Object.entries(locks.files)){
    const actual=hash(p);
    assert.ok(actual===sha||actual===continuity37[p],`Inherited source changed: ${p}`);
  }
  assert.equal(hash(CANONICAL),LOCKED_CANONICAL);
  return locks;
}

export function validateEditorial(input,roomIds){
  assert.deepEqual(Object.keys(input.rooms).sort(),[...roomIds].sort(),'Exactly 13 canonical spaces required');
  const evidence=new Set(input.evidence.map(e=>e.id));
  assert.equal(evidence.size,input.evidence.length);
  const decisions=new Set(input.decisions.map(d=>d.id));
  assert.equal(decisions.size,input.decisions.length);
  for(const e of input.evidence){assert.ok(TAGS.includes(e.role));for(const p of e.paths)assert.ok(fs.existsSync(p),p);}
  for(const r of Object.values(input.rooms)){
    assert.ok(r.opportunities.length>=1&&r.opportunities.length<=3);
    for(const o of r.opportunities){assert.ok(TAGS.includes(o.proof));assert.ok(evidence.has(o.evidence));}
    for(const id of r.evidence)assert.ok(evidence.has(id));
    for(const id of r.decisions)assert.ok(decisions.has(id));
  }
  for(const d of input.decisions){
    assert.ok(TAGS.includes(d.proof));assert.ok(d.alternatives.length<=2&&d.alternatives.length>0);
    for(const id of d.rooms)assert.ok(roomIds.includes(id));
    for(const id of d.evidence)assert.ok(evidence.has(id));
    assert.ok([70,71,72].includes(d.handoff));
  }
}

export function extractInventory(){
  const locks=verifyLocks(), domain=createApartmentDomain(process.cwd());
  const snapshot=read(SOURCE), canonical=read(CANONICAL), input=read(`${OUT}/REVIEW_INPUT.json`);
  assert.equal(snapshot.scene_revision,'scene-9cf45a73');
  assert.equal(domain.revision(snapshot.layout),snapshot.scene_revision);
  assert.equal(snapshot.source_scene_revision,'scene-4821689');
  assert.equal(snapshot.storage_revision,55);
  assert.equal(domain.model.height_m,2.5);
  assert.deepEqual(snapshot.layout.demolished,[]);
  assert.equal(snapshot.architecture_variant,undefined);
  assert.equal(domain.model.rooms.length,13);
  validateEditorial(input,domain.model.rooms.map(r=>r.id));
  const validation=domain.validate(snapshot.layout);
  const records=[];
  for(const [i,o] of snapshot.layout.furniture.entries())records.push({
    id:o.id,room_id:o.room_id,kind:o.type,name:o.name,source_status:o.status,
    proof:'SOURCE-VERIFIED',source:ref(SOURCE,`/layout/furniture/${i}`),
    size_mm:{width:o.w,depth:o.d,height:null},height_status:'NOT_SAVED; no renderer default substituted',
    placement:{mode:'floor',centre_mm:[o.cx,o.cy],rotation_deg:o.rot},
    source_record:o,plan_envelope:domain.footprint(o)
  });
  for(const [i,o] of snapshot.layout.interior.objects.entries()){
    const resolved=domain.resolveObject(o);
    records.push({id:o.id,room_id:o.room_id,kind:o.type,name:o.metadata?.role??o.id,
      source_status:o.status,proof:'SOURCE-VERIFIED',source:ref(SOURCE,`/layout/interior/objects/${i}`),
      size_mm:{width:o.width_mm,depth:o.depth_mm,height:o.height_mm},height_status:'SAVED_DIMENSION',
      placement:{...o.placement,source_centre_mm:o.cx===undefined?null:[o.cx,o.cy],source_rotation_deg:o.rotation,
        resolved_model_centre_mm:[resolved.cx,resolved.cy],resolved_model_rotation_deg:resolved.rot,
        resolved_model_bottom_mm:resolved.bottom_mm,resolved_model_top_mm:resolved.top_mm,
        resolution_source:'studio/domain/apartment.mjs#resolveObject; interior-core.js#interiorResolved',
        host_source_wall_index:resolved.host?.source_wall_index??null},
      source_record:o,plan_envelope:domain.footprint(resolved)});
  }
  const byId=new Map(records.map(o=>[o.id,o]));
  const rooms=domain.model.rooms.map((r,i)=>{
    const xs=r.poly.map(p=>p[0]),ys=r.poly.map(p=>p[1]);
    const furniture=records.filter(o=>o.room_id===r.id);
    const checks=validation.checks.filter(c=>c.room_id===r.id||
      byId.get(c.object_id)?.room_id===r.id||c.object_ids?.some(id=>byId.get(id)?.room_id===r.id));
    return {id:r.id,...input.rooms[r.id],geometry:{proof:'SOURCE-VERIFIED',
      model_source:ref('dist/apartment-model.json',`/rooms/${i}`),
      canonical_source:ref(CANONICAL,`/spaces/${r.id}`),polygon_mm:r.poly,
      model_bbox_mm:[Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)],
      model_span_mm:[Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys)],
      model_polygon_area_m2:r.area_estimate_m2,
      printed_label:canonical.spaces[r.id].printed_label??null,
      printed_dimensions_m:canonical.spaces[r.id].printed_dimensions_m??null,
      limitation:'Image-calibrated polygon follows spatial envelopes/approximate wall axes. Bbox is not clear width; printed label is separate; geographic north unknown.'},
      source_floor:{value:snapshot.layout.rooms[r.id].mat,source:ref(SOURCE,`/layout/rooms/${r.id}/mat`),approval:'NOT_A_MATERIAL_SPEC'},
      ceiling:{height_mm:domain.model.height_m*1000,source:ref('dist/apartment-model.json','/height_m'),status:'MODEL_FINISHED_TARGET_NOT_SITE_MEASURED'},
      wall_segment_indices:domain.model.wall_segments.flatMap((w,i)=>w.rooms.includes(r.id)?[i]:[]),
      openings:domain.model.openings.flatMap((o,i)=>o.between.includes(r.id)?[{...o,proof:'SOURCE-VERIFIED',source:ref('dist/apartment-model.json',`/openings/${i}`),width_status:'NOMINAL_FULL_OPENING; effective finished/operable clear unknown'}]:[]),
      furniture,model_checks:{proof:'MODEL-TESTED',source_layout_sha256:hash(SOURCE),
        method:'Existing interiorValidation via studio/domain/apartment.mjs; nearest gaps, inferred sampled hinges, conservative 125mm grid paths. Generic preferred thresholds are not code.',
        checks,limitation:'No physical user test, continuous door kinematics, site circulation or accessibility certification.'},
      site_status:'SITE-HOLD',construction_approved:false};
  });
  const baselineAudit=read('design-development/reception-sprint/audit-baseline.json');
  const contract=read('design-development/reception-sprint/source-contract.json');
  assert.equal(baselineAudit.scene_revision,snapshot.scene_revision);
  assert.equal(contract.source_sha256,hash(SOURCE));
  for(const [key,id] of [['reception','RECP-01'],['kitchen','KIT-01']])
    assert.deepEqual(baselineAudit.room_polygons[key],domain.model.rooms.find(r=>r.id===id).poly, 'Baseline room polygons must be current');
  const firstfix=read('design-development/advisor/cases/typeb-wholehome-firstfix.json');
  const old=read(firstfix.source_scene);
  const dims=o=>o&&[o.cx,o.cy,o.w,o.d,o.rot];
  const oldFurniture=new Map(old.layout.furniture.map(o=>[o.id,o]));
  const currentFurniture=new Map(snapshot.layout.furniture.map(o=>[o.id,o]));
  const reanchor=firstfix.equipment_points.map((p,i)=>{
    const a=p.anchor;
    let state='ROOM_INTENT_REVIEW_REQUIRED';
    if(a?.type==='furniture')state=!currentFurniture.has(a.id)?'MISSING_FROM_CURRENT':
      JSON.stringify(dims(oldFurniture.get(a.id)))===JSON.stringify(dims(currentFurniture.get(a.id)))?
        'SAME_SAVED_FURNITURE_ENVELOPE; FUNCTION_AND_SERVICES_UNVERIFIED':'CHANGED_SAVED_FURNITURE_ENVELOPE; REANCHOR_REQUIRED';
    else if(a?.type==='opening'||a?.type==='door')state=domain.model.openings.some(o=>o.id===a.id)?'CANONICAL_OPENING_PRESENT; CONTROLS_UNVERIFIED':'MISSING_FROM_CURRENT';
    return {id:p.id,room_id:p.room_id,kind:p.kind,intent:p.intent,original_anchor:a,
      source:ref('design-development/advisor/cases/typeb-wholehome-firstfix.json',`/equipment_points/${i}`),
      proof:'EXPERIMENTAL',original_scope:firstfix.reference_scene_revision,current_anchor_state:state,
      actual_location:'TBD_AS_BUILT',construction_approved:false};
  });
  return {schema:'TypeBWholeHomeM0/1',issue:69,starting_head:locks.starting_head,branch,
    source:{path:SOURCE,sha256:hash(SOURCE),scene_revision:snapshot.scene_revision,
      cloud_origin_scene:snapshot.source_scene_revision,cloud_storage_revision:snapshot.storage_revision,
      cloud_fetch_status:'EXISTING_REPOSITORY_PROVENANCE_ONLY; no live scene fetched or saved',
      canonical_path:CANONICAL,canonical_sha256:LOCKED_CANONICAL,finished_ceiling_mm:2500},
    proof_tags:{'SOURCE-VERIFIED':'Exact saved/model value, with file + JSON pointer; not as-built',
      'MODEL-TESTED':'Existing reproducible model/renderer test with stated assumptions; not physical proof',
      'DESIGN-LEAD':'Preference for further study; owner final acceptance absent',
      'EXPERIMENTAL':'Unselected hypothesis or historical functional input requiring recheck',
      'SITE-HOLD':'Measurement, competent engineer/developer or real user evidence required'},
    proof_aliases:{SOURCE_VERIFIED:'SOURCE-VERIFIED',MODEL_TESTED:'MODEL-TESTED',DESIGN_LEAD:'DESIGN-LEAD',EXPLORATORY:'EXPERIMENTAL',SITE_HOLD:'SITE-HOLD'},
    summary:{spaces:rooms.length,furniture_records:records.length,saved_floor_furniture:snapshot.layout.furniture.length,
      saved_interior_objects:snapshot.layout.interior.objects.length,hard_failures:validation.checks.filter(c=>c.status==='FAIL').length,
      model_warnings:validation.checks.filter(c=>c.status==='WARNING').length,a15_intents:reanchor.length},
    approvals:{owner_final:false,construction:false,procurement:false,cloud_save:false},
    rooms,decisions:input.decisions,evidence:input.evidence.map(e=>({...e,sources:e.paths.map(p=>({path:p,sha256:hash(p)}))})),
    inherited_current_public_audit:{proof:'MODEL-TESTED',source:ref('design-development/reception-sprint/audit-baseline.json',''),
      assumptions:baselineAudit.assumptions,chair_450:baselineAudit.chairStates.find(s=>s.pullback_mm===450),
      entry_shoe_user_sweep:baselineAudit.entry.shoe_user_sweep,living:baselineAudit.living},
    a15_reanchor:reanchor,
    handoff:{next_issue:70,style_issue:71,room_review_issue:72,site_release_issue:19,
      note:'NEXT #70 concept overlays from this current inventory; #71 may follow/overlap after M0 review. #19 only if owner chooses execution. No new roadmap.',
      stale_text:'CURRENT_BASELINE/OWNER_REVIEW older kitchen-first workflow and #19 archived tub/shower sizes are superseded by 11 Oct #41/master plan. Original documents preserved; current.json supplies dimensions.'}};
}

function planSVG(data){
  const model=read('dist/apartment-model.json');
  let s=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-250 -250 ${model.width_mm+500} ${model.depth_mm+500}" role="img" aria-label="13-space current source plan"><title>Type B current scene-9cf45a73 — model plan, not site survey</title><rect x="-250" y="-250" width="${model.width_mm+500}" height="${model.depth_mm+500}" fill="#faf8f3"/>`;
  for(const r of model.rooms){const fill=r.isTerrace?'#e4eddf':r.kind==='bathroom'||r.id==='WC-01'?'#e0ebee':r.kind==='bedroom'?'#efe5d5':'#eeeae1';
    s+=`<a href="#${r.id}"><polygon points="${r.poly.map(p=>p.join(',')).join(' ')}" fill="${fill}" stroke="#b6afa3" stroke-width="12"/><title>${esc(r.id)}: ${esc(data.rooms.find(x=>x.id===r.id).name_ar)}</title></a>`;
  }
  for(const r of data.rooms)for(const o of r.furniture){
    const elevated=o.placement.mode==='wall'||o.placement.mode==='ceiling';
    s+=`<polygon points="${o.plan_envelope.map(p=>p.join(',')).join(' ')}" fill="${o.kind==='rug'?'none':elevated?'#a3bbc3':'#baa18a'}" fill-opacity=".5" stroke="${elevated?'#457581':'#7c6655'}" stroke-width="16" ${elevated||o.kind==='rug'?'stroke-dasharray="45 35"':''}><title>${esc(o.id)} — ${esc(o.kind)}; ${elevated?'elevated projection; not floor blockage':'source envelope'}</title></polygon>`;
  }
  for(const w of model.wall_segments)s+=`<line x1="${w.from[0]}" y1="${w.from[1]}" x2="${w.to[0]}" y2="${w.to[1]}" stroke="${w.kind==='low'?'#9e9387':'#524e48'}" stroke-width="${w.thickness_mm}"/>`;
  for(const o of model.openings)s+=`<line x1="${o.from[0]}" y1="${o.from[1]}" x2="${o.to[0]}" y2="${o.to[1]}" stroke="#4a8c9a" stroke-width="65"><title>${esc(o.id)}: ${round(o.length_mm)} mm nominal full opening; effective clear unknown</title></line>`;
  for(const r of model.rooms){const width=r.id==='RECP-01'?1500:1400;
    s+=`<a href="#${r.id}"><rect x="${r.at[0]-width/2}" y="${r.at[1]-145}" width="${width}" height="290" rx="75" fill="#fff" opacity=".92"/><text x="${r.at[0]}" y="${r.at[1]+75}" text-anchor="middle" font-family="sans-serif" font-size="220" font-weight="bold" fill="#243738">${r.id}</text></a>`;
  }
  return s+'</svg>';
}

function renderRoom(r){
  const rows=r.furniture.map(o=>`<tr><td dir="ltr">${esc(o.id)}<br>${esc(o.kind)}</td><td dir="ltr">${o.size_mm.width} × ${o.size_mm.depth} × ${o.size_mm.height??'غير محفوظ'}</td><td dir="ltr">${esc(JSON.stringify(o.placement))}</td><td><a href="${url(o.source.path)}">${esc(o.source.pointer)}</a></td></tr>`).join('');
  const checks=r.model_checks.checks.filter(c=>c.status!=='PASS');
  return `<article id="${r.id}" data-room="${r.id}"><h3>${esc(r.name_ar)} <small dir="ltr">${r.id}</small></h3><p>${esc(r.function)}</p><p class="meta">SOURCE-VERIFIED · حدود النموذج ${r.geometry.model_span_mm.map(round).join(' × ')} مم؛ مساحة المضلع ${r.geometry.model_polygon_area_m2.toFixed(2)} م². دول مش مقاسات تشطيب صافي.</p><p>المكتوب في المصدر: ${esc(r.geometry.printed_label??'مفيش مقاس مطبوع للفراغ كله')} · الأرضية المحفوظة: <b dir="ltr">${esc(r.source_floor.value)}</b>، كود رسم مش مواصفة منتج.</p><ul>${r.pain_points.map(p=>`<li>${esc(p)}</li>`).join('')}</ul><ul>${r.opportunities.map(o=>`<li><b class="tag">${o.proof}</b> ${esc(o.text)} <a href="#e-${o.evidence}">دليل</a></li>`).join('')}</ul><p>القرارات: ${r.decisions.map(d=>`<a href="#${d}">${d}</a>`).join(' · ')} · SITE-HOLD</p><details><summary>الفتحات والأثاث والتحذيرات ومصدر كل مقاس</summary><p><a href="${url(r.geometry.canonical_source.path)}">المصدر الأصلي /spaces/${r.id}</a> · <a href="${url(r.geometry.model_source.path)}">حدود النموذج ${r.geometry.model_source.pointer}</a></p><ul>${r.openings.map(o=>`<li dir="ltr">${o.id}: ${round(o.length_mm)} mm — nominal full opening; actual clear TBD. <a href="${url(o.source.path)}">${o.source.pointer}</a></li>`).join('')}</ul><div class="scroll"><table><thead><tr><th>ID</th><th>W × D × H مم</th><th>موضع محفوظ / resolved model</th><th>JSON pointer</th></tr></thead><tbody>${rows||'<tr><td colspan="4">مفيش أثاث محفوظ في الفراغ ده؛ مش مكان مقترح لغسالة أو تكييف.</td></tr>'}</tbody></table></div><p>الإحداثيات تخص الأثاث والنموذج فقط. لا توجد إحداثيات كهرباء أو مواقع تركيب. حل مواضع عناصر الحائط مشتق من host، مش إحداثيات مسح موقع. ارتفاع الأثاث غير المحفوظ يفضل غير معروف.</p><p>MODEL-TESTED: تحذيرات محسوبة؛ الفجوات بين الأجسام مش بالضرورة مسار مشي، وحدود المفضل في الفحص مش اشتراط قانوني. شبكة المسار محافظة؛ الصفر يعني إن التقدير للهدف ده مااثبتش مسار.</p><pre dir="ltr">${esc(JSON.stringify(checks,null,2))}</pre></details></article>`;
}

function html(data,svg){
  return `<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Type B — مراجعة المصدر والـ13 مساحة</title><style>
  *{box-sizing:border-box}body{margin:0;background:#f5f1e9;color:#253b3e;font:17px/1.7 Arial,sans-serif}main{max-width:1120px;margin:auto;padding:30px 20px}h1{font-size:34px;line-height:1.4}h2{font-size:26px}h3{margin-top:0}a{color:#23667b;overflow-wrap:anywhere}article,section,.callout{background:#fffdf8;border:1px solid #d8d2c5;border-radius:12px;padding:22px;margin:18px 0}small,.meta{color:#546968}.tag{display:inline-block;font-size:12px;background:#e8ede7;border-radius:5px;padding:2px 7px}svg{width:100%;height:auto;display:block}table{border-collapse:collapse;width:100%;min-width:780px;font-size:13px}th,td{padding:9px;border-bottom:1px solid #ddd;text-align:start;vertical-align:top}td{overflow-wrap:anywhere}.scroll{overflow:auto}pre{font-size:12px;white-space:pre-wrap;overflow-wrap:anywhere;background:#f1f3f0;padding:12px}details{border-top:1px solid #ddd;padding-top:10px}summary{cursor:pointer}nav{display:flex;flex-wrap:wrap;gap:8px}nav a{padding:5px 10px;border:1px solid #bbc9c4;border-radius:6px;font-size:13px}button{background:#284c51;color:white;border:0;border-radius:5px;padding:9px 16px;cursor:pointer}li{margin:8px 0}section[id],article[id],li[id]{scroll-margin-top:12px}@media(max-width:500px){main{padding:18px 12px}h1{font-size:27px}article,section{padding:15px}body{font-size:16px}}@media print{button{display:none}article{break-inside:avoid}details{display:block}main{max-width:none}}
  </style><main><p><span dir="ltr">TYPE B · M0 · ISSUE #69</span> · 11 أكتوبر 2026</p><h1>البيت كله، على مصدر واحد واضح</h1><p>حصر ${data.summary.spaces} مساحة و${data.summary.furniture_records} عنصر محفوظ، وربط الشغل السابق بالقرار التالي. ده ملف مراجعة للمصدر والاستخدام؛ الموافقات التنفيذية والسحابة زي ما هي.</p><div class="callout"><b>المصدر الأساسي:</b> <span dir="ltr">current.json / scene-9cf45a73</span>، أصله cloud v55 <span dir="ltr">scene-4821689</span>. مصدر المطبخ A/P0 مختلف؛ R4 → D1 → L2 اتجاهات دراسة فقط. سقف النموذج 2500 مم والزجاج الكامل محفوظين. لا يوجد مسح as-built.</div><nav>${data.rooms.map(r=>`<a href="#${r.id}">${esc(r.name_ar)}</a>`).join('')}<a href="#decisions">القرارات</a><a href="#evidence">الأدلة</a><a href="#handoff">التسليم التالي</a></nav><section><h2>المخطط الحالي المحفوظ</h2>${svg}<p>الحائط الأصلي بلون داكن، الفتحات بالأزرق، الأثاث الأرضي بلون خشبي، وإسقاط العناصر العالية بخط متقطع. كل المخطط من المصدر الحالي؛ مفيش فتحة P1 مضافة. أعلى الصورة هو أعلى الرسم، مش شمال جغرافي. اضغط كود المساحة لفتح حصرها.</p></section><section><h2>اللي لازم ننتبه له</h2><p>الفحص الحالي: ${data.summary.hard_failures} فشل حاد و${data.summary.model_warnings} تحذير. النجاح الهندسي هنا بيختبر الرسم؛ تحذيرات غرف النوم والحمّامات وأبواب الخدمة لسه محتاجة استخدام فعلي.</p><p>في المصدر الحالي، دولاب الجزمة نفسه يتداخل مع الكرسي عند سحب الست كراسي؛ وشخص الجزمة يتداخل مع بعض عينات باب المدخل. A/P0 نقل وصغّر الدولاب، لكن دراسة المدخل التالية برضه مااثبتتش مرور متزامن. ما نخلطش الرقمين ولا نعتبر شكل الفراغ موافقة.</p><p>حصر A15 القديم فيه ${data.a15_reanchor.length} نية خدمة مصدرها K12. فيهم ${data.a15_reanchor.filter(p=>p.current_anchor_state==='MISSING_FROM_CURRENT').length} anchor غائب و${data.a15_reanchor.filter(p=>p.current_anchor_state.startsWith('CHANGED')).length} غلاف أثاث متغير. لازم إعادة ربطهم قبل #70؛ حتى ID مطابق لا يثبت خدمات مركبة.</p></section><section id="decisions"><h2>قائمة واحدة للقرارات المؤثرة — بالأولوية</h2><ol>${data.decisions.map(d=>`<li id="${d.id}"><b>${d.id} · ${esc(d.question)}</b> <span class="tag">${d.proof}</span><p>${d.alternatives.map(esc).join(' / ')}</p><p>${esc(d.resolve)} <a href="${repo}/issues/${d.handoff}">تسليم #${d.handoff}</a> · ${d.evidence.map(e=>`<a href="#e-${e}">${e}</a>`).join('، ')}</p></li>`).join('')}</ol></section><h2>مصفوفة المساحات</h2>${data.rooms.map(renderRoom).join('')}<section id="evidence"><h2>الدليل السابق ومكانه الصحيح</h2><p>بنُعيد استخدام الملفات والصور والمراجعات الموجودة؛ مفيش لقطات 3D جديدة مطلوبة لحصر المصدر. روابط الخدمات الخارجية تحتاج إنترنت؛ محتوى الحصر والمخطط كله يشتغل أوفلاين. عدد صور R4/R5/R6 مأخوذ من سجلاتها، لا يَدّعي إعادة تنزيلها أو فحص كل PNG النهارده.</p>${data.evidence.map(e=>`<div id="e-${e.id}"><h3>${e.id} <span class="tag">${e.role}</span></h3><p dir="ltr">${esc(e.source_scope)}</p><p>${esc(e.use)}</p><p>${e.paths.map(p=>`<a href="${url(p)}">${esc(p)}</a>`).join('<br>')}</p><p>${(e.links??[]).map((l,i)=>`<a href="${esc(l)}">الدليل الخارجي ${i+1}</a>`).join(' · ')}</p></div>`).join('')}</section><section id="handoff"><h2>التسليم التالي</h2><p><b>NEXT: <a href="${repo}/issues/70">#70 — نيات الكهرباء والإضاءة وRCP والتكييف وحدود الأرضيات</a>.</b> يبدأ بالمصفوفة الحالية وقائمة إعادة ربط A15؛ مخططات منفصلة، وكل نقطة TBD_AS_BUILT. ما ننقلش XY من أثاث أو من K12 لمأخذ كهرباء.</p><p><a href="${repo}/issues/71">#71</a> يستلم نفس المصدر لمقارنة ثلاث لغات مختلفة ومراجع حقيقية، مع R4–R6 كمرجع مطبخ فقط. <a href="${repo}/issues/72">#72</a> يستلم الأسئلة لكل مجموعة غرف. <a href="${repo}/issues/19">#19</a> يفضل بوابة المسح والتوقيع لو اخترت التنفيذ؛ أبعاد بانيو/دش تاريخية جوّاه لا تُنسخ للمصدر الحالي.</p><p>مفيش تعديل معمار، حفظ سحابي، ريجستري موافقات، شراء، نشر أو دمج. تفضيلات M0/F1 وحوض B وP1 محفوظة في وضعها السابق. ده استمرار لـ#41، مش roadmap جديدة.</p></section><details><summary>معجم الإثبات والبصمات</summary><pre dir="ltr">${esc(JSON.stringify({source:data.source,starting_head:data.starting_head,proof_tags:data.proof_tags,proof_aliases:data.proof_aliases,approvals:data.approvals},null,2))}</pre></details><p><button onclick="window.print()">طباعة المراجعة</button> · الملف الكامل للمراجعة الآلية: ROOM_MATRIX.json في نفس مجلد المستودع.</p></main></html>`;
}

function markdown(data){
  return `# Type B — M0: مراجعة المصدر والـ13 مساحة\n\nIssue [#69](${repo}/issues/69)، تابع [#41](${repo}/issues/41). بدأنا من HEAD \`${data.starting_head}\` على الفرع المطلوب. ده الحصر الحالي، مش خطة جديدة.\n\n- [افتح المراجعة الواحدة](Owner-Review.html): مخطط مصدر حقيقي، قائمة قرارات بالأولوية، وحصر كل غرفة؛ يعمل أوفلاين.\n- [المصفوفة الكاملة بالمقاسات والمواضع ومصدر كل قيمة](ROOM_MATRIX.json) · [المخطط](Source-Plan.svg) · [بصمات كل المصادر الموروثة](SOURCE_LOCK.json).\n\nالمصدر \`${data.source.scene_revision}\` / [current.json](../../render-snapshots/current.json)، SHA256 \`${data.source.sha256}\`، أصل cloud v55 \`${data.source.cloud_origin_scene}\`. لا اتصال حفظ بالسحابة. Canonical v0.2.2 \`${LOCKED_CANONICAL}\`؛ ارتفاع النموذج 2500 مم. A/P0 \`scene-9e86635b\` وR4–R6 \`scene-3b86c557\` دراسات منفصلة.\n\n## الحصر المختصر\n\nحدود X×Y أدناه bounding spans للنموذج من [apartment-model.json](../../dist/apartment-model.json)؛ **مش مقاسات حائط صافي أو تنفيذ**. المقاس المطبوع بالمصدر منفصل في المصفوفة. مواضع كل الـ${data.summary.furniture_records} عنصر وأبعادها الأصلية وJSON pointers موجودة في التفاصيل؛ مفيش ارتفاع افتراضي متاخد من الرندر بدل قيمة محفوظة. المدخل العام داخل RECP-01 والطرقة الخاصة HALL-01.\n\n| ID | الوظيفة | حدود النموذج مم | عناصر محفوظة | السؤال التالي |\n|---|---|---|---:|---|\n${data.rooms.map(r=>`| ${r.id} | ${r.name_ar} — ${r.function} | ${r.geometry.model_span_mm.map(round).join(' × ')} | ${r.furniture.length} | ${r.decisions.join(' / ')} |`).join('\n')}\n\n## قائمة القرارات بالأولوية\n\n${data.decisions.map(d=>`${d.priority}. **${d.id} — ${d.question}** [${d.proof}] ${d.resolve} → [#${d.handoff}](${repo}/issues/${d.handoff}).`).join('\n')}\n\n## قراءة الدليل من غير خلط مصادر\n\n- SOURCE-VERIFIED = قيمة محفوظة أو نموذج موثق؛ MODEL-TESTED = اختبار على النموذج؛ DESIGN-LEAD = اتجاه دراسة؛ EXPERIMENTAL = فرضية غير مختارة؛ SITE-HOLD = دليل موقع/مهندس/استخدام فعلي مطلوب. aliases القديمة ذات underscore موثقة في JSON.\n- المصدر الحالي: ${data.summary.hard_failures} فشل حاد و${data.summary.model_warnings} تحذير. التحذير عن nearest gap أو المسار الشبكي مش عرض طريق فعلي ولا حكم قانوني. رقم الصفر في BR-02 يعني إن التقدير مااثبتش المسار للهدف المختار.\n- audit-baseline الحالي يثبت تداخل دولاب الجزمة مع كرسي مسحوب وتداخل مستخدمه مع بعض عينات الباب؛ دراسات A/P0 اللاحقة تبين أن التصغير لم يثبت المرور المتزامن. كلاهما محفوظ وبمصدر مستقل.\n- حصر الأدلة في HTML/JSON يشمل الريسبشن والحمّامات وR4/R5/R6، مع روابط الملفات والصور السابقة. K4/v50/K12/A10/A11 مؤرشفة؛ يُعاد استخدام سؤال الوظيفة لا إحداثياتها. بيانات الماركات السابقة محفوظة ومؤجلة.\n- A15: ${data.a15_reanchor.length} نية خدمة تاريخية K12. قائمة \`a15_reanchor\` توضح الغلاف المفقود/المتغير وتجهز #70. لا إحداثيات مأخذ أو قاطع أو كابل أو سعة تكييف.\n\n## التسليم والتحقق\n\nNEXT [#70](${repo}/issues/70): مخططات نيات منفصلة من هذا المصدر مع TBD_AS_BUILT؛ [#71](${repo}/issues/71) للغات التصميم الثلاث؛ [#72](${repo}/issues/72) لمراجعات الغرف. المسح والموافقة التنفيذية يفضلوا [#19](${repo}/issues/19). نصوص أقدم عن kitchen-first أو بانيو K4 محفوظة كتاريخ وتسبق اتجاه 11 أكتوبر؛ أبعاد المصدر الحالي هي مرجع الحصر.\n\nإعادة التوليد: \`node scripts/build-whole-home-m0.mjs\`. العقود: \`node --test scripts/whole-home-m0.test.mjs\`. تحقق التسليم في [VALIDATION.md](VALIDATION.md). الـbuilder يرفض أي تغيير في البصمات الموروثة ويكتب داخل هذا المجلد فقط. المحلي والـGitHub Actions حالتان منفصلتان. لا دمج أو نشر أو شراء أو تعديل ريجستري/سحابة؛ كل الموافقات كما كانت.\n`;
}

export function build(){
  const data=extractInventory(),svg=planSVG(data);
  fs.mkdirSync(OUT,{recursive:true});
  for(const [name,value] of Object.entries({'ROOM_MATRIX.json':JSON.stringify(data,null,2)+'\n','Source-Plan.svg':svg+'\n','Owner-Review.html':html(data,svg),'README.md':markdown(data)}))fs.writeFileSync(path.join(OUT,name),value);
  verifyLocks();
  return data;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))console.log(JSON.stringify(build().summary));
