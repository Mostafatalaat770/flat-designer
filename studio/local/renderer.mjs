import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const json = value => JSON.stringify(value).replace(/</g, '\\u003c');

export function createLocalRenderer(projectRoot) {
  const read = file => fs.readFileSync(path.join(projectRoot,file),'utf8');
  const template = JSON.parse(read('dist/capture-template.json')).html;
  const assets = {};
  for (const file of fs.readdirSync(path.join(projectRoot,'dist/art'))) {
    if (file.endsWith('.png')) assets['./art/'+file] = 'data:image/png;base64,'+fs.readFileSync(path.join(projectRoot,'dist/art',file)).toString('base64');
  }
  function capture(layout,brief,camera,id) {
    const snapshot = {
      layout,canonical_sha256:brief.canonical_sha256,scene_revision:brief.scene_revision,
      storage_revision:null,room_id:camera.room_id,frame_id:id,
      snapshot_sha256:crypto.createHash('sha256').update(JSON.stringify(layout)).digest('hex'),
      camera,asset_urls:assets
    };
    return template.replaceAll('apartment-capture-canvas','capture-'+id)
      .replace('<head>','<head><meta charset="utf-8">')
      .replace('__APARTMENT_CAPTURE_SNAPSHOT_JSON__',()=>json(snapshot));
  }
  function interactive(layout,id) {
    let html = read('dist/index.html');
    const cloud = read('studio-cloud.js');
    if (!html.includes(cloud) || !html.includes('let state = load() || defaultState();') || !html.includes("const STORE = 'type-b-studio-v1';")) {
      throw new Error('Viewer isolation anchors changed; refusing to build a connected local page');
    }
    html = html.replace(cloud,'/* Local only: cloud sync/polling/autosave disconnected. */')
      .replace("const STORE = 'type-b-studio-v1';", "const STORE = 'type-b-local-"+id+"';")
      .replace('let state = load() || defaultState();',()=> 'let state = load() || '+json(layout)+';')
      .replace('<head>','<head><base href="/">')
      .replace('</head>','<style>#cloudDesign,#saveAiView{display:none!important}</style></head>')
      .replace('<header>','<header><span>LOCAL ONLY · '+id+' · <a href="/_qa/project-dossier.html">Project</a></span>')
      .replace('Completed edits save to your account. Saved design shows sync status and previous versions.','Edits save in this browser only. Production sync is disconnected.');
    const boot="if(location.hash!=='#2d')void setView('3d');";
    if(!html.includes(boot))throw new Error('Viewer boot anchor changed');
    html=html.replace(boot,`window.LocalQA={info:()=>({canonical:MODEL.canonical_sha256,revision:studioSceneKey(state),fov:camera?.fov,eye:camera?.position.y,lens:walkLens,scaleVisible:scaleRefG?.visible,humanHeight:scaleRefG?new THREE.Box3().setFromObject(scaleRefG).max.y:null,rulerHeight:scaleRefG?.children[4]?.geometry.parameters.height})};`+boot);
    if (html.includes('void cloudConnect()')) throw new Error('Connected cloud boot found');
    return html;
  }
  return {capture,interactive};
}
