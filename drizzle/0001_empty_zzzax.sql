CREATE TABLE `mcp_audit_log` (
	`id` text PRIMARY KEY NOT NULL,
	`token_id` text NOT NULL,
	`user_id` text NOT NULL,
	`tool` text NOT NULL,
	`status` text NOT NULL,
	`detail` text,
	`ip` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`token_id`) REFERENCES `mcp_token`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_mcp_audit_token` ON `mcp_audit_log` (`token_id`);--> statement-breakpoint
CREATE INDEX `idx_mcp_audit_created` ON `mcp_audit_log` (`created_at`);--> statement-breakpoint
CREATE TABLE `mcp_rate_limit` (
	`token_id` text PRIMARY KEY NOT NULL,
	`tokens` real NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`token_id`) REFERENCES `mcp_token`(`id`) ON UPDATE no action ON DELETE cascade
);
