import test from "node:test";
import assert from "node:assert/strict";
import { checkAsset, measureAsset } from "./contract.mjs";
const record = {
  schema: "ApartmentAsset/1",
  units: "m",
  up_axis: "+Y",
  forward_axis: "+Z",
  origin: "center-floor",
  dimensions_mm: [2000, 750, 950],
  fidelity: "GENERIC",
  source: "Local test mesh",
  license: "CC0-1.0",
  attribution: "Flat Designer",
};
test("exact outside dimensions pass without distortion", () =>
  assert.deepEqual(
    measureAsset([2, 0.75, 0.95], record, [2000, 950]),
    [2000, 750, 950],
  ));
test("wrong units or bounding boxes fail before use", () => {
  assert.throws(
    () => measureAsset([2000, 750, 950], record, [2000, 950]),
    /bounding box/,
  );
  assert.throws(
    () => measureAsset([2, 0.75, 0.95], record, [1800, 900]),
    /cannot be stretched/,
  );
  assert.throws(() => checkAsset({ ...record, units: "cm" }), /units/);
});
test("real products need reference and all assets need attribution and license", () => {
  assert.throws(
    () => checkAsset({ ...record, fidelity: "REAL_PRODUCT" }),
    /product_reference/,
  );
  assert.throws(() => checkAsset({ ...record, license: "" }), /license/);
  assert.throws(
    () =>
      checkAsset({
        ...record,
        license: "TBD",
        source: "TBD",
        attribution: "TBD",
      }),
    /actual/,
  );
});
