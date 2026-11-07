CREATE TABLE `media_upload_reservations` (
	`id` text PRIMARY KEY NOT NULL,
	`bytes` integer NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `request_limits` (
	`request_key` text PRIMARY KEY NOT NULL,
	`attempts` integer NOT NULL,
	`window_started` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `request_limits_window` ON `request_limits` (`window_started`);--> statement-breakpoint
ALTER TABLE `artwork_submissions` ADD `stored_bytes` integer DEFAULT 0 NOT NULL;