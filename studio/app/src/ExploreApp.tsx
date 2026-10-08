import {useEffect,useMemo,useRef,useState} from "react";
import {createEngine} from "../../renderer/engine.js";
import {CANONICAL,model,validate,importBrief,brief,revision} from "./domain";
import {readVariants,saveVariant} from "./storage";
import {download} from "./files";
import {
  FLOORING_OPTIONS,LIGHTING_OPTIONS,PALETTES,snapshotExplore,verifyExplore
} from "./explore-state.mjs";
import type {ExploreChoices,ExploreVerification} from "./explore-state.mjs";
import type {Brief,Camera,Layout} from "./types";
import seed from "../data/workspace-seed.json";
import savedViews from "../data/workspace-cameras.json";
import sourceInfo from "../data/workspace-config.json";
import "./explore.css";

type Engine=ReturnType<typeof createEngine>;
const cameras=savedViews as unknown as Camera[];
const rooms=model.rooms.filter((r:{isTerrace?:boolean})=>!r.isTerrace);
const initial=seed as Brief;
const copy=(o:ExploreChoices & {name?:string}):ExploreChoices=>{const {name,...choices}=o;return choices;};
const originalA=copy(PALETTES.japandi),originalB=copy(PALETTES.calm);

export function ExploreApp(){
  const [source,setSource]=useState<Layout>(()=>importBrief(initial));
  const [sourceName,setSourceName]=useState<string>(sourceInfo.name+" · pinned local source");
  const [room,setRoom]=useState<string>("RECP-01");
  const [view,setView]=useState<Camera>(cameras.find(x=>x.room_id==="RECP-01")||cameras[0]);
  const [a,setA]=useState<ExploreChoices>(originalA);
  const [b,setB]=useState<ExploreChoices>(originalB);
  const [showBoth,setShowBoth]=useState(true);
  const [proof,setProof]=useState<ExploreVerification|null>(null);
  const [notice,setNotice]=useState("Explore previews are temporary. Your saved design is untouched.");
  const [error,setError]=useState("");
  const [ready,setReady]=useState(false);
  const [saving,setSaving]=useState(false);
  const [versionName,setVersionName]=useState("Living · calm contemporary study");
  const aHost=useRef<HTMLDivElement>(null),bHost=useRef<HTMLDivElement>(null);
  const left=useRef<Engine|null>(null),right=useRef<Engine|null>(null);
  const mounted=useRef(false);
  const sourceRef=useRef(source),viewRef=useRef(view),aRef=useRef(a),bRef=useRef(b),roomRef=useRef(room);

  const previewA=useMemo(()=>snapshotExplore(source,room,a),[source,room,a]);
  const previewB=useMemo(()=>snapshotExplore(source,room,b),[source,room,b]);
  const sourceValid=useMemo(()=>{
    try { const v=validate(source);return v.checks.every(x=>x.status!=="FAIL");}
    catch{return false;}
  },[source]);
  useEffect(()=>{sourceRef.current=source;},[source]);
  useEffect(()=>{viewRef.current=view;},[view]);
  useEffect(()=>{aRef.current=a;},[a]);
  useEffect(()=>{bRef.current=b;},[b]);
  useEffect(()=>{roomRef.current=room;},[room]);

  useEffect(()=>{
    if(!aHost.current||!bHost.current)return;
    mounted.current=true;
    try {
      const first=createEngine(aHost.current,snapshotExplore(sourceRef.current,roomRef.current,aRef.current));
      const second=createEngine(bHost.current,snapshotExplore(sourceRef.current,roomRef.current,bRef.current));
      left.current=first;right.current=second;
      first.setView(viewRef.current);second.setView(viewRef.current);
      void Promise.all([first.ready(),second.ready()]).then(()=>{
        if(mounted.current)setReady(true);
      }).catch(e=>{if(mounted.current)setError((e as Error).message)});
    }catch(e){setError((e as Error).message);}
    return ()=>{
      mounted.current=false;
      left.current?.dispose();right.current?.dispose();
      left.current=null;right.current=null;
    };
  },[]);
  useEffect(()=>{
    try{left.current?.update(previewA);}catch(e){setError("A preview: "+(e as Error).message);}
  },[previewA]);
  useEffect(()=>{
    try{right.current?.update(previewB);}catch(e){setError("B preview: "+(e as Error).message);}
    setProof(null);
  },[previewB]);
  useEffect(()=>{
    try{left.current?.setView(view);right.current?.setView(view);}
    catch(e){setError("View: "+(e as Error).message);}
  },[view]);
  function changeRoom(id:string){
    if(!rooms.some((r:{id:string})=>r.id===id)){setError("Unknown canonical room");return;}
    const camera=cameras.find(x=>x.room_id===id);
    setRoom(id);if(camera)setView(camera);
    setProof(null);
    setNotice("Room changed. Each preview still uses identical exact camera geometry.");
  }
  function patchB(value:Partial<ExploreChoices>){
    setB(previous=>({...previous,...value}));
    setNotice("Visual-only B preview. No persistent save or engineering approval.");
  }
  function preset(id:keyof typeof PALETTES){
    setB(copy(PALETTES[id]));
    setNotice("Applied conceptual "+PALETTES[id].name+" mood to B only.");
  }
  function atmosphere(id:"bright"|"relax"|"night"){
    const changes={
      bright:{temperature:3000,brightness:88,lighting:"downlights"},
      relax:{temperature:2700,brightness:65,lighting:"track-lamps"},
      night:{temperature:2700,brightness:35,lighting:"lamps"}
    } as const;
    patchB(changes[id]);
  }
  function verify(){
    setError("");
    try {
      if(!sourceValid)throw Error("Source itself is not validated. No design can be saved.");
      const report=verifyExplore({baseline:source,candidate:previewB,roomId:room,choice:b,
        validate,revision,canonical:CANONICAL});
      setProof(report);
      setNotice("Geometry/source validation passed · "+report.warnings.length+
        " warning(s). Product, sunlight and electrician signoff remain unknown.");
    }catch(e){setProof(null);setError("Verify blocked: "+(e as Error).message);}
  }
  function save(){
    if(!proof||proof.proposed_scene_revision!==revision(previewB)){
      setError("Verify the CURRENT B option first. No unverified local version saved.");return;
    }
    if(!versionName.trim()){setError("Name your study before saving.");return;}
    setSaving(true);setError("");
    try {
      const rows=readVariants();
      const saved=saveVariant(rows,{
        id:crypto.randomUUID(),name:versionName.trim(),brief:brief(previewB),
        log:[],created:new Date().toISOString()
      });
      setNotice("Saved a new IMMUTABLE LOCAL version (#"+saved.length+
        "). Open Workspace → Versions to inspect it. Existing drafts and cloud Studio untouched.");
    }catch(e){setError("Version not saved: "+(e as Error).message);}
    finally{setSaving(false);}
  }
  async function importSource(file?:File){
    if(!file)return;
    try{
      const json=JSON.parse(await file.text()) as Brief;
      const valid=importBrief(json);
      setSource(valid);setSourceName(file.name+" · validated imported source");
      const camera=cameras.find(v=>v.room_id===room);
      if(camera)setView(camera);
      setProof(null);setError("");
      setNotice("Imported exact-canonical, valid local brief. No site/cloud writes.");
    }catch(e){setError("Source was NOT imported: "+(e as Error).message);}
  }
  function exportReport(){
    if(!proof)return;
    download("TypeB-Explore-"+proof.proposed_scene_revision+".json",
      JSON.stringify({...proof,brief:brief(previewB),design_options:b,
        visual_only:true,requires_site_survey:true},null,2));
  }
  function savePng(){
    if(!right.current||!ready)return;
    try{
      const encoded=right.current.screenshot().split(",")[1];
      const buffer=Uint8Array.from(atob(encoded),ch=>ch.charCodeAt(0));
      download("TypeB-"+room+"-"+revision(previewB)+".png",
        new Blob([buffer],{type:"image/png"}));
    }catch(e){setError("Image export: "+(e as Error).message);}
  }
  const isVerified=!!proof&&proof.proposed_scene_revision===revision(previewB);
  return (
    <div className="explore-app">
      <header className="explore-topbar">
        <div>
          <a href="/_qa/workspace/" className="explore-back">← Design workspace</a>
          <h1>Explore <span>&</span> Verify</h1>
          <p>Play with the atmosphere. Keep Type B geometry locked.</p>
        </div>
        <div className="explore-source">
          <span className="explore-pill">LOCAL SANDBOX</span>
          <small>{sourceName}</small>
          <small>Canonical Type B v0.2.2 · 2.50 m finished height</small>
        </div>
      </header>
      <section className="explore-controls" aria-label="Design study settings">
        <label>Space
          <select aria-label="Room" value={room} onChange={e=>changeRoom(e.target.value)}>
            {rooms.map((r:{id:string,name:string})=><option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </label>
        <label>Camera (identical A/B)
          <select aria-label="Matched camera" value={view.id}
            onChange={e=>{const c=cameras.find(x=>x.id===e.target.value);if(c)setView(c);}}>
            {cameras.filter(c=>c.room_id===room).map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </label>
        <label className="explore-toggle">
          <input type="checkbox" checked={showBoth} onChange={e=>setShowBoth(e.target.checked)} />
          Side-by-side A/B
        </label>
        <label className="explore-import">
          Import validated brief
          <input type="file" accept=".json" onChange={e=>void importSource(e.target.files?.[0])}/>
        </label>
      </section>

      <main className="explore-main">
        <section className={"explore-frames "+(showBoth?"dual":"single")}>
          <div className="explore-view" style={{display:showBoth?"flex":"none"}}>
            <div className="explore-view-head"><strong>A · Reference</strong>
              <span>Temporary, unchanged furniture</span></div>
            <div ref={aHost} className="explore-canvas" aria-label="Reference Three.js 3D apartment viewport"/>
          </div>
          <div className="explore-view">
            <div className="explore-view-head"><strong>B · Your idea</strong>
              <span>{isVerified?"Geometry verified":"Visual preview · not verified"}</span></div>
            <div ref={bHost} className="explore-canvas" aria-label="Experimental Three.js 3D apartment viewport"/>
          </div>
          {!ready&&<div className="explore-loading" role="status">Preparing local real-time 3D previews…</div>}
        </section>

        <aside className="explore-inspector">
          <h2>Material studio</h2>
          <p className="explore-intro">Change B as often as you like. No writes until you explicitly save a verified version.</p>

          <fieldset>
            <legend>Creative directions</legend>
            <div className="explore-presets">
              {(Object.keys(PALETTES) as Array<keyof typeof PALETTES>).map(key=>
                <button key={key} onClick={()=>preset(key)}>{PALETTES[key].name}</button>)}
            </div>
          </fieldset>

          <fieldset>
            <legend>Surface mood</legend>
            <label>Floor (generic visual reference)
              <select aria-label="Flooring option" value={b.flooring}
                onChange={e=>patchB({flooring:e.target.value as ExploreChoices["flooring"]})}>
                {FLOORING_OPTIONS.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}
              </select>
            </label>
            <label>Wall paint
              <div className="explore-colour-row">
                <input type="color" aria-label="Wall colour" value={b.wall}
                  onChange={e=>patchB({wall:e.target.value})}/>
                <output>{b.wall.toUpperCase()}</output>
              </div>
            </label>
          </fieldset>
          <fieldset>
            <legend>Light ambience <span className="explore-proxy">conceptual only</span></legend>
            <div className="explore-presets">
              <button onClick={()=>atmosphere("bright")}>Bright mood</button>
              <button onClick={()=>atmosphere("relax")}>Relax mood</button>
              <button onClick={()=>atmosphere("night")}>Dim evening</button>
            </div>
            <label>Lighting arrangement
              <select aria-label="Lighting arrangement" value={b.lighting}
                onChange={e=>patchB({lighting:e.target.value as ExploreChoices["lighting"]})}>
                {LIGHTING_OPTIONS.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}
              </select>
            </label>
            <label>Warmth
              <select aria-label="Light temperature" value={b.temperature}
                onChange={e=>patchB({temperature:Number(e.target.value) as ExploreChoices["temperature"]})}>
                <option value="2700">2700K · warm</option>
                <option value="3000">3000K · gentle neutral</option>
                <option value="4000">4000K · task-white</option>
              </select>
            </label>
            <label>Preview brightness — {b.brightness}%
              <input type="range" min="0" max="100" step="5" value={b.brightness}
                aria-label="Visual brightness" onChange={e=>patchB({brightness:Number(e.target.value)})}/>
            </label>
            <p className="explore-small">This changes the renderer's decorative scene; it does NOT calculate sun azimuth, lux, physical daylight or electrical circuits.</p>
          </fieldset>

          <fieldset>
            <legend>Version your idea</legend>
            <div className="explore-actions">
              <button onClick={()=>{setA({...b});setNotice("A now holds B's current look. Continue refining B.");}}>
                Snapshot B → A
              </button>
              <button onClick={()=>{setB({...a});setNotice("Restored B from snapshot A. Nothing was persisted.");}}>
                Revert B to A
              </button>
              <button onClick={()=>{setA({...b});setB({...a});}}>Swap A ↔ B</button>
            </div>
            <button onClick={savePng} disabled={!ready}>Save current image</button>
          </fieldset>
          <fieldset className="explore-verify">
            <legend>Verify mode</legend>
            <p className="explore-small">Check canonical SHA, every room/fixture and scene validation first. This is a geometry gate, not construction approval.</p>
            <button className="explore-primary" onClick={verify} disabled={!ready||!sourceValid}>
              Verify B against original Type B
            </button>
            {proof&&<p className="explore-proof">{proof.pass_count} PASS · {proof.warnings.length} WARN · 0 FAIL<br/>
              <small>Scene {proof.proposed_scene_revision}</small></p>}
            <label>Immutable local version name
              <input value={versionName} onChange={e=>setVersionName(e.target.value)}/>
            </label>
            <button className="explore-primary" onClick={save} disabled={!isVerified||saving}>
              Save verified local variant
            </button>
            <button onClick={exportReport} disabled={!isVerified}>Export verified brief & evidence</button>
          </fieldset>
        </aside>
      </main>
      {error&&<div role="alert" className="explore-error">{error}<button onClick={()=>setError("")}>Dismiss</button></div>}
      <div className="explore-bottom" role="status">{notice}</div>
      <footer className="explore-foot">
        <span>Read-only until you save a local version · Cloud Studio never changed.</span>
        <span>Generic materials and light previews are not electrical, procurement or construction documents.</span>
      </footer>
    </div>
  );
}
