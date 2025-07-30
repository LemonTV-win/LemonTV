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
import { eq, or, and } from 'drizzle-orm';
import type { Player } from '$lib/data/players';
import { randomUUID } from 'node:crypto';
import { calculateWinnerIndex, getEvents, getMatches, identifyPlayer } from '$lib/data';
import type { Team } from '$lib/data/teams';
import type { Character, GameMap, Region } from '$lib/data/game';
import type { TCountryCode } from 'countries-list';

import * as schema from '$lib/server/db/schema';
import type { Match, PlayerScore } from '$lib/data/matches';
import type { Event } from '$lib/data/events';
import { inArray } from 'drizzle-orm';

export async function getPlayer(keyword: string): Promise<Player | null> {
	console.info('[Players] Attempting to get player:', keyword);
	const [playerData] = await db
		.select()
		.from(player)
		.where(or(eq(player.id, keyword), eq(player.slug, keyword), eq(player.name, keyword)));

	if (!playerData) {
		console.warn('[Players] Player not found:', keyword);
		return null;
	}

	const aliases = await db.select().from(playerAlias).where(eq(playerAlias.playerId, keyword));
	const accounts = await db.select().from(gameAccount).where(eq(gameAccount.playerId, keyword));
	const socialAccounts = await db
		.select()
		.from(player_social_account)
		.where(eq(player_social_account.playerId, playerData.id));
	const additionalNationalities = await db
		.select()
		.from(playerAdditionalNationality)
		.where(eq(playerAdditionalNationality.playerId, playerData.id));

	console.info('[Players] Successfully retrieved player:', keyword);
	return {
		id: playerData.id,
		slug: playerData.slug,
		name: playerData.name,
		nationalities: playerData.nationality
			? [
					playerData.nationality as TCountryCode,
					...additionalNationalities.map((n) => n.nationality as TCountryCode)
				]
			: additionalNationalities.map((n) => n.nationality as TCountryCode),
		aliases: aliases.map((a) => a.alias),
		gameAccounts: accounts.map((acc) => ({
			accountId: acc.accountId,
			currentName: acc.currentName,
			region: acc.region as Player['gameAccounts'][0]['region'],
			server: acc.server as 'Strinova' | 'CalabiYau' // TODO: Add validation
		})),
		socialAccounts: socialAccounts.map((acc) => ({
			platformId: acc.platformId,
			accountId: acc.accountId,
			overridingUrl: acc.overriding_url || undefined
		}))
	};
}

export async function getPlayers(): Promise<Player[]> {
	console.info('[Players] Fetching all players');
	const players = await db.select().from(player);

	const aliases = await db.select().from(playerAlias);
	const aliasesByPlayer = new Map<string, string[]>();
	for (const alias of aliases) {
		if (!aliasesByPlayer.has(alias.playerId)) {
			aliasesByPlayer.set(alias.playerId, []);
		}
		aliasesByPlayer.get(alias.playerId)!.push(alias.alias);
	}

	const accounts = await db.select().from(gameAccount);
	const accountsByPlayer = new Map<string, typeof accounts>();
	for (const acc of accounts) {
		if (!accountsByPlayer.has(acc.playerId)) {
			accountsByPlayer.set(acc.playerId, []);
		}
		accountsByPlayer.get(acc.playerId)!.push(acc);
	}

	const socialAccounts = await db.select().from(player_social_account);
	const socialAccountsByPlayer = new Map<string, typeof socialAccounts>();
	for (const acc of socialAccounts) {
		if (!socialAccountsByPlayer.has(acc.playerId)) {
			socialAccountsByPlayer.set(acc.playerId, []);
		}
		socialAccountsByPlayer.get(acc.playerId)!.push(acc);
	}

	const additionalNationalities = await db.select().from(playerAdditionalNationality);
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

	console.info('[Players] Successfully retrieved', result.length, 'players');
	return result;
}

export async function getPlayerTeams(slug: string) {
	const teams = await db
		.select()
		.from(schema.player)
		.where(eq(schema.player.slug, slug))
		.innerJoin(schema.teamPlayer, eq(schema.teamPlayer.playerId, schema.player.id))
		.innerJoin(schema.team, eq(schema.teamPlayer.teamId, schema.team.id));

	return teams;
}

export async function getPlayersTeams(): Promise<Record<string, Team[]>> {
	const rows = await db
		.select()
		.from(schema.player)
		.innerJoin(schema.teamPlayer, eq(schema.teamPlayer.playerId, schema.player.id))
		.innerJoin(schema.team, eq(schema.teamPlayer.teamId, schema.team.id));

	const result: Record<string, Team[]> = {};
	for (const row of rows) {
		if (!result[row.player.id]) {
			result[row.player.id] = [];
		}
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
	return result;
}

export function getPlayerMatches(
	slug: string
): (Match & { playerTeamIndex: number; event: Event })[] {
	return (
		getMatches()
			// .filter((match) => match.teams.some((team) => isPlayerInTeam(id, team.team)))
			.filter((match) =>
				match.teams.some((participant) =>
					[...(participant.roaster ?? []), ...(participant.substitutes ?? [])].includes(slug)
				)
			)
			.map((match) => ({
				...match,
				playerTeamIndex: match.teams.findIndex((team) =>
					[...(team.roaster ?? []), ...(team.substitutes ?? [])].includes(slug)
				)
			}))
	);
}

export function getPlayerAgents(player: Player): [Character, number][] {
	const characters = getPlayerMatches(player.slug ?? player.name)
		.flatMap((match) =>
			(match.games ?? []).flatMap((game) => {
				for (const score of game.scores[match.playerTeamIndex]) {
					if (identifyPlayerFromScore(score, player)) {
						return score.characters;
					}
				}
			})
		)
		.filter(Boolean) as Character[];

	// Count occurrences of each character
	const characterCounts = new Map<Character, number>();
	for (const character of characters) {
		characterCounts.set(character, (characterCounts.get(character) ?? 0) + 1);
	}

	// Convert to array of tuples
	return Array.from(characterCounts.entries());
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
		const sortedCharacters = Array.from(characterCounts.entries())
			.sort((a, b) => b[1] - a[1])
			.slice(0, limit);

		result[playerId] = sortedCharacters;
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
			accountId: schema.gamePlayerScore.accountId
		})
		.from(schema.game)
		.innerJoin(schema.gamePlayerScore, eq(schema.game.id, schema.gamePlayerScore.gameId))
		.where(inArray(schema.gamePlayerScore.accountId, accountIds));

	// Group games by map and calculate wins/losses
	const mapStats = new Map<GameMap, { wins: number; losses: number }>();

	for (const game of playerGames) {
		if (!mapStats.has(game.mapId)) {
			mapStats.set(game.mapId, { wins: 0, losses: 0 });
		}

		const stats = mapStats.get(game.mapId)!;

		// Determine if the player's team won this game
		// winner: 0 = team A won, 1 = team B won
		// We need to find which team the player was on
		const playerTeam = playerGames.find(
			(g) => g.gameId === game.gameId && g.accountId === game.accountId
		);

		if (playerTeam) {
			// Find the team position for this player's team
			const teamAGames = playerGames.filter(
				(g) => g.gameId === game.gameId && g.teamId === playerTeam.teamId
			);
			const teamBGames = playerGames.filter(
				(g) => g.gameId === game.gameId && g.teamId !== playerTeam.teamId
			);

			// Determine team position (0 for team A, 1 for team B)
			const teamPosition = teamAGames.length > 0 ? 0 : 1;

			// Check if player's team won
			const playerWon = game.winner === teamPosition;

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

export function getPlayersAgents(
	players: Player[],
	limit: number = 3
): Record<string, [Character, number][]> {
	return Object.fromEntries(
		players.map((player) => [player.id, getPlayerAgents(player).slice(0, limit)])
	);
}

export function getPlayerWins(id: string): number {
	return getPlayerMatches(id).filter((match) => {
		return calculateWinnerIndex(match) === match.playerTeamIndex + 1;
	}).length;
}

export function getPlayerEvents(id: string) {
	return getEvents().filter((event) =>
		event.participants.some(({ main, reserve, coach }) =>
			[...main, ...reserve, ...coach].some((player) => identifyPlayer(id, player))
		)
	);
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

export function calculatePlayerRating(player: Player) {
	if (!player.slug && !player.name) {
		return 0;
	}

	const matches = getPlayerMatches(player.slug ?? player.name);
	if (!matches || matches.length === 0) {
		return 0;
	}

	const scores = matches
		.flatMap((match) => {
			const playerTeamIndex = match.playerTeamIndex;

			const playerScore = match.games?.flatMap((game) =>
				game.scores[playerTeamIndex]
					.filter((score) => identifyPlayerFromScore(score, player))
					.map((score) => score.score)
			);

			return playerScore;
		})
		.filter(Boolean) as number[];

	const averageScore = scores.reduce((acc, score) => acc + score, 0) / scores.length;

	return isNaN(averageScore) ? 0 : averageScore / 200;
}

function identifyPlayerFromScore(score: PlayerScore, player: Player): boolean {
	return (
		(player.gameAccounts.some((acc) => acc.accountId === score.accountId) ||
			player.aliases?.some((alias) => alias === score.player)) ??
		false
	);
}

export function calculatePlayerKD(player: Player): number {
	const matches = getPlayerMatches(player.slug ?? player.name);

	return matches.reduce((acc, match) => {
		const playerTeamIndex = match.playerTeamIndex;

		if (!match.games) {
			return acc;
		}

		const kills = match.games
			?.flatMap((game) =>
				game.scores[playerTeamIndex]
					.filter((score) => identifyPlayerFromScore(score, player))
					.map((score) => score.kills)
					.reduce((acc, kill) => acc + kill, 0)
			)
			.reduce((acc, kill) => acc + kill, 0);

		const deaths = match.games
			?.flatMap((game) =>
				game.scores[playerTeamIndex]
					.filter((score) => identifyPlayerFromScore(score, player))
					.map((score) => score.deaths)
			)
			.reduce((acc, death) => acc + death, 0);

		return kills / deaths;
	}, 0);
}

export async function createPlayer(
	data: Omit<Player, 'id' | 'gameAccounts'> & { gameAccounts: Player['gameAccounts'] },
	editedBy: string
) {
	const id = randomUUID();
	const slug = data.slug ?? data.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
	const userId = data.user?.id;
	const primaryNationality = data.nationalities?.[0] as TCountryCode | undefined;

	await db.transaction(async (tx) => {
		await tx.insert(player).values({
			id,
			name: data.name,
			slug,
			nationality: primaryNationality,
			userId
		});

		// Record initial creation in edit history
		await tx.insert(editHistory).values({
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
			await tx.insert(editHistory).values({
				id: randomUUID(),
				tableName: 'player',
				recordId: id,
				fieldName: 'name',
				oldValue: null,
				newValue: data.name.toString(),
				editedBy
			});
		}

		if (data.nationalities?.length) {
			// Record primary nationality
			await tx.insert(editHistory).values({
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
				await tx.insert(playerAdditionalNationality).values(
					data.nationalities.slice(1).map((nationality) => ({
						playerId: id,
						nationality: nationality as TCountryCode
					}))
				);

				// Record additional nationalities
				for (const nationality of data.nationalities.slice(1)) {
					await tx.insert(editHistory).values({
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
			await tx.insert(editHistory).values({
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
			await tx.insert(playerAlias).values(
				data.aliases.map((alias) => ({
					playerId: id,
					alias
				}))
			);

			// Record initial aliases
			for (const alias of data.aliases) {
				await tx.insert(editHistory).values({
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
			await tx.insert(gameAccount).values(
				data.gameAccounts.map((account) => ({
					playerId: id,
					server: 'Strinova',
					accountId: account.accountId,
					currentName: account.currentName,
					region: account.region
				}))
			);

			// Record initial game accounts
			for (const account of data.gameAccounts) {
				await tx.insert(editHistory).values({
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
			await tx.insert(player_social_account).values(
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
				await tx.insert(editHistory).values({
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
	});

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
					server: 'Strinova',
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
