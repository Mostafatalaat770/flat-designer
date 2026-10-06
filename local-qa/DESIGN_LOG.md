# Apartment Type B — design iteration log

Canonical architecture: **VERIFIED unchanged**, SHA-256 `734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658`.
Recovered production baseline: `scene-c286be16`, storage revision **9**. Read again after experimentation: unchanged. Existing history and named variants were not written or activated.
Repository: linked source restored into `/private/tmp/flat-designer-work`, baseline Git commit `a7706c1`. Recent camera/furniture upgrades were inspected. The Downloads snapshot is older; the unrelated mobile workspace was not edited.

| Pass | Hypothesis and change | Validation | Screenshot observation | Decision |
| --- | --- | --- | --- | --- |
| Recovered baseline | Reproduce actual saved design before designing. | 97 PASS / 52 WARNING / 0 FAIL; exact scene revision. | Central space is breathable. The single reception chair and remote table read as a detached terrace cluster. The 2070 mm sofa is modest for future family use. Six seats fit, but 1800 mm leaves little end margin. Orange-brown wood and two identical automatic artworks compete. | Preserve baseline and images. |
| 1 — layout | Give family living priority: 2880 × 990 mm sofa at the same wall, larger rug, chair brought into the living group, remote side table removed. Dining 2000 × 950 mm; shift toward east to protect kitchen approach; retain 3 + 3 seats, spaced 700 mm. Move shallow sideboard north. | 94 PASS / 48 WARNING / 0 FAIL; `scene-e16fb558`. | Entry view shows more open terrace frontage. The chair now belongs to the sofa group. Dining has better seat spacing. Warm wood/render defaults remain dominant. | Keep layout. |
| 2 — hierarchy and finishes | Paler oak, warm ivory plaster, quiet stone, one explicit 1200 × 800 mm artwork. Test linear dining pendant. Add the verified Muuto dimensional reference without claiming generic linen is its upholstery SKU. | 96 PASS / 48 WARNING / 0 FAIL; `scene-be13d8d2`. | Family sofa reads as three seats. One artwork creates a clear living focus; dining becomes calmer. Floor looks too continuous, wood grain too strong, linear pendant too blocky. | Keep hierarchy; revise floor, grain and pendant. |
| 3 — restrained finish | Restore subtle tile grout using the material's 1200 × 600 mm texture scale. Reduce procedural wood contrast. Revert to a soft 420 mm pendant with 240 mm body height and 280 mm drop. | 96 PASS / 48 WARNING / 0 FAIL; `scene-2ad8493e`. | Eight views checked, including paired 42° / 60° views at the same location. Natural views show comfortable seating scale, a readable living group, clear middle, unobstructed terrace access and six dining seats. Softer pendant is more coherent with the table. | Keep as **EXPLORATORY Reception A.3**, pending detailed product/route checks. |

## Measured interpretation

- Main sampled hall → kitchen and hall → entry routes: **617.8 → 676.9 mm**, conservative 125 mm grid estimate; below the preferred 900 mm target. These are review constraints, not certified routes. Hall → WC improves to 656.7 mm.
- Empty kitchen-side table end: approximately **897 mm** between the kitchen partition face and the table's bounding rectangle (nominal 180 mm wall). No head chair has been added.
- East table end is tight, approximately **375 mm** to the nominal room-facing wall. This is not designated a through-route. Access to seating is from the long sides; final pull-out and knee space need a physical product check.
- Dining centres are spaced **700 mm** along each long side; chair footprints remain 450 × 480 mm. Table end centres are 300 mm inboard. Oval taper and pedestal/knee compatibility remain **TBD**; the conceptual validator does not certify comfortable real chair/table interfaces.
- Sofa glazing-end footprint begins at 1020 mm; canonical north glazing line is 550.754 mm. The approximately **469 mm** end gap is a glazing-frontage warning. The sofa is perpendicular to glazing and low; site curtain stacks and access should be checked before purchase.
- Sofa front → coffee-table bounding edge is approximately **530 mm**. This is a local reach/seating gap, not the principal apartment route. The larger rug anchors the sofa and front of the lounge chair without furnishing the middle.

## Representation and remaining imperfections

**VERIFIED:** locked canonical hash, 13 rooms / 16 openings / 64 wall segments, single continuous RECP-01, 2.50 m finished ceiling, full-height living glazing, runtime 42° Natural / 60° Wide switching, 1.70 m eye, 1.70 m human and 1.00 m ruler geometry.

**REFERENCE:** Muuto Connect Soft 3-Seater Configuration 1, official nominal dimensions 2880 × 990 × 690 mm (COS3SC1CD12 / 96016), checked 2026-10-04: https://www.muuto.com/product/Connect-Soft-Modular-Sofa-3-Seater-Configurations . Manufacturer notes that assembled dimensions are indicative. The catalog identifies a real product; the WebGL mesh is an approximate reference, not its manufacturer model.

**GENERIC:** natural linen upholstery, oak finish, limestone-look floor, chairs, tables, curtains, pendant and plant. No real material SKU is claimed. Artwork uses the repository's existing AI concept image; it is not a purchasable print.

**INFERRED:** conceptual wall thickness, chair operating direction and door swings. **TBD:** concealed HVAC in the 130 mm void, full lighting/MEP engineering, exact table pedestal/knee room, chair pull-out, finish samples, construction/site tolerances.

Still imperfect: the conceptual wood/plant meshes and automatic tabletop props lack product realism; the dining wall is deliberately quiet, but final styling needs proportioned real pieces. The larger sofa's TV viewing angle varies by seat and merits an actual sitting-height check. Current screenshots establish human-scale layout, not calibrated daylight or photometric performance. General light remains 3000K, brightness 76, with a near-white ceiling and no new gypsum drop.

## Engineering changes supporting the design

Explicit artwork now replaces automatic style artworks in its room; other rooms retain theirs. An explicit pendant removes the competing track at that furniture anchor while retaining living track lighting. Assigned wood material colour controls mixed furniture's wood components. Wide modular sofas render three modules. Procedural wood grain is quieter. These renderer changes are local and visible in the candidate comparison; it is not a comparison of furniture placement alone.

All production defaults/layouts remain unmodified. The candidate is in `reception-a3-brief.json` and `pass3-proposal.json`; no live apply/save/variant/capture tool was called. A.3 local images came from the actual bundled Three.js viewer, not the hosted headless service or image generation.

## Next phase — Realism R1

User requested realistic materials/furniture imagery, a proportion audit and bathroom completion. Separate local candidate `scene-776b85c5`: larger real-reference chair footprints, missing ensuite vanity supplied, bathroom fixture orientation and warm wet-area materials explored.103 PASS /48 WARNING /0 FAIL. Actual mesh audit found approximately39 mm sofa-height and50 mm chair-height deviations from their product references. Photoreal images use built-in imagegen on local screenshots and remain EXPLORATORY. See `realism-r1/README.md`, `brief.json`, exact prompts and PNGs. Production and architecture remain untouched; A.3 history is retained.


## 4 October 2026 — Whole-apartment options and kitchen/laundry refinement

- Hypothesis: density should come from useful family furniture rather than a third seating group. A adds closed storage, entry bench, side table and reading light; B adds a chaise; C reverses the TV wall.
- Validation: all v2 alternatives 0 FAIL. 18 fixed 42° / 1.70 m model views; 72-step browser replay passed. Three generated interpretations saved beside original model evidence, explicitly EXPLORATORY.
- Observation / decision: develop A; B closes the approach and C feels more enclosed from the family view. Retain alternatives. Sideboard wall, generic accessories and chair fidelity still need work.
- Scale change: reference sofa seat 400 mm / back 690 mm and Fiber chair seat 460 mm / back 770 mm; measured Three.js tests and all five repository verification suites passed.
- Kitchen hypothesis: correct central-fridge restriction with southeast fridge, shallow opposite landing, gas cooking and dishwasher beneath continuous prep. V3 washer on west run validated 0 FAIL, but actual screenshot showed open service door obstructing access. REJECT that washer placement; preserve v3 history.
- V4 change: washer and dishwasher on north run below intended continuous 1200 × 610 mm prep; 600 mm sink base with 550 mm sink; west hob run restored to 1500 mm.
- V4 validation: kitchen 102 PASS / 59 WARNING / 0 FAIL; coordinated candidate scene-dc971196 106 PASS / 67 WARNING / 0 FAIL. Ten views captured in a 40-step browser baseline run. Warnings and appliance opening/standing envelopes still require interpretation.
- V4 observation / decision: north washer access visible and independent of balcony door. Keep as next engineering study, not a finalized kitchen: actual worktop and cabinet fronts are not rendered correctly by the generic appliance meshes; washer opening beside west return, fridge hinge/ventilation and approximately 18 mm entrance proximity remain TBD. Measured refrigerator working gap 1097 mm meets the one-cook NKBA planning target but not multi-cook target.
- Laundry decision: indoor first, based on manufacturer indoor-use instructions; outdoor roof alone is insufficient. Bosch built-in washer is a reference, not a selected local SKU. Gas installation, services and tolerances TBD.
- Architecture/hash unchanged. Production reread remains scene-c286be16 / storage 9. No live writes. PROJECT_DOSSIER.md records all room packages and product/source statuses.

- V4 repeat QA completed: 40/40 steps passed; all ten local screenshot comparisons 0.00% difference. Coordinated interactive Studio separately loaded and inspected: scene-dc971196, canonical hash intact, Natural Walk 42°, eye 1.70 m, measured human 1.70 m and ruler 1.00 m.


## 4 October2026 — Family organization / A.5–A.7

| Pass | Hypothesis / change | Validation | Screenshot observation | Keep / revert |
| --- | --- | --- | --- | --- |
| A.5 | Useful density through bedroom drawers / master bench; art over sideboard; taller existing plant; hall mirror/light |122PASS /74WARN /0FAIL | Extra WIC mirror interfered with north wardrobe operating strip; bedroom drawers displayed as open vanity with stool | Revert WIC mirror; keep hall clear |
| A.6 | Shift bedroom1 wardrobe clear of glazing approach; remove WIC mirror |121PASS /72WARN /0FAIL;22 comparison screenshots | Bedroom2 solid-wall bed frees window; sideboard wall reads more complete; dresser mesh still unsuitable, king footprint omits frame allowance | Keep organization; revise storage/frame dimensions |
| A.7 | Manufacturer outer king-frame1870 ×2220; single-frame reserve1280 ×2100; closed joinery objects; bench moved to south wall |126PASS /76WARN /0FAIL;13 views,52-step repeat0.00% difference | Enlarged single bed initially collided60mm with desk; correct by using1000 ×600mm desk. Storage views show purposeful closed cabinets; cross-route view better than closet closeup | Keep controlled A.7 locally; real assets/product tolerances remain TBD |

Useful measurements: master east main path~1288mm, south bench approach665mm; BR1 cabinet approach815mm, wardrobe800mm; BR2 wardrobe849mm; dressing fronts1335mm. These are modeled furniture clearances, not construction certification. Hall modeled face1027mm: no floor cabinets. Indoor kitchen island rejected, open kitchen unapproved architecture option.

Reference king dimensions from IKEA IDANÄS article90458947. Mattress1800 ×2000mm; frame1870 ×2220mm. Generic warm bed mesh is not a product replica/confirmed upholstery. Single frames are INFERRED reserves, not actual chosen SKUs. Sideboard geometry represents custom closed storage; exact drawer interiors/hardware TBD.

Engineering response to project growth: new studio/domain and studio/local modules; declarative family-a7 study; shared contracts preserved, seven boundary tests, no production API. Camera errors now stop output before writing and report the shared error; previous missing-error-class / silent-skipping behavior avoided. Full framework and detailed asset/render migration documented, not claimed complete. All five existing verification suites passed. No canonical changes or production writes.


## 2026-10-05 — Studio upgrade v1 / preserve Family A.7

- **Hypothesis:** separating shared geometry/contracts, UI and rendering makes whole-apartment iteration more reliable without sacrificing measured scale.
- **Change:** independent Three r160 builders/engine; React/TS/Vite local workspace; measured GLB import and finish records; actual GLB export to Blender/Cycles. No actual furniture layout or architecture change retained. The 10 mm dining-table QA edit was undone; its REVERT entries remain in local history.
- **Validation:** eight study tests, seven browser/asset tests and five original suites PASS. Canonical hash unchanged; scene-9e210720 retained with126PASS76WARNING0FAIL. Thirteen extracted views EXACT0 pixels changed; final52-step replay0diff. Lens/scale, matching-camera comparison, edit/undo, asset loading and two finishes pass real Chromium interaction flows.
- **Screenshot observation:** workspace provides direct dimensions/checks/comparison instead of HTML patching. Existing family composition is preserved. Extra kitchen and bathroom shots show that generic fixture detail still limits realism. A centre-facing ensuite preset framed a blank wall; re-aimed the standing camera toward existing vanity/WC, with strict preflight.
- **Blender observation:** real exported architecture, furniture bounds and cameras survive the round-trip. Alternate views initially retained an imported quaternion; corrected and added actual world-direction checks. Entry/living/dining now use matching canonical42°/1.70m cameras. Soft shadows are available, but lighting is too dim and surface/furniture detail remains generic. Failed camera attempts are retained separately, not presented as approved outputs.
- **Decision:** KEEP the upgrade foundation. Do not approve the Cycles lighting/material treatment as finished design. Next: dimension-matching licensed sofa/dining/light assets, daylight/curtain/PBR calibration, then kitchen/bath fixture detailing and circulation review. Manufacturer product procurement, service feasibility and asset persistence remain TBD.


## 2026-10-05 — ChatGPT image prompt pack

- **Hypothesis:** canonical plans plus matched local room views constrain finish exploration more effectively than text alone.
- **Change:** 14 self-contained prompts covering all 13 areas and a true top-down whole apartment; 18 local room references plus two complete canonical plan PNGs. Current Family A.7 scene-9e210720 retained. No furnishing or architecture changes.
- **Validation:** local source brief validates; all 13 room polygons, 64 wall segments and every opening exported; prompt/reference links and ZIP integrity checked.
- **Screenshot observation:** compact WC retains door occlusion; service terrace initial view faced a wall, replaced with a measured Natural42/1.70m paving/parapet view. Labelled plan rasterization initially obscured lettering; corrected and visually inspected. Compact views need the complete plan for off-camera boundaries/fixtures.
- **Decision:** KEEP prompt/reference pack for EXPLORATORY photoreal finish studies. No AI images generated or spatially approved by this task. Geometry, services and product accuracy require their existing validation routes. No production writes.


## 6 October 2026 — revision-39 integration

Preserved all earlier studies and synced the complete matched `scene-29d4aa6d` layout from the Git branch snapshot; no furniture or architectural edits. Calibrated 18 views across 13 areas to Natural42/1.70m while retaining source door states. Validation165PASS/74WARNING/0FAIL. Six inspected reception/kitchen/bathroom PNGs and21-step UI/24-step capture replays pass. Keep this source baseline. Next study should reduce heavy reception sideboard hierarchy, verify family seating capacity, resolve kitchen prep/use surfaces and replace generic bathroom fixtures. See INTEGRATION_20261006.md for hypothesis/change/observation/decision details.
