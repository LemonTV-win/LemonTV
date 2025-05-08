import { sql } from 'drizzle-orm';
import { db } from '.';
import * as schema from './schema';

const REQUIRED_ROLES = [
	{ id: 'admin', name: 'Administrator' }, // Has access to all features
	{ id: 'editor', name: 'Editor' } // Has access to all features except for user management
];

export async function syncRoles() {
	await db.insert(schema.role).values(REQUIRED_ROLES).onConflictDoNothing();
}

const SOCIAL_PLATFORMS = [
	{ id: 'twitter', name: 'Twitter', url_template: 'https://x.com/{accountId}' },
	{ id: 'twitch', name: 'Twitch', url_template: 'https://twitch.tv/{accountId}' },
	{ id: 'youtube', name: 'YouTube', url_template: 'https://youtube.com/{accountId}' },
	{ id: 'bilibili', name: 'Bilibili', url_template: 'https://space.bilibili.com/{accountId}' },
	{ id: 'instagram', name: 'Instagram', url_template: 'https://instagram.com/{accountId}' }
];

export async function syncSocialPlatforms() {
	await db
		.insert(schema.social_platform)
		.values(SOCIAL_PLATFORMS)
		.onConflictDoUpdate({
			target: [schema.social_platform.id],
			set: { name: sql`excluded.name`, url_template: sql`excluded.url_template` }
		});
}
