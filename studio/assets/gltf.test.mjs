import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { genericDiningAsset } from "./demo.js";
import { placeAsset } from "./placement.js";
globalThis.FileReader = class {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((result) => {
      this.result = result;
      this.onloadend?.();
    });
  }
  readAsDataURL(blob) {
    blob.arrayBuffer().then((bytes) => {
      this.result =
        "data:" +
        blob.type +
        ";base64," +
        Buffer.from(bytes).toString("base64");
      this.onloadend?.();
    });
  }
};
test("actual generic GLB round-trips through r160 exporter/loader with exact dimensions", async () => {
  const asset = await genericDiningAsset();
  assert.equal(new DataView(asset.binary).getUint32(0, true), 0x46546c67);
  const gltf = await new GLTFLoader().parseAsync(asset.binary, "");
  const placed = placeAsset(gltf.scene, asset.record, [2000, 950]);
  assert.deepEqual(placed.measured_mm, [2000, 750, 950]);
  const b = new THREE.Box3().setFromObject(placed.root);
  assert.ok(Math.abs(b.min.y) < 0.00001);
  assert.ok(Math.abs(b.getCenter(new THREE.Vector3()).x) < 0.00001);
  assert.equal(asset.record.fidelity, "GENERIC");
});
test("millimetre conversion preserves source transforms and does not stretch", () => {
  const scene = new THREE.Group();
  scene.position.set(3000, 2000, -4000);
  scene.add(new THREE.Mesh(new THREE.BoxGeometry(2000, 750, 950)));
  const record = {
    schema: "ApartmentAsset/1",
    units: "mm",
    up_axis: "+Y",
    forward_axis: "-Z",
    origin: "center-floor",
    dimensions_mm: [2000, 750, 950],
    fidelity: "GENERIC",
    source: "Local fixture",
    license: "CC0-1.0",
    attribution: "Flat Designer",
  };
  const placed = placeAsset(scene, record, [2000, 950]);
  const b = new THREE.Box3().setFromObject(placed.root);
  assert.ok(Math.abs(b.min.y) < 0.00001);
  assert.ok(b.getCenter(new THREE.Vector3()).setY(0).length() < 0.00001);
  assert.equal(scene.scale.x, 1);
  assert.throws(
    () => placeAsset(scene.clone(), record, [1800, 900]),
    /cannot be stretched/,
  );
});
