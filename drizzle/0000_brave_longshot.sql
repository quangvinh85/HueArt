CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`order_number` text NOT NULL,
	`checkout_key` text NOT NULL,
	`payload_hash` text NOT NULL,
	`requester_hash` text NOT NULL,
	`customer_name` text NOT NULL,
	`customer_phone` text NOT NULL,
	`customer_email` text DEFAULT '' NOT NULL,
	`customer_address` text DEFAULT '' NOT NULL,
	`customer_note` text DEFAULT '' NOT NULL,
	`items_json` text NOT NULL,
	`subtotal_cents` integer NOT NULL,
	`shipping_cents` integer,
	`has_print` integer DEFAULT 0 NOT NULL,
	`has_copyright` integer DEFAULT 0 NOT NULL,
	`rights_accepted` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`payment_status` text DEFAULT 'unpaid' NOT NULL,
	`admin_note` text DEFAULT '' NOT NULL,
	`history_json` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_number_unique` ON `orders` (`order_number`);--> statement-breakpoint
CREATE UNIQUE INDEX `orders_checkout_unique` ON `orders` (`checkout_key`);--> statement-breakpoint
CREATE INDEX `orders_created_idx` ON `orders` (`created_at`);--> statement-breakpoint
CREATE INDEX `orders_status_idx` ON `orders` (`status`);--> statement-breakpoint
CREATE INDEX `orders_requester_created_idx` ON `orders` (`requester_hash`,`created_at`);