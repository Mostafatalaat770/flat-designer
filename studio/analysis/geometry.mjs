/**
 * Apartment spatial calculations, v1. Pure SI-independent 2D math in millimetres.
 * All angles are DEGREES. This is geometry, not anthropometric or building-code approval.
 *
 * Unlike legacy axis-aligned bbox helpers this supports arbitrarily rotated furniture,
 * non-rectangular polygons, door sweep samples, and positive-area collision checks.
 */
const EPS = 1e-7;
function finite(n,label){if(!Number.isFinite(n))throw new TypeError(label+' must be finite');return n}
export const xy = (x,y)=>[finite(x,'x'),finite(y,'y')];
export function rectangle(item){
  for(const k of ['cx','cy','w','d'])finite(item[k],k);
  if(item.w<=0||item.d<=0)throw new RangeError('Furniture width/depth must be positive');
  const rad=finite(item.rot??0,'rot')*Math.PI/180,c=Math.cos(rad),s=Math.sin(rad);
  return [[-item.w/2,-item.d/2],[item.w/2,-item.d/2],[item.w/2,item.d/2],[-item.w/2,item.d/2]]
    .map(([x,y])=>xy(item.cx+x*c-y*s,item.cy+x*s+y*c));
}
function poly(p,label='polygon'){
 if(!Array.isArray(p)||p.length<3||p.some(q=>!Array.isArray(q)||q.length!==2||q.some(v=>!Number.isFinite(v))))
   throw new TypeError(label+' must have >=3 finite [x,y] vertices');
 return p;
}
export const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
function onSegment(p,a,b){
 return Math.abs(cross(a,b,p))<EPS&&p[0]>=Math.min(a[0],b[0])-EPS&&p[0]<=Math.max(a[0],b[0])+EPS&&
  p[1]>=Math.min(a[1],b[1])-EPS&&p[1]<=Math.max(a[1],b[1])+EPS;
}
export function pointInPolygon(p,vertices){
 poly(vertices);xy(...p);
 // Including boundary (suitable for a point; physical radius needs extra wall clearance).
 let inside=false;
 for(let i=0,j=vertices.length-1;i<vertices.length;j=i++){
  const a=vertices[i],b=vertices[j];
  if(onSegment(p,a,b))return true;
  if((a[1]>p[1])!==(b[1]>p[1]) && p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])inside=!inside;
 }
 return inside;
}
const edges=p=>p.map((v,i)=>[v,p[(i+1)%p.length]]);
export function distancePointSegment(p,a,b){
 const dx=b[0]-a[0],dy=b[1]-a[1],l2=dx*dx+dy*dy;
 if(l2<EPS)return distance(p,a);
 const t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/l2));
 return distance(p,[a[0]+dx*t,a[1]+dy*t]);
}
export function minEdgeDistance(p,vertices){
 poly(vertices);xy(...p);
 return Math.min(...edges(vertices).map(([a,b])=>distancePointSegment(p,a,b)));
}
function segmentIntersect(a,b,c,d){
 const c1=cross(a,b,c),c2=cross(a,b,d),c3=cross(c,d,a),c4=cross(c,d,b);
 if(((c1>EPS&&c2< -EPS)||(c1< -EPS&&c2>EPS))&&((c3>EPS&&c4< -EPS)||(c3< -EPS&&c4>EPS)))return true;
 return (Math.abs(c1)<=EPS&&onSegment(c,a,b))||(Math.abs(c2)<=EPS&&onSegment(d,a,b))||
  (Math.abs(c3)<=EPS&&onSegment(a,c,d))||(Math.abs(c4)<=EPS&&onSegment(b,c,d));
}
export function polygonsTouchOrIntersect(a,b){
 poly(a,'a');poly(b,'b');
 if(a.some(v=>pointInPolygon(v,b))||b.some(v=>pointInPolygon(v,a)))return true;
 return edges(a).some(([c,d])=>edges(b).some(([e,f])=>segmentIntersect(c,d,e,f)));
}
function ccwArea(vertices){
 let sum=0;for(let i=0;i<vertices.length;i++){const a=vertices[i],b=vertices[(i+1)%vertices.length];sum+=a[0]*b[1]-b[0]*a[1];}
 return sum/2;
}
const lerp=(a,b,t)=>[a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])];
function convexClip(subject,clip){
 const sign=Math.sign(ccwArea(clip));
 if(!sign)throw new RangeError('Clip polygon has zero area');
 let result=subject;
 for(const [a,b] of edges(clip)){
  const original=result;result=[];
  if(!original.length)break;
  for(let i=0;i<original.length;i++){
   const p=original[i],q=original[(i+1)%original.length];
   const vp=sign*cross(a,b,p),vq=sign*cross(a,b,q);
   const inP=vp>=-EPS,inQ=vq>=-EPS;
   if(inP&&inQ)result.push(q);
   else if(inP&&!inQ){const d=vp-vq;if(Math.abs(d)>EPS)result.push(lerp(p,q,vp/d));}
   else if(!inP&&inQ){const d=vp-vq;if(Math.abs(d)>EPS)result.push(lerp(p,q,vp/d));result.push(q);}
  }
 }
 return result;
}
function isConvex(p){
 const signs=edges(p).map(([a,b],i)=>cross(a,b,p[(i+2)%p.length]));
 return signs.every(x=>x>=-EPS)||signs.every(x=>x<=EPS);
}
export function overlapAreaConvex(a,b){
 poly(a,'a');poly(b,'b');
 if(!isConvex(a)||!isConvex(b))throw new Error('Overlap area requires convex polygons; do not silently compute wrong area for concave rooms');
 const clipped=convexClip(a,b);
 return clipped.length>=3?Math.abs(ccwArea(clipped)):0;
}
export function polygonGap(a,b){
 poly(a,'a');poly(b,'b');
 const touching=polygonsTouchOrIntersect(a,b);
 if(touching)return 0;
 let d=Infinity;
 for(const v of a)for(const [s,e] of edges(b))d=Math.min(d,distancePointSegment(v,s,e));
 for(const v of b)for(const [s,e] of edges(a))d=Math.min(d,distancePointSegment(v,s,e));
 return d;
}
export function relation(a,b){
 const gapMm=polygonGap(a,b);
 const collisionAreaMm2=isConvex(a)&&isConvex(b)?overlapAreaConvex(a,b):null;
 return {gap_mm:+gapMm.toFixed(3),touches:polygonsTouchOrIntersect(a,b),
  overlap_area_mm2:collisionAreaMm2===null?null:+collisionAreaMm2.toFixed(3),
  intersects_positive_area:collisionAreaMm2!==null?collisionAreaMm2>EPS:null};
}
export function hingeLeaf({hinge,length_mm,thickness_mm=18,angle_deg}){
 const [x,y]=hinge;xy(x,y);finite(angle_deg,'angle_deg');
 if(!(length_mm>0&&thickness_mm>0))throw new RangeError('Invalid door leaf dimensions');
 const a=angle_deg*Math.PI/180,c=Math.cos(a),s=Math.sin(a),h=thickness_mm/2;
 // Local leaf runs from hinge to tip; includes the hinge-side panel thickness.
 return [[0,-h],[length_mm,-h],[length_mm,h],[0,h]].map(([u,v])=>[x+u*c-v*s,y+u*s+v*c]);
}
export function sweepLeaf({hinge,length_mm,thickness_mm=18,closed_angle_deg,open_angle_deg,step_deg=2}){
 if(!(step_deg>0&&step_deg<=10))throw new RangeError('Use a step_deg in (0,10] for door sweep approximation');
 finite(closed_angle_deg,'closed_angle_deg');finite(open_angle_deg,'open_angle_deg');
 const count=Math.max(1,Math.ceil(Math.abs(open_angle_deg-closed_angle_deg)/step_deg));
 if(count>360)throw new RangeError('Door sweep excessive');
 return Array.from({length:count+1},(_,i)=>hingeLeaf({hinge,length_mm,thickness_mm,
  angle_deg:closed_angle_deg+(open_angle_deg-closed_angle_deg)*i/count}));
}
export function sweepRelation(doorSweep,obstacle){
 poly(obstacle,'obstacle');
 if(!doorSweep?.length)throw new Error('Door sweep missing');
 const relations=doorSweep.map(x=>relation(x,obstacle));
 return {min_gap_mm:Math.min(...relations.map(x=>x.gap_mm)),
  any_intersection:relations.some(x=>x.touches),positive_overlap_samples:relations.filter(x=>x.intersects_positive_area).length,
  samples:doorSweep.length,
  note:'Sampled leaf rectangles only; between-angle motion, handle and hinge clearances need product-specific verification.'};
}
