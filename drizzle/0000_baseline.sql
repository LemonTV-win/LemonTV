CREATE TABLE `role` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`email` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `user_role` (
	`user_id` text NOT NULL,
	`role_id` text NOT NULL,
	PRIMARY KEY(`user_id`, `role_id`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`role_id`) REFERENCES `role`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_user_role_user` ON `user_role` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_user_role_role` ON `user_role` (`role_id`);--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_session_user` ON `session` (`user_id`);--> statement-breakpoint
CREATE TABLE `password_reset_token` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `password_reset_token_token_unique` ON `password_reset_token` (`token`);--> statement-breakpoint
CREATE TABLE `mcp_token` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`token_hash` text NOT NULL,
	`prefix` text NOT NULL,
	`scope` text DEFAULT 'read' NOT NULL,
	`created_at` integer NOT NULL,
	`expires_at` integer,
	`last_used_at` integer,
	`revoked_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `mcp_token_token_hash_unique` ON `mcp_token` (`token_hash`);--> statement-breakpoint
CREATE INDEX `idx_mcp_token_user` ON `mcp_token` (`user_id`);--> statement-breakpoint
CREATE TABLE `player` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`nationality` text,
	`avatar` text,
	`user_id` text,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `player_slug_unique` ON `player` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_player_user` ON `player` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_player_nationality` ON `player` (`nationality`);--> statement-breakpoint
CREATE TABLE `player_additional_nationality` (
	`player_id` text NOT NULL,
	`nationality` text NOT NULL,
	PRIMARY KEY(`player_id`, `nationality`),
	FOREIGN KEY (`player_id`) REFERENCES `player`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_pan_player` ON `player_additional_nationality` (`player_id`);--> statement-breakpoint
CREATE INDEX `idx_pan_nationality` ON `player_additional_nationality` (`nationality`);--> statement-breakpoint
CREATE TABLE `player_alias` (
	`player_id` text NOT NULL,
	`alias` text NOT NULL,
	FOREIGN KEY (`player_id`) REFERENCES `player`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_pa_player` ON `player_alias` (`player_id`);--> statement-breakpoint
CREATE TABLE `teams` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`abbr` text,
	`logo` text,
	`region` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `team_alias` (
	`id` integer PRIMARY KEY NOT NULL,
	`team_id` text NOT NULL,
	`alias` text NOT NULL,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_ta_team` ON `team_alias` (`team_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `team_alias_team_id_alias_unique` ON `team_alias` (`team_id`,`alias`);--> statement-breakpoint
CREATE TABLE `team_player` (
	`id` integer PRIMARY KEY NOT NULL,
	`team_id` text NOT NULL,
	`player_id` text NOT NULL,
	`role` text NOT NULL,
	`started_on` text,
	`ended_on` text,
	`note` text,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_tp_team` ON `team_player` (`team_id`);--> statement-breakpoint
CREATE INDEX `idx_tp_player` ON `team_player` (`player_id`);--> statement-breakpoint
CREATE INDEX `idx_tp_role` ON `team_player` (`role`);--> statement-breakpoint
CREATE TABLE `team_slogan` (
	`id` integer PRIMARY KEY NOT NULL,
	`team_id` text NOT NULL,
	`event_id` text,
	`slogan` text NOT NULL,
	`language` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`event_id`) REFERENCES `event`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `team_slogan_team_slogan_dupe_guard` ON `team_slogan` (`team_id`,`event_id`,`slogan`);--> statement-breakpoint
CREATE TABLE `game_account` (
	`server` text NOT NULL,
	`account_id` integer NOT NULL,
	`player_id` text NOT NULL,
	`current_name` text NOT NULL,
	`region` text,
	PRIMARY KEY(`server`, `account_id`),
	FOREIGN KEY (`player_id`) REFERENCES `player`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_ga_player` ON `game_account` (`player_id`);--> statement-breakpoint
CREATE TABLE `social_account` (
	`id` text PRIMARY KEY NOT NULL,
	`platform_id` text NOT NULL,
	`player_id` text NOT NULL,
	`account_id` text NOT NULL,
	`overriding_url` text,
	FOREIGN KEY (`platform_id`) REFERENCES `social_platform`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`player_id`) REFERENCES `player`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_psa_platform` ON `social_account` (`platform_id`);--> statement-breakpoint
CREATE INDEX `idx_psa_player` ON `social_account` (`player_id`);--> statement-breakpoint
CREATE INDEX `idx_psa_account` ON `social_account` (`account_id`);--> statement-breakpoint
CREATE TABLE `social_platform` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`url_template` text
);
--> statement-breakpoint
CREATE TABLE `event` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`official` integer NOT NULL,
	`server` text NOT NULL,
	`format` text NOT NULL,
	`region` text NOT NULL,
	`image` text NOT NULL,
	`status` text NOT NULL,
	`capacity` integer NOT NULL,
	`date` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `event_slug_unique` ON `event` (`slug`);--> statement-breakpoint
CREATE TABLE `event_caster` (
	`event_id` text NOT NULL,
	`player_id` text NOT NULL,
	`role` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	PRIMARY KEY(`event_id`, `player_id`),
	FOREIGN KEY (`event_id`) REFERENCES `event`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`player_id`) REFERENCES `player`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `event_organizer` (
	`event_id` text NOT NULL,
	`organizer_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	PRIMARY KEY(`event_id`, `organizer_id`),
	FOREIGN KEY (`event_id`) REFERENCES `event`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`organizer_id`) REFERENCES `organizer`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_eo_event` ON `event_organizer` (`event_id`);--> statement-breakpoint
CREATE TABLE `event_result` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`team_id` text NOT NULL,
	`rank` integer NOT NULL,
	`rank_to` integer,
	`prize_amount` integer,
	`prize_currency` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `event`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `event_team` (
	`event_id` text NOT NULL,
	`team_id` text NOT NULL,
	`entry` text DEFAULT 'open' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer,
	PRIMARY KEY(`event_id`, `team_id`),
	FOREIGN KEY (`event_id`) REFERENCES `event`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `event_team_player` (
	`event_id` text NOT NULL,
	`team_id` text NOT NULL,
	`player_id` text NOT NULL,
	`role` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer,
	PRIMARY KEY(`event_id`, `team_id`, `player_id`),
	FOREIGN KEY (`event_id`) REFERENCES `event`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`player_id`) REFERENCES `player`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_etp_event` ON `event_team_player` (`event_id`);--> statement-breakpoint
CREATE TABLE `event_video` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`type` text NOT NULL,
	`url` text NOT NULL,
	`platform` text NOT NULL,
	`title` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `event`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_ev_event` ON `event_video` (`event_id`);--> statement-breakpoint
CREATE TABLE `event_website` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`url` text NOT NULL,
	`label` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `event`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `organizer` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`logo` text NOT NULL,
	`description` text,
	`url` text,
	`type` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	CONSTRAINT "type" CHECK("organizer"."type" IS NULL OR "organizer"."type" IN ('individual', 'organization', 'community', 'tournament_series', 'league'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `organizer_slug_unique` ON `organizer` (`slug`);--> statement-breakpoint
CREATE TABLE `organizer_user` (
	`organizer_id` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	PRIMARY KEY(`organizer_id`, `user_id`),
	FOREIGN KEY (`organizer_id`) REFERENCES `organizer`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `character` (
	`id` text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE `map` (
	`id` text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE `game` (
	`id` integer PRIMARY KEY NOT NULL,
	`match_id` text NOT NULL,
	`map_id` text NOT NULL,
	`duration` integer NOT NULL,
	`winner` integer NOT NULL,
	FOREIGN KEY (`match_id`) REFERENCES `match`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`map_id`) REFERENCES `map`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_game_match` ON `game` (`match_id`);--> statement-breakpoint
CREATE TABLE `game_player_score` (
	`id` integer PRIMARY KEY NOT NULL,
	`game_id` integer NOT NULL,
	`team_id` text NOT NULL,
	`account_id` integer NOT NULL,
	`player` text NOT NULL,
	`character_first_half` text,
	`character_second_half` text,
	`score` integer NOT NULL,
	`damage_score` integer NOT NULL,
	`kills` integer NOT NULL,
	`knocks` integer NOT NULL,
	`deaths` integer NOT NULL,
	`assists` integer NOT NULL,
	`damage` integer NOT NULL,
	FOREIGN KEY (`game_id`) REFERENCES `game`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`character_first_half`) REFERENCES `character`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`character_second_half`) REFERENCES `character`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_gps_game` ON `game_player_score` (`game_id`);--> statement-breakpoint
CREATE INDEX `idx_gps_team` ON `game_player_score` (`team_id`);--> statement-breakpoint
CREATE INDEX `idx_gps_account` ON `game_player_score` (`account_id`);--> statement-breakpoint
CREATE INDEX `idx_gps_char1` ON `game_player_score` (`character_first_half`);--> statement-breakpoint
CREATE INDEX `idx_gps_char2` ON `game_player_score` (`character_second_half`);--> statement-breakpoint
CREATE TABLE `game_team` (
	`game_id` integer NOT NULL,
	`team_id` text NOT NULL,
	`position` integer NOT NULL,
	`score` integer NOT NULL,
	PRIMARY KEY(`game_id`, `team_id`),
	FOREIGN KEY (`game_id`) REFERENCES `game`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "position" CHECK("game_team"."position" IN (0, 1))
);
--> statement-breakpoint
CREATE INDEX `idx_gt_game` ON `game_team` (`game_id`);--> statement-breakpoint
CREATE INDEX `idx_gt_team` ON `game_team` (`team_id`);--> statement-breakpoint
CREATE TABLE `game_vod` (
	`game_id` integer NOT NULL,
	`url` text NOT NULL,
	`type` text NOT NULL,
	`player_id` text,
	`team_id` text,
	`language` text,
	`platform` text,
	`title` text,
	`official` integer DEFAULT true NOT NULL,
	`start_time` integer,
	`available` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	PRIMARY KEY(`game_id`, `url`),
	FOREIGN KEY (`game_id`) REFERENCES `game`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`player_id`) REFERENCES `player`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `match` (
	`id` text PRIMARY KEY NOT NULL,
	`format` text,
	`stage_id` integer,
	CONSTRAINT "format" CHECK("match"."format" IN ('BO1', 'BO3', 'BO5'))
);
--> statement-breakpoint
CREATE INDEX `idx_match_stage` ON `match` (`stage_id`);--> statement-breakpoint
CREATE TABLE `match_map` (
	`id` integer PRIMARY KEY NOT NULL,
	`match_id` text NOT NULL,
	`map_id` text NOT NULL,
	`order` integer,
	`side` integer,
	`action` text,
	`map_picker_position` integer,
	`side_picker_position` integer,
	FOREIGN KEY (`match_id`) REFERENCES `match`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`map_id`) REFERENCES `map`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `match_team` (
	`match_id` text,
	`team_id` text,
	`position` integer,
	`score` integer DEFAULT 0,
	PRIMARY KEY(`match_id`, `team_id`),
	FOREIGN KEY (`match_id`) REFERENCES `match`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "position" CHECK("match_team"."position" >= 0)
);
--> statement-breakpoint
CREATE TABLE `event_stage` (
	`id` integer PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`title` text NOT NULL,
	`stage` text NOT NULL,
	`format` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `event`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "stage" CHECK("event_stage"."stage" IN ('group', 'qualifier', 'showmatch', 'playoff')),
	CONSTRAINT "format" CHECK("event_stage"."format" IN ('single', 'double', 'swiss', 'round-robin'))
);
--> statement-breakpoint
CREATE INDEX `idx_stage_event` ON `event_stage` (`event_id`);--> statement-breakpoint
CREATE TABLE `stage_node` (
	`id` integer PRIMARY KEY NOT NULL,
	`stage_id` integer NOT NULL,
	`match_id` text NOT NULL,
	`round_id` integer NOT NULL,
	`order` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`stage_id`) REFERENCES `event_stage`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`match_id`) REFERENCES `match`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`round_id`) REFERENCES `stage_round`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `stage_node_dependency` (
	`id` integer PRIMARY KEY NOT NULL,
	`node_id` integer NOT NULL,
	`dependency_match_id` text NOT NULL,
	`outcome` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`node_id`) REFERENCES `stage_node`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`dependency_match_id`) REFERENCES `match`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `stage_round` (
	`id` integer PRIMARY KEY NOT NULL,
	`stage_id` integer NOT NULL,
	`type` text NOT NULL,
	`title` text,
	`bracket` text,
	`parallel_group` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`stage_id`) REFERENCES `event_stage`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `player_mouse_settings` (
	`player_id` text PRIMARY KEY NOT NULL,
	`dpi` integer,
	`sensitivity` real,
	`polling_rate_hz` integer,
	`windows_pointer_speed` integer,
	`mouse_smoothing` integer,
	`mouse_model` text,
	`vertical_sens_multiplier` real,
	`shoulder_fire_sens_multiplier` real,
	`ads_sens_1_25x` real,
	`ads_sens_1_5x` real,
	`ads_sens_2_5x` real,
	`ads_sens_4_0x` real,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`player_id`) REFERENCES `player`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `player_character_stats` (
	`player_id` text NOT NULL,
	`character_id` text NOT NULL,
	`total_games` integer DEFAULT 0 NOT NULL,
	`total_wins` integer DEFAULT 0 NOT NULL,
	`total_losses` integer DEFAULT 0 NOT NULL,
	`total_kills` integer DEFAULT 0 NOT NULL,
	`total_deaths` integer DEFAULT 0 NOT NULL,
	`total_assists` integer DEFAULT 0 NOT NULL,
	`total_knocks` integer DEFAULT 0 NOT NULL,
	`total_score` integer DEFAULT 0 NOT NULL,
	`total_damage` integer DEFAULT 0 NOT NULL,
	`win_rate` real DEFAULT 0 NOT NULL,
	`kd` real DEFAULT 0 NOT NULL,
	`average_score` real DEFAULT 0 NOT NULL,
	`average_damage` real DEFAULT 0 NOT NULL,
	`superstring_power` real DEFAULT 0 NOT NULL,
	`last_game_at` integer,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	PRIMARY KEY(`player_id`, `character_id`),
	FOREIGN KEY (`player_id`) REFERENCES `player`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`character_id`) REFERENCES `character`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_pcs_player` ON `player_character_stats` (`player_id`);--> statement-breakpoint
CREATE INDEX `idx_pcs_character` ON `player_character_stats` (`character_id`);--> statement-breakpoint
CREATE INDEX `idx_pcs_player_total_games` ON `player_character_stats` (`player_id`,`total_games`,`superstring_power`,`total_wins`);--> statement-breakpoint
CREATE TABLE `player_character_stats_history` (
	`id` text PRIMARY KEY NOT NULL,
	`player_id` text NOT NULL,
	`character_id` text NOT NULL,
	`total_games` integer NOT NULL,
	`total_wins` integer NOT NULL,
	`total_losses` integer NOT NULL,
	`total_kills` integer NOT NULL,
	`total_deaths` integer NOT NULL,
	`total_assists` integer NOT NULL,
	`total_knocks` integer NOT NULL,
	`total_score` integer NOT NULL,
	`total_damage` integer NOT NULL,
	`win_rate` real NOT NULL,
	`kd` real NOT NULL,
	`average_score` real NOT NULL,
	`average_damage` real NOT NULL,
	`superstring_power` real NOT NULL,
	`snapshot_date` integer NOT NULL,
	`reason` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`player_id`) REFERENCES `player`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`character_id`) REFERENCES `character`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_pcsh_player` ON `player_character_stats_history` (`player_id`);--> statement-breakpoint
CREATE INDEX `idx_pcsh_character` ON `player_character_stats_history` (`character_id`);--> statement-breakpoint
CREATE INDEX `idx_pcsh_snapshot` ON `player_character_stats_history` (`snapshot_date`);--> statement-breakpoint
CREATE INDEX `idx_pcsh_player_character` ON `player_character_stats_history` (`player_id`,`character_id`);--> statement-breakpoint
CREATE INDEX `idx_pcsh_player_snapshot` ON `player_character_stats_history` (`player_id`,`snapshot_date`);--> statement-breakpoint
CREATE TABLE `player_stats` (
	`player_id` text PRIMARY KEY NOT NULL,
	`total_games` integer DEFAULT 0 NOT NULL,
	`total_wins` integer DEFAULT 0 NOT NULL,
	`total_losses` integer DEFAULT 0 NOT NULL,
	`total_kills` integer DEFAULT 0 NOT NULL,
	`total_deaths` integer DEFAULT 0 NOT NULL,
	`total_assists` integer DEFAULT 0 NOT NULL,
	`total_knocks` integer DEFAULT 0 NOT NULL,
	`total_score` integer DEFAULT 0 NOT NULL,
	`total_damage` integer DEFAULT 0 NOT NULL,
	`win_rate` real DEFAULT 0 NOT NULL,
	`kd` real DEFAULT 0 NOT NULL,
	`average_score` real DEFAULT 0 NOT NULL,
	`average_damage` real DEFAULT 0 NOT NULL,
	`player_rating` real DEFAULT 0 NOT NULL,
	`events_count` integer DEFAULT 0 NOT NULL,
	`last_game_at` integer,
	`last_event_at` integer,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`player_id`) REFERENCES `player`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `player_stats_history` (
	`id` text PRIMARY KEY NOT NULL,
	`player_id` text NOT NULL,
	`total_games` integer NOT NULL,
	`total_wins` integer NOT NULL,
	`total_losses` integer NOT NULL,
	`total_kills` integer NOT NULL,
	`total_deaths` integer NOT NULL,
	`total_assists` integer NOT NULL,
	`total_knocks` integer NOT NULL,
	`total_score` integer NOT NULL,
	`total_damage` integer NOT NULL,
	`win_rate` real NOT NULL,
	`kd` real NOT NULL,
	`average_score` real NOT NULL,
	`average_damage` real NOT NULL,
	`player_rating` real NOT NULL,
	`events_count` integer NOT NULL,
	`snapshot_date` integer NOT NULL,
	`reason` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`player_id`) REFERENCES `player`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_psh_player` ON `player_stats_history` (`player_id`);--> statement-breakpoint
CREATE INDEX `idx_psh_snapshot` ON `player_stats_history` (`snapshot_date`);--> statement-breakpoint
CREATE INDEX `idx_psh_player_snapshot` ON `player_stats_history` (`player_id`,`snapshot_date`);--> statement-breakpoint
CREATE TABLE `edit_history` (
	`id` text PRIMARY KEY NOT NULL,
	`table_name` text NOT NULL,
	`record_id` text NOT NULL,
	`field_name` text NOT NULL,
	`old_value` text,
	`new_value` text,
	`edited_by` text NOT NULL,
	`edited_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`edited_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_eh_table` ON `edit_history` (`table_name`);--> statement-breakpoint
CREATE INDEX `idx_eh_record` ON `edit_history` (`record_id`);--> statement-breakpoint
CREATE INDEX `idx_eh_edited_by` ON `edit_history` (`edited_by`);--> statement-breakpoint
CREATE INDEX `idx_eh_edited_at` ON `edit_history` (`edited_at`);--> statement-breakpoint
CREATE INDEX `idx_eh_table_record` ON `edit_history` (`table_name`,`record_id`);--> statement-breakpoint
CREATE INDEX `idx_eh_table_edited_at` ON `edit_history` (`table_name`,`edited_at`);--> statement-breakpoint
CREATE TABLE `community_tag` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`value` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_ct_category` ON `community_tag` (`category`);--> statement-breakpoint
CREATE INDEX `idx_ct_category_value` ON `community_tag` (`category`,`value`);--> statement-breakpoint
CREATE TABLE `discord_server` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`url` text NOT NULL,
	`icon` text NOT NULL,
	`description` text NOT NULL,
	`additional_link_text` text,
	`additional_link_url` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `discord_server_tag` (
	`server_id` text NOT NULL,
	`tag_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	PRIMARY KEY(`server_id`, `tag_id`),
	FOREIGN KEY (`server_id`) REFERENCES `discord_server`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tag_id`) REFERENCES `community_tag`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_dst_server` ON `discord_server_tag` (`server_id`);--> statement-breakpoint
CREATE INDEX `idx_dst_tag` ON `discord_server_tag` (`tag_id`);