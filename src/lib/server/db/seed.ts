import * as schema from '$lib/server/db/schema';
import { db } from '$lib/server/db';
import { randomUUID } from 'node:crypto';
import { PLAYER_ADDITIONAL_NATIONALITIES, PLAYERS } from './seeds/players';
import { TEAMS, TEAM_PLAYERS } from './seeds/teams';
import { ORGANIZERS } from './seeds/organizers';
import { EVENTS, EVENT_WEBSITES, EVENT_ORGANIZERS, EVENT_TEAM_PLAYERS } from './seeds/events';

export async function seed() {
	console.info('[SEED] Starting seeding...');

	// Clear only game-related tables, preserving user data
	console.info('[SEED] Clearing existing game data...');
	// Delete child records first
	await db.delete(schema.gamePlayerScore);
	console.info('[SEED] - Deleted gamePlayerScore');
	await db.delete(schema.gameTeam);
	console.info('[SEED] - Deleted gameTeam');
	await db.delete(schema.game);
	console.info('[SEED] - Deleted game');
	await db.delete(schema.matchMap);
	console.info('[SEED] - Deleted matchMap');
	await db.delete(schema.matchTeam);
	console.info('[SEED] - Deleted matchTeam');
	await db.delete(schema.stageNodeDependency);
	console.info('[SEED] - Deleted stageNodeDependency');
	await db.delete(schema.stageNode);
	console.info('[SEED] - Deleted stageNode');
	await db.delete(schema.stageRound);
	console.info('[SEED] - Deleted stageRound');
	await db.delete(schema.match);
	console.info('[SEED] - Deleted match');
	await db.delete(schema.stage);
	console.info('[SEED] - Deleted stage');
	await db.delete(schema.eventTeamPlayer);
	console.info('[SEED] - Deleted eventTeamPlayer');
	await db.delete(schema.eventOrganizer);
	console.info('[SEED] - Deleted eventOrganizer');
	await db.delete(schema.eventResult);
	console.info('[SEED] - Deleted eventResult');
	await db.delete(schema.eventWebsite);
	console.info('[SEED] - Deleted eventWebsite');
	await db.delete(schema.eventVideo);
	console.info('[SEED] - Deleted eventVideo');
	await db.delete(schema.eventCaster);
	console.info('[SEED] - Deleted eventCaster');
	await db.delete(schema.event);
	console.info('[SEED] - Deleted event');
	await db.delete(schema.teamPlayer);
	console.info('[SEED] - Deleted teamPlayer');
	await db.delete(schema.teamAlias);
	console.info('[SEED] - Deleted teamAlias');
	await db.delete(schema.team);
	console.info('[SEED] - Deleted team');
	await db.delete(schema.playerAlias);
	console.info('[SEED] - Deleted playerAlias');
	await db.delete(schema.playerAdditionalNationality);
	console.info('[SEED] - Deleted playerAdditionalNationality');
	await db.delete(schema.player_social_account);
	console.info('[SEED] - Deleted player_social_account');
	await db.delete(schema.gameAccount);
	console.info('[SEED] - Deleted gameAccount');
	await db.delete(schema.player);
	console.info('[SEED] - Deleted player');
	await db.delete(schema.discordServerTag);
	console.info('[SEED] - Deleted discordServerTag');
	await db.delete(schema.discordServer);
	console.info('[SEED] - Deleted discordServer');
	await db.delete(schema.organizer);
	console.info('[SEED] - Deleted organizer');
	// Preserve user-related tables: user, role, userRole, session, editHistory

	console.info('[SEED] Seeding players...');
	await db.insert(schema.player).values(PLAYERS);

	console.info('[SEED] Seeding player additional nationalities...');
	await db.insert(schema.playerAdditionalNationality).values(PLAYER_ADDITIONAL_NATIONALITIES);

	console.info('[SEED] Seeding teams...');
	await db.insert(schema.team).values(TEAMS);

	console.info('[SEED] Seeding team players...');
	await db.insert(schema.teamPlayer).values(TEAM_PLAYERS);

	console.info('[SEED] Seeding organizers...');
	await db.insert(schema.organizer).values(ORGANIZERS);

	console.info('[SEED] Seeding events...');
	await db.insert(schema.event).values(EVENTS);

	console.info('[SEED] Seeding event websites...');
	await db.insert(schema.eventWebsite).values(EVENT_WEBSITES);

	console.info('[SEED] Seeding event organizers...');
	await db.insert(schema.eventOrganizer).values(EVENT_ORGANIZERS);

	console.info('[SEED] Seeding event team players...');
	await db.insert(schema.eventTeamPlayer).values(EVENT_TEAM_PLAYERS);

	console.info('[SEED] Seeding stages...');
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

	console.info('[SEED] Seeding matches...');
	const MATCHES = [
		// Event 1: Open Qualifiers
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
		// Event 1: Group Stage A
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
		// Event 1: Group Stage B
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
		// Event 1: Playoffs
		{
			id: randomUUID(),
			format: 'BO5',
			stageId: STAGES[3].id
		},
		{
			id: randomUUID(),
			format: 'BO5',
			stageId: STAGES[3].id
		},
		{
			id: randomUUID(),
			format: 'BO5',
			stageId: STAGES[3].id
		},
		{
			id: randomUUID(),
			format: 'BO5',
			stageId: STAGES[3].id
		},
		// Event 2: Swiss Stage
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
		// Event 2: Quarter Finals
		{
			id: randomUUID(),
			format: 'BO3',
			stageId: STAGES[5].id
		},
		{
			id: randomUUID(),
			format: 'BO3',
			stageId: STAGES[5].id
		},
		{
			id: randomUUID(),
			format: 'BO3',
			stageId: STAGES[5].id
		},
		{
			id: randomUUID(),
			format: 'BO3',
			stageId: STAGES[5].id
		},
		// Event 2: Semi Finals
		{
			id: randomUUID(),
			format: 'BO5',
			stageId: STAGES[6].id
		},
		{
			id: randomUUID(),
			format: 'BO5',
			stageId: STAGES[6].id
		},
		// Event 2: Grand Finals
		{
			id: randomUUID(),
			format: 'BO5',
			stageId: STAGES[7].id
		},
		// Event 3: Showmatch
		{
			id: randomUUID(),
			format: 'BO1',
			stageId: STAGES[8].id
		},
		// Event 4: Regional Qualifier
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
		// Event 5: Group Stage
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
		// Event 5: Playoffs
		{
			id: randomUUID(),
			format: 'BO5',
			stageId: STAGES[11].id
		},
		{
			id: randomUUID(),
			format: 'BO5',
			stageId: STAGES[11].id
		},
		{
			id: randomUUID(),
			format: 'BO5',
			stageId: STAGES[11].id
		},
		{
			id: randomUUID(),
			format: 'BO5',
			stageId: STAGES[11].id
		}
	];
	await db.insert(schema.match).values(MATCHES);

	console.info('[SEED] Seeding stage rounds...');
	const STAGE_ROUNDS = [
		// Example stage rounds for Event 1 (Open Qualifiers)
		{
			id: 1,
			stageId: STAGES[0].id,
			type: 'round' as const,
			title: 'Qualifier Round 1',
			bracket: 'upper' as const,
			parallelGroup: 1
		},
		{
			id: 2,
			stageId: STAGES[0].id,
			type: 'round' as const,
			title: 'Qualifier Round 2',
			bracket: 'upper' as const,
			parallelGroup: 1
		},
		// Example stage rounds for Event 1 (Group Stage A)
		{
			id: 3,
			stageId: STAGES[1].id,
			type: 'group' as const,
			title: 'Group A Round 1',
			bracket: 'group' as const,
			parallelGroup: 1
		},
		{
			id: 4,
			stageId: STAGES[1].id,
			type: 'group' as const,
			title: 'Group A Round 2',
			bracket: 'group' as const,
			parallelGroup: 1
		},
		// Example stage rounds for Event 1 (Group Stage B)
		{
			id: 5,
			stageId: STAGES[2].id,
			type: 'group' as const,
			title: 'Group B Round 1',
			bracket: 'group' as const,
			parallelGroup: 1
		},
		{
			id: 6,
			stageId: STAGES[2].id,
			type: 'group' as const,
			title: 'Group B Round 2',
			bracket: 'group' as const,
			parallelGroup: 1
		},
		// Example stage rounds for Event 1 (Playoffs)
		{
			id: 7,
			stageId: STAGES[3].id,
			type: 'quarterfinals' as const,
			title: 'Quarter Finals',
			bracket: 'upper' as const,
			parallelGroup: 1
		},
		{
			id: 8,
			stageId: STAGES[3].id,
			type: 'semifinals' as const,
			title: 'Semi Finals',
			bracket: 'upper' as const,
			parallelGroup: 1
		},
		{
			id: 9,
			stageId: STAGES[3].id,
			type: 'final' as const,
			title: 'Grand Finals',
			bracket: 'upper' as const,
			parallelGroup: 1
		},
		// Example stage rounds for Event 2 (Swiss Stage)
		{
			id: 10,
			stageId: STAGES[4].id,
			type: 'round' as const,
			title: 'Swiss Round 1',
			bracket: 'group' as const,
			parallelGroup: 1
		},
		{
			id: 11,
			stageId: STAGES[4].id,
			type: 'round' as const,
			title: 'Swiss Round 2',
			bracket: 'group' as const,
			parallelGroup: 1
		},
		// Example stage rounds for Event 2 (Quarter Finals)
		{
			id: 12,
			stageId: STAGES[5].id,
			type: 'quarterfinals' as const,
			title: 'Quarter Finals',
			bracket: 'upper' as const,
			parallelGroup: 1
		},
		// Example stage rounds for Event 2 (Semi Finals)
		{
			id: 13,
			stageId: STAGES[6].id,
			type: 'semifinals' as const,
			title: 'Semi Finals',
			bracket: 'upper' as const,
			parallelGroup: 1
		},
		// Example stage rounds for Event 2 (Grand Finals)
		{
			id: 14,
			stageId: STAGES[7].id,
			type: 'final' as const,
			title: 'Grand Finals',
			bracket: 'upper' as const,
			parallelGroup: 1
		},
		// Example stage rounds for Event 3 (Showmatch)
		{
			id: 15,
			stageId: STAGES[8].id,
			type: 'round' as const,
			title: 'Celebration Showmatch',
			bracket: 'upper' as const,
			parallelGroup: 1
		},
		// Example stage rounds for Event 4 (Regional Qualifier)
		{
			id: 16,
			stageId: STAGES[9].id,
			type: 'round' as const,
			title: 'Qualifier Round 1',
			bracket: 'upper' as const,
			parallelGroup: 1
		},
		{
			id: 17,
			stageId: STAGES[9].id,
			type: 'round' as const,
			title: 'Qualifier Round 2',
			bracket: 'upper' as const,
			parallelGroup: 1
		},
		// Example stage rounds for Event 5 (Group Stage)
		{
			id: 18,
			stageId: STAGES[10].id,
			type: 'round' as const,
			title: 'Group Stage Round 1',
			bracket: 'group' as const,
			parallelGroup: 1
		},
		{
			id: 19,
			stageId: STAGES[10].id,
			type: 'round' as const,
			title: 'Group Stage Round 2',
			bracket: 'group' as const,
			parallelGroup: 1
		},
		// Example stage rounds for Event 5 (Playoffs)
		{
			id: 20,
			stageId: STAGES[11].id,
			type: 'quarterfinals' as const,
			title: 'Quarter Finals',
			bracket: 'upper' as const,
			parallelGroup: 1
		},
		{
			id: 21,
			stageId: STAGES[11].id,
			type: 'semifinals' as const,
			title: 'Semi Finals',
			bracket: 'upper' as const,
			parallelGroup: 1
		},
		{
			id: 22,
			stageId: STAGES[11].id,
			type: 'final' as const,
			title: 'Grand Finals',
			bracket: 'upper' as const,
			parallelGroup: 1
		}
	];
	await db.insert(schema.stageRound).values(STAGE_ROUNDS);

	console.info('[SEED] Seeding stage nodes...');
	const STAGE_NODES = [
		// Event 1: Open Qualifiers
		{
			id: 1,
			stageId: STAGES[0].id,
			matchId: MATCHES[0].id,
			roundId: STAGE_ROUNDS[0].id
		},
		{
			id: 2,
			stageId: STAGES[0].id,
			matchId: MATCHES[1].id,
			roundId: STAGE_ROUNDS[0].id
		},
		{
			id: 3,
			stageId: STAGES[0].id,
			matchId: MATCHES[2].id,
			roundId: STAGE_ROUNDS[1].id
		},
		{
			id: 4,
			stageId: STAGES[0].id,
			matchId: MATCHES[3].id,
			roundId: STAGE_ROUNDS[1].id
		},
		// Event 1: Group Stage A
		{
			id: 5,
			stageId: STAGES[1].id,
			matchId: MATCHES[4].id,
			roundId: STAGE_ROUNDS[2].id
		},
		{
			id: 6,
			stageId: STAGES[1].id,
			matchId: MATCHES[5].id,
			roundId: STAGE_ROUNDS[2].id
		},
		{
			id: 7,
			stageId: STAGES[1].id,
			matchId: MATCHES[6].id,
			roundId: STAGE_ROUNDS[3].id
		},
		{
			id: 8,
			stageId: STAGES[1].id,
			matchId: MATCHES[7].id,
			roundId: STAGE_ROUNDS[3].id
		},
		// Event 1: Group Stage B
		{
			id: 9,
			stageId: STAGES[2].id,
			matchId: MATCHES[8].id,
			roundId: STAGE_ROUNDS[4].id
		},
		{
			id: 10,
			stageId: STAGES[2].id,
			matchId: MATCHES[9].id,
			roundId: STAGE_ROUNDS[4].id
		},
		{
			id: 11,
			stageId: STAGES[2].id,
			matchId: MATCHES[10].id,
			roundId: STAGE_ROUNDS[5].id
		},
		{
			id: 12,
			stageId: STAGES[2].id,
			matchId: MATCHES[11].id,
			roundId: STAGE_ROUNDS[5].id
		},
		// Event 1: Playoffs
		{
			id: 13,
			stageId: STAGES[3].id,
			matchId: MATCHES[12].id,
			roundId: STAGE_ROUNDS[6].id
		},
		{
			id: 14,
			stageId: STAGES[3].id,
			matchId: MATCHES[13].id,
			roundId: STAGE_ROUNDS[7].id
		},
		{
			id: 15,
			stageId: STAGES[3].id,
			matchId: MATCHES[14].id,
			roundId: STAGE_ROUNDS[8].id
		},
		{
			id: 16,
			stageId: STAGES[3].id,
			matchId: MATCHES[15].id,
			roundId: STAGE_ROUNDS[8].id
		},
		// Event 2: Swiss Stage
		{
			id: 17,
			stageId: STAGES[4].id,
			matchId: MATCHES[16].id,
			roundId: STAGE_ROUNDS[9].id
		},
		{
			id: 18,
			stageId: STAGES[4].id,
			matchId: MATCHES[17].id,
			roundId: STAGE_ROUNDS[9].id
		},
		{
			id: 19,
			stageId: STAGES[4].id,
			matchId: MATCHES[18].id,
			roundId: STAGE_ROUNDS[10].id
		},
		{
			id: 20,
			stageId: STAGES[4].id,
			matchId: MATCHES[19].id,
			roundId: STAGE_ROUNDS[10].id
		},
		// Event 2: Quarter Finals
		{
			id: 21,
			stageId: STAGES[5].id,
			matchId: MATCHES[20].id,
			roundId: STAGE_ROUNDS[11].id
		},
		{
			id: 22,
			stageId: STAGES[5].id,
			matchId: MATCHES[21].id,
			roundId: STAGE_ROUNDS[11].id
		},
		{
			id: 23,
			stageId: STAGES[5].id,
			matchId: MATCHES[22].id,
			roundId: STAGE_ROUNDS[11].id
		},
		{
			id: 24,
			stageId: STAGES[5].id,
			matchId: MATCHES[23].id,
			roundId: STAGE_ROUNDS[11].id
		},
		// Event 2: Semi Finals
		{
			id: 25,
			stageId: STAGES[6].id,
			matchId: MATCHES[24].id,
			roundId: STAGE_ROUNDS[12].id
		},
		{
			id: 26,
			stageId: STAGES[6].id,
			matchId: MATCHES[25].id,
			roundId: STAGE_ROUNDS[12].id
		},
		// Event 2: Grand Finals
		{
			id: 27,
			stageId: STAGES[7].id,
			matchId: MATCHES[26].id,
			roundId: STAGE_ROUNDS[13].id
		},
		// Event 3: Showmatch
		{
			id: 28,
			stageId: STAGES[8].id,
			matchId: MATCHES[27].id,
			roundId: STAGE_ROUNDS[14].id
		},
		// Event 4: Regional Qualifier
		{
			id: 29,
			stageId: STAGES[9].id,
			matchId: MATCHES[28].id,
			roundId: STAGE_ROUNDS[15].id
		},
		{
			id: 30,
			stageId: STAGES[9].id,
			matchId: MATCHES[29].id,
			roundId: STAGE_ROUNDS[15].id
		},
		{
			id: 31,
			stageId: STAGES[9].id,
			matchId: MATCHES[30].id,
			roundId: STAGE_ROUNDS[16].id
		},
		{
			id: 32,
			stageId: STAGES[9].id,
			matchId: MATCHES[31].id,
			roundId: STAGE_ROUNDS[16].id
		},
		// Event 5: Group Stage
		{
			id: 33,
			stageId: STAGES[10].id,
			matchId: MATCHES[32].id,
			roundId: STAGE_ROUNDS[17].id
		},
		{
			id: 34,
			stageId: STAGES[10].id,
			matchId: MATCHES[33].id,
			roundId: STAGE_ROUNDS[17].id
		},
		{
			id: 35,
			stageId: STAGES[10].id,
			matchId: MATCHES[34].id,
			roundId: STAGE_ROUNDS[18].id
		},
		{
			id: 36,
			stageId: STAGES[10].id,
			matchId: MATCHES[35].id,
			roundId: STAGE_ROUNDS[18].id
		},
		// Event 5: Playoffs
		{
			id: 37,
			stageId: STAGES[11].id,
			matchId: MATCHES[36].id,
			roundId: STAGE_ROUNDS[19].id
		},
		{
			id: 38,
			stageId: STAGES[11].id,
			matchId: MATCHES[37].id,
			roundId: STAGE_ROUNDS[20].id
		},
		{
			id: 39,
			stageId: STAGES[11].id,
			matchId: MATCHES[38].id,
			roundId: STAGE_ROUNDS[21].id
		},
		{
			id: 40,
			stageId: STAGES[11].id,
			matchId: MATCHES[39].id,
			roundId: STAGE_ROUNDS[21].id
		}
	];
	await db.insert(schema.stageNode).values(STAGE_NODES);

	console.info('[SEED] Seeding stage node dependencies...');
	const STAGE_NODE_DEPENDENCIES = [
		// Example dependencies for Event 1 (Open Qualifiers)
		{
			id: 1,
			nodeId: STAGE_NODES[1].id,
			dependencyMatchId: MATCHES[0].id,
			outcome: 'winner' as const
		},
		// Example dependencies for Event 1 (Group Stage A)
		{
			id: 2,
			nodeId: STAGE_NODES[3].id,
			dependencyMatchId: MATCHES[2].id,
			outcome: 'winner' as const
		},
		// Example dependencies for Event 1 (Group Stage B)
		{
			id: 3,
			nodeId: STAGE_NODES[5].id,
			dependencyMatchId: MATCHES[4].id,
			outcome: 'winner' as const
		},
		// Example dependencies for Event 1 (Playoffs)
		{
			id: 4,
			nodeId: STAGE_NODES[7].id,
			dependencyMatchId: MATCHES[6].id,
			outcome: 'winner' as const
		},
		{
			id: 5,
			nodeId: STAGE_NODES[8].id,
			dependencyMatchId: MATCHES[7].id,
			outcome: 'winner' as const
		},
		// Example dependencies for Event 2 (Swiss Stage)
		{
			id: 6,
			nodeId: STAGE_NODES[10].id,
			dependencyMatchId: MATCHES[9].id,
			outcome: 'winner' as const
		},
		// Example dependencies for Event 2 (Quarter Finals)
		{
			id: 7,
			nodeId: STAGE_NODES[12].id,
			dependencyMatchId: MATCHES[11].id,
			outcome: 'winner' as const
		},
		// Example dependencies for Event 2 (Semi Finals)
		{
			id: 8,
			nodeId: STAGE_NODES[13].id,
			dependencyMatchId: MATCHES[12].id,
			outcome: 'winner' as const
		},
		// Example dependencies for Event 2 (Grand Finals)
		{
			id: 9,
			nodeId: STAGE_NODES[14].id,
			dependencyMatchId: MATCHES[13].id,
			outcome: 'winner' as const
		},
		// Example dependencies for Event 3 (Showmatch)
		{
			id: 10,
			nodeId: STAGE_NODES[15].id,
			dependencyMatchId: MATCHES[14].id,
			outcome: 'winner' as const
		},
		// Example dependencies for Event 4 (Regional Qualifier)
		{
			id: 11,
			nodeId: STAGE_NODES[17].id,
			dependencyMatchId: MATCHES[16].id,
			outcome: 'winner' as const
		},
		// Example dependencies for Event 5 (Group Stage)
		{
			id: 12,
			nodeId: STAGE_NODES[19].id,
			dependencyMatchId: MATCHES[18].id,
			outcome: 'winner' as const
		},
		// Example dependencies for Event 5 (Playoffs)
		{
			id: 13,
			nodeId: STAGE_NODES[21].id,
			dependencyMatchId: MATCHES[20].id,
			outcome: 'winner' as const
		}
	];
	await db.insert(schema.stageNodeDependency).values(STAGE_NODE_DEPENDENCIES);

	console.info('[SEED] Seeding match teams...');
	await db.insert(schema.matchTeam).values([
		// Event 1: Open Qualifiers (BO1)
		{
			matchId: MATCHES[0].id,
			teamId: TEAMS[0].id,
			position: 0,
			score: 1
		},
		{
			matchId: MATCHES[0].id,
			teamId: TEAMS[1].id,
			position: 1,
			score: 0
		},
		{
			matchId: MATCHES[1].id,
			teamId: TEAMS[2].id,
			position: 0,
			score: 1
		},
		{
			matchId: MATCHES[1].id,
			teamId: TEAMS[3].id,
			position: 1,
			score: 0
		},
		{
			matchId: MATCHES[2].id,
			teamId: TEAMS[0].id,
			position: 0,
			score: 1
		},
		{
			matchId: MATCHES[2].id,
			teamId: TEAMS[2].id,
			position: 1,
			score: 0
		},
		{
			matchId: MATCHES[3].id,
			teamId: TEAMS[1].id,
			position: 0,
			score: 1
		},
		{
			matchId: MATCHES[3].id,
			teamId: TEAMS[3].id,
			position: 1,
			score: 0
		},
		// Event 1: Group Stage A (BO3)
		{
			matchId: MATCHES[4].id,
			teamId: TEAMS[0].id,
			position: 0,
			score: 2
		},
		{
			matchId: MATCHES[4].id,
			teamId: TEAMS[1].id,
			position: 1,
			score: 1
		},
		{
			matchId: MATCHES[5].id,
			teamId: TEAMS[2].id,
			position: 0,
			score: 2
		},
		{
			matchId: MATCHES[5].id,
			teamId: TEAMS[3].id,
			position: 1,
			score: 0
		},
		{
			matchId: MATCHES[6].id,
			teamId: TEAMS[0].id,
			position: 0,
			score: 2
		},
		{
			matchId: MATCHES[6].id,
			teamId: TEAMS[2].id,
			position: 1,
			score: 1
		},
		{
			matchId: MATCHES[7].id,
			teamId: TEAMS[1].id,
			position: 0,
			score: 2
		},
		{
			matchId: MATCHES[7].id,
			teamId: TEAMS[3].id,
			position: 1,
			score: 0
		},
		// Event 1: Group Stage B (BO3)
		{
			matchId: MATCHES[8].id,
			teamId: TEAMS[0].id,
			position: 0,
			score: 2
		},
		{
			matchId: MATCHES[8].id,
			teamId: TEAMS[3].id,
			position: 1,
			score: 1
		},
		{
			matchId: MATCHES[9].id,
			teamId: TEAMS[1].id,
			position: 0,
			score: 2
		},
		{
			matchId: MATCHES[9].id,
			teamId: TEAMS[2].id,
			position: 1,
			score: 0
		},
		{
			matchId: MATCHES[10].id,
			teamId: TEAMS[0].id,
			position: 0,
			score: 2
		},
		{
			matchId: MATCHES[10].id,
			teamId: TEAMS[1].id,
			position: 1,
			score: 1
		},
		{
			matchId: MATCHES[11].id,
			teamId: TEAMS[2].id,
			position: 0,
			score: 2
		},
		{
			matchId: MATCHES[11].id,
			teamId: TEAMS[3].id,
			position: 1,
			score: 0
		},
		// Event 1: Playoffs (BO5)
		{
			matchId: MATCHES[12].id,
			teamId: TEAMS[0].id,
			position: 0,
			score: 3
		},
		{
			matchId: MATCHES[12].id,
			teamId: TEAMS[1].id,
			position: 1,
			score: 2
		},
		{
			matchId: MATCHES[13].id,
			teamId: TEAMS[2].id,
			position: 0,
			score: 3
		},
		{
			matchId: MATCHES[13].id,
			teamId: TEAMS[3].id,
			position: 1,
			score: 1
		},
		{
			matchId: MATCHES[14].id,
			teamId: TEAMS[0].id,
			position: 0,
			score: 3
		},
		{
			matchId: MATCHES[14].id,
			teamId: TEAMS[2].id,
			position: 1,
			score: 2
		},
		{
			matchId: MATCHES[15].id,
			teamId: TEAMS[1].id,
			position: 0,
			score: 3
		},
		{
			matchId: MATCHES[15].id,
			teamId: TEAMS[3].id,
			position: 1,
			score: 1
		},
		// Event 2: Swiss Stage (BO3)
		{
			matchId: MATCHES[16].id,
			teamId: TEAMS[0].id,
			position: 0,
			score: 2
		},
		{
			matchId: MATCHES[16].id,
			teamId: TEAMS[1].id,
			position: 1,
			score: 1
		},
		{
			matchId: MATCHES[17].id,
			teamId: TEAMS[2].id,
			position: 0,
			score: 2
		},
		{
			matchId: MATCHES[17].id,
			teamId: TEAMS[3].id,
			position: 1,
			score: 0
		},
		{
			matchId: MATCHES[18].id,
			teamId: TEAMS[0].id,
			position: 0,
			score: 2
		},
		{
			matchId: MATCHES[18].id,
			teamId: TEAMS[2].id,
			position: 1,
			score: 1
		},
		{
			matchId: MATCHES[19].id,
			teamId: TEAMS[1].id,
			position: 0,
			score: 2
		},
		{
			matchId: MATCHES[19].id,
			teamId: TEAMS[3].id,
			position: 1,
			score: 0
		},
		// Event 2: Quarter Finals (BO3)
		{
			matchId: MATCHES[20].id,
			teamId: TEAMS[0].id,
			position: 0,
			score: 2
		},
		{
			matchId: MATCHES[20].id,
			teamId: TEAMS[1].id,
			position: 1,
			score: 1
		},
		{
			matchId: MATCHES[21].id,
			teamId: TEAMS[2].id,
			position: 0,
			score: 2
		},
		{
			matchId: MATCHES[21].id,
			teamId: TEAMS[3].id,
			position: 1,
			score: 0
		},
		{
			matchId: MATCHES[22].id,
			teamId: TEAMS[0].id,
			position: 0,
			score: 2
		},
		{
			matchId: MATCHES[22].id,
			teamId: TEAMS[2].id,
			position: 1,
			score: 1
		},
		{
			matchId: MATCHES[23].id,
			teamId: TEAMS[1].id,
			position: 0,
			score: 2
		},
		{
			matchId: MATCHES[23].id,
			teamId: TEAMS[3].id,
			position: 1,
			score: 0
		},
		// Event 2: Semi Finals (BO5)
		{
			matchId: MATCHES[24].id,
			teamId: TEAMS[0].id,
			position: 0,
			score: 3
		},
		{
			matchId: MATCHES[24].id,
			teamId: TEAMS[2].id,
			position: 1,
			score: 2
		},
		{
			matchId: MATCHES[25].id,
			teamId: TEAMS[1].id,
			position: 0,
			score: 3
		},
		{
			matchId: MATCHES[25].id,
			teamId: TEAMS[3].id,
			position: 1,
			score: 1
		},
		// Event 2: Grand Finals (BO5)
		{
			matchId: MATCHES[26].id,
			teamId: TEAMS[0].id,
			position: 0,
			score: 3
		},
		{
			matchId: MATCHES[26].id,
			teamId: TEAMS[1].id,
			position: 1,
			score: 2
		},
		// Event 3: Showmatch (BO1)
		{
			matchId: MATCHES[27].id,
			teamId: TEAMS[0].id,
			position: 0,
			score: 1
		},
		{
			matchId: MATCHES[27].id,
			teamId: TEAMS[1].id,
			position: 1,
			score: 0
		},
		// Event 4: Regional Qualifier (BO3)
		{
			matchId: MATCHES[28].id,
			teamId: TEAMS[0].id,
			position: 0,
			score: 2
		},
		{
			matchId: MATCHES[28].id,
			teamId: TEAMS[1].id,
			position: 1,
			score: 1
		},
		{
			matchId: MATCHES[29].id,
			teamId: TEAMS[2].id,
			position: 0,
			score: 2
		},
		{
			matchId: MATCHES[29].id,
			teamId: TEAMS[3].id,
			position: 1,
			score: 0
		},
		{
			matchId: MATCHES[30].id,
			teamId: TEAMS[0].id,
			position: 0,
			score: 2
		},
		{
			matchId: MATCHES[30].id,
			teamId: TEAMS[2].id,
			position: 1,
			score: 1
		},
		{
			matchId: MATCHES[31].id,
			teamId: TEAMS[1].id,
			position: 0,
			score: 2
		},
		{
			matchId: MATCHES[31].id,
			teamId: TEAMS[3].id,
			position: 1,
			score: 0
		},
		// Event 5: Group Stage (BO3)
		{
			matchId: MATCHES[32].id,
			teamId: TEAMS[0].id,
			position: 0,
			score: 2
		},
		{
			matchId: MATCHES[32].id,
			teamId: TEAMS[1].id,
			position: 1,
			score: 1
		},
		{
			matchId: MATCHES[33].id,
			teamId: TEAMS[2].id,
			position: 0,
			score: 2
		},
		{
			matchId: MATCHES[33].id,
			teamId: TEAMS[3].id,
			position: 1,
			score: 0
		},
		{
			matchId: MATCHES[34].id,
			teamId: TEAMS[0].id,
			position: 0,
			score: 2
		},
		{
			matchId: MATCHES[34].id,
			teamId: TEAMS[2].id,
			position: 1,
			score: 1
		},
		{
			matchId: MATCHES[35].id,
			teamId: TEAMS[1].id,
			position: 0,
			score: 2
		},
		{
			matchId: MATCHES[35].id,
			teamId: TEAMS[3].id,
			position: 1,
			score: 0
		},
		// Event 5: Playoffs (BO5)
		{
			matchId: MATCHES[36].id,
			teamId: TEAMS[0].id,
			position: 0,
			score: 3
		},
		{
			matchId: MATCHES[36].id,
			teamId: TEAMS[1].id,
			position: 1,
			score: 2
		},
		{
			matchId: MATCHES[37].id,
			teamId: TEAMS[2].id,
			position: 0,
			score: 3
		},
		{
			matchId: MATCHES[37].id,
			teamId: TEAMS[3].id,
			position: 1,
			score: 1
		},
		{
			matchId: MATCHES[38].id,
			teamId: TEAMS[0].id,
			position: 0,
			score: 3
		},
		{
			matchId: MATCHES[38].id,
			teamId: TEAMS[2].id,
			position: 1,
			score: 2
		},
		{
			matchId: MATCHES[39].id,
			teamId: TEAMS[1].id,
			position: 0,
			score: 3
		},
		{
			matchId: MATCHES[39].id,
			teamId: TEAMS[3].id,
			position: 1,
			score: 1
		}
	]);

	console.info('[SEED] Seeding match maps...');
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

	console.info('[SEED] Seeding event results...');
	await db.insert(schema.eventResult).values([
		// Event 1 (Imaginary Cup 1) Results
		{
			id: randomUUID(),
			eventId: EVENTS[0].id,
			teamId: TEAMS[0].id,
			rank: 1,
			prizeAmount: 45000,
			prizeCurrency: 'Bablo'
		},
		{
			id: randomUUID(),
			eventId: EVENTS[0].id,
			teamId: TEAMS[1].id,
			rank: 2,
			prizeAmount: 35000,
			prizeCurrency: 'Bablo'
		},
		{
			id: randomUUID(),
			eventId: EVENTS[0].id,
			teamId: TEAMS[2].id,
			rank: 3,
			rankTo: 4,
			prizeAmount: 25000,
			prizeCurrency: 'Bablo'
		},
		{
			id: randomUUID(),
			eventId: EVENTS[0].id,
			teamId: TEAMS[3].id,
			rank: 3,
			rankTo: 4,
			prizeAmount: 25000,
			prizeCurrency: 'Bablo'
		},
		// Event 2 (Imaginary Cup 2) Results
		{
			id: randomUUID(),
			eventId: EVENTS[1].id,
			teamId: TEAMS[0].id,
			rank: 1,
			prizeAmount: 50000,
			prizeCurrency: 'Bablo'
		},
		{
			id: randomUUID(),
			eventId: EVENTS[1].id,
			teamId: TEAMS[1].id,
			rank: 2,
			prizeAmount: 40000,
			prizeCurrency: 'Bablo'
		},
		{
			id: randomUUID(),
			eventId: EVENTS[1].id,
			teamId: TEAMS[2].id,
			rank: 3,
			rankTo: 4,
			prizeAmount: 30000,
			prizeCurrency: 'Bablo'
		},
		{
			id: randomUUID(),
			eventId: EVENTS[1].id,
			teamId: TEAMS[3].id,
			rank: 3,
			rankTo: 4,
			prizeAmount: 30000,
			prizeCurrency: 'Bablo'
		},
		// Event 3 (Imaginary Cup 3) Results - showing different ranking scenarios
		{
			id: randomUUID(),
			eventId: EVENTS[2].id,
			teamId: TEAMS[0].id,
			rank: 1,
			prizeAmount: 55000,
			prizeCurrency: 'Bablo'
		},
		{
			id: randomUUID(),
			eventId: EVENTS[2].id,
			teamId: TEAMS[1].id,
			rank: 2,
			prizeAmount: 45000,
			prizeCurrency: 'Bablo'
		},
		{
			id: randomUUID(),
			eventId: EVENTS[2].id,
			teamId: TEAMS[2].id,
			rank: 3,
			prizeAmount: 35000,
			prizeCurrency: 'Bablo'
		},
		{
			id: randomUUID(),
			eventId: EVENTS[2].id,
			teamId: TEAMS[3].id,
			rank: 3,
			prizeAmount: 35000,
			prizeCurrency: 'Bablo'
		},
		// Event 4 (Imaginary Cup 4) Results - showing different ranking scenarios
		{
			id: randomUUID(),
			eventId: EVENTS[3].id,
			teamId: TEAMS[0].id,
			rank: 1,
			prizeAmount: 60000,
			prizeCurrency: 'Bablo'
		},
		{
			id: randomUUID(),
			eventId: EVENTS[3].id,
			teamId: TEAMS[1].id,
			rank: 2,
			prizeAmount: 50000,
			prizeCurrency: 'Bablo'
		},
		{
			id: randomUUID(),
			eventId: EVENTS[3].id,
			teamId: TEAMS[2].id,
			rank: 3,
			prizeAmount: 40000,
			prizeCurrency: 'Bablo'
		},
		{
			id: randomUUID(),
			eventId: EVENTS[3].id,
			teamId: TEAMS[3].id,
			rank: 4,
			prizeAmount: 30000,
			prizeCurrency: 'Bablo'
		},
		// Event 5 (Imaginary Cup 5) Results - showing different ranking scenarios
		{
			id: randomUUID(),
			eventId: EVENTS[4].id,
			teamId: TEAMS[0].id,
			rank: 1,
			prizeAmount: 65000,
			prizeCurrency: 'Bablo'
		},
		{
			id: randomUUID(),
			eventId: EVENTS[4].id,
			teamId: TEAMS[1].id,
			rank: 2,
			prizeAmount: 55000,
			prizeCurrency: 'Bablo'
		},
		{
			id: randomUUID(),
			eventId: EVENTS[4].id,
			teamId: TEAMS[2].id,
			rank: 3,
			rankTo: 4,
			prizeAmount: 45000,
			prizeCurrency: 'Bablo'
		},
		{
			id: randomUUID(),
			eventId: EVENTS[4].id,
			teamId: TEAMS[3].id,
			rank: 3,
			rankTo: 4,
			prizeAmount: 45000,
			prizeCurrency: 'Bablo'
		},
		// KAWA Cup Results - showing same rank (3rd)
		{
			id: randomUUID(),
			eventId: EVENTS[5].id,
			teamId: TEAMS[0].id,
			rank: 1,
			prizeAmount: 55000,
			prizeCurrency: 'Bablo'
		},
		{
			id: randomUUID(),
			eventId: EVENTS[5].id,
			teamId: TEAMS[1].id,
			rank: 2,
			prizeAmount: 45000,
			prizeCurrency: 'Bablo'
		},
		{
			id: randomUUID(),
			eventId: EVENTS[5].id,
			teamId: TEAMS[2].id,
			rank: 3,
			prizeAmount: 35000,
			prizeCurrency: 'Bablo'
		},
		{
			id: randomUUID(),
			eventId: EVENTS[5].id,
			teamId: TEAMS[3].id,
			rank: 3,
			prizeAmount: 35000,
			prizeCurrency: 'Bablo'
		},
		// Origami Cup Results - showing normal sequential ranks
		{
			id: randomUUID(),
			eventId: EVENTS[6].id,
			teamId: TEAMS[0].id,
			rank: 1,
			prizeAmount: 60000,
			prizeCurrency: 'Bablo'
		},
		{
			id: randomUUID(),
			eventId: EVENTS[6].id,
			teamId: TEAMS[1].id,
			rank: 2,
			prizeAmount: 50000,
			prizeCurrency: 'Bablo'
		},
		{
			id: randomUUID(),
			eventId: EVENTS[6].id,
			teamId: TEAMS[2].id,
			rank: 3,
			prizeAmount: 40000,
			prizeCurrency: 'Bablo'
		},
		{
			id: randomUUID(),
			eventId: EVENTS[6].id,
			teamId: TEAMS[3].id,
			rank: 4,
			prizeAmount: 30000,
			prizeCurrency: 'Bablo'
		},
		// Mighty Meow Cup Results - showing range ranks (3rd-4th)
		{
			id: randomUUID(),
			eventId: EVENTS[7].id,
			teamId: TEAMS[0].id,
			rank: 1,
			prizeAmount: 65000,
			prizeCurrency: 'Bablo'
		},
		{
			id: randomUUID(),
			eventId: EVENTS[7].id,
			teamId: TEAMS[1].id,
			rank: 2,
			prizeAmount: 55000,
			prizeCurrency: 'Bablo'
		},
		{
			id: randomUUID(),
			eventId: EVENTS[7].id,
			teamId: TEAMS[2].id,
			rank: 3,
			rankTo: 4,
			prizeAmount: 45000,
			prizeCurrency: 'Bablo'
		},
		{
			id: randomUUID(),
			eventId: EVENTS[7].id,
			teamId: TEAMS[3].id,
			rank: 3,
			rankTo: 4,
			prizeAmount: 45000,
			prizeCurrency: 'Bablo'
		}
	]);

	console.info('[SEED] Seeding Discord servers...');
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

	console.info('[SEED] Seeding community tags...');
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

	console.info('[SEED] Seeding Discord server tags...');
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

	console.info('[SEED] Seeding sources...');
	// const sources = await db.query.source.findMany();
	// console.log(sources);

	console.info('[SEED] Seeding games...');
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

	console.info('[SEED] Seeding game teams...');
	await db.insert(schema.gameTeam).values([
		// Grand Finals Game 1
		{
			gameId: 1,
			teamId: TEAMS[0].id,
			position: 0,
			score: 13
		},
		{
			gameId: 1,
			teamId: TEAMS[1].id,
			position: 1,
			score: 11
		},
		// Grand Finals Game 2
		{
			gameId: 2,
			teamId: TEAMS[0].id,
			position: 0,
			score: 9
		},
		{
			gameId: 2,
			teamId: TEAMS[1].id,
			position: 1,
			score: 13
		},
		// Grand Finals Game 3
		{
			gameId: 3,
			teamId: TEAMS[0].id,
			position: 0,
			score: 13
		},
		{
			gameId: 3,
			teamId: TEAMS[1].id,
			position: 1,
			score: 10
		},
		// Grand Finals Game 4
		{
			gameId: 4,
			teamId: TEAMS[0].id,
			position: 0,
			score: 11
		},
		{
			gameId: 4,
			teamId: TEAMS[1].id,
			position: 1,
			score: 13
		},
		// Grand Finals Game 5
		{
			gameId: 5,
			teamId: TEAMS[0].id,
			position: 0,
			score: 13
		},
		{
			gameId: 5,
			teamId: TEAMS[1].id,
			position: 1,
			score: 9
		},
		// Semi Finals Game 1
		{
			gameId: 6,
			teamId: TEAMS[1].id,
			position: 0,
			score: 13
		},
		{
			gameId: 6,
			teamId: TEAMS[3].id,
			position: 1,
			score: 8
		},
		// Semi Finals Game 2
		{
			gameId: 7,
			teamId: TEAMS[1].id,
			position: 0,
			score: 13
		},
		{
			gameId: 7,
			teamId: TEAMS[3].id,
			position: 1,
			score: 10
		},
		// Semi Finals Game 3
		{
			gameId: 8,
			teamId: TEAMS[1].id,
			position: 0,
			score: 9
		},
		{
			gameId: 8,
			teamId: TEAMS[3].id,
			position: 1,
			score: 13
		},
		// Semi Finals Game 4
		{
			gameId: 9,
			teamId: TEAMS[1].id,
			position: 0,
			score: 13
		},
		{
			gameId: 9,
			teamId: TEAMS[3].id,
			position: 1,
			score: 11
		},
		// Semi Finals Game 5
		{
			gameId: 10,
			teamId: TEAMS[1].id,
			position: 0,
			score: 13
		},
		{
			gameId: 10,
			teamId: TEAMS[3].id,
			position: 1,
			score: 7
		}
	]);

	console.info('[SEED] Seeding game player scores...');
	await db.insert(schema.gamePlayerScore).values([
		// Grand Finals Game 1 - Team 1 Player 1
		{
			id: 1,
			gameId: 1,
			teamId: TEAMS[0].id,
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
			teamId: TEAMS[0].id,
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
			teamId: TEAMS[1].id,
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
			teamId: TEAMS[1].id,
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
			teamId: TEAMS[0].id,
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
			teamId: TEAMS[0].id,
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
			teamId: TEAMS[1].id,
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
			teamId: TEAMS[1].id,
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
			teamId: TEAMS[0].id,
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
			teamId: TEAMS[0].id,
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
			teamId: TEAMS[1].id,
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
			teamId: TEAMS[1].id,
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
			teamId: TEAMS[0].id,
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
			teamId: TEAMS[0].id,
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
			teamId: TEAMS[1].id,
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
			teamId: TEAMS[1].id,
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
			teamId: TEAMS[0].id,
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
			teamId: TEAMS[0].id,
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
			teamId: TEAMS[1].id,
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
			teamId: TEAMS[1].id,
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
			teamId: TEAMS[1].id,
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
			teamId: TEAMS[1].id,
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
			teamId: TEAMS[3].id,
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
			teamId: TEAMS[3].id,
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
			teamId: TEAMS[1].id,
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
			teamId: TEAMS[1].id,
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
			teamId: TEAMS[3].id,
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
			teamId: TEAMS[3].id,
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
			teamId: TEAMS[2].id,
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
			teamId: TEAMS[2].id,
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
			teamId: TEAMS[3].id,
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
			teamId: TEAMS[3].id,
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
			teamId: TEAMS[2].id,
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
			teamId: TEAMS[2].id,
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
			teamId: TEAMS[3].id,
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
			teamId: TEAMS[3].id,
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
			teamId: TEAMS[1].id,
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
			teamId: TEAMS[1].id,
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
			teamId: TEAMS[3].id,
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
			teamId: TEAMS[3].id,
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

	// After seeding events, add some sample videos
	console.info('[SEED] Seeding event videos...');
	await db.insert(schema.eventVideo).values([
		{
			id: randomUUID(),
			eventId: EVENTS[0].id,
			type: 'stream',
			url: 'https://www.twitch.tv/example1',
			platform: 'twitch',
			title: 'Day 1 Main Stream',
			createdAt: new Date(),
			updatedAt: new Date()
		},
		{
			id: randomUUID(),
			eventId: EVENTS[0].id,
			type: 'vod',
			url: 'https://www.youtube.com/watch?v=example1',
			platform: 'youtube',
			title: 'Grand Finals VOD',
			createdAt: new Date(),
			updatedAt: new Date()
		},
		{
			id: randomUUID(),
			eventId: EVENTS[1].id,
			type: 'clip',
			url: 'https://www.twitch.tv/example2/clip/example',
			platform: 'twitch',
			title: 'Amazing Play Highlight',
			createdAt: new Date(),
			updatedAt: new Date()
		}
	]);

	// After seeding event videos, add some sample casters
	console.info('[SEED] Seeding event casters...');
	await db.insert(schema.eventCaster).values([
		// Event 1 casters
		{
			eventId: EVENTS[0].id,
			playerId: PLAYERS[0].id,
			role: 'host',
			createdAt: new Date(),
			updatedAt: new Date()
		},
		{
			eventId: EVENTS[0].id,
			playerId: PLAYERS[1].id,
			role: 'commentator',
			createdAt: new Date(),
			updatedAt: new Date()
		},
		{
			eventId: EVENTS[0].id,
			playerId: PLAYERS[2].id,
			role: 'analyst',
			createdAt: new Date(),
			updatedAt: new Date()
		},
		// Event 2 casters
		{
			eventId: EVENTS[1].id,
			playerId: PLAYERS[3].id,
			role: 'host',
			createdAt: new Date(),
			updatedAt: new Date()
		},
		{
			eventId: EVENTS[1].id,
			playerId: PLAYERS[4].id,
			role: 'commentator',
			createdAt: new Date(),
			updatedAt: new Date()
		},
		// Event 3 casters
		{
			eventId: EVENTS[2].id,
			playerId: PLAYERS[5].id,
			role: 'host',
			createdAt: new Date(),
			updatedAt: new Date()
		},
		{
			eventId: EVENTS[2].id,
			playerId: PLAYERS[0].id,
			role: 'analyst',
			createdAt: new Date(),
			updatedAt: new Date()
		},
		{
			eventId: EVENTS[2].id,
			playerId: PLAYERS[1].id,
			role: 'commentator',
			createdAt: new Date(),
			updatedAt: new Date()
		}
	] as Array<typeof schema.eventCaster.$inferInsert>);
}
