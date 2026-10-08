/**
 * A12 reusable, pure family-workflow geometry. Every scenario must attach
 * measured/source IDs; these calculations are NOT code or anthropometric approval.
 */
import {rectangle,polygonGap,relation} from './geometry.mjs';
import {findPlanRoute} from './route.mjs';
const near=(a,b,t=.01)=>Math.abs(a-b)<=t;
export function box(x0,y0,x1,y1){if(!(x1>x0&&y1>y0))throw Error('Invalid rectangle');return [[x0,y0],[x1,y0],[x1,y1],[x0,y1]];}
export const bounds=p=>({
 x0:Math.min(...p.map(v=>v[0])),y0:Math.min(...p.map(v=>v[1])),
 x1:Math.max(...p.map(v=>v[0])),y1:Math.max(...p.map(v=>v[1]))
});
export function offsetPoly(p,dy){return p.map(([x,y])=>[x,y+dy]);}
export function prepareSixSeatDining(furniture,{chair_pullback_mm=0}={}){
 if(!Number.isFinite(chair_pullback_mm)||chair_pullback_mm<0||chair_pullback_mm>500)
  throw Error('chair_pullback_mm sensitivity limited to 0..500');
 const chairIds=['starter-36','starter-37','starter-38','starter-39',
 'A2-dining-chair-north-centre','A2-dining-chair-south-centre'];
 const all=chairIds.map(id=>{
  const f=furniture.find(o=>o.id===id);if(!f||f.type!=='chair')throw Error('Missing K12 six-seat chair: '+id);
  return structuredClone(f);
 });
 const north=all.filter(f=>f.cy<7500),south=all.filter(f=>f.cy>7500);
 if(north.length!==3||south.length!==3)throw Error('Expected 3 north, 3 south chairs');
 const pulled=all.map(f=>({...f,cy:f.cy+(f.cy<7500?-chair_pullback_mm:chair_pullback_mm)}));
 const table=furniture.find(o=>o.id==='starter-35');
 if(!table||table.w!==2000||table.d!==950)throw Error('Missing source six-seat table 2000×950');
 return {chairIds,original:all,pulled,table,chair_pullback_mm};
}
export function kitchenFamilyMetrics({layout,audit,island_shift_mm=0,chairs_pullback_mm=350,
 dining_agent_radius_mm=180,route_grid_mm=100}){
 if(![0,100,150,200].includes(island_shift_mm))throw Error('Not a studied wet island shift');
 const get=id=>{const x=layout.furniture.find(f=>f.id===id);if(!x)throw Error('No furniture '+id);return x;};
 const originalIsland=get('E2-island'),originalSink=get('E2-island-sink');
 const island={...originalIsland,cy:originalIsland.cy-island_shift_mm};
 const sink={...originalSink,cy:originalSink.cy-island_shift_mm};
 const doors=audit.appliance_opening_proxy.envelopes;
 const findDoor=id=>{const v=doors.find(x=>x.id===id);if(!v)throw Error('No appliance door proxy '+id);return v;};
 const dwProxy=findDoor('dishwasher');
 const dwOpen=offsetPoly(dwProxy.poly,-island_shift_mm);
 const ovenOpen=findDoor('E2-oven-column').poly;
 const wasteOpen=offsetPoly(findDoor('waste/cutlery').poly,-island_shift_mm);
 const tall=get('E2-oven-column');
 const pantry=layout.interior.objects.find(o=>o.id==='E2-pantry-tall');
 if(!pantry||!Number.isFinite(pantry.cx))throw Error('No actual concept pantry tall object');
 const pantryPoly=rectangle({cx:pantry.cx,cy:pantry.cy,w:pantry.width_mm,d:pantry.depth_mm,rot:pantry.rotation||0});
 const dwUser=box(11982,7700-island_shift_mm,12582,8300-island_shift_mm);
 const pulled=prepareSixSeatDining(layout.furniture,{chair_pullback_mm:chairs_pullback_mm});
 const prep={x0:audit.end_operator_proxy.x0,x1:audit.end_operator_proxy.x1,
  y0:audit.end_operator_proxy.y0-island_shift_mm,y1:audit.end_operator_proxy.y1-island_shift_mm};
 const prepPoly=box(prep.x0,prep.y0,prep.x1,prep.y1);
 const nearest=pulled.pulled.map(x=>({
   chair_id:x.id,gap_mm:+polygonGap(prepPoly,rectangle(x)).toFixed(1),
   side:x.cy<7500?'north':'south'
 })).sort((a,b)=>a.gap_mm-b.gap_mm||a.chair_id.localeCompare(b.chair_id));
 const chairPoly=pulled.pulled.map(rectangle);
 const tablePoly=rectangle(pulled.table);
 const dwBounds=bounds(dwOpen),pantryBounds=bounds(pantryPoly);
 const dwOpenRemaining=pantryBounds.y0-dwBounds.y1;
 const sinkW=box(11382,7050-island_shift_mm,11982,7650-island_shift_mm);
 const ovenGap=relation(dwOpen,ovenOpen);
 const pantryPersonGap=relation(dwUser,pantryPoly);
 const northChairs=pulled.pulled.filter(x=>x.cy<7500);
 const diningRoom=audit.reception_room_polygon;
 if(!diningRoom)throw Error('Pass exact canonical reception poly for routes');
 const diningObstacles=[...chairPoly,tablePoly,rectangle(island),prepPoly];
 const start=[13350,5650],goal=[13350,8900];
 const route=findPlanRoute({room:diningRoom,obstacles:diningObstacles,
   start,goal,agent_radius_mm:dining_agent_radius_mm,grid_mm:route_grid_mm});
 // The max-state route tests a FULL six-chair pullback; it is not a true
 // simultaneous physical dining-to-kitchen pathway through unapproved walls.
 return {
  case_id:'wet-island-'+island_shift_mm+'mm__chairs-'+chairs_pullback_mm+'mm__radius-'+dining_agent_radius_mm,
  source_snapshot_revision:audit.source_revision,
  wet_island_north_shift_mm:island_shift_mm,
  dishwasher:{
   modeled_door_projection_mm:dwProxy.projection_mm,
   door_to_pantry_closed_face_mm:+dwOpenRemaining.toFixed(1),
   open_door_plus_600mm_user_to_pantry_mm:pantryPersonGap.gap_mm,
   user_overlaps_pantry:pantryPersonGap.intersects_positive_area,
   standing_body_nominal_buffer_mm:+(dwOpenRemaining-600).toFixed(1),
   door_to_oven_open_gap_mm:ovenGap.gap_mm,
   door_to_oven_positive_overlap_area_mm2:ovenGap.overlap_area_mm2,
   door_vs_waste_open:relation(dwOpen,wasteOpen),
   sink_user_versus_oven:relation(sinkW,ovenOpen),
   caveat:'650mm DW door, 600mm standing box, oven/pantry footprints and 500mm waste slide are planning proxies, not manufacturer kinematics or human ergonomics'
  },
  west_cook_projected_gap_mm:(island.cx-island.w/2)-(get('E2-cooking-base').cx+get('E2-cooking-base').d/2),
  island_to_lounge_nominal_gap_mm:+polygonGap(rectangle(island),rectangle(get('starter-32'))).toFixed(1),
  dining:{
   six_seats:6,chair_pullback_mm:chairs_pullback_mm,
   closest_prep_operator_to_chair:nearest[0],
   all_prep_chair_gaps:nearest,
   closest_chair_to_reception_sideboard_mm:null,
   hypothetical_person_radius_mm:dining_agent_radius_mm,
   origin_mm:start,destination_mm:goal,
   local_reception_route:route,
   caveat:'A full-reception 2D path only, not permission to cross the original kitchen structural separator. Chairs pulled an assumed fixed 350mm, not product-specific movement; path does not model people seated on all chairs.'
  },
  no_architectural_approval:true
 };
}
