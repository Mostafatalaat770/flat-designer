# Branch-driven apartment renders

This branch adds a GitHub Actions renderer for the exact Studio Three.js scene.

- Each design branch owns `render-snapshots/current.json`.
- Updating that snapshot triggers `.github/workflows/render-apartment.yml`.
- Chromium runs in GitHub Actions via Playwright.
- Output PNGs + metadata are uploaded as a workflow artifact.
- The workflow does **not** commit rendered images, preventing render loops.
- The snapshot keeps the canonical hash and scene revision alongside the frozen layout.

For the first smoke test, `current.json` renders the three locked reception cameras.
