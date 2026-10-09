import { useEffect, useRef, useState } from "react";
import { download } from "./files";
import { createEngine } from "../../renderer/engine.js";
import {
  CANONICAL,
  model,
  validate,
  importBrief,
  brief,
  propose,
  revision,
  verifyCamera,
} from "./domain";
import { readVariants, saveVariant, readDraft, writeDraft } from "./storage";
import type {
  Brief,
  Layout,
  Camera,
  Furniture,
  Variant,
  LogEntry,
} from "./types";
import seed from "../data/workspace-seed.json";
import sourceInfo from "../data/workspace-config.json";
import historicalSeed from "../data/family-a7.brief.json";
import savedViews from "../data/workspace-cameras.json";
import { genericDiningAsset } from "../../assets/demo.js";
import {
  FurniturePanel,
  VersionsPanel,
  ChecksPanel,
  LogPanel,
} from "./InspectorPanels";
const base = seed as unknown as Brief,
  cameras = savedViews as unknown as Camera[];
const rooms = model.rooms;

type Engine = ReturnType<typeof createEngine>;
export function App() {
  const [initialDraft] = useState(() => {
    try {
      return { draft: readDraft(), error: "" };
    } catch (e) {
      return {
        draft: null,
        error: "Saved draft retained: " + (e as Error).message,
      };
    }
  });
  const [layout, setLayout] = useState<Layout>(() =>
    importBrief(initialDraft.draft?.brief || base),
  );
  const [initialStorage] = useState(() => {
    try {
      return { variants: readVariants(), error: "" };
    } catch (e) {
      return { variants: [], error: (e as Error).message };
    }
  });
  const [variants, setVariants] = useState<Variant[]>(initialStorage.variants);
  const storageError = initialStorage.error || initialDraft.error;
  const [room, setRoom] = useState("RECP-01"),
    [view, setView] = useState(cameras[0]),
    [selected, setSelected] = useState(""),
    [draft, setDraft] = useState<Furniture | null>(null),
    [error, setError] = useState(""),
    [status, setStatus] = useState("Loading the verified scene…"),
    [ready, setReady] = useState(false),
    [tab, setTab] = useState("Furniture"),
    [lens, setLens] = useState(42),
    [mode, setMode] = useState("fixed"),
    [scale, setScale] = useState(false),
    [comparison, setComparison] = useState(false),
    [compareId, setCompareId] = useState("baseline"),
    [busy, setBusy] = useState(false),
    [log, setLog] = useState<LogEntry[]>(initialDraft.draft?.log || []),
    [hypothesis, setHypothesis] = useState(""),
    [variantName, setVariantName] = useState(""),
    [assetStatus, setAssetStatus] = useState(
      "No imported meshes. Current furniture is generic geometry.",
    ),
    [exports, setExports] = useState<{
      binary: ArrayBuffer;
      job: unknown;
    } | null>(null);
  const [assetVariants, setAssetVariants] = useState<
    { id: string; name: string }[]
  >([]);
  const viewport = useRef<HTMLDivElement>(null),
    compareViewport = useRef<HTMLDivElement>(null),
    engine = useRef<Engine | null>(null),
    compareEngine = useRef<Engine | null>(null),
    undo = useRef<Layout[]>([]),
    redo = useRef<Layout[]>([]),
    current = useRef(layout),
    currentView = useRef(view),
    mounted = useRef(false);
  const validation = validate(layout),
    counts = { PASS: 0, WARNING: 0, FAIL: 0 };
  validation.checks.forEach((c) => counts[c.status]++);

  useEffect(() => {
    if (!viewport.current) return;
    mounted.current = true;
    try {
      const e = createEngine(viewport.current, current.current, setSelected);
      engine.current = e;
      e.setView(currentView.current);
      void e
        .ready()
        .then(() => {
          if (mounted.current) {
            setStatus(`${sourceInfo.name} · verified source · local workspace`);
            setReady(true);
          }
        })
        .catch((error) => setError(error.message));
      (window as any).ApartmentWorkspace = {
        inspect: () => e.inspect(),
        layout: () => structuredClone(current.current),
        views: () => cameras,
        selectView: (id: string) => {
          const c = cameras.find((v) => v.id === id);
          if (!c) throw Error("Unknown camera");
          setRoom(c.room_id);
          setView(c);
        },
        selectFurniture: setSelected,
        validation: () => validate(current.current),
      };
    } catch (e) {
      setError((e as Error).message);
      setStatus("The scene could not load");
    }
    return () => {
      mounted.current = false;
      engine.current?.dispose();
      engine.current = null;
      delete (window as any).ApartmentWorkspace;
    };
  }, []);
  useEffect(() => {
    current.current = layout;
    try {
      engine.current?.update(layout);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [layout]);
  useEffect(() => {
    setDraft(layout.furniture.find((f) => f.id === selected) || null);
  }, [layout, selected]);
  useEffect(() => {
    try {
      verifyCamera(current.current, view);
      engine.current?.setView(view);
      setLens(view.fov);
      setMode("fixed");
      currentView.current = view;
    } catch (e) {
      setError((e as Error).message);
    }
  }, [view]);
  useEffect(() => {
    if (!comparison || !compareViewport.current) return;
    const compare =
      compareId === "baseline"
        ? base
        : compareId === "family-a7"
          ? historicalSeed as unknown as Brief
          : variants.find((v) => v.id === compareId)?.brief;
    if (!compare) return;
    try {
      const e = createEngine(compareViewport.current, importBrief(compare));
      compareEngine.current = e;
      e.setView(view);
      e.setLens(lens);
      setStatus("Comparison uses matching position and lens");
    } catch (e) {
      setError((e as Error).message);
    }
    return () => {
      compareEngine.current?.dispose();
      compareEngine.current = null;
    };
  }, [comparison, compareId, variants, view, lens]);
  useEffect(() => {
    engine.current?.select(selected);
  }, [selected]);
  useEffect(() => {
    if (!storageError) {
      try {
        writeDraft(brief(layout), log);
      } catch (e) {
        setError("Local draft could not be saved: " + (e as Error).message);
      }
    }
  }, [layout, log, storageError]);
  function commit(next: Layout, change: string) {
    const result = validate(next);
    const fails = result.checks.filter((c) => c.status === "FAIL");
    if (fails.length)
      throw Error(
        "Change rejected: " +
          fails
            .map((c) => c.message)
            .slice(0, 3)
            .join(" "),
      );
    undo.current.push(structuredClone(layout));
    redo.current = [];
    setLayout(next);
    const entry: LogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      hypothesis: hypothesis || "Controlled furniture refinement",
      change,
      revision: revision(next),
      validation:
        "0 FAIL · " +
        result.checks.filter((c) => c.status === "WARNING").length +
        " WARN",
      observation: "Awaiting inspection from saved Natural views",
      decision: "PENDING",
    };
    setLog((rows) => [...rows, entry]);
    setStatus(change + " · validated locally");
    setError("");
  }
  function applyOperations(operations: unknown[], change: string) {
    try {
      commit(propose(layout, operations), change);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  function save() {
    try {
      if (storageError) throw Error(storageError);
      if (!variantName.trim()) throw Error("Give this saved version a name");
      const row = {
        id: crypto.randomUUID(),
        name: variantName.trim(),
        brief: brief(layout),
        log,
        created: new Date().toISOString(),
      };
      setVariants(saveVariant(variants, row));
      setVariantName("");
      setStatus("Saved an immutable local version");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  function restore(b: Brief, name: string) {
    try {
      commit(importBrief(b), "Loaded " + name);
      setSelected("");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  function undoEdit() {
    const previous = undo.current.pop();
    if (!previous) return;
    redo.current.push(layout);
    setLayout(previous);
    setStatus("Restored previous local draft");
    setError("");
    setLog((rows) =>
      rows.map((r, i) =>
        i === rows.length - 1 ? { ...r, decision: "REVERT" } : r,
      ),
    );
  }
  function redoEdit() {
    const next = redo.current.pop();
    if (!next) return;
    undo.current.push(layout);
    setLayout(next);
    setStatus("Restored next local draft");
  }
  async function importFile(file: File | undefined) {
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      restore(parsed, file.name);
    } catch (e) {
      setError("Import failed: " + (e as Error).message);
    }
  }
  async function importAsset(files: FileList | null) {
    if (!files?.length || !selected || !engine.current) return;
    setBusy(true);
    setError("");
    try {
      const mesh = Array.from(files).find((f) => f.name.endsWith(".glb")),
        metadata = Array.from(files).find((f) => f.name.endsWith(".json"));
      if (!mesh || !metadata)
        throw Error(
          "Choose the GLB and its ApartmentAsset/1 JSON metadata together",
        );
      if (mesh.size > 30 * 1024 * 1024) throw Error("Use a GLB under 30 MB");
      const record = JSON.parse(await metadata.text());
      const result = await engine.current.loadAsset(
        selected,
        await mesh.arrayBuffer(),
        record,
      );
      setAssetVariants(record.material_variants || []);
      setAssetStatus(
        record.fidelity +
          " · " +
          result.measured_mm.join(" × ") +
          " mm · " +
          record.attribution +
          " · session import; retain original files",
      );
      setStatus("Dimension-checked mesh loaded");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function loadDemo() {
    if (!selected || !engine.current) return;
    setBusy(true);
    try {
      const asset = await genericDiningAsset();
      await engine.current.loadAsset(selected, asset.binary, asset.record);
      setAssetVariants(asset.record.material_variants);
      setAssetStatus(
        "GENERIC · locally authored · CC0 · 2000 × 750 × 950 mm · session import",
      );
      setStatus("Dimension-checked generic GLB sample loaded");
      setError("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function exportRender() {
    if (!engine.current) return;
    setBusy(true);
    setError("");
    try {
      const result = await engine.current.exportScene();
      setExports(result as any);
      setStatus("Canonical GLB and Cycles job ready to download");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function chooseRoom(id: string) {
    setRoom(id);
    setSelected("");
    const c = cameras.find((c) => c.room_id === id);
    if (c) setView(c);
    else
      setStatus(
        "No standing camera saved for this room. Choose an existing view or orbit.",
      );
  }
  const furniture = layout.furniture.filter((f) => f.room_id === room),
    roomName = layout.rooms[room]?.name || room;
  const panelProps = {
    furniture,
    selected,
    setSelected,
    draft,
    setDraft,
    hypothesis,
    setHypothesis,
    applyOperations,
    assetStatus,
    busy,
    importAsset,
    loadDemo,
    assetVariants,
    applyAssetMaterial: (id: string) => {
      try {
        engine.current?.applyAssetMaterial(selected, id);
        setStatus("Asset finish applied locally");
      } catch (error) {
        setError((error as Error).message);
      }
    },
    undoAvailable: !!undo.current.length,
    redoAvailable: !!redo.current.length,
    undoEdit,
    redoEdit,
    variantName,
    setVariantName,
    save,
    variants,
    restore,
    exports,
    exportRender,
    ready,
    validation,
    counts,
    room,
    layout,
    setTab,
    log,
    setLog,
  };
  return (
    <div className="workspace">
      <header>
        <div className="identity">
          <a
            href="/_qa/integration-review.html"
            className="home-link"
            aria-label="Return to project evidence"
          >
            B
          </a>
          <div>
            <h1>Apartment Type B</h1>
            <p>
              Design workspace <span>·</span> {sourceInfo.name}
            </p>
          </div>
        </div>
        <div className="header-actions">
          <span className="local">Local only</span>
          <a className="button" href="/_qa/workspace/explore.html">Explore &amp; Verify ✨</a>
          <button
            onClick={() =>
              download(
                "apartment-" + revision(layout) + ".json",
                JSON.stringify(brief(layout), null, 2),
              )
            }
          >
            Export brief
          </button>
          <label className="button">
            Import brief
            <input
              type="file"
              accept=".json"
              onChange={(e) => void importFile(e.target.files?.[0])}
            />
          </label>
        </div>
      </header>
      <nav className="room-nav" aria-label="Apartment rooms">
        {rooms.map((r) => (
          <button
            id={"room-" + r.id}
            key={r.id}
            className={room === r.id ? "active" : ""}
            onClick={() => chooseRoom(r.id)}
          >
            {layout.rooms[r.id].name}
          </button>
        ))}
      </nav>
      <main>
        <section className="scene-panel">
          <div className="scene-heading">
            <div>
              <h2>{roomName}</h2>
              <p>
                {comparison
                  ? "Matching cameras · current draft on the right"
                  : "Architecture locked · furnished clear height 2.50 m"}
              </p>
            </div>
            <button
              id="compare-versions"
              aria-pressed={comparison}
              onClick={() => setComparison((v) => !v)}
            >
              Compare versions
            </button>
          </div>
          <div className={"views " + (comparison ? "split" : "")}>
            {comparison && (
              <div className="scene-slot">
                <label className="compare-label">
                  Before
                  <select
                    aria-label="Comparison version"
                    value={compareId}
                    onChange={(e) => setCompareId(e.target.value)}
                  >
                    <option value="baseline">Synced source · revision {sourceInfo.storage_revision}</option>
                    <option value="family-a7">Preserved Family A.7</option>
                    {variants.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="viewport" ref={compareViewport} />
              </div>
            )}
            <div className="scene-slot">
              {comparison && <p className="compare-label">Current draft</p>}
              <div className="viewport" ref={viewport} />
              {!ready && <p className="loading">{status}</p>}
            </div>
          </div>
          <div className="camera-controls">
            <label>
              View
              <select
                id="saved-camera"
                aria-label="Saved camera"
                value={view.id}
                onChange={(e) => {
                  const c = cameras.find((c) => c.id === e.target.value)!;
                  setView(c);
                  setRoom(c.room_id);
                }}
              >
                {cameras.map((c) => (
                  <option value={c.id} key={c.id}>
                    {c.label}
                    {c.fov === 60 ? " · Wide" : ""}
                  </option>
                ))}
              </select>
            </label>
            <div className="segmented" aria-label="Camera lens">
              {[42, 60].map((f) => (
                <button
                  key={f}
                  aria-pressed={lens === f}
                  onClick={() => {
                    setLens(f);
                    engine.current?.setLens(f);
                    compareEngine.current?.setLens(f);
                    setStatus(
                      f === 42
                        ? "Natural 42° lens · use for spatial review"
                        : "Wide 60° lens · composition overview",
                    );
                  }}
                >
                  {f === 42 ? "Natural 42°" : "Wide 60°"}
                </button>
              ))}
            </div>
            <label className="check">
              <input
                id="scale-check"
                type="checkbox"
                checked={scale}
                onChange={(e) => {
                  setScale(e.target.checked);
                  engine.current?.scale(e.target.checked);
                  setStatus(
                    e.target.checked
                      ? "Scale reference on · human 1.70 m · ruler 1.00 m"
                      : "Scale reference off",
                  );
                }}
              />
              Scale check
            </label>
            <label>
              Camera
              <select
                aria-label="Camera mode"
                value={mode}
                onChange={(e) => {
                  setMode(e.target.value);
                  engine.current?.setMode(e.target.value);
                }}
              >
                <option value="fixed">Saved eye-level</option>
                <option value="orbit">Orbit</option>
                <option value="walk">Walk · 1.70 m</option>
              </select>
            </label>
          </div>
          <div className="scene-footer">
            <p id="workspace-status" role="status">
              {mode === "walk"
                ? "W/A/S/D to move · drag to look · collision checked · 1.70 m eye"
                : status}
            </p>
            <button
              disabled={!ready}
              onClick={() =>
                engine.current &&
                download(
                  revision(layout) + "-" + view.id + ".png",
                  new Blob(
                    [
                      Uint8Array.from(
                        atob(engine.current.screenshot().split(",")[1]),
                        (c) => c.charCodeAt(0),
                      ),
                    ],
                    { type: "image/png" },
                  ),
                )
              }
            >
              Save image
            </button>
          </div>
          <div className="review-strip">
            <div>
              <strong>
                {counts.FAIL === 0
                  ? "No geometry failures"
                  : counts.FAIL + " geometry failures"}
              </strong>
              <p>
                {counts.WARNING} warnings require spatial review. Furniture is
                exploratory; meshes are generic until replaced.
              </p>
            </div>
            <button onClick={() => setTab("Checks")}>Review checks</button>
          </div>
        </section>
        <aside>
          <div
            className="inspector-tabs"
            role="tablist"
            aria-label="Design inspector"
          >
            {["Furniture", "Versions", "Checks", "Log"].map((t) => (
              <button
                id={"tab-" + t.toLowerCase()}
                key={t}
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
              >
                {t}
                {t === "Checks" ? ` (${counts.WARNING})` : ""}
              </button>
            ))}
          </div>
          {error && (
            <div role="alert" className="error">
              {error}
              <button onClick={() => setError("")} aria-label="Dismiss error">
                Dismiss
              </button>
            </div>
          )}
          {storageError && (
            <p className="error" role="alert">
              {storageError}
            </p>
          )}
          {tab === "Furniture" && <FurniturePanel {...panelProps} />}

          {tab === "Versions" && <VersionsPanel {...panelProps} />}

          {tab === "Checks" && <ChecksPanel {...panelProps} />}

          {tab === "Log" && <LogPanel {...panelProps} />}
        </aside>
      </main>
      <footer>
        <a href="/_qa/integration-review.html">
          Multi-view design evidence
        </a>
        <a href="/_qa/chatgpt-image-pack/index.html">Historical A.7 prompt pack</a>
        <span>{revision(layout)} · canonical geometry preserved</span>
      </footer>
    </div>
  );
}
