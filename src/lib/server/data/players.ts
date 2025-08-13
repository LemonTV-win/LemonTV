import { db } from '$lib/server/db';
import {
	player,
	playerAlias,
	gameAccount,
	player_social_account,
	social_platform,
	editHistory,
	playerAdditionalNationality
} from '$lib/server/db/schema';
import { eq, or, and, inArray } from 'drizzle-orm';
import type { Player, PlayerTeam } from '$lib/data/players';
import { randomUUID } from 'node:crypto';
import type { Team } from '$lib/data/teams';
import type { Character, GameMap, Region } from '$lib/data/game';
import type { TCountryCode } from 'countries-list';

import * as schema from '$lib/server/db/schema';
import type { Match, PlayerScore } from '$lib/data/matches';
import type { Event } from '$lib/data/events';
import { formatSlug } from '$lib/utils/strings';

// Unified player statistics interface
export interface PlayerStats {
	wins: number;
	losses: number;
	totalGames: number;
	winRate: number;
	kd: number;
	totalKills: number;
	totalDeaths: number;
	totalAssists: number;
	totalDamage: number;
	averageScore: number;
	agents: [Character, number][];
	mapStats: {
		mapId: GameMap;
		wins: number;
		losses: number;
		winrate: number;
	}[];
	events: {
		id: string;
		slug: string;
		name: string;
		image: string;
		date: string;
		region: string;
		format: string;
		status: string;
		server: string;
		capacity: number;
		official: boolean;
		role: string;
	}[];
	matches: {
		id: string;
		format: string | null;
		stageId: number | null;
		// Event data
		eventId: string;
		eventSlug: string;
		eventName: string;
		eventImage: string;
		eventDate: string;
		eventRegion: string;
		eventFormat: string;
		eventStatus: string;
		eventServer: string;
		eventCapacity: number;
		eventOfficial: boolean;
		// Stage data
		stageTitle: string;
		stageStage: string;
		stageFormat: string;
		// Player's role in the event
		role: string;
	}[];
}

// Simplified essential player statistics for lists
export interface PlayerEssentialStats {
	playerId: string;
	wins: number;
	rating: number;
	kd: number;
	eventsCount: number;
}

// Unified function to get all player statistics
export async function getServerPlayerStats(playerId: string): Promise<PlayerStats> {
	console.info('[Players] Fetching unified stats for player:', playerId);

	// Get the player's game accounts
	const playerAccounts = await db
		.select()
		.from(gameAccount)
		.where(eq(gameAccount.playerId, playerId));

	if (playerAccounts.length === 0) {
		console.warn('[Players] No game accounts found for player:', playerId);
		return {
			wins: 0,
			losses: 0,
			totalGames: 0,
			winRate: 0,
			kd: 0,
			totalKills: 0,
			totalDeaths: 0,
			totalAssists: 0,
			totalDamage: 0,
			averageScore: 0,
			agents: [],
			mapStats: [],
			events: [],
			matches: []
		};
	}

	// Get all account IDs for this player
	const accountIds = playerAccounts.map((acc) => acc.accountId);

	// Get all games where this player participated
	const playerGames = await db
		.select({
			gameId: schema.game.id,
			winner: schema.game.winner,
			teamId: schema.gamePlayerScore.teamId,
			accountId: schema.gamePlayerScore.accountId,
			teamPosition: schema.gameTeam.position
		})
		.from(schema.game)
		.innerJoin(schema.gamePlayerScore, eq(schema.game.id, schema.gamePlayerScore.gameId))
		.innerJoin(schema.gameTeam, eq(schema.gamePlayerScore.teamId, schema.gameTeam.teamId))
		.where(inArray(schema.gamePlayerScore.accountId, accountIds));

	// Get all player scores for this player
	const playerScores = await db
		.select({
			characterFirstHalf: schema.gamePlayerScore.characterFirstHalf,
			characterSecondHalf: schema.gamePlayerScore.characterSecondHalf,
			kills: schema.gamePlayerScore.kills,
			deaths: schema.gamePlayerScore.deaths,
			assists: schema.gamePlayerScore.assists,
			damage: schema.gamePlayerScore.damage,
			score: schema.gamePlayerScore.score
		})
		.from(schema.gamePlayerScore)
		.where(inArray(schema.gamePlayerScore.accountId, accountIds));

	// Calculate wins
	let wins = 0;
	const processedGames = new Set<number>();

	for (const game of playerGames) {
		if (processedGames.has(game.gameId)) {
			continue;
		}

		// Find which team the player was on in this game
		const playerTeam = playerGames.find(
			(gt) => gt.gameId === game.gameId && accountIds.includes(gt.accountId)
		);

		if (playerTeam) {
			// Check if player's team won using the actual team position
			// winner: 0 = team A won, 1 = team B won
			const playerWon = game.winner === playerTeam.teamPosition;

			if (playerWon) {
				wins++;
			}

			processedGames.add(game.gameId);
		}
	}

	// Calculate KD and other stats
	let totalKills = 0;
	let totalDeaths = 0;
	let totalAssists = 0;
	let totalDamage = 0;
	let totalScore = 0;

	for (const score of playerScores) {
		totalKills += score.kills;
		totalDeaths += score.deaths;
		totalAssists += score.assists;
		totalDamage += score.damage;
		totalScore += score.score;
	}

	const kd = totalDeaths > 0 ? totalKills / totalDeaths : totalKills;
	const averageScore = playerScores.length > 0 ? totalScore / playerScores.length : 0;
	const totalGames = processedGames.size;
	const losses = totalGames - wins;
	const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;

	// Calculate agents
	const characterCounts = new Map<Character, number>();

	for (const score of playerScores) {
		if (score.characterFirstHalf) {
			const character = score.characterFirstHalf as Character;
			characterCounts.set(character, (characterCounts.get(character) ?? 0) + 1);
		}

		if (score.characterSecondHalf) {
			const character = score.characterSecondHalf as Character;
			characterCounts.set(character, (characterCounts.get(character) ?? 0) + 1);
		}
	}

	const agents = Array.from(characterCounts.entries()).sort((a, b) => b[1] - a[1]);

	// Get map stats
	const mapStats = await getServerPlayerMapStats(playerId);

	// Get events
	const events = await getServerPlayerEvents(playerId);

	// Get matches
	const matches = await getServerPlayerMatches(playerId);

	console.info('[Players] Successfully retrieved unified stats for player:', playerId);
	return {
		wins,
		losses, // Total games - wins
		totalGames,
		winRate,
		kd,
		totalKills,
		totalDeaths,
		totalAssists,
		totalDamage,
		averageScore,
		agents,
		mapStats,
		events,
		matches
	};
}

export async function getPlayer(keyword: string): Promise<Player | null> {
	console.info('[Players] Attempting to get player:', keyword);

	const playerData = await db.query.player.findFirst({
		where: (player, { eq, or }) =>
			or(eq(player.id, keyword), eq(player.slug, keyword), eq(player.name, keyword)),
		with: {
			gameAccounts: true,
			aliases: true,
			additionalNationalities: true,
			socialAccounts: {
				with: {
					platform: true
				}
			},
			teamMemberships: {
				with: {
					team: true
				}
			},
			user: {
				with: {
					roles: {
						with: {
							role: true
						}
					}
				}
			}
		}
	});

	if (!playerData) {
		console.warn('[Players] Player not found:', keyword);
		return null;
	}

	console.info('[Players] Successfully retrieved player:', keyword);
	return {
		id: playerData.id,
		slug: playerData.slug,
		name: playerData.name,
		avatar: playerData.avatar || undefined,
		nationalities: playerData.nationality
			? [
					playerData.nationality as TCountryCode,
					...(playerData.additionalNationalities?.map((n) => n.nationality as TCountryCode) || [])
				]
			: playerData.additionalNationalities?.map((n) => n.nationality as TCountryCode) || [],
		aliases: playerData.aliases?.map((a) => a.alias) || [],
		gameAccounts: (playerData.gameAccounts || []).map((acc) => ({
			accountId: acc.accountId,
			currentName: acc.currentName,
			region: acc.region as Player['gameAccounts'][0]['region'],
			server: acc.server as 'Strinova' | 'CalabiYau' // TODO: Add validation
		})),
		socialAccounts: (playerData.socialAccounts || []).map((acc) => ({
			platformId: acc.platformId,
			accountId: acc.accountId,
			overridingUrl: acc.overriding_url || undefined
		})),
		user: playerData.user
			? {
					id: playerData.user.id,
					username: playerData.user.username,
					email: playerData.user.email,
					roles:
						playerData.user.roles
							?.map((ur) => ur.role.name as 'admin' | 'editor')
							.filter(
								(role): role is 'admin' | 'editor' => role === 'admin' || role === 'editor'
							) || []
				}
			: undefined,
		teams:
			playerData.teamMemberships?.map((tm) => ({
				id: tm.team.id,
				name: tm.team.name,
				slug: tm.team.slug,
				abbr: tm.team.abbr || null,
				logo: tm.team.logo || null,
				region: (tm.team.region as Region) || null,
				createdAt: tm.team.createdAt,
				updatedAt: tm.team.updatedAt,
				role: tm.role as PlayerTeam['role'],
				startedOn: tm.startedOn || undefined,
				endedOn: tm.endedOn || undefined,
				note: tm.note || undefined
			})) || []
	};
}

export async function getPlayers(): Promise<Player[]> {
	const totalStart = performance.now();
	console.info('[Players] Fetching all players');

	const playersQueryStart = performance.now();
	const players = await db.select().from(player);
	const playersQueryDuration = performance.now() - playersQueryStart;
	console.info(`[Players] Players query took ${playersQueryDuration.toFixed(2)}ms`);

	const aliasesQueryStart = performance.now();
	const aliases = await db.select().from(playerAlias);
	const aliasesQueryDuration = performance.now() - aliasesQueryStart;
	console.info(`[Players] Aliases query took ${aliasesQueryDuration.toFixed(2)}ms`);

	const accountsQueryStart = performance.now();
	const accounts = await db.select().from(gameAccount);
	const accountsQueryDuration = performance.now() - accountsQueryStart;
	console.info(`[Players] Game accounts query took ${accountsQueryDuration.toFixed(2)}ms`);

	const socialAccountsQueryStart = performance.now();
	const socialAccounts = await db.select().from(player_social_account);
	const socialAccountsQueryDuration = performance.now() - socialAccountsQueryStart;
	console.info(`[Players] Social accounts query took ${socialAccountsQueryDuration.toFixed(2)}ms`);

	const nationalitiesQueryStart = performance.now();
	const additionalNationalities = await db.select().from(playerAdditionalNationality);
	const nationalitiesQueryDuration = performance.now() - nationalitiesQueryStart;
	console.info(
		`[Players] Additional nationalities query took ${nationalitiesQueryDuration.toFixed(2)}ms`
	);

	const dataProcessingStart = performance.now();
	const aliasesByPlayer = new Map<string, string[]>();
	for (const alias of aliases) {
		if (!aliasesByPlayer.has(alias.playerId)) {
			aliasesByPlayer.set(alias.playerId, []);
		}
		aliasesByPlayer.get(alias.playerId)!.push(alias.alias);
	}

	const accountsByPlayer = new Map<string, typeof accounts>();
	for (const acc of accounts) {
		if (!accountsByPlayer.has(acc.playerId)) {
			accountsByPlayer.set(acc.playerId, []);
		}
		accountsByPlayer.get(acc.playerId)!.push(acc);
	}

	const socialAccountsByPlayer = new Map<string, typeof socialAccounts>();
	for (const acc of socialAccounts) {
		if (!socialAccountsByPlayer.has(acc.playerId)) {
			socialAccountsByPlayer.set(acc.playerId, []);
		}
		socialAccountsByPlayer.get(acc.playerId)!.push(acc);
	}

	const additionalNationalitiesByPlayer = new Map<string, string[]>();
	for (const nat of additionalNationalities) {
		if (!additionalNationalitiesByPlayer.has(nat.playerId)) {
			additionalNationalitiesByPlayer.set(nat.playerId, []);
		}
		additionalNationalitiesByPlayer.get(nat.playerId)!.push(nat.nationality);
	}

	const result: Player[] = players.map((p) => ({
		id: p.id,
		name: p.name,
		slug: p.slug,
		avatar: p.avatar || undefined,
		nationalities: p.nationality
			? [
					p.nationality as TCountryCode,
					...(additionalNationalitiesByPlayer.get(p.id) || []).map((n) => n as TCountryCode)
				]
			: (additionalNationalitiesByPlayer.get(p.id) || []).map((n) => n as TCountryCode),
		aliases: aliasesByPlayer.get(p.id) ?? [],
		gameAccounts: (accountsByPlayer.get(p.id) ?? []).map((acc) => ({
			accountId: acc.accountId,
			currentName: acc.currentName,
			region: acc.region as Player['gameAccounts'][0]['region'],
			server: acc.server as 'Strinova' | 'CalabiYau' // TODO: Add validation
		})),
		socialAccounts: (socialAccountsByPlayer.get(p.id) ?? []).map((acc) => ({
			platformId: acc.platformId,
			accountId: acc.accountId,
			overridingUrl: acc.overriding_url || undefined
		})),
		user: p.userId
			? {
					id: p.userId,
					username: '',
					email: '',
					roles: []
				}
			: undefined
	}));
	const dataProcessingDuration = performance.now() - dataProcessingStart;
	console.info(`[Players] Data processing took ${dataProcessingDuration.toFixed(2)}ms`);

	const totalDuration = performance.now() - totalStart;
	console.info(
		`[Players] Total getPlayers took ${totalDuration.toFixed(2)}ms - Successfully retrieved ${result.length} players`
	);
	return result;
}

export async function getPlayersTeams(): Promise<Record<string, Team[]>> {
	const totalStart = performance.now();
	console.info('[Players] Fetching players teams');

	const queryStart = performance.now();
	const rows = await db
		.select()
		.from(schema.player)
		.innerJoin(schema.teamPlayer, eq(schema.teamPlayer.playerId, schema.player.id))
		.innerJoin(schema.team, eq(schema.teamPlayer.teamId, schema.team.id));
	const queryDuration = performance.now() - queryStart;
	console.info(`[Players] Players teams query took ${queryDuration.toFixed(2)}ms`);

	const processingStart = performance.now();
	const result: Record<string, Team[]> = {};

	for (const row of rows) {
		if (!result[row.player.id]) {
			result[row.player.id] = [];
		}

		// Check if this team is already added to this player
		const teamAlreadyExists = result[row.player.id].some((team) => team.id === row.teams.id);

		if (!teamAlreadyExists) {
			result[row.player.id].push({
				id: row.teams.id,
				name: row.teams.name,
				slug: row.teams.slug,
				abbr: row.teams.abbr || null,
				logo: row.teams.logo || null,
				region: (row.teams.region as Region) || null,
				createdAt: row.teams.createdAt,
				updatedAt: row.teams.updatedAt
			});
		}
	}

	const processingDuration = performance.now() - processingStart;
	console.info(`[Players] Players teams processing took ${processingDuration.toFixed(2)}ms`);

	const totalDuration = performance.now() - totalStart;
	console.info(`[Players] Total getPlayersTeams took ${totalDuration.toFixed(2)}ms`);
	return result;
}

export async function getServerPlayerAgents(playerId: string): Promise<[Character, number][]> {
	console.info('[Players] Fetching server player agents for:', playerId);

	// Get the player's game accounts
	const playerAccounts = await db
		.select()
		.from(gameAccount)
		.where(eq(gameAccount.playerId, playerId));

	if (playerAccounts.length === 0) {
		console.warn('[Players] No game accounts found for player:', playerId);
		return [];
	}

	// Get all account IDs for this player
	const accountIds = playerAccounts.map((acc) => acc.accountId);

	// Find all games where this player participated
	const playerScores = await db
		.select({
			characterFirstHalf: schema.gamePlayerScore.characterFirstHalf,
			characterSecondHalf: schema.gamePlayerScore.characterSecondHalf
		})
		.from(schema.gamePlayerScore)
		.where(inArray(schema.gamePlayerScore.accountId, accountIds));

	// Count occurrences of each character (both first and second half)
	const characterCounts = new Map<Character, number>();

	for (const score of playerScores) {
		// Count first half character
		if (score.characterFirstHalf) {
			const character = score.characterFirstHalf as Character;
			characterCounts.set(character, (characterCounts.get(character) ?? 0) + 1);
		}

		// Count second half character
		if (score.characterSecondHalf) {
			const character = score.characterSecondHalf as Character;
			characterCounts.set(character, (characterCounts.get(character) ?? 0) + 1);
		}
	}

	// Convert to array of tuples and sort by count (descending)
	const result = Array.from(characterCounts.entries()).sort((a, b) => b[1] - a[1]);

	console.info('[Players] Found', result.length, 'unique characters for player:', playerId);
	return result;
}

export async function getServerPlayersAgents(
	playerIds: string[],
	limit: number = 3
): Promise<Record<string, [Character, number][]>> {
	console.info('[Players] Fetching server players agents for:', playerIds.length, 'players');

	if (playerIds.length === 0) {
		return {};
	}

	// Get all game accounts for these players
	const allPlayerAccounts = await db
		.select()
		.from(gameAccount)
		.where(inArray(gameAccount.playerId, playerIds));

	// Group accounts by player ID
	const accountsByPlayer = new Map<string, number[]>();
	for (const account of allPlayerAccounts) {
		if (!accountsByPlayer.has(account.playerId)) {
			accountsByPlayer.set(account.playerId, []);
		}
		accountsByPlayer.get(account.playerId)!.push(account.accountId);
	}

	// Get all account IDs
	const allAccountIds = allPlayerAccounts.map((acc) => acc.accountId);

	if (allAccountIds.length === 0) {
		console.warn('[Players] No game accounts found for any of the players');
		return Object.fromEntries(playerIds.map((id) => [id, []]));
	}

	// Find all games where these players participated
	const allPlayerScores = await db
		.select({
			accountId: schema.gamePlayerScore.accountId,
			characterFirstHalf: schema.gamePlayerScore.characterFirstHalf,
			characterSecondHalf: schema.gamePlayerScore.characterSecondHalf
		})
		.from(schema.gamePlayerScore)
		.where(inArray(schema.gamePlayerScore.accountId, allAccountIds));

	// Group scores by player ID
	const scoresByPlayer = new Map<string, typeof allPlayerScores>();
	for (const score of allPlayerScores) {
		// Find which player this account belongs to
		for (const [playerId, accountIds] of accountsByPlayer.entries()) {
			if (accountIds.includes(score.accountId)) {
				if (!scoresByPlayer.has(playerId)) {
					scoresByPlayer.set(playerId, []);
				}
				scoresByPlayer.get(playerId)!.push(score);
				break;
			}
		}
	}

	// Calculate character counts for each player
	const result: Record<string, [Character, number][]> = {};

	for (const playerId of playerIds) {
		const playerScores = scoresByPlayer.get(playerId) || [];
		const characterCounts = new Map<Character, number>();

		for (const score of playerScores) {
			// Count first half character
			if (score.characterFirstHalf) {
				const character = score.characterFirstHalf as Character;
				characterCounts.set(character, (characterCounts.get(character) ?? 0) + 1);
			}

			// Count second half character
			if (score.characterSecondHalf) {
				const character = score.characterSecondHalf as Character;
				characterCounts.set(character, (characterCounts.get(character) ?? 0) + 1);
			}
		}

		// Convert to array of tuples, sort by count (descending), and limit
		const sortedCharacters = Array.from(characterCounts.entries()).sort((a, b) => b[1] - a[1]);

		const slicedCharacters = limit > 0 ? sortedCharacters.slice(0, limit) : sortedCharacters;

		result[playerId] = slicedCharacters;
	}

	console.info('[Players] Found agents for', Object.keys(result).length, 'players');
	return result;
}

export async function getServerPlayerMapStats(playerId: string): Promise<
	{
		mapId: GameMap;
		wins: number;
		losses: number;
		winrate: number;
	}[]
> {
	console.info('[Players] Fetching server player map stats for:', playerId);

	// Get the player's game accounts
	const playerAccounts = await db
		.select()
		.from(gameAccount)
		.where(eq(gameAccount.playerId, playerId));

	if (playerAccounts.length === 0) {
		console.warn('[Players] No game accounts found for player:', playerId);
		return [];
	}

	// Get all account IDs for this player
	const accountIds = playerAccounts.map((acc) => acc.accountId);

	// Find all games where this player participated with map and team information
	const playerGames = await db
		.select({
			gameId: schema.game.id,
			mapId: schema.game.mapId,
			winner: schema.game.winner,
			teamId: schema.gamePlayerScore.teamId,
			accountId: schema.gamePlayerScore.accountId,
			teamPosition: schema.gameTeam.position
		})
		.from(schema.game)
		.innerJoin(schema.gamePlayerScore, eq(schema.game.id, schema.gamePlayerScore.gameId))
		.innerJoin(schema.gameTeam, eq(schema.gamePlayerScore.teamId, schema.gameTeam.teamId))
		.where(inArray(schema.gamePlayerScore.accountId, accountIds));

	// Group games by map and calculate wins/losses
	const mapStats = new Map<GameMap, { wins: number; losses: number }>();

	for (const game of playerGames) {
		if (!mapStats.has(game.mapId)) {
			mapStats.set(game.mapId, { wins: 0, losses: 0 });
		}

		const stats = mapStats.get(game.mapId)!;

		// Find which team the player was on in this game
		const playerTeam = playerGames.find(
			(gt) => gt.gameId === game.gameId && gt.accountId === game.accountId
		);

		if (playerTeam) {
			// Check if player's team won using the actual team position
			// winner: 0 = team A won, 1 = team B won
			const playerWon = game.winner === playerTeam.teamPosition;

			if (playerWon) {
				stats.wins++;
			} else {
				stats.losses++;
			}
		}
	}

	// Convert to array with winrate calculation
	const result = Array.from(mapStats.entries()).map(([mapId, stats]) => {
		const total = stats.wins + stats.losses;
		const winrate = total > 0 ? (stats.wins / total) * 100 : 0;

		return {
			mapId,
			wins: stats.wins,
			losses: stats.losses,
			winrate
		};
	});

	// Sort by total games played (descending), then by winrate (descending)
	result.sort((a, b) => {
		const totalA = a.wins + a.losses;
		const totalB = b.wins + b.losses;
		if (totalA !== totalB) {
			return totalB - totalA;
		}
		return b.winrate - a.winrate;
	});

	console.info('[Players] Found map stats for', result.length, 'maps for player:', playerId);
	return result;
}

export async function getServerPlayerEvents(id: string): Promise<
	{
		id: string;
		slug: string;
		name: string;
		image: string;
		date: string;
		region: string;
		format: string;
		status: string;
		server: string;
		capacity: number;
		official: boolean;
		role: string;
	}[]
> {
	return await db
		.select({
			// Event data
			id: schema.event.id,
			slug: schema.event.slug,
			name: schema.event.name,
			image: schema.event.image,
			date: schema.event.date,
			region: schema.event.region,
			format: schema.event.format,
			status: schema.event.status,
			server: schema.event.server,
			capacity: schema.event.capacity,
			official: schema.event.official,
			// Player's role in this event
			role: schema.eventTeamPlayer.role
		})
		.from(schema.eventTeamPlayer)
		.innerJoin(schema.event, eq(schema.eventTeamPlayer.eventId, schema.event.id))
		.where(eq(schema.eventTeamPlayer.playerId, id));
}

export async function getServerPlayerMatches(id: string): Promise<
	{
		id: string;
		format: string | null;
		stageId: number | null;
		// Event data
		eventId: string;
		eventSlug: string;
		eventName: string;
		eventImage: string;
		eventDate: string;
		eventRegion: string;
		eventFormat: string;
		eventStatus: string;
		eventServer: string;
		eventCapacity: number;
		eventOfficial: boolean;
		// Stage data
		stageTitle: string;
		stageStage: string;
		stageFormat: string;
		// Player's role in the event
		role: string;
	}[]
> {
	return await db
		.select({
			// Match data
			id: schema.match.id,
			format: schema.match.format,
			stageId: schema.match.stageId,
			// Event data
			eventId: schema.event.id,
			eventSlug: schema.event.slug,
			eventName: schema.event.name,
			eventImage: schema.event.image,
			eventDate: schema.event.date,
			eventRegion: schema.event.region,
			eventFormat: schema.event.format,
			eventStatus: schema.event.status,
			eventServer: schema.event.server,
			eventCapacity: schema.event.capacity,
			eventOfficial: schema.event.official,
			// Stage data
			stageTitle: schema.stage.title,
			stageStage: schema.stage.stage,
			stageFormat: schema.stage.format,
			// Player's role in the event
			role: schema.eventTeamPlayer.role
		})
		.from(schema.gamePlayerScore)
		.innerJoin(schema.game, eq(schema.gamePlayerScore.gameId, schema.game.id))
		.innerJoin(schema.match, eq(schema.game.matchId, schema.match.id))
		.innerJoin(schema.stage, eq(schema.match.stageId, schema.stage.id))
		.innerJoin(schema.event, eq(schema.stage.eventId, schema.event.id))
		.innerJoin(schema.eventTeamPlayer, eq(schema.eventTeamPlayer.eventId, schema.event.id))
		.where(and(eq(schema.eventTeamPlayer.playerId, id), eq(schema.gamePlayerScore.player, id)));
}

export async function getServerPlayerDetailedMatches(playerId: string): Promise<
	{
		id: string;
		format: string | null;
		stageId: number | null;
		teams: Array<{
			team: string;
			teamId: string;
			score: number;
		}>;
		games: Array<{
			winner: number;
		}>;
		// Event data
		event: {
			id: string;
			slug: string;
			name: string;
			image: string;
			date: string;
			region: string;
			format: string;
			status: string;
			server: string;
			capacity: number;
			official: boolean;
		};
		// Player's team index in this match
		playerTeamIndex: number;
	}[]
> {
	// Get the player's game accounts
	const playerAccounts = await db
		.select()
		.from(gameAccount)
		.where(eq(gameAccount.playerId, playerId));

	if (playerAccounts.length === 0) {
		return [];
	}

	// Get all account IDs for this player
	const accountIds = playerAccounts.map((acc) => acc.accountId);

	// Get all matches where this player participated
	const playerMatches = await db
		.select({
			// Match data
			matchId: schema.match.id,
			format: schema.match.format,
			stageId: schema.match.stageId,
			// Event data
			eventId: schema.event.id,
			eventSlug: schema.event.slug,
			eventName: schema.event.name,
			eventImage: schema.event.image,
			eventDate: schema.event.date,
			eventRegion: schema.event.region,
			eventFormat: schema.event.format,
			eventStatus: schema.event.status,
			eventServer: schema.event.server,
			eventCapacity: schema.event.capacity,
			eventOfficial: schema.event.official,
			// Player's team position in this match
			playerTeamPosition: schema.gameTeam.position
		})
		.from(schema.gamePlayerScore)
		.innerJoin(schema.game, eq(schema.gamePlayerScore.gameId, schema.game.id))
		.innerJoin(schema.match, eq(schema.game.matchId, schema.match.id))
		.innerJoin(schema.stage, eq(schema.match.stageId, schema.stage.id))
		.innerJoin(schema.event, eq(schema.stage.eventId, schema.event.id))
		.innerJoin(schema.gameTeam, eq(schema.gamePlayerScore.teamId, schema.gameTeam.teamId))
		.where(
			and(
				inArray(schema.gamePlayerScore.accountId, accountIds),
				eq(schema.gamePlayerScore.gameId, schema.game.id)
			)
		);

	// Get unique match IDs
	const matchIds = [...new Set(playerMatches.map((pm) => pm.matchId))];

	// Get all teams for these matches - try match_team first, fallback to game_team
	const matchTeams = await db
		.select({
			matchId: schema.matchTeam.matchId,
			teamId: schema.matchTeam.teamId,
			position: schema.matchTeam.position,
			score: schema.matchTeam.score,
			teamName: schema.team.name,
			teamSlug: schema.team.slug,
			teamAbbr: schema.team.abbr
		})
		.from(schema.matchTeam)
		.innerJoin(schema.team, eq(schema.matchTeam.teamId, schema.team.id))
		.where(inArray(schema.matchTeam.matchId, matchIds))
		.orderBy(schema.matchTeam.position);

	// If we don't have match teams, try to get teams from game_team
	let fallbackTeams: typeof matchTeams = [];
	if (matchTeams.length === 0) {
		fallbackTeams = await db
			.select({
				matchId: schema.game.matchId,
				teamId: schema.gameTeam.teamId,
				position: schema.gameTeam.position,
				score: schema.gameTeam.score,
				teamName: schema.team.name,
				teamSlug: schema.team.slug,
				teamAbbr: schema.team.abbr
			})
			.from(schema.game)
			.innerJoin(schema.gameTeam, eq(schema.game.id, schema.gameTeam.gameId))
			.innerJoin(schema.team, eq(schema.gameTeam.teamId, schema.team.id))
			.where(inArray(schema.game.matchId, matchIds))
			.orderBy(schema.gameTeam.position);
	}

	// Use match teams if available, otherwise use fallback teams
	const allTeams = matchTeams.length > 0 ? matchTeams : fallbackTeams;

	// Get all games for these matches
	const matchGames = await db
		.select({
			matchId: schema.game.matchId,
			gameId: schema.game.id,
			winner: schema.game.winner
		})
		.from(schema.game)
		.where(inArray(schema.game.matchId, matchIds));

	// Group teams by match ID
	const teamsByMatch = new Map<string, typeof allTeams>();
	allTeams.forEach((team) => {
		if (team.matchId) {
			if (!teamsByMatch.has(team.matchId)) {
				teamsByMatch.set(team.matchId, []);
			}
			teamsByMatch.get(team.matchId)!.push(team);
		}
	});

	// Group games by match ID
	const gamesByMatch = new Map<string, typeof matchGames>();
	matchGames.forEach((game) => {
		if (!gamesByMatch.has(game.matchId)) {
			gamesByMatch.set(game.matchId, []);
		}
		gamesByMatch.get(game.matchId)!.push(game);
	});

	// Build the result
	const result = playerMatches.map((pm) => {
		const teams = teamsByMatch.get(pm.matchId) || [];
		const games = gamesByMatch.get(pm.matchId) || [];

		// Ensure we have exactly 2 teams
		let processedTeams = teams.map((team) => {
			const teamName = (team.teamAbbr ||
				team.teamName ||
				team.teamSlug ||
				team.teamId ||
				'Unknown Team') as string;
			return {
				team: teamName,
				teamId: team.teamId || '',
				score: team.score || 0
			};
		});

		// If we don't have exactly 2 teams, pad with placeholder teams
		while (processedTeams.length < 2) {
			processedTeams.push({
				team: `Team ${processedTeams.length + 1}`,
				teamId: '',
				score: 0
			});
		}

		// If we have more than 2 teams, take only the first 2
		if (processedTeams.length > 2) {
			processedTeams = processedTeams.slice(0, 2);
		}

		return {
			id: pm.matchId,
			format: pm.format,
			stageId: pm.stageId,
			teams: processedTeams,
			games: games.map((game) => ({
				winner: game.winner
			})),
			event: {
				id: pm.eventId,
				slug: pm.eventSlug,
				name: pm.eventName,
				image: pm.eventImage,
				date: pm.eventDate,
				region: pm.eventRegion,
				format: pm.eventFormat,
				status: pm.eventStatus,
				server: pm.eventServer,
				capacity: pm.eventCapacity,
				official: pm.eventOfficial
			},
			playerTeamIndex: pm.playerTeamPosition
		};
	});

	// Remove duplicates (same match might appear multiple times for different games)
	const uniqueMatches = new Map<string, (typeof result)[0]>();
	result.forEach((match) => {
		if (!uniqueMatches.has(match.id)) {
			uniqueMatches.set(match.id, match);
		}
	});

	return Array.from(uniqueMatches.values());
}

export async function getServerPlayerWins(playerId: string): Promise<number> {
	console.info('[Players] Fetching server player wins for:', playerId);

	// Get the player's game accounts
	const playerAccounts = await db
		.select()
		.from(gameAccount)
		.where(eq(gameAccount.playerId, playerId));

	if (playerAccounts.length === 0) {
		console.warn('[Players] No game accounts found for player:', playerId);
		return 0;
	}

	// Get all account IDs for this player
	const accountIds = playerAccounts.map((acc) => acc.accountId);

	// Find all games where this player participated with winner information
	const playerGames = await db
		.select({
			gameId: schema.game.id,
			winner: schema.game.winner,
			teamId: schema.gamePlayerScore.teamId,
			accountId: schema.gamePlayerScore.accountId,
			teamPosition: schema.gameTeam.position
		})
		.from(schema.game)
		.innerJoin(schema.gamePlayerScore, eq(schema.game.id, schema.gamePlayerScore.gameId))
		.innerJoin(schema.gameTeam, eq(schema.gamePlayerScore.teamId, schema.gameTeam.teamId))
		.where(inArray(schema.gamePlayerScore.accountId, accountIds));

	// Count wins
	let wins = 0;
	const processedGames = new Set<number>();

	for (const game of playerGames) {
		// Skip if we've already processed this game
		if (processedGames.has(game.gameId)) {
			continue;
		}

		// Find which team the player was on in this game
		const playerTeam = playerGames.find(
			(gt) => gt.gameId === game.gameId && accountIds.includes(gt.accountId)
		);

		if (playerTeam) {
			// Check if player's team won using the actual team position
			// winner: 0 = team A won, 1 = team B won
			const playerWon = game.winner === playerTeam.teamPosition;

			if (playerWon) {
				wins++;
			}

			// Mark this game as processed
			processedGames.add(game.gameId);
		}
	}

	console.info('[Players] Player', playerId, 'has', wins, 'wins');
	return wins;
}

export async function getServerPlayerKD(playerId: string): Promise<number> {
	console.info('[Players] Fetching server player KD for:', playerId);

	// Get the player's game accounts
	const playerAccounts = await db
		.select()
		.from(gameAccount)
		.where(eq(gameAccount.playerId, playerId));

	if (playerAccounts.length === 0) {
		console.warn('[Players] No game accounts found for player:', playerId);
		return 0;
	}

	// Get all account IDs for this player
	const accountIds = playerAccounts.map((acc) => acc.accountId);

	// Find all player scores for this player
	const playerScores = await db
		.select({
			kills: schema.gamePlayerScore.kills,
			deaths: schema.gamePlayerScore.deaths
		})
		.from(schema.gamePlayerScore)
		.where(inArray(schema.gamePlayerScore.accountId, accountIds));

	// Calculate total kills and deaths
	let totalKills = 0;
	let totalDeaths = 0;

	for (const score of playerScores) {
		totalKills += score.kills;
		totalDeaths += score.deaths;
	}

	// Calculate KD ratio
	const kdRatio = totalDeaths > 0 ? totalKills / totalDeaths : totalKills;

	console.info(
		'[Players] Player',
		playerId,
		'KD ratio:',
		kdRatio,
		'(kills:',
		totalKills,
		'deaths:',
		totalDeaths,
		')'
	);
	return kdRatio;
}

function identifyPlayerFromScore(score: PlayerScore, player: Player): boolean {
	return (
		(player.gameAccounts.some((acc) => acc.accountId === score.accountId) ||
			player.aliases?.some((alias) => alias === score.player)) ??
		false
	);
}

export async function createPlayer(
	data: Omit<Player, 'id' | 'gameAccounts'> & { gameAccounts: Player['gameAccounts'] },
	editedBy: string,
	tx?: Parameters<Parameters<typeof db.transaction>[0]>[0]
) {
	const id = randomUUID();
	const slug = data.slug ?? formatSlug(data.name);
	const userId = data.user?.id;
	const primaryNationality = data.nationalities?.[0] as TCountryCode | undefined;

	// Use provided transaction or create a new one
	const executeInTransaction = async (
		transaction: Parameters<Parameters<typeof db.transaction>[0]>[0]
	) => {
		await transaction.insert(player).values({
			id,
			name: data.name,
			slug: slug,
			nationality: primaryNationality,
			avatar: data.avatar,
			userId
		});

		// Record initial creation in edit history
		await transaction.insert(editHistory).values({
			id: randomUUID(),
			tableName: 'player',
			recordId: id,
			fieldName: 'creation',
			oldValue: null,
			newValue: 'created',
			editedBy
		});

		// Record initial values
		if (data.name) {
			await transaction.insert(editHistory).values({
				id: randomUUID(),
				tableName: 'player',
				recordId: id,
				fieldName: 'name',
				oldValue: null,
				newValue: data.name.toString(),
				editedBy
			});
		}

		if (data.avatar) {
			await transaction.insert(editHistory).values({
				id: randomUUID(),
				tableName: 'player',
				recordId: id,
				fieldName: 'avatar',
				oldValue: null,
				newValue: data.avatar.toString(),
				editedBy
			});
		}

		if (data.nationalities?.length) {
			// Record primary nationality
			await transaction.insert(editHistory).values({
				id: randomUUID(),
				tableName: 'player',
				recordId: id,
				fieldName: 'nationality',
				oldValue: null,
				newValue: primaryNationality?.toString() || null,
				editedBy
			});

			// Insert additional nationalities
			if (data.nationalities.length > 1) {
				await transaction.insert(playerAdditionalNationality).values(
					data.nationalities.slice(1).map((nationality) => ({
						playerId: id,
						nationality: nationality as TCountryCode
					}))
				);

				// Record additional nationalities
				for (const nationality of data.nationalities.slice(1)) {
					await transaction.insert(editHistory).values({
						id: randomUUID(),
						tableName: 'player_additional_nationality',
						recordId: id,
						fieldName: 'nationality',
						oldValue: null,
						newValue: nationality.toString(),
						editedBy
					});
				}
			}
		}

		if (userId) {
			await transaction.insert(editHistory).values({
				id: randomUUID(),
				tableName: 'player',
				recordId: id,
				fieldName: 'user',
				oldValue: null,
				newValue: userId,
				editedBy
			});
		}

		if (data.aliases?.length) {
			await transaction.insert(playerAlias).values(
				data.aliases.map((alias) => ({
					playerId: id,
					alias
				}))
			);

			// Record initial aliases
			for (const alias of data.aliases) {
				await transaction.insert(editHistory).values({
					id: randomUUID(),
					tableName: 'player_alias',
					recordId: id,
					fieldName: 'alias',
					oldValue: null,
					newValue: alias.toString(),
					editedBy
				});
			}
		}

		if (data.gameAccounts?.length) {
			await transaction.insert(gameAccount).values(
				data.gameAccounts.map((account) => ({
					playerId: id,
					server: account.region === 'CN' ? 'CalabiYau' : 'Strinova',
					accountId: account.accountId,
					currentName: account.currentName,
					region: account.region
				}))
			);

			// Record initial game accounts
			for (const account of data.gameAccounts) {
				await transaction.insert(editHistory).values({
					id: randomUUID(),
					tableName: 'game_account',
					recordId: id,
					fieldName: 'account',
					oldValue: null,
					newValue: account.accountId.toString(),
					editedBy
				});
			}
		}

		if (data.socialAccounts?.length) {
			await transaction.insert(player_social_account).values(
				data.socialAccounts.map((account) => ({
					id: randomUUID(),
					playerId: id,
					platformId: account.platformId,
					accountId: account.accountId,
					overriding_url: account.overridingUrl
				}))
			);

			// Record initial social accounts
			for (const account of data.socialAccounts) {
				await transaction.insert(editHistory).values({
					id: randomUUID(),
					tableName: 'player_social_account',
					recordId: id,
					fieldName: 'account',
					oldValue: null,
					newValue: account.accountId.toString(),
					editedBy
				});
			}
		}
	};

	if (tx) {
		// Use provided transaction
		await executeInTransaction(tx);
	} else {
		// Create new transaction
		await db.transaction(executeInTransaction);
	}

	return id;
}

export async function updatePlayer(
	data: { id: string } & Partial<Omit<Player, 'gameAccounts'>> & {
			gameAccounts: Player['gameAccounts'];
		},
	editedBy: string
) {
	await db.transaction(async (tx) => {
		// Get the current player data before update
		const [currentPlayer] = await tx.select().from(player).where(eq(player.id, data.id));
		const currentAdditionalNationalities = await tx
			.select()
			.from(playerAdditionalNationality)
			.where(eq(playerAdditionalNationality.playerId, data.id));

		const primaryNationality = data.nationalities?.[0] as TCountryCode | undefined;

		// Update player
		await tx
			.update(player)
			.set({
				name: data.name,
				slug: data.slug,
				nationality: primaryNationality,
				avatar: data.avatar,
				userId: data.user?.id
			})
			.where(eq(player.id, data.id));

		// Track changes in edit_history
		if (data.name !== currentPlayer.name) {
			await tx.insert(editHistory).values({
				id: randomUUID(),
				tableName: 'player',
				recordId: data.id,
				fieldName: 'name',
				oldValue: currentPlayer.name?.toString() || null,
				newValue: data.name?.toString() || null,
				editedBy
			});
		}

		if (data.slug !== currentPlayer.slug) {
			await tx.insert(editHistory).values({
				id: randomUUID(),
				tableName: 'player',
				recordId: data.id,
				fieldName: 'slug',
				oldValue: currentPlayer.slug?.toString() || null,
				newValue: data.slug?.toString() || null,
				editedBy
			});
		}

		if (data.avatar !== currentPlayer.avatar) {
			await tx.insert(editHistory).values({
				id: randomUUID(),
				tableName: 'player',
				recordId: data.id,
				fieldName: 'avatar',
				oldValue: currentPlayer.avatar?.toString() || null,
				newValue: data.avatar?.toString() || null,
				editedBy
			});
		}

		if (primaryNationality !== currentPlayer.nationality) {
			await tx.insert(editHistory).values({
				id: randomUUID(),
				tableName: 'player',
				recordId: data.id,
				fieldName: 'nationality',
				oldValue: currentPlayer.nationality?.toString() || null,
				newValue: primaryNationality?.toString() || null,
				editedBy
			});
		}

		if (data.user?.id !== currentPlayer.userId) {
			await tx.insert(editHistory).values({
				id: randomUUID(),
				tableName: 'player',
				recordId: data.id,
				fieldName: 'user',
				oldValue: currentPlayer.userId?.toString() || null,
				newValue: data.user?.id?.toString() || null,
				editedBy
			});
		}

		// Update additional nationalities
		if (data.nationalities) {
			const newAdditionalNationalities = data.nationalities.slice(1) as TCountryCode[];
			const oldAdditionalNationalities = currentAdditionalNationalities.map(
				(n) => n.nationality as TCountryCode
			);

			// Remove old additional nationalities
			await tx
				.delete(playerAdditionalNationality)
				.where(eq(playerAdditionalNationality.playerId, data.id));

			// Add new additional nationalities
			if (newAdditionalNationalities.length > 0) {
				await tx.insert(playerAdditionalNationality).values(
					newAdditionalNationalities.map((nationality) => ({
						playerId: data.id,
						nationality
					}))
				);
			}

			// Track changes in additional nationalities
			for (const oldNat of oldAdditionalNationalities) {
				if (!newAdditionalNationalities.includes(oldNat)) {
					await tx.insert(editHistory).values({
						id: randomUUID(),
						tableName: 'player_additional_nationality',
						recordId: data.id,
						fieldName: 'nationality',
						oldValue: oldNat.toString(),
						newValue: null,
						editedBy
					});
				}
			}

			for (const newNat of newAdditionalNationalities) {
				if (!oldAdditionalNationalities.includes(newNat)) {
					await tx.insert(editHistory).values({
						id: randomUUID(),
						tableName: 'player_additional_nationality',
						recordId: data.id,
						fieldName: 'nationality',
						oldValue: null,
						newValue: newNat.toString(),
						editedBy
					});
				}
			}
		}

		// Get current aliases
		const currentAliases = await tx
			.select()
			.from(playerAlias)
			.where(eq(playerAlias.playerId, data.id));

		// Update aliases
		await tx.delete(playerAlias).where(eq(playerAlias.playerId, data.id));
		if (data.aliases?.length) {
			await tx.insert(playerAlias).values(
				data.aliases.map((alias) => ({
					playerId: data.id,
					alias
				}))
			);

			// Track alias changes
			const oldAliases = currentAliases.map((a) => a.alias);
			const newAliases = data.aliases;

			// Track removed aliases
			for (const oldAlias of oldAliases) {
				if (!newAliases.includes(oldAlias)) {
					await tx.insert(editHistory).values({
						id: randomUUID(),
						tableName: 'player_alias',
						recordId: data.id,
						fieldName: 'alias',
						oldValue: oldAlias.toString(),
						newValue: null,
						editedBy
					});
				}
			}

			// Track added aliases
			for (const newAlias of newAliases) {
				if (!oldAliases.includes(newAlias)) {
					await tx.insert(editHistory).values({
						id: randomUUID(),
						tableName: 'player_alias',
						recordId: data.id,
						fieldName: 'alias',
						oldValue: null,
						newValue: newAlias.toString(),
						editedBy
					});
				}
			}
		}

		// Get current game accounts
		const currentGameAccounts = await tx
			.select()
			.from(gameAccount)
			.where(eq(gameAccount.playerId, data.id));

		// Update game accounts
		await tx.delete(gameAccount).where(eq(gameAccount.playerId, data.id));
		if (data.gameAccounts?.length) {
			await tx.insert(gameAccount).values(
				data.gameAccounts.map((account) => ({
					playerId: data.id,
					server: account.region === 'CN' ? 'CalabiYau' : 'Strinova',
					accountId: account.accountId,
					currentName: account.currentName,
					region: account.region
				}))
			);

			// Track game account changes
			const oldAccounts = currentGameAccounts.map((acc) => acc.accountId);
			const newAccounts = data.gameAccounts.map((acc) => acc.accountId);

			// Track removed accounts
			for (const oldAcc of oldAccounts) {
				if (!newAccounts.includes(oldAcc)) {
					await tx.insert(editHistory).values({
						id: randomUUID(),
						tableName: 'game_account',
						recordId: data.id,
						fieldName: 'account',
						oldValue: oldAcc.toString(),
						newValue: null,
						editedBy
					});
				}
			}

			// Track added accounts
			for (const newAcc of newAccounts) {
				if (!oldAccounts.includes(newAcc)) {
					await tx.insert(editHistory).values({
						id: randomUUID(),
						tableName: 'game_account',
						recordId: data.id,
						fieldName: 'account',
						oldValue: null,
						newValue: newAcc.toString(),
						editedBy
					});
				}
			}
		}

		// Get current social accounts
		const currentSocialAccounts = await tx
			.select()
			.from(player_social_account)
			.where(eq(player_social_account.playerId, data.id));

		// Update social accounts
		await tx.delete(player_social_account).where(eq(player_social_account.playerId, data.id));
		if (data.socialAccounts?.length) {
			await tx.insert(player_social_account).values(
				data.socialAccounts.map((account) => ({
					id: randomUUID(),
					playerId: data.id,
					platformId: account.platformId,
					accountId: account.accountId,
					overriding_url: account.overridingUrl
				}))
			);

			// Track social account changes
			const oldAccounts = currentSocialAccounts.map((acc) => acc.accountId);
			const newAccounts = data.socialAccounts.map((acc) => acc.accountId);

			// Track removed accounts
			for (const oldAcc of oldAccounts) {
				if (!newAccounts.includes(oldAcc)) {
					await tx.insert(editHistory).values({
						id: randomUUID(),
						tableName: 'player_social_account',
						recordId: data.id,
						fieldName: 'account',
						oldValue: oldAcc.toString(),
						newValue: null,
						editedBy
					});
				}
			}

			// Track added accounts
			for (const newAcc of newAccounts) {
				if (!oldAccounts.includes(newAcc)) {
					await tx.insert(editHistory).values({
						id: randomUUID(),
						tableName: 'player_social_account',
						recordId: data.id,
						fieldName: 'account',
						oldValue: null,
						newValue: newAcc.toString(),
						editedBy
					});
				}
			}
		}
	});
}

export async function deletePlayer(id: string, deletedBy: string) {
	console.info('[Players] Attempting to delete player:', id);

	// Get the player data before deletion
	const [playerData] = await db.select().from(player).where(eq(player.id, id));
	const additionalNationalities = await db
		.select()
		.from(playerAdditionalNationality)
		.where(eq(playerAdditionalNationality.playerId, id));

	if (!playerData) {
		console.warn('[Players] Player not found:', id);
		return;
	}

	await db.transaction(async (tx) => {
		// Record deletion in edit history
		await tx.insert(editHistory).values({
			id: randomUUID(),
			tableName: 'player',
			recordId: id,
			fieldName: 'deletion',
			oldValue: 'active',
			newValue: 'deleted',
			editedBy: deletedBy
		});

		// Record the final state of the player
		await tx.insert(editHistory).values({
			id: randomUUID(),
			tableName: 'player',
			recordId: id,
			fieldName: 'name',
			oldValue: playerData.name,
			newValue: null,
			editedBy: deletedBy
		});

		if (playerData.nationality) {
			await tx.insert(editHistory).values({
				id: randomUUID(),
				tableName: 'player',
				recordId: id,
				fieldName: 'nationality',
				oldValue: playerData.nationality,
				newValue: null,
				editedBy: deletedBy
			});
		}

		// Get and record additional nationalities
		for (const nat of additionalNationalities) {
			await tx.insert(editHistory).values({
				id: randomUUID(),
				tableName: 'player_additional_nationality',
				recordId: id,
				fieldName: 'nationality',
				oldValue: nat.nationality,
				newValue: null,
				editedBy: deletedBy
			});
		}

		// Get and record aliases
		const aliases = await tx.select().from(playerAlias).where(eq(playerAlias.playerId, id));

		for (const alias of aliases) {
			await tx.insert(editHistory).values({
				id: randomUUID(),
				tableName: 'player_alias',
				recordId: id,
				fieldName: 'alias',
				oldValue: alias.alias,
				newValue: null,
				editedBy: deletedBy
			});
		}

		// Get and record game accounts
		const gameAccounts = await tx.select().from(gameAccount).where(eq(gameAccount.playerId, id));

		for (const account of gameAccounts) {
			await tx.insert(editHistory).values({
				id: randomUUID(),
				tableName: 'game_account',
				recordId: id,
				fieldName: 'account',
				oldValue: account.accountId.toString(),
				newValue: null,
				editedBy: deletedBy
			});
		}

		// Get and record social accounts
		const socialAccounts = await tx
			.select()
			.from(player_social_account)
			.where(eq(player_social_account.playerId, id));

		for (const account of socialAccounts) {
			await tx.insert(editHistory).values({
				id: randomUUID(),
				tableName: 'player_social_account',
				recordId: id,
				fieldName: 'account',
				oldValue: account.accountId,
				newValue: null,
				editedBy: deletedBy
			});
		}

		// Delete the records
		await tx.delete(playerAlias).where(eq(playerAlias.playerId, id));
		await tx.delete(gameAccount).where(eq(gameAccount.playerId, id));
		await tx.delete(player_social_account).where(eq(player_social_account.playerId, id));
		await tx
			.delete(playerAdditionalNationality)
			.where(eq(playerAdditionalNationality.playerId, id));
		await tx.delete(player).where(eq(player.id, id));
	});

	console.info('[Players] Successfully deleted player:', id);
}

export async function getSocialPlatforms() {
	const platforms = await db.select().from(social_platform);
	return platforms.map((platform) => ({
		id: platform.id,
		name: platform.name,
		url_template: platform.url_template
	}));
}

export async function getPlayerEditHistory(playerId: string) {
	const history = await db
		.select()
		.from(editHistory)
		.where(eq(editHistory.recordId, playerId))
		.orderBy(editHistory.editedAt);

	return history;
}

// Optimized function for player ratings only
export interface PlayerRating {
	playerId: string;
	rating: number;
}

export async function getAllPlayersRatings(limit?: number): Promise<PlayerRating[]> {
	const totalStart = performance.now();
	console.info('[Players] Fetching ratings for all players', limit ? `(limited to ${limit})` : '');

	const playersQueryStart = performance.now();
	const players = await db.select().from(player);
	const playersQueryDuration = performance.now() - playersQueryStart;
	console.info(`[Players] Players query took ${playersQueryDuration.toFixed(2)}ms`);

	if (players.length === 0) {
		console.warn('[Players] No players found');
		return [];
	}

	const accountsQueryStart = performance.now();
	const allPlayerAccounts = await db.select().from(gameAccount);
	const accountsQueryDuration = performance.now() - accountsQueryStart;
	console.info(`[Players] Game accounts query took ${accountsQueryDuration.toFixed(2)}ms`);

	const dataProcessingStart = performance.now();
	// Group accounts by player ID
	const accountsByPlayer = new Map<string, number[]>();
	for (const account of allPlayerAccounts) {
		if (!accountsByPlayer.has(account.playerId)) {
			accountsByPlayer.set(account.playerId, []);
		}
		accountsByPlayer.get(account.playerId)!.push(account.accountId);
	}

	// Get all account IDs
	const allAccountIds = allPlayerAccounts.map((acc) => acc.accountId);

	if (allAccountIds.length === 0) {
		console.warn('[Players] No game accounts found for any players');
		const dataProcessingDuration = performance.now() - dataProcessingStart;
		console.info(`[Players] Data processing took ${dataProcessingDuration.toFixed(2)}ms`);

		const totalDuration = performance.now() - totalStart;
		console.info(`[Players] Total getAllPlayersRatings took ${totalDuration.toFixed(2)}ms`);
		return players.map((p) => ({
			playerId: p.id,
			rating: 0
		}));
	}

	const scoresQueryStart = performance.now();
	// Get all player scores for all players (only what we need for rating)
	const allPlayerScores = await db
		.select({
			accountId: schema.gamePlayerScore.accountId,
			score: schema.gamePlayerScore.score
		})
		.from(schema.gamePlayerScore)
		.where(inArray(schema.gamePlayerScore.accountId, allAccountIds));
	const scoresQueryDuration = performance.now() - scoresQueryStart;
	console.info(`[Players] Player scores query took ${scoresQueryDuration.toFixed(2)}ms`);

	// Calculate ratings for each player
	const ratingCalculationStart = performance.now();
	const result: PlayerRating[] = [];

	for (const player of players) {
		const accountIds = accountsByPlayer.get(player.id) || [];

		if (accountIds.length === 0) {
			result.push({
				playerId: player.id,
				rating: 0
			});
			continue;
		}

		// Get scores for this player
		const playerScores = allPlayerScores.filter((score) => accountIds.includes(score.accountId));

		// Calculate rating
		let totalScore = 0;
		for (const score of playerScores) {
			totalScore += score.score;
		}

		const averageScore = playerScores.length > 0 ? totalScore / playerScores.length : 0;
		const rating = averageScore / 200; // Same rating calculation as before

		result.push({
			playerId: player.id,
			rating
		});
	}
	const ratingCalculationDuration = performance.now() - ratingCalculationStart;
	console.info(`[Players] Rating calculation took ${ratingCalculationDuration.toFixed(2)}ms`);

	// Sort by rating (descending) and apply limit if specified
	const sortingStart = performance.now();
	const sortedResult = result.sort((a, b) => b.rating - a.rating).slice(0, limit);
	const sortingDuration = performance.now() - sortingStart;
	console.info(`[Players] Sorting and limiting took ${sortingDuration.toFixed(2)}ms`);

	const dataProcessingDuration = performance.now() - dataProcessingStart;
	console.info(`[Players] Data processing took ${dataProcessingDuration.toFixed(2)}ms`);

	const totalDuration = performance.now() - totalStart;
	console.info(
		`[Players] Total getAllPlayersRatings took ${totalDuration.toFixed(2)}ms - Successfully calculated ratings for ${sortedResult.length} players`
	);
	return sortedResult;
}

// Get essential stats for all players (optimized for lists)
export async function getAllPlayersEssentialStats(): Promise<PlayerEssentialStats[]> {
	console.info('[Players] Fetching essential stats for all players');

	// Get all players
	const players = await db.select().from(player);

	if (players.length === 0) {
		console.warn('[Players] No players found');
		return [];
	}

	// Get all game accounts for all players
	const allPlayerAccounts = await db.select().from(gameAccount);

	// Group accounts by player ID
	const accountsByPlayer = new Map<string, number[]>();
	for (const account of allPlayerAccounts) {
		if (!accountsByPlayer.has(account.playerId)) {
			accountsByPlayer.set(account.playerId, []);
		}
		accountsByPlayer.get(account.playerId)!.push(account.accountId);
	}

	// Get all account IDs
	const allAccountIds = allPlayerAccounts.map((acc) => acc.accountId);

	if (allAccountIds.length === 0) {
		console.warn('[Players] No game accounts found for any players');
		return players.map((p) => ({
			playerId: p.id,
			wins: 0,
			rating: 0,
			kd: 0,
			eventsCount: 0
		}));
	}

	// Get all games where players participated
	const allPlayerGames = await db
		.select({
			gameId: schema.game.id,
			winner: schema.game.winner,
			teamId: schema.gamePlayerScore.teamId,
			accountId: schema.gamePlayerScore.accountId,
			teamPosition: schema.gameTeam.position
		})
		.from(schema.game)
		.innerJoin(schema.gamePlayerScore, eq(schema.game.id, schema.gamePlayerScore.gameId))
		.innerJoin(schema.gameTeam, eq(schema.gamePlayerScore.teamId, schema.gameTeam.teamId))
		.where(inArray(schema.gamePlayerScore.accountId, allAccountIds));

	// Get all player scores for all players
	const allPlayerScores = await db
		.select({
			accountId: schema.gamePlayerScore.accountId,
			kills: schema.gamePlayerScore.kills,
			deaths: schema.gamePlayerScore.deaths,
			score: schema.gamePlayerScore.score
		})
		.from(schema.gamePlayerScore)
		.where(inArray(schema.gamePlayerScore.accountId, allAccountIds));

	// Get events count for all players
	const allPlayerEvents = await db
		.select({
			playerId: schema.eventTeamPlayer.playerId,
			eventId: schema.eventTeamPlayer.eventId
		})
		.from(schema.eventTeamPlayer);

	// Group events by player
	const eventsByPlayer = new Map<string, Set<string>>();
	for (const event of allPlayerEvents) {
		if (!eventsByPlayer.has(event.playerId)) {
			eventsByPlayer.set(event.playerId, new Set());
		}
		eventsByPlayer.get(event.playerId)!.add(event.eventId);
	}

	// Calculate stats for each player
	const result: PlayerEssentialStats[] = [];

	for (const player of players) {
		const accountIds = accountsByPlayer.get(player.id) || [];

		if (accountIds.length === 0) {
			result.push({
				playerId: player.id,
				wins: 0,
				rating: 0,
				kd: 0,
				eventsCount: eventsByPlayer.get(player.id)?.size || 0
			});
			continue;
		}

		// Get games for this player
		const playerGames = allPlayerGames.filter((game) => accountIds.includes(game.accountId));

		// Get scores for this player
		const playerScores = allPlayerScores.filter((score) => accountIds.includes(score.accountId));

		// Calculate wins
		let wins = 0;
		const processedGames = new Set<number>();

		for (const game of playerGames) {
			if (processedGames.has(game.gameId)) {
				continue;
			}

			// Find which team the player was on in this game
			const playerTeam = playerGames.find(
				(gt) => gt.gameId === game.gameId && accountIds.includes(gt.accountId)
			);

			if (playerTeam) {
				// Check if player's team won using the actual team position
				// winner: 0 = team A won, 1 = team B won
				const playerWon = game.winner === playerTeam.teamPosition;

				if (playerWon) {
					wins++;
				}

				processedGames.add(game.gameId);
			}
		}

		// Calculate KD
		let totalKills = 0;
		let totalDeaths = 0;
		let totalScore = 0;

		for (const score of playerScores) {
			totalKills += score.kills;
			totalDeaths += score.deaths;
			totalScore += score.score;
		}

		const kd = totalDeaths > 0 ? totalKills / totalDeaths : totalKills;
		const averageScore = playerScores.length > 0 ? totalScore / playerScores.length : 0;
		const rating = averageScore / 200; // Simple rating calculation
		const eventsCount = eventsByPlayer.get(player.id)?.size || 0;

		result.push({
			playerId: player.id,
			wins,
			rating,
			kd,
			eventsCount
		});
	}

	console.info('[Players] Successfully calculated essential stats for', result.length, 'players');
	return result;
}

// Superstring Power calculation function
export function calculateSuperstringPower(
	scores: number[],
	wins: number = 0
): { power: number; gamesPlayed: number; wins: number } {
	if (scores.length === 0) {
		return { power: 0, gamesPlayed: 0, wins: 0 };
	}

	const totalScore = scores.reduce((sum, score) => sum + score, 0);
	const averageScore = totalScore / scores.length;

	return {
		power: averageScore * 10 + 2500,
		gamesPlayed: scores.length,
		wins
	};
}

export async function getServerPlayerSuperstringPower(
	playerId: string,
	character: Character
): Promise<{ power: number; gamesPlayed: number; wins: number }> {
	console.info(
		'[Players] Fetching Superstring Power for player:',
		playerId,
		'with character:',
		character
	);

	// Get the player's game accounts
	const playerAccounts = await db
		.select()
		.from(gameAccount)
		.where(eq(gameAccount.playerId, playerId));

	if (playerAccounts.length === 0) {
		console.warn('[Players] No game accounts found for player:', playerId);
		return { power: 0, gamesPlayed: 0, wins: 0 };
	}

	// Get all account IDs for this player
	const accountIds = playerAccounts.map((acc) => acc.accountId);

	// Find all games where this player used the specific character with game results
	const playerGames = await db
		.select({
			score: schema.gamePlayerScore.score,
			gameId: schema.gamePlayerScore.gameId,
			teamId: schema.gamePlayerScore.teamId,
			winner: schema.game.winner,
			teamPosition: schema.gameTeam.position
		})
		.from(schema.gamePlayerScore)
		.innerJoin(schema.game, eq(schema.game.id, schema.gamePlayerScore.gameId))
		.innerJoin(schema.gameTeam, eq(schema.gamePlayerScore.teamId, schema.gameTeam.teamId))
		.where(
			and(
				inArray(schema.gamePlayerScore.accountId, accountIds),
				or(
					eq(schema.gamePlayerScore.characterFirstHalf, character),
					eq(schema.gamePlayerScore.characterSecondHalf, character)
				)
			)
		);

	if (playerGames.length === 0) {
		console.info('[Players] Player', playerId, 'never used character:', character);
		return { power: 0, gamesPlayed: 0, wins: 0 };
	}

	// Calculate wins
	let wins = 0;
	const processedGames = new Set<number>();

	for (const game of playerGames) {
		if (processedGames.has(game.gameId)) {
			continue;
		}

		// Check if player's team won using the actual team position
		// winner: 0 = team A won, 1 = team B won
		const playerWon = game.winner === game.teamPosition;

		if (playerWon) {
			wins++;
		}

		processedGames.add(game.gameId);
	}

	// Extract scores and calculate power
	const scores = playerGames.map((game) => game.score);
	const result = calculateSuperstringPower(scores, wins);

	console.info(
		'[Players] Player',
		playerId,
		'Superstring Power for',
		character,
		':',
		result.power,
		'from',
		result.gamesPlayed,
		'games with',
		result.wins,
		'wins'
	);
	return result;
}

export async function getAllPlayersSuperstringPower(
	character: Character
): Promise<{ playerId: string; power: number; gamesPlayed: number; wins: number }[]> {
	console.info('[Players] Fetching Superstring Power for all players with character:', character);

	// Get all players
	const allPlayers = await db.select().from(player);
	const playerIds = allPlayers.map((p) => p.id);

	// Get all game accounts for these players
	const allPlayerAccounts = await db
		.select()
		.from(gameAccount)
		.where(inArray(gameAccount.playerId, playerIds));

	// Group accounts by player ID
	const accountsByPlayer = new Map<string, number[]>();
	for (const account of allPlayerAccounts) {
		if (!accountsByPlayer.has(account.playerId)) {
			accountsByPlayer.set(account.playerId, []);
		}
		accountsByPlayer.get(account.playerId)!.push(account.accountId);
	}

	// Get all account IDs
	const allAccountIds = allPlayerAccounts.map((acc) => acc.accountId);

	if (allAccountIds.length === 0) {
		console.warn('[Players] No game accounts found for any players');
		return [];
	}

	// Find all games where these players used the specific character with game results
	const allPlayerGames = await db
		.select({
			accountId: schema.gamePlayerScore.accountId,
			score: schema.gamePlayerScore.score,
			gameId: schema.gamePlayerScore.gameId,
			teamId: schema.gamePlayerScore.teamId,
			winner: schema.game.winner,
			teamPosition: schema.gameTeam.position
		})
		.from(schema.gamePlayerScore)
		.innerJoin(schema.game, eq(schema.game.id, schema.gamePlayerScore.gameId))
		.innerJoin(schema.gameTeam, eq(schema.gamePlayerScore.teamId, schema.gameTeam.teamId))
		.where(
			and(
				inArray(schema.gamePlayerScore.accountId, allAccountIds),
				or(
					eq(schema.gamePlayerScore.characterFirstHalf, character),
					eq(schema.gamePlayerScore.characterSecondHalf, character)
				)
			)
		);

	// Group games by player ID
	const gamesByPlayer = new Map<string, typeof allPlayerGames>();
	for (const game of allPlayerGames) {
		// Find which player this account belongs to
		for (const [playerId, accountIds] of accountsByPlayer.entries()) {
			if (accountIds.includes(game.accountId)) {
				if (!gamesByPlayer.has(playerId)) {
					gamesByPlayer.set(playerId, []);
				}
				gamesByPlayer.get(playerId)!.push(game);
				break;
			}
		}
	}

	// Calculate Superstring Power for each player
	const result: { playerId: string; power: number; gamesPlayed: number; wins: number }[] = [];

	for (const playerId of playerIds) {
		const playerGames = gamesByPlayer.get(playerId);

		if (playerGames && playerGames.length > 0) {
			// Calculate wins for this player
			let wins = 0;
			const processedGames = new Set<number>();

			for (const game of playerGames) {
				if (processedGames.has(game.gameId)) {
					continue;
				}

				// Check if player's team won using the actual team position
				const playerWon = game.winner === game.teamPosition;

				if (playerWon) {
					wins++;
				}

				processedGames.add(game.gameId);
			}

			const scores = playerGames.map((game) => game.score);
			const powerData = calculateSuperstringPower(scores, wins);

			result.push({
				playerId,
				power: powerData.power,
				gamesPlayed: powerData.gamesPlayed,
				wins: powerData.wins
			});
		}
	}

	// Sort by power (descending)
	result.sort((a, b) => b.power - a.power);

	console.info(
		'[Players] Found Superstring Power for',
		result.length,
		'players with character:',
		character
	);
	return result;
}
