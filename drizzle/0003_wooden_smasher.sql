CREATE TABLE `apartment_scene_capture_requests` (
	`owner_id` text NOT NULL,
	`request_id` text NOT NULL,
	`request_hash` text NOT NULL,
	`scene_revision` text NOT NULL,
	`storage_revision` integer NOT NULL,
	`status` text NOT NULL,
	`lease_token` text NOT NULL,
	`lease_until` text NOT NULL,
	`view_ids_json` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`owner_id`, `request_id`)
);
