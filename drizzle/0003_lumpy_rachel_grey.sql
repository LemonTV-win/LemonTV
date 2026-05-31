CREATE TABLE `oauth_client` (
	`id` text PRIMARY KEY NOT NULL,
	`client_name` text,
	`redirect_uris` text NOT NULL,
	`grant_types` text DEFAULT '["authorization_code"]' NOT NULL,
	`response_types` text DEFAULT '["code"]' NOT NULL,
	`token_endpoint_auth_method` text DEFAULT 'none' NOT NULL,
	`scope` text,
	`client_uri` text,
	`logo_uri` text,
	`software_id` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_oauth_client_created` ON `oauth_client` (`created_at`);--> statement-breakpoint
CREATE TABLE `oauth_auth_code` (
	`id` text PRIMARY KEY NOT NULL,
	`code_hash` text NOT NULL,
	`client_id` text NOT NULL,
	`user_id` text NOT NULL,
	`redirect_uri` text NOT NULL,
	`code_challenge` text NOT NULL,
	`code_challenge_method` text DEFAULT 'S256' NOT NULL,
	`scope` text NOT NULL,
	`resource` text NOT NULL,
	`expires_at` integer NOT NULL,
	`consumed_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`client_id`) REFERENCES `oauth_client`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `oauth_auth_code_code_hash_unique` ON `oauth_auth_code` (`code_hash`);--> statement-breakpoint
CREATE INDEX `idx_oauth_code_client` ON `oauth_auth_code` (`client_id`);--> statement-breakpoint
CREATE INDEX `idx_oauth_code_expires` ON `oauth_auth_code` (`expires_at`);