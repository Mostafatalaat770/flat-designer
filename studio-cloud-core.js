/* Cloud layouts contain furnishing only. Architecture always comes from MODEL. */
function studioLogicalKey(value){
  const ordered=v=>Array.isArray(v)?v.map(ordered):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,ordered(v[k])])):v;
  return studioSceneKey(ordered(value));
}
function studioAssertLayout(l,model,types){
  const object=v=>v&&typeof v==='object'&&!Array.isArray(v);
  const colour=v=>typeof v==='string'&&/^#[0-9a-f]{6}$/i.test(v);
  const safeId=v=>typeof v==='string'&&/^[a-zA-Z0-9_-]{1,80}$/.test(v)&&!['__proto__','prototype','constructor'].includes(v);
  if(!object(l)||Object.keys(l).some(k=>!['modelVersion','sourceCanonicalHash','rooms','furniture','decor','studio','demolished','measures','interior'].includes(k)))throw new Error('Only furnishing layouts can be saved. Architecture is locked.');
  if(l.modelVersion!==model.canonical_version||l.sourceCanonicalHash&&l.sourceCanonicalHash!==model.canonical_sha256)throw new Error('Different canonical apartment.');
  if(!Array.isArray(l.demolished)||l.demolished.length)throw new Error('Walls and openings are locked.');
  if(!object(l.rooms)||Object.keys(l.rooms).length!==model.rooms.length)throw new Error('Expected the canonical room IDs.');
  for(const r of model.rooms){const v=l.rooms[r.id];if(!object(v)||Object.keys(v).some(k=>!['name','mat'].includes(k))||typeof v.name!=='string'||v.name.length>80||!STUDIO_OPTIONS.flooring.includes(v.mat))throw new Error('Invalid room finishes or labels.');}
  if(!Array.isArray(l.furniture)||l.furniture.length>300)throw new Error('Expected up to 300 furniture items.');
  const ids=new Set();
  for(const f of l.furniture){
    if(!object(f)||!safeId(f.id)||ids.has(f.id)||!types.includes(f.type)||typeof f.name!=='string'||f.name.length>80||!colour(f.color)||!['cx','cy','w','d','rot'].every(k=>Number.isFinite(f[k]))||f.w<50||f.d<50||f.w>10000||f.d>10000||Math.abs(f.cx)>100000||Math.abs(f.cy)>100000||Math.abs(f.rot)>360000)throw new Error('Invalid furniture records.');
    if(f.variant!==undefined&&f.variant!=='style'&&!STUDIO_VARIANTS[f.type]?.includes(f.variant))throw new Error('Invalid furniture shape.');
    if(f.status!==undefined&&!['EXPLORATORY','INFERRED','TBD','VERIFIED'].includes(f.status))throw new Error('Invalid furniture status.');
    if(f.material_id!==undefined&&f.material_id!==null&&(typeof f.material_id!=='string'||!interiorMaterial(l,f.material_id)))throw new Error('Invalid furniture material reference.');
    if(f.product_reference_id!==undefined&&f.product_reference_id!==null&&(typeof f.product_reference_id!=='string'||!/^[a-zA-Z0-9_-]{1,100}$/.test(f.product_reference_id)))throw new Error('Invalid furniture product reference.');
    ids.add(f.id);
  }
  if(!object(l.studio)||l.studio.version!==1||!object(l.studio.rooms)||Object.keys(l.studio).some(k=>!['version','rooms'].includes(k)))throw new Error('Invalid room options.');
  for(const [id,options] of Object.entries(l.studio.rooms)){
    if(!model.rooms.some(r=>r.id===id&&!r.isTerrace)||!object(options)||Object.entries(options).some(([k,v])=>!studioValidateOption(k,v)))throw new Error('Invalid room options; heights are locked.');
  }
  if(!object(l.decor)||!['custom','warm','japandi','boho'].includes(l.decor.active)||l.decor.sceneVersion!==2||!object(l.decor.saved)||Object.keys(l.decor).some(k=>!['active','sceneVersion','saved'].includes(k)))throw new Error('Invalid decor style.');
  for(const [id,s] of Object.entries(l.decor.saved)){
    if(!['custom','warm','japandi','boho'].includes(id)||!object(s)||!object(s.rooms)||!object(s.colours))throw new Error('Invalid saved style.');
    if(Object.entries(s.rooms).some(([id,mat])=>!model.rooms.some(r=>r.id===id)||!STUDIO_OPTIONS.flooring.includes(mat))||Object.entries(s.colours).some(([id,c])=>!safeId(id)||!colour(c)))throw new Error('Invalid saved finishes.');
  }
  if(!Array.isArray(l.measures)||l.measures.length>100||l.measures.some(m=>!object(m)||!object(m.a)||!object(m.b)||![m.a.x,m.a.y,m.b.x,m.b.y].every(Number.isFinite)))throw new Error('Invalid measurements.');
  interiorAssertLayer(l,model);
  const report=interiorValidation(l,model,null,{circulation:false});if(!report.valid){const error=new Error("Interior layout has hard failures. Review placements before saving.");error.validation=report;throw error;}
  return l;
}
function studioPrepareCloudLayout(layout,model,types){
  studioAssertLayout(layout,model,types);
  const l=JSON.parse(JSON.stringify(layout));
  delete l.sourceCanonicalHash;
  const ids=new Set(l.furniture.map(f=>f.id));
  for(const f of l.furniture)f.variant??='style';
  for(const s of Object.values(l.decor.saved))s.colours=Object.fromEntries(Object.entries(s.colours).filter(([id])=>ids.has(id)));
  l.decor.saved[l.decor.active]={rooms:Object.fromEntries(model.rooms.map(r=>[r.id,l.rooms[r.id].mat])),colours:Object.fromEntries(l.furniture.map(f=>[f.id,f.color]))};
  return l;
}
function studioDesignBrief(layout,model,catalog,cloud){
  const revision=studioSceneKey(layout);
  return {schema:'ApartmentDesignBrief/1',canonical_sha256:model.canonical_sha256,scene_revision:revision,canonical_source:'./sources/Apartment_Master_Spec_Type_B_v0.2.2_Geometry_Heights_Glazing(1).json',layout:JSON.parse(JSON.stringify(layout)),rooms:model.rooms,openings:model.openings,wall_segments:model.wall_segments,reference_catalog:catalog,verified:{clear_ceiling_m:2.50,concrete_underside_m:2.63,service_void_mm:130,living_glazing:'GLZ-RECP-N: sill 0.00 m, head 2.50 m'},rules:['Architecture and ceiling height are locked','Owner/family comfort and circulation first','Use exact IDs and source-pixel topology','Concealed HVAC faces are visual only; validate equipment, ducts, drains and access separately','Return ApartmentDesignProposal/1 or /2 with the same canonical hash and base_scene_revision'],interior_contract:interiorContext(model,layout),proposal_v2_template:{schema:'ApartmentDesignProposal/2',canonical_sha256:model.canonical_sha256,base_scene_revision:revision,operations:[],notes:[]},proposal_template:{schema:'ApartmentDesignProposal/1',canonical_sha256:model.canonical_sha256,base_scene_revision:revision,author:'designer-agent',operations:[],notes:[]},...(cloud?{cloud}:{})};
}
