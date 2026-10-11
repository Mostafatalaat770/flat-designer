# M1 verification — 11 October 2026

Input: latest Draft PR68 HEAD `37e88444761919cb8323e51039ed9201328b8e48`, same integration branch, clean starting tree. No saved cloud mutation, approval release, merge or deployment. M0 outputs are read as immutable source, not regenerated.

| Check | Result and scope |
|---|---|
| 65 historical A15 dispositions | PASS: 24 evidence reanchors, 38 room-level, 3 parked, 0 silent drops. Source split38/14/5/8 retained. Each original has evidence, use, operational review, measurement status and explicit links to coordinated or separately new intents. |
| Coverage | PASS: 13/13 spaces × all four services; 68 coordinated review zones. Current77 objects, exact source pointers, canonical13 polygons/16 openings/9 inferred hinges. P0 kitchen only. |
| Preservation | PASS: `SOURCE_LOCK.json` verifies751 pre-existing files byte-for-byte, including every M0 artifact, architecture, current/cloud provenance, approvals and prior evidence. One automation edit is separately before/after hashed: M0 verifier permits only the two exact owner-authored37e8844 continuity-doc hashes in addition to its original lock. No historical manifest/results rewritten. |
| Production build | PASS: `npm run build`; 13 rooms,16 openings,64 walls, source2.5m and full-height living glazing. Generated unrelated `dist/index.html` was restored to the exact starting HEAD after checks. |
| Application checks | PASS: `npm run check`, all five viewer/worker/cloud/interior/capture verifiers. These existing suites use local adapters/mocks as stated in their output; they are not live cloud or live building tests. |
| Studio | PASS: `npm run check:studio` (5 test files). Expanded TAP count17 tests via `node --test --test-isolation=none --test-reporter=tap studio/domain/browser.test.mjs studio/assets/*.test.mjs studio/renderer/*.test.mjs`. |
| Source and coordination contracts | PASS: M1 final14 tests; M0 existing9 tests; current-baseline/owner decisions11 tests. Final M1 includes window/threshold separation and no modeled terrace ceiling. 51 unique tests across the stated groups. |
| Offline browser | PASS: Chromium151.0.7922.173; desktop1440×1000 and mobile390×844. 130 layer/room/floor-option views,8 SVG downloads,0 requests,0 JS errors, no page overflow. All four standalone sheets have no text outside SVG bounds. Exact HTML hash in `BROWSER_VALIDATION.json`. |
| Visual review | PASS: all four sheets and selected mobile source crops inspected; Arabic anchor clipping corrected before delivery. [VISUAL_REVIEW.md](VISUAL_REVIEW.md) records design tradeoffs and limits; `visual-review/` contains actual final screenshots. |
| Diff/package | PASS: `git diff --check`; deterministic ZIP CRC/content SHA validation. `DELIVERY_SHA256.json` pins delivered files; ZIP hash is external in `PACKAGE_SHA256.txt`. |
| Remote CI | Local PASS does not imply GitHub Actions PASS. Exact delivery-commit remote run/runner/step evidence is reported in Issue70 and PR68 after push. Prior PR CI did not execute test steps. No CI/billing settings changed. |

R4 ivory / R5 D1 greige / R6 L2 task-light evidence, reception operating audits and master/family/guest bathroom studies remain linked and scope-labelled. No manufacturer comparisons added. K12 island, E2 oven column and H1 terrace washer are parked; only the real indoor niche supports a new possible washer function. That niche is not a modeled or installed washer.

Dashed use zones, whole-room lighting tint, wall-review bands and threshold highlights are design hypotheses. No electrical XYZ/height, cable/breaker sizes, lux, HVAC capacity, duct/pipe route, screed/fall/waterproofing performance or construction-ready fixture count is invented. Source furniture coordinates remain available only as source context. Geographic north and finished/operable clear widths are unknown. Terraces retain no modeled ceiling.

The inherited75 model warnings remain warnings, including entry operating conflicts and BR02's unproved grid route. Physical reach/door handing, wet/outdoor protection, façade permission, source service locations, condenser/shaft routes, loads and floor levels all remain `TBD_AS_BUILT` for qualified trade review through Issue19. Next handoff is Issue71 style research/moodboards using M0+M1; room reviews continue through72.

Reproduce: `node scripts/build-whole-home-m1.mjs`, then `node scripts/verify-whole-home-m1-browser.mjs` in a Chromium-capable environment. Browser uses offline setContent because file navigation is environment-blocked; delivered HTML contains no network dependency and supports normal offline opening.
