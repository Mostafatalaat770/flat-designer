# Bedroom 1 R1 — west-wall study desk

R1 moves the study desk to the west wall below the bed and the closed storage unit to the south wall. The desk is reduced from 1200 × 600 to **1100 × 600 mm**. The bed, wardrobe, window, door and all other rooms retain their review-source positions. This is a retained local comparison; [R4](../bedroom1-r4/README.md) is preferred after testing open storage. The active review seed and saved cloud v55 were not replaced.

## Finding and decision

The original furniture arrangement disconnects the selected bed, wardrobe, storage and window approaches for the nominal 500 mm circular body. R1 restores those routes at both 50 and 25 mm grid resolutions. The chair approach and a seat-centre proxy also pass. Four circulation destinations remain reachable with the chair withdrawn 200 mm and with a static 700 × 550 mm seated-occupation reserve; those reserves were checked for furniture collisions. These are fixed envelope tests, not chair or human kinematics.

The 1150 mm desk also passes the closed-furniture circulation comparison. Its south edge has only about 4 mm to the modeled wall face. The 1100 mm option gives about 29 mm at that wall and 50 mm to the bed; it is preferred for this local comparison. Those tight perimeter gaps are installation gaps, not walkways.

**Keep R1 as a conditional study.** A broad sensitivity case reserving the entire 1000 mm storage frontage with a 300 mm forward projection disconnects the entry-to-storage-use route at both grids. The generic storage object does not identify actual drawer or hinged-leaf dimensions. Specify and test its real opening mechanism before adopting the layout; passing closed-furniture routes does not settle open-storage operation.

## Measurements and verification

| Check | R1 result |
| --- | --- |
| Static validation | 186 pass / 75 warning / 0 fail; warning count unchanged |
| Floor furniture collisions | None |
| Wardrobe free operating depth | 1345 mm |
| Storage free operating depth, closed chair position | 815 mm |
| Unobstructed glazing frontage | 1355.7 mm |
| Door approach width | 720.2 mm |
| Furniture versus inferred door sweep | No intersection at 2° samples |
| Core routes | 12 passed checks: 6 cases × 2 grids |
| Occupation/door-state routes | 24 passed checks: 4 cases × 3 stages × 2 grids |
| Before/after captures | 4 native WebGL PNGs, exact layouts and matching Natural42 cameras verified |

Run from the repository root:

```sh
node design-development/bedroom1-r1/verify.mjs
```

Add `--write` to regenerate `verification.json`. The proposal rejects a changed base scene. The script also checks canonical geometry, unrelated furniture/interiors, materials, room definitions and window treatments; it validates both standing cameras against both layouts.

Open `review.html` for the portable Arabic comparison. The four native PNGs, exact capture metadata, plan and SHA-256 manifest are committed under `evidence/`. `brief.json` is the portable design brief; `snapshot.json` is the renderer snapshot; `proposal.json` records the three furniture operations.

Recreate the isolated viewer after the normal `npm ci` / `npm run build` setup:

```sh
node design-development/bedroom-review.mjs verify-evidence bedroom1-r1
node design-development/bedroom-review.mjs prepare bedroom1-r1
python3 local-qa/serve.py --port 4174
```

Open `http://127.0.0.1:4174/_qa/bedroom1-r1/`. Renderer pages are regenerated locally rather than committed as large embedded bundles. For new native captures or browser checks, install the development-only browser tool with `npm install --no-save playwright` and `npx playwright install chromium`, then run:

```sh
node design-development/bedroom-review.mjs capture bedroom1-r1
node design-development/bedroom-review.mjs check bedroom1-r1
```

Set `CHROMIUM_PATH` only when using an already installed browser. The optional last argument to `prepare` or `capture` limits it to a saved view, such as `entry-to-desk`. Regenerated captures stay under ignored `local-qa/site/bedroom1-r1/evidence/`; committed evidence is preserved.

## Provenance and scope

- Review source: `scene-9cf45a73`, based on saved cloud `scene-4821689`, storage 55.
- Candidate: `scene-32a80894`, storage revision null, production disconnected.
- Canonical SHA-256: `734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658`.

The route model includes displayed 180 mm walls and inferred door leaves, with a half-cell-diagonal safety margin. Starts are 600 mm inside the entry opening, so the checks do not certify crossing the door or a complete entry sequence. A 500 mm circular body does not establish comfortable circulation. Actual skirting, joinery, chair, storage leaves and window sash require their real dimensions. The generic native captures show geometry and layout, not selected manufacturer products or a finished render.
