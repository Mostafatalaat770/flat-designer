import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {runStudy} from './study.mjs';
import {source,domain,model,room} from '../circulation-v55/route-library.mjs';
import {pointInPolygon} from '../../studio/analysis/geometry.mjs';
import {findPlanRoute} from '../../studio/analysis/route.mjs';
const r=JSON.parse(fs.readFileSync(new URL('./results.json',import.meta.url)));
assert.equal(source.scene_revision,'scene-9cf45a73');assert.equal(source.storage_revision,55);
assert.equal(source.canonical_sha256,model.canonical_sha256);assert.deepEqual(runStudy(),r);
for(const c of r.candidates){
 assert.deepEqual(domain.applyProposal(source.layout,c.proposal),c.layout);
 assert.equal(domain.revision(c.layout),c.scene_revision);assert.equal(c.validation.fail,0);
 assert.deepEqual(c.layout.demolished,source.layout.demolished);assert.deepEqual(c.layout.rooms,source.layout.rooms);
 const ids=c.proposal.operations.filter(o=>o.type==='update-furniture').map(o=>o.furniture_id);
 for(const f of source.layout.furniture.filter(f=>!ids.includes(f.id)))assert.deepEqual(c.layout.furniture.find(x=>x.id===f.id),f);
 for(const f of source.layout.furniture.filter(f=>ids.includes(f.id)))for(const key of ['w','d','rot','type','room_id'])assert.equal(c.layout.furniture.find(x=>x.id===f.id)[key],f[key]);
 const pendant=c.layout.interior.objects.find(o=>o.id==='A-dining-pendant'),table=c.layout.furniture.find(f=>f.id==='starter-35');
 assert.equal(pendant.cx,table.cx);assert.equal(pendant.cy,table.cy);
 const snapshot=JSON.parse(fs.readFileSync(new URL('./candidates/'+c.id+'/snapshot.json',import.meta.url)));
 const brief=JSON.parse(fs.readFileSync(new URL('./candidates/'+c.id+'/brief.json',import.meta.url)));
 assert.deepEqual(snapshot.layout,c.layout);assert.equal(snapshot.production_connected,false);
 assert.equal(snapshot.storage_revision,null);assert.deepEqual(domain.importBrief(brief),c.layout);
}
for(let y=4950.754+12.5;y<10231.317;y+=25)for(let x=8981.529+12.5;x<16035.418;x+=25)
 if(pointInPolygon([x,y],r.input.boundary))assert.ok(pointInPolygon([x,y],room('RECP-01').poly));
let independent=0;
for(const s of r.stages){
 assert.equal(s.reservations_valid,!['baseline-400','baseline-500','end-inset-60-600-wide'].includes(s.id));
 for(const route of s.routes)if(route.status==='MODEL_ROUTE_FOUND')assert.equal(route.audit.status,'NO_DETECTED_SAMPLED_CONFLICT');
 if(['baseline-350','baseline-400','end-inset-60-400','table-north-150-350'].includes(s.id))
  for(const route of s.routes.filter(r=>['living','serve-NE'].includes(r.id))){
   const actual=findPlanRoute({room:r.input.boundary,obstacles:[...r.input.obstacles,...s.added].map(o=>o.polygon),
    start:route.start,goal:route.goal,agent_radius_mm:250,grid_mm:route.grid_mm,max_cells:150000});
   assert.equal(actual.status,route.status,s.id+' '+route.id+' '+route.grid_mm);independent++;
  }
}
assert.ok(r.stages.find(s=>s.id==='baseline-400').reservation_conflicts.some(c=>c.a==='starter-39'&&c.b==='starter-40'));
for(const access of r.seat_access){
 const found=!(access.variant==='end-inset-60'&&access.entry_door_state==='open'&&access.chair_id==='starter-39');
 assert.equal(access.status==='MODEL_ROUTE_FOUND',found);
 if(found)assert.equal(access.audit.status,'NO_DETECTED_SAMPLED_CONFLICT');
}
for(const s of r.entry_close_sequences){assert.equal(s.status,'SAMPLED_SEQUENCE_FOUND');assert.equal(s.audit.status,'NO_DETECTED_SAMPLED_CONFLICT');}
for(const overlay of r.combined_door_overlays)for(const route of overlay.routes)
 if(route.status==='MODEL_ROUTE_FOUND')assert.equal(route.audit.status,'NO_DETECTED_SAMPLED_CONFLICT');
for(const overlay of r.combined_door_overlays)if(overlay.variant==='table-north-150')
 assert.ok(overlay.routes.filter(r=>['living','kitchen-approach','serve-NE-diagonal'].includes(r.id)).every(r=>r.status==='MODEL_ROUTE_FOUND'));
if(!process.argv.includes('--geometry-only')){
 const hashes=JSON.parse(fs.readFileSync(new URL('./evidence/sha256.json',import.meta.url)));
 for(const [file,hash] of Object.entries(hashes))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(new URL(file,import.meta.url))).digest('hex'),hash,file);
 const html=fs.readFileSync(new URL('./review.html',import.meta.url),'utf8');
 const combined=r.combined_door_overlays.find(c=>c.variant==='table-north-150'&&c.guest_angle_deg===0);
 const points=combined.routes.find(r=>r.id==='living'&&r.grid_mm===50).route_mm.map(p=>p.join(',')).join(' ');
 assert.equal(html.match(/<polyline id="combined-route" points="([^"]+)"/)[1],points,'Combined SVG route differs from the audited source.');
}
console.log(JSON.stringify({stages:r.stages.length,route_cases:r.stages.reduce((n,s)=>n+s.routes.length,0),
 candidates:r.candidates.length,independent_repository_routes:independent,seat_access_cases:r.seat_access.length,
 combined_door_route_cases:r.combined_door_overlays.reduce((n,s)=>n+s.routes.length,0),entry_close_cases:r.entry_close_sequences.length,
 frozen_source_results:'match'},null,2));
