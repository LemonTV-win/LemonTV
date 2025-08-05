import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import type { GameMap } from '$lib/data/game';
export const map = sqliteTable('map', {
	id: text('id').$type<GameMap>().primaryKey()
});

export type Map = typeof map.$inferSelect;
