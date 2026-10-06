# Current integration — 6 October 2026

Use the real GitHub integration branch `agent/local-studio-integration-20261006`, pinned to `scene-29d4aa6d` / source storage revision 39. The working Studio and review run on **4176**. A.7 and the earlier 4174 work remain historical evidence. See [INTEGRATION_20261006.md](INTEGRATION_20261006.md) for branch overlap decisions, current commands, checks and design observations. The following notes describe earlier milestones and are retained as history.

---

# Project Environment

React/TypeScript/Vite local workspace plus the retained classic JavaScript / Three.js web Studio; React Native and native platform flags are false, as established by the session environment inspector. Authoritative repository restored into `/private/tmp/flat-designer-work` from linked Sites source, baseline Git commit `a7706c1`; do not use the older Downloads snapshot for the new camera/furniture API.

Local server port 4174; Chromium CDP port 9222, Apple Metal, 1600 × 857 DPR1. Production-disconnected server and separate local browser draft keys. Canonical hash locked to 734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658.

Production baseline scene-c286be16 / storage 9 was fetched through the Apartment Type B connector and re-read unchanged after work. Local Reception A.3 is scene-2ad8493e; private recovered brief, all proposals, exported current brief, validations and screenshots retained in local-qa. No production design, variant, history or R2 writes; no push or deployment.

Build and all five repository suites pass using Node26 and local canvas CI shim. Eight screenshot snapshots pass the 32-step Argent flow at 0.00% replay difference. Runtime Natural42/Wide60, eye1.70m and Scale Check geometry verified. See DESIGN_LOG.md for design critique and remaining warnings.

Current local candidate: FamilyA.7, scene-9e210720, studyJSON local-qa/studies/family-a7.json. New npm run study pipeline and seven boundary tests; all five original checks PASS;13screenshots /52-step replay0.00% difference. Gallery/_qa/project-studies-v7/index.html. Master outer frame1870×2220 reference, single frame1280×2100 inferred; south-wall bench, closed storage, BR2 headboard east, hall clear. See DESIGN_LOG/PROJECT_DOSSIER/studio/UPGRADE. React19.3/TS5.9/Vite7.3 and independent Three r160 renderer now run locally at /_qa/workspace/. GLB import checks actual dimensions/units/provenance and material variants. Assets are session imports, not persisted per version yet. Canonical GLB export + Blender4.5.3/Cycles round-trip verifies 64 walls,52 opening components,13 floors,10 ceilings,51 furniture transforms and standing cameras. Three entry/living/dining renders are exploratory: generic models and dim lighting remain. Eight study tests + seven browser/asset tests, five original suites pass. Extracted renderer13views EXACT0 pixels changed; final52-step replay0diff. Controls/edit-undo/GLB/finish flows pass; three utility captures repeat0diff. Upgrade evidence /_qa/upgrade-v1.html; instructions studio/README.md. Local-only; architecture and production untouched.
