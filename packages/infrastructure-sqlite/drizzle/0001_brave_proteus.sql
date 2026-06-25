DROP TABLE `api_keys`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_feeds` (
	`created_at` text NOT NULL,
	`data` text DEFAULT '{}',
	`description` text NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`link` text NOT NULL,
	`title` text NOT NULL,
	`updated_at` text NOT NULL,
	`user_id` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_feeds`("created_at", "data", "description", "id", "link", "title", "updated_at", "user_id") SELECT "created_at", "data", "description", "id", "link", "title", "updated_at", "user_id" FROM `feeds`;--> statement-breakpoint
DROP TABLE `feeds`;--> statement-breakpoint
ALTER TABLE `__new_feeds` RENAME TO `feeds`;--> statement-breakpoint
PRAGMA foreign_keys=ON;