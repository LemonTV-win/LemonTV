import { db } from '$lib/server/db';
import {
	player,
	playerAlias,
	gameAccount,
	player_social_account,
	social_platform,
	editHistory,
	playerAdditionalNationality,
	type GameAccount as GameAccountDB
} from '$lib/server/db/schema';
import { eq, or, and, inArray, sql, desc } from 'drizzle-orm';
import {
	getGameAccountServer,
	type GameAccount,
	type Player,
	type PlayerTeam
} from '$lib/data/players';
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
export async function getPlayerStats(playerId: string, topAgents = 3): Promise<PlayerStats> {
	const ps = schema.playerStats;
	const pcs = schema.playerCharacterStats;

	// 1) materialized aggregate
	const [row] = await db
		.select({
			totalWins: ps.totalWins,
			totalLosses: ps.totalLosses,
			totalGames: ps.totalGames,
			winRate: ps.winRate,
			kd: ps.kd,
			totalKills: ps.totalKills,
			totalDeaths: ps.totalDeaths,
			totalAssists: ps.totalAssists,
			totalDamage: ps.totalDamage,
			totalScore: ps.totalScore,
			averageScore: ps.averageScore
		})
		.from(ps)
		.where(eq(ps.playerId, playerId))
		.limit(1);

	const base = row ?? {
		totalWins: 0,
		totalLosses: 0,
		totalGames: 0,
		winRate: 0,
		kd: 0,
		totalKills: 0,
		totalDeaths: 0,
		totalAssists: 0,
		totalDamage: 0,
		totalScore: 0,
		averageScore: 0
	};

	// 2) frequent agents (single query, then slice in JS)
	const agentsAll = await db
		.select({
			characterId: pcs.characterId,
			totalGames: pcs.totalGames,
			power: pcs.superstringPower,
			wins: pcs.totalWins
		})
		.from(pcs)
		.where(eq(pcs.playerId, playerId))
		.orderBy(desc(pcs.totalGames), desc(pcs.superstringPower), desc(pcs.totalWins));

	const limitedAgents = topAgents > 0 ? agentsAll.slice(0, topAgents) : agentsAll;

	const agents: [Character, number][] = limitedAgents.map((r) => [
		r.characterId as Character,
		r.totalGames
	]);

	// 3) keep your existing helpers (swap to materialized later if you add them)
	const [mapStats, events, matches] = await Promise.all([
		getPlayerMapStats(playerId),
		getPlayerEvents(playerId),
		getPlayerMatches(playerId)
	]);

	return {
		wins: base.totalWins,
		losses: base.totalLosses,
		totalGames: base.totalGames,
		winRate: base.winRate,
		kd: base.kd,
		totalKills: base.totalKills,
		totalDeaths: base.totalDeaths,
		totalAssists: base.totalAssists,
		totalDamage: base.totalDamage,
		averageScore: base.averageScore,
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
		aliases: (playerData.aliases?.map((a) => a.alias) ?? []) as string[],
		gameAccounts: (playerData.gameAccounts || []).map((acc) => ({
			accountId: acc.accountId,
			currentName: acc.currentName,
			region: acc.region as Player['gameAccounts'][0]['region'],
			server: acc.server
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
	console.info('[Players] Fetching all players (relational findMany)');

	// Single logical query using Drizzle's relational API
	const queryStart = performance.now();
	const rows = await db.query.player.findMany({
		// Pull only the columns you actually use
		columns: {
			id: true,
			name: true,
			slug: true,
			avatar: true,
			nationality: true,
			userId: true
		},
		// ⬇️ Adjust relation keys to your configured names in `relations(...)`
		with: {
			// e.g. relations(player, ...) -> { aliases: many(playerAlias) }
			aliases: {
				columns: { alias: true, playerId: true }
			},
			// e.g. { gameAccounts: many(gameAccount) }
			gameAccounts: {
				columns: {
					playerId: true,
					accountId: true,
					currentName: true,
					region: true,
					server: true
				}
			},
			// e.g. { socialAccounts: many(player_social_account) }
			socialAccounts: {
				columns: {
					playerId: true,
					platformId: true,
					accountId: true,
					overriding_url: true
				}
			},
			// e.g. { additionalNationalities: many(playerAdditionalNationality) }
			additionalNationalities: {
				columns: { playerId: true, nationality: true }
			}
		}
	});
	const queryDuration = performance.now() - queryStart;
	console.info(`[Players] Relational query took ${queryDuration.toFixed(2)}ms`);

	// Map to your public shape
	const mapStart = performance.now();
	const result: Player[] = rows.map((p) => {
		const extraNats = p.additionalNationalities?.map((n) => n.nationality as TCountryCode) ?? [];

		return {
			id: p.id,
			name: p.name,
			slug: p.slug,
			avatar: p.avatar || undefined,
			nationalities: p.nationality
				? ([p.nationality as TCountryCode, ...extraNats] as TCountryCode[])
				: extraNats,
			aliases: p.aliases?.map((a) => a.alias) ?? [],
			gameAccounts:
				p.gameAccounts?.map((acc) => ({
					accountId: acc.accountId,
					currentName: acc.currentName,
					region: acc.region as Player['gameAccounts'][0]['region'],
					server: acc.server
				})) ?? [],
			socialAccounts:
				p.socialAccounts?.map((acc) => ({
					platformId: acc.platformId,
					accountId: acc.accountId,
					overridingUrl: acc.overriding_url || undefined
				})) ?? [],
			user: p.userId ? { id: p.userId, username: '', email: '', roles: [] } : undefined
		};
	});
	const mapDuration = performance.now() - mapStart;
	console.info(`[Players] Data mapping took ${mapDuration.toFixed(2)}ms`);

	const totalDuration = performance.now() - totalStart;
	console.info(
		`[Players] Total getPlayers took ${totalDuration.toFixed(2)}ms - Successfully retrieved ${result.length} players`
	);

	return result;
}

export async function getPlayerAgents(playerId: string): Promise<[Character, number][]> {
	console.info('[Players] Fetching server player agents for:', playerId);

	// Use Drizzle query builder with joins to get character counts in a single query
	const characterStats = await db
		.select({
			characterFirstHalf: schema.gamePlayerScore.characterFirstHalf,
			characterSecondHalf: schema.gamePlayerScore.characterSecondHalf
		})
		.from(schema.gamePlayerScore)
		.innerJoin(
			schema.gameAccount,
			eq(schema.gamePlayerScore.accountId, schema.gameAccount.accountId)
		)
		.where(eq(schema.gameAccount.playerId, playerId));

	if (characterStats.length === 0) {
		console.warn('[Players] No game scores found for player:', playerId);
		return [];
	}

	// Count occurrences of each character (both first and second half)
	const characterCounts = new Map<Character, number>();

	for (const score of characterStats) {
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

type FrequentAgentsMap = Record<string, [Character, number][]>;
export async function getPlayersAgents(playerIds: string[], topN = 3): Promise<FrequentAgentsMap> {
	if (playerIds.length === 0) return {};
	const ids = [...new Set(playerIds.map((x) => String(x).trim()))];
	const pcs = schema.playerCharacterStats;

	const ranked = db
		.select({
			playerId: pcs.playerId,
			characterId: pcs.characterId,
			totalGames: pcs.totalGames,
			rn: sql<number>`
        row_number() over (
          partition by ${pcs.playerId}
          order by ${pcs.totalGames} desc, ${pcs.superstringPower} desc, ${pcs.totalWins} desc
        )
      `
		})
		.from(pcs)
		.where(inArray(pcs.playerId, ids))
		.as('r');

	const whereTopN = topN > 0 ? sql`${ranked.rn} <= ${topN}` : undefined; // ← key change

	const rows = await db
		.select({
			playerId: ranked.playerId,
			characterId: ranked.characterId,
			totalGames: ranked.totalGames
		})
		.from(ranked)
		.where(whereTopN);

	const out: FrequentAgentsMap = {};
	for (const r of rows) (out[r.playerId] ??= []).push([r.characterId as Character, r.totalGames]);
	return out;
}

export async function getPlayerMapStats(playerId: string): Promise<
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

	// Compute player's stable team index per match (reassigned position)
	const teamIndexRows = await db
		.select({
			matchId: schema.match.id,
			playerTeamIndex: sql<number>`min(${schema.gameTeam.position})`.as('player_team_index')
		})
		.from(schema.gamePlayerScore)
		.innerJoin(schema.game, eq(schema.gamePlayerScore.gameId, schema.game.id))
		.innerJoin(schema.match, eq(schema.game.matchId, schema.match.id))
		.innerJoin(
			schema.gameTeam,
			and(
				eq(schema.gamePlayerScore.teamId, schema.gameTeam.teamId),
				eq(schema.gameTeam.gameId, schema.game.id)
			)
		)
		.where(inArray(schema.gamePlayerScore.accountId, accountIds))
		.groupBy(schema.match.id);

	const playerTeamIndexByMatch = new Map<string, number>(
		teamIndexRows.map((r) => [r.matchId, r.playerTeamIndex ?? 0])
	);

	// Find all games where this player participated with map and winner information
	const playerGames = await db
		.select({
			gameId: schema.game.id,
			mapId: schema.game.mapId,
			winner: schema.game.winner,
			matchId: schema.game.matchId
		})
		.from(schema.game)
		.innerJoin(schema.gamePlayerScore, eq(schema.game.id, schema.gamePlayerScore.gameId))
		.where(inArray(schema.gamePlayerScore.accountId, accountIds));

	// Group games by map and calculate wins/losses
	const mapStats = new Map<GameMap, { wins: number; losses: number }>();

	// Ensure we count each game only once (deduplicate by gameId)
	const processedGames = new Set<number>();

	for (const game of playerGames) {
		if (processedGames.has(game.gameId)) continue;
		processedGames.add(game.gameId);

		if (!mapStats.has(game.mapId)) {
			mapStats.set(game.mapId, { wins: 0, losses: 0 });
		}

		const stats = mapStats.get(game.mapId)!;

		// winner: 0 = team A won, 1 = team B won; compare to stable match team index
		const teamIdx = playerTeamIndexByMatch.get(game.matchId) ?? 0;
		const playerWon = game.winner === teamIdx;

		if (playerWon) {
			stats.wins++;
		} else {
			stats.losses++;
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

export async function getPlayerEvents(id: string): Promise<
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

export async function getPlayerMatches(id: string): Promise<
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

type DetailedMatchesOut = {
	id: string;
	format: string | null;
	stageId: number | null;
	teams: Array<{ team: string | null; teamId: string | null; score: number }>;
	games: Array<{
		id: number;
		winner: number;
		mapId?: GameMap | null;
		teamScores?: [number, number];
		playerPlayed?: boolean;
		playerStats?: {
			characters: [Character | null, Character | null];
			score: number;
			damageScore: number;
			kills: number;
			knocks: number;
			deaths: number;
			assists: number;
			damage: number;
		};
	}>;
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
	playerTeamIndex: number;
};

export async function getPlayerDetailedMatches(playerId: string): Promise<DetailedMatchesOut[]> {
	// STEP 1: Simplified Discovery
	// Get all game accounts for the player.
	const accounts = await db
		.select({ accountId: schema.gameAccount.accountId })
		.from(schema.gameAccount)
		.where(eq(schema.gameAccount.playerId, playerId));

	if (accounts.length === 0) return [];
	const accountIds = accounts.map((a) => a.accountId);

	// Find all unique match IDs the player has a score in.
	const matchIdRows = await db
		.selectDistinct({ matchId: schema.game.matchId })
		.from(schema.gamePlayerScore)
		.innerJoin(schema.game, eq(schema.gamePlayerScore.gameId, schema.game.id))
		.where(inArray(schema.gamePlayerScore.accountId, accountIds));

	if (matchIdRows.length === 0) return [];
	const matchIds = matchIdRows.map((r) => r.matchId!);

	// STEP 2: Complete Hydration with a Single Relational Query
	// Fetch the entire data graph for all relevant matches at once.
	const matches = await db.query.match.findMany({
		where: (m, { inArray }) => inArray(m.id, matchIds),
		columns: { id: true, format: true, stageId: true },
		with: {
			stage: {
				with: {
					event: true
				}
			},
			matchTeams: {
				with: {
					team: true
				},
				orderBy: (mt, { asc }) => [asc(mt.position)]
			},
			// Fetch all game-level details directly.
			games: {
				orderBy: (g, { asc }) => [asc(g.id)],
				with: {
					map: { columns: { id: true } },
					// This replaces the separate `gameTeamRows` query.
					gameTeams: {
						with: { team: { columns: { id: true, name: true } } },
						orderBy: (gt, { asc }) => [asc(gt.position)]
					},
					// This replaces the separate `psRows` query.
					gamePlayerScores: true
				}
			}
		}
	});

	// STEP 3: Simplified Post-Processing
	// All the data is now neatly nested, making transformations much easier.
	const out: DetailedMatchesOut[] = matches.map((match) => {
		// Determine the teams playing in the match (with fallback).
		const canonicalTeams = (match.matchTeams ?? []).map((mt) => ({
			team: mt.team?.name ?? mt.teamId,
			teamId: mt.team?.id ?? mt.teamId,
			score: mt.score ?? 0
		}));

		// Fallback if matchTeams is empty (for legacy data).
		if (canonicalTeams.length === 0 && match.games.length > 0) {
			match.games[0].gameTeams.forEach((gt) => {
				canonicalTeams.push({
					team: gt.team?.name ?? gt.teamId,
					teamId: gt.team?.id ?? gt.teamId,
					score: 0
				});
			});
		}

		const canonicalTeamA = canonicalTeams[0];
		const canonicalTeamB = canonicalTeams[1];

		// Process each game within the match.
		const games = match.games.map((game) => {
			const playerStats = game.gamePlayerScores.find((ps) => accountIds.includes(ps.accountId));

			const gameTeamA = game.gameTeams.find((gt) => gt.teamId === canonicalTeamA?.teamId);
			const gameTeamB = game.gameTeams.find((gt) => gt.teamId === canonicalTeamB?.teamId);

			let normalizedWinner: 0 | 1 | -1 = game.winner ?? -1;
			if (game.winner === 0 || game.winner === 1) {
				const originalWinningTeam = game.gameTeams.find((gt) => gt.position === game.winner);
				if (originalWinningTeam?.teamId === canonicalTeamA?.teamId) {
					normalizedWinner = 0;
				} else if (originalWinningTeam?.teamId === canonicalTeamB?.teamId) {
					normalizedWinner = 1;
				}
			}
			const teamScores: [number, number] = [gameTeamA?.score ?? 0, gameTeamB?.score ?? 0];

			return {
				id: game.id,
				winner: normalizedWinner,
				mapId: game.map?.id,
				teamScores,
				playerPlayed: !!playerStats,
				playerStats: playerStats
					? ({
							characters: [
								playerStats.characterFirstHalf as Character | null,
								playerStats.characterSecondHalf as Character | null
							],
							score: playerStats.score,
							damageScore: playerStats.damageScore,
							kills: playerStats.kills,
							knocks: playerStats.knocks,
							deaths: playerStats.deaths,
							assists: playerStats.assists,
							damage: playerStats.damage
						} satisfies Omit<PlayerScore, 'playerSlug' | 'player' | 'accountId'>)
					: undefined
			};
		});

		// Calculate final match score based on game wins.
		const wins: [number, number] = [0, 0];
		games.forEach((game) => {
			if (game.winner === 0) wins[0]++;
			if (game.winner === 1) wins[1]++;
		});
		canonicalTeams.forEach((team, i) => (team.score = wins[i] ?? 0));

		// Determine which team the player is on.
		const playerTeamId = match.games
			.flatMap((g) => g.gamePlayerScores)
			.find((ps) => accountIds.includes(ps.accountId))?.teamId;
		const playerTeamIndex = Math.max(
			0,
			canonicalTeams.findIndex((t) => t.teamId === playerTeamId)
		);

		return {
			id: match.id,
			format: match.format,
			stageId: match.stageId,
			teams: canonicalTeams,
			games,
			event: match.stage!.event, // Use non-null assertion if event is guaranteed.
			playerTeamIndex
		};
	});

	return out;
}

export async function getPlayerWins(playerId: string): Promise<number> {
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

	// Compute player's stable team index per match (reassigned position)
	const teamIndexRows = await db
		.select({
			matchId: schema.match.id,
			playerTeamIndex: sql<number>`min(${schema.gameTeam.position})`.as('player_team_index')
		})
		.from(schema.gamePlayerScore)
		.innerJoin(schema.game, eq(schema.gamePlayerScore.gameId, schema.game.id))
		.innerJoin(schema.match, eq(schema.game.matchId, schema.match.id))
		.innerJoin(
			schema.gameTeam,
			and(
				eq(schema.gamePlayerScore.teamId, schema.gameTeam.teamId),
				eq(schema.gameTeam.gameId, schema.game.id)
			)
		)
		.where(inArray(schema.gamePlayerScore.accountId, accountIds))
		.groupBy(schema.match.id);

	const playerTeamIndexByMatch = new Map<string, number>(
		teamIndexRows.map((r) => [r.matchId, r.playerTeamIndex ?? 0])
	);

	// Find all games where this player participated with winner information
	const playerGames = await db
		.select({
			gameId: schema.game.id,
			winner: schema.game.winner,
			matchId: schema.game.matchId
		})
		.from(schema.game)
		.innerJoin(schema.gamePlayerScore, eq(schema.game.id, schema.gamePlayerScore.gameId))
		.where(inArray(schema.gamePlayerScore.accountId, accountIds));

	// Count wins
	let wins = 0;
	const processedGames = new Set<number>();

	for (const game of playerGames) {
		// Skip if we've already processed this game
		if (processedGames.has(game.gameId)) {
			continue;
		}

		// Compare vs stable team index for the match
		const teamIdx = playerTeamIndexByMatch.get(game.matchId) ?? 0;
		const playerWon = game.winner === teamIdx;
		if (playerWon) wins++;
		processedGames.add(game.gameId);
	}

	console.info('[Players] Player', playerId, 'has', wins, 'wins');
	return wins;
}

export async function getPlayerKD(playerId: string): Promise<number> {
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
					server: getGameAccountServer(account.region),
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
					server: getGameAccountServer(account.region),
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

export async function getPlayerSuperstringPower(
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

	// Compute player's stable team index per match (reassigned position)
	const teamIndexRows = await db
		.select({
			matchId: schema.match.id,
			playerTeamIndex: sql<number>`min(${schema.gameTeam.position})`.as('player_team_index')
		})
		.from(schema.gamePlayerScore)
		.innerJoin(schema.game, eq(schema.gamePlayerScore.gameId, schema.game.id))
		.innerJoin(schema.match, eq(schema.game.matchId, schema.match.id))
		.innerJoin(
			schema.gameTeam,
			and(
				eq(schema.gamePlayerScore.teamId, schema.gameTeam.teamId),
				eq(schema.gameTeam.gameId, schema.game.id)
			)
		)
		.where(
			and(
				inArray(schema.gamePlayerScore.accountId, accountIds),
				or(
					eq(schema.gamePlayerScore.characterFirstHalf, character),
					eq(schema.gamePlayerScore.characterSecondHalf, character)
				)
			)
		)
		.groupBy(schema.match.id);

	const playerTeamIndexByMatch = new Map<string, number>(
		teamIndexRows.map((r) => [r.matchId, r.playerTeamIndex ?? 0])
	);

	// Find all games where this player used the specific character with game results
	const playerGames = await db
		.select({
			score: schema.gamePlayerScore.score,
			gameId: schema.gamePlayerScore.gameId,
			winner: schema.game.winner,
			matchId: schema.game.matchId
		})
		.from(schema.gamePlayerScore)
		.innerJoin(schema.game, eq(schema.game.id, schema.gamePlayerScore.gameId))
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

		// winner: 0 = team A won, 1 = team B won; compare to stable match team index
		const teamIdx = playerTeamIndexByMatch.get(game.matchId) ?? 0;
		const playerWon = game.winner === teamIdx;

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

// Apply nationality normalization to player data
export function normalizePlayer<
	T extends {
		nationality: TCountryCode | null;
		additionalNationalities: { nationality: TCountryCode }[];
		aliases: {
			alias: string;
		}[];
	}
>(
	player: T
): Omit<T, 'nationalities' | 'aliases'> & {
	nationalities: TCountryCode[];
	aliases: string[];
} {
	return {
		...player,
		nationalities: [
			player.nationality,
			...player.additionalNationalities.map((a) => a.nationality)
		].filter((n) => n !== null),
		aliases: player.aliases.map((a) => a.alias)
	};
}
