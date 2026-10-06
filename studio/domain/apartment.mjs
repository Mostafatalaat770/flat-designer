import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import crypto from "node:crypto";
import assert from "node:assert/strict";

export const LOCKED_CANONICAL =
  "734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658";
const clone = (value) => JSON.parse(JSON.stringify(value));
const freeze = (value) => {
  if (value && typeof value === "object") {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

// Compatibility boundary: execute the existing shared contracts unchanged.
// Nothing here imports the Worker or exposes storage/network methods.
export function createApartmentDomain(projectRoot) {
  const read = (file) => fs.readFileSync(path.join(projectRoot, file), "utf8");
  const source = read(
    "dist/sources/Apartment_Master_Spec_Type_B_v0.2.2_Geometry_Heights_Glazing(1).json",
  );
  assert.equal(
    crypto.createHash("sha256").update(source).digest("hex"),
    LOCKED_CANONICAL,
    "Canonical geometry changed",
  );
  const model = freeze(JSON.parse(read("dist/apartment-model.json")));
  assert.equal(model.canonical_sha256, LOCKED_CANONICAL);
  const context = vm.createContext({
    MODEL: model,
    INTERIOR_MATERIALS: JSON.parse(read("interior-materials.json")),
    structuredClone,
  });
  const errorClass = read("studio-storage.js").match(
    /^class StudioStorageError[^\n]+/m,
  )?.[0];
  assert.ok(errorClass, "Shared storage-error declaration missing");
  vm.runInContext(errorClass, context);
  for (const file of [
    "studio-core.js",
    "interior-core.js",
    "studio-cloud-core.js",
    "capture-camera.js",
  ]) {
    vm.runInContext(read(file), context, { filename: file });
  }
  function call(expression, values) {
    Object.assign(context, clone(values));
    return clone(vm.runInContext(expression, context));
  }
  const revision = (layout) => call("studioSceneKey(layout)", { layout });
  function validate(layout) {
    call("studioAssertLayout(layout,MODEL,INTERIOR_FURNITURE_TYPES)", {
      layout,
    });
    return call("interiorValidation(layout,MODEL)", { layout });
  }
  function importBrief(brief) {
    assert.equal(
      brief.schema,
      "ApartmentDesignBrief/1",
      "Expected ApartmentDesignBrief/1",
    );
    assert.equal(
      brief.canonical_sha256,
      LOCKED_CANONICAL,
      "Brief belongs to different geometry",
    );
    assert.equal(
      brief.scene_revision,
      revision(brief.layout),
      "Brief scene revision does not match its layout",
    );
    for (const key of ["rooms", "openings", "wall_segments"]) {
      if (brief[key])
        assert.deepEqual(
          brief[key],
          model[key],
          "Brief architecture differs: " + key,
        );
    }
    validate(brief.layout);
    return clone(brief.layout);
  }
  function applyProposal(base, proposal) {
    validate(base);
    const result = call("studioValidateProposal(proposal,layout,MODEL)", {
      proposal,
      layout: base,
    });
    assert.deepEqual(
      result.demolished,
      base.demolished,
      "Architectural mutations forbidden",
    );
    validate(result);
    return result;
  }
  function captureCamera(layout, input) {
    assert.ok(
      [42, 60].includes(input.fov),
      "Local QA uses Natural42 or named Wide60 views",
    );
    assert.equal(input.position[1], 1.7, "Standing QA eye height must be1.70m");
    const camera = call("studioCaptureCamera(input,layout,MODEL)", {
      input,
      layout,
    });
    return {
      ...camera,
      viewport: { width: 1600, height: 857 },
      aspect: 1600 / 857,
    };
  }
  return Object.freeze({
    model,
    revision,
    validate,
    importBrief,
    applyProposal,
    captureCamera,
    presetCamera: (layout, room_id, preset = "entry-overview") => {
      const c = call("studioCaptureCamera(input,layout,MODEL)", {
        input: { room_id, preset, fov: 42 },
        layout,
      });
      return captureCamera(layout, {
        room_id,
        position: [c.position[0], 1.7, c.position[2]],
        target: c.target,
        fov: 42,
      });
    },
    surfaces: () => call("interiorSurfaces(MODEL)", {}).surfaces,
    designBrief: (layout, catalog = []) =>
      call("studioDesignBrief(layout,MODEL,catalog)", { layout, catalog }),
    footprint: (item) => call("studioFootprint(item)", { item }),
    resolveObject: (item) => call("interiorResolved(item,MODEL)", { item }),
  });
}
