// Authored local generic geometry: a pipeline sample, never a manufacturer product.
import * as THREE from "three";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
export async function genericDiningAsset() {
  const root = new THREE.Group();
  root.name = "Generic rounded dining table";
  const stone = new THREE.MeshStandardMaterial({
    color: "#dbd3c2",
    roughness: 0.58,
  });
  stone.name = "Limestone concept";
  const oak = new THREE.MeshStandardMaterial({
    color: "#ac8c65",
    roughness: 0.62,
  });
  oak.name = "Oak concept";
  const shape = new THREE.Shape();
  shape.absellipse(0, 0, 0.997, 0.472, 0, 2 * Math.PI, false, 0);
  const topGeometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.032,
    bevelEnabled: true,
    bevelSize: 0.003,
    bevelThickness: 0.004,
    bevelSegments: 4,
    steps: 1,
    curveSegments: 64,
  });
  topGeometry.rotateX(-Math.PI / 2);
  const top = new THREE.Mesh(topGeometry, stone);
  top.position.y = 0.714;
  root.add(top);
  for (const x of [-0.52, 0.52]) {
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.22, 0.69, 48),
      oak,
    );
    leg.scale.z = 0.8;
    leg.position.set(x, 0.345, 0);
    root.add(leg);
  }
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root),
    size = box.getSize(new THREE.Vector3());
  const record = {
    schema: "ApartmentAsset/1",
    units: "m",
    up_axis: "+Y",
    forward_axis: "+Z",
    origin: "center-floor",
    dimensions_mm: size.toArray().map((v) => Math.round(v * 1000)),
    fidelity: "GENERIC",
    source: "studio/assets/demo.js — locally authored pipeline sample",
    license: "CC0-1.0",
    attribution: "Flat Designer project",
    material_variants: [
      {
        id: "warm-stone",
        name: "Warm stone and oak",
        fidelity: "GENERIC",
        changes: [
          {
            material_name: "Limestone concept",
            base_colour: "#dbd3c2",
            roughness: 0.58,
          },
          {
            material_name: "Oak concept",
            base_colour: "#ac8c65",
            roughness: 0.62,
          },
        ],
      },
      {
        id: "ivory-walnut",
        name: "Ivory and walnut",
        fidelity: "GENERIC",
        changes: [
          {
            material_name: "Limestone concept",
            base_colour: "#e6e0d4",
            roughness: 0.65,
          },
          {
            material_name: "Oak concept",
            base_colour: "#785d43",
            roughness: 0.58,
          },
        ],
      },
    ],
  };
  return {
    binary: await new GLTFExporter().parseAsync(root, { binary: true }),
    record,
  };
}
