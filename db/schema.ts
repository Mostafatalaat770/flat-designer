import { sqliteTable, text, integer, primaryKey, uniqueIndex, index } from "drizzle-orm/sqlite-core";

export const apartmentDesigns = sqliteTable("apartment_designs", {
  ownerId: text("owner_id").primaryKey(),
  revision: integer("revision").notNull(),
  sceneRevision: text("scene_revision").notNull(),
  layoutJson: text("layout_json").notNull(),
  requestId: text("request_id").notNull(),
  source: text("source").notNull(),
  summary: text("summary").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const apartmentDesignHistory = sqliteTable("apartment_design_history", {
  ownerId: text("owner_id").notNull(),
  revision: integer("revision").notNull(),
  sceneRevision: text("scene_revision").notNull(),
  layoutJson: text("layout_json").notNull(),
  requestId: text("request_id").notNull(),
  source: text("source").notNull(),
  summary: text("summary").notNull(),
  updatedAt: text("updated_at").notNull(),
}, table => [
  primaryKey({ columns: [table.ownerId, table.revision] }),
  uniqueIndex("apartment_history_request").on(table.ownerId, table.requestId),
]);

export const apartmentSceneViews = sqliteTable("apartment_scene_views", {
  seq: integer("seq").primaryKey({ autoIncrement: true }),
  viewId: text("view_id").notNull(),
  ownerId: text("owner_id").notNull(),
  sceneRevision: text("scene_revision").notNull(),
  storageRevision: integer("storage_revision").notNull(),
  roomId: text("room_id").notNull(),
  cameraJson: text("camera_json").notNull(),
  objectKey: text("object_key").notNull(),
  imageHash: text("image_hash").notNull(),
  imageWidth: integer("image_width").notNull(),
  imageHeight: integer("image_height").notNull(),
  timestamp: text("timestamp").notNull(),
  createdAt: text("created_at").notNull(),
}, table => [
  uniqueIndex("apartment_view_owner_id").on(table.ownerId, table.viewId),
  index("apartment_view_latest").on(table.ownerId, table.roomId, table.seq),
]);

export const apartmentDesignVariants = sqliteTable("apartment_design_variants", {
  ownerId: text("owner_id").notNull(),
  variantId: text("variant_id").notNull(),
  name: text("name").notNull(),
  revision: integer("revision").notNull(),
  canonicalHash: text("canonical_hash").notNull(),
  sceneRevision: text("scene_revision").notNull(),
  layoutJson: text("layout_json").notNull(),
  requestId: text("request_id").notNull(),
  updatedAt: text("updated_at").notNull(),
}, table => [primaryKey({ columns: [table.ownerId, table.variantId] })]);

export const apartmentSceneCaptureRequests = sqliteTable("apartment_scene_capture_requests", {
  ownerId: text("owner_id").notNull(),
  requestId: text("request_id").notNull(),
  requestHash: text("request_hash").notNull(),
  sceneRevision: text("scene_revision").notNull(),
  storageRevision: integer("storage_revision").notNull(),
  status: text("status").notNull(),
  leaseToken: text("lease_token").notNull(),
  leaseUntil: text("lease_until").notNull(),
  viewIdsJson: text("view_ids_json").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, table => [primaryKey({ columns: [table.ownerId, table.requestId] })]);
