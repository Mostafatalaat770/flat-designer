# Type B · one whole-home architectural jury study / Issue72

Continue directly from `6fa75864b21e25f2a157c04122df34b1a59cd784` and tag `type-b-m3-group5-review-20261012`. This is one provisional combined source-ID scenario, one Arabic offline owner book, one room-by-room storage ledger and one52-HOLD dependency register. Existing roadmap41 and construction gate19 remain separate. The source architecture and all five inherited room packages are preserved.

Open `Owner-Review.html` directly in an ordinary browser, or extract `Type-B-M3-Whole-Home-Jury-Owner-Review.zip` and open its HTML. Images, plans, filters, day/night controls and the owner inventory worksheet are embedded; no server or external assets are needed. Export inventoryCSV before closing the page: the worksheet does not save a cloud scene or persist personal inventory automatically.

## Jury verdict

The shared warm-oak/ivory/stone vocabulary and softer A master language are promising. B2 public circulation is the strongest functional result. B office/WIC and two-seat main terrace remain conditional leads. The combined kitchen→service route fails during dishwasher unloading. A focused reversible use sequence closes fronts and parks a600mm user away from the service leaf; the sampled clash disappears, but simultaneous use and installed comfort are not established.

The family shower's2×290 zero-offset fold has coincident panels at full fold and fails600mm occupied states31/91; it is **not a selected buildable mechanism**. BR01's300mm side band remains narrow. Reception buffet,BR02 wardrobe and both bedroom chests lose storage width. Actual usable storage total and residual shortage remain **UNKNOWN**. Owner inventory can reject these joinery choices.

## One actual scene

`SCENARIO.json` is reconciled by original object identity and field deltas. It retains77 original identities and adds8 bounded reversible furniture/artwork objects, with separate explicitly recorded bathroom/outdoor concept proxies. It uses B2 reception, measured A master, B BR01/BR02/WIC, B bathroom direction/source800mm master shower, kitchenA finishes/closed uppers with conditionalB drawer, mainA/master one seat and serviceB tower. Material ID collision `m3g2-wood` is namespaced; shared dry-room floor and wood tone are explicit choices. Kitchen R5D1 affects only its two original leaves. Other source doors remain visibly unresolved.

`RECONCILIATION.json`, `EXACT_CHANGES.json` and `PROPOSAL_AUDIT.json` expose selected and excluded deltas, source hashes and seventeen delivered option records. Original decor saves, source scenes, wet service centres, wall/opening geometry and2500mm interior ceiling are untouched. No terrace ceiling or architecture cut is introduced.

`frames/` contains26 unedited genuine1280×720 Three.js canvases from this combined scenario, including five adjacent-space views and six matched day/night pairs. Each has snapshot/layout/camera/driver/PNG identities and actual source-mesh diagnostics. All64 wall meshes and10 indoor ceiling meshes match the inherited genuine SOURCE WebGL capture exactly. The four original room images in the book are labelled supporting evidence and never claimed as a combined scene.

`provenance/` retains the first six captures, original capture driver and scenario. Final review corrected the neutral mirror proxy, assigned explicit public ivory paint, and added the seated living camera. Material/renderer roughness and repeated procedural art remain visual limitations; the book critiques them instead of claiming photoreal product proof. Generic source furniture, concept bowls, front divisions and portable lamps are not manufacturer CAD.

## Operations, storage and decisions

- `OPERATIONS.json`, `PUBLIC_OPERATIONS.json`, `BATH_OPERATIONS.json` and `TERRACE_OPERATIONS.json`: actual combined circular/polygon envelope tests,40mm source leaf samples,50/25mm cross-room sensitivity and25/20mm terrace states. Some600mm results disagree across grids and are inconclusive. Routes, body boxes and tested endpoints do not certify a real threshold, tray, articulated user, accessibility, code or comfort.
- `MEP_REACH_REGISTER.json`: all68 currentM1 functional intentions retained;29 have changed spatial anchors, with explicit furniture-mesh service warnings. No invented installationXY, switch reach, lux, circuit/cable size, AC rating, drain/fall or supplier fit.
- `STORAGE_LEDGER.json`: thirteen rooms,31 unique storage allocations; source/provisional outer dimensions, exact width reductions, assumed internal deductions, unallocated reserves and inventory gaps. Verified physical cabinet interiors and all net totals remainUNKNOWN. WIC shelves are not double credited; kitchen/terraces do not compensate bedrooms/reception.
- `DECISION_REGISTER.json`: all52 original IDs, statuses and complete source texts retained, plus30P0/19P1/3P2 priorities, dependencies and efficient visit groups. `DECISION_BOARD.json` separates study recommendations, owner choices, surveys, vendors, professionals and rejected alternatives.
- `OWNER_INVENTORY.json` / `Owner-Inventory.csv`:28 household inventory rows. Each physical item must receive one storage identity; shortage remains visible.

## Reproduce locally

Use the locked dependencies, local Chromium and environment-provided Playwright. Run only local commands, never Actions or deployment. A fresh ordinary checkout may need Playwright installed locally.

```sh
npm ci
npm run build
node studio/local/workspace-data.mjs
node studio/build-domain.mjs
mkdir -p dist/m3assets dist/m3g3assets work/jury
cp design-development/whole-home-m3/group1b/m3assets/*.png dist/m3assets/
cp design-development/whole-home-m3/group3/textures/*.png dist/m3g3assets/
node scripts/jury-build.mjs
node scripts/jury-operations.mjs
node scripts/jury-terraces.mjs
python3 scripts/jury-registers.py
# PLAN_INPUT.json is a saved exact source-domain resolution; regenerate only from this scenario.
python3 scripts/jury-plans.py
JURY_RENDER_CONCURRENCY=2 node scripts/jury-render.mjs
npm run check
npm run studio:build
node --test studio/domain/apartment.test.mjs studio/analysis/*.test.mjs studio/local/owner-decisions.test.mjs studio/local/current-baseline.test.mjs studio/assets/*.test.mjs studio/renderer/*.test.mjs studio/domain/browser.test.mjs
python3 scripts/jury-verify.py
python3 scripts/jury-report.py
node scripts/jury-browser.mjs
python3 scripts/jury-package.py
```

The verifier requires inherited tracked files to retain their checkpoint blobs. Generated cache differences must be examined and restored before delivery, never accepted silently. Capture subsets are iteration only; final validation requires all26 exact scenario cameras. Source/cloud persistence is removed and the capture CSP forbids network connections.

Local app/provider contract fixtures are distinguished from genuine WebGL. The managed browser policy blocks `file://` navigation; browser tests therefore load the **exact local HTML bytes** with `setContent`, checking embedded images and zero network requests. Normal user-browser file opening is not claimed as a tested platform action. Initial default-sandbox local-socket checks/capture timeouts were recovered with scoped local network permission and a longer page-load timeout; final results are recorded separately.

## Release boundary

PR68 remains Draft at `8b91b69e861fabe4c292502b66af8dd2140d456d`. Group3/4/5 and this detached jury study are not in its branch diff. Any review tag is conditional on fresh live refs, source/default workflow triggers and unchanged Vercel evidence; actual post-publication checks must be recorded. No branch push, Actions dispatch, Vercel deploy, merge, settings/billing change, purchase or cloud save. Existing72/M3 stay open for owner review and unresolved decisions;19 retains professional construction release.
