import type { Character, Region } from '$lib/data/game';
import { getServerPlayerKD, getServerPlayerAgents } from './players';

import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, or, inArray } from 'drizzle-orm';

import type { Team, TeamPlayer, TeamPlayerRole } from '$lib/data/teams';
import type { Player } from '$lib/data/players';
import type { User, UserRole } from '$lib/data/user';
import type { TCountryCode } from 'countries-list';

import { randomUUID } from 'node:crypto';
import { editHistory } from '$lib/server/db/schemas/edit-history';
import { processImageURL } from '../storage';
import { formatSlug } from '$lib/utils/strings';

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
		.map((teamPlayer) => teamPlayer.player.id)
		.filter(Boolean);

	if (playerIds.length === 0) {
		return null;
	}

	// Get ratings only for these players
	const scopedRatings = await db.query.playerStats.findMany({
		where: (playerStats, { inArray }) => inArray(playerStats.playerId, playerIds)
	});
	const ratingsByPlayerId = new Map(scopedRatings.map((r) => [r.playerId, r.playerRating]));

	// Get KD and agents for each player
	const result: Record<string, { kd: number; rating: number; characters: [Character, number][] }> =
		{};

	for (const teamPlayer of team.players) {
		if (!teamPlayer.player.id) continue;

		const kd = await getServerPlayerKD(teamPlayer.player.id);
		const characters = await getServerPlayerAgents(teamPlayer.player.id);
		const rating = ratingsByPlayerId.get(teamPlayer.player.id) ?? 0;

		result[teamPlayer.player.id] = {
			kd,
			rating,
			characters
		};
	}

	return result;
}

export async function getTeams(): Promise<(Team & { logoURL: string | null })[]> {
	const totalStart = performance.now();
	console.info('[Teams] Fetching all teams with relations');

	const queryStart = performance.now();

	// Use Drizzle relations to fetch all teams with related data
	const teamsWithRelations = await db.query.team.findMany({
		with: {
			players: {
				with: {
					player: {
						with: {
							aliases: true,
							additionalNationalities: true,
							gameAccounts: true,
							socialAccounts: true,
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
					}
				}
			},
			aliases: true
		}
	});

	const queryDuration = performance.now() - queryStart;
	console.info(`[Teams] Relations query took ${queryDuration.toFixed(2)}ms`);

	const processingStart = performance.now();

	// Get all team wins in a single optimized batch query
	const teamWinsStart = performance.now();
	const allTeamWins = await getAllTeamsWins();
	const teamWinsDuration = performance.now() - teamWinsStart;
	console.info(`[Teams] Batch team wins query took ${teamWinsDuration.toFixed(2)}ms`);

	// Process teams
	const result = await Promise.all(
		teamsWithRelations.map(async (teamWithRelations) => {
			// Process players with the new structure
			const players =
				teamWithRelations.players
					?.map((tp) => {
						const player = tp.player;
						if (!player) return null;

						// Process nationalities
						const nationalities: TCountryCode[] = [];
						if (player.nationality) {
							nationalities.push(player.nationality as TCountryCode);
						}
						if (player.additionalNationalities) {
							for (const additional of player.additionalNationalities) {
								if (!nationalities.includes(additional.nationality as TCountryCode)) {
									nationalities.push(additional.nationality as TCountryCode);
								}
							}
						}

						// Process aliases
						const aliases = player.aliases?.map((a: any) => a.alias) || [];

						// Process game accounts
						const gameAccounts =
							player.gameAccounts?.map((ga: any) => ({
								server: ga.server as 'Strinova' | 'CalabiYau',
								accountId: ga.accountId,
								currentName: ga.currentName,
								region: (ga.region as Region) ?? undefined
							})) || [];

						// Process social accounts
						const socialAccounts =
							player.socialAccounts?.map((sa: any) => ({
								platformId: sa.platformId,
								accountId: sa.accountId,
								overridingUrl: sa.overriding_url ?? undefined
							})) || [];

						// Process user and roles
						let user: User | undefined;
						if (player.user) {
							const roles = player.user.roles?.map((ur: any) => ur.role.name as UserRole) || [];
							user = {
								id: player.user.id,
								email: player.user.email,
								username: player.user.username,
								roles
							};
						}

						// Create the player object
						const playerObj: Player = {
							id: player.id,
							name: player.name,
							slug: player.slug ?? undefined,
							avatar: player.avatar || undefined,
							nationalities,
							aliases,
							gameAccounts,
							socialAccounts,
							user
						};

						// Create the team player role object
						const teamPlayerRole: TeamPlayerRole = {
							role:
								(tp.role as 'active' | 'substitute' | 'former' | 'coach' | 'manager' | 'owner') ||
								'active',
							startedOn: tp.startedOn || undefined,
							endedOn: tp.endedOn || undefined,
							note: tp.note || undefined
						};

						// Return the new structure
						return {
							player: playerObj,
							teamPlayer: teamPlayerRole
						};
					})
					.filter((p): p is NonNullable<typeof p> => p !== null) || [];

			// Process team aliases
			const aliases = teamWithRelations.aliases?.map((a: any) => a.alias) || [];

			// Process logoURL
			const logoURL = teamWithRelations.logo ? await processImageURL(teamWithRelations.logo) : null;

			// Build the team object
			return {
				id: teamWithRelations.id,
				name: teamWithRelations.name,
				slug: teamWithRelations.slug,
				abbr: teamWithRelations.abbr,
				logo: teamWithRelations.logo,
				logoURL,
				region: (teamWithRelations.region as Region) ?? undefined,
				players,
				aliases,
				wins: allTeamWins[teamWithRelations.id] ?? 0,
				createdAt: teamWithRelations.createdAt,
				updatedAt: teamWithRelations.updatedAt
			};
		})
	);

	const processingDuration = performance.now() - processingStart;
	console.info(`[Teams] Relations processing took ${processingDuration.toFixed(2)}ms`);

	const totalDuration = performance.now() - totalStart;
	console.info(`[Teams] Total getTeamsFromRelations took ${totalDuration.toFixed(2)}ms`);

	return result;
}

export async function getTeam(slug: string): Promise<(Team & { logoURL: string | null }) | null> {
	const totalStart = performance.now();
	console.info('[Teams] Fetching team with relations:', slug);

	const queryStart = performance.now();

	// Use Drizzle relations to fetch team with all related data
	const teamWithRelations = await db.query.team.findFirst({
		where: (team, { eq, or }) => or(eq(team.slug, slug), eq(team.id, slug)),
		with: {
			players: {
				with: {
					player: {
						with: {
							aliases: true,
							additionalNationalities: true,
							gameAccounts: true,
							socialAccounts: true,
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
					}
				}
			},
			aliases: true
		}
	});

	const queryDuration = performance.now() - queryStart;
	console.info(`[Teams] Relations query took ${queryDuration.toFixed(2)}ms`);

	if (!teamWithRelations) {
		console.info('[Teams] Team not found:', slug);
		return null;
	}

	const processingStart = performance.now();

	// Get team wins
	const wins = await getServerTeamWins(teamWithRelations.id);

	// Process players with the new structure
	const players =
		teamWithRelations.players
			?.map((tp) => {
				const player = tp.player;
				if (!player) return null;

				// Process nationalities
				const nationalities: TCountryCode[] = [];
				if (player.nationality) {
					nationalities.push(player.nationality as TCountryCode);
				}
				if (player.additionalNationalities) {
					for (const additional of player.additionalNationalities) {
						if (!nationalities.includes(additional.nationality as TCountryCode)) {
							nationalities.push(additional.nationality as TCountryCode);
						}
					}
				}

				// Process aliases
				const aliases = player.aliases?.map((a: any) => a.alias) || [];

				// Process game accounts
				const gameAccounts =
					player.gameAccounts?.map((ga: any) => ({
						server: ga.server as 'Strinova' | 'CalabiYau',
						accountId: ga.accountId,
						currentName: ga.currentName,
						region: (ga.region as Region) ?? undefined
					})) || [];

				// Process social accounts
				const socialAccounts =
					player.socialAccounts?.map((sa: any) => ({
						platformId: sa.platformId,
						accountId: sa.accountId,
						overridingUrl: sa.overriding_url ?? undefined
					})) || [];

				// Process user and roles
				let user: User | undefined;
				if (player.user) {
					const roles = player.user.roles?.map((ur: any) => ur.role.name as UserRole) || [];
					user = {
						id: player.user.id,
						email: player.user.email,
						username: player.user.username,
						roles
					};
				}

				// Create the player object
				const playerObj: Player = {
					id: player.id,
					name: player.name,
					slug: player.slug ?? undefined,
					avatar: player.avatar || undefined,
					nationalities,
					aliases,
					gameAccounts,
					socialAccounts,
					user
				};

				// Create the team player role object
				const teamPlayerRole: TeamPlayerRole = {
					role:
						(tp.role as 'active' | 'substitute' | 'former' | 'coach' | 'manager' | 'owner') ||
						'active',
					startedOn: tp.startedOn || undefined,
					endedOn: tp.endedOn || undefined,
					note: tp.note || undefined
				};

				// Return the new structure
				return {
					player: playerObj,
					teamPlayer: teamPlayerRole
				};
			})
			.filter((p): p is NonNullable<typeof p> => p !== null) || [];

	// Process team aliases
	const aliases = teamWithRelations.aliases?.map((a: any) => a.alias) || [];

	// Build the final team object
	const fullTeam: Team & { logoURL: string | null } = {
		id: teamWithRelations.id,
		name: teamWithRelations.name,
		slug: teamWithRelations.slug,
		abbr: teamWithRelations.abbr,
		logo: teamWithRelations.logo,
		logoURL: teamWithRelations.logo ? await processImageURL(teamWithRelations.logo) : null,
		region: (teamWithRelations.region as Region) ?? undefined,
		players,
		aliases,
		wins,
		createdAt: teamWithRelations.createdAt,
		updatedAt: teamWithRelations.updatedAt
	};

	const processingDuration = performance.now() - processingStart;
	console.info(`[Teams] Relations processing took ${processingDuration.toFixed(2)}ms`);

	const totalDuration = performance.now() - totalStart;
	console.info(`[Teams] Total getTeam took ${totalDuration.toFixed(2)}ms`);

	return fullTeam;
}

function computeWinsFromMatchTeamRows(rows: table.MatchTeam[]): Record<string, number> {
	// Group by match ID
	const matchesByMatchId = new Map<string, table.MatchTeam[]>();
	for (const row of rows) {
		if (!row.matchId || !row.teamId) continue;
		if (!matchesByMatchId.has(row.matchId)) {
			matchesByMatchId.set(row.matchId, []);
		}
		matchesByMatchId.get(row.matchId)!.push(row);
	}

	// Calculate wins for each team
	const teamWins = new Map<string, number>();

	for (const [, matchTeams] of matchesByMatchId) {
		if (matchTeams.length === 2) {
			const team1 = matchTeams[0];
			const team2 = matchTeams[1];

			if (!team1.teamId || !team2.teamId) continue;

			const team1Score = team1.score ?? 0;
			const team2Score = team2.score ?? 0;

			if (team1Score !== team2Score) {
				const winnerPosition = team1Score > team2Score ? 0 : 1;
				const winningTeam = matchTeams[winnerPosition];

				if (!winningTeam.teamId) continue;

				const currentWins = teamWins.get(winningTeam.teamId) ?? 0;
				teamWins.set(winningTeam.teamId, currentWins + 1);
			}
			// Draws are ignored
		}
	}

	return Object.fromEntries(teamWins);
}

export async function getServerTeamWins(teamId: string): Promise<number> {
	console.info('[Teams] Fetching server team wins for:', teamId);

	// 1) Get match IDs where this team participated
	const teamMatches = await db
		.select({ matchId: table.matchTeam.matchId })
		.from(table.matchTeam)
		.innerJoin(table.match, eq(table.matchTeam.matchId, table.match.id))
		.where(eq(table.matchTeam.teamId, teamId));

	const matchIds = Array.from(
		new Set(teamMatches.map((m) => m.matchId).filter(Boolean))
	) as string[];
	if (matchIds.length === 0) {
		console.info('[Teams] Team', teamId, 'has', 0, 'match wins');
		return 0;
	}

	// 2) Fetch all match_team rows for those matches
	const allMatchTeamsForTeamMatches = await db
		.select({
			matchId: table.matchTeam.matchId,
			teamId: table.matchTeam.teamId,
			position: table.matchTeam.position,
			score: table.matchTeam.score
		})
		.from(table.matchTeam)
		.innerJoin(table.match, eq(table.matchTeam.matchId, table.match.id))
		.where(inArray(table.matchTeam.matchId, matchIds))
		.orderBy(table.matchTeam.position);

	// 3) Compute wins for these matches and return only this team's wins
	const winsByTeam = computeWinsFromMatchTeamRows(allMatchTeamsForTeamMatches as table.MatchTeam[]);
	const wins = winsByTeam[teamId] ?? 0;
	console.info('[Teams] Team', teamId, 'has', wins, 'match wins');
	return wins;
}

// New optimized function to get wins for all teams in a single batch
export async function getAllTeamsWins(): Promise<Record<string, number>> {
	const totalStart = performance.now();
	console.info('[Teams] Fetching wins for all teams in batch');

	const queryStart = performance.now();
	// Get all match teams with their scores in a single query
	const allMatchTeams = await db
		.select({
			matchId: table.matchTeam.matchId,
			teamId: table.matchTeam.teamId,
			position: table.matchTeam.position,
			score: table.matchTeam.score
		})
		.from(table.matchTeam)
		.innerJoin(table.match, eq(table.matchTeam.matchId, table.match.id));
	const queryDuration = performance.now() - queryStart;
	console.info(`[Teams] Batch match teams query took ${queryDuration.toFixed(2)}ms`);

	const processingStart = performance.now();
	const winsByTeam = computeWinsFromMatchTeamRows(allMatchTeams);
	const processingDuration = performance.now() - processingStart;
	console.info(`[Teams] Batch wins processing took ${processingDuration.toFixed(2)}ms`);

	const totalDuration = performance.now() - totalStart;
	console.info(`[Teams] Total getAllTeamsWins took ${totalDuration.toFixed(2)}ms`);

	return winsByTeam;
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
	const allTeamWins = await getAllTeamsWins();

	const wins = allTeamWins[team.id] ?? 0;

	// Ranking is 1 + number of teams with strictly more wins
	let higherWinsCount = 0;
	for (const value of Object.values(allTeamWins)) {
		if (value > wins) {
			higherWinsCount++;
		}
	}

	return {
		ranking: higherWinsCount + 1,
		wins
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
	editedBy: string,
	tx?: Parameters<Parameters<typeof db.transaction>[0]>[0]
) {
	const id = randomUUID();
	const slug = data.slug ?? formatSlug(data.name);

	// Use provided transaction or create a new one
	const executeInTransaction = async (
		transaction: Parameters<Parameters<typeof db.transaction>[0]>[0]
	) => {
		await transaction.insert(table.team).values({
			id,
			name: data.name,
			slug,
			abbr: data.abbr,
			logo: data.logo,
			region: data.region
		});

		// Record initial creation in edit history
		await transaction.insert(editHistory).values({
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
			await transaction.insert(editHistory).values({
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
			await transaction.insert(editHistory).values({
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
			await transaction.insert(editHistory).values({
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
			await transaction.insert(editHistory).values({
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
			await transaction.insert(table.teamAlias).values(
				data.aliases.map((alias) => ({
					teamId: id,
					alias
				}))
			);

			// Record initial aliases
			for (const alias of data.aliases) {
				await transaction.insert(editHistory).values({
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
			await transaction.insert(table.teamPlayer).values(
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
				await transaction.insert(editHistory).values({
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
