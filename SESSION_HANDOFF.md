# Circulation review handoff — 9 October 2026

Remote branch: `codex/v55-circulation-room1-20261009` in `Mostafatalaat770/flat-designer`. It starts from reconciled master `ec07fe90e402a8fdf7b359381fed64c3196312dd`. This branch preserves completed work without requiring a PR or promoting any design.

## Owner's coordination instruction

After every completed logical step, commit and push the working branch. Do this even when no PR exists. Use an isolated branch/worktree when sessions share a checkout, and verify the remote head after pushing. The durable instruction is in `AGENTS.md`.

Other sessions should fetch this branch before continuing the review and create their own worktree/branch from it. Do not use the original shared checkout's untracked copies as the source of truth. The complete proposals, verification and committed review evidence are on this branch.

## Completed work and current design decision

1. `design-development/circulation-v55/`: frozen 13-area, 31-scenario audit, six comparisons, Arabic report, saved-source inputs and portable verification.
2. `design-development/bedroom1-r1/`: first west-wall desk comparison, retained as historical. Closed-furniture routes pass, but a full-front 300 mm storage reserve disconnects a tested route. Do not select R1 as the final study.
3. `design-development/bedroom1-r4/`: preferred local study, scene `scene-a5c839c1`. West-wall desk 1100 × 600 mm; south-wall storage 800 × 350 × 1000 mm; wardrobe 120 mm north; bed retained. Storage outer volume equals the baseline; internal capacity is not established. Window frontage remains clear.
4. `design-development/bathroom-door-sequence/`: current v55 baseline full-cycle door study. Master 500 mm body: closed outside → open/enter → close/use → reverse to reopen/exit/close, found at 50/25 mm grids, independently checked. Guest 500 mm: entry found, closure/use continuation not found under the declared fully-open intermediate pose and reach assumptions. A basin stance 400 mm in front works with the leaf open, unlike the old 300 mm endpoint. This is a model comparison, not physical impossibility or site approval. Frozen source geometry, paths, portable interactive Arabic review and desktop/mobile evidence are committed.
5. Guest door comparison in the same folder: retain the existing 656.668 mm opening and study a north-hinge outward leaf as the preferred **conditional** option. It achieves the full 500 mm cycle at both grids, plus closed-door basin/toilet approach connectivity. The south-hinge inward overlay and baseline do not. Outward 550 mm works at 25 mm only. The wider exact bathroom/reception domain keeps baseline grid phase and checks nearby furniture. Fixed-angle reception routes farther from the swing survive; a near-leaf endpoint is blocked at 45°, and a chair-adjacent trial is blocked even closed. This does not prove safety with a moving second occupant. Overlays do not change the canonical model or active design. See `comparison-review.html`, `comparisons.json` and `evidence/comparisons-*`.
6. `design-development/kitchen-operation-v55/`: **current enclosed L kitchen**, not historical island studies. Sixteen fixed stages / 96 routes, four coupled fridge searches, independent path audits and 14 repository BFS comparisons. Routes cross the actual terrace threshold. Dishwasher open 600/650 mm alone admits passage; adding a 600 × 500 loading reserve disconnects it. Centred laundry loading overlaps the open terrace leaf; 150 mm east offset removes overlap but retains the passage blockage. Assumed under-hob oven + operator admits passage, but simultaneous open DW conflicts with that operator. Fridge east-side **in plan** admits opening/use/reversed closure at both grids; west-side does not under declared assumptions. Do not confuse plan east/west with manufacturer hinge left/right. Close appliances before other users pass; final manuals/poses remain unresolved. Arabic interactive review and source-matched browser evidence are preserved. No layout change.
7. `design-development/dining-operation-v55/`: preferred **local** candidate `table-north-150`, scene `scene-6681e65b`: table, six chairs and pendant 150 mm north, all sizes and 700 mm chair centre spacing retained. Its static validation has 0 fail; nominal 350/400/500 mm occupied pulls avoid furniture conflicts. Source 400 mm pull overlaps southeast chair/shoe storage. The alternative `end-inset-60`, scene `scene-4fb2b52b`, removes that overlap but reduces seat centres to 640 mm; it has five of six seat transfers with entry fully open, all six closed. North move has all six in either state at 25 mm. Direct northeast-serving endpoint is blocked near the sideboard corner after the north move; a declared 150 mm-west diagonal stance works. With six seated at 400 mm pull and entry closed, north-move main paths survive the conditional guest outward leaf at closed/45°/fully open on both grids. End-inset is grid-sensitive fully open; the guest approach endpoint is blocked at 45° in both. Four coupled entrance-closure cases pass. Frozen 120 stage routes / 24 seat-transfer cases / 60 combined-door queries, proposals/snapshots/briefs, Arabic review and browser evidence are preserved. These fixed body/door states do not certify comfort, actual sitting or simultaneous moving-door/occupant safety.

8. `design-development/unified-furnishing-v55/`: combined **local** candidate `scene-c9c055c1`, bedroom R4 + dining north 150. Composition was checkpointed remotely as `f2d8cdb`. Twelve distinct-object updates commute exactly in either component order; complete proposal/snapshot/brief and component hashes are preserved. Static validation: 186 pass / 74 warning / 0 fail. Unrelated contents, architecture and enclosed kitchen are unchanged. Connected circulation now preserves **266 queries: seven fixed states × 19 destinations × 25/50 mm grids** from 600 mm inside reception. Closed/occupied-dining candidate states reach 18 destinations on both grids; the ensuite shower needs the separate entry/closure/use sequence. Open 350 mm bedroom storage retains bed/wardrobe/storage access but blocks the chosen desk approach. Desk occupation is a separate state. Dishwasher loading disconnects the service terrace; other normally connected destinations retain routes. Conditional guest outward leaf with entrance closed retains tested routes, without changing the proposal. All 240 found paths are independently audited at ≤5 mm spacing; four whole-floor cases agree with repository BFS. The exact canonical room/180 mm internal-threshold union is checked at 262,169 samples; internal glazing passages assume full drawn width, not actual sash clearance. A standalone Arabic whole-plan/focus review, frozen geometry, browser evidence and eight unresolved measured-fit groups are preserved. Actual measurement fields are null.

9. `design-development/appliance-selection-v55/`: owner explicitly confirmed **models remain unselected**. Arabic selection card plus structured source-derived reservations/manual requests preserve this decision. Fridge body is a 650 × 650 placeholder; its model-to-end-panel gap is 2 mm, which is not manufacturer-approved hinge/ventilation clearance. Dishwasher/washer are 600 × 610 module reservations with actual height/niche/connection dimensions null. Oven is assumed under-hob without a separate measured niche; hob 600 × 400 is not a worktop cutout. No product, market, budget or purchase approval is recorded. Owner has been asked for buying location and budget before real model shortlisting. Frozen source/candidate geometry and earlier evidence are retained unchanged.

R4 has 187 pass / 74 warning / 0 fail, no floor-furniture collisions, 12 passing core route checks, 24 passing door/occupation checks and 16 passing checks with 300/350 mm full-front storage reserves. The storage-opening and desk-occupation scenarios are separate; return the chair to its normal position before using the modeled full storage opening. A 500 mm circle and inferred door hinges remain nominal planning assumptions, not comfortable circulation or site certification.

The canonical architecture is unchanged. `render-snapshots/current.json` remains the v55 review source `scene-9cf45a73`, derived from saved cloud `scene-4821689`, storage 55. The active source, saved cloud design and deployment settings are not changed by this checkpoint branch.

## Reproduce and continue

```sh
npm ci
npm run build
node design-development/circulation-v55/verify.mjs
node design-development/bedroom1-r1/verify.mjs
node design-development/bedroom1-r4/verify.mjs
node design-development/bedroom1-r4/verify-comparisons.mjs
node design-development/bathroom-door-sequence/verify.mjs
node design-development/bathroom-door-sequence/verify-comparisons.mjs
node design-development/kitchen-operation-v55/verify.mjs
node design-development/dining-operation-v55/verify.mjs
node design-development/unified-furnishing-v55/compose.mjs
node design-development/unified-furnishing-v55/verify.mjs
node design-development/appliance-selection-v55/build.mjs
node design-development/bedroom-review.mjs verify-evidence bedroom1-r1
node design-development/bedroom-review.mjs verify-evidence bedroom1-r4
node design-development/bedroom-review.mjs prepare bedroom1-r4
python3 local-qa/serve.py --port 4174
```

The standalone Arabic review files and committed images work without generated renderer bundles. The local viewer is served at `/_qa/bedroom1-r4/`. Browser capture/check commands and dependency setup are documented in each study's README; original evidence hashes and exact layouts/cameras are checked separately from regenerated captures.

**Owner steering supersedes appliance-shortlisting focus:** use standard generic placeholders and prioritize an outstanding aesthetic, spatial and decorative apartment design. Do not ask for appliance models, buying location or budget as a dependency of this review; earlier selection cards remain historical implementation references. The new direction is recorded in `AGENTS.md` and `aesthetic-v55/OWNER_DIRECTION_AR.md`.

Next design task: source-matched visual review and a coherent local interior proposal from `scene-c9c055c1`, across entry/living/dining/kitchen/bedrooms/bathrooms. Review furniture proportions, restrained material hierarchy, focal walls, lighting and room-to-room harmony while retaining meaningful nominal circulation checks. Real product/site details are later implementation work. Keep guest outward leaf a separately labeled conditional overlay; do not promote it to canonical architecture. Do not inherit historical unapproved widened/pocket-door or island studies or replace the active/cloud design from this review. Commit/push each completed step and verify the remote branch head before handoff.
