/* Finish experiments share one furniture layout and one canonical apartment. */
const DECOR_THEMES = [
  {id:'custom',name:'Your design',description:'Your own finishes and furniture colours.',
    palette:[['Walls','#f4f7fa'],['Oak','#d8b88a'],['Fabric','#c9d6df'],['Accent','#8aa18d']]},
  {id:'warm',name:'Warm Contemporary',description:'Rounded upholstery, fluted wood, stone tables, oak parquet and sculptural lighting.',
    wall:'#f1e9df',ceiling:'#faf6ee',wood:'#a5825c',woodDark:'#64503b',fabric:'#c8b8a3',accent:'#69755c',rug:'#d9c7ab',metal:'#887351',pot:'#c9a384',floor:'parquet',kitchenFloor:'tile800',wetFloor:'tile800',
    palette:[['Walls','#f1e9df'],['Oak','#d8b88a'],['Fabric','#c8b8a3'],['Olive','#69755c']]},
  {id:'japandi',name:'Japandi',description:'Exposed oak frames, low platform beds, linen, wide pale planks and paper lanterns.',
    wall:'#e8e6df',ceiling:'#f6f4ee',wood:'#c4ad86',woodDark:'#615647',fabric:'#d5d0c5',accent:'#565f54',rug:'#cbc8bc',metal:'#3d403b',pot:'#b6b4a7',floor:'lightoak',kitchenFloor:'tile600',wetFloor:'tile600',
    palette:[['Walls','#e8e6df'],['Pale oak','#e0d0b3'],['Fabric','#d5d0c5'],['Charcoal','#3d403b']]},
  {id:'boho',name:'Modern Bohemian',description:'Woven cane furniture, arched headboards, terracotta textiles, limestone and wicker lighting.',
    wall:'#eddfc9',ceiling:'#f7eddc',wood:'#996f49',woodDark:'#573e2b',fabric:'#dfc99f',accent:'#ac6348',rug:'#bb6c48',metal:'#79613f',pot:'#af704e',floor:'travertine',kitchenFloor:'terrazzo',wetFloor:'terrazzo',pattern:true,
    palette:[['Walls','#eddfc9'],['Walnut','#9b7250'],['Linen','#dfc99f'],['Terracotta','#ac6348']]}
];
MATS.lightoak={name:'Pale oak flooring',sw:'#e0d0b3'};
MATS.parquet={name:'Oak parquet',sw:'#c9a678'};
MATS.travertine={name:'Limestone / travertine',sw:'#dfcfb4'};
const validDecorColour=c=>typeof c==='string'&&/^#[0-9a-f]{6}$/i.test(c);
const validFurnitureId=id=>typeof id==='string'&&/^[a-zA-Z0-9_-]{1,80}$/.test(id)&&!['__proto__','constructor','prototype'].includes(id);
const defaultDecor=()=>({active:'custom',sceneVersion:2,saved:{}});

function normalizeDecor(raw,furniture){
  const decor=defaultDecor(),ids=new Set(furniture.map(f=>f.id));
  if(DECOR_THEMES.some(t=>t.id===raw?.active))decor.active=raw.active;
  for(const theme of DECOR_THEMES){
    const saved=raw?.saved?.[theme.id];
    if(!saved||typeof saved!=='object')continue;
    const rooms={},colours={};
    for(const r of ROOMS)if(MATS[saved.rooms?.[r.id]])rooms[r.id]=saved.rooms[r.id];
    for(const id of ids)if(validDecorColour(saved.colours?.[id]))colours[id]=saved.colours[id];
    decor.saved[theme.id]={rooms,colours};
  }
  return decor;
}
function oldDecorFloor(r,id){
  if(r.isTerrace||['bathroom','toilet'].includes(r.kind))return 'antislip';
  if(r.kind==='kitchen')return id==='warm'?'tile800':id==='japandi'?'tile600':'terrazzo';
  return id==='warm'?'wood':id==='japandi'?'lightoak':'walnut';
}
function migrateSceneFinishes(safe,raw){
  if(raw?.sceneVersion===2)return;
  for(const theme of DECOR_THEMES.filter(t=>t.id!=='custom')){
    for(const r of ROOMS){
      const old=oldDecorFloor(r,theme.id),next=decorFloor(r,theme),saved=safe.decor.saved[theme.id];
      if(saved?.rooms[r.id]===old)saved.rooms[r.id]=next;
      if(safe.decor.active===theme.id&&safe.rooms[r.id].mat===old)safe.rooms[r.id].mat=next;
    }
  }
}
function currentDecor(){return DECOR_THEMES.find(t=>t.id===state.decor.active)||DECOR_THEMES[0];}
function decorSurface(key,fallback){return currentDecor()[key]||fallback;}
function captureDecor(){
  return {rooms:Object.fromEntries(ROOMS.map(r=>[r.id,state.rooms[r.id].mat])),
    colours:Object.fromEntries(state.furniture.filter(f=>!f.material_id).map(f=>[f.id,f.color]))};
}
function rememberDecor(){state.decor.saved[state.decor.active]=captureDecor();}
function decorFurnitureColour(f,theme){
  const original=state.decor.saved.custom?.colours?.[f.id]||MODEL.starter_furniture.find(x=>x.id===f.id)?.color||typeColor(f.type);
  if(theme.id==='custom')return original;
  if(['sofa','cornersofa','bed','baycushion'].includes(f.type))return theme.fabric;
  if(['chair','armchair','beanbag','barstool'].includes(f.type))return theme.accent;
  if(f.type==='rug')return theme.rug;
  if(f.type==='floorlamp')return theme.metal;
  if(['wardrobe','cabinet','shoecab','nightstand','dresser','desk','bookshelf','coffeetable','tvstand','table','roundtable','counter','island','ovencol','crib','sidetable','vanity'].includes(f.type))return theme.wood;
  return original;
}
function decorFloor(r,theme){
  if(theme.id==='custom')return r.mat;
  if(r.isTerrace)return 'antislip';
  if(['bathroom','toilet'].includes(r.kind))return theme.wetFloor;
  return r.kind==='kitchen'?theme.kitchenFloor:theme.floor;
}
function setDecorTheme(id){
  const theme=DECOR_THEMES.find(t=>t.id===id);
  if(!theme)throw new Error('Unknown decor style.');
  if(state.decor.active===id)return;
  const before=snap();rememberDecor();
  const saved=state.decor.saved[id];state.decor.active=id;
  for(const r of ROOMS)state.rooms[r.id].mat=saved?.rooms?.[r.id]||decorFloor(r,theme);
  for(const f of state.furniture)f.color=f.material_id?(interiorMaterial(state,f.material_id)?.base_colour||f.color):(saved?.colours?.[f.id]||decorFurnitureColour(f,theme));
  commit(before);renderAll();
  if(is3D())void window.View3D?.ensureInterior();
  toast(theme.name+' · complete furniture and decor scene.');
}
function decorPalette(theme){
  if(theme.id!=='custom')return theme.palette;
  const fabric=state.furniture.find(f=>['sofa','bed'].includes(f.type))?.color||'#c9d6df';
  const accent=state.furniture.find(f=>['armchair','chair'].includes(f.type))?.color||'#8aa18d';
  return [['Walls','#f4f7fa'],['Floor',MATS[state.rooms['RECP-01'].mat].sw],['Fabric',fabric],['Accent',accent]];
}
function renderDecorControl(){
  const theme=currentDecor();
  $('#decorTheme').value=theme.id;
  $('#decorPalette').innerHTML=decorPalette(theme).map(([label,c])=>`<i style="background:${c}" title="${label}"></i>`).join('');
}
function decorPanel(){
  const theme=currentDecor();
  return `<section class="decor-summary"><div class="eyebrow">INTERIOR STYLE</div><h3>${theme.name}</h3><p>${theme.description}</p><div class="decor-palette-labels">${decorPalette(theme).map(([label,c])=>`<span><i style="background:${c}"></i>${label}</span>`).join('')}</div><p class="muted small-note">Use Interior view to see the complete furnished scene. Styles include furniture models, textiles, paintings, curtains and fixtures. Colour and floor edits stay saved for each style on this device.</p></section>`;
}
