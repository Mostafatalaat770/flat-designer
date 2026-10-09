# Bedroom 1 R4 — narrower tall storage and west-wall desk

R4 is the preferred **local furnishing candidate** from this review. The original arrangement disconnects selected circulation destinations for a 500 mm circular body; R1 restores closed-furniture routes but loses the route when its full 1000 mm storage front is reserved open. R4 restores the tested routes with 300 and 350 mm full-front opening reserves as well.

`comparisons.json` preserves the two desk-size trials and the rejected R2/R3 refinement proposals and results alongside R4. Run `node design-development/bedroom1-r4/verify-comparisons.mjs` to reproduce those decisions from the frozen source.

| Item | Change from the current review source |
| --- | --- |
| Study desk | West wall below the bed; 1100 × 600 mm instead of 1200 × 600 |
| Study chair | Faces the west-wall desk |
| Closed storage | South wall, centre x=3775/y=4720 mm; 800 × 350 × 1000 mm instead of 1000 × 350 × 800 |
| Wardrobe | 120 mm north; size and orientation retained |
| Bed, window, entry and other rooms | Retained |

The storage unit is narrower and taller. Its nominal **outer volume remains 0.28 m³**, which does not prove equal internal capacity. This is generic custom joinery, without a selected manufacturer product. The desk loses 100 mm of length; the 1150 mm comparison has only about 4 mm to the modeled south wall, so 1100 mm is preferred.

## Verification and limits

Run `node design-development/bedroom1-r4/verify.mjs` from the repository root. Add `--write` to regenerate `verification.json`. The script rejects a changed source and verifies layout provenance, frozen architecture, unrelated room contents, furniture collisions, inferred door sweep and both matched standing cameras.

- Static validation: **187 pass / 74 warning / 0 fail**, versus 186/75/0 for the source.
- Wardrobe operating depth: **1345 mm**; storage operating depth in the normal chair position: **815 mm**.
- Glazing frontage: **1355.7 mm clear**; entry approach: **720.2 mm**.
- Six core cases pass at both 50 and 25 mm grids: bed, wardrobe, storage, desk approach, window and a seat-centre proxy.
- Four main destinations pass in three separate stages: closed entry door, chair withdrawn 200 mm, and a 700 × 550 mm seated-user reserve. Those reserves were checked for other furniture collisions.
- Four main destinations also pass with a **300 mm or 350 mm full-width storage-opening reserve**, at both grids. The opening reserve does not overlap the normal chair or other furniture.
- Four native WebGL PNGs use identical before/after Natural42 cameras. Exact layout/scene/camera metadata and completed assets are verified.

Open-storage cases use the chair in its normal position. The withdrawn-chair and seated-occupation stages are separate scenarios; simultaneous storage opening next to a withdrawn or occupied chair is not established. Door hinges are inferred and sampled every 2°. These are fixed 2D envelopes with a half-cell-diagonal margin, not human posture, chair kinematics or manufacturer leaf geometry. Entry starts 600 mm inside the room. A 500 mm body fitting does not establish comfortable circulation; actual site, skirting, window sash, joinery and chair dimensions remain to be checked.

## Review and provenance

Open `review.html` for the portable Arabic comparison. The four native PNGs, their exact layout/camera metadata, the plan, browser-check record and SHA-256 manifest are committed under `evidence/`. R1 is retained as the earlier conditional candidate.

After `npm ci` and the normal `npm run build`, verify the evidence and prepare the isolated viewer:

```sh
node design-development/bedroom-review.mjs verify-evidence bedroom1-r4
node design-development/bedroom-review.mjs prepare bedroom1-r4
python3 local-qa/serve.py --port 4174
```

Open `http://127.0.0.1:4174/_qa/bedroom1-r4/`. This page has the plan, matched before/after captures, the isolated viewer and a downloadable design brief. Large renderer pages are regenerated locally; they remain ignored runtime output.

For fresh native captures and desktop/mobile viewport checks, install development-only Playwright with `npm install --no-save playwright` and `npx playwright install chromium`, then run:

```sh
node design-development/bedroom-review.mjs capture bedroom1-r4
node design-development/bedroom-review.mjs check bedroom1-r4
```

Set `CHROMIUM_PATH` only when using an installed browser. An optional last view ID, such as `entry-to-desk`, limits `prepare` or `capture` to that saved camera. Regenerated evidence stays under ignored `local-qa/site/bedroom1-r4/evidence/`; committed evidence is preserved.

- Source: review `scene-9cf45a73`, derived from saved cloud `scene-4821689`, storage 55.
- R4: `scene-a5c839c1`, storage revision null, production disconnected.
- Canonical SHA-256: `734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658`.

The active seed, cloud design and canonical architecture are not replaced. R4 is a reviewable local proposal, snapshot and design brief.
