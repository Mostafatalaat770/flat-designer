# Current integration — 6 October 2026

Use the real GitHub integration branch `agent/local-studio-integration-20261006`, pinned to `scene-29d4aa6d` / source storage revision 39. The working Studio and review run on **4176**. A.7 and the earlier 4174 work remain historical evidence. See [integration evidence](../local-qa/INTEGRATION_20261006.md) for branch overlap decisions, current commands, checks and design observations. The following notes describe earlier milestones and are retained as history.

---

# Apartment Studio upgrade — implementation status

Implemented locally on 2026-10-05, continuing Family A.7 rather than restarting the apartment. The geometry hash, all earlier studies, original cloud contracts and classic viewer are preserved.

| Roadmap stage | Delivered | Evidence / remaining work |
|---|---|---|
| Shared spatial domain | Existing contracts behind Node and browser APIs; frozen canonical model; atomic proposals | 8 study/domain tests + browser parity tests; architecture and stale revisions rejected |
| Extracted Three renderer | Independent builders and engine; retained r160 scale/material behaviour | 13 views pixel-identical to classic; final 52-step replay 0.00% difference |
| React / TypeScript / Vite workspace | Room/furniture navigation, validated dimensions/colour/reference edits, local history, comparison, brief import/export, design log, walking/scale controls | Desktop Chromium flows pass; mobile QA and controller decomposition remain |
| GLB assets | Actual binary import, measured outside dimensions, units/axis/origin, source/licence/fidelity, material finish records | Generic CC0 table round-trip and browser finish selection verified; manufacturer CAD population and durable asset persistence remain |
| Canonical Blender / Cycles handoff | Actual scene GLB/job export, local runner, wall/opening/floor/ceiling/furniture/camera checks | Entry/living/dining renders; saved-camera quaternion correction verified; lighting/material realism remains exploratory |
| Isolated local state / QA | Dedicated browser keys, immutable versions/exports, stable cameras, repeatable Argent flows | Production API/MCP disconnected; no D1/R2, deployment or live-history writes |

The framework upgrade makes design iteration easier to maintain. It does not itself make the furniture or finishes realistic. The next design pass should replace the main sofa, dining chairs/table and key lights with licensed dimension-matching models; then calibrate daylight, curtain transmission and PBR surfaces. Follow with kitchen/bath fixture detailing and family circulation review. The current 0 hard failures does not settle the 76 context-dependent warnings, service feasibility or procurement decisions.

Use [README.md](README.md) for commands and limitations. Local review: http://127.0.0.1:4174/_qa/upgrade-v1.html. Current design evidence: http://127.0.0.1:4174/_qa/project-studies-v7/index.html. AI interpretations remain optional exploratory finish studies; they cannot verify geometric fit.
