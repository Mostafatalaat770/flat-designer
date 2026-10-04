CREATE TABLE `apartment_design_variants` (
	`owner_id` text NOT NULL,
	`variant_id` text NOT NULL,
	`name` text NOT NULL,
	`revision` integer NOT NULL,
	`canonical_hash` text NOT NULL,
	`scene_revision` text NOT NULL,
	`layout_json` text NOT NULL,
	`request_id` text NOT NULL,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`owner_id`, `variant_id`)
);
