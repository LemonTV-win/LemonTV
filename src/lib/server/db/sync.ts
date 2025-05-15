import { sql } from 'drizzle-orm';
import { db } from '.';
import * as schema from './schema';

const REQUIRED_ROLES = [
	{ id: 'admin', name: 'Administrator' }, // Has access to all features
	{ id: 'editor', name: 'Editor' } // Has access to all features except for user management
];

async function syncRoles() {
	await db.insert(schema.role).values(REQUIRED_ROLES).onConflictDoNothing();
}

const SOCIAL_PLATFORMS = [
	{ id: 'twitter', name: 'Twitter', url_template: 'https://x.com/{accountId}' },
	{ id: 'twitch', name: 'Twitch', url_template: 'https://twitch.tv/{accountId}' },
	{ id: 'youtube', name: 'YouTube', url_template: 'https://youtube.com/{accountId}' },
	{ id: 'bilibili', name: 'Bilibili', url_template: 'https://space.bilibili.com/{accountId}' },
	{ id: 'instagram', name: 'Instagram', url_template: 'https://instagram.com/{accountId}' },
	{ id: 'tiktok', name: 'TikTok', url_template: 'https://tiktok.com/@{accountId}' },
	{ id: 'discord', name: 'Discord', url_template: 'https://discord.gg/{accountId}' },
	{ id: 'homepage', name: 'Homepage', url_template: null },
	{ id: 'facebook', name: 'Facebook', url_template: 'https://facebook.com/{accountId}' },
	{ id: 'linkedin', name: 'LinkedIn', url_template: 'https://linkedin.com/in/{accountId}' },
	{ id: 'github', name: 'GitHub', url_template: 'https://github.com/{accountId}' },
	{ id: 'reddit', name: 'Reddit', url_template: 'https://reddit.com/u/{accountId}' }
];

async function syncSocialPlatforms() {
	await db
		.insert(schema.social_platform)
		.values(SOCIAL_PLATFORMS)
		.onConflictDoUpdate({
			target: [schema.social_platform.id],
			set: { name: sql`excluded.name`, url_template: sql`excluded.url_template` }
		});
}

const MAPS = [
	{ id: 'base_404' },
	{ id: 'area_88' },
	{ id: 'port_euler' },
	{ id: 'windy_town' },
	{ id: 'space_lab' },
	{ id: 'cauchy_district' },
	{ id: 'cosmite' },
	{ id: 'orcanus' }
];

async function syncMaps() {
	await db.insert(schema.map).values(MAPS).onConflictDoNothing();
}

export async function syncAll() {
	console.info('[Sync] Inserting required roles...');
	await syncRoles();
	console.info('[Sync] Inserting social platforms...');
	await syncSocialPlatforms();
	console.info('[Sync] Inserting maps...');
	await syncMaps();
}
