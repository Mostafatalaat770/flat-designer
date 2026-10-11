# M0 verification — 11 October 2026

Starting checkout: `integration/owner-review-gates-r1-20261010` at `f5ad15f37a25ca91b598810e195fcacc777d6600`. Initial tracked/untracked status was clean. The original `work` branch and reconciliation archives remain present. Session scratch is under `work/session-20261011`, excluded from this delivery commit by explicit staging.

The M0 addition changes no pre-existing source or application file. The production build generated an updated `dist/index.html`; after the checks its original HEAD bytes were restored because production changes are outside #69. `SOURCE_LOCK.json` verifies all **143 inherited canonical/source/snapshot/decision/design/evidence files** byte-for-byte, including the prior review PDF, saved-source v50 archive, current snapshot, all R4–R6 studies and the owner registry. No cloud read/write or approval-registry mutation was performed.

| Verification | Result and limit |
|---|---|
| `npm run build` | PASS; 13 rooms, 16 openings, original 2500mm ceiling and full-height living glazing |
| `npm run check` | PASS; five repository verifiers. Storage/provider checks use local SQLite/R2/DOM and mocked adapters; they do not prove live cloud behavior or produce WebGL photos |
| `npm run check:studio` | 17 tests PASS; zero failures/skips |
| `node --test --test-isolation=none --test-reporter=tap scripts/whole-home-m0.test.mjs studio/local/current-baseline.test.mjs studio/local/owner-decisions.test.mjs` | 20 tests PASS; 9 new M0 contracts + 11 existing baseline/approval contracts; zero failures/skips |
| Current-source extraction | 13 spaces, 50 furniture + 27 explicit interior records; exact JSON pointers, source dimensions/placement and host-derived model placement kept distinct |
| Existing model validation | 0 hard failures, **75 warnings retained**; nearest gaps, generic preferred thresholds and 125mm sampled paths are not as-built circulation or code proof |
| A15 continuity | All 65 historical K12 intents retained as functional research: **8 absent furniture anchors**, **5 changed furniture envelopes**, 9 canonical opening anchors and 43 other same-envelope/room-intent records. All locations remain `TBD_AS_BUILT` |
| Offline browser review | Chromium 151.0.7922.173; desktop 1440×1000 and mobile 390×844; all 13 cards/internal links work, kitchen detail has 15 rows, no page overflow, JS errors or external requests. Checked closed overview and expanded details; screenshots inspected directly |
| Reproducibility and preservation | Deterministic builder output, no inherited file hash change; `git diff --check` PASS |

The browser accepted the offline HTML through `setContent` because this environment's browser policy blocks `file://` navigation. Embedded SVG/content have no external asset dependency. External evidence links require normal authorized internet access. See [BROWSER_VALIDATION.json](BROWSER_VALIDATION.json) for observed DOM/viewport results. The table scrolls horizontally within its container on mobile.

The review **reuses**, and does not recapture, earlier reception/bathroom/Kitchen R4–R6 WebGL evidence. Their committed metadata and narratives are linked and preserved. This pass does not claim to have downloaded and revalidated every historical PNG, a measured material sample, actual human use, photometry or installed geometry. No generated imagery replaces source evidence.

Remote CI is separate. The new bounded `Whole-home M0 source inventory contracts` workflow verifies deterministic output and uploads this review when a runner is available. **Use Issue #69 / Draft PR #68 for the delivered exact-HEAD GitHub Actions status.** Do not infer remote PASS from these local results; inherited account/runner startup failures may prevent any test step from executing. No billing changes or manual reruns are authorized or performed.

Implementation acceptance for #69 is the source inventory and handoff. It does not close the site/construction release in #19 or choose an interior style in #71. NEXT is #70, using the existing current source, all 13 spaces and `a15_reanchor`; source-safe concepts and proof tags must carry forward.
