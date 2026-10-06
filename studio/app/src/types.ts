export type Furniture = {
  id: string;
  type: string;
  name: string;
  room_id: string;
  cx: number;
  cy: number;
  w: number;
  d: number;
  rot: number;
  color: string;
  status: string;
  variant?: string;
  product_reference_id?: string;
  material_id?: string;
};
export type Layout = {
  modelVersion: string;
  sourceCanonicalHash?: string;
  rooms: Record<string, { name: string; mat: string }>;
  furniture: Furniture[];
  demolished: string[];
  decor: unknown;
  studio: unknown;
  interior: unknown;
  measures: unknown[];
};
export type Brief = {
  schema: "ApartmentDesignBrief/1";
  canonical_sha256: string;
  scene_revision: string;
  layout: Layout;
  rooms?: unknown;
  openings?: unknown;
  wall_segments?: unknown;
};
export type Camera = {
  id: string;
  label: string;
  room_id: string;
  position: number[];
  target: number[];
  fov: number;
  near: number;
  far: number;
  aspect: number;
  viewport: { width: number; height: number };
  viewer: unknown;
};
export type Check = {
  kind: string;
  status: "PASS" | "WARNING" | "FAIL";
  object_id?: string;
  room_id?: string;
  message: string;
  measured_clearance_mm?: number;
};
export type Validation = { valid: boolean; checks: Check[] };
export type LogEntry = {
  id: string;
  timestamp: string;
  hypothesis: string;
  change: string;
  revision: string;
  validation: string;
  observation: string;
  decision: "PENDING" | "KEEP" | "REVERT";
};
export type Variant = {
  id: string;
  name: string;
  brief: Brief;
  log: LogEntry[];
  created: string;
};
