"""Install full style scenes without changing canonical architecture or layout."""
from pathlib import Path
ROOT=Path(__file__).resolve().parent

def apply_scenes(s):
    def replace(old,new):
        nonlocal s
        assert old in s,old[:110]
        s=s.replace(old,new)
    replace('safe.decor=normalizeDecor(s.decor,safe.furniture);','safe.decor=normalizeDecor(s.decor,safe.furniture);\n  migrateSceneFinishes(safe,s.decor);')
    replace('id="vTop" data-en="Top">俯视</button>','''id="vTop" data-en="Top">俯视</button><select id="interiorView" aria-label="Interior camera view"><option value="">Interior view…</option><option value="living">Living room</option><option value="dining">Dining area</option><option value="master">Master bedroom</option><option value="bedroom1">Bedroom 1</option><option value="bedroom2">Bedroom 2</option></select>''')
    replace('Compare finishes while keeping furniture positions and lighting.','Compare complete furniture, material and lighting scenes in the same apartment.')
    replace('const opt = {cut:1.05,','const opt = {cut:state.decor.active===\'custom\'?1.05:H,')
    replace("let sigArch = '', sigFurn = '', sigLabels = '';", "let sigArch = '', sigFurn = '', sigLabels = '';\nlet sceneDecorG,sigSceneDecor='';") if "let sigArch = '', sigFurn = '', sigLabels = '';" in s else replace("let sigArch = '', sigFurn = '', sigLabels = '', grow = 1, furnGrow = 1;", "let sigArch = '', sigFurn = '', sigLabels = '', grow = 1, furnGrow = 1;\nlet sceneDecorG,sigSceneDecor='';")
    replace('scene.add(archFloor, archUp, furnG, labelG, lampG);','sceneDecorG=new THREE.Group();sceneDecorG.name=\'Style decor\';\n  scene.add(archFloor, archUp, furnG, labelG, lampG,sceneDecorG);')
    replace('const fabric = c => mat(c, {roughness:.96});','const fabric = c => sceneSurface(\'linen\',c);')
    replace('const woodM = c => mat(c, {roughness:.55});','const woodM = c => sceneSurface(\'wood\',c);')
    helper='\n'.join((ROOT/name).read_text() for name in ['scene-materials.js','scene-floors.js','scene-furniture.js','scene-decor.js'])
    replace('function buildFurniture(f){',helper+'\nfunction buildFurniture(f){\n  const styled=makeStyleFurniture(f);if(styled)return styled;')
    # The classic capture path shares the explicit workstation model with Studio.
    replace("case 'ksink': {\n      const st =", "case 'ksink': {\n      if(f.workstation){studioWorkstationSink(g,f,w,d);break;}\n      const st =")
    replace("lightoak:{sx:1.8,sy:.36,base:'#e0d0b3',rough:.65},", "parquet:{sx:1.2,sy:1.2,base:'#c9a678',rough:.58},travertine:{sx:1.2,sy:.6,base:'#dfcfb4',grout:'#c6b798',rough:.62},lightoak:{sx:2.2,sy:.40,base:'#e0d0b3',rough:.65},")
    replace('  if (wood){','  if(sceneFloorPaint(kind,g,W,Hh,s,R)){}else if (wood){')
    replace('new THREE.MeshStandardMaterial({map:t, roughness:s.rough})','sceneFloorMaterial(t,s)')
    replace("  if (force || l !== sigLabels){ sigLabels = l; buildLabels(); }", "  if (force || l !== sigLabels){ sigLabels = l; buildLabels(); }\n  const decorSig=JSON.stringify([state.decor.active,state.furniture,opt.cut]);\n  if(force||decorSig!==sigSceneDecor){sigSceneDecor=decorSig;buildSceneDecor();}")
    replace('  lampG.visible = grow > .99;','  lampG.visible = grow > .99;\n  if(sceneDecorG){sceneDecorG.scale.y=grow;sceneDecorG.visible=opt.furn;}')
    replace('o.intensity = opt.night ? 6 : 0','o.intensity = opt.night ? (state.decor.active===\'custom\'?6:1.3) : 0')
    replace('hemi.intensity = opt.night ? .12 : 1.1;','hemi.intensity = opt.night ? .30 : 1.1;')
    replace("  $('#sunT').textContent =", "  applySceneLighting();\n  $('#sunT').textContent =")
    replace("  $('#sun').oninput =", "  $('#interiorView').onchange=e=>{if(e.target.value)showInterior(e.target.value);};\n  $('#sun').oninput =")
    replace("$('#vIso').onclick = () => {", "$('#vIso').onclick = () => { $('#interiorView').value='';")
    replace("$('#vTop').onclick = () => {", "$('#vTop').onclick = () => { $('#interiorView').value='';")
    replace("opt.cut = +b.dataset.cut; syncCutBtns();", "opt.cut = +b.dataset.cut; if(opt.cut<H)$('#interiorView').value=''; syncCutBtns();")
    replace("b.dataset.room === '__all' ? flyTo(isoWhole()) : flyToRoom(b.dataset.room);", "$('#interiorView').value='';\n    b.dataset.room === '__all' ? flyTo(isoWhole()) : flyToRoom(b.dataset.room);")
    replace("if (k === 'furn'){ furnG.visible = opt.furn;", "if (k === 'furn'){ furnG.visible = opt.furn;sceneDecorG.visible=opt.furn;")
    replace('  const A=planPose(),B=isoWhole();','  const A=planPose(),B=state.decor.active===\'custom\'?isoWhole():interiorPose(\'living\');\n  if(state.decor.active!==\'custom\')$(\'#interiorView\').value=\'living\';')
    replace('window.View3D={enter,exit,relang,','''window.View3D={enter,exit,relang,
  async ensureInterior(){if(opt.cut<H){while(anim)await wait(80);showInterior('living');}},
  interior:id=>showInterior(id),''')
    # Schematic floor patterns stay downstream of selected material identifiers.
    extra='''
function buildSceneFloorDefs(){
  let p='<pattern id="m-parquet" patternUnits="userSpaceOnUse" width="1200" height="1200">';
  for(let y=0;y<2;y++)for(let x=0;x<2;x++)for(let k=0;k<4;k++){
    const v=(x+y)%2===0;p+=`<rect x="${x*600+(v?k*150:0)}" y="${y*600+(v?0:k*150)}" width="${v?150:600}" height="${v?600:150}" fill="${k%2?'#caaa7f':'#c5a171'}" stroke="#a38255" stroke-width="7"/>`;
  }
  p+='</pattern><pattern id="m-travertine" patternUnits="userSpaceOnUse" width="1200" height="600"><rect width="1200" height="600" fill="#dfcfb4"/><path d="M0 0H1200M0 0V600" stroke="#bfae91" stroke-width="8"/><path d="M0 140H1200M0 420H1200" stroke="#c4b491" stroke-width="22" opacity=".25"/></pattern>';
  $('#defs').insertAdjacentHTML('beforeend',p);
}
'''
    replace('applyStaticLang(); syncFullscreen();\nbuildDefs();',extra+'\napplyStaticLang(); syncFullscreen();\nbuildDefs();buildSceneFloorDefs();')
    replace('/* Type B studio */','''#interiorView{font:inherit;font-size:14px;min-height:34px;max-width:160px;border:1px solid var(--line);border-radius:4px;background:white;color:var(--ink);padding:4px 6px}
/* Type B studio */''')
    return s
