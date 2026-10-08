import test from 'node:test';
import assert from 'node:assert/strict';
import {box,bounds,offsetPoly,prepareSixSeatDining} from './kitchen-dining.mjs';

function furnished(){
 const t={id:'starter-35',type:'table',cx:14670,cy:7500,w:2000,d:950,rot:0};
 const xs=[13970,14670,15370];
 return [t,...xs.map((cx,i)=>({id:['starter-36','A2-dining-chair-north-centre','starter-37'][i],
   type:'chair',cx,cy:6800,w:510,d:530,rot:0})),
 ...xs.map((cx,i)=>({id:['starter-38','A2-dining-chair-south-centre','starter-39'][i],
   type:'chair',cx,cy:8200,w:510,d:530,rot:180}))];
}
test('six seats remain exactly six; pullback moves seat users not dining table',()=>{
 const furniture=furnished(),original=JSON.stringify(furniture);
 const got=prepareSixSeatDining(furniture,{chair_pullback_mm:350});
 assert.equal(got.pulled.length,6);
 assert.equal(got.pulled.filter(x=>x.cy===6450).length,3);
 assert.equal(got.pulled.filter(x=>x.cy===8550).length,3);
 assert.equal(got.table.w,2000);
 assert.equal(JSON.stringify(furniture),original,'Pure: never mutate canonical or K12 base scene');
});
test('refuse missing seat and non-evidence based freeform chair moves',()=>{
 assert.throws(()=>prepareSixSeatDining(furnished().slice(1),{}),/Missing source six-seat table/);
 assert.throws(()=>prepareSixSeatDining(furnished().slice(0,-1),{chair_pullback_mm:350}),/Missing K12 six-seat chair/);
 assert.throws(()=>prepareSixSeatDining(furnished(),{chair_pullback_mm:900}),/limited/);
});
test('polygon shifting and bounds preserve same opening x and width',()=>{
 const p=box(11982,7050,12582,7700);
 const moved=offsetPoly(p,-150);
 assert.deepEqual(bounds(moved),{x0:11982,y0:6900,x1:12582,y1:7550});
 assert.deepEqual(bounds(p),{x0:11982,y0:7050,x1:12582,y1:7700});
});
