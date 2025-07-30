import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { user } from './user';

export const passwordResetToken = sqliteTable('password_reset_token', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	token: text('token').notNull().unique(),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

export type PasswordResetToken = typeof passwordResetToken.$inferSelect;
export type NewPasswordResetToken = typeof passwordResetToken.$inferInsert;
