import * as schema from '$lib/server/db/schema';
import { db } from '$lib/server/db';
import { randomUUID } from 'node:crypto';
import { PLAYER_ADDITIONAL_NATIONALITIES, PLAYERS } from './seeds/players';
import { TEAMS, TEAM_PLAYERS } from './seeds/teams';
import { ORGANIZERS } from './seeds/organizers';
import {
	EVENTS,
	EVENT_WEBSITES,
	EVENT_ORGANIZERS,
	EVENT_TEAM_PLAYERS,
	EVENT_RESULTS
} from './seeds/events';
import {
	STAGES,
	MATCHES,
	STAGE_ROUNDS,
	STAGE_NODES,
	STAGE_NODE_DEPENDENCIES
} from './seeds/stages';
import { MATCH_TEAMS, MATCH_MAPS } from './seeds/matches';
import { DISCORD_SERVERS, COMMUNITY_TAGS, DISCORD_SERVER_TAGS } from './seeds/community';

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
	await db.insert(schema.stage).values(STAGES);

	console.info('[SEED] Seeding matches...');
	await db.insert(schema.match).values(MATCHES);

	console.info('[SEED] Seeding stage rounds...');
	await db.insert(schema.stageRound).values(STAGE_ROUNDS);

	console.info('[SEED] Seeding stage nodes...');
	await db.insert(schema.stageNode).values(STAGE_NODES);

	console.info('[SEED] Seeding stage node dependencies...');
	await db.insert(schema.stageNodeDependency).values(STAGE_NODE_DEPENDENCIES);

	console.info('[SEED] Seeding match teams...');
	await db.insert(schema.matchTeam).values(MATCH_TEAMS);

	console.info('[SEED] Seeding match maps...');
	await db.insert(schema.matchMap).values(MATCH_MAPS);

	console.info('[SEED] Seeding event results...');
	await db.insert(schema.eventResult).values(EVENT_RESULTS);

	console.info('[SEED] Seeding Discord servers...');
	await db.insert(schema.discordServer).values(DISCORD_SERVERS);

	console.info('[SEED] Seeding community tags...');
	await db.insert(schema.communityTag).values(COMMUNITY_TAGS);

	console.info('[SEED] Seeding Discord server tags...');
	await db.insert(schema.discordServerTag).values(DISCORD_SERVER_TAGS);

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
