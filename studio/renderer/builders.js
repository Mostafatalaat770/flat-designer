// One-time extraction of the existing r160 scene builders. Architecture is supplied by MODEL.
// Do not regenerate this module from HTML: maintain source modules here. Classic stays as a parity reference.
export function createBuilders(scope) {
  const {
    THREE,
    RoundedBoxGeometry,
    MODEL,
    renderer,
    scene,
    camera,
    orbit,
    INTERIOR_MATERIALS,
  } = scope;
  const {
    studioCaptureCamera,
    studioCameraFits,
    studioCaptureSpace,
    studioCaptureInputs,
    studioCaptureCapability,
    APARTMENT_CAPTURE_COORDINATES,
    APARTMENT_CAPTURE_VIEWPORT,
    APARTMENT_CAPTURE_PRESETS,
    studioDesignBrief,
    studioPrepareCloudLayout,
    studioAssertLayout,
    studioLogicalKey,
    interiorRenderBrief,
    interiorContext,
    studioValidateProposal,
    interiorProposalFurnitureIds,
    interiorCirculation,
    interiorApplyProposal,
    interiorOperatingDistance,
    interiorClip,
    interiorValidation,
    interiorOpeningWidth,
    interiorDoorSector,
    interiorSolids,
    interiorFlat,
    interiorLegacyItem,
    interiorPenetration,
    interiorPolygonGap,
    interiorSegmentDistance,
    interiorFits,
    interiorContains,
    interiorAssertLayer,
    interiorResolved,
    interiorForgetFurniture,
    interiorFurnitureMaterial,
    interiorAssertFurniture,
    interiorAssertMaterial,
    interiorSurfaces,
    interiorSurfacesCache,
    interiorMaterial,
    interiorMaterials,
    interiorUrl,
    interiorLayer,
    interiorDefaults,
    interiorRound,
    interiorClone,
    interiorColour,
    interiorObject,
    interiorObjectId,
    INTERIOR_FURNITURE_TYPES,
    INTERIOR_OBJECT_TYPES,
    studioRenderBrief,
    studioValidateProposalV1,
    studioOverlaps,
    studioDistanceToSegment,
    studioFit,
    studioFootprint,
    studioInside,
    studioSceneKey,
    studioNormalize,
    studioValidateOption,
    studioRoomOptions,
    studioRoomDefaults,
    studioDefaults,
    STUDIO_VARIANTS,
    STUDIO_OPTIONS,
  } = scope.domain;
  let state = scope.layout;
  const COARSE = false;
  const ROOMS = MODEL.rooms,
    WALL_SEGMENTS = MODEL.wall_segments,
    WINS = MODEL.wins,
    DOORS = MODEL.doors,
    SLIDES = MODEL.slides,
    PASSAGES = MODEL.passages;
  const OX = MODEL.width_mm / 2,
    OY = MODEL.depth_mm / 2,
    H = MODEL.height_m,
    wx = (x) => (x - OX) / 1000,
    wz = (y) => (y - OY) / 1000,
    M = (v) => v / 1000;
  const opt = {
    cut: H,
    furn: true,
    labels: false,
    night: false,
    hour: 10,
    mode: "orbit",
  };
  let archFloor = new THREE.Group(),
    archUp = new THREE.Group(),
    furnG = new THREE.Group(),
    labelG = new THREE.Group(),
    lampG = new THREE.Group(),
    sceneDecorG = new THREE.Group(),
    scaleRefG,
    colliders = [],
    selKey = null;
  let inited = true,
    grow = 1,
    furnGrow = 1;
  const doors = [];
  const { hemi, sun, ground } = scope;
  let glassMat, wallMat, capMat, frameMat;
  const pointInRoom = (p, poly) => scope.domain.studioInside(p, poly);
  const MATS = {
    wood: { name: "橡木地板", price: 320, sw: "#d8b88a" },
    walnut: { name: "胡桃木地板", price: 380, sw: "#9b7250" },
    tile800: { name: "800 地砖", price: 220, sw: "#ebe6dc" },
    tile600: { name: "600 地砖", price: 160, sw: "#dfe3e1" },
    marble: { name: "大理石", price: 650, sw: "#f1eee8" },
    antislip: { name: "300 防滑砖", price: 140, sw: "#d3d8d4" },
    terrazzo: { name: "水磨石", price: 280, sw: "#e6dfd3" },
    carpet: { name: "满铺地毯", price: 200, sw: "#c9c3d3" },
  };
  const LIB = [
    {
      cat: "卧室",
      items: [
        ["bed", "双人床 1.8m", 1800, 2000, "#c9d6df"],
        ["bed", "双人床 1.5m", 1500, 2000, "#d8c7dc"],
        ["bed", "单人床", 1200, 2000, "#e8d5b5"],
        ["crib", "婴儿床", 1250, 700, "#efe3d0"],
        ["nightstand", "床头柜", 450, 400, "#e8dccb"],
        ["wardrobe", "衣柜", 2000, 600, "#efe6d8"],
        ["wardrobe", "小衣柜", 1200, 550, "#efe6d8"],
        ["dresser", "梳妆台", 1000, 450, "#efe6d8"],
        ["desk", "书桌", 1200, 600, "#e2cfb4"],
        ["chair", "椅子", 450, 480, "#cfc6b8"],
        ["bookshelf", "书架", 800, 300, "#e2cfb4"],
        ["baycushion", "飘窗垫", 520, 1800, "#e7dccd"],
      ],
    },
    {
      cat: "客厅",
      items: [
        ["sofa", "三人沙发", 2400, 900, "#b7c4b0"],
        ["sofa", "双人沙发", 1700, 880, "#c3cbd6"],
        ["cornersofa", "转角沙发", 2800, 1700, "#b7c4b0"],
        ["armchair", "单人沙发", 850, 850, "#d6b99a"],
        ["beanbag", "懒人沙发", 800, 800, "#e0b98f"],
        ["coffeetable", "茶几", 1300, 650, "#e8dccb"],
        ["sidetable", "边几", 500, 500, "#d9c3a3"],
        ["tvstand", "电视柜", 2400, 400, "#e2cfb4"],
        ["rug", "地毯", 2400, 1700, "#d9cbb8"],
        ["shoecab", "鞋柜", 1000, 350, "#efe6d8"],
        ["shoecab", "玄关柜", 1400, 380, "#e6dccc"],
        ["floorlamp", "落地灯", 450, 450, "#3d3a34"],
        ["plant", "绿植", 500, 500, "#a9c39b"],
        ["plant", "大绿植", 700, 700, "#9dbb8c"],
      ],
    },
    {
      cat: "餐厨",
      items: [
        ["table", "餐桌", 1400, 800, "#e2cfb4"],
        ["table", "六人餐桌", 1800, 900, "#d8c2a2"],
        ["roundtable", "圆桌", 1000, 1000, "#e2cfb4"],
        ["chair", "餐椅", 450, 480, "#cfc6b8"],
        ["island", "岛台", 1800, 900, "#e9e5de"],
        ["barstool", "吧椅", 420, 420, "#6b5d4c"],
        ["counter", "橱柜台面", 1600, 600, "#e9e5de"],
        ["stove", "燃气灶", 750, 450, "#dcdcdc"],
        ["ksink", "水槽", 800, 450, "#e1e6ea"],
        ["fridge", "冰箱", 700, 700, "#dfe4e8"],
        ["cabinet", "餐边柜", 1600, 400, "#efe6d8"],
      ],
    },
    {
      cat: "卫浴",
      items: [
        ["toilet", "马桶", 400, 700, "#ffffff"],
        ["vanity", "浴室柜", 800, 500, "#eef1f3"],
        ["vanity", "双盆浴室柜", 1200, 500, "#eef1f3"],
        ["shower", "淋浴房", 900, 900, "#e4edf2"],
        ["bathtub", "浴缸", 1600, 750, "#eef3f6"],
        ["washer", "洗衣机", 600, 600, "#e6ebee"],
        ["waterheater", "电热水器", 800, 450, "#f4f4f2"],
        ["cabinet", "储物柜", 1000, 400, "#efe6d8"],
      ],
    },
    {
      cat: "家电",
      items: [
        ["tv", "65 寸电视", 1450, 80, "#1d1d1f"],
        ["tv", "55 寸电视", 1230, 80, "#1d1d1f"],
        ["fridge", "对开门冰箱", 910, 700, "#c9ced3"],
        ["aircon", "柜机空调", 500, 380, "#f6f7f8"],
        ["acwall", "挂机空调", 900, 250, "#f6f7f8"],
        ["dishwasher", "洗碗机", 600, 600, "#c9ced3"],
        ["ovencol", "蒸烤箱高柜", 600, 600, "#efe6d8"],
        ["dryer", "烘干机", 600, 600, "#e6ebee"],
        ["purifier", "空气净化器", 400, 300, "#f4f4f2"],
      ],
    },
    {
      cat: "书房 · 休闲",
      items: [
        ["desk", "长书桌", 1600, 700, "#d8c2a2"],
        ["officechair", "办公椅", 620, 620, "#4a4f55"],
        ["bookshelf", "大书架", 1600, 350, "#e2cfb4"],
        ["piano", "立式钢琴", 1500, 600, "#1f1d1b"],
        ["treadmill", "跑步机", 800, 1800, "#3a3a3c"],
        ["armchair", "阅读椅", 750, 800, "#c9a98a"],
      ],
    },
  ];
  const typeColor = (t) => {
    for (const c of LIB) for (const i of c.items) if (i[0] === t) return i[4];
    return "#eee";
  };
  const DECOR_THEMES = [
    {
      id: "custom",
      name: "Your design",
      description: "Your own finishes and furniture colours.",
      palette: [
        ["Walls", "#f4f7fa"],
        ["Oak", "#d8b88a"],
        ["Fabric", "#c9d6df"],
        ["Accent", "#8aa18d"],
      ],
    },
    {
      id: "warm",
      name: "Warm Contemporary",
      description:
        "Rounded upholstery, fluted wood, stone tables, oak parquet and sculptural lighting.",
      wall: "#f1e9df",
      ceiling: "#faf6ee",
      wood: "#a5825c",
      woodDark: "#64503b",
      fabric: "#c8b8a3",
      accent: "#69755c",
      rug: "#d9c7ab",
      metal: "#887351",
      pot: "#c9a384",
      floor: "parquet",
      kitchenFloor: "tile800",
      wetFloor: "tile800",
      palette: [
        ["Walls", "#f1e9df"],
        ["Oak", "#d8b88a"],
        ["Fabric", "#c8b8a3"],
        ["Olive", "#69755c"],
      ],
    },
    {
      id: "japandi",
      name: "Japandi",
      description:
        "Exposed oak frames, low platform beds, linen, wide pale planks and paper lanterns.",
      wall: "#e8e6df",
      ceiling: "#f6f4ee",
      wood: "#c4ad86",
      woodDark: "#615647",
      fabric: "#d5d0c5",
      accent: "#565f54",
      rug: "#cbc8bc",
      metal: "#3d403b",
      pot: "#b6b4a7",
      floor: "lightoak",
      kitchenFloor: "tile600",
      wetFloor: "tile600",
      palette: [
        ["Walls", "#e8e6df"],
        ["Pale oak", "#e0d0b3"],
        ["Fabric", "#d5d0c5"],
        ["Charcoal", "#3d403b"],
      ],
    },
    {
      id: "boho",
      name: "Modern Bohemian",
      description:
        "Woven cane furniture, arched headboards, terracotta textiles, limestone and wicker lighting.",
      wall: "#eddfc9",
      ceiling: "#f7eddc",
      wood: "#996f49",
      woodDark: "#573e2b",
      fabric: "#dfc99f",
      accent: "#ac6348",
      rug: "#bb6c48",
      metal: "#79613f",
      pot: "#af704e",
      floor: "travertine",
      kitchenFloor: "terrazzo",
      wetFloor: "terrazzo",
      pattern: true,
      palette: [
        ["Walls", "#eddfc9"],
        ["Walnut", "#9b7250"],
        ["Linen", "#dfc99f"],
        ["Terracotta", "#ac6348"],
      ],
    },
  ];
  MATS.lightoak = { name: "Pale oak flooring", sw: "#e0d0b3" };
  MATS.parquet = { name: "Oak parquet", sw: "#c9a678" };
  MATS.travertine = { name: "Limestone / travertine", sw: "#dfcfb4" };
  function currentDecor() {
    return (
      DECOR_THEMES.find((t) => t.id === state.decor.active) || DECOR_THEMES[0]
    );
  }
  function decorSurface(key, fallback) {
    return currentDecor()[key] || fallback;
  }
  function decorFurnitureColour(f, theme) {
    const original =
      state.decor.saved.custom?.colours?.[f.id] ||
      MODEL.starter_furniture.find((x) => x.id === f.id)?.color ||
      typeColor(f.type);
    if (theme.id === "custom") return original;
    if (["sofa", "cornersofa", "bed", "baycushion"].includes(f.type))
      return theme.fabric;
    if (["chair", "armchair", "beanbag", "barstool"].includes(f.type))
      return theme.accent;
    if (f.type === "rug") return theme.rug;
    if (f.type === "floorlamp") return theme.metal;
    if (
      [
        "wardrobe",
        "cabinet",
        "shoecab",
        "nightstand",
        "dresser",
        "desk",
        "bookshelf",
        "coffeetable",
        "tvstand",
        "table",
        "roundtable",
        "counter",
        "island",
        "ovencol",
        "crib",
        "sidetable",
        "vanity",
      ].includes(f.type)
    )
      return theme.wood;
    return original;
  }
  const matCache = new Map();
  let envTex = null,
    envK = 1;
  function mat(color, o = {}) {
    const key = color + JSON.stringify(o);
    if (!matCache.has(key)) {
      const m = new THREE.MeshStandardMaterial({ color, roughness: 0.7, ...o });
      // 金属 / 光滑表面挂环境反射，墙面等哑光材质不挂，避免整体变亮
      if (envTex && (m.metalness > 0 || m.roughness < 0.4)) {
        m.envMap = envTex;
        m.userData.env = m.metalness > 0.5 ? 1 : 0.5;
        m.envMapIntensity = m.userData.env * envK;
      }
      matCache.set(key, m);
    }
    return matCache.get(key);
  }
  function rng(seed) {
    return () => {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rgbK = (hex, k) => {
    const n = parseInt(hex.slice(1), 16);
    const f = (v) => Math.max(0, Math.min(255, Math.round(v * k)));
    return `rgb(${f((n >> 16) & 255)},${f((n >> 8) & 255)},${f(n & 255)})`;
  };
  // 地面贴图按真实尺寸平铺（UV 单位 = 米）
  const TEX = {
    parquet: { sx: 1.2, sy: 1.2, base: "#c9a678", rough: 0.58 },
    travertine: {
      sx: 1.2,
      sy: 0.6,
      base: "#dfcfb4",
      grout: "#c6b798",
      rough: 0.62,
    },
    lightoak: { sx: 2.2, sy: 0.4, base: "#e0d0b3", rough: 0.65 },
    wood: { sx: 1.8, sy: 0.36, base: "#d6b58a", rough: 0.55 },
    walnut: { sx: 1.8, sy: 0.36, base: "#9a6f4b", rough: 0.5 },
    tile800: {
      sx: 0.8,
      sy: 0.8,
      base: "#ebe6dd",
      grout: "#cfc6b7",
      rough: 0.3,
    },
    tile600: {
      sx: 0.6,
      sy: 0.6,
      base: "#dfe3e0",
      grout: "#bfc6c1",
      rough: 0.35,
    },
    antislip: {
      sx: 0.3,
      sy: 0.3,
      base: "#d3d8d4",
      grout: "#aab2ac",
      rough: 0.8,
    },
    marble: {
      sx: 1.2,
      sy: 1.2,
      base: "#f2efe9",
      grout: "#d9d2c4",
      rough: 0.18,
    },
    terrazzo: { sx: 0.5, sy: 0.5, base: "#e6dfd3", rough: 0.4 },
    carpet: { sx: 0.3, sy: 0.3, base: "#c6bfd2", rough: 1 },
  };
  const floorMats = {};
  function floorMat(kind) {
    if (floorMats[kind]) return floorMats[kind];
    const s = TEX[kind] || TEX.tile800,
      R = rng(kind.length * 977 + 13),
      cv = document.createElement("canvas");
    const wood = kind === "wood" || kind === "walnut" || kind === "lightoak";
    cv.width = wood ? 1024 : 512;
    cv.height = wood ? 205 : 512;
    const g = cv.getContext("2d"),
      W = cv.width,
      Hh = cv.height;
    g.fillStyle = s.base;
    g.fillRect(0, 0, W, Hh);
    if (sceneFloorPaint(kind, g, W, Hh, s, R)) {
    } else if (wood) {
      const rowH = Hh / 2,
        joints = [[(W * 2) / 3], [W / 3]];
      for (let r = 0; r < 2; r++) {
        let x0 = 0;
        [...joints[r], W].forEach((x1) => {
          g.fillStyle = rgbK(s.base, 0.9 + R() * 0.2);
          g.fillRect(x0, r * rowH, x1 - x0, rowH);
          g.strokeStyle = rgbK(s.base, 0.8);
          g.globalAlpha = 0.35;
          g.lineWidth = 1.2;
          for (let k = 0; k < 7; k++) {
            const y = r * rowH + 6 + R() * (rowH - 12);
            g.beginPath();
            g.moveTo(x0, y);
            for (let x = x0; x <= x1; x += 40)
              g.lineTo(x, y + Math.sin(x * 0.02 + k) * 2.5);
            g.stroke();
          }
          g.globalAlpha = 1;
          g.fillStyle = rgbK(s.base, 0.62);
          g.fillRect(x1 - 1.5, r * rowH, 3, rowH);
          x0 = x1;
        });
        g.fillStyle = rgbK(s.base, 0.62);
        g.fillRect(0, r * rowH, W, 2.5);
      }
    } else if (kind === "marble") {
      g.strokeStyle = "rgba(160,150,135,.35)";
      for (let k = 0; k < 6; k++) {
        g.lineWidth = 1 + R() * 3;
        g.beginPath();
        g.moveTo(R() * W, 0);
        g.bezierCurveTo(R() * W, R() * Hh, R() * W, R() * Hh, R() * W, Hh);
        g.stroke();
      }
    } else if (kind === "terrazzo") {
      const cs = ["#b9a58c", "#8fa3a0", "#c9b7a2", "#a88f76", "#7e8a86"];
      for (let k = 0; k < 160; k++) {
        g.fillStyle = cs[k % 5];
        g.beginPath();
        g.arc(R() * W, R() * Hh, 2 + R() * 7, 0, 7);
        g.fill();
      }
    } else {
      for (let k = 0; k < 1500; k++) {
        g.fillStyle = `rgba(0,0,0,${R() * 0.04})`;
        g.fillRect(R() * W, R() * Hh, 2, 2);
      }
    }
    if (s.grout) {
      g.fillStyle = s.grout;
      g.fillRect(0, 0, W, 3);
      g.fillRect(0, 0, 3, Hh);
    }
    const t = new THREE.CanvasTexture(cv);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1 / s.sx, 1 / s.sy);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return (floorMats[kind] = sceneFloorMaterial(t, s));
  }

  /* ======================= 几何小工具（y = 底面高度） ======================= */
  const asMat = (m) => (typeof m === "string" ? mat(m) : m);
  const sh = (o) => {
    o.castShadow = o.receiveShadow = true;
    return o;
  };
  const mesh = (geo, m) => sh(new THREE.Mesh(geo, asMat(m)));
  const rot = (o, x = 0, y = 0, z = 0) => {
    o.rotation.set(x, y, z);
    return o;
  };
  function box(w, h, d, m, x = 0, y = 0, z = 0) {
    const o = mesh(new THREE.BoxGeometry(w, h, d), m);
    o.position.set(x, y + h / 2, z);
    return o;
  }
  function rbox(w, h, d, m, x = 0, y = 0, z = 0, r = 0.04) {
    const o = mesh(
      new RoundedBoxGeometry(
        w,
        h,
        d,
        3,
        Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001),
      ),
      m,
    );
    o.position.set(x, y + h / 2, z);
    return o;
  }
  function cyl(rt, rb, h, m, x = 0, y = 0, z = 0, seg = 28) {
    const o = mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m);
    o.position.set(x, y + h / 2, z);
    return o;
  }
  // 旋转体：pts = [[半径, 高度], …] 自下而上，y = 底面
  function lathe(pts, m, x = 0, y = 0, z = 0, seg = 40) {
    const o = mesh(
      new THREE.LatheGeometry(
        pts.map(([r, h]) => new THREE.Vector2(Math.max(r, 1e-4), h)),
        seg,
      ),
      m,
    );
    o.position.set(x, y, z);
    return o;
  }
  // 两点之间的圆杆，r0 在 a 端、r1 在 b 端（收分椅腿、斜撑）
  function rod(a, b, r0, m, r1 = r0, seg = 12) {
    const A = new THREE.Vector3(...a),
      B = new THREE.Vector3(...b),
      o = mesh(new THREE.CylinderGeometry(r1, r0, A.distanceTo(B), seg), m);
    o.position.copy(A).add(B).multiplyScalar(0.5);
    o.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      B.sub(A).normalize(),
    );
    return o;
  }
  // 沿曲线的圆管（水龙头、扶手、灯臂）
  const tube = (pts, r, m, seg = 40) =>
    mesh(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(
          pts.map((p) => new THREE.Vector3(...p)),
          false,
          "centripetal",
        ),
        seg,
        r,
        10,
      ),
      m,
    );
  // 椭球（靠垫、叶片、豆袋），y = 中心
  function blob(rx, ry, rz, m, x = 0, y = 0, z = 0, seg = 24) {
    const o = mesh(new THREE.SphereGeometry(1, seg, Math.round(seg * 0.7)), m);
    o.scale.set(rx, ry, rz);
    o.position.set(x, y, z);
    return o;
  }
  // 水平圆环，y = 中心
  function ring(R, r, m, x = 0, y = 0, z = 0) {
    const o = mesh(new THREE.TorusGeometry(R, r, 10, 48), m);
    o.rotation.x = Math.PI / 2;
    o.position.set(x, y, z);
    return o;
  }
  function rrect(w, d, r) {
    const s = new THREE.Shape(),
      x = -w / 2,
      y = -d / 2;
    r = Math.min(r, w / 2 - 0.001, d / 2 - 0.001);
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y);
    s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + d - r);
    s.quadraticCurveTo(x + w, y + d, x + w - r, y + d);
    s.lineTo(x + r, y + d);
    s.quadraticCurveTo(x, y + d, x, y + d - r);
    s.lineTo(x, y + r);
    s.quadraticCurveTo(x, y, x + r, y);
    return s;
  }
  // 中空圆角框（浴缸、水槽沿、椅背框）：外 w×d、壁厚 t、高 h
  function shell(w, d, h, t, r, m, x = 0, y = 0, z = 0) {
    const s = rrect(w, d, r);
    s.holes.push(rrect(w - 2 * t, d - 2 * t, Math.max(0.004, r - t)));
    const geo = new THREE.ExtrudeGeometry(s, {
      depth: h,
      bevelEnabled: false,
      curveSegments: 10,
    });
    geo.rotateX(-Math.PI / 2);
    const o = mesh(geo, m);
    o.position.set(x, y, z);
    return o;
  }
  const darker = (hex, k = 0.8) =>
    "#" + new THREE.Color(hex).multiplyScalar(k).getHexString();
  const lighter = (hex, k = 0.2) =>
    "#" +
    new THREE.Color(hex).lerp(new THREE.Color("#ffffff"), k).getHexString();
  // 四条收分腿：inset 为距边距离，r 为腿底半径（顶部略粗）
  const legs = (g, w, d, h, m, inset = 0.05, r = 0.02) =>
    [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ].forEach(([a, b]) =>
      g.add(
        rod(
          [a * (w / 2 - inset), 0, b * (d / 2 - inset)],
          [a * (w / 2 - inset), h, b * (d / 2 - inset)],
          r * 0.7,
          m,
          r,
        ),
      ),
    );
  const metal = () => mat("#cfd2d4", { metalness: 0.9, roughness: 0.25 });
  const chrome = () => mat("#eef0f2", { metalness: 1, roughness: 0.08 });
  const hwMat = () =>
    mat(decorSurface("metal", "#b9b3a8"), { metalness: 0.85, roughness: 0.3 });
  const blackMetal = () => mat("#2b2b2d", { metalness: 0.6, roughness: 0.4 });
  const mirror = () => mat("#dfeaee", { metalness: 0.55, roughness: 0.06 });
  const ceramic = (o = {}) => mat("#fbfbf9", { roughness: 0.12, ...o });
  const fabric = (c) => sceneSurface("linen", c);
  const woodM = (c) => sceneSurface("wood", c);
  const screenMat = (glow = "#1a2636") =>
    mat("#0b0e13", {
      roughness: 0.1,
      metalness: 0.3,
      emissive: glow,
      emissiveIntensity: 0.35,
    });
  const glowMat = (c = "#fff4dc", e = "#ffdca0", k = 0.5) =>
    mat(c, {
      emissive: e,
      emissiveIntensity: k,
      roughness: 0.9,
      side: THREE.DoubleSide,
    });

  // 拉手：y 为拉手中心，z 为门板正面
  function pull(g, len, vert, x, y, z) {
    const m = hwMat(),
      o = new THREE.Group();
    o.add(
      vert
        ? box(0.01, len, 0.01, m, 0, -len / 2, 0.028)
        : box(len, 0.01, 0.01, m, 0, -0.005, 0.028),
    );
    [-1, 1].forEach((s) =>
      o.add(
        vert
          ? box(0.008, 0.008, 0.028, m, 0, s * (len / 2 - 0.015) - 0.004, 0.014)
          : box(0.008, 0.008, 0.028, m, s * (len / 2 - 0.015), -0.004, 0.014),
      ),
    );
    o.position.set(x, y, z);
    g.add(o);
  }
  function knob(g, x, y, z) {
    const k = cyl(0.011, 0.014, 0.02, hwMat(), x, y - 0.01, z + 0.01, 16);
    k.rotation.x = Math.PI / 2;
    g.add(k, blob(0.014, 0.014, 0.008, hwMat(), x, y, z + 0.022, 12));
  }
  // 柜门 / 抽屉面板：x0..x0+w、y0..y0+h 区域内 nx 列 × ny 行，正面朝 +z（z = 柜体正面）
  // hd：'bar' 金属拉手 | 'knob' 圆钮 | 'edge' 顶部隐形拉槽 | 'none'；hy：门拉手中心高度（null = 面板中部）
  function fronts(g, x0, y0, w, h, z, nx, ny, m, hd = "bar", hy = null) {
    const gap = 0.005,
      pw = w / nx,
      ph = h / ny,
      fz = z + 0.018;
    g.add(box(w, h, 0.002, "#2a2724", x0 + w / 2, y0, z + 0.001)); // 缝隙里透出的暗色
    for (let i = 0; i < nx; i++)
      for (let j = 0; j < ny; j++) {
        const cx = x0 + pw * (i + 0.5),
          yb = y0 + ph * j,
          drawer = ph < 0.4 && pw >= ph;
        g.add(
          rbox(
            pw - gap,
            ph - gap,
            0.018,
            m,
            cx,
            yb + gap / 2,
            z + 0.009,
            0.003,
          ),
        );
        if (hd === "none") continue;
        if (hd === "edge") {
          g.add(
            box(
              pw - 0.05,
              0.01,
              0.006,
              "#3c3a37",
              cx,
              yb + ph - gap - 0.018,
              fz,
            ),
          );
          continue;
        }
        if (drawer) {
          hd === "knob"
            ? knob(g, cx, yb + ph / 2, fz)
            : pull(g, Math.min(0.3, pw * 0.45), false, cx, yb + ph / 2, fz);
          continue;
        }
        const len = Math.min(0.45, ph * 0.35),
          hx =
            nx === 1
              ? cx + pw / 2 - 0.045
              : i % 2
                ? cx - pw / 2 + 0.04
                : cx + pw / 2 - 0.04;
        const y = Math.min(
          yb + ph - 0.05 - len / 2,
          Math.max(yb + 0.05 + len / 2, hy ?? yb + ph / 2),
        );
        hd === "knob" ? knob(g, hx, y, fz) : pull(g, len, true, hx, y, fz);
      }
  }
  const vasePts = (r, h) => [
    [0, 0],
    [r * 0.65, 0],
    [r, h * 0.32],
    [r * 0.92, h * 0.62],
    [r * 0.42, h * 0.86],
    [r * 0.5, h],
  ];
  function vase(g, x, y, z, r, h, c, R, flowers = true) {
    g.add(
      lathe(
        vasePts(r, h),
        mat(c, { roughness: 0.35, side: THREE.DoubleSide }),
        x,
        y,
        z,
        32,
      ),
    );
    if (!flowers) return;
    const cols = ["#f3e6d8", "#e8b4a0", "#f6d27a", "#ffffff"];
    for (let k = 0; k < 5; k++) {
      const a = k * 1.26 + R() * 0.4,
        s = 0.03 + R() * 0.05,
        top = [
          x + Math.cos(a) * s,
          y + h + 0.12 + R() * 0.14,
          z + Math.sin(a) * s,
        ];
      g.add(
        rod([x, y + h * 0.6, z], top, 0.003, "#6f8f4a", 0.003, 6),
        blob(0.022, 0.018, 0.022, cols[k % 4], ...top, 12),
      );
    }
  }
  function tableLamp(g, x, y, z, s = 1) {
    g.add(
      lathe(
        [
          [0, 0],
          [0.06 * s, 0],
          [0.075 * s, 0.05 * s],
          [0.08 * s, 0.12 * s],
          [0.055 * s, 0.2 * s],
          [0.018 * s, 0.25 * s],
          [0.012 * s, 0.3 * s],
        ],
        ceramic({ roughness: 0.3 }),
        x,
        y,
        z,
        32,
      ),
    );
    g.add(
      lathe(
        [
          [0.13 * s, 0],
          [0.1 * s, 0.18 * s],
        ],
        glowMat("#f6ecd9", "#ffdca0", 0.35),
        x,
        y + 0.26 * s,
        z,
        40,
      ),
      blob(
        0.03 * s,
        0.03 * s,
        0.03 * s,
        glowMat("#fff", "#ffe2b0", 1),
        x,
        y + 0.31 * s,
        z,
        12,
      ),
    );
  }
  const plate = (g, r, x, y, z) =>
    g.add(
      lathe(
        [
          [0, 0],
          [r * 0.6, 0],
          [r * 0.72, 0.008],
          [r, 0.02],
        ],
        ceramic({ side: THREE.DoubleSide }),
        x,
        y,
        z,
        32,
      ),
    );

  /* ======================= 家具模型（局部坐标：背面朝 -z） ======================= */
  /* Reusable PBR microstructure; these maps describe material relief, not artwork. */
  const sceneSurfaceCache = new Map(),
    sceneMicroMaps = new Map();
  function batchSceneMeshes(g) {
    // Keep one editable furniture group, but draw repeated weave/slats by material.
    const meshes = [];
    g.traverse((o) => {
      if (o.isMesh) meshes.push(o);
    });
    g.userData.renderBatch = { before: meshes.length, after: meshes.length };
    if (meshes.length < 2 || meshes.some((o) => Array.isArray(o.material)))
      return;
    g.updateMatrixWorld(true);
    const inverse = g.matrixWorld.clone().invert(),
      batches = new Map();
    for (const o of meshes) {
      const key = o.material.uuid + ":" + o.castShadow + ":" + o.receiveShadow;
      const relative = inverse.clone().multiply(o.matrixWorld);
      const part = o.geometry.index
        ? o.geometry.toNonIndexed()
        : o.geometry.clone();
      part.applyMatrix4(relative);
      if (!batches.has(key))
        batches.set(key, {
          material: o.material,
          cast: o.castShadow,
          receive: o.receiveShadow,
          parts: [],
          count: 0,
        });
      const b = batches.get(key);
      b.parts.push(part);
      b.count += part.attributes.position.count;
    }
    g.clear();
    for (const b of batches.values()) {
      const geometry = new THREE.BufferGeometry();
      for (const [name, size] of [
        ["position", 3],
        ["normal", 3],
        ["uv", 2],
      ]) {
        const data = new Float32Array(b.count * size);
        let offset = 0;
        for (const part of b.parts) {
          const attr = part.getAttribute(name);
          if (attr) data.set(attr.array, offset);
          offset += part.attributes.position.count * size;
        }
        geometry.setAttribute(name, new THREE.BufferAttribute(data, size));
      }
      const mesh = new THREE.Mesh(geometry, b.material);
      mesh.castShadow = b.cast;
      mesh.receiveShadow = b.receive;
      g.add(mesh);
      b.parts.forEach((p) => p.dispose());
    }
    meshes.forEach((o) => o.geometry.dispose());
    g.userData.renderBatch = {
      before: meshes.length,
      after: g.children.length,
    };
  }
  function microMap(kind) {
    if (sceneMicroMaps.has(kind)) return sceneMicroMaps.get(kind);
    const cv = document.createElement("canvas");
    cv.width = cv.height = 256;
    const ctx = cv.getContext("2d"),
      R = rng(kind.length * 829),
      im = ctx.createImageData(256, 256);
    for (let y = 0; y < 256; y++)
      for (let x = 0; x < 256; x++) {
        const n = R(),
          cloth = kind === "linen" || kind === "wool";
        let v = cloth
          ? 212 +
            25 * Math.sin((x * Math.PI) / 3) * Math.sin((y * Math.PI) / 3) +
            (n - 0.5) * 25
          : kind === "wood"
            ? 235 +
              6 * Math.sin(y * 0.22 + Math.sin(x * 0.035) * 1.7) +
              (n - 0.5) * 6
            : 233 + (n - 0.5) * 30;
        if (kind === "wool") v = 204 + 40 * n;
        const k = (y * 256 + x) * 4;
        im.data[k] =
          im.data[k + 1] =
          im.data[k + 2] =
            Math.max(0, Math.min(255, v));
        im.data[k + 3] = 255;
      }
    ctx.putImageData(im, 0, 0);
    const t = new THREE.CanvasTexture(cv);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(kind === "wood" ? 1 : 6, kind === "wood" ? 3 : 6);
    t.colorSpace = THREE.SRGBColorSpace;
    if (renderer)
      t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    sceneMicroMaps.set(kind, t);
    return t;
  }
  function sceneSurface(kind, color) {
    const key = kind + ":" + color;
    if (sceneSurfaceCache.has(key)) return sceneSurfaceCache.get(key);
    const m = new THREE.MeshPhysicalMaterial({
      color,
      map: microMap(kind),
      bumpMap: microMap(kind),
      bumpScale: kind === "wood" ? 0.003 : kind === "stone" ? 0.0015 : 0.008,
      roughness: kind === "wood" ? 0.58 : kind === "stone" ? 0.48 : 0.92,
      clearcoat: kind === "wood" ? 0.12 : kind === "stone" ? 0.15 : 0,
      clearcoatRoughness: 0.65,
      envMap: envTex,
      envMapIntensity: 0.35 * envK,
      sheen: kind === "linen" ? 0.3 : 0,
      sheenColor: new THREE.Color("#e8e2d5"),
    });
    m.userData.surfaceKind = kind;
    sceneSurfaceCache.set(key, m);
    return m;
  }
  function ellipseTop(g, w, d, height, material, y = 0, x = 0, z = 0) {
    const o = cyl(1, 1, height, material, x, y, z, 64);
    o.scale.x = w / 2;
    o.scale.z = d / 2;
    g.add(o);
    return o;
  }
  function canePanel(g, w, h, x, y, z, color) {
    const m = woodM(color);
    // A narrow frame and open weave let light pass through the furniture.
    g.add(
      box(w, 0.025, 0.025, m, x, y, z),
      box(w, 0.025, 0.025, m, x, y + h - 0.025, z),
      box(0.025, h, 0.025, m, x - w / 2 + 0.0125, y, z),
      box(0.025, h, 0.025, m, x + w / 2 - 0.0125, y, z),
    );
    const innerW = w - 0.045,
      innerH = h - 0.045;
    for (let q = -innerW / 2; q <= innerW / 2; q += 0.036)
      g.add(
        rod(
          [x + q, y + 0.024, z],
          [x + q, y + h - 0.024, z],
          0.0038,
          m,
          0.0038,
          5,
        ),
      );
    for (let q = 0.024; q < h - 0.024; q += 0.036)
      g.add(
        rod(
          [x - innerW / 2, y + q, z + 0.004],
          [x + innerW / 2, y + q, z + 0.004],
          0.0035,
          m,
          0.0035,
          5,
        ),
      );
  }
  function caneDrum(g, w, d, h, y, color) {
    const m = woodM(color),
      rx = w / 2 - 0.015,
      rz = d / 2 - 0.015;
    for (let k = 0; k < 36; k++) {
      const a = (k * Math.PI) / 18,
        x = Math.cos(a) * rx,
        z = Math.sin(a) * rz;
      g.add(rod([x, y, z], [x, y + h, z], 0.008, m, 0.006, 6));
    }
    for (let j = 0; j < 6; j++) {
      const pts = [];
      for (let k = 0; k <= 48; k++) {
        const a = (k * Math.PI) / 24;
        pts.push([Math.cos(a) * rx, y + (j * h) / 5, Math.sin(a) * rz]);
      }
      g.add(tube(pts, 0.007, m, 64));
    }
  }
  function cushion(g, w, h, d, c, x, y, z, tilt = 0) {
    const o = rbox(w, h, d, fabric(c), x, y, z, Math.min(0.065, h * 0.4));
    o.rotation.x = tilt;
    g.add(o);
    return o;
  }
  function tabletopObjects(g, w, d, y, theme) {
    const pos = w * 0.24;
    g.add(
      rbox(
        Math.min(0.3, w * 0.32),
        0.025,
        Math.min(0.2, d * 0.42),
        woodM(theme.woodDark),
        -pos,
        y,
        0,
        0.008,
      ),
    );
    g.add(cyl(0.039, 0.039, 0.09, ceramic(), -pos, y + 0.025, 0, 20));
    if (w > 0.6)
      vase(
        g,
        pos,
        y,
        0,
        0.045,
        0.15,
        theme.pot,
        rng(Math.round(w * 101)),
        theme.id !== "japandi",
      );
  }

  function sceneFloorPaint(kind, g, W, Hh, s, R) {
    if (kind === "parquet") {
      const B = W / 2,
        N = 4;
      for (let by = 0; by < 2; by++)
        for (let bx = 0; bx < 2; bx++)
          for (let j = 0; j < N; j++) {
            const vertical = (bx + by) % 2 === 0,
              x = bx * B + (vertical ? (j * B) / N : 0),
              y = by * B + (vertical ? 0 : (j * B) / N),
              pw = vertical ? B / N : B,
              ph = vertical ? B : B / N;
            g.fillStyle = rgbK(s.base, 0.88 + R() * 0.22);
            g.fillRect(x, y, pw, ph);
            g.strokeStyle = rgbK(s.base, 0.65);
            g.lineWidth = 2;
            g.strokeRect(x, y, pw, ph);
            g.strokeStyle = rgbK(s.base, 0.78);
            g.globalAlpha = 0.28;
            g.lineWidth = 1;
            for (let q = 0; q < 7; q++) {
              g.beginPath();
              const off = ((q + 0.5) * (vertical ? pw : ph)) / 7;
              if (vertical) {
                g.moveTo(x + off, y);
                for (let a = 0; a <= ph; a += 16)
                  g.lineTo(x + off + Math.sin(a * 0.05 + q) * 2, y + a);
              } else {
                g.moveTo(x, y + off);
                for (let a = 0; a <= pw; a += 16)
                  g.lineTo(x + a, y + off + Math.sin(a * 0.05 + q) * 2);
              }
              g.stroke();
            }
            g.globalAlpha = 1;
          }
      return true;
    }
    if (kind === "travertine") {
      g.fillStyle = rgbK(s.base, 0.985);
      g.fillRect(0, 0, W, Hh);
      for (let k = 0; k < 1500; k++) {
        const warm = R() > 0.5 ? "83,64,39" : "255,248,235";
        const a = 0.008 + R() * 0.025;
        const ww = 1 + R() * 8;
        const hh = 0.5 + R() * 2;
        g.fillStyle = `rgba(${warm},${a})`;
        g.fillRect(R() * W, R() * Hh, ww, hh);
      }
      g.strokeStyle = s.grout || rgbK(s.base, 0.82);
      g.globalAlpha = 0.42;
      g.lineWidth = 2;
      g.strokeRect(1, 1, W - 2, Hh - 2);
      g.globalAlpha = 1;
      return true;
    }
    return false;
  }
  function sceneFloorMaterial(texture, s) {
    return new THREE.MeshPhysicalMaterial({
      map: texture,
      bumpMap: texture,
      bumpScale: 0.007,
      roughness: Math.max(0.4, s.rough),
      clearcoat: 0.08,
      clearcoatRoughness: 0.6,
      envMap: envTex,
      envMapIntensity: 0.3,
    });
  }

  /* Distinct furniture silhouettes share the editable layout's exact footprints. */
  const STYLE_FURNITURE_TYPES = new Set([
    "sofa",
    "armchair",
    "bed",
    "chair",
    "coffeetable",
    "sidetable",
    "roundtable",
    "table",
    "wardrobe",
    "cabinet",
    "shoecab",
    "nightstand",
    "tvstand",
    "floorlamp",
    "rug",
  ]);
  function makeStyleFurniture(f) {
    const t = studioFurnitureTheme(f);
    if (t.id === "custom" || !STYLE_FURNITURE_TYPES.has(f.type)) return null;
    const g = new THREE.Group(),
      w = M(f.w),
      d = M(f.d),
      c = f.color,
      wm = woodM(t.wood),
      dk = woodM(t.woodDark),
      fab = fabric(c),
      z0 = -d / 2;
    if (f.type === "sofa" || f.type === "armchair") {
      const one = f.type === "armchair",
        n = one ? 1 : 2,
        a = Math.min(0.16, w * 0.18),
        seatW = w - a * 2,
        seatD = d - 0.22;
      if (t.id === "warm") {
        g.add(
          rbox(
            w - 0.08,
            0.16,
            d - 0.08,
            fabric(darker(c, 0.78)),
            0,
            0.055,
            0,
            0.06,
          ),
        );
        g.add(rbox(w, 0.62, 0.18, fab, 0, 0.18, z0 + 0.09, 0.085));
        for (const s of [-1, 1])
          g.add(rbox(a, 0.47, d, fab, s * (w / 2 - a / 2), 0.18, 0, 0.085));
        for (let i = 0; i < n; i++) {
          const x = -seatW / 2 + (seatW / n) * (i + 0.5);
          cushion(g, seatW / n - 0.012, 0.2, seatD, c, x, 0.23, 0.09);
          cushion(
            g,
            seatW / n - 0.035,
            0.43,
            0.17,
            c,
            x,
            0.43,
            z0 + 0.21,
            -0.06,
          );
        }
      } else if (t.id === "japandi") {
        legs(g, w - 0.03, d - 0.03, 0.19, wm, 0.045, 0.024);
        g.add(rbox(w, 0.075, d, wm, 0, 0.18, 0, 0.016));
        for (const s of [-1, 1]) {
          g.add(
            rod(
              [s * (w / 2 - 0.03), 0.2, z0 + 0.025],
              [s * (w / 2 - 0.03), 0.66, z0 + 0.025],
              0.018,
              wm,
            ),
          );
          g.add(
            rod(
              [s * (w / 2 - 0.03), 0.2, d / 2 - 0.025],
              [s * (w / 2 - 0.03), 0.58, d / 2 - 0.025],
              0.018,
              wm,
            ),
          );
          g.add(
            rod(
              [s * (w / 2 - 0.03), 0.64, z0 + 0.02],
              [s * (w / 2 - 0.03), 0.58, d / 2 - 0.02],
              0.024,
              wm,
            ),
          );
        }
        const slats = Math.max(4, Math.floor(w / 0.105));
        for (let i = 0; i < slats; i++)
          g.add(
            box(
              0.04,
              0.5,
              0.023,
              wm,
              -w / 2 + 0.06 + ((w - 0.12) * i) / (slats - 1),
              0.25,
              z0 + 0.015,
            ),
          );
        for (let i = 0; i < n; i++) {
          const x = -seatW / 2 + (seatW / n) * (i + 0.5);
          cushion(g, seatW / n - 0.018, 0.17, seatD, c, x, 0.25, 0.08);
          cushion(
            g,
            seatW / n - 0.035,
            0.35,
            0.17,
            c,
            x,
            0.41,
            z0 + 0.19,
            -0.06,
          );
        }
      } else {
        legs(g, w - 0.06, d - 0.06, 0.16, wm, 0.04, 0.023);
        g.add(rbox(w, 0.13, d, wm, 0, 0.15, 0, 0.035));
        canePanel(g, w - 0.045, one ? 0.65 : 0.5, 0, 0.29, z0 + 0.018, t.wood);
        for (const s of [-1, 1]) {
          const side = new THREE.Group();
          canePanel(side, d - 0.04, 0.32, 0, 0.28, 0, t.wood);
          side.rotation.y = Math.PI / 2;
          side.position.x = s * (w / 2 - 0.015);
          g.add(side);
        }
        for (let i = 0; i < n; i++) {
          const x = -seatW / 2 + (seatW / n) * (i + 0.5);
          cushion(g, seatW / n - 0.018, 0.19, seatD, c, x, 0.28, 0.075);
          cushion(
            g,
            seatW / n - 0.025,
            0.4,
            0.17,
            c,
            x,
            0.46,
            z0 + 0.18,
            -0.07,
          );
        }
        g.add(
          rbox(
            Math.min(0.25, w * 0.28),
            0.025,
            d * 0.64,
            fabric(t.accent),
            w / 2 - a / 2,
            0.62,
            0.01,
            0.012,
          ),
        );
      }
      if (!one) {
        cushion(
          g,
          0.32,
          0.33,
          0.12,
          t.accent,
          -w * 0.28,
          0.45,
          z0 + 0.3,
          -0.08,
        );
        cushion(
          g,
          0.31,
          0.3,
          0.12,
          t.id === "boho" ? "#4f7770" : "#eee8dd",
          w * 0.28,
          0.44,
          z0 + 0.3,
          -0.08,
        );
      }
      g.userData.modelForm =
        t.id === "warm"
          ? "rounded-upholstery"
          : t.id === "japandi"
            ? "exposed-oak-frame"
            : "woven-cane-frame";
    } else if (f.type === "bed") {
      const bh = t.id === "japandi" ? 0.18 : 0.28,
        hh = w < 1.4 ? 0.82 : t.id === "japandi" ? 0.85 : 1.18;
      if (t.id === "warm") {
        g.add(rbox(w, bh, d - 0.04, fab, 0, 0.04, 0.02, 0.075));
        const count = Math.max(4, Math.round(w / 0.2));
        for (let i = 0; i < count; i++)
          g.add(
            rbox(
              w / count - 0.009,
              hh,
              0.09,
              fabric(darker(c, 0.9)),
              -w / 2 + ((i + 0.5) * w) / count,
              0,
              z0 + 0.045,
              0.032,
            ),
          );
      } else {
        g.add(rbox(w, bh, d, wm, 0, 0.055, 0, 0.012));
        if (t.id === "japandi") {
          g.add(box(w, 0.055, 0.035, wm, 0, hh - 0.055, z0 + 0.025));
          for (let x = -w / 2 + 0.025; x < w / 2; x += 0.095)
            g.add(box(0.035, hh, 0.035, wm, x, 0, z0 + 0.025));
        } else {
          canePanel(g, w, hh - 0.2, 0, 0.18, z0 + 0.018, t.wood);
          const pts = [];
          for (let k = 0; k <= 32; k++) {
            const a = Math.PI - (k * Math.PI) / 32;
            pts.push([
              Math.cos(a) * w * 0.48,
              hh - 0.1 + Math.sin(a) * 0.12,
              z0 + 0.015,
            ]);
          }
          g.add(tube(pts, 0.018, wm));
        }
      }
      const y = bh + 0.055;
      g.add(
        rbox(
          w - 0.07,
          0.21,
          d - 0.16,
          sceneSurface("linen", "#faf8f2"),
          0,
          y,
          0.06,
          0.07,
        ),
      );
      cushion(g, w - 0.035, 0.19, d * 0.66, c, 0, y + 0.115, d * 0.17);
      cushion(g, w - 0.02, 0.035, 0.28, "#eee7d9", 0, y + 0.3, -d * 0.16);
      const n = w > 1.4 ? 2 : 1,
        pw = (w - 0.2) / n;
      for (let i = 0; i < n; i++)
        cushion(
          g,
          pw - 0.035,
          0.15,
          0.39,
          "#f5f0e7",
          -w / 2 + 0.1 + (i + 0.5) * pw,
          y + 0.24,
          z0 + 0.35,
          -0.035,
        );
      cushion(g, w - 0.06, 0.018, 0.43, t.accent, 0, y + 0.3, d * 0.3);
      g.userData.modelForm =
        t.id === "warm"
          ? "channel-headboard"
          : t.id === "japandi"
            ? "low-slat-platform"
            : "arched-cane-headboard";
    } else if (f.type === "chair") {
      const fiber = f.product_reference_id === "r1-fiber-side-tube",
        h = 0.46;
      legs(
        g,
        w - 0.015,
        d - 0.015,
        h - 0.05,
        fiber ? mat("#3c3b38", { metalness: 0.6, roughness: 0.45 }) : wm,
        0.025,
        0.018,
      );
      if (t.id === "warm") {
        const seat = cushion(
          g,
          w,
          fiber ? 0.055 : 0.065,
          d - 0.03,
          c,
          0,
          h - 0.055,
          0.015,
        );
        g.add(
          rbox(
            w,
            fiber ? 0.33 : 0.38,
            0.045,
            fab,
            0,
            h - 0.02,
            z0 + 0.025,
            0.04,
          ),
        );
        if (fiber) {
          g.updateMatrixWorld(true);
          g.userData.referenceGeometry = {
            product_reference_id: f.product_reference_id,
            seat_top_mm: new THREE.Box3().setFromObject(seat).max.y * 1000,
          };
        }
      } else if (t.id === "japandi") {
        g.add(rbox(w, 0.03, d, wm, 0, h - 0.035, 0, 0.015));
        cushion(g, w - 0.045, 0.035, d - 0.055, "#e3ddce", 0, h - 0.005, 0.02);
        for (const s of [-1, 1])
          g.add(
            rod(
              [s * (w / 2 - 0.025), 0.35, z0 + 0.022],
              [s * (w / 2 - 0.025), 0.85, z0 + 0.022],
              0.014,
              wm,
            ),
          );
        g.add(rbox(w, 0.12, 0.027, wm, 0, 0.73, z0 + 0.018, 0.025));
      } else {
        cushion(g, w - 0.025, 0.055, d - 0.02, c, 0, h - 0.04, 0.01);
        canePanel(g, w - 0.015, 0.37, 0, h, z0 + 0.013, t.wood);
      }
      g.userData.modelForm = t.id + "-dining-chair";
    } else if (
      ["table", "roundtable", "coffeetable", "sidetable"].includes(f.type)
    ) {
      const round = f.type === "roundtable",
        dining = f.type === "table" || (round && Math.min(w, d) > 0.95),
        small = f.type === "sidetable",
        h = dining ? 0.75 : small || round ? 0.52 : 0.38;
      if (t.id === "warm") {
        ellipseTop(g, w, d, 0.045, sceneSurface("stone", "#e4d9c7"), h - 0.045);
        if (dining) {
          for (const x of [-w * 0.26, w * 0.26]) {
            ellipseTop(g, Math.min(0.2, w * 0.2), d * 0.58, h - 0.05, wm, 0, x);
          }
        } else {
          ellipseTop(g, w * 0.34, d * 0.43, h - 0.05, wm);
          for (let k = 0; k < 24; k++) {
            const a = (k * Math.PI) / 12;
            g.add(
              rod(
                [Math.cos(a) * w * 0.175, 0, Math.sin(a) * d * 0.225],
                [Math.cos(a) * w * 0.175, h - 0.05, Math.sin(a) * d * 0.225],
                0.008,
                dk,
                0.008,
                6,
              ),
            );
          }
        }
      } else if (t.id === "japandi") {
        ellipseTop(g, w, d, 0.045, woodM(c), h - 0.045);
        legs(g, w * 0.83, d * 0.82, h - 0.055, wm, 0.02, 0.028);
        if (dining) g.add(box(w * 0.75, 0.065, 0.04, wm, 0, h - 0.13, 0));
      } else {
        caneDrum(g, w * 0.64, d * 0.64, h - 0.045, 0, t.wood);
        ellipseTop(g, w, d, 0.04, woodM(c), h - 0.04);
        ellipseTop(g, w * 0.7, d * 0.7, 0.018, wm, 0);
      }
      tabletopObjects(g, w, d, h, t);
      g.userData.modelForm =
        t.id + "-" + (dining ? "dining-table" : "occasional-table");
    } else if (
      ["wardrobe", "cabinet", "shoecab", "tvstand", "nightstand"].includes(
        f.type,
      )
    ) {
      const h =
        f.type === "wardrobe"
          ? 2.2
          : f.type === "shoecab"
            ? 1.02
            : f.type === "cabinet"
              ? 0.9
              : f.type === "nightstand"
                ? 0.52
                : 0.5;
      if (f.type === "nightstand" && t.id === "warm") {
        ellipseTop(g, w, d, 0.035, sceneSurface("stone", "#e0d5c2"), h - 0.035);
        for (let k = 0; k < 28; k++) {
          const a = (k * Math.PI) / 14;
          g.add(
            rod(
              [
                Math.cos(a) * (w / 2 - 0.015),
                0.02,
                Math.sin(a) * (d / 2 - 0.015),
              ],
              [
                Math.cos(a) * (w / 2 - 0.015),
                h - 0.04,
                Math.sin(a) * (d / 2 - 0.015),
              ],
              0.013,
              wm,
              0.013,
              7,
            ),
          );
        }
        ellipseTop(g, w - 0.035, d - 0.035, 0.03, wm, 0.01);
      } else {
        const base = t.id === "japandi" ? 0.12 : 0.08;
        g.add(
          rbox(
            w,
            h - base,
            d,
            woodM(c),
            0,
            base,
            0,
            t.id === "warm" ? 0.018 : 0.007,
          ),
        );
        legs(g, w - 0.05, d - 0.05, base, dk, 0.035, 0.015);
        const n = Math.max(1, Math.round(w / 0.55)),
          pw = (w - 0.025) / n;
        for (let i = 0; i < n; i++) {
          const x = -w / 2 + 0.0125 + (i + 0.5) * pw,
            fh = h - base - 0.02,
            y = base + 0.01,
            z = d / 2 - 0.005;
          if (t.id === "boho") {
            g.add(box(pw - 0.012, fh, 0.016, woodM(darker(c, 0.85)), x, y, z));
            canePanel(
              g,
              pw - 0.035,
              fh - 0.035,
              x,
              y + 0.018,
              z + 0.014,
              t.wood,
            );
            g.add(
              blob(0.015, 0.015, 0.016, wm, x, y + fh * 0.52, z + 0.036, 12),
            );
          } else {
            g.add(rbox(pw - 0.007, fh, 0.016, woodM(c), x, y, z, 0.003));
            if (t.id === "warm")
              for (let q = -pw / 2 + 0.025; q < pw / 2 - 0.01; q += 0.045)
                g.add(
                  box(
                    0.016,
                    fh - 0.012,
                    0.008,
                    wm,
                    x + q,
                    y + 0.006,
                    z + 0.014,
                  ),
                );
            if (t.id === "warm")
              pull(
                g,
                Math.min(0.18, pw * 0.48),
                false,
                x,
                y + fh * 0.64,
                z + 0.013,
              );
            else
              g.add(
                box(pw - 0.035, 0.006, 0.006, dk, x, y + fh - 0.012, z + 0.01),
              );
          }
        }
      }
      if (f.type === "tvstand") tabletopObjects(g, w, d, h, t);
      if (f.type === "nightstand") {
        const lx = w * 0.22;
        g.add(cyl(0.07, 0.08, 0.055, ceramic(), lx, h, 0));
        g.add(
          cyl(0.065, 0.07, 0.12, sceneSurface("stone", t.pot), lx, h + 0.04, 0),
        );
        const shade = mat("#f6eedb", {
          roughness: 0.85,
          emissive: "#ffd8a0",
          emissiveIntensity: 0.18,
        });
        g.add(cyl(0.09, 0.13, 0.14, shade, lx, h + 0.15, 0));
      }
      g.userData.modelForm = t.id + "-casework";
    } else if (f.type === "floorlamp") {
      const radius = Math.min(w, d) * 0.42,
        m = mat(t.metal, { metalness: 0.75, roughness: 0.34 });
      ellipseTop(g, w * 0.6, d * 0.6, 0.035, m);
      g.add(cyl(0.012, 0.014, 1.4, m, 0, 0.03, 0));
      if (t.id === "japandi") {
        g.add(
          blob(
            radius,
            0.25,
            radius,
            mat("#f4ecd9", {
              roughness: 1,
              emissive: "#ffe5b5",
              emissiveIntensity: 0.2,
            }),
            0,
            1.43,
            0,
          ),
        );
        for (let y = 1.25; y < 1.65; y += 0.06)
          g.add(ring(radius * 0.84, 0.004, wm, 0, y, 0));
      } else if (t.id === "boho") {
        caneDrum(g, w * 0.85, d * 0.85, 0.27, 1.26, t.wood);
      } else
        g.add(
          cyl(
            radius * 0.7,
            radius,
            0.25,
            mat("#ede3cf", { roughness: 0.85 }),
            0,
            1.27,
            0,
          ),
        );
      g.userData.modelForm = t.id + "-lamp";
    } else if (f.type === "rug") {
      const material = sceneSurface(t.id === "warm" ? "wool" : "linen", c),
        r = rbox(
          w,
          0.012,
          d,
          material,
          0,
          0.006,
          0,
          t.id === "warm" ? 0.15 : 0.01,
        );
      r.castShadow = false;
      g.add(r);
      const border = 0.065;
      if (t.id === "japandi")
        for (const z of [-d / 2 + border, d / 2 - border])
          g.add(box(w - 0.1, 0.001, 0.035, fabric("#b0ae9e"), 0, 0.019, z));
      if (t.id === "boho") {
        for (const z of [
          -d / 2 + 0.1,
          -d / 2 + 0.16,
          d / 2 - 0.16,
          d / 2 - 0.1,
        ])
          g.add(box(w - 0.1, 0.001, 0.028, fabric("#ead7af"), 0, 0.019, z));
        for (let x = -w / 2 + 0.06; x < w / 2 - 0.03; x += 0.06)
          for (const s of [-1, 1])
            g.add(
              box(
                0.012,
                0.006,
                0.045,
                fabric("#d5c19c"),
                x,
                0.008,
                s * (d / 2 - 0.0225),
              ),
            );
      }
      g.userData.modelForm =
        t.id === "warm"
          ? "rounded-wool-rug"
          : t.id === "japandi"
            ? "linen-border-rug"
            : "fringed-woven-rug";
    }
    batchSceneMeshes(g);
    g.position.set(wx(f.cx), 0, wz(f.cy));
    g.rotation.y = (-f.rot * Math.PI) / 180;
    g.userData.fid = f.id;
    g.userData.sceneStyle = t.id;
    g.traverse((o) => {
      o.userData.fid = f.id;
    });
    return g;
  }

  /* Mounted decor and fixtures are exploratory, downstream of canonical surfaces. */
  const sceneArtTextures = new Map();
  function sceneArtTexture(id) {
    if (sceneArtTextures.has(id)) return sceneArtTextures.get(id);
    const path = "/art/" + id + ".png",
      t = new THREE.TextureLoader(scope.loadingManager).load(path);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    t.userData.assetPath = path;
    sceneArtTextures.set(id, t);
    return t;
  }
  function nearestSolidMount(rid, point, width) {
    const room = ROOMS.find((r) => r.id === rid);
    if (!room) return null;
    let best = null;
    for (const wall of WALL_SEGMENTS.filter(
      (s) => s.rooms.includes(rid) && s.kind !== "low",
    )) {
      const [ax, az] = wall.from,
        [bx, bz] = wall.to,
        dx = bx - ax,
        dz = bz - az,
        L = Math.hypot(dx, dz),
        margin = width * 500 + 110;
      if (L < margin * 2) continue;
      let along = ((point[0] - ax) * dx + (point[1] - az) * dz) / L;
      along = Math.max(margin, Math.min(L - margin, along));
      const px = ax + (dx / L) * along,
        pz = az + (dz / L) * along;
      let nx = -dz / L,
        nz = dx / L,
        offset = wall.thickness_mm / 2 + 40;
      if (
        !pointInRoom(
          [px + nx * (offset + 50), pz + nz * (offset + 50)],
          room.poly,
        )
      ) {
        nx = -nx;
        nz = -nz;
      }
      const centre = [px + nx * offset, pz + nz * offset];
      if (!pointInRoom(centre, room.poly)) continue;
      const distance = Math.hypot(px - point[0], pz - point[1]);
      if (!best || distance < best.distance)
        best = {
          x: wx(centre[0]),
          z: wz(centre[1]),
          nx,
          nz,
          wall,
          rid,
          distance,
          centre,
        };
    }
    return best;
  }
  function framedArtwork(mount, theme, width = 0.72, centreY = 1.64) {
    const g = new THREE.Group(),
      h = width * 1.5,
      frame = 0.024,
      depth = 0.025;
    const m = woodM(theme.id === "warm" ? theme.metal : theme.woodDark);
    g.add(
      box(width + frame * 2, h + frame * 2, 0.025, m, 0, -h / 2 - frame, 0),
    );
    const canvas = new THREE.Mesh(
      new THREE.PlaneGeometry(width, h),
      new THREE.MeshStandardMaterial({
        map: sceneArtTexture(theme.id),
        roughness: 0.94,
      }),
    );
    canvas.position.z = depth / 2 + 0.003;
    g.add(canvas);
    g.position.set(mount.x, centreY, mount.z);
    g.rotation.y = Math.atan2(mount.nx, mount.nz);
    g.userData.sceneFeature = "artwork";
    g.userData.roomId = mount.rid;
    g.userData.mount = mount.centre;
    g.userData.wallSource = mount.wall.source_px;
    g.visible = opt.cut >= H;
    sceneDecorG.add(g);
  }
  function curtainPanel(w, h, color, sheer = false) {
    const geo = new THREE.PlaneGeometry(w, h, 32, 12),
      pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i),
        y = pos.getY(i),
        fold = 0.032 * Math.cos((x / w + 0.5) * Math.PI * 14);
      pos.setZ(i, fold * (0.65 + 0.35 * (0.5 - y / h)));
    }
    geo.computeVertexNormals();
    const material = new THREE.MeshPhysicalMaterial({
      color,
      map: microMap("linen"),
      bumpMap: microMap("linen"),
      bumpScale: 0.005,
      roughness: 1,
      side: THREE.DoubleSide,
      transparent: sheer,
      opacity: sheer ? 0.52 : 1,
      depthWrite: !sheer,
      sheen: 0.35,
    });
    const o = new THREE.Mesh(geo, material);
    o.castShadow = !sheer;
    o.receiveShadow = true;
    return o;
  }
  function openingCurtains(o, theme) {
    if (
      state.interior?.opening_treatments[o.id] ||
      interiorLayer(state).objects.some(
        (x) => x.placement.host_opening_id === o.id,
      )
    )
      return;
    const rid = o.between.find((id) =>
      ROOMS.some((r) => r.id === id && !r.isTerrace),
    );
    const room = ROOMS.find((r) => r.id === rid);
    if (!room || !["bedroom", "reception"].includes(room.kind)) return;
    const [a, b] = [o.from, o.to],
      dx = b[0] - a[0],
      dz = b[1] - a[1],
      L = Math.hypot(dx, dz),
      mx = (a[0] + b[0]) / 2,
      mz = (a[1] + b[1]) / 2;
    let nx = -dz / L,
      nz = dx / L;
    if (!pointInRoom([mx + nx * 250, mz + nz * 250], room.poly)) {
      nx = -nx;
      nz = -nz;
    }
    const g = new THREE.Group(),
      span = L / 1000 + 0.16,
      height = H - 0.12,
      pw = Math.min(0.48, span * 0.21);
    g.rotation.y = Math.atan2(nx, nz);
    g.position.set(wx(mx + nx * 155), H / 2, wz(mz + nz * 155));
    const rail = box(
      span + 0.06,
      0.02,
      0.02,
      mat(theme.metal, { metalness: 0.65, roughness: 0.4 }),
      0,
      H / 2 - 0.07,
      0,
    );
    g.add(rail);
    for (const sign of [-1, 1]) {
      const panel = curtainPanel(
        pw,
        height,
        theme.id === "warm"
          ? "#cec3af"
          : theme.id === "japandi"
            ? "#d9d5c9"
            : "#d6bc90",
      );
      panel.position.x = sign * (span / 2 - pw / 2);
      g.add(panel);
      const sheer = curtainPanel(pw * 0.7, height, "#f7f2e8", true);
      sheer.position.set(sign * (span / 2 - pw * 0.85), 0, -0.045);
      g.add(sheer);
    }
    g.userData.sceneFeature = "curtains";
    g.userData.openingId = o.id;
    g.userData.roomId = rid;
    g.visible = opt.cut >= H;
    sceneDecorG.add(g);
  }
  function sceneLight(color, power, x, y, z, roomId) {
    const p = new THREE.PointLight(color, power, 8, 2);
    p.position.set(x, y, z);
    p.userData.sceneLight = true;
    p.userData.basePower = power;
    p.userData.roomId = roomId;
    sceneDecorG.add(p);
    return p;
  }
  function pendantAt(x, z, theme, rid, dining = false) {
    if (studioRoomOptions(state, rid).lighting !== "style") return;
    const g = new THREE.Group(),
      m = mat(theme.metal, { metalness: 0.7, roughness: 0.4 }),
      lightColor =
        theme.id === "warm"
          ? "#ffe3bd"
          : theme.id === "japandi"
            ? "#ffe1ae"
            : "#ffdaa1";
    const luminous = mat("#f6eddb", {
      roughness: 0.8,
      emissive: lightColor,
      emissiveIntensity: 0.42,
      side: THREE.DoubleSide,
    });
    luminous.userData.sceneEmitter = true;
    g.add(cyl(0.05, 0.05, 0.025, m, 0, H - 0.025, 0));
    const y = dining ? H - 0.5 : H - 0.29;
    g.add(cyl(0.004, 0.004, H - y - 0.015, m, 0, y, 0, 8));
    if (theme.id === "warm") {
      if (dining) {
        g.add(box(1.08, 0.025, 0.025, m, 0, y + 0.07, 0));
        for (const q of [-0.36, 0, 0.36])
          g.add(blob(0.1, 0.1, 0.1, luminous, q, y, 0, 24));
      } else {
        g.add(ring(0.26, 0.013, m, 0, y, 0));
        g.add(cyl(0.235, 0.235, 0.023, luminous, 0, y - 0.012, 0, 48));
      }
    } else if (theme.id === "japandi") {
      const radius = dining ? 0.26 : 0.21;
      g.add(blob(radius, 0.2, radius, luminous, 0, y, 0, 32));
      for (let q = -0.16; q <= 0.16; q += 0.04) {
        const r = radius * Math.sqrt(Math.max(0.05, 1 - (q * q) / 0.04));
        g.add(ring(r, 0.003, woodM(theme.wood), 0, y + q, 0));
      }
    } else {
      const radius = dining ? 0.3 : 0.24,
        wm = woodM(theme.wood);
      for (let k = 0; k < 28; k++) {
        const a = (k * Math.PI) / 14,
          pts = [];
        for (let q = 0; q <= 12; q++) {
          const tt = q / 12,
            r = radius * (0.28 + 0.72 * tt);
          pts.push([Math.cos(a) * r, y + 0.12 - 0.25 * tt, Math.sin(a) * r]);
        }
        g.add(tube(pts, 0.006, wm, 24));
      }
      for (let q = 0; q <= 5; q++)
        g.add(
          ring(
            radius * (0.28 + (0.72 * q) / 5),
            0.006,
            wm,
            0,
            y + 0.12 - (0.25 * q) / 5,
            0,
          ),
        );
      g.add(blob(0.045, 0.055, 0.045, luminous, 0, y - 0.04, 0, 20));
    }
    batchSceneMeshes(g);
    g.position.set(x, 0, z);
    g.userData.sceneFeature = "pendant";
    g.userData.roomId = rid;
    g.userData.fixtureType = theme.id + "-pendant";
    g.visible = opt.cut >= H;
    sceneDecorG.add(g);
    const light = sceneLight(
      lightColor,
      dining ? 2.5 : 1.7,
      x,
      y - 0.24,
      z,
      rid,
    );
    if (rid === "RECP-01" && !dining) {
      light.castShadow = true;
      light.shadow.mapSize.setScalar(COARSE ? 512 : 1024);
      light.shadow.bias = -0.0007;
      light.shadow.normalBias = 0.018;
    }
  }
  /* Concept finishes and equipment; canonical architectural planes remain fixed. */
  let studioLampFootprints = [];
  function studioLightColour(k) {
    return k === 2700 ? "#ffd5a0" : k === 4000 ? "#fff4e6" : "#ffe3bf";
  }
  function studioFurnitureTheme(f) {
    const current = currentDecor(),
      base =
        current.id === "custom"
          ? DECOR_THEMES.find((t) => t.id === "warm")
          : current;
    const id = {
      upholstered: "warm",
      "oak-platform": "japandi",
      "woven-headboard": "boho",
    }[f.variant];
    const theme = id ? { ...base, id } : current,
      material = interiorMaterial(state, f.material_id);
    // A primary wood assignment controls the wood components of mixed furniture.
    return material?.category === "wood"
      ? {
          ...theme,
          wood: material.base_colour,
          woodDark: darker(material.base_colour, 0.76),
        }
      : theme;
  }
  function studioWallMaterials(s, base, cap) {
    const [a, b] = [s.from, s.to],
      dx = b[0] - a[0],
      dz = b[1] - a[1],
      L = Math.hypot(dx, dz),
      mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const face = (sign) => {
      const point = [
          mid[0] - ((sign * dz) / L) * 180,
          mid[1] + ((sign * dx) / L) * 180,
        ],
        r = ROOMS.find((r) => pointInRoom(point, r.poly));
      const color = r && studioRoomOptions(state, r.id).wall;
      return color ? mat(color, { roughness: 0.92 }) : base;
    };
    return [base, base, cap, base, face(1), face(-1)];
  }
  /* Explicit, dimensioned closed-front joinery concept; not a manufacturer model. */
  function studioCounterJoinery(g,f,w,d,cm){
    const j=f.joinery;
    if(!j)return false;
    const validModules=a=>Array.isArray(a)&&a.every(m=>Number.isFinite(m.width_mm)&&m.width_mm>=100&&['dishwasher','sink','drawers','storage','hob','waste'].includes(m.role));
    if(j.schema!=='CounterJoineryConcept/1'||j.status!=='EXPLORATORY'||!Number.isFinite(j.end_panel_mm)||j.end_panel_mm<12||j.end_panel_mm>30||!validModules(j.work_modules)||!j.work_modules.length||!validModules(j.rear_modules)||!Number.isFinite(j.working_depth_mm)||!Number.isFinite(j.rear_depth_mm)||j.working_depth_mm<500||(j.rear_depth_mm!==0&&j.rear_depth_mm<200)||(j.rear_depth_mm===0)!==(j.rear_modules.length===0))throw new Error('Invalid counter joinery concept.');
    for(const modules of [j.work_modules,j.rear_modules].filter(a=>a.length))if(Math.abs(modules.reduce((n,m)=>n+m.width_mm,2*j.end_panel_mm)-f.w)>.01)throw new Error('Joinery widths exceed the declared counter.');
    if(Math.abs(j.working_depth_mm+j.rear_depth_mm-f.d)>.01)throw new Error('Joinery depths exceed the declared counter.');
    const p=M(j.end_panel_mm),work=M(j.working_depth_mm),rear=M(j.rear_depth_mm);
    g.add(box(w-.012,.08,d-.08,'#4a4641',0,0,0));
    for(const side of [-1,1])g.add(box(p,.74,d-.04,cm,side*(w/2-p/2),.08,0));
    // The rear mass is a shallow storage reservation. Plumbing access remains TBD.
    if(rear>0)g.add(box(w-2*p,.74,rear-.04,cm,0,.08,-d/2+rear/2));
    const renderedModules=[];
    const record=front=>{g.updateMatrixWorld(true);const b=new THREE.Box3().setFromObject(front);renderedModules.push({...front.userData.counterModule,min_mm:b.min.toArray().map(n=>n*1000),max_mm:b.max.toArray().map(n=>n*1000)});};
    let x=-w/2+p;
    for(const [index,m] of j.work_modules.entries()){
      const mw=M(m.width_mm),front=new THREE.Group();
      if(m.drawer_fronts_mm){
        if(!Array.isArray(m.drawer_fronts_mm)||m.drawer_fronts_mm.some(h=>!Number.isFinite(h)||h<80)||Math.abs(m.drawer_fronts_mm.reduce((s,h)=>s+h,0)-720)>.01)throw new Error('Invalid dimensioned drawer fronts.');
        let y=.08;
        for(const height of m.drawer_fronts_mm){fronts(front,-mw/2,y,mw,M(height),0,1,1,cm,'edge');y+=M(height);}
      }else fronts(front,-mw/2,.08,mw,.72,0,m.role==='sink'?2:1,m.role==='drawers'?3:1,cm,'edge');
      front.position.set(x+mw/2,0,d/2-.03);
      front.userData.counterModule={side:'working',index,role:m.role,width_mm:m.width_mm,depth_mm:j.working_depth_mm};
      g.add(front);record(front);
      if(m.role==='dishwasher'){
        // Preserve a full 600 mm clear lateral bay; its closed integrated front is shown.
        g.add(box(mw-.02,.70,work-.06,mat('#8b9297',{roughness:.5}),x+mw/2,.09,d/2-work/2-.02));
      }else{
        for(const sx of [x+p/2,x+mw-p/2])g.add(box(p,.74,work-.04,cm,sx,.08,d/2-work/2-.02));
        g.add(box(mw,.018,work-.04,cm,x+mw/2,.08,d/2-work/2-.02));
      }
      x+=mw;
    }
    x=-w/2+p;
    for(const [index,m] of j.rear_modules.entries()){
      const mw=M(m.width_mm),front=new THREE.Group();
      fronts(front,-mw/2,.08,mw,.72,0,1,1,cm,'edge');
      front.position.set(x+mw/2,0,-d/2+.03);front.rotation.y=Math.PI;
      front.userData.counterModule={side:'reception',index,role:m.role,width_mm:m.width_mm,depth_mm:j.rear_depth_mm};
      g.add(front);record(front);x+=mw;
    }
    g.userData.counterJoinery={module_geometry:renderedModules,schema:j.schema,working_depth_mm:j.working_depth_mm,rear_depth_mm:j.rear_depth_mm,end_panel_mm:j.end_panel_mm,work_modules:j.work_modules.map(m=>({...m})),rear_modules:j.rear_modules.map(m=>({...m}))};
    return true;
  }

  function studioCountertop(g,f,w,d,stone){
    if(!f.countertop_cutouts){g.add(rbox(w+.01,.04,d,stone,0,.82,0,.004));return;}
    if(!Array.isArray(f.countertop_cutouts)||f.countertop_cutouts.length!==1)throw new Error('Only the explicit workstation cutout is supported.');
    const c=f.countertop_cutouts[0];
    if(c.schema!=='CountertopCutoutConcept/1'||![c.x_mm,c.z_mm,c.width_mm,c.depth_mm].every(Number.isFinite)||c.width_mm<200||c.depth_mm<200||Math.abs(c.x_mm)+c.width_mm/2>f.w/2-18||Math.abs(c.z_mm)+c.depth_mm/2>f.d/2-18)throw new Error('Invalid countertop cutout.');
    const shape=new THREE.Shape();
    shape.moveTo(-w/2-.005,-d/2);shape.lineTo(w/2+.005,-d/2);shape.lineTo(w/2+.005,d/2);shape.lineTo(-w/2-.005,d/2);shape.closePath();
    const hole=new THREE.Path(),x=M(c.x_mm),z=M(c.z_mm),cw=M(c.width_mm),cd=M(c.depth_mm);
    hole.moveTo(x-cw/2,-z-cd/2);hole.lineTo(x-cw/2,-z+cd/2);hole.lineTo(x+cw/2,-z+cd/2);hole.lineTo(x+cw/2,-z-cd/2);hole.closePath();shape.holes.push(hole);
    const geometry=new THREE.ExtrudeGeometry(shape,{depth:.04,bevelEnabled:false});geometry.rotateX(-Math.PI/2);
    const top=mesh(geometry,stone);top.position.y=.82;top.userData.countertopCutout={...c};g.add(top);
  }

  function studioWorkstationSink(g,f,w,d){
    const s=f.workstation;
    if(s.schema!=='WorkstationSinkConcept/1'||s.status!=='EXPLORATORY'||!['washing','prep-covered'].includes(s.mode)||!Array.isArray(s.bowl_mm)||s.bowl_mm.length!==3||s.bowl_mm.some(n=>!Number.isFinite(n)||n<=0)||!Number.isFinite(s.bowl_z_offset_mm)||!Array.isArray(s.tap_position_mm)||s.tap_position_mm.length!==2||s.tap_position_mm.some(n=>!Number.isFinite(n)))throw new Error('Invalid workstation sink concept.');
    const [bw,bd,bh]=s.bowl_mm.map(M),bz=M(s.bowl_z_offset_mm),[tx,tz]=s.tap_position_mm.map(M),st=mat('#c7ccd1',{metalness:.85,roughness:.28}),inside=mat('#939da5',{metalness:.8,roughness:.32});
    if(bw>=w||Math.abs(bz)+bd/2>=d/2||Math.abs(tx)+.028>w/2||Math.abs(tz)+.028>d/2)throw new Error('Workstation sink exceeds its reserve.');
    const back=d/2+bz-bd/2,front=d/2-bz-bd/2;
    g.add(box((w-bw)/2,.002,d,st,-(w+bw)/4,.858,0),box((w-bw)/2,.002,d,st,(w+bw)/4,.858,0),box(bw,.002,back,st,0,.858,-d/2+back/2),box(bw,.002,front,st,0,.858,d/2-front/2));
    const bowl=new THREE.Group();bowl.userData.workstationBowl={width_mm:s.bowl_mm[0],depth_mm:s.bowl_mm[1],height_mm:s.bowl_mm[2]};
    bowl.add(box(bw,.008,bd,inside,0,.858-bh,bz),box(.008,bh,bd,st,-bw/2+.004,.858-bh,bz),box(.008,bh,bd,st,bw/2-.004,.858-bh,bz),box(bw,bh,.008,st,0,.858-bh,bz-bd/2+.004),box(bw,bh,.008,st,0,.858-bh,bz+bd/2-.004),cyl(.025,.025,.002,chrome(),0,.868-bh,bz,20));g.add(bowl);
    const tap=new THREE.Group(),cm=chrome();
    tap.add(cyl(.025,.028,.025,cm,tx,.86,tz,20),tube([[tx,.885,tz],[tx,1.12,tz],[tx,1.16,tz+.04],[tx,1.12,tz+.11],[tx,1.08,tz+.13]],.012,cm),box(.01,.01,.055,cm,tx+.035,.95,tz+.025));
    tap.userData.workstationTap=true;g.add(tap);
    if(s.mode==='prep-covered'){
      const cover=rbox(bw,.016,bd,woodM('#C8B083'),0,.844,bz,.002);
      cover.userData.workstationCover={nominal_mm:[...s.bowl_mm.slice(0,2),16],removable:true};g.add(cover);
    }
    g.userData.workstationSink={...s};
  }
  
  function makeStudioVariant(f) {
    if (
      !f.variant ||
      f.variant === "style" ||
      !STUDIO_VARIANTS[f.type]?.includes(f.variant) ||
      f.type === "bed"
    )
      return null;
    const t =
        currentDecor().id === "custom"
          ? DECOR_THEMES.find((t) => t.id === "warm")
          : currentDecor(),
      g = new THREE.Group(),
      w = M(f.w),
      d = M(f.d),
      c = f.color,
      fab = fabric(c),
      assigned = interiorMaterial(state, f.material_id),
      wood = woodM(t.wood),
      assignedMat = assigned
        ? assigned.category === "wood"
          ? woodM(assigned.base_colour)
          : mat(assigned.base_colour, {
              roughness: assigned.roughness ?? 0.7,
              metalness: assigned.metallic ?? 0,
            })
        : null;
    const connect =
        f.type === "sofa" &&
        f.variant === "modular" &&
        f.product_reference_id === "sofa-connect-soft-3",
      seats = [];
    if (["sofa", "armchair"].includes(f.type)) {
      const n =
          f.type === "armchair"
            ? 1
            : f.variant === "modular"
              ? Math.max(2, Math.round(w / 0.96))
              : 2,
        sw = w / n;
      if (f.variant === "cocoon") {
        for (let i = 0; i < n; i++) {
          const x = -w / 2 + sw * (i + 0.5);
          g.add(rbox(sw - 0.025, 0.48, d - 0.02, fab, x, 0.09, 0, 0.16));
          g.add(rbox(sw - 0.05, 0.4, 0.22, fab, x, 0.38, -d / 2 + 0.13, 0.105));
          cushion(g, sw - 0.15, 0.15, d - 0.23, c, x, 0.3, 0.04);
        }
        for (const side of [-1, 1])
          g.add(
            rbox(
              Math.min(0.16, w * 0.18),
              0.45,
              d * 0.8,
              fab,
              side * (w / 2 - 0.08),
              0.24,
              0.05,
              0.075,
            ),
          );
      } else if (f.variant === "modular") {
        for (let i = 0; i < n; i++) {
          const x = -w / 2 + sw * (i + 0.5);
          g.add(
            rbox(
              sw - 0.02,
              connect ? 0.2 : 0.25,
              d,
              fabric(darker(c, 0.86)),
              x,
              connect ? 0.02 : 0.045,
              0,
              0.055,
            ),
          );
          seats.push(
            cushion(
              g,
              sw - 0.03,
              0.17,
              d - 0.23,
              c,
              x,
              connect ? 0.23 : 0.295,
              0.105,
            ),
          );
          cushion(
            g,
            sw - 0.04,
            0.36,
            0.2,
            c,
            x,
            connect ? 0.3282 : 0.35,
            -d / 2 + 0.11,
            -0.06,
          );
        }
        for (const side of [-1, 1])
          g.add(
            rbox(
              0.12,
              connect ? 0.28 : 0.34,
              d * 0.86,
              fab,
              side * (w / 2 - 0.06),
              connect ? 0.25 : 0.27,
              0.04,
              0.04,
            ),
          );
      } else {
        legs(
          g,
          w - 0.03,
          d - 0.03,
          0.17,
          mat(t.metal, { metalness: 0.65, roughness: 0.38 }),
          0.025,
          0.013,
        );
        g.add(rbox(w - 0.06, 0.12, d, fab, 0, 0.17, 0, 0.022));
        g.add(rbox(w, 0.53, 0.09, fab, 0, 0.29, -d / 2 + 0.045, 0.025));
        for (const side of [-1, 1])
          g.add(
            rbox(0.085, 0.4, d, fab, side * (w / 2 - 0.0425), 0.29, 0, 0.022),
          );
        for (let i = 0; i < n; i++) {
          const x = -(w - 0.17) / 2 + ((w - 0.17) / n) * (i + 0.5);
          cushion(g, (w - 0.17) / n - 0.015, 0.13, d - 0.15, c, x, 0.29, 0.04);
          cushion(
            g,
            (w - 0.17) / n - 0.02,
            0.37,
            0.12,
            c,
            x,
            0.44,
            -d / 2 + 0.12,
            -0.05,
          );
        }
      }
      if (f.type === "sofa")
        cushion(
          g,
          0.3,
          0.3,
          0.12,
          t.accent,
          -w * 0.28,
          connect ? 0.34 : 0.43,
          -d * 0.14,
          -0.09,
        );
    } else if (f.type === "counter") {
      const assigned = interiorMaterial(state, f.material_id);
      const cm =
        assigned?.category === "wood"
          ? woodM(assigned.base_colour)
          : mat(c, { roughness: 0.45 });
      const stone = mat("#dcd7cf", { roughness: 0.22 });
      const n = Math.max(1, Math.round(w / 0.6));
      const fz = d / 2 - 0.04;
      if (!studioCounterJoinery(g,f,w,d,cm)) {
        g.add(
          box(w - 0.01, 0.08, d - 0.08, "#4a4641", 0, 0, -0.04),
          box(w, 0.74, d - 0.04, cm, 0, 0.08, -0.02),
        );
        fronts(g, -w / 2 + 0.005, 0.08, w - 0.01, 0.72, fz, n, 1, cm, "edge", 0.48);
      }
      studioCountertop(g,f,w,d,stone);
    } else if (f.type === "shower" && f.variant === "frameless-low-profile") {
      // FAMILY STUDY ONLY: low profile is a render surrogate, not an approved drain/build-up.
      // Show slim clear glass side + closed pivot leaf without bulky full-height dark frames.
      // Pivot leaf and any shower threshold require vendor-specific swing/access validation.
      const cm = mat("#b5bebc", { metalness: 0.74, roughness: 0.27 });
      const porcelain = mat("#e7e1d8", { roughness: 0.84 });
      const clear = mat("#d9eef0", {
        transparent: true, opacity: 0.18, roughness: 0.08, metalness: 0.02,
        depthWrite: false, side: THREE.DoubleSide,
      });
      const pivot = Math.min(0.58, w * 0.68);
      const fixed = w - pivot, zFront = d / 2 - 0.006, hingeX = -w / 2 + fixed;
      g.add(
        rbox(w, 0.035, d, porcelain, 0, 0, 0, 0.006),
        box(w * 0.62, 0.003, 0.028, cm, 0, 0.038, -d / 2 + 0.09),
        box(0.008, 1.96, d - 0.014, clear, w / 2 - 0.007, 0.035, 0),
      );
      const sideLight = box(fixed, 1.96, 0.008, clear, -w / 2 + fixed / 2, 0.035, zFront);
      const door = box(pivot, 1.96, 0.008, clear, hingeX + pivot / 2, 0.035, zFront);
      sideLight.castShadow = false; door.castShadow = false;
      g.add(sideLight, door);
      for (const yy of [0.4, 1.63])
        g.add(rbox(0.018, 0.078, 0.035, cm, hingeX, 0.035 + yy, zFront + 0.008, 0.004));
      g.add(rbox(0.017, 0.21, 0.036, cm, w / 2 - 0.087, 1.03, zFront + 0.024, 0.006));
      const x = -w * 0.25, z = -d / 2 + 0.09;
      g.add(
        rbox(0.14, 0.090, 0.035, cm, x, 1.04, z, 0.012),
        rod([x, 1.13, z], [x, 2.01, z], 0.012, cm),
        rod([x, 2.01, z], [x, 2.01, z + 0.18], 0.012, cm),
        box(0.23, 0.012, 0.23, cm, x, 2.00, z + 0.18),
      );
    } else if (f.type === "shower" && f.variant === "walk-in") {
      // A flush wet area, not a second glass enclosure. Use the separate
      // interior divider object for a fixed screen; permit an open entry.
      const metal = mat("#b8c1c6", { metalness: 0.72, roughness: 0.26 });
      const x = -w * 0.25;
      const z = -d / 2 + 0.09;
      g.add(
        box(w, 0.008, d, mat("#e7e0d6", { roughness: 0.86 }), 0, 0.004, 0),
        box(Math.min(0.60, w * 0.55), 0.006, 0.035, metal, 0, 0.011, -d / 2 + 0.11),
        rbox(0.15, 0.095, 0.035, metal, x, 1.04, z, 0.012),
        rod([x, 1.13, z], [x, 2.05, z], 0.012, metal),
        rod([x, 2.05, z], [x, 2.05, z + 0.20], 0.012, metal),
        box(0.24, 0.012, 0.24, metal, x, 2.04, z + 0.20),
      );
    } else if (f.type === "fridge") {
      const m =
        f.variant === "integrated"
          ? (f.material_id ? interiorPbr(f.material_id,f.color,{width:f.w,height:1940}) : mat(f.color || "#ddd5c8",{roughness:.8}))
          : mat("#a4abb0", { metalness: 0.72, roughness: 0.3 });
      g.add(rbox(w, 1.94, d, m, 0, 0.015, 0, 0.025));
      g.add(box(w - 0.02, 0.006, 0.01, mat("#30343a"), 0, 0.67, d / 2 + 0.001));
      for (const y of [0.32, 1.13])
        g.add(
          box(
            0.025,
            0.25,
            0.033,
            mat(t.metal, { metalness: 0.8, roughness: 0.32 }),
            w * 0.34,
            y,
            d / 2 + 0.01,
          ),
        );
    } else if (f.type === "dishwasher") {
      const m =
        f.variant === "integrated"
          ? (f.material_id ? interiorPbr(f.material_id,f.color,{width:f.w,height:840}) : mat(f.color || "#ddd5c8",{roughness:.8}))
          : mat("#a8afb4", { metalness: 0.7, roughness: 0.3 });
      g.add(rbox(w, 0.84, d, m, 0, 0.035, 0, 0.014));
      g.add(box(w * 0.8, 0.014, 0.025, mat("#383b40"), 0, 0.75, d / 2 + 0.005));
      if (f.variant === "steel")
        g.add(
          box(w - 0.01, 0.07, 0.012, mat("#24282c"), 0, 0.8, d / 2 + 0.012),
        );
    } else if (f.type === "ovencol") {
      g.add(rbox(w, 2.15, d, assignedMat || wood, 0, 0.025, 0, 0.008));
      const m =
        f.variant === "steel"
          ? mat("#a7aeb2", { metalness: 0.75, roughness: 0.26 })
          : mat("#171b20", { roughness: 0.25, metalness: 0.2 });
      g.add(box(w - 0.04, 0.6, 0.025, m, 0, 0.87, d / 2 + 0.002));
      g.add(
        box(
          w * 0.74,
          0.37,
          0.012,
          mat("#0c1218", { roughness: 0.08, metalness: 0.3 }),
          0,
          0.97,
          d / 2 + 0.025,
        ),
      );
      g.add(
        box(
          w * 0.68,
          0.021,
          0.03,
          mat("#b7bec1", { metalness: 0.8, roughness: 0.25 }),
          0,
          1.3,
          d / 2 + 0.04,
        ),
      );
    }
    if (connect) {
      g.updateMatrixWorld(true);
      g.userData.referenceGeometry = {
        product_reference_id: f.product_reference_id,
        seat_top_mm:
          Math.max(
            ...seats.map((s) => new THREE.Box3().setFromObject(s).max.y),
          ) * 1000,
      };
    }
    batchSceneMeshes(g);
    g.position.set(wx(f.cx), 0, wz(f.cy));
    g.rotation.y = (-f.rot * Math.PI) / 180;
    g.userData.fid = f.id;
    g.userData.modelForm = "independent-" + f.variant;
    g.userData.referenceVariant = f.variant;
    g.traverse((o) => (o.userData.fid = f.id));
    return g;
  }
  function studioFeature(g, feature, rid) {
    g.userData.sceneFeature = feature;
    g.userData.roomId = rid;
    g.visible = opt.cut >= H;
    sceneDecorG.add(g);
    return g;
  }
  function studioSpot(options, power, x, y, z, rid, shadows = false) {
    const light = new THREE.SpotLight(
      studioLightColour(options.temperature),
      power,
      7,
      Math.PI / 5,
      0.38,
      2,
    );
    light.position.set(x, y, z);
    light.target.position.set(x, 0, z);
    light.castShadow = shadows;
    light.shadow.mapSize.set(512, 512);
    light.shadow.bias = -0.0004;
    light.userData.sceneLight = true;
    light.userData.basePower = power;
    light.userData.roomId = rid;
    sceneDecorG.add(light, light.target);
    return light;
  }
  function studioRoomTrack(room, options) {
    const candidates = state.furniture.filter(
      (f) =>
        ["coffeetable", "table", "bed"].includes(f.type) &&
        pointInRoom([f.cx, f.cy], room.poly),
    );
    const anchors = candidates.length
      ? candidates
          .filter(
            (f) =>
              !interiorLayer(state).objects.some(
                (o) =>
                  o.type === "pendant" &&
                  o.room_id === room.id &&
                  Math.hypot(o.cx - f.cx, o.cy - f.cy) < 600,
              ),
          )
          .map((f) => [f.cx, f.cy])
      : [room.at];
    for (const [x, z] of anchors) {
      let alongX = true,
        L = 1.65;
      if (
        !pointInRoom([x - L * 500, z], room.poly) ||
        !pointInRoom([x + L * 500, z], room.poly)
      )
        alongX = false;
      if (
        !pointInRoom([x, z - L * 500], room.poly) ||
        !pointInRoom([x, z + L * 500], room.poly)
      ) {
        if (!alongX) L = 0.7;
      }
      const g = new THREE.Group(),
        metal = mat("#272c32", { metalness: 0.6, roughness: 0.4 });
      g.add(
        box(
          alongX ? L : 0.026,
          0.026,
          alongX ? 0.026 : L,
          metal,
          0,
          H - 0.035,
          0,
        ),
      );
      for (const q of [-0.3, 0, 0.3]) {
        const px = alongX ? q * L : 0,
          pz = alongX ? 0 : q * L;
        g.add(cyl(0.034, 0.038, 0.115, metal, px, H - 0.155, pz, 24));
        const em = mat("#fff4dc", {
          emissive: "#ffd5a0",
          emissiveIntensity: 0.18,
        });
        em.userData.sceneEmitter = true;
        g.add(cyl(0.03, 0.03, 0.004, em, px, H - 0.158, pz, 20));
        const light = studioSpot(
          options,
          5.0,
          wx(x) + px,
          H - 0.18,
          wz(z) + pz,
          room.id,
          q === 0,
        );
        light.userData.fixtureType = "track-spot";
      }
      batchSceneMeshes(g);
      g.position.set(wx(x), 0, wz(z));
      studioFeature(g, "track", room.id);
    }
  }
  function studioRoomDownlights(room, options) {
    const [x, z] = room.at;
    for (const [dx, dz] of [
      [-450, -450],
      [450, -450],
      [-450, 450],
      [450, 450],
    ]) {
      if (!pointInRoom([x + dx, z + dz], room.poly)) continue;
      const em = mat("#fff3dd", {
        emissive: "#ffe0b7",
        emissiveIntensity: 0.18,
      });
      em.userData.sceneEmitter = true;
      const g = new THREE.Group();
      g.add(
        cyl(0.055, 0.055, 0.008, mat("#faf7ee"), 0, H - 0.012, 0),
        cyl(0.042, 0.042, 0.004, em, 0, H - 0.017, 0),
      );
      g.position.set(wx(x + dx), 0, wz(z + dz));
      studioFeature(g, "downlight", room.id);
      studioSpot(options, 4.0, wx(x + dx), H - 0.06, wz(z + dz), room.id);
    }
  }
  function studioRoomLamps(room, options) {
    const sofa = state.furniture.find(
      (f) =>
        ["sofa", "bed"].includes(f.type) &&
        pointInRoom([f.cx, f.cy], room.poly),
    );
    const anchors = sofa
      ? [
          [-sofa.w / 2 - 500, 0],
          [sofa.w / 2 + 500, 0],
          [0, sofa.d / 2 + 500],
          [0, -sofa.d / 2 - 500],
        ].map(([x, z]) => {
          const a = (sofa.rot * Math.PI) / 180;
          return [
            sofa.cx + x * Math.cos(a) - z * Math.sin(a),
            sofa.cy + x * Math.sin(a) + z * Math.cos(a),
          ];
        })
      : [room.at];
    const flat = new Set([
      "rug",
      "tv",
      "acwall",
      "aircon",
      "stove",
      "ksink",
      "waterheater",
      "baycushion",
    ]);
    let mount = null;
    for (const anchor of anchors) {
      const m = nearestSolidMount(room.id, anchor, 0.44);
      if (!m) continue;
      const footprint = {
        cx: MODEL.width_mm / 2 + (m.x + m.nx * 0.24) * 1000,
        cy: MODEL.depth_mm / 2 + (m.z + m.nz * 0.24) * 1000,
        w: 440,
        d: 440,
        rot: 0,
      };
      if (
        studioFit(footprint, MODEL)?.id === room.id &&
        !state.furniture.some(
          (f) => !flat.has(f.type) && studioOverlaps(footprint, f),
        )
      ) {
        mount = m;
        break;
      }
    }
    const wallMount = mount || nearestSolidMount(room.id, room.at, 0.2);
    if (!wallMount) return;
    const g = new THREE.Group(),
      metal = mat("#6e6453", { metalness: 0.7, roughness: 0.4 }),
      em = mat("#eee6d7", {
        emissive: "#ffd3a0",
        emissiveIntensity: 0.18,
        side: THREE.DoubleSide,
      });
    em.userData.sceneEmitter = true;
    g.add(
      cyl(0.13, 0.13, 0.03, metal),
      cyl(0.012, 0.012, 1.32, metal, 0, 0.03, 0),
      cyl(0.14, 0.2, 0.25, em, 0, 1.25, 0),
    );
    if (mount) {
      const x = mount.x + mount.nx * 0.24,
        z = mount.z + mount.nz * 0.24;
      g.position.set(x, 0, z);
      batchSceneMeshes(g);
      studioFeature(g, "floor-lamp", room.id);
      studioLampFootprints.push({ x, z, radius: 0.2, roomId: room.id });
      sceneLight(
        studioLightColour(options.temperature),
        2.2,
        x,
        1.34,
        z,
        room.id,
      );
    }
    const wall = new THREE.Group();
    wall.add(
      box(0.12, 0.18, 0.028, metal, 0, -0.09, 0),
      blob(0.075, 0.09, 0.08, em, 0, 0, 0.08),
    );
    wall.position.set(wallMount.x, 1.68, wallMount.z);
    wall.rotation.y = Math.atan2(wallMount.nx, wallMount.nz);
    studioFeature(wall, "wall-lamp", room.id);
    sceneLight(
      studioLightColour(options.temperature),
      1.0,
      wallMount.x + wallMount.nx * 0.13,
      1.68,
      wallMount.z + wallMount.nz * 0.13,
      room.id,
    );
  }
  function buildStudioRoomScene() {
    studioLampFootprints = [];
    for (const room of ROOMS.filter((r) => !r.isTerrace)) {
      const o = studioRoomOptions(state, room.id);
      if (o.hvac !== "none") {
        const tv = state.furniture.find(
          (f) => f.type === "tv" && pointInRoom([f.cx, f.cy], room.poly),
        );
        const zs = room.poly.map((p) => p[1]),
          mount = nearestSolidMount(
            room.id,
            tv ? [tv.cx, tv.cy] : [room.at[0] + 600, Math.max(...zs) - 240],
            o.hvac === "wall-split" ? 0.86 : 1.18,
          );
        if (mount) {
          const g = new THREE.Group(),
            white = mat("#f3f4f1", { roughness: 0.35 });
          if (o.hvac === "wall-split") {
            g.add(
              rbox(0.86, 0.25, 0.18, white, 0, -0.125, 0.04, 0.03),
              box(0.75, 0.024, 0.01, mat("#303b40"), 0, -0.085, 0.14),
              box(0.05, 0.014, 0.008, mat("#779eae"), 0.3, 0.045, 0.139),
            );
            g.position.y = H - 0.23;
          } else {
            g.add(box(1.18, 0.058, 0.015, white, 0, -0.029, 0));
            for (const y of [-0.015, 0.006])
              g.add(box(1.1, 0.008, 0.01, mat("#30363a"), 0, y, 0.014));
            g.position.y = H - 0.095;
          }
          g.position.x = mount.x;
          g.position.z = mount.z;
          g.rotation.y = Math.atan2(mount.nx, mount.nz);
          g.userData.feasibility = "TBD";
          studioFeature(
            g,
            o.hvac === "wall-split" ? "wall-ac" : "concealed-grille",
            room.id,
          );
        }
      }
      if (o.ceiling !== "plain") {
        const g = new THREE.Group(),
          led = o.ceiling === "perimeter-led",
          m = led
            ? mat("#fff2d3", { emissive: "#ffe0a3", emissiveIntensity: 0.18 })
            : mat("#34383b");
        if (led) m.userData.sceneEmitter = true;
        for (let i = 0; i < room.poly.length; i++) {
          const a = room.poly[i],
            b = room.poly[(i + 1) % room.poly.length],
            dx = b[0] - a[0],
            dz = b[1] - a[1],
            L = Math.hypot(dx, dz);
          if (L < 250) continue;
          let nx = -dz / L,
            nz = dx / L;
          const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
          if (!pointInRoom([mid[0] + nx * 180, mid[1] + nz * 180], room.poly)) {
            nx = -nx;
            nz = -nz;
          }
          const start = [
              a[0] + nx * 180 + (dx / L) * 200,
              a[1] + nz * 180 + (dz / L) * 200,
            ],
            end = [
              b[0] + nx * 180 - (dx / L) * 200,
              b[1] + nz * 180 - (dz / L) * 200,
            ];
          if (
            !pointInRoom(start, room.poly) ||
            !pointInRoom(end, room.poly) ||
            L < 450
          )
            continue;
          g.add(
            rod(
              [wx(start[0]), H - 0.012, wz(start[1])],
              [wx(end[0]), H - 0.012, wz(end[1])],
              led ? 0.007 : 0.004,
              m,
              0.004,
              8,
            ),
          );
        }
        batchSceneMeshes(g);
        studioFeature(g, led ? "perimeter-led" : "gypsum-shadow-gap", room.id);
        if (led)
          sceneLight(
            studioLightColour(o.temperature),
            1.1,
            wx(room.at[0]),
            H - 0.1,
            wz(room.at[1]),
            room.id,
          );
      }
      if (["track", "track-lamps"].includes(o.lighting))
        studioRoomTrack(room, o);
      if (o.lighting === "downlights") studioRoomDownlights(room, o);
      if (["lamps", "track-lamps"].includes(o.lighting))
        studioRoomLamps(room, o);
    }
  }

  function buildSceneDecor() {
    clearGroup(sceneDecorG);
    buildStudioRoomScene();
    const theme = currentDecor();
    if (theme.id === "custom" || !state.furniture.length) {
      applySceneLighting();
      return;
    }
    MODEL.openings
      .filter((o) => o.id.startsWith("GLZ-"))
      .forEach((o) => openingCurtains(o, theme));
    const sofa = state.furniture.find(
      (f) =>
        ["sofa", "cornersofa"].includes(f.type) &&
        pointInRoom([f.cx, f.cy], ROOMS.find((r) => r.id === "RECP-01").poly),
    );
    const dining = state.furniture.find(
      (f) =>
        f.type === "table" &&
        pointInRoom([f.cx, f.cy], ROOMS.find((r) => r.id === "RECP-01").poly),
    );
    const artItems = [
      ...(sofa ? [{ rid: "RECP-01", f: sofa, w: 0.72, y: 1.64 }] : []),
      ...(dining ? [{ rid: "RECP-01", f: dining, w: 0.8, y: 1.65 }] : []),
    ];
    for (const r of ROOMS.filter((r) => r.kind === "bedroom")) {
      const bed = state.furniture.find(
        (f) => f.type === "bed" && pointInRoom([f.cx, f.cy], r.poly),
      );
      if (bed) artItems.push({ rid: r.id, f: bed, w: 0.55, y: 1.76 });
    }
    for (const { rid, f, w, y } of artItems) {
      // An explicit, host-mounted artwork replaces automatic style artwork here.
      if (
        interiorLayer(state).objects.some(
          (o) => o.type === "artwork" && o.room_id === rid,
        )
      )
        continue;
      const mount = nearestSolidMount(rid, [f.cx, f.cy], w);
      if (mount) framedArtwork(mount, theme, w, y);
    }
    const coffee = state.furniture.find(
      (f) =>
        f.type === "coffeetable" &&
        pointInRoom([f.cx, f.cy], ROOMS.find((r) => r.id === "RECP-01").poly),
    );
    if (coffee) pendantAt(wx(coffee.cx), wz(coffee.cy), theme, "RECP-01");
    if (dining) pendantAt(wx(dining.cx), wz(dining.cy), theme, "RECP-01", true);
    for (const r of ROOMS.filter((r) => r.kind === "bedroom")) {
      const bed = state.furniture.find(
        (f) => f.type === "bed" && pointInRoom([f.cx, f.cy], r.poly),
      );
      if (bed) pendantAt(wx(bed.cx), wz(bed.cy), theme, r.id);
    }
    // Low, removable surface details; wall envelopes and ceiling planes stay fixed.
    for (const s of WALL_SEGMENTS.filter((s) => s.kind !== "low")) {
      const rid = s.rooms.find((id) =>
        ROOMS.some((r) => r.id === id && !r.isTerrace),
      );
      if (!rid) continue;
      const L = Math.hypot(s.to[0] - s.from[0], s.to[1] - s.from[1]) / 1000;
      if (L < 0.25) continue;
      const mount = nearestSolidMount(
        rid,
        [(s.from[0] + s.to[0]) / 2, (s.from[1] + s.to[1]) / 2],
        Math.max(0.03, L - 0.22),
      );
      if (!mount) continue;
      const skirting = box(
        Math.max(0.03, L - 0.02),
        0.055,
        0.012,
        woodM(theme.woodDark),
      );
      skirting.position.set(mount.x, 0.004, mount.z);
      skirting.rotation.y = Math.atan2(mount.nx, mount.nz);
      skirting.userData.sceneFeature = "skirting";
      sceneDecorG.add(skirting);
    }
    applySceneLighting();
  }
  function applySceneLighting() {
    if (!sceneDecorG) return;
    sceneSurfaceCache.forEach((m) => {
      m.envMapIntensity = 0.35 * (opt.night ? 0.15 : 1);
    });
    sceneDecorG.traverse((o) => {
      if (o.userData.sceneLight) {
        const v = studioRoomOptions(state, o.userData.roomId);
        o.color.set(studioLightColour(v.temperature));
        o.intensity =
          o.userData.basePower * (v.brightness / 75) * (opt.night ? 1 : 0.2);
      }
      for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
        if (m?.userData.sceneEmitter) {
          let parent = o;
          while (parent && !parent.userData.roomId) parent = parent.parent;
          const rid = parent?.userData.roomId,
            v = studioRoomOptions(state, rid);
          let emitter = m;
          if (m.userData.studioRoom !== rid) {
            emitter = m.clone();
            emitter.userData.studioRoom = rid;
            if (Array.isArray(o.material))
              o.material = o.material.map((x) => (x === m ? emitter : x));
            else o.material = emitter;
          }
          emitter.emissive.set(studioLightColour(v.temperature));
          emitter.emissiveIntensity =
            ((opt.night ? 0.75 : 0.18) * v.brightness) / 75;
        }
      }
    });
  }
  const INTERIOR_POSES = {
    living: { room: "RECP-01", p: [11400, 1.62, 4570], t: [10600, 1.5, 1600] },
    dining: { room: "RECP-01", p: [13250, 1.62, 9440], t: [14300, 1.45, 7400] },
    master: { room: "MBR-01", p: [3400, 1.62, 8380], t: [1400, 1.02, 6320] },
    bedroom1: { room: "BR-01", p: [4700, 1.62, 4650], t: [2830, 1.02, 2670] },
    bedroom2: { room: "BR-02", p: [6100, 1.62, 4700], t: [8100, 1.02, 2700] },
  };
  function interiorPose(id = "living") {
    const v = INTERIOR_POSES[id];
    if (!v) throw new Error("Unknown interior view.");
    return pose(
      new THREE.Vector3(wx(v.t[0]), v.t[1], wz(v.t[2])),
      new THREE.Vector3(wx(v.p[0]), v.p[1], wz(v.p[2])),
    );
  }

  function buildFurniture(f) {
    const optionModel = makeStudioVariant(f);
    if (optionModel) return optionModel;
    const styled = makeStyleFurniture(f);
    if (styled) return styled;
    const g = new THREE.Group(),
      w = M(f.w),
      d = M(f.d),
      c = f.color || "#ddd",
      bz = -d / 2,
      R = rng(Math.round(f.w * 7 + f.d * 13 + f.cx + f.cy));
    switch (f.type) {
      case "bed": {
        const fr = woodM(decorSurface("wood", "#8d7258")),
          fab = fabric(c),
          fh = 0.3,
          mt = 0.22,
          top = fh + mt,
          n = Math.max(3, Math.round(w / 0.28)),
          sw = (w - 0.04) / n;
        g.add(
          box(w - 0.12, 0.06, d - 0.14, "#4a3e33", 0, 0, 0.03),
          rbox(w, fh - 0.06, d - 0.08, fr, 0, 0.06, 0.04, 0.015),
        ); // 内缩踢脚 + 床箱
        g.add(rbox(w, 1.08, 0.06, fr, 0, 0, bz + 0.03, 0.012)); // 床头板
        for (let i = 0; i < n; i++)
          g.add(
            rbox(
              sw - 0.006,
              0.62,
              0.06,
              fabric(darker(c, 0.8)),
              -w / 2 + 0.02 + sw * (i + 0.5),
              0.42,
              bz + 0.08,
              0.025,
            ),
          ); // 竖向软包
        const md = d - 0.13,
          dd = md * 0.66,
          dz = d / 2 - 0.015 - dd / 2;
        g.add(
          rbox(w - 0.06, mt, md, "#f6f3ee", 0, fh, bz + 0.11 + md / 2, 0.07),
        ); // 床垫
        g.add(
          rbox(w + 0.02, 0.27, dd, fab, 0, top - 0.2, dz, 0.04),
          rbox(
            w + 0.024,
            0.06,
            0.22,
            fabric("#fbfaf7"),
            0,
            top + 0.025,
            dz - dd / 2 + 0.11,
            0.025,
          ),
        ); // 被子 + 翻边
        g.add(
          rbox(
            w + 0.05,
            0.285,
            0.42,
            fabric(darker(c, 0.62)),
            0,
            top - 0.205,
            d / 2 - 0.35,
            0.03,
          ),
        ); // 床尾巾
        const np = w >= 1.3 ? 2 : 1,
          pw = (w - 0.16 - (np - 1) * 0.06) / np;
        for (let i = 0; i < np; i++) {
          const x = -w / 2 + 0.08 + pw / 2 + i * (pw + 0.06);
          g.add(
            rot(
              rbox(
                pw,
                0.15,
                0.42,
                fabric("#ffffff"),
                x,
                top - 0.01,
                bz + 0.34,
                0.07,
              ),
              -0.28,
            ),
            rot(
              rbox(
                pw * 0.62,
                0.3,
                0.1,
                fabric(i ? "#efe7da" : darker(c, 0.7)),
                x,
                top,
                bz + 0.54,
                0.045,
              ),
              -0.3,
            ),
          );
        }
        break;
      }
      case "sofa":
      case "armchair": {
        const fab = fabric(c),
          dk = fabric(darker(c, 0.88)),
          a = Math.min(0.18, w * 0.14),
          n = f.type === "armchair" ? 1 : w > 2.2 ? 3 : 2,
          cw = (w - 2 * a) / n,
          bd = Math.min(0.2, d * 0.24),
          lh = 0.12,
          sd = d - bd - 0.02;
        legs(
          g,
          w,
          d,
          lh,
          woodM(decorSurface("woodDark", "#3a3027")),
          0.07,
          0.018,
        );
        g.add(
          rbox(w, 0.16, d, dk, 0, lh, 0, 0.03),
          rbox(w, 0.73, bd, dk, 0, lh, bz + bd / 2, 0.06),
        );
        [-1, 1].forEach((s) =>
          g.add(rbox(a, 0.5, d, dk, s * (w / 2 - a / 2), lh, 0, 0.07)),
        );
        for (let i = 0; i < n; i++) {
          const x = -w / 2 + a + cw / 2 + i * cw;
          g.add(
            rbox(
              cw - 0.012,
              0.15,
              sd,
              fab,
              x,
              lh + 0.16,
              bz + bd + sd / 2,
              0.055,
            ),
            rot(
              rbox(
                cw - 0.03,
                0.44,
                0.16,
                fab,
                x,
                lh + 0.3,
                bz + bd + 0.08,
                0.07,
              ),
              -0.16,
            ),
          );
        }
        if (n > 1)
          [-1, 1].forEach((s) =>
            g.add(
              rot(
                rbox(
                  0.42,
                  0.42,
                  0.12,
                  fabric(
                    s < 0 ? decorSurface("accent", "#ece5d8") : darker(c, 0.7),
                  ),
                  s * (w / 2 - a - 0.26),
                  lh + 0.32,
                  bz + bd + 0.22,
                  0.06,
                ),
                -0.3,
                s * -0.25,
              ),
            ),
          );
        else
          g.add(
            rot(
              rbox(
                0.4,
                0.26,
                0.1,
                fabric(decorSurface("accent", "#ece5d8")),
                0,
                lh + 0.33,
                bz + bd + 0.2,
                0.05,
              ),
              -0.25,
            ),
          );
        break;
      }
      case "cornersofa": {
        const k = Math.min(0.95, d * 0.56, w * 0.4),
          b = 0.2,
          fab = fabric(c),
          dk = fabric(darker(c, 0.88)),
          lh = 0.1,
          sw = (w - b - 0.2) / 2;
        [
          [-w / 2 + 0.07, bz + 0.07],
          [w / 2 - 0.07, bz + 0.07],
          [w / 2 - 0.07, bz + k - 0.07],
          [-w / 2 + 0.07, d / 2 - 0.07],
          [-w / 2 + k - 0.07, d / 2 - 0.07],
          [-w / 2 + k - 0.07, bz + k - 0.07],
        ].forEach(([x, z]) =>
          g.add(
            rod(
              [x, 0, z],
              [x, lh, z],
              0.012,
              woodM(decorSurface("woodDark", "#3a3027")),
              0.018,
            ),
          ),
        );
        g.add(
          rbox(w, 0.18, k, dk, 0, lh, bz + k / 2, 0.03),
          rbox(
            k,
            0.18,
            d - k + 0.02,
            dk,
            -w / 2 + k / 2,
            lh,
            bz + k + (d - k) / 2 - 0.01,
            0.03,
          ),
        );
        g.add(
          rbox(w, 0.72, b, dk, 0, lh, bz + b / 2, 0.06),
          rbox(b, 0.72, d, dk, -w / 2 + b / 2, lh, 0, 0.06),
          rbox(0.2, 0.5, k, dk, w / 2 - 0.1, lh, bz + k / 2, 0.07),
          rbox(k, 0.5, 0.2, dk, -w / 2 + k / 2, lh, d / 2 - 0.1, 0.07),
        );
        for (let i = 0; i < 2; i++) {
          const x = -w / 2 + b + sw / 2 + i * sw;
          g.add(
            rbox(
              sw - 0.012,
              0.15,
              k - b - 0.02,
              fab,
              x,
              lh + 0.18,
              bz + b + (k - b) / 2,
              0.055,
            ),
            rot(
              rbox(
                sw - 0.04,
                0.42,
                0.16,
                fab,
                x,
                lh + 0.3,
                bz + b + 0.07,
                0.07,
              ),
              -0.16,
            ),
          );
        }
        g.add(
          rbox(
            k - b - 0.02,
            0.15,
            d - k - 0.22,
            fab,
            -w / 2 + b + (k - b) / 2,
            lh + 0.18,
            bz + k + (d - k - 0.2) / 2,
            0.055,
          ),
        );
        const L = d - 0.2 - b - 0.18,
          nl = Math.max(1, Math.round(L / 0.75));
        for (let i = 0; i < nl; i++)
          g.add(
            rot(
              rbox(
                0.16,
                0.42,
                L / nl - 0.03,
                fab,
                -w / 2 + b + 0.07,
                lh + 0.3,
                bz + b + 0.18 + (L / nl) * (i + 0.5),
                0.07,
              ),
              0,
              0,
              0.16,
            ),
          );
        g.add(
          rot(
            rbox(
              0.42,
              0.42,
              0.12,
              fabric(decorSurface("accent", "#ece5d8")),
              -w / 2 + b + 0.3,
              lh + 0.34,
              bz + b + 0.24,
              0.06,
            ),
            -0.35,
            0.6,
          ),
          rot(
            rbox(
              0.4,
              0.4,
              0.12,
              fabric(darker(c, 0.7)),
              w / 2 - 0.5,
              lh + 0.34,
              bz + b + 0.2,
              0.06,
            ),
            -0.3,
            -0.25,
          ),
        );
        break;
      }
      case "nightstand": {
        const wm = woodM(c);
        legs(g, w, d, 0.1, woodM("#5a4a3b"), 0.04, 0.014);
        g.add(rbox(w, 0.4, d - 0.02, wm, 0, 0.1, -0.01, 0.012));
        fronts(
          g,
          -w / 2 + 0.02,
          0.12,
          w - 0.04,
          0.36,
          d / 2 - 0.02,
          1,
          2,
          wm,
          "bar",
        );
        tableLamp(g, -w * 0.12, 0.5, -d * 0.12);
        g.add(
          box(0.16, 0.025, 0.22, "#2f5d62", w * 0.24, 0.5, 0.04),
          box(0.14, 0.02, 0.2, "#e6dccd", w * 0.24, 0.525, 0.04),
        );
        break;
      }
      case "wardrobe":
      case "cabinet":
      case "shoecab": {
        const cm = mat(c, { roughness: 0.55 }),
          fz = d / 2 - 0.02;
        if (f.type === "wardrobe") {
          const h = 2.2,
            n = Math.max(1, Math.round(w / 0.5));
          g.add(
            box(w - 0.02, 0.08, d - 0.06, "#4a4641", 0, 0, -0.03),
            box(w, h - 0.08, d - 0.02, cm, 0, 0.08, -0.01),
          );
          fronts(g, -w / 2, 0.08, w, h - 0.1, fz, n, 1, cm, "bar", 1.05);
          g.add(box(w, 0.02, d - 0.02, darker(c, 0.9), 0, h - 0.02, -0.01));
        } else if (f.type === "shoecab") {
          const h = 1.0,
            y0 = 0.16,
            n = Math.max(1, Math.round(w / 0.45));
          g.add(
            box(w, h - y0, d - 0.02, cm, 0, y0, -0.01),
            box(
              w - 0.04,
              0.01,
              0.03,
              glowMat("#fff7e6", "#ffe9c4", 0.8),
              0,
              y0 - 0.01,
              fz - 0.06,
            ),
          ); // 悬空 + 底部灯带
          fronts(g, -w / 2, y0, w, h - y0, fz, n, 1, cm, "edge");
          g.add(
            rbox(w + 0.01, 0.025, d, woodM(darker(c, 0.8)), 0, h, 0, 0.006),
          );
          g.add(
            rbox(
              0.22,
              0.015,
              0.14,
              woodM(decorSurface("woodDark", "#6b543f")),
              -w * 0.25,
              h + 0.025,
              0,
              0.006,
            ),
          );
          vase(g, w * 0.28, h + 0.025, -0.03, 0.05, 0.2, "#d8cfc2", R);
        } else {
          const h = 0.85,
            n = Math.max(1, Math.round(w / 0.5));
          legs(
            g,
            w,
            d,
            0.1,
            woodM(decorSurface("woodDark", "#3a3027")),
            0.05,
            0.016,
          );
          g.add(box(w, h - 0.13, d - 0.02, cm, 0, 0.1, -0.01));
          fronts(g, -w / 2, 0.62, w, 0.2, fz, n, 1, cm, "bar");
          fronts(g, -w / 2, 0.1, w, 0.52, fz, n, 1, cm, "bar", 0.52);
          g.add(
            rbox(
              w + 0.02,
              0.03,
              d + 0.01,
              woodM(darker(c, 0.78)),
              0,
              h - 0.03,
              0,
              0.008,
            ),
          );
          vase(g, w * 0.3, h, 0, 0.07, 0.24, "#e9e2d6", R);
          g.add(
            rot(
              box(
                0.3,
                0.38,
                0.02,
                woodM(decorSurface("woodDark", "#3a3027")),
                -w * 0.25,
                h,
                bz + 0.06,
              ),
              -0.12,
            ),
            rot(
              box(
                0.25,
                0.33,
                0.005,
                "#d9cfbf",
                -w * 0.25,
                h + 0.03,
                bz + 0.075,
              ),
              -0.12,
            ),
          ); // 靠墙画框
          g.add(
            lathe(
              [
                [0, 0],
                [0.05, 0],
                [0.12, 0.06],
                [0.13, 0.07],
              ],
              mat("#b8a58c", { roughness: 0.5, side: THREE.DoubleSide }),
              0,
              h,
              0.02,
              32,
            ),
          );
          for (let k = 0; k < 3; k++)
            g.add(
              blob(
                0.035,
                0.035,
                0.035,
                ["#d98c4a", "#c9ad4f", "#b5463a"][k],
                Math.cos(k * 2.1) * 0.04,
                h + 0.045,
                0.02 + Math.sin(k * 2.1) * 0.04,
                14,
              ),
            );
        }
        break;
      }
      case "dresser": {
        const wm = woodM(c),
          r = Math.min(0.34, w * 0.3);
        [
          [-1, -1],
          [1, -1],
          [-1, 1],
          [1, 1],
        ].forEach(([a, b]) =>
          g.add(
            rod(
              [a * (w / 2 - 0.04), 0, b * (d / 2 - 0.04)],
              [a * (w / 2 - 0.05), 0.58, b * (d / 2 - 0.05)],
              0.012,
              wm,
              0.02,
            ),
          ),
        );
        g.add(
          box(w - 0.04, 0.14, d - 0.04, wm, 0, 0.58),
          rbox(w, 0.03, d, wm, 0, 0.72, 0, 0.008),
        );
        fronts(
          g,
          -w / 2 + 0.03,
          0.585,
          w - 0.06,
          0.13,
          d / 2 - 0.02,
          2,
          1,
          wm,
          "knob",
        );
        const mr = new THREE.Mesh(
          new THREE.TorusGeometry(r, 0.018, 12, 64),
          woodM(darker(c, 0.7)),
        );
        mr.position.set(0, 0.77 + r, bz + 0.04);
        sh(mr);
        const mg = new THREE.Mesh(new THREE.CircleGeometry(r, 64), mirror());
        mg.position.set(0, 0.77 + r, bz + 0.035);
        g.add(
          mr,
          mg,
          box(0.08, 0.03, 0.06, woodM(darker(c, 0.7)), 0, 0.75, bz + 0.04),
        );
        [
          ["#e7c9b5", 0.03, 0.09],
          ["#b9d0d8", 0.025, 0.12],
          ["#f0e3cf", 0.02, 0.07],
        ].forEach(([cc, rr, hh], i) =>
          g.add(
            cyl(
              rr,
              rr,
              hh,
              mat(cc, { roughness: 0.15, transparent: true, opacity: 0.8 }),
              w * 0.25 + i * 0.06,
              0.75,
              0.02,
            ),
          ),
        );
        g.add(
          rbox(
            0.16,
            0.06,
            0.1,
            woodM(decorSurface("woodDark", "#6b543f")),
            -w * 0.28,
            0.75,
            0.03,
            0.01,
          ),
        );
        const sz = d / 2 + 0.25;
        [
          [-1, -1],
          [1, -1],
          [-1, 1],
          [1, 1],
        ].forEach(([a, b]) =>
          g.add(
            rod(
              [a * 0.13, 0, sz + b * 0.13],
              [a * 0.12, 0.4, sz + b * 0.12],
              0.01,
              wm,
              0.014,
            ),
          ),
        );
        g.add(rbox(0.34, 0.08, 0.34, fabric("#e8ddd0"), 0, 0.4, sz, 0.035));
        break;
      }
      case "desk": {
        const tm = woodM(c),
          bm = blackMetal();
        g.add(rbox(w, 0.025, d, tm, 0, 0.72, 0, 0.006));
        [-1, 1].forEach((s) => {
          const x = s * (w / 2 - 0.06);
          g.add(
            box(0.03, 0.72, 0.03, bm, x, 0, d / 2 - 0.06),
            box(0.03, 0.72, 0.03, bm, x, 0, bz + 0.06),
            box(0.03, 0.03, d - 0.1, bm, x, 0, 0),
            box(0.03, 0.03, d - 0.1, bm, x, 0.69, 0),
          );
        });
        g.add(
          box(w - 0.12, 0.04, 0.015, bm, 0, 0.66, bz + 0.06),
          box(0.4, 0.09, d - 0.12, tm, w / 2 - 0.32, 0.63, 0),
        );
        pull(g, 0.16, false, w / 2 - 0.32, 0.675, d / 2 - 0.06);
        const my = 0.745,
          mz = bz + 0.15;
        g.add(
          rbox(0.22, 0.012, 0.16, bm, 0, my, mz, 0.004),
          rod([0, my, mz - 0.02], [0, my + 0.2, mz - 0.03], 0.012, bm),
        );
        g.add(
          rbox(0.62, 0.37, 0.02, "#1d1d1f", 0, my + 0.12, mz - 0.04, 0.006),
          box(0.6, 0.33, 0.002, screenMat("#27405c"), 0, my + 0.15, mz - 0.029),
        );
        g.add(
          rbox(0.42, 0.015, 0.13, "#e8e8ea", 0, my, 0.06, 0.004),
          rbox(0.4, 0.004, 0.11, "#d2d2d6", 0, my + 0.014, 0.06, 0.002),
          blob(0.03, 0.015, 0.05, "#e8e8ea", 0.3, my + 0.012, 0.07, 16),
        );
        const lx = -w / 2 + 0.15,
          lz = bz + 0.12;
        g.add(
          cyl(0.07, 0.075, 0.02, bm, lx, my, lz, 28),
          tube(
            [
              [lx, my + 0.02, lz],
              [lx, my + 0.3, lz + 0.03],
              [lx + 0.12, my + 0.42, lz + 0.1],
            ],
            0.008,
            bm,
          ),
        );
        const hd = cyl(
          0.02,
          0.06,
          0.1,
          bm,
          lx + 0.14,
          my + 0.34,
          lz + 0.12,
          24,
        );
        hd.rotation.x = 0.5;
        g.add(hd);
        g.add(
          cyl(
            0.04,
            0.038,
            0.09,
            ceramic({ roughness: 0.3 }),
            w / 2 - 0.15,
            my,
            0.05,
            20,
          ),
          rbox(0.2, 0.015, 0.28, "#3b5566", -w / 2 + 0.3, my, 0.1, 0.004),
        );
        break;
      }
      case "chair": {
        const lw = woodM(decorSurface("woodDark", "#6b543f")),
          fab = fabric(c),
          sy = 0.44;
        [
          [-1, 1],
          [1, 1],
        ].forEach(([s]) =>
          g.add(
            rod(
              [s * (w / 2 - 0.04), 0, d / 2 - 0.05],
              [s * (w / 2 - 0.05), sy, d / 2 - 0.07],
              0.012,
              lw,
              0.018,
            ),
          ),
        );
        [-1, 1].forEach((s) =>
          g.add(
            rod(
              [s * (w / 2 - 0.04), 0, bz + 0.03],
              [s * (w / 2 - 0.05), 0.86, bz + 0.07],
              0.012,
              lw,
              0.018,
            ),
          ),
        );
        g.add(
          box(w - 0.08, 0.025, 0.02, lw, 0, 0.15, d / 2 - 0.06),
          box(w - 0.08, 0.025, 0.02, lw, 0, 0.15, bz + 0.05),
        );
        [-1, 1].forEach((s) =>
          g.add(box(0.02, 0.025, d - 0.12, lw, s * (w / 2 - 0.045), 0.18, 0)),
        );
        g.add(
          box(w - 0.06, 0.04, d - 0.1, lw, 0, sy - 0.03, 0),
          rbox(w - 0.04, 0.05, d - 0.08, fab, 0, sy, 0.005, 0.022),
        );
        g.add(
          rot(
            rbox(w - 0.08, 0.15, 0.025, lw, 0, 0.66, bz + 0.065, 0.012),
            -0.12,
          ),
          rot(box(w - 0.08, 0.025, 0.02, lw, 0, 0.52, bz + 0.055), -0.12),
        );
        break;
      }
      case "bookshelf": {
        const h = 1.8,
          t = 0.022,
          ns = 5,
          wm = woodM(c),
          sh0 = (h - 0.06 - t) / ns,
          cols = [
            "#b88a6a",
            "#6f8f8a",
            "#d9c08c",
            "#9aa58c",
            "#a8675e",
            "#e6dccd",
            "#7d8ea3",
            "#c9bfae",
          ];
        g.add(
          box(w, h, 0.012, woodM(darker(c, 0.85)), 0, 0, bz + 0.006),
          box(t, h, d, wm, -w / 2 + t / 2),
          box(t, h, d, wm, w / 2 - t / 2),
          box(w - 2 * t, 0.06, d - 0.03, wm, 0, 0, 0.0),
        );
        for (let s = 0; s <= ns; s++) {
          const y = s < ns ? 0.06 + s * sh0 : h - t;
          g.add(box(w - 2 * t, t, d - 0.012, wm, 0, y, 0.006));
          if (s === ns) break;
          const yb = y + t,
            end = w / 2 - t - 0.01;
          let x = -w / 2 + t + 0.01,
            deco = R() < 0.55 ? x + R() * (w - 0.45) : 99;
          while (x < end - 0.03) {
            if (x >= deco) {
              deco = 99;
              if (R() < 0.5)
                vase(
                  g,
                  x + 0.07,
                  yb,
                  0,
                  0.045,
                  0.16,
                  cols[Math.floor(R() * 8)],
                  R,
                  false,
                );
              else
                for (let k = 0; k < 3; k++)
                  g.add(
                    box(
                      0.2 - k * 0.02,
                      0.028,
                      d * 0.7,
                      mat(cols[Math.floor(R() * 8)], { roughness: 0.8 }),
                      x + 0.1,
                      yb + k * 0.028,
                      0.01,
                    ),
                  );
              x += 0.2;
              continue;
            }
            if (R() < 0.07) {
              x += 0.03 + R() * 0.05;
              continue;
            }
            const bw = 0.018 + R() * 0.03,
              bh = Math.min(sh0 - t - 0.03, 0.17 + R() * 0.13),
              bd = d * (0.62 + R() * 0.22);
            if (x + bw > end) break;
            g.add(
              box(
                bw,
                bh,
                bd,
                mat(cols[Math.floor(R() * 8)], { roughness: 0.75 }),
                x + bw / 2,
                yb,
                d / 2 - 0.015 - bd / 2,
              ),
            );
            x += bw + 0.002;
          }
        }
        break;
      }
      case "baycushion":
        g.add(rbox(w, 0.08, d, fabric(c), 0, 0.45, 0, 0.03));
        g.add(
          rot(
            rbox(
              w - 0.1,
              0.34,
              0.14,
              fabric("#ffffff"),
              0,
              0.52,
              bz + 0.14,
              0.06,
            ),
            0.25,
          ),
          rot(
            rbox(
              w - 0.1,
              0.34,
              0.14,
              fabric("#f0e6d6"),
              0,
              0.52,
              d / 2 - 0.14,
              0.06,
            ),
            -0.25,
          ),
        );
        g.add(
          rbox(
            w * 0.8,
            0.04,
            0.3,
            fabric(darker(c, 0.7)),
            0,
            0.53,
            d * 0.12,
            0.02,
          ),
          rbox(
            0.28,
            0.015,
            0.2,
            woodM(decorSurface("wood", "#8d7258")),
            0,
            0.53,
            -d * 0.15,
            0.006,
          ),
          cyl(0.035, 0.03, 0.06, ceramic(), 0, 0.545, -d * 0.15, 20),
        );
        break;
      case "coffeetable": {
        const tm = mat(c, { roughness: 0.35 }),
          lw = woodM(decorSurface("woodDark", "#3a3027"));
        [
          [-1, -1],
          [1, -1],
          [-1, 1],
          [1, 1],
        ].forEach(([a, b]) =>
          g.add(
            rod(
              [a * (w / 2 - 0.05), 0, b * (d / 2 - 0.05)],
              [a * (w / 2 - 0.07), 0.365, b * (d / 2 - 0.07)],
              0.012,
              lw,
              0.02,
            ),
          ),
        );
        g.add(
          rbox(w, 0.035, d, tm, 0, 0.365, 0, 0.015),
          rbox(
            w - 0.12,
            0.02,
            d - 0.12,
            woodM(darker(c, 0.85)),
            0,
            0.12,
            0,
            0.006,
          ),
        );
        g.add(
          box(0.3, 0.03, 0.22, "#2f5d62", w * 0.2, 0.14, 0),
          box(0.26, 0.025, 0.19, "#d9b36c", w * 0.2, 0.17, 0.01),
        );
        g.add(
          rbox(
            0.38,
            0.015,
            0.24,
            woodM(decorSurface("woodDark", "#6b543f")),
            -w * 0.2,
            0.4,
            0,
            0.006,
          ),
          box(0.22, 0.025, 0.16, "#e6dccd", -w * 0.22, 0.415, 0),
        );
        g.add(
          lathe(
            [
              [0, 0],
              [0.025, 0],
              [0.035, 0.07],
              [0.034, 0.08],
            ],
            ceramic({ side: THREE.DoubleSide }),
            -w * 0.12,
            0.415,
            0.06,
            20,
          ),
        );
        vase(g, w * 0.24, 0.4, -0.05, 0.055, 0.18, "#e9e2d6", R);
        break;
      }
      case "tvstand": {
        const sm = mat(c, { roughness: 0.5 }),
          n = Math.max(2, Math.round(w / 0.6));
        legs(g, w, d, 0.1, blackMetal(), 0.08, 0.012);
        g.add(rbox(w, 0.4, d - 0.02, sm, 0, 0.1, -0.01, 0.01));
        fronts(
          g,
          -w / 2 + 0.005,
          0.105,
          w - 0.01,
          0.39,
          d / 2 - 0.02,
          n,
          1,
          sm,
          "edge",
        );
        g.add(
          rbox(
            1.45,
            0.84,
            0.025,
            mat("#18181a", { roughness: 0.4, metalness: 0.3 }),
            0,
            0.95,
            bz + 0.03,
            0.004,
          ),
          box(1.43, 0.81, 0.002, screenMat(), 0, 0.962, bz + 0.0435),
        );
        g.add(
          rbox(0.9, 0.06, 0.09, "#2a2a2c", 0, 0.5, -0.02, 0.02),
          box(0.86, 0.045, 0.002, fabric("#3a3a3c"), 0, 0.507, 0.026),
        );
        vase(g, w / 2 - 0.25, 0.5, 0, 0.06, 0.26, "#d8cfc2", R);
        g.add(
          box(0.25, 0.035, 0.18, "#a9433b", -w / 2 + 0.3, 0.5, 0),
          box(0.22, 0.03, 0.16, "#e6dccd", -w / 2 + 0.3, 0.535, 0),
        );
        break;
      }
      case "rug":
        [
          [w, d, 0.01, c, 0],
          [w - 0.16, d - 0.16, 0.002, darker(c, 0.82), 0.01],
          [w - 0.26, d - 0.26, 0.002, lighter(c, 0.12), 0.0115],
        ].forEach(([a, b, h, cc, y]) => {
          const r = box(a, h, b, mat(cc, { roughness: 1 }), 0, y + 0.002);
          r.castShadow = false;
          g.add(r);
        });
        if (currentDecor().pattern) {
          for (const z of [
            -d / 2 + 0.2,
            -d / 2 + 0.26,
            d / 2 - 0.26,
            d / 2 - 0.2,
          ]) {
            const stripe = box(
              Math.max(0.05, w - 0.35),
              0.001,
              0.018,
              fabric("#f0dfbd"),
              0,
              0.016,
              z,
            );
            stripe.castShadow = false;
            g.add(stripe);
          }
        }
        break;
      case "plant": {
        const r = Math.min(w, d) / 2,
          H = 0.9 + r * 1.6,
          pot = mat(decorSurface("pot", "#d9d2c5"), { roughness: 0.6 }),
          lm = [
            mat("#5f8f4e", { roughness: 0.6, side: THREE.DoubleSide }),
            mat("#79a862", { roughness: 0.6, side: THREE.DoubleSide }),
          ];
        g.add(
          lathe(
            [
              [0, 0],
              [r * 0.4, 0],
              [r * 0.44, 0.02],
              [r * 0.54, 0.36],
              [r * 0.57, 0.4],
              [r * 0.52, 0.4],
              [r * 0.5, 0.37],
              [0, 0.37],
            ],
            pot,
            0,
            0,
            0,
            36,
          ),
          cyl(r * 0.49, r * 0.49, 0.005, "#4a3a2c", 0, 0.368, 0, 28),
        );
        g.add(
          rod([0, 0.37, 0], [0.02, H * 0.62, -0.01], 0.016, "#6b5540", 0.009),
        );
        const N = 20 + Math.round(r * 36),
          sc = Math.sqrt(r / 0.25);
        for (let k = 0; k < N; k++) {
          const t = k / N,
            a = k * 2.399 + R() * 0.3,
            len = (0.14 + R() * 0.08) * (1.1 - t * 0.4) * sc,
            s0 = 0.03 + R() * 0.08 * sc,
            p = new THREE.Group();
          p.position.set(0, H * (0.42 + 0.58 * t), 0);
          p.rotation.set(0, -a, 0.1 + t * 0.5 + R() * 0.3, "YXZ");
          const lf = blob(
            len / 2,
            0.005,
            len * 0.27,
            lm[k % 2],
            s0 + len / 2,
            0,
            0,
            16,
          );
          lf.rotation.z = -0.3;
          p.add(box(s0, 0.005, 0.005, "#6f8f4a", s0 / 2, 0, 0), lf);
          g.add(p);
        }
        break;
      }
      case "table": {
        const tm = mat(c, { roughness: 0.4 }),
          lw = woodM(darker(c, 0.55)),
          ns = Math.max(1, Math.round(w / 0.62)),
          top = 0.75;
        [
          [-1, -1],
          [1, -1],
          [-1, 1],
          [1, 1],
        ].forEach(([a, b]) =>
          g.add(
            rod(
              [a * (w / 2 - 0.08), 0, b * (d / 2 - 0.08)],
              [a * (w / 2 - 0.1), 0.715, b * (d / 2 - 0.1)],
              0.016,
              lw,
              0.026,
            ),
          ),
        );
        g.add(
          rbox(w, 0.035, d, tm, 0, 0.715, 0, 0.012),
          box(w - 0.22, 0.07, d - 0.22, lw, 0, 0.645),
        );
        g.add(box(w * 0.7, 0.003, 0.32, fabric("#b9a58c"), 0, top, 0));
        for (let i = 0; i < ns; i++)
          [-1, 1].forEach((s) => {
            const x = -w / 2 + (w / ns) * (i + 0.5),
              z = s * (d / 2 - 0.17);
            g.add(box(0.38, 0.003, 0.28, fabric("#e7dfd1"), x, top, z));
            plate(g, 0.12, x, top + 0.003, z);
            g.add(
              cyl(
                0.03,
                0.026,
                0.1,
                mat("#dfeef3", {
                  transparent: true,
                  opacity: 0.35,
                  roughness: 0.05,
                }),
                x + 0.15,
                top + 0.003,
                z - s * 0.1,
                16,
              ),
            );
          });
        vase(g, 0, top + 0.003, 0, 0.06, 0.2, "#e9e2d6", R);
        break;
      }
      case "roundtable": {
        const b = Math.min(0.25, w * 0.3),
          lw = woodM(decorSurface("woodDark", "#4a3e33")),
          top = 0.75;
        g.add(
          lathe(
            [
              [b, 0],
              [b, 0.015],
              [b * 0.8, 0.035],
              [0.06, 0.12],
              [0.045, 0.35],
              [0.05, 0.6],
              [0.12, 0.69],
              [0.18, 0.715],
            ],
            lw,
            0,
            0,
            0,
            40,
          ),
          cyl(w / 2, w / 2, 0.035, mat(c, { roughness: 0.4 }), 0, 0.715, 0, 64),
        );
        for (let k = 0; k < 4; k++) {
          const a = (k * Math.PI) / 2 + 0.4,
            rr = w / 2 - 0.17;
          plate(g, 0.11, Math.cos(a) * rr, top, Math.sin(a) * rr);
        }
        vase(g, 0, top, 0, 0.05, 0.18, "#e9e2d6", R);
        break;
      }
      case "counter": {
        const cm = mat(c, { roughness: 0.45 }),
          stone = mat("#dcd7cf", { roughness: 0.22 }),
          n = Math.max(1, Math.round(w / 0.6)),
          fz = d / 2 - 0.04;
        g.add(
          box(w - 0.01, 0.1, d - 0.1, "#4a4641", 0, 0, -0.05),
          box(w, 0.72, d - 0.04, cm, 0, 0.1, -0.02),
        );
        fronts(g, -w / 2, 0.64, w, 0.18, fz, n, 1, cm, "bar");
        fronts(g, -w / 2, 0.1, w, 0.54, fz, n, 1, cm, "bar", 0.56);
        if (["base-only", "peninsula"].includes(f.variant)) {
          g.add(rbox(w + 0.01, 0.04, d, stone, 0, 0.82, 0, 0.004));
          break;
        }
        g.add(
          rbox(w + 0.01, 0.04, d, stone, 0, 0.82, 0, 0.004),
          box(
            w,
            0.62,
            0.01,
            mat("#efece6", { roughness: 0.3 }),
            0,
            0.86,
            bz + 0.005,
          ),
        );
        g.add(box(w, 0.7, 0.33, cm, 0, 1.48, bz + 0.165));
        fronts(g, -w / 2, 1.48, w, 0.7, bz + 0.33, n, 1, cm, "bar", 1.56);
        g.add(
          box(
            w - 0.04,
            0.01,
            0.02,
            glowMat("#fff7e6", "#ffe9c4", 0.8),
            0,
            1.47,
            bz + 0.29,
          ),
        );
        if (w >= 0.8) {
          g.add(
            rbox(
              0.36,
              0.018,
              0.25,
              woodM("#c9a27a"),
              -w / 2 + 0.3,
              0.86,
              0.0,
              0.005,
            ),
          );
          [0.07, 0.06, 0.05].forEach((r, i) =>
            g.add(
              cyl(
                r,
                r,
                0.16 - i * 0.03,
                mat(["#e9e2d6", "#d6cfc3", "#bfb6a8"][i], { roughness: 0.4 }),
                w / 2 - 0.15 - i * 0.15,
                0.86,
                bz + 0.1,
                24,
              ),
            ),
          );
          g.add(
            cyl(
              0.05,
              0.045,
              0.14,
              ceramic({ roughness: 0.3 }),
              w / 2 - 0.6,
              0.86,
              bz + 0.1,
              20,
            ),
          );
          for (let k = 0; k < 4; k++)
            g.add(
              rod(
                [w / 2 - 0.6, 0.9, bz + 0.1],
                [
                  w / 2 - 0.6 + (k - 1.5) * 0.018,
                  1.1,
                  bz + 0.1 + ((k % 2) - 0.5) * 0.02,
                ],
                0.005,
                woodM(decorSurface("wood", "#8d7258")),
                0.006,
                6,
              ),
            );
        }
        break;
      }
      case "stove": {
        const sm = mat("#b9bec3", { metalness: 0.8, roughness: 0.3 });
        g.add(
          rbox(
            w,
            0.012,
            d,
            mat("#0d0d0e", { roughness: 0.06, metalness: 0.3 }),
            0,
            0.862,
            0,
            0.004,
          ),
        );
        (w / d > 1.4
          ? [
              [-w / 4, 0],
              [w / 4, 0],
            ]
          : [
              [-w / 4, -d / 4],
              [w / 4, -d / 4],
              [-w / 4, d / 4],
              [w / 4, d / 4],
            ]
        ).forEach(([x, z]) => {
          g.add(
            cyl(0.085, 0.09, 0.008, "#2b2b2b", x, 0.874, z, 32),
            cyl(
              0.045,
              0.05,
              0.014,
              mat("#6b5a45", { metalness: 0.7, roughness: 0.35 }),
              x,
              0.874,
              z,
              28,
            ),
            cyl(0.028, 0.028, 0.022, "#1a1a1a", x, 0.874, z, 20),
          );
          for (let k = 0; k < 5; k++) {
            const a = (k * Math.PI * 2) / 5;
            g.add(
              rot(
                box(
                  0.07,
                  0.014,
                  0.012,
                  "#1c1c1c",
                  x + Math.cos(a) * 0.1,
                  0.874,
                  z + Math.sin(a) * 0.1,
                ),
                0,
                -a,
              ),
            );
          }
          g.add(cyl(0.02, 0.022, 0.018, "#222", x, 0.874, d / 2 - 0.04, 20));
        });
        g.add(
          rbox(w, 0.06, 0.5, sm, 0, 1.55, bz + 0.25, 0.01),
          box(0.3, 0.72, 0.26, sm, 0, 1.61, bz + 0.13),
        );
        g.add(
          rot(
            box(
              w - 0.02,
              0.3,
              0.008,
              mat("#15181b", { roughness: 0.05, metalness: 0.5 }),
              0,
              1.58,
              bz + 0.38,
            ),
            -0.9,
          ),
          box(
            0.16,
            0.012,
            0.003,
            mat("#101214", { emissive: "#6fd0ff", emissiveIntensity: 0.6 }),
            0,
            1.575,
            bz + 0.502,
          ),
        );
        break;
      }
      case "ksink": {
        if(f.workstation){studioWorkstationSink(g,f,w,d);break;}
        const st = mat("#c7ccd1", { metalness: 0.85, roughness: 0.28 }),
          inner = mat("#9aa1a8", { metalness: 0.8, roughness: 0.35 }),
          two = w >= 0.75,
          bw = two ? w * 0.42 : w * 0.7,
          bd = d * 0.66;
        g.add(box(w, 0.008, d, st, 0, 0.862, 0));
        (two ? [-w * 0.23, w * 0.23] : [0]).forEach((x) =>
          g.add(
            shell(bw, bd, 0.02, 0.015, 0.04, st, x, 0.862, 0.03),
            box(bw - 0.03, 0.002, bd - 0.03, inner, x, 0.87, 0.03),
            cyl(0.03, 0.03, 0.003, chrome(), x, 0.872, 0.03, 20),
          ),
        );
        const fx = two ? 0 : w * 0.3,
          cm = chrome();
        g.add(
          cyl(0.025, 0.028, 0.03, cm, fx, 0.87, bz + 0.06, 20),
          tube(
            [
              [fx, 0.9, bz + 0.06],
              [fx, 1.12, bz + 0.06],
              [fx, 1.17, bz + 0.1],
              [fx, 1.14, bz + 0.18],
              [fx, 1.08, bz + 0.2],
            ],
            0.012,
            cm,
          ),
        );
        g.add(
          rot(box(0.012, 0.012, 0.09, cm, fx + 0.035, 0.98, bz + 0.09), -0.3),
        );
        break;
      }
      case "fridge": {
        const fm = mat(c, { metalness: 0.45, roughness: 0.28 }),
          h = 1.8,
          fz = d / 2 - 0.05;
        g.add(
          box(w - 0.02, 0.06, d - 0.06, "#2a2c2e", 0, 0, -0.03),
          rbox(w, h - 0.06, d - 0.05, fm, 0, 0.06, -0.025, 0.02),
          box(w - 0.01, h - 0.07, 0.003, "#2a2c2e", 0, 0.065, fz + 0.0015),
        );
        if (w > 0.85) {
          [-1, 1].forEach((s) => {
            g.add(
              rbox(
                w / 2 - 0.004,
                h - 0.08,
                0.04,
                fm,
                (s * w) / 4,
                0.07,
                fz + 0.023,
                0.012,
              ),
            );
            pull(g, 0.8, true, s * 0.035, 1.05, fz + 0.043);
          });
          g.add(
            box(
              0.1,
              0.14,
              0.003,
              screenMat("#2a6f8f"),
              -w / 4,
              1.25,
              fz + 0.044,
            ),
          );
        } else {
          g.add(
            rbox(w - 0.006, 1.06, 0.04, fm, 0, 0.72, fz + 0.023, 0.012),
            rbox(w - 0.006, 0.64, 0.04, fm, 0, 0.07, fz + 0.023, 0.012),
          );
          pull(g, 0.5, true, -w / 2 + 0.06, 1.05, fz + 0.043);
          pull(g, w * 0.5, false, 0, 0.64, fz + 0.043);
          g.add(
            box(
              0.08,
              0.1,
              0.003,
              screenMat("#2a6f8f"),
              w * 0.22,
              1.4,
              fz + 0.044,
            ),
          );
        }
        break;
      }
      case "toilet": {
        const cer = ceramic(),
          Rb = w * 0.45,
          zc = bz + d * 0.62,
          kz = (d * 0.37) / Rb,
          cm = chrome();
        g.add(
          rbox(w * 0.88, 0.4, d * 0.24, cer, 0, 0.36, bz + d * 0.12, 0.04),
          rbox(w * 0.92, 0.03, d * 0.27, cer, 0, 0.76, bz + d * 0.135, 0.012),
          cyl(0.022, 0.022, 0.006, cm, 0, 0.79, bz + d * 0.135, 20),
        );
        const ped = lathe(
          [
            [0, 0],
            [Rb * 0.62, 0],
            [Rb * 0.66, 0.02],
            [Rb * 0.56, 0.12],
            [Rb * 0.62, 0.22],
            [Rb * 0.92, 0.33],
            [Rb, 0.37],
          ],
          cer,
          0,
          0,
          zc,
          40,
        );
        const seat = cyl(
            Rb * 1.01,
            Rb * 1.01,
            0.022,
            mat("#f4f4f2", { roughness: 0.2 }),
            0,
            0.37,
            zc,
            40,
          ),
          lid = cyl(
            Rb * 0.97,
            Rb * 0.99,
            0.02,
            mat("#f4f4f2", { roughness: 0.2 }),
            0,
            0.392,
            zc,
            40,
          );
        ped.scale.z = seat.scale.z = lid.scale.z = kz;
        g.add(ped, seat, lid);
        [-1, 1].forEach((s) =>
          g.add(
            box(0.03, 0.02, 0.03, cm, s * w * 0.18, 0.39, zc - Rb * kz - 0.005),
          ),
        );
        break;
      }
      case "vanity": {
        const vm = mat(c, { roughness: 0.5 }),
          stone = mat("#fafafa", { roughness: 0.18 }),
          nb = w >= 1.1 ? 2 : 1,
          cd = d - 0.04,
          cm = chrome();
        g.add(rbox(w, 0.45, cd, vm, 0, 0.33, bz + cd / 2, 0.008));
        fronts(
          g,
          -w / 2 + 0.005,
          0.335,
          w - 0.01,
          0.44,
          d / 2 - 0.04,
          nb,
          2,
          vm,
          "edge",
        );
        g.add(rbox(w, 0.03, d, stone, 0, 0.78, 0, 0.006));
        const rb = Math.min(0.19, (w / nb) * 0.36),
          bowlZ = d < 0.30 ? 0 : 0.03,
          bowlScaleZ = d < 0.30 ? Math.min(1, (d - 0.04) / (2 * rb)) : 1;
        for (let i = 0; i < nb; i++) {
          const x = nb === 1 ? 0 : i ? w / 4 : -w / 4;
          const basinBowl = lathe(
              [
                [0, 0],
                [rb * 0.55, 0],
                [rb * 0.85, 0.03],
                [rb, 0.1],
                [rb * 0.97, 0.12],
              ],
              ceramic({ side: THREE.DoubleSide }),
              x,
              0.81,
              bowlZ,
              40,
            );
          basinBowl.scale.z = bowlScaleZ;
          g.add(basinBowl, cyl(0.018, 0.018, 0.003, cm, x, 0.812, bowlZ, 16));
          g.add(
            cyl(0.02, 0.022, 0.02, cm, x, 0.81, bz + 0.06, 16),
            tube(
              [
                [x, 0.83, bz + 0.06],
                [x, 1.03, bz + 0.06],
                [x, 1.07, bz + 0.11],
                [x, 1.03, bz + 0.15],
              ],
              0.01,
              cm,
            ),
            rot(box(0.01, 0.01, 0.06, cm, x, 1.05, bz + 0.04), 0.4),
          );
        }
        const mw = Math.min(w * 0.9, nb * 0.7);
        g.add(
          rbox(
            mw + 0.02,
            0.82,
            0.02,
            glowMat("#fff7e6", "#ffe9c4", 0.9),
            0,
            1.14,
            bz + 0.01,
            0.01,
          ),
          box(mw, 0.8, 0.01, mirror(), 0, 1.15, bz + 0.025),
        );
        g.add(
          cyl(
            0.028,
            0.028,
            0.12,
            mat("#c8b8a6", { roughness: 0.3 }),
            w / 2 - 0.08,
            0.81,
            bz + 0.1,
            16,
          ),
          rbox(
            0.18,
            0.03,
            0.12,
            fabric("#e9e2d6"),
            -w / 2 + 0.12,
            0.81,
            0.05,
            0.012,
          ),
        );
        break;
      }
      case "shower": {
        const cm = chrome(),
          x = -w / 4;
        g.add(
          rbox(w, 0.05, d, mat("#f4f4f2", { roughness: 0.3 }), 0, 0, 0, 0.01),
          box(
            w * 0.6,
            0.003,
            0.05,
            mat("#9aa1a8", { metalness: 0.8, roughness: 0.3 }),
            0,
            0.05,
            bz + 0.08,
          ),
        );
        [
          [w, 0.01, 0, d / 2 - 0.005],
          [0.01, d, w / 2 - 0.005, 0],
        ].forEach(([gw, gd, px, pz]) => {
          const p = box(gw, 1.95, gd, glassMat, px, 0.05, pz);
          p.castShadow = false;
          g.add(p);
        });
        g.add(
          box(0.02, 1.95, 0.02, frameMat, w / 2 - 0.01, 0.05, d / 2 - 0.01),
          box(0.02, 1.95, 0.03, frameMat, -w / 2 + 0.01, 0.05, d / 2 - 0.005),
          box(0.03, 1.95, 0.02, frameMat, w / 2 - 0.005, 0.05, bz + 0.01),
        );
        g.add(
          box(w, 0.015, 0.02, frameMat, 0, 1.985, d / 2 - 0.005),
          box(0.02, 0.015, d, frameMat, w / 2 - 0.005, 1.985, 0),
        );
        g.add(
          rbox(0.14, 0.1, 0.04, cm, x, 1.0, bz + 0.02, 0.01),
          rod([x, 1.1, bz + 0.03], [x, 1.95, bz + 0.03], 0.012, cm),
        );
        g.add(
          tube(
            [
              [x, 1.95, bz + 0.03],
              [x, 2.02, bz + 0.06],
              [x, 2.03, bz + 0.22],
            ],
            0.01,
            cm,
          ),
          rbox(0.24, 0.012, 0.24, cm, x, 2.02, bz + 0.25, 0.004),
        );
        g.add(
          rot(cyl(0.015, 0.02, 0.2, cm, x + 0.1, 1.25, bz + 0.05, 16), 0.25),
          blob(0.03, 0.012, 0.03, cm, x + 0.1, 1.47, bz + 0.08, 16),
        );
        g.add(box(0.26, 0.012, 0.1, ceramic(), w / 2 - 0.2, 1.2, bz + 0.05));
        [
          ["#e6dccd", 0.03, 0.18],
          ["#2f5d62", 0.025, 0.15],
          ["#f4f4f2", 0.028, 0.12],
        ].forEach(([cc, r, hh], i) =>
          g.add(
            cyl(
              r,
              r,
              hh,
              mat(cc, { roughness: 0.3 }),
              w / 2 - 0.28 + i * 0.07,
              1.212,
              bz + 0.05,
              16,
            ),
          ),
        );
        break;
      }
      case "bathtub": {
        const cer = ceramic(),
          h = 0.56,
          t = 0.07,
          cm = chrome();
        g.add(
          shell(w, d, h, t, 0.14, cer),
          box(w - 0.1, 0.12, d - 0.1, cer, 0, 0, 0),
          box(
            w - 2 * t + 0.004,
            0.004,
            d - 2 * t + 0.004,
            mat("#bfe0ea", {
              roughness: 0.03,
              transparent: true,
              opacity: 0.6,
            }),
            0,
            0.4,
            0,
          ),
        );
        const fx = w / 2 - t / 2;
        g.add(
          tube(
            [
              [fx, h - 0.02, 0],
              [fx, h + 0.1, 0],
              [fx - 0.06, h + 0.13, 0],
              [fx - 0.13, h + 0.09, 0],
            ],
            0.014,
            cm,
          ),
        );
        [-1, 1].forEach((s) =>
          g.add(cyl(0.02, 0.02, 0.04, cm, fx, h, s * 0.1, 16)),
        );
        g.add(
          rot(
            rbox(0.08, 0.16, 0.3, cer, -w / 2 + t + 0.06, h - 0.12, 0, 0.04),
            0,
            0,
            -0.5,
          ),
          rbox(
            0.22,
            0.05,
            0.16,
            fabric("#e9e2d6"),
            fx - 0.05,
            h,
            d / 2 - 0.1,
            0.02,
          ),
        );
        break;
      }
      case "washer":
      case "dryer": {
        const bm = mat(c, { roughness: 0.35 }),
          R0 = Math.min(w, d) * 0.25,
          fz = d / 2 - 0.02;
        g.add(
          box(w - 0.02, 0.04, d - 0.04, "#8f969b", 0, 0, -0.02),
          rbox(w, 0.81, d - 0.02, bm, 0, 0.04, -0.01, 0.025),
        );
        g.add(
          box(w - 0.04, 0.1, 0.006, lighter(c, 0.3), 0, 0.72, fz + 0.003),
          rbox(0.18, 0.07, 0.01, bm, -w / 2 + 0.12, 0.735, fz + 0.006, 0.004),
        );
        g.add(
          box(
            0.12,
            0.035,
            0.003,
            screenMat("#1f6f6a"),
            w * 0.14,
            0.745,
            fz + 0.007,
          ),
        );
        const kn = cyl(
          0.03,
          0.03,
          0.02,
          chrome(),
          -w * 0.02,
          0.75,
          fz + 0.016,
          28,
        );
        kn.rotation.x = Math.PI / 2;
        g.add(kn);
        const dr = new THREE.Mesh(
          new THREE.CircleGeometry(R0, 40),
          mat("#1b1f22", { roughness: 0.6 }),
        );
        dr.position.set(0, 0.4, fz + 0.004);
        g.add(dr);
        const rg = new THREE.Mesh(
          new THREE.TorusGeometry(R0 + 0.02, 0.022, 14, 48),
          mat("#c7cfd5", { metalness: 0.7, roughness: 0.25 }),
        );
        rg.position.set(0, 0.4, fz + 0.016);
        sh(rg);
        g.add(rg);
        const Rs = R0 * 1.42,
          cap = new THREE.Mesh(
            new THREE.SphereGeometry(Rs, 32, 12, 0, Math.PI * 2, 0, 0.78),
            mat(f.type === "dryer" ? "#4a4038" : "#26343d", {
              roughness: 0.04,
              metalness: 0.2,
              transparent: true,
              opacity: 0.8,
            }),
          );
        cap.rotation.x = Math.PI / 2;
        cap.position.set(0, 0.4, fz + 0.012 - Rs * Math.cos(0.78));
        g.add(cap);
        g.add(box(w - 0.06, 0.004, 0.003, "#b9c3ca", 0, 0.08, fz + 0.002));
        break;
      }
      case "crib": {
        const wm = woodM(c);
        g.add(
          rbox(w - 0.09, 0.12, d - 0.09, fabric("#ffffff"), 0, 0.3, 0, 0.04),
          box(w - 0.06, 0.025, d - 0.06, wm, 0, 0.28),
        );
        [
          [-1, -1],
          [1, -1],
          [-1, 1],
          [1, 1],
        ].forEach(([a, b]) =>
          g.add(
            rbox(
              0.045,
              0.95,
              0.045,
              wm,
              a * (w / 2 - 0.022),
              0,
              b * (d / 2 - 0.022),
              0.008,
            ),
            blob(
              0.028,
              0.028,
              0.028,
              wm,
              a * (w / 2 - 0.022),
              0.97,
              b * (d / 2 - 0.022),
              14,
            ),
          ),
        );
        [-1, 1].forEach((s) => {
          const z = s * (d / 2 - 0.022),
            x = s * (w / 2 - 0.022);
          g.add(
            rbox(w - 0.05, 0.035, 0.03, wm, 0, 0.88, z, 0.008),
            rbox(w - 0.05, 0.035, 0.03, wm, 0, 0.25, z, 0.008),
            rbox(0.03, 0.035, d - 0.05, wm, x, 0.88, 0, 0.008),
            rbox(0.03, 0.035, d - 0.05, wm, x, 0.25, 0, 0.008),
          );
          for (let p = -w / 2 + 0.09; p < w / 2 - 0.05; p += 0.075)
            g.add(rod([p, 0.28, z], [p, 0.88, z], 0.009, wm, 0.009, 8));
          for (let p = -d / 2 + 0.09; p < d / 2 - 0.05; p += 0.075)
            g.add(rod([x, 0.28, p], [x, 0.88, p], 0.009, wm, 0.009, 8));
        });
        g.add(
          rbox(
            w * 0.5,
            0.03,
            d - 0.14,
            fabric("#f3d9c9"),
            w * 0.12,
            0.42,
            0,
            0.015,
          ),
          rbox(0.3, 0.06, 0.2, fabric("#fbfaf7"), -w / 2 + 0.22, 0.42, 0, 0.03),
        );
        const bx = -w * 0.3 + 0.1,
          bear = "#c9a27a";
        g.add(
          blob(0.05, 0.06, 0.045, bear, bx, 0.5, 0.12),
          blob(0.045, 0.042, 0.04, bear, bx, 0.59, 0.12),
          blob(0.016, 0.016, 0.01, bear, bx - 0.032, 0.625, 0.12),
          blob(0.016, 0.016, 0.01, bear, bx + 0.032, 0.625, 0.12),
        );
        break;
      }
      case "beanbag": {
        const fab = mat(c, { roughness: 0.95 });
        g.add(
          blob(w * 0.5, 0.3, d * 0.5, fab, 0, 0.3, 0, 40),
          blob(w * 0.42, 0.22, d * 0.22, fab, 0, 0.5, bz + d * 0.26, 32),
        );
        break;
      }
      case "sidetable": {
        const r = Math.min(w, d) / 2,
          bm = blackMetal();
        g.add(
          lathe(
            [
              [r * 0.55, 0],
              [r * 0.55, 0.012],
              [0.03, 0.035],
              [0.018, 0.3],
              [0.025, 0.5],
              [0.08, 0.52],
            ],
            bm,
            0,
            0,
            0,
            40,
          ),
          cyl(r, r * 0.98, 0.025, mat(c, { roughness: 0.35 }), 0, 0.52, 0, 48),
        );
        g.add(box(0.16, 0.02, 0.12, "#4f6b8a", -r * 0.25, 0.545, 0));
        vase(g, r * 0.35, 0.545, -r * 0.1, 0.035, 0.12, "#e9e2d6", R, false);
        break;
      }
      case "floorlamp": {
        const r = Math.min(w, d) / 2,
          lm = mat(c, { roughness: 0.35, metalness: 0.5 });
        g.add(
          lathe(
            [
              [0, 0],
              [r * 0.55, 0],
              [r * 0.58, 0.012],
              [r * 0.5, 0.03],
              [0.02, 0.035],
            ],
            lm,
            0,
            0,
            0,
            40,
          ),
          rod([0, 0.03, 0], [0, 1.36, 0], 0.011, lm),
        );
        g.add(
          lathe(
            [
              [r * 0.85, 0],
              [r * 0.55, 0.36],
            ],
            glowMat("#f6ecd9", "#ffdca0", 0.45),
            0,
            1.22,
            0,
            48,
          ),
          blob(
            0.035,
            0.035,
            0.035,
            glowMat("#fff", "#ffe2b0", 1.2),
            0,
            1.36,
            0,
            12,
          ),
        );
        g.add(
          ring(r * 0.85, 0.004, lm, 0, 1.22, 0),
          ring(r * 0.55, 0.004, lm, 0, 1.58, 0),
        );
        break;
      }
      case "island": {
        const cm = mat(c, { roughness: 0.45 }),
          stone = mat("#dcd7cf", { roughness: 0.2 }),
          cd = d - 0.3,
          n = Math.max(1, Math.round((w - 0.1) / 0.6)),
          cab = new THREE.Group(),
          fz = cd / 2 - 0.03;
        cab.add(
          box(w - 0.12, 0.1, cd - 0.08, "#4a4641", 0, 0, -0.04),
          box(w - 0.1, 0.74, cd - 0.03, cm, 0, 0.1, -0.015),
        );
        fronts(cab, -w / 2 + 0.05, 0.64, w - 0.1, 0.2, fz, n, 1, cm, "bar");
        fronts(
          cab,
          -w / 2 + 0.05,
          0.1,
          w - 0.1,
          0.54,
          fz,
          n,
          1,
          cm,
          "bar",
          0.56,
        );
        cab.rotation.y = Math.PI;
        cab.position.z = bz + cd / 2;
        g.add(cab); // 柜门朝 -z，+z 侧留出吧台挑空
        g.add(rbox(w, 0.05, d, stone, 0, 0.84, 0, 0.006));
        [-1, 1].forEach((s) =>
          g.add(box(0.04, 0.84, d, stone, s * (w / 2 - 0.02), 0, 0)),
        ); // 瀑布式侧板
        g.add(
          lathe(
            [
              [0, 0],
              [0.06, 0],
              [0.14, 0.06],
              [0.15, 0.07],
            ],
            mat("#6b543f", { roughness: 0.5, side: THREE.DoubleSide }),
            w * 0.22,
            0.89,
            0,
            32,
          ),
        );
        for (let k = 0; k < 4; k++)
          g.add(
            blob(
              0.04,
              0.04,
              0.04,
              ["#d98c4a", "#9fbf5a", "#b5463a", "#e6c14f"][k],
              w * 0.22 + Math.cos(k * 1.6) * 0.05,
              0.935 + (k === 3 ? 0.04 : 0),
              Math.sin(k * 1.6) * 0.05,
              14,
            ),
          );
        vase(g, -w * 0.25, 0.89, -0.05, 0.05, 0.22, "#e9e2d6", R);
        break;
      }
      case "barstool": {
        const r = Math.min(w, d) / 2,
          bm = blackMetal(),
          sy = 0.7;
        [
          [1, 1],
          [1, -1],
          [-1, 1],
          [-1, -1],
        ].forEach(([a, b]) =>
          g.add(
            rod(
              [a * r * 0.72, 0, b * r * 0.72],
              [a * r * 0.4, sy, b * r * 0.4],
              0.011,
              bm,
            ),
          ),
        );
        g.add(
          ring(Math.SQRT2 * r * (0.72 - 0.32 * 0.4), 0.008, bm, 0, 0.28, 0),
          cyl(r * 0.55, r * 0.55, 0.02, bm, 0, sy - 0.01, 0, 32),
        );
        g.add(
          lathe(
            [
              [0, 0],
              [r * 0.85, 0],
              [r * 0.95, 0.02],
              [r * 0.97, 0.045],
              [r * 0.9, 0.07],
              [0, 0.075],
            ],
            mat(c, { roughness: 0.6 }),
            0,
            sy,
            0,
            40,
          ),
        );
        break;
      }
      case "waterheater": {
        const r = Math.min(d / 2, 0.23),
          L = w - 0.06,
          yc = 1.95,
          zc = bz + r + 0.02,
          tm = mat(c, { roughness: 0.35 }),
          cp = mat("#cfd4d8", { roughness: 0.4 });
        const tank = mesh(new THREE.CylinderGeometry(r, r, L, 40), tm);
        tank.rotation.z = Math.PI / 2;
        tank.position.set(0, yc, zc);
        g.add(tank);
        [-1, 1].forEach((s) =>
          g.add(
            blob(0.035, r * 0.99, r * 0.99, cp, (s * L) / 2, yc, zc, 32),
            box(
              0.05,
              r * 1.1,
              0.02,
              "#9a9ea3",
              s * L * 0.3,
              yc - r * 0.55,
              bz + 0.01,
            ),
          ),
        );
        g.add(
          rbox(
            0.2,
            0.09,
            0.02,
            "#e7eaec",
            L * 0.18,
            yc - 0.05,
            zc + r * 0.93,
            0.008,
          ),
          box(
            0.07,
            0.03,
            0.002,
            screenMat("#2f8f7a"),
            L * 0.18 - 0.04,
            yc - 0.02,
            zc + r * 0.93 + 0.011,
          ),
        );
        [
          [-L * 0.3, "#3b7bbf"],
          [-L * 0.18, "#c0463a"],
        ].forEach(([x, cc]) =>
          g.add(
            rod([x, yc - r * 0.8, zc], [x, 1.3, zc], 0.012, metal()),
            cyl(0.02, 0.02, 0.03, cc, x, 1.5, zc, 12),
          ),
        );
        break;
      }
      case "tv": {
        const th = w * 0.5625,
          yb = 1.2 - th / 2,
          z = bz + 0.03;
        g.add(
          rbox(
            w * 0.6,
            th * 0.6,
            0.03,
            "#222",
            0,
            yb + th * 0.2,
            bz + 0.015,
            0.01,
          ),
        );
        g.add(
          rbox(
            w,
            th,
            0.025,
            mat("#18181a", { roughness: 0.4, metalness: 0.3 }),
            0,
            yb,
            z + 0.01,
            0.004,
          ),
          box(
            w - 0.016,
            th - 0.022,
            0.002,
            screenMat("#1f2b3a"),
            0,
            yb + 0.014,
            z + 0.0235,
          ),
          box(0.04, 0.006, 0.002, "#8a8a8e", 0, yb + 0.004, z + 0.0235),
        );
        break;
      }
      case "aircon": {
        const am = mat(c, { roughness: 0.3 }),
          h = 1.8,
          fz = d / 2 - 0.005;
        g.add(
          rbox(w, 0.06, d, "#cfd3d6", 0, 0, 0, 0.015),
          rbox(w - 0.01, h - 0.06, d - 0.01, am, 0, 0.06, 0, 0.06),
        );
        g.add(
          rbox(
            w - 0.06,
            1.0,
            0.01,
            mat(lighter(c, 0.4), { roughness: 0.12 }),
            0,
            0.22,
            fz,
            0.005,
          ),
          box(w - 0.1, 0.42, 0.01, "#3d4145", 0, 1.28, fz),
        );
        for (let i = 0; i < 8; i++)
          g.add(
            rot(
              box(
                w - 0.11,
                0.012,
                0.03,
                "#e4e7ea",
                0,
                1.3 + i * 0.05,
                fz + 0.008,
              ),
              -0.35,
            ),
          );
        g.add(
          box(
            0.1,
            0.035,
            0.003,
            mat("#101214", { emissive: "#4fb3a5", emissiveIntensity: 0.7 }),
            0,
            1.12,
            fz + 0.006,
          ),
        );
        for (let i = 0; i < 8; i++)
          g.add(
            box(
              w - 0.12,
              0.005,
              0.004,
              "#b9bfc4",
              0,
              0.09 + i * 0.015,
              fz + 0.002,
            ),
          );
        break;
      }
      case "acwall": {
        const h = 0.3,
          am = mat(c, { roughness: 0.3 }),
          s = new THREE.Shape();
        s.moveTo(0, 0.02);
        s.lineTo(0, h);
        s.lineTo(d * 0.75, h);
        s.quadraticCurveTo(d, h, d, h * 0.55);
        s.quadraticCurveTo(d, 0, d * 0.55, 0);
        s.lineTo(0.02, 0);
        s.lineTo(0, 0.02);
        const geo = new THREE.ExtrudeGeometry(s, {
          depth: w - 0.02,
          bevelEnabled: true,
          bevelThickness: 0.01,
          bevelSize: 0.006,
          bevelSegments: 3,
          curveSegments: 16,
        });
        geo.rotateY(-Math.PI / 2);
        geo.translate((w - 0.02) / 2, 2.2, bz);
        g.add(mesh(geo, am));
        g.add(
          box(w - 0.12, 0.004, 0.07, "#3a3d40", 0, 2.19, bz + d * 0.55),
          rot(box(w - 0.12, 0.008, 0.06, am, 0, 2.18, bz + d * 0.72), 0.35),
        );
        g.add(
          box(
            0.06,
            0.018,
            0.002,
            mat("#101214", { emissive: "#4fb3a5", emissiveIntensity: 0.7 }),
            w * 0.3,
            2.2 + h * 0.5,
            bz + d + 0.007,
          ),
        );
        for (let i = 0; i < 6; i++)
          g.add(
            box(
              w - 0.12,
              0.003,
              0.008,
              "#d5d9dc",
              0,
              2.2 + h + 0.006,
              bz + 0.03 + i * 0.022,
            ),
          );
        break;
      }
      case "dishwasher": {
        const dm = mat(c, { metalness: 0.55, roughness: 0.28 }),
          fz = d / 2 - 0.02;
        g.add(
          box(w - 0.01, 0.08, d - 0.07, "#3a3834", 0, 0, -0.035),
          box(w - 0.005, 0.76, d - 0.03, "#8b9095", 0, 0.08, -0.015),
        );
        g.add(
          rbox(w - 0.006, 0.7, 0.02, dm, 0, 0.085, fz, 0.004),
          box(w - 0.006, 0.055, 0.02, "#26282a", 0, 0.785, fz),
        );
        for (let i = 0; i < 4; i++)
          g.add(
            box(
              0.012,
              0.006,
              0.002,
              mat("#101214", {
                emissive: i ? "#6fd0ff" : "#7fe08a",
                emissiveIntensity: 0.8,
              }),
              w * 0.1 + i * 0.03,
              0.81,
              fz + 0.011,
            ),
          );
        pull(g, w * 0.6, false, 0, 0.74, fz + 0.01);
        break;
      }
      case "ovencol": {
        const cm = mat(c, { roughness: 0.5 }),
          h = 2.1,
          fz = d / 2 - 0.02,
          frm = mat("#1c1d1f", { roughness: 0.3, metalness: 0.5 }),
          gl = mat("#0b0c0d", { roughness: 0.03, metalness: 0.6 });
        g.add(
          box(w - 0.02, 0.08, d - 0.06, "#4a4641", 0, 0, -0.03),
          box(w, h - 0.08, d - 0.02, cm, 0, 0.08, -0.01),
        );
        fronts(g, -w / 2, 0.08, w, 0.6, fz, 1, 2, cm, "bar");
        fronts(g, -w / 2, 1.78, w, h - 1.8, fz, 1, 1, cm, "bar", 1.84);
        [
          [0.7, 0.58],
          [1.3, 0.46],
        ].forEach(([y, ah]) => {
          g.add(
            box(w - 0.02, ah - 0.01, 0.02, frm, 0, y, fz + 0.01),
            box(w - 0.1, ah * 0.52, 0.003, gl, 0, y + ah * 0.1, fz + 0.021),
            box(
              w - 0.04,
              0.06,
              0.003,
              "#2a2c2e",
              0,
              y + ah - 0.075,
              fz + 0.021,
            ),
          );
          g.add(
            box(
              0.08,
              0.022,
              0.002,
              mat("#101214", { emissive: "#ff9a3c", emissiveIntensity: 0.7 }),
              0,
              y + ah - 0.056,
              fz + 0.023,
            ),
          );
          pull(g, w * 0.7, false, 0, y + ah * 0.72, fz + 0.02);
        });
        break;
      }
      case "purifier": {
        const pm = mat(c, { roughness: 0.45 }),
          h = 0.72;
        g.add(
          rbox(w, h, d, pm, 0, 0, 0, Math.min(w, d) * 0.2),
          rbox(w - 0.05, 0.006, d - 0.05, "#8d959b", 0, h - 0.002, 0, 0.02),
        );
        for (let i = 0; i < 7; i++)
          g.add(
            box(
              w - 0.07,
              0.004,
              0.006,
              "#6f777d",
              0,
              h + 0.002,
              -d / 2 + 0.05 + (i * (d - 0.1)) / 6,
            ),
          );
        g.add(
          rbox(
            w - 0.06,
            0.42,
            0.006,
            fabric("#c8ccd0"),
            0,
            0.06,
            d / 2 - 0.001,
            0.01,
          ),
        );
        const rg = new THREE.Mesh(
          new THREE.TorusGeometry(0.03, 0.004, 8, 32),
          mat("#101214", { emissive: "#4fb3a5", emissiveIntensity: 0.8 }),
        );
        rg.position.set(0, 0.6, d / 2 + 0.002);
        g.add(rg);
        break;
      }
      case "officechair": {
        const r = Math.min(w, d) * 0.46,
          dk = darker(c, 0.75),
          bm = mat("#2b2b2d", { roughness: 0.45 }),
          cm = chrome();
        for (let k = 0; k < 5; k++) {
          const a = (k * Math.PI * 2) / 5,
            tx = Math.sin(a) * r * 0.95,
            tz = Math.cos(a) * r * 0.95;
          g.add(
            rod([0, 0.1, 0], [tx, 0.07, tz], 0.022, bm, 0.014, 10),
            cyl(0.008, 0.008, 0.03, bm, tx, 0.04, tz, 8),
            rot(
              cyl(0.026, 0.026, 0.03, "#111", tx, 0.026 - 0.015, tz, 16),
              0,
              a,
              Math.PI / 2,
            ),
          );
        }
        g.add(
          cyl(0.05, 0.06, 0.05, bm, 0, 0.08, 0, 20),
          cyl(0.025, 0.025, 0.22, cm, 0, 0.12, 0, 16),
          cyl(0.036, 0.036, 0.12, bm, 0, 0.12, 0, 16),
          rbox(0.22, 0.05, 0.22, bm, 0, 0.34, 0.02, 0.01),
        );
        g.add(
          rbox(w * 0.78, 0.03, d * 0.72, bm, 0, 0.38, 0.04, 0.01),
          rbox(w * 0.8, 0.08, d * 0.74, fabric(c), 0, 0.4, 0.05, 0.035),
        );
        g.add(
          tube(
            [
              [0, 0.36, 0],
              [0, 0.38, bz + 0.12],
              [0, 0.6, bz + 0.07],
            ],
            0.02,
            bm,
          ),
        );
        const bf = shell(w * 0.72, 0.6, 0.03, 0.025, 0.08, bm);
        bf.rotation.x = Math.PI / 2 - 0.12;
        bf.position.set(0, 0.88, bz + 0.06);
        g.add(bf);
        g.add(
          rot(
            box(
              w * 0.68,
              0.56,
              0.006,
              mat(dk, {
                roughness: 0.85,
                transparent: true,
                opacity: 0.88,
                side: THREE.DoubleSide,
              }),
              0,
              0.6,
              bz + 0.085,
            ),
            -0.12,
          ),
          rot(
            rbox(w * 0.5, 0.08, 0.03, fabric(c), 0, 0.66, bz + 0.11, 0.015),
            -0.12,
          ),
        );
        g.add(
          rod([-0.05, 1.14, bz + 0.025], [-0.05, 1.22, bz + 0.015], 0.008, bm),
          rod([0.05, 1.14, bz + 0.025], [0.05, 1.22, bz + 0.015], 0.008, bm),
          rbox(w * 0.45, 0.12, 0.05, fabric(dk), 0, 1.2, bz + 0.02, 0.025),
        );
        [-1, 1].forEach((s) =>
          g.add(
            box(0.035, 0.22, 0.035, bm, s * w * 0.4, 0.42, 0.04),
            rbox(0.07, 0.03, d * 0.4, bm, s * w * 0.4, 0.63, 0.04, 0.012),
          ),
        );
        break;
      }
      case "piano": {
        const pk = mat(c, { roughness: 0.12, metalness: 0.1 }),
          bd = d * 0.5,
          kz = bz + bd,
          h = 1.25,
          kd = d * 0.22 - 0.03,
          iv = mat("#faf8f3", { roughness: 0.3 }),
          eb = mat("#111", { roughness: 0.25 }),
          kw = (w - 0.12) / 52;
        g.add(
          box(w, h, bd, pk, 0, 0, bz + bd / 2),
          rbox(w + 0.02, 0.03, bd + 0.03, pk, 0, h, bz + bd / 2 + 0.01, 0.008),
        );
        [-1, 1].forEach((s) =>
          g.add(
            rbox(
              0.06,
              0.13,
              kd + 0.06,
              pk,
              s * (w / 2 - 0.03),
              0.6,
              kz + (kd + 0.06) / 2,
              0.01,
            ),
            box(0.05, 0.6, 0.05, pk, s * (w / 2 - 0.08), 0, kz + kd + 0.01),
            box(
              0.06,
              0.04,
              d - bd,
              pk,
              s * (w / 2 - 0.08),
              0,
              kz + (d - bd) / 2,
            ),
          ),
        );
        g.add(
          box(w - 0.12, 0.08, kd + 0.05, pk, 0, 0.6, kz + (kd + 0.05) / 2),
          box(w - 0.12, 0.1, 0.03, pk, 0, 0.68, kz + 0.015),
        );
        for (let i = 0; i < 52; i++) {
          const x = -w / 2 + 0.06 + kw * (i + 0.5);
          g.add(box(kw - 0.0015, 0.022, kd, iv, x, 0.68, kz + 0.03 + kd / 2));
          if (i < 51 && "ACDFG".includes("ABCDEFG"[i % 7]))
            g.add(
              box(
                kw * 0.58,
                0.02,
                kd * 0.62,
                eb,
                x + kw / 2,
                0.7,
                kz + 0.03 + kd * 0.31,
              ),
            );
        }
        g.add(rot(box(w * 0.42, 0.18, 0.012, pk, 0, 0.84, kz + 0.012), -0.25));
        [-0.06, 0, 0.06].forEach((x) =>
          g.add(
            box(
              0.025,
              0.012,
              0.07,
              mat("#c9a35a", { metalness: 0.9, roughness: 0.3 }),
              x,
              0.05,
              kz + 0.03,
            ),
          ),
        );
        const mt = cyl(
          0.0,
          0.05,
          0.2,
          woodM("#5a3e2b"),
          w * 0.3,
          h + 0.03,
          bz + bd / 2,
          4,
        );
        mt.rotation.y = Math.PI / 4;
        g.add(mt);
        g.add(
          rot(
            box(
              0.14,
              0.18,
              0.015,
              woodM("#c9a27a"),
              -w * 0.3,
              h + 0.03,
              bz + 0.06,
            ),
            -0.15,
          ),
          rot(
            box(0.11, 0.14, 0.002, "#9fb3c2", -w * 0.3, h + 0.05, bz + 0.07),
            -0.15,
          ),
        );
        break;
      }
      case "treadmill": {
        const tm = mat(c, { roughness: 0.55 }),
          bm = mat("#2a2a2c", { roughness: 0.5 }),
          al = mat("#9a9ea3", { metalness: 0.6, roughness: 0.4 });
        g.add(
          rbox(w, 0.14, d - 0.25, tm, 0, 0.03, 0.125, 0.03),
          box(w - 0.16, 0.006, d - 0.5, "#141414", 0, 0.17, 0.15),
        );
        [-1, 1].forEach((s) =>
          g.add(box(0.07, 0.008, d - 0.45, al, s * (w / 2 - 0.05), 0.17, 0.15)),
        );
        [bz + 0.06, d / 2 - 0.06].forEach((z) =>
          [-1, 1].forEach((s) =>
            g.add(box(0.06, 0.03, 0.06, bm, s * (w / 2 - 0.06), 0, z)),
          ),
        );
        g.add(rbox(w, 0.22, 0.32, tm, 0, 0, bz + 0.16, 0.05));
        [-1, 1].forEach((s) =>
          g.add(
            rod(
              [s * (w / 2 - 0.06), 0.15, bz + 0.2],
              [s * (w / 2 - 0.06), 1.15, bz + 0.3],
              0.025,
              bm,
              0.022,
            ),
            tube(
              [
                [s * (w / 2 - 0.06), 1.0, bz + 0.28],
                [s * (w / 2 - 0.06), 1.0, bz + 0.5],
                [s * (w / 2 - 0.07), 0.97, bz + 0.62],
              ],
              0.018,
              bm,
            ),
          ),
        );
        const cg = new THREE.Group();
        cg.position.set(0, 1.2, bz + 0.31);
        cg.rotation.x = -0.5;
        cg.add(
          rbox(w * 0.8, 0.2, 0.08, bm, 0, -0.1, 0, 0.02),
          box(w * 0.4, 0.11, 0.004, screenMat("#2a5d8f"), 0, -0.055, 0.041),
        );
        g.add(cg);
        break;
      }
      default:
        g.add(box(w, 0.8, d, c));
    }
    g.position.set(wx(f.cx), 0, wz(f.cy));
    g.rotation.y = (-f.rot * Math.PI) / 180; // 平面顺时针旋转 → 绕 Y 轴负向
    g.userData.fid = f.id;
    return g;
  }

  /* ======================= 建筑 ======================= */
  function clearGroup(g) {
    g.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
    });
    g.clear();
  }
  function wallBox([x0, y0, x1, y1], yb, yt, m) {
    if (yt - yb <= 0.001) return;
    const o = new THREE.Mesh(
      new THREE.BoxGeometry(M(x1 - x0), yt - yb, M(y1 - y0)),
      m || [wallMat, wallMat, capMat, wallMat, wallMat, wallMat],
    );
    o.position.set(wx((x0 + x1) / 2), (yb + yt) / 2, wz((y0 + y1) / 2));
    o.castShadow = o.receiveShadow = true;
    archUp.add(o);
    // 漫游辅助：墙体棱线 + 踢脚线，让相邻墙面、墙角一眼可分（仅漫游模式显示）
    const ln = new THREE.LineSegments(
      new THREE.EdgesGeometry(o.geometry),
      edgeMat,
    );
    ln.position.copy(o.position);
    ln.userData.walkOnly = true;
    ln.visible = opt.mode === "walk";
    archUp.add(ln);
    if (yb <= 0.001) {
      const p = o.geometry.parameters,
        sh = Math.min(0.12, yt),
        sk = new THREE.Mesh(
          new THREE.BoxGeometry(p.width + 0.02, sh, p.depth + 0.02),
          skirtMat,
        );
      sk.position.set(o.position.x, sh / 2, o.position.z);
      sk.userData.walkOnly = true;
      sk.visible = opt.mode === "walk";
      archUp.add(sk);
    }
    return o;
  }
  const edgeMat = new THREE.LineBasicMaterial({ color: 0x6f675b }),
    skirtMat = new THREE.MeshStandardMaterial({
      color: "#8b7f6e",
      roughness: 0.6,
    });
  function shapeOf(poly, flip) {
    const s = new THREE.Shape();
    poly.forEach(([x, y], i) =>
      s[i ? "lineTo" : "moveTo"](wx(x), flip ? wz(y) : -wz(y)),
    );
    return s;
  }

  function buildArch() {
    const previousDoors = new Map(
      doors.map((d) => [d.id, { open: d.open, cur: d.cur }]),
    );
    clearGroup(archFloor);
    clearGroup(archUp);
    lampG.clear();
    doors.length = 0;
    colliders = [];
    wallMat = mat(decorSurface("wall", "#f4f7fa"), { roughness: 0.92 });
    const top = opt.cut;
    for (const r of ROOMS) {
      const geo = new THREE.ShapeGeometry(shapeOf(r.poly));
      geo.rotateX(-Math.PI / 2);
      const fl = new THREE.Mesh(
        geo,
        interiorSurfaceMaterial(
          "FLOOR-" + r.id,
          floorMat(state.rooms[r.id].mat),
          "floor",
        ),
      );
      fl.receiveShadow = true;
      fl.userData.room = r.id;
      archFloor.add(fl);
      if (!r.isTerrace) {
        const cg = new THREE.ShapeGeometry(shapeOf(r.poly, true));
        cg.rotateX(Math.PI / 2);
        const ceil = new THREE.Mesh(
          cg,
          interiorSurfaceMaterial(
            "CEILING-" + r.id,
            mat(decorSurface("ceiling", "#fbfaf7"), { roughness: 1 }),
            "ceiling",
          ),
        );
        ceil.position.y = H;
        ceil.visible = top >= H;
        ceil.userData.ceilingFor = r.id;
        archUp.add(ceil);
        const pl = new THREE.PointLight(0xffd9a8, 0, 7, 1.6);
        pl.position.set(wx(r.at[0]), H - 0.25, wz(r.at[1]));
        pl.userData.roomId = r.id;
        lampG.add(pl);
      }
    }
    [...DOORS, ...SLIDES, ...PASSAGES].forEach((d) => {
      const [x0, y0, x1, y1] = d.rect;
      const threshold = box(
        M(x1 - x0),
        0.012,
        M(y1 - y0),
        mat("#bfcad3", { roughness: 0.5 }),
        wx((x0 + x1) / 2),
        0,
        wz((y0 + y1) / 2),
      );
      threshold.castShadow = false;
      threshold.userData.openingId = d.id;
      archFloor.add(threshold);
    });
    WALL_SEGMENTS.forEach((s) => {
      const [x0, z0] = s.from,
        [x1, z1] = s.to,
        dx = M(x1 - x0),
        dz = M(z1 - z0),
        height = Math.min(s.height_m, top);
      const o = new THREE.Mesh(
        new THREE.BoxGeometry(Math.hypot(dx, dz), height, M(s.thickness_mm)),
        interiorWallMaterials(
          s,
          studioWallMaterials(s, wallMat, capMat),
          height,
        ),
      );
      o.position.set(wx((x0 + x1) / 2), height / 2, wz((z0 + z1) / 2));
      o.rotation.y = -Math.atan2(dz, dx);
      o.castShadow = o.receiveShadow = true;
      o.userData.wallSegment = s;
      archUp.add(o);
      colliders.push({
        a: [wx(x0), wz(z0)],
        b: [wx(x1), wz(z1)],
        half: M(s.thickness_mm) / 2,
      });
      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(o.geometry),
        edgeMat,
      );
      edges.position.copy(o.position);
      edges.rotation.copy(o.rotation);
      edges.visible = opt.mode === "walk";
      edges.userData.walkOnly = true;
      archUp.add(edges);
    });
    [
      ...DOORS.map((d) => [d.rect, 2.1]),
      ...SLIDES.map((d) => [d.rect, d.head_m]),
      ...PASSAGES.map((d) => [d.rect, d.head_m]),
    ].forEach(([r, h], i) => {
      if (top > h) {
        const mesh = wallBox(r, h, top);
        if (mesh)
          mesh.userData.openingId = [...DOORS, ...SLIDES, ...PASSAGES][i].id;
      }
    });
    WINS.forEach((r, i) => {
      const { sill_m: sill, head_m: head, id } = MODEL.window_meta[i];
      if (sill > 0) wallBox(r, 0, Math.min(sill, top));
      if (top > head) wallBox(r, head, top);
      const [x0, y0, x1, y1] = r,
        hz = x1 - x0 >= y1 - y0,
        L = M(hz ? x1 - x0 : y1 - y0),
        gTop = Math.min(head, top),
        gh = gTop - sill,
        cx = wx((x0 + x1) / 2),
        cz = wz((y0 + y1) / 2);
      colliders.push({
        a: hz ? [wx(x0), cz] : [cx, wz(y0)],
        b: hz ? [wx(x1), cz] : [cx, wz(y1)],
        half: 0.04,
      });
      if (gh <= 0) return;
      const pane = new THREE.Mesh(
        new THREE.BoxGeometry(hz ? L : 0.01, gh, hz ? 0.01 : L),
        glassMat,
      );
      pane.position.set(cx, sill + gh / 2, cz);
      pane.userData.openingId = id;
      archUp.add(pane);
      const n = Math.max(1, Math.round(L / 0.9));
      for (let k = 0; k <= n; k++) {
        const t = -L / 2 + (k * L) / n,
          mu = new THREE.Mesh(
            new THREE.BoxGeometry(hz ? 0.04 : 0.06, gh, hz ? 0.06 : 0.04),
            frameMat,
          );
        mu.position.set(cx + (hz ? t : 0), sill + gh / 2, cz + (hz ? 0 : t));
        archUp.add(mu);
      }
      [sill + 0.02, gTop - 0.02].forEach((y) => {
        const fr = new THREE.Mesh(
          new THREE.BoxGeometry(hz ? L : 0.06, 0.04, hz ? 0.06 : L),
          frameMat,
        );
        fr.position.set(cx, y, cz);
        archUp.add(fr);
      });
    });
    DOORS.forEach((d) => {
      const pivot = new THREE.Group(),
        L = M(d.len),
        dh = Math.min(2.05, top);
      pivot.position.set(wx(d.h[0]), 0, wz(d.h[1]));
      const leaf = box(
        L,
        dh,
        0.04,
        mat(d.entry ? "#374b64" : decorSurface("wood", "#d6dce2"), {
          roughness: 0.5,
        }),
        L / 2,
      );
      const knob = new THREE.Mesh(
        new THREE.SphereGeometry(0.03, 12, 8),
        metal(),
      );
      knob.position.set(L - 0.07, Math.min(1, dh - 0.05), 0);
      pivot.add(leaf, knob);
      const ang = (v) => Math.atan2(-v[1], v[0]),
        door = {
          pivot,
          a0: ang(d.c),
          a1: ang(d.o),
          open: previousDoors.get(d.id)?.open ?? true,
          width: L,
          id: d.id,
        };
      if (door.a1 - door.a0 > Math.PI) door.a1 -= Math.PI * 2;
      if (door.a0 - door.a1 > Math.PI) door.a1 += Math.PI * 2;
      door.cur = previousDoors.get(d.id)?.cur ?? door.a1;
      pivot.rotation.y = door.cur;
      leaf.userData.door = knob.userData.door = door;
      doors.push(door);
      archUp.add(pivot);
    });
    SLIDES.forEach(({ rect: [x0, y0, x1, y1], v, head_m, id }) => {
      const L = M(v ? y1 - y0 : x1 - x0),
        ph = Math.min(head_m, top),
        pl = L / 2,
        cx = wx((x0 + x1) / 2),
        cz = wz((y0 + y1) / 2);
      const sliding = {
        sliding: true,
        open: previousDoors.get(id)?.open ?? true,
        cur: previousDoors.get(id)?.cur ?? 1,
        v,
        L,
        cx,
        cz,
        panels: [],
        id,
      };
      [-1, 1].forEach((sign) => {
        const panel = new THREE.Group();
        const pane = new THREE.Mesh(
          new THREE.BoxGeometry(v ? 0.02 : pl, ph, v ? pl : 0.02),
          glassMat,
        );
        pane.position.y = ph / 2;
        pane.userData.door = sliding;
        panel.add(pane);
        [ph - 0.03, 0.03].forEach((y) =>
          panel.add(box(v ? 0.04 : pl, 0.05, v ? pl : 0.04, frameMat, 0, y, 0)),
        );
        [-1, 1].forEach((e) =>
          panel.add(
            box(
              0.04,
              ph,
              0.04,
              frameMat,
              v ? 0 : (e * pl) / 2,
              ph / 2,
              v ? (e * pl) / 2 : 0,
            ),
          ),
        );
        panel.userData.sign = sign;
        panel.userData.door = sliding;
        sliding.panels.push(panel);
        archUp.add(panel);
      });
      positionSlide(sliding);
      doors.push(sliding);
    });
    applyLight();
    applyGrow();
  }
  function positionSlide(d) {
    d.panels.forEach((p) => {
      const sign = p.userData.sign,
        c = sign < 0 ? -d.L / 4 : d.L / 4 - (d.cur * d.L) / 2;
      p.position.set(
        d.cx + (d.v ? sign * 0.02 : c),
        0,
        d.cz + (d.v ? c : sign * 0.02),
      );
    });
  }

  /* Render the reversible overlay in the furniture group, using canonical host IDs. */
  const interiorPbrCache = new Map(),
    interiorPendingTextures = new Set();
  function interiorPbr(
    id,
    colour = "#ddd5c8",
    scale = { width: 1000, height: 1000 },
    surface = false,
    appearance = "default",
  ) {
    const descriptor = interiorMaterial(state, id);
    if (!descriptor) return mat(colour, { roughness: 0.8 });
    const key = JSON.stringify([
      descriptor,
      colour,
      scale,
      surface,
      appearance,
    ]);
    if (interiorPbrCache.has(key)) return interiorPbrCache.get(key);
    let m;
    if (surface && descriptor.fallback_generic_id)
      m = floorMat(descriptor.fallback_generic_id).clone();
    else if (["wood", "fabric", "stone"].includes(descriptor.category))
      m = sceneSurface(
        descriptor.category === "fabric" ? "linen" : descriptor.category,
        descriptor.base_colour,
      ).clone();
    else
      m = new THREE.MeshStandardMaterial({
        color: descriptor.base_colour,
        roughness: 0.8,
      });
    m.roughness = descriptor.roughness ?? 0.8;
    m.metalness = descriptor.metallic ?? 0;
    m.side = THREE.DoubleSide;
    m.userData = {
      interiorMaterialId: id,
      sourceStatus: descriptor.source_status,
    };
    if (appearance === "ceiling" && m.isMeshStandardMaterial) {
      m.emissive = new THREE.Color(descriptor.base_colour);
      m.emissiveIntensity = 0.2;
      m.userData.ceilingColourCompensation = true;
    }
    if (descriptor.category === "glass") {
      m.transparent = true;
      m.opacity = 0.45;
      m.depthWrite = false;
    }
    const tile = descriptor.texture_scale_mm ||
        descriptor.physical_dimensions_mm || { width: 1000, height: 1000 },
      repeat = [
        scale.width / (tile.width || 1000),
        scale.height / (tile.height || tile.width || 1000),
      ];
    const configure = (t) => {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(...repeat);
      t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    };
    for (const slot of ["map", "bumpMap"])
      if (m[slot]) {
        m[slot] = m[slot].clone();
        configure(m[slot]);
        m[slot].needsUpdate = true;
      }
    for (const [field, slot] of [
      ["albedo_texture", "map"],
      ["normal_map", "normalMap"],
      ["roughness_map", "roughnessMap"],
    ])
      if (descriptor[field]) {
        let done;
        const pending = new Promise((resolve) => (done = resolve));
        interiorPendingTextures.add(pending);
        const loader = new THREE.TextureLoader(scope.loadingManager);
        loader.setCrossOrigin?.("anonymous");
        loader.load(
          descriptor[field],
          (t) => {
            configure(t);
            if (slot === "map") {
              t.colorSpace = THREE.SRGBColorSpace;
              m.color.set("#ffffff");
            }
            m[slot] = t;
            m.needsUpdate = true;
            done();
            interiorPendingTextures.delete(pending);
          },
          undefined,
          () => {
            m.userData.textureFallback = true;
            done();
            interiorPendingTextures.delete(pending);
          },
        );
      }
    interiorPbrCache.set(key, m);
    return m;
  }
  function interiorSurfaceMaterial(id, fallback, kind) {
    const material = state.interior?.surface_materials[id];
    if (!material) return fallback;
    // Ceiling faces point downward, so the viewer's warm lower hemisphere otherwise tints even a near-white finish brown.
    // Use a separate cached material rather than cloning: async texture callbacks must update the exact material on the mesh.
    return interiorPbr(
      material,
      "#ffffff",
      { width: 1000, height: 1000 },
      true,
      kind === "ceiling" ? "ceiling" : "surface",
    );
  }
  function interiorWallMaterials(segment, fallback, height) {
    const refs = interiorSurfaces(MODEL).surfaces.filter(
        (s) =>
          s.type === "wall" &&
          s.source_wall_index === WALL_SEGMENTS.indexOf(segment),
      ),
      out = [...fallback],
      dx = segment.to[0] - segment.from[0],
      dy = segment.to[1] - segment.from[1],
      L = Math.hypot(dx, dy);
    for (const ref of refs) {
      const id = state.interior?.surface_materials[ref.id];
      if (!id) continue;
      const sign =
        (-dy / L) * ref.inward_normal[0] + (dx / L) * ref.inward_normal[1];
      out[sign > 0 ? 4 : 5] = interiorPbr(id, "#ffffff", {
        width: L,
        height: height * 1000,
      });
    }
    return out;
  }
  function interiorMesh(o) {
    const r = interiorResolved(o, MODEL),
      w = M(o.width_mm),
      d = M(o.depth_mm),
      h = M(o.height_mm),
      g = new THREE.Group(),
      primary = interiorPbr(o.material_references.primary || o.material_references.body, o.colour, {
        width: o.width_mm,
        height: o.height_mm,
      }),
      accent = interiorPbr(
        o.material_references.accent || o.material_references.frame || o.material_references.metal || "generic-brass",
        o.colour,
      ),
      white = mat("#f4f0e5", { roughness: 0.85 });
    const B = (ww, hh, dd, m = primary, x = 0, y = 0, z = 0) =>
      g.add(
        box(
          Math.max(0.003, ww),
          Math.max(0.003, hh),
          Math.max(0.003, dd),
          m,
          x,
          y,
          z,
        ),
      );
    if (o.type === "divider") {
      const frame = Math.min(0.03, w * 0.08, d * 0.25);
      B(w, frame, d, primary, 0, 0);
      B(w, frame, d, primary, 0, h - frame);
      if (o.variant === "vertical-slats") {
        const N = Math.max(3, Math.round(w / 0.085));
        for (let i = 0; i < N; i++)
          B(
            Math.min(0.032, (w / N) * 0.5),
            h - 2 * frame,
            d,
            primary,
            -w / 2 + ((i + 0.5) * w) / N,
            frame,
          );
      } else if (o.variant === "fluted-glass") {
        B(frame, h, d, primary, -w / 2 + frame / 2);
        B(frame, h, d, primary, w / 2 - frame / 2);
        const glass = interiorPbr(
          o.material_references.glass || "generic-glass",
        );
        B(w - 2 * frame, h - 2 * frame, Math.min(d, 0.015), glass, 0, frame);
        for (let x = -w / 2 + frame; x < w / 2 - frame; x += 0.022)
          B(0.004, h - 2 * frame, 0.012, glass, x, frame, 0.009);
      } else if (["open-shelf", "storage-screen"].includes(o.variant)) {
        B(frame, h, d, primary, -w / 2 + frame / 2);
        B(frame, h, d, primary, w / 2 - frame / 2);
        for (let y = 0.35; y < h - frame; y += 0.38)
          B(w, frame, d, primary, 0, y);
        B(frame, h, d, primary);
        if (o.variant === "storage-screen") {
          B(w - 2 * frame, Math.min(0.68, h * 0.4), d, primary, 0, frame);
          for (const x of [-w * 0.22, w * 0.22])
            B(0.08, 0.012, 0.008, accent, x, 0.48, d / 2 + 0.004);
        }
      } else B(w, h, d, primary);
    } else if(o.type==='sideboard'&&o.metadata?.appliance_station){
      const s=o.metadata.appliance_station,p=.018,nb=M(s.counter_height_mm),nt=M(s.niche_top_mm);
      if(s.schema!=='ApplianceStationConcept/1'||s.status!=='EXPLORATORY'||!Number.isFinite(nb)||!Number.isFinite(nt)||nb<.7||nt-nb<.5||nt>h-.3||w<.55||d<.55||!Array.isArray(s.appliances))throw new Error('Invalid appliance station concept.');
      B(w,.08,d,mat('#4a4641'));B(p,h-.08,d,primary,-w/2+p/2,.08);B(p,h-.08,d,primary,w/2-p/2,.08);B(w-2*p,h-.08,p,primary,0,.08,-d/2+p/2);
      B(w-2*p,.018,d-2*p,primary,0,.08);B(w-2*p,.018,d-2*p,primary,0,.45);B(w-2*p,.04,d-2*p,mat('#dcd7cf',{roughness:.22}),0,nb-.04);
      fronts(g,-w/2+p,.08,w-2*p,nb-.12,d/2-.027,1,1,primary,'edge');
      B(w-2*p,.018,d-2*p,primary,0,nt);B(w-2*p,.018,d-2*p,primary,0,(nt+h)/2);B(w-2*p,.018,d-2*p,primary,0,h-.018);
      fronts(g,-w/2+p,nt+.02,w-2*p,h-nt-.04,d/2-.027,1,1,primary,'edge');
      const appliances=[];
      for(const a of s.appliances){
        if(!['coffee-machine','kettle'].includes(a.type)||!Array.isArray(a.dimensions_mm)||a.dimensions_mm.length!==3||a.dimensions_mm.some(n=>!Number.isFinite(n)||n<=0)||!Array.isArray(a.position_mm)||a.position_mm.length!==2||a.position_mm.some(n=>!Number.isFinite(n)))throw new Error('Invalid small-appliance reservation.');
        const [aw,ad,ah]=a.dimensions_mm.map(M),[ax,az]=a.position_mm.map(M);
        if(Math.abs(ax)+aw/2>w/2-p||Math.abs(az)+ad/2>d/2-p||nb+ah>nt-.03)throw new Error('Small appliance does not fit the niche.');
        const unit=new THREE.Group(),dark=mat('#303439',{roughness:.34,metalness:.35}),steel=mat('#a9b0b6',{metalness:.7,roughness:.25});
        if(a.type==='coffee-machine'){
          unit.add(rbox(aw,.035,ad,dark,0,0,0,.006),rbox(aw,ah-.035,ad*.57,steel,0,.035,-ad*.215,.01),box(aw*.82,ah*.35,.004,dark,0,ah*.55,ad*.073),box(.055,.024,.07,dark,0,ah*.46,ad*.15),cyl(.034,.031,.075,ceramic(),0,.035,ad*.29,20));
        }else{
          unit.add(cyl(aw/2,aw/2,.025,dark,0,0,0,24),cyl(aw*.4,aw*.43,ah-.045,steel,0,.025,0,24),cyl(aw*.31,aw*.31,.02,dark,0,ah-.02,0,24));
        }
        unit.position.set(ax,nb,az);unit.userData.smallAppliance={...a,placeholder:true};g.add(unit);appliances.push({...a});
      }
      g.userData.applianceStation={...s,clear_width_mm:o.width_mm-36,appliances};
    } else if (
      ["console", "sideboard", "media-unit", "shelf"].includes(o.type)
    ) {
      const t = Math.min(0.03, w / 10, d / 5, h / 8),
        open = o.type === "shelf";
      if (open) {
        B(w, t, d);
        B(w, t, d, primary, 0, h - t);
        B(t, h, d, primary, -w / 2 + t / 2);
        B(t, h, d, primary, w / 2 - t / 2);
        for (let y = 0.3; y < h - t; y += 0.32) B(w, t, d, primary, 0, y);
      } else {
        const legs = o.placement.mode === "floor" ? Math.min(0.12, h * 0.2) : 0;
        B(w, h - legs, d, primary, 0, legs);
        for (const x of [-w * 0.44, w * 0.44])
          for (const z of [-d * 0.38, d * 0.38])
            B(0.025, legs, 0.025, accent, x, 0, z);
        for (let x = -w / 2 + w / 3; x < w / 2; x += w / 3)
          B(0.004, h - legs - 0.02, 0.005, accent, x, legs + 0.01, d / 2);
        for (const x of [-w * 0.25, w * 0.25])
          B(0.055, 0.008, 0.009, accent, x, h * 0.72, d / 2 + 0.002);
      }
    } else if (o.type === "bench") {
      const top = Math.min(0.12, h * 0.28);
      B(
        w,
        top,
        d,
        o.variant === "upholstered"
          ? interiorPbr(o.material_references.fabric || "generic-linen")
          : primary,
        0,
        h - top,
      );
      for (const x of [-w * 0.42, w * 0.42])
        for (const z of [-d * 0.34, d * 0.34])
          B(0.04, h - top, 0.04, primary, x, 0, z);
    } else if (o.type === "wall-panel") {
      B(w, h, d, primary);
      if (o.variant === "fluted")
        for (let x = -w / 2 + 0.018; x < w / 2; x += 0.035)
          B(0.012, h, 0.009, primary, x, 0, d / 2 - 0.005);
    } else if (o.type === "artwork") {
      const frame = Math.min(0.028, w * 0.05, h * 0.05);
      B(w, h, d, accent);
      const art = interiorPbr(
        o.material_references.artwork || o.material_references.art ||
          o.material_references.primary ||
          "reference-art-warm",
        o.colour,
        { width: 1000, height: 1000 },
      );
      const face = new THREE.Mesh(
        new THREE.PlaneGeometry(w - 2 * frame, h - 2 * frame),
        art,
      );
      face.position.set(0, h / 2, d / 2 + 0.001);
      g.add(face);
    } else if (o.type === "mirror") {
      const mirror = new THREE.MeshStandardMaterial({
        color: "#b9c8ce",
        metalness: 0.98,
        roughness: 0.07,
        envMap: envTex,
        envMapIntensity: 1,
      });
      if (o.variant === "round") {
        g.add(blob(w / 2, h / 2, d / 2, accent, 0, h / 2, 0));
        g.add(blob(w * 0.47, h * 0.47, 0.002, mirror, 0, h / 2, d / 2));
      } else {
        B(w, h, d, accent);
        B(w - 0.04, h - 0.04, 0.003, mirror, 0, 0.02, d / 2);
      }
    } else if (o.type === "curtain") {
      B(w, 0.016, 0.018, accent, 0, h - 0.016);
      const open = o.metadata.openness ?? 0.7,
        pw = Math.max(w * 0.08, (w / 2) * (1 - open)),
        curtainMaterial = primary;
      for (const side of [-1, 1]) {
        const panel = curtainPanel(
          pw,
          h - 0.03,
          o.colour,
          o.variant === "sheer",
        );
        panel.material = curtainMaterial.clone();
        if (o.variant === "sheer") {
          panel.material.transparent = true;
          panel.material.opacity = 0.5;
          panel.material.depthWrite = false;
        }
        panel.position.set(side * (w / 2 - pw / 2), h / 2 - 0.015, 0);
        g.add(panel);
      }
      if (o.variant === "layered") {
        const sheer = curtainPanel(w, h - 0.03, "#f8f4eb", true);
        sheer.position.set(0, h / 2 - 0.015, -Math.min(0.035, d * 0.25));
        g.add(sheer);
      }
    } else if (["pendant", "floor-lamp", "table-lamp"].includes(o.type)) {
      const radius = Math.min(w, d) / 2,
        emit = new THREE.MeshStandardMaterial({
          color: "#fff1ce",
          emissive: studioLightColour(
            studioRoomOptions(state, o.room_id).temperature,
          ),
          emissiveIntensity: 0.2,
          roughness: 0.55,
        });
      emit.userData.interiorEmitter = true;
      if (o.type === "pendant") {
        B(0.012, Math.max(0.03, h * 0.55), 0.012, accent, 0, h * 0.45);
        if (o.variant === "linear") B(w, Math.min(0.1, h * 0.45), d, emit);
        else
          g.add(
            blob(
              w / 2,
              Math.min(h * 0.22, w / 2),
              d / 2,
              emit,
              0,
              Math.min(h * 0.22, w / 2),
              0,
            ),
          );
      } else {
        g.add(cyl(radius * 0.8, radius * 0.8, 0.025, accent));
        B(0.016, h * 0.7, 0.016, accent, 0, 0.025);
        if (o.variant === "globe")
          g.add(blob(w / 2, h * 0.22, d / 2, emit, 0, h * 0.78, 0));
        else {
          const shade = new THREE.Mesh(
            new THREE.CylinderGeometry(
              radius * 0.65,
              radius,
              h * 0.28,
              32,
              1,
              true,
            ),
            primary,
          );
          shade.position.y = h * 0.85;
          shade.material = primary.clone();
          shade.material.side = THREE.DoubleSide;
          g.add(shade);
          g.add(
            blob(radius * 0.2, h * 0.1, radius * 0.2, emit, 0, h * 0.81, 0),
          );
        }
        if (o.variant === "arc")
          g.add(rod([0, h * 0.66, 0], [w * 0.26, h * 0.85, 0], 0.008, accent));
      }
      const light = new THREE.PointLight(
        studioLightColour(studioRoomOptions(state, o.room_id).temperature),
        0,
        6,
        2,
      );
      light.position.y = o.type === "pendant" ? h * 0.2 : h * 0.78;
      light.userData.interiorLight = true;
      light.userData.roomId = o.room_id;
      light.userData.basePower = o.type === "pendant" ? 1.3 : 0.85;
      g.add(light);
    } else if (o.type === "plant") {
      const radius = Math.min(w, d) * 0.27,
        potH = Math.min(0.3, h * 0.28);
      g.add(cyl(radius, radius * 0.8, potH, primary));
      B(0.012, h * 0.8, 0.012, mat("#597346"), 0, potH * 0.6);
      const leaf = mat("#557844", { roughness: 0.9 });
      for (let i = 0; i < 12; i++) {
        const a = i * 2.399,
          y = potH + (h - potH) * (0.15 + (0.7 * i) / 12),
          rr = Math.min(w, d) * 0.24;
        const mesh = blob(
          Math.min(w, d) * 0.13,
          0.055,
          Math.min(w, d) * 0.085,
          leaf,
          Math.cos(a) * rr,
          y,
          Math.sin(a) * rr,
        );
        mesh.rotation.z = Math.sin(a) * 0.4;
        g.add(mesh);
      }
    }
    g.position.set(wx(r.cx), M(r.bottom_mm), wz(r.cy));
    g.rotation.y = (-r.rot * Math.PI) / 180;
    g.userData.interiorObjectId = o.id;
    g.userData.roomId = o.room_id;
    g.userData.placementMode = o.placement.mode;
    g.userData.approximate = true;
    g.name = o.type + " · " + o.variant;
    g.visible = o.placement.mode === "floor" || opt.cut >= H;
    g.traverse((n) => {
      n.userData.interiorObjectId = o.id;
    });
    return g;
  }
  function buildInteriorObjects() {
    for (const o of interiorLayer(state).objects) furnG.add(interiorMesh(o));
    for (const [id, t] of Object.entries(
      interiorLayer(state).opening_treatments,
    )) {
      if (t.type === "none") continue;
      const host = interiorSurfaces(MODEL).surfaces.find((s) => s.id === id),
        o = {
          id: "treatment-" + id,
          type: "curtain",
          variant: t.type === "blind" ? "drapery" : t.variant,
          room_id: t.room_id,
          placement: { mode: "opening", host_opening_id: id, elevation_mm: 0 },
          rotation: 0,
          width_mm: host.length_mm,
          depth_mm: 100,
          height_mm: 2450,
          material_references: { primary: t.material_id },
          colour: t.colour,
          status: "EXPLORATORY",
          metadata: { openness: t.openness },
        };
      const mesh = interiorMesh(o);
      mesh.userData.openingTreatmentId = id;
      if (t.type === "blind") {
        mesh.clear();
        const h = 2.45 * (1 - t.openness);
        if (h > 0.005)
          mesh.add(
            box(
              M(host.length_mm),
              h,
              0.025,
              interiorPbr(t.material_id, t.colour),
              0,
              2.45 - h,
              0,
            ),
          );
        mesh.add(
          box(
            M(host.length_mm),
            0.04,
            0.045,
            mat("#e3ded4"),
            0,
            2.45 - 0.04,
            0,
          ),
        );
      }
      furnG.add(mesh);
    }
    interiorApplyLight();
  }
  function interiorApplyLight() {
    if (!furnG) return;
    furnG.traverse((o) => {
      const rid = o.userData.roomId || o.parent?.userData.roomId,
        options = studioRoomOptions(state, rid);
      if (o.userData.interiorLight) {
        o.color.set(studioLightColour(options.temperature));
        o.intensity =
          o.userData.basePower *
          (options.brightness / 75) *
          (opt.night ? 1 : 0.2);
      }
      if (o.material?.userData.interiorEmitter) {
        o.material.emissive.set(studioLightColour(options.temperature));
        o.material.emissiveIntensity =
          ((opt.night ? 0.9 : 0.2) * options.brightness) / 75;
      }
    });
  }

  function buildFurn() {
    clearGroup(furnG);
    state.furniture.forEach((f) => furnG.add(buildFurniture(f)));
    buildInteriorObjects();
    furnG.visible = opt.furn;
    selKey = null;
    applyGrow();
  }

  // 只重建变化的部分

  // CSS2DRenderer 只看标签自身的 visible，不继承父级，所以逐个设置

  function applyGrow() {
    if (!inited) return;
    archUp.scale.y = Math.max(grow, 0.001);
    furnG.scale.y = Math.max(furnGrow, 0.001);
    lampG.visible = grow > 0.99;
    if (sceneDecorG) {
      sceneDecorG.scale.y = grow;
      sceneDecorG.visible = opt.furn;
    }
  }

  /* ======================= 日照 / 夜景 ======================= */
  function applyLight() {
    const t = (opt.hour - 6) / 12,
      az = Math.PI * (0.15 + t * 0.7),
      el = Math.sin(Math.PI * t) * 1.05 + 0.15,
      warm = 1 - Math.sin(Math.PI * t);
    sun.position.set(
      Math.cos(az) * 18,
      Math.sin(el) * 20 + 3,
      -Math.sin(az) * 10 + 8,
    );
    sun.target.position.set(0, 0, 0);
    sun.color.setHSL(0.09, 0.5 + warm * 0.4, 0.92 - warm * 0.12);
    sun.intensity = opt.night ? 0.05 : 1.4 + Math.sin(Math.PI * t) * 1.6;
    hemi.intensity = opt.night ? 0.3 : 1.1;
    scene.background = new THREE.Color(opt.night ? 0x182236 : 0xe9eff5);
    ground.material.color.set(opt.night ? 0x202c42 : 0xe3ebf2);
    lampG.children.forEach((o) => {
      if (o.isPointLight) {
        o.intensity =
          opt.night &&
          studioRoomOptions(state, o.userData.roomId).lighting === "style"
            ? ((state.decor.active === "custom" ? 6 : 1.3) *
                studioRoomOptions(state, o.userData.roomId).brightness) /
              75
            : 0;
        o.color.set(
          studioLightColour(
            studioRoomOptions(state, o.userData.roomId).temperature,
          ),
        );
      } else o.material.emissiveIntensity = opt.night ? 2 : 0.3;
    });
    renderer.toneMappingExposure = opt.night ? 1.25 : 1.05;
    envK = opt.night ? 0.15 : 1;
    matCache.forEach((m) => {
      if (m.envMap) m.envMapIntensity = m.userData.env * envK;
    });
    const h = Math.floor(opt.hour),
      m = Math.round((opt.hour - h) * 60);
    applySceneLighting();
    interiorApplyLight();
  }
  const clamp01 = (t) => Math.max(0, Math.min(1, t));
  function buildScaleReference() {
    scaleRefG = new THREE.Group();
    scaleRefG.visible = false;
    scaleRefG.userData.scaleReference = true;
    const recp = ROOMS.find((r) => r.id === "RECP-01"),
      x = wx(recp.at[0]),
      z = wz(recp.at[1]);
    const skin = mat("#d9c7b6", { roughness: 0.88 }),
      dark = mat("#45515e", { roughness: 0.9 }),
      mark = mat("#d55b4f", { roughness: 0.75 });
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.82, 0.18), dark);
    torso.position.set(0, 1.0, 0);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 18, 12), skin);
    head.position.set(0, 1.58, 0);
    const legL = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.055, 0.72, 10),
      dark,
    );
    legL.position.set(-0.07, 0.36, 0);
    const legR = legL.clone();
    legR.position.x = 0.07;
    const ruler = new THREE.Mesh(
      new THREE.BoxGeometry(0.045, 1.0, 0.045),
      mark,
    );
    ruler.position.set(0.42, 0.5, 0);
    const cap1 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.025, 0.05), mark);
    cap1.position.set(0.42, 1.0, 0);
    const cap0 = cap1.clone();
    cap0.position.y = 0.01;
    scaleRefG.add(torso, head, legL, legR, ruler, cap1, cap0);
    scaleRefG.position.set(x, 0, z);
    scene.add(scaleRefG);
  }
  function blocked(x, z, r = 0.2) {
    const near = (ax, az, bx, bz, pad) => {
      const dx = bx - ax,
        dz = bz - az,
        len = dx * dx + dz * dz,
        t = len ? clamp01(((x - ax) * dx + (z - az) * dz) / len) : 0;
      return Math.hypot(x - (ax + t * dx), z - (az + t * dz)) < r + pad;
    };
    for (const c of colliders) if (near(...c.a, ...c.b, c.half)) return true;
    if (opt.furn) {
      for (const o of interiorLayer(state).objects) {
        const f = interiorResolved(o, MODEL);
        if (f.bottom_mm >= 2100 || f.top_mm < 100 || f.type === "curtain")
          continue;
        const dx = x - wx(f.cx),
          dz = z - wz(f.cy),
          a = (f.rot * Math.PI) / 180;
        if (
          Math.abs(dx * Math.cos(a) + dz * Math.sin(a)) < M(f.w) / 2 + r &&
          Math.abs(-dx * Math.sin(a) + dz * Math.cos(a)) < M(f.d) / 2 + r
        )
          return true;
      }
      for (const lamp of studioLampFootprints)
        if (Math.hypot(x - lamp.x, z - lamp.z) < r + lamp.radius) return true;
      for (const f of state.furniture) {
        if (
          [
            "rug",
            "tv",
            "acwall",
            "aircon",
            "stove",
            "ksink",
            "waterheater",
            "baycushion",
          ].includes(f.type)
        )
          continue;
        const dx = x - wx(f.cx),
          dz = z - wz(f.cy),
          a = (f.rot * Math.PI) / 180,
          lx = dx * Math.cos(a) + dz * Math.sin(a),
          lz = -dx * Math.sin(a) + dz * Math.cos(a);
        if (Math.abs(lx) < M(f.w) / 2 + r && Math.abs(lz) < M(f.d) / 2 + r)
          return true;
      }
    }
    for (const d of doors) {
      if (d.sliding) {
        for (const p of d.panels) {
          const px = p.position.x,
            pz = p.position.z;
          if (
            near(
              px - (d.v ? 0 : d.L / 4),
              pz - (d.v ? d.L / 4 : 0),
              px + (d.v ? 0 : d.L / 4),
              pz + (d.v ? d.L / 4 : 0),
              0.01,
            )
          )
            return true;
        }
      } else {
        const a = d.pivot.rotation.y,
          px = d.pivot.position.x,
          pz = d.pivot.position.z;
        if (
          near(
            px,
            pz,
            px + Math.cos(a) * d.width,
            pz - Math.sin(a) * d.width,
            0.01,
          )
        )
          return true;
      }
    }
    return false;
  }
  envTex = scope.envTex;
  glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xcfe6ef,
    roughness: 0.05,
    transparent: true,
    opacity: 0.28,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  wallMat = mat("#f4f7fa", { roughness: 0.92 });
  capMat = mat("#31455e", { roughness: 0.9 });
  frameMat = mat("#5d6166", { roughness: 0.5, metalness: 0.4 });
  archFloor.name = "Canonical floors";
  archUp.name = "Canonical architecture";
  furnG.name = "Furnishings";
  sceneDecorG.name = "Style decor";
  scene.add(archFloor, archUp, furnG, labelG, lampG, sceneDecorG);
  buildScaleReference();
  return {
    build(layout, view) {
      state = layout;
      Object.assign(opt, view);
      buildArch();
      buildFurn();
      buildSceneDecor();
      for (const d of doors) {
        const recorded = view?.doors?.find((v) => v.id === d.id);
        if (recorded) {
          d.open = recorded.open;
          d.cur = recorded.position;
          if (d.sliding) positionSlide(d);
          else d.pivot.rotation.y = d.cur;
        }
      }
      applyLight();
    },
    groups: { archFloor, archUp, furnG, sceneDecorG, scaleRefG },
    blocked,
    doors,
    scale(visible) {
      scaleRefG.visible = visible;
    },
    dispose() {
      const geometries = new Set(),
        materials = new Set(),
        textures = new Set();
      scene.traverse((o) => {
        if (o.geometry) geometries.add(o.geometry);
        for (const m of [].concat(o.material || [])) {
          materials.add(m);
          for (const v of Object.values(m)) if (v?.isTexture) textures.add(v);
        }
      });
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
    },
  };
}
