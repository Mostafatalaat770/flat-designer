/**
 * Source-locked whole-apartment owner review. The generated HTML is offline.
 * NO architecture modification, supplier purchase or construction signoff.
 */
import fs from "node:fs";
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {createApartmentDomain} from "../studio/domain/apartment.mjs";
const root="design-development";
const review=root+"/reception-sprint";
const out="review-evidence/owner-release-r1";
fs.mkdirSync(out,{recursive:true});
const read=p=>fs.readFileSync(p,"utf8");
const load=p=>JSON.parse(read(p));
const sha=p=>createHash("sha256").update(fs.readFileSync(p)).digest("hex");
const escape=s=>String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
const canonical="734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658";
const model=createApartmentDomain(process.cwd()).model;
const reg=load(root+"/decision-registry.json"),current=load("render-snapshots/current.json");
const A=load(review+"/A-P0.json"),B=load(review+"/B-P0.json");
const AP1=load(review+"/A-P1-CONDITIONAL.json"),BP1=load(review+"/B-P1-CONDITIONAL.json");
const audit=load(review+"/audit-proposed.json"),baseline=load(review+"/audit-baseline.json");
assert.equal(model.canonical_sha256,canonical);
assert.equal(model.height_m,2.5);
assert.equal(reg.canonical_sha256,canonical);
assert.equal(current.scene_revision,"scene-9cf45a73");
assert.equal(current.canonical_sha256,canonical);
assert.equal(reg.working_source.scene_revision,current.scene_revision);
assert.equal(current.source_scene_revision,"scene-4821689");
assert.equal(current.storage_revision,55);
assert.equal(A.scene_revision,"scene-9e86635b");
assert.equal(B.scene_revision,"scene-a7da4c73");
assert.equal(audit.scene_revision,A.scene_revision);
for(const s of [A,B,AP1,BP1]){
 assert.equal(s.canonical_sha256,canonical);
 assert.equal(s.source_scene_revision,"scene-4821689");
 assert.equal(s.storage_revision,55);
 assert.deepEqual(s.layout.demolished,[]);
}
assert.deepEqual(A.layout,AP1.layout);
assert.deepEqual(B.layout,BP1.layout);
assert.equal(AP1.architecture_variant.render_only,true);
assert.equal(BP1.architecture_variant.render_only,true);
assert.deepEqual(AP1.architecture_variant.hide_openings,["OP-RECP-KIT"]);
assert.equal(AP1.architecture_variant.remove_wall_segments.length,1);
const find=(s,id)=>{const r=s.layout.furniture.find(x=>x.id===id);assert.ok(r,id);return r};
const commonIds=["starter-35","starter-36","starter-37","starter-38","starter-39","A2-dining-chair-north-centre","A2-dining-chair-south-centre","starter-40"];
const footprint=s=>commonIds.map(id=>{const {cx,cy,w,d,rot}=find(s,id);return {id,cx,cy,w,d,rot}});
assert.deepEqual(footprint(A),footprint(B),"A/B furniture must remain a fair comparison");
assert.deepEqual([find(A,"starter-35").w,find(A,"starter-35").d],[2000,950]);
assert.equal(A.layout.furniture.filter(f=>f.type==="chair"&&f.room_id==="RECP-01").length,6);
assert.ok(Object.values(reg.approval_flags).every(v=>v===false),"Owner signoffs may not be invented");
assert.ok(Object.values(reg.decisions).every(x=>x.approved_for_construction===false),"Construction signoffs cannot be silently changed");
const g450=audit.chairStates.find(x=>x.pullback_mm===450);
const g350=audit.chairStates.find(x=>x.pullback_mm===350);
const b350=baseline.chairStates.find(x=>x.pullback_mm===350);
const m=audit.appliances.metrics;
assert.equal(g450.shoe_user_to_nearest_chair.gap_mm,15);
assert.equal(g350.buffet_open_to_nearest_chair.gap_mm,785);
assert.equal(b350.buffet_open_to_nearest_chair.gap_mm,585);
assert.equal(m.dishwasher_open_plus_user_to_south_nominal_inner_wall_mm,372.3);
assert.equal(m.fridge_open_vs_kitchen_door_sweep.positive_overlap_samples,26);
assert.equal(m.washer_user_vs_service_door_sweep.positive_overlap_samples,18);
assert.equal(m.oven_open_vs_service_door_sweep.positive_overlap_samples,13);
assert.equal(m.oven_user_vs_washer_user.overlap_area_mm2,54000);
for(const [path,key] of [
 ["reception-sprint2/REVIEW_AND_NEXT_DESIGN.md","15mm"],
 ["reception-sprint3/REVIEW.md","0/544"],
 ["reception-sprint4/REVIEW.md","108"],
 ["reception-sprint5/REVIEW.md","36"],
 ["reception-sprint6/REVIEW.md","48/48"],
 ["reception-sprint5/SITE_KITCHEN_SURVEY.md","K-24"]
])assert.ok(read(root+"/"+path).includes(key),"Missing historical evidence: "+path);
const gh="https://github.com/Mostafatalaat770/flat-designer";
const branch="integration/owner-review-gates-r1-20261010";
const link=p=>gh+"/blob/"+branch+"/"+p;
const urls={
 images:gh+"/actions/runs/38046581713/artifacts/11667855554",
 design:gh+"/pull/62",shoe:gh+"/pull/64",entry:gh+"/pull/63",
 appliance:gh+"/pull/65",suppliers:gh+"/pull/66",dishwasher:gh+"/pull/67",
 baths:link(root+"/CURRENT_BASELINE.md"),registry:link(root+"/decision-registry.json"),
 current:link("render-snapshots/current.json"),
 survey:link(root+"/reception-sprint5/SITE_KITCHEN_SURVEY.md")
};
const gate=(id,room,label,priority,state,observed,action,by,source,grade)=>({
 id,room,label,priority,state,observed,action,by,source,grade,construction_approved:false
});
const gates=[
 gate("R01","مدخل","جزامة المدخل وسعة الأحذية",1,"HOLD","15 مم بين المستخدم وأقرب كرسي عند سحب الكراسي 450 مم؛ 0 من 544 اختبارًا افتراضيًا استوفى شرط المرور المختبر.","وحدة أحذية بآلية فعلية وجرد أحذية الأسرة وتجربة باب المدخل مع ستة كراسي بأحجامها الحقيقية.","الأسرة والنجار",urls.shoe,"MODEL_PROXY"),
 gate("R02","سفرة","راحة الست كراسي وحركة البوفيه",1,"HOLD","سفرة 2000×950 مم وستة كراسي؛ فراغ البوفيه المفتوح في نموذج الحركة 585→785 مم بعد التطوير؛ ليس عرض ممر مؤكّدًا.","تجربة 1:1 مع ستة أشخاص وفتح البوفيه والباب وحمل صينية، مع الاحتفاظ بمكان الستة كراسي.","الأسرة ومصمم الديكور",urls.entry,"MODEL_PROXY"),
 gate("R03","مطبخ","فتحة غسالة الأطباق Integrated",1,"HOLD","Bosch Series 2 و6 جسمهما 598×550×815 مم ويحتاجان فتحة صافية 600 مم على الأقل وعُمق 550 مم وارتفاع 815–875 مم.","قياس عرض فتحة صافي بين الألواح على ثلاثة مستويات وارتفاع الرخام ودليل تركيب موديل ENR النهائي والوزرة وحركة السلة.","مهندس الموقع والنجار ومورّد الأجهزة",urls.dishwasher,"MANUFACTURER_PLUS_MODEL"),
 gate("R04","مطبخ","ممر تفريغ غسالة الأطباق",1,"HOLD","372.3 مم فقط خلف مستخدم 600×600 مم في وضع النموذج Front-aligned؛ 8 من 48 حالات النموذج تتداخل مع باب الخدمة.","فتح الباب وسحب السلة السفلية مع شخص يُفرغها وشخص ثاني يريد المرور، بقياسات واقعية.","الأسرة ومهندس الموقع",urls.dishwasher,"MODEL_PROXY"),
 gate("R05","مطبخ","باب الثلاجة وباب المطبخ الأصلي",1,"HOLD","يتداخل غلاف الثلاجة الافتراضي مع 26 من 46 زاوية تم أخذ عينات منها لفتح باب المطبخ P0.","رسم المفصلة وحركة درج الخضار واتجاه الباب والتهوية وأبعاد الباب الحقيقي.","المورّد ومهندس الموقع",urls.appliance,"MODEL_PROXY"),
 gate("R06","مطبخ","الغسالة وباب تراس الخدمة",1,"HOLD","غلاف وقوف مستخدم الغسالة يتداخل مع 18 من 46 زاوية لباب الخدمة في النموذج. LG المرجعي يصل عمقه مفتوحًا إلى 1030 مم.","تجربة الباب والخراطيم والصرف والكهرباء والصيانة قبل تثبيت مكان المقابس والوصلات.","مهندس MEP والمورّد",urls.suppliers,"MANUFACTURER_PLUS_MODEL"),
 gate("R07","مطبخ","موضع الفرن تحت البوتاجاز",1,"HOLD","الموضع الافتراضي القديم يتداخل مع باب الخدمة 13/46 مرة؛ اقتراح الفرن أسفل عين البوتاجاز يزيلها في عينات النموذج لكنه لا يحل وجود مستخدمي الفرن والغسالة معًا.","تأكيد توافق موديلات الفرن والبوتاجاز وتعليمات الحرارة والتهوية وفتح الباب والنجارة بواسطة المختص.","مورّد الأجهزة ومهندس MEP",urls.appliance,"MODEL_PROXY"),
 gate("R08","مطبخ","الشفاط والصرف والكهرباء والتخزين",1,"HOLD","مواقع الحوض والغسالة وغسالة الأطباق والموقد ثابتة في المصدر، لكن مسارات التهوية والميول والدوائر غير مقاسة.","مخطط First Fix معتمد ومسارات دكت مخرج قانوني، صرف وإمداد ومخارج كهرباء آمنة وصيانة وزاوية الخزانة.","مهندس MEP مؤهل",urls.survey,"FIELD_REQUIRED"),
 gate("R09","مطبخ","فتح P1 وحائط 44",1,"CONDITIONAL","P1 يحسن المشهد بصريًا فقط: حوالي 720.2→1207.4 مم فتحة نموذجية مع حذف حائط واحد وباب من الريندر، وليس تصريح هدم.","موافقة المطور والإنشائي وفحص الخدمات وتفاصيل الكمرة/الجوانب وحل الروائح قبل فتح أي حائط. خلاف ذلك يُحفظ P0.","المطور والإنشائي وMEP",urls.design,"RENDER_ONLY"),
 gate("R10","ريسبشن","الخامات وتوزيع الإضاءة A مقابل B",2,"DESIGN_REVIEW","Option A Calm Contemporary مرشح مفضل؛ B مصدر لفكرة معلّق سفرة رفيع فقط. 32 صورة WebGL حقيقية للمقارنة.","عينات بورسلين وخشب وأقمشة تحت ضوء طبيعي ومسائي؛ اختبار 3000K/انعكاس الزجاج وارتفاع السقف 2.50 م.","الأسرة ومصمم الديكور",urls.images,"VISUAL_ONLY"),
 gate("R11","ريسبشن","راحة الكنبة والتلفزيون والتكييف",2,"HOLD","الكنبة بطول 2880 مم؛ فجوة الكنبة لطاولة القهوة 520 مم وفق النموذج، ومسافة رؤية الشاشة تقريبية.","تجربة مقعد فعلي على أكثر من زاوية وتحديد ارتفاع التلفزيون ومسار تنظيف وحدة التلفزيون وصيانة التكييف.","الأسرة ومهندس HVAC",urls.design,"MODEL_PROXY"),
 gate("R12","حمامات","ماستر Walk-in 1450×800",1,"HOLD","اتجاه M0 بصريًا مفضل؛ زجاج ثابت 600 مم، التوسيع إلى عمق 900 مم يقلص الهامش الاسمي قرب باب الدريسنج.","مصرف وعزل وميل وتشطيب وانزلاق وزجاج آمن واختبار رش المياه وفتح الدريسنج.","مهندس عزل وسباكة ومورّد زجاج",urls.baths,"WET_BUILD_HOLD"),
 gate("R13","حمامات","دش العائلة 900×900 والزجاج",1,"HOLD","F1 بدون إطار مفضل بصريًا، لكن الباب الافتراضي 580 مم لا يجوز افتراض فتحه للخارج نحو الحمام.","رسم شركة زجاج بحركة فتح آمنة وعزل ومصرف ومسارات كرسي الحمام والحوض وتنظيف الزوايا.","مهندس حمامات ومورّد زجاج",urls.baths,"WET_BUILD_HOLD"),
 gate("R14","حمامات","حوض حمام الضيوف 450×250",2,"DESIGN_REVIEW","اتجاه Basin B العائم أجمل من الحوض المصدر 350×180 لكنه ليس مشتريات مؤكدة.","اختيار منتج فعلي وقياس دورة الباب وخط الصرف ومسامير التثبيت ومساحة الوقوف.","المصمم والسباك",urls.baths,"VISUAL_ONLY"),
 gate("R15","غرف","أبواب الدواليب ومساحة الأسرّة",2,"HOLD","مصدر v55 محفوظ؛ لا يوجد اعتماد حقيقي لفتح ضلف الدواليب ومرور شخصين أو دوائر الإضاءة.","جدول نجارة متكامل مع تجارب فتح الضلف ومساحات الملابس والكهرباء والتكييف.","الأسرة والنجار وMEP",urls.registry,"FIELD_REQUIRED"),
 gate("R16","الشقة بالكامل","مسح الموقع وموافقة التنفيذ",1,"HOLD","كل أعلام الموافقات الستة في decision-registry.json = false؛ النموذج 2.50 م صافٍ وليس قياس موقع.","رفع أبعاد التشطيب، توقيعات إنشائي وMEP المطلوبة، قائمة منتجات نهائية ورسومات تنفيذ/BOQ وموافقة صاحب الشقة الصريحة.","الأسرة ومهندس الموقع والاختصاصيون",urls.registry,"NOT_RECEIVED")
];
assert.equal(gates.length,16);
assert.equal(new Set(gates.map(x=>x.id)).size,16);
const metrics={shoe_person_chair_mm:g450.shoe_user_to_nearest_chair.gap_mm,
 buffet_open_before_mm:b350.buffet_open_to_nearest_chair.gap_mm,
 buffet_open_after_mm:g350.buffet_open_to_nearest_chair.gap_mm,
 DW_person_to_nominal_wall_mm:m.dishwasher_open_plus_user_to_south_nominal_inner_wall_mm,
 fridge_original_door_overlapping_samples:m.fridge_open_vs_kitchen_door_sweep.positive_overlap_samples,
 washer_service_overlapping_samples:m.washer_user_vs_service_door_sweep.positive_overlap_samples,
 oven_service_overlapping_samples:m.oven_open_vs_service_door_sweep.positive_overlap_samples,
 model_finished_ceiling_mm:2500};
const payload={
 schema:"TypeBOwnerReviewR1/1",status:"DESIGN_DEVELOPMENT_ONLY_NO_PURCHASE",
 source:{canonical_sha256:canonical,github_current_scene:current.scene_revision,cloud_source_scene:current.source_scene_revision,cloud_revision:55,
 A_P0_scene:A.scene_revision,B_P0_scene:B.scene_revision,
 current_snapshot_sha256:sha("render-snapshots/current.json"),
 reviewed_A_P0_sha256:sha(review+"/A-P0.json"),P0_architecture_kept:true,P1_render_only:true},
 aesthetic:{preferred:"A Calm Contemporary",fallback:"P0 existing enclosed kitchen",open_kitchen:"P1 conditional; written structural/MEP release required",
 construction_approved:false},
 approvals:reg.approval_flags,
 derived_nominal_model_metrics:metrics,
 gates,
 summary:{total:gates.length,high_priority:gates.filter(x=>x.priority===1).length,
 approved_for_construction:gates.filter(x=>x.construction_approved).length,
 physical_survey_received:false,owner_final_signoff:false},
 sources:urls
};
assert.equal(payload.summary.high_priority,12);
assert.equal(payload.summary.approved_for_construction,0);
fs.writeFileSync(out+"/OWNER_RELEASE_GATES.json",JSON.stringify(payload,null,2)+"\n");
const csvCell=t=>'"'+String(t).replaceAll('"','""')+'"';
const rows=[["ID","Area","Priority","Status","Reference measurement","Evidence required","Responsible","Source URL","Construction approval"],
...gates.map(g=>[g.id,g.room,g.priority,g.state,g.observed,g.action,g.by,g.source,"NO"])];
fs.writeFileSync(out+"/SITE_RFI_MATRIX.csv",rows.map(x=>x.map(csvCell).join(",")).join("\r\n")+"\r\n");
const cards=gates.map(g=>
 '<article class="card" data-room="'+escape(g.room)+'">'+
 '<div class="head"><span class="code">'+escape(g.id)+'</span><h3>'+escape(g.label)+'</h3><span class="status">'+(g.state==="DESIGN_REVIEW"?"تصميم مقترح":g.state==="CONDITIONAL"?"موافقة هندسية مطلوبة":"معلّق")+'</span></div>'+
 '<small>'+escape(g.room)+' · '+(g.priority===1?"أولوية تنفيذ أولى":"تطوير ومراجعة")+' · '+escape(g.grade)+'</small>'+
 '<div class="pair"><p><b>الدليل الحالي</b>'+escape(g.observed)+'</p><p><b>ما يلزم قبل الاعتماد</b>'+escape(g.action)+'</p></div>'+
 '<div class="foot"><span>المسؤول: '+escape(g.by)+'</span><a href="'+escape(g.source)+'" target="_blank" rel="noopener">فتح الدليل ↗</a></div></article>'
).join("");
const choices=[
 ["A/P0","Calm Contemporary","اتجاه الديكور المفضل، مع الاحتفاظ بشكل المطبخ الأصلي كمرجع آمن من ناحية عدم تغيير الحوائط.","design-development/reception-sprint/A-P0.json"],
 ["B/P0","Warm Contemporary","نفس توزيع الأثاث، اختلاف الخامات والإضاءة فقط؛ ليس حلًا مستقلًا لمشاكل الحركة.","design-development/reception-sprint/B-P0.json"],
 ["A/P1","Open portal concept","المطبخ شبه المفتوح مرغوب بصريًا فقط؛ فتح الحائط مشروط بتوقيع الإنشائي والمطور وMEP.","design-development/reception-sprint/A-P1-CONDITIONAL.json"],
 ["B/P1","Alternative portal finish","نفس الفتحة الافتراضية المشروطة مع ألوان وخامات B؛ غير جاهز للتنفيذ.","design-development/reception-sprint/B-P1-CONDITIONAL.json"]
].map(([id,name,desc,p])=>
 '<div class="option"><b>'+escape(id)+'</b><h3>'+escape(name)+'</h3><p>'+escape(desc)+'</p><a href="'+escape(link(p))+'" target="_blank" rel="noopener">Source snapshot ↗</a></div>'
).join("");
const template=read(root+"/release-r1/Owner-Review.template.html");
const html=template.replace("<!-- OPTIONS -->",choices).replace("<!-- GATES -->",cards)
 .replaceAll("{{VISUAL}}",urls.images).replaceAll("{{CURRENT}}",urls.current)
 .replaceAll("{{SURVEY}}",urls.survey).replaceAll("{{REGISTRY}}",urls.registry)
 .replaceAll("{{GATE_COUNT}}",String(gates.length)).replaceAll("{{PRIORITY_COUNT}}",String(payload.summary.high_priority));
assert.ok(!html.includes("<!-- GATES -->")&&!html.includes("<!-- OPTIONS -->"));
fs.writeFileSync(out+"/Owner-Review.html",html);
fs.writeFileSync(out+"/START_HERE.md",
 "# Type B · Owner Release Board R1\n\nOpen **Owner-Review.html** locally (works offline). Use the area filters and browser Print.\n\n"+
 "The CSV assigns responsible evidence and the JSON provides immutable source hashes, gates and review provenance.\n"+
 "A Calm Contemporary is a design recommendation; A/P0 is the original-architecture fallback. No procurement or construction release.\n\n"+
 "The 32 real WebGL review frames live in the independent original artifact: "+urls.images+"\n\n"+
 "Source canonical: "+canonical+". Cloud scene-4821689 and working GitHub scene-9cf45a73 are not identical.\n");
console.log(JSON.stringify({result:payload.status,gates:gates.length,high_priority:payload.summary.high_priority,construction_releases:0,artifacts:fs.readdirSync(out)}));
