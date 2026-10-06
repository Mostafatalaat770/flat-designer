import type { Dispatch, SetStateAction } from "react";
import type {
  Furniture,
  Layout,
  Brief,
  Variant,
  LogEntry,
  Validation,
} from "./types";
import products from "../../../studio-catalog.json";
import seed from "../data/workspace-seed.json";
import sourceInfo from "../data/workspace-config.json";
import historicalSeed from "../data/family-a7.brief.json";
import { CANONICAL } from "./domain";
import { download } from "./files";
const base = seed as unknown as Brief;
type PanelsProps = {
  furniture: Furniture[];
  selected: string;
  setSelected: Dispatch<SetStateAction<string>>;
  draft: Furniture | null;
  setDraft: Dispatch<SetStateAction<Furniture | null>>;
  hypothesis: string;
  setHypothesis: Dispatch<SetStateAction<string>>;
  applyOperations: (operations: unknown[], change: string) => void;
  assetStatus: string;
  busy: boolean;
  importAsset: (files: FileList | null) => Promise<void>;
  loadDemo: () => Promise<void>;
  assetVariants: { id: string; name: string }[];
  applyAssetMaterial: (id: string) => void;
  undoAvailable: boolean;
  redoAvailable: boolean;
  undoEdit: () => void;
  redoEdit: () => void;
  variantName: string;
  setVariantName: Dispatch<SetStateAction<string>>;
  save: () => void;
  variants: Variant[];
  restore: (brief: Brief, name: string) => void;
  exports: { binary: ArrayBuffer; job: unknown } | null;
  exportRender: () => Promise<void>;
  ready: boolean;
  validation: Validation;
  counts: { PASS: number; WARNING: number; FAIL: number };
  room: string;
  layout: Layout;
  setTab: Dispatch<SetStateAction<string>>;
  log: LogEntry[];
  setLog: Dispatch<SetStateAction<LogEntry[]>>;
};

export function FurniturePanel({
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
  applyAssetMaterial,
  undoAvailable,
  redoAvailable,
  undoEdit,
  redoEdit,
  room,
}: Pick<
  PanelsProps,
  | "furniture"
  | "selected"
  | "setSelected"
  | "draft"
  | "setDraft"
  | "hypothesis"
  | "setHypothesis"
  | "applyOperations"
  | "assetStatus"
  | "busy"
  | "importAsset"
  | "loadDemo"
  | "assetVariants"
  | "applyAssetMaterial"
  | "undoAvailable"
  | "redoAvailable"
  | "undoEdit"
  | "redoEdit"
  | "room"
>) {
  return (
    <div className="inspector">
      <h3>Furniture in this room</h3>
      <p className="hint">
        Select an item in the scene or the list. Dimensions describe its outside
        footprint.
      </p>
      <select
        aria-label="Furniture item"
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
      >
        <option value="">Choose an item ({furniture.length})</option>
        {furniture.map((f) => (
          <option key={f.id} value={f.id}>
            {f.name}
          </option>
        ))}
      </select>
      {draft ? (
        <>
          <h3>{draft.name}</h3>
          <p className="provenance">
            {draft.product_reference_id
              ? "REFERENCE · conceptual product link"
              : "GENERIC · exploratory furniture"}
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              applyOperations(
                [
                  {
                    type: "update-furniture",
                    furniture_id: draft.id,
                    changes: {
                      cx: draft.cx,
                      cy: draft.cy,
                      w: draft.w,
                      d: draft.d,
                      rot: draft.rot,
                    },
                  },
                ],
                "Adjusted " + draft.name,
              );
            }}
          >
            <div className="dimension-grid">
              {(["w", "d", "cx", "cy", "rot"] as const).map((k) => (
                <label key={k}>
                  {
                    {
                      w: "Width · mm",
                      d: "Depth · mm",
                      cx: "Plan X · mm",
                      cy: "Plan Y · mm",
                      rot: "Rotation · °",
                    }[k]
                  }
                  <input
                    id={"furniture-" + k}
                    type="number"
                    required
                    step={k === "rot" ? 1 : 10}
                    value={draft[k]}
                    onChange={(e) => {
                      const number = e.target.valueAsNumber;
                      if (Number.isFinite(number))
                        setDraft({ ...draft, [k]: number });
                    }}
                  />
                </label>
              ))}
            </div>
            <label>
              Refinement hypothesis
              <input
                value={hypothesis}
                onChange={(e) => setHypothesis(e.target.value)}
                placeholder="What should this change improve?"
              />
            </label>
            <button id="apply-furniture" className="primary" type="submit">
              Validate and apply
            </button>
          </form>
          <label className="material-colour">
            Furniture colour
            <input
              type="color"
              aria-label="Furniture colour"
              value={draft.color}
              onChange={(e) =>
                applyOperations(
                  [
                    {
                      type: "set-furniture-colour",
                      furniture_id: draft.id,
                      colour: e.target.value,
                    },
                  ],
                  "Changed " + draft.name + " colour",
                )
              }
            />
          </label>
          <h3>Product references</h3>
          <p className="hint">
            A link describes design intent. It does not certify this mesh as
            manufacturer CAD.
          </p>
          {products
            .filter((p) => p.type === draft.type)
            .map((p) => (
              <div className="product" key={p.id}>
                <a href={p.url} target="_blank" rel="noreferrer">
                  {p.maker} · {p.name}
                </a>
                <p>
                  {p.dimensions_mm
                    ? p.dimensions_mm.join(" × ") + " mm"
                    : "Dimensions TBD"}{" "}
                  · REFERENCE
                </p>
                <button
                  onClick={() =>
                    applyOperations(
                      [
                        {
                          type: "update-furniture",
                          furniture_id: draft.id,
                          changes: { product_reference_id: p.id },
                        },
                      ],
                      "Linked reference " + p.name,
                    )
                  }
                >
                  Link reference
                </button>
              </div>
            ))}
          <h3>Detailed geometry</h3>
          <p className="hint">
            Import a GLB and its metadata JSON together. Measured dimensions
            must match this footprint. No stretching.
          </p>
          <label className={"button " + (busy ? "disabled" : "")}>
            Import furniture asset
            <input
              type="file"
              multiple
              accept=".glb,.json"
              disabled={busy}
              onChange={(e) => void importAsset(e.target.files)}
            />
          </label>
          <p className="hint">{assetStatus}</p>
          {draft.type === "table" && (
            <button disabled={busy} onClick={() => void loadDemo()}>
              Try generic GLB sample
            </button>
          )}
          {assetVariants.length > 0 && (
            <div
              className="asset-finishes"
              role="group"
              aria-label="Asset material variant"
            >
              Asset material variant
              {assetVariants.map((v) => (
                <button
                  key={v.id}
                  id={"asset-finish-" + v.id}
                  onClick={() => applyAssetMaterial(v.id)}
                >
                  {v.name}
                </button>
              ))}
            </div>
          )}
          <button
            onClick={() =>
              download(
                "asset-metadata.json",
                JSON.stringify(
                  {
                    schema: "ApartmentAsset/1",
                    units: "m",
                    up_axis: "+Y",
                    forward_axis: "+Z",
                    origin: "center-floor",
                    dimensions_mm: [draft.w, 800, draft.d],
                    fidelity: "GENERIC",
                    source: "TBD — replace with actual asset source",
                    license: "TBD — record actual permission",
                    attribution: "TBD — record author",
                    product_reference_id: draft.product_reference_id || null,
                  },
                  null,
                  2,
                ),
              )
            }
          >
            Download metadata template
          </button>
        </>
      ) : (
        <p className="empty">
          Choose furniture to inspect its size, materials and product reference.
        </p>
      )}
      <div className="history-actions">
        <button disabled={!undoAvailable} onClick={undoEdit}>
          Undo
        </button>
        <button disabled={!redoAvailable} onClick={redoEdit}>
          Redo
        </button>
      </div>
    </div>
  );
}

export function VersionsPanel({
  busy,
  variantName,
  setVariantName,
  save,
  variants,
  restore,
  exports,
  exportRender,
  ready,
}: Pick<
  PanelsProps,
  | "busy"
  | "variantName"
  | "setVariantName"
  | "save"
  | "variants"
  | "restore"
  | "exports"
  | "exportRender"
  | "ready"
>) {
  return (
    <div className="inspector">
      <h3>Local design history</h3>
      <p className="hint">
        Saved versions are immutable. Import and export keeps them portable.
      </p>
      <label>
        Version name
        <input
          value={variantName}
          onChange={(e) => setVariantName(e.target.value)}
          placeholder="Next controlled family refinement"
        />
      </label>
      <button className="primary" onClick={save}>
        Save local version
      </button>
      <div className="version">
        <strong>{sourceInfo.name}</strong>
        <p>{base.scene_revision} · source revision {sourceInfo.storage_revision} · local copy</p>
        <button onClick={() => restore(base, sourceInfo.name)}>
          Load baseline
        </button>
      </div>
      <div className="version">
        <strong>Preserved Family A.7</strong>
        <p>{historicalSeed.scene_revision} · earlier local candidate</p>
        <button onClick={() => restore(historicalSeed as unknown as Brief, "Preserved Family A.7")}>Load A.7</button>
      </div>
      {variants.map((v) => (
        <div className="version" key={v.id}>
          <strong>{v.name}</strong>
          <p>
            {v.brief.scene_revision} · {new Date(v.created).toLocaleString()}
          </p>
          <button onClick={() => restore(v.brief, v.name)}>Load version</button>
          <button
            onClick={() =>
              download(v.name + ".json", JSON.stringify(v.brief, null, 2))
            }
          >
            Export
          </button>
        </div>
      ))}
      <h3>Cycles render handoff</h3>
      <p className="hint">
        Export the actual scene and matching camera. Lighting is exploratory
        until the Cycles round-trip passes.
      </p>
      <button disabled={busy || !ready} onClick={() => void exportRender()}>
        {busy ? "Preparing…" : "Prepare GLB + render job"}
      </button>
      {exports && (
        <div className="export-actions">
          <button
            onClick={() =>
              download(
                "apartment.glb",
                new Blob([exports.binary], { type: "model/gltf-binary" }),
              )
            }
          >
            Download GLB
          </button>
          <button
            onClick={() =>
              download(
                "apartment.job.json",
                JSON.stringify(exports.job, null, 2),
              )
            }
          >
            Download job JSON
          </button>
        </div>
      )}
    </div>
  );
}

export function ChecksPanel({
  furniture,
  setSelected,
  validation,
  counts,
  room,
  layout,
  setTab,
}: Pick<
  PanelsProps,
  | "furniture"
  | "setSelected"
  | "validation"
  | "counts"
  | "room"
  | "layout"
  | "setTab"
>) {
  return (
    <div className="inspector">
      <h3>Spatial review</h3>
      <p className="hint">
        {counts.PASS} PASS · {counts.WARNING} WARN · {counts.FAIL} FAIL.
        Warnings need context; they are not all required walking routes.
      </p>
      {validation.checks
        .filter(
          (c) => c.status !== "PASS" && (!c.room_id || c.room_id === room),
        )
        .map((c, i) => (
          <div className="check-row" key={c.kind + "-" + i}>
            <strong>
              {c.status} · {c.kind}
            </strong>
            <p>{c.message}</p>
            {c.measured_clearance_mm !== undefined && (
              <small>{c.measured_clearance_mm} mm measured</small>
            )}
            {c.object_id &&
              layout.furniture.some((f) => f.id === c.object_id) && (
                <button
                  onClick={() => {
                    setSelected(c.object_id!);
                    setTab("Furniture");
                  }}
                >
                  Inspect item
                </button>
              )}
          </div>
        ))}
      <p className="hint">
        Canonical SHA: {CANONICAL.slice(0, 16)}…<br />
        Full-height living glazing is preserved. Concealed HVAC feasibility
        remains TBD.
      </p>
    </div>
  );
}

export function LogPanel({
  hypothesis,
  validation,
  log,
  setLog,
}: Pick<PanelsProps, "hypothesis" | "validation" | "log" | "setLog">) {
  return (
    <div className="inspector">
      <h3>Design decisions</h3>
      <p className="hint">
        Keep a change only after reviewing several Natural eye-level views.
      </p>
      <button
        onClick={() =>
          download("design-log.json", JSON.stringify(log, null, 2))
        }
      >
        Export log
      </button>
      {!log.length && (
        <p className="empty">
          No changes yet. The synced source and earlier Family A.7 candidate are preserved.
        </p>
      )}
      {log.map((entry, i) => (
        <div className="log-entry" key={entry.id}>
          <strong>{entry.change}</strong>
          <p>{entry.hypothesis}</p>
          <small>
            {entry.validation} · {entry.revision}
          </small>
          <label>
            Screenshot observation
            <textarea
              value={entry.observation}
              onChange={(e) => {
                const value = e.target.value;
                setLog((rows) =>
                  rows.map((r, j) =>
                    i === j ? { ...r, observation: value } : r,
                  ),
                );
              }}
            />
          </label>
          <label>
            Decision
            <select
              value={entry.decision}
              onChange={(e) => {
                const value = e.target.value as LogEntry["decision"];
                setLog((rows) =>
                  rows.map((r, j) => (i === j ? { ...r, decision: value } : r)),
                );
              }}
            >
              <option>PENDING</option>
              <option>KEEP</option>
              <option>REVERT</option>
            </select>
          </label>
        </div>
      ))}
    </div>
  );
}
