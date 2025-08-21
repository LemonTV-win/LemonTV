import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import type { GameMap, Character as GameCharacter } from '$lib/data/game';
import { matchMap } from './match';
import { game } from './match';

// #region Maps
export const map = sqliteTable('map', {
	id: text('id').$type<GameMap>().primaryKey()
});

export type Map = typeof map.$inferSelect;

export const mapRelations = relations(map, ({ many }) => ({
	matchMaps: many(matchMap),
	games: many(game)
}));
// #endregion

// #region Characters
export const character = sqliteTable('character', {
	id: text('id').$type<GameCharacter>().primaryKey()
});

export type Character = typeof character.$inferSelect;
// #endregion
