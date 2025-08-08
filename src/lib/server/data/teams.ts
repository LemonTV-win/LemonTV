import type { Character, Region } from '$lib/data/game';
import { getServerPlayerKD, getServerPlayerAgents, getAllPlayersRatings } from './players';

import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, or, inArray } from 'drizzle-orm';

import type { Team } from '$lib/data/teams';
import type { Player } from '$lib/data/players';
import type { User, UserRole } from '$lib/data/user';
import type { TCountryCode } from 'countries-list';

import { randomUUID } from 'node:crypto';
import { editHistory } from '$lib/server/db/schemas/edit-history';
import { processImageURL } from '../storage';

export async function getTeamMemberStatistics(team: Team): Promise<Record<
	string,
	{
		kd: number;
		rating: number;
		characters: [Character, number][];
	}
> | null> {
	if (!team.players?.length) {
		return null;
	}

	// Get player IDs for this team
	const playerIds = team.players
		.filter(Boolean)
		.map((player) => player.id)
		.filter(Boolean);

	if (playerIds.length === 0) {
		return null;
	}

	// Get all player ratings (optimized)
	const allPlayerRatings = await getAllPlayersRatings();
	const ratingsByPlayerId = new Map(
		allPlayerRatings.map((rating) => [rating.playerId, rating.rating])
	);

	// Get KD and agents for each player
	const result: Record<string, { kd: number; rating: number; characters: [Character, number][] }> =
		{};

	for (const player of team.players) {
		if (!player.id) continue;

		const kd = await getServerPlayerKD(player.id);
		const characters = await getServerPlayerAgents(player.id);
		const rating = ratingsByPlayerId.get(player.id) ?? 0;

		result[player.id] = {
			kd,
			rating,
			characters
		};
	}

	return result;
}

export async function getTeam(slug: string): Promise<Team | null> {
	const rows = await db
		.select()
		.from(table.team)
		.where(or(eq(table.team.slug, slug), eq(table.team.id, slug)))
		.leftJoin(table.teamPlayer, eq(table.teamPlayer.teamId, table.team.id))
		.leftJoin(table.player, eq(table.player.id, table.teamPlayer.playerId))
		.leftJoin(table.playerAlias, eq(table.playerAlias.playerId, table.player.id))
		.leftJoin(table.gameAccount, eq(table.gameAccount.playerId, table.player.id))
		.leftJoin(
			table.player_social_account,
			eq(table.player_social_account.playerId, table.player.id)
		)
		.leftJoin(table.user, eq(table.user.id, table.player.userId))
		.leftJoin(table.userRole, eq(table.userRole.userId, table.user.id))
		.leftJoin(
			table.playerAdditionalNationality,
			eq(table.playerAdditionalNationality.playerId, table.player.id)
		);

	if (rows.length === 0) return null;

	const teamRow = rows[0].teams;
	const playerMap = new Map<string, Player>();

	for (const row of rows) {
		const p = row.player;
		if (!p?.id) continue;

		if (!playerMap.has(p.id)) {
			playerMap.set(p.id, {
				id: p.id,
				name: p.name,
				slug: p.slug ?? undefined,
				avatar: p.avatar || undefined,
				nationalities: p.nationality ? [p.nationality as TCountryCode] : [],
				aliases: [],
				gameAccounts: [],
				socialAccounts: [],
				user: row.user
					? ({
							id: row.user.id,
							email: row.user.email,
							username: row.user.username,
							roles: []
						} as User)
					: undefined
			});
		}

		const player = playerMap.get(p.id)!;

		// Add additional nationality
		const additionalNationality = row.player_additional_nationality?.nationality;
		if (
			additionalNationality &&
			!player.nationalities.includes(additionalNationality as TCountryCode)
		) {
			player.nationalities.push(additionalNationality as TCountryCode);
		}

		// Add alias
		const alias = row.player_alias?.alias;
		if (alias && !player.aliases!.includes(alias)) {
			player.aliases!.push(alias);
		}

		// Add game account
		const ga = row.game_account;
		if (
			ga?.accountId &&
			!player.gameAccounts.some((a) => a.accountId === ga.accountId && a.server === ga.server)
		) {
			player.gameAccounts.push({
				server: ga.server as 'Strinova' | 'CalabiYau',
				accountId: ga.accountId,
				currentName: ga.currentName,
				region: (ga.region as Region) ?? undefined
			});
		}

		// Add social account
		const sa = row.social_account;
		if (
			sa?.platformId &&
			!player.socialAccounts!.some(
				(a) => a.platformId === sa.platformId && a.accountId === sa.accountId
			)
		) {
			player.socialAccounts!.push({
				platformId: sa.platformId,
				accountId: sa.accountId,
				overridingUrl: sa.overriding_url ?? undefined
			});
		}

		// Add user role
		const role = row.user_role?.roleId as UserRole | undefined;
		if (player.user && role && !player.user.roles.includes(role)) {
			player.user.roles.push(role);
		}
	}

	const fullTeam: Team & { logoURL: string | null } = {
		id: teamRow.id,
		name: teamRow.name,
		slug: teamRow.slug,
		abbr: teamRow.abbr,
		logo: teamRow.logo,
		logoURL: teamRow.logo ? await processImageURL(teamRow.logo) : null,
		region: (teamRow.region as Region) ?? undefined,
		players: Array.from(playerMap.values()),
		wins: await getServerTeamWins(teamRow.id),
		createdAt: teamRow.createdAt,
		updatedAt: teamRow.updatedAt
	};

	return fullTeam;
}

export async function getTeams(): Promise<(Team & { logoURL: string | null })[]> {
	console.info('[Teams] Fetching all teams');
	const rows = await db
		.select()
		.from(table.team)
		.leftJoin(table.teamPlayer, eq(table.teamPlayer.teamId, table.team.id))
		.leftJoin(table.player, eq(table.player.id, table.teamPlayer.playerId))
		.leftJoin(table.playerAlias, eq(table.playerAlias.playerId, table.player.id))
		.leftJoin(table.gameAccount, eq(table.gameAccount.playerId, table.player.id))
		.leftJoin(
			table.player_social_account,
			eq(table.player_social_account.playerId, table.player.id)
		)
		.leftJoin(table.user, eq(table.user.id, table.player.userId))
		.leftJoin(table.userRole, eq(table.userRole.userId, table.user.id))
		.leftJoin(table.teamAlias, eq(table.teamAlias.teamId, table.team.id))
		.leftJoin(
			table.playerAdditionalNationality,
			eq(table.playerAdditionalNationality.playerId, table.player.id)
		);

	const teamMap = new Map<
		string,
		Omit<Team, 'players' | 'aliases'> & { players: Map<string, Player>; aliases: Set<string> }
	>();

	for (const row of rows) {
		const t = row.teams;
		if (!teamMap.has(t.id)) {
			teamMap.set(t.id, {
				id: t.id,
				name: t.name,
				slug: t.slug,
				abbr: t.abbr,
				logo: t.logo,
				region: (t.region as Region) ?? undefined,
				players: new Map<string, Player>(),
				aliases: new Set<string>(),
				wins: await getServerTeamWins(t.id),
				createdAt: t.createdAt,
				updatedAt: t.updatedAt
			});
		}

		const team = teamMap.get(t.id)!;

		// Add team alias
		const teamAlias = row.team_alias?.alias;
		if (teamAlias) {
			team.aliases.add(teamAlias);
		}

		const p = row.player;
		if (!p?.id) continue;

		if (!team.players.has(p.id)) {
			team.players.set(p.id, {
				id: p.id,
				name: p.name,
				slug: p.slug ?? undefined,
				avatar: p.avatar || undefined,
				nationalities: p.nationality ? [p.nationality as TCountryCode] : [],
				aliases: [],
				gameAccounts: [],
				socialAccounts: [],
				user: row.user
					? ({
							id: row.user.id,
							email: row.user.email,
							username: row.user.username,
							roles: []
						} as User)
					: undefined
			});
		}

		const player = team.players.get(p.id)!;

		// Add player alias
		const playerAlias = row.player_alias?.alias;
		if (playerAlias && !player.aliases!.includes(playerAlias)) {
			player.aliases!.push(playerAlias);
		}

		// Add game account
		const gameAccount = row.game_account;
		if (
			gameAccount?.accountId &&
			!player.gameAccounts.some(
				(a) => a.accountId === gameAccount.accountId && a.server === gameAccount.server
			)
		) {
			player.gameAccounts.push({
				server: gameAccount.server as 'Strinova' | 'CalabiYau',
				accountId: gameAccount.accountId,
				currentName: gameAccount.currentName,
				region: (gameAccount.region as Region) ?? undefined
			});
		}

		// Add social account
		const sa = row.social_account;
		if (
			sa?.platformId &&
			!player.socialAccounts!.some(
				(a) => a.platformId === sa.platformId && a.accountId === sa.accountId
			)
		) {
			player.socialAccounts!.push({
				platformId: sa.platformId,
				accountId: sa.accountId,
				overridingUrl: sa.overriding_url ?? undefined
			});
		}

		// Add additional nationality
		const additionalNationality = row.player_additional_nationality?.nationality;
		if (
			additionalNationality &&
			!player.nationalities.includes(additionalNationality as TCountryCode)
		) {
			player.nationalities.push(additionalNationality as TCountryCode);
		}

		// Add user role
		const role = row.user_role?.roleId as UserRole | undefined;
		if (player.user && role && !player.user.roles.includes(role)) {
			player.user.roles.push(role);
		}
	}

	// Collect unique logo URLs
	const uniqueLogoUrls = new Set<string>();
	for (const team of teamMap.values()) {
		if (team.logo) {
			uniqueLogoUrls.add(team.logo);
		}
	}

	// Process all logo URLs in parallel
	const logoUrlMap = new Map<string, string>();
	await Promise.all(
		Array.from(uniqueLogoUrls).map(async (url) => {
			const processed = await processImageURL(url);
			logoUrlMap.set(url, processed);
		})
	);

	// Apply processed URLs to teams
	return Array.from(teamMap.values()).map((t) => ({
		...t,
		players: Array.from(t.players.values()),
		aliases: Array.from(t.aliases),
		logoURL: t.logo ? logoUrlMap.get(t.logo) || null : null
	}));
}

export async function getServerTeamWins(teamId: string): Promise<number> {
	console.info('[Teams] Fetching server team wins for:', teamId);

	// Find all matches where this team participated
	const teamMatches = await db
		.select({
			matchId: table.match.id,
			teamPosition: table.matchTeam.position,
			teamScore: table.matchTeam.score
		})
		.from(table.matchTeam)
		.innerJoin(table.match, eq(table.matchTeam.matchId, table.match.id))
		.where(eq(table.matchTeam.teamId, teamId));

	// Count wins
	let wins = 0;

	for (const match of teamMatches) {
		// Get both teams' scores for this match
		const matchTeams = await db
			.select({
				position: table.matchTeam.position,
				score: table.matchTeam.score
			})
			.from(table.matchTeam)
			.where(eq(table.matchTeam.matchId, match.matchId))
			.orderBy(table.matchTeam.position);

		if (matchTeams.length === 2) {
			const team1Score = matchTeams[0].score ?? 0;
			const team2Score = matchTeams[1].score ?? 0;

			// Determine winner based on match scores
			if (team1Score !== team2Score) {
				const winnerPosition = team1Score > team2Score ? 0 : 1;

				// Check if our team won
				if (match.teamPosition === winnerPosition) {
					wins++;
				}
			}
			// If scores are equal, it's a draw - no winner
		}
	}

	console.info('[Teams] Team', teamId, 'has', wins, 'match wins');
	return wins;
}

export async function getServerTeamDetailedMatches(teamId: string): Promise<
	{
		id: string;
		format: string | null;
		stageId: number | null;
		teams: Array<{
			team: string;
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
		// Team's position in this match (0 or 1)
		teamIndex: number;
	}[]
> {
	// Get all matches where this team participated
	const teamMatches = await db
		.select({
			// Match data
			matchId: table.match.id,
			format: table.match.format,
			stageId: table.match.stageId,
			// Event data
			eventId: table.event.id,
			eventSlug: table.event.slug,
			eventName: table.event.name,
			eventImage: table.event.image,
			eventDate: table.event.date,
			eventRegion: table.event.region,
			eventFormat: table.event.format,
			eventStatus: table.event.status,
			eventServer: table.event.server,
			eventCapacity: table.event.capacity,
			eventOfficial: table.event.official,
			// Team's position in this match
			teamPosition: table.matchTeam.position
		})
		.from(table.matchTeam)
		.innerJoin(table.match, eq(table.matchTeam.matchId, table.match.id))
		.innerJoin(table.stage, eq(table.match.stageId, table.stage.id))
		.innerJoin(table.event, eq(table.stage.eventId, table.event.id))
		.where(eq(table.matchTeam.teamId, teamId));

	// Get unique match IDs
	const matchIds = [...new Set(teamMatches.map((tm) => tm.matchId))];

	// Get all teams for these matches - try match_team first, fallback to game_team
	const matchTeams = await db
		.select({
			matchId: table.matchTeam.matchId,
			teamId: table.matchTeam.teamId,
			position: table.matchTeam.position,
			score: table.matchTeam.score,
			teamName: table.team.name,
			teamSlug: table.team.slug,
			teamAbbr: table.team.abbr
		})
		.from(table.matchTeam)
		.innerJoin(table.team, eq(table.matchTeam.teamId, table.team.id))
		.where(inArray(table.matchTeam.matchId, matchIds))
		.orderBy(table.matchTeam.position);

	// If we don't have match teams, try to get teams from game_team
	let fallbackTeams: typeof matchTeams = [];
	if (matchTeams.length === 0) {
		fallbackTeams = await db
			.select({
				matchId: table.game.matchId,
				teamId: table.gameTeam.teamId,
				position: table.gameTeam.position,
				score: table.gameTeam.score,
				teamName: table.team.name,
				teamSlug: table.team.slug,
				teamAbbr: table.team.abbr
			})
			.from(table.game)
			.innerJoin(table.gameTeam, eq(table.game.id, table.gameTeam.gameId))
			.innerJoin(table.team, eq(table.gameTeam.teamId, table.team.id))
			.where(inArray(table.game.matchId, matchIds))
			.orderBy(table.gameTeam.position);
	}

	// Use match teams if available, otherwise use fallback teams
	const allTeams = matchTeams.length > 0 ? matchTeams : fallbackTeams;

	// Get all games for these matches
	const matchGames = await db
		.select({
			matchId: table.game.matchId,
			gameId: table.game.id,
			winner: table.game.winner
		})
		.from(table.game)
		.where(inArray(table.game.matchId, matchIds));

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
	const result = teamMatches.map((tm) => {
		const teams = teamsByMatch.get(tm.matchId) || [];
		const games = gamesByMatch.get(tm.matchId) || [];

		// Ensure we have exactly 2 teams
		let processedTeams = teams.map((team) => {
			const teamName = (team.teamAbbr ||
				team.teamName ||
				team.teamSlug ||
				team.teamId ||
				'Unknown Team') as string;
			return {
				team: teamName,
				score: team.score || 0
			};
		});

		// If we don't have exactly 2 teams, pad with placeholder teams
		while (processedTeams.length < 2) {
			processedTeams.push({
				team: `Team ${processedTeams.length + 1}`,
				score: 0
			});
		}

		// If we have more than 2 teams, take only the first 2
		if (processedTeams.length > 2) {
			processedTeams = processedTeams.slice(0, 2);
		}

		return {
			id: tm.matchId,
			format: tm.format,
			stageId: tm.stageId,
			teams: processedTeams,
			games: games.map((game) => ({
				winner: game.winner
			})),
			event: {
				id: tm.eventId,
				slug: tm.eventSlug,
				name: tm.eventName,
				image: tm.eventImage,
				date: tm.eventDate,
				region: tm.eventRegion,
				format: tm.eventFormat,
				status: tm.eventStatus,
				server: tm.eventServer,
				capacity: tm.eventCapacity,
				official: tm.eventOfficial
			},
			teamIndex: tm.teamPosition || 0
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

export async function getTeamStatistics(team: Team): Promise<{
	ranking: number;
	wins: number;
}> {
	// TODO: More efficent algorithm
	const teams = await getTeams();
	const teamsWithWins = await Promise.all(
		teams.map(async (t) => ({
			...t,
			wins: await getServerTeamWins(t.id)
		}))
	);

	const sortedByWins = teamsWithWins.sort((a, b) => b.wins - a.wins);

	const currentTeamIndex = sortedByWins.findIndex((t) => t.id === team.id);

	return {
		ranking: currentTeamIndex + 1,
		wins: sortedByWins[currentTeamIndex]?.wins ?? 0
	};
}

export async function createTeam(
	data: {
		name: string;
		slug?: string;
		abbr?: string;
		logo?: string;
		region?: Region;
		aliases?: string[];
		players?: {
			playerId: string;
			role: string;
			startedOn?: string;
			endedOn?: string;
			note?: string;
		}[];
	},
	editedBy: string
) {
	const id = randomUUID();
	const slug = data.slug ?? data.name.toLowerCase().replace(/[^a-z0-9]/g, '-');

	await db.transaction(async (tx) => {
		await tx.insert(table.team).values({
			id,
			name: data.name,
			slug,
			abbr: data.abbr,
			logo: data.logo,
			region: data.region
		});

		// Record initial creation in edit history
		await tx.insert(editHistory).values({
			id: randomUUID(),
			tableName: 'teams',
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
				tableName: 'teams',
				recordId: id,
				fieldName: 'name',
				oldValue: null,
				newValue: data.name.toString(),
				editedBy
			});
		}

		if (data.region) {
			await tx.insert(editHistory).values({
				id: randomUUID(),
				tableName: 'teams',
				recordId: id,
				fieldName: 'region',
				oldValue: null,
				newValue: data.region.toString(),
				editedBy
			});
		}

		if (data.abbr) {
			await tx.insert(editHistory).values({
				id: randomUUID(),
				tableName: 'teams',
				recordId: id,
				fieldName: 'abbr',
				oldValue: null,
				newValue: data.abbr.toString(),
				editedBy
			});
		}

		if (data.logo) {
			await tx.insert(editHistory).values({
				id: randomUUID(),
				tableName: 'teams',
				recordId: id,
				fieldName: 'logo',
				oldValue: null,
				newValue: data.logo.toString(),
				editedBy
			});
		}

		if (data.aliases?.length) {
			await tx.insert(table.teamAlias).values(
				data.aliases.map((alias) => ({
					teamId: id,
					alias
				}))
			);

			// Record initial aliases
			for (const alias of data.aliases) {
				await tx.insert(editHistory).values({
					id: randomUUID(),
					tableName: 'team_alias',
					recordId: id,
					fieldName: 'alias',
					oldValue: null,
					newValue: alias.toString(),
					editedBy
				});
			}
		}

		if (data.players?.length) {
			await tx.insert(table.teamPlayer).values(
				data.players.map((player) => ({
					teamId: id,
					playerId: player.playerId,
					role: player.role,
					startedOn: player.startedOn,
					endedOn: player.endedOn,
					note: player.note
				}))
			);

			// Record initial players
			for (const player of data.players) {
				await tx.insert(editHistory).values({
					id: randomUUID(),
					tableName: 'team_player',
					recordId: id,
					fieldName: 'player',
					oldValue: null,
					newValue: player.playerId.toString(),
					editedBy
				});
			}
		}
	});

	return id;
}

export async function updateTeam(
	data: {
		id: string;
		name: string;
		slug?: string;
		abbr?: string;
		logo?: string;
		region?: Region;
		aliases?: string[];
		players?: {
			playerId: string;
			role: string;
			startedOn?: string;
			endedOn?: string;
			note?: string;
		}[];
	},
	editedBy: string
) {
	await db.transaction(async (tx) => {
		// Get the current team data before update
		const [currentTeam] = await tx.select().from(table.team).where(eq(table.team.id, data.id));

		// Update team
		await tx
			.update(table.team)
			.set({
				name: data.name,
				slug: data.slug ?? data.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
				abbr: data.abbr,
				logo: data.logo,
				region: data.region,
				updatedAt: new Date().toISOString()
			})
			.where(eq(table.team.id, data.id));

		// Track changes in edit_history
		if (data.name !== currentTeam.name) {
			await tx.insert(editHistory).values({
				id: randomUUID(),
				tableName: 'teams',
				recordId: data.id,
				fieldName: 'name',
				oldValue: currentTeam.name?.toString() || null,
				newValue: data.name?.toString() || null,
				editedBy
			});
		}

		if (data.region !== currentTeam.region) {
			await tx.insert(editHistory).values({
				id: randomUUID(),
				tableName: 'teams',
				recordId: data.id,
				fieldName: 'region',
				oldValue: currentTeam.region?.toString() || null,
				newValue: data.region?.toString() || null,
				editedBy
			});
		}

		if (data.abbr !== currentTeam.abbr) {
			await tx.insert(editHistory).values({
				id: randomUUID(),
				tableName: 'teams',
				recordId: data.id,
				fieldName: 'abbr',
				oldValue: currentTeam.abbr?.toString() || null,
				newValue: data.abbr?.toString() || null,
				editedBy
			});
		}

		if (data.logo !== currentTeam.logo) {
			await tx.insert(editHistory).values({
				id: randomUUID(),
				tableName: 'teams',
				recordId: data.id,
				fieldName: 'logo',
				oldValue: currentTeam.logo?.toString() || null,
				newValue: data.logo?.toString() || null,
				editedBy
			});
		}

		// Get current aliases
		const currentAliases = await tx
			.select()
			.from(table.teamAlias)
			.where(eq(table.teamAlias.teamId, data.id));

		// Update aliases
		await tx.delete(table.teamAlias).where(eq(table.teamAlias.teamId, data.id));
		if (data.aliases?.length) {
			await tx.insert(table.teamAlias).values(
				data.aliases.map((alias) => ({
					teamId: data.id,
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
						tableName: 'team_alias',
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
						tableName: 'team_alias',
						recordId: data.id,
						fieldName: 'alias',
						oldValue: null,
						newValue: newAlias.toString(),
						editedBy
					});
				}
			}
		}

		// Get current players
		const currentPlayers = await tx
			.select()
			.from(table.teamPlayer)
			.where(eq(table.teamPlayer.teamId, data.id));

		// Update players
		await tx.delete(table.teamPlayer).where(eq(table.teamPlayer.teamId, data.id));
		if (data.players?.length) {
			await tx.insert(table.teamPlayer).values(
				data.players.map((player) => ({
					teamId: data.id,
					playerId: player.playerId,
					role: player.role,
					startedOn: player.startedOn,
					endedOn: player.endedOn,
					note: player.note
				}))
			);

			// Track player changes
			const oldPlayers = currentPlayers.map((p) => p.playerId);
			const newPlayers = data.players.map((p) => p.playerId);

			// Track removed players
			for (const oldPlayer of oldPlayers) {
				if (!newPlayers.includes(oldPlayer)) {
					await tx.insert(editHistory).values({
						id: randomUUID(),
						tableName: 'team_player',
						recordId: data.id,
						fieldName: 'player',
						oldValue: oldPlayer.toString(),
						newValue: null,
						editedBy
					});
				}
			}

			// Track added players
			for (const newPlayer of newPlayers) {
				if (!oldPlayers.includes(newPlayer)) {
					await tx.insert(editHistory).values({
						id: randomUUID(),
						tableName: 'team_player',
						recordId: data.id,
						fieldName: 'player',
						oldValue: null,
						newValue: newPlayer.toString(),
						editedBy
					});
				}
			}
		}
	});
}

export async function deleteTeam(id: string, deletedBy: string) {
	console.info('[Teams] Attempting to delete team:', id);

	// Get the team data before deletion
	const [teamData] = await db.select().from(table.team).where(eq(table.team.id, id));

	if (!teamData) {
		console.warn('[Teams] Team not found:', id);
		return;
	}

	await db.transaction(async (tx) => {
		// Record deletion in edit history
		await tx.insert(editHistory).values({
			id: randomUUID(),
			tableName: 'teams',
			recordId: id,
			fieldName: 'deletion',
			oldValue: 'active',
			newValue: 'deleted',
			editedBy: deletedBy
		});

		// Record the final state of the team
		await tx.insert(editHistory).values({
			id: randomUUID(),
			tableName: 'teams',
			recordId: id,
			fieldName: 'name',
			oldValue: teamData.name,
			newValue: null,
			editedBy: deletedBy
		});

		if (teamData.region) {
			await tx.insert(editHistory).values({
				id: randomUUID(),
				tableName: 'teams',
				recordId: id,
				fieldName: 'region',
				oldValue: teamData.region,
				newValue: null,
				editedBy: deletedBy
			});
		}

		if (teamData.abbr) {
			await tx.insert(editHistory).values({
				id: randomUUID(),
				tableName: 'teams',
				recordId: id,
				fieldName: 'abbr',
				oldValue: teamData.abbr,
				newValue: null,
				editedBy: deletedBy
			});
		}

		if (teamData.logo) {
			await tx.insert(editHistory).values({
				id: randomUUID(),
				tableName: 'teams',
				recordId: id,
				fieldName: 'logo',
				oldValue: teamData.logo,
				newValue: null,
				editedBy: deletedBy
			});
		}

		// Get and record aliases
		const aliases = await tx.select().from(table.teamAlias).where(eq(table.teamAlias.teamId, id));

		for (const alias of aliases) {
			await tx.insert(editHistory).values({
				id: randomUUID(),
				tableName: 'team_alias',
				recordId: id,
				fieldName: 'alias',
				oldValue: alias.alias,
				newValue: null,
				editedBy: deletedBy
			});
		}

		// Get and record players
		const players = await tx.select().from(table.teamPlayer).where(eq(table.teamPlayer.teamId, id));

		for (const player of players) {
			await tx.insert(editHistory).values({
				id: randomUUID(),
				tableName: 'team_player',
				recordId: id,
				fieldName: 'player',
				oldValue: player.playerId,
				newValue: null,
				editedBy: deletedBy
			});
		}

		// Delete the records
		await tx.delete(table.teamAlias).where(eq(table.teamAlias.teamId, id));
		await tx.delete(table.teamPlayer).where(eq(table.teamPlayer.teamId, id));
		await tx.delete(table.team).where(eq(table.team.id, id));
	});

	console.info('[Teams] Successfully deleted team:', id);
}

export async function getTeamEditHistory(teamId: string) {
	const history = await db
		.select()
		.from(editHistory)
		.where(eq(editHistory.recordId, teamId))
		.orderBy(editHistory.editedAt);

	return history;
}
