# M3 Group3 — bathroom interior architecture / Issue74

Open **Owner-Review.html** for the Arabic offline review. The one ZIP contains that same self-contained HTML,14 measured SVG drawings, three private scene copies, source/operating/hold evidence and verification. All27 actual PNG canvases are embedded in the HTML; the repository also keeps individual PNGs and SHA sidecars. Nothing needs a server or network.

**Provisional direction: B warm stone/olive, ivory, oak and nickel.** Retain master1450×800/source600 fixed screen. Family900×900 appearance and inward2×290 fold are studies; **no glass mechanism is selected**. Guest450×250 floating is a water/product trial, compared with original350×180 and an equally small floating A. All approvals remainfalse.

## Practical results and limits

- Master600 versus700 screen gives832/732mm nominal west band with the east edge fixed. Both preserve800 depth; the old900 study stays unselected because wet-edge/WIC-jamb Y projection falls115.7→15.7mm. None is a water barrier or installed opening. B moves the two source380×115 shelves to the north face near the shower, without moving shower services. Surface shelves lead; an unknown-wall niche is not cut or modeled as approved.
-91 positions of each original40mm room leaf at1° have no fixed fixture/glass or proposed-accessory collision. Occupation changes this: master600-square vanity/entry states and guest500/600 handwash plus600 WC states are swept. Close doors before occupation/drawers; no articulated entering-body proof. Master500 vanity proxy and500 wet/dry glass-cleaning positions clear the tested shapes.
- Family source coordinates place the shower in the southeast. Its WC-facing pane is **NORTH at y7959.592**, despite inherited PR54 calling it south. This study corrects the cardinal label, preserving actual coordinates. West remains the access face. WC nominal edge gap319.6 versus580 outward projection yields260.4 excess; west outward leaves198.6 centreline/108.6 after assumed90mm finish. Both remain rejected.
- Inward folding uses two full290mm panel rectangles/8mm thickness, not hinge arcs alone. Max projection290.03mm;500-square retreat at[8510,8230] clears91 positions but has only10.4mm west margin.600 square collides31/91. Shifting500 body20mm west breaks it. A inward580 pivot hits500 in54/91 and600 in64/91. The ideal zero-offset panels coincide at90° (2320mm² plan overlap); this is not a buildable separated glass stack. Handle, gasket, actual hinge offset, articulated body, fingers, seals and supplier tolerance are unknown; **B is not physical mechanism approval or certified access**.
- Family basin-to-WC plan band484mm:600-square and500-square front-standing states fail;600×400 passes the static footprint test.250mm drawer +400mm body fails againstWC. B therefore studies sliding fronts inside the source600×460 vanity instead of pretending a full drawer works. The shallow source520×170×420 towel cabinet assumes134mm internal depth; folded bath-towel180mm fails by46. It is hand-towel storage only, inventory conditional.
- Generic large bowl inside410×300 and side landing70mm; guestB inside350×150 versusA260×90. Two-hand240×90 stress box leaves110/60mm inB and20/0 inA. These are authored concept dimensions, **not vendor bowl, flow, actual spout access or splash proof**. U-drawer calculations subtract a stated trap box: master upper37.56→32.52L; guestB9.94→8.50 andA4.90→3.46L. Family figures are counterfactual arithmetic, not allocated drawer capacity.
- Dry towels/hooks, hand towels, rolls and small bins are source-derived accessory concepts with measured model coordinates and captured bounds. No WIC clothing/shoe inventory is consumed. Maintenance, hand reach, lid/liner extraction, hose operation, anchorage and physical cleaning remainHOLD.
- B side-facing diffused light versusA top strip is a functional/light-composition comparison with independent ambient/night views. Mirrors explicitly use a neutral optical surrogate: **reflective_simulation:false / illuminance:NOT_CALCULATED**. Native WC r160 triangle bounds/front ray are recorded in WC_OCCUPATION.json; a600x350 seated knee/foot stress box leaves421.5/369.5/5.3mm to the sampled master/family/guest door. Guest5.3mm is not a sufficient physical clearance claim. No new sockets, circuits, lux, CRI, IP or electrical installXY. No ceiling drop, drainage relocation, approved floor falls or waterproof system.

## Visual review and correction

The first five actual previews exposed over-rough uniform walls, a heavy dark family towel cupboard, weak screen visibility and a bin occupying the family basin stance. The final captures use six original procedural material swatches on the same source faces, a lighter family cupboard, corrected bin/towel positions and an additional source-derived wide master camera. Calm olive stone B is visually distinct from clay/walnut A. Source doors remain brown and visibly occlude some open-door views; they were not removed. The neutral mirror and procedural stone are rendering limits, not real products or reflective photorealism.

A family's comfort, water containment and supplier glass feasibility may still reject either option. The gallery exposes these weaknesses beside the aesthetic recommendation rather than awarding a construction score from a passing renderer.

## Traceability and preservation

Start head8b91b69e861fabe4c292502b66af8dd2140d456d, source v55/scene-9cf45a73 SHAec05e4fe7c0e15b3555107da4ac5628894df7fcddb3cee996d3af2fddaa7df63. Canonical TypeBv0.2.2 SHA734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658; ceiling2500. All1121 inherited tracked files,13 rooms,77 original identities, saved sources/scenes and earlier packages stay byte-identical. Added snapshots/hooks/evidence exist only in this independent review.

Read AGENTS/master plan/live41/72/74, prepared Group3, owner registry and prior bathroom PR52–59. The12 M1 bathroom intents remain linked in DESIGN.json;12 new HOLDs plus all7 Group1B and9 Group2 gates stayOPEN independently. Existing Issue19 retains professional construction release. There is no new apartment roadmap or appliance/SKU work. The [next independent kitchen source](../group4-preparation/README.md) prepares Group4 only.

## Repeat locally

Use existing dependencies and system Chromium. Browser execution requires the environment's normal permitted local socket/process capability; it makes zero external requests.

```
mkdir -p work/m3-group3
npm run build > work/m3-group3/build.log 2>&1
npm run check > work/m3-group3/check.log 2>&1
node studio/local/workspace-data.mjs
npm run check:studio > work/m3-group3/studio-ready.log 2>&1
node --test studio/domain/apartment.test.mjs studio/analysis/*.test.mjs studio/local/owner-decisions.test.mjs > work/m3-group3/domain.log 2>&1
node scripts/whole-home-m3-group3-textures.mjs
node scripts/build-whole-home-m3-group3.mjs
node scripts/whole-home-m3-group3-details.mjs
node scripts/whole-home-m3-group3-holds.mjs
node scripts/whole-home-m3-group3-plans.mjs
node scripts/whole-home-m3-group3-wc.mjs
node scripts/render-whole-home-m3-group3.mjs
node scripts/report-whole-home-m3-group3.mjs
node --test scripts/whole-home-m3-group3.test.mjs
node scripts/verify-whole-home-m3-group3-browser.mjs
python3 scripts/package-whole-home-m3-group3.py
```

Release boundary: **PR68 remains Draft at8b91b69.** Its Git integration automatically deployed that prior `[skip ci]` commit to Vercel, as read-only inspection confirmed (`source:git`, deploymentdpl_3pp1o5afYXjRq3e8XUmoCewqbrk1). Therefore this review is persisted with a **tag**, not a push to its branch. All existing push workflows are branch-filtered, so the review tag does not match them; no workflow/billing/hosting settings changed. Issue41/72/74 and PR68 point to the review result and next independent group. The tag is a design evidence checkpoint, not an owner, procurement, cloud or construction release.
