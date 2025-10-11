import { relations, sql } from 'drizzle-orm';
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { player } from './player';

export const mouseSettings = sqliteTable('player_mouse_settings', {
	playerId: text('player_id')
		.primaryKey()
		.references(() => player.id),

	dpi: integer('dpi'),
	sensitivity: real('sensitivity'),
	pollingRateHz: integer('polling_rate_hz'),
	windowsPointerSpeed: integer('windows_pointer_speed'),
	mouseSmoothing: integer('mouse_smoothing', { mode: 'boolean' }),
	mouseModel: text('mouse_model'),

	verticalSensMultiplier: real('vertical_sens_multiplier'),
	shoulderFireSensMultiplier: real('shoulder_fire_sens_multiplier'),
	adsSens1_25x: real('ads_sens_1_25x'),
	adsSens1_5x: real('ads_sens_1_5x'),
	adsSens2_5x: real('ads_sens_2_5x'),
	adsSens4_0x: real('ads_sens_4_0x'),

	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.notNull()
		.default(sql`(unixepoch() * 1000)`),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
		.notNull()
		.default(sql`(unixepoch() * 1000)`)
});

export type ProSettings = typeof mouseSettings.$inferSelect;

export const proSettingsRelations = relations(mouseSettings, ({ one }) => ({
	player: one(player, {
		fields: [mouseSettings.playerId],
		references: [player.id]
	})
}));
