"""Adapt wy51ai/floorplan-3d without modifying the canonical architecture."""
from pathlib import Path
import re

ROOT=Path(__file__).resolve().parent
s=(ROOT/"upstream-index.html").read_text()

def replace(old,new):
    global s
    assert old in s, old[:120]
    s=s.replace(old,new)

def function(name,new):
    global s
    pattern=rf"(?:async )?function {name}\([^\n]*\)\{{.*?(?:\n\}}|\n\];\}})"
    s,n=re.subn(pattern,lambda m:new,s,count=1,flags=re.S)
    assert n==1,name

replace('<html lang="zh-CN">','<html lang="en">')
replace('width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover','width=device-width,initial-scale=1,viewport-fit=cover')
replace('<title>户型装修设计</title>','<title>Apartment Type B · 3D Studio</title>\n<meta name="description" content="Explore the Type B apartment in 2D and 3D, with a 2.50 m ceiling and a reversible furnishing example.">\n<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 32 32\'%3E%3Crect width=\'32\' height=\'32\' rx=\'7\' fill=\'%2313233e\'/%3E%3Cpath d=\'M8 8h10v5h6v11H8zM8 16h10M18 8v16\' fill=\'none\' stroke=\'%2379c4ed\' stroke-width=\'2\'/%3E%3C/svg%3E">')
replace('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js','./vendor/three/build/three.module.js')
replace('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/','./vendor/three/examples/jsm/')
replace("const LANG_KEY = 'huxing-lang';","const LANG_KEY = 'type-b-language-v1';")
s,n=re.subn(r"let LANG = .*?;\n", "let LANG = 'en';\n",s,count=1);assert n==1
replace("document.title = tr('户型装修设计', 'Floor Plan Designer');","document.title = 'Apartment Type B · 3D Studio';")
replace('<script>\n/* ======================= 多语言','<script src="./apartment-model.js"></script>\n<script>\n/* ======================= 多语言')
start=s.index('const WALLS = [')
end=s.index('const MATS = {',start)
s=s[:start]+'''const MODEL = APARTMENT_MODEL;
const ROOMS = MODEL.rooms;
const WALL_SEGMENTS = MODEL.wall_segments;
const WALLS = WALL_SEGMENTS.map(s => {
  const [x0,y0]=s.from, [x1,y1]=s.to, t=s.thickness_mm/2;
  if (x0===x1) return [x0-t,Math.min(y0,y1),x0+t,Math.max(y0,y1),s.kind==='low'?'low':'u'];
  if (y0===y1) return [Math.min(x0,x1),y0-t,Math.max(x0,x1),y0+t,s.kind==='low'?'low':'u'];
  return [Math.min(x0,x1)-t,Math.min(y0,y1)-t,Math.max(x0,x1)+t,Math.max(y0,y1)+t,'u'];
});
const WINS = MODEL.wins, DOORS = MODEL.doors, SLIDES = MODEL.slides;
const PASSAGES = MODEL.passages;
const R = (x0,y0,x1,y1) => [[x0,y0],[x1,y0],[x1,y1],[x0,y1]];
const printedText = r => r.printed_dimensions_m ? r.printed_dimensions_m.map(v=>v.toFixed(2)).join(' × ')+' m' : r.callouts.map(c=>c.dimensions_m.map(v=>v.toFixed(2)).join(' × ')+' m').join(' / ');
''' + s[end:]
function('defaultFurniture',"function defaultFurniture(){ return structuredClone(MODEL.starter_furniture); }")
replace("const STORE = 'huxing-design-v1';","const STORE = 'type-b-studio-v1';")
replace("return {furniture:defaultFurniture(), rooms, demolished:[], measures:[]};","return {modelVersion:MODEL.canonical_version, furniture:defaultFurniture(), rooms, demolished:[], measures:[]};")
function('fixState','''function fixState(s){
  if (!s || !Array.isArray(s.furniture)) throw new Error('Expected a furniture layout.');
  if (s.modelVersion && s.modelVersion !== MODEL.canonical_version) throw new Error('Different apartment model.');
  if (s.sourceCanonicalHash && s.sourceCanonicalHash !== MODEL.canonical_sha256) throw new Error('Different canonical apartment.');
  const d = defaultState();
  const safe = {modelVersion:MODEL.canonical_version, rooms:d.rooms, demolished:[], measures:[]};
  for (const r of ROOMS){
    const v=s.rooms?.[r.id];
    if (v && MATS[v.mat]) safe.rooms[r.id].mat=v.mat;
    if (v && typeof v.name==='string' && v.name.length<=80) safe.rooms[r.id].name=v.name;
  }
  safe.furniture=s.furniture.slice(0,300).map((f,i)=>{
    if (![f.cx,f.cy,f.w,f.d,f.rot].every(Number.isFinite) || f.w<50 || f.d<50 || f.w>10000 || f.d>10000) throw new Error('Invalid furniture dimensions.');
    if (!LIB.some(c=>c.items.some(it=>it[0]===f.type))) throw new Error('Unknown furniture type.');
    return {...f,id:'import-'+i,name:String(f.name||f.type).slice(0,80),color:/^#[0-9a-f]{6}$/i.test(f.color||'')?f.color:typeColor(f.type)};
  });
  safe.measures=Array.isArray(s.measures)?s.measures.filter(m=>m.a&&m.b&&[m.a.x,m.a.y,m.b.x,m.b.y].every(Number.isFinite)).slice(0,100):[];
  return safe;
}''')
replace('const BOUNDS = {x:-1850, y:-1750, w:15600, h:14100};','const BOUNDS = {x:-700, y:-650, w:MODEL.width_mm+1400, h:MODEL.depth_mm+1300};')
replace("const PANES = 'huxing-panes';","const PANES = 'type-b-panes-v1';")
replace("const OX = 6000, OY = 5300, H = 2.8, FOV = 45;","const OX = MODEL.width_mm/2, OY = MODEL.depth_mm/2, H = MODEL.height_m, FOV = 45;")
replace('const opt = {cut:2.8, furn:true, labels:true, night:false, hour:10, mode:\'orbit\'};','const opt = {cut:1.05, furn:true, labels:false, night:false, hour:10, mode:\'orbit\'};')
replace('data-cut="2.8"','data-cut="2.5"')
replace('data-cut="1.2"','data-cut="1.05"')
replace('class="btn chip on" data-cut="2.5"','class="btn chip" data-cut="2.5"')
replace('class="btn chip" data-cut="1.05"','class="btn chip on" data-cut="1.05"')
replace('class="btn chip on" data-t="labels"','class="btn chip" data-t="labels"')
replace('data-en="3BR 2LR 2BA · Interior Design"','data-en="Apartment Type B"')
replace('data-en="◧ Library"','data-en="Rooms & furniture"')
replace('data-en="Properties ◨"','data-en="Details"')
replace('data-en="Sun"','data-en="Light"')
replace('id="sun" min','title="Illustrative lighting only. Geographic orientation is unverified." id="sun" min')
replace('data-en="Measure"','data-en="Measure ≈"')
replace('data-en="Export plan JSON"','data-en="Save furniture layout"')
replace('data-en="Import plan"','data-en="Load furniture layout"')
replace('data-en="Reset to default"','data-en="Restore starter layout"')
replace('data-en="3D Scene"','data-en="3D Home"')
replace('<div class="grp" id="langSel"','<div class="grp" id="langSel" hidden')
replace('<div class="grp">\n      <button class="btn" id="undo"','<div class="grp history">\n      <button class="btn" id="undo"')
replace('<div class="grp only2d">\n      <button class="btn" id="zoomOut"','<div class="grp only2d zoomtools">\n      <button class="btn" id="zoomOut"')
replace('<div class="spacer"></div>\n    <div class="grp" id="langSel"','''<div class="grp presets">
      <button class="btn" id="shellPreset" title="Remove furnishing only; Undo restores it.">Empty shell</button>
      <button class="btn on" id="starterPreset" title="Replace furniture with the exploratory example; Undo restores your layout.">Starter furniture</button>
    </div>
    <button class="btn outline" id="originalPlan">Original plan</button>
    <div class="spacer"></div>
    <div class="grp" id="langSel"''')
replace('<div id="toast"></div>','''<div id="toast" role="status" aria-live="polite"></div>
<dialog id="sourceDialog"><div class="dialog-heading"><b>Developer plan · Type B</b><button id="closeSource" class="btn" aria-label="Close original plan">Close</button></div><img src="./source-plan.jpeg" alt="Original Type B apartment floor plan, including printed dimensions. Gross stated area 186 square metres."><p>Reference image. The interactive geometry is derived from the canonical JSON, not furniture drawn in this plan.</p></dialog>''')
function('toggleWall',"function toggleWall(){ toast('Apartment geometry is locked. Structural wall types have not been verified.'); }")
replace("function setTool(t){\n  ui.tool", "function setTool(t){\n  if (!['select','measure'].includes(t)) return toast('Apartment geometry is locked.');\n  ui.tool")
function('clearLayout','''function clearLayout(){
  if (!state.furniture.length) return toast('The shell is already empty.');
  ui.sel=null; mutate(()=>state.furniture=[]); toast('Empty shell. Undo restores your furnishing.');
}''')
function('renderWalls','''function renderWalls(){
  $('#gWalls').innerHTML=WALL_SEGMENTS.map(s=>{
    const [x0,y0]=s.from,[x1,y1]=s.to,L=Math.hypot(x1-x0,y1-y0),t=s.thickness_mm/2;
    const nx=-(y1-y0)/L*t,ny=(x1-x0)/L*t;
    const pts=[[x0+nx,y0+ny],[x1+nx,y1+ny],[x1-nx,y1-ny],[x0-nx,y0-ny]];
    return `<polygon class="wall" points="${pts.map(p=>p.join(',')).join(' ')}" fill="${s.kind==='low'?'#99aaba':'#263750'}"/>`;
  }).join('');
}''')
function('renderDims','''function renderDims(){
  const g=$('#gDims');
  g.innerHTML=ROOMS.filter(r=>r.at).map(r=>`<text x="${r.at[0]}" y="${r.at[1]+240}" font-size="170" text-anchor="middle" fill="#506682" stroke="#f5f8fc" stroke-width="35" paint-order="stroke">${esc(printedText(r))}</text>`).join('');
  g.setAttribute('display',ui.layers.dims?'inline':'none');
}''')
replace('${fmt(area(r.poly))} m²</text>','${ui.layers.dims?\'\':\'≈ \'+fmt(area(r.poly),1)+\' m²\'}</text>')
replace("const ui = {tool:'select', sel:null, mA:null, mCur:null,", "const ui = {tool:'select', sel:null, mA:null, mCur:null,")
replace('renderGrid(); renderRooms(); renderFurn(); renderWalls(); renderLabels(); renderMeasure(); renderSel(); renderPanel(); updateHeader();','renderGrid(); renderRooms(); renderFurn(); renderWalls(); renderLabels(); renderDims(); renderMeasure(); renderSel(); renderPanel(); updateHeader();')
function('updateHeader','''function updateHeader(){
  $('#subtitle').textContent='3 bedrooms · 2 bathrooms + WC · 3 terraces';
  $('#undo').disabled=!undoStack.length; $('#redo').disabled=!redoStack.length;
  $('#undo').style.opacity=undoStack.length?1:.4; $('#redo').style.opacity=redoStack.length?1:.4;
  $('#shellPreset').classList.toggle('on',!state.furniture.length);
  $('#starterPreset').classList.toggle('on',state.furniture.length>0);
}''')
function('overviewPanel','''function overviewPanel(){
  const rows=ROOMS.map(r=>`<tr class="click" data-room="${r.id}"><td>${esc(nm(state.rooms[r.id].name))}</td><td class="r">${esc(printedText(r))}</td></tr>`).join('');
  return `<section class="model-summary"><div class="eyebrow">YOUR HOME</div><h3>Type B <span class="model-tag">186 m²</span></h3><div class="summary-height"><strong>2.50<span> m</span></strong><p>Finished clear ceiling<br><span class="verified">VERIFIED</span></p></div><p class="muted">One continuous living & dining space. Three terraces. A private bedroom hall.</p></section>
  <section><h3>Explore the apartment</h3><table>${rows}</table><p class="muted small-note">Dimensions above are printed plan annotations. The 3D shape uses the image calibration and remains approximate.</p></section>
  <section><h3>Your furniture experiment</h3><p>${state.furniture.length} items · <span class="exploratory">EXPLORATORY</span></p><div class="actions"><button class="btn" id="clearMeasure">Clear measures (${state.measures.length})</button><button class="btn" id="clearFurn">Empty shell</button></div><p class="muted small-note">Move, rotate or resize furniture. Changes save on this device. Use File to export your layout.</p></section>
  <section><details class="model-notes"><summary>What is verified?</summary><p><b>VERIFIED</b><br>Room and opening relationships from canonical v${MODEL.canonical_version}. Clear ceiling 2.50 m. Living glazing GLZ-RECP-N runs from floor to ceiling.</p><p><b>INFERRED</b><br>Metric geometry uses ${MODEL.px_per_m} pixels per metre. Approximate wall envelopes follow the original image.</p><p><b>EXPLORATORY</b><br>Furniture, flooring and lighting are examples for understanding scale.</p><p><b>TBD</b><br>180 mm display wall thickness; 2.10 m door heads; bedroom window sill 0.90 m and head 2.10 m; terrace glazing heads 2.10 m; 1.00 m parapets; frame detail and geographic orientation. These are visual placeholders.</p><p class="muted">186 m² is the developer's stated gross area, not a measured usable floor area. This model is for exploration, not construction.</p><p><a href="https://github.com/wy51ai/floorplan-3d" target="_blank" rel="noopener">Based on floorplan-3d</a> · <a href="./LICENSE" target="_blank">MIT license</a></p></details></section>
  <section><h3>Controls</h3><div class="kbd"><kbd>Drag</kbd><span>Orbit or move a selected item</span><kbd>Scroll / pinch</kbd><span>Zoom</span><kbd>T</kbd><span>Switch 2D / 3D</span><kbd>R</kbd><span>Rotate selected furniture</span><kbd>WASD</kbd><span>Move in Walk mode</span><kbd>Undo</kbd><span>Restore previous furniture changes</span></div></section>`;
}''')
function('roomPanel','''function roomPanel(r){
  const st=state.rooms[r.id],a=area(r.poly),inside=state.furniture.filter(f=>pointInRoom([f.cx,f.cy],r.poly));
  const mats=Object.entries(MATS).map(([k,m])=>`<button class="mat ${k===st.mat?'on':''}" data-mat="${k}"><i style="background:${m.sw}"></i><span>${nm(m.name)}</span></button>`).join('');
  return `<section><div class="eyebrow">${esc(r.id)}</div><h3>${esc(nm(st.name))}</h3><div class="form"><label class="full">Room label<input id="rName" value="${esc(nm(st.name))}" maxlength="80"></label></div><div class="room-dim"><small>PRINTED PLAN DIMENSIONS</small><p>${esc(printedText(r))}</p></div><p class="muted">Model floor envelope ≈ ${fmt(a,1)} m². Approximate image geometry; this is not a measured net area.</p><p>${r.isTerrace?'Parapet shown at 1.00 m · TBD':'Clear ceiling 2.50 m · VERIFIED'}</p>${r.id==='RECP-01'?'<p>Both reception labels describe this single open space. The living window is full-height, 0.00–2.50 m.</p>':''}</section>
  <section><h3>Try a floor finish <span class="exploratory">EXPLORATORY</span></h3><div class="mats">${mats}</div></section><section><h3>Furniture in this space <small>${inside.length} items</small></h3><table>${inside.map(f=>`<tr class="click" data-fid="${f.id}"><td>${esc(nm(f.name))}</td><td class="r muted">${f.w} × ${f.d}</td></tr>`).join('')||'<tr><td class="muted">Empty shell</td></tr>'}</table><div class="actions"><button class="btn" id="back">Apartment overview</button></div></section>`;
}''')
replace('const DS = \'stroke="#3d3a34" stroke-width="1" vector-effect="non-scaling-stroke"\';', 'const DS = \'stroke="#3d3a34" stroke-width="1" vector-effect="non-scaling-stroke"\';')
# Remove the demo entry arrow and generate the correct location from OP-ENT-01.
s,n=re.subn(r'  // 入户标识\n.*?  \$\(\'#gOpen\'\)\.innerHTML = s;', '''  const entry=DOORS.find(d=>d.entry),x=(entry.rect[0]+entry.rect[2])/2,y=entry.rect[3];
  s+=`<path d="M${x} ${y+560}V${y+140}M${x-120} ${y+290}L${x} ${y+120}L${x+120} ${y+290}" fill="none" stroke="#2862a4" stroke-width="2" vector-effect="non-scaling-stroke"/><text x="${x-230}" y="${y+760}" font-size="190" fill="#2862a4">Entry</text>`;
  $('#gOpen').innerHTML = s;''',s,count=1,flags=re.S);assert n==1
replace("$('#exportJson').onclick = () => download(tr('户型装修方案', 'floor-plan-design') + '.json', new Blob([JSON.stringify(state, null, 2)], {type:'application/json'}));", "$('#exportJson').onclick = () => download('type-b-furniture-layout.json', new Blob([JSON.stringify({...state,sourceCanonicalHash:MODEL.canonical_sha256}, null, 2)], {type:'application/json'}));")
replace("$('#reset').onclick = () => { if (confirm(tr('恢复为默认设计方案？（可撤销）', 'Reset to the default design? (undoable)'))){ const b = snap(); state = defaultState(); ui.sel = null; commit(b); renderAll(); } };", "$('#reset').onclick = () => { const b=snap(); state=defaultState();ui.sel=null;commit(b);renderAll();toast('Starter example restored. Undo to return.'); };")

extra='''
function pointInRoom([x,y],poly){
  let inside=false;
  for(let i=0,j=poly.length-1;i<poly.length;j=i++){
    const [xi,yi]=poly[i],[xj,yj]=poly[j];
    if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi) inside=!inside;
  }
  return inside;
}
function applyPreset(kind){
  if(!['shell','starter'].includes(kind)) throw new Error('Unknown furniture preset.');
  ui.sel=null;mutate(()=>state.furniture=kind==='shell'?[]:defaultFurniture());
  toast(kind==='shell'?'Empty shell. Undo restores your furnishing.':'Starter furniture is an exploratory example. Undo restores your layout.');
}
$('#shellPreset').onclick=()=>applyPreset('shell');
$('#starterPreset').onclick=()=>applyPreset('starter');
$('#originalPlan').onclick=()=>$('#sourceDialog').showModal();
$('#closeSource').onclick=()=>$('#sourceDialog').close();
$('#sourceDialog').addEventListener('click',e=>{if(e.target===e.currentTarget)e.currentTarget.close();});
document.querySelectorAll('header button').forEach(b=>{if(!b.getAttribute('aria-label'))b.setAttribute('aria-label',b.dataset.en||b.textContent.trim());});
const modelContext=document.modelContext;
if(modelContext?.registerTool){
  const lifetime=new AbortController();
  const register=tool=>Promise.resolve(modelContext.registerTool(tool,{signal:lifetime.signal})).catch(()=>{});
  register({name:'inspect_apartment',title:'Inspect apartment',description:'Read the current apartment model, dimensions, validation status and furniture layout.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>({version:MODEL.canonical_version,view:viewMode,ceiling_m:MODEL.height_m,rooms:ROOMS.map(r=>({id:r.id,name:state.rooms[r.id].name,printed_dimensions:printedText(r)})),opening_count:MODEL.openings.length,furniture_count:state.furniture.length,status:MODEL.status})});
  register({name:'set_apartment_view',title:'Set apartment view',description:'Switch between the apartment 2D plan and 3D home, optionally focus a room in the 3D view.',inputSchema:{type:'object',properties:{view:{type:'string',enum:['2d','3d']},room_id:{type:'string',enum:ROOMS.map(r=>r.id)}},required:['view'],additionalProperties:false},annotations:{readOnlyHint:false},async execute(input){
    if(!input||!['2d','3d'].includes(input.view)||Object.keys(input).some(k=>!['view','room_id'].includes(k))||(input.room_id&&!ROOMS.some(r=>r.id===input.room_id)))throw new Error('Invalid apartment view.');
    await setView(input.view);
    if(viewMode!==input.view)throw new Error('Requested view is unavailable.');
    if(input.room_id){select({kind:'room',id:input.room_id});if(is3D())await window.View3D.focusRoom(input.room_id);}
    return {view:viewMode,room_id:input.room_id||null};
  }});
  addEventListener('pagehide',()=>lifetime.abort(),{once:true});
}
'''
replace("applyStaticLang(); syncFullscreen();\nbuildDefs();",extra+"\napplyStaticLang(); syncFullscreen();\nbuildDefs();")
function('setView','''async function setView(m){
  if(m===viewMode||switching)return;
  if(!window.View3D)return toast('3D is loading. The 2D plan is available now.');
  switching=true;document.body.classList.add('busy');
  try{
    if(m==='3d'){
      if(ui.tool!=='select')setTool('select');ui.mA=null;document.body.classList.add('m3d');
      await window.View3D.enter();viewMode='3d';
    }else{
      document.body.classList.remove('m3d');await window.View3D.exit();viewMode='2d';applyView();
    }
    $('#tip').textContent=TIPS()[viewMode];
  }catch(e){
    document.body.classList.remove('m3d');$('#stage').classList.remove('is3d','animating');viewMode='2d';
    toast('3D could not start on this device. Try a browser with WebGL enabled; the 2D plan still works.');
    console.error('3D initialization failed',e);
  }finally{switching=false;document.body.classList.remove('busy');}
}''')

# The architectural rebuild replaces all demo-specific windows and openings.
function('buildArch','''function buildArch(){
  clearGroup(archFloor);clearGroup(archUp);lampG.clear();doors.length=0;colliders=[];
  const top=opt.cut;
  for(const r of ROOMS){
    const geo=new THREE.ShapeGeometry(shapeOf(r.poly));geo.rotateX(-Math.PI/2);
    const fl=new THREE.Mesh(geo,floorMat(state.rooms[r.id].mat));fl.receiveShadow=true;fl.userData.room=r.id;archFloor.add(fl);
    if(!r.isTerrace){
      const cg=new THREE.ShapeGeometry(shapeOf(r.poly,true));cg.rotateX(Math.PI/2);
      const ceil=new THREE.Mesh(cg,mat('#fbfaf7',{roughness:1}));ceil.position.y=H;ceil.visible=top>=H;ceil.userData.ceilingFor=r.id;archUp.add(ceil);
      const pl=new THREE.PointLight(0xffd9a8,0,7,1.6);pl.position.set(wx(r.at[0]),H-.25,wz(r.at[1]));lampG.add(pl);
    }
  }
  [...DOORS,...SLIDES,...PASSAGES].forEach(d=>{
    const [x0,y0,x1,y1]=d.rect;
    const threshold=box(M(x1-x0),.012,M(y1-y0),mat('#bfcad3',{roughness:.5}),wx((x0+x1)/2),0,wz((y0+y1)/2));threshold.castShadow=false;archFloor.add(threshold);
  });
  WALL_SEGMENTS.forEach(s=>{
    const [x0,z0]=s.from,[x1,z1]=s.to,dx=M(x1-x0),dz=M(z1-z0),height=Math.min(s.height_m,top);
    const o=new THREE.Mesh(new THREE.BoxGeometry(Math.hypot(dx,dz),height,M(s.thickness_mm)),[wallMat,wallMat,capMat,wallMat,wallMat,wallMat]);
    o.position.set(wx((x0+x1)/2),height/2,wz((z0+z1)/2));o.rotation.y=-Math.atan2(dz,dx);o.castShadow=o.receiveShadow=true;
    o.userData.wallSegment=s;archUp.add(o);
    colliders.push({a:[wx(x0),wz(z0)],b:[wx(x1),wz(z1)],half:M(s.thickness_mm)/2});
    const edges=new THREE.LineSegments(new THREE.EdgesGeometry(o.geometry),edgeMat);edges.position.copy(o.position);edges.rotation.copy(o.rotation);edges.visible=opt.mode==='walk';edges.userData.walkOnly=true;archUp.add(edges);
  });
  [...DOORS.map(d=>[d.rect,2.1]),...SLIDES.map(d=>[d.rect,d.head_m]),...PASSAGES.map(d=>[d.rect,d.head_m])].forEach(([r,h])=>{if(top>h)wallBox(r,h,top);});
  WINS.forEach((r,i)=>{
    const {sill_m:sill,head_m:head,id}=MODEL.window_meta[i];
    if(sill>0)wallBox(r,0,Math.min(sill,top));if(top>head)wallBox(r,head,top);
    const [x0,y0,x1,y1]=r,hz=x1-x0>=y1-y0,L=M(hz?x1-x0:y1-y0),gTop=Math.min(head,top),gh=gTop-sill,cx=wx((x0+x1)/2),cz=wz((y0+y1)/2);
    colliders.push({a:hz?[wx(x0),cz]:[cx,wz(y0)],b:hz?[wx(x1),cz]:[cx,wz(y1)],half:.04});
    if(gh<=0)return;
    const pane=new THREE.Mesh(new THREE.BoxGeometry(hz?L:.01,gh,hz?.01:L),glassMat);pane.position.set(cx,sill+gh/2,cz);pane.userData.openingId=id;archUp.add(pane);
    const n=Math.max(1,Math.round(L/.9));
    for(let k=0;k<=n;k++){
      const t=-L/2+k*L/n,mu=new THREE.Mesh(new THREE.BoxGeometry(hz?.04:.06,gh,hz?.06:.04),frameMat);mu.position.set(cx+(hz?t:0),sill+gh/2,cz+(hz?0:t));archUp.add(mu);
    }
    [sill+.02,gTop-.02].forEach(y=>{const fr=new THREE.Mesh(new THREE.BoxGeometry(hz?L:.06,.04,hz?.06:L),frameMat);fr.position.set(cx,y,cz);archUp.add(fr);});
  });
  DOORS.forEach(d=>{
    const pivot=new THREE.Group(),L=M(d.len),dh=Math.min(2.05,top);pivot.position.set(wx(d.h[0]),0,wz(d.h[1]));
    const leaf=box(L,dh,.04,mat(d.entry?'#374b64':'#d6dce2',{roughness:.5}),L/2);
    const knob=new THREE.Mesh(new THREE.SphereGeometry(.03,12,8),metal());knob.position.set(L-.07,Math.min(1,dh-.05),0);pivot.add(leaf,knob);
    const ang=v=>Math.atan2(-v[1],v[0]),door={pivot,a0:ang(d.c),a1:ang(d.o),open:true,width:L,id:d.id};
    if(door.a1-door.a0>Math.PI)door.a1-=Math.PI*2;if(door.a0-door.a1>Math.PI)door.a1+=Math.PI*2;
    door.cur=door.a1;pivot.rotation.y=door.cur;leaf.userData.door=knob.userData.door=door;doors.push(door);archUp.add(pivot);
  });
  SLIDES.forEach(({rect:[x0,y0,x1,y1],v,head_m,id})=>{
    const L=M(v?y1-y0:x1-x0),ph=Math.min(head_m,top),pl=L/2,cx=wx((x0+x1)/2),cz=wz((y0+y1)/2);
    const sliding={sliding:true,open:true,cur:1,v,L,cx,cz,panels:[],id};
    [-1,1].forEach(sign=>{
      const panel=new THREE.Group();
      const pane=new THREE.Mesh(new THREE.BoxGeometry(v?.02:pl,ph,v?pl:.02),glassMat);pane.position.y=ph/2;pane.userData.door=sliding;panel.add(pane);
      [ph-.03,.03].forEach(y=>panel.add(box(v?.04:pl,.05,v?pl:.04,frameMat,0,y,0)));
      [-1,1].forEach(e=>panel.add(box(.04,ph,.04,frameMat,v?0:e*pl/2,ph/2,v?e*pl/2:0)));
      panel.userData.sign=sign;panel.userData.door=sliding;sliding.panels.push(panel);archUp.add(panel);
    });
    positionSlide(sliding);doors.push(sliding);
  });
  applyLight();applyGrow();
}
function positionSlide(d){
  d.panels.forEach(p=>{
    const sign=p.userData.sign,c=sign<0?-d.L/4:d.L/4-d.cur*d.L/2;
    p.position.set(d.cx+(d.v?sign*.02:c),0,d.cz+(d.v?c:sign*.02));
  });
}''')
replace("camera.position.set(wx(4200), 1.6, wz(8755)); camera.lookAt(wx(7000), 1.5, wz(8755));", "const entry=DOORS.find(d=>d.entry),ex=(entry.rect[0]+entry.rect[2])/2,ey=(entry.rect[1]+entry.rect[3])/2;\n    camera.position.set(wx(ex),1.60,wz(ey-650));camera.lookAt(wx(ex),1.60,wz(ey-3000));")
function('blocked','''function blocked(x,z,r=.20){
  const near=(ax,az,bx,bz,pad)=>{
    const dx=bx-ax,dz=bz-az,len=dx*dx+dz*dz,t=len?clamp01(((x-ax)*dx+(z-az)*dz)/len):0;
    return Math.hypot(x-(ax+t*dx),z-(az+t*dz))<r+pad;
  };
  for(const c of colliders)if(near(...c.a,...c.b,c.half))return true;
  if(opt.furn){
    for(const f of state.furniture){
      if(['rug','tv','acwall','aircon','stove','ksink','waterheater','baycushion'].includes(f.type))continue;
      const dx=x-wx(f.cx),dz=z-wz(f.cy),a=f.rot*Math.PI/180,lx=dx*Math.cos(a)+dz*Math.sin(a),lz=-dx*Math.sin(a)+dz*Math.cos(a);
      if(Math.abs(lx)<M(f.w)/2+r&&Math.abs(lz)<M(f.d)/2+r)return true;
    }
  }
  for(const d of doors){
    if(d.sliding){
      for(const p of d.panels){const px=p.position.x,pz=p.position.z;if(near(px-(d.v?0:d.L/4),pz-(d.v?d.L/4:0),px+(d.v?0:d.L/4),pz+(d.v?d.L/4:0),.01))return true;}
    }else{
      const a=d.pivot.rotation.y,px=d.pivot.position.x,pz=d.pivot.position.z;
      if(near(px,pz,px+Math.cos(a)*d.width,pz-Math.sin(a)*d.width,.01))return true;
    }
  }
  return false;
}''')
# Fix a typo above without touching the original door width convention.
replace('pz-Math.sin(a)*d.width','pz-Math.sin(a)*d.width')
replace('doors.forEach(d => { const tg = d.open ? d.a1 : d.a0; d.cur += (tg - d.cur) * Math.min(1, dt*6); d.pivot.rotation.y = d.cur; });', 'doors.forEach(d=>{if(d.sliding){d.cur+=((d.open?1:0)-d.cur)*Math.min(1,dt*6);positionSlide(d);}else{const tg=d.open?d.a1:d.a0;d.cur+=(tg-d.cur)*Math.min(1,dt*6);d.pivot.rotation.y=d.cur;}});')
replace('${area(r.poly).toFixed(1)}m²','≈ ${area(r.poly).toFixed(1)} m²')
replace('${area(r.poly).toFixed(2)} m²','${esc(printedText(r))}')
replace('${counted.reduce((a, r) => a + area(r.poly), 0).toFixed(2)} m²','186 m² stated gross')
replace("const isoWhole = () => pose(new THREE.Vector3(0, 0, 0), new THREE.Vector3(5.5, 15.5, 10));",'''function fitWhole(direction,aspect=SW()/SH()){
  const dir=direction.clone().normalize(),target=new THREE.Vector3(0,.4,0);
  const right=new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0),dir).normalize(),up=new THREE.Vector3().crossVectors(dir,right).normalize();
  const tv=Math.tan(FOV*Math.PI/360),th=tv*aspect;let distance=1;
  for(const x of [-MODEL.width_mm/2000,MODEL.width_mm/2000])for(const z of [-MODEL.depth_mm/2000,MODEL.depth_mm/2000])for(const y of [0,H+.3]){
    const v=new THREE.Vector3(x,y,z).sub(target),depth=v.dot(dir);
    distance=Math.max(distance,1.12*Math.abs(v.dot(right))/th+depth,1.12*Math.abs(v.dot(up))/tv+depth);
  }
  return pose(target,target.clone().addScaledVector(dir,distance+.5));
}
const isoWhole=()=>fitWhole(new THREE.Vector3(.3,.74,.6));''')
replace("const topWhole = () => pose(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 19, 1e-4));","const topWhole=()=>fitWhole(new THREE.Vector3(0,1,.00001));")
replace("  const A = planPose(), B = isoFrom(A);","  const A=planPose(),B=isoWhole();")
replace("if (inited) return; inited = true;","if (inited) return;")
replace('host.prepend(renderer.domElement);','host.prepend(renderer.domElement);\n  inited=true;')
replace("$('#hint3d').textContent = HINT_ORBIT;","$('#hint3d').textContent = HINT_ORBIT();")
replace("  bindUI();\n}","  bindUI();syncCutBtns();\n}")
replace('camera.position.set(wx(ex),1.60,wz(ey-650));camera.lookAt(wx(ex),1.60,wz(ey-3000));','camera.position.set(wx(ex),1.70,wz(ey-650));camera.lookAt(wx(ex),1.70,wz(ey-3000));')
replace("'Click to start at the front door'","'Click to start at the front door · eye level 1.70 m'")
replace("'Tap to start at the front door'","'Tap to start at the front door · eye level 1.70 m'")
replace('${Math.round(L)} mm</text>','≈ ${Math.round(L)} mm</text>')
replace(' ${fmt(area(ROOMS.find(r=>r.id===room.dataset.room).poly))} m²',' ≈ ${fmt(area(ROOMS.find(r=>r.id===room.dataset.room).poly))} m²')
replace("scene.background = new THREE.Color(opt.night ? 0x1c2130 : 0xf7f4ee);","scene.background = new THREE.Color(opt.night ? 0x182236 : 0xe9eff5);")
replace("ground.material.color.set(opt.night ? 0x2a2e38 : 0xf2eee7);","ground.material.color.set(opt.night ? 0x202c42 : 0xe3ebf2);")
replace("wallMat = mat('#f4f1eb', {roughness:.92}); capMat = mat('#34312d', {roughness:.9});","wallMat = mat('#f4f7fa', {roughness:.92}); capMat = mat('#31455e', {roughness:.9});")
replace("const t = new THREE.Vector3(wx((Math.min(...xs)+Math.max(...xs))/2), .6, wz((Math.min(...ys)+Math.max(...ys))/2));","const t = new THREE.Vector3(wx(r.at[0]),.6,wz(r.at[1]));")
replace("window.View3D = {enter, exit, relang, sync:() => sync(), shot, groundAt, flyToRoom:id => active && !anim && flyToRoom(id), walking:() => active && opt.mode === 'walk'};",'''window.View3D={enter,exit,relang,sync:()=>sync(),shot,groundAt,flyToRoom:id=>active&&!anim&&flyToRoom(id),walking:()=>active&&opt.mode==='walk',
  async focusRoom(id){if(!ROOMS.some(r=>r.id===id))throw new Error('Unknown room.');if(opt.mode==='walk')setMode('orbit');flyToRoom(id);await wait(950);},
};
if(location.hash!=='#2d')void setView('3d');''')

# Match the studio identity while keeping upstream interaction primitives.
css='''
/* Type B studio */
:root{--bg:#e9eff5;--paper:#edf3f8;--panel:#fff;--line:#d5dfeb;--ink:#172c46;--muted:#5f7087;--accent:#2862a4;--accent-soft:#dfebf9;--teal:#1f718f}
html,body{font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
header{gap:8px;padding:12px 16px;border-bottom:2px solid #172c46}
.brand{order:-3;margin-right:18px;min-width:160px}.brand b{font-size:20px;letter-spacing:-.3px}.brand span{font-size:13px;margin-top:4px}
#viewSeg{order:-2}#paneBtns{order:1}.presets{order:-1}#originalPlan{border:1px solid var(--line)}
.btn{font-size:14px;padding:6px 10px;min-height:34px}.btn:hover{background:#eaf0f7}.btn.primary:hover{background:#204f83}
.grp{border-radius:7px}.btn,.item,.mat{border-radius:5px}.seg .pill{box-shadow:none}
[hidden],#langSel,[data-tool="demolish"],[data-layer="bearing"],#s60,#s100{display:none!important}
.brand b,.brand span{color:var(--ink)}.brand span{color:var(--muted)}
.app{grid-template-columns:252px minmax(0,1fr) 330px;grid-template-rows:auto minmax(0,1fr) 34px}
#panel{font-size:14px}#panel h3{font-size:16px}.lib h4{font-size:14px;letter-spacing:.3px;padding-top:15px}
.item b,.hint,.form label,.mat span,.kbd,.range,.rlabel,.modehint{font-size:14px}.item small,.stats small,kbd,.brand span{font-size:13px}
#panel section{padding:18px}.model-summary{background:#172c46;color:#fff}.model-summary .muted{color:#c2cede}.model-summary h3{font-size:22px!important;display:flex;align-items:center;justify-content:space-between;margin-bottom:12px!important}
.eyebrow{font-size:12px;letter-spacing:1.4px;font-weight:650;color:#73879f;margin-bottom:8px}.model-summary .eyebrow{color:#a9c7e8}
.model-tag{font-size:14px;padding:3px 7px;border:1px solid #637a96;border-radius:4px;font-weight:500}
.summary-height{display:flex;align-items:center;gap:16px}.summary-height strong{font-size:36px;line-height:1}.summary-height strong span{font-size:18px}.summary-height p{margin:0;font-size:14px;line-height:1.6}
.verified,.exploratory{font-size:12px;letter-spacing:.4px;font-weight:650}.verified{color:#abd6fb}.exploratory{color:#7b673f}h3 .exploratory{display:block;font-weight:500;margin-top:3px}
.small-note{font-size:13px;line-height:1.6}.model-notes summary{font-size:16px;font-weight:600;cursor:pointer}.model-notes p{font-size:14px;line-height:1.7}.model-notes a{color:var(--accent)}
.room-dim small{font-size:12px;letter-spacing:.5px;color:var(--muted)}.room-dim p{font-size:18px;margin:4px 0 12px}
td{padding:8px 2px;border-bottom:1px solid #e4ebf3}td.r{font-size:13px;white-space:normal;max-width:128px;color:#4a607a}.stats div{background:#edf3f8}
#lib3d{border-bottom:1px solid var(--line)}#roomList{grid-template-columns:1fr;padding:0 12px 14px;gap:5px}#roomList button{padding:9px 11px;display:flex;flex-direction:row;align-items:center;justify-content:space-between;gap:8px}#roomList span{font-size:14px}#roomList small{font-size:12px;text-align:right;max-width:105px}#roomList button:hover{background:#edf3f8}
#hint3d{font-size:13px;white-space:normal;text-align:center;width:max-content;max-width:calc(100% - 24px);background:#172c46e0;border-radius:6px;padding:8px 12px;top:14px}
.rlabel{font-size:13px;border-radius:5px;background:#ffffffee}.rlabel small{font-size:12px}
footer{font-size:12px;gap:10px}footer:before{content:'2.50 m ceiling · Geometry locked';color:#314c70;flex-shrink:0}footer .only2d{display:none}
#toast{z-index:100;max-width:90vw;text-align:center}button:focus-visible,a:focus-visible,summary:focus-visible{outline:3px solid #69addd;outline-offset:3px}
dialog{border:1px solid var(--line);border-radius:8px;padding:0;width:min(1000px,94vw);max-height:92dvh;color:var(--ink);box-shadow:0 24px 70px #182d4655}dialog::backdrop{background:#12253e99}dialog img{display:block;width:100%;height:auto}dialog p{font-size:14px;padding:0 18px 16px}.dialog-heading{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid var(--line);position:sticky;top:0;background:white}
@media(min-width:1101px){.app.hide-lib{grid-template-columns:0 minmax(0,1fr) 330px}.app.hide-panel{grid-template-columns:252px minmax(0,1fr) 0}.app.hide-lib.hide-panel{grid-template-columns:0 minmax(0,1fr) 0}#panel{min-width:314px}aside.lib>div{min-width:236px}}
@media(max-width:1100px){.app{grid-template-columns:minmax(0,1fr)}header{gap:6px;padding:8px}.brand{min-width:140px;margin-right:6px}.brand b{font-size:18px}#paneBtns{order:0}.history,#layers{display:none}aside.right{width:min(350px,92vw)}#lib3d{min-width:0}footer{height:34px}footer:before{font-size:12px}#tip{font-size:12px}}
@media(max-width:650px){.brand{flex:1}.presets{order:0}.btn{padding:6px 8px;min-height:36px;font-size:14px}.grp{padding:2px}#paneBtns .btn{font-size:13px}#toggles3d [data-t="furn"],.zoomtools,#fullscreen{display:none}#hint3d{font-size:12px;padding:7px 9px}#sun{width:66px!important}#originalPlan{font-size:13px}.range{font-size:13px;padding:0 4px}footer #tip{display:none}#fab .name{max-width:100px}.lib-grid{grid-template-columns:1fr 1fr}.item b{font-size:13px}}
@media(prefers-reduced-motion:reduce){*{animation-duration:.01ms!important;transition-duration:.01ms!important}}
'''
replace('</style>','\n'+css+'\n</style>')

from decor_styles import apply_decor
s=apply_decor(s)
from scene_upgrade import apply_scenes
s=apply_scenes(s)
from studio_upgrade import apply_studio
s=apply_studio(s)
from cloud_upgrade import apply_cloud
s=apply_cloud(s)
from interior_upgrade import apply_interior
s=apply_interior(s)
(ROOT/"dist"/"index.html").write_text(s)
print({"index_bytes":len(s.encode()),"output":str(ROOT/"dist"/"index.html")})
