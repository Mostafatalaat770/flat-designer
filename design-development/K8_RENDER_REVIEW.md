# K8 review — continuous ceiling and usable appliance fronts

The K7 capture showed a bright slit at the former kitchen/reception separator and a detached strip of skirting near the island. K8 removes finishes belonging to hidden study walls, closes only the former separator's ceiling envelope, and corrects appliance fronts that faced their backing walls. The original canonical architecture and saved live A11.1 are independent of this render-only study.

## Pinned result

| Item | Value |
| --- | --- |
| Study branch | `design/k8-bound-finishes-review` |
| Render code commit | `37d28c69e00844b5bbdccada77468fec95c50ea6` |
| Snapshot scene | `scene-ee04adb3` |
| Source storage revision | 39 — historical provenance, not a new live save |
| Canonical SHA-256 | `734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658` |
| Verification | [37648236771](https://github.com/Mostafatalaat770/flat-designer/actions/runs/37648236771), successful |
| PNG capture | [37648236787](https://github.com/Mostafatalaat770/flat-designer/actions/runs/37648236787), successful; artifact `11496445822` |
| Output | Eight original 1280 × 720 PNGs with camera/layout metadata |
| Status | EXPLORATORY; no architecture, MEP or construction approval |

## Changes

- Skirting records its canonical host wall segment. A removed wall in the study now also hides its associated skirting. Hidden study openings also hide their thresholds. Unrelated walls, finishes and furniture remain.
- The combined kitchen/reception ceiling follows canonical outer room edges at 2.50 m. Its former 21.183 mm raster seam is covered only inside the removed separator/opening envelope. No canonical room polygon is edited; terraces and adjacent rooms are excluded from this ceiling.
- The oven, fridge and pantry rotate from 0° to 180° to face the north work aisle. The conditional terrace washer rotates from 90° to 270° to face the east use area. All four centres, dimensions and rectangular footprints remain fixed. Other layout fields, all eight recorded cameras and the existing architecture overlay are retained.
- The operating-strip calculation adopts the verified master correction for zero-width side tangents. Real objects in front remain obstructions. A negative control verifies that the old appliance orientations face the walls.
- Rendering uses two pages concurrently, a bounded timeout and one fresh-page retry only for a timeout. Each view must match the snapshot's layout, scene, camera geometry and architecture study; pending assets or material fallbacks reject a frame. A manifest is written only after every requested view succeeds.

## Validation and scope

The final verification workflow passed build, all five original core verification scripts, eight study tests, eight Studio renderer/domain/assets tests, the isolated architectural-candidate validator and the additional geometry regression. CPU/DOM adapters in the core suite are distinct from the actual WebGL PNG capture workflow.

The regression uses actual Three.js r160 geometry and upward ray intersections through the traced ceiling seam. It checks retained geometry, excluded terraces/adjacent rooms, the 2.50 m clear height, locked canonical hash, appliance orientation, tangent contacts, real front obstacles and immutability.

The unmodified canonical-domain report for this candidate is **152 PASS / 50 WARNING / 1 FAIL**. The sole hard failure is the existing `E2-island` footprint crossing the original room boundary. The study validator accepts only this named exception while the render-only kitchen separator removal is present. This is not a zero-failure production layout.

| Remaining warning category | Count | Interpretation |
| --- | ---: | --- |
| Pinch-point | 37 | Nearest footprint edge pairs; they are not all designated walking routes |
| Object-object | 6 | Existing table/chair footprint interfaces, reported at −40 mm |
| Object-wall | 3 | Bedroom-1 drawer and pantry backing clearances |
| Door-swing | 3 | BR1 desk, kitchen/service door near the cooking base, and original kitchen door near the fridge |
| Operating-clearance | 1 | Fridge versus the original canonical separator; retained in the canonical report |

A separate diagnostic uses a temporary clone of the render-only merged room, removes only the declared study wall segments, and includes reception furniture in the kitchen front-strip calculation. It measures **1220 mm** from both pantry and oven fronts to the cross-room island, and approximately **4201 mm** for the fridge's front strip. The washer front has approximately **1155 mm** to the modeled opposite terrace parapet. These are concept-model distances, not manufacturer installation or open-door fit certification. The temporary diagnostic does not rewrite the canonical model or suppress its warnings.

## Visual review

All eight final frames were opened and inspected after artifact retrieval. Every frame records `scene-ee04adb3`, the exact frozen layout and architecture variant, the locked canonical hash, its requested J1 camera geometry, zero pending assets and no material fallbacks. The downloaded artifact SHA-256 matches `854bfe6287edb173f3d12ef99e86cd4cab8cf368dcb9b4860eaec2d370a7f580`. All eight renders completed without retries or failed frames.

| View | Visual result | Limit retained |
| --- | --- | --- |
| J1-dining-kitchen | Former ceiling slit is closed; detached skirting is absent; oven front is visible | Tall units appear obliquely from this locked angle |
| J1-living-kitchen | Fridge handle and oven front face the work aisle; continuous ceiling and complete island | Fixed wide comparison lens |
| J1-kitchen-work | Cooking base, hob, sink and island remain present without the detached strip | Concept joinery and equipment models |
| J1-entry-dining | Dining/living relationship and full-height glazing remain visible | Furniture circulation still needs the retained warning review |
| J1-guest-wc | WC visible through the study opening | Door/entry edge partly obscures the handrinse basin |
| J1-family-bath | Family bathtub visible with unchanged room envelope | Toilet and other fixtures only partly framed |
| J1-master-ensuite | Shower and WC visible through the study opening | Vanity is partly framed |
| J1-service-laundry | Washer door and controls now face the terrace use area | Lower machine is cropped; outdoor installation remains conditional |

The former slit sample at image x=646–675, y=22–84 is now uniform RGB [227, 226, 226]. The offline gallery preserves the original PNGs and compares the K7/K8 dining-kitchen frames using the identical complete recorded camera. Package file references, PNG integrity/dimensions and ZIP integrity are checked. A separate local browser inspection of the gallery was unavailable because the workspace has no Chromium executable; the actual eight WebGL frames were produced and reviewed from GitHub Actions.

The eight views retain the J1 recorded positions, targets and 58–63° fields of view. They are wide comparison views, not the separate calibrated 42° natural walk lens. The before/after hero must use the same complete recorded camera as K7. Bathroom views are partial views through entry openings; they do not provide complete fixture or installation assessment.

## Decisions still open

- Structural feasibility of the declared kitchen wall removal and bathroom opening study.
- Island water/drain routing, integrated dishwasher access and exact appliance selections; gas/hood extraction and MEP coordination.
- Terrace laundry weather protection, drainage, electrical provision and manufacturer suitability. This conditional study does not authorize outdoor relocation.
- Genuine remaining furniture/door approach and bedroom circulation issues. The saved A11.1 has a different layout and report; its results are not attributed to K8.
- Final cabinet joinery, fillers, ventilation gaps and countertop supports.

The review package includes unchanged PNGs, an offline Arabic gallery with a K7/K8 comparison, the frozen snapshot, per-view metadata, canonical audit and image hashes. It does not activate the candidate, publish the branch to the live app or merge into master.

To reproduce the package after inspection, use `design-development/k8/package_review.py` with the downloaded render directory, this review, the final audit, original K7 hero, and the pinned code/run identifiers.
