PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_mcp_audit_log` (
	`id` text PRIMARY KEY NOT NULL,
	`token_id` text NOT NULL,
	`user_id` text NOT NULL,
	`tool` text NOT NULL,
	`status` text NOT NULL,
	`detail` text,
	`ip` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_mcp_audit_log`("id", "token_id", "user_id", "tool", "status", "detail", "ip", "created_at") SELECT "id", "token_id", "user_id", "tool", "status", "detail", "ip", "created_at" FROM `mcp_audit_log`;--> statement-breakpoint
DROP TABLE `mcp_audit_log`;--> statement-breakpoint
ALTER TABLE `__new_mcp_audit_log` RENAME TO `mcp_audit_log`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `idx_mcp_audit_token` ON `mcp_audit_log` (`token_id`);--> statement-breakpoint
CREATE INDEX `idx_mcp_audit_created` ON `mcp_audit_log` (`created_at`);--> statement-breakpoint
CREATE TABLE `__new_mcp_rate_limit` (
	`token_id` text PRIMARY KEY NOT NULL,
	`tokens` real NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_mcp_rate_limit`("token_id", "tokens", "updated_at") SELECT "token_id", "tokens", "updated_at" FROM `mcp_rate_limit`;--> statement-breakpoint
DROP TABLE `mcp_rate_limit`;--> statement-breakpoint
ALTER TABLE `__new_mcp_rate_limit` RENAME TO `mcp_rate_limit`;