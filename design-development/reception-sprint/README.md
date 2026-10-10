# Reception, entry, dining and kitchen — Sprint 01 developed review

**10 October 2026 · DESIGN DEVELOPMENT ONLY · no construction, procurement or final owner approval**

Develop **A Calm Contemporary** as the lead interior, carrying B's slender dining pendant forward only if a real lighting mockup warrants it. Develop that interior with **conditional P1/F1** if wall 44 is cleared by the developer and qualified engineer; retain **A/P0** as the complete enclosed fallback. The shoe cabinet proposal is conditional on a real mechanism and household shoe inventory. This is an internal design recommendation, not a change to the owner's accepted source or approval registry.

The most demonstrable improvement is functional: remove the baseline chair/shoe interference and entry-door/shoe-user conflict, preserve the western serving lane and move the retained buffet 200mm north. The visual development replaces the scattered arrival/dining emphasis with one coordinated floor, entry storage and mirror, a restrained buffet/art composition, a quiet TV surface, and two distinct lighting hierarchies.

## Exact sources and scope

- Latest master base: `cfb7e8dee8621280c87121b6e60f7bb908b12695`, merged PR #61. Read its [sprint brief](../RECEPTION_ENTRY_DINING_SPRINT_20261010.md), [baseline](../CURRENT_BASELINE.md), [owner review](../OWNER_REVIEW_20261010.md) and [registry](../decision-registry.json).
- Sole review input: `render-snapshots/current.json`, **scene-9cf45a73**. Its bytes are hashed in [source-contract.json](./source-contract.json), verified again against each render package.
- Distinct saved cloud Studio source: **scene-4821689 / storage revision 55**. No cloud save, activation, import or deployment is performed.
- Immutable Type B v0.2.2 canonical SHA: `734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658`. Ceiling **2500mm**, original doors, glazing, openings, room polygons and service positions retained. No K4/K12 geometry imported.
- Four snapshots form a **2×2 comparison**: A/P0, B/P0, A/P1-CONDITIONAL, B/P1-CONDITIONAL. A and B share the same furniture footprints and revised functional layout. Their pendant and artwork/light composition differ. P0 and P1 within each style have byte-identical layouts; the P1 render overlay omits only wall segment 44 and the original kitchen door mesh.
- Layout scene IDs alone cannot identify P0 versus P1: they intentionally share a style's scene ID. Each capture therefore also records the exact architecture overlay, its SHA, camera signature, snapshot SHA and PNG SHA. [VALIDATION.md](./VALIDATION.md) records the inspected final run.

## Functional audit — operating states, not just closed boxes

Measurements below are exact calculations from the nominal model under explicitly stated use assumptions. They are **not measured site dimensions**. Plans show 90mm nominal wall half-thickness; actual jambs, handles and finishes can reduce usable widths. [Baseline audit](./audit-baseline.json) and [proposed audit](./audit-proposed.json) retain every source polygon, sampled door leaf, state, route and assumption.

| Test / operating state | Baseline | Developed A and B | Decision |
| --- | --- | --- | --- |
| Six chairs at +350mm pullback; nearest shoe-unit footprint | **35mm** gap | **915mm** gap | KEEP revised location; this is a box gap, not a walking lane |
| Six chairs at +450mm pullback | Eastern chair overlaps shoe unit by **1625mm²** | **815mm** shoe box gap; no box overlap | REJECT baseline furniture interference |
| Shoe unit open + 600×600mm user; six chairs +450 | Door sweep intersects baseline shoe user | No chair/user intersection; only **15mm** to pulled chair behind user | KEEP as a conditional prototype; no one can be assumed to pass behind that user |
| Entry door 40mm leaf, full 90° sweep at 2° samples | Shoe-user envelope intersects 22 of 46 samples | No shoe-unit/open/user intersection | KEEP improvement; real hinge, handle and tolerance HOLD |
| Buffet front open 500mm; northern chairs +350 | **585mm** nearest gap | **785mm**, retained 2000×400×800 buffet | KEEP 200mm north shift and unchanged buffet storage envelope |
| Western table edge to assumed kitchen inner wall face | **976.2mm** | Same | KEEP primary serving lane; no new divider |
| Eastern chair edge to assumed east inner wall face | **320.4mm** | Same | REJECT an east-side through-route claim; approach/serve from west and north |
| Six explicit seated adults + chair proxy +200mm and movement states +350/+450; entry door open, shoe or buffet user present | 36/36 sampled 500/700mm circulation routes found | 36/36 found | MODEL PASS for those states only; baseline still fails independent door/body collision |
| Sofa to coffee table | **520mm** | Same | KEEP; reach and actual cushion edge need household trial |
| Coffee table to TV console / coffee to armchair | **790mm / 912.6mm** box gaps | Same | KEEP; armchair sitter's legs and side table reach unverified |
| Three seated sofa eye proxies, 1100mm high | TV distance **2418.7–2881.0mm**; plan off-normal **5.2–33.3°** | Same | KEEP provisional; southern seat turns most, TV height/reflectance and real glare HOLD |

**Use assumptions:** original six 510×530mm chair footprints plus explicit 600×350mm seated torso/arm rectangles, offset 100mm toward the table (100mm between adjacent 700mm-spaced adult proxies); +200mm seated state and +350/+450mm all-six pullback sensitivity. This represents chair/back/body space at one instant; feet/knees under the table, getting up, children and actual body sizes require a real mockup. Circulation uses 500mm and 700mm circular agents, the latter a tray sensitivity. The 75mm grid adds a conservative **53.0mm** radial cell pad. A route is a centre path through assumed obstacles; it is neither its minimum installed width nor accessibility/code certification. Model control endpoints are inside the entrance, kitchen and terrace, so these routes do not certify crossing the actual external door or terrace threshold. Routes include wall-face strips and open entry leaf. Collision results and route results are intentionally reported separately.

### Entry and storage change

The initial attempt to retain the 900×280 unit on the west entry wall **was rejected**: a standing shoe user blocked the serving/terrace route. The developed proposal instead places a **700×240mm** unit on the south return east of the original entrance, centre **(15560,10000)mm**, rotation **180°**. The 620mm mirror stays on `WALL-RECP-01-16`, offset **−30.16mm**, elevation **1150mm**, aligned above it. The model shoe mesh is approximately 1.0m high; it is **not a three-tier hardware drawing**.

This leaves nominal **35.4mm** to the east inner wall face and **21.3mm** to the south inner wall face. These are installation allowances to survey, not guaranteed tolerances. The original door remains in its modeled hinge/swing. Do not fabricate this unit from rendered pixels.

A narrower three-tier tilt unit targets **six adult pairs** (two pairs/tier at ~300mm pair pitch). It assumes **200mm** opening projection; the source unit was audited at 280mm. The proposed clear rectangular storage upper bound is **93.0L**, down from **145.2L** in the source under the same carcass-height assumptions: **52.2L / 36% less**. Hardware, dividers and shoes reduce these boxes further. Confirm large shoes, dust, tilt retention, toe access, anchorage/anti-tip, emergency exit and real capacity. If a real SKU needs more projection or cannot meet the household inventory, **REVISE the entry unit**; do not claim this design has solved storage by volume alone. No stroller/coat cabinet is invented in the circulation lane.

The retained buffet moves from **(15720,4750)** to **(15720,4550)mm**. Its source lamp moves to y=5250. One **1200×650mm** artwork centres on the buffet, wall 18 offset −1931.9525mm, lower edge 1150mm. Existing 2000×400×800 buffet envelope yields **425.1L** assumed clear box before shelves, hardware and partitions; reachable closed dinnerware, serving dishes and table linen are its purpose. Three simple bays, adjustable shelves and soft-close hinges are a carpentry brief, not manufactured internals. Loading, wall fixing and open doors need site/vendor confirmation.

### Kitchen operating audit

The sink, DW, hob, fridge and **600mm indoor washer** stay at their exact source coordinates. The reserved oven below the west cooking run is a proxy, not a selected appliance. No island, new water/drain route or terrace laundry relocation is introduced.

| Appliance / state | Measured model result | Verdict |
| --- | --- | --- |
| DW door projects 600mm south | **972.3mm** remains to assumed south inner wall | KEEP single-use space, manuals HOLD |
| DW open + 600mm unloading adult | Only **372.3mm** remains behind user | REJECT a simultaneous walking route behind the unloader |
| Service door sweep vs DW user | **14.6mm** minimum sampled separation | REVISE operational sequence; not a safe tolerance or handle clearance |
| Fridge projects 650mm north / user beyond | Intersects P0 kitchen door sweep; user also conflicts with the fully open leaf | REVISE P0 operation/product selection; P1 removes this leaf conflict only if permitted |
| Oven open 500mm east | Intersects service-door sweep (13/46 samples) | HOLD oven SKU and leaf; keep service door stationary during use pending mockup |
| Washer open + user | User intersects service-door sweep (18/46 samples) | HOLD simultaneous service access |
| Oven user and washer user | **54,000mm²** proxy overlap | REJECT simultaneous assumed two-user operation |
| Six chairs +350; 700mm serving proxy, normal / oven / washer operating state | P0: no route; conditional P1: sampled route found | Supports wider P1 connection under these assumptions, not physical release |
| 700mm serving proxy during DW or fridge use | Goal blocked in both P0 and P1 | HOLD simultaneous use; blocked endpoint is not a measured narrow aisle |
| 500mm actor during normal/DW/oven/washer use | Sampled route found in P0 and P1 | MODEL ONLY; door/body conflicts still apply |

Cabinet panels are also encoded: base fronts assume 500mm deployment + 600mm user; upper fronts assume 450mm deployment at their real mounted heights. [audit-proposed.json](./audit-proposed.json) records each panel, adjacent-appliance relation and sampled door/user relation. No corner access is claimed: source 600mm closed corner needs a product-specific opening and reachable shelf trial. The shallow fridge landing remains 600×410. Upper run **1800×330×700**, plus **300/450×330×700** west units, is retained. Hood/gas heat and extraction clearance must be checked against actual products.

Storage inventory retains separate upper-box capacity, sink/waste, cooking run, corner and shallow landing. DW and washer niches count as **zero storage**. Sink trap/waste, reserved oven, hob/hood ducts, corner hardware and partitions must be deducted; summing their boxes as available food-storage litres would be misleading. Wall-44 removal gives **no claimed cabinet volume gain**.

## Two developed alternatives

| Design element | A — Calm Contemporary | B — Warm Contemporary / Soft Luxury |
| --- | --- | --- |
| Spatial concept | Quiet arrival/drop zone, clear west serving lane, light buffet/art composition; retained family sofa | Same functional zoning, a stronger buffet/TV/entry wood rhythm and a defined dining focal point |
| Public floor + kitchen transition | Warm light limestone-look matte porcelain, conceptual 1200×600 module; same family across kitchen threshold | Same light mineral base, so contrast comes from joinery and one taupe TV face rather than a darker floor |
| TV wall | Subtle light stone assignment on canonical wall face 09; no thick build-out, original console | Restrained mineral taupe on the same face, walnut console; no marble spectacle or panel depth invention |
| Closed joinery | Pale natural oak buffet, shoe unit and TV console; simple low-glare hardware | Muted walnut on the same pieces, with the large buffet kept as one horizontal mass rather than busy fluting |
| Upholstery / accent | Warm ivory sofa, mushroom chairs, retained olive lounge chair; performance fabric target | Sand sofa, mushroom chairs, warm taupe lounge chair; textiles soften the richer wood |
| Art and visual balance | One landscape-format bundled abstract artwork centred to buffet, light oak frame | Same scale/placement with darker frame; controlled depth, no extra ornaments |
| Dining composition | **Pendant removed**; track + existing reading and buffet lamps. A clear volume above six places | Existing globe **replaced by 1000×160×120 linear pendant**; 650mm drop, underside **1730mm** above floor / **980mm above table** |
| Lighting hierarchy | 3000K surface track and source lamps, brightness proxy 72; no dropped ceiling | 3000K downlights plus slender dining pendant and same source lamps, brightness proxy 68 |
| Entry experience | Pale small unit and aligned mirror; arrival sightline favours light floor/terrace | Walnut small unit and mirror create a richer first accent; same route and clearances |
| Practical trade-off | More tolerant of the 2.50m volume and less visual bulk; could become flat without good real samples/art | More focal depth, but low ceiling and brown P0 kitchen door can make the composition heavier |

These are not paint-only swaps: lighting fixtures, ceiling composition, pendant proportion/removal, TV surface, furniture finishes, floor continuity, arrival storage/mirror relationship and buffet/art alignment develop together. The lighting slider is an appearance proxy, not calibrated illuminance. No unsupported ceiling void, recessed fixture depth, installed power, strip profile or lux result is inferred.

### Build and maintenance brief — both options

Use washable matte paint and flat, easy-wipe cabinet fronts; full edge sealing, accessible adjustable feet or cleanable skirting, soft-close hardware and replaceable handles. Veneer direction and matching depend on a real sample board. Avoid deep fluting and open decorative shelving in food/arrival dust zones. Rounded table edges already read in the viewer; a supplier must prove tabletop/support footprint and six knees actually fit.

Light mineral porcelain is a **new finish proposal**, replacing the source's displayed public wood-look floor only in the study snapshots. Do not overlay it on an unknown floor buildup. Survey finished levels, threshold/weather seals, slab/screed, flatness, expansion joints, door bottoms, acoustic requirements and slip/cleaning characteristics. Keep the 2500mm clear ceiling; surface tracks and portable lamps are the first design strategy. Bedrooms remain their current warm floor; any hall transition is a separate sample/detail hold.

Specify a real 3000K, high-colour-rendering, dimmable low-glare family of fixtures, with manufacturer beam/driver/photometry and electrician-coordinated circuits. Intended layers: arrival/route, dining task, sofa reading and low-level evening ambiance. Keep lamp shades outside seated TV sightlines. No wattages, lux, circuit safety or hidden HVAC routing are approved. B's low pendant is over the table only; full-scale head reach, glare and dining service need testing.

Original reception glazing remains full height. Retain the source layered curtains and opening proportions; test access with both curtain stacks, the real sliding panel and frame. There is no known north bearing/weather/solar model: **day/evening WebGL is not a glare study**. Trial TV reflection from all three seats with actual daylight and curtains. Exterior solar shading and glass changes are outside this sprint.

## P0 versus conditional P1/F1

| Criterion | Refined P0 enclosed | Conditional P1/F1 semi-open |
| --- | --- | --- |
| Connection | Original nominal **720.2mm** opening and original hinged door; visual barrier remains | Nominal **1207.4mm**, from omitting only 487.2mm wall 44 and door mesh; stronger dining sightline and modeled serving route |
| Appliances | Same services/storage; original leaf's sweep conflicts with fridge/user proxies | Same appliances; removes that leaf conflict, not DW/washer/oven/service-door conflicts |
| Smells/noise | Closed door can help containment; leakage and extract still need design | No closable screen selected; more noise/odor transmission without proven extraction and makeup air |
| Portal finish | Source walls and floor proposal | Warm ivory narrow returns and flush mineral floor relationship; **20mm each-side finish allowance is unverified**, not a manufactured portal assembly |
| Storage | Source kitchen run preserved | Same source run, **zero claimed storage gain/loss**, exact return/service/fire detail TBD |
| Engineering | Original geometry retained; product/MEP/as-built holds remain | Wall-44 structural/developer/services/lintel/head/gas/extraction approval mandatory |
| Closure | Original leaf remains | No invented pocket. 783.8mm remaining return cannot park a 1207.4mm full-width single hidden pocket; folding/stacking needs a supplier study |
| Decision | KEEP complete fallback, REVISE concurrent appliance operation | Preferred connection to develop; **HOLD construction**, fallback P0 if not feasible |

## Dimensioned plans and verified rendering

Dimensioned overhead plans: [source seated +200](./plan-baseline-200.svg), [source +350](./plan-baseline-350.svg), [source +450](./plan-baseline-450.svg), [developed seated +200](./plan-proposed-200.svg), [developed +350](./plan-proposed-350.svg), [developed +450](./plan-proposed-450.svg). They show exact polygons, nominal walls/openings, all chairs, sampled door leaves, open fronts/users and route overlays. Print scale depends on export size; labelled dimensions remain authoritative model values.

Eight cameras per matrix cell: entry overview, living→dining, dining→living, wide reception, kitchen relationship, kitchen work run, matched wide evening, and seated TV. Human-eye height is **1680mm**, seated TV **1100mm**. The model-to-world conversion uses actual model extents, not guessed offsets. Day/evening positions/targets/lens are identical. Every A/B/P0/P1 camera and door setting is identical for its view ID. P1 geometry is visibly and metadata-labelled conditional.

The existing `scripts/render-variants.mjs` captures genuine production-viewer Three.js/WebGL through Playwright; no AI images or imagined geometry. The new GitHub workflow regenerates sources, validates use states, renders **32 PNGs**, validates pixels/metadata/checksums, and creates eight contact sheets. The manifest includes exact cameras, original cloud/GitHub identities, snapshot/layout and architecture-overlay hashes. Original PNGs are kept unchanged inside the labelled contact sheets. Final artifact and direct image review are recorded in [VALIDATION.md](./VALIDATION.md); a green job alone is insufficient.

## Critical design decision and unresolved release checklist

[DESIGN_REVIEW.md](./DESIGN_REVIEW.md) gives KEEP / REVISE / REJECT across the eight requested criteria, with actual image observations after the final render run. [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md) identifies the concrete survey, structural, product, storage, lighting and household evidence still missing. No approval flags, working snapshot, master or production scene are changed by this branch.

Reproduce: `npm ci`; `npm run build`; `node studio/local/workspace-data.mjs`; `npm run check`; `npm run check:studio`; `node --test studio/local/current-baseline.test.mjs studio/local/owner-decisions.test.mjs studio/analysis/reception-sprint.test.mjs`; `node scripts/build-reception-sprint.mjs`; install Playwright/Chromium using the existing workflow; render the four snapshots with `scripts/render-variants.mjs`; run `scripts/verify-reception-sprint-renders.mjs`. The workflow is the durable complete command record.
