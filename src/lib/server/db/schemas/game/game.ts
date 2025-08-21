import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import type { GameMap } from '$lib/data/game';
import { matchMap } from './match';
import { game } from './match';

export const map = sqliteTable('map', {
	id: text('id').$type<GameMap>().primaryKey()
});

export type Map = typeof map.$inferSelect;

// #region Relations
export const mapRelations = relations(map, ({ many }) => ({
	matchMaps: many(matchMap),
	games: many(game)
}));
// #endregion
