# M3 Group2 — bedrooms and walk-in closet

Open **Owner-Review.html** for the complete offline Arabic owner review. The ZIP contains that same self-contained review, dimensioned SVG plans, exact private SOURCE/B/A copies, operating/mesh evidence and open decisions. PNGs are embedded in the HTML; the repository also retains all 22 original PNGs with SHA256 sidecars. No images require network access.

Provisional design: **B for BR02 daily study and WIC**, revised BR01 and shared master layouts with a softer Organic Contemporary A material/bed-base alternative. These are recommendations for owner review, not accepted furniture, site measurements or construction drawings. BR02 remains a single 1200×2000 guest bed; a two-adult programme has not been assumed. The owner confirmed BR02 as a daily office with guest sleeping when needed during this sprint. This confirms the programme only; users/body dimensions and clothing inventory remain unknown.

## Decisions that matter

- BR02: source900×500 desk /480×480 chair face the wrong way for daily desk use in the actual native chair geometry. B uses a1100×580 desk and bounded580×580 chair facing it; actual mesh knee boxes and back/seat rays supplement footprint tests. 300/450 withdrawal and wardrobe operation are explicitly tested. Glazing access requires phased parking of the **unoccupied** chair;500mm conservative routes are found at50/25 grids,700mm is not certified. The path of the person moving the chair, cables and rotation remain HOLD.
- B-BR02 wardrobe1200×650 replaces source1600×600: external width−25%, proposed clear bay573 versus773mm (−25.9%). Both proposed BR02 cabinets are2100 high versus the actual native source mesh2200. This resolves the source AC/cabinet **body overlap**, leaving45mm beneath the heuristic AC at their plan overlap. It does not prove cover/filter service. Upper BR02 rail1770 versus1920 elsewhere; no hidden clothing compensation from WIC.
- BR01 desk moves to the west, wardrobe shifts150mm north and deepens50mm; B bed shifts225mm east: west gap75→300mm, source east gap1345→1070mm after the50mm wardrobe deepening, with default300mm drawer/600mm user still collision-free. Its bedside shelf300×320 moves north to preserve operations and the slim curtain; A retains source bed location and350×320 shelf/full drapery. Neither75 nor300mm is a claimed500mm walkway. BR01/master low chests narrow1000→600: assumed internal960→560 loses41.7% width. Owner inventory can reject these local choices without stopping independent room work.
- WIC B650 slider leaves1235mm between fronts versus A600 hinged/1335. Proposed inside depths575/555 permit a550mm garment envelope only conditionally;600mm bulky garments fail both. Five576mm rails total2880mm; illustrative50–80 thin pieces is not a count of the owner's clothes. Full hinge arcs and actual bay/standing envelopes are tested. Opposite drawers and two users are rejected; wait/close before another person crosses to the bathroom.
- Conditional550×350×400 shoe box is **not allocated**. Four low pairs are an envelope example. It displaces137.5/132.8L of accessible clothing bay, not merely77L of box volume, and four illustrative folded-stack positions. Proposed first clear shelf opening372mm needs at least28mm shelf adjustment; it is not a drop-in accessory. Rear225/205mm is not counted as available clothing.
- Curtain stacks and actual folded meshes share the same source-jamb locations. Master left return is only79.5mm in the assumed90mm finish-face model: proposed left70/right150, depth150, with an independent raised blackout roller. Full blackout closure/light leakage and supplier folds remain HOLD. BR01-A illustrates left300/right240 by250-deep drapery; a uniform300mm right stack exceeds its249mm finish return and was rejected rather than hiding its larger operating envelope.

## Evidence and limits

The source is current v55 /scene-9cf45a73, baseline commit5fd6e9153e521f72a5c2a226a7aa3d90833b9fab. Canonical SHA256734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658; source SHA256ec05e4fe7c0e15b3555107da4ac5628894df7fcddb3cee996d3af2fddaa7df63. All13 rooms, original77 furniture/interior identities,2500mm ceiling and inherited tracked files/snapshots/packages are protected. New reversible items and four-room finishes exist only in private copies; no live scene save.

- `DESIGN.json`,12 `AUDIT-*`, `DETAIL_TESTS.json`: source facts, complete40mm-thick door sweeps at2°/46 samples, chair0/300/450,600×600 standing/650×350 seated, drawer0/300/450/600 and proposed350 WIC; three bay positions and actual bay-width alternatives;9 uniform curtain stress envelopes including finish-return conflicts.500/700 routes are four-neighbour circular envelopes with half-cell diagonal padding, beginning **inside** the rooms with the door fully open. Occupied500/600 squares at entry and bed positions are additionally tested through the full door swing: entry stopping points can be swept by the leaf, so move clear before closing; this is not a proof of an articulated entering person. A found route is not doorway, wheelchair, fire-code or articulated-body approval.
- `SERVICE_TESTS.json`: actual native AC world bounds versus actual furniture mesh bounds, floor600×900 service assumptions at600/900 offsets, phased chair translations and500/700 routes at50/25. Heuristic supply centreline /assumed600mm strip are coordination warnings, not airflow/CFD. No AC tonnage, sound, lux or electrical capacity is fabricated.
- `RENDER_EVIDENCE.json` and frame sidecars:22 genuine1120×700 production Three.js WebGL canvases, fixed-camera SOURCE/B/A comparisons and two master night views. Full private snapshot, layout, camera, helper, driver, built-viewer and PNG hashes; loaded materials; zero external requests/fallbacks/architecture overrides. WIC views pass through its actual opening and retain wall occlusion.
- `whole-home-m3-group2-mesh.mjs` implements explicit bounded **generic concept furniture** on the source renderer. Bed mattresses, heads, desks, chairs, wardrobe internals and soft treatments are measurable triangles, not purchased product CAD. Loading the JSON alone in the ordinary viewer will not reproduce these custom forms; use the isolated capture recipe. Source control uses native furniture. The neutral WIC mirror deliberately has no simulated reflection. Artwork is original procedural work; source M2 inspiration links are attributed without copied images.
- `plans/`:12 matched room plans, garment-depth section,2 WIC elevations and2 phased-use plans. Uniform floorplan scales; schematic section/elevation scales are labelled. `SITE_HOLDS.json`:9 new open gates plus references to all7 independent Group1B gates. `OWNER_DECISIONS.json`: all approvalsfalse. Existing construction/as-built Issue19 remains separate.
- `VERIFICATION.md`, `PRESERVATION.json`, `BROWSER_VERIFICATION.json`, `LOCAL_VERIFICATION.json`, package manifest: verified local checks and preservation. Local mocked-provider checks are distinguished from actual WebGL evidence. Remote CI is not represented as PASS.

## Repeat locally

From the repository root with the existing local dependencies and system Chromium:

```
mkdir -p work
npm run build > work/m3-group2-build.log 2>&1
npm run check > work/m3-group2-check.log 2>&1
node --test studio/domain/apartment.test.mjs studio/analysis/*.test.mjs > work/m3-group2-domain-check.log 2>&1
node scripts/build-whole-home-m3-group2.mjs
node scripts/render-whole-home-m3-group2.mjs
node scripts/collect-whole-home-m3-group2.mjs
node scripts/whole-home-m3-group2-detail.mjs
node scripts/whole-home-m3-group2-service.mjs
node scripts/whole-home-m3-group2-plans.mjs
node scripts/report-whole-home-m3-group2.mjs
node --test scripts/whole-home-m3-group2.test.mjs > work/m3-group2-final-tests.log 2>&1
node scripts/verify-whole-home-m3-group2-browser.mjs
node scripts/record-whole-home-m3-group2-verification.mjs
python scripts/package-whole-home-m3-group2.py
```

Run checks/rendering locally only. Final review retains PR68 Draft; no Actions, billing change, merge, deployment, procurement, demolition or cloud save. Next independent room group is the prepared [bathroom source handoff](../group3-preparation/README.md); follow the live Issue41/parent72 NEXT banner rather than an archived issue number. No Group1/Group2 site gate is a blanket dependency on that source-based review.
