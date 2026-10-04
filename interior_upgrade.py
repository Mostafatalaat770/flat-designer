"""Reversible interior objects, extensible finishes and revision-bound AI views."""
from pathlib import Path
import json
ROOT=Path(__file__).resolve().parent
def apply_interior(s):
    def replace(old,new):
        nonlocal s
        assert old in s,old[:120]
        s=s.replace(old,new)
    registry='const INTERIOR_MATERIALS='+json.dumps(json.loads((ROOT/'interior-materials.json').read_text()),separators=(',',':'))+';\n'
    replace('/* Cloud layouts contain',registry+(ROOT/'interior-core.js').read_text()+'\n/* Cloud layouts contain')
    replace('  return safe;','  if(s.interior){safe.interior=interiorClone(s.interior);interiorAssertLayer(safe,MODEL);const report=interiorValidation(safe,MODEL,null,{circulation:false});if(!report.valid)throw new Error("Interior layout has hard placement failures.");}\n  return safe;')
    replace("if(key==='flooring')state.rooms[id].mat=value;", "if(key==='flooring'){state.rooms[id].mat=value;if(state.interior)delete state.interior.surface_materials['FLOOR-'+id];}")
    replace("['render','Images & agents']", "['objects','Interior objects'],['materials','Materials & surfaces'],['clearances','Clearance report'],['variants','Saved variants'],['render','Images & agents']")
    replace("  $('#studioRoom').onchange=", "  interiorExtendPanel();\n  $('#studioRoom').onchange=")
    replace("window.ApartmentStudio={",(ROOT/'interior-controls.js').read_text()+"\nwindow.ApartmentStudio={selectInterior:interiorSelect,surfaces:()=>interiorSurfaces(MODEL),materials:()=>interiorMaterials(state),validateInterior:()=>interiorValidation(state,MODEL),saveView:interiorSaveView,")
    replace("validateProposal:p=>{studioValidateProposal(p,state,MODEL);return {valid:true};}","validateProposal:p=>{const review=interiorReviewProposal(p);if(!review.valid){const error=new Error(review.validation.checks.find(c=>c.status==='FAIL')?.message||'Invalid proposal');error.validation=review.validation;throw error;}return review;}")
    replace("studioRenderBrief(state,MODEL,studioUI.room,STUDIO_CATALOG)","interiorRenderBrief(state,MODEL,studioUI.room,STUDIO_CATALOG,interiorMatchingView(studioUI.room))")
    replace("renderBrief:rid=>studioRenderBrief(state,MODEL,rid,STUDIO_CATALOG)","renderBrief:rid=>interiorRenderBrief(state,MODEL,rid,STUDIO_CATALOG,interiorMatchingView(rid))")
    replace("studioValidateProposal(p,state,MODEL);$('#proposalPreview').textContent=JSON.stringify(p,null,2);", "const review=interiorReviewProposal(p);$('#proposalPreview').textContent=JSON.stringify({proposal:p,validation:review.validation},null,2);$('#applyProposal').disabled=!review.valid;")
    replace('<button class="btn primary" id="studioOptions">','<button class="btn" id="saveAiView">Save view for AI render</button><button class="btn primary" id="studioOptions">')
    replace('Image generation and screenshots are separate.','Save view for AI render captures this camera and PNG for connected agents. Image generation uses that saved view.')
    replace('</style>',(ROOT/'interior.css').read_text()+'\n</style>')
    # Stable host-bound rendering lives alongside furniture, never in canonical arrays.
    replace('<g id="gFurn"></g>','<g id="gFurn"></g><g id="gInterior"></g>')
    replace('mutate(() => state.rooms[id].mat = b.dataset.mat)','mutate(() => {state.rooms[id].mat=b.dataset.mat;if(state.interior)delete state.interior.surface_materials["FLOOR-"+id];})')
    replace("state.furniture=kind==='shell'?[]:defaultFurniture();","state.furniture=kind==='shell'?[]:defaultFurniture();if(kind==='shell'&&state.interior){state.interior.objects=[];state.interior.opening_treatments={};}")
    replace('renderGrid(); renderRooms(); renderFurn();','renderGrid(); renderRooms(); renderFurn();interiorRenderPlan();')
    replace('const stage =', (ROOT/'scene-asset-readiness.js').read_text()+'\nconst stage =')
    replace('function buildFurn(){',(ROOT/'interior-scene.js').read_text()+'\nfunction buildFurn(){')
    replace('state.furniture.forEach(f => furnG.add(buildFurniture(f)));','state.furniture.forEach(f => furnG.add(buildFurniture(f)));\n  buildInteriorObjects();')
    replace('floorMat(state.rooms[r.id].mat)','interiorSurfaceMaterial("FLOOR-"+r.id,floorMat(state.rooms[r.id].mat),"floor")')
    replace("mat(decorSurface('ceiling','#fbfaf7'),{roughness:1})","interiorSurfaceMaterial('CEILING-'+r.id,mat(decorSurface('ceiling','#fbfaf7'),{roughness:1}),'ceiling')")
    replace('studioWallMaterials(s,wallMat,capMat)','interiorWallMaterials(s,studioWallMaterials(s,wallMat,capMat),height)')
    replace('opt.cut, state.decor.active, state.studio]','opt.cut, state.decor.active, state.studio, state.interior]')
    replace('state.furniture,state.decor.active]','state.furniture,state.decor.active,state.interior,opt.cut,state.studio]')
    replace('state.decor.active,state.furniture,opt.cut,state.studio]','state.decor.active,state.furniture,opt.cut,state.studio,state.interior]')
    replace('  applySceneLighting();\n  $(\'#sunT\')','  applySceneLighting();interiorApplyLight();\n  $(\'#sunT\')')
    replace('for(const lamp of studioLampFootprints)', 'for(const o of interiorLayer(state).objects){const f=interiorResolved(o,MODEL);if(f.bottom_mm>=2100||f.top_mm<100||f.type===\'curtain\')continue;const dx=x-wx(f.cx),dz=z-wz(f.cy),a=f.rot*Math.PI/180;if(Math.abs(dx*Math.cos(a)+dz*Math.sin(a))<M(f.w)/2+r&&Math.abs(-dx*Math.sin(a)+dz*Math.cos(a))<M(f.d)/2+r)return true;}\n    for(const lamp of studioLampFootprints)')
    replace('while (o && !o.userData.fid && o !== scene)','while (o && !o.userData.fid && !o.userData.interiorObjectId && o !== scene)')
    replace('if (o?.userData.fid) return {fid:o.userData.fid};','if(o?.userData.interiorObjectId)return {interiorId:o.userData.interiorObjectId};\n    if (o?.userData.fid) return {fid:o.userData.fid};')
    replace("else if (h?.fid) window.select({kind:'furn', id:h.fid});","else if(h?.interiorId)window.ApartmentStudio.selectInterior(h.interiorId);\n    else if (h?.fid) window.select({kind:'furn', id:h.fid});")
    replace('window.View3D={enter,exit,relang,','window.View3D={enter,exit,relang,captureAiView,currentRoom:currentInteriorRoom,')
    replace('function openingCurtains(o,theme){','function openingCurtains(o,theme){\n  if(state.interior?.opening_treatments[o.id]||interiorLayer(state).objects.some(x=>x.placement.host_opening_id===o.id))return;')
    return s
