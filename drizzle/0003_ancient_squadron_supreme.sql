CREATE TABLE `catalogue_overrides` (
	`artwork_id` text PRIMARY KEY NOT NULL,
	`metadata_json` text DEFAULT '{}' NOT NULL,
	`hidden` integer DEFAULT 0 NOT NULL,
	`deleted_at` text,
	`version` integer DEFAULT 1 NOT NULL,
	`updated_at` text NOT NULL
);
