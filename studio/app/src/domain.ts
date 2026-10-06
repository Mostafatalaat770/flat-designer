import * as shared from "../../domain/browser.js";
import type { Brief, Layout, Validation, Camera } from "./types";
export const CANONICAL =
  "734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658";
export const model = shared.MODEL;
export const revision = (layout: Layout): string =>
  shared.studioSceneKey(layout);
export function validate(layout: Layout): Validation {
  shared.studioAssertLayout(layout, model, shared.INTERIOR_FURNITURE_TYPES);
  return shared.interiorValidation(layout, model);
}
export function importBrief(brief: Brief): Layout {
  if (brief.schema !== "ApartmentDesignBrief/1")
    throw Error("Import an ApartmentDesignBrief/1 export");
  if (brief.canonical_sha256 !== CANONICAL)
    throw Error("This brief uses a different canonical apartment");
  if (brief.scene_revision !== revision(brief.layout))
    throw Error("Brief revision does not match its layout");
  for (const key of ["rooms", "openings", "wall_segments"] as const)
    if (brief[key] && JSON.stringify(brief[key]) !== JSON.stringify(model[key]))
      throw Error("Imported architecture differs: " + key);
  validate(brief.layout);
  return structuredClone(brief.layout);
}
export function propose(layout: Layout, operations: unknown[]): Layout {
  const next = shared.studioValidateProposal(
    {
      schema: "ApartmentDesignProposal/2",
      canonical_sha256: CANONICAL,
      base_scene_revision: revision(layout),
      operations,
    },
    layout,
    model,
  );
  validate(next);
  return next;
}
export function brief(layout: Layout): Brief {
  return shared.studioDesignBrief(layout, model, []) as Brief;
}
export function verifyCamera(layout: Layout, camera: Camera) {
  return shared.studioCaptureCamera(camera, layout, model);
}
