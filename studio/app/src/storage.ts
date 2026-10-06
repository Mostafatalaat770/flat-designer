import type { Variant, Brief, LogEntry } from "./types";
import { importBrief, CANONICAL, revision } from "./domain";
import sourceInfo from "../data/workspace-config.json";
const LEGACY = "type-b-workspace-v1";
const KEY = "type-b-workspace-" + sourceInfo.scene_revision + "-v1";
export function readVariants(): Variant[] {
  try {
    const keys = [LEGACY];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)!;
      if (/^type-b-workspace-scene-[0-9a-f]+-v1$/.test(key)) keys.push(key);
    }
    const histories = keys.map(key => JSON.parse(localStorage.getItem(key) || "[]"));
    if (histories.some(rows => !Array.isArray(rows) || rows.length > 100)) throw Error("Invalid workspace history");
    const rows = histories.flat();
    for (const row of rows) {
      importBrief(row.brief);
      if (
        typeof row.id !== "string" ||
        typeof row.name !== "string" ||
        !Array.isArray(row.log)
      )
        throw Error("Invalid variant");
    }
    const unique = new Map<string, Variant>();
    for (const row of rows) {
      const old = unique.get(row.id);
      if (old && JSON.stringify(old) !== JSON.stringify(row)) throw Error("Conflicting immutable versions");
      unique.set(row.id, row);
    }
    if (unique.size > 100) throw Error("Invalid workspace history");
    return [...unique.values()];
  } catch (error) {
    throw Error(
      "Saved local variants could not be read. Your original data is retained. " +
        (error as Error).message,
    );
  }
}
export function saveVariant(rows: Variant[], row: Variant): Variant[] {
  if (rows.some((v) => v.id === row.id))
    throw Error("A saved version cannot be overwritten");
  importBrief(row.brief);
  if (rows.length >= 100) throw Error("Export existing versions before saving more than 100");
  const next = [...rows, structuredClone(row)];
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

// Older browser drafts remain untouched; a new synced baseline never auto-loads them.
const DRAFT = "type-b-workspace-draft-" + sourceInfo.scene_revision + "-v1";
export function readDraft(): { brief: Brief; log: LogEntry[] } | null {
  const raw = localStorage.getItem(DRAFT);
  if (!raw) return null;
  const value = JSON.parse(raw);
  importBrief(value.brief);
  if (!Array.isArray(value.log)) throw Error("Invalid local draft log");
  return value;
}
export function writeDraft(brief: Brief, log: LogEntry[]) {
  if (
    brief.canonical_sha256 !== CANONICAL ||
    brief.scene_revision !== revision(brief.layout)
  )
    throw Error("Draft does not match its scene");
  localStorage.setItem(DRAFT, JSON.stringify({ brief, log }));
}
