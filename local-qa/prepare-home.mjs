import fs from 'node:fs';
process.chdir(new URL('..',import.meta.url).pathname);
const layout=JSON.parse(fs.readFileSync('local-qa/project-studies-v4/home-a-utility/layout.json'));
let html=fs.readFileSync('dist/index.html','utf8');
const cloud=fs.readFileSync('studio-cloud.js','utf8');
if(!html.includes(cloud))throw Error('Cloud code not located; refusing to seed connected page');
html=html.replace(cloud,'/* Local only: production sync, polling and autosave removed. */');
if(!html.includes("const STORE = 'type-b-studio-v1';")||!html.includes('let state = load() || defaultState();'))throw Error('Local isolation anchors missing');
html=html.replace("const STORE = 'type-b-studio-v1';","const STORE = 'type-b-local-home-v4';");
html=html.replace('let state = load() || defaultState();','let state = load() || '+JSON.stringify(layout).replace(/</g,'\\u003c')+';');
html=html.replace('<head>','<head><base href="/">');
html=html.replace('</head>','<style>#cloudDesign,#saveAiView{display:none!important}#localOnly{padding:5px 10px;background:#edf3e9;border-radius:6px;color:#344e32;font-size:12px}</style></head>');
html=html.replace('<header>','<header><span id="localOnly">LOCAL ONLY · Family A / kitchen v4 · <a href="/_qa/project-dossier.html">Project</a></span>');
html=html.replace('Completed edits save to your account. Saved design shows sync status and previous versions.','Edits save to this browser only. Production sync is disconnected.');
html=html.replace("if(location.hash!=='#2d')void setView('3d');",`window.LocalQA={
  info:()=>({canonical:MODEL.canonical_sha256,revision:studioSceneKey(state),fov:camera?.fov,eye:camera?.position.y,lens:walkLens,scaleVisible:scaleRefG?.visible,humanHeight:scaleRefG?new THREE.Box3().setFromObject(scaleRefG).max.y:null,rulerHeight:scaleRefG?.children[4]?.geometry.parameters.height,objects:state.furniture.length}),
  walk:()=>setMode('walk'),
  view:(p,t,fov=42)=>{opt.cut=H;opt.furn=true;sync(true);grow=furnGrow=1;applyGrow();setMode('orbit');anim=fly=null;orbit.enabled=false;camera.position.set(wx(p[0]),1.70,wz(p[1]));orbit.target.set(wx(t[0]),1.40,wz(t[1]));setCameraFov(fov);camera.lookAt(orbit.target);for(const d of doors){d.open=true;d.cur=d.sliding?1:d.a1;if(d.sliding)positionSlide(d);else d.pivot.rotation.y=d.cur;}renderer.render(scene,camera);return LocalQA.info();}
};if(location.hash!=='#2d')void setView('3d');`);

fs.writeFileSync('local-qa/site/home-v4.html',html);
console.log('Isolated local Studio seeded with coordinated candidate');
