/**
 * Finish R1: a genuinely source-pinned DESIGN package, not a contractor issue.
 *
 * Reads Option A/P0 and already SHA-verified source WebGL contact sheets from
 * build-owner-release-r1.mjs. Distinguishes selected visual directions from
 * generic color proxies and missing site/vendor information. No scene writes.
 */
import fs from "node:fs";
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {createApartmentDomain} from "../studio/domain/apartment.mjs";
const read=p=>fs.readFileSync(p,"utf8");
const obj=p=>JSON.parse(read(p));
const digest=p=>createHash("sha256").update(fs.readFileSync(p)).digest("hex");
const dest="review-evidence/owner-release-r1";
const ref="design-development/reception-sprint/A-P0.json";
const source=obj(ref),review=obj(dest+"/OWNER_RELEASE_GATES.json");
const registry=obj("design-development/decision-registry.json");
const domain=createApartmentDomain(process.cwd());
assert.equal(source.scene_revision,"scene-9e86635b");
assert.equal(source.source_scene_revision,"scene-4821689");
assert.equal(source.storage_revision,55);
assert.equal(source.canonical_sha256,"734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658");
assert.equal(source.canonical_sha256,domain.model.canonical_sha256);
assert.equal(domain.revision(source.layout),source.scene_revision);
assert.equal(review.source.reviewed_A_P0_sha256,digest(ref));
assert.ok(Object.values(registry.approval_flags).every(v=>v===false));
assert.deepEqual(source.layout.demolished,[]);
const find=id=>{let x=source.layout.furniture.find(f=>f.id===id)||source.layout.interior.objects.find(f=>f.id===id);assert.ok(x,"missing source id "+id);return x;};
const cm=x=>x==="RECP-01"?"Reception / Dining":"Kitchen";
const mats=Object.fromEntries(source.layout.interior.materials.map(x=>[x.id,x]));
const intent=[
 ["F01","Main reception mineral wall","S1-ivory","RECP-01","Prototype A warm neutral; assess wipeability and grazing-light imperfections","Paint full wall patches under daylight and 3000K; confirm actual paint system"],
 ["F02","Public mineral/porcelain-look surface","S1-stone","RECP-01","Quiet large-area base; low movement, avoid busy veining","Choose supplier sample only after resolving floor preset conflict and slip/cleaning/format"],
 ["F03","Kitchen wet-cleanable surface","S1-stone","KIT-01","Visually same stone tone possible, but actual P0 threshold and fall can require a different certified tile","Kitchen tile sample, grout, slip rating and kitchen-door transition"],
 ["F04","Sideboard and TV furniture oak tone","S1-oak","RECP-01","Soft natural oak with flat/washable lacquer or veneer direction","Veneer/laminate edge sample, fingerprints, sunlight ageing and workshop edge detail"],
 ["F05","Six-seat upholstered chair textile","S1-linen","RECP-01","Mushroom woven neutral; six source chairs identical in geometry","Supplier fabric abrasion/cleanability, stain swatch and 1:1 comfortable seated test"],
 ["F06","Living armchair olive accent",null,"RECP-01","Existing single chair color #7D856F from source furniture proxy","Physical upholstery swatch viewed alongside oak and stone, avoid more unrelated accent colors"],
 ["F07","Kitchen painted upper/lower faces","kitchen-soft-ivory","KIT-01","Warm-ivory low-gloss smooth surfaces, no unnecessary fluting over cooking area","Real lacquer/laminate + edge tolerance, water, heat and grease test"],
 ["F08","Kitchen worktop and backsplash","kitchen-warm-quartz","KIT-01","Quiet warm low-pattern slab, easy cleaning and protected sink seam","Actual quartz/porcelain product specification, heat/food suitability, edge profile and sealant"],
 ["F09","Curtain warm linen","a2-curtain-linen","RECP-01","Layered light/blackout privacy possible; full-height glazing must remain unchanged","Track/AC and clearance, wash/shrinkage, nighttime privacy and sunlight test"],
 ["F10","Public ceiling soft white","a2-ceiling-softwhite","RECP-01","Ultra-matte quiet ceiling, **2500mm finished clear height locked**","No invented gypsum void; approve fixture mounting services and maintenance"]
].map(([id,name,material_id,room,intention,approval])=>{
 const m=material_id?mats[material_id]:null;
 assert.ok(!material_id||m,"missing palette material "+material_id);
 return {id,name,material_id,room,intention,approval,color:m?.base_colour??"#7D856F",visual_finish:m?.finish??"matte",
  provenance:material_id?"EXISTING_SOURCE_GENERIC_MATERIAL":"EXISTING_SOURCE_FURNITURE_COLOR",
  purchased:false,selected_supplier:null};
});
assert.equal(intent.length,10);
for(const x of intent)assert.ok(/^#[a-fA-F0-9]{6}$/.test(x.color));
const surface=source.layout.interior.surface_materials;
const decorated=source.layout.decor.saved[source.layout.decor.active].rooms;
// Verify the ACTUAL production renderer precedence, not merely the JSON
// vocabulary. The explicit interior floor material is the winning 3D layer.
// If builders.js changes its precedence, fail instead of silently pricing tiles.
const buildRenderer=read("studio/renderer/builders.js");
const floorSourcePattern=/interiorSurfaceMaterial\s*\(\s*"FLOOR-"\s*\+\s*r\.id\s*,\s*floorMat\s*\(\s*state\.rooms\[r\.id\]\.mat\s*\)\s*,\s*"floor"\s*,?\s*\)/;
const surfaceOverridePattern=/const material = state\.interior\?\.surface_materials\[id\];\s*if \(!material\) return fallback;/;
assert.match(buildRenderer,floorSourcePattern,"3D production floor source precedence changed");
assert.match(buildRenderer,surfaceOverridePattern,"3D explicit-surface-over-fallback precedence changed");
const floors=["RECP-01","KIT-01"].map(room=>{
 const key="FLOOR-"+room;
 const srcMaterial=surface[key],roomFallback=source.layout.rooms[room].mat,decorPreset=decorated[room];
 assert.equal(srcMaterial,"S1-stone");
 assert.ok(mats[srcMaterial],"Renderer-referenced surface material must be in the material catalogue");
 assert.equal(roomFallback,decorPreset,"Preset and room fallback expected to be aligned");
 assert.notEqual(srcMaterial,roomFallback,"Known legacy layer mismatch must remain disclosed");
 return {room,interior_surface_material_id:srcMaterial,room_state_fallback_material_id:roomFallback,
   active_decor_preset_material_id:decorPreset,assignment_mismatch:true,
   rendered_material_id:srcMaterial,rendered_material_status:"PRODUCTION_RENDERER_CODE_PRECEDENCE_VERIFIED",
   rendering_precedence:"interior.surface_materials[FLOOR-room] -> otherwise layout.rooms[room].mat -> generic floorMat fallback",
   original_renderer_source:"studio/renderer/builders.js buildArch/interiorSurfaceMaterial",
   product_name:"Quiet limestone-look porcelain (generic shader; no SKU)",
   nominal_colour_hex:mats[srcMaterial].base_colour, actual_vendor_product_selected:false,
   material_for_boQ:null,
   required_action:"Renderer resolved to S1-stone, but field floor levels, tested tile sample, slip/grout transitions, manufacturer data and owner approval still pending"};
});
assert.deepEqual(floors.map(z=>z.active_decor_preset_material_id),["lightoak","tile800"]);
assert.ok(floors.every(z=>z.rendered_material_id==="S1-stone"&&z.material_for_boQ===null));
const isDim=(id,w,d)=>{const f=find(id);assert.equal(f.w??f.width_mm,w);assert.equal(f.d??f.depth_mm,d);return f};
const table=isDim("starter-35",2000,950);
const sofa=isDim("starter-28",2880,990);
const tv=isDim("starter-30",1800,380);
const buffet=isDim("A-dining-sideboard",2000,400);
assert.equal(buffet.height_mm,800);
const shoe=isDim("starter-40",700,240);
const upper=isDim("KIT-A1-upper-north",1800,330);
assert.equal(upper.height_mm,700);
const ovenRun=isDim("starter-20",1500,600);
const DW=isDim("K3-dishwasher",600,610);
const washer=isDim("K3-laundry-niche",600,610);
const chandelierNote="OPTIONAL ONLY: B's slim pendant; physical table-head height and glare trial, NEVER a committed ceiling fixture";
const joinery=[
 {id:"J01",room:"RECP-01",name:"Dining buffet",source_id:buffet.id,width_mm:buffet.width_mm,depth_mm:buffet.depth_mm,height_mm:buffet.height_mm,
 finish:"S1-oak",status:"DESIGN_ONLY",intent:"Closed wipe-clean family storage, visually continuous fronts and restrained shadow reveal, avoid busy slats",
 hinges:"TBD",front_breaks:"TBD",actual_internal_shelves:"TBD",fittings:"TBD",clearance:"Open front and six chairs; exact source +350mm buffet/chair gap 785mm nominal",
 check:"Wall alignment/fixing, real usable storage inventory, clear aperture, furniture door-open footprint"},
 {id:"J02",room:"RECP-01",name:"TV console",source_id:tv.id,width_mm:tv.w,depth_mm:tv.d,height_mm:null,
 finish:"S1-oak",status:"DESIGN_ONLY",intent:"Keep source 1800mm footprint, reduce dust-catching slat detail only after design/owner approval; no new false cupboard",
 hinges:"TBD",front_breaks:"TBD",actual_internal_shelves:"TBD",fittings:"TBD",clearance:"TV and AC above remain in actual layout",
 check:"TV cable ventilation, service hatches, screen centre height, actual height still TBD"},
 {id:"J03",room:"RECP-01",name:"Shoe storage placeholder",source_id:shoe.id,width_mm:shoe.w,depth_mm:shoe.d,height_mm:null,
 finish:"S1-oak",status:"RETHINK_BEFORE_JOINERY",intent:"Nominal model 700x240, not real SKU or six-pair capacity; consider daily shoe storage only",
 hinges:"TBD",front_breaks:"TBD",actual_internal_shelves:"TBD",fittings:"TBD",clearance:"Open user vs six chairs +450 = only 15mm nominal; no bypass assumption",
 check:"Family inventory, actual depth with tilt leaf/user, wall anchor and real entry-door sweep"},
 {id:"J04",room:"KIT-01",name:"Kitchen north upper",source_id:upper.id,width_mm:upper.width_mm,depth_mm:upper.depth_mm,height_mm:upper.height_mm,
 finish:"kitchen-soft-ivory",status:"DESIGN_ONLY",intent:"Quiet matte closed door fronts, easy-wipe hinge setup; source exterior 1800x330x700",
 hinges:"TBD",front_breaks:"TBD",actual_internal_shelves:"TBD",fittings:"TBD",clearance:"Original model wall placement elevation_mm 1480; DO NOT treat as approved install/underside height",
 check:"Actual wall anchor, hood/vent coverage, cleanable accessible shelves, human reach at 2.5m ceiling"},
 {id:"J05",room:"KIT-01",name:"West cooking run with reserved under-hob oven",source_id:ovenRun.id,width_mm:ovenRun.w,depth_mm:ovenRun.d,height_mm:null,
 finish:"kitchen-soft-ivory",status:"ENGINEERING_HOLD",intent:"1500x600 model counter, stove fixed; under-hob oven access is a conditional study only",
 hinges:"TBD",front_breaks:"TBD",actual_internal_shelves:"TBD",fittings:"TBD",clearance:"Gas/hob/oven maker compatibility and service-door clearance required",
 check:"Qualified first-fix, oven recess and ventilation, heat/fire, drawer displacement, actual integrated appliance"},
 {id:"J06",room:"KIT-01",name:"Dishwasher and laundry bays",source_id:DW.id,width_mm:DW.w,depth_mm:DW.d,height_mm:null,
 finish:"kitchen-soft-ivory",status:"ENGINEERING_HOLD",intent:"Source both 600mm nominal boxes; not verified finished clear manufacturer installation cavities",
 hinges:"TBD",front_breaks:"TBD",actual_internal_shelves:"TBD",fittings:"TBD",clearance:"Bosch genuine integrated DW needs 600mm CLEAR width and 815-875mm height; full 1150mm open depth; laundry door/terrace conflict",
 check:"Finished apertures, exact SKU cutout, inlet/drain/accessibility, plinth fronts and appliance extraction"}
];
assert.equal(joinery.length,6);
// Nominal usable clear-box PROTOTYPE only; all 18mm widths/panels/backs,
// doors, dividers and shelf allocations below are explicitly ASSUMED.
// Never present computed volume as actual usable storage or shop-drawing size.
const internals=[
 {id:"I01",corresponding_unit:"J01",source_id:"A-dining-sideboard",
  source_external_mm:{w:2000,d:400,h:800},
  assumed_panel_mm:18,assumed_side_panels:2,assumed_internal_partitions:2,
  assumed_top_bottom_panels:2,assumed_back_mm:18,assumed_front_allowance_mm:18,
  nominal_bays:3,
  sample_cubby_function:["Dining plates and serving bowls","Cutlery, napkins and frequently used tableware","Occasional hosting and low-frequency glassware"],
  supplier_holds:["Real shelf thickness/spacing and drawer runners","Front swing vs all six chairs and buffet service access","Anchoring, usable clearances and weight of crockery","Actual buffet clearance is a polygon simulation only"]},
 {id:"I02",corresponding_unit:"J04",source_id:"KIT-A1-upper-north",
  source_external_mm:{w:1800,d:330,h:700},
  assumed_panel_mm:18,assumed_side_panels:2,assumed_internal_partitions:2,
  assumed_top_bottom_panels:2,assumed_back_mm:18,assumed_front_allowance_mm:18,
  nominal_bays:3,
  sample_cubby_function:["Everyday cups and mugs near sink (location must be confirmed)","Tea, coffee, lightweight dry goods","Less-used tableware; never heavy objects at difficult reach"],
  supplier_holds:["Source notes a 40mm blind-corner relief at west junction, not deducted from calculation","Wall fixing strength, actual finished clearance and reachable shelf heights","Hood/service access and grease cleanup","No manufacturer hardware or usable storage capacity validated"]}
].map(x=>{
 const {w,d,h}=x.source_external_mm,p=x.assumed_panel_mm;
 const internalWidth=w-p*x.assumed_side_panels-p*x.assumed_internal_partitions;
 const usableD=d-x.assumed_back_mm-x.assumed_front_allowance_mm;
 const usableH=h-p*x.assumed_top_bottom_panels;
 assert.ok(internalWidth>0&&usableD>0&&usableH>0);
 return {...x,illustrative_clear_per_bay_mm:{
   w:Math.round(internalWidth/x.nominal_bays*10)/10,d:usableD,h:usableH},
  illustrative_empty_volume_l:Math.round((internalWidth*usableD*usableH/1e6)*10)/10,
  limit:"Bare geometric upper-bound based only on assumed panels; not actual shelves or certified storage capacity",
  actual_hardware_selected:false,approved_for_fabrication:false};
});
assert.equal(internals.length,2);
assert.deepEqual(internals.map(x=>x.illustrative_clear_per_bay_mm.w),[642.7,576]);
assert.deepEqual(internals.map(x=>x.illustrative_clear_per_bay_mm.d),[364,294]);
const lighting=[
 {id:"L01",zone:"Reception general",source_condition:"Source room lighting=track-lamps, 3000K; no as-built circuit",
 design:"Low-glare aimable ambient track/spot layers without lowering the already 2500mm net ceiling",
 fixture_count:null,lumens:null,wattage:null,beam_angle:null,mounting_height:null,authority:"Qualified lighting electrician/MEP",gate:"Mounting and circuit route, artwork aiming, wall wash and controlled evening mockup"},
 {id:"L02",zone:"Sofa reading",source_condition:"Existing S1-reading-lamp floor fixture model H1500",
 design:"Keep a warm local reading/relax layer; avoid overlighting left wall or TV reflections",
 fixture_count:1,lumens:null,wattage:null,beam_angle:null,mounting_height:null,authority:"Owner + lighting consultant",gate:"Task comfort and socket placement, dimming, children/cord clearance"},
 {id:"L03",zone:"Dining table",source_condition:"A keeps ceiling clear; B has conditional linear pendant",
 design:chandelierNote,
 fixture_count:null,lumens:null,wattage:null,beam_angle:null,mounting_height:null,authority:"Owner + lighting consultant",gate:"Real 2000x950 table, seated sight lines, head clearance, glare; 2500mm ceiling"},
 {id:"L04",zone:"Buffet/artwork accent",source_condition:"Existing V5-sideboard-lamp H400, artwork model 1200x650",
 design:"Gentle controlled art/serving glow; no new electrical cut unless wiring checked",
 fixture_count:1,lumens:null,wattage:null,beam_angle:null,mounting_height:null,authority:"Owner + electrician",gate:"Art illumination, tabletop cable paths, dimmer and shadow testing"},
 {id:"L05",zone:"Kitchen ambient",source_condition:"Source room lighting=downlights, 3000K; model brightness 82 is not lux",
 design:"Task-first general light aimed away from shine on quartz and direct glare at glazing",
 fixture_count:null,lumens:null,wattage:null,beam_angle:null,mounting_height:null,authority:"Qualified MEP",gate:"Electrical circuit, vapor/grease protection and real ceiling mounting space"},
 {id:"L06",zone:"Kitchen counter task",source_condition:"Optional idea; no selected under-cabinet fixture or circuit",
 design:"Diffuse under-upper cabinet strip only if cleanable, serviceable and heat/damp appropriate",
 fixture_count:null,lumens:null,wattage:null,beam_angle:null,mounting_height:null,authority:"Kitchen joiner + MEP",gate:"Wire service before cabinets, glare over sink and hob, local electrical protection"},
 {id:"L07",zone:"Bedrooms/hall",source_condition:"Current v55 unedited",
 design:"Warm dimmable layers and soft night navigation, blackout/privacy priority in bedrooms",
 fixture_count:null,lumens:null,wattage:null,beam_angle:null,mounting_height:null,authority:"Owner + electrician",gate:"Bedside outlet reach, safe switches and actual wardrobe/access"},
 {id:"L08",zone:"Wet rooms",source_condition:"Walk-in aesthetic M0/F1 retained only",
 design:"Shadow-free mirror task lighting and easy-clean wet-zone lighting; no fake IP rating or wiring layout",
 fixture_count:null,lumens:null,wattage:null,beam_angle:null,mounting_height:null,authority:"Qualified wet-area MEP",gate:"Wet-zone fixture rating, local code, safe isolation, actual ceiling and waterproofing"}
];
assert.equal(lighting.length,8);
const lightingScenes=[
 {name:"Everyday home",layers:["L01","L02","L05","L06"],intent:"Gentle ambient + sofa task + kitchen worktop; no fixed dimmer percentages"},
 {name:"Dinner with family or guests",layers:["L01","L03","L04","L05"],intent:"Comfortable six-person dining, soft buffet accent and safe kitchen food work"},
 {name:"TV / relaxing",layers:["L02","L04"],intent:"Low reflection, sofa/task lighting and optional indirect accent; screen reflections must be tested"},
 {name:"Night path",layers:["L07","L08"],intent:"Soft accessible navigation without opening additional walls; verify real switch routes and wet safety"}
].map(x=>({...x,programmed:false,physical_circuit_approved:false,brightness_percent:null}));
assert.equal(lightingScenes.length,4);
assert.equal(source.layout.studio.rooms["RECP-01"].temperature,3000);
assert.equal(source.layout.studio.rooms["KIT-01"].temperature,3000);
assert.ok(lighting.every(z=>z.lumens===null&&z.wattage===null));
const design={
 schema:"TypeBFinishAndLightingR1/1",status:"DESIGN_INTENT_NOT_SHOP_DRAWINGS",
 provenance:{source_snapshot:ref,source_sha256:digest(ref),canonical_sha256:source.canonical_sha256,
  source_scene:source.scene_revision,cloud_scene:source.source_scene_revision,net_ceiling_mm:2500},
 design_direction:"A Calm Contemporary",material_samples:intent,source_floor_conflicts:floors,
 reference_dimensions:{dining_table_mm:[table.w,table.d],sofa_mm:[sofa.w,sofa.d],
  tv_console_mm:[tv.w,tv.d],buffet_mm:[buffet.width_mm,buffet.depth_mm,buffet.height_mm],
  shoe_unit_model_only_mm:[shoe.w,shoe.d],kitchen_north_upper_mm:[upper.width_mm,upper.depth_mm,upper.height_mm],
  oven_run_mm:[ovenRun.w,ovenRun.d],DW_nominal_box_mm:[DW.w,DW.d],washer_nominal_box_mm:[washer.w,washer.d]},
 joinery,illustrative_joinery_internal_prototypes:internals,lighting,lighting_scenes:lightingScenes,
 safety:{source_geometry_modified:false,wall44_demolition_authorized:false,actual_products_purchased:false,
  designer_sample_signoff:false,first_fix_or_covered_ceilings_authorized:false,
  actual_floor_boQ_released:false}
};
fs.writeFileSync(dest+"/FINISH_AND_JOINERY_R1.json",JSON.stringify(design,null,2)+"\n");
const csv=rows=>rows.map(row=>row.map(cell=>'"'+String(cell??"").replaceAll('"','""')+'"').join(",")).join("\r\n")+"\r\n";
fs.writeFileSync(dest+"/FINISH_SAMPLES.csv",csv([
 ["ID","Area","Material generic ID","Visual color ONLY","Visual finish","Intent","Supplier approval needed","Approved for procurement"],
 ...intent.map(x=>[x.id,x.room,x.material_id??"Source chair visual",x.color,x.visual_finish,x.intention,x.approval,"NO"])
]));
fs.writeFileSync(dest+"/JOINERY_INTENT.csv",csv([
 ["ID","Source object","Name","Exterior width mm","Exterior depth mm","Exterior height mm or TBD","Finish ID","Status","Shop drawing / operation gate"],
 ...joinery.map(j=>[j.id,j.source_id,j.name,j.width_mm,j.depth_mm,j.height_mm??"TBD",j.finish,j.status,j.check])
]));
fs.writeFileSync(dest+"/JOINERY_INTERNAL_PROTOTYPES.csv",csv([
 ["ID","Unit source","Assumption panel thickness mm","Assumed dividers","Illustrative empty bay clear W mm","Clear D mm","Clear H mm","Bare geometric sum liters NOT USABLE CAPACITY","Actual approval"],
 ...internals.map(x=>[x.id,x.source_id,x.assumed_panel_mm,x.assumed_internal_partitions,x.illustrative_clear_per_bay_mm.w,x.illustrative_clear_per_bay_mm.d,x.illustrative_clear_per_bay_mm.h,x.illustrative_empty_volume_l,"NO"])
]));
fs.writeFileSync(dest+"/LIGHTING_SCENES.csv",csv([
 ["Scene","Layer IDs","Intent","Actually wired/programmed?"],
 ...lightingScenes.map(x=>[x.name,x.layers.join(" + "),x.intent,"NO"])
]));
fs.writeFileSync(dest+"/LIGHTING_INTENT.csv",csv([
 ["ID","Zone","Existing source lighting status","Design layer","Fixture count or TBD","Beam/lux/power specified?","Electrician/owner check"],
 ...lighting.map(x=>[x.id,x.zone,x.source_condition,x.design,x.fixture_count??"TBD","NO",x.gate])
]));
const hex=x=>/^#[\da-f]{6}$/i.test(x)?x:"#ccc";
const swatch=intent.map(x=>'<div class="swatch"><div class="color" style="background:'+hex(x.color)+'"></div><b>'+x.name+'</b><small>'+x.color+' · '+x.material_id+'</small><p>'+x.intention+'</p></div>').join("");
const joinCards=joinery.map(j=>'<article class="unit"><div class="number">'+j.id+'</div><div><h3>'+j.name+'</h3><p>'+j.width_mm+' × '+j.depth_mm+' × '+(j.height_mm??"TBD")+' mm <small>(W × D × H)</small></p><p>'+j.intent+'</p><small>'+j.status+' · '+j.check+'</small></div></article>').join("");
const lightCards=lighting.map(x=>'<article class="light"><b>'+x.id+' · '+x.zone+'</b><p>'+x.design+'</p><small>'+x.source_condition+'</small><small> / '+x.gate+'</small></article>').join("");
const prototypes=internals.map(x=>'<article class="unit"><div class="number">'+x.id+'</div><div><h3>Assumption-based '+x.source_id+'</h3><p>Model external '+x.source_external_mm.w+'×'+x.source_external_mm.d+'×'+x.source_external_mm.h+' mm</p><p>Three empty bays ~'+x.illustrative_clear_per_bay_mm.w+' × '+x.illustrative_clear_per_bay_mm.d+' × '+x.illustrative_clear_per_bay_mm.h+' mm each <b>(assuming 18mm panels/back/front)</b></p><small>Not usable capacity, not shop drawing. Real shelf, hardware, blind corner, wall anchorage and door swing TBD.</small></div></article>').join("");
const sceneCards=lightingScenes.map(x=>'<article class="light"><b>'+x.name+'</b><p>'+x.intent+'</p><small>Concept layers: '+x.layers.join(' + ')+' · NOT actual wiring or presets</small></article>').join("");
const template=read("design-development/release-r1/Finishes-and-Joinery.template.html");
let final=template.replace("<!-- SWATCHES -->",swatch).replace("<!-- JOINERY -->",joinCards).replace("<!-- LIGHTS -->",lightCards).replace("<!-- INTERNALS -->",prototypes).replace("<!-- SCENES -->",sceneCards);
assert.ok(!final.includes("<!-- SWATCHES -->")&&!final.includes("<!-- JOINERY -->")&&!final.includes("<!-- LIGHTS -->")&&!final.includes("<!-- INTERNALS -->")&&!final.includes("<!-- SCENES -->"));
fs.writeFileSync(dest+"/Finishes-and-Joinery.html",final);
function dim(a,b,y,desc){return '<line x1="'+a+'" y1="'+y+'" x2="'+b+'" y2="'+y+'" stroke="#5a6b61" stroke-width="1.4"/><path d="M'+a+' '+(y-7)+'v14 M'+b+' '+(y-7)+'v14" stroke="#5a6b61"/><text x="'+((a+b)/2)+'" y="'+(y-9)+'" font-size="16" text-anchor="middle">'+desc+'</text>';}
function elevBox(x,y,w,h,label,id,width,depth,height){
 const scale=620/w,drawnW=w*scale,drawnH=height?height*scale:135;
 const hx=x+drawnW,yy=y-drawnH;
 let out='<rect x="'+x+'" y="'+yy+'" width="'+drawnW+'" height="'+drawnH+'" fill="#c1aa8b" fill-opacity=".4" stroke="#506458" stroke-width="2"/>';
 if(!height)out+='<text x="'+(x+16)+'" y="'+(yy+25)+'" fill="#915e48" font-size="14">Height TBD - NOT TO SCALE</text>';
 out+=dim(x,hx,y+32,width+' mm SOURCE');
 out+='<text x="'+x+'" y="'+(y+60)+'" font-size="15">'+id+' · Depth '+depth+' mm · Height '+(height??"TBD")+'</text>';
 out+='<text x="'+x+'" y="'+(y+81)+'" font-size="16" font-weight="bold">'+label+'</text>';
 return out;
}
let svg='<svg xmlns="http://www.w3.org/2000/svg" width="1520" height="1130" viewBox="0 0 1520 1130"><rect width="100%" height="100%" fill="#f8f6f1"/><g font-family="Arial" fill="#31433a"><text x="65" y="55" font-size="31" font-weight="bold">Type B · Concept joinery · Source footprint dimensions</text><text x="65" y="85" font-size="17">Exterior objects only, not fabricated apertures. Dashed subdivision concepts intentionally omitted.</text>';
svg+=elevBox(65,440,2000,800,"Dining buffet · real height from model","A-dining-sideboard",2000,400,800);
svg+=elevBox(840,440,1800,0,"TV console · height requires workshop drawing","starter-30",1800,380,null);
svg+=elevBox(65,940,1800,700,"Kitchen north upper · real modeled height","KIT-A1-upper-north",1800,330,700);
svg+=elevBox(840,940,700,0,"Entry shoe cabinet · product/hinge unverified","starter-40",700,240,null);
svg+='<text x="65" y="1080" font-size="17">PR68 A/P0 source locked · ceiling 2500mm · no drilling, shop drawings, gas/plumbing or purchases approved.</text></g></svg>';
fs.writeFileSync(dest+"/JOINERY_CONCEPT_ELEVATIONS.svg",svg);
console.log(JSON.stringify({status:design.status,colors:intent.length,joinery:joinery.length,lighting:lighting.length,
 floor_assignment_conflicts:floors.length,source_sha256:design.provenance.source_sha256,
 files:["Finishes-and-Joinery.html","JOINERY_CONCEPT_ELEVATIONS.svg","FINISH_SAMPLES.csv","JOINERY_INTENT.csv","LIGHTING_INTENT.csv","FINISH_AND_JOINERY_R1.json"]},null,2));
