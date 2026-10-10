# Implementation and verified image review

**Completed 10 October 2026. Recommendation: A Calm Contemporary; P1/F1 conditional, A/P0 fallback. No construction or procurement release.**

## Authoritative final capture

- Successful [GitHub Actions run 38044887863](https://github.com/Mostafatalaat770/flat-designer/actions/runs/38044887863), completed 10:42:12 UTC.
- [Original rendering artifact 11666963161](https://github.com/Mostafatalaat770/flat-designer/actions/runs/38044887863/artifacts/11666963161): `reception-sprint-AB-P0-P1-source-locked-WebGL` (43,572,740 bytes; 30-day retention).
- Render branch head: `c0f638e8c38be56da9f0c4dd23da2cd0079e6742`.
- Exact Actions checkout / PR test-merge SHA: **`eca99e1631730d874b06c0ec9d8644f0a07864a9`**, recorded by the CI-generated contract. This is distinct from the branch head.
- Master base remains `cfb7e8dee8621280c87121b6e60f7bb908b12695` (merged PR #61).
- Working source `render-snapshots/current.json`: **scene-9cf45a73**, bytes SHA-256 `ec05e4fe7c0e15b3555107da4ac5628894df7fcddb3cee996d3af2fddaa7df63`.
- Distinct saved cloud Studio identity: **scene-4821689, v55**. No save/activation/deployment performed.
- Original canonical Type B v0.2.2 bytes SHA-256: **`734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658`**. Original rooms/walls/glazing/doors and 2500mm ceiling preserved.
- Final A layout: **scene-9e86635b**; final B: **scene-a7da4c73**. Each style's P0/P1 shares its layout ID and differs by explicit architecture overlay SHA: P0 `74234e98afe7…`; conditional P1 `cbd5f4ed08d2…`.

The committed `source-contract.json` is the local generation template (`render_git_commit: null`). **Use the artifact's contract and frame metadata for exact capture provenance.** The final document/package commits do not change any rendered snapshot, audit, plan, camera, canonical input or capture implementation; package verification compares all four snapshot files, both audits and all six SVGs byte-for-byte against the reviewed artifact before release.

## Implementation and checks

The implementation adds a source-locked A/B style study, a common measured furniture correction, explicit human-use/door/front states, six dimensioned vector plans, four controlled style/topology snapshots, eight matched human-eye views per snapshot, PNG/metadata/hash verification, labelled sheets and an offline comparison. The production viewer, existing `render-variants.mjs` and source canonical architecture remain authoritative. The PDF exporter and final artifact packager provide a reviewable document and complete downloadable evidence without modifying the capture.

| Verification | Result |
| --- | --- |
| Build and shared viewer/worker/cloud/interior/capture contracts | PASS |
| Studio browser/assets/renderer tests | **17/17 PASS** |
| Current source/owner decision regression tests | **11/11 PASS** |
| New sprint source, camera-matrix, stale/historical rejection, six-person operating states and kitchen constraint tests | **5/5 PASS** (16 combined source/owner/sprint in final CI log) |
| Genuine production-viewer WebGL captures | **32/32 PASS**, 1280×720, one browser, 821,850ms batch |
| Captured snapshot/layout, original source, camera, scene revision, architecture overlay and canonical hashes | **32/32 PASS** |
| Assets finished without fallback substitution | **32/32**, pending 0 / fallbacks empty |
| Matched A/B/P0/P1 camera/settings equality; day/evening pose/lens equality | PASS |
| Native PNG hashes after artifact download; current four snapshots and both audit JSON files | PASS / exact bytes |
| Contact sheets and plans | **8 sheets / 6 SVGs**; scaled unretouched thumbnails, original PNG bytes retained separately |
| Offline HTML selectors and embedded PNG hashes | **32/32**, each displayed frame/caption/provenance matches original bytes |
| Offline plans / desktop / mobile / script errors | **6/6**, desktop+390px mobile PASS, 0 script errors, no page overflow |
| Six-page PDF | PASS: page count, final scene/check-out provenance and all six approval footers verified; page layout inspected |
| Working snapshot / decision registry / canonical diff from base | No changes |

`offline-review-validation.json` records the final browser/image-hash checks. The full package adds exact source bytes, the final narratives and PDF, provenance and a SHA-256 manifest. Original image/numerical files remain unchanged. See the final evidence delivery link in [PR #62](https://github.com/Mostafatalaat770/flat-designer/pull/62).

Meaningful corrections made before the final capture: exact model-extents camera conversion and a less-occluded living→dining viewpoint; transparent operating-state plan fills; the catalog furniture's visible colour field aligned with its semantic oak/walnut assignment; required CI runtime module environment; accurate scaled-thumbnail captions. Earlier successful runs 38042205057 and 38042424252 are **superseded** and are not the final finish selection evidence.

## Actual image inspection

All 32 final frames were visually inspected on the four complete variant sheets; full-size source views and the matched comparison sheets support the observations in [DESIGN_REVIEW.md](./DESIGN_REVIEW.md). A's clear dining volume, light buffet and muted olive lounge read more calmly. B's slender pendant gives a more explicit dining focal point, while its darker evening lounge needs lighting refinement. P1 visibly reveals the sink run; the identical work-run images correctly retain the same appliances/cabinets. Both retain the source TV console slats and original brown doors; real cleaning detail, undertones and light/glare need revision/mockups.

Original native frame identity table below: 16-character PNG SHA prefixes; full SHA, exact camera, layout and overlay are in each `renders/reception-sprint/<variant>/<view>.json`, manifest and `verification.json`.

| View | A/P0 PNG SHA prefix | B/P0 PNG SHA prefix |
| --- | --- | --- |
| entry-overview | ca2cfd44662ecae3 | bd3ecdb466aa8eca |
| living-to-dining | 35aff812c36b77bc | 4118385d4fa6da6a |
| dining-to-living | fef6378f19ed3794 | d843707b9219744e |
| wide-reception | c55cc729a3a6615e | 12a3ec962e4d0a43 |
| kitchen-relationship | a74f488e7dec518d | 63d536d5055b2b5a |
| kitchen-work | ac3b9ab3da8170f1 | a24327ac4ae6837b |
| wide-reception-evening | 2b0d070c2325861a | 172181ab605dc7ad |
| seated-tv | d0e6f0b6ffa2b5bd | 585b0138df6d2adb |

Conditional kitchen-relationship PNG prefixes: A/P1 **298cd2a62449cee7**; B/P1 **3ec9f7356ae76ff0**. These visibly differ from P0 and carry the conditional overlay hash. Some unaffected views legitimately have identical pixels between P0/P1; their metadata still records the different architecture overlay.

## Practical limits and release status

The useful improvement is the modeled removal of the source chair/shoe and entry-door/shoe-user collisions, not a blanket comfort pass. The smaller shoe cabinet loses 36% of its assumed box volume, six-pair capacity remains unverified, and the extreme pulled-chair/shoe-user gap is only 15mm. All 36 reception route sensitivities can pass while independent body/door conflicts still exist; this distinction is preserved in the reports.

Appliance front projections, adult envelopes, 2° sampled door leaves, 90mm wall-face assumptions and the grid route are declared proxies. Fridge door kinematics, handles, cabinet internals, real knees/feet, continuous motion and installed clear widths need product/site proof. The source polygon/partition line differs by 21.2mm; both are preserved. The optional under-hob oven study is only a translated assumed envelope, not an installed/moved appliance, and still conflicts with a washer user.

No physical six-person comfort, accessibility/code, usable food-storage total, photometric/solar glare, extraction/gas, wall-44/lintel/service route, floor buildup or manufactured joinery has been certified. [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md) records the concrete missing evidence. P1/F1 is a preferred design investigation only. P0 remains the fallback. The PR is unmerged; the production cloud source and owner's approval registry remain untouched.
