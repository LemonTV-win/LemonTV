CREATE TABLE `deleted_record` (
	`id` text PRIMARY KEY NOT NULL,
	`entity` text NOT NULL,
	`record_id` text NOT NULL,
	`label` text,
	`data` text NOT NULL,
	`deleted_by` text NOT NULL,
	`deleted_at` integer NOT NULL,
	FOREIGN KEY (`deleted_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_deleted_record_entity` ON `deleted_record` (`entity`);--> statement-breakpoint
CREATE INDEX `idx_deleted_record_record` ON `deleted_record` (`record_id`);