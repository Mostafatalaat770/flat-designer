import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import * as domain from "../domain/browser.js";
import { createBuilders } from "./builders.js";
import { placeAsset } from "../assets/placement.js";
import { checkAsset, measureAsset } from "../assets/contract.mjs";

/** @param {HTMLElement} host @param {any} layout @param {(id:string)=>void} onSelect */
export function createEngine(host, layout, onSelect = () => {}) {
  const MODEL = domain.MODEL;
  if (
    MODEL.canonical_sha256 !==
    "734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658"
  )
    throw Error("Canonical geometry differs");
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    preserveDrawingBuffer: true,
  });
  renderer.setPixelRatio(1);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  host.append(renderer.domElement);
  renderer.domElement.setAttribute("aria-label", "Apartment 3D viewport");
  const scene = new THREE.Scene(),
    camera = new THREE.PerspectiveCamera(42, 1, 0.05, 300);
  const orbit = new OrbitControls(camera, renderer.domElement);
  orbit.enableDamping = true;
  orbit.maxPolarAngle = Math.PI * 0.495;
  orbit.minDistance = 0.25;
  orbit.maxDistance = 45;
  const hemi = new THREE.HemisphereLight(0xfff8ee, 0xb9a88f, 1.1),
    sun = new THREE.DirectionalLight(0xfff1dd, 2.6);
  sun.castShadow = true;
  sun.shadow.mapSize.setScalar(4096);
  Object.assign(sun.shadow.camera, {
    left: -11,
    right: 11,
    top: 11,
    bottom: -11,
    near: 1,
    far: 60,
  });
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.02;
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(160, 160),
    new THREE.MeshStandardMaterial({ color: 0xf2eee7, roughness: 1 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.015;
  ground.receiveShadow = true;
  scene.add(hemi, sun, sun.target, ground);
  const pm = new THREE.PMREMGenerator(renderer),
    roomEnv = new RoomEnvironment(),
    target = pm.fromScene(roomEnv, 0.04),
    envTex = target.texture;
  pm.dispose();
  roomEnv.dispose();
  const loadingManager = new THREE.LoadingManager();
  loadingManager.setURLModifier((url) =>
    url.startsWith("./art/") ? url.slice(1) : url,
  );
  let pending = 0;
  const assetErrors = new Set();
  loadingManager.onStart = () => {
    pending = 1;
  };
  loadingManager.onLoad = () => {
    pending = 0;
  };
  loadingManager.onError = (url) => assetErrors.add(url);
  const builders = createBuilders({
    THREE,
    RoundedBoxGeometry,
    MODEL,
    renderer,
    scene,
    camera,
    orbit,
    layout,
    domain,
    INTERIOR_MATERIALS: domain.INTERIOR_MATERIALS,
    hemi,
    sun,
    ground,
    envTex,
    loadingManager,
  });
  let currentLayout = layout,
    currentCamera,
    raf,
    disposed = false,
    paused = false,
    mode = "fixed",
    down = null,
    selected = null,
    selection = null,
    failures = [],
    imports = new Map(),
    assetGeneration = 0;
  const keys = new Set();
  function resize() {
    if (disposed) return;
    const w = host.clientWidth || 800,
      h = host.clientHeight || 500;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  resize();
  function setView(view) {
    currentCamera = structuredClone(view);
    camera.position.fromArray(view.position);
    orbit.target.fromArray(view.target);
    camera.fov = view.fov;
    camera.near = view.near;
    camera.far = view.far;
    camera.updateProjectionMatrix();
    camera.lookAt(orbit.target);
    orbit.enabled = false;
    mode = "fixed";
    for (const { root } of imports.values()) root.removeFromParent();
    builders.build(currentLayout, view.viewer);
    if (selection) {
      scene.remove(selection);
      selection.geometry.dispose();
      selection.material.dispose();
      selection = null;
    }
    applyImports();
  }
  function update(next) {
    currentLayout = next;
    for (const { root } of imports.values()) root.removeFromParent();
    builders.build(next, currentCamera?.viewer);
    applyImports();
  }
  function frame() {
    if (disposed) return;
    raf = requestAnimationFrame(frame);
    if (paused) return;
    if (mode === "orbit") orbit.update();
    if (mode === "walk") {
      const v = new THREE.Vector3();
      camera.getWorldDirection(v);
      v.y = 0;
      v.normalize();
      const side = new THREE.Vector3().crossVectors(
          v,
          new THREE.Vector3(0, 1, 0),
        ),
        delta = new THREE.Vector3();
      if (keys.has("w") || keys.has("ArrowUp")) delta.add(v);
      if (keys.has("s") || keys.has("ArrowDown")) delta.sub(v);
      if (keys.has("d")) delta.add(side);
      if (keys.has("a")) delta.sub(side);
      if (delta.lengthSq()) {
        delta.normalize().multiplyScalar(0.035);
        const x = camera.position.x + delta.x,
          z = camera.position.z + delta.z;
        if (!builders.blocked(x, camera.position.z)) camera.position.x = x;
        if (!builders.blocked(camera.position.x, z)) camera.position.z = z;
        camera.position.y = 1.7;
      }
    }
    renderer.render(scene, camera);
  }
  function pointerDown(e) {
    down = { x: e.clientX, y: e.clientY };
  }
  function pointerMove(e) {
    if (mode === "walk" && down && e.buttons) {
      const euler = new THREE.Euler().setFromQuaternion(
        camera.quaternion,
        "YXZ",
      );
      euler.y -= e.movementX * 0.003;
      euler.x = THREE.MathUtils.clamp(
        euler.x - e.movementY * 0.003,
        -1.35,
        1.35,
      );
      camera.quaternion.setFromEuler(euler);
    }
  }
  function pointerUp(e) {
    if (!down) return;
    const click = Math.hypot(e.clientX - down.x, e.clientY - down.y) < 5;
    down = null;
    if (!click || mode === "walk") return;
    const rect = renderer.domElement.getBoundingClientRect(),
      ray = new THREE.Raycaster();
    ray.setFromCamera(
      new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        (-(e.clientY - rect.top) / rect.height) * 2 + 1,
      ),
      camera,
    );
    const hit = ray
      .intersectObjects(builders.groups.furnG.children, true)
      .find((h) => h.object.userData.fid);
    if (hit) onSelect(hit.object.userData.fid);
  }
  function keyDown(e) {
    if (
      ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(
        document.activeElement?.tagName,
      )
    )
      return;
    if (
      mode === "walk" &&
      ["w", "a", "s", "d", "ArrowUp", "ArrowDown"].includes(e.key)
    ) {
      e.preventDefault();
      keys.add(e.key);
    }
  }
  function keyUp(e) {
    keys.delete(e.key);
  }
  renderer.domElement.addEventListener("pointerdown", pointerDown);
  renderer.domElement.addEventListener("pointermove", pointerMove);
  renderer.domElement.addEventListener("pointerup", pointerUp);
  window.addEventListener("keydown", keyDown);
  window.addEventListener("keyup", keyUp);
  function select(id) {
    selected = id;
    if (selection) {
      scene.remove(selection);
      selection.geometry.dispose();
      selection.material.dispose();
    }
    const o = builders.groups.furnG.children.find((o) => o.userData.fid === id);
    selection = o ? new THREE.BoxHelper(o, 0x657356) : null;
    if (selection) scene.add(selection);
  }
  function applyImports() {
    failures = [];
    for (const [id, { root }] of imports) {
      const f = currentLayout.furniture.find((f) => f.id === id);
      if (!f) continue;
      const entry = imports.get(id);
      try {
        measureAsset(
          entry.record.dimensions_mm.map((v) => v / 1000),
          entry.record,
          [f.w, f.d],
        );
      } catch (error) {
        failures.push(error.message);
        continue;
      }
      const fallback = builders.groups.furnG.children.find(
        (o) => o.userData.fid === id,
      );
      if (fallback) fallback.visible = false;
      root.position.set(
        (f.cx - MODEL.width_mm / 2) / 1000,
        0,
        (f.cy - MODEL.depth_mm / 2) / 1000,
      );
      root.rotation.y = (-f.rot * Math.PI) / 180;
      builders.groups.furnG.add(root);
    }
  }
  async function loadAsset(id, bytes, record) {
    checkAsset(record);
    const f = currentLayout.furniture.find((f) => f.id === id);
    if (!f) throw Error("Select an existing furniture item");
    if (
      ["tv", "acwall", "waterheater", "stove", "ksink", "baycushion"].includes(
        f.type,
      )
    )
      throw Error(
        "This asset importer places freestanding furniture. Mounted fixtures need their canonical mounting height.",
      );
    const generation = assetGeneration;
    const loader = new GLTFLoader();
    const gltf = await loader.parseAsync(bytes, "");
    const { root: wrapper, measured_mm } = placeAsset(gltf.scene, record, [
      f.w,
      f.d,
    ]);
    wrapper.position.set(
      (f.cx - MODEL.width_mm / 2) / 1000,
      0,
      (f.cy - MODEL.depth_mm / 2) / 1000,
    );
    wrapper.rotation.y = (-f.rot * Math.PI) / 180;
    wrapper.updateMatrixWorld(true);
    if (
      new THREE.Box3()
        .setFromObject(wrapper)
        .intersectsSphere(new THREE.Sphere(camera.position, 0.065))
    )
      throw Error(
        "This asset blocks the standing camera. Choose another saved view before importing.",
      );
    wrapper.traverse((o) => {
      o.userData.fid = id;
      if (o.isMesh) {
        o.castShadow = o.receiveShadow = true;
      }
    });
    if (generation !== assetGeneration || disposed)
      throw Error("Design changed while loading asset; import again");
    const old = imports.get(id);
    if (old) disposeTree(old.root);
    imports.set(id, { root: wrapper, record });
    applyImports();
    return { measured_mm, fidelity: record.fidelity };
  }
  function disposeTree(root) {
    root.traverse((o) => {
      o.geometry?.dispose();
      for (const m of [].concat(o.material || [])) {
        for (const v of Object.values(m)) if (v?.isTexture) v.dispose();
        m.dispose();
      }
    });
    root.removeFromParent();
  }
  async function exportScene() {
    if (
      Math.abs(camera.position.y - 1.7) > 0.00001 ||
      ![42, 60].includes(camera.fov)
    )
      throw Error(
        "Choose a saved 1.70 m eye-level view before exporting a render",
      );
    await apiReady();
    const exported = new THREE.Scene();
    exported.name = "Apartment Type B";
    const originals = [];
    let openingIndex = 0;
    for (const group of [
      builders.groups.archFloor,
      builders.groups.archUp,
      builders.groups.furnG,
      builders.groups.sceneDecorG,
      sun,
      hemi,
    ]) {
      group.traverse((o) => {
        originals.push([o, o.userData, o.name]);
        const u = o.userData;
        const safe = {};
        for (const k of [
          "fid",
          "room",
          "roomId",
          "interiorObjectId",
          "openingId",
          "ceilingFor",
          "approximate",
        ])
          if (u[k] !== undefined) safe[k] = u[k];
        if (u.wallSegment) {
          const i = MODEL.wall_segments.indexOf(u.wallSegment);
          safe.canonicalWallIndex = i;
          o.name = "canonical-wall-" + i;
        }
        if (u.door) {
          safe.door = {
            id: u.door.id,
            open: u.door.open,
            position: u.door.cur,
          };
          if (o.isMesh) o.name = "opening-" + u.door.id + "-" + openingIndex++;
        }
        if (u.openingId)
          o.name = "opening-" + u.openingId + "-" + openingIndex++;
        if (u.room && o.parent === builders.groups.archFloor)
          o.name = "floor-" + u.room;
        if (u.ceilingFor) o.name = "ceiling-" + u.ceilingFor;
        if (u.fid && o.parent === builders.groups.furnG)
          o.name = "furniture-" + u.fid;
        o.userData = safe;
      });
      try {
        exported.add(group.clone(true));
      } finally {
        for (const [o, data, name] of originals) {
          o.userData = data;
          o.name = name;
        }
        originals.length = 0;
      }
    }
    const cameraClone = camera.clone();
    cameraClone.name = "QA camera";
    cameraClone.aspect = 1600 / 857;
    cameraClone.updateProjectionMatrix();
    exported.add(cameraClone);
    exported.userData = {
      canonical_sha256: MODEL.canonical_sha256,
      scene_revision: domain.studioSceneKey(currentLayout),
      units: "m",
      clear_height_m: MODEL.height_m,
    };
    exported.updateMatrixWorld(true);
    const manifest = [];
    exported.traverse((o) => {
      if (
        o.userData.canonicalWallIndex !== undefined ||
        o.name.startsWith("furniture-") ||
        o.name.startsWith("opening-") ||
        o.name.startsWith("floor-") ||
        o.name.startsWith("ceiling-")
      ) {
        const p = new THREE.Vector3(),
          q = new THREE.Quaternion(),
          scale = new THREE.Vector3();
        o.matrixWorld.decompose(p, q, scale);
        const box = new THREE.Box3().setFromObject(o);
        manifest.push({
          name: o.name,
          position: p.toArray(),
          quaternion: q.toArray(),
          scale: scale.toArray(),
          bbox: { min: box.min.toArray(), max: box.max.toArray() },
          canonicalWallIndex: o.userData.canonicalWallIndex,
          furniture_id: o.userData.fid,
          opening_id: o.userData.openingId || o.userData.door?.id,
          floor_room_id: o.name.startsWith("floor-")
            ? o.userData.room
            : undefined,
          ceiling_room_id: o.userData.ceilingFor,
        });
      }
    });
    const binary = await new GLTFExporter().parseAsync(exported, {
      binary: true,
      onlyVisible: true,
    });
    return {
      binary,
      job: {
        schema: "ApartmentRenderJob/1",
        ...exported.userData,
        layout: structuredClone(currentLayout),
        camera: {
          ...cameraRecord(),
          aspect: 1600 / 857,
          viewport: { width: 1600, height: 857 },
        },
        canonical_geometry: {
          rooms: MODEL.rooms,
          wall_segments: MODEL.wall_segments,
          openings: MODEL.openings,
        },
        mesh_manifest: manifest,
        asset_records: [...imports.values()].map((v) => v.record),
        render: { width: 1600, height: 857, samples: 64, seed: 17 },
        engine: "Cycles",
        lighting_status:
          "EXPLORATORY — Three lights require Cycles calibration",
      },
    };
  }
  async function apiReady() {
    const deadline = performance.now() + 25000;
    while (pending) {
      if (performance.now() > deadline)
        throw Error("Material images did not finish loading");
      await new Promise((r) => setTimeout(r, 50));
    }
    if (assetErrors.size)
      throw Error("Material images failed: " + [...assetErrors].join(", "));
    await new Promise((r) =>
      requestAnimationFrame(() => requestAnimationFrame(r)),
    );
    renderer.render(scene, camera);
  }
  function cameraRecord() {
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    return {
      ...currentCamera,
      position: camera.position.toArray(),
      target: camera.position.clone().add(direction).toArray(),
      fov: camera.fov,
      aspect: camera.aspect,
      viewport: {
        width: renderer.domElement.width,
        height: renderer.domElement.height,
      },
    };
  }
  frame();
  return {
    update,
    setView,
    setPaused(value) { paused = Boolean(value); },
    select,
    applyAssetMaterial(id, variantId) {
      const entry = imports.get(id);
      const variant = entry?.record.material_variants?.find(
        (v) => v.id === variantId,
      );
      if (!variant) throw Error("Unknown asset material variant");
      let changed = 0;
      entry.root.traverse((o) => {
        for (const m of [].concat(o.material || [])) {
          const change = variant.changes.find(
            (c) => c.material_name === m.name,
          );
          if (change) {
            m.color.set(change.base_colour);
            if (change.roughness !== undefined) m.roughness = change.roughness;
            if (change.metalness !== undefined) m.metalness = change.metalness;
            m.needsUpdate = true;
            changed++;
          }
        }
      });
      if (!changed) throw Error("Material names do not match this GLB");
      entry.record.active_material_variant = variant.id;
      return variant;
    },
    scale: (visible) => builders.scale(visible),
    setLens(fov) {
      if (![42, 60].includes(fov)) throw Error("Natural42 or Wide60 only");
      camera.fov = fov;
      camera.updateProjectionMatrix();
    },
    setMode(next) {
      keys.clear();
      mode = next;
      orbit.enabled = next === "orbit";
      if (next === "walk") {
        camera.position.y = 1.7;
        camera.fov = 42;
        camera.updateProjectionMatrix();
      }
    },
    loadAsset,
    exportScene,
    screenshot: () => renderer.domElement.toDataURL("image/png"),
    inspect: () => ({
      canonical_sha256: MODEL.canonical_sha256,
      scene_revision: domain.studioSceneKey(currentLayout),
      fov: camera.fov,
      eye: camera.position.y,
      mode,
      scaleVisible: builders.groups.scaleRefG.visible,
      humanHeight: new THREE.Box3().setFromObject(
        new THREE.Group().add(
          ...builders.groups.scaleRefG.children
            .slice(0, 4)
            .map((o) => o.clone()),
        ),
      ).max.y,
      rulerHeight:
        builders.groups.scaleRefG.children[4].geometry.parameters.height,
      assetCount: imports.size,
      pendingTextures: pending,
      textureErrors: [...assetErrors],
      failures,
    }),
    ready: apiReady,
    dispose() {
      disposed = true;
      assetGeneration++;
      cancelAnimationFrame(raf);
      observer.disconnect();
      keys.clear();
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
      orbit.dispose();
      builders.dispose();
      imports.clear();
      target.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
}
