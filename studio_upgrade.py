"""Independent room options, furniture references and agent exchange contract."""
from pathlib import Path
import json
ROOT=Path(__file__).resolve().parent
def apply_studio(s):
    def replace(old,new):
        nonlocal s
        assert old in s,old[:120]
        s=s.replace(old,new)
    core=(ROOT/'studio-core.js').read_text()
    catalog=json.loads((ROOT/'studio-catalog.json').read_text())
    replace('/* Finish experiments share',core+'\nconst STUDIO_CATALOG='+json.dumps(catalog,separators=(',',':'))+';\n/* Finish experiments share')
    replace('rooms, decor:defaultDecor(), demolished:[]','rooms, decor:defaultDecor(), studio:studioDefaults(), demolished:[]')
    replace('  migrateSceneFinishes(safe,s.decor);','  migrateSceneFinishes(safe,s.decor);\n  safe.studio=studioNormalize(s.studio,ROOMS);\n  for(const f of safe.furniture)f.variant=STUDIO_VARIANTS[f.type]?.includes(f.variant)?f.variant:\'style\';')
    replace('<button class="btn outline" id="originalPlan">','<button class="btn primary" id="studioOptions">Design options</button><button class="btn outline" id="originalPlan">')
    replace('<div id="toast" role=', '''<dialog id="studioDialog"><div class="dialog-heading"><b>Design your room</b><button class="btn" id="studioClose">Close</button></div><div id="studioBody"></div></dialog>
<dialog id="proposalDialog"><div class="dialog-heading"><b>Review agent proposal</b><button class="btn" id="proposalClose">Close</button></div><p>Validated against the current scene. Apply creates one undoable change.</p><pre id="proposalPreview"></pre><button class="btn primary" id="applyProposal">Apply proposal</button></dialog>
<div id="toast" role=''')
    replace("$('#decorTheme').onchange=", (ROOT/'studio-controls.js').read_text()+"\n$('#studioOptions').onclick=studioOpen;$('#studioClose').onclick=()=>$('#studioDialog').close();$('#proposalClose').onclick=()=>$('#proposalDialog').close();\n$('#decorTheme').onchange=")
    replace('state.rooms, state.demolished, opt.cut, state.decor.active','state.rooms, state.demolished, opt.cut, state.decor.active, state.studio')
    replace('state.decor.active,state.furniture,opt.cut','state.decor.active,state.furniture,opt.cut,state.studio')
    replace('[wallMat,wallMat,capMat,wallMat,wallMat,wallMat]','studioWallMaterials(s,wallMat,capMat)')
    replace('pl.position.set(wx(r.at[0]),H-.25,wz(r.at[1]));lampG.add(pl);','pl.position.set(wx(r.at[0]),H-.25,wz(r.at[1]));pl.userData.roomId=r.id;lampG.add(pl);')
    replace("if (o.isPointLight) o.intensity = opt.night ? (state.decor.active==='custom'?6:1.3) : 0;", "if(o.isPointLight){o.intensity = opt.night && studioRoomOptions(state,o.userData.roomId).lighting==='style' ? (state.decor.active==='custom'?6:1.3)*studioRoomOptions(state,o.userData.roomId).brightness/75 : 0;o.color.set(studioLightColour(studioRoomOptions(state,o.userData.roomId).temperature));}")
    replace('const t=currentDecor();if(t.id===\'custom\'||!STYLE_FURNITURE_TYPES.has(f.type))return null;', "const t=studioFurnitureTheme(f);if(t.id==='custom'||!STYLE_FURNITURE_TYPES.has(f.type))return null;")
    replace('const styled=makeStyleFurniture(f);if(styled)return styled;', 'const optionModel=makeStudioVariant(f);if(optionModel)return optionModel;\n  const styled=makeStyleFurniture(f);if(styled)return styled;')
    replace('function buildSceneDecor(){', (ROOT/'studio-scene.js').read_text()+'\nfunction buildSceneDecor(){')
    replace("clearGroup(sceneDecorG);const theme=currentDecor();if(theme.id==='custom'||!state.furniture.length)return;", "clearGroup(sceneDecorG);buildStudioRoomScene();const theme=currentDecor();if(theme.id==='custom'||!state.furniture.length){applySceneLighting();return;}")
    replace("function pendantAt(x,z,theme,rid,dining=false){", "function pendantAt(x,z,theme,rid,dining=false){\n  if(studioRoomOptions(state,rid).lighting!=='style')return;")
    replace("if(o.userData.sceneLight)o.intensity=o.userData.basePower*(opt.night?1:.20);", "if(o.userData.sceneLight){const v=studioRoomOptions(state,o.userData.roomId);o.color.set(studioLightColour(v.temperature));o.intensity=o.userData.basePower*(v.brightness/75)*(opt.night?1:.20);}")
    replace('if(m?.userData.sceneEmitter)m.emissiveIntensity=opt.night?.75:.18;', '''if(m?.userData.sceneEmitter){
        let parent=o;while(parent&&!parent.userData.roomId)parent=parent.parent;
        const rid=parent?.userData.roomId,v=studioRoomOptions(state,rid);
        let emitter=m;
        if(m.userData.studioRoom!==rid){emitter=m.clone();emitter.userData.studioRoom=rid;if(Array.isArray(o.material))o.material=o.material.map(x=>x===m?emitter:x);else o.material=emitter;}
        emitter.emissive.set(studioLightColour(v.temperature));emitter.emissiveIntensity=(opt.night?.75:.18)*v.brightness/75;
      }''')
    replace('  if(opt.furn){\n    for(const f of state.furniture){', '  if(opt.furn){\n    for(const lamp of studioLampFootprints)if(Math.hypot(x-lamp.x,z-lamp.z)<r+lamp.radius)return true;\n    for(const f of state.furniture){')
    replace("async ensureInterior(){if(opt.cut<H){while(anim)await wait(80);showInterior('living');}}", "async ensureInterior(id){if(opt.cut<H||id&&$('#interiorView').value!==id){while(anim)await wait(80);showInterior(id||'living');}}")
    replace('/* Type B studio */', (ROOT/'studio.css').read_text()+'\n/* Type B studio */')
    replace("$('#studioOptions').onclick=studioOpen;", "$('#studioOptions').onclick=studioOpen;document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#studioDialog').open){$('#studioDialog').close();$('#studioOptions').focus();}});")
    replace("t:[10600,1.12,1600]","t:[10600,1.50,1600]")
    replace("t:[14300,1.10,7400]","t:[14300,1.45,7400]")
    replace('FOV = 45','FOV = 60')
    return s
