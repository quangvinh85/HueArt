CREATE TABLE `order_notifications` (
	`order_id` text PRIMARY KEY NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`last_attempt_at` text,
	`next_chunk` integer DEFAULT 0 NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`last_error` text DEFAULT '' NOT NULL,
	`sent_at` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `order_notifications_created` ON `order_notifications` (`created_at`);