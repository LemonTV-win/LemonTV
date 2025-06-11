import * as schema from '$lib/server/db/schema';
import { db } from '$lib/server/db';
import { randomUUID } from 'node:crypto';

export async function seed() {
	console.info('[SEED] Starting seeding...');

	// Clear only game-related tables, preserving user data
	console.info('[SEED] Clearing existing game data...');
	// Delete child records first
	await db.delete(schema.matchMap);
	console.info('[SEED] - Deleted matchMap');
	await db.delete(schema.matchTeam);
	console.info('[SEED] - Deleted matchTeam');
	await db.delete(schema.gamePlayerScore);
	console.info('[SEED] - Deleted gamePlayerScore');
	await db.delete(schema.gameTeam);
	console.info('[SEED] - Deleted gameTeam');
	await db.delete(schema.game);
	console.info('[SEED] - Deleted game');
	await db.delete(schema.eventTeamPlayer);
	console.info('[SEED] - Deleted eventTeamPlayer');
	await db.delete(schema.eventOrganizer);
	console.info('[SEED] - Deleted eventOrganizer');
	await db.delete(schema.eventResult);
	console.info('[SEED] - Deleted eventResult');
	await db.delete(schema.eventWebsite);
	console.info('[SEED] - Deleted eventWebsite');
	await db.delete(schema.teamPlayer);
	console.info('[SEED] - Deleted teamPlayer');
	await db.delete(schema.teamAlias);
	console.info('[SEED] - Deleted teamAlias');
	await db.delete(schema.playerAlias);
	console.info('[SEED] - Deleted playerAlias');
	await db.delete(schema.player_social_account);
	console.info('[SEED] - Deleted player_social_account');
	await db.delete(schema.gameAccount);
	console.info('[SEED] - Deleted gameAccount');
	await db.delete(schema.discordServerTag);
	console.info('[SEED] - Deleted discordServerTag');
	await db.delete(schema.discordServer);
	console.info('[SEED] - Deleted discordServer');
	// Delete match records before stages
	await db.delete(schema.match);
	console.info('[SEED] - Deleted match');
	// Delete stages before events
	await db.delete(schema.stage);
	console.info('[SEED] - Deleted stage');
	// Delete events before teams and organizers
	await db.delete(schema.event);
	console.info('[SEED] - Deleted event');
	// Delete teams and players
	await db.delete(schema.team);
	console.info('[SEED] - Deleted team');
	await db.delete(schema.player);
	console.info('[SEED] - Deleted player');
	// Delete organizers last
	await db.delete(schema.organizer);
	console.info('[SEED] - Deleted organizer');
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
		},
		{
			id: randomUUID(),
			name: 'Player 4',
			slug: 'player-4',
			nationality: 'KR'
		},
		{
			id: randomUUID(),
			name: 'Player 5',
			slug: 'player-5',
			nationality: 'EU'
		},
		{
			id: randomUUID(),
			name: 'Player 6',
			slug: 'player-6',
			nationality: 'CN'
		}
	];
	await db.insert(schema.player).values(PLAYERS);

	console.log('[SEED] Seeding teams...');
	const team1_id = randomUUID();
	const team2_id = randomUUID();
	const team3_id = randomUUID();
	const team4_id = randomUUID();
	await db.insert(schema.team).values([
		{
			id: team1_id,
			name: 'Team 1',
			slug: 'team-1',
			abbr: 'T1',
			logo: 'https://picsum.photos/seed/team-1/256/256?blur',
			region: 'NA',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		},
		{
			id: team2_id,
			name: 'Team 2',
			slug: 'team-2',
			abbr: 'T2',
			logo: 'https://picsum.photos/seed/team-2/256/256?blur',
			region: 'NA',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		},
		{
			id: team3_id,
			name: 'Team 3',
			slug: 'team-3',
			abbr: 'T3',
			logo: 'https://picsum.photos/seed/team-3/256/256?blur',
			region: 'EU',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		},
		{
			id: team4_id,
			name: 'Team 4',
			slug: 'team-4',
			abbr: 'T4',
			logo: 'https://picsum.photos/seed/team-4/256/256?blur',
			region: 'KR',
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
		},
		{
			id: 4,
			teamId: team2_id,
			playerId: PLAYERS[2].id,
			role: 'active'
		},
		{
			id: 5,
			teamId: team2_id,
			playerId: PLAYERS[3].id,
			role: 'active'
		},
		{
			id: 6,
			teamId: team3_id,
			playerId: PLAYERS[4].id,
			role: 'active'
		},
		{
			id: 7,
			teamId: team4_id,
			playerId: PLAYERS[5].id,
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
			type: 'organization',
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
			type: 'tournament_series',
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
			type: 'community',
			createdAt: new Date(),
			updatedAt: new Date()
		},
		{
			id: randomUUID(),
			slug: 'organizer-4',
			name: 'Organizer 4',
			logo: 'https://picsum.photos/seed/organizer-4/256/256?blur',
			description: 'Organizer 4 description',
			url: 'https://organizer-4.com',
			type: 'individual',
			createdAt: new Date(),
			updatedAt: new Date()
		},
		{
			id: randomUUID(),
			slug: 'organizer-5',
			name: 'Organizer 5',
			logo: 'https://picsum.photos/seed/organizer-5/256/256?blur',
			description: 'Organizer 5 description',
			url: 'https://organizer-5.com',
			type: 'league',
			createdAt: new Date(),
			updatedAt: new Date()
		},
		{
			id: randomUUID(),
			slug: 'organizer-6',
			name: 'Organizer 6',
			logo: 'https://picsum.photos/seed/organizer-6/256/256?blur',
			description: 'Organizer 6 description',
			url: 'https://organizer-6.com',
			type: 'tournament_series',
			createdAt: new Date(),
			updatedAt: new Date()
		},
		{
			id: randomUUID(),
			slug: 'organizer-7',
			name: 'Organizer 7',
			logo: 'https://picsum.photos/seed/organizer-7/256/256?blur',
			description: 'Organizer 7 description',
			url: 'https://organizer-7.com',
			type: 'community',
			createdAt: new Date(),
			updatedAt: new Date()
		},
		{
			id: randomUUID(),
			slug: 'organizer-8',
			name: 'Organizer 8',
			logo: 'https://picsum.photos/seed/organizer-8/256/256?blur',
			description: 'Organizer 8 description',
			url: 'https://organizer-8.com',
			type: null,
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

	console.log('[SEED] Seeding event websites...');
	await db.insert(schema.eventWebsite).values([
		// Event 1 websites
		{
			id: randomUUID(),
			eventId: EVENTS[0].id,
			url: 'https://imaginary-cup-1.com',
			label: 'Official Website'
		},
		{
			id: randomUUID(),
			eventId: EVENTS[0].id,
			url: 'https://twitch.tv/imaginary-cup-1',
			label: 'Stream'
		},
		// Event 2 websites
		{
			id: randomUUID(),
			eventId: EVENTS[1].id,
			url: 'https://imaginary-cup-2.com',
			label: 'Official Website'
		},
		{
			id: randomUUID(),
			eventId: EVENTS[1].id,
			url: 'https://youtube.com/imaginary-cup-2',
			label: 'Stream'
		},
		{
			id: randomUUID(),
			eventId: EVENTS[1].id,
			url: 'https://imaginary-cup-2.com/register',
			label: 'Registration'
		},
		// Event 3 websites
		{
			id: randomUUID(),
			eventId: EVENTS[2].id,
			url: 'https://imaginary-cup-3.com',
			label: 'Official Website'
		},
		{
			id: randomUUID(),
			eventId: EVENTS[2].id,
			url: 'https://twitter.com/imaginary-cup-3',
			label: 'Social Media'
		},
		// Event 4 websites
		{
			id: randomUUID(),
			eventId: EVENTS[3].id,
			url: 'https://imaginary-cup-4.com',
			label: 'Official Website'
		},
		// Event 5 websites
		{
			id: randomUUID(),
			eventId: EVENTS[4].id,
			url: 'https://imaginary-cup-5.com',
			label: 'Official Website'
		},
		{
			id: randomUUID(),
			eventId: EVENTS[4].id,
			url: 'https://imaginary-cup-5.com/brackets',
			label: 'Brackets'
		},
		// Event 6 websites
		{
			id: randomUUID(),
			eventId: EVENTS[5].id,
			url: 'https://imaginary-cup-6.com',
			label: 'Official Website'
		},
		// Event 7 websites
		{
			id: randomUUID(),
			eventId: EVENTS[6].id,
			url: 'https://imaginary-cup-7.com',
			label: 'Official Website'
		},
		{
			id: randomUUID(),
			eventId: EVENTS[6].id,
			url: 'https://discord.gg/imaginary-cup-7',
			label: 'Discord'
		},
		// Event 8 websites
		{
			id: randomUUID(),
			eventId: EVENTS[7].id,
			url: 'https://imaginary-cup-8.com',
			label: 'Official Website'
		},
		{
			id: randomUUID(),
			eventId: EVENTS[7].id,
			url: 'https://imaginary-cup-8.com/rules',
			label: 'Rules'
		}
	]);

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

	console.log('[SEED] Seeding event team players...');
	await db.insert(schema.eventTeamPlayer).values([
		// Event 1 - Team 1 players
		{
			eventId: EVENTS[0].id,
			teamId: team1_id,
			playerId: PLAYERS[0].id,
			role: 'main'
		},
		{
			eventId: EVENTS[0].id,
			teamId: team1_id,
			playerId: PLAYERS[1].id,
			role: 'main'
		},
		{
			eventId: EVENTS[0].id,
			teamId: team1_id,
			playerId: PLAYERS[2].id,
			role: 'sub'
		},
		{
			eventId: EVENTS[0].id,
			teamId: team1_id,
			playerId: PLAYERS[3].id,
			role: 'coach'
		},
		// Event 1 - Team 2 players
		{
			eventId: EVENTS[0].id,
			teamId: team2_id,
			playerId: PLAYERS[2].id,
			role: 'main'
		},
		{
			eventId: EVENTS[0].id,
			teamId: team2_id,
			playerId: PLAYERS[3].id,
			role: 'main'
		},
		{
			eventId: EVENTS[0].id,
			teamId: team2_id,
			playerId: PLAYERS[4].id,
			role: 'sub'
		},
		{
			eventId: EVENTS[0].id,
			teamId: team2_id,
			playerId: PLAYERS[5].id,
			role: 'sub'
		},
		// Event 2 - Team 3 players
		{
			eventId: EVENTS[1].id,
			teamId: team3_id,
			playerId: PLAYERS[0].id,
			role: 'main'
		},
		{
			eventId: EVENTS[1].id,
			teamId: team3_id,
			playerId: PLAYERS[1].id,
			role: 'main'
		},
		{
			eventId: EVENTS[1].id,
			teamId: team3_id,
			playerId: PLAYERS[2].id,
			role: 'sub'
		},
		{
			eventId: EVENTS[1].id,
			teamId: team3_id,
			playerId: PLAYERS[3].id,
			role: 'coach'
		},
		// Event 2 - Team 4 players
		{
			eventId: EVENTS[1].id,
			teamId: team4_id,
			playerId: PLAYERS[4].id,
			role: 'main'
		},
		{
			eventId: EVENTS[1].id,
			teamId: team4_id,
			playerId: PLAYERS[5].id,
			role: 'main'
		},
		{
			eventId: EVENTS[1].id,
			teamId: team4_id,
			playerId: PLAYERS[0].id,
			role: 'sub'
		},
		// Event 3 - Team 1 players
		{
			eventId: EVENTS[2].id,
			teamId: team1_id,
			playerId: PLAYERS[1].id,
			role: 'main'
		},
		{
			eventId: EVENTS[2].id,
			teamId: team1_id,
			playerId: PLAYERS[2].id,
			role: 'main'
		},
		{
			eventId: EVENTS[2].id,
			teamId: team1_id,
			playerId: PLAYERS[3].id,
			role: 'sub'
		},
		{
			eventId: EVENTS[2].id,
			teamId: team1_id,
			playerId: PLAYERS[4].id,
			role: 'sub'
		},
		{
			eventId: EVENTS[2].id,
			teamId: team1_id,
			playerId: PLAYERS[5].id,
			role: 'coach'
		},
		// Event 3 - Team 2 players
		{
			eventId: EVENTS[2].id,
			teamId: team2_id,
			playerId: PLAYERS[0].id,
			role: 'main'
		},
		{
			eventId: EVENTS[2].id,
			teamId: team2_id,
			playerId: PLAYERS[1].id,
			role: 'main'
		},
		{
			eventId: EVENTS[2].id,
			teamId: team2_id,
			playerId: PLAYERS[2].id,
			role: 'sub'
		},
		{
			eventId: EVENTS[2].id,
			teamId: team2_id,
			playerId: PLAYERS[3].id,
			role: 'coach'
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

	console.log('[SEED] Seeding match teams...');
	await db.insert(schema.matchTeam).values([
		// Qualifier matches (BO1)
		{
			matchId: MATCHES[0].id,
			teamId: team1_id,
			position: 0,
			score: 1
		},
		{
			matchId: MATCHES[0].id,
			teamId: team2_id,
			position: 1,
			score: 0
		},
		// Group Stage A matches (BO3)
		{
			matchId: MATCHES[2].id,
			teamId: team1_id,
			position: 0,
			score: 2
		},
		{
			matchId: MATCHES[2].id,
			teamId: team3_id,
			position: 1,
			score: 1
		},
		// Group Stage B matches (BO3)
		{
			matchId: MATCHES[3].id,
			teamId: team2_id,
			position: 0,
			score: 2
		},
		{
			matchId: MATCHES[3].id,
			teamId: team4_id,
			position: 1,
			score: 0
		},
		// Playoff matches (BO5)
		{
			matchId: MATCHES[6].id,
			teamId: team1_id,
			position: 0,
			score: 3
		},
		{
			matchId: MATCHES[6].id,
			teamId: team2_id,
			position: 1,
			score: 2
		},
		// Swiss Stage matches (BO3)
		{
			matchId: MATCHES[7].id,
			teamId: team3_id,
			position: 0,
			score: 2
		},
		{
			matchId: MATCHES[7].id,
			teamId: team4_id,
			position: 1,
			score: 1
		},
		// Quarter Finals (BO3)
		{
			matchId: MATCHES[9].id,
			teamId: team1_id,
			position: 0,
			score: 2
		},
		{
			matchId: MATCHES[9].id,
			teamId: team3_id,
			position: 1,
			score: 0
		},
		// Semi Finals (BO5)
		{
			matchId: MATCHES[10].id,
			teamId: team2_id,
			position: 0,
			score: 3
		},
		{
			matchId: MATCHES[10].id,
			teamId: team4_id,
			position: 1,
			score: 1
		},
		// Grand Finals (BO5)
		{
			matchId: MATCHES[11].id,
			teamId: team1_id,
			position: 0,
			score: 3
		},
		{
			matchId: MATCHES[11].id,
			teamId: team2_id,
			position: 1,
			score: 2
		}
	]);

	console.log('[SEED] Seeding match maps...');
	await db.insert(schema.matchMap).values([
		// Grand Finals (BO5) - Match 11
		{
			id: 1,
			matchId: MATCHES[11].id,
			mapId: 'base_404',
			order: 0,
			side: 0,
			action: 'ban',
			map_picker_position: 0,
			side_picker_position: 1
		},
		{
			id: 2,
			matchId: MATCHES[11].id,
			mapId: 'area_88',
			order: 1,
			side: 1,
			action: 'ban',
			map_picker_position: 1,
			side_picker_position: 0
		},
		{
			id: 3,
			matchId: MATCHES[11].id,
			mapId: 'port_euler',
			order: 2,
			side: 0,
			action: 'pick',
			map_picker_position: 0,
			side_picker_position: 1
		},
		{
			id: 4,
			matchId: MATCHES[11].id,
			mapId: 'windy_town',
			order: 3,
			side: 1,
			action: 'pick',
			map_picker_position: 1,
			side_picker_position: 0
		},
		{
			id: 5,
			matchId: MATCHES[11].id,
			mapId: 'space_lab',
			order: 4,
			side: 0,
			action: 'pick',
			map_picker_position: 0,
			side_picker_position: 1
		},
		{
			id: 6,
			matchId: MATCHES[11].id,
			mapId: 'cauchy_district',
			order: 5,
			side: 1,
			action: 'pick',
			map_picker_position: 1,
			side_picker_position: 0
		},
		{
			id: 7,
			matchId: MATCHES[11].id,
			mapId: 'cosmite',
			order: 6,
			side: 0,
			action: 'decider',
			map_picker_position: 0,
			side_picker_position: 1
		},
		// Semi Finals (BO5) - Match 10
		{
			id: 8,
			matchId: MATCHES[10].id,
			mapId: 'cauchy_district',
			order: 0,
			side: 0,
			action: 'ban',
			map_picker_position: 0,
			side_picker_position: 1
		},
		{
			id: 9,
			matchId: MATCHES[10].id,
			mapId: 'cosmite',
			order: 1,
			side: 1,
			action: 'ban',
			map_picker_position: 1,
			side_picker_position: 0
		},
		{
			id: 10,
			matchId: MATCHES[10].id,
			mapId: 'orcanus',
			order: 2,
			side: 0,
			action: 'pick',
			map_picker_position: 0,
			side_picker_position: 1
		},
		{
			id: 11,
			matchId: MATCHES[10].id,
			mapId: 'base_404',
			order: 3,
			side: 1,
			action: 'pick',
			map_picker_position: 1,
			side_picker_position: 0
		},
		{
			id: 12,
			matchId: MATCHES[10].id,
			mapId: 'area_88',
			order: 4,
			side: 0,
			action: 'pick',
			map_picker_position: 0,
			side_picker_position: 1
		},
		{
			id: 13,
			matchId: MATCHES[10].id,
			mapId: 'windy_town',
			order: 5,
			side: 1,
			action: 'pick',
			map_picker_position: 1,
			side_picker_position: 0
		},
		{
			id: 14,
			matchId: MATCHES[10].id,
			mapId: 'space_lab',
			order: 6,
			side: 0,
			action: 'decider',
			map_picker_position: 0,
			side_picker_position: 1
		},
		// Quarter Finals (BO3) - Match 9
		{
			id: 15,
			matchId: MATCHES[9].id,
			mapId: 'port_euler',
			order: 0,
			side: 0,
			action: 'ban',
			map_picker_position: 0,
			side_picker_position: 1
		},
		{
			id: 16,
			matchId: MATCHES[9].id,
			mapId: 'windy_town',
			order: 1,
			side: 1,
			action: 'ban',
			map_picker_position: 1,
			side_picker_position: 0
		},
		{
			id: 17,
			matchId: MATCHES[9].id,
			mapId: 'space_lab',
			order: 2,
			side: 0,
			action: 'pick',
			map_picker_position: 0,
			side_picker_position: 1
		},
		{
			id: 18,
			matchId: MATCHES[9].id,
			mapId: 'cauchy_district',
			order: 3,
			side: 1,
			action: 'pick',
			map_picker_position: 1,
			side_picker_position: 0
		},
		{
			id: 19,
			matchId: MATCHES[9].id,
			mapId: 'cosmite',
			order: 4,
			side: 0,
			action: 'decider',
			map_picker_position: 0,
			side_picker_position: 1
		},
		// Group Stage A (BO3) - Match 2
		{
			id: 20,
			matchId: MATCHES[2].id,
			mapId: 'cauchy_district',
			order: 0,
			side: 0,
			action: 'set',
			map_picker_position: 0,
			side_picker_position: 1
		},
		{
			id: 21,
			matchId: MATCHES[2].id,
			mapId: 'cosmite',
			order: 1,
			side: 1,
			action: 'set',
			map_picker_position: 1,
			side_picker_position: 0
		},
		{
			id: 22,
			matchId: MATCHES[2].id,
			mapId: 'orcanus',
			order: 2,
			side: 0,
			action: 'set',
			map_picker_position: 0,
			side_picker_position: 1
		},
		// Group Stage B (BO3) - Match 3
		{
			id: 25,
			matchId: MATCHES[3].id,
			mapId: 'base_404',
			order: 0,
			side: 0,
			action: 'ban',
			map_picker_position: 0,
			side_picker_position: 1
		},
		{
			id: 26,
			matchId: MATCHES[3].id,
			mapId: 'area_88',
			order: 1,
			side: 1,
			action: 'ban',
			map_picker_position: 1,
			side_picker_position: 0
		},
		{
			id: 27,
			matchId: MATCHES[3].id,
			mapId: 'port_euler',
			order: 2,
			side: 0,
			action: 'pick',
			map_picker_position: 0,
			side_picker_position: 1
		},
		{
			id: 28,
			matchId: MATCHES[3].id,
			mapId: 'windy_town',
			order: 3,
			side: 1,
			action: 'pick',
			map_picker_position: 1,
			side_picker_position: 0
		},
		{
			id: 29,
			matchId: MATCHES[3].id,
			mapId: 'space_lab',
			order: 4,
			side: 0,
			action: 'decider',
			map_picker_position: 0,
			side_picker_position: 1
		},
		// Playoff (BO5) - Match 6
		{
			id: 30,
			matchId: MATCHES[6].id,
			mapId: 'windy_town',
			order: 0,
			side: 0,
			action: 'ban',
			map_picker_position: 0,
			side_picker_position: 1
		},
		{
			id: 31,
			matchId: MATCHES[6].id,
			mapId: 'space_lab',
			order: 1,
			side: 1,
			action: 'ban',
			map_picker_position: 1,
			side_picker_position: 0
		},
		{
			id: 32,
			matchId: MATCHES[6].id,
			mapId: 'cauchy_district',
			order: 2,
			side: 0,
			action: 'pick',
			map_picker_position: 0,
			side_picker_position: 1
		},
		{
			id: 33,
			matchId: MATCHES[6].id,
			mapId: 'cosmite',
			order: 3,
			side: 1,
			action: 'pick',
			map_picker_position: 1,
			side_picker_position: 0
		},
		{
			id: 34,
			matchId: MATCHES[6].id,
			mapId: 'orcanus',
			order: 4,
			side: 0,
			action: 'pick',
			map_picker_position: 0,
			side_picker_position: 1
		},
		{
			id: 35,
			matchId: MATCHES[6].id,
			mapId: 'base_404',
			order: 5,
			side: 1,
			action: 'pick',
			map_picker_position: 1,
			side_picker_position: 0
		},
		{
			id: 36,
			matchId: MATCHES[6].id,
			mapId: 'area_88',
			order: 6,
			side: 0,
			action: 'decider',
			map_picker_position: 0,
			side_picker_position: 1
		},
		// Swiss Stage (BO3) - Match 7
		{
			id: 37,
			matchId: MATCHES[7].id,
			mapId: 'base_404',
			order: 0,
			side: 0,
			action: 'ban',
			map_picker_position: 0,
			side_picker_position: 1
		},
		{
			id: 38,
			matchId: MATCHES[7].id,
			mapId: 'area_88',
			order: 1,
			side: 1,
			action: 'ban',
			map_picker_position: 1,
			side_picker_position: 0
		},
		{
			id: 39,
			matchId: MATCHES[7].id,
			mapId: 'port_euler',
			order: 2,
			side: 0,
			action: 'pick',
			map_picker_position: 0,
			side_picker_position: 1
		},
		{
			id: 40,
			matchId: MATCHES[7].id,
			mapId: 'windy_town',
			order: 3,
			side: 1,
			action: 'pick',
			map_picker_position: 1,
			side_picker_position: 0
		},
		{
			id: 41,
			matchId: MATCHES[7].id,
			mapId: 'space_lab',
			order: 4,
			side: 0,
			action: 'decider',
			map_picker_position: 0,
			side_picker_position: 1
		},
		// Qualifier matches (BO1) - Match 0
		{
			id: 42,
			matchId: MATCHES[0].id,
			mapId: 'base_404',
			order: 0,
			side: 0,
			action: 'set',
			map_picker_position: 0,
			side_picker_position: 1
		},
		// Qualifier matches (BO1) - Match 1
		{
			id: 43,
			matchId: MATCHES[1].id,
			mapId: 'area_88',
			order: 0,
			side: 0,
			action: 'set',
			map_picker_position: 0,
			side_picker_position: 1
		}
	]);

	console.log('[SEED] Seeding event results...');
	await db.insert(schema.eventResult).values([
		// Event 1 (Imaginary Cup 1) Results
		{
			id: randomUUID(),
			eventId: EVENTS[0].id,
			teamId: team1_id,
			rank: 1,
			prizeAmount: 45000,
			prizeCurrency: 'Bablo'
		},
		{
			id: randomUUID(),
			eventId: EVENTS[0].id,
			teamId: team2_id,
			rank: 2,
			prizeAmount: 35000,
			prizeCurrency: 'Bablo'
		},
		{
			id: randomUUID(),
			eventId: EVENTS[0].id,
			teamId: team3_id,
			rank: 3,
			prizeAmount: 25000,
			prizeCurrency: 'Bablo'
		},
		{
			id: randomUUID(),
			eventId: EVENTS[0].id,
			teamId: team4_id,
			rank: 4,
			prizeAmount: 16000,
			prizeCurrency: 'Bablo'
		},
		// Event 2 (Imaginary Cup 2) Results
		{
			id: randomUUID(),
			eventId: EVENTS[1].id,
			teamId: team1_id,
			rank: 1,
			prizeAmount: 50000,
			prizeCurrency: 'Bablo'
		},
		{
			id: randomUUID(),
			eventId: EVENTS[1].id,
			teamId: team2_id,
			rank: 2,
			prizeAmount: 40000,
			prizeCurrency: 'Bablo'
		},
		{
			id: randomUUID(),
			eventId: EVENTS[1].id,
			teamId: team3_id,
			rank: 3,
			prizeAmount: 30000,
			prizeCurrency: 'Bablo'
		},
		{
			id: randomUUID(),
			eventId: EVENTS[1].id,
			teamId: team4_id,
			rank: 4,
			prizeAmount: 20000,
			prizeCurrency: 'Bablo'
		}
	]);

	console.log('[SEED] Seeding Discord servers...');
	const DISCORD_SERVERS = [
		{
			id: randomUUID(),
			title: 'Strinova Esports Hub',
			url: 'https://discord.gg/mY8DMatXM4',
			icon: 'https://cdn.discordapp.com/icons/1371077914723881010/17d112c45f5dbeac98c746c158605696.webp',
			description:
				'Community server focused on competitive play, resources, and media for Strinova Esports.',
			createdAt: new Date(),
			updatedAt: new Date()
		},
		{
			id: randomUUID(),
			title: 'Official Strinova Discord Server',
			url: 'https://discord.com/invite/strinova',
			icon: 'https://cdn.discordapp.com/icons/1182952140684136470/b05a9cb0f65b845b6d2ad7a63182081d.webp',
			description: 'The main community hub for Strinova players worldwide',
			additionalLinkText: '#tournament-chat',
			additionalLinkUrl: 'https://discord.com/channels/1182952140684136470/1320683196698066954',
			createdAt: new Date(),
			updatedAt: new Date()
		}
	];
	await db.insert(schema.discordServer).values(DISCORD_SERVERS);

	console.log('[SEED] Seeding community tags...');
	const COMMUNITY_TAGS = [
		// Language tags
		{
			id: randomUUID(),
			name: 'Japanese',
			category: 'language',
			value: 'ja',
			createdAt: new Date(),
			updatedAt: new Date()
		},
		{
			id: randomUUID(),
			name: 'English',
			category: 'language',
			value: 'en',
			createdAt: new Date(),
			updatedAt: new Date()
		},
		{
			id: randomUUID(),
			name: 'Korean',
			category: 'language',
			value: 'ko',
			createdAt: new Date(),
			updatedAt: new Date()
		},
		// Type tags
		{
			id: randomUUID(),
			name: 'Competitive',
			category: 'type',
			value: 'competitive',
			createdAt: new Date(),
			updatedAt: new Date()
		},
		{
			id: randomUUID(),
			name: 'Casual',
			category: 'type',
			value: 'casual',
			createdAt: new Date(),
			updatedAt: new Date()
		},
		{
			id: randomUUID(),
			name: 'Tournament',
			category: 'type',
			value: 'tournament',
			createdAt: new Date(),
			updatedAt: new Date()
		},
		// Status tags
		{
			id: randomUUID(),
			name: 'Active',
			category: 'status',
			value: 'active',
			createdAt: new Date(),
			updatedAt: new Date()
		},
		{
			id: randomUUID(),
			name: 'New',
			category: 'status',
			value: 'new',
			createdAt: new Date(),
			updatedAt: new Date()
		}
	];
	await db.insert(schema.communityTag).values(COMMUNITY_TAGS);

	console.log('[SEED] Seeding Discord server tags...');
	await db.insert(schema.discordServerTag).values([
		// Strinova Esports Hub tags
		{
			serverId: DISCORD_SERVERS[0].id,
			tagId: COMMUNITY_TAGS[0].id, // Japanese
			createdAt: new Date(),
			updatedAt: new Date()
		},
		{
			serverId: DISCORD_SERVERS[0].id,
			tagId: COMMUNITY_TAGS[1].id, // English
			createdAt: new Date(),
			updatedAt: new Date()
		},
		{
			serverId: DISCORD_SERVERS[0].id,
			tagId: COMMUNITY_TAGS[3].id, // Competitive
			createdAt: new Date(),
			updatedAt: new Date()
		},
		{
			serverId: DISCORD_SERVERS[0].id,
			tagId: COMMUNITY_TAGS[6].id, // Active
			createdAt: new Date(),
			updatedAt: new Date()
		},
		// Official Strinova Discord Server tags
		{
			serverId: DISCORD_SERVERS[1].id,
			tagId: COMMUNITY_TAGS[1].id, // English
			createdAt: new Date(),
			updatedAt: new Date()
		},
		{
			serverId: DISCORD_SERVERS[1].id,
			tagId: COMMUNITY_TAGS[2].id, // Korean
			createdAt: new Date(),
			updatedAt: new Date()
		},
		{
			serverId: DISCORD_SERVERS[1].id,
			tagId: COMMUNITY_TAGS[4].id, // Casual
			createdAt: new Date(),
			updatedAt: new Date()
		},
		{
			serverId: DISCORD_SERVERS[1].id,
			tagId: COMMUNITY_TAGS[5].id, // Tournament
			createdAt: new Date(),
			updatedAt: new Date()
		},
		{
			serverId: DISCORD_SERVERS[1].id,
			tagId: COMMUNITY_TAGS[7].id, // New
			createdAt: new Date(),
			updatedAt: new Date()
		}
	]);

	console.log('[SEED] Seeding sources...');
	// const sources = await db.query.source.findMany();
	// console.log(sources);

	console.log('[SEED] Seeding games...');
	const GAMES = [
		// Grand Finals (BO5) - Match 11
		{
			id: 1,
			matchId: MATCHES[11].id,
			mapId: 'port_euler',
			duration: 1800,
			winner: 0
		},
		{
			id: 2,
			matchId: MATCHES[11].id,
			mapId: 'windy_town',
			duration: 2100,
			winner: 1
		},
		{
			id: 3,
			matchId: MATCHES[11].id,
			mapId: 'space_lab',
			duration: 1950,
			winner: 0
		},
		{
			id: 4,
			matchId: MATCHES[11].id,
			mapId: 'cauchy_district',
			duration: 2400,
			winner: 1
		},
		{
			id: 5,
			matchId: MATCHES[11].id,
			mapId: 'cosmite',
			duration: 2250,
			winner: 0
		},
		// Semi Finals (BO5) - Match 10
		{
			id: 6,
			matchId: MATCHES[10].id,
			mapId: 'orcanus',
			duration: 1950,
			winner: 0
		},
		{
			id: 7,
			matchId: MATCHES[10].id,
			mapId: 'base_404',
			duration: 2100,
			winner: 0
		},
		{
			id: 8,
			matchId: MATCHES[10].id,
			mapId: 'area_88',
			duration: 1800,
			winner: 1
		},
		{
			id: 9,
			matchId: MATCHES[10].id,
			mapId: 'windy_town',
			duration: 2400,
			winner: 0
		},
		{
			id: 10,
			matchId: MATCHES[10].id,
			mapId: 'space_lab',
			duration: 2250,
			winner: 0
		}
	];
	await db.insert(schema.game).values(GAMES);

	console.log('[SEED] Seeding game teams...');
	await db.insert(schema.gameTeam).values([
		// Grand Finals Game 1
		{
			gameId: 1,
			teamId: team1_id,
			position: 0,
			score: 13
		},
		{
			gameId: 1,
			teamId: team2_id,
			position: 1,
			score: 11
		},
		// Grand Finals Game 2
		{
			gameId: 2,
			teamId: team1_id,
			position: 0,
			score: 9
		},
		{
			gameId: 2,
			teamId: team2_id,
			position: 1,
			score: 13
		},
		// Grand Finals Game 3
		{
			gameId: 3,
			teamId: team1_id,
			position: 0,
			score: 13
		},
		{
			gameId: 3,
			teamId: team2_id,
			position: 1,
			score: 10
		},
		// Grand Finals Game 4
		{
			gameId: 4,
			teamId: team1_id,
			position: 0,
			score: 11
		},
		{
			gameId: 4,
			teamId: team2_id,
			position: 1,
			score: 13
		},
		// Grand Finals Game 5
		{
			gameId: 5,
			teamId: team1_id,
			position: 0,
			score: 13
		},
		{
			gameId: 5,
			teamId: team2_id,
			position: 1,
			score: 9
		},
		// Semi Finals Game 1
		{
			gameId: 6,
			teamId: team2_id,
			position: 0,
			score: 13
		},
		{
			gameId: 6,
			teamId: team4_id,
			position: 1,
			score: 8
		},
		// Semi Finals Game 2
		{
			gameId: 7,
			teamId: team2_id,
			position: 0,
			score: 13
		},
		{
			gameId: 7,
			teamId: team4_id,
			position: 1,
			score: 10
		},
		// Semi Finals Game 3
		{
			gameId: 8,
			teamId: team2_id,
			position: 0,
			score: 9
		},
		{
			gameId: 8,
			teamId: team4_id,
			position: 1,
			score: 13
		},
		// Semi Finals Game 4
		{
			gameId: 9,
			teamId: team2_id,
			position: 0,
			score: 13
		},
		{
			gameId: 9,
			teamId: team4_id,
			position: 1,
			score: 11
		},
		// Semi Finals Game 5
		{
			gameId: 10,
			teamId: team2_id,
			position: 0,
			score: 13
		},
		{
			gameId: 10,
			teamId: team4_id,
			position: 1,
			score: 7
		}
	]);

	console.log('[SEED] Seeding game player scores...');
	await db.insert(schema.gamePlayerScore).values([
		// Grand Finals Game 1 - Team 1 Player 1
		{
			id: 1,
			gameId: 1,
			teamId: team1_id,
			accountId: 123456,
			player: 'Player1',
			characterFirstHalf: 'Flavia',
			characterSecondHalf: 'Ming',
			score: 250,
			damageScore: 180,
			kills: 15,
			knocks: 8,
			deaths: 12,
			assists: 5,
			damage: 2800
		},
		// Grand Finals Game 1 - Team 1 Player 2
		{
			id: 2,
			gameId: 1,
			teamId: team1_id,
			accountId: 123457,
			player: 'Player2',
			characterFirstHalf: 'Celestia',
			characterSecondHalf: 'Celestia',
			score: 220,
			damageScore: 160,
			kills: 12,
			knocks: 6,
			deaths: 14,
			assists: 8,
			damage: 2500
		},
		// Grand Finals Game 1 - Team 2 Player 1
		{
			id: 3,
			gameId: 1,
			teamId: team2_id,
			accountId: 123458,
			player: 'Player3',
			characterFirstHalf: 'Nobunaga',
			characterSecondHalf: 'Reiichi',
			score: 240,
			damageScore: 170,
			kills: 14,
			knocks: 7,
			deaths: 13,
			assists: 6,
			damage: 2700
		},
		// Grand Finals Game 1 - Team 2 Player 2
		{
			id: 4,
			gameId: 1,
			teamId: team2_id,
			accountId: 123459,
			player: 'Player4',
			characterFirstHalf: 'Ming',
			characterSecondHalf: 'Flavia',
			score: 210,
			damageScore: 150,
			kills: 11,
			knocks: 5,
			deaths: 15,
			assists: 9,
			damage: 2300
		},
		// Grand Finals Game 2 - Team 1 Player 1
		{
			id: 5,
			gameId: 2,
			teamId: team1_id,
			accountId: 123456,
			player: 'Player1',
			characterFirstHalf: 'Reiichi',
			characterSecondHalf: 'Nobunaga',
			score: 190,
			damageScore: 140,
			kills: 10,
			knocks: 7,
			deaths: 15,
			assists: 4,
			damage: 2200
		},
		// Grand Finals Game 2 - Team 1 Player 2
		{
			id: 6,
			gameId: 2,
			teamId: team1_id,
			accountId: 123457,
			player: 'Player2',
			characterFirstHalf: 'Ming',
			characterSecondHalf: 'Flavia',
			score: 180,
			damageScore: 130,
			kills: 9,
			knocks: 6,
			deaths: 16,
			assists: 7,
			damage: 2100
		},
		// Grand Finals Game 2 - Team 2 Player 1
		{
			id: 7,
			gameId: 2,
			teamId: team2_id,
			accountId: 123458,
			player: 'Player3',
			characterFirstHalf: 'Celestia',
			characterSecondHalf: 'Celestia',
			score: 260,
			damageScore: 190,
			kills: 16,
			knocks: 9,
			deaths: 11,
			assists: 5,
			damage: 2900
		},
		// Grand Finals Game 2 - Team 2 Player 2
		{
			id: 8,
			gameId: 2,
			teamId: team2_id,
			accountId: 123459,
			player: 'Player4',
			characterFirstHalf: 'Flavia',
			characterSecondHalf: 'Ming',
			score: 230,
			damageScore: 170,
			kills: 13,
			knocks: 8,
			deaths: 12,
			assists: 6,
			damage: 2600
		},
		// Grand Finals Game 3 - Team 1 Player 1
		{
			id: 9,
			gameId: 3,
			teamId: team1_id,
			accountId: 123456,
			player: 'Player1',
			characterFirstHalf: 'Ming',
			characterSecondHalf: 'Flavia',
			score: 270,
			damageScore: 200,
			kills: 17,
			knocks: 9,
			deaths: 10,
			assists: 4,
			damage: 3000
		},
		// Grand Finals Game 3 - Team 1 Player 2
		{
			id: 10,
			gameId: 3,
			teamId: team1_id,
			accountId: 123457,
			player: 'Player2',
			characterFirstHalf: 'Nobunaga',
			characterSecondHalf: 'Reiichi',
			score: 240,
			damageScore: 180,
			kills: 14,
			knocks: 7,
			deaths: 12,
			assists: 6,
			damage: 2700
		},
		// Grand Finals Game 3 - Team 2 Player 1
		{
			id: 11,
			gameId: 3,
			teamId: team2_id,
			accountId: 123458,
			player: 'Player3',
			characterFirstHalf: 'Celestia',
			characterSecondHalf: 'Celestia',
			score: 220,
			damageScore: 160,
			kills: 12,
			knocks: 6,
			deaths: 14,
			assists: 8,
			damage: 2500
		},
		// Grand Finals Game 3 - Team 2 Player 2
		{
			id: 12,
			gameId: 3,
			teamId: team2_id,
			accountId: 123459,
			player: 'Player4',
			characterFirstHalf: 'Flavia',
			characterSecondHalf: 'Ming',
			score: 200,
			damageScore: 150,
			kills: 10,
			knocks: 5,
			deaths: 16,
			assists: 9,
			damage: 2300
		},
		// Grand Finals Game 4 - Team 1 Player 1
		{
			id: 13,
			gameId: 4,
			teamId: team1_id,
			accountId: 123456,
			player: 'Player1',
			characterFirstHalf: 'Reiichi',
			characterSecondHalf: 'Nobunaga',
			score: 230,
			damageScore: 170,
			kills: 13,
			knocks: 8,
			deaths: 13,
			assists: 5,
			damage: 2600
		},
		// Grand Finals Game 4 - Team 1 Player 2
		{
			id: 14,
			gameId: 4,
			teamId: team1_id,
			accountId: 123457,
			player: 'Player2',
			characterFirstHalf: 'Celestia',
			characterSecondHalf: 'Celestia',
			score: 210,
			damageScore: 160,
			kills: 11,
			knocks: 7,
			deaths: 14,
			assists: 7,
			damage: 2400
		},
		// Grand Finals Game 4 - Team 2 Player 1
		{
			id: 15,
			gameId: 4,
			teamId: team2_id,
			accountId: 123458,
			player: 'Player3',
			characterFirstHalf: 'Ming',
			characterSecondHalf: 'Flavia',
			score: 250,
			damageScore: 190,
			kills: 15,
			knocks: 9,
			deaths: 11,
			assists: 4,
			damage: 2800
		},
		// Grand Finals Game 4 - Team 2 Player 2
		{
			id: 16,
			gameId: 4,
			teamId: team2_id,
			accountId: 123459,
			player: 'Player4',
			characterFirstHalf: 'Flavia',
			characterSecondHalf: 'Ming',
			score: 240,
			damageScore: 180,
			kills: 14,
			knocks: 8,
			deaths: 12,
			assists: 5,
			damage: 2700
		},
		// Grand Finals Game 5 - Team 1 Player 1
		{
			id: 17,
			gameId: 5,
			teamId: team1_id,
			accountId: 123456,
			player: 'Player1',
			characterFirstHalf: 'Ming',
			characterSecondHalf: 'Flavia',
			score: 280,
			damageScore: 210,
			kills: 18,
			knocks: 10,
			deaths: 9,
			assists: 3,
			damage: 3100
		},
		// Grand Finals Game 5 - Team 1 Player 2
		{
			id: 18,
			gameId: 5,
			teamId: team1_id,
			accountId: 123457,
			player: 'Player2',
			characterFirstHalf: 'Nobunaga',
			characterSecondHalf: 'Reiichi',
			score: 250,
			damageScore: 190,
			kills: 15,
			knocks: 8,
			deaths: 11,
			assists: 5,
			damage: 2800
		},
		// Grand Finals Game 5 - Team 2 Player 1
		{
			id: 19,
			gameId: 5,
			teamId: team2_id,
			accountId: 123458,
			player: 'Player3',
			characterFirstHalf: 'Celestia',
			characterSecondHalf: 'Celestia',
			score: 200,
			damageScore: 150,
			kills: 10,
			knocks: 6,
			deaths: 16,
			assists: 8,
			damage: 2300
		},
		// Grand Finals Game 5 - Team 2 Player 2
		{
			id: 20,
			gameId: 5,
			teamId: team2_id,
			accountId: 123459,
			player: 'Player4',
			characterFirstHalf: 'Flavia',
			characterSecondHalf: 'Ming',
			score: 190,
			damageScore: 140,
			kills: 9,
			knocks: 5,
			deaths: 17,
			assists: 9,
			damage: 2200
		},
		// Semi Finals Game 1 - Team 2 Player 1
		{
			id: 21,
			gameId: 6,
			teamId: team2_id,
			accountId: 123458,
			player: 'Player3',
			characterFirstHalf: 'Ming',
			characterSecondHalf: 'Flavia',
			score: 290,
			damageScore: 220,
			kills: 19,
			knocks: 11,
			deaths: 8,
			assists: 2,
			damage: 3200
		},
		// Semi Finals Game 1 - Team 2 Player 2
		{
			id: 22,
			gameId: 6,
			teamId: team2_id,
			accountId: 123459,
			player: 'Player4',
			characterFirstHalf: 'Nobunaga',
			characterSecondHalf: 'Reiichi',
			score: 260,
			damageScore: 200,
			kills: 16,
			knocks: 9,
			deaths: 10,
			assists: 4,
			damage: 2900
		},
		// Semi Finals Game 1 - Team 4 Player 1
		{
			id: 23,
			gameId: 6,
			teamId: team4_id,
			accountId: 123460,
			player: 'Player5',
			characterFirstHalf: 'Celestia',
			characterSecondHalf: 'Celestia',
			score: 180,
			damageScore: 130,
			kills: 8,
			knocks: 5,
			deaths: 18,
			assists: 10,
			damage: 2100
		},
		// Semi Finals Game 1 - Team 4 Player 2
		{
			id: 24,
			gameId: 6,
			teamId: team4_id,
			accountId: 123461,
			player: 'Player6',
			characterFirstHalf: 'Flavia',
			characterSecondHalf: 'Ming',
			score: 160,
			damageScore: 120,
			kills: 6,
			knocks: 4,
			deaths: 19,
			assists: 11,
			damage: 1900
		},
		// Semi Finals Game 2 - Team 2 Player 1
		{
			id: 25,
			gameId: 7,
			teamId: team2_id,
			accountId: 123458,
			player: 'Player3',
			characterFirstHalf: 'Reiichi',
			characterSecondHalf: 'Nobunaga',
			score: 270,
			damageScore: 210,
			kills: 17,
			knocks: 10,
			deaths: 9,
			assists: 3,
			damage: 3000
		},
		// Semi Finals Game 2 - Team 2 Player 2
		{
			id: 26,
			gameId: 7,
			teamId: team2_id,
			accountId: 123459,
			player: 'Player4',
			characterFirstHalf: 'Celestia',
			characterSecondHalf: 'Celestia',
			score: 240,
			damageScore: 190,
			kills: 14,
			knocks: 8,
			deaths: 11,
			assists: 5,
			damage: 2700
		},
		// Semi Finals Game 2 - Team 4 Player 1
		{
			id: 27,
			gameId: 7,
			teamId: team4_id,
			accountId: 123460,
			player: 'Player5',
			characterFirstHalf: 'Ming',
			characterSecondHalf: 'Flavia',
			score: 220,
			damageScore: 170,
			kills: 12,
			knocks: 7,
			deaths: 13,
			assists: 6,
			damage: 2500
		},
		// Semi Finals Game 2 - Team 4 Player 2
		{
			id: 28,
			gameId: 7,
			teamId: team4_id,
			accountId: 123461,
			player: 'Player6',
			characterFirstHalf: 'Flavia',
			characterSecondHalf: 'Ming',
			score: 200,
			damageScore: 160,
			kills: 10,
			knocks: 6,
			deaths: 15,
			assists: 8,
			damage: 2300
		},
		// Semi Finals Game 3 - Team 2 Player 1
		{
			id: 29,
			gameId: 8,
			teamId: team2_id,
			accountId: 123458,
			player: 'Player3',
			characterFirstHalf: 'Ming',
			characterSecondHalf: 'Flavia',
			score: 190,
			damageScore: 140,
			kills: 9,
			knocks: 6,
			deaths: 16,
			assists: 9,
			damage: 2200
		},
		// Semi Finals Game 3 - Team 2 Player 2
		{
			id: 30,
			gameId: 8,
			teamId: team2_id,
			accountId: 123459,
			player: 'Player4',
			characterFirstHalf: 'Nobunaga',
			characterSecondHalf: 'Reiichi',
			score: 180,
			damageScore: 130,
			kills: 8,
			knocks: 5,
			deaths: 17,
			assists: 10,
			damage: 2100
		},
		// Semi Finals Game 3 - Team 4 Player 1
		{
			id: 31,
			gameId: 8,
			teamId: team4_id,
			accountId: 123460,
			player: 'Player5',
			characterFirstHalf: 'Celestia',
			characterSecondHalf: 'Celestia',
			score: 260,
			damageScore: 200,
			kills: 16,
			knocks: 9,
			deaths: 10,
			assists: 4,
			damage: 2900
		},
		// Semi Finals Game 3 - Team 4 Player 2
		{
			id: 32,
			gameId: 8,
			teamId: team4_id,
			accountId: 123461,
			player: 'Player6',
			characterFirstHalf: 'Flavia',
			characterSecondHalf: 'Ming',
			score: 240,
			damageScore: 190,
			kills: 14,
			knocks: 8,
			deaths: 11,
			assists: 5,
			damage: 2700
		},
		// Semi Finals Game 4 - Team 2 Player 1
		{
			id: 33,
			gameId: 9,
			teamId: team2_id,
			accountId: 123458,
			player: 'Player3',
			characterFirstHalf: 'Reiichi',
			characterSecondHalf: 'Nobunaga',
			score: 280,
			damageScore: 220,
			kills: 18,
			knocks: 11,
			deaths: 8,
			assists: 2,
			damage: 3100
		},
		// Semi Finals Game 4 - Team 2 Player 2
		{
			id: 34,
			gameId: 9,
			teamId: team2_id,
			accountId: 123459,
			player: 'Player4',
			characterFirstHalf: 'Celestia',
			characterSecondHalf: 'Celestia',
			score: 250,
			damageScore: 200,
			kills: 15,
			knocks: 9,
			deaths: 10,
			assists: 4,
			damage: 2800
		},
		// Semi Finals Game 4 - Team 4 Player 1
		{
			id: 35,
			gameId: 9,
			teamId: team4_id,
			accountId: 123460,
			player: 'Player5',
			characterFirstHalf: 'Ming',
			characterSecondHalf: 'Flavia',
			score: 230,
			damageScore: 180,
			kills: 13,
			knocks: 8,
			deaths: 12,
			assists: 6,
			damage: 2600
		},
		// Semi Finals Game 4 - Team 4 Player 2
		{
			id: 36,
			gameId: 9,
			teamId: team4_id,
			accountId: 123461,
			player: 'Player6',
			characterFirstHalf: 'Flavia',
			characterSecondHalf: 'Ming',
			score: 210,
			damageScore: 170,
			kills: 11,
			knocks: 7,
			deaths: 14,
			assists: 8,
			damage: 2400
		},
		// Semi Finals Game 5 - Team 2 Player 1
		{
			id: 37,
			gameId: 10,
			teamId: team2_id,
			accountId: 123458,
			player: 'Player3',
			characterFirstHalf: 'Ming',
			characterSecondHalf: 'Flavia',
			score: 300,
			damageScore: 230,
			kills: 20,
			knocks: 12,
			deaths: 7,
			assists: 1,
			damage: 3300
		},
		// Semi Finals Game 5 - Team 2 Player 2
		{
			id: 38,
			gameId: 10,
			teamId: team2_id,
			accountId: 123459,
			player: 'Player4',
			characterFirstHalf: 'Nobunaga',
			characterSecondHalf: 'Reiichi',
			score: 270,
			damageScore: 210,
			kills: 17,
			knocks: 10,
			deaths: 9,
			assists: 3,
			damage: 3000
		},
		// Semi Finals Game 5 - Team 4 Player 1
		{
			id: 39,
			gameId: 10,
			teamId: team4_id,
			accountId: 123460,
			player: 'Player5',
			characterFirstHalf: 'Celestia',
			characterSecondHalf: 'Celestia',
			score: 160,
			damageScore: 120,
			kills: 6,
			knocks: 4,
			deaths: 20,
			assists: 12,
			damage: 1900
		},
		// Semi Finals Game 5 - Team 4 Player 2
		{
			id: 40,
			gameId: 10,
			teamId: team4_id,
			accountId: 123461,
			player: 'Player6',
			characterFirstHalf: 'Flavia',
			characterSecondHalf: 'Ming',
			score: 150,
			damageScore: 110,
			kills: 5,
			knocks: 3,
			deaths: 21,
			assists: 13,
			damage: 1800
		}
	]);
}
