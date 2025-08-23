import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, check, index } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { event } from './event';
import { match } from './match';

export const stage = sqliteTable(
	'event_stage',
	{
		id: integer('id').primaryKey(),
		eventId: text('event_id')
			.references(() => event.id)
			.notNull(),
		title: text('title').notNull(),
		stage: text('stage').notNull(),
		format: text('format').notNull(),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.notNull()
			.default(sql`(unixepoch() * 1000)`),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.notNull()
			.default(sql`(unixepoch() * 1000)`)
	},
	(t) => [
		check('stage', sql`${t.stage} IN ('group', 'qualifier', 'showmatch', 'playoff')`),
		check('format', sql`${t.format} IN ('single', 'double', 'swiss', 'round-robin')`),
		index('idx_stage_event').on(t.eventId)
	]
);

export const stageRound = sqliteTable('stage_round', {
	id: integer('id').primaryKey(),
	stageId: integer('stage_id')
		.references(() => stage.id)
		.notNull(),
	type: text('type', {
		enum: [
			'round',
			'quarterfinals',
			'semifinals',
			'final',
			'top16',
			'group',
			'thirdplace',
			'lower',
			'grandfinal'
		]
	}).notNull(),
	title: text('title'),
	bracket: text('bracket', {
		enum: ['upper', 'lower', 'group']
	}),
	parallelGroup: integer('parallel_group'),
	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.notNull()
		.default(sql`(unixepoch() * 1000)`),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
		.notNull()
		.default(sql`(unixepoch() * 1000)`)
});

export const stageNode = sqliteTable('stage_node', {
	id: integer('id').primaryKey(),
	stageId: integer('stage_id')
		.references(() => stage.id)
		.notNull(),
	matchId: text('match_id')
		.references(() => match.id)
		.notNull(),
	roundId: integer('round_id')
		.references(() => stageRound.id)
		.notNull(),
	order: integer('order').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.notNull()
		.default(sql`(unixepoch() * 1000)`),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
		.notNull()
		.default(sql`(unixepoch() * 1000)`)
});

export const stageNodeDependency = sqliteTable('stage_node_dependency', {
	id: integer('id').primaryKey(),
	nodeId: integer('node_id')
		.references(() => stageNode.id)
		.notNull(),
	dependencyMatchId: text('dependency_match_id')
		.references(() => match.id)
		.notNull(),
	outcome: text('outcome', { enum: ['winner', 'loser'] }).notNull(),
	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.notNull()
		.default(sql`(unixepoch() * 1000)`),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
		.notNull()
		.default(sql`(unixepoch() * 1000)`)
});

export type Stage = typeof stage.$inferSelect;
export type StageRound = typeof stageRound.$inferSelect;
export type StageNode = typeof stageNode.$inferSelect;
export type StageNodeDependency = typeof stageNodeDependency.$inferSelect;

// #region Relations
export const stageRelations = relations(stage, ({ one, many }) => ({
	event: one(event, {
		fields: [stage.eventId],
		references: [event.id]
	}),
	matches: many(match),
	rounds: many(stageRound),
	nodes: many(stageNode)
}));

export const stageRoundRelations = relations(stageRound, ({ one, many }) => ({
	stage: one(stage, {
		fields: [stageRound.stageId],
		references: [stage.id]
	}),
	nodes: many(stageNode)
}));

export const stageNodeRelations = relations(stageNode, ({ one, many }) => ({
	stage: one(stage, {
		fields: [stageNode.stageId],
		references: [stage.id]
	}),
	match: one(match, {
		fields: [stageNode.matchId],
		references: [match.id]
	}),
	round: one(stageRound, {
		fields: [stageNode.roundId],
		references: [stageRound.id]
	}),
	dependencies: many(stageNodeDependency)
}));

export const stageNodeDependencyRelations = relations(stageNodeDependency, ({ one }) => ({
	node: one(stageNode, {
		fields: [stageNodeDependency.nodeId],
		references: [stageNode.id]
	}),
	dependencyMatch: one(match, {
		fields: [stageNodeDependency.dependencyMatchId],
		references: [match.id]
	})
}));
// #endregion
