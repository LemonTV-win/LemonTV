import { relations, sql } from 'drizzle-orm';
import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { organizer } from './organizer';
import { team } from './team';
import { player } from './player';
import { playerStats } from './player-stats';

export const event = sqliteTable('event', {
	id: text('id').primaryKey(),
	slug: text('slug').notNull().unique(),
	name: text('name').notNull(),
	official: integer('official', { mode: 'boolean' }).notNull(),
	server: text('server').notNull(),
	format: text('format').notNull(),
	region: text('region').notNull(),
	image: text('image').notNull(),
	status: text('status')
		.$type<'upcoming' | 'live' | 'finished' | 'cancelled' | 'postponed'>() //  'tba' | 'unknown' | 'hidden' | 'wip'
		.notNull(),
	capacity: integer('capacity').notNull(),
	// '2025-08-25' | '2025-08-25/2025-08-26'
	date: text('date')
		.$type<
			| `${string}-${string}-${string}`
			| `${string}-${string}-${string}/${string}-${string}-${string}`
		>()
		.notNull(),
	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.notNull()
		.default(sql`(unixepoch() * 1000)`),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
		.notNull()
		.default(sql`(unixepoch() * 1000)`)
});

export const eventOrganizer = sqliteTable(
	'event_organizer',
	{
		eventId: text('event_id')
			.references(() => event.id)
			.notNull(),
		organizerId: text('organizer_id')
			.references(() => organizer.id)
			.notNull(),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.notNull()
			.default(sql`(unixepoch() * 1000)`),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.notNull()
			.default(sql`(unixepoch() * 1000)`)
	},
	(t) => [primaryKey({ columns: [t.eventId, t.organizerId] })]
);

export const eventTeam = sqliteTable(
	'event_team',
	{
		eventId: text('event_id')
			.references(() => event.id, { onDelete: 'cascade', onUpdate: 'cascade' })
			.notNull(),
		teamId: text('team_id')
			.references(() => team.id, { onDelete: 'cascade', onUpdate: 'cascade' })
			.notNull(),
		entry: text('entry', {
			enum: [
				'open',
				'invited',
				'qualified',
				'host',
				'defending_champion',
				'regional_slot',
				'exhibition',
				'wildcard'
			]
		})
			.notNull()
			.default('open'),
		status: text('status', {
			enum: [
				'active', // unmarked
				'disqualified', // disqualified due to violation,
				'withdrawn', // withdrew from the event due to player absence, etc.
				'eliminated' // eliminated from from Knockout Stage / Playoffs
			]
		})
			.notNull()
			.default('active'),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.notNull()
			.default(sql`(unixepoch() * 1000)`),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
	},
	(t) => [primaryKey({ columns: [t.eventId, t.teamId] })]
);

export const eventTeamPlayer = sqliteTable(
	'event_team_player',
	{
		eventId: text('event_id')
			.references(() => event.id)
			.notNull(),
		teamId: text('team_id')
			.references(() => team.id)
			.notNull(),
		playerId: text('player_id')
			.references(() => player.id)
			.notNull(),
		role: text('role', { enum: ['main', 'sub', 'coach'] }).notNull(),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.notNull()
			.default(sql`(unixepoch() * 1000)`),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
	},
	(t) => [primaryKey({ columns: [t.eventId, t.teamId, t.playerId] })]
);

export const eventResult = sqliteTable('event_result', {
	id: text('id').primaryKey(),
	eventId: text('event_id')
		.references(() => event.id)
		.notNull(),
	teamId: text('team_id')
		.references(() => team.id)
		.notNull(),
	rank: integer('rank').notNull(),
	rankTo: integer('rank_to'),
	prizeAmount: integer('prize_amount'),
	prizeCurrency: text('prize_currency'),
	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.notNull()
		.default(sql`(unixepoch() * 1000)`),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
		.notNull()
		.default(sql`(unixepoch() * 1000)`)
});

export const eventWebsite = sqliteTable('event_website', {
	id: text('id').primaryKey(),
	eventId: text('event_id')
		.references(() => event.id)
		.notNull(),
	url: text('url').notNull(),
	label: text('label'),
	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.notNull()
		.default(sql`(unixepoch() * 1000)`),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
		.notNull()
		.default(sql`(unixepoch() * 1000)`)
});

export const eventVideo = sqliteTable('event_video', {
	id: text('id').primaryKey(),
	eventId: text('event_id')
		.references(() => event.id)
		.notNull(),
	type: text('type', { enum: ['stream', 'clip', 'vod'] }).notNull(),
	url: text('url').notNull(),
	platform: text('platform').notNull(),
	title: text('title'),
	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.notNull()
		.default(sql`(unixepoch() * 1000)`),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
		.notNull()
		.default(sql`(unixepoch() * 1000)`)
});

export const eventCaster = sqliteTable(
	'event_caster',
	{
		eventId: text('event_id')
			.references(() => event.id)
			.notNull(),
		playerId: text('player_id')
			.references(() => player.id)
			.notNull(),
		role: text('role', { enum: ['host', 'analyst', 'commentator'] }).notNull(),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.notNull()
			.default(sql`(unixepoch() * 1000)`),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.notNull()
			.default(sql`(unixepoch() * 1000)`)
	},
	(t) => [primaryKey({ columns: [t.eventId, t.playerId] })]
);

export type Event = typeof event.$inferSelect;
export type EventOrganizer = typeof eventOrganizer.$inferSelect;
export type EventTeamPlayer = typeof eventTeamPlayer.$inferSelect;
export type EventResult = typeof eventResult.$inferSelect;
export type EventWebsite = typeof eventWebsite.$inferSelect;
export type EventVideo = typeof eventVideo.$inferSelect;
export type EventCaster = typeof eventCaster.$inferSelect;

// Add relations for eventTeamPlayer
export const eventTeamPlayerRelations = relations(eventTeamPlayer, ({ one }) => ({
	event: one(event, {
		fields: [eventTeamPlayer.eventId],
		references: [event.id]
	}),
	team: one(team, {
		fields: [eventTeamPlayer.teamId],
		references: [team.id]
	}),
	player: one(player, {
		fields: [eventTeamPlayer.playerId],
		references: [player.id]
	}),
	playerStats: one(playerStats, {
		relationName: 'playerStatsEventParticipations',
		fields: [eventTeamPlayer.playerId],
		references: [playerStats.playerId]
	})
}));
