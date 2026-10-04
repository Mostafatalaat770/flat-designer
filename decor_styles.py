"""Extend the existing viewer with reversible finish presets only."""
from pathlib import Path

def apply_decor(s):
    def replace(old,new):
        nonlocal s
        assert old in s,old[:100]
        s=s.replace(old,new)

    preset_script=Path(__file__).with_name('decor-presets.js').read_text()
    replace('let _n = 1;',preset_script+'\nlet _n = 1;')
    replace('furniture:defaultFurniture(), rooms, demolished:[], measures:[]','furniture:defaultFurniture(), rooms, decor:defaultDecor(), demolished:[], measures:[]')
    replace("  safe.furniture=s.furniture.slice(0,300).map((f,i)=>{","  const usedIds=new Set();\n  safe.furniture=s.furniture.slice(0,300).map((f,i)=>{")
    replace("    return {...f,id:'import-'+i,name:","    let id=validFurnitureId(f.id)&&!usedIds.has(f.id)?f.id:'import-'+i;\n    while(usedIds.has(id))id+='-copy';usedIds.add(id);\n    return {...f,id,name:")
    replace('  return safe;','  safe.decor=normalizeDecor(s.decor,safe.furniture);\n  return safe;')
    replace('function commit(before){ undoStack.push(before);','function commit(before){ rememberDecor(); undoStack.push(before);')
    replace('renderPanel(); updateHeader();','renderPanel(); updateHeader(); renderDecorControl();')
    replace('<button class="btn outline" id="originalPlan">','''<div class="decor-control"><label for="decorTheme">Decor style</label><select id="decorTheme" aria-label="Decor style" title="Compare finishes while keeping furniture positions and lighting."><option value="custom">Your design</option><option value="warm">Warm Contemporary</option><option value="japandi">Japandi</option><option value="boho">Modern Bohemian</option></select><span id="decorPalette" aria-hidden="true"></span></div>
    <button class="btn outline" id="originalPlan">''')
    replace("$('#shellPreset').onclick=", "$('#decorTheme').onchange=e=>setDecorTheme(e.target.value);\n$('#shellPreset').onclick=")
    replace('  return `<section class="model-summary">','  return decorPanel()+`<section class="model-summary">')
    replace("  ui.sel = {kind:'furn', id:f.id};\n  mutate(() =>", "  if(state.decor.active!=='custom')f.color=decorFurnitureColour(f,currentDecor());\n  ui.sel = {kind:'furn', id:f.id};\n  mutate(() =>")
    # Reapply the selected finishes when replacing furniture, retaining floor edits.
    replace("mutate(()=>state.furniture=kind==='shell'?[]:defaultFurniture());", "mutate(()=>{state.furniture=kind==='shell'?[]:defaultFurniture();if(kind==='starter'&&state.decor.active!=='custom')for(const f of state.furniture)f.color=state.decor.saved[state.decor.active]?.colours?.[f.id]||decorFurnitureColour(f,currentDecor());});")
    # Pale oak is a real floor-material option in both 2D and 3D.
    replace("plank('wood','#dcc09a','#bf9d70') +", "plank('lightoak','#e0d0b3','#c2af8d') + plank('wood','#dcc09a','#bf9d70') +")
    replace("wood:{sx:1.8, sy:.36, base:'#d6b58a', rough:.55},", "lightoak:{sx:1.8,sy:.36,base:'#e0d0b3',rough:.65}, wood:{sx:1.8, sy:.36, base:'#d6b58a', rough:.55},")
    replace("kind === 'wood' || kind === 'walnut'", "kind === 'wood' || kind === 'walnut' || kind === 'lightoak'")
    replace("  const top=opt.cut;", "  wallMat=mat(decorSurface('wall','#f4f7fa'),{roughness:.92});\n  const top=opt.cut;")
    replace('  clearGroup(archFloor);clearGroup(archUp);lampG.clear();doors.length=0;', '  const previousDoors=new Map(doors.map(d=>[d.id,{open:d.open,cur:d.cur}]));\n  clearGroup(archFloor);clearGroup(archUp);lampG.clear();doors.length=0;')
    replace('open:true,width:L,id:d.id','open:previousDoors.get(d.id)?.open??true,width:L,id:d.id')
    replace('door.cur=door.a1;', 'door.cur=previousDoors.get(d.id)?.cur??door.a1;')
    replace('sliding:true,open:true,cur:1,v,L,cx,cz,panels:[],id','sliding:true,open:previousDoors.get(id)?.open??true,cur:previousDoors.get(id)?.cur??1,v,L,cx,cz,panels:[],id')
    replace("mat('#fbfaf7',{roughness:1})", "mat(decorSurface('ceiling','#fbfaf7'),{roughness:1})")
    replace("mat(d.entry?'#374b64':'#d6dce2'", "mat(d.entry?'#374b64':decorSurface('wood','#d6dce2')")
    replace('state.rooms, state.demolished, opt.cut','state.rooms, state.demolished, opt.cut, state.decor.active')
    replace('f = JSON.stringify(state.furniture)','f = JSON.stringify([state.furniture,state.decor.active])')
    for colour,key in [('#8d7258','wood'),('#3a3027','woodDark'),('#6b543f','woodDark'),('#4a3e33','woodDark')]:
        replace(f"woodM('{colour}')",f"woodM(decorSurface('{key}','{colour}'))")
    replace("const hwMat = () => mat('#b9b3a8'", "const hwMat = () => mat(decorSurface('metal','#b9b3a8')")
    replace("fabric('#ece5d8')", "fabric(decorSurface('accent','#ece5d8'))")
    replace("fabric(s < 0 ? '#ece5d8' : darker(c, .7))", "fabric(s < 0 ? decorSurface('accent','#ece5d8') : darker(c, .7))")
    replace("pot = mat('#d9d2c5'", "pot = mat(decorSurface('pot','#d9d2c5')")
    replace("        const r = box(a, h, b, mat(cc, {roughness:1}), 0, y + .002); r.castShadow = false; g.add(r);\n      });\n      break;", """        const r = box(a, h, b, mat(cc, {roughness:1}), 0, y + .002); r.castShadow = false; g.add(r);
      });
      if(currentDecor().pattern){
        for(const z of [-d/2+.2,-d/2+.26,d/2-.26,d/2-.2]){
          const stripe=box(Math.max(.05,w-.35),.001,.018,fabric('#f0dfbd'),0,.016,z);stripe.castShadow=false;g.add(stripe);
        }
      }
      break;""")
    replace("case 'rug': return rc(x,y,w,d,c,'rx=\"40\" fill-opacity=\".6\"') + rc(x+90,y+90,w-180,d-180,'none','rx=\"30\" stroke-dasharray=\"3 3\" opacity=\".6\"');", """case 'rug': return rc(x,y,w,d,c,'rx="40" fill-opacity=".85"') + rc(x+90,y+90,w-180,d-180,'none','rx="30" stroke-dasharray="3 3" opacity=".6"') + (currentDecor().pattern?`<path d="M${x+170} ${y+200}h${Math.max(0,w-340)}M${x+170} ${y+d-200}h${Math.max(0,w-340)}" stroke="#f0dfbd" stroke-width="35" pointer-events="none"/>`:'');""")
    replace('/* Type B studio */','''/* Decor comparison */
.decor-control{order:-1;display:flex;align-items:center;gap:9px;background:#172c46;color:#fff;padding:5px 10px;border-radius:6px;max-width:100%;min-width:0}
.decor-control label{font-size:14px;font-weight:600;white-space:nowrap}
#decorTheme{font:inherit;font-size:14px;color:#172c46;background:#fff;min-height:36px;width:200px;max-width:100%;padding:6px 8px;border:1px solid #a8bfd8;border-radius:4px;cursor:pointer}
#decorPalette,.decor-palette-labels{display:flex;align-items:center;gap:6px}
#decorPalette i,.decor-palette-labels i{display:inline-block;width:17px;height:17px;flex-shrink:0;border:1px solid #ffffff55;border-radius:50%}
.decor-summary{background:#eff4fa;border-bottom:1px solid var(--line)}.decor-summary p{margin:8px 0 12px}.decor-palette-labels{flex-wrap:wrap;gap:9px 14px}.decor-palette-labels span{display:flex;align-items:center;gap:6px;font-size:13px}.decor-palette-labels i{border:1px solid #172c4626}
select:focus-visible{outline:3px solid #69addd;outline-offset:3px}
@media(max-width:650px){.decor-control{flex:1 1 100%;justify-content:space-between}.decor-control label{flex-shrink:0}#decorTheme{width:auto;flex:1;min-width:0}#decorPalette{display:none}}
/* Type B studio */''')
    return s
