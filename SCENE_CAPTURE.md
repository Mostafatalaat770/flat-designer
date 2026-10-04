# Agent scene capture

`capture_apartment_scene_view` and `capture_apartment_scene_views` render the signed-in user's latest saved design on a server headless browser. The viewer may be closed. They read D1, validate the saved layout, freeze one immutable snapshot and use the same Three.js r160 scene-building code as the viewer. They never write designs, history, variants or canonical geometry.

## Availability and activation

Read `get_apartment_design_context.scene_capture`. `available:false` with `headless_renderer_not_configured` means the tools are published but the headless service has not been enabled. A Worker cannot launch Chromium by itself. The existing Sites deployment supplies D1/R2/assets but does not currently provision a browser binding.

Configure these production runtime values through Sites environment settings, then deploy the existing saved version to apply them:

| Key | Value | Secret |
| --- | --- | --- |
| `CAPTURE_CLOUDFLARE_ACCOUNT_ID` | The rendering account's 32-character Cloudflare account ID | No |
| `CAPTURE_CLOUDFLARE_API_TOKEN` | An account-scoped token with Browser Rendering / Browser Run write permission | Yes |

Only the Browser Rendering permission is needed; no DNS, D1, R2 or Workers administration permission is required. Rendering-service credentials must never go into source, the hosting manifest, camera records, snapshots or tool results. The worker sends an isolated HTML snapshot to Cloudflare's `/browser-rendering/snapshot?cacheTTL=0` REST endpoint. It does not give the renderer a Sites login, a user identity header, cookies, a Site bypass token or a URL to the private design. A future host that actually provisions a `BROWSER.quickAction` binding can use that binding instead of REST credentials. No unsupported binding is declared in the current hosting manifest.

Provider reference: [Cloudflare snapshot API](https://developers.cloudflare.com/browser-run/quick-actions/snapshot/) and [API schema](https://developers.cloudflare.com/api/resources/browser_rendering/subresources/snapshot/methods/create/). Use Chromium, not the Kitesurf backend, which does not render WebGL. A real provider PNG smoke test is required after credentials are configured; mocked contract checks do not prove provider WebGL support or latency.

## Single view

Read the current brief first, then call:

```json
{
  "room_id": "RECP-01",
  "preset": "living-to-dining",
  "expected_scene_revision": "COPY_FROM_CURRENT_BRIEF",
  "request_id": "reception-camera-001"
}
```

| Preset | Behavior |
| --- | --- |
| entry-overview | Look into the room from its entry; the reception uses its main entrance |
| living-to-dining | Reception view from the living side towards dining |
| dining-to-living | Reception view from the dining side towards living |
| terrace-to-room | Look through an existing canonical glazed terrace opening into the room; requires a connected terrace |
| wide-corner | Wide view from a room corner |

Presets resolve an unobstructed camera position against the current saved furnishings and modeled wall faces. Living/dining presets apply to the reception; entry/wide presets support every indoor room. Terrace presets are available for the reception and master bedroom. They do not invent openings. Camera positions and furniture clearance are conceptual; this is not a site-survey or equipment-fit check.

For a custom camera, replace `preset` with `position`, `target` and optional `fov`. Both vectors are three-element arrays in **Three.js metres**, with `x=(plan_x_mm-width_mm/2)/1000`, `y=height_m`, `z=(plan_y_mm-depth_mm/2)/1000`. These are not plan millimetres. FOV is vertical degrees, 10–120; custom default is 60. A preset also accepts a FOV override. The camera must be clear of walls and tall furniture and inside the chosen room or its connected terrace. The target must be inside the selected room below its fixed ceiling.

Rendering is perspective, 1280×720, full-height 2.50 m, with furnishings visible and labels hidden. All saved finish, furnishing, object, treatment, HVAC and fixture choices remain intact. Time/night mode and door animation are viewer preferences, not saved design facts; server captures consistently use 10:00 daylight and fully open modeled doors, with those values recorded in camera metadata. Existing glazing dimensions remain untouched.

## Batch

```json
{
  "views": [
    {"room_id": "RECP-01", "preset": "living-to-dining"},
    {"room_id": "RECP-01", "preset": "dining-to-living"},
    {"room_id": "MBR-01", "preset": "wide-corner"}
  ],
  "expected_scene_revision": "COPY_FROM_CURRENT_BRIEF",
  "request_id": "apartment-camera-batch-001"
}
```

One to five views may share a request. Headless launches run sequentially to bound memory and session usage; PNG image content follows input order. All views share the same immutable layout snapshot. Metadata for the complete batch and its completion record commit in one D1 transaction, conditioned on the unchanged scene **and storage** revision and request lease. Failed rendering/uploads or stale edits leave no partial batch; temporary R2 objects are deleted. Captures are additional private view records, not saved-design revisions.

## Readiness, revisions and retries

The isolated page disables cloud sync, autosave, device-draft loading and transition animations. Bundled artwork is embedded through the internal asset binding. HTTPS material maps load anonymously in the headless page. Shared texture readiness tracks both style artwork and PBR albedo/normal/roughness maps. Shader compilation and two painted animation frames precede the capture-ready marker. A failed specified map or unavailable WebGL context prevents success; a map-free generic material uses its usual procedural/simple material. Relative texture paths must point to existing bundled PNG, JPEG or WebP images in the static asset binding; missing or unsupported images report `capture_texture_unavailable`. Bundled map data is limited to 8 MB; external HTTPS maps avoid embedding but must allow CORS.

The provider returns a PNG and camera metadata from that same frozen frame. The worker verifies its canonical hash, saved-layout SHA-256, scene/storage revisions, room, exact camera, renderer version, zero pending/failed maps and viewport, then persists bytes in private R2 and metadata in D1. The timestamp is from the frozen render frame. Missing/incomplete/failed provider results never become successful scene views.

Scene revisions are checked before rendering, before each batch view, at the atomic database commit and before returning images. A stale revision yields `stale_scene_revision`. Read the new brief and use a **new** request ID. A storage revision change during capture also rejects the request, including a save whose layout is unchanged.

`request_id` is identity-scoped and accepts 8–100 letters, digits, `_` or `-`. Completed identical retries return the original saved PNG without another render. A different camera, batch or scene with the same ID yields `request_id_conflict`. Concurrent identical requests yield `capture_in_progress`; retry the same ID. A failed renderer/storage attempt can retry the same ID while the scene is still current. A ten-minute lease allows recovery if a request is interrupted; it prevents duplicate concurrent paid renders. Error responses contain no provider credentials. Existing images remain retrievable after a provider is disabled.

## Image generation

The tool returns `ApartmentSceneView/1` metadata plus MCP PNG image content. Batch returns `ApartmentSceneViewsCapture/1`, `views` and ordered image content. Structured metadata does not duplicate image base64. `get_saved_apartment_scene_view` retrieves either manual or agent captures. Use the returned `view_id` with `create_apartment_render_brief.saved_view_id`, attach that PNG to image generation, and preserve its camera, projection, room geometry, openings and object placement. The 3D representation remains conceptual; product and concealed-HVAC visuals do not certify physical fit.

## Verification

`npm run check` includes real shared geometry/model generation, DOM controls, SQLite transactions, R2 adapters, actual PNG fixtures, capture contracts, five presets, custom cameras, isolation, literal snapshot escaping, idempotency, concurrent requests, stale edits and batch failure cleanup. The provider is mocked in these checks. No actual headless WebGL or live Cloudflare frame has been verified without a configured provider.
