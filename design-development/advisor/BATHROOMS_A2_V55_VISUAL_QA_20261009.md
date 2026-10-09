# Bathrooms A2 · independent visual QA against saved cloud v55

**9 Oct 2026 · REPRODUCIBLE SOURCE-LOCKED DESIGN STUDY, NOT CONSTRUCTION SIGNOFF**

## Provenance and invariants

- Canonical **Type B v0.2.2** SHA `734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658`; partitions, openings, glazing and **2500 mm finished clear height** unchanged.
- Active cloud Studio `storage_revision=55`, `scene-4821689`; earlier A11.1 v50 variant remains available independently. v54 harmonized guest WC surfaces; v55 moved family cabinet to drier west-wall section, reduced to 520×170×420 mm with bottom at 1480 mm.
- Dedicated branch snapshot `render-snapshots/bathroom-a2-walkin-v55.json`, study scene `scene-9cf45a73`; sole additional candidate change relative to cloud v55 is **master fixture `BATHM-WALKIN-A1.variant="walk-in"`**, to render an open, flush *concept*. It is **not activated in the cloud** until matching Studio server/contract deployment. Built-in shower fixture `style` remains backward compatible.
- Latest [GitHub Actions #37925541489](https://github.com/Mostafatalaat770/flat-designer/actions/runs/37925541489): **PASS** build, geometry contract and domain tests, 4 real WebGL PNGs from unchanged canonical camera source convention; each render has matching source SHA, exact scene revision, camera metadata, no pending/fallback material assets. Artifact: `bathroom-a2-walkin-real-webgl-7774e506314e18152b7f1aa679d1417f0aedd5d0`.
- Verified scene camera door presentation now uses the canonical **CLOSED hinge angle** (-π/2 for OP-WIC-BATHM, 0 for OP-HALL-BATHC), not the earlier stale open-angle render. This does not approve changing real hinges or door hardware.

## Subjective visual review — still unresolved

| Scope | A2 result | Keep / revise |
|---|---|---|
| Master shower floor and wet area | True open floor without redundant prefab two-panel enclosure; separate fixed 600×2050mm clear splash screen shown. | **KEEP as concept**, but need 1:1 water splash/open-entry review; no slope or trap currently represented. |
| Master shower short dimension | Nominal **800 mm**, long dimension 1450 mm. | **REVIEW** — less than the ~914 mm NKBA recommended dimension; this is a design guideline, not Egyptian code. Trial 900 mm *with real hinge/screen and waterproofing* before accepting 800 mm. Door-swing collision warnings on a flush wet-floor proxy can overstate physical obstruction; a glass screen, however, must never block door. |
| Master presentation | Deep-eye view shows rain head and two surface-mounted shelves. Left door leaf remains near edge of frame; porcelain is flat and many fittings are proxy meshes. | **STYLE-ONLY / NOT PHOTO SIGNOFF**. Get better eye-level and wider full-room perspectives with real tile samples, grout, glass edges, fixtures and lamps. |
| Family 900×900 shower | Better water containment with a dedicated enclosure, but modeled as a high-profile tray and dark two-panel framed cubicle. | **REVIEW** low-profile serviceable tray vs site-engineer-verified low-threshold design. Avoid hard-to-clean deep tracks and maintenance-heavy hardware. |
| Family dry-side cabinet | Reduced volume and moved away from shower spray. It is now a 520×170×420mm closed floating store at +1480mm, fits canonical wall and avoids modeled door swing. | **KEEP position, REFINE joinery**: concealed/push latches or soft slender handle, rounded/softened edges, moisture-safe HPL/aluminum/approved cabinet finish, secure substrate blocking, verify reachable height. Generic WebGL box is not a chosen SKU. |
| Family use flow | Existing 657mm nominal hall door; WC and vanity unchanged. Conservative centre-target circulation metric is only ~20mm even without ground storage. | **HOLD**: that grid/proxy is NOT a real tape-measured width. Site-measure and test actual WC, shower entry, door sweep, vanity and person; reject a pretty render that fails daily use. |
| Guest WC | Saved v54 floor warm sand + one soft greige wall surface; slim 350×180mm basin preserved. | **KEEP understated**, verify faucet splash, storage for rolls and door handle/hinge at site. |

## Full build gates, in order

1. **Engineer/installer as-built walk-through:** measure *finished* room widths, the 678/657mm nominal bath doorway openings and actual leaf clearances; drain/soil pipe and extraction routes; safe entry, WC seat clearance and door arcs.
2. **Curbless feasibility:** structural floor/screed buildup survey, water-limited threshold detail, slope and linear drain capacity, continuous floor/wall waterproofing beyond open spray zone and test access. No cutting structural slab without engineer approval. If the system does not fit, use a technically sound low-threshold shower or other workable enclosure **rather than fake a seamless floor**.
3. **Water and moisture:** sample floor tiles for *certified wet-slip resistance* and cleaning; porcelain joints, sealant and membranes; shower hardware and safe glass certification; humidity-controlled ventilation exhausting outdoors.
4. **Lighting and joinery:** moisture-grade cabinet and anchors; mirror task light and low-glare ceiling light with electrician-approved wet zoning and protection; keep net 2.50m clear height.
5. **Final visual release:** document actual product models, 1:1 physical clearance/mockup and approved first-fix drawing, then matching-camera real render evidence. **Do not merge/deploy this PR or issue purchase instructions merely because CI passes.**

## References — reference guidance only, not Egyptian legal certification

- NKBA older accessible bathroom planning recommendations: https://media.nkba.org/uploads/2022/05/Bath-Planning-Guidelines.pdf
- Schluter curbless assembly/slopes/waterproofing coordination: https://www.schluter.com/schluter-us/en_US/curbless-shower-systems-and-solutions
- Full home first fix engineering draft: PR #31 (NOT READY FOR INSTALLATION)
