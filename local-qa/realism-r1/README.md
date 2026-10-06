# Realism R1 — exploratory material visualization and product footprint audit

Based on Reception A.3 `scene-2ad8493e`; candidate `scene-776b85c5`. Locked canonical SHA-256 remains `734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658`. This directory is a separate local iteration. No production writes or history overwrites.

Run `node local-qa/prepare-realism.mjs` from the repository to reproduce the validated layout and immutable render pages. It does not regenerate AI images or the separately assembled interactive preview/gallery. Existing loopback server: `python3 local-qa/serve.py`. R1 preview: `http://127.0.0.1:4174/_qa/realism-r1/studio.html`; review: `http://127.0.0.1:4174/_qa/realism-r1/review.html`.

The source screenshots establish model geometry and camera. AI images provide an EXPLORATORY interpretation of materials and craftsmanship; they are not measurable drawings, manufacturer CAD or certified exact product replicas. Manufacturer product names identify dimensional/design references, not procurement selections. No real material SKU, local supply, price or exact upholstery is claimed.

| Hypothesis | Change | Validation / observation | Decision |
|---|---|---|---|
| Coarse shapes affect perceived proportions even when plan scaling is correct. | Read actual Three.js bounding boxes in the local browser; save `mesh-audit.json`. | Sofa top approximately729 mm versus690 mm nominal reference; chair820 mm versus770 mm. Bounding boxes of tables/vanities include props/mirrors and must not be mistaken for worktop heights. | Keep discrepancy visible; exact manufacturer meshes and sitting ergonomics remain TBD. Do not claim photoreal images prove fit. |
| Real chairs require larger operating footprints. | All six dining chairs use Fiber Tube Base reference510x530 mm, preserving centres and3+3 arrangement. | Footprint area25.1% larger than450x480 placeholders.103 PASS /48 WARNING /0 FAIL. | Keep as spatial stress test and product-family reference. Upholstery, exact variant, pedestal knee room and pullout TBD. |
| Master bath was functionally incomplete. | Add600x460 closed vanity with D-Neo600x440x165 basin reference; orient master WC toward south wall and family WC toward east wall; family basin600x460 at north wall. | No hard overlap failures. A235 mm side gap between master fixtures is not the approach path;320/484 mm closest gaps remain family bath review constraints. Soil-stack/drain positions absent. | EXPLORATORY only; fixture plumbing/door operating space needs verification. No wall/opening/service-wall change. |
| Bathroom materials should form part of the apartment direction. | Warm ivory porcelain concept, pale oak closed storage, white ceramic and restrained chrome. | No SKU or slip rating invented. Natural42-degree standing views show compact scale. | Keep material direction; wet-area engineering TBD. |
| Images can explain finishing while retaining the model as authority. | Built-in imagegen edits local source screenshots; refine yellow living draft; remove invented dining spotlight. | Three distinct photographed concepts: family living, dining and ensuite detail. Camera/architectural edges checked visually; furniture detail differs intentionally within reference envelopes. Exterior view and mirror content are inferred. | Keep as EXPLORATORY visualizations, never exact geometry evidence. |

Eight local views, including seven repeatable screenshots and one sofa-seat view at1.10 m eye height. Standing Natural views use42 degrees and1.70 m. Wide ensuite uses60 degrees and is labelled overview. The saved seven-view Argent flow passes28 steps and all replay differences0.00%; seated view is separately captured, not part of that flow. Canonical hash validated during preparation. No app source was edited during R1; baseline suites from A.3 remain the last full repository run.

Generated PNGs and exact prompts are saved here. Built-in `image_gen.imagegen` was used, not CLI/API or the hosted screenshot renderer. `brief.json` contains the full portable local design export and reference catalog; `proposal.json` applies only against the A.3 revision.

Product sources, checked2026-10-04:
- Muuto Connect Soft: https://www.muuto.com/product/Connect-Soft-Modular-Sofa-3-Seater-Configurations
- Muuto Fiber Tube Base dimensions510x530x770 mm, seat460 mm: https://www.muuto.com/product/fiber-side-chair-tube-base-p3089/23216-whit_dkye/
- Duravit D-Neo2366600000 basin600x440x165 mm: https://la.pro.duravit.com/pro/content/homepage/productos/series/resumen/productos~402880943a1b6e1b013a1bd20b39003d.es-es.html?ncat=washbasins&nser=0998&product=6434569

Remaining issues: exact meshes/seat heights; some media-console props approach the TV image; sofa viewing angle varies by seat; kitchen/table clearances from A.3 persist; bathroom pipework and door swings inferred; gypsum void/HVAC feasibility TBD. Bedrooms, kitchen and guest WC furniture remain at the prior layout and are not represented as a completed realistic whole-apartment design.
