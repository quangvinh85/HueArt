CREATE TABLE `shop_settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value_json` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `orders` ADD `payment_method` text DEFAULT 'contact' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `exchange_rate` integer DEFAULT 26000 NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `bank_snapshot_json` text DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `payment_claimed_at` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `payment_reference` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `reported_amount_vnd` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `received_amount_vnd` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `rights_confirmed` integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
UPDATE orders SET received_amount_vnd = CAST(ROUND((subtotal_cents + COALESCE(shipping_cents, 0)) * 26000.0 / 100) AS INTEGER) WHERE payment_status = 'paid';
