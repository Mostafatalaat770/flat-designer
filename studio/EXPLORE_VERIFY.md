# Explore & Verify — Apartment Type B local Studio

## Product goal
**Explore fast. Verify before saving.** Retain the exact apartment source; never fake a wall, room opening, 2.50m finished clear height, structural approval or a product specification to make a pretty picture.

## Open
Build `npm ci && npm run build && npm run studio:build`, serve using `python3 local-qa/serve.py --port 4176`, then open:

**http://127.0.0.1:4176/_qa/workspace/explore.html**

Or enter from the existing Workspace header using **Explore & Verify ✨**.

The isolated page starts from **render-snapshots/current.json**, pinned to storage revision 55: review candidate `scene-9cf45a73`, derived from saved source `scene-4821689`. The v50 snapshot in `studio/local/sources/verified-master-v50.json` is historical. This source is deliberately not the experimental K12 kitchen-open snapshot from the inherited design branch: K12 still has two architectural hard failures. The user may **explicitly import a validated exact-canonical brief** if desired; unapproved geometry is rejected.

## Workflow
- Left A and right B are **real Three.js canvases**, same room and fixed source camera. Try different wall-paint colors, flooring visual look, decorative light mode, render CCT/brightness, or use Calm Contemporary / Warm Japandi / Soft & Bright presets.
- **Snapshot B→A**, **Revert B to A**, **Swap A↔B** and **Side-by-side** permit comparisons without rendering an entire CI artifact for each minor decision.
- Until you explicitly save after verification, changes are **in browser memory only**. **Neither saved local browser draft nor existing immutable versions are altered.** The cloud Site is disconnected.
- **Verify** checks the original Type B SHA, source geometry/furniture/room invariance, the exact 5 allowed cosmetic fields for one room, and the full existing apartment validation. Hard geometry failures block verification.
- **Save verified local variant** writes a *new, immutable named local version*, readable in the existing Workspace Versions panel. It never overwrites prior versions/drafts. Download the JSON brief/proof or an image if you want the artifact in this chat.

## Boundaries / credibility
This is a **visual and geometry decision workbench**, not a stamped architectural, electrical or MEP plan. Lighting modes/CCT/brightness are approximate render settings; **not** real geographically oriented sun, lumens/lux, warm-white energy consumption, dimmer circuit layout or night photometry. Materials are generic procedural looks; real Egypt suppliers, dimensional scale, anti-slip, maintenance and sound need vendor evidence. Good-looking WebGL cannot waive the K12 structural issues.

The camera is an original saved source camera; the comparison engine uses identical camera/lens in both scenes. The product MVP currently runs on an isolated local QA route and **is not deployed to the live Sites Studio**. Production sync and direct cloud account design mutation require separate user authorization and release review.

## Verification
The workflow `.github/workflows/verify-studio-explore-mode.yml` checks:
- Original canonical model, current pinned v55 snapshot and no extra architectural/cross-room changes
- Playwright browser with two real canvases
- Active material/light interactions and A/B snapshotting
- **No localStorage writes before verified save**
- Source and geometry check passed, then **only user-triggered immutable new local version**
- Browser screenshot in the Action artifact

Known separate defect: A18 preview pipeline on PR #36 failed due Chromium frame-load timeout despite a successful pure geometry job; **do not claim its real 3D images are verified** until rerun passes.
