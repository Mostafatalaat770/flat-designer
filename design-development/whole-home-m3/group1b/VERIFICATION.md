# M3 Group 1B — measured model evidence and limits

## Source and preservation

Baseline commit: `673708eaeec8f2f036a2941a3412e67a9eff7d07`. Canonical Type B SHA256 `734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658`. Current review snapshot SHA256 `ec05e4fe7c0e15b3555107da4ac5628894df7fcddb3cee996d3af2fddaa7df63`, scene `9cf45a73`, saved-origin scene `4821689`, storage55.13 spaces,77 source identities,2500mm ceiling. Old Group1's single extra artwork identity is retained, with no new object IDs.

**907 of909 inherited tracked files remain byte-identical; every inherited snapshot/package/PNG/plan is unchanged.** The two explicit non-snapshot exceptions are:

1. `design-development/WHOLE_HOME_MASTER_PLAN.md`: one owner-direction insertion, preserving all original text, records the explicit instruction to optimize the model and prepare bedrooms independently while Group1 physical gates stay open.
2. `dist/index.html`: regenerate the previously stale compiled viewer from byte-identical application sources. Retaining the stale baseline cache made the local viewer verifier fail on the already-existing `applyKitchenDoorFinishExperiment`. Rebuilding restores the current source's existing behavior and all five application verifiers PASS; no app feature/source or canonical edit, deployment or cloud save. The capture records' built-viewer SHA256 matches the regenerated cache.

[PRESERVATION.json](PRESERVATION.json) checks all909 baseline Git blobs. Canonical/current/cloud, M0/M1/M2, old Group1, #62–#67, bathroom/kitchen source and owner registry remain unchanged. No owner/construction/procurement/cloud approval is enabled. No architecture or service position/setting edits.

## Local results

| Check | Actual local result |
|---|---|
| Production `npm run build` |PASS |
| `npm run check` |PASS, all5 application verifiers |
| New Group1B evidence/geometry/preservation tests |PASS,8 tests |
| Existing apartment-domain and reception-operating suites |PASS, both test entrypoints |
| Genuine Three.js r160 / Chromium SwiftShader |24/24 current PNG captures; no asset fallbacks, errors, pending assets or external requests |
| Matched cameras |six camera hashes, each identical across B/A/B1/B2 |
| Offline owner review |PASS,78 desktop/mobile states;24 decoded PNGs+7 SVGs; zoom/Escape/close; no horizontal overflow/errors/requests |
| SVG bounds |PASS, all8 new plans including Group2 source preparation |
| Archive |CRC/content hashes/embedded HTML identity verified by packaging script; exact size/SHA in PACKAGE.json |

Logs are under [local-validation/](local-validation/). GitHub Actions were **not run intentionally**; commit uses `[skip ci]`. These are local results, not remote CI PASS. No workflow, billing or check-policy change, merge or deployment.

## Operating evidence

The recorded operating matrix asks512 route questions across four layouts, including the individual/all-six standing cases. Additional seat-access/entry/service tests are retained separately. Chair pullback200/450, shoe opening100/200/300/400 (plus B2 nominal slider0), buffet500 operating panel, simultaneous600×600 users and six seated/standing bodies are explicit geometry. Source fully open leaves and450×350 outside curtain stacks are obstacles. Routes use conservative4-neighbour50mm-grid circular envelopes, adding35.36mm radial cell padding; worst-case25mm runs also converge. Two ordinary single-goal solver status/distance crosschecks per layout (eight total) match the cached multi-goal implementation. Neither nearest-point gap nor one successful path proves comfort, bodily motion, handling bags/trays, code or wheelchair access.

The exact inherited legacy test is replayed separately: existing B finds500 at opening200 but fails700; opening300/400 fails both. Existing A fails that legacy450 withdrawal test at all four openings. Both new proposals pass legacy500/700, but B1 only16/24 independent-standing700 questions and fails all-six-standing. B2 passes24/24 independent-standing questions and four destinations at all-six-standing both at slider0 and400 stress, with no added standing/user collision. Six500 rear-seat access routes pass for B1/B2 versus2/6 controls. Entry start remains inside the reception: no actual threshold traversal certification.

Table-only movement is rejected for new north-standing/buffet conflicts.90° table rotation is tested both at the old centre and correctly recentered: recentering removes139.6mm east-face overhang, but leaves210.8mm face bands and no500/700 route past the southern row. Six seats are preserved in both rejected studies. Plant placement was corrected to13300,4300 after the first larger-chair placement prevented700 routes to living/glazing. The260mm angled-shoe alternative was rejected for omitted realistic shoe height/retrieval; final B2 uses350mm flat shelves.

Curtains: **18 profiles per layout**, inside/outside × span250/350/450 × projection150/250/350;72 layout-profile cases total. Old B overlaps4/18, A/B1/B2 zero. The old B350×250 outside stack intersects about39.3×72.6mm, largest450×350 about139.3×172.6mm. New buffet face distance477.4 leaves127.4 after350 projection. Three600×600 glazing access positions beyond the stack remain furniture-free. The largest inside stack reduces the nominal1885.3 opening to985.3 uncovered width; this is not the actual slider clear opening. Thin rendered panels are visual proxies, not the tested compressed stacks.

## Mesh comfort and service limits

All comfort dimensions derive from **actual captured Three.js meshes**, with stated ray heights and triangle collision queries. Sofa2880×990 stays in place; usable seat-depth rays are approximately549–583mm. New padded arms160mm wide with110mm flat crest at650mm improve support while reducing each cushion width862→835.3mm. Old B native lounge seat usable depth411–428mm at height420; the new850×850 proxy has592mm seat width,511–528mm ray depth and450mm seat height. A's fuller padded language is shown independently, not assumed physically comfortable.

Each layout has54 actual-table knee queries: six chairs × width400/500/600 × pull0/100/200. Four of six600mm eating zones intersect existing B/A supports; new two60×600 timber blades at±350 have no query intersections. Seat460 / tabletop750 / underside705 gives290mm top-to-seat and245mm underside-to-seat; chair pitch700. **Actual product stability, the620mm cantilever, foot/toe movement, upholstered compression and family sit/stand remain HOLD.** The visually heavy blade base is not an approved furniture product.

Nine TV eye points reduce worst off-normal angle32.94→21.42°, while conservative unchanged1230×80 screen rectangle remains about40.9mm from the assumed wall face without projecting beyond the console front. This is not a selected swivel mount, cable/plug allowance or glare validation. Night geometry is unchanged, with no lux calculation.

The unchanged AC mesh is production-derived at plan12367.9,1779.4; bottom2145/top2395 and105mm ceiling gap are model values. The daily coffee table overlaps the assumed600×900 floor-service zone in all four layouts. A conditional new service pose parks the same1200×600 coffee table at14300,8600, with dining chairs at eating position and cabinets closed. B/A parking collides with two chairs and is rejected. B1/B2 parking has zero static/floor-service overlaps; only B2 finds700 access **after parking**. Parking with chairs450 collides with two chairs, so dining withdrawal and service cannot coincide.

A499-pose25mm translation/2°rotation test finds zero collisions for the **table footprint alone** in B1/B2; minimum furniture gap is15mm. This does not establish workers' bodies, grasping, weight, ladder placement or filter removal. Physical handling approval is withheld explicitly, not hidden by the post-parking route. [SITE_HOLDS.json](SITE_HOLDS.json) names seven exact measurements/trials and all remain open. The prepared bedrooms/WIC baseline has20 unchanged original items and22 M1 intents; those independent studies do not depend on closing these Group1 gates.

## Independent visual inspection

All24 genuine frames were inspected, including matched control views and detailed B2 entry-storage, dining, seated-TV and night views; all eight SVGs and mobile owner review were checked. B2 gives the clearest arrival, separates daily shoes from dining and allows more curtain space. The buffet reduction weakens storage generosity, the enlarged lounge chair and paired timber blades look heavier, and the generic repeated wood/fabric still need a real material/furniture sample decision. One accent pillow and a bounded relocated plant keep the composition calmer. Recommendation: continue B2 as the functional base for owner study, keep A's upholstery qualities as a comfort reference, and keep all physical/owner gates open. No simulated result is described as a site measurement.
