/** Source-locked public-zone development. All use envelopes are explicit assumptions, in mm. */
import assert from "node:assert/strict";
import {
  rectangle,
  relation,
  polygonGap,
  sweepLeaf,
  sweepRelation,
  hingeLeaf,
  distancePointSegment,
  pointInPolygon,
} from "./geometry.mjs";
import { findPlanRoute } from "./route.mjs";
import { buildSemiOpenPortalStudy } from "./semi-open-portal.mjs";

export const SOURCE_SCENE = "scene-9cf45a73";
const clone = (x) => structuredClone(x),
  round = (x) => +x.toFixed(1);
const get = (s, id) => {
  const f = s.layout.furniture.find((x) => x.id === id);
  assert.ok(f, "Missing " + id);
  return f;
};
export const CHAIR_IDS = [
  "starter-36",
  "starter-37",
  "starter-38",
  "starter-39",
  "A2-dining-chair-north-centre",
  "A2-dining-chair-south-centre",
];
const rect = (cx, cy, w, d, rot = 0) => rectangle({ cx, cy, w, d, rot });
export function lockSource(source, domain) {
  assert.equal(source.scene_revision, SOURCE_SCENE);
  assert.equal(domain.revision(source.layout), SOURCE_SCENE);
  assert.equal(source.canonical_sha256, domain.model.canonical_sha256);
  assert.equal(source.source_scene_revision, "scene-4821689");
  assert.equal(source.storage_revision, 55);
  assert.deepEqual(source.layout.demolished, []);
  assert.equal(source.architecture_variant, undefined);
  assert.deepEqual(
    [get(source, "starter-35").w, get(source, "starter-35").d],
    [2000, 950],
  );
  assert.equal(
    source.layout.furniture.filter(
      (x) => x.room_id === "RECP-01" && x.type === "chair",
    ).length,
    6,
  );
}
export function chairState(scene, pullback_mm) {
  assert.ok([0, 200, 350, 450].includes(pullback_mm));
  return CHAIR_IDS.map((id) => {
    const f = clone(get(scene, id));
    f.cy += f.cy < get(scene, "starter-35").cy ? -pullback_mm : pullback_mm;
    return f;
  });
}
function doorStates(model, id) {
  const d = model.doors.find((x) => x.id === id);
  assert.ok(d);
  const angle = (v) => (Math.atan2(v[1], v[0]) * 180) / Math.PI;
  let closed = angle(d.c),
    open = angle(d.o);
  if (open - closed > 180) open -= 360;
  if (closed - open > 180) open += 360;
  const input = {
    hinge: d.h,
    length_mm: d.len,
    thickness_mm: 40,
    closed_angle_deg: closed,
    open_angle_deg: open,
    step_deg: 2,
  };
  return {
    id,
    hinge: d.h,
    length_mm: round(d.len),
    closed_angle_deg: closed,
    open_angle_deg: open,
    sweep: sweepLeaf(input),
    open: hingeLeaf({ ...input, angle_deg: open }),
  };
}
const frontZone = (f, projection, w = f.w) => {
  const a = (f.rot * Math.PI) / 180;
  return rectangle({
    cx: f.cx - Math.sin(a) * (f.d / 2 + projection / 2),
    cy: f.cy + Math.cos(a) * (f.d / 2 + projection / 2),
    w,
    d: projection,
    rot: f.rot,
  });
};
export function auditReception(scene, domain) {
  assert.equal(scene.canonical_sha256, domain.model.canonical_sha256);
  const model = domain.model,
    room = model.rooms.find((x) => x.id === "RECP-01"),
    kit = model.rooms.find((x) => x.id === "KIT-01");
  const shoes = get(scene, "starter-40"),
    table = get(scene, "starter-35");
  const buffet = scene.layout.interior.objects.find(
    (x) => x.id === "A-dining-sideboard",
  );
  const buffetResolved = domain.resolveObject(buffet);
  const entry = doorStates(model, "OP-ENT-01"),
    kdoor = doorStates(model, "OP-RECP-KIT"),
    svc = doorStates(model, "OP-KIT-TERSVC");
  const shoeProjection = shoes.w === 700 ? 200 : 280;
  const shoeOpen = frontZone(shoes, shoeProjection),
    shoeUser = frontZone(
      { ...shoes, d: shoes.d + 2 * shoeProjection },
      600,
      600,
    );
  const buffetOpen = frontZone(buffetResolved, 500),
    buffetUser = frontZone(
      { ...buffetResolved, d: buffetResolved.d + 1000 },
      600,
      600,
    );
  const chairStates = [0, 200, 350, 450].map((pull) => {
    const chairs = chairState(scene, pull),
      south = chairs.filter((x) => x.cy > table.cy),
      north = chairs.filter((x) => x.cy < table.cy);
    const nearest = (poly, items) =>
      items
        .map((f) => ({ id: f.id, ...relation(poly, rectangle(f)) }))
        .sort((a, b) => a.gap_mm - b.gap_mm)[0];
    const southEast = south.find((x) => x.id === "starter-39");
    return {
      pullback_mm: pull,
      chairs,
      shoe_to_nearest_chair: nearest(rectangle(shoes), chairs),
      shoe_open_to_nearest_chair: nearest(shoeOpen, chairs),
      shoe_user_to_nearest_chair: nearest(shoeUser, chairs),
      buffet_open_to_nearest_chair: nearest(buffetOpen, chairs),
      buffet_user_to_nearest_chair: nearest(buffetUser, chairs),
      east_chair_to_nominal_inner_wall_mm: round(
        16035.418 - 90 - Math.max(...rectangle(southEast).map((p) => p[0])),
      ),
      west_table_to_nominal_inner_kitchen_wall_mm: round(
        table.cx - table.w / 2 - (12603.796 + 90),
      ),
      adjacent_seat_centre_spacing_mm: 700,
      note:
        pull === 0
          ? "Saved chair placement; not an occupied state"
          : pull === 200
            ? "Six seated-adult chair/body union proxy (530mm depth); limbs under table not certified"
            : "All six pulled out simultaneously; conservative movement state, not measured people.",
    };
  });
  const objectObstacles = scene.layout.interior.objects
    .filter(
      (o) =>
        o.room_id === "RECP-01" &&
        o.placement.mode === "floor" &&
        !["table-lamp"].includes(o.type),
    )
    .map((o) => rectangle(domain.resolveObject(o)));
  const solid = scene.layout.furniture
    .filter(
      (f) =>
        f.room_id === "RECP-01" && !["rug", "tv", "chair"].includes(f.type),
    )
    .map(rectangle);
  // Add 90mm wall-face strips. Room polygons are centreline-calibrated, not finished inner faces.
  const wallFaces = model.wall_segments
    .filter((w) => w.rooms.includes("RECP-01"))
    .map((w) =>
      rectangle({
        cx: (w.from[0] + w.to[0]) / 2,
        cy: (w.from[1] + w.to[1]) / 2,
        w: Math.hypot(w.to[0] - w.from[0], w.to[1] - w.from[1]),
        d: w.thickness_mm,
        rot:
          (Math.atan2(w.to[1] - w.from[1], w.to[0] - w.from[0]) * 180) /
          Math.PI,
      }),
    );
  const goals = {
    terrace: [13950, 3150],
    serving: [13250, 7800],
    entry: [14300, 9630],
  };
  const routes = [];
  for (const pull of [200, 350, 450])
    for (const [state, extra] of [
      ["normal", []],
      ["shoes-open-and-user", [shoeOpen, shoeUser]],
      ["buffet-open-and-user", [buffetOpen, buffetUser]],
    ])
      for (const radius of [250, 350]) {
        for (const [name, goal] of Object.entries(goals).filter(
          ([name]) => name !== "entry",
        )) {
          const obstacles = [
            ...solid,
            ...objectObstacles,
            ...wallFaces,
            ...chairState(scene, pull).map(rectangle),
            entry.open,
            ...extra,
          ];
          const result = findPlanRoute({
            room: room.poly,
            start: goals.entry,
            goal,
            obstacles,
            agent_radius_mm: radius,
            grid_mm: 75,
            max_cells: 30000,
          });
          routes.push({
            id: `entry-${name}-chairs${pull}-${state}-diameter${radius * 2}`,
            state,
            pullback_mm: pull,
            envelope_diameter_mm: radius * 2,
            ...result,
          });
        }
      }
  const dw = get(scene, "K3-dishwasher"),
    fridge = get(scene, "starter-23"),
    washer = get(scene, "K3-laundry-niche"),
    counter = get(scene, "starter-20");
  const dwOpen = frontZone(dw, 600),
    dwUser = frontZone({ ...dw, d: dw.d + 1200 }, 600, 600);
  // Fridge rotation 180 faces north; oven under west hob faces east. Washer modeled front faces south.
  const fridgeOpen = frontZone(fridge, 650),
    fridgeUser = frontZone({ ...fridge, d: fridge.d + 1300 }, 600, 600);
  const oven = { ...counter, w: 600 },
    ovenOpen = frontZone(oven, 500),
    ovenUser = frontZone({ ...oven, d: oven.d + 1000 }, 600, 600);
  const washerOpen = frontZone(washer, 500),
    washerUser = frontZone({ ...washer, d: washer.d + 1000 }, 600, 600);
  const metrics = {
    dishwasher_open_to_south_nominal_inner_wall_mm: round(
      8960.346 - 90 - Math.max(...dwOpen.map((p) => p[1])),
    ),
    dishwasher_open_plus_user_to_south_nominal_inner_wall_mm: round(
      8960.346 - 90 - Math.max(...dwUser.map((p) => p[1])),
    ),
    dishwasher_user_vs_service_door_sweep: sweepRelation(svc.sweep, dwUser),
    oven_open_vs_service_door_sweep: sweepRelation(svc.sweep, ovenOpen),
    oven_user_vs_service_door_sweep: sweepRelation(svc.sweep, ovenUser),
    washer_user_vs_service_door_sweep: sweepRelation(svc.sweep, washerUser),
    fridge_open_vs_kitchen_door_sweep: sweepRelation(kdoor.sweep, fridgeOpen),
    fridge_user_vs_kitchen_door_sweep: sweepRelation(kdoor.sweep, fridgeUser),
    dishwasher_user_vs_fridge_user: relation(dwUser, fridgeUser),
    oven_user_vs_washer_user: relation(ovenUser, washerUser),
  };
  const cabinetStates = scene.layout.furniture
    .filter((f) => f.room_id === "KIT-01" && f.type === "counter")
    .map((f) => ({
      id: f.id,
      open_panel: frontZone(f, 500),
      user: frontZone({ ...f, d: f.d + 1000 }, 600, 600),
      note: "500mm full front proxy; hinge subdivision, corner mechanism and SKU unknown.",
    }));
  const kitchenPanels = scene.layout.interior.objects
    .filter((o) => o.room_id === "KIT-01" && o.type === "sideboard")
    .map((o) => {
      const f = domain.resolveObject(o);
      return {
        id: o.id,
        ...f,
        open_panel: frontZone(f, 450),
        note: "High-mounted opening footprint; head/hand task overlap, not a floor obstacle.",
      };
    });
  // Unified public-zone control polygon is the nominal room union, NOT a demolition.
  // The canonical wall strips keep P0 partitions in every route; only wall44 + kitchen leaf are omitted in P1.
  const publicUnion = [
    ...room.poly.slice(0, 6),
    [12603.796, 8960.346],
    [8981.529, 8960.346],
  ];
  const kitchenSolids = scene.layout.furniture
    .filter(
      (f) => f.room_id === "KIT-01" && !["stove", "ksink"].includes(f.type),
    )
    .map(rectangle);
  const kitchenRoutes = [];
  for (const topology of ["P0", "P1-CONDITIONAL"])
    for (const radius of [250, 350])
      for (const [state, extra] of [
        ["normal", []],
        ["DW-open-unloading", [dwOpen, dwUser]],
        ["fridge-open-user", [fridgeOpen, fridgeUser]],
        ["oven-open-user", [ovenOpen, ovenUser]],
        ["washer-open-user", [washerOpen, washerUser]],
      ]) {
        const wallStrips = model.wall_segments
          .filter(
            (w) =>
              w.rooms.some((r) => ["RECP-01", "KIT-01"].includes(r)) &&
              (topology === "P0" || model.wall_segments.indexOf(w) !== 44),
          )
          .map((w) =>
            rectangle({
              cx: (w.from[0] + w.to[0]) / 2,
              cy: (w.from[1] + w.to[1]) / 2,
              w: Math.hypot(w.to[0] - w.from[0], w.to[1] - w.from[1]),
              d: w.thickness_mm,
              rot:
                (Math.atan2(w.to[1] - w.from[1], w.to[0] - w.from[0]) * 180) /
                Math.PI,
            }),
          );
        const result = findPlanRoute({
          room: publicUnion,
          start: goals.entry,
          goal: [11250, 7750],
          obstacles: [
            ...solid,
            ...objectObstacles,
            ...kitchenSolids,
            ...wallStrips,
            ...chairState(scene, 350).map(rectangle),
            entry.open,
            svc.open,
            ...(topology === "P0" ? [kdoor.open] : []),
            ...extra,
          ],
          agent_radius_mm: radius,
          grid_mm: 75,
          max_cells: 30000,
        });
        kitchenRoutes.push({
          id: `entry-kitchen-${topology}-${state}-diameter${radius * 2}`,
          topology,
          state,
          pullback_mm: 350,
          envelope_diameter_mm: radius * 2,
          ...result,
        });
      }
  const cabinetRelations = cabinetStates.map((c) => ({
    id: c.id,
    open_vs_other_appliances: scene.layout.furniture
      .filter(
        (f) =>
          f.room_id === "KIT-01" &&
          ["fridge", "dishwasher", "washer"].includes(f.type),
      )
      .map((f) => ({ id: f.id, ...relation(c.open_panel, rectangle(f)) })),
    user_vs_door_sweeps: [kdoor, svc].map((d) => ({
      id: d.id,
      ...sweepRelation(d.sweep, c.user),
    })),
  }));
  const appliances = {
    doors: [entry, kdoor, svc],
    dwOpen,
    dwUser,
    fridgeOpen,
    fridgeUser,
    ovenOpen,
    ovenUser,
    washerOpen,
    washerUser,
    metrics,
    cabinetStates,
    kitchenPanels,
    cabinetRelations,
    kitchenRoutes,
  };
  const usableStorage = [
    [
      "entry",
      shoes.w - 36,
      shoes.d - 40,
      700,
      shoes.w === 700
        ? "Three narrow tilt tiers, two adult pairs/tier is a design target only; 200mm opening projection and tall-shoe fit require a real supplier mockup."
        : "Assumed two tilt tiers; 4–6 adult pairs at 300mm pair pitch, product/mechanism can reduce this.",
    ],
    [
      "buffet",
      buffet.width_mm - 72,
      buffet.depth_mm - 50,
      buffet.height_mm - 170,
      "Clear rectangular assumption excluding carcass, feet, back; hinges/partitions further reduce.",
    ],
    [
      "kitchen-upper-north",
      1800 - 72,
      330 - 40,
      700 - 36,
      "One full-width envelope; 1800 run needs partitions, hinges and blind-corner verification.",
    ],
    [
      "kitchen-upper-west-300",
      300 - 36,
      330 - 40,
      700 - 36,
      "Heat/extractor clearance unknown.",
    ],
    [
      "kitchen-upper-west-450",
      450 - 36,
      330 - 40,
      700 - 36,
      "Heat/extractor clearance unknown.",
    ],
    [
      "kitchen-sink-waste",
      600 - 36,
      610 - 60,
      720 - 36,
      "Before subtracting sink/trap/pipe/waste hardware; not food storage.",
    ],
    [
      "kitchen-cooking-run",
      1500 - 72,
      600 - 60,
      720 - 36,
      "Before subtracting reserved oven, hob, ducts and drawers.",
    ],
    [
      "kitchen-corner",
      600 - 36,
      590 - 60,
      720 - 36,
      "Gross clear box; inaccessible corner and hardware unresolved.",
    ],
    [
      "kitchen-shallow-landing",
      600 - 36,
      410 - 50,
      720 - 36,
      "Hardware/ventilation unverified.",
    ],
  ].map(([id, w, d, h, note]) => ({
    id,
    assumed_clear_box_mm: [w, d, h],
    upper_bound_litres: round((w * d * h) / 1e6),
    note,
  }));
  const sofa = get(scene, "starter-28"),
    coffee = get(scene, "starter-29"),
    tv = get(scene, "starter-31"),
    chair = get(scene, "starter-32");
  const sofaSeats = [-900, 0, 900].map((dy) => {
    const eye = [sofa.cx + 250, sofa.cy + dy];
    const tvPoint = [tv.cx, tv.cy];
    return {
      plan_eye_mm: eye,
      eye_height_mm: 1100,
      distance_to_tv_mm: round(
        Math.hypot(tvPoint[0] - eye[0], tvPoint[1] - eye[1]),
      ),
      off_normal_angle_deg: round(
        Math.abs(
          (Math.atan2(tvPoint[1] - eye[1], tvPoint[0] - eye[0]) * 180) /
            Math.PI,
        ),
      ),
      glazing_on_side: true,
      note: "Seated line in plan; screen height, exact eyes, reflectance and solar orientation unknown.",
    };
  });
  return {
    schema: "TypeBReceptionUseAudit/1",
    scene_revision: scene.scene_revision,
    source_scene: SOURCE_SCENE,
    canonical_sha256: scene.canonical_sha256,
    cloud_scene: "scene-4821689",
    cloud_storage_revision: 55,
    units: "mm",
    measurement_status: "EXACT MODEL / ASSUMED USE ENVELOPES / SITE HOLD",
    assumptions: {
      wall_half_mm: 90,
      seated_pullback_mm: 200,
      movement_pullback_mm: [350, 450],
      body_box_mm: [600, 600],
      circulating_diameters_mm: [500, 700],
      door_sweep_step_deg: 2,
      shoe_tilt_projection_mm: shoeProjection,
      buffet_leaf_projection_mm: 500,
      dishwasher_projection_mm: 600,
      fridge_front_projection_mm: 650,
      oven_projection_mm: 500,
      washer_projection_mm: 500,
      note: "Projections are conservative examples, not selected product kinematics. Fridge 650mm front envelope is not a verified hinge arc. Circular 700mm actor is a tray sensitivity, not a wheelchair or two people.",
    },
    chairStates,
    routes,
    entry: {
      door: entry,
      shoeOpen,
      shoeUser,
      shoe_sweep: sweepRelation(entry.sweep, rectangle(shoes)),
      shoe_open_sweep: sweepRelation(entry.sweep, shoeOpen),
      shoe_user_sweep: sweepRelation(entry.sweep, shoeUser),
      nominal_opening_mm: round(entry.length_mm),
      occupied_arrival:
        "One 500/700mm circulation proxy; simultaneous bag carrier and second adult needs physical mockup.",
    },
    buffet: { resolved: buffetResolved, open: buffetOpen, user: buffetUser },
    appliances,
    storage: usableStorage,
    living: {
      sofa_coffee_gap_mm: round(polygonGap(rectangle(sofa), rectangle(coffee))),
      coffee_tv_console_gap_mm: round(
        polygonGap(rectangle(coffee), rectangle(get(scene, "starter-30"))),
      ),
      armchair_coffee_gap_mm: round(
        polygonGap(rectangle(chair), rectangle(coffee)),
      ),
      sofaSeats,
      terrace_nominal_glazing_mm: 1885.3,
      terrace_operable_width:
        "UNKNOWN; sliding half panels, frame/handle and installed opening unverified.",
      solar_glare:
        "HOLD: no north azimuth or calibrated weather/photometry; hour slider cannot certify glare.",
    },
    room_polygons: { reception: room.poly, kitchen: kit.poly },
    domain_failures: domain
      .validate(scene.layout)
      .checks.filter((x) => x.status === "FAIL"),
    holds: [
      "Actual survey, leaf hinges/handles and finished apertures",
      "Six adults, a tray server, stroller and emergency access mockup",
      "Selected appliance and cabinet manuals, corner access and safe gas/extraction",
      "Written wall-44 engineer/developer determination for P1",
      "Storage internals and household inventory",
      "Daylight orientation, TV reflections and real lighting samples",
    ],
  };
}

export function buildReceptionSprint(source, domain) {
  lockSource(source, domain);
  const materials = [
    ["S1-ivory", "Washable ivory", "paint", "#EEE9DF", 0.91],
    ["S1-stone", "Quiet limestone-look porcelain", "stone", "#DCD3C5", 0.8],
    ["S1-oak", "Refined natural oak", "wood", "#BBA184", 0.77],
    [
      "S1-linen",
      "Mushroom performance upholstery proxy",
      "fabric",
      "#C6BDAF",
      0.92,
    ],
    ["S1-walnut", "Muted walnut", "wood", "#79624D", 0.76],
    ["S1-taupe", "Soft mineral taupe", "stone", "#BBAA96", 0.8],
    ["S1-greige", "Warm greige matte", "paint", "#DAD1C5", 0.88],
  ].map(([id, name, category, base_colour, roughness]) => ({
    schema: "InteriorMaterial/1",
    id,
    name,
    category,
    base_colour,
    roughness,
    metallic: 0,
    finish: "matte",
    source_status: "GENERIC",
    notes:
      "Sprint design sample proxy; no selected vendor, physical performance or construction release.",
    ...(category === "stone"
      ? {
          texture_scale_mm: { width: 1200, height: 600 },
          fallback_generic_id: "travertine",
        }
      : {}),
  }));
  const common = clone(source);
  const shoes = get(common, "starter-40");
  Object.assign(shoes, {
    cx: 15560,
    cy: 10000,
    w: 700,
    d: 240,
    rot: 180,
    name: "Conditional 700×240 entry tilt shoe unit · three tiers/product TBD",
  });
  const mirror = common.layout.interior.objects.find(
    (o) => o.id === "A1-entry-mirror",
  );
  Object.assign(mirror.placement, {
    host_wall_id: "WALL-RECP-01-16",
    offset_mm: -30.16,
    inset_mm: 10,
    elevation_mm: 1150,
  });
  const buffet = common.layout.interior.objects.find(
    (o) => o.id === "A-dining-sideboard",
  );
  buffet.cy = 4550;
  common.layout.interior.objects.find((o) => o.id === "V5-sideboard-lamp").cy =
    5250;
  // One larger artwork gives the long buffet an intentional composition without a new partition.
  common.layout.interior.objects.push({
    id: "S1-buffet-art",
    type: "artwork",
    variant: "framed",
    room_id: "RECP-01",
    placement: {
      mode: "wall",
      host_wall_id: "WALL-RECP-01-18",
      offset_mm: -1931.9525,
      elevation_mm: 1150,
      inset_mm: 12,
    },
    rotation: 0,
    width_mm: 1200,
    depth_mm: 25,
    height_mm: 650,
    material_references: { frame: "a1-natural-oak" },
    colour: "#DED3C1",
    status: "EXPLORATORY",
    metadata: {
      role: "One quiet artwork aligned to retained closed buffet; artwork is bundled procedural studio art.",
    },
  });
  common.layout.interior.materials.push(...materials);
  const variants = {};
  for (const key of ["A", "B"]) {
    const s = clone(common),
      A = key === "A";
    s.name = A
      ? "A Calm Contemporary / P0 source architecture"
      : "B Warm Contemporary / P0 source architecture";
    s.layout.studio.rooms["RECP-01"] = {
      ...s.layout.studio.rooms["RECP-01"],
      ceiling: "plain",
      lighting: A ? "track-lamps" : "downlights",
      temperature: 3000,
      brightness: A ? 72 : 68,
      wall: A ? "#EEE9DF" : "#E1D7CA",
    };
    s.layout.studio.rooms["KIT-01"] = {
      ...s.layout.studio.rooms["KIT-01"],
      temperature: 3000,
      wall: "#EEE9DF",
    };
    for (const wall of domain
      .surfaces()
      .filter(
        (x) => ["RECP-01", "KIT-01"].includes(x.room_id) && x.type === "wall",
      ))
      s.layout.interior.surface_materials[wall.id] = "S1-ivory";
    s.layout.interior.surface_materials["FLOOR-RECP-01"] = "S1-stone";
    s.layout.interior.surface_materials["FLOOR-KIT-01"] = "S1-stone";
    s.layout.interior.surface_materials["WALL-RECP-01-09"] = A
      ? "S1-stone"
      : "S1-taupe";
    for (const id of ["starter-40", "starter-30"])
      get(s, id).material_id = A ? "S1-oak" : "S1-walnut";
    get(s, "starter-35").color = A ? "#DCD3C5" : "#BAAB95";
    get(s, "starter-29").color = A ? "#CDBBA4" : "#A99177";
    get(s, "starter-28").color = A ? "#E0D7C7" : "#D1C2AC";
    get(s, "starter-32").color = A ? "#7D856F" : "#907F6B";
    for (const id of CHAIR_IDS) {
      get(s, id).color = A ? "#C6BDAF" : "#AD9C87";
      get(s, id).material_id = "S1-linen";
    }
    const b = s.layout.interior.objects.find(
      (o) => o.id === "A-dining-sideboard",
    );
    b.material_references = {
      body: A ? "S1-oak" : "S1-walnut",
      accent: "generic-brass",
    };
    b.colour = A ? "#BBA184" : "#79624D";
    const art = s.layout.interior.objects.find((o) => o.id === "S1-buffet-art");
    art.material_references.frame = A ? "S1-oak" : "S1-walnut";
    const pendant = s.layout.interior.objects.find(
      (o) => o.id === "A-dining-pendant",
    );
    if (A)
      s.layout.interior.objects = s.layout.interior.objects.filter(
        (o) => o.id !== pendant.id,
      );
    else {
      Object.assign(pendant, {
        variant: "linear",
        width_mm: 1000,
        depth_mm: 160,
        height_mm: 120,
      });
      pendant.placement.drop_mm = 650;
      pendant.metadata.temperature_k = 3000;
    }
    // Kitchen services/appliance sizes and finishes remain unchanged except the floor/wall palette.
    s.scene_revision = domain.revision(s.layout);
    s.views = makeSprintCameras(source, domain.model);
    s.notes = [
      "Reversible study derived from scene-9cf45a73 / separate cloud scene-4821689 v55.",
      "Canonical architecture and original doors/glazing/2.50m ceiling unchanged.",
      "Conditional 700×240 shoe unit moved onto east entry south return, mirror aligned; buffet 200mm north with dimensions retained; six chairs preserved.",
      A
        ? "Pendant removed; track + source lamps; quiet oak and broad light stone surfaces."
        : "Slender linear pendant over table; walnut entry/buffet/TV accents; one taupe TV wall.",
      "Stone floor is a new finish proposal only; no demolition/levels/SKU approved. Renderer does not model calibrated lux/glare.",
    ];
    assert.deepEqual(
      s.layout.furniture.filter((x) => x.room_id === "KIT-01"),
      source.layout.furniture.filter((x) => x.room_id === "KIT-01"),
    );
    assert.deepEqual(
      domain.validate(s.layout).checks.filter((x) => x.status === "FAIL"),
      [],
    );
    variants[key] = s;
  }
  const portalOverlay = buildSemiOpenPortalStudy(source, domain).portal
    .architecture_variant;
  const aPortal = clone(variants.A);
  aPortal.name = "A Calm Contemporary / P1-F1 CONDITIONAL WALL-44 STUDY";
  aPortal.architecture_variant = clone(portalOverlay);
  aPortal.notes.push(
    "P1/F1 visual only. Wall 44 omitted, door hidden; nominal 1207.4mm aperture with 20mm unverified finish allowance each side. NOT FOR CONSTRUCTION.",
  );
  // A single matrix avoids confounding style with kitchen topology.
  const bPortal = clone(variants.B);
  bPortal.name = "B Warm Contemporary / P1-F1 CONDITIONAL WALL-44 STUDY";
  bPortal.architecture_variant = clone(portalOverlay);
  bPortal.notes.push(aPortal.notes.at(-1));
  return {
    source,
    variants: {
      "A-P0": variants.A,
      "B-P0": variants.B,
      "A-P1-CONDITIONAL": aPortal,
      "B-P1-CONDITIONAL": bPortal,
    },
    audits: {
      baseline: auditReception(source, domain),
      proposed: auditReception(variants.A, domain),
    },
    shared_changes: [
      {
        id: "starter-40",
        from: [15740, 9450, 900, 280, 90],
        to: [15560, 10000, 700, 240, 180],
        reason:
          "Remove chair and entry-sweep conflicts with a shallower three-tier design; storage trade-off and exact hardware remain HOLD.",
      },
      {
        id: "A1-entry-mirror",
        from: "WALL-RECP-01-16, offset 0",
        to: "WALL-RECP-01-16, offset -30.16, elevation 1150",
        reason: "Align mirror above relocated drop zone.",
      },
      {
        id: "A-dining-sideboard",
        from: [15720, 4750],
        to: [15720, 4550],
        reason:
          "Increase six-chair opening-state buffer, preserve 2000×400×800 storage.",
      },
    ],
  };
}

export function makeSprintCameras(source, model) {
  assert.ok(
    model?.width_mm && model?.depth_mm,
    "Exact model extents required for camera conversion",
  );
  const template = clone(
    source.views.find((x) => x.id === "reception-entry").camera,
  );
  const world = ([x, height, y]) => [
    x / 1000 - model.width_mm / 2000,
    height,
    y / 1000 - model.depth_mm / 2000,
  ];
  const camera = (
    id,
    position,
    target,
    fov = 65,
    night = false,
    room_id = "RECP-01",
  ) => ({
    id,
    room_id,
    camera: {
      ...clone(template),
      position: world(position),
      target: world(target),
      fov,
      viewer: { ...clone(template.viewer), night, hour: night ? 20 : 10 },
    },
  });
  return [
    camera("entry-overview", [14600, 1.68, 9480], [14100, 1.4, 6700], 65),
    camera("living-to-dining", [11000, 1.68, 4800], [14670, 1.25, 7650], 68),
    camera("dining-to-living", [14200, 1.68, 6250], [10700, 1.3, 2400], 68),
    camera("wide-reception", [15450, 1.68, 6200], [11100, 1.35, 3900], 72),
    camera("kitchen-relationship", [13500, 1.68, 7700], [11000, 1.4, 7700], 68),
    camera(
      "kitchen-work",
      [11250, 1.68, 8200],
      [9950, 1.15, 7350],
      70,
      false,
      "KIT-01",
    ),
    camera(
      "wide-reception-evening",
      [15450, 1.68, 6200],
      [11100, 1.35, 3900],
      72,
      true,
    ),
    camera("seated-tv", [9835, 1.1, 2460], [12243.688, 1.2, 1779.359], 60),
  ];
}
