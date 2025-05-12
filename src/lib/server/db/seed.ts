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
	await db.delete(schema.event);
	// Preserve user-related tables: user, role, userRole, session, editHistory

	const firstUser = await db.select().from(schema.user).limit(1);

	console.log('[SEED] Seeding players...');
	const PLAYERS = [
		{
			id: randomUUID(),
			name: 'Player 1',
			slug: 'player-1',
			nationality: 'US',
			userId: firstUser.length > 0 ? firstUser[0].id : null
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
	await db.insert(schema.event).values([
		{
			id: randomUUID(),
			slug: 'imaginary-cup-1',
			name: 'Imaginary Cup 1',
			official: false,
			server: 'strinova',
			format: 'online',
			region: 'Global',
			image: 'https://picsum.photos/seed/imaginary-cup-1/300/200?blur',
			status: 'finished',
			capacity: 16,
			date: '2024-01-01'
		},
		{
			id: randomUUID(),
			slug: 'imaginary-cup-2',
			name: 'Imaginary Cup 2',
			official: true,
			server: 'calabiyau',
			format: 'lan',
			region: 'EU',
			image: 'https://picsum.photos/seed/imaginary-cup-2/300/200?blur',
			status: 'live',
			capacity: 32,
			date: '2024-03-15'
		},
		{
			id: randomUUID(),
			slug: 'imaginary-cup-3',
			name: 'Imaginary Cup 3',
			official: true,
			server: 'strinova',
			format: 'hybrid',
			region: 'APAC',
			image: 'https://picsum.photos/seed/imaginary-cup-3/300/200?blur',
			status: 'upcoming',
			capacity: 64,
			date: '2024-06-01'
		},
		{
			id: randomUUID(),
			slug: 'imaginary-cup-4',
			name: 'Imaginary Cup 4',
			official: false,
			server: 'calabiyau',
			format: 'online',
			region: 'NA',
			image: 'https://picsum.photos/seed/imaginary-cup-4/300/200?blur',
			status: 'postponed',
			capacity: 24,
			date: '2024-04-20'
		},
		{
			id: randomUUID(),
			slug: 'imaginary-cup-5',
			name: 'Imaginary Cup 5',
			official: true,
			server: 'strinova',
			format: 'lan',
			region: 'CN',
			image: 'https://picsum.photos/seed/imaginary-cup-5/300/200?blur',
			status: 'cancelled',
			capacity: 48,
			date: '2024-05-10'
		},
		{
			id: randomUUID(),
			slug: 'imaginary-cup-6',
			name: 'Imaginary Cup 6',
			official: false,
			server: 'calabiyau',
			format: 'hybrid',
			region: 'SA',
			image: 'https://picsum.photos/seed/imaginary-cup-6/300/200?blur',
			status: 'upcoming',
			capacity: 16,
			date: '2024-07-01'
		},
		{
			id: randomUUID(),
			slug: 'imaginary-cup-7',
			name: 'Imaginary Cup 7',
			official: true,
			server: 'strinova',
			format: 'online',
			region: 'OC',
			image: 'https://picsum.photos/seed/imaginary-cup-7/300/200?blur',
			status: 'upcoming',
			capacity: 32,
			date: '2024-08-15'
		},
		{
			id: randomUUID(),
			slug: 'imaginary-cup-8',
			name: 'Imaginary Cup 8',
			official: false,
			server: 'calabiyau',
			format: 'lan',
			region: 'AF',
			image: 'https://picsum.photos/seed/imaginary-cup-8/300/200?blur',
			status: 'upcoming',
			capacity: 24,
			date: '2024-09-01'
		}
	]);

	console.log('[SEED] Seeding sources...');
	// const sources = await db.query.source.findMany();
	// console.log(sources);
}
