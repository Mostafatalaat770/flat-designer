# Current integration — 6 October 2026

Use the real GitHub integration branch `agent/local-studio-integration-20261006`, pinned to `scene-29d4aa6d` / source storage revision 39. The working Studio and review run on **4176**. A.7 and the earlier 4174 work remain historical evidence. See [INTEGRATION_20261006.md](INTEGRATION_20261006.md) for branch overlap decisions, current commands, checks and design observations. The following notes describe earlier milestones and are retained as history.

---

# Local Apartment Studio and visual QA

Durable checkout: `/Users/bonuz/Repos/flat-designer`. Initial isolated work and the current loopback server used `/private/tmp/flat-designer-work`; the complete project is preserved in the durable folder. Start with `http://127.0.0.1:4174/` for the isolated Studio, or `http://127.0.0.1:4174/_qa/gallery.html` for the comparison gallery. The server is loopback-only. API/MCP routes and production mutation methods are disconnected. The only accepted POST, /_qa/workspace-export, validates and stores an isolated local GLB/job. Account sync, polling and cloud autosave are removed from the local page; its browser drafts use a separate key per iteration. No production credentials are needed.

The historical root page seeds Reception A.3 from the real exported baseline, not starter furniture. Its isolated captures use immutable full layouts, canonical hash checks, collision-checked custom camera positions, 1.70 m eye height and 42° Natural FOV (60° only for named overview/paired views). Artwork is embedded as data; no remote renderer or texture host is needed. Screenshots are 1600 × 857 at DPR 1, using Chromium with Apple Metal. The source renderer remains the repository viewer.

```sh
cd /Users/bonuz/Repos/flat-designer
npm ci
npm run build
node local-qa/prepare.mjs pass3
python3 local-qa/serve.py
```

Use Node 24 or later for the SQLite QA adapter. The current environment uses Node 26. The canvas package is now pinned in the lockfile.

The dedicated CDP browser is on port 9222, profile `/private/tmp/flat-designer-local-qa/chrome-profile`; launch instructions are in that folder's `start-browser.sh`. Prefer an existing running Chromium device. Inspect with Argent before tapping; never derive tap coordinates from PNGs. The 3D Studio's Natural / Wide and Scale Check controls have been exercised in the real browser.

```sh
CODEX_PRIMARY_RUNTIME_NODE_MODULES="$PWD/node_modules" npm run check
sh local-qa/run-qa.sh
```

The reusable Argent flow opens eight local views and waits for a completed frame before snapshotting. Initial baseline creation and a subsequent 32-step replay passed; all eight comparisons reported 0.00% difference. Only intentionally approved visual changes should refresh baselines:

```sh
argent flow run reception-a3-local --device chromium-cdp-9222 --platform chromium --update-baselines
```

For another design iteration, copy the proposal and edit reversible furniture/material/overlay operations, keeping its base revision equal to the recovered baseline. Run `node local-qa/prepare.mjs NAME`. Every proposed layout is validated by the shared contract before pages are written. A rejected proposal writes `NAME-rejected.json`. Baseline, pass 1, pass 2 and pass 3 are preserved separately. `prepare.mjs` exports a full ApartmentDesignBrief, layout, validation and camera manifest. The private production export is required at `local-qa/private/production-baseline-brief.json`; it is already present here and excluded from Git. Generated captures/screenshots/reports are excluded from Git too.

See `DESIGN_LOG.md` for hypotheses, decisions, real/generic references and remaining circulation/product/HVAC limitations. The original Downloads source and unrelated mobile repository were not edited. Nothing has been deployed, pushed, or saved to production.


Current project review: `http://127.0.0.1:4174/_qa/project-dossier.html`. Coordinated interactive candidate: `/_qa/home-v4.html`, scene-dc971196, separately seeded browser key. Reception alternatives and three photoreal interpretations: `/_qa/project-studies-v2/index.html`. Latest kitchen/laundry: `/_qa/project-studies-v4/index.html`. V3 is retained as rejected access history. Generate v4 with `node local-qa/prepare-utility-v4.mjs`, then `node local-qa/prepare-home.mjs`. Immutable capture pages, scripts, validation, complete briefs, plans and camera manifests are preserved alongside images. See PROJECT_DOSSIER.md for the whole-apartment development register and source-backed product references.


Current coordinated candidate: **Family A.7**, scene-9e210720. Review `http://127.0.0.1:4174/_qa/project-studies-v7/index.html`; interactive page `/_qa/project-studies-v7/studio.html`. Before/intermediate comparison remains at `/_qa/project-studies-v6/index.html`.13 screenshots /52-step repeat passed with0.00% difference. Natural Walk42°, eye1.70m and Scale Check were checked again in the pipeline-generated Studio.

New studies should use the unified pipeline, rather than copying the historical prepare-*.mjs generators:

```sh
npm run study -- local-qa/studies/family-a7.json
npm run check:study
```

All cameras validate before output; bad views are not silently skipped. Changed scenes require new version folders. The command generates pages/data/plans, not PNG screenshots; then run the corresponding saved Argent flow and inspect images. Seven domain/pipeline tests and the five original check suites pass. `studio/UPGRADE.md` records the implemented local workspace, asset and Blender integrations and remaining realism work.


## Upgraded workspace

Run `npm run studio:build`, then `python3 local-qa/serve.py`; open http://127.0.0.1:4174/_qa/workspace/. Review http://127.0.0.1:4174/_qa/upgrade-v1.html for workspace captures, renderer parity and three canonical Cycles views. See `studio/README.md` for asset metadata, isolated history, render commands and known limitations. Assets are currently session imports; retain source files. Use the new `studio:build` rather than the classic HTML build when changing the React workspace.
