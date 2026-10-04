# Interior design contracts

Canonical architecture always comes from Apartment Master Spec Type B v0.2.2. The adapter, source hash, room polygons, 16 openings, 64 reconstructed wall segments, 2500 mm finished ceiling and full-height GLZ-RECP-N remain unchanged. Interior data is an optional, reversible `layout.interior` overlay. Old layouts without the overlay keep their original scene revision.

## Overlay and surfaces

`InteriorDesign/1` contains `version:1`, `objects`, custom `materials`, `surface_materials`, and `opening_treatments`. It is furnishing data, never an architectural source. Object dimensions and plan coordinates are millimetres. `rotation` uses plan degrees. `status` and `metadata` describe a concept or reference, not a new architectural fact.

Objects have `id`, `type`, `variant`, `room_id`, `placement`, `rotation`, `width_mm`, `depth_mm`, `height_mm`, `material_references`, `colour`, `status`, and `metadata`. Floor/ceiling placements also have `cx`/`cy`. Supported types and variants are exposed in `interior_contract.object_types`; they are shared by viewer and connector validation.

The surface registry derives `FLOOR-<room>`, `CEILING-<room>` for indoor rooms, and `WALL-<room>-<segment number>` from the locked adapter. Opening references use the existing canonical IDs. For the same canonical hash, identical geometry produces identical IDs. Wall IDs are room-facing references, so each side of a shared wall can have a separate finish. Reconstructed wall positions and thickness remain conceptual/INFERRED.

| Placement mode | Coordinates |
| --- | --- |
| floor | `cx`, `cy`, `rotation`; optional bottom `placement.elevation_mm`, useful for table lamps |
| wall | `placement.host_wall_id`, signed `offset_mm` from the segment midpoint in its `from→to` direction, bottom `elevation_mm`, extra `inset_mm` from the modeled room-facing wall face |
| ceiling | `cx`, `cy`, `rotation`; `drop_mm` is measured down from the fixed 2500 mm ceiling to the object top |
| opening | `host_opening_id`, `offset_mm`, bottom `elevation_mm`, `inset_mm`; a treatment placed alongside an existing opening, without editing it |

Mounted object faces point into the room. Wall width must fit the usable segment; every full footprint must fit the assigned room and remain below the verified ceiling. The opening treatment DTO is `{type: 'none'|'curtain'|'blind', variant, material_id, colour, openness:0..1, room_id}`. It is reversible and cannot change an opening.

## Proposal compatibility

`ApartmentDesignProposal/1` remains valid for its original operations and strict furniture-placement checks. `ApartmentDesignProposal/2` uses the same canonical hash and base scene revision:

```json
{
  "schema": "ApartmentDesignProposal/2",
  "canonical_sha256": "COPY_FROM_CURRENT_BRIEF",
  "base_scene_revision": "COPY_FROM_CURRENT_BRIEF",
  "author": "designer-agent",
  "operations": [
    {
      "type": "add-object",
      "object": {
        "id": "reception-art-01",
        "type": "artwork",
        "variant": "framed",
        "room_id": "RECP-01",
        "placement": {"mode": "wall", "host_wall_id": "COPY_A_USABLE_WALL_ID", "offset_mm": 0, "elevation_mm": 1200, "inset_mm": 1},
        "rotation": 0,
        "width_mm": 700,
        "depth_mm": 35,
        "height_mm": 500,
        "material_references": {"primary": "reference-art-warm"},
        "colour": "#dfd3bb",
        "status": "EXPLORATORY",
        "metadata": {}
      }
    }
  ],
  "notes": []
}
```

| Operation | Fields |
| --- | --- |
| room-option | Existing `room_id`, `key`, `value` |
| furniture-variant | Existing `furniture_id`, `variant` |
| furniture-placement | Existing `furniture_id`, optional `cx`, `cy`, `w`, `d`, `rot` |
| add-furniture | Full reversible furniture record: `id`, `type`, `name`, `cx`, `cy`, `w`, `d`, `rot`, `color`; optional `variant`, `status`, `material_id`, `product_reference_id` |
| update-furniture | `furniture_id` plus partial `changes` to name/placement/size/rotation/color/variant/status/material/product reference |
| remove-furniture | Existing `furniture_id`; removes furnishing only, never architecture |
| duplicate-furniture | Existing `furniture_id`, unique `new_id`, optional `cx`, `cy`, `rot` |
| set-furniture-material | `furniture_id`, `material_id` or `null`; material base colour also becomes the WebGL fallback colour |
| set-furniture-colour | `furniture_id`, hex `colour`; clears an explicit material assignment |
| add-object | Full `object` DTO |
| update-object | `object_id`, `changes`; IDs cannot be changed; nested `placement` or material references replace those fields |
| remove-object | `object_id` |
| upsert-material | Custom `material` DTO; built-in IDs cannot be overwritten |
| set-room-surface-material | `room_id`, `surface: floor|ceiling`, `material_id` or `null` to follow the existing finish |
| set-wall-surface-material | `host_wall_id`, `material_id` or `null` |
| set-opening-treatment | Existing `opening_id`, full `treatment` DTO or `null` |

Unknown operations/fields and architectural edits are rejected. Operations run on a clone and apply together as one undoable transaction. Cloud writes revalidate and compare both scene and storage revisions; current design and history commit atomically. Existing history retention and conflict-draft handling remain in place.

## Materials

`InteriorMaterial/1` supports `id`, `name`, `category`, `manufacturer`, `product_name`, `product_url`, `source_status` (REAL_PRODUCT / REAL_MATERIAL / REFERENCE / GENERIC), `physical_dimensions_mm`, `texture_scale_mm`, `base_colour`, `finish`, `roughness`, `metallic`, `albedo_texture`, `normal_map`, `roughness_map`, `reference_images`, and `notes`. Dimensions/scales use `{width,height,depth}` where applicable. A real product record requires its manufacturer, product name and source URL. References are not automatically verified manufacturer CAD.

Furniture may reference the same material registry through `material_id`. The conceptual WebGL scene always uses the material's base colour as a safe fallback; render briefs also carry the exact material descriptor and optional product reference so photorealistic rendering can honor texture/finish intent. `product_reference_id` is a reference hint, not manufacturer CAD certification.

Texture maps are optional. Maps use HTTPS or relative asset paths; albedo is sRGB, normal/roughness linear. Texture scale is applied in millimetres. Missing or failed maps leave physically sensible procedural/simple PBR materials visible. Existing eleven generic floor finishes remain usable through compatibility records. New material definitions can be imported in the viewer or proposed with `upsert-material`, without hard-coded room options. Cross-origin textures must permit anonymous CORS; otherwise they fall back so the canvas remains exportable. Built-in artwork is AI-created concept art and is labeled REFERENCE.

## Measured validation

`ApartmentInteriorValidation/1` has `status:PASS|WARNING|FAIL`, `valid`, a summary, checks, assumptions and limitations. Hard failures include invalid references/geometry, stale edits, architectural mutations, objects outside placement space, severe new overlaps, wall intersections and severely blocked access. Warnings remain reviewable and can be applied.

Checks cover occupied-volume overlap, wall faces, room fit, full displayed door sweeps, free opening/glazing frontage, nearest pair pinch candidates, circulation and operating space. Values are millimetres; negative collision values describe overlap. Host-mounted objects have a separate wall-face mounting gap. Opening width is a conservative projection through a 600 mm approach band. Full door sweeps use the adapter's INFERRED hinge convention and a 2-degree arc approximation. Operating clearance measures first obstruction across the item's front width, with inferred local +depth front direction and preferred depths requiring manufacturer review.

Circulation is reported separately from nearest pair gaps. A conservative widest-path search uses a 125 mm grid and an allowance for sampling. It estimates access-to-access or access-to-free-room-space routes. 900 mm is a comfort target and 750 mm a review threshold; these are planning assumptions, not code compliance or surveyed dimensions. Existing coarse furniture interfaces are reported as review warnings unless changed placement introduces a hard failure. A divider enters the same obstruction checks and walking collisions as furniture; it never enters the wall model.

## Exact saved camera pipeline

1. Save/sync the current design; position the 3D camera, show furnishings and choose full 2.50 m walls.
2. **Save view for AI render** captures the actual WebGL canvas as PNG, maximum 1600 px on its long side, with scene/storage revision, room, position, target, FOV, projection, viewport, timestamp and visible door/lighting settings.
3. Private image bytes are stored in R2; owner-scoped camera/revision metadata is stored in D1. Uploads compare the active scene/storage revision again at metadata commit. Failed saves preserve the capture for retry. Repeated view IDs must match image bytes and camera.
4. `get_saved_apartment_scene_view` returns the latest view (optionally filtered by room or view ID), metadata, whether it matches the current scene, and PNG MCP image content by default. `include_image:false` returns metadata only.
5. `create_apartment_render_brief` uses the latest saved view by default, or `saved_view_id`, and rejects a scene/room mismatch. It returns `ApartmentRenderBrief/2` with camera constraints, objects, materials, treatments and measured validation. If there is no saved view, `camera_reference_required:true` clearly indicates that image generation still needs the current screenshot. `use_saved_view:false` preserves a manual screenshot workflow.
6. Pass the retrieved PNG, render brief and plan to image generation. Keep framing, projection, openings, ceiling and object footprints visually constrained by that reference; compare the generated result for geometry drift before treating it as a faithful concept. The tool prepares the reference and prompt, not an image-generation service inside the viewer.

No photograph, grille visual, material reference or generic object proves construction dimensions, concealed HVAC fit, equipment service access or installation feasibility.

## Named variants

**Saved variants** keeps named furnishing/material snapshots with independent branch and scene revisions under the same canonical hash. Creating or updating a branch leaves the active design and other branches unchanged. Loading a branch makes a guarded copy into the active scene using normal design history, so the previous design remains recoverable. Edits autosave to the active design; **Update from current design** explicitly stores those edits in a named branch.

`get_apartment_design_context.saved_variants` lists the signed-in user's branch metadata. `save_apartment_design_variant` and `activate_apartment_design_variant` require current scene/storage revisions, the branch's expected revision and a request ID. Use expected variant revision zero when creating a new branch. Branch snapshots do not write new architectural facts.

## Verification

Agent-controlled captures are specified in [SCENE_CAPTURE.md](SCENE_CAPTURE.md). They share the manual scene-view schema and private storage, add no layout fields, and never write furnishing or architectural data. Both new capture tools require a configured headless provider; availability is exposed in the existing design context.

`npm run build` checks the canonical source hash and topology, then packages the viewer and Worker. `npm run check` exercises actual DOM controls and Three.js model generation, /1 and /2 contracts, analytical clearance examples, SQLite CAS/history, private R2-style PNG storage, stale capture rejection, branch independence and retry/error cases. Screenshot capture-path QA uses an explicit renderer stub; live browser/WebGL rendering was unavailable in this managed preview profile. No live user design is seeded or modified by these tests.
