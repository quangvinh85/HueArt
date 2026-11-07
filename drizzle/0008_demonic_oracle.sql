ALTER TABLE `artwork_submissions` ADD `pricing_json` text DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE `artwork_submissions` ADD `admin_pricing_json` text DEFAULT '{}' NOT NULL;