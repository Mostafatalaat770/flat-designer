# Advisor A2 — family dining, end preparation and the K12 kitchen

Status: **EXPLORATORY / NOT FOR CONSTRUCTION**. The canonical Type B architecture, the cloud Studio, all saved design variants, K12 working kitchen and the render-only opening overlay stay untouched. This is a reversible experiment, not a final apartment choice.

## What A2 actually tests

The K12 1700 × 1000 mm kitchen island has a genuine dry preparation rectangle approached from the **east short end**, while the sink stays accessible on the south working side. It is tempting to call that functional, but the modeled 600 × 600 mm standing person leaves only 465 mm of *horizontal* room to the existing dining-table edge; the 650 mm open dishwasher proxy reduces the opposite working route to ~570 mm. **These remain restricted situations, independently of any prettier render.**

The existing 6-seat K12 dining arrangement is compared with **two furniture-only, same-camera alternatives**:

| Candidate | Table | Move relative to K12 | Six chairs |
|---|---|---|---|
| K12 control | 2000 × 950 mm | None | Original ~700 mm pitch |
| A2.1 Compact six | 1800 × 900 mm | Dining group 350 mm south | ~600 mm pitch |
| A2.2 Original six shifted | 2000 × 950 mm | Dining group 350 mm south | Original ~700 mm pitch |

The source recipe is `scripts/prepare-advisor-a2.mjs`; rendered copies, measurements and manifests are generated **inside GitHub Actions**, never written to the cloud Studio. Camera objects are identical. Test results are produced directly from exact K12 geometry; conservative occupant envelopes are planning proxies, not building-code certification.

## How to decide

- Avoid green-lighting A2.1 solely for increasing the nominal table/island gap. **A person at the end still compromises circulation.**
- Preserve the original 2000 mm table if the family needs the larger dining surface and there is no measured practical reason to reduce it.
- Before committing to either, inspect **occupied chairs with bodies**, the main entry/guest-WC walking route, and tray/pan carrying from the kitchen. Measure dining-to-wall clearances and pulled-chair sweeps rather than just closed-footprint rectangles.
- Test the floor-cleaning and appliance-opening scenarios, not merely the still image.
- Reserve the dry-island alternative as **a service-and-space feasibility study** first. The current 1800 mm cooking wall cannot hold a 600 hob + 600 sink + 600 dishwasher and still offer meaningful side preparation/landing; the 1800 mm tall wall already holds fridge/oven/pantry. A strong dry-island proposal must present a viable relocation plan, accessible drain, electric/gas safety, appliance replacements and the lost storage before rendering.

## Current unresolved hard gates

The source K12 report has **152 PASS / 49 WARNING / 2 FAIL**; the two failed checks come from the render-only open-plan hypothesis crossing original kitchen/room/wall boundaries. This branch must preserve those failure categories, never suppress them or claim open-plan structural approval. Appliance SKUs, doors/hinges, island drainage, short duct discharge permissions, terrace washer climate suitability, site survey, cabinet inventory, product dimensions and costs remain **TBD**.

## Reproduce

```sh
npm ci
npm run build
node scripts/audit-advisor-01.mjs
node scripts/prepare-advisor-a2.mjs
# This produces design-development/advisor/a2/*.json locally.
# Rendering requires playwright/chromium:
RENDER_OUT_DIR=renders/dining-compact-six node scripts/render-snapshot.mjs design-development/advisor/a2/dining-compact-six.json
RENDER_OUT_DIR=renders/dining-shift-six node scripts/render-snapshot.mjs design-development/advisor/a2/dining-shift-six.json
```

GitHub Actions runs two review roles: **functional geometry** gates first, then **matched-camera visual evidence**. The artifact, not the PR description, is the evidence for final visual judgments. If the runner fails, no verdict is issued until the root cause is fixed.

**Default advisor position:** Keep K12 as a control. Use the experiments to expose trade-offs. Prefer comfortable owner/family daily workflows over island size, extra buffet furniture or an impressive rendering.
