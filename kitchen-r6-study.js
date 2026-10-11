// Isolated review overlay. Never called by the interactive viewer; no source edit.
import {kitchenGeometryEvidence} from './kitchen-render-truth.js';
export function kitchenR6Spec(option, detail = false) {
  const concepts = {L0:{under:false,hood:false,ceiling:false},L1:{under:true,hood:false,ceiling:false},L2:{under:true,hood:true,ceiling:false},L3:{under:false,hood:true,ceiling:true}};
  if (!Object.hasOwn(concepts,option) || (detail && option !== 'L2')) throw Error('Unknown R6 study');
  return {schema:'KitchenR6Study/1',status:'RENDER_ONLY',option,detail,concept:concepts[option],
    light_colour:'#fff1db',under_intensity:.28,hood_intensity:.65,ceiling_intensity:2.5,
    renderer_units_only:true,owner_approved:false,construction_approved:false,cloud_saved:false,manufacturer_selected:false};
}
export function applyKitchenR6Study(THREE, model, layout, furnG, scene, spec) {
  if (!spec) return null;
  const expected=kitchenR6Spec(spec.option,spec.detail);
  if (JSON.stringify(spec)!==JSON.stringify(expected)) throw Error('Unauthorized R6 overlay');
  const original=JSON.stringify(layout), geometry=kitchenGeometryEvidence(THREE,model,layout,furnG);
  if(geometry.uppers.length!==3 || geometry.backsplashes.length!==2 || geometry.counters.some(c=>c.generated_upper_bounds)) throw Error('R6 source authority missing');
  const overlay=new THREE.Group();overlay.name='R6_RENDER_ONLY_PROPOSAL';scene.add(overlay);
  const fixtures=[],finishes=[];
  const xyz=p=>[p[0]/1000-model.width_mm/2000,p[2]/1000,p[1]/1000-model.depth_mm/2000];
  const bounds=m=>{m.updateMatrixWorld(true);const b=new THREE.Box3().setFromObject(m);return {min:b.min.toArray(),max:b.max.toArray()};};
  const mesh=(id,w,h,d,p,material,matrix=null)=>{
    const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.name=id;
    m.position.fromArray(p);if(matrix)m.applyMatrix4(matrix);m.receiveShadow=true;
    m.userData.r6Proposal=true;overlay.add(m);return m;
  };
  const light=(id,p,t,intensity,angle)=>{
    const l=new THREE.SpotLight(spec.light_colour,intensity,4,angle,1,2);
    l.position.fromArray(p);l.target.position.fromArray(t);l.castShadow=true;
    l.shadow.mapSize.set(512,512);l.shadow.bias=-.0004;l.shadow.normalBias=.03;
    l.name=id;overlay.add(l,l.target);
    return {id,position:l.position.toArray(),target:l.target.position.toArray(),intensity,angle,penumbra:1,decay:2,cast_shadow:true,shadow_map:512};
  };
  const diffuser=new THREE.MeshStandardMaterial({color:'#fff9ee',emissive:spec.light_colour,emissiveIntensity:.3,roughness:.75});
  const housing=new THREE.MeshStandardMaterial({color:'#d6d4cf',roughness:.7,metalness:.15});
  if(spec.concept.under)for(const u of geometry.uppers){
    const source=layout.interior.objects.find(o=>o.id===u.source_id),g=furnG.children.find(g=>g.userData.interiorObjectId===u.source_id);
    g.updateMatrixWorld(true);const length=(source.width_mm-50)/1000,z=source.depth_mm/2000-.045;
    const profile=mesh('R6-U-'+u.source_id,length,.010,.020,[0,-.005,z],housing,g.matrixWorld);
    mesh('R6-DIFFUSER-'+u.source_id,length,.002,.014,[0,-.011,z],diffuser,g.matrixWorld);
    const count=Math.max(1,Math.ceil(length/.38)),emitters=[];
    for(let i=0;i<count;i++){
      const x=length*((i+.5)/count-.5),p=new THREE.Vector3(x,-.013,z).applyMatrix4(g.matrixWorld),t=new THREE.Vector3(x,-.62,z+.17).applyMatrix4(g.matrixWorld);
      emitters.push(light('R6-U-'+u.source_id+'-'+i,p.toArray(),t.toArray(),spec.under_intensity,Math.PI*.32));
    }
    fixtures.push({id:'R6-U-'+u.source_id,kind:'SHIELDED_LINEAR_PROFILE_PROXY',source_id:u.source_id,length_mm:source.width_mm-50,setback_from_front_mm:45,profile_bounds:bounds(profile),emitters,
      approximation:'Linear diffuser sampled by downward broad soft spots; no photometric IES, lux or installed product assumed.'});
  }
  if(spec.concept.hood){
    const g=furnG.children.find(g=>g.userData.fid==='starter-22');g.updateMatrixWorld(true);
    const emitters=[];
    for(const x of [-.16,.16]){
      const p=new THREE.Vector3(x,1.543,.10).applyMatrix4(g.matrixWorld),t=new THREE.Vector3(x,.87,0).applyMatrix4(g.matrixWorld);
      mesh('R6-HOOD-DIFFUSER-'+x,.075,.006,.018,[x,1.546,.10],diffuser,g.matrixWorld);
      emitters.push(light('R6-HOOD-'+x,p.toArray(),t.toArray(),spec.hood_intensity,Math.PI*.28));
    }
    fixtures.push({id:'R6-HOOD',source_id:'starter-22',kind:'HOOD_TASK_LIGHT_CAPABILITY_PROXY',emitters,
      requirement:'Future hood must supply independently controlled downward task light and accessible cleanable sealed optics without blocking filter removal. Product, heat clearance and extraction remain HOLD.'});
  }
  if(spec.concept.ceiling){
    for(const [id,p,t] of [['HOB',[9890,7895,2440],[9381,7895,870]],['SINK',[11181,7440,2440],[11181,6993,870]]]){
      const emitters=[light('R6-CEILING-'+id,xyz(p),xyz(t),spec.ceiling_intensity,Math.PI*.18)];
      mesh('R6-CEILING-TRIM-'+id,.07,.008,.07,xyz([p[0],p[1],2490]),housing);
      fixtures.push({id:'R6-CEILING-'+id,kind:'AIMED_CEILING_PROXY',source_id:null,emitters,requirement:'Separate supplemental circuit/controls and ceiling access subject to survey; no ceiling drop or source fixture relocation.'});
    }
  }
  if(spec.detail){
    const material=new THREE.MeshStandardMaterial({color:'#E5DED1',roughness:.68});
    for(const panel of geometry.backsplashes){
      const g=furnG.children.find(g=>g.userData.interiorObjectId===panel.source_id);g.updateMatrixWorld(true);
      const w=panel.dimensions_mm[0]/1000,d=panel.dimensions_mm[1]/1000;
      for(const [band,h,y] of [['BOTTOM',.07,-.035],['TOP',.03,.535]]){
        const m=mesh('R6-F1-'+panel.source_id+'-'+band,w,h,d,[0,y,0],material,g.matrixWorld);
        finishes.push({id:m.name,source_panel_id:panel.source_id,kind:'REMOVABLE_FINISH_SKIN_PROXY',bounds:bounds(m),nominal_height_mm:h*1000,not_fabrication_dimension:true});
      }
    }
    const p=geometry.backsplashes.find(p=>p.source_id==='KIT-A1-west-backsplash'),b=p.carcass_bounds;
    const m=mesh('R6-F1-HOOD-BAND',.005,.07,.6,xyz([(b.min_mm[0]+b.max_mm[0])/2,7895,1515]),material);
    finishes.push({id:m.name,source_panel_id:p.source_id,kind:'HOOD_ZONE_FINISH_SKIN_PROXY',bounds:bounds(m),nominal_height_mm:70,not_fabrication_dimension:true});
  }
  if(original!==JSON.stringify(layout))throw Error('R6 source mutation');
  return {schema:'KitchenR6OverlayEvidence/1',spec,fixtures,finishes,source_geometry_before:geometry,
    source_geometry_after:kitchenGeometryEvidence(THREE,model,layout,furnG),source_changed:false,
    measured_lux:null,wattage:null,wiring:null,product_selected:false};
}
