/** Guest WC true Type B v55 same-camera basin usability + finish jury. */
import assert from "node:assert/strict";
import {rectangle,polygonGap,overlapAreaConvex} from "./geometry.mjs";
const copy=x=>structuredClone(x);
const bounds=p=>({xmin:Math.min(...p.map(q=>q[0])),xmax:Math.max(...p.map(q=>q[0])),
 ymin:Math.min(...p.map(q=>q[1])),ymax:Math.max(...p.map(q=>q[1]))});
const round=x=>+x.toFixed(1);
const cameraIds=["guest-wc","guest-wc-entry-open"];
const surface="WALL-WC-01-02",materialId="wc2-mineral-taupe-matt";
export function guestWcJury(source,domain){
 assert.equal(source.canonical_sha256,domain.model.canonical_sha256);
 assert.equal(source.source_scene_revision,"scene-4821689");
 assert.equal(source.storage_revision,55);
 assert.equal(source.scene_revision,domain.revision(source.layout));
 assert.equal(source.architecture_variant,undefined);
 assert.deepEqual(source.layout.demolished,[]);
 const room=domain.model.rooms.find(r=>r.id==="WC-01");
 const door=domain.model.openings.find(o=>o.id==="OP-RECP-WC");
 const orig=source.layout.furniture.find(f=>f.id==="starter-26");
 const toilet=source.layout.furniture.find(f=>f.id==="starter-25");
 const mirror=source.layout.interior.objects.find(o=>o.id==="WC-A1-mirror");
 assert.ok(room&&door&&orig&&toilet&&mirror);
 assert.deepEqual([orig.w,orig.d,orig.rot],[350,180,0]);
 assert.deepEqual([mirror.width_mm,mirror.height_mm],[500,800]);
 assert.ok(source.layout.interior.surface_materials[surface]);
 const A=copy(source),B=copy(source);
 A.name="Guest WC A / original 350x180 handrinse and warm walnut";
 B.name="Guest WC B / 450x250 conditional handrinse + taupe/cleaner task mirror";
 A.views=cameraIds.map(id=>{const v=source.views.find(x=>x.id===id);assert.ok(v,"Missing existing v55 camera "+id);return copy(v)});
 B.views=copy(A.views);
 const expanded=B.layout.furniture.find(f=>f.id==="starter-26");
 expanded.w=450;expanded.d=250;
 expanded.name="Guest optional wall basin 450×250 / exact same nominal pipe center; as-built hold";
 const lit=B.layout.interior.objects.find(o=>o.id==="WC-A1-mirror");
 lit.variant="task-lit";
 lit.material_references.frame="bath-brushed-nickel";
 lit.colour="#B9BDC0";
 lit.metadata={...lit.metadata,role:"Guest task-front 3000K optical line; no photometric lux or actual circuit/IP approval."};
 B.layout.interior.materials.push({
  schema:"InteriorMaterial/1",id:materialId,
  name:"Guest WC warm mineral taupe — sample needed",
  category:"stone",source_status:"GENERIC",
  base_colour:"#B7A99A",finish:"matte",roughness:.8,metallic:0,
  texture_scale_mm:{width:600,height:600},
  fallback_generic_id:"tile600",
  notes:"Visually restrained accent ONLY; real tactile tile, grout, moisture rating and supply pending."
 });
 B.layout.interior.surface_materials[surface]=materialId;
 B.scene_revision=domain.revision(B.layout);
 assert.notEqual(A.scene_revision,B.scene_revision);
 assert.deepEqual(A.layout.demolished,B.layout.demolished);
 assert.deepEqual(A.layout.rooms,B.layout.rooms);
 assert.deepEqual(A.layout.studio,B.layout.studio);
 assert.deepEqual(A.layout.decor,B.layout.decor);
 assert.deepEqual(A.views,B.views);
 assert.deepEqual(A.layout.furniture.filter(f=>f.id!=="starter-26"),B.layout.furniture.filter(f=>f.id!=="starter-26"));
 assert.deepEqual(A.layout.interior.objects.filter(o=>o.id!=="WC-A1-mirror"),B.layout.interior.objects.filter(o=>o.id!=="WC-A1-mirror"));
 assert.deepEqual(A.layout.interior.opening_treatments,B.layout.interior.opening_treatments);
 for(const key of Object.keys(A.layout.interior.surface_materials).filter(k=>k!==surface))
  assert.equal(B.layout.interior.surface_materials[key],A.layout.interior.surface_materials[key]);
 assert.deepEqual([expanded.cx,expanded.cy,expanded.rot],[orig.cx,orig.cy,orig.rot]);
 const metrics=v=>{
  const basin=v.layout.furniture.find(f=>f.id==="starter-26"),toilet=v.layout.furniture.find(f=>f.id==="starter-25");
  const sinkPoly=rectangle(basin),wcPoly=rectangle(toilet);
  const sb=bounds(sinkPoly),tb=bounds(wcPoly);
  return {
   basin_mm:[basin.w,basin.d],
   basin_plan_center_mm:[basin.cx,basin.cy],
   sink_to_toilet_footprint_gap_mm:round(polygonGap(sinkPoly,wcPoly)),
   sink_to_east_room_wall_plan_x_mm:round(Math.max(...room.poly.map(p=>p[0]))-sb.xmax),
   sink_front_y_mm:round(sb.ymax),
   sink_front_to_door_north_jamb_y_projection_mm:round(Math.min(door.from[1],door.to[1])-sb.ymax),
   sink_back_to_north_wall_plan_y_mm:round(sb.ymin-Math.min(...room.poly.map(p=>p[1]))),
   sink_to_toilet_positive_area_overlap_mm2:round(overlapAreaConvex(sinkPoly,wcPoly)),
   door_nominal_opening_mm:round(door.length_mm),
   room_model_width_mm:round(Math.max(...room.poly.map(p=>p[0]))-Math.min(...room.poly.map(p=>p[0]))),
   room_model_depth_mm:round(Math.max(...room.poly.map(p=>p[1]))-Math.min(...room.poly.map(p=>p[1]))),
   caveat:"All values nominal 2D footprint/axis projections; no guaranteed physical route, tap reach or real finished hinge sweep."
  };
 };
 const a=metrics(A),b=metrics(B);
 const validation=v=>domain.validate(v.layout).checks.filter(c=>c.status==="FAIL").map(x=>({id:x.id||null,kind:x.kind||"unspecified",message:x.message||null}));
 const failuresA=validation(A),failuresB=validation(B);
 assert.deepEqual(failuresA,[],"Source v55 must pass");
 const audit={
  schema:"TypeBGuestWcComfortAndFinishJury/1",
  status:"VISUAL+DIMENSIONAL_CONCEPT_NOT_FOR_PLUMBING_FIRST_FIX",
  locked_canonical_sha256:source.canonical_sha256,
  unchanged_saved_cloud:"scene-4821689",
  unchanged_current_source_scene:A.scene_revision,
  candidate_scene:B.scene_revision,views:cameraIds,
  candidates:{
   A:{...a,model_domain_failures:failuresA},
   B:{...b,model_domain_failures:failuresB}
  },
  basin_pipe_center_changed:false,
  existing_guest_toilet_moved:false,
  bath_or_kitchen_geometry_changed:false,
  door_opening_changed:false,
  mirror_envelope_unchanged:true,
  wall_material_change_one_surface:surface,
  sink_nominal_size_increase_mm:[100,70],
  practical_gates:{
   real_basins_350x180_and_450x250_trials_with_lather_and_splash:false,
   tap_reach_throw_and_bowl_internal_depth_verified:false,
   actual_sink_trap_center_compatible_with_site_drain:false,
   reception_door_657mm_finished_clear_and_swing_measured:false,
   toilet_seating_handwash_and_cleaning_reach_tested:false,
   mirror_task_3000k_fixture_actual_cri_lux_ip_and_earth_verified:false,
   mineral_tile_sample_wet_grout_cleanability_and_price_confirmed:false,
   extract_access_and_service_valves_confirmed:false
  },
  preferred_before_actual_vendor_fit:"NO APPROVAL — B is a provisional comfort/finish exploration only. The original tiny basin may splash; enlarging it consumes door-y projection and must be field-tested.",
  design_note:"Elegant compact WC: one warm taupe mineral wall, walnut, matching nickel, small effective hand-wash and mirror task light. No new floor cupboard, extra decor or false ceiling."
 };
 return {A,B,audit};
}
export function guestWcBoardSvg(audit){
 const A=audit.candidates.A,B=audit.candidates.B;
 const F=(n)=>Number(n).toFixed(1);
 let q='<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1140 760" role="img" aria-label="Guest WC source dimensions and compact handwash comparison">';
 q+='<rect width="1140" height="760" fill="#FBF8F3"/><text x="42" y="58" font-size="30" font-weight="700" font-family="Arial" fill="#293F34">GUEST WC / VISUAL AND DAILY HANDWASH STUDY</text>';
 q+='<text x="42" y="94" font-size="17" font-family="Arial" fill="#6B736B">Type B room source locked · nominal geometry only · no first-fix approval</text>';
 const cards=[
  {title:"A · SOURCE 350×180",m:A,x:40,col:"#E4DCD0"},
  {title:"B · TRIAL 450×250",m:B,x:600,col:"#D6C6B7"}];
 for(const c of cards){
  const y=132;
  q+='<rect x="'+c.x+'" y="'+y+'" width="500" height="485" rx="12" fill="#FFFFFF" stroke="#D8D4C8"/>';
  q+='<text x="'+(c.x+20)+'" y="'+(y+38)+'" font-family="Arial" font-size="23" font-weight="700" fill="#344A3E">'+c.title+'</text>';
  const px=c.x+55,py=y+75,scale=.22;
  q+='<rect x="'+px+'" y="'+py+'" width="'+(c.m.room_model_width_mm*scale)+'" height="'+(c.m.room_model_depth_mm*scale)+'" fill="#F7F2EA" stroke="#8E9890" stroke-width="3"/>';
  const W=c.m.basin_mm[0],D=c.m.basin_mm[1];
  const basinCx=11968.31,basinCy=9174.54;
  const left=px+(basinCx-W/2-10739.705)*scale,top=py+(basinCy-D/2-8960.346)*scale;
  q+='<rect x="'+left+'" y="'+top+'" width="'+W*scale+'" height="'+D*scale+'" fill="'+c.col+'" stroke="#867462" stroke-width="2"/>';
  q+='<rect x="'+(px+(10944.276-10739.705)*scale)+'" y="'+(py+(9501.745-8960.346)*scale)+'" width="'+(650*scale)+'" height="'+(400*scale)+'" fill="#EEEDE8" stroke="#92968D" stroke-width="2"/>';
  q+='<line x1="'+(px+c.m.room_model_width_mm*scale)+'" y1="'+(py+(9341.637-8960.346)*scale)+'" x2="'+(px+c.m.room_model_width_mm*scale)+'" y2="'+(py+(9998.305-8960.346)*scale)+'" stroke="#C79154" stroke-width="6"/>';
  q+='<text x="'+(c.x+24)+'" y="'+(y+403)+'" font-family="Arial" font-size="17" fill="#435B4E">Basin-to-WC model gap: '+F(c.m.sink_to_toilet_footprint_gap_mm)+' mm</text>';
  q+='<text x="'+(c.x+24)+'" y="'+(y+435)+'" font-family="Arial" font-size="16" fill="#9E5D49">Basin front to door-jamb Y: '+F(c.m.sink_front_to_door_north_jamb_y_projection_mm)+' mm</text>';
 }
 q+='<text x="46" y="660" font-family="Arial" font-size="20" font-weight="700" fill="#304D3E">Smaller vanity ≠ easier handwashing. Test actual bowls and tap throw before selecting.</text>';
 q+='<text x="46" y="694" font-family="Arial" font-size="17" fill="#955944">Orange line is nominal door position, NOT a simulated swing or finished clear width.</text>';
 q+='<text x="46" y="728" font-family="Arial" font-size="14" fill="#6A736A">Warm taupe / walnut / nickel / 3000K mirror light are visualization-only. Plumbing and site permissions pending.</text>';
 return q+'</svg>';
}
