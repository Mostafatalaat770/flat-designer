import * as THREE from "three";
import { checkAsset, measureAsset } from "./contract.mjs";
export function placeAsset(scene, record, footprint) {
  checkAsset(record);
  const wrapper = new THREE.Group(),
    conversion = new THREE.Group();
  conversion.rotation.y = record.forward_axis === "+Z" ? 0 : Math.PI;
  conversion.scale.setScalar(record.units === "mm" ? 0.001 : 1);
  conversion.add(scene);
  wrapper.add(conversion);
  wrapper.updateMatrixWorld(true);
  const bbox = new THREE.Box3().setFromObject(wrapper),
    size = bbox.getSize(new THREE.Vector3());
  measureAsset(size.toArray(), record, footprint);
  conversion.position.sub(bbox.getCenter(new THREE.Vector3()));
  conversion.position.y += size.y / 2;
  wrapper.updateMatrixWorld(true);
  return {
    root: wrapper,
    measured_mm: size.toArray().map((v) => Math.round(v * 1000)),
  };
}
