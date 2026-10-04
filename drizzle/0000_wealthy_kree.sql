CREATE TABLE `apartment_design_history` (
	`owner_id` text NOT NULL,
	`revision` integer NOT NULL,
	`scene_revision` text NOT NULL,
	`layout_json` text NOT NULL,
	`request_id` text NOT NULL,
	`source` text NOT NULL,
	`summary` text NOT NULL,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`owner_id`, `revision`)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `apartment_history_request` ON `apartment_design_history` (`owner_id`,`request_id`);--> statement-breakpoint
CREATE TABLE `apartment_designs` (
	`owner_id` text PRIMARY KEY NOT NULL,
	`revision` integer NOT NULL,
	`scene_revision` text NOT NULL,
	`layout_json` text NOT NULL,
	`request_id` text NOT NULL,
	`source` text NOT NULL,
	`summary` text NOT NULL,
	`updated_at` text NOT NULL
);
