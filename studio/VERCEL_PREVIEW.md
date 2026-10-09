# Type B Studio — Vercel visual Preview, NOT public production

**Status:** Deployment configuration and CI staging ONLY. This file never authorizes a public apartment floor-plan deployment.

## Why Vercel
The current `/_qa/workspace/explore.html` page already runs React/Vite and Three.js. Vercel **hosts** this exact client-side app; it does not replace React, undo the canonical Type B geometry, or replace the protected Saved Studio. One protected PR deployment = one test URL for the owner to review on mobile and desktop.

## Strict privacy gate — configure before enabling deployment
The JS bundle necessarily includes part of the private Type B apartment geometry and source furnishings. **Do not make it accessible on an unprotected public `*.vercel.app` URL.**

1. Connect Vercel to ChatGPT with the available app, or open the Vercel dashboard.
2. Create a **new isolated Vercel project** for `Mostafatalaat770/flat-designer` with repo root `./`, preferably without first deploying until protection is set. Do not repoint the live Sites project.
3. In Vercel project **Security → Deployment Protection → Vercel Authentication → All Deployments** (free as of September 2026), restrict access to authenticated project members. The default **Standard Protection does not secure the production domain**, so do not rely on it for a private apartment.
4. Confirm it is enabled **before deploying or enabling automatic GitHub branch builds**. Open the link in an incognito window to verify it asks for Vercel login.
5. Enable GitHub Preview Deployments for PR branches (keep PRs draft). Never change the existing production branch without owner approval.
6. To share a particular deployment with someone else, use explicit Vercel access or a limited Shareable Link after approval; no unprotected bypass URL.

## Vercel build settings
The repo-root `vercel.json` specifies:
- `framework: null` (static site with existing React/Vite, not a Next.js conversion)
- `installCommand: npm ci`
- `buildCommand: npm run build && npm run studio:build && node scripts/prepare-vercel-preview.mjs`
- `outputDirectory: vercel-preview`
- Short root redirect to `/_qa/workspace/explore.html`

The assembler copies only the compiled `local-qa/site/workspace/` pages to the **same absolute Vite path** `vercel-preview/_qa/workspace/`, plus required `dist/art/` and optional static texture assets. The static output does **not** serve Python QA server routes, worker functions, raw snapshot JSON or `/_qa/workspace-export` POST.

Routes for authenticated reviewers:
- `/` redirects to `/_qa/workspace/explore.html` (main MVP)
- `/_qa/workspace/explore.html`: real-time, same-camera A/B visual exploration with Verify and explicit local immutable save
- `/_qa/workspace/`: local design workspace, furniture and saved local variants
- `/_qa/workspace/parity.html`: geometric parity QA

Caveat: `localStorage` is per browser+deployment **origin**; versions saved at Vercel are not automatically synced to your browser's localhost or the original Sites Studio. Use JSON export/import for transfer. Preview branches and production URLs may use different origins. The exact apartment floor-plan model is in compiled JS and must not be made public.

## First validation and CI
Run `npm ci && npm run build && npm run studio:build && node scripts/prepare-vercel-preview.mjs` locally. The [static preview GitHub Action](../.github/workflows/verify-vercel-preview.yml) checks all 3 pages, correct asset paths, included scene art, missing API credentials and current pinned v55 geometry provenance. It uploads an artifact solely for internal reviewer use. No Vercel deploy occurs from that Action; the deployment starts only after linking/configuring the Vercel project.

**Canonical:** `734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658` • current v55 review `scene-9cf45a73`, derived from saved source `scene-4821689`. **Do not promote the experimental K12 (2 structural FAILs)** to verified or change the master/cloud Saved Studio. The renderer's brightness/CCT and colors remain approximate previews, not lux/sunlight/site-certified textures or build documents.

## Release acceptance gate
Check provider-authenticated preview path, actual browser WebGL with both same-camera views, fast palette changes and exact room dimensions; repeat `Explore → Verify → Save local version` with no earlier draft touched. Compare page via a real mobile browser. If art/assets fail, **reject** deployment; do not replace them with invented images.
