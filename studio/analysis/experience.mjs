/**
 * Home Experience Lab (v1): device, micro-comfort and lighting concepts
 * downstream of immutable Type B canonical geometry.
 *
 * No product purchases, installed electrical load approvals, MEP signoff or
 * automatic apartment-scene edits. All distances mm; volumes cubic metres.
 */
import {rectangle,pointInPolygon,polygonGap,polygonsTouchOrIntersect} from './geometry.mjs';

const finite=(n,label)=>{if(!Number.isFinite(n))throw new Error(label+' must be finite');return n;};
const positive=(n,label)=>{finite(n,label);if(n<=0)throw new Error(label+' must be >0');return n;};
const nonneg=(n,label)=>{finite(n,label);if(n<0)throw new Error(label+' must be >=0');return n;};
const round=(n,places=1)=>+n.toFixed(places);
const idsUnique=(items,label)=>{
 const ids=new Set();
 for(const a of items){
  if(!a.id||ids.has(a.id))throw new Error(label+' IDs must be nonempty and unique');
  ids.add(a.id);
 }
};
function sampledContained(poly,room){
 // Conservative sampling of straight polygon edges in the original non-convex room.
 // Not a continuous or as-built fit certificate.
 for(let i=0;i<poly.length;i++){
  const a=poly[i],b=poly[(i+1)%poly.length];
  for(let step=0;step<=16;step++){
   const t=step/16;
   if(!pointInPolygon([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t],room))return false;
  }
 }
 return true;
}
function expanded(item,gap){
 for(const k of ['left_mm','right_mm','rear_mm','front_mm'])nonneg(gap[k]??0,k);
 const left=gap.left_mm??0,right=gap.right_mm??0,rear=gap.rear_mm??0,front=gap.front_mm??0;
 const rot=(item.rot??0)*Math.PI/180;
 const deltaLocalX=(right-left)/2,deltaLocalY=(front-rear)/2;
 return rectangle({...item,
  cx:item.cx+deltaLocalX*Math.cos(rot)-deltaLocalY*Math.sin(rot),
  cy:item.cy+deltaLocalX*Math.sin(rot)+deltaLocalY*Math.cos(rot),
  w:item.w+left+right,d:item.d+front+rear});
}
function active(gates){
 const accepted=['verified','unknown','failed'];
 for(const [k,v] of Object.entries(gates||{}))
  if(!accepted.includes(v))throw new Error('Invalid gate value at '+k);
 return {
  failed:Object.entries(gates||{}).filter(([,v])=>v==='failed').map(([k])=>k),
  unknown:Object.entries(gates||{}).filter(([,v])=>v==='unknown').map(([k])=>k)
 };
}
export function requiredCleanAirCadR({area_m2,clear_height_m,clean_air_changes_per_hour=4.8}){
 positive(area_m2,'area_m2');positive(clear_height_m,'clear_height_m');
 positive(clean_air_changes_per_hour,'clean_air_changes_per_hour');
 const volume=area_m2*clear_height_m;
 return {room_volume_m3:round(volume,2),
  design_equivalent_clean_air_changes_h:clean_air_changes_per_hour,
  theoretical_cadr_m3h:round(volume*clean_air_changes_per_hour,1),
  basis:'Ideal-mixing room volume × desired equivalent clean-air changes/hour. 4.8 is an AHAM room-cleaner sizing benchmark, not required fresh-air ventilation.',
  limits:'This is *particle* cleaner clean-air delivery rate, not ventilation (outdoor air) rate or health outcome. Open doors, recirculation, placement, fan-speed noise, airflow and filtration for gases remain unmodeled.'};
}
export function assessCleanAirProduct({room_area_m2,clear_height_m,cadr_m3h,assumed_turbo=false}){
 const req=requiredCleanAirCadR({area_m2:room_area_m2,clear_height_m});
 positive(cadr_m3h,'cadr_m3h');
 const equivalent=round(cadr_m3h/req.room_volume_m3,2);
 return {required_reference:req,product_cadr_m3h:cadr_m3h,
  equivalent_clean_air_changes_h:equivalent,
  meets_assumed_4_8_reference:equivalent>=4.8,
  caveat:assumed_turbo
   ?'Rated CADR at high fan speed; real quiet-night speed CADR and noise unknown. Does not prove quiet sleeping operation.'
   :'Requires measured CADR and operating fan mode, filter availability, placement clearance and noise data.'};
}
export function assessExperiencePlacement({room,proposal,furniture,interior=[]}){
 if(!room?.id||!Array.isArray(room.poly))throw new Error('Exact source room required');
 if(!proposal?.id||!proposal?.position||!proposal.source)
  throw new Error('Proposal ID, position and source/assumption required');
 if(!['portable-floor','worktop','storage-only'].includes(proposal.position.mode))
  throw new Error('Explicit installation mode required');
 const p=proposal.position;
 const shape={cx:finite(p.cx,'cx'),cy:finite(p.cy,'cy'),w:positive(p.width_mm,'device width'),
  d:positive(p.depth_mm,'device depth'),rot:finite(p.rot??0,'rotation')};
 const polygon=rectangle(shape);
 const clearance=expanded(shape,p.operating_clearance_mm??{
  left_mm:0,right_mm:0,rear_mm:0,front_mm:0
 });
 const support=p.support_id&&furniture.find(f=>f.id===p.support_id);
 if(p.mode==='worktop'&&!support)throw new Error('Countertop use requires real support fixture ID');
 if(p.mode==='portable-floor'&&p.support_id)throw new Error('Floor device must not claim a countertop');
 const supportPoly=support?rectangle(support):null;
 const deviceInside=supportPoly?sampledContained(polygon,supportPoly):sampledContained(polygon,room.poly);
 const clearanceInsideRoom=sampledContained(clearance,room.poly);
 // Avoid counting soft rugs or wall art as full-height floor hazards. Furniture
 // collision testing remains conservative if item roles are unspecified.
 const hazards=furniture.filter(f=>f.id!==p.support_id
   &&!['rug','tv','lamp','art'].includes(f.type)).concat(interior.filter(o=>o.cx!=null&&o.cy!=null&&o.width_mm>0&&o.depth_mm>0)
     .map(o=>({id:o.id,cx:o.cx,cy:o.cy,w:o.width_mm,d:o.depth_mm,rot:o.rotation||0})));
 const overlaps=hazards.filter(o=>polygonsTouchOrIntersect(polygon,rectangle(o)))
   .map(o=>o.id);
 const nearest=hazards.map(o=>({id:o.id,gap_mm:round(polygonGap(polygon,rectangle(o)))}))
   .sort((a,b)=>a.gap_mm-b.gap_mm).slice(0,4);
 const warning=[];
 if(!deviceInside)warning.push('Device body not contained by the declared support/room footprint');
 if(!clearanceInsideRoom)warning.push('Operating envelope may extend beyond the modeled room');
 if(overlaps.length)warning.push('Device body conflicts with modeled furniture/joinery');
 if(p.mode==='storage-only')warning.push('Storage location must not be treated as an allowed ON/OPERATING location');
 if(p.mode==='worktop'&&support && !sampledContained(clearance,supportPoly))
  warning.push('Operating clearance extends beyond support worktop; may be acceptable only for unobstructed air space after real product review');
 if(proposal.heat_or_steam&&p.mode==='worktop')
  warning.push('Vent, vapor, overhead surfaces, adjacent hob heat and hot drawer pullout all require manufacturer/MEP review');
 const gates=active(proposal.gates);
 const blockers=[...gates.failed];
 if(!deviceInside||overlaps.length)blockers.push('physical_body_placement');
 return {
  id:proposal.id,category:proposal.category,room_id:room.id,mode:p.mode,
  footprint_m2:round(shape.w*shape.d/1e6,3),
  body_fits_nominal_support_or_room:deviceInside,
  operating_envelope_inside_room:clearanceInsideRoom,
  body_overlaps:overlaps,nearest_nominal_fixtures:nearest,
  physical_warnings:warning,
  hard_gate_failures:blockers,
  required_verification:gates.unknown,
  status:blockers.length?'REJECT_IN_THIS_FORM':
    p.mode==='storage-only'?'STORAGE_ONLY_DO_NOT_OPERATE':
    gates.unknown.length||warning.length?'EXPLORATORY_NEEDS_VERIFICATION':'GEOMETRY_ONLY_NOT_CONSTRUCTION_APPROVAL',
  source:proposal.source,
  limitations:'2D footprint, 16-edge-sample containment, not full-height/wall/ceiling, appliance exhaust or human-body collision. Image-calibrated model; site and manufacturer instructions prevail.'
 };
}
export function auditLightingIntent({zones,clear_height_mm=2500}){
 positive(clear_height_mm,'clear_height_mm');
 if(!Array.isArray(zones)||zones.length===0)throw new Error('Lighting zones required');
 idsUnique(zones,'lighting zone');
 const validFunctions=new Set(['ambient','task','accent','night','utility']);
 const rooms=new Map();
 const output=zones.map(z=>{
  if(!validFunctions.has(z.function)||!z.room_id)throw new Error('Lighting zone must name room and valid function');
  if(!['wired','plug-in','battery'].includes(z.connection))
   throw new Error('Lighting source requires connection intent');
  if(!z.control)throw new Error('Every light needs a user-friendly control scenario');
  if(!Number.isFinite(z.kelvin)||z.kelvin<1800||z.kelvin>6500)
   throw new Error('Concept CCT must be 1800–6500K');
  if(z.watts!=null)positive(z.watts,'watts');
  const flags=[];
  if(z.function==='night'&&!z.dimmable)flags.push('Night route light should be dimmable/very-low-glare; site demo required');
  if(z.connection==='wired'&&z.electrical_verified!==true)flags.push('Electrician first-fix, switching/dimming/driver access TBD');
  if(z.requires_ceiling_drop&&z.ceiling_section_verified!==true)
   flags.push('Proposed ceiling recess/driver must be proven within 2500mm finished clear target');
  if(!rooms.has(z.room_id))rooms.set(z.room_id,new Set());
  rooms.get(z.room_id).add(z.function);
  return {id:z.id,room_id:z.room_id,function:z.function,kelvin:z.kelvin,
   connection:z.connection,control:z.control,flags,
   status:flags.length?'DESIGN_INTENT_NOT_ENGINEERED':'FUNCTIONAL_INTENT'};
 });
 return {schema:'LayeredHomeLightingIntent/1',clear_height_mm,
  zones:output,
  room_layer_coverage:[...rooms].map(([room_id,kinds])=>({room_id,functions:[...kinds],
   includes_general:kinds.has('ambient'),includes_task:kinds.has('task'),
   includes_low_level_night:kinds.has('night')})),
  limitations:['No lux, UGR, beam photometry, fixture count, circuit load, shadow/glare compliance or electrical-code verification',
   'Location of drivers, sensors, fixtures, curtain tracks, HVAC grilles and 2500mm clear height must be coordinated from measured RCP.']};
}
