import * as schema from '$lib/server/db/schema';
import { db } from '$lib/server/db';
import { randomUUID } from 'node:crypto';

export async function seed() {
	console.log('[SEED] Starting seeding...');

	// Clear only game-related tables, preserving user data
	console.log('[SEED] Clearing existing game data...');
	await db.delete(schema.player_social_account);
	await db.delete(schema.gameAccount);
	await db.delete(schema.teamPlayer);
	await db.delete(schema.teamAlias);
	await db.delete(schema.teams);
	await db.delete(schema.playerAlias);
	await db.delete(schema.player);
	// Preserve user-related tables: user, role, userRole, session, editHistory

	const firstUser = await db.select().from(schema.user).limit(1);

	console.log('[SEED] Seeding players...');
	const PLAYERS = [
		{
			id: randomUUID(),
			name: 'Player 1',
			slug: 'player-1',
			nationality: 'US',
			userId: firstUser ? firstUser[0].id : null
		},
		{
			id: randomUUID(),
			name: 'Player 2',
			slug: 'player-2',
			nationality: 'US'
		},
		{
			id: randomUUID(),
			name: 'Player 3',
			slug: 'player-3',
			nationality: 'US'
		}
	];
	await db.insert(schema.player).values(PLAYERS);

	console.log('[SEED] Seeding teams...');
	const team1_id = randomUUID();
	await db.insert(schema.teams).values([
		{
			id: team1_id,
			name: 'Team 1',
			slug: 'team-1',
			abbr: 'T1',
			logo: 'https://picsum.photos/seed/team-1/256/256?blur',
			region: 'NA',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		}
	]);
	await db.insert(schema.teamPlayer).values([
		{
			id: 2,
			teamId: team1_id,
			playerId: PLAYERS[0].id,
			role: 'active'
		},
		{
			id: 3,
			teamId: team1_id,
			playerId: PLAYERS[1].id,
			role: 'active'
		}
	]);

	console.log('[SEED] Seeding events...');
	// const events = await db.query.event.findMany();
	// console.log(events);

	console.log('[SEED] Seeding sources...');
	// const sources = await db.query.source.findMany();
	// console.log(sources);
}
