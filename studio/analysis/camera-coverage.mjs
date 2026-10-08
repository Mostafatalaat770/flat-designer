/**
 * Subject-in-frame preflight for existing Type B Three.js cameras.
 * Geometry-only image-space proxy; does NOT prove absence of occlusion,
 * adequate furniture detail, daylight realism, or human comfort.
 */
const finite=(a,id)=>{if(!Number.isFinite(a))throw new Error('Nonfinite '+id);return a;};
const norm=v=>{const d=Math.hypot(...v);if(d<.0001)throw new Error('Degenerate camera basis');return v.map(x=>x/d)};
const dot=(a,b)=>a.reduce((acc,x,i)=>acc+x*b[i],0);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
function projector({camera,model}){
 const p=camera?.position,t=camera?.target;
 if(!Array.isArray(p)||p.length!==3||!Array.isArray(t)||t.length!==3||
  !p.every(Number.isFinite)||!t.every(Number.isFinite))throw new Error('Exact 3D camera position and target required');
 const front=norm(t.map((x,i)=>x-p[i]));
 const right=norm(cross(front,[0,1,0]));
 const up=norm(cross(right,front));
 const vfov=(finite(camera.fov,'fov')*Math.PI/180)/2;
 if(vfov<.08||vfov>1.3)throw new Error('Unsupported camera FOV');
 const heightAspect=finite(camera.aspect,'aspect');
 if(heightAspect<=0)throw new Error('Camera aspect required');
 const hy=Math.tan(vfov),hx=hy*heightAspect;
 return point=>{
  if(!Array.isArray(point)||point.length!==3||!point.every(Number.isFinite))throw new Error('Invalid plan+height target');
  const world=[(point[0]-model.width_mm/2)/1000,point[2],(point[1]-model.depth_mm/2)/1000];
  const v=world.map((x,i)=>x-p[i]);
  const depth=dot(v,front);
  if(depth<=.03)return {depth_m:depth,ndc_x:null,ndc_y:null,in_frustum:false};
  const x=dot(v,right)/(depth*hx),y=dot(v,up)/(depth*hy);
  return {depth_m:+depth.toFixed(3),ndc_x:+x.toFixed(4),ndc_y:+y.toFixed(4),
    in_frustum:Math.abs(x)<=1&&Math.abs(y)<=1};
 };
}
/** Assessed subjects are original furniture IDs, not a camera title. */
export function assessLivingCameraCoverage({camera,model,furniture,ids,
 min_inner_margin=.15,min_count=3}){
 if(!Array.isArray(ids)||!ids.length||new Set(ids).size!==ids.length)throw Error('Unique subject furniture IDs required');
 if(!Number.isFinite(min_inner_margin)||min_inner_margin<0||min_inner_margin>=.5)throw Error('Invalid camera safety margin');
 const project=projector({camera,model});
 const result=ids.map(id=>{
  const f=furniture.find(x=>x.id===id);
  if(!f)throw new Error('Subject not in source furniture: '+id);
  const h=f.type==='tv' ? 1.2 : f.type==='coffeetable' ? 0.42 : 0.65;
  const p=project([f.cx,f.cy,h]);
  const inner=p.in_frustum&&Math.abs(p.ndc_x)<=1-min_inner_margin
    &&Math.abs(p.ndc_y)<=1-min_inner_margin;
  return {id,room_id:f.room_id,proxy_height_m:h,...p,inside_safe_frame:inner};
 });
 const safe=result.filter(x=>x.inside_safe_frame);
 return {schema:'LivingSubjectFrameProxy/1',camera_type:'ThreeJS-perspective-plan-source',
  subjects:result,proxy_visible_count:safe.length,expected_min_count:min_count,
  passed:safe.length>=min_count,
  caveat:'Projected nominal furniture centre only: no depth-buffer occlusion, object pixel percentage, lighting/shadows, furniture collision or seated-human validation. Render review still mandatory.'};
}
