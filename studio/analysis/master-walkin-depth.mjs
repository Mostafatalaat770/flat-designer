/** Type B master 800 vs 900mm wet depth: source-exact, engineering-HOLD comparison. */
import assert from "node:assert/strict";
import {rectangle,polygonGap} from "./geometry.mjs";
const clone=x=>structuredClone(x);
const minmax=(poly)=>({
  xmin:Math.min(...poly.map(q=>q[0])),xmax:Math.max(...poly.map(q=>q[0])),
  ymin:Math.min(...poly.map(q=>q[1])),ymax:Math.max(...poly.map(q=>q[1]))
});
const round=v=>+v.toFixed(1);
const VID=["bath55-master-walkin-deep-eye","bath55-master-walkin-correct-door"];
export function masterWalkinDepthStudy(source,domain){
  assert.equal(source.canonical_sha256,domain.model.canonical_sha256);
  assert.equal(source.scene_revision,domain.revision(source.layout));
  assert.equal(source.source_scene_revision,"scene-4821689");
  assert.equal(source.storage_revision,55);
  assert.deepEqual(source.layout.demolished,[]);
  assert.equal(source.architecture_variant,undefined);
  const room=domain.model.rooms.find(x=>x.id==="BATH-M01");
  const door=domain.model.openings.find(x=>x.id==="OP-WIC-BATHM");
  const wet=source.layout.furniture.find(f=>f.id==="BATHM-WALKIN-A1");
  const glass=source.layout.interior.objects.find(o=>o.id==="BATHM-glass-600-A1");
  assert.ok(room&&door&&wet&&glass);
  assert.deepEqual([wet.w,wet.d,wet.cx,wet.cy,wet.rot,wet.variant],[1450,800,6323,6750,0,"walk-in"]);
  assert.deepEqual([glass.width_mm,glass.depth_mm,glass.cx,glass.cy],[600,18,6730,7171]);
  assert.equal(glass.height_mm,2050);
  const north=wet.cy-wet.d/2;
  const base=clone(source),deeper=clone(source);
  base.name="M0 retained master 1450×800 walk-in / current v55 review";
  deeper.name="M1 conditional master 1450×900 walk-in / +100 mm south, HOLD";
  base.views=VID.map(id=>{const view=source.views.find(v=>v.id===id);assert.ok(view,"Missing canonical saved camera "+id);return clone(view)});
  deeper.views=clone(base.views);
  const dw=deeper.layout.furniture.find(f=>f.id===wet.id);
  const dg=deeper.layout.interior.objects.find(x=>x.id===glass.id);
  dw.d=900;dw.cy=north+450;dw.name="Master wet-area depth 900mm / CONDITIONAL splash & door concept";
  dg.cy+=100;
  dg.metadata={...dg.metadata,
    role:"Conditional M1 deep shower: glass shifted south 100mm with wet edge. Visual-only until dressing-door/splash, floor falls, safety fixings and wet waterproofing certified."};
  deeper.scene_revision=domain.revision(deeper.layout);
  assert.notEqual(deeper.scene_revision,base.scene_revision);
  const unchangedWet=layout=>layout.furniture.filter(f=>f.id!==wet.id);
  assert.deepEqual(unchangedWet(deeper.layout),unchangedWet(base.layout));
  const unchangedGlass=layout=>layout.interior.objects.filter(o=>o.id!==glass.id);
  assert.deepEqual(unchangedGlass(deeper.layout),unchangedGlass(base.layout));
  assert.deepEqual(base.layout.rooms,deeper.layout.rooms);
  assert.deepEqual(base.layout.demolished,deeper.layout.demolished);
  assert.deepEqual(base.layout.studio,deeper.layout.studio);
  assert.deepEqual(base.layout.decor,deeper.layout.decor);
  assert.deepEqual(base.views,deeper.views);
  const dims=v=>{
    const f=v.layout.furniture.find(x=>x.id===wet.id);
    const s=v.layout.interior.objects.find(x=>x.id===glass.id);
    const bounds=minmax(rectangle(f));
    const sx0=s.cx-s.width_mm/2;
    const sx1=s.cx+s.width_mm/2;
    const opening=sx0-bounds.xmin;
    return {
      shower_wet_area_mm:[f.w,f.d],north_edge_y_mm:round(bounds.ymin),south_edge_y_mm:round(bounds.ymax),
      dressing_door_north_jamb_y_mm:round(Math.min(door.from[1],door.to[1])),
      wet_south_edge_to_door_jamb_y_projection_mm:round(Math.min(door.from[1],door.to[1])-bounds.ymax),
      fixed_glass_nominal_mm:[s.width_mm,s.height_mm],
      glass_center_mm:[s.cx,s.cy],
      glass_x_end_mm:round(sx1),
      entry_band_west_of_fixed_glass_nominal_mm:round(opening),
      open_entry_y_mm:round(bounds.ymax),
      room_model_width_mm:round(Math.max(...room.poly.map(q=>q[0]))-Math.min(...room.poly.map(q=>q[0]))),
      room_model_depth_mm:round(Math.max(...room.poly.map(q=>q[1]))-Math.min(...room.poly.map(q=>q[1]))),
      note:"Nominal 2D model projections (not actual clear passage or a permissible wet threshold)."
    };
  };
  const a=dims(base),b=dims(deeper);
  assert.equal(a.entry_band_west_of_fixed_glass_nominal_mm,b.entry_band_west_of_fixed_glass_nominal_mm);
  assert.equal(round(a.wet_south_edge_to_door_jamb_y_projection_mm-b.wet_south_edge_to_door_jamb_y_projection_mm),100);
  const v0=domain.validate(base.layout),v1=domain.validate(deeper.layout);
  const fail=validation=>validation.checks.filter(x=>x.status==="FAIL").map(x=>({kind:x.kind||"unspecified",id:x.id||null}));
  assert.deepEqual(fail(v0),[]);
  const candidateFails=fail(v1);
  const audit={
    schema:"TypeBMasterWetDepthReview/1",status:"ENGINEERING_HOLD_NOT_APPROVED",
    canonical_sha256:source.canonical_sha256,cloud_revision:55,cloud_scene:source.source_scene_revision,
    source_scene:base.scene_revision,candidate_scene:deeper.scene_revision,
    cameras:VID,
    unchanged_canonical_architecture:true,other_furniture_unchanged:true,
    glass_already_separate:true,glass_supplier_selected:false,
    variants:{
      M0:{...a,domain_hard_fails:[]},
      M1:{...b,domain_hard_fails:candidateFails}
    },
    sensitivities:[
      {fixed_glass_width_mm:500,nominal_open_entry_mm:round(a.entry_band_west_of_fixed_glass_nominal_mm+100)},
      {fixed_glass_width_mm:600,nominal_open_entry_mm:a.entry_band_west_of_fixed_glass_nominal_mm},
      {fixed_glass_width_mm:650,nominal_open_entry_mm:round(a.entry_band_west_of_fixed_glass_nominal_mm-50)},
      {fixed_glass_width_mm:700,nominal_open_entry_mm:round(a.entry_band_west_of_fixed_glass_nominal_mm-100)}
    ],
    cautions:[
      "M1 gains 100mm wet depth but moves the wet south edge 100mm nearer to the dressing-room door. Door jamb Y-band clearance drops from ~115.7mm to ~15.7mm in the image-calibrated model. This is NOT minimum physical distance and NOT a door swing measurement.",
      "The nominal ~832mm opening west of 600mm fixed glass describes an uninstalled 2D interval, not usable human clear width after glass edges, water splash, person or door frame.",
      "M0 is also NOT a certified shower. Its 800mm wet depth requires real standing-room trial; NKBA reference recommendations are design advice, not Egyptian construction code.",
      "A floor-level wet-zone marker is NOT a hard obstacle or a wall. If an automated door-sweep test sees the shower patch as furniture, the result may overstate a door collision; examine the actual 2050mm tall glass separately.",
      "M1 does not move shower riser wall, plumbing/waste point or slab, and cannot claim a drain gradient or threshold construction from an image.",
      "Protect the dressing-room door and wardrobe flooring from spray, and measure actual entry arc and fixed glass splash reach."
    ],
    preferred_for_current_review:"M0 retained 800mm baseline; M1 900mm is NOT selected unless qualified measured wet/door/drain evidence proves it safe.",
    hard_gates:{
      qualified_wet_design_and_developer_approved:false,
      finished_wall_door_swing_measured:false,
      shower_splash_test_with_open_entry:false,
      screed_slope_trap_waterproofing_approved:false,
      certified_fixed_glass_anchor_supplier:false,
      wet_grip_and_extractor_verified:false,
      1to1_daily_showering_and_dressing_use_test:false
    }
  };
  return {base,deeper,audit};
}
export function masterWalkinDepthSvg(study){
 const {audit}=study;
 const A=audit.variants.M0,B=audit.variants.M1;
 const x0=100,y0=164,scale=.25;
 const xMin=5465.175,yMin=6206.575;
 const px=x=>x0+(x-xMin)*scale,py=y=>y0+(y-yMin)*scale;
 const shower=(variant,color)=>'<rect x="'+px(6323-725)+'" y="'+py(variant.north_edge_y_mm)+'" width="'+(1450*scale)+'" height="'+(variant.shower_wet_area_mm[1]*scale)+'" fill="'+color+'" opacity=".55" stroke="#5c857f" stroke-width="3"/>';
 let out='<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1370 920" role="img" aria-label="Master ensuite 800 versus 900 mm wet depth and dressing door proximity comparison">';
 out+='<rect width="1370" height="920" fill="#faf8f3"/>';
 out+='<text x="54" y="58" font-family="Arial" font-size="29" font-weight="700" fill="#264037">MASTER WALK-IN / 1450 x 800 VS 1450 x 900</text>';
 out+='<text x="54" y="89" font-family="Arial" font-size="17" fill="#606f66">Exact Type B v55 plan coordinates · wet build NOT approved · floor patch is not a solid partition</text>';
 const draw=(dx,v,label)=>{
   const left=100+dx,top=158, sx=x=>left+(x-xMin)*.24, sy=y=>top+(y-yMin)*.24;
   out+='<rect x="'+sx(5465.175)+'" y="'+sy(6206.575)+'" width="'+(1715.811*.24)+'" height="'+(2753.771*.24)+'" fill="#F2E9DC" stroke="#6F7D73" stroke-width="4"/>';
   out+='<rect x="'+sx(5598)+'" y="'+sy(6350)+'" width="'+(1450*.24)+'" height="'+(v.shower_wet_area_mm[1]*.24)+'" fill="#C4D7CF" stroke="#577F6F" stroke-width="2"/>';
   out+='<line x1="'+sx(6430)+'" y1="'+sy(v.glass_center_mm[1])+'" x2="'+sx(7030)+'" y2="'+sy(v.glass_center_mm[1])+'" stroke="#2C6C75" stroke-width="7"/>';
   out+='<line x1="'+sx(5465.175)+'" y1="'+sy(7265.718)+'" x2="'+sx(5465.175)+'" y2="'+sy(7943.569)+'" stroke="#FCFCFD" stroke-width="12"/>';
   out+='<text x="'+(left+25)+'" y="'+(top+30)+'" font-family="Arial" font-size="17" font-weight="700" fill="#355C50">'+label+'</text>';
   out+='<text x="'+(left+18)+'" y="'+(top+75)+'" font-family="Arial" font-size="15" fill="#355C50">'+v.shower_wet_area_mm[1]+'mm WET</text>';
   out+='<text x="'+(left+14)+'" y="'+(top+380)+'" font-family="Arial" font-size="14" fill="#6A6E64">Dressing door left</text>';
   out+='<text x="'+(left+14)+'" y="'+(top+421)+'" font-family="Arial" font-size="14" fill="#6A6E64">600mm fixed glass</text>';
   out+='<text x="'+(left+14)+'" y="'+(top+446)+'" font-family="Arial" font-size="14" fill="#6A6E64">832mm nominal entry</text>';
   out+='<text x="'+(left+14)+'" y="'+(top+495)+'" font-family="Arial" font-size="16" fill="#995649">Wet-to-door projected Y: '+v.wet_south_edge_to_door_jamb_y_projection_mm+'mm</text>';
 };
 draw(0,A,"M0 / ORIGINAL 800mm");
 draw(680,B,"M1 / TRIAL 900mm");
 out+='<text x="50" y="850" font-family="Arial" font-size="20" font-weight="700" fill="#9B5545">M1 reduces wet-to-door Y-band gap by 100mm. THIS IS NOT a certified human route / door clearance.</text>';
 out+='<text x="50" y="886" font-family="Arial" font-size="16" fill="#61776A">No selected shower drain, waterproofing, genuine slip-tested floor, door position or safety glass fixings · site inspection required.</text>';
 return out+'</svg>';
}
