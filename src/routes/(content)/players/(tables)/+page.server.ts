import type { PageServerLoad } from './$types';
import { getServerPlayersAgents } from '$lib/server/data/players';
import { CHARACTERS } from '$lib/data/game';
import { processImageURL } from '$lib/server/storage';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { and, desc, asc, like, inArray, sql, eq, isNotNull } from 'drizzle-orm';
import type { TCountryCode } from 'countries-list';

// Helper functions (kept from your original code)
function parseUrlParamNumber(value: string | null, defaultValue: number): number {
	if (!value) {
		return defaultValue;
	}
	const parsed = Number(value);
	return isNaN(parsed) ? defaultValue : parsed;
}

function parseUrlParamEnum<T extends string>(
	value: string | null,
	defaultValue: T,
	validValues: T[]
): T {
	if (!value || !validValues.includes(value as T)) {
		return defaultValue;
	}
	return value as T;
}

export const load: PageServerLoad = async ({ locals: { user }, url }) => {
	// -- Parsed URL params --
	const page = parseUrlParamNumber(url.searchParams.get('page'), 1);
	const pageSize = parseUrlParamNumber(url.searchParams.get('pageSize'), 100);
	const sortBy = parseUrlParamEnum(url.searchParams.get('sortBy'), 'rating-desc', [
		'name-abc',
		'name-cba',
		'wins-asc',
		'wins-desc',
		'rating-asc',
		'rating-desc',
		'region-asc',
		'region-desc',
		'team-asc',
		'team-desc',
		'kd-asc',
		'kd-desc',
		'events-asc',
		'events-desc'
	]);
	const search = url.searchParams.get('search') ?? '';
	const nationalities = url.searchParams.get('nationalities')?.split(',') ?? [];

	// -- Pagination --
	const offset = (page - 1) * pageSize;
	const limit = pageSize;

	console.log(`[Players] Loading players with conditions:`, {
		search,
		nationalities,
		page,
		pageSize,
		sortBy,
		offset,
		limit
	});

	// -- Dynamic Query Conditions --
	const whereConditions = [
		search.length > 0 ? like(table.player.name, `%${search}%`) : undefined,
		nationalities.length > 0
			? inArray(table.player.nationality, nationalities as TCountryCode[])
			: undefined
	].filter((x): x is NonNullable<typeof x> => x !== undefined);

	console.log(`[Players] Where conditions:`, whereConditions);

	const orderByConditions = [
		sortBy === 'name-abc'
			? asc(table.player.name)
			: sortBy === 'name-cba'
				? desc(table.player.name)
				: undefined,
		sortBy === 'wins-asc'
			? asc(table.playerStats.totalWins)
			: sortBy === 'wins-desc'
				? desc(table.playerStats.totalWins)
				: undefined,
		sortBy === 'rating-asc'
			? asc(table.playerStats.playerRating)
			: sortBy === 'rating-desc'
				? desc(table.playerStats.playerRating)
				: undefined,
		sortBy === 'region-asc'
			? asc(table.player.nationality)
			: sortBy === 'region-desc'
				? desc(table.player.nationality)
				: undefined,
		sortBy === 'team-asc'
			? sql`MIN(${table.team.name}) ASC NULLS LAST`
			: sortBy === 'team-desc'
				? sql`MIN(${table.team.name}) DESC NULLS LAST`
				: undefined,
		sortBy === 'kd-asc'
			? asc(table.playerStats.kd)
			: sortBy === 'kd-desc'
				? desc(table.playerStats.kd)
				: undefined,
		sortBy === 'events-asc'
			? asc(table.playerStats.eventsCount)
			: sortBy === 'events-desc'
				? desc(table.playerStats.eventsCount)
				: undefined
	];

	const orderBy = orderByConditions.filter((x): x is NonNullable<typeof x> => x !== undefined);

	const totalPlayers = await db
		.select({ cnt: sql<number>`count(distinct ${table.player.id})` })
		.from(table.player);

	console.log(`[Players] Total players:`, totalPlayers.length);

	// -- 1. Get total count with filters applied --
	const [{ cnt: totalCount }] = await db
		.select({ cnt: sql<number>`count(distinct ${table.player.id})` })
		.from(table.player)
		.leftJoin(table.playerStats, eq(table.player.id, table.playerStats.playerId))
		.where(and(...whereConditions));

	console.log(`[Players] Total count:`, totalCount);

	// -- 2. Get the sorted and paginated list of player IDs --
	const playerIdsQuery = await db
		.select({ id: table.player.id })
		.from(table.player)
		.leftJoin(table.playerStats, eq(table.player.id, table.playerStats.playerId))
		.leftJoin(table.teamPlayer, eq(table.player.id, table.teamPlayer.playerId))
		.leftJoin(table.team, eq(table.teamPlayer.teamId, table.team.id))
		.where(and(...whereConditions))
		.groupBy(table.player.id)
		.orderBy(...orderBy)
		.limit(limit)
		.offset(offset);

	const playerIds = playerIdsQuery.map((p) => p.id);

	// -- 3. Fetch all relational data for those specific players --
	const players =
		playerIds.length > 0
			? await db.query.player.findMany({
					columns: {
						id: true,
						slug: true,
						name: true,
						avatar: true,
						nationality: true
					},
					with: {
						teamMemberships: {
							with: {
								team: {
									columns: { id: true, name: true, slug: true }
								}
							}
						},
						stats: {
							columns: {
								playerRating: true,
								kd: true,
								eventsCount: true,
								totalWins: true,
								totalLosses: true
							}
						},
						gameAccounts: { columns: { currentName: true } },
						aliases: { columns: { alias: true } },
						additionalNationalities: { columns: { nationality: true } }
					},
					where: inArray(table.player.id, playerIds)
				})
			: [];

	// -- Fetch additional data (Agents, Superstring Power, etc.) --
	const playersAgents = await getServerPlayersAgents(playerIds, 0);

	const superstringPowerData: Record<
		string,
		{ playerId: string; power: number; gamesPlayed: number; wins: number }[]
	> = {};
	for (const character of CHARACTERS) {
		superstringPowerData[character] = await db.query.playerCharacterStats
			.findMany({
				where: (stats, { eq, and, inArray }) =>
					and(
						eq(stats.characterId, character),
						playerIds.length > 0 ? inArray(stats.playerId, playerIds) : sql`0 = 1`
					)
			})
			.then((stats) =>
				stats.map((stat) => ({
					playerId: stat.playerId,
					power: stat.superstringPower,
					gamesPlayed: stat.totalGames,
					wins: stat.totalWins
				}))
			);
	}

	// -- Process Avatars --
	const uniqueAvatarUrls = new Set(players.map((p) => p.avatar).filter(Boolean) as string[]);
	const avatarUrlMap = new Map<string, string>();
	await Promise.all(
		Array.from(uniqueAvatarUrls).map(async (url) => {
			const processed = await processImageURL(url);
			avatarUrlMap.set(url, processed);
		})
	);

	// -- Return final structured data --
	return {
		players: players.map((player) => {
			const stats = player.stats ?? { totalWins: 0, playerRating: 0, kd: 0, eventsCount: 0 };
			return {
				...player,
				avatarURL: player.avatar ? avatarUrlMap.get(player.avatar) || null : null,
				wins: stats.totalWins,
				rating: stats.playerRating,
				kd: stats.kd,
				eventsCount: stats.eventsCount,
				gameAccounts: player.gameAccounts,
				aliases: player.aliases.map((a) => a.alias),
				nationalities: [
					...new Set([
						player.nationality,
						...player.additionalNationalities.map((n) => n.nationality)
					])
				].filter(Boolean) as TCountryCode[],
				teams: player.teamMemberships.map((t) => t.team)
			};
		}),
		playersAgents,
		superstringPowerData,
		pagination: {
			currentPage: page,
			pageSize: pageSize,
			totalCount,
			totalPages: Math.ceil(totalCount / pageSize)
		},
		sortBy,
		search,
		nationalities,
		totalCount: totalPlayers[0].cnt
	};
};
