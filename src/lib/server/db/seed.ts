import * as schema from '$lib/server/db/schema';
import { db } from '$lib/server/db';
import { PLAYER_ADDITIONAL_NATIONALITIES, PLAYERS } from './seeds/players';
import { TEAMS, TEAM_PLAYERS } from './seeds/teams';
import { ORGANIZERS } from './seeds/organizers';
import {
	EVENTS,
	EVENT_WEBSITES,
	EVENT_ORGANIZERS,
	EVENT_TEAM_PLAYERS,
	EVENT_RESULTS,
	EVENT_VIDEOS,
	EVENT_CASTERS
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
import { GAMES, GAME_TEAMS, GAME_PLAYER_SCORES } from './seeds/games';
import { GAME_ACCOUNTS } from './seeds/game-accounts';
import { GAME_VODS } from './seeds/game-vods';

export async function seed() {
	console.info('[SEED] Starting seeding...');

	// Clear only game-related tables, preserving user data
	console.info('[SEED] Clearing existing game data...');
	// Delete child records first
	await db.delete(schema.gamePlayerScore);
	console.info('[SEED] - Deleted gamePlayerScore');
	await db.delete(schema.gameTeam);
	console.info('[SEED] - Deleted gameTeam');
	await db.delete(schema.gameVod);
	console.info('[SEED] - Deleted gameVod');
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
	await db.delete(schema.communityTag);
	console.info('[SEED] - Deleted communityTag');
	await db.delete(schema.discordServer);
	console.info('[SEED] - Deleted discordServer');
	await db.delete(schema.organizer);
	console.info('[SEED] - Deleted organizer');
	// Preserve user-related tables: user, role, userRole, session, editHistory

	console.info('[SEED] Seeding players...');
	await db.insert(schema.player).values(PLAYERS);

	console.info('[SEED] Seeding game accounts...');
	await db.insert(schema.gameAccount).values(GAME_ACCOUNTS);

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
	await db.insert(schema.game).values(GAMES);

	console.info('[SEED] Seeding game teams...');
	await db.insert(schema.gameTeam).values(GAME_TEAMS);

	console.info('[SEED] Seeding game player scores...');
	await db.insert(schema.gamePlayerScore).values(GAME_PLAYER_SCORES);

	console.info('[SEED] Seeding game VODs...');
	await db.insert(schema.gameVod).values(GAME_VODS);

	// After seeding events, add some sample videos
	console.info('[SEED] Seeding event videos...');
	await db.insert(schema.eventVideo).values(EVENT_VIDEOS);

	// After seeding event videos, add some sample casters
	console.info('[SEED] Seeding event casters...');
	await db.insert(schema.eventCaster).values(EVENT_CASTERS);
}
