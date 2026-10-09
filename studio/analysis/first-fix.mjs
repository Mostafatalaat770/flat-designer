/**
 * A15 first-fix room requirements auditor — deliberately does not design
 * final electrical circuits, air conditioner size, switch positions or ducting.
 *
 * Planning input is source-linked intent, never a stamped engineering drawing.
 */
const roomStatuses=new Set(['EXPLORATORY','INFERRED','VERIFIED','TBD']);
const kinds=new Set(['lighting','power','data','control','hvac','ventilation','appliance','low_voltage','sensor','wet_service']);
const installationPhases=new Set(['first_fix','reserve','later']);
const safeAreas=new Set(['dry','wet','wet_adjacency','outdoor_wet']);
const highRisk=new Set(['wet','wet_adjacency','outdoor_wet']);
const finishedHeight=2500;
const mustHave={
 'RECP-01':['lighting','control','power','data'],
 'KIT-01':['lighting','appliance','power','ventilation'],
 'MBR-01':['lighting','power','hvac'],
 'BR-01':['lighting','power','hvac'],
 'BR-02':['lighting','power','hvac'],
 'HALL-01':['lighting','control'],
 'WIC-01':['lighting','control'],
 'BATH-M01':['lighting','ventilation'],
 'BATH-C01':['lighting','ventilation'],
 'WC-01':['lighting','ventilation'],
 'TER-SVC':['lighting','appliance'],
 'TER-MBR':['lighting'],
 'TER-MAIN':['lighting']
};
const lower=x=>String(x||'').toLowerCase();
const uniq=a=>new Set(a).size===a.length;
function validateFirstFix({brief,model,scene}){
 const errors=[],warnings=[],depsByRoom=new Map();
 const reject=(id,msg)=>errors.push({id,message:msg});
 const warn=(id,msg)=>warnings.push({id,message:msg});
 if(brief?.schema!=='ApartmentFirstFixNeeds/1')reject('schema','Incorrect first-fix schema');
 if(brief.canonical_sha256!==model.canonical_sha256||
    scene.canonical_sha256!==model.canonical_sha256)
  reject('canonical','Canonical checksum mismatch');
 if(brief.reference_scene_revision!==scene.scene_revision)
  reject('scene','Source furniture changed from documented parent revision');
 if(model.height_m*1000!==finishedHeight||brief.finished_ceiling_height_mm!==finishedHeight)
  reject('ceiling','Locked net finished height changed');
 if(model.pre_gypsum_height_m*1000!==brief.pre_gypsum_clear_height_mm)
  reject('pre_gypsum','Pre-gypsum underside height must match frozen source');
 const rooms=model.rooms.map(r=>r.id),set=new Set(rooms),all=brief.room_ids||[];
 if(!uniq(all)||rooms.length!==all.length||all.some(x=>!set.has(x)))
  reject('coverage','Every canonical room must appear exactly once in the declared brief');
 const items=brief.equipment_points||[];
 if(!uniq(items.map(x=>x.id)))reject('ids','Each proposed intent ID must be unique');
 const kindsCount={},roomsCovered=new Map(),groups=new Map();
 const furniture=new Map(scene.layout.furniture.map(f=>[f.id,f]));
 const openingIds=new Set(model.doors.map(o=>o.id));
 for(const p of items){
  if(!p.id||!p.room_id||!set.has(p.room_id)){reject(p.id||'?','Missing or noncanonical room');continue;}
  if(!kinds.has(p.kind))reject(p.id,'Unsupported service type '+p.kind);
  if(!installationPhases.has(p.phase))reject(p.id,'Unknown installation phase');
  if(!safeAreas.has(p.safety))reject(p.id,'Missing wet/outdoor safety context');
  if(!roomStatuses.has(p.provenance))reject(p.id,'Unknown source evidence status');
  if(typeof p.intent!=='string'||p.intent.length<20)reject(p.id,'Must state an actual user activity or requirement');
  if(!Array.isArray(p.deps)||p.deps.length===0)reject(p.id,'Missing field/product/authority prerequisites');
  if(p.anchor){
   if(p.anchor.type==='furniture'){
    const target=furniture.get(p.anchor.id);
    if(!target)reject(p.id,'Anchor furniture not in original K12 snapshot');
    else if(target.room_id!==p.room_id)reject(p.id,'Fixture anchor belongs to another room');
   }else if(p.anchor.type==='door'){
    if(!openingIds.has(p.anchor.id))reject(p.id,'Door not in canonical source');
   }else reject(p.id,'Anchors must be a known source furniture or door ID');
  }
  if('position_mm' in p||'circuit_breaker_a' in p||'power_w' in p||'air_conditioner_kw' in p||
     'cable_area_mm2' in p||'wall_survey_xy' in p)
   reject(p.id,'No unverified electrical/HVAC installation coordinate, tonnage or cable rating allowed');
  if(highRisk.has(p.safety)&&p.deps.length<2)
   reject(p.id,'Wet/exterior provision needs independent site safety evidence');
  const name=''+p.room_id,kind=p.kind;
  if(!roomsCovered.has(name))roomsCovered.set(name,new Set());
  roomsCovered.get(name).add(kind);
  kindsCount[kind]=(kindsCount[kind]||0)+1;
  if(p.control_group){
   if(!groups.has(p.control_group))groups.set(p.control_group,[]);
   groups.get(p.control_group).push(p.id);
  }
  if(p.kind==='hvac'){
   if(p.provision==='CAPACITY_TBD'||p.provision==='NO_CONDENSER_LOCATION_APPROVED'){
    if(!p.deps.some(x=>/outdoor|condenser|load|unit/i.test(x)))
     reject(p.id,'HVAC must name outdoor unit / heat-load unknowns');
   }else reject(p.id,'HVAC location/tonnage must remain TBD at first-fix stage');
  }
  if(p.kind==='appliance'&&!p.deps.some(x=>/selected|manual|circuit|power|plumb|weather/i.test(x)))
   warn(p.id,'Appliance requires final SKU utility rating verification');
  if(highRisk.has(p.safety))warn(p.id,'Wet/outdoor electrical context requires qualified engineer wet-zone/IP/RCD/earthing review');
  if(p.phase==='reserve')warn(p.id,'Future provision does not automatically authorize a built circuit or wall penetration');
 }
 for(const [roomId,need] of Object.entries(mustHave)){
  const found=roomsCovered.get(roomId)||new Set();
  for(const k of need)if(!found.has(k))reject(roomId,'Missing core family-first function: '+k);
 }
 for(const id of rooms){if(!roomsCovered.has(id))reject(id,'No life-use requirements for room');}
 const bg=items.filter(p=>p.kind==='lighting'&&p.control_group).map(p=>p.control_group);
 if(new Set(bg).size<7)reject('layering','Insufficient independently named conceptual lighting scenes');
 // Multi-use zoning matters, but a group is NOT a physical electrician approved circuit.
 const zones=Object.fromEntries([...groups].map(([k,v])=>[k,v]));
 if(brief.project_status!=='EARLY_COORDINATION_ONLY_NOT_ELECTRICAL_OR_HVAC_DRAWINGS')
  reject('approval','First-fix study cannot claim construction readiness');
 if(!brief.release_policy?.includes('licensed Egyptian engineers'))
  reject('approval','Explicit licensed/local authority required before electrical drawings');
 const section=Object.fromEntries(model.rooms.map(r=>{
  const requirements=items.filter(p=>p.room_id===r.id);
  return [r.id,{area_m2:+r.area_estimate_m2.toFixed(2),
   volume_m3_at_2_50m:+(r.area_estimate_m2*2.5).toFixed(2),
   intent_count:requirements.length,
   needs:[...new Set(requirements.map(p=>p.kind))],
   first_fix_intents:requirements.filter(p=>p.phase==='first_fix').map(p=>p.id),
   reversible_future_provisions:requirements.filter(p=>p.phase==='reserve').map(p=>p.id)}];
 }));
 return {
  schema:'ApartmentFirstFixAudit/1',
  project_status:'EXPLORATORY_ELECTRIC_LIGHT_HVAC_REQUIREMENTS_NOT_INSTALLATION_DRAWING',
  source:{canonical_sha256:model.canonical_sha256,parent_scene_revision:scene.scene_revision,
    locked_finished_ceiling_mm:brief.finished_ceiling_height_mm,
    original_rooms:rooms.length},
  summary:{service_intents:items.length,
    room_count:roomsCovered.size,
    kinds:kindsCount,conceptual_light_groups:zones,
    mandatory_scopes:mustHave},
  rooms:section,
  validation:{errors,warnings,passed:errors.length===0},
  must_review_before_first_fix:brief.approvals,
  release_gate:'BLOCKED: NO SITE SURVEY, ACTUAL PRODUCT RATING, ENGINEER SIGNOFF, APPROVED AC / REFRIGERANT / CONDENSATE, ELECTRICAL CABLE / BREAKER DESIGN OR RCP',
  no_mutation:true,
  caveats:[
   'Room polygon size is derived from image-calibrated canonical apartment; no measured outlet locations.',
   'Requirements are not count of sockets, circuits, light luminaires or capacity calculations.',
   'Do not treat drawing this brief as authority to open walls or alter the existing kitchen separator.',
   'Egypt electrical safety, wet-room IP zones, protection, AC loads and fire access belong to qualified local professionals.'
  ]};
}
export {validateFirstFix};
