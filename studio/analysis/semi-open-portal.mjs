/** Type B kitchen portal study from pinned v55. Render-only and reversible. */
import assert from "node:assert/strict";

const clone=x=>structuredClone(x);
const near=(a,b,eps=.01)=>Math.abs(a-b)<=eps;
const matchSegment=(segment,ref)=>(
 near(segment.from[0],ref.from[0])&&near(segment.from[1],ref.from[1])&&
 near(segment.to[0],ref.to[0])&&near(segment.to[1],ref.to[1])
);
const within=(v,a,b)=>Math.max(a,Math.min(b,v));
export function buildSemiOpenPortalStudy(current,domain){
 assert.equal(current.canonical_sha256,domain.model.canonical_sha256);
 assert.equal(current.scene_revision,domain.revision(current.layout));
 assert.equal(current.source_scene_revision,"scene-4821689");
 assert.equal(current.storage_revision,55);
 assert.deepEqual(current.layout.demolished,[]);
 assert.equal(current.architecture_variant,undefined);
 const model=domain.model;
 const opening=model.openings.find(o=>o.id==="OP-RECP-KIT");
 const upperWall=model.wall_segments[44],lowerWall=model.wall_segments[45];
 assert.ok(opening&&upperWall&&lowerWall);
 assert.deepEqual(opening.between,["RECP-01","KIT-01"]);
 assert.deepEqual(upperWall.rooms,["KIT-01","RECP-01"]);
 assert.deepEqual(lowerWall.rooms,["KIT-01","RECP-01"]);
 assert.ok(near(opening.from[0],upperWall.from[0]));
 assert.ok(near(opening.from[1],upperWall.to[1]));
 assert.ok(near(opening.to[1],lowerWall.from[1]));
 const originalMm=opening.length_mm;
 const conceptualMm=Math.hypot(upperWall.from[0]-opening.to[0],upperWall.from[1]-opening.to[1]);
 assert.ok(conceptualMm>1200&&conceptualMm<1250);
 assert.equal(current.layout.furniture.filter(o=>o.id==="K3-dishwasher").length,1);
 assert.equal(current.layout.furniture.filter(o=>o.id==="K3-laundry-niche").length,1);
 assert.equal(current.layout.furniture.filter(o=>o.id==="starter-21").length,1);
 const cameraFromReception={
  id:"dry-portal-from-dining",room_id:"RECP-01",
  camera:clone(current.views.find(v=>v.id==="reception-dining").camera)
 };
 cameraFromReception.camera.position=[5.382291,1.7,2.2343415];
 cameraFromReception.camera.target=[2.962291,1.4,2.6343415];
 cameraFromReception.camera.fov=68;
 const cameraFromKitchen={
  id:"dry-portal-from-kitchen",room_id:"KIT-01",
  camera:clone(current.views.find(v=>v.id==="kitchen-work-run").camera)
 };
 cameraFromKitchen.camera.position=[3.482291,1.7,2.6343415];
 cameraFromKitchen.camera.target=[5.982291,1.4,2.5343415];
 cameraFromKitchen.camera.fov=68;
 const make=(kind)=>{
  const scene=clone(current);
  scene.name=kind==="portal"?
   "P1 conditional 1.21 m semi-open kitchen portal, dry services at original v55":
   "P0 untouched v55 kitchen door open, controlled camera";
  scene.views=[clone(cameraFromReception),clone(cameraFromKitchen)];
  scene.notes=[
   "Identical furniture, materials, rooms, six chairs, wet services and source revision in both camera-matched options.",
   "P1 is a RENDER-ONLY CONCEPT: removing existing upper kitchen partition segment at x=12582.613 y=6969.158..7456.363 and hiding existing 720mm kitchen hinged-door mesh to illustrate a possible longer opening.",
   "P1 DOES NOT demonstrate load-bearing structural clearance, developer permission, lintel, finished door clear width, ventilation or actual construction tolerance.",
   "P0 uses original canonical wall and door with saved viewer door-open setting; no architectural changes.",
   "No island, no wet-service or laundry relocation; no change to finished 2.50m ceiling."
  ];
  if(kind==="portal")scene.architecture_variant={
   id:"semi-open-dry-portal-only-v55-20261010",name:"P1 kitchen-facing upper door-return removal; conditional 1207mm aperture",
   render_only:true,structural_status:"TBD",
   remove_wall_segments:[clone({from:upperWall.from,to:upperWall.to})],
   hide_openings:["OP-RECP-KIT"],
   add_wall_segments:[],add_wall_boxes:[],door_overrides:[],merged_ceilings:[]
  };
  // The layout scene revision remains identical: only an unapproved rendering overlay changes.
  assert.equal(scene.scene_revision,current.scene_revision);
  assert.equal(domain.revision(scene.layout),current.scene_revision);
  assert.deepEqual(scene.layout,current.layout);
  return scene;
 };
 const closed=make("closed"),portal=make("portal");
 assert.equal(portal.architecture_variant.remove_wall_segments.length,1);
 assert.equal(portal.architecture_variant.hide_openings.length,1);
 assert.ok(matchSegment(portal.architecture_variant.remove_wall_segments[0],upperWall));
 const family=portal.layout.furniture.filter(o=>o.room_id==="RECP-01"&&o.type==="chair"&&/dining/i.test(o.name));
 assert.equal(family.length,6);
 const dw=portal.layout.furniture.find(o=>o.id==="K3-dishwasher");
 const sink=portal.layout.furniture.find(o=>o.id==="starter-21");
 assert.equal(dw.cx,sink.cx-600);
 const frameDepth=upperWall.thickness_mm;
 const fridge=portal.layout.furniture.find(o=>o.id==="starter-23");
 const fridgeWallFaceMm=(upperWall.from[0]-frameDepth/2)-(fridge.cx+fridge.w/2);
 const audit={
  schema:"ApartmentDrySemiOpenPortalReview/1",status:"DESIGN_STUDY_ONLY",
  canonical_sha256:current.canonical_sha256,cloud_scene:current.source_scene_revision,
  github_review_scene:current.scene_revision,
  variants:{untouched:"P0 original door held open",semi_open:"P1 single adjacent wall return removed, door mesh hidden; structurally conditional"},
  changes:{
   canonical_walls_changed:0,layout_items_changed:0,wet_services_relocated:0,
   bathroom_wall_segments_changed:0,bathroom_items_changed:0,
   hall_bedroom_furniture_changed:0,kitchen_appliances_changed:0,
   six_dining_chairs_preserved:true,
   model_wall_segment_removed_for_visual_only:44,
   removed_segment_length_mm:+Math.hypot(upperWall.to[0]-upperWall.from[0],upperWall.to[1]-upperWall.from[1]).toFixed(1),
   existing_nominal_opening_mm:+originalMm.toFixed(1),
   proposed_visual_opening_mm:+conceptualMm.toFixed(1),
   opening_nominal_increase_mm:+(conceptualMm-originalMm).toFixed(1),
   kitchen_fridge_to_wall_nominal_face_mm:+fridgeWallFaceMm.toFixed(1)
  },
  checks:{
   room_layout_equal:true,
   kitchen_sanitary_sink_same:true,
   dishwasher_same:true,
   washer_same:true,
   image_camera_match:true,
   domain_failures:domain.validate(current.layout).checks.filter(x=>x.status==="FAIL").map(x=>x.kind),
   as_built_and_structural_permission:false,
   physically_measured_clear_opening:false,
   installed_appliance_door_arcs_verified:false,
   actual_occupied_six_chair_access_verified:false,
   fire_gas_extraction_mechanical_approval:false
  },
  blockers:[
   "Check exact x=12582.613 return wall above existing kitchen door with site engineer/developer, whether loadbearing or MEP-bearing and if a lintel is needed.",
   "Door jambs, cabinetry, lighting, real screen/slide and final effective clear opening all need physical dimensions.",
   "Only one nominal wall segment is hidden: renderer image may not render a beautiful framed portal until construction detailing is designed.",
   "Real full-open dishwasher, fridge door, six pulled-out dining chairs and people in both locations must be measured.",
   "Existing kitchen washer still consumes storage; do not claim terrace relocation or storage gain."
  ],
  verdict:"P1 is a lower-disruption semi-open visual option with unchanged wet services, NOT an approved build or a proven preferable layout."
 };
 return {closed,portal,audit};
}
