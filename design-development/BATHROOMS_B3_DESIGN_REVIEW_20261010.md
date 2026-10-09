# Bathrooms B3 · the "wow" comes from calm, usable details

**10 October 2026 | Type B apartment | REVISABLE CONCEPT, NOT FINAL APPROVAL**

## Intent

A home-spa feel, not a glossy hotel showroom: warm quiet porcelain walls, a single low-contrast shower feature in each full bathroom, matching muted sand floors, refined brushed nickel/chrome hardware, framed or shallow mirrors, enclosed storage, and lighting layers. The same material family runs from guest WC through family bath and master, with a deeper controlled guest accent and walnut vanity. No busy patterns, random brass/black mixed fixtures, heavy false-ceiling drops or maintenance-heavy grooves.

**Candidate A:** exact current saved-cloud-v55-derived GitHub working layout `render-snapshots/current.json`, material palette unchanged.

**Candidate B:** only reversible finish references change, not fixture geometry. Newly illustrated pale ivory 1200×600 concept walls, clay-stone shower-end wet accents, dune matte floor, pale oak-look vanity fronts and coordinated warm taupe guest wall. Brushed nickel remains. All colours are approximate procedural render proxies and **not real approved SKUs or slip certifications**.

## Bathroom-specific choice

**Master BATH-M01:** Keep open `1450×800` wet shower concept with one fixed `600×2050` glass panel, two modest cleanable metal shelves, existing 600mm vanity and WC. Do NOT deepen to 900mm just because it looks better: the previous model indicated real door/entry pinch, and floor build-up/slope/trap still unverified. First comfort issue: 800mm depth and actual safe splash/dry-zone separation.

**Family BATH-C01:** Keep current `900×900` shower, 600mm closed vanity, WC and 520×170×420 high dry towel cupboard rather than reintroducing the floor-standing cabinet. The heavy-looking generic dark glass frame/high tray visible in today's renderer is **NOT** the proposed finished hardware. In real design prefer simple clear easily cleaned safety glass with minimal tracks and low threshold **only if an engineer-approved drain and waterproofing can be built**. Historic K4 1500×750 bath is an alternate program, **not** secretly implemented over the chosen family shower.

**Guest WC:** Keep original compact `350×180` handrinse with existing walnut concept, a modest single taupe/stone highlight wall with mirror, simple quality tap and discreet toilet roll/cleaning solution **not yet physically added**. Guest WOW comes from precise lighting and materials, not more decorative objects crowding the floor.

## Beyond the pictures — make it a comfortable house

1. **Site survey**: actual wall-to-wall, doors/hinge arcs, WC clearances, mixer/waste stacks, MEP and ventilation outlets, usable ceiling after lighting; source is image-calibrated and cannot be mistaken for a measurement.
2. **Master walk-in**: structural slab/screed capacity, approved falls, trap/linear drainage, membraned pan + upstands, wet-safe grip, screen splash, maintenance reach, WC and door flow; plan 1:1 test.
3. **Family**: nominal 657mm door may be narrower in reality; test physical entry/exit with a person, open shower enclosure and WC/basin use. Historical path-proxy ~20mm is *not* an actual walking aperture. Cabinet substrate and usable reach likewise need verification.
4. **Guest**: a 350×180mm basin could splash: choose a real small tap/handwash set and test reach and hand use. Confirm accessible flush/valves and no WC door swing collision.
5. **Whole home finishes**: obtain full-size porcelain sample for wall/floor *in actual apartment light*, grout size/cleaning, wet slip data and tile cutting layout, corrosion-resistant removable fixtures, an electrician-approved warm 3000K task + ambient lighting circuit. Do not rely on procedural material colours.
6. **Before first-fix**: qualified local engineer/site architect signs drain, waterproofing, ventilation and electrical zoning; supplier issues compatible installed glass/vanity details. No slab drilling on renderer evidence.

## Rendering verification

New `studio/analysis/bathroom-finish-jury.mjs` creates 2 review snapshots and *three literally shared human-eye cameras*, one each for master, family and guest. CI builds six genuine Three.js/WebGL frames, a hex-swatch board and a machine-readable hold matrix. User selection happens only **after** actual side-by-side images are reviewed, not when a green GitHub build reports success.

No edits to cloud saved v55 `scene-4821689`, canonical Type B v0.2.2 geometry, the production `render-snapshots/current.json`, rooms, plumbing appliances or net finished 2500mm ceiling.

## 10 October actual-image jury — FIRST IMAGE SET REJECTED, CAMERA REVISION REQUIRED

The first same-camera six-frame workflow passed all metadata and canonical geometry checks, but the resulting visuals **are not good enough to approve any finish**. From the original `bath55-master-walkin-correct-door` eye view, the master wet zone is largely hidden behind a foreground wall/door perspective (can't meaningfully evaluate true walk-in). From `guest-wc-entry-open`, the brown hinged guest door obscures much of the sink/mirror. The family view is readable but exposes a dark bulky framed cubicle, raised white tray and visible WC, which is **not** the design endpoint; the palette switch alone cannot solve that physical/renderer hardware limitation. The B3 subtle material shift is barely distinguishable, especially where camera occlusion dominates.

**Design action:** replace only the REVIEW CAMERAS (no geometry) by the existing saved `bath55-master-walkin-deep-eye` and `guest-wc` interior presets, while retaining `bath55-family-entry`. Regenerate a strict 3-room A/B comparison with these better source cameras. If master/guest visibility remains poor, don't approve B3 or pretend that changing a swatch fixes the architecture. A dedicated approved low-threshold/splash enclosure specification and actual material samples still gate family bathroom. Future render passes should show an independent vanity/mirror view before requesting owner aesthetic signoff.

**Decision remains HOLD.** This is a controlled camera-quality correction, not a preference switch or cloud state change.
