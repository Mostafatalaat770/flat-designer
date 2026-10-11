# Type B · Kitchen joinery and family storage · R3

**Source-locked Option A/P0, not fabrication.** Reviewed A/P0 `scene-9e86635b` SHA256 `017a76a5fc6d5ff0e90f1adb10140c7098e3c2cc3e86d18e7a0b0c0fd439ec2a`; canonical Type B `734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658`, cloud scene-4821689 v55. The P0 enclosed door/walls and 2500mm net ceiling are unchanged.

## Geometry finding that changes drawer design

The current WEST cooking counter (`starter-20`) is nominal **1500 × 600mm**, rotated 270°, Y=8038 with long-axis range **7288–8788**. Its modeled 600mm gas hob (`starter-22`) is centered Y=7895 with range **7595–8195**. Hence **307 + 600 + 593 = 1500mm**, not two 600mm drawer bays. These are intervals along a modeled cooking counter, NOT physical cabinetry apertures.

| Actual source interval | Length | Proposed use (conditional only) |
|---|---:|---|
| North corner/washer end | **307mm** | 200–240mm narrow pullout for utensils/spices **if** corner door, heat/hood and washer/maintenance allow |
| Gas hob / conditional oven | **600mm** | Reserve for selected hob+oven, shielding, gas, access. **Do not count as general storage** |
| South service end | **593mm** | Try 450–500mm full-extension deep drawer for pans/large daily plates **if** construction clear width, door sweeps and operator allow |

**Lead:** Test the south base-drawer concept first, not an unworkable 600mm side-by-side drawer; retain source north upper 1800×330×700 for cups/light bowls. **Fallback:** the 2000×400×800 dining buffet may hold occasional dishes, but six dining users and unloading from the dishwasher must be rehearsed. Upper depth 350/360 is merely a secondary sample-dependent option, not yet modeled in the geometry.

## Keep these functions with the units that actually exist

- North kitchen upper 1800×330×700: cups, small bowls, glasses and lightweight stock. West uppers 300/450×330×700: tea, light dry groceries when hood/heat/reach are checked.
- Corner model 600×590: rare pots only after real hinged corner/usable tray dimensions. Sink base 600×610: trap/waste/cleaning, not dry food storage.
- Original dishwasher/washer model boxes each 600×610, neither counts as cupboard capacity. Actual integrated Bosch DW needs *600mm FINISHED CLEAR*, door/rack and human working room not validated.
- Fridge model envelope 650×650. The model shallow landing 600×410 is just a temporary counter, not a confirmed espresso-machine power station.
- Buffet 2000×400×800: linens, servingware and occasional heavier dishes; test when all six chairs pulled out and buffet open.

DW→west cooking counter straight-line model centers **1591mm** and DW→buffet straight-line model centers **5690mm** — NOT walking or simultaneous-use clearances.

## Eight trade/owner HOLD gates

1. West-run actual finished widths, selected oven/hob and gas/fire/vent clearance; certified maker cutouts.
2. 593mm south interval: actual drawer fabrication clear width, height, depth, handles and full-extension operator access.
3. 307mm north interval: corner hinge/pullout, heat, washer maintenance and cleaning.
4. Owner family real pans/plates/food item dimensions and counts — no invented capacity or fully packed tray proof.
5. DW **600mm finished clear niche**, real dishwasher basket plus person, original entry, fridge, washer and terrace/service doors.
6. West uppers 300+450 against extractor/vent and real reach/wall fixing.
7. Real ivory/oak/limestone samples under daylight and 3000K; washability, sealing, serviceable simple fronts.
8. Mockup of six chairs, buffet doors and kitchen-to-table tray operation in original P0.

## Evidence

New `scripts/verify-p0-joinery-r3.mjs` calculates the model segmentation and verifies all source IDs, sizes, original snapshot SHA and the six owner registry approval flags FALSE. GitHub Actions workflow will run this verifier once a runner can start; until then the latest repo code does **NOT** have CI PASS.

Offline R3 companion ZIP shared in conversation provides original WebGL kitchen images and validated SHA manifest, mathematically proportioned 307/600/593 drawing, accurate top-down kitchen furniture footprint, JSON provenance and eight site requests. Not shop drawings; no source geometry edits.
