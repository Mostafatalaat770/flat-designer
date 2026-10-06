import fs from 'node:fs';
import path from 'node:path';
import {createApartmentDomain} from '../domain/apartment.mjs';
import {createLocalRenderer} from './renderer.mjs';

const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeId = value => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,80}$/.test(value);

function plan(domain,layout,scope) {
  const rooms = domain.model.rooms.filter(r=>scope.includes(r.id));
  const points = rooms.flatMap(r=>r.poly), xs=points.map(p=>p[0]), ys=points.map(p=>p[1]);
  const x=Math.min(...xs)-300,y=Math.min(...ys)-300,w=Math.max(...xs)-x+300,h=Math.max(...ys)-y+300;
  let svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${h}" role="img" aria-label="Canonical architecture and exploratory furniture"><style>text{font:115px sans-serif;fill:#342f29}</style>`;
  for(const r of rooms) svg+=`<polygon points="${r.poly.map(p=>p.join(',')).join(' ')}" fill="#f8f4ec"/>`;
  for(const wall of domain.model.wall_segments.filter(s=>s.rooms.some(id=>scope.includes(id)))) svg+=`<path d="M${wall.from.join(',')} L${wall.to.join(',')}" stroke="#5e564b" stroke-width="${wall.thickness_mm}"/>`;
  for(const op of domain.model.openings.filter(s=>s.between.some(id=>scope.includes(id)))) svg+=`<path d="M${op.from.join(',')} L${op.to.join(',')}" stroke="${op.id.startsWith('GLZ')?'#4c99b2':'#c58442'}" stroke-width="70"/>`;
  const items=layout.furniture.filter(f=>scope.includes(f.room_id)&&!['tv','stove','ksink','acwall','aircon','waterheater'].includes(f.type));
  for(const o of layout.interior.objects.filter(o=>scope.includes(o.room_id)&&o.placement.mode==='floor')) {
    items.push({...domain.resolveObject(o),color:o.colour});
  }
  for(const f of items) svg+=`<polygon points="${domain.footprint(f).map(p=>p.join(',')).join(' ')}" fill="${f.color}" fill-opacity="${f.type==='rug'?'.28':'.85'}" stroke="#746b5d" stroke-width="16"/><text x="${f.cx}" y="${f.cy}" text-anchor="middle">${escape(f.type)} ${f.w}×${f.d}</text>`;
  return svg+'</svg>';
}

export function prepareStudy(projectRoot,spec) {
  if(spec.schema!=='ApartmentLocalStudy/1'||!safeId(spec.id)||!safeId(spec.output)||!Array.isArray(spec.cameras)||!spec.cameras.length) throw new Error('Invalid local study manifest');
  const read=file=>{
    const full=path.resolve(projectRoot,file);
    if(!full.startsWith(path.resolve(projectRoot)+path.sep))throw new Error('Study inputs must be inside the project');
    return JSON.parse(fs.readFileSync(full,'utf8'));
  };
  const domain=createApartmentDomain(projectRoot),base=domain.importBrief(read(spec.base_brief));
  const proposal=spec.proposal,layout=domain.applyProposal(base,proposal),validation=domain.validate(layout);
  if(!Array.isArray(spec.scope)||!spec.scope.length||spec.scope.some(id=>!domain.model.rooms.some(r=>r.id===id)))throw new Error('Invalid study rooms');
  for(const f of base.furniture.filter(f=>!spec.scope.includes(f.room_id))) {
    if(JSON.stringify(layout.furniture.find(n=>n.id===f.id))!==JSON.stringify(f)) throw new Error('Furniture changed outside study scope: '+f.id);
  }
  for(const room of domain.model.rooms.filter(r=>!spec.scope.includes(r.id))) {
    for(const group of ['rooms','studio']) {
      const before=group==='rooms'?base.rooms[room.id]:base.studio.rooms[room.id];
      const after=group==='rooms'?layout.rooms[room.id]:layout.studio.rooms[room.id];
      if(JSON.stringify(before)!==JSON.stringify(after))throw new Error('Room changed outside study scope: '+room.id);
    }
    const objects=l=>l.interior.objects.filter(o=>o.room_id===room.id);
    if(JSON.stringify(objects(base))!==JSON.stringify(objects(layout)))throw new Error('Interior changed outside study scope: '+room.id);
    const surfaceIds=domain.surfaces().filter(s=>s.room_id===room.id).map(s=>s.id);
    for(const id of surfaceIds) {
      if(base.interior.surface_materials[id]!==layout.interior.surface_materials[id])throw new Error('Surface changed outside study scope: '+id);
    }
    const treatments=l=>Object.entries(l.interior.opening_treatments).filter(([,t])=>t.room_id===room.id);
    if(JSON.stringify(treatments(base))!==JSON.stringify(treatments(layout)))throw new Error('Opening treatment changed outside study scope: '+room.id);
  }
  const catalog=[...read('studio-catalog.json'),...(spec.reference_files||[]).flatMap(read)];
  const brief=domain.designBrief(layout,catalog),ids=new Set();
  // Validate ALL cameras before writing anything. No silently skipped views.
  const cameras=spec.cameras.map(c=>{
    if(!safeId(c.id)||ids.has(c.id)||!spec.scope.includes(c.room_id))throw new Error('Invalid or duplicate camera');
    ids.add(c.id);
    return {...domain.captureCamera(layout,{room_id:c.room_id,position:c.position,target:c.target,fov:c.fov}),id:c.id,room_id:c.room_id,label:c.label||c.id};
  });
  const renderer=createLocalRenderer(projectRoot),output=path.join(projectRoot,'local-qa',spec.output),site=path.join(projectRoot,'local-qa/site',spec.output);
  const manifestFile=path.join(output,'manifest.json');
  if(fs.existsSync(manifestFile)){
    const old=JSON.parse(fs.readFileSync(manifestFile));
    const previous=Array.isArray(old)?old.find(s=>s.id===spec.id):old;
    if(previous?.revision&&previous.revision!==brief.scene_revision)throw new Error('Use a new output version to preserve design history');
  }
  const snapshots=cameras.map(c=>[c.id+'.html',renderer.capture(layout,brief,c,c.id)]);
  const interactive=renderer.interactive(layout,spec.id),svg=plan(domain,layout,spec.scope);
  const manifest={schema:'ApartmentLocalStudyResult/1',id:spec.id,title:spec.title,revision:brief.scene_revision,canonical:brief.canonical_sha256,summary:validation.summary,views:cameras.map(c=>c.id),production_connected:false};
  fs.mkdirSync(path.join(output,spec.id),{recursive:true});fs.mkdirSync(site,{recursive:true});
  const write=(file,value)=>fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n');
  for(const [file,data] of [['layout.json',layout],['proposal.json',proposal],['validation.json',validation],['brief.json',brief],['cameras.json',cameras]])write(path.join(output,spec.id,file),data);
  write(manifestFile,manifest);write(path.join(output,'study.json'),spec);
  fs.writeFileSync(path.join(output,spec.id,'plan.svg'),svg);fs.writeFileSync(path.join(site,spec.id+'-plan.svg'),svg);
  for(const [file,html] of snapshots)fs.writeFileSync(path.join(site,file),html);
  fs.writeFileSync(path.join(site,'studio.html'),interactive);
  fs.writeFileSync(path.join(site,'index.html'),`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escape(spec.title)}</title><style>body{background:#f4f0e8;color:#302d28;font:16px/1.6 system-ui;margin:0}main{max-width:1300px;margin:auto;padding:40px}article{background:#fffdf8;padding:24px;border-radius:14px;margin:24px 0}.views{display:grid;grid-template-columns:repeat(auto-fit,minmax(380px,1fr));gap:18px}img{width:100%;border-radius:8px}.plan{max-height:750px;object-fit:contain}a{color:#62583f}@media(max-width:500px){.views{display:block}main{padding:20px}}</style></head><body><main><p>LOCAL ONLY · Architecture locked · EXPLORATORY</p><h1>${escape(spec.title)}</h1><p>${escape(spec.assessment)}</p><p><a href="studio.html">Interactive local Studio</a> · <a href="../project-dossier.html">Project register</a> · <a href="../project-studies-v6/index.html">Before / intermediate comparison</a></p><article><p>${brief.scene_revision} · ${validation.summary.pass} PASS / ${validation.summary.warning} WARNING / ${validation.summary.fail} FAIL</p>${(spec.notes||[]).map(n=>'<p>'+escape(n)+'</p>').join('')}<details><summary>Canonical plan and furniture dimensions</summary><img class="plan" src="${spec.id}-plan.svg"></details></article><div class="views">${cameras.map(c=>`<figure><a href="${c.id}.html"><img src="${c.id}.png" alt="${escape(c.label)}"></a><figcaption>${escape(c.label)} · ${c.fov===42?'Natural42':'Wide60 overview'} · standing eye1.70m</figcaption></figure>`).join('')}</div><article><p>Generic meshes remain schematic: mirror reflections, leaf detail, textiles, joinery and lighting are not final. Warnings and manufacturer/site checks remain open. No production saves or architectural changes.</p></article></main></body></html>`);
  return manifest;
}
