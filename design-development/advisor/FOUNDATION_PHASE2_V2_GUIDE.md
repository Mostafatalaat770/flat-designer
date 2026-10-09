# Spatial Foundation v2 — Family movement & usable-storage research

**State:** experimental, type-safe numerical evidence from canonical-derived scenes, NOT construction approval. Current source apartment Type B v0.2.2 hash `734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658`. The preserved K12 reference scene is `scene-e2fcb932`. We have **not** promoted open-plan kitchen structure or changed the saved Studio / `master`.

## Reusable functions added
`studio/analysis/activity.mjs`
- `analyzeOccupancyTimeline`: explicitly named timeframes, any number of assumed disk-shaped occupants, simultaneous linear motion, stationary furniture/door polygons, and optional circular-person route requests around OTHER people.
- Calculates **exact closest approach between two linearly interpolated occupant centres** between keyframes. Legacy static checks would miss two people crossing halfway between frames.
- Models explicitly supplied door swing as many occupied positions from e.g. 0° to 90°, with a required *assumed or manufacturer* source. This deliberately treats an opening leaf sweep as occupied for hazard assessment, **not a photoreal hinge animation**.
- Samples body-vs-fixed-geometry on continuous-segment motion with a declared step. A `MODEL_CONFLICT` flags a test failure; a `NO_DETECTED_MODEL_CONFLICT` **does not** certify a usable or code-compliant route.

`studio/analysis/storage.mjs`
- `estimateCabinetNet`: explicitly subtracts wall, back, top/bottom, toe-kick and reserved depth from outer module dimensions. An upper-bound net **litre volume is not effective family capacity**.
- `auditCabinetAllocations`: checks actual width, depth, height of an item against a net compartment **and its opening aperture**. Rejects items that cannot fit through a sliding opening despite ample space inside. Computes one-type packing grid upper bounds, totals quantities, flags missing items and explicitly refuses to certify mixed storage.
- Requires a quoted source for each net bay; all missing hinge, drawer, door access or cabinet height data remain uncertain. A plausible envelope is not a manufacturer's approval.

`scripts/analyze-family-activity.mjs`
- Agent-friendly **declarative JSON case**: `room_id`, snapshot path, exact furniture IDs, time-indexed occupant positions and radii, explicit assumed door sweeps and route questions.
- Reference case: `design-development/advisor/cases/wic-two-person.json`.
- Writes machine-readable results to `review-evidence/foundation/wic-family-activity.json` while preserving original geometry and source IDs.

## Evidence used and what it does *not* prove
- Dressing WIC-01: the **same original** wardrobes `starter-4`/`starter-5`, closed-front gap **1335 mm** from image-calibrated Type B geometry.
- In the example, two entirely **hypothetical 175mm-radius people** follow crossing, uniformly timed straight-line paths. Start and finish are collision-free, but the analytically solved mid-interval proximity is a model collision. This prevents unsafe inference from endpoint-only simulations; actual bodies may move around each other.
- A second hypothetical **625mm hinged panel** is sampled through 90°. Its sweep interferes with a centrally located 150/175mm-radius person under the stated pivot assumption. Installed hardware and leaf opening may differ.
- K12 island rear storage estimates **564mm usable width × 359mm depth** are from `storage-allocation.json`, but sample **260mm shelf height**, **280mm dinner plate**, **245mm sliding clear opening** and **530mm hinged opening** are all illustrative. Sample plate cannot pass 245mm but may pass 530mm. This is an example demonstrating why net volume and access are separate, not a recommendation to order any particular cabinet.

## Commands
```bash
npm ci
npm run build
node --test studio/analysis/foundation.test.mjs
node --test studio/analysis/phase2.test.mjs
node scripts/foundation-phase2-reference.mjs
node scripts/analyze-family-activity.mjs design-development/advisor/cases/wic-two-person.json
```

## Decision workflow for next design agents
1. Identify canonical source and exact snapshot scene revision. Decide *which activity* we care about (washing dishes, serving table, getting dressed, walking to bathroom).
2. List exact room/furniture IDs and time-indexed conditions (door open, two people, occupied chair), with each dimension `VERIFIED`, `INFERRED`, `EXPLORATORY` or `TBD`.
3. Run this engine, and **distinguish geometry proxy warnings from site approvals**. Run more than one actor radius and movement timing as sensitivity tests instead of claiming a one-size-fits-all pass.
4. Check usability under an actual selected cabinet SKU, product manuals, user motion and completed-finish site dimensions. Ask qualified architect/MEP reviewer for irreversible changes.
5. Generate matched-camera comparisons only for candidate layouts that survived daily-use gates.

## Remaining development gates
- Advanced continuous actor-vs-open-door kinematics and nonlinear walking trajectories, with no false certainty.
- Full-room + room-to-room access testing (doors, step changes), movement of dining chairs as occupants stand up, and carrying trays/pans.
- Exact manufacturer cabinet internals and a real family inventory. Without those, packing remains a **plausible fit / definitely no fit** test, not a capacity declaration.
- Camera subject-visible preflight for the improved batch renderer, stronger variant/decision registry and production CI integration.
- Still required: site as-built survey, structural/developer approvals, the K12 separator’s two unresolved canonical hard failures, actual plumbing/AC/electrical drawings.

**No cloud Studio write, `master` merge, real person measurement claim, cost inference or construction authorization.**
