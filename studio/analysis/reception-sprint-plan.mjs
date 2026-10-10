import { rectangle } from "./geometry.mjs";
/** Deterministic dimensioned plan from exact source polygons, never an inferred image. */
export function receptionPlanSvg(scene, audit, domain, pull = 350) {
  const minX = 8750,
    minY = 300,
    scale = 0.084,
    ox = 95,
    oy = 125;
  const p = ([x, y]) => [ox + (x - minX) * scale, oy + (y - minY) * scale];
  const points = (poly) =>
    poly
      .map((v) =>
        p(v)
          .map((x) => x.toFixed(2))
          .join(","),
      )
      .join(" ");
  const esc = (x) => String(x).replaceAll("&", "&amp;").replaceAll("<", "&lt;");
  const poly = (v, fill, stroke = "#736858", dash = "") =>
    `<polygon points="${points(v)}" fill="${fill}" stroke="${stroke}" stroke-width="1" ${dash ? 'stroke-dasharray="' + dash + '"' : ""}/>`;
  const text = (x, y, s, size = 11) =>
    `<text x="${x}" y="${y}" font-size="${size}" fill="#302a25">${esc(s)}</text>`;
  const label = (v, s) => {
    const [x, y] = p(v);
    return text(x, y, s, 9);
  };
  const dimension = (a, b, s) => {
    const A = p(a),
      B = p(b),
      mid = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
    return (
      `<path d="M${A} L${B}" stroke="#296a86" marker-start="url(#arrow)" marker-end="url(#arrow)"/>` +
      text(mid[0] + 5, mid[1] - 5, s, 10)
    );
  };
  let art = `<svg xmlns="http://www.w3.org/2000/svg" width="1220" height="1100" viewBox="0 0 1220 1100"><defs><marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto-start-reverse"><path d="M0 0 L6 3 L0 6Z" fill="#296a86"/></marker></defs><rect width="1220" height="1100" fill="#faf8f4"/><g font-family="Arial,sans-serif">`;
  art +=
    text(40, 38, `${scene.name} · six chairs +${pull} mm`, 23) +
    text(
      40,
      65,
      `Type B v0.2.2 | ceiling 2500 | model mm / use envelopes assumed | NOT FOR CONSTRUCTION`,
      13,
    );
  art += text(
    40,
    86,
    `Source scene-9cf45a73 | candidate ${scene.scene_revision} | separate cloud scene-4821689 / v55 | canonical 734b1c36570f…`,
    11,
  );
  art +=
    poly(audit.room_polygons.reception, "#eee7dc") +
    poly(audit.room_polygons.kitchen, "#e0d9cb");
  for (const s of domain.model.wall_segments.filter((s) =>
    s.rooms.some((r) => ["RECP-01", "KIT-01"].includes(r)),
  )) {
    const A = p(s.from),
      B = p(s.to);
    art += `<path d="M${A} L${B}" stroke="#4b4640" stroke-width="${s.thickness_mm * scale}"/>`;
  }
  for (const opening of domain.model.openings.filter((o) =>
    o.between.some((r) => ["RECP-01", "KIT-01"].includes(r)),
  )) {
    const A = p(opening.from),
      B = p(opening.to);
    art += `<path d="M${A} L${B}" stroke="#5f9ba8" stroke-width="3"/>`;
  }
  for (const door of audit.appliances.doors) {
    for (const leaf of door.sweep.filter((_, i) => i % 5 === 0))
      art += poly(leaf, "#bd9a5a12", "#bd9a5a", "3 3");
    art += poly(door.open, "#ba955b");
  }
  const chairs = audit.chairStates.find((x) => x.pullback_mm === pull);
  for (const f of scene.layout.furniture.filter(
    (f) => ["RECP-01", "KIT-01"].includes(f.room_id) && f.type !== "chair",
  )) {
    art += poly(
      rectangle(f),
      f.type === "rug" ? "#e9dfcb" : f.color || "#b6a18c",
    );
    if (!["rug", "tv", "stove", "ksink"].includes(f.type))
      art += label(
        [f.cx - f.w / 4, f.cy],
        f.type === "table"
          ? "2000 × 950 / SIX SEATS"
          : f.type === "shoecab"
            ? `${f.w} × ${f.d} SHOES`
            : f.id.replace("starter-", "F").replace("K3-", ""),
      );
  }
  for (const f of chairs.chairs) {
    art += poly(rectangle(f), "#aab3b8", "#3b626d");
    art += label([f.cx - 140, f.cy], f.cy < 7650 ? "N adult" : "S adult");
  }
  for (const o of scene.layout.interior.objects.filter(
    (o) => o.room_id === "RECP-01" && o.placement.mode === "floor",
  ))
    art += poly(rectangle(domain.resolveObject(o)), "#bdab91");
  art +=
    poly(audit.entry.shoeOpen, "#e49d6e70", "#bb6431", "4 2") +
    poly(audit.entry.shoeUser, "#cd79824a", "#b15263", "4 2");
  art +=
    poly(audit.buffet.open, "#e49d6e50", "#bb6431", "4 2") +
    poly(audit.buffet.user, "#cd798233", "#b15263", "4 2");
  for (const [key, value] of Object.entries(audit.appliances).filter(([k]) =>
    /Open$|User$/.test(k),
  ))
    art += poly(
      value,
      key.endsWith("User") ? "#cd798233" : "#e49d6e55",
      "#bb6431",
      "3 3",
    );
  const route = audit.routes.find(
    (x) =>
      x.pullback_mm === pull &&
      x.state === "shoes-open-and-user" &&
      x.envelope_diameter_mm === 700 &&
      x.id.includes("terrace"),
  );
  if (route?.route_mm.length)
    art += `<polyline points="${points(route.route_mm)}" fill="none" stroke="#328b80" stroke-width="3"/>`;
  art +=
    dimension([13670, 6150], [15670, 6150], "2000 table") +
    dimension([13350, 7175], [13350, 8125], "950 table");
  art += dimension(
    [12693.796, 7450],
    [13670, 7450],
    `${chairs.west_table_to_nominal_inner_kitchen_wall_mm} west serving band*`,
  );
  art += dimension(
    [15625, 8500],
    [15945.418, 8500],
    `${chairs.east_chair_to_nominal_inner_wall_mm} east band*`,
  );
  art += dimension(
    [12582.613, 7456.363],
    [12582.613, 8176.58],
    "720.2 P0 nominal",
  );
  art += dimension(
    [14340.79, 10360],
    [15145.738, 10360],
    "804.9 entry nominal",
  );
  art += dimension([8981.529, 200], [12497.882, 200], "3516.4 model width");
  art += dimension([16200, 2732.588], [16200, 10231.317], "7498.7 dining wing");
  const rows = [
    ["LEGEND", "Exact polygons and furniture; assumed bodies/doors"],
    ["Blue chairs", `All SIX chairs +${pull} mm; 510 × 530 nominal`],
    ["Orange", "Open leaf / tilt / appliance projection"],
    ["Rose", "600 × 600 operating adult proxy"],
    ["Gold", "2° sampled door sweep + fully open leaf"],
    ["Green", `700 mm tray sensitivity route: ${route?.status}`],
    [
      "Chair / shoes",
      `nearest box gap ${chairs.shoe_to_nearest_chair.gap_mm} mm`,
    ],
    ["Chair / shoe user", `gap ${chairs.shoe_user_to_nearest_chair.gap_mm} mm`],
    [
      "Buffet open / chair",
      `gap ${chairs.buffet_open_to_nearest_chair.gap_mm} mm`,
    ],
    [
      "DW open / south wall",
      `${audit.appliances.metrics.dishwasher_open_to_south_nominal_inner_wall_mm} mm*`,
    ],
    [
      "DW + user / south wall",
      `${audit.appliances.metrics.dishwasher_open_plus_user_to_south_nominal_inner_wall_mm} mm*`,
    ],
    ["Model doorway", `Kitchen 720.2 / main entry 804.9 nominal`],
    [
      "P1 only on separate study",
      "Wall 44 omission = 1207.4 nominal / ENGINEER HOLD",
    ],
    [
      "* nominal face assumption",
      "90mm wall half. Not site finished clearance.",
    ],
    ["USE LIMIT", "Do not add all kitchen actors as simultaneous comfort"],
    ["APPROVAL", "No site, procurement or structural release"],
    ["Scale bar", "1000mm (print dimensions independent of resizing)"],
  ];
  rows.forEach(([a, b], i) => {
    art += text(775, 155 + i * 42, a, 12) + text(775, 173 + i * 42, b, 10);
  });
  const y = 1010;
  art +=
    `<path d="M95 ${y} h84" stroke="#302a25" stroke-width="6"/>` +
    text(95, y + 23, "1000 mm", 12);
  art += text(
    230,
    1042,
    "Exact model plan; assumed operating states. No route is a certified installed width.",
    12,
  );
  return art + "</g></svg>\n";
}
