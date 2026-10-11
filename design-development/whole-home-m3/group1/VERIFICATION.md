# M3 Group 1 · local evidence and design critique

11 October 2026. Baseline `42faaa195d81ffa1ec39e9cd30e1c0bcb1f818dd`, existing Draft PR #68 / parent #72. Only separate M3 Group 1 additions; every inherited Git blob is preserved.

## Final local results

| Verification | Result / practical limit |
|---|---|
| `npm run build` | PASS: original 13-space architecture, canonical geometry and production viewer/capture bundles |
| `npm run check` | PASS: all five application verifiers. Storage/cloud checks use local mock adapters; their fixture PNGs are not apartment renders |
| Workspace prerequisite + `npm run check:studio` | PASS: five file-level tests, domain/assets/bounds/walk-in checks |
| M0/M1/M2 + current-baseline/owner tests | PASS: 40 tests, zero skipped/failed |
| `node --test --test-isolation=none scripts/whole-home-m3-group1.test.mjs` | PASS: six tests covering all 847 inherited blobs, all source identities/private rooms/approval flags, retained operating failures, 12 frame hashes/cameras/mesh bounds, controlled floor variant and offline HTML |
| Actual WebGL | PASS: 12 production Three.js r160 canvases; exact input layout, camera, image and capture-script hashes; zero hidden/added architectural components or door overrides; zero asset fallbacks, external requests or page errors |
| Offline browser | PASS: desktop 1440×1000 and mobile 390×844, 24 comparison/plan/floor states, all 17 image/plan assets decode, zoom/Escape/close, no overflow/errors/network; all five SVG text bounds fit |
| ZIP | CRC and every content hash checked by `scripts/package-whole-home-m3.py`; HTML bytes equal the separately delivered standalone review. Exact size/hash in `PACKAGE.json` |
| GitHub CI | Not claimed. Owner forbids Actions use because minutes are exhausted; artifact commit uses `[skip ci]`. No workflow, billing, required-check policy, remote CI provider or rerun changes |

Final logs are in `validation/`. Standard application tests report mocked browser/provider results separately from the genuine Chromium/SwiftShader captures above. Local browser execution and the Git subprocess in the preservation test needed the managed environment's reviewed execution permission; no live cloud access was used.

The tracked `dist/index.html` is an inherited build. Application checks ran against the fresh production build; that viewer was copied to ignored `work/m3-session/built-viewer.html` for captures. The tracked historical build was then restored byte-for-byte before preservation tests. An initial overlapping check saw the temporary rebuilt file; the final source suite ran after restoration and passed. No inherited verifier or expected source hash was weakened.

## Visual inspection and corrections

All 12 final native PNGs were opened directly, not judged only from the review thumbnails. All five plans and desktop/mobile owner-review screenshots were inspected.

- Entry overview: source kitchen/WC leaf states remain visibly open. The six-seat group and plant/sideboard relationship are readable; the arrival mirror/shoe position is shown from the matched reverse camera and measured plan. The wide 72° entry lens shows relationships, not human visual comfort.
- Dining to living: B has a lighter frame, consistent pale joinery and padded arm caps. A has fuller upholstery and a physically supported lounge chair. An earlier A cocoon proxy looked unsupported; it was replaced inside the unchanged envelope. Sofa back cushions were advanced 85 mm for the illustrated usable-depth goal and all final frames recaptured; actual cushion compression and comfort require trial.
- Living to dining: rectangular B is calmer; oval A softens edges but its cylindrical table supports need knee tests, especially the central seats. A's native repeated base detailing and flowers are busier; retain restraint in the final furniture sample. Open-chair/standing bodies are intentionally shown on plans rather than faked into the beauty render.
- Seated TV: original split AC stays exposed above the screen. The wall has no added heavy enclosure; one sideboard artwork balances the separate dining wall. Glazing is close to the screen. No reflective screen simulation or true surveyed sun orientation supports a glare conclusion.
- Night comparison: chair/table edges and entry floor read in both frames; dark seating and large point-light shadow patterns remain. An earlier B linear emitter was inside its fixture body; the isolated capture hook puts it below the bar. Existing CCT/room brightness remain fixed. This corrects a renderer self-shadow, not a lux specification or night-route approval.
- Mirrors/materials/plant: the inherited metallic mirror rendered almost black headlessly; a clearly disclosed neutral, non-reflecting proxy replaces that shading in the isolated capture. Joinery now uses the assigned pale material rather than a darker fallback. Plant leaves were thinned; it remains schematic, not a botanical/product asset. Procedural wood grain can look banded and does not establish actual fluting or finish quality.
- Floors: two B-only matched pairs independently compare warm wood-look and public stone-look. Wood feels visually warmer and quieter; stone makes joints more present. Wear/slip/cleaning, sound, grout, floor build-up and thresholds are physical-sample decisions. Neither M1 option is overwritten.
- Plans/review: source door arcs, hallway mirror, six pulled chairs, independent rear-standing squares, opening fronts and users are visible. Fixed a source-plan caption that had initially repeated the proposed shoe dimensions; the final source plan correctly labels the original 900×280 envelope with unknown height/capacity. Arabic metric direction and responsive reading were corrected. All final text bounds and assets pass.

## Independent architectural judgment

B is the better provisional arrangement, not a completed comfortable entry. At 450 mm withdrawal and 200 mm assumed opening it yields 610 mm nearest polygon gap and a conservative 500 mm route; 700 mm fails. A yields 410 mm and both fail. At 300/400 mm assumed opening neither proposal passes either route and a rear-standing body overlaps the shoe user. Both have zero static hard failures and 75 warnings; these do not supersede operating failures.

Reject the first west-shoe trial because it reduced the tested WC approach band to 583.4 mm. The final shoe position is further east on the same south wall, away from that approach. The source WC opening remains only 656.7 mm nominal and needs survey. Previous #62–#67 collision/manufacturer evidence remains intact; M3's different source/user cases are not a retroactive clearance approval.

Reject a six-pair storage claim for two 520×180×390 TRONES-type modules: the #64 reference supports roughly four pairs total and lacks opening projection. Actual fixings, wall/skirting offsets and product bins are HOLD. Closed reserve storage elsewhere must be inventoried before accepting the reduced entry capacity.

B's buffet move creates another explicit tradeoff: north end 177.4 mm from the assumed inner glazing face, west edge 310.7 mm beyond the aperture end. Current rendered panels stay within the source aperture; real forward fabric bulk or rail extension may crowd the buffet. The curtain proxy has 311.4 mm/end at north glazing and 207.4 mm/end at terrace glazing. 250/350/450 mm are physical-stack questions, not certified installed envelopes. No original AC location, capacity or service access is altered or approved.

The hall's nominal 1207.4 mm falls to 1027.4 mm under assumed wall faces and 980.4 mm locally at the mirror. Source door handing opens into rooms; physical hinge/handle and simultaneous-user checks remain HOLD. The east dining strip is 320.4 mm, so it cannot be labeled a 500 mm bypass. The west projected width is 976.2 mm from the room polygon vs 997.4 mm from the actual wall segment: the 21.2 mm source discrepancy is retained for survey, not silently corrected.

## Reproduction and handoff

Build the production viewer first, copy it to `work/m3-session/built-viewer.html`, run the application checks, and restore only the generated tracked index to the pinned baseline before preservation checks. Run `scripts/build-whole-home-m3-group1.mjs`, `scripts/render-whole-home-m3-group1.mjs`, `scripts/build-whole-home-m3-review.mjs`, the M3 test command above, `scripts/verify-whole-home-m3-browser.mjs`, then `python3 scripts/package-whole-home-m3.py`. The asset builder stages the four supplied `m3assets/` texture samples in `dist/m3assets/`. Chromium is `/usr/bin/chromium`; no cloud storage adapter or browser network is enabled during capture/review.

Next is M3 Group 1B within existing #72: actual bin opening/mounting + entry/WC/hall measurements, full-size taped six-chair trial with six adults/bags/tray, then one localized reversible refinement if needed. Trial sofa/chairs, four-pair daily storage plus inventory of reserve, wood/stone floor samples, curtain stacks, AC/filter/drain and manual switches. No bedroom redesign yet. All owner, procurement, construction, electrical, structural, wet-service and cloud-save gates remain HOLD; #19 remains the professional site-release gate.
