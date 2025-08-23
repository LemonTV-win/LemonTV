import { sqliteTable, text, index } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { player } from './player';

export const social_platform = sqliteTable('social_platform', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	url_template: text('url_template')
});

export const player_social_account = sqliteTable(
	'social_account',
	{
		id: text('id').primaryKey(),
		platformId: text('platform_id')
			.notNull()
			.references(() => social_platform.id),
		playerId: text('player_id')
			.notNull()
			.references(() => player.id),
		accountId: text('account_id').notNull(),
		overriding_url: text('overriding_url')
	},
	(t) => [
		index('idx_psa_platform').on(t.platformId),
		index('idx_psa_player').on(t.playerId),
		index('idx_psa_account').on(t.accountId)
	]
);

export type SocialPlatform = typeof social_platform.$inferSelect;
export type PlayerSocialAccount = typeof player_social_account.$inferSelect;

// Social platform relations
export const socialPlatformRelations = relations(social_platform, ({ many }) => ({
	playerAccounts: many(player_social_account)
}));

// Player social account relations
export const playerSocialAccountRelations = relations(player_social_account, ({ one }) => ({
	platform: one(social_platform, {
		fields: [player_social_account.platformId],
		references: [social_platform.id]
	}),
	player: one(player, {
		fields: [player_social_account.playerId],
		references: [player.id]
	})
}));
