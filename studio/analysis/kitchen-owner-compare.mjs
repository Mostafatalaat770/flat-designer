/** Exact Type B owner kitchen contrast. Read-only v55 vs historical K12. */
import assert from "node:assert/strict";
import {rectangle,polygonGap,pointInPolygon} from "./geometry.mjs";
const get=(s,id)=>{const o=s.layout.furniture.find(f=>f.id===id);assert.ok(o,"Missing source furniture "+id);return o};
const family=s=>s.layout.furniture.filter(f=>f.room_id==="RECP-01"&&f.type==="chair"&&/dining/i.test(f.name));
const kitchen=s=>s.layout.furniture.filter(f=>f.room_id==="KIT-01");
const fails=(domain,layout)=>{
 let d;
 try{d=domain.validate(layout)}catch(e){if(!e.validation)throw e;d=JSON.parse(JSON.stringify(e.validation))}
 assert.ok(Array.isArray(d.checks));
 return d.checks.filter(c=>c.status==="FAIL").map(c=>({kind:c.kind??null,id:c.object_id??null,wall:c.source_wall_index??null}));
};
const rnd=n=>Math.round(n*10)/10;
export function compareKitchen(domain,current,k12){
 assert.equal(current.canonical_sha256,domain.model.canonical_sha256);
 assert.equal(k12.canonical_sha256,current.canonical_sha256);
 assert.equal(current.scene_revision,domain.revision(current.layout));
 assert.equal(k12.scene_revision,domain.revision(k12.layout));
 assert.equal(current.source_scene_revision,"scene-4821689");
 assert.equal(current.storage_revision,55);
 assert.equal(current.architecture_variant,undefined);
 assert.deepEqual(current.layout.demolished,[]);
 assert.equal(k12.architecture_variant?.render_only,true);
 assert.equal(k12.architecture_variant.structural_status,"TBD");
 const currentFails=fails(domain,current.layout),oldFails=fails(domain,k12.layout);
 assert.equal(currentFails.length,0);
 assert.equal(oldFails.length,2);
 const cuts=k12.architecture_variant.remove_wall_segments;
 const nearKitchen=cuts.filter(s=>Math.min(s.from[0],s.to[0])>=8900);
 assert.equal(cuts.length,8);
 assert.equal(nearKitchen.length,4);
 assert.equal(k12.architecture_variant.hide_openings.length,3);
 assert.equal(family(current).length,6);
 assert.equal(family(k12).length,6);
 const table=get(current,"starter-35"),oldTable=get(k12,"starter-35");
 assert.deepEqual([table.w,table.d],[2000,950]);
 assert.deepEqual([oldTable.w,oldTable.d],[2000,950]);
 const dw=get(current,"K3-dishwasher"),sink=get(current,"starter-21");
 assert.equal(kitchen(current).filter(x=>x.type==="washer").length,1);
 assert.equal(kitchen(current).filter(x=>x.type==="dishwasher").length,1);
 assert.equal(kitchen(k12).filter(x=>x.type==="washer").length,0);
 assert.equal(kitchen(k12).filter(x=>x.type==="dishwasher").length,0);
 const island=get(k12,"E2-island");
 const islandJoinery=island.joinery?.work_modules??[];
 assert.equal(islandJoinery.filter(x=>x.role==="dishwasher").length,1);
 const living=domain.model.rooms.find(r=>r.id==="RECP-01");
 const islandWithin=rectangle(island).filter(p=>pointInPolygon(p,living.poly)).length;
 const gap=polygonGap(rectangle(get(k12,"E2-cooking-base")),rectangle(island));
 return {
  schema:"ApartmentOwnerKitchenContrast/1",status:"INDEPENDENT_STUDY_NOT_CONSTRUCTION",
  canonical_sha256:current.canonical_sha256,
  source:{current:{path:"render-snapshots/current.json",scene:current.scene_revision,cloud_source:current.source_scene_revision},
   historical:{path:"render-snapshots/study-k12-unapproved-20261008.json",scene:k12.scene_revision}},
  kitchen_area_m2:domain.model.rooms.find(r=>r.id==="KIT-01").area_estimate_m2,
  model:{current_failures:currentFails,unapproved_k12_failures:oldFails,
   removed_wall_segments:cuts.length,kitchen_related_wall_segments:nearKitchen.length,
   bathroom_area_wall_segments:cuts.length-nearKitchen.length,
   hidden_openings:k12.architecture_variant.hide_openings,
   island_corners_inside_original_reception:islandWithin,island_corners_total:4,
   old_island_to_cook_run_gap_mm:rnd(gap)},
  closed:{indoor_washer:1,discrete_dishwasher:1,discrete_sink:1,
   sink_to_dw_x_mm:rnd(Math.abs(sink.cx-dw.cx)),sink_to_dw_y_mm:rnd(Math.abs(sink.cy-dw.cy))},
  historical_open:{no_washer_inside_kitchen:true,discrete_dishwasher:0,
   conceptual_island_dishwasher_modules:1,island_mm:[island.w,island.d],
   service_terrace_approved:false},
  dining:{table_mm:[table.w,table.d],six_seats_both:true,
   current_y_mm:table.cy,archived_y_mm:oldTable.cy,archived_minus_current_mm:oldTable.cy-table.cy,
   controlled_same_layout_comparison:false},
  outstanding:[
   "Developer/structural permission on each kitchen-facing wall; avoid imported unrelated bath changes",
   "Correct both original K12 geometry failures; do not waive them as render-only",
   "Actual dishwasher and fridge fully opened; 6 occupied/pulled-out chairs; real kitchen inventory",
   "Outdoor laundry manufacturer warranty, wet drainage/slab route, hood duct, gas, electrical and kitchen ventilation",
   "Normalize real v55 dining before matched-view open vs closed comparison"
  ],
  verdict:{closed:"KEEP as source-safe comparison reference, not perfection",
   open:"REVISE as kitchen-only conditional design; 2 inherited geometry fails and 4 unrelated bathroom cuts",approved:false}
 };
}
const xml=s=>String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
const fill=f=>({washer:"#a99bc8",dishwasher:"#9cbdd6",ksink:"#91c8c1",fridge:"#bbc6c9",
 counter:"#b1b9b2",stove:"#727e83",table:"#d6bd9f",chair:"#e4d7c5",
 ovencol:"#a5b3bd",sideboard:"#c5ad9b"})[f.type]??"#bec6c0";
const shape=(pts,pt,color,stroke="#747f75",width=1.1)=>'<polygon points="'+pts.map(p=>pt(p).join(",")).join(" ")+'" fill="'+color+'" stroke="'+stroke+'" stroke-width="'+width+'"/>';
export function kitchenComparisonSvg(domain,current,k12,report){
 assert.equal(report.schema,"ApartmentOwnerKitchenContrast/1");
 const panels=[{scene:current,x:30,name:"A / v55 CLOSED (source valid)",id:"A",historic:false},
  {scene:k12,x:860,name:"B / K12 OPEN (unapproved)",id:"B",historic:true}];
 const view={x:8500,y:5870,w:7900,h:4450},scale=.095;
 let out='<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1680 870" role="img" aria-label="Actual floor plan comparison current v55 and archived K12">';
 out+='<rect width="1680" height="870" fill="#f9f7f3"/><text x="30" y="41" font-family="Arial" font-size="27" font-weight="bold" fill="#28352f">TYPE B  /  KITCHEN + DINING</text>';
 out+='<text x="30" y="68" font-family="Arial" font-size="15" fill="#5c625d">Source-exact furniture and walls · same scale · image-calibrated conceptual geometry, not an as-built drawing</text>';
 for(const panel of panels){
  const {scene,x,name,id,historic}=panel;
  const pt=([px,py])=>[rnd(x+20+(px-view.x)*scale),rnd(140+(py-view.y)*scale)];
  out+='<defs><clipPath id="clip'+id+'"><rect x="'+x+'" y="124" width="795" height="450" rx="9"/></clipPath></defs>';
  out+='<text x="'+(x+5)+'" y="112" font-family="Arial" font-size="18" font-weight="bold" fill="'+(historic?"#994c3c":"#326853")+'">'+xml(name)+'</text>';
  out+='<rect x="'+x+'" y="124" width="795" height="450" fill="#edeae4" stroke="#bfc3bc" rx="9"/>';
  out+='<g clip-path="url(#clip'+id+')">';
  for(const roomId of ["RECP-01","KIT-01","TER-SVC","WC-01","BATH-C01"]){
   const room=domain.model.rooms.find(q=>q.id===roomId);
   assert.ok(room);
   out+=shape(room.poly,pt,roomId==="KIT-01"?"#dde5de":roomId==="RECP-01"?"#f0e7d6":"#e9ece7","#d2d3ce",1.3);
  }
  for(const wall of domain.model.wall_segments){
   if(!wall.from||!wall.to)continue;
   const [a,b]=[pt(wall.from),pt(wall.to)];
   out+='<line x1="'+a[0]+'" y1="'+a[1]+'" x2="'+b[0]+'" y2="'+b[1]+'" stroke="#636d69" stroke-width="6" opacity=".76"/>';
  }
  if(historic)for(const seg of k12.architecture_variant.remove_wall_segments){
   const [a,b]=[pt(seg.from),pt(seg.to)];
   out+='<line x1="'+a[0]+'" y1="'+a[1]+'" x2="'+b[0]+'" y2="'+b[1]+'" stroke="#f0e7d6" stroke-width="12"/>';
   out+='<line x1="'+a[0]+'" y1="'+a[1]+'" x2="'+b[0]+'" y2="'+b[1]+'" stroke="#b54a3a" stroke-width="4" stroke-dasharray="9 6"/>';
  }
  const f=scene.layout.furniture.filter(z=>z.room_id==="KIT-01"||
   (z.room_id==="RECP-01"&&(z.type==="table"||(z.type==="chair"&&/dining/i.test(z.name))||z.id==="E2-island"||z.id==="E2-island-sink")));
  const labels={"K3-laundry-niche":"Washer","K3-dishwasher":"DW","starter-21":"Sink",
   "starter-23":"Fridge","starter-35":"Six seats","E2-island":"Wet island",
   "E2-cooking-base":"Cook run","starter-20":"Cook run","E2-oven-column":"Oven"};
  for(const item of f){
   out+=shape(rectangle(item),pt,fill(item),item.id==="E2-island"?"#ae523e":"#7b8a80",item.id==="E2-island"?2.8:1);
   if(item.type!=="chair"){
    const p=pt([item.cx,item.cy]);
    out+='<text x="'+p[0]+'" y="'+(p[1]+4)+'" font-family="Arial" font-size="10.5" text-anchor="middle" fill="#223c36" font-weight="bold">'+xml(labels[item.id]??item.type)+'</text>';
   }
  }
  if(historic){
   const pantry=k12.layout.interior.objects.find(o=>o.id==="E2-pantry-tall");
   assert.ok(pantry);
   const box={cx:pantry.cx,cy:pantry.cy,w:pantry.width_mm,d:pantry.depth_mm,rot:pantry.rotation};
   out+=shape(rectangle(box),pt,"#d7adad","#a24e3c",2);
   const p=pt([pantry.cx,pantry.cy]);
   out+='<text x="'+p[0]+'" y="'+p[1]+'" font-family="Arial" font-size="11" text-anchor="middle">Pantry</text>';
  }
  out+='</g>';
 }
 out+='<text x="40" y="620" font-family="Arial" font-size="20" font-weight="bold" fill="#326853">A · 0 geometry FAILS</text>';
 out+='<text x="870" y="620" font-family="Arial" font-size="20" font-weight="bold" fill="#994c3c">B · 2 geometry FAILS (historic)</text>';
 out+='<text x="40" y="652" font-family="Arial" font-size="15">Indoor washer + discrete dishwasher beside sink</text>';
 out+='<text x="870" y="652" font-family="Arial" font-size="15">8 wall cuts (4 kitchen / 4 bathrooms), 3 hidden openings</text>';
 out+='<text x="40" y="703" font-family="Arial" font-size="17" fill="#404b45">6 dining chairs in both snapshots; K12 table + chairs are 150 mm north of current v55.</text>';
 out+='<text x="40" y="738" font-family="Arial" font-size="16" fill="#8b4d3d">Red dashed = only HISTORICAL unapproved demolition proposal, not actual demolished walls.</text>';
 out+='<text x="40" y="777" font-family="Arial" font-size="15" fill="#5b665f">No site measurements, structural consent, drainage approval or manufacturer appliance envelopes verified.</text>';
 out+='<text x="40" y="810" font-family="Arial" font-size="14" fill="#78827d">Geometry SHA: '+xml(report.canonical_sha256.slice(0,16))+'…  ·  Kitchen ≈ '+rnd(report.kitchen_area_m2)+' m²  ·  2.50 m clear finished ceiling</text>';
 out+='<text x="40" y="840" font-family="Arial" font-size="13" fill="#78827d">Current scene '+current.scene_revision+'  ·  Historical scene '+k12.scene_revision+'  ·  Read-only owner review</text>';
 out+='</svg>';
 return out;
}
