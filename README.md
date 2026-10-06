# Apartment Type B · 3D Studio

English apartment viewer adapted from [wy51ai/floorplan-3d](https://github.com/wy51ai/floorplan-3d), upstream commit `730ec0923a018fdf38b4687c5ef385c7dcac451f`. The upstream MIT license is retained.

The canonical Type B JSON v0.2.2 is the architectural source of truth. The source image's SHA-256 is checked against it before the adapter is generated. Room polygons and opening IDs are retained. A uniform 47.208 px/m image calibration is used for the conceptual display. Printed room dimensions are presented separately and override image estimates for dimension references.

## Isolated local design workspace

The React/TypeScript Studio continues the pinned saved **Whole Apartment A3** design, `scene-29d4aa6d` / source storage revision 39, while retaining Family A.7 and all earlier studies. Follow [studio/README.md](studio/README.md) to build and run the local workspace on port 4176. [Integration evidence](local-qa/INTEGRATION_20261006.md) records branch reconciliation and multi-view QA. Canonical architecture remains locked; local experiments do not write to the production Site.

## Rebuild

```sh
python3 generate_model.py
python3 make_app.py
node build_capture.mjs
python3 build_hosted.py
```

`generate_model.py` validates the 13 spaces, 16 openings, entry access graph, source image hash and sample furniture footprints. It emits `dist/apartment-model.js`, a matching JSON adapter and `model-validation.json`. `make_app.py` builds the customized viewer from the preserved `upstream-index.html`. Serve `dist/` over HTTP; the Three.js r160 dependencies are included locally.

`build_hosted.py` also produces `dist/client/` assets and the self-contained Cloudflare Worker entrypoint `dist/server/index.js`. The existing Site has an authenticated, stateless MCP transport at `/mcp` and durable, identity-scoped saved designs in D1. The hosting manifest retains its project ID and audience, declares `mcp`, and uses the logical `DB` and `BUCKET` bindings. Schema lives in `db/schema.ts`; generated Drizzle migrations are applied by hosting, never created at runtime. Install development dependencies with `npm ci`; run `npm run build` then `npm run check` (Node 24 for the local SQLite adapter).

## Independent design options

Open **Design options** in the header. The drawer updates the scene as you choose options for the working room:

- Wall split AC or concealed grille faces; plain ceiling, surface shadow-gap detail or perimeter LED.
- Style pendants, track spots, flush downlights, floor/wall lamps, track plus lamps or daylight only. Track spots use downward spotlights. Colour temperatures are 2700, 3000 and 4000 K, with independent room brightness.
- Wall paint and eleven flooring types.
- Individual sofa/armchair forms, upholstered/oak/woven bed forms, and integrated/steel or black-glass appliance fronts. These choices retain each editable item's position, size and identity across styles.

Floor lamps use free footprints and participate in walking collision checks. Other equipment and finish details are conceptual surface models on existing architectural planes. None of these options moves walls or lowers the 2.50 m ceiling. Concealed grille faces do not include a hidden unit, ducts, drains or access. The canonical service void is 130 mm; the linked [Daikin FDXM reference](https://www.daikinegypt.com/en_us/products/product.html/FDXM-F9---RZAG-B.html) specifies a 240 mm ceiling void, so installation feasibility remains TBD.

**Real references** includes twelve primary-source references checked on 3 October 2026: GUBI/Muuto sofas; IKEA/Article/West Elm beds; Bosch appliance fronts; and Benjamin Moore, Sherwin-Williams and Behr 2026 paint selections. Manufacturer dimensions appear only where axis-labelled measurements were verified. Only Behr Hidden Gem's official digital hex is used as a paint swatch. Product popularity, Egyptian availability and exact branded CAD fidelity are not claimed. Source records and reuse notes are retained in `research/`; manufacturer photographs are linked, not embedded.

## Interior objects, materials and saved cameras

Design options now includes **Interior objects**, **Materials & surfaces**, **Clearance report** and **Saved variants**. The optional reversible overlay has fourteen object types, five divider forms, stable wall hosts, extensible PBR materials, measured PASS/WARNING/FAIL reports and proposal /2 operations. **Save view for AI render** stores a private WebGL PNG with its exact camera and scene revision. The connector preserves the original five tools and adds `get_saved_apartment_scene_view`, `save_apartment_design_variant` and `activate_apartment_design_variant`. Named variants retain independent scenes; loading uses normal design history and revision guards.

Read [INTERIOR_CONTRACT.md](INTERIOR_CONTRACT.md) for schemas, placement conventions, operations, validation assumptions and the camera-constrained render pipeline.

## Images and design agents

**Images & agents** exports an `ApartmentDesignBrief/1` with the current layout, canonical hash, scene revision, geometry, locked heights and source references. Agents can still return `ApartmentDesignProposal/1` for room options, furniture variants or furniture placement; `/2` adds objects, surfaces, materials and opening treatments. Import previews the proposal, validates it against the current scene again when applying, and creates one undoable transaction. Wrong canonical hashes, stale revisions, architecture/height changes, invalid footprints and solid-item overlaps are rejected. This geometric screening is not a circulation or engineering certification.

The Site plugin preserves these five tools: `get_apartment_design_context`, `get_current_apartment_design_brief`, `validate_apartment_design_proposal`, `apply_apartment_design_proposal` and `create_apartment_render_brief`. Discovery contains tool definitions only; data calls require trusted Site identity headers. Designs are private to the signed-in user, including for external viewers. The current design tool returns the latest saved scene rather than unfinished or offline browser edits.

On first opening the upgraded viewer, its current device layout is saved if no account design exists. Completed edits autosave after a short debounce. The online viewer polls for agent changes every three seconds when visible and idle, adopting them as an undoable change. Offline device drafts remain recoverable. A changed saved base prompts an explicit choice between the saved scene and device draft, protecting both from silent replacement. Reloading a draft against an unchanged saved base resumes the save automatically. **Saved design** shows status and history; it retains up to 150 revisions and displays the newest 30. Restoring a revision creates a new save. No export/import is required for connected agents.

Agent workflow: read `get_current_apartment_design_brief`, create a proposal matching its `scene_revision` and canonical hash, optionally validate, then call `apply_apartment_design_proposal` with `expected_storage_revision` from `brief.cloud.storage_revision` and a unique `request_id`. The write revalidates against the stored scene, checks both revisions, and commits current state and history atomically. Reusing the same request ID retries the same operation without duplicating history. A stale scene or storage revision is rejected. Context reports saved-design readiness so a previously cached three-tool client can identify the upgraded server; refresh the plugin connection if discovery remains cached.

A room render brief includes flooring, furniture, room options, canonical constraints and a photorealistic prompt. Use **Save view for AI render**, retrieve the saved PNG through the connector, and attach it with the original plan to image generation. Render briefs include the matching camera; stale saved views are rejected. The brief does not itself generate an image inside the viewer. Generated concepts require a geometry comparison and remain exploratory.

## Decor comparison

The header's **Decor style** selector switches between **Your design**, **Warm Contemporary**, **Japandi**, and **Modern Bohemian**. The three presets are complete furnished scenes with different furniture geometry, textiles, framed paintings, pleated curtains, ceiling fixtures and textured floors. Furniture positions, dimensions and rotations are shared across styles; canonical walls, openings and the 2.50 m ceiling stay fixed.

| Style | Furniture and textiles | Flooring | Fixtures |
| --- | --- | --- | --- |
| Warm Contemporary | Rounded upholstery, channel headboards, fluted casework, stone tables and wool rugs | Oak parquet; large tiles in wet rooms | Brass-toned rings and opal globes |
| Japandi | Exposed oak frames, low slatted beds, handleless cabinets and linen | Wide pale oak planks; tiles in wet rooms | Paper lanterns |
| Modern Bohemian | Open cane weave, arched headboards, woven tables and fringed terracotta rugs | Limestone/travertine; terrazzo in wet rooms | Wicker shades |

Choose **3D**, a **Decor style**, then **Interior view** to compare the living room, dining area or any bedroom. Selecting a style from the cut-away view opens the living interior with full walls. Subsequent style switches preserve that view and the daylight/Night setting. Styles have distinct fixtures and warm light colours; Night increases their illumination. Cut-away mode hides wall-mounted paintings, curtains and hanging fixtures so they do not float above the shortened walls.

Colour and floor edits are remembered separately for each style in the saved design, with a device draft for recovery. **Your design** restores its own finishes and original furniture forms while retaining furniture moves made in another style. Undo/Redo and JSON layout exports include the selected style and its saved finishes. Existing layout files without decor metadata continue to load as **Your design**. Version 1 preset layouts migrate their default flooring to the new scene materials; other floor choices remain saved.

`decor-presets.js` defines style and persistence behavior. `decor_styles.py` and `scene_upgrade.py` integrate the source modules into the normal rebuild. `scene-furniture.js` defines editable furniture variants, `scene-materials.js` and `scene-floors.js` provide procedural surface textures, and `scene-decor.js` mounts art and curtains on canonical surfaces and positions fixtures above furniture. Paintings in `dist/art/` are original generated assets; exact prompts are retained in `dist/art/prompts.json`. These are interactive conceptual 3D scenes, with approximate materials and lighting rather than measured product models or a calibrated photographic render.

## Model status

- **VERIFIED:** Canonical room/opening relationships, 2.50 m clear ceiling, 2.63 m pre-gypsum clear height, floor-to-ceiling living glazing GLZ-RECP-N.
- **INFERRED:** Metric reconstruction from the traced image, door hinges and leaf swing representation, deduplication of the 851/852 px kitchen wall trace.
- **EXPLORATORY:** All sample furniture, finishes and lighting. Furniture remains editable, undoable and saved per account. Furniture layouts can be exported/imported without changing the architecture.
- **TBD:** Structural classification, exact wall thickness, opening widths and heads, bedroom-window verticals, terrace glazing construction, parapets, frames, geographic orientation and MEP details.

Display conventions: 180 mm walls, 2.10 m door/window heads, bedroom window sill 0.90 m, terrace parapets 1.00 m. These conventions are not architectural facts. Doorless passages are displayed up to the clear ceiling. The 186 m² figure is the developer's stated gross area; traced model-envelope areas are not measured usable floor areas. Furniture footprint validation does not certify circulation, accessibility or building-code compliance.

## Verification scope

Static syntax and dependency checks, DOM behavior tests and actual Three.js scene-geometry checks are recorded in `viewer-validation.json` when run. Scene checks cover distinct sofas, beds and fixtures, five artwork mounts, five curtain openings, ceiling clearance and five collision-free interior viewpoints for all three presets. Exported meshes and textures were also inspected with a standalone EGL renderer using approximate lighting. This graphics check does not substitute for a rendered browser check on the user's device. WebMCP is feature-detected and optional; a supported live browser context was unavailable during authoring.

The configurator checks also cover room isolation, alternative fixtures, original ceiling planes, device reload, proposal validation and apply/undo/redo. `verify_worker.mjs` records MCP protocol, authentication guards, shared validation and render-brief checks in `worker-validation.json`. `verify_cloud.mjs` runs the real Worker, generated SQL and actual browser DOM sync against a local SQLite D1 adapter; `cloud-validation.json` covers account isolation, atomic history, concurrent writes, idempotent retries, undo, conflict recovery, reload and retention. Trusted-header test identities exist only in the local harness. The installed plugin's read-only context was verified through its actual connection. `fixtures/agent-starter-brief.json` is the exported starter fixture from the supplied demo, not an account's current saved state. `verify_capture.mjs` checks agent captures with real SQL and PNG fixtures and a mocked rendering provider; it does not claim a live WebGL capture.

## Agent-controlled scene captures

The original eight tools remain available. `capture_apartment_scene_view` and optional batch `capture_apartment_scene_views` add unattended camera-controlled PNGs from the latest saved scene. They use the actual viewer scene builder, wait for artwork/material maps, reject stale revisions, persist camera/revision/image metadata, and return image content. Batches commit together and retry IDs prevent duplicate captures. No architectural, furnishing, history or branch edit is made by capture.

Read `get_apartment_design_context.scene_capture.available` before capturing. The current Sites host does not provision headless Chromium. Set `CAPTURE_CLOUDFLARE_ACCOUNT_ID` and secret `CAPTURE_CLOUDFLARE_API_TOKEN` in production runtime settings, then deploy to enable the server provider. Until then the tools return `headless_renderer_not_configured`; manual viewer captures continue working. See [SCENE_CAPTURE.md](SCENE_CAPTURE.md) for exact inputs, five presets, camera coordinates, readiness, stale-edit handling, batch persistence, provider configuration and validation limits. Image generation remains a separate step constrained by the captured PNG and render brief.
