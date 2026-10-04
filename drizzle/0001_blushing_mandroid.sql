CREATE TABLE `apartment_scene_views` (
	`seq` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`view_id` text NOT NULL,
	`owner_id` text NOT NULL,
	`scene_revision` text NOT NULL,
	`storage_revision` integer NOT NULL,
	`room_id` text NOT NULL,
	`camera_json` text NOT NULL,
	`object_key` text NOT NULL,
	`image_hash` text NOT NULL,
	`image_width` integer NOT NULL,
	`image_height` integer NOT NULL,
	`timestamp` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `apartment_view_owner_id` ON `apartment_scene_views` (`owner_id`,`view_id`);--> statement-breakpoint
CREATE INDEX `apartment_view_latest` ON `apartment_scene_views` (`owner_id`,`room_id`,`seq`);