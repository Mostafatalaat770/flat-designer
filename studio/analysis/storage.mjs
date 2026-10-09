/**
 * Spatial Foundation v2 — transparent cabinet access/capacity estimates.
 *
 * We assess FIT and an explicit single-SKU packing upper bound, not household
 * inventory sufficiency. Mixed storage uses an honest upper bound only.
 * Sizes in mm, volume in litres. No implied manufacturer-measured internals.
 */
function positive(n,name){if(!Number.isFinite(n)||n<=0)throw new Error(name+' must be >0 finite');return n;}
function nonnegative(n,name){if(!Number.isFinite(n)||n<0)throw new Error(name+' must be >=0 finite');return n;}
const dims=(o,name)=>{
 if(!o||typeof o!=='object')throw new Error('Missing dimensions for '+name);
 return {width_mm:positive(o.width_mm,name+'.width'),
   depth_mm:positive(o.depth_mm,name+'.depth'),
   height_mm:positive(o.height_mm,name+'.height')};
};
const round=(v,n=2)=>+v.toFixed(n);
export function estimateCabinetNet({
 outer_mm,side_mm,back_mm,top_mm,bottom_mm,toe_kick_mm=0,
 reserved_depth_mm=0,source_reference,site_verified=false
}){
 const outer=dims(outer_mm,'outer');
 for(const [name,n] of Object.entries({side_mm,back_mm,top_mm,bottom_mm,toe_kick_mm,reserved_depth_mm}))
  nonnegative(n,name);
 if(!source_reference||typeof source_reference!=='string')throw new Error('Source reference required');
 const net={
  width_mm:outer.width_mm-2*side_mm,
  depth_mm:outer.depth_mm-back_mm-reserved_depth_mm,
  height_mm:outer.height_mm-top_mm-bottom_mm-toe_kick_mm};
 for(const [k,n] of Object.entries(net))positive(n,k);
 return {schema:'CabinetNetEstimate/1',outer_mm:outer,net_mm:net,
  usable_volume_upper_bound_l:round(net.width_mm*net.depth_mm*net.height_mm/1e6),
  source_reference,verified:site_verified===true,
  caveat:'External footprint minus explicitly declared construction allowances. Shelves, drawer runners, hinges and access may further reduce usable capacity; bulk volume is not storage-fit evidence.'};
}
function bay(spec){
 if(!spec.id)throw new Error('Bay ID required');
 if(!spec.source_reference)throw new Error('Net bay dimensions must state product/shop drawing or estimate source');
 const net=dims(spec.net_mm,'bay '+spec.id);
 let access={kind:'UNKNOWN',clear_width_mm:null,clear_height_mm:null};
 if(spec.access){
  if(!['open','hinged','sliding','drawer'].includes(spec.access.kind))throw new Error('Unsupported bay access system');
  access={...spec.access};
  if(access.kind!=='open'){
   positive(access.clear_width_mm,'aperture clear_width_mm');
   positive(access.clear_height_mm,'aperture clear_height_mm');
   if(access.kind==='sliding'&&access.clear_width_mm>net.width_mm)
    throw new Error('Sliding opening cannot exceed declared net cabinet width');
  }
 }
 return {...spec,net_mm:net,access};
}
function item(spec){
 if(!spec.id)throw new Error('Inventory item ID required');
 return {...spec,size_mm:dims(spec.size_mm,'item '+spec.id),
  quantity:positive(spec.quantity,'quantity'),
  stackable:spec.stackable===true};
}
function rotations(p){
 const d=p.size_mm;
 return [
  {label:'width-depth',width_mm:d.width_mm,depth_mm:d.depth_mm,height_mm:d.height_mm},
  {label:'depth-width',width_mm:d.depth_mm,depth_mm:d.width_mm,height_mm:d.height_mm}
 ];
}
function fitSingle(stock,unit){
 const possibilities=rotations(stock).map(p=>{
  const accessW=unit.access.kind==='open'?unit.net_mm.width_mm:unit.access.clear_width_mm;
  const accessH=unit.access.kind==='open'?unit.net_mm.height_mm:unit.access.clear_height_mm;
  const fitsFront=unit.access.kind!=='UNKNOWN'&&p.width_mm<=accessW&&p.height_mm<=accessH;
  const fitsBay=p.width_mm<=unit.net_mm.width_mm&&p.depth_mm<=unit.net_mm.depth_mm&&p.height_mm<=unit.net_mm.height_mm;
  const perLayer=Math.floor(unit.net_mm.width_mm/p.width_mm)*Math.floor(unit.net_mm.depth_mm/p.depth_mm);
  const layers=stock.stackable?Math.floor(unit.net_mm.height_mm/p.height_mm):1;
  const upper=perLayer*layers;
  return {...p,fits_front:fitsFront,fits_internal:fitsBay,capacity_upper_bound:fitsFront&&fitsBay?upper:0};
 });
 const feasible=possibilities.filter(p=>p.fits_front&&p.fits_internal);
 const best=feasible.sort((a,b)=>b.capacity_upper_bound-a.capacity_upper_bound)[0];
 return {
  item_id:stock.id,bay_id:unit.id,requested_count:stock.quantity,
  status:unit.access.kind==='UNKNOWN'?'ACCESS_UNVERIFIED':
    !best?'NO_ITEM_FIT':
      stock.quantity>best.capacity_upper_bound?'EXCEEDS_SINGLE_TYPE_UPPER_BOUND':'SINGLE_TYPE_FIT_PLAUSIBLE',
  envelope:best||null,
  upper_bound_units:best?.capacity_upper_bound??0,
  limitation:'Capacity is a simple axis-aligned grid upper bound for a SINGLE item type. Real mixed shelving, handles, pot lids, stacking stability, weight, drawers and retrieval require testing.'};
}
export function auditCabinetAllocations({bays,inventory,allocations}){
 if(!Array.isArray(bays)||!Array.isArray(inventory)||!Array.isArray(allocations))
  throw new Error('Bays, inventory and allocations arrays required');
 const unique=(arr,label)=>{
  const ids=arr.map(x=>x.id);
  if(new Set(ids).size!==ids.length)throw new Error('Duplicate '+label+' ID');
 };
 const cabinets=bays.map(bay),items=inventory.map(item);
 unique(cabinets,'bay');unique(items,'inventory');
 const byBay=new Map(cabinets.map(x=>[x.id,x]));
 const byItem=new Map(items.map(x=>[x.id,x]));
 const allocated=new Set();
 const inspections=allocations.map(a=>{
  if(!a.id||allocated.has(a.id))throw new Error('Allocation ids must be unique');
  allocated.add(a.id);
  const b=byBay.get(a.bay_id),i=byItem.get(a.item_id);
  if(!b||!i)throw new Error('Unknown bay or item in '+a.id);
  if(!Number.isInteger(a.count)||a.count<=0)throw new Error('Assigned quantity must be positive integer');
  const assessment=fitSingle({...i,quantity:a.count},b);
  return {allocation_id:a.id,assigned_count:a.count,...assessment};
 });
 const countByItem=new Map(items.map(i=>[i.id,inspections.filter(x=>x.item_id===i.id).reduce((s,x)=>s+x.assigned_count,0)]));
 const missing=items.map(i=>({id:i.id,needed:i.quantity,assigned:countByItem.get(i.id),
  missing:i.quantity-countByItem.get(i.id)})).filter(x=>x.missing!==0);
 const groupByBay=new Map(cabinets.map(b=>[b.id,inspections.filter(x=>x.bay_id===b.id)]));
 const overbooked=cabinets.map(b=>{
  const a=groupByBay.get(b.id);
  const mixed=a.length>1;
  const total=a.reduce((v,x)=>v+x.assigned_count*(
   Object.values(byItem.get(x.item_id).size_mm).reduce((product,n)=>product*n,1)),0);
  return {id:b.id,item_types:a.length,
   aggregate_item_vol_l:round(total/1e6),
   cuboid_net_volume_l:round(b.net_mm.width_mm*b.net_mm.depth_mm*b.net_mm.height_mm/1e6),
   mixed_item_packing_unverified:mixed,
   aggregate_volume_exceeds_upper_bound:total>b.net_mm.width_mm*b.net_mm.depth_mm*b.net_mm.height_mm};
 });
 return {schema:'CabinetInventoryFitAudit/1',status:'EXPLORATORY_NET_STORAGE',
  bays:cabinets.map(b=>({id:b.id,source_reference:b.source_reference,net_mm:b.net_mm,access:b.access})),
  inspections,inventory_mismatch:missing,by_bay:overbooked,
  hard_fit_rejections:inspections.filter(x=>['NO_ITEM_FIT','EXCEEDS_SINGLE_TYPE_UPPER_BOUND'].includes(x.status)),
  unresolved:inspections.filter(x=>x.status==='ACCESS_UNVERIFIED').map(x=>x.allocation_id)
   .concat(overbooked.filter(x=>x.mixed_item_packing_unverified).map(x=>x.id+':mixed-packing')),
  verdict:missing.length||inspections.some(x=>['NO_ITEM_FIT','EXCEEDS_SINGLE_TYPE_UPPER_BOUND'].includes(x.status))
   ||overbooked.some(x=>x.aggregate_volume_exceeds_upper_bound)?'REVISE_OR_REJECT':'PLAUSIBLE_BUT_NOT_PROVEN',
  caveat:'Even PLAUSIBLE is NOT family-storage approval: one-SKU grid caps, mixed packing, cabinet fittings, ergonomics and actual household items require shop drawings and inventory.'};
}
