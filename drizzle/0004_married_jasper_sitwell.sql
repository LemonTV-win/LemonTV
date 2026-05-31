CREATE TABLE `oauth_refresh_token` (
	`id` text PRIMARY KEY NOT NULL,
	`token_hash` text NOT NULL,
	`client_id` text NOT NULL,
	`user_id` text NOT NULL,
	`scope` text NOT NULL,
	`resource` text NOT NULL,
	`expires_at` integer NOT NULL,
	`consumed_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`client_id`) REFERENCES `oauth_client`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `oauth_refresh_token_token_hash_unique` ON `oauth_refresh_token` (`token_hash`);--> statement-breakpoint
CREATE INDEX `idx_oauth_refresh_client` ON `oauth_refresh_token` (`client_id`);--> statement-breakpoint
CREATE INDEX `idx_oauth_refresh_user` ON `oauth_refresh_token` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_oauth_refresh_expires` ON `oauth_refresh_token` (`expires_at`);