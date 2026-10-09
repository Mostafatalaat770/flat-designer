/**
 * Explore = reversible, instant, LOCAL visual options.
 * Verify = explicit geometry/source validation before writing an immutable
 * local version. Do not touch apartment walls, saved cloud Studio or master.
 */
export const FLOORING_OPTIONS = [
  {id:"tile800",name:"Honed porcelain · 80×80 look"},
  {id:"travertine",name:"Cream travertine look"},
  {id:"lightoak",name:"Light oak look"},
  {id:"parquet",name:"Parquet look"},
  {id:"terrazzo",name:"Terrazzo look"}
];
export const LIGHTING_OPTIONS = [
  {id:"track-lamps",name:"Track + soft lamps"},
  {id:"lamps",name:"Warm lamps"},
  {id:"track",name:"Track spots"},
  {id:"downlights",name:"Recessed-look downlights"},
  {id:"none",name:"No decorative lights"}
];
export const PALETTES = {
  "calm": {name:"Calm Contemporary",wall:"#EEE8DF",flooring:"tile800",lighting:"track-lamps",temperature:3000,brightness:80},
  "japandi": {name:"Warm Japandi",wall:"#E5DED3",flooring:"lightoak",lighting:"lamps",temperature:2700,brightness:65},
  "bright": {name:"Soft & bright",wall:"#F2EEE7",flooring:"travertine",lighting:"downlights",temperature:3000,brightness:85}
};
const floorIds=new Set(FLOORING_OPTIONS.map(x=>x.id));
const lightingIds=new Set(LIGHTING_OPTIONS.map(x=>x.id));
const hex=/^#[a-f0-9]{6}$/i;
const hasOwn=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
export function assertExploreChoices(value){
  if(!value||typeof value!=="object"||Array.isArray(value))throw Error("Explore choices must be an object");
  if(Object.keys(value).sort().join(",")!=="brightness,flooring,lighting,temperature,wall")
    throw Error("Explore changes may contain only wall, flooring, light mode, temperature and brightness");
  if(!hex.test(value.wall)||!floorIds.has(value.flooring)||!lightingIds.has(value.lighting)||
     ![2700,3000,4000].includes(value.temperature)||
     !Number.isInteger(value.brightness)||value.brightness<0||value.brightness>100)
    throw Error("Invalid Explore palette/light setting");
  return true;
}
export function snapshotExplore(layout,roomId,choice){
  assertExploreChoices(choice);
  if(!layout||!layout.rooms||!hasOwn(layout.rooms,roomId))throw Error("Use an actual canonical room");
  if(layout.rooms[roomId].isTerrace)throw Error("No interior material palette for exposed terrace");
  const out=structuredClone(layout);
  if(!out.studio||out.studio.version!==1||!out.studio.rooms)throw Error("Missing verified studio options");
  out.studio.rooms[roomId]={...out.studio.rooms[roomId],
    wall:choice.wall,flooring:choice.flooring,lighting:choice.lighting,
    temperature:choice.temperature,brightness:choice.brightness};
  return out;
}
export function verifyExplore({baseline,candidate,roomId,choice,validate,revision,canonical}){
  const expected=snapshotExplore(baseline,roomId,choice);
  if(JSON.stringify(expected)!==JSON.stringify(candidate))
    throw Error("Explore proposal includes extra edits: geometry/furniture/other rooms are locked");
  if(baseline.sourceCanonicalHash && baseline.sourceCanonicalHash!==canonical)
    throw Error("Source canonical architecture changed");
  if(expected.sourceCanonicalHash && expected.sourceCanonicalHash!==canonical)
    throw Error("Preview canonical architecture changed");
  if(typeof revision!=="function"||typeof validate!=="function")
    throw Error("Explicit source validator required");
  const checks=validate(candidate).checks;
  const fails=checks.filter(x=>x.status==="FAIL");
  if(fails.length)throw Error("Not verified: "+fails.slice(0,3).map(x=>x.message).join("; "));
  return {
    schema:"ApartmentExploreVerification/1",
    canonical_sha256:canonical,
    base_scene_revision:revision(baseline),
    proposed_scene_revision:revision(candidate),
    room_id:roomId,
    pass:true,
    pass_count:checks.filter(x=>x.status==="PASS").length,
    warnings:checks.filter(x=>x.status==="WARNING").map(x=>x.message),
    allowed_changes:["one room: wall paint","one room: flooring visual option",
      "one room: decorative lighting preview","one room: color temperature and brightness proxy"],
    excluded:["real sunlight/solar geography","actual material supplier/PBR accuracy","electrical wattage/circuits",
      "real plumbing/HVAC/ceiling approval","human occupation and accessibility"]
  };
}
