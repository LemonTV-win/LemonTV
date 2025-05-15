import * as schema from '$lib/server/db/schema';
import { db } from '$lib/server/db';
import { randomUUID } from 'node:crypto';

export async function seed() {
	console.log('[SEED] Starting seeding...');

	// Clear only game-related tables, preserving user data
	console.log('[SEED] Clearing existing game data...');
	// Delete child records first
	await db.delete(schema.player_social_account);
	await db.delete(schema.gameAccount);
	await db.delete(schema.teamPlayer);
	await db.delete(schema.teamAlias);
	await db.delete(schema.playerAlias);
	await db.delete(schema.eventOrganizer);
	// Then delete parent records
	await db.delete(schema.teams);
	await db.delete(schema.player);
	await db.delete(schema.stage);
	await db.delete(schema.match);
	await db.delete(schema.event);
	await db.delete(schema.organizer);
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

	console.log('[SEED] Seeding organizers...');
	const ORGANIZERS = [
		{
			id: randomUUID(),
			slug: 'organizer-1',
			name: 'Organizer 1',
			logo: 'https://picsum.photos/seed/organizer-1/256/256?blur',
			description: 'Organizer 1 description',
			url: 'https://organizer-1.com',
			createdAt: new Date(),
			updatedAt: new Date()
		},
		{
			id: randomUUID(),
			slug: 'organizer-2',
			name: 'Organizer 2',
			logo: 'https://picsum.photos/seed/organizer-2/256/256?blur',
			description: 'Organizer 2 description',
			url: 'https://organizer-2.com',
			createdAt: new Date(),
			updatedAt: new Date()
		},
		{
			id: randomUUID(),
			slug: 'organizer-3',
			name: 'Organizer 3',
			logo: 'https://picsum.photos/seed/organizer-3/256/256?blur',
			description: 'Organizer 3 description',
			url: 'https://organizer-3.com',
			createdAt: new Date(),
			updatedAt: new Date()
		}
	];
	await db.insert(schema.organizer).values(ORGANIZERS);

	console.log('[SEED] Seeding events...');
	const EVENTS = [
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
	];
	await db.insert(schema.event).values(EVENTS);

	console.log('[SEED] Seeding event organizers...');
	await db.insert(schema.eventOrganizer).values([
		{
			eventId: EVENTS[0].id,
			organizerId: ORGANIZERS[0].id
		},
		{
			eventId: EVENTS[1].id,
			organizerId: ORGANIZERS[0].id
		},
		{
			eventId: EVENTS[1].id,
			organizerId: ORGANIZERS[1].id
		},
		{
			eventId: EVENTS[2].id,
			organizerId: ORGANIZERS[1].id
		}
	]);

	console.log('[SEED] Seeding stages...');
	const STAGES = [
		// Event 1 - Full tournament structure
		{
			id: 1,
			eventId: EVENTS[0].id,
			title: 'Open Qualifiers',
			stage: 'qualifier',
			format: 'single'
		},
		{
			id: 2,
			eventId: EVENTS[0].id,
			title: 'Group Stage A',
			stage: 'group',
			format: 'round-robin'
		},
		{
			id: 3,
			eventId: EVENTS[0].id,
			title: 'Group Stage B',
			stage: 'group',
			format: 'round-robin'
		},
		{
			id: 4,
			eventId: EVENTS[0].id,
			title: 'Playoffs',
			stage: 'playoff',
			format: 'double'
		},
		// Event 2 - LAN tournament
		{
			id: 5,
			eventId: EVENTS[1].id,
			title: 'Swiss Stage',
			stage: 'group',
			format: 'swiss'
		},
		{
			id: 6,
			eventId: EVENTS[1].id,
			title: 'Quarter Finals',
			stage: 'playoff',
			format: 'single'
		},
		{
			id: 7,
			eventId: EVENTS[1].id,
			title: 'Semi Finals',
			stage: 'playoff',
			format: 'single'
		},
		{
			id: 8,
			eventId: EVENTS[1].id,
			title: 'Grand Finals',
			stage: 'playoff',
			format: 'single'
		},
		// Event 3 - Showmatch event
		{
			id: 9,
			eventId: EVENTS[2].id,
			title: 'Celebration Showmatch',
			stage: 'showmatch',
			format: 'single'
		},
		// Event 4 - Regional qualifier
		{
			id: 10,
			eventId: EVENTS[3].id,
			title: 'Regional Qualifier',
			stage: 'qualifier',
			format: 'double'
		},
		// Event 5 - Major tournament
		{
			id: 11,
			eventId: EVENTS[4].id,
			title: 'Group Stage',
			stage: 'group',
			format: 'swiss'
		},
		{
			id: 12,
			eventId: EVENTS[4].id,
			title: 'Playoffs',
			stage: 'playoff',
			format: 'double'
		}
	];
	await db.insert(schema.stage).values(STAGES);

	console.log('[SEED] Seeding matches...');
	const MATCHES = [
		// Qualifier matches
		{
			id: randomUUID(),
			format: 'BO1',
			stageId: STAGES[0].id
		},
		{
			id: randomUUID(),
			format: 'BO1',
			stageId: STAGES[0].id
		},
		// Group Stage A matches
		{
			id: randomUUID(),
			format: 'BO3',
			stageId: STAGES[1].id
		},
		{
			id: randomUUID(),
			format: 'BO3',
			stageId: STAGES[1].id
		},
		// Group Stage B matches
		{
			id: randomUUID(),
			format: 'BO3',
			stageId: STAGES[2].id
		},
		{
			id: randomUUID(),
			format: 'BO3',
			stageId: STAGES[2].id
		},
		// Playoff matches
		{
			id: randomUUID(),
			format: 'BO5',
			stageId: STAGES[3].id
		},
		// Swiss Stage matches
		{
			id: randomUUID(),
			format: 'BO3',
			stageId: STAGES[4].id
		},
		{
			id: randomUUID(),
			format: 'BO3',
			stageId: STAGES[4].id
		},
		// Quarter Finals
		{
			id: randomUUID(),
			format: 'BO3',
			stageId: STAGES[5].id
		},
		// Semi Finals
		{
			id: randomUUID(),
			format: 'BO5',
			stageId: STAGES[6].id
		},
		// Grand Finals
		{
			id: randomUUID(),
			format: 'BO5',
			stageId: STAGES[7].id
		},
		// Showmatch
		{
			id: randomUUID(),
			format: 'BO1',
			stageId: STAGES[8].id
		},
		// Regional Qualifier
		{
			id: randomUUID(),
			format: 'BO3',
			stageId: STAGES[9].id
		},
		{
			id: randomUUID(),
			format: 'BO3',
			stageId: STAGES[9].id
		},
		// Major Group Stage
		{
			id: randomUUID(),
			format: 'BO3',
			stageId: STAGES[10].id
		},
		{
			id: randomUUID(),
			format: 'BO3',
			stageId: STAGES[10].id
		},
		// Major Playoffs
		{
			id: randomUUID(),
			format: 'BO5',
			stageId: STAGES[11].id
		}
	];
	await db.insert(schema.match).values(MATCHES);

	console.log('[SEED] Seeding sources...');
	// const sources = await db.query.source.findMany();
	// console.log(sources);
}
