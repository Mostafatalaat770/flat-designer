import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { createApartmentDomain } from "../domain/apartment.mjs";
const root = path.resolve(import.meta.dirname, "../.."),
  domain = createApartmentDomain(root);
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p)));
const brief = read("studio/app/data/family-a7.brief.json"),
  layout = domain.importBrief(brief),
  model = domain.model;
assert.equal(domain.revision(layout), "scene-9e210720");
assert.equal(domain.validate(layout).valid, true);
const base = path.join(root, "local-qa/site/chatgpt-image-pack"),
  refs = path.join(base, "references"),
  prompts = path.join(base, "prompts");
fs.mkdirSync(refs, { recursive: true });
fs.mkdirSync(prompts, { recursive: true });
const write = (file, data) => fs.writeFileSync(path.join(base, file), data);
const copy = (source, name) =>
  fs.copyFileSync(path.join(root, source), path.join(refs, name));
const baseline = (view, name) =>
  copy(
    ".argent/flows/__baselines__/studio-engine-parity-v1/" +
      view +
      "__chromium-1600x857.png",
    name,
  );
for (const [view, name] of [
  ["family-v7-entry", "01-reception-entry.png"],
  ["family-v7-family", "01-reception-living.png"],
  ["family-v7-dining", "01-reception-dining.png"],
  ["family-v7-master", "03-master-bedroom.png"],
  ["family-v7-master-storage", "03-master-storage.png"],
  ["family-v7-bedroom1", "04-bedroom-1.png"],
  ["family-v7-bedroom1-study", "04-bedroom-1-study.png"],
  ["family-v7-bedroom2", "05-bedroom-2.png"],
  ["family-v7-bedroom2-window", "05-bedroom-2-window.png"],
  ["family-v7-dressing", "06-dressing.png"],
  ["family-v7-hall", "10-private-hall.png"],
])
  baseline(view, name);
for (const [view, name] of [
  ["workspace-kitchen", "02-kitchen.png"],
  ["workspace-family-bath", "08-family-bathroom.png"],
  ["workspace-bath-m01", "07-ensuite.png"],
])
  copy(
    ".argent/flows/__baselines__/studio-utility-views-v1/" +
      view +
      "__chromium-1600x857.png",
    name,
  );
for (const { id, path: source } of read(
  "local-qa/reports/image-prompt-reference-paths.json",
))
  fs.copyFileSync(
    source,
    path.join(
      refs,
      {
        "guest-wc": "09-guest-wc",
        "main-terrace": "11-main-terrace",
        "master-terrace": "12-master-terrace",
        "service-terrace": "13-service-terrace",
      }[id] + ".png",
    ),
  );
const esc = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll('"', "&quot;");
const pts = (p) => p.map((v) => v.join(",")).join(" ");
const items = [
  ...layout.furniture,
  ...layout.interior.objects
    .filter(
      (o) => o.placement.mode === "floor" && !(o.placement.elevation_mm > 0),
    )
    .map((o) => ({ ...domain.resolveObject(o), color: o.colour })),
];
let shapes = "";
for (const r of model.rooms)
  shapes += `<polygon data-room="${r.id}" points="${pts(r.poly)}" fill="${r.isTerrace ? "#e1e7db" : r.kind === "bathroom" || r.kind === "toilet" ? "#e9e4d8" : "#f4efe4"}" stroke="#ded8cb" stroke-width="12"/>`;
for (const f of [...items].sort(
  (a, b) => (a.type === "rug" ? -1 : 0) - (b.type === "rug" ? -1 : 0),
))
  shapes += `<polygon data-furniture="${esc(f.id)}" points="${pts(domain.footprint(f))}" fill="${f.color || "#c7b79a"}" fill-opacity="${f.type === "rug" ? 0.25 : 0.85}" stroke="#847c6c" stroke-width="12"/>`;
for (const [i, s] of model.wall_segments.entries())
  shapes += `<path data-wall="${i}" d="M${s.from.join(",")} L${s.to.join(",")}" stroke="${s.height_m < 2 ? "#8b877b" : "#393d36"}" stroke-width="${s.thickness_mm}" fill="none"/>`;
for (const o of model.openings)
  shapes += `<path data-opening="${esc(o.id)}" d="M${o.from.join(",")} L${o.to.join(",")}" stroke="${o.type.includes("door") ? "#b67a43" : "#5895a6"}" stroke-width="55" fill="none"/>`;
const svg = (labels) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="3000" height="2080" viewBox="-500 -600 ${model.width_mm + 1000} ${model.depth_mm + 1500}"><rect x="-500" y="-600" width="${model.width_mm + 1000}" height="${model.depth_mm + 1500}" fill="#fffdf8"/>${shapes}${labels ? model.rooms.map((r) => `<text x="${r.at[0]}" y="${r.at[1]}" text-anchor="middle" font-family="Arial,sans-serif" font-size="138" font-weight="bold" fill="#263027">${r.id}</text>`).join("") + `<text x="100" y="${model.depth_mm + 440}" font-family="Arial,sans-serif" font-size="120" fill="#3f473d">Canonical layout · Family A.7 · plan mm · dark: walls · blue: glazing · ochre: door openings</text>` : ""}</svg>`;
for (const [name, labels] of [
  ["00-canonical-plan-labelled", true],
  ["00-canonical-plan-clean", false],
]) {
  const data = svg(labels);
  write("references/" + name + ".svg", data);
  const canvas = createCanvas(3000, 2080),
    ctx = canvas.getContext("2d");
  ctx.drawImage(await loadImage(Buffer.from(data)), 0, 0);
  write("references/" + name + ".png", canvas.toBuffer("image/png"));
}
write(
  "canonical-geometry.json",
  JSON.stringify(
    {
      schema: "ApartmentImageReferenceGeometry/1",
      canonical_sha256: brief.canonical_sha256,
      scene_revision: brief.scene_revision,
      units: "mm",
      width_mm: model.width_mm,
      depth_mm: model.depth_mm,
      finished_clear_height_mm: 2500,
      rooms: model.rooms,
      wall_segments: model.wall_segments,
      openings: model.openings,
      furniture: layout.furniture,
      interior_objects: layout.interior.objects,
    },
    null,
    2,
  ) + "\n",
);
const common = `Create one highly photorealistic architectural interior image of my ACTUAL apartment, using the attached canonical plan and room screenshot as spatial references. This is a finish-and-detail interpretation of an existing design, not a new floor plan.

REFERENCE PRIORITY: the labelled canonical plan controls room boundaries, walls, openings, glazing, adjacency and furniture footprints. The primary room screenshot controls camera/framing and visible object placement; other screenshots explain the same room from another angle. Product/style photos, if supplied, control appearance only. Resolve any ambiguity by retaining the plan, rather than inventing geometry.

Keep all walls, openings, glazing extents, terrace parapets, room boundaries, fixture positions and major furniture locations, rotations and outside dimensions. Finished indoor clear height is 2.50 m. Reception glazing is full-height. RECP-01 is ONE continuous living/dining/entry room: internal zones are not separate rooms. Keep the enclosed kitchen. Preserve routes and empty space in the supplied plan.

STYLE: elegant warm family home; Warm Organic Modern / quiet luxury with restrained Mediterranean softness and Japandi restraint. Near-white warm-ivory ceilings, subtle ivory/greige walls, pale natural/smoked oak, selective walnut, oatmeal/sand/mushroom textiles and restrained muted olive. Honed light limestone-look reception floor; light oak bedroom/dressing floors; matte warm-ivory porcelain in bathrooms. Natural material variation, realistic grain, linen weave, upholstery seams, believable cushion thickness, small manufacturing radii, true mirror reflections and coherent contact shadows. Retain the floor transitions shown in the plan/reference.

LIGHT: soft plausible daylight through existing openings, balanced approximately 3000 K general lighting, slightly warmer decorative lamps, neutral white balance and well-exposed interiors. Keep ceilings light and colours clean. Correct the dark/brown cast of schematic renders without creating windows or fake sunlight sources. Show only a subdued non-specific exterior where already visible; external scenery is unverified.

Replace schematic surface/mesh appearance with detailed realistic craftsmanship while retaining footprints and furniture counts. Avoid boho styling, excessive curves, bulky additions, gallery walls, crowded accessories, glossy showroom staging and ultra-wide/fisheye distortion. Manufacturer names are visual/dimensional REFERENCES, not proof of an exact SKU; use attached product photos if provided. Generic linen, plaster and stone are not named real materials. Do not invent concealed HVAC slots or claim ducted equipment fits the 130 mm void. No construction/service/procurement claims.

For room images, closely match the PRIMARY screenshot viewpoint: standing eye 1.70 m, Natural 42-degree VERTICAL FOV, straight verticals, landscape framing. Do not widen the room, shrink furniture or hide obstacles for a prettier composition. Generate one image, not a collage, with no text, logos, watermark or people. Camera numbers are appearance cues, not a guarantee of exact simulation. The result is an EXPLORATORY visual concept; geometric acceptance comes from comparison with the canonical references.`;
write("00-MASTER-PROMPT.txt", common + "\n");
const rooms = [
  {
    n: "01",
    id: "RECP-01",
    title: "Reception — living, dining and entry",
    slug: "reception",
    files: [
      "01-reception-entry.png",
      "01-reception-living.png",
      "01-reception-dining.png",
    ],
    text: `Render the primary entry view of the continuous reception. One comfortable straight family sofa, 2880 × 990 mm outside footprint, natural warm linen; Muuto Connect Soft 3-seat is a dimensional/character reference. One olive accent chair, about 700 × 720 mm, sits with the living group. Keep the TV and 1800 × 380 mm console at their current wall; no TV relocation. Keep the 950 × 580 mm coffee table and 460 mm side table. The dining table is 2000 × 950 mm, with EXACTLY six slim mushroom/taupe chairs, THREE on EACH LONG SIDE, NO HEAD CHAIRS. Muuto Fiber Side Chair is a dimensional reference (510 × 530 mm). Preserve the kitchen entrance. Keep the 2400 × 400 mm closed sideboard with one large artwork (1400 × 900 mm), one supported table lamp, the existing reading light, one 1650 mm specimen plant, 1200 × 300 mm shoe storage and 1000 × 340 mm entry bench. Furnish to the current footprint; keep the middle breathable. Light full-height linen curtains frame the existing full-height glazing. Render realistic leaves, smooth finely crafted tables and understated upholstery instead of repeated cartoon shapes; keep small props restrained.`,
  },
  {
    n: "02",
    id: "KIT-01",
    title: "Kitchen — fitted cabinetry and indoor laundry",
    slug: "kitchen",
    files: ["02-kitchen.png"],
    text: `Show the existing enclosed L kitchen from the primary reference viewpoint. Preserve the angled northeast boundary and both reception/service-terrace openings. Pale oak flush cabinetry, warm light worktop and quiet matching backsplash. West run: 1500 mm cooking counter, 600 mm gas hob, reserved oven at the existing cooking run; hood/exhaust styling is conceptual, not a ventilation design. North run: 600 mm corner base, 600 × 610 mm indoor washer niche, 600 × 610 mm integrated dishwasher niche, 600 mm sink/waste base with 550 mm sink, and shallow 600 × 410 mm landing. Represent a fitted continuous 1200 × 610 mm preparation worktop over the washer/dishwasher; dress their fronts coherently without deleting appliances or moving them. Preserve the southeast 650 × 650 mm fridge reserve. Realistic cabinet joints, handles, hinges, sink, tap, hob grates and appliance proportions. Keep the circulation/appliance access shown. No island, peninsula, open-plan wall removal, extra tall cabinet or balcony washer. Keep organization mostly behind closed fronts. Selected appliance installation, gas/hood clearances, countertop supports and plumbing remain TBD.`,
  },
  {
    n: "03",
    id: "MBR-01",
    title: "Master bedroom",
    slug: "master-bedroom",
    files: ["03-master-bedroom.png", "03-master-storage.png"],
    text: `Render the current master layout with the bed and storage in their existing locations. The king mattress is 1800 × 2000 mm; the upholstered outer frame is 1870 × 2220 mm (IKEA IDANÄS is a dimensional reference, not the exact current CAD/fabric). Keep both 450 × 400 mm nightstands and the 2600 × 3000 mm rug. The 1000 × 400 mm closed chest and 1000 × 350 mm dressing bench remain on the south wall, with the east-side main path clear. Quiet ivory/oatmeal tailored bedding, restrained taupe layers, pale oak joinery and soft warm bedside light, detailed seams and realistic mattress thickness. Use the existing windows; keep curtains light and sills/opening proportions exact. Calm family bedroom, with no oversized foot bench, extra chair, new divider, bed repositioning or excessive cushions.`,
  },
  {
    n: "04",
    id: "BR-01",
    title: "Bedroom 1 — flexible family bedroom",
    slug: "bedroom-1",
    files: ["04-bedroom-1.png", "04-bedroom-1-study.png"],
    text: `Preserve the current single-bed/study arrangement. Mattress 1200 × 2000 mm within an INFERRED 1280 × 2100 mm outer-frame reserve; do not depict the mattress as that outer size. Keep the 1800 × 600 mm wardrobe, 1200 × 600 mm desk, compact study chair and 1000 × 350 mm closed drawer/book/toy storage. Keep the window and usable bed/desk/wardrobe approaches. Refined adaptable family room: ivory textile headboard, light oak, soft mushroom linen and one subtle muted-olive detail; light warm curtains. Realistic drawer fronts, desk hardware and textiles; tidy surface, minimal books. No invented child's age, cartoon theme, bunk bed, second bed, extra armchair or cabinetry across glazing.`,
  },
  {
    n: "05",
    id: "BR-02",
    title: "Bedroom 2 — flexible bedroom and study",
    slug: "bedroom-2",
    files: ["05-bedroom-2.png", "05-bedroom-2-window.png"],
    text: `Keep the single-bed headboard on the EAST solid wall, with the north window unobstructed. Mattress 1200 × 2000 mm inside the INFERRED 1280 × 2100 mm outer-frame reserve. Keep the 1000 × 600 mm desk, compact task chair and 1600 × 600 mm wardrobe; one wardrobe bay is for family linen. Ivory/oatmeal textiles, pale oak and restrained dusty-olive/taupe accents, coordinated with Bedroom 1 but without identical decorative artwork. Show plausible joinery and task-chair details. Preserve the available wardrobe approach and existing door. No bed under/across glazing, enlarged desk, extra sofa, wardrobe island or invented room expansion.`,
  },
  {
    n: "06",
    id: "WIC-01",
    title: "Dressing room",
    slug: "dressing",
    files: ["06-dressing.png"],
    text: `Show the compact dressing passage as it actually is. Two 1250 × 600 mm CLOSED wardrobes occupy the existing north/south positions. Preserve the irregularly important bathroom and master-bedroom doorway relationships; use the plan for actual frontage separation and side passage rather than inventing a large walk-in closet. Pale oak flush fronts with realistic seams, restrained slim handles, near-white ceiling and clean warm lighting. Convey purposeful closed hanging/shelf/drawer storage without showing all drawers open simultaneously. No centre island, bench, extra wardrobe run, doorway widening or invented ceiling bulkhead.`,
  },
  {
    n: "07",
    id: "BATH-M01",
    title: "Master ensuite — retained bathtub scheme",
    slug: "ensuite",
    files: ["07-ensuite.png"],
    text: `Preserve the retained 1500 × 750 mm bathtub at the north side, existing toilet at the south/east side and 600 × 460 mm custom closed vanity at the south/west side. The canonical room polygon is approximately 1.716 × 2.754 m; show its compact scale. The basin can be refined into a plausible compact rectangular D-Neo-like 600 mm basin within the existing envelope; the model's generic round bowl is not a real-product claim. Warm ivory matte porcelain, quiet grout, pale oak vanity, restrained bronze/brushed-metal fittings and realistic mirror/glass/reflections. Match the primary vanity/WC view; do not force the bathtub into that frame by rearranging fixtures. Keep the bath/dressing doorway as drawn. No additional shower, double vanity, niche carved into a wall, expanded room or fixture relocation. Waterproofing, drain positions, valves and service feasibility are TBD.`,
  },
  {
    n: "08",
    id: "BATH-C01",
    title: "Family bathroom — shower scheme",
    slug: "family-bathroom",
    files: ["08-family-bathroom.png"],
    text: `Keep the 900 × 900 mm shower, existing WC orientation, 600 × 460 mm closed vanity and 300 × 300 mm towel/cleaning cabinet in their current positions. The room polygon is approximately 1.801 × 2.754 m. Warm ivory matte wet-area porcelain with restrained grout, pale oak moisture-suitable vanity concept and realistic chrome/brushed-metal fittings, mirror reflection and glass thickness. Make the shower tray/enclosure and basin look like real compact fixtures within their existing envelopes. Show only the part visible from the primary reference; the plan governs off-camera fixtures. No bathtub, double basin, extra cabinet, wall recess or opening alteration. Keep door and fixture use space believable. Drainage, falls, glass swing, installation and slip resistance remain TBD.`,
  },
  {
    n: "09",
    id: "WC-01",
    title: "Guest WC",
    slug: "guest-wc",
    files: ["09-guest-wc.png"],
    text: `Show a refined SMALL guest WC, approximately 1.864 × 1.271 m in the canonical polygon. Preserve the 400 × 650 mm toilet, 400 × 300 mm handwash basin, current door and mirror/fixture relationship. Warm ivory porcelain/plaster-compatible finish, compact pale-oak closed basin unit, small restrained fittings and well-exposed soft lighting. Realistic compact ceramic forms, tap scale, contact shadows and reflected surfaces. Keep the door's occlusion if it occurs in the primary reference; do not move the basin or widen the room to reveal everything. No shower, bath, double vanity, new window, full-height extra cabinet or floor accessories. Existing ventilation and plumbing remain unverified.`,
  },
  {
    n: "10",
    id: "HALL-01",
    title: "Private hall",
    slug: "private-hall",
    files: ["10-private-hall.png"],
    text: `Preserve every bedroom/bath/dressing opening and the actual narrow hall. Keep the current light oak floor, warm ivory walls, near-white ceiling, restrained practical lighting and existing 500 × 1100 mm wall mirror at its current host wall. Give the mirror a true reflection that corresponds to the actual adjacent space. The clear modeled face distance is about 1027 mm; retain the empty route. Do not add console tables, benches, shoe cabinets, plants, rugs that obstruct doors or decorative dividers. This area is a calm functional connection, not another furniture group.`,
  },
  {
    n: "11",
    id: "TER-MAIN",
    title: "Main terrace",
    slug: "main-terrace",
    files: ["11-main-terrace.png"],
    text: `Render the existing main terrace, approximately 3.538 × 2.733 m. Keep the 600 mm round table and TWO 650 × 650 mm chairs at the plan positions, with the existing living glazing/access and low parapets unchanged. Replace generic indoor-looking chair detailing with credible outdoor-rated light frames and muted-olive/sand weather-resistant cushions within those same footprints. Realistic matte exterior paving and discreet weathering, warm neutral daylight, calm restrained mood. No additional lounge sofa, pool, pergola, new glazing enclosure or parapet replacement. Preserve any existing balcony slab/cover shown; do not invent an overhead structure or panoramic sea/city view. Outdoor product/SKU and drainage details remain TBD.`,
  },
  {
    n: "12",
    id: "TER-MBR",
    title: "Master terrace",
    slug: "master-terrace",
    files: ["12-master-terrace.png"],
    text: `Keep this SMALL terrace, approximately 1.970 × 1.568 m, with its existing opening, parapets and one potted plant at the plan location. Refine the generic plant into realistic foliage within the reserved 500 × 500 mm pot/plant footprint. Use matte outdoor paving, a simple warm neutral pot and soft daylight, with honest compact scale. Keep the circulation/access clear. No table/chairs, built-in bench, laundry appliance, glazed enclosure, changed railing or invented skyline. Species and outdoor product selection remain exploratory.`,
  },
  {
    n: "13",
    id: "TER-SVC",
    title: "Service terrace",
    slug: "service-terrace",
    files: ["13-service-terrace.png"],
    text: `Keep the service terrace utility-focused and essentially clear, approximately 1.906 × 1.271 m. Preserve its kitchen doorway, boundaries and parapets. Realistic durable matte exterior paving and simple neutral wall surfaces, believable threshold and daylight. The washing machine belongs in the existing indoor kitchen niche, not here. Do not invent a washer, sink, dryer, outdoor power/plumbing, storage wall, glazed enclosure or fixed drying rack; equipment placement is a separate future study. Keep access and potential drying/maintenance space clear. Any drain or external service not visible/verified remains unspecified.`,
  },
];
const roomFiles = [];
for (const r of rooms) {
  const room = model.rooms.find((room) => room.id === r.id),
    size = [
      Math.max(...room.poly.map((p) => p[0])) -
        Math.min(...room.poly.map((p) => p[0])),
      Math.max(...room.poly.map((p) => p[1])) -
        Math.min(...room.poly.map((p) => p[1])),
    ];
  const content = `${r.title.toUpperCase()} — ${r.id}\n\nATTACH IN THIS ORDER: Image 1 = references/00-canonical-plan-labelled.png (GEOMETRY); Image 2 = references/${r.files[0]} (PRIMARY CAMERA). Optional supplementary views: ${
    r.files
      .slice(1)
      .map((f) => "references/" + f)
      .join(", ") || "none"
  }. If available, also attach the previously accepted reception image as a STYLE reference only.\n\n${common}\n\nROOM-SPECIFIC BRIEF\n${r.text}\n\nCANONICAL SIZE CONTEXT\nRoom polygon area: ${room.area_estimate_m2.toFixed(2)} m². Plan-axis bounding extent: ${Math.round(size[0])} × ${Math.round(size[1])} mm; this is a bounding extent, not proof of a rectangular room. The labelled plan takes precedence over rounded numbers. ${r.id === "RECP-01" ? "The reception is a non-rectangular continuous space. " : ""}All nominal furniture dimensions above describe local outside envelopes before plan rotation.\n\nGenerate ONLY this room/view now. Match the previous accepted materials and colour grading across the apartment. If a reference is missing or ambiguous, explain that before inventing geometry.\n`;
  const filename = r.n + "-" + r.slug + ".txt";
  write("prompts/" + filename, content);
  roomFiles.push({
    room_id: r.id,
    title: r.title,
    prompt: filename,
    reference_files: r.files,
  });
}
const top = `WHOLE APARTMENT — TRUE TOP-DOWN FURNISHED VISUALIZATION\n\nATTACH FIRST: Image 1 = references/00-canonical-plan-labelled.png; Image 2 = references/00-canonical-plan-clean.png. Use the labelled image for room identity and the clean image for exact tracing. Attach the accepted reception image and selected room images as finish/style references. The optional canonical-geometry.json supplies exact millimetre polygons and placements.\n\nCreate one highly realistic furnished architectural TOP-DOWN rendering of this exact apartment. True orthographic camera looking vertically down, aligned to the attached plan, same orientation, no perspective taper or rotation. Show the COMPLETE apartment and all three terraces with adequate image margins. Remove roofs and indoor ceilings ONLY as a presentation cutaway so the interiors can be seen; do not change actual wall heights, boundaries, openings or structure. Show realistic furniture/fixture tops, materials and soft coherent daylight/contact shadows. No labels, icons, measurements, collage, logos, watermark or people. White/off-white background outside the apartment; retain its actual irregular external outline and voids rather than filling them with invented rooms.\n\nGEOMETRY IS LOCKED. Trace the labelled canonical plan: 13 named areas, including THREE bedrooms, private hall, dressing room, TWO bathrooms plus separate guest WC, ONE enclosed kitchen, THREE terraces and ONE continuous irregular reception/living/dining/entry. Preserve every room polygon, wall thickness, door/glazing location and opening width, including the kitchen angled corner. Never split reception into rooms or open the kitchen wall. Full-height living glazing remains in its exact position. Use no invented island, corridors, window, ensuite or storage room. Indoor clear height remains 2.50 m; existing terrace parapets keep their canonical height.\n\nFURNITURE: copy all major footprints, centres, rotations, quantities and room assignments from the plan. Reception: 2880 × 990 mm sofa, one olive accent chair, current TV wall, 2000 × 950 mm oval dining table with SIX chairs THREE PER LONG SIDE and no head chairs, 2400 × 400 mm sideboard, entry shoe storage and slim bench, one plant. Master: 1870 × 2220 mm king frame, two nightstands, existing closed chest and SOUTH-WALL dressing bench. Each secondary bedroom: one 1280 × 2100 mm frame reserve, desk and wardrobe at the exact plan positions. Dressing: both 1250 × 600 mm wardrobes; hall remains free of floor furniture. Kitchen: existing L counters, gas hob, indoor washer, dishwasher, sink and southeast fridge reserve; no island. Ensuite: retained 1500 × 750 bathtub/WC/vanity. Family bathroom: 900 × 900 shower/WC/vanity/small storage. Guest WC: compact toilet/handwash. Main terrace: two chairs/600 mm table. Master terrace: existing single plant. Service terrace: clear, no washing machine.\n\nMATERIAL COHERENCE: elegant warm organic family home with restrained Mediterranean softness and Japandi restraint. Warm ivory walls, natural pale/smoked oak joinery, warm light limestone-look reception flooring, light oak bedroom/dressing/hall floors, warm ivory matte kitchen/bath porcelain, oatmeal/sand/mushroom upholstery and muted olive accents, minimal bronze. Realistic textile weave, joinery seams, ceramic/glass response and natural stone variation. Finishes should match the accepted room images without changing their geometry. Keep the central reception space and all approach routes breathable. Generic material concepts remain generic; do not claim exact product SKUs or construction accuracy.\n\nGenerate this one orthographic whole-apartment image only. Exact room arrangement and furniture scale take priority over beautifying the layout. If the image system cannot preserve a detail exactly, disclose that rather than claiming validation. This output is EXPLORATORY; the original canonical plan remains authoritative.\n`;
write("prompts/14-whole-apartment-top-down.txt", top);
const followups = `CONSISTENCY FOLLOW-UP\nUse the attached accepted reception image as the palette/lighting/material reference. Match its ivory, oak, textiles and exposure while retaining the current room's canonical plan and screenshot viewpoint. Change finish/detail only. Generate one revised image.\n\nSECOND ANGLE\nUse the attached SECOND local screenshot as the primary camera. Render the SAME design and materials as the accepted first image, with identical furniture locations, quantities and dimensions. Natural vertical 42° / eye 1.70 m, same crop/framing as this second reference. Do not reinterpret the layout.\n\nCORRECTION FOR GEOMETRY DRIFT\nCompare your generated image to the attached canonical plan and original room screenshot. Correct altered walls/openings/glazing, ceiling height, furniture count/scale/placement and camera distortion. In reception retain six chairs, 3 + 3, no head chairs; preserve the closed kitchen and clear routes. Keep the accepted material treatment, but restore the source geometry. Provide one corrected image and a short note identifying unresolved differences.\n\nCONTROLLED STYLE OPTION\nKeep the exact accepted layout, footprint and primary camera. Change ONLY finishes: OPTION A pale oak / ivory / restrained olive; OPTION B selective light walnut / ivory / warm mushroom. No furniture additions, extra accessories, cabinetry, new lamps/structural changes or room resizing. Request and generate one option at a time.\n`;
write("15-FOLLOW-UP-PROMPTS.txt", followups);
const readme = `# Apartment Type B — ChatGPT image prompt pack\n\nPrepared from local **Family A.7 / scene-9e210720**, canonical SHA256 ${brief.canonical_sha256}. This is the current LOCAL candidate, not a new production save. Geometry is verified against the repository; generated images remain EXPLORATORY. No architecture/design state was changed to prepare this pack.\n\n## Start here\n\n1. Unzip the pack. Open prompts/01-reception.txt. Attach references/00-canonical-plan-labelled.png plus the primary room screenshot named at the top of that prompt. Attach the plan first (Image 1), the primary screenshot second (Image 2), and explicitly identify any optional style references. Copy the entire prompt into ChatGPT and request the image. You can attach optional additional views to explain the same space.\n2. Review that image against the plan: wall/opening/glazing locations, furniture count/scale, dining 3 + 3 and circulation. Keep an image as the STYLE reference only after review; image generation does not geometrically validate it.\n3. Work through the remaining room prompts ONE AT A TIME. Each file is self-contained; attach its own primary screenshot and the labelled plan. Attach the accepted reception image to keep materials/lighting coherent across rooms. Bedrooms and utility rooms retain their own layout, not the reception camera.\n4. Finally use prompts/14-whole-apartment-top-down.txt with BOTH full-plan PNGs and selected accepted room images. Top-down means a true orthographic furnished cutaway, not a tilted dollhouse.\n5. 15-FOLLOW-UP-PROMPTS.txt includes another-angle, consistency, drift-correction and controlled-finish instructions. Request styles one at a time without changing the measured layout.\n\nAll 13 areas are covered: reception, kitchen, master bedroom, Bedroom 1, Bedroom 2, dressing, ensuite, family bathroom, guest WC, private hall and THREE terraces. Dining/entry remain zones of the reception; they are not additional rooms. For two extra reception images, use the same reception prompt with living/dining screenshots as primary, retaining the accepted first design.\n\n## Reference limits\n\nRoom PNGs are local measured Three.js previews, not finished interiors. They establish placement, camera and scale; the generator improves surface realism. Some compact-room fixtures or adjacent rooms are off-camera: the plan supplies their positions. Do not force every object into one frame or enlarge tiny rooms. The guest WC has real door occlusion, which must not be edited into a different layout. Terrace scenery is not known. The very small service terrace reference is intentionally a close view of paving and parapets; the plan establishes the complete outline. Do not enlarge it to fit a staged scene.\n\nThe labelled/clean plans are freshly generated directly from canonical polygons (all 13 rooms, 64 wall segments, all openings) and the local furniture footprints, including closed-storage interior objects. The clean version suppresses labels only. The bounding box includes all terraces; nothing is cropped out. Floor-colour fills distinguish rooms rather than specify material SKUs.\n\nFurniture/product references describe intended character/dimensions; generic meshes are not manufacturer CAD. Muuto Connect Soft 3-seat 2880 × 990 is the CURRENT local sofa; the earlier 2070 mm production reference is not the baseline for this pack. Single frames1280×2100 are inferred reserves, not selected SKUs. Bathroom/gas/laundry engineering, procurement and concealed HVAC remain TBD. Finish realism cannot resolve those questions.\n\nAI images can alter spatial details even with strict prompts. Keep the canonical plan and measured 3D model as the basis for fit and construction; treat these images as visual finish studies.\n\nPrompt structure follows official OpenAI image guidance: distinguish changes from preserved geometry, use explicit material/camera references, and inspect each result for drift. https://developers.openai.com/api/docs/guides/image-prompting\n`;
write("00-START-HERE.md", readme);
let booklet = readme + "\n\n---\n\n# Common direction\n\n" + common + "\n\n";
for (const r of roomFiles)
  booklet +=
    "---\n\n# " +
    r.title +
    "\n\n" +
    fs.readFileSync(path.join(prompts, r.prompt), "utf8") +
    "\n";
booklet +=
  "---\n\n# Whole-apartment top-down\n\n" +
  top +
  "\n\n# Follow-ups\n\n" +
  followups;
write("ALL-PROMPTS.md", booklet);
write(
  "manifest.json",
  JSON.stringify(
    {
      schema: "ApartmentImagePromptPack/1",
      canonical_sha256: brief.canonical_sha256,
      scene_revision: brief.scene_revision,
      room_count: rooms.length,
      prompt_count: rooms.length + 1,
      rooms: roomFiles,
      reference_plan: {
        rooms: model.rooms.length,
        wall_segments: model.wall_segments.length,
        openings: model.openings.length,
        floor_furniture: items.length,
      },
      generated_images_status: "EXPLORATORY",
      architecture_changed: false,
      production_writes: false,
    },
    null,
    2,
  ) + "\n",
);
const figure = (file, title) =>
  `<figure><a href="references/${file}" download><img loading="lazy" src="references/${file}" alt="${esc(title)}"></a><figcaption>${esc(title)} · click to download reference</figcaption></figure>`;
write(
  "index.html",
  `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Apartment Type B — ChatGPT image prompts</title><style>body{margin:0;background:#f6f3eb;color:#2f382c;font:16px/1.6 system-ui}main{max-width:1180px;padding:35px 24px;margin:auto}h1,h2{font-family:Georgia,serif;font-weight:500;line-height:1.2}h1{font-size:42px}h2{font-size:28px}a{color:#4a613e}.links{display:flex;gap:14px;flex-wrap:wrap;margin:24px 0}.links a{padding:10px 18px;border:1px solid #bcc3b0;border-radius:6px;text-decoration:none}.links a:first-child{background:#4f6044;color:white}section{border-top:1px solid #cfd2c5;padding:24px 0}figure{margin:15px 0}img{width:100%;height:auto;display:block;background:white}figcaption{font-size:13px;margin:10px 0}.grid{display:grid;grid-template-columns:1fr 1fr;gap:22px}pre{white-space:pre-wrap;background:#fffef9;padding:20px;font:14px/1.65 system-ui;border:1px solid #deded1}details summary{cursor:pointer;font-weight:600}p{max-width:880px}@media(max-width:720px){.grid{grid-template-columns:1fr}h1{font-size:32px}}</style><main><p>Apartment Type B · Family A.7 · geometry locked</p><h1>Your room-by-room image pack</h1><p>13 rooms/terraces and one whole-apartment top-down prompt. Copy a prompt, attach the listed room screenshot and labelled plan, and generate one image at a time. Reuse an accepted reception image for consistent finishes.</p><div class="links"><a href="../chatgpt-image-pack.zip" download>Download the complete ZIP</a><a href="ALL-PROMPTS.md" download>Download all prompts</a><a href="00-START-HERE.md">Instructions</a><a href="../workspace/">Local Studio</a></div><p>Images are exploratory finish studies. The measured model and canonical plan establish geometry. Product SKUs, services and engineering are not verified by image generation.</p><section><h2>Attach this plan with each room</h2>${figure("00-canonical-plan-labelled.png", "Complete canonical plan — all 13 areas and furniture footprints")}<a href="references/00-canonical-plan-clean.png" download>Download clean plan for the top-down image</a></section>${rooms.map((r) => `<section><h2>${r.n} · ${esc(r.title)}</h2><p>Primary screenshot: ${esc(r.files[0])}. Attach the labelled plan too.</p><p><a href="prompts/${r.n}-${r.slug}.txt" download>Download this prompt</a></p><details><summary>Show copyable prompt</summary><pre>${esc(fs.readFileSync(path.join(prompts, r.n + "-" + r.slug + ".txt"), "utf8"))}</pre></details><div class="grid">${r.files.map((f) => figure(f, r.title)).join("")}</div></section>`).join("")}<section><h2>14 · Whole apartment — top-down</h2><p>Attach both plans and selected accepted room images. Match the same orientation; keep every room and terrace.</p><p><a href="prompts/14-whole-apartment-top-down.txt" download>Download top-down prompt</a></p><details><summary>Show copyable prompt</summary><pre>${esc(top)}</pre></details></section></main></html>`,
);
console.log(
  "Prepared 14 self-contained prompts, 13 areas, 18 room references, and 2 full-plan PNGs.",
);
