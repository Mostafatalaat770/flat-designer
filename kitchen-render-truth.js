// Shared by the classic production viewer and the extracted Studio builder.
// A saved elevated wall sideboard in a kitchen is the source-defined upper run.
// Suppress the demo asset's ENTIRE optional upper stack in that room, including
// portions outside the explicit run: those portions have no source cabinet ID.
export function sourceKitchenUppers(layout, roomId) {
  return (layout.interior?.objects || []).filter(o => o.room_id === roomId &&
    o.type === 'sideboard' && o.placement?.mode === 'wall' &&
    o.placement.elevation_mm >= 1200 && o.height_mm > 0);
}
export function sourceKitchenBacksplashes(layout, roomId) {
  return (layout.interior?.objects || []).filter(o => o.room_id === roomId &&
    o.type === 'wall-panel' && o.placement?.mode === 'wall' &&
    o.placement.elevation_mm >= 800 && o.placement.elevation_mm <= 1000 &&
    o.height_mm >= 300 && o.depth_mm <= 30);
}
export function kitchenCounterTruth(layout, furniture, rooms) {
  const kitchen = rooms.some(r => r.id === furniture.room_id && r.kind === 'kitchen');
  return {
    upper_ids: kitchen ? sourceKitchenUppers(layout, furniture.room_id).map(o => o.id) : [],
    backsplash_ids: kitchen ? sourceKitchenBacksplashes(layout, furniture.room_id).map(o => o.id) : [],
  };
}

export function applyKitchenDoorFinishExperiment(THREE, experiment, doors, woodMaterial) {
  if (!experiment) return null;
  const specs = {
    D0: null,
    D1: {colour:'#D8D1C5',roughness:.72,appearance:'PAINT_PROXY'},
    D2: {colour:'#BCA98F',roughness:.72,appearance:'PROCEDURAL_WOOD_PROXY'},
  };
  const ids = ['OP-RECP-KIT','OP-KIT-TERSVC'];
  const expected = {schema:'KitchenDoorFinishExperiment/1',status:'RENDER_ONLY',
    variant:experiment.variant,door_ids:ids,finish:specs[experiment.variant],
    owner_approved:false,construction_approved:false,cloud_saved:false,manufacturer_selected:false};
  if (!Object.hasOwn(specs,experiment.variant) || JSON.stringify(experiment)!==JSON.stringify(expected))
    throw new Error('Unauthorized kitchen door finish experiment');
  const records=[];
  const shape = (door, leaf) => {
    door.pivot.updateMatrixWorld(true);
    const bounds=new THREE.Box3().setFromObject(leaf);
    return {id:door.id,width_m:door.width,hinge:door.pivot.position.toArray(),
      a0:door.a0,a1:door.a1,open:door.open,position:door.cur,
      leaf_parameters:{width:leaf.geometry.parameters.width,height:leaf.geometry.parameters.height,depth:leaf.geometry.parameters.depth},
      leaf_matrix:leaf.matrixWorld.toArray(),leaf_bounds:{min:bounds.min.toArray(),max:bounds.max.toArray()}};
  };
  for (const id of ids) {
    const door=doors.find(d=>d.id===id && !d.sliding);
    if (!door?.pivot) throw new Error('Missing kitchen door '+id);
    const leaf=door.pivot.children.find(n=>n.geometry?.type==='BoxGeometry' && n.userData.door===door);
    if (!leaf) throw new Error('Missing kitchen door leaf '+id);
    const before=shape(door,leaf), original_colour='#'+leaf.material.color.getHexString();
    if (expected.finish) {
      const material=(experiment.variant==='D2'?woodMaterial(expected.finish.colour):leaf.material).clone();
      material.color.set(expected.finish.colour);
      material.roughness=expected.finish.roughness;
      leaf.material=material;
    }
    const after=shape(door,leaf);
    if(JSON.stringify(before)!==JSON.stringify(after)) throw new Error('Door geometry changed');
    records.push({id,original_colour,rendered_colour:'#'+leaf.material.color.getHexString(),
      appearance:expected.finish?.appearance || 'ORIGINAL_SOURCE_RENDERED_PAINT',before,after});
  }
  return {...expected,doors:records,geometry_changed:false};
}

// Measured Three.js r160 meshes, not dimensions inferred from screenshots.
// Bounds use canonical plan X/Y in mm, and elevation in mm, in that order.
export function kitchenGeometryEvidence(THREE, model, layout, furnG) {
  furnG.updateMatrixWorld(true);
  const planBounds = box => ({
    min_mm: [box.min.x * 1000 + model.width_mm / 2, box.min.z * 1000 + model.depth_mm / 2, box.min.y * 1000],
    max_mm: [box.max.x * 1000 + model.width_mm / 2, box.max.z * 1000 + model.depth_mm / 2, box.max.y * 1000],
  });
  const bounds = nodes => {
    const b = new THREE.Box3();
    for (const n of nodes) b.union(new THREE.Box3().setFromObject(n));
    return b.isEmpty() ? null : planBounds(b);
  };
  const counters = [], uppers = [], hoods = [], backsplashes = [];
  for (const f of layout.furniture.filter(f => f.room_id === 'KIT-01')) {
    const group = furnG.children.find(g => g.userData.fid === f.id);
    if (!group) continue;
    if (f.type === 'counter') {
      const upper = group.children.filter(n => n.geometry && n.position.y >= 1.465 && n.position.y <= 2.18);
      const splash = group.children.filter(n => n.geometry?.parameters?.height === .62);
      counters.push({ source_id: f.id, source_footprint: {cx:f.cx,cy:f.cy,w:f.w,d:f.d,rot:f.rot},
        generated_upper_bounds: bounds(upper), generated_upper_mesh_count: upper.length,
        generated_backsplash_bounds: bounds(splash), total_bounds: bounds([group]) });
    }
    if (f.type === 'stove') {
      const hood = group.children.filter(n => n.geometry && n.position.y >= 1.5);
      hoods.push({source_id:f.id, status:'LEGACY_HOOD_PROXY_NOT_MANUFACTURER', bounds:bounds(hood)});
    }
  }
  for (const o of layout.interior?.objects || []) {
    if (o.room_id !== 'KIT-01') continue;
    const group = furnG.children.find(g => g.userData.interiorObjectId === o.id);
    if (!group) continue;
    const record = { source_id:o.id, host_wall_id:o.placement.host_wall_id || null,
      dimensions_mm:[o.width_mm,o.depth_mm,o.height_mm], placement:structuredClone(o.placement),
      carcass_bounds:bounds(group.children.slice(0,1)), rendered_bounds:bounds([group]) };
    if (sourceKitchenUppers(layout,'KIT-01').some(x => x.id === o.id)) uppers.push(record);
    if (sourceKitchenBacksplashes(layout,'KIT-01').some(x => x.id === o.id)) backsplashes.push(record);
  }
  return {schema:'KitchenRenderedGeometry/1',coordinates:'canonical plan X / plan Y / elevation, millimetres',counters,uppers,hoods,backsplashes};
}
