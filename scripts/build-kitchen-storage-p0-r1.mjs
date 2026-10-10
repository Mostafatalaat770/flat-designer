
/* Source-locked P0 kitchen storage; deliberately not an approved cabinet design. */
import fs from "node:fs";
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
const src="design-development/reception-sprint/A-P0.json",out="review-evidence/owner-release-r1";
fs.mkdirSync(out,{recursive:true});
const bytes=fs.readFileSync(src),s=JSON.parse(bytes),reg=JSON.parse(fs.readFileSync("design-development/decision-registry.json"));
const sha=x=>createHash("sha256").update(x).digest("hex");
const canonical="734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658";
assert.equal(s.canonical_sha256,canonical);
assert.equal(s.scene_revision,"scene-9e86635b");
assert.equal(s.source_scene_revision,"scene-4821689");
assert.equal(s.storage_revision,55);
assert.deepEqual(s.layout.demolished,[]);
assert.ok(Object.values(reg.approval_flags).every(x=>x===false));
const find=id=>{
 const a=s.layout.furniture.find(f=>f.id===id)||s.layout.interior.objects.find(f=>f.id===id);
 assert.ok(a,"Missing "+id);
 return {id,w:a.w??a.width_mm,d:a.d??a.depth_mm,h:a.height_mm??null,cx:a.cx??null,cy:a.cy??null};
};
const sources=[
 ["north-upper","KIT-A1-upper-north",3],["west-small-upper","KIT-A1-upper-west-low",1],
 ["west-medium-upper","KIT-A1-upper-west-high",1],["dining-buffet","A-dining-sideboard",3],
 ["cooking-west","starter-20",0],["corner","K3-corner",0],["end-landing","K3-end-landing",0],
 ["wet-sink","K3-sink-base",0],["dishwasher","K3-dishwasher",0],["washer","K3-laundry-niche",0]
];
const cabinets=sources.map(([key,id,bays])=>{
 const v=find(id);let clear=null;
 if(bays){
  assert.ok(v.h!==null);
  clear={w:Math.round((v.w-36-(bays-1)*18)/bays*10)/10,d:v.d-36,h:v.h-36};
  assert.ok(clear.w>0&&clear.d>0&&clear.h>0);
 }
 return {key,source_id:id,exterior_mm:v,illustrative_bays:bays,
  illustrative_empty_bay_mm:clear,
  no_real_hardware_or_shelf_or_fronts:true,
  installation_clearance_certified:false};
});
const lookup=x=>cabinets.find(c=>c.key===x);
assert.deepEqual(lookup("north-upper").illustrative_empty_bay_mm,{w:576,d:294,h:664});
assert.deepEqual(lookup("dining-buffet").illustrative_empty_bay_mm,{w:642.7,d:364,h:764});
const inventory=[
 ["dinner-plates","Everyday large plates",[285,285,130],12,"dining-buffet"],
 ["mugs","Coffee mugs",[115,115,140],8,"north-upper"],
 ["small-bowls","Bowls",[240,240,145],8,"north-upper"],
 ["cooking-pan","Pan with handle",[440,310,170],2,"cooking-west"],
 ["cooking-pot","Pot and side handles",[380,320,210],2,"cooking-west"],
 ["serving-platter","Family serving platter",[330,290,85],3,"dining-buffet"],
 ["cutlery","Cutlery drawer tray",[330,250,70],1,"dining-buffet"],
 ["food-tub","Dry grocery tub",[230,175,245],5,"west-medium-upper"],
 ["spices","Spice caddy",[210,185,205],1,"west-small-upper"],
 ["food-containers","Storage containers",[280,280,220],2,"dining-buffet"],
 ["baking-tray","Baking tray",[370,300,85],2,"dining-buffet"],
 ["coffee-maker","Generic espresso machine",[320,355,355],1,"end-landing"]
].map(([id,label,size_mm,sample_quantity,proposed_unit])=>({
 id,label,size_mm,sample_quantity,proposed_unit,owner_inventory_received:false,
 product_dimensions_verified:false}));
assert.equal(inventory.length,12);
const fit=(item,cab)=>{
 if(!cab.illustrative_empty_bay_mm)return {status:"UNKNOWN_NOT_RELEASABLE",gap_mm:null};
 const a=cab.illustrative_empty_bay_mm,[w,d,h]=item.size_mm;
 const variants=[[w,d],[d,w]].map(([x,y])=>Math.min(a.w-x-20,a.d-y-20,a.h-h-20));
 const best=Math.max(...variants);
 return {status:best>=0?"SINGLE_ITEM_BOX_FIT_ONLY":"SINGLE_ITEM_BOX_FAIL",gap_mm:Math.round(best*10)/10};
};
const tests=inventory.flatMap(item=>cabinets.map(cab=>({item_id:item.id,unit:cab.key,...fit(item,cab)})));
assert.equal(tests.length,120);
const test=(item,unit)=>tests.find(z=>z.item_id===item&&z.unit===unit);
assert.equal(test("dinner-plates","north-upper").status,"SINGLE_ITEM_BOX_FAIL");
assert.equal(test("dinner-plates","dining-buffet").status,"SINGLE_ITEM_BOX_FIT_ONLY");
assert.equal(test("serving-platter","north-upper").status,"SINGLE_ITEM_BOX_FAIL");
assert.equal(test("serving-platter","dining-buffet").status,"SINGLE_ITEM_BOX_FIT_ONLY");
assert.equal(test("mugs","north-upper").status,"SINGLE_ITEM_BOX_FIT_ONLY");
assert.equal(test("cooking-pan","north-upper").status,"SINGLE_ITEM_BOX_FAIL");
assert.equal(test("cooking-pan","cooking-west").status,"UNKNOWN_NOT_RELEASABLE");
assert.equal(test("coffee-maker","end-landing").status,"UNKNOWN_NOT_RELEASABLE");
const dist=Math.round(Math.hypot(find("K3-dishwasher").cx-find("A-dining-sideboard").cx,find("K3-dishwasher").cy-find("A-dining-sideboard").cy));
assert.equal(dist,5690);
const holds=[
 ["KS01","Daily dinner plate destination","Upper depth 294mm is below 285mm + 20mm test buffer; buffet one-item test fits but needs a real transfer route","Measure actual plates; consider verified deep undercounter drawer only after oven and door are resolved"],
 ["KS02","West cooking storage","West counter source is 1500x600; cooktop/oven prevent counting all footprint as drawers","Obtain qualified maker hob/oven installation and remaining real drawer clear W/D/H"],
 ["KS03","Corner and sink areas","600x590 corner hardware unknown; 600x610 sink area occupied by waste/supply pipes","Select real corner hinge/tray; measure service and cleaning-bin serviceable zones"],
 ["KS04","Coffee station","600x410 landing is a nominal counter, not a powered coffee cabinet; fridge door use unknown","Check actual coffee machine width/depth/height, steam reach, grounded power and fridge drawer clearance"],
 ["KS05","Dry pantry","K4 tall 600mm pantry and island are NOT part of source A/P0; 2.98m3 K4 comparison cannot be claimed","Inventory groceries in actual home; size all dry cabinets after drawer/hardware subtraction"],
 ["KS06","Six-person dining and buffet","2000x400x800mm buffet, but chair-pullout and open-door operating lane still unapproved","Full-size six-person dining mockup with buffet doors and serving trays"],
 ["KS07","Upper cupboard accessibility","Wall upper fixed model height is not as-built reach or verified anchor strength","Field finished heights, safe heavy dish placement, wall anchors and actual upper doors"]
].map(([id,title,reason,needed])=>({id,title,reason,needed,status:"HOLD",construction_approved:false}));
const report={
 schema:"TypeBP0KitchenStorageR1/1",status:"DESIGN_SAMPLE_NOT_INVENTORY_OR_CONSTRUCTION_RELEASE",
 source:{file:src,sha256:sha(bytes),canonical_sha256:canonical,scene:s.scene_revision,cloud_scene:s.source_scene_revision,cloud_rev:55},
 assumptions:{panel_mm:18,assumed_rear_mm:18,assumed_front_mm:18,assumed_minimum_item_edge_mm:10,
 shelf_assemblies_verified:false,door_clearances_verified:false,real_family_stocktake_received:false,
 real_appliance_installation_drawings_received:false,mixed_item_quantity_packing_tested:false,
 K4_island_and_pantry_not_part_of_P0:true,actual_working_route_distance_tested:false},
 kitchen_to_buffet_straight_line_mm:dist,
 cabinets,illustrative_item_inventory:inventory,one_item_box_tests:tests,site_holds:holds,
 conclusion:"Keep upper for cups/small bowls/light food; do not assume 285mm plates fit 330mm-deep nominal upper. Buffet may hold large plates but is not as near the DW. West cooking-base pans/drawers and corner remain unknown pending real manufacturer and joinery openings.",
 safety:{source_modified:false,fabrication_approved:false,owner_approved:false,K4_storage_claim_reused:false}
};
fs.writeFileSync(out+"/P0_KITCHEN_STORAGE_R1.json",JSON.stringify(report,null,2)+"\n");
const csv=rows=>rows.map(row=>row.map(x=>'"'+String(x??"").replaceAll('"','""')+'"').join(",")).join("\r\n")+"\r\n";
fs.writeFileSync(out+"/P0_KITCHEN_120_CASES.csv",csv([
 ["Item","Example object mm","Unit","Nominal single box status","Critical gap mm","Claim that quantity fits?"],
 ...tests.map(t=>[t.item_id,inventory.find(v=>v.id===t.item_id).size_mm.join(" × "),t.unit,t.status,t.gap_mm,"NO"])
]));
fs.writeFileSync(out+"/P0_KITCHEN_SITE_RFI.csv",csv([
 ["ID","Issue","Reason","What to verify","Release"],
 ...holds.map(g=>[g.id,g.title,g.reason,g.needed,"HOLD"])
]));
const enc=x=>String(x).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
const swatches=inventory.map(item=>{
 const t=test(item.id,item.proposed_unit),desc=lookup(item.proposed_unit).source_id;
 return '<tr><td><strong>'+enc(item.label)+'</strong><small>'+item.size_mm.join(" × ")+' mm · sample count '+item.sample_quantity+'</small></td><td>'+enc(desc)+'</td><td class="'+(t.status==="SINGLE_ITEM_BOX_FIT_ONLY"?"pass":"hold")+'">'+enc(t.status)+'</td><td>No — sample box only</td></tr>';
}).join("");
const rfi=holds.map(x=>'<article class="rfi"><h3>'+x.id+' · '+enc(x.title)+'</h3><p>'+enc(x.reason)+'</p><p><b>On-site request:</b> '+enc(x.needed)+'</p></article>').join("");
const html='<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Type B P0 · Kitchen Storage</title><style>'+
':root{--bg:#f8f7f3;--ink:#293d32;--edge:#dce1d9}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.75 system-ui,Arial,sans-serif}main{max-width:1150px;padding:26px 20px 70px;margin:auto}h1{font-size:clamp(32px,4vw,50px);line-height:1.18}h2{margin-top:36px}header{padding:30px 0}header p{font-size:18px;color:#536759}.tag{font-size:12px;color:#61806f;letter-spacing:.08em}.notice{background:#e9eee8;border-right:4px solid #526e61;padding:22px}.metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:22px 0}.metric,.rfi{background:#fff;border:1px solid var(--edge);padding:16px}.metric b{display:block;font-size:25px}.metric small{font-size:12px;color:#6b796e}table{width:100%;background:white;border-collapse:collapse}td,th{border:1px solid var(--edge);padding:10px;text-align:right;vertical-align:top}td small{display:block;color:#728275;font-size:11px}th{background:#e8ede8}.pass{color:#426751}.hold{color:#9e6246}.cards{display:grid;grid-template-columns:1fr 1fr;gap:12px}.rfi h3{margin:0 0 10px}.rfi p{margin:7px 0}.pic{width:100%;height:auto;background:white;border:1px solid var(--edge)}a{color:#356950;margin-left:12px}footer{margin-top:45px;border-top:1px solid var(--edge);font-size:12px;color:#68746b;padding-top:13px}@media(max-width:800px){.metrics,.cards{grid-template-columns:1fr 1fr}table{display:block;overflow:auto}}@media(max-width:520px){.metrics,.cards{grid-template-columns:1fr}}</style></head><body><main>'+
'<header><small class="tag">OPTION A / P0 / REAL SOURCE · NOT FOR FABRICATION</small><h1>هنحط حاجتنا فين فعلًا؟</h1><p>توزيع الاستخدام اليومي على وحدات المطبخ الموجودة فعلًا. من غير ما نحسب جزيرة K4 أو البانتري القديم، ومن غير ما ندّعي سعة تخزين من رسم ديكور.</p></header>'+
'<section class="metrics"><div class="metric"><b>12</b><small>نوع عينة افتراضية</small></div><div class="metric"><b>120</b><small>اختبار صندوق واحد فقط</small></div><div class="metric"><b>7</b><small>قرارات نجارة معلّقة</small></div><div class="metric"><b>0</b><small>سعات/تصنيع معتمدة</small></div></section>'+
'<div class="notice"><b>المشكلة:</b> دولاب علوي 330 مم عمق خارجي = 294 مم عمق صندوق داخلي نظري (18 مم ضهر + 18 مم وجه). طبق 285 مم مع هامش تجريبي 10 مم لكل ناحية محتاج 305 مم، فمش هنحطه هناك بناءً على الرسم. بوفيه السفرة 400 مم عمق خارجي = 364 مم داخلي نظري وقد يستوعب الطبق منفردًا، لكنه بعيد عن غسالة الأطباق بحوالي '+dist+' مم بخط مستقيم على المسقط (مش طول طريق المشي).</div>'+
'<h2>نفس الريسبشن والمطبخ الحالي</h2><img class="pic" src="visuals/AB-P0-contact.png" alt="Reference A P0 WebGL"><p>مقارنة WebGL أصلية؛ ما غيرناش هندسة الشقة.</p>'+
'<h2>مكان كل نوع أدوات — قرار أولي</h2><table><thead><tr><th>الحاجة</th><th>مكانها الافتراضي</th><th>حالة التجربة</th><th>الكمية كلها هتسع؟</th></tr></thead><tbody>'+swatches+'</tbody></table>'+
'<h2>قائمة عمل النجار والمهندس</h2><div class="cards">'+rfi+'</div>'+
'<h2>البيانات الأصلية</h2><p><a href="P0_KITCHEN_STORAGE_R1.json">JSON كامل</a><a href="P0_KITCHEN_120_CASES.csv">120 اختبار CSV</a><a href="P0_KITCHEN_SITE_RFI.csv">طلبات القياس CSV</a><a href="Owner-Review.html">مراجعة الشقة</a></p>'+
'<footer>Verified source A/P0 scene-9e86635b · cloud scene-4821689 v55 · canonical Type B SHA '+canonical+'. Illustrative object sizes, 18mm panels and 10mm hypothetical item margins are NOT site measurements, real product dimensions, joint packed capacity or construction approval.</footer></main></body></html>';
fs.writeFileSync(out+"/P0-Kitchen-Storage.html",html);
assert.ok(html.includes("visuals/AB-P0-contact.png"));
assert.equal(holds.length,7);
console.log(JSON.stringify({source:report.source.sha256,items:inventory.length,tests:tests.length,gates:holds.length,
 upper_depth:lookup("north-upper").illustrative_empty_bay_mm.d,
 buffet_depth:lookup("dining-buffet").illustrative_empty_bay_mm.d,
 plate_upper:test("dinner-plates","north-upper"),plate_buffet:test("dinner-plates","dining-buffet"),
 files:["P0-Kitchen-Storage.html","P0_KITCHEN_STORAGE_R1.json","P0_KITCHEN_120_CASES.csv","P0_KITCHEN_SITE_RFI.csv"]}));
