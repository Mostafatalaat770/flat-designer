# M2 local verification and visual critique — 11 October 2026

**Local result: PASS. Remote CI: GITHUB ACTIONS NOT EXECUTED (ACCOUNT MINUTES/BILLING), per the owner's latest #71 comment.** No CI success is inferred; no workflow was awaited/rerun, bypassed or repaired. PR #68 remains Draft.

## Executed local checks

| Check | Result / evidence |
|---|---|
| `npm ci --cache work/m2-session/npm-cache` | PASS; `npm-ci.log`. The default home cache was unwritable; an ordinary workspace cache solved setup. |
| `npm run build` | PASS; `build.log`. Generated viewer used for capture; inherited `dist/index.html` restored exactly. |
| `npm run check` | PASS; `check.log`: viewer, worker, cloud, interior, capture contracts. |
| `npm run check:studio` | PASS; `check-studio.log`, 5 test-file suites. |
| M0/M1 issue tests | PASS; `m0-m1-tests.log`, preserved earlier outcomes. |
| `node scripts/whole-home-m2.test.mjs` | PASS; 6 meaningful invariant tests: 39 schedules/13 rooms/77 IDs/68 M1 zones; geometry/approvals/MEP preservation and shape differences; attribution; 14 genuine camera captures; offline completeness; all 784 inherited file hashes. |
| Actual Playwright/Chromium/Three.js rendering | PASS; `RENDER_EVIDENCE.json` and `frames/*.json`, 14 original 1280×720 canvas PNGs. Cameras exactly equal saved source cameras; zero architectural overlays/hidden segments/door overrides; no texture fallbacks, page errors or external requests. |
| Offline desktop + mobile owner flow | PASS; `BROWSER_VERIFICATION.json`: 39 desktop + 39 mobile room/style states, all 3 boards, 4 three-way camera groups, floor comparison; no unloaded images, page errors, outside requests or page-wide mobile overflow. |
| ZIP | PASS; per-entry SHA256 manifest, CRC test and standalone HTML identity in `PACKAGE.json`. |

Logs are kept compact in `validation/`. Every original source remains a separate immutable record; new study JSONs are neither cloud saves nor approved revisions.

## Actual visual review

Reviewed all three boards, all four three-way camera groups, the controlled floor pair, source floor-map/room panel, desktop opening and mobile opening/BR-02/board captures. Review screenshots are in the local `work/m2-session/visual`; final WebGL PNGs and boards are in this portable package.

**A:** cocoon sofa, upholstered chairs, softer headboard, pale timber and organic art form a coherent comfort-first language. The mass is fuller than B under the same ceiling. Tight performance weave is a better daily-use starting point than coarse bouclé; pale fabric needs an actual cleaning/comfort trial. Use restrained fluting, not every cabinet.

**B:** the exposed sofa frame, open dining-chair backs, simplified artwork and platform/slatted headboard read visibly lighter. The actual renderer still uses an oval dining proxy; the rectangular furniture intention is shown honestly in the original board. B is the provisional whole-home lead for visual calm/storage and a 2.5 m ceiling. Its low seat and wooden arm can lose comfort for some users; A is the credible alternate, not a token second palette.

**C:** tailored sofa legs, walnut/cane dining and joinery, original earth-tone art and the public stone floor distinguish it from A. C has warmth and character but the denser cane detail and warmer surfaces can feel heavier. Use restrained earth accents, not terracotta everywhere. Nickel is the practical wet-area default; bronze stays a small dry accent. Pale stone tabletop is a concept sample; the native dining proxy reads as wood.

**Floors:** the first generic fallback texture obscured the wood/stone decision. Original seamless wood and stone sample textures made the controlled B pair legible without changing camera, furniture or lighting. The stone alternative changes reception/hall/kitchen assignments only; private rooms remain wood-look and wet/outdoor thresholds remain separate. The texture repeat/grout illustration is not a laying plan or product size. Floor feel, noise, slip, thickness and door levels need samples/site checks.

**Bedrooms:** exact same master camera shows the padded versus exposed/slatted headboard and different timber contrast; the room is not enlarged. Source camera includes walls/door/ceiling and is not a furniture catalogue angle. Other bedrooms/WIC have source floor envelopes and room-specific schedules; their fit is not certified by the master render. BR-02 grid=0 and chair rotation remain unresolved model/site questions.

**Bathrooms:** the saved master deep-eye camera proved door-obstructed and did not justify a useful finish comparison. Those exploratory frames were removed from delivery. The **saved family-entry camera** instead shows the original 900×900 shower, toilet, wall material and source dry cabinet in three styles. The frame visibly retains the original framed shower; it does not silently apply F1. Finish differences are restrained; accessory/material intentions are clearer in the boards/schedules. Glass opacity, safety, wet-slip rating, membrane, drainage and attachment safety cannot be assessed from the render.

**Board and mobile polish:** original boards combine furniture silhouettes, texture patterns, bed proportions, bathroom accessories, curtain layers, greenery and lighting, with a labeled source frame and attributed external links. A lamp/plant diagram overlap was corrected. Room/style selection and source/M1 drawers remain readable on 390 px mobile; wide material/comparison tables scroll within their own container. Printed SVG boards or browser zoom provide closer reading of detail labels.

## Preservation and limitations

`PRESERVATION.json` checks **784/784 pre-existing tracked files byte-for-byte** from `2826d5dc987f9455ffdbb1b22c5cf615a835ef61`. Canonical/source SHA, 13 polygons/2500 mm ceiling/full-height glazing, all 77 placements, saved snapshots, M0/M1, old studies, registry and approval flags are intact. Source studio HVAC/ceiling/light options and camera/door/hour settings remain identical. The theme hook changes isolated render appearance; it has no persistence/cloud adapter.

Third-party photographs were not downloaded into the deliverable. `REFERENCE_LINKS.json` records exact public 200-response URLs, verified titles and fetched-page hashes. Completion versus publication/award years are distinguished, including mnmt **2024** completion. Sources inspire details only: no copied skylights, circulation reconfiguration, arches, façade screens, roofs, courtyards or pools.

This is a stylized source-backed concept review. It does not approve exact furniture ergonomics/CAD, chemical cleaning performance, material SKUs, installed lamp form/photometry, circuits or capacities, HVAC loads, Egyptian code compliance or construction coordinates. The existing M1/site HOLDs remain available. All aesthetic directions and room recommendations are design preferences awaiting owner input.

**Handoff #72:** first develop entry/hall/six-seat reception as a small group, using B provisionally and A as a live alternate if the owner has not selected. Prioritize sofa trial, pulled chairs and entrance operations; then the existing bedroom/bath/terrace groups. #19 remains the separate site/professional construction release.
