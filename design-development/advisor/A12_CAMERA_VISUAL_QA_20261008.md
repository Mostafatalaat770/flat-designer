# A12 verified-render camera and usability review — 8 October 2026

**Source:** exact canonical Type B v0.2.2 SHA `734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658`; original scene `scene-e2fcb932`; +150mm variant `scene-1de233ed`. No cloud Studio or master update.

## CI artifact evidence

[A12 run 37772347587](https://github.com/Mostafatalaat770/flat-designer/actions/runs/37772347587) BOTH geometry and real-WebGL CI jobs PASSED. Artifact **11547449594** `advisor-a12-kitchen-dining-real-visuals`: 6 exact PNGs, 2 variants × 3 matched camera IDs, manifest `ApartmentGitHubRenderManifest/1`, zero pending image assets or fallback textures.

- `J1-dining-kitchen`, 1280×720, camera position `[6.35, 1.68, 2.8]`, target `[3.55, 1.3, 1.35]`, FOV61.
- `J1-living-kitchen`, 1280×720, position `[4.85, 1.67, 0.55]`, target `[3.25, 1.22, 1.45]`, FOV62.
- `K10-island-working-front`, 1600×857, position `[5.432291,1.7,3.2343415]`, target `[3.732291,0.2,1.2843415]`, FOV42.

Each camera (including aspect, viewport and target) matches exactly across both variants, with canonical SHA + scene revision provenance.

## Human visual inspection

The full kitchen and island finishes are consistent between variants: no accidental change to hob/wall run, tall units, sink position relative to island, lounge sofa/chair, 2500mm ceiling nor glazing apparent in these three controlled camera views. The +150mm island northward movement is visually modest; a more generous dishwasher-side aisle is primarily a *measured functional advantage*, not a striking change in a photogenic still.

**Critical visual QA fail for decision coverage:** all three views focus on the kitchen and lounge. They DO **NOT** show all six chairs and the 2000×950mm table in a way that can validate the prep-end-to-dining-chair pinch, seat spacing or use with occupants. **A12 image-integrity PASS ≠ six-seat dining visual PASS.** Do not use this artifact to approve A13 seat positions.

## Corrective action

[Child A13 PR #29](https://github.com/Mostafatalaat770/flat-designer/pull/29) now creates **three deliberate 42°/1.70m eye-height source-valid dining-focused camera views** from stable model space:

1. Original known QA `living-to-dining` room camera: plan position [10800,3350] looking toward [14200,7950].
2. Original known QA `dining-eye`: [13250,9440] toward [14400,7600].
3. New `dining-to-island-end`: [15050,9350] toward [12900,6450].

All coordinates are transformed using canonical model width/depth to world metres. A13 compares exact same 2000×950 six-seat dining, wet island +150 in both, with left/right endpoint chair inset **0 vs75mm**, using identical camera fixtures; it must pass real PNG/frame tests before any dining visual verdict.

## Pending release gates

As with all K12 studies, the open kitchen wall overlay still inherits two canonical architecture FAILs. Wet-island drain fall, hot/cold/gas/hood/extract/electrical routes, actual floor finish/room widths, exact DW hinge and six occupied chair/plate transfer remain unverified. No construction or purchasing approval, and no changes to `master` or saved Studio.

**Result: kitchen visual comparison VERIFIED, dining visual adequacy REJECTED FOR A12, corrected targeted capture queued in A13.**
