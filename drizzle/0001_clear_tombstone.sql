CREATE TABLE `artwork_submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`reference` text NOT NULL,
	`submission_key` text NOT NULL,
	`payload_hash` text NOT NULL,
	`requester_hash` text NOT NULL,
	`title` text NOT NULL,
	`title_en` text DEFAULT '' NOT NULL,
	`title_fr` text DEFAULT '' NOT NULL,
	`author_name` text NOT NULL,
	`author_email` text DEFAULT '' NOT NULL,
	`author_phone` text NOT NULL,
	`location` text DEFAULT '' NOT NULL,
	`story` text DEFAULT '' NOT NULL,
	`collection` text NOT NULL,
	`object_key` text NOT NULL,
	`content_type` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`admin_note` text DEFAULT '' NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `artwork_submissions_reference` ON `artwork_submissions` (`reference`);--> statement-breakpoint
CREATE UNIQUE INDEX `artwork_submissions_key` ON `artwork_submissions` (`submission_key`);--> statement-breakpoint
CREATE INDEX `artwork_submissions_requester` ON `artwork_submissions` (`requester_hash`,`created_at`);