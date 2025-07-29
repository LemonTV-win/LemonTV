import { error, fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { desc, eq, inArray } from 'drizzle-orm';
import { processImageURL } from '$lib/server/storage';
import type { TCountryCode } from 'countries-list';
import type { Region } from '$lib/data/game';
import type { PageServerLoad } from './$types';
import { dev } from '$app/environment';

type PermissionResult =
	| { status: 'success'; userId: string }
	| { status: 'error'; error: string; statusCode: 401 | 403 };

type MapAction = 'ban' | 'pick' | 'decider' | 'set' | null;

export type GameParticipant = {
	id: string;
	name: string;
	nationalities: TCountryCode[];
	gameAccounts: Array<{
		server: 'Strinova' | 'CalabiYau';
		accountId: number;
		currentName: string;
		region?: Region;
	}>;
};

function checkPermissions(locals: App.Locals, requiredRoles: string[]): PermissionResult {
	if (!locals.user?.id) {
		console.error('[Admin][Matches] Unauthorized: user is not authenticated');
		return { status: 'error', error: 'Unauthorized', statusCode: 401 };
	}

	if (!requiredRoles.some((role) => locals.user?.roles.includes(role))) {
		console.error(
			`[Admin][Matches] Forbidden: user "${locals.user.username}" (${locals.user.id}) lacks required roles (${requiredRoles.join(', ')}). Current roles: ${locals.user.roles.join(', ')}`
		);
		return { status: 'error', error: 'Insufficient permissions', statusCode: 403 };
	}

	return { status: 'success', userId: locals.user.id };
}

function parseFormData(formData: FormData) {
	const format = formData.get('format') as string;
	const stageId = formData.get('stageId') ? parseInt(formData.get('stageId') as string) : null;

	// Parse teams
	const teams: Array<{ teamId: string; position: number; score: number }> = [];
	for (const [key, value] of formData.entries()) {
		if (key.startsWith('teams[') && key.endsWith('].teamId')) {
			const index = parseInt(key.match(/\[(\d+)\]/)?.[1] || '0');
			const score = parseInt((formData.get(`teams[${index}].score`) as string) || '0');
			teams[index] = {
				teamId: value as string,
				position: index,
				score
			};
		}
	}

	// Parse maps
	const maps: Array<{
		mapId: string;
		order: number;
		side: number;
		action: MapAction;
		map_picker_position: number | null;
		side_picker_position: number | null;
	}> = [];
	for (const [key, value] of formData.entries()) {
		if (key.startsWith('maps[') && key.endsWith('].mapId')) {
			const index = parseInt(key.match(/\[(\d+)\]/)?.[1] || '0');
			const action = formData.get(`maps[${index}].action`) as MapAction;
			const side = parseInt((formData.get(`maps[${index}].side`) as string) || '0');
			maps[index] = {
				mapId: value as string,
				order: index,
				side,
				action,
				map_picker_position: null,
				side_picker_position: null
			};
		}
	}

	return {
		format,
		stageId,
		teams,
		maps
	};
}

export const load: PageServerLoad = async ({ locals, url }) => {
	const result = checkPermissions(locals, ['admin', 'editor']);
	if (result.status === 'error') {
		throw error(result.statusCode, result.error);
	}

	// Get event ID from URL if present
	const eventId = url.searchParams.get('event');

	// Get action and id parameters for modal state
	const action = url.searchParams.get('action');
	const id = url.searchParams.get('id');
	const deleteParam = url.searchParams.get('delete');

	// Load all events with their stages, matches, match teams, and match maps
	const events = await db
		.select({
			event: table.event,
			event_stage: table.stage,
			match: table.match,
			match_team: table.matchTeam,
			teams: table.team,
			match_map: table.matchMap,
			map: table.map,
			game: table.game,
			game_team: table.gameTeam,
			game_player_score: table.gamePlayerScore
		})
		.from(table.event)
		.leftJoin(table.stage, eq(table.event.id, table.stage.eventId))
		.leftJoin(table.match, eq(table.stage.id, table.match.stageId))
		.leftJoin(table.matchTeam, eq(table.match.id, table.matchTeam.matchId))
		.leftJoin(table.team, eq(table.matchTeam.teamId, table.team.id))
		.leftJoin(table.matchMap, eq(table.match.id, table.matchMap.matchId))
		.leftJoin(table.map, eq(table.matchMap.mapId, table.map.id))
		.leftJoin(table.game, eq(table.match.id, table.game.matchId))
		.leftJoin(table.gameTeam, eq(table.game.id, table.gameTeam.gameId))
		.leftJoin(table.gamePlayerScore, eq(table.game.id, table.gamePlayerScore.gameId))
		.orderBy(desc(table.event.createdAt));

	// Load game maps separately to avoid cartesian product issues
	const gameMaps = await db
		.select({
			gameId: table.game.id,
			map: table.map
		})
		.from(table.game)
		.leftJoin(table.map, eq(table.game.mapId, table.map.id));

	// Create a map of game maps for quick lookup
	const gameMapLookup = new Map<number, (typeof gameMaps)[number]['map']>();
	for (const gameMap of gameMaps) {
		if (gameMap.gameId && gameMap.map) {
			gameMapLookup.set(gameMap.gameId, gameMap.map);
		}
	}

	// Load bracket structure data
	const stageRounds = await db.select().from(table.stageRound).orderBy(table.stageRound.id);

	const stageNodes = await db.select().from(table.stageNode).orderBy(table.stageNode.order);

	const stageNodeDependencies = await db
		.select()
		.from(table.stageNodeDependency)
		.orderBy(table.stageNodeDependency.id);

	// Load team rosters from eventTeamPlayer table
	const teamRosters = await db
		.select({
			eventId: table.eventTeamPlayer.eventId,
			teamId: table.eventTeamPlayer.teamId,
			playerId: table.eventTeamPlayer.playerId,
			role: table.eventTeamPlayer.role,
			player: table.player,
			playerAdditionalNationality: table.playerAdditionalNationality,
			gameAccount: table.gameAccount
		})
		.from(table.eventTeamPlayer)
		.leftJoin(table.player, eq(table.player.id, table.eventTeamPlayer.playerId))
		.leftJoin(table.gameAccount, eq(table.gameAccount.playerId, table.player.id))
		.leftJoin(
			table.playerAdditionalNationality,
			eq(table.playerAdditionalNationality.playerId, table.player.id)
		);

	// Process image URLs for teams
	const processedEvents = await Promise.all(
		events.map(async (row) => ({
			...row,
			event: {
				...row.event,
				image: row.event.image ? await processImageURL(row.event.image) : null
			},
			teams: row.teams
				? {
						...row.teams,
						logo: row.teams.logo ? await processImageURL(row.teams.logo) : null
					}
				: null,
			map: row.map
		}))
	);

	// Process team rosters
	const teamRosterMap = new Map<
		string,
		Map<string, { player: GameParticipant; job: 'main' | 'sub' | 'coach' }[]>
	>();

	// Group player data by player ID
	const playerMap = new Map<string, GameParticipant>();

	for (const row of teamRosters) {
		const p = row.player;
		if (!p?.id) continue;

		if (!playerMap.has(p.id)) {
			playerMap.set(p.id, {
				id: p.id,
				name: p.name,
				nationalities: p.nationality ? [p.nationality as TCountryCode] : [],
				gameAccounts: []
			});
		}

		const player = playerMap.get(p.id);
		if (!player) continue;

		// Add additional nationality
		const additionalNationality = row.playerAdditionalNationality?.nationality;
		if (
			additionalNationality &&
			!player.nationalities.includes(additionalNationality as TCountryCode)
		) {
			player.nationalities.push(additionalNationality as TCountryCode);
		}

		// Add game account
		const ga = row.gameAccount;
		if (
			ga?.accountId &&
			!player.gameAccounts.some((a) => a.accountId === ga.accountId && a.server === ga.server)
		) {
			player.gameAccounts.push({
				server: ga.server as 'Strinova' | 'CalabiYau',
				accountId: ga.accountId,
				currentName: ga.currentName,
				region: ga.region ? (ga.region as Region) : undefined
			});
		}
	}

	// Build the team roster map by event
	for (const row of teamRosters) {
		if (!row.eventId || !row.teamId || !row.playerId) continue;

		const player = playerMap.get(row.playerId);
		if (!player) continue;

		// Create event map if it doesn't exist
		if (!teamRosterMap.has(row.eventId)) {
			teamRosterMap.set(row.eventId, new Map());
		}

		const eventMap = teamRosterMap.get(row.eventId)!;
		if (!eventMap.has(row.teamId)) {
			eventMap.set(row.teamId, []);
		}
		eventMap.get(row.teamId)!.push({
			player,
			job: row.role
		});
	}

	type MatchWithTeams = (typeof processedEvents)[number]['match'] & {
		teams: Array<
			(typeof processedEvents)[number]['match_team'] & {
				team: (typeof processedEvents)[number]['teams'];
			}
		>;
		maps: Array<
			(typeof processedEvents)[number]['match_map'] & {
				map: (typeof processedEvents)[number]['map'];
			}
		>;
		games: Array<
			(typeof processedEvents)[number]['game'] & {
				map: (typeof processedEvents)[number]['map'];
				teams: Array<
					(typeof processedEvents)[number]['game_team'] & {
						team: (typeof processedEvents)[number]['teams'];
					}
				>;
				playerScores: Array<(typeof processedEvents)[number]['game_player_score']>;
			}
		>;
	};

	// Group events by event ID and collect all stages, matches, match teams, and match maps
	const eventsByEvent = processedEvents.reduce(
		(acc, row) => {
			const eventId = row.event.id;
			if (!acc[eventId]) {
				acc[eventId] = {
					event: row.event,
					stages: new Map()
				};
			}

			// If there's a stage, add it to the stages map
			if (row.event_stage) {
				const stageId = row.event_stage.id;
				if (!acc[eventId].stages.has(stageId)) {
					acc[eventId].stages.set(stageId, {
						stage: {
							id: row.event_stage.id,
							title: row.event_stage.title,
							stage: row.event_stage.stage,
							format: row.event_stage.format
						},
						matches: new Map<string, MatchWithTeams>(),
						rounds: [],
						nodes: []
					});
				}

				// If there's a match, add it to the stage's matches
				if (row.match) {
					const matchId = row.match.id;
					const stageData = acc[eventId].stages.get(stageId);
					if (stageData) {
						if (!stageData.matches.has(matchId)) {
							stageData.matches.set(matchId, {
								id: row.match.id,
								format: row.match.format,
								stageId: row.match.stageId,
								teams: [],
								maps: [],
								games: []
							});
						}

						// If there's a match team, add it to the match's teams
						if (row.match_team && row.teams) {
							const matchData = stageData.matches.get(matchId);
							const matchTeam = row.match_team;
							if (matchData && matchTeam.matchId && matchTeam.teamId) {
								// Check if team already exists to avoid duplicates
								const teamExists = matchData.teams.some((t: any) => t.teamId === matchTeam.teamId);
								if (!teamExists) {
									matchData.teams.push({
										matchId: matchTeam.matchId,
										teamId: matchTeam.teamId,
										position: matchTeam.position,
										score: matchTeam.score,
										team: row.teams
									});
								}
							}
						}

						// If there's a match map, add it to the match's maps
						if (row.match_map && row.map) {
							const matchData = stageData.matches.get(matchId);
							const matchMap = row.match_map;
							if (matchData && matchMap.id && matchMap.matchId) {
								// Check if map already exists to avoid duplicates
								const mapExists = matchData.maps.some((m: any) => m.id === matchMap.id);
								if (!mapExists) {
									matchData.maps.push({
										id: matchMap.id,
										matchId: matchMap.matchId,
										mapId: matchMap.mapId,
										order: matchMap.order ?? 0,
										side: matchMap.side ?? 0,
										action: matchMap.action ?? null,
										map_picker_position: matchMap.map_picker_position ?? 0,
										side_picker_position: matchMap.side_picker_position ?? 0,
										map: row.map
									});
								}
							}
						}

						// If there's a game, add it to the match's games
						if (row.game) {
							const matchData = stageData.matches.get(matchId);
							const game = row.game;
							if (matchData && game.id && game.matchId) {
								// Check if game already exists to avoid duplicates
								const gameExists = matchData.games.some((g: any) => g.id === game.id);
								if (!gameExists) {
									// Get the correct map for this game
									const gameMap = gameMapLookup.get(game.id);
									matchData.games.push({
										id: game.id,
										matchId: game.matchId,
										mapId: game.mapId,
										duration: game.duration,
										winner: game.winner,
										map: gameMap || { id: game.mapId }, // Use game map or fallback
										teams: [],
										playerScores: []
									});
								}

								// Find the game to add teams and player scores
								const gameData = matchData.games.find((g: any) => g.id === game.id);
								if (gameData) {
									// If there's a game team, add it to the game's teams
									if (row.game_team && row.teams) {
										const gameTeam = row.game_team;
										if (gameTeam.gameId && gameTeam.teamId) {
											// Check if team already exists to avoid duplicates
											const teamExists = gameData.teams.some(
												(t: any) => t.teamId === gameTeam.teamId
											);
											if (!teamExists) {
												gameData.teams.push({
													gameId: gameTeam.gameId,
													teamId: gameTeam.teamId,
													position: gameTeam.position,
													score: gameTeam.score,
													team: row.teams
												});
											}
										}
									}

									// If there's a game player score, add it to the game's player scores
									if (row.game_player_score) {
										const playerScore = row.game_player_score;
										if (playerScore.gameId) {
											// Check if player score already exists to avoid duplicates
											const scoreExists = gameData.playerScores.some(
												(s: any) => s && s.id === playerScore.id
											);
											if (!scoreExists) {
												gameData.playerScores.push(playerScore);
											}
										}
									}
								}
							}
						}
					}
				}
			}

			return acc;
		},
		{} as Record<
			string,
			{
				event: (typeof processedEvents)[number]['event'];
				stages: Map<
					number,
					{
						stage: {
							id: number;
							title: string;
							stage: string;
							format: string;
						};
						matches: Map<string, MatchWithTeams>;
						rounds: Array<(typeof stageRounds)[number]>;
						nodes: Array<
							(typeof stageNodes)[number] & {
								dependencies: Array<(typeof stageNodeDependencies)[number]>;
							}
						>;
					}
				>;
			}
		>
	);

	// Add bracket structure data to stages
	stageRounds.forEach((round) => {
		Object.values(eventsByEvent).forEach((eventData) => {
			const stageData = eventData.stages.get(round.stageId);
			if (stageData) {
				stageData.rounds.push(round);
			}
		});
	});

	stageNodes.forEach((node) => {
		Object.values(eventsByEvent).forEach((eventData) => {
			const stageData = eventData.stages.get(node.stageId);
			if (stageData) {
				const nodeWithDependencies = {
					...node,
					dependencies: stageNodeDependencies.filter((dep) => dep.nodeId === node.id)
				};
				stageData.nodes.push(nodeWithDependencies);
			}
		});
	});

	// Convert Map to object for serialization
	const serializedEvents = Object.entries(eventsByEvent).reduce(
		(acc, [eventId, eventData]) => {
			acc[eventId] = {
				event: eventData.event,
				stages: Object.fromEntries(
					Array.from(eventData.stages.entries()).map(([stageId, stageData]) => {
						const matches = Array.from(stageData.matches.values()).map((match) => ({
							id: match.id,
							format: match.format,
							stageId: match.stageId,
							teams: match.teams.map((team) => ({
								matchId: team.matchId,
								teamId: team.teamId,
								position: team.position ?? 0,
								score: team.score ?? 0,
								team: team.team
							})),
							maps: match.maps.map((map) => ({
								id: map.id,
								matchId: map.matchId,
								mapId: map.mapId,
								order: map.order ?? 0,
								side: map.side ?? 0,
								action: map.action ?? null,
								map_picker_position: map.map_picker_position ?? 0,
								side_picker_position: map.side_picker_position ?? 0,
								map: map.map
							})),
							games: match.games.map((game) => ({
								id: game.id,
								matchId: game.matchId,
								mapId: game.mapId,
								duration: game.duration,
								winner: game.winner,
								map: game.map,
								teams: game.teams.map((team) => ({
									gameId: team.gameId,
									teamId: team.teamId,
									position: team.position,
									score: team.score,
									team: team.team
								})),
								playerScores: game.playerScores
							}))
						}));
						return [
							Number(stageId),
							{
								stage: stageData.stage,
								matches,
								rounds: stageData.rounds,
								nodes: stageData.nodes
							}
						];
					})
				)
			};
			return acc;
		},
		{} as Record<
			string,
			{
				event: (typeof processedEvents)[number]['event'];
				stages: Record<
					number,
					{
						stage: {
							id: number;
							title: string;
							stage: string;
							format: string;
						};
						matches: Array<{
							id: string;
							format: string | null;
							stageId: number | null;
							teams: Array<{
								matchId: string | null;
								teamId: string | null;
								position: number;
								score: number;
								team: (typeof processedEvents)[number]['teams'];
							}>;
							maps: Array<{
								id: number;
								matchId: string;
								mapId: string;
								order: number;
								side: number;
								action: string | null;
								map_picker_position: number;
								side_picker_position: number;
								map: (typeof processedEvents)[number]['map'];
							}>;
							games: Array<{
								id: number;
								matchId: string;
								mapId: string;
								duration: number;
								winner: number;
								map: (typeof processedEvents)[number]['map'];
								teams: Array<{
									gameId: number;
									teamId: string;
									position: number;
									score: number;
									team: (typeof processedEvents)[number]['teams'];
								}>;
								playerScores: Array<(typeof processedEvents)[number]['game_player_score']>;
							}>;
						}>;
						rounds: Array<(typeof stageRounds)[number]>;
						nodes: Array<
							(typeof stageNodes)[number] & {
								dependencies: Array<(typeof stageNodeDependencies)[number]>;
							}
						>;
					}
				>;
			}
		>
	);

	return {
		events: serializedEvents,
		event: eventId,
		teams: await db.select().from(table.team),
		maps: await db.select().from(table.map),
		action,
		id,
		delete: deleteParam,
		searchQuery: url.searchParams.get('search') ?? undefined,
		teamRosters: teamRosterMap
	};
};

const MATCH_ACTIONS = {
	create: async ({ request, locals }: { request: Request; locals: App.Locals }) => {
		const result = checkPermissions(locals, ['admin', 'editor']);
		if (result.status === 'error') {
			return fail(result.statusCode, {
				error: result.error
			});
		}

		const formData = await request.formData();
		const matchData = {
			id: crypto.randomUUID(),
			...parseFormData(formData)
		};

		if (!matchData.format || !matchData.stageId) {
			const missingFields = [];
			if (!matchData.format) missingFields.push('format');
			if (!matchData.stageId) missingFields.push('stage');

			return fail(400, {
				error: `Missing required fields: ${missingFields.join(', ')}`
			});
		}

		try {
			// Create the match
			await db.insert(table.match).values({
				id: matchData.id,
				format: matchData.format,
				stageId: matchData.stageId
			});

			// Add match teams if any
			const validTeams = matchData.teams.filter((team) => team.teamId);
			if (validTeams.length > 0) {
				await db.insert(table.matchTeam).values(
					validTeams.map((team) => ({
						matchId: matchData.id,
						teamId: team.teamId,
						position: team.position,
						score: team.score
					}))
				);
			}

			// Add match maps if any
			if (matchData.maps.length > 0) {
				await db.insert(table.matchMap).values(
					matchData.maps.map((map) => ({
						matchId: matchData.id,
						mapId: map.mapId,
						order: map.order,
						side: map.side,
						action: map.action,
						map_picker_position: map.map_picker_position,
						side_picker_position: map.side_picker_position
					}))
				);
			}

			// Add edit history
			await db.insert(table.editHistory).values({
				id: crypto.randomUUID(),
				tableName: 'match',
				recordId: matchData.id,
				fieldName: 'creation',
				oldValue: null,
				newValue: 'created',
				editedBy: result.userId,
				editedAt: new Date()
			});

			return {
				success: true
			};
		} catch (e) {
			console.error('[Admin][Matches][Create] Failed to create match:', e);
			return fail(500, {
				error: 'Failed to create match'
			});
		}
	},

	update: async ({ request, locals }: { request: Request; locals: App.Locals }) => {
		const result = checkPermissions(locals, ['admin', 'editor']);
		if (result.status === 'error') {
			return fail(result.statusCode, {
				error: result.error
			});
		}

		const formData = await request.formData();
		const matchData = {
			id: formData.get('id') as string,
			...parseFormData(formData)
		};

		if (!matchData.id || !matchData.format || !matchData.stageId) {
			return fail(400, {
				error: 'ID, format, and stage are required'
			});
		}

		try {
			// Get the current match data for comparison
			const currentMatch = await db
				.select()
				.from(table.match)
				.where(eq(table.match.id, matchData.id))
				.limit(1);

			if (!currentMatch.length) {
				return fail(404, {
					error: 'Match not found'
				});
			}

			// Update the match
			await db
				.update(table.match)
				.set({
					format: matchData.format,
					stageId: matchData.stageId
				})
				.where(eq(table.match.id, matchData.id));

			// Update match teams
			await db.delete(table.matchTeam).where(eq(table.matchTeam.matchId, matchData.id));
			const validTeams = matchData.teams.filter((team) => team.teamId);
			if (validTeams.length > 0) {
				await db.insert(table.matchTeam).values(
					validTeams.map((team) => ({
						matchId: matchData.id,
						teamId: team.teamId,
						position: team.position,
						score: team.score
					}))
				);
			}

			// Update match maps
			await db.delete(table.matchMap).where(eq(table.matchMap.matchId, matchData.id));
			if (matchData.maps.length > 0) {
				await db.insert(table.matchMap).values(
					matchData.maps.map((map) => ({
						matchId: matchData.id,
						mapId: map.mapId,
						order: map.order,
						side: map.side,
						action: map.action,
						map_picker_position: map.map_picker_position,
						side_picker_position: map.side_picker_position
					}))
				);
			}

			// Add edit history
			await db.insert(table.editHistory).values({
				id: crypto.randomUUID(),
				tableName: 'match',
				recordId: matchData.id,
				fieldName: 'update',
				oldValue: JSON.stringify(currentMatch[0]),
				newValue: JSON.stringify({
					format: matchData.format,
					stageId: matchData.stageId,
					teams: matchData.teams,
					maps: matchData.maps
				}),
				editedBy: result.userId,
				editedAt: new Date()
			});

			return {
				success: true
			};
		} catch (e) {
			console.error('[Admin][Matches][Update] Failed to update match:', e);
			return fail(500, {
				error: 'Failed to update match'
			});
		}
	},

	delete: async ({ request, locals }: { request: Request; locals: App.Locals }) => {
		const result = checkPermissions(locals, ['admin', 'editor']);
		if (result.status === 'error') {
			return fail(result.statusCode, {
				error: result.error
			});
		}

		const formData = await request.formData();
		const id = formData.get('id') as string;

		if (!id) {
			return fail(400, {
				error: 'ID is required'
			});
		}

		try {
			// Get the match data before deletion for history
			const match = await db.select().from(table.match).where(eq(table.match.id, id)).limit(1);

			if (!match.length) {
				return fail(404, {
					error: 'Match not found'
				});
			}

			// Delete related records first
			await db.delete(table.matchTeam).where(eq(table.matchTeam.matchId, id));
			await db.delete(table.matchMap).where(eq(table.matchMap.matchId, id));

			// Delete the match
			await db.delete(table.match).where(eq(table.match.id, id));

			// Add edit history
			await db.insert(table.editHistory).values({
				id: crypto.randomUUID(),
				tableName: 'match',
				recordId: id,
				fieldName: 'deletion',
				oldValue: JSON.stringify(match[0]),
				newValue: 'deleted',
				editedBy: result.userId,
				editedAt: new Date()
			});

			return {
				success: true
			};
		} catch (e) {
			console.error('[Admin][Matches][Delete] Failed to delete match:', e);
			return fail(500, {
				error: 'Failed to delete match'
			});
		}
	}
};

const STAGE_ACTIONS = {
	createStage: async ({ request, locals }: { request: Request; locals: App.Locals }) => {
		const result = checkPermissions(locals, ['admin', 'editor']);
		if (result.status === 'error') {
			return fail(result.statusCode, {
				error: result.error
			});
		}

		const formData = await request.formData();
		const stageData = {
			eventId: formData.get('eventId') as string,
			title: formData.get('title') as string,
			stage: formData.get('stage') as string,
			format: formData.get('format') as string
		};

		if (!stageData.eventId || !stageData.title || !stageData.stage || !stageData.format) {
			return fail(400, {
				error: 'All fields are required'
			});
		}

		try {
			// Create the stage
			const [newStage] = await db
				.insert(table.stage)
				.values({
					eventId: stageData.eventId,
					title: stageData.title,
					stage: stageData.stage,
					format: stageData.format
				})
				.returning();

			// Add edit history
			await db.insert(table.editHistory).values({
				id: crypto.randomUUID(),
				tableName: 'stage',
				recordId: newStage.id.toString(),
				fieldName: 'creation',
				oldValue: null,
				newValue: 'created',
				editedBy: result.userId,
				editedAt: new Date()
			});

			return {
				success: true
			};
		} catch (e) {
			console.error('[Admin][Stages][Create] Failed to create stage:', e);
			return fail(500, {
				error: 'Failed to create stage'
			});
		}
	},

	updateStage: async ({ request, locals }: { request: Request; locals: App.Locals }) => {
		const result = checkPermissions(locals, ['admin', 'editor']);
		if (result.status === 'error') {
			return fail(result.statusCode, {
				error: result.error
			});
		}

		const formData = await request.formData();
		const stageData = {
			id: parseInt(formData.get('id') as string),
			eventId: formData.get('eventId') as string,
			title: formData.get('title') as string,
			stage: formData.get('stage') as string,
			format: formData.get('format') as string
		};

		if (
			!stageData.id ||
			!stageData.eventId ||
			!stageData.title ||
			!stageData.stage ||
			!stageData.format
		) {
			return fail(400, {
				error: 'All fields are required'
			});
		}

		try {
			// Get the current stage data for comparison
			const currentStage = await db
				.select()
				.from(table.stage)
				.where(eq(table.stage.id, stageData.id))
				.limit(1);

			if (!currentStage.length) {
				return fail(404, {
					error: 'Stage not found'
				});
			}

			// Update the stage
			await db
				.update(table.stage)
				.set({
					title: stageData.title,
					stage: stageData.stage,
					format: stageData.format
				})
				.where(eq(table.stage.id, stageData.id));

			// Add edit history
			await db.insert(table.editHistory).values({
				id: crypto.randomUUID(),
				tableName: 'stage',
				recordId: stageData.id.toString(),
				fieldName: 'update',
				oldValue: JSON.stringify(currentStage[0]),
				newValue: JSON.stringify({
					title: stageData.title,
					stage: stageData.stage,
					format: stageData.format
				}),
				editedBy: result.userId,
				editedAt: new Date()
			});

			return {
				success: true
			};
		} catch (e) {
			console.error('[Admin][Stages][Update] Failed to update stage:', e);
			return fail(500, {
				error: 'Failed to update stage'
			});
		}
	},

	deleteStage: async ({ request, locals }: { request: Request; locals: App.Locals }) => {
		const result = checkPermissions(locals, ['admin', 'editor']);
		if (result.status === 'error') {
			return fail(result.statusCode, {
				error: result.error
			});
		}

		const formData = await request.formData();
		const id = parseInt(formData.get('id') as string);

		if (!id) {
			return fail(400, {
				error: 'ID is required'
			});
		}

		try {
			// Get the current stage data for history
			const currentStage = await db
				.select()
				.from(table.stage)
				.where(eq(table.stage.id, id))
				.limit(1);

			if (!currentStage.length) {
				return fail(404, {
					error: 'Stage not found'
				});
			}

			// Delete all matches in this stage first
			await db.delete(table.match).where(eq(table.match.stageId, id));

			// Delete the stage
			await db.delete(table.stage).where(eq(table.stage.id, id));

			// Add edit history
			await db.insert(table.editHistory).values({
				id: crypto.randomUUID(),
				tableName: 'stage',
				recordId: id.toString(),
				fieldName: 'deletion',
				oldValue: JSON.stringify(currentStage[0]),
				newValue: 'deleted',
				editedBy: result.userId,
				editedAt: new Date()
			});

			return {
				success: true
			};
		} catch (e) {
			console.error('[Admin][Stages][Delete] Failed to delete stage:', e);
			return fail(500, {
				error: 'Failed to delete stage'
			});
		}
	}
};

const STAGE_ROUND_ACTIONS = {
	// New bracket structure actions
	createStageRound: async ({ request, locals }: { request: Request; locals: App.Locals }) => {
		const result = checkPermissions(locals, ['admin', 'editor']);
		if (result.status === 'error') {
			return fail(result.statusCode, {
				error: result.error
			});
		}

		const formData = await request.formData();
		const roundData = {
			stageId: parseInt(formData.get('stageId') as string),
			type: formData.get('type') as string,
			title: formData.get('title') as string,
			bracket: formData.get('bracket') as string,
			parallelGroup: formData.get('parallelGroup')
				? parseInt(formData.get('parallelGroup') as string)
				: null
		};

		if (!roundData.stageId || !roundData.type || !roundData.bracket) {
			return fail(400, {
				error: 'Stage ID, type, and bracket are required'
			});
		}

		try {
			// Create the stage round
			const [newRound] = await db
				.insert(table.stageRound)
				.values({
					stageId: roundData.stageId,
					type: roundData.type as any,
					title: roundData.title || null,
					bracket: roundData.bracket as any,
					parallelGroup: roundData.parallelGroup
				})
				.returning();

			// Add edit history
			await db.insert(table.editHistory).values({
				id: crypto.randomUUID(),
				tableName: 'stage_round',
				recordId: newRound.id.toString(),
				fieldName: 'creation',
				oldValue: null,
				newValue: 'created',
				editedBy: result.userId,
				editedAt: new Date()
			});

			return {
				success: true,
				roundId: newRound.id
			};
		} catch (e) {
			console.error('[Admin][StageRounds][Create] Failed to create stage round:', e);
			return fail(500, {
				error: 'Failed to create stage round'
			});
		}
	},

	updateStageRound: async ({ request, locals }: { request: Request; locals: App.Locals }) => {
		const result = checkPermissions(locals, ['admin', 'editor']);
		if (result.status === 'error') {
			return fail(result.statusCode, {
				error: result.error
			});
		}

		const formData = await request.formData();
		const roundData = {
			id: parseInt(formData.get('id') as string),
			stageId: parseInt(formData.get('stageId') as string),
			type: formData.get('type') as string,
			title: formData.get('title') as string,
			bracket: formData.get('bracket') as string,
			parallelGroup: formData.get('parallelGroup')
				? parseInt(formData.get('parallelGroup') as string)
				: null
		};

		if (!roundData.id || !roundData.stageId || !roundData.type || !roundData.bracket) {
			return fail(400, {
				error: 'ID, stage ID, type, and bracket are required'
			});
		}

		try {
			// Get the current round data for comparison
			const currentRound = await db
				.select()
				.from(table.stageRound)
				.where(eq(table.stageRound.id, roundData.id))
				.limit(1);

			if (!currentRound.length) {
				return fail(404, {
					error: 'Stage round not found'
				});
			}

			// Update the stage round
			await db
				.update(table.stageRound)
				.set({
					type: roundData.type as any,
					title: roundData.title || null,
					bracket: roundData.bracket as any,
					parallelGroup: roundData.parallelGroup
				})
				.where(eq(table.stageRound.id, roundData.id));

			// Add edit history
			await db.insert(table.editHistory).values({
				id: crypto.randomUUID(),
				tableName: 'stage_round',
				recordId: roundData.id.toString(),
				fieldName: 'update',
				oldValue: JSON.stringify(currentRound[0]),
				newValue: JSON.stringify({
					type: roundData.type,
					title: roundData.title,
					bracket: roundData.bracket,
					parallelGroup: roundData.parallelGroup
				}),
				editedBy: result.userId,
				editedAt: new Date()
			});

			return {
				success: true
			};
		} catch (e) {
			console.error('[Admin][StageRounds][Update] Failed to update stage round:', e);
			return fail(500, {
				error: 'Failed to update stage round'
			});
		}
	},

	deleteStageRound: async ({ request, locals }: { request: Request; locals: App.Locals }) => {
		const result = checkPermissions(locals, ['admin', 'editor']);
		if (result.status === 'error') {
			return fail(result.statusCode, {
				error: result.error
			});
		}

		const formData = await request.formData();
		const id = parseInt(formData.get('id') as string);

		if (!id) {
			return fail(400, {
				error: 'ID is required'
			});
		}

		try {
			// Get the current round data for history
			const currentRound = await db
				.select()
				.from(table.stageRound)
				.where(eq(table.stageRound.id, id))
				.limit(1);

			if (!currentRound.length) {
				return fail(404, {
					error: 'Stage round not found'
				});
			}

			// Delete all stage nodes in this round first
			await db.delete(table.stageNode).where(eq(table.stageNode.roundId, id));

			// Delete the stage round
			await db.delete(table.stageRound).where(eq(table.stageRound.id, id));

			// Add edit history
			await db.insert(table.editHistory).values({
				id: crypto.randomUUID(),
				tableName: 'stage_round',
				recordId: id.toString(),
				fieldName: 'deletion',
				oldValue: JSON.stringify(currentRound[0]),
				newValue: 'deleted',
				editedBy: result.userId,
				editedAt: new Date()
			});

			return {
				success: true
			};
		} catch (e) {
			console.error('[Admin][StageRounds][Delete] Failed to delete stage round:', e);
			return fail(500, {
				error: 'Failed to delete stage round'
			});
		}
	}
};

const STAGE_NODE_ACTIONS = {
	createStageNode: async ({ request, locals }: { request: Request; locals: App.Locals }) => {
		const result = checkPermissions(locals, ['admin', 'editor']);
		if (result.status === 'error') {
			return fail(result.statusCode, {
				error: result.error
			});
		}

		const formData = await request.formData();
		const nodeData = {
			stageId: parseInt(formData.get('stageId') as string),
			matchId: formData.get('matchId') as string,
			roundId: parseInt(formData.get('roundId') as string),
			order: parseInt(formData.get('order') as string)
		};

		if (
			!nodeData.stageId ||
			!nodeData.matchId ||
			!nodeData.roundId ||
			nodeData.order === undefined
		) {
			return fail(400, {
				error: 'Stage ID, match ID, round ID, and order are required'
			});
		}

		try {
			// Create the stage node
			const [newNode] = await db
				.insert(table.stageNode)
				.values({
					stageId: nodeData.stageId,
					matchId: nodeData.matchId,
					roundId: nodeData.roundId,
					order: nodeData.order
				})
				.returning();

			// Add edit history
			await db.insert(table.editHistory).values({
				id: crypto.randomUUID(),
				tableName: 'stage_node',
				recordId: newNode.id.toString(),
				fieldName: 'creation',
				oldValue: null,
				newValue: 'created',
				editedBy: result.userId,
				editedAt: new Date()
			});

			return {
				success: true,
				nodeId: newNode.id
			};
		} catch (e) {
			console.error('[Admin][StageNodes][Create] Failed to create stage node:', e);
			return fail(500, {
				error: 'Failed to create stage node'
			});
		}
	},

	updateStageNode: async ({ request, locals }: { request: Request; locals: App.Locals }) => {
		const result = checkPermissions(locals, ['admin', 'editor']);
		if (result.status === 'error') {
			return fail(result.statusCode, {
				error: result.error
			});
		}

		const formData = await request.formData();
		const nodeData = {
			id: parseInt(formData.get('id') as string),
			stageId: parseInt(formData.get('stageId') as string),
			matchId: formData.get('matchId') as string,
			roundId: parseInt(formData.get('roundId') as string),
			order: parseInt(formData.get('order') as string)
		};

		if (
			!nodeData.id ||
			!nodeData.stageId ||
			!nodeData.matchId ||
			!nodeData.roundId ||
			nodeData.order === undefined
		) {
			return fail(400, {
				error: 'ID, stage ID, match ID, round ID, and order are required'
			});
		}

		try {
			// Get the current node data for comparison
			const currentNode = await db
				.select()
				.from(table.stageNode)
				.where(eq(table.stageNode.id, nodeData.id))
				.limit(1);

			if (!currentNode.length) {
				return fail(404, {
					error: 'Stage node not found'
				});
			}

			// Update the stage node
			await db
				.update(table.stageNode)
				.set({
					matchId: nodeData.matchId,
					roundId: nodeData.roundId,
					order: nodeData.order
				})
				.where(eq(table.stageNode.id, nodeData.id));

			// Add edit history
			await db.insert(table.editHistory).values({
				id: crypto.randomUUID(),
				tableName: 'stage_node',
				recordId: nodeData.id.toString(),
				fieldName: 'update',
				oldValue: JSON.stringify(currentNode[0]),
				newValue: JSON.stringify({
					matchId: nodeData.matchId,
					roundId: nodeData.roundId,
					order: nodeData.order
				}),
				editedBy: result.userId,
				editedAt: new Date()
			});

			return {
				success: true
			};
		} catch (e) {
			console.error('[Admin][StageNodes][Update] Failed to update stage node:', e);
			return fail(500, {
				error: 'Failed to update stage node'
			});
		}
	},

	deleteStageNode: async ({ request, locals }: { request: Request; locals: App.Locals }) => {
		const result = checkPermissions(locals, ['admin', 'editor']);
		if (result.status === 'error') {
			return fail(result.statusCode, {
				error: result.error
			});
		}

		const formData = await request.formData();
		const id = parseInt(formData.get('id') as string);

		if (!id) {
			return fail(400, {
				error: 'ID is required'
			});
		}

		try {
			// Get the current node data for history
			const currentNode = await db
				.select()
				.from(table.stageNode)
				.where(eq(table.stageNode.id, id))
				.limit(1);

			if (!currentNode.length) {
				return fail(404, {
					error: 'Stage node not found'
				});
			}

			// Delete all dependencies for this node first
			await db.delete(table.stageNodeDependency).where(eq(table.stageNodeDependency.nodeId, id));

			// Delete the stage node
			await db.delete(table.stageNode).where(eq(table.stageNode.id, id));

			// Add edit history
			await db.insert(table.editHistory).values({
				id: crypto.randomUUID(),
				tableName: 'stage_node',
				recordId: id.toString(),
				fieldName: 'deletion',
				oldValue: JSON.stringify(currentNode[0]),
				newValue: 'deleted',
				editedBy: result.userId,
				editedAt: new Date()
			});

			return {
				success: true
			};
		} catch (e) {
			console.error('[Admin][StageNodes][Delete] Failed to delete stage node:', e);
			return fail(500, {
				error: 'Failed to delete stage node'
			});
		}
	}
};

const STAGE_NODE_DEPENDENCY_ACTIONS = {
	createStageNodeDependency: async ({
		request,
		locals
	}: {
		request: Request;
		locals: App.Locals;
	}) => {
		const result = checkPermissions(locals, ['admin', 'editor']);
		if (result.status === 'error') {
			return fail(result.statusCode, {
				error: result.error
			});
		}

		const formData = await request.formData();
		const dependencyData = {
			nodeId: parseInt(formData.get('nodeId') as string),
			dependencyMatchId: formData.get('dependencyMatchId') as string,
			outcome: formData.get('outcome') as 'winner' | 'loser'
		};

		if (!dependencyData.nodeId || !dependencyData.dependencyMatchId || !dependencyData.outcome) {
			return fail(400, {
				error: 'Node ID, dependency match ID, and outcome are required'
			});
		}

		try {
			// Create the stage node dependency
			const [newDependency] = await db
				.insert(table.stageNodeDependency)
				.values({
					nodeId: dependencyData.nodeId,
					dependencyMatchId: dependencyData.dependencyMatchId,
					outcome: dependencyData.outcome
				})
				.returning();

			// Add edit history
			await db.insert(table.editHistory).values({
				id: crypto.randomUUID(),
				tableName: 'stage_node_dependency',
				recordId: newDependency.id.toString(),
				fieldName: 'creation',
				oldValue: null,
				newValue: 'created',
				editedBy: result.userId,
				editedAt: new Date()
			});

			return {
				success: true
			};
		} catch (e) {
			console.error(
				'[Admin][StageNodeDependencies][Create] Failed to create stage node dependency:',
				e
			);
			return fail(500, {
				error: 'Failed to create stage node dependency'
			});
		}
	},

	deleteStageNodeDependency: async ({
		request,
		locals
	}: {
		request: Request;
		locals: App.Locals;
	}) => {
		const result = checkPermissions(locals, ['admin', 'editor']);
		if (result.status === 'error') {
			return fail(result.statusCode, {
				error: result.error
			});
		}

		const formData = await request.formData();
		const id = parseInt(formData.get('id') as string);

		if (!id) {
			return fail(400, {
				error: 'ID is required'
			});
		}

		try {
			// Get the current dependency data for history
			const currentDependency = await db
				.select()
				.from(table.stageNodeDependency)
				.where(eq(table.stageNodeDependency.id, id))
				.limit(1);

			if (!currentDependency.length) {
				return fail(404, {
					error: 'Stage node dependency not found'
				});
			}

			// Delete the stage node dependency
			await db.delete(table.stageNodeDependency).where(eq(table.stageNodeDependency.id, id));

			// Add edit history
			await db.insert(table.editHistory).values({
				id: crypto.randomUUID(),
				tableName: 'stage_node_dependency',
				recordId: id.toString(),
				fieldName: 'deletion',
				oldValue: JSON.stringify(currentDependency[0]),
				newValue: 'deleted',
				editedBy: result.userId,
				editedAt: new Date()
			});

			return {
				success: true
			};
		} catch (e) {
			console.error(
				'[Admin][StageNodeDependencies][Delete] Failed to delete stage node dependency:',
				e
			);
			return fail(500, {
				error: 'Failed to delete stage node dependency'
			});
		}
	}
};

const GAME_ACTIONS = {
	// Game management actions
	createGame: async ({ request, locals }: { request: Request; locals: App.Locals }) => {
		const permissionResult = checkPermissions(locals, ['admin', 'editor']);
		if (permissionResult.status === 'error') {
			return fail(permissionResult.statusCode, {
				error: permissionResult.error
			});
		}

		const formData = await request.formData();
		if (dev) {
			console.log(JSON.stringify(Object.fromEntries(formData.entries()), null, 2));
		}
		const gameData = {
			matchId: formData.get('matchId') as string,
			mapId: formData.get('mapId') as string,
			duration: parseInt(formData.get('duration') as string),
			winner: parseInt(formData.get('winner') as string)
		};

		// Parse gameTeams
		const gameTeams: Array<{ teamId: string; position: number; score: number }> = [];
		for (let i = 0; i < 2; i++) {
			const teamId = formData.get(`gameTeams[${i}].teamId`);
			const position = formData.get(`gameTeams[${i}].position`);
			const score = formData.get(`gameTeams[${i}].score`);
			if (teamId && position !== null && score !== null) {
				gameTeams.push({
					teamId: String(teamId),
					position: Number(position),
					score: Number(score)
				});
			}
		}

		// Parse playerScores for both teams
		const playerScores: any[] = [];
		for (let t = 0; t < 2; t++) {
			const prefix = t === 0 ? 'playerScoresA' : 'playerScoresB';
			for (let i = 0; i < 5; i++) {
				const player = formData.get(`${prefix}[${i}].player`);
				if (!player) continue;

				// Ensure we have a valid teamId for this player score
				const teamId = gameTeams[t]?.teamId;
				if (!teamId) {
					return fail(400, {
						error: `Missing team data for team ${t === 0 ? 'A' : 'B'}`
					});
				}

				playerScores.push({
					player: String(player),
					characterFirstHalf: formData.get(`${prefix}[${i}].characterFirstHalf`) || '',
					characterSecondHalf: formData.get(`${prefix}[${i}].characterSecondHalf`) || '',
					score: Number(formData.get(`${prefix}[${i}].score`) || 0),
					damageScore: Number(formData.get(`${prefix}[${i}].damageScore`) || 0),
					kills: Number(formData.get(`${prefix}[${i}].kills`) || 0),
					knocks: Number(formData.get(`${prefix}[${i}].knocks`) || 0),
					deaths: Number(formData.get(`${prefix}[${i}].deaths`) || 0),
					assists: Number(formData.get(`${prefix}[${i}].assists`) || 0),
					damage: Number(formData.get(`${prefix}[${i}].damage`) || 0),
					accountId: Number(formData.get(`${prefix}[${i}].accountId`) || 0),
					teamId: teamId,
					gameId: undefined // will set after game insert
				});
			}
		}

		if (
			!gameData.matchId ||
			!gameData.mapId ||
			!gameData.duration ||
			isNaN(gameData.duration) ||
			gameData.winner === undefined ||
			isNaN(gameData.winner)
		) {
			return fail(400, {
				error: 'Match ID, map ID, duration, and winner are required'
			});
		}

		try {
			// Use a transaction to ensure atomicity
			const transactionResult = await db.transaction(async (tx) => {
				// Create the game
				const [newGame] = await tx
					.insert(table.game)
					.values({
						matchId: gameData.matchId,
						mapId: gameData.mapId,
						duration: gameData.duration,
						winner: gameData.winner
					})
					.returning();

				// Insert gameTeams
				if (gameTeams.length) {
					await tx.insert(table.gameTeam).values(
						gameTeams.map((gt) => ({
							gameId: newGame.id,
							teamId: gt.teamId,
							position: gt.position,
							score: gt.score
						}))
					);
				}

				// Insert playerScores
				if (playerScores.length) {
					await tx.insert(table.gamePlayerScore).values(
						playerScores.map((ps) => ({
							gameId: newGame.id,
							teamId: ps.teamId,
							player: ps.player,
							characterFirstHalf: ps.characterFirstHalf,
							characterSecondHalf: ps.characterSecondHalf,
							score: ps.score,
							damageScore: ps.damageScore,
							kills: ps.kills,
							knocks: ps.knocks,
							deaths: ps.deaths,
							assists: ps.assists,
							damage: ps.damage,
							accountId: ps.accountId
						}))
					);
				}

				// Add edit history
				await tx.insert(table.editHistory).values({
					id: crypto.randomUUID(),
					tableName: 'game',
					recordId: newGame.id.toString(),
					fieldName: 'creation',
					oldValue: null,
					newValue: 'created',
					editedBy: permissionResult.userId,
					editedAt: new Date()
				});

				return newGame;
			});

			return {
				success: true,
				gameId: transactionResult.id
			};
		} catch (e) {
			console.error('[Admin][Games][Create] Failed to create game:', e);
			return fail(500, {
				error: 'Failed to create game'
			});
		}
	},

	updateGame: async ({ request, locals }: { request: Request; locals: App.Locals }) => {
		const permissionResult = checkPermissions(locals, ['admin', 'editor']);
		if (permissionResult.status === 'error') {
			return fail(permissionResult.statusCode, {
				error: permissionResult.error
			});
		}

		const formData = await request.formData();
		if (dev) {
			console.log(JSON.stringify(Object.fromEntries(formData.entries()), null, 2));
		}
		const gameData = {
			id: parseInt(formData.get('id') as string),
			matchId: formData.get('matchId') as string,
			mapId: formData.get('mapId') as string,
			duration: parseInt(formData.get('duration') as string),
			winner: parseInt(formData.get('winner') as string)
		};

		// Parse gameTeams
		const gameTeams: Array<{ teamId: string; position: number; score: number }> = [];
		for (let i = 0; i < 2; i++) {
			const teamId = formData.get(`gameTeams[${i}].teamId`);
			const position = formData.get(`gameTeams[${i}].position`);
			const score = formData.get(`gameTeams[${i}].score`);
			if (teamId && position !== null && score !== null) {
				gameTeams.push({
					teamId: String(teamId),
					position: Number(position),
					score: Number(score)
				});
			}
		}

		// Parse playerScores for both teams
		const playerScores: any[] = [];
		for (let t = 0; t < 2; t++) {
			const prefix = t === 0 ? 'playerScoresA' : 'playerScoresB';
			for (let i = 0; i < 5; i++) {
				const player = formData.get(`${prefix}[${i}].player`);
				if (!player) continue;

				// Ensure we have a valid teamId for this player score
				const teamId = gameTeams[t]?.teamId;
				if (!teamId) {
					return fail(400, {
						error: `Missing team data for team ${t === 0 ? 'A' : 'B'}`
					});
				}

				playerScores.push({
					player: String(player),
					characterFirstHalf: formData.get(`${prefix}[${i}].characterFirstHalf`) || '',
					characterSecondHalf: formData.get(`${prefix}[${i}].characterSecondHalf`) || '',
					score: Number(formData.get(`${prefix}[${i}].score`) || 0),
					damageScore: Number(formData.get(`${prefix}[${i}].damageScore`) || 0),
					kills: Number(formData.get(`${prefix}[${i}].kills`) || 0),
					knocks: Number(formData.get(`${prefix}[${i}].knocks`) || 0),
					deaths: Number(formData.get(`${prefix}[${i}].deaths`) || 0),
					assists: Number(formData.get(`${prefix}[${i}].assists`) || 0),
					damage: Number(formData.get(`${prefix}[${i}].damage`) || 0),
					accountId: Number(formData.get(`${prefix}[${i}].accountId`) || 0),
					teamId: teamId,
					gameId: gameData.id
				});
			}
		}

		if (
			!gameData.id ||
			!gameData.matchId ||
			!gameData.mapId ||
			!gameData.duration ||
			gameData.winner === undefined
		) {
			return fail(400, {
				error: 'ID, match ID, map ID, duration, and winner are required'
			});
		}

		try {
			// Use a transaction to ensure atomicity
			await db.transaction(async (tx) => {
				// Get the current game data for comparison
				const currentGame = await tx
					.select()
					.from(table.game)
					.where(eq(table.game.id, gameData.id))
					.limit(1);

				if (!currentGame.length) {
					throw new Error('Game not found');
				}

				// Update the game
				await tx
					.update(table.game)
					.set({
						matchId: gameData.matchId,
						mapId: gameData.mapId,
						duration: gameData.duration,
						winner: gameData.winner
					})
					.where(eq(table.game.id, gameData.id));

				// Delete existing gameTeams and playerScores
				await tx.delete(table.gameTeam).where(eq(table.gameTeam.gameId, gameData.id));
				await tx.delete(table.gamePlayerScore).where(eq(table.gamePlayerScore.gameId, gameData.id));

				// Insert gameTeams
				if (gameTeams.length) {
					await tx.insert(table.gameTeam).values(
						gameTeams.map((gt) => ({
							gameId: gameData.id,
							teamId: gt.teamId,
							position: gt.position,
							score: gt.score
						}))
					);
				}

				// Insert playerScores
				if (playerScores.length) {
					await tx.insert(table.gamePlayerScore).values(
						playerScores.map((ps) => ({
							gameId: gameData.id,
							teamId: ps.teamId,
							player: ps.player,
							characterFirstHalf: ps.characterFirstHalf,
							characterSecondHalf: ps.characterSecondHalf,
							score: ps.score,
							damageScore: ps.damageScore,
							kills: ps.kills,
							knocks: ps.knocks,
							deaths: ps.deaths,
							assists: ps.assists,
							damage: ps.damage,
							accountId: ps.accountId
						}))
					);
				}

				// Add edit history
				await tx.insert(table.editHistory).values({
					id: crypto.randomUUID(),
					tableName: 'game',
					recordId: gameData.id.toString(),
					fieldName: 'update',
					oldValue: JSON.stringify(currentGame[0]),
					newValue: JSON.stringify({
						matchId: gameData.matchId,
						mapId: gameData.mapId,
						duration: gameData.duration,
						winner: gameData.winner,
						gameTeams,
						playerScores
					}),
					editedBy: permissionResult.userId,
					editedAt: new Date()
				});
			});

			return {
				success: true
			};
		} catch (e) {
			console.error('[Admin][Games][Update] Failed to update game:', e);
			if (e instanceof Error && e.message === 'Game not found') {
				return fail(404, {
					error: 'Game not found'
				});
			}
			return fail(500, {
				error: 'Failed to update game'
			});
		}
	},

	deleteGame: async ({ request, locals }: { request: Request; locals: App.Locals }) => {
		const result = checkPermissions(locals, ['admin', 'editor']);
		if (result.status === 'error') {
			return fail(result.statusCode, {
				error: result.error
			});
		}

		const formData = await request.formData();
		const id = parseInt(formData.get('id') as string);

		if (!id) {
			return fail(400, {
				error: 'ID is required'
			});
		}

		try {
			// Get the game data before deletion for history
			const game = await db.select().from(table.game).where(eq(table.game.id, id)).limit(1);

			if (!game.length) {
				return fail(404, {
					error: 'Game not found'
				});
			}

			// Delete related records first
			await db.delete(table.gameTeam).where(eq(table.gameTeam.gameId, id));
			await db.delete(table.gamePlayerScore).where(eq(table.gamePlayerScore.gameId, id));

			// Delete the game
			await db.delete(table.game).where(eq(table.game.id, id));

			// Add edit history
			await db.insert(table.editHistory).values({
				id: crypto.randomUUID(),
				tableName: 'game',
				recordId: id.toString(),
				fieldName: 'deletion',
				oldValue: JSON.stringify(game[0]),
				newValue: 'deleted',
				editedBy: result.userId,
				editedAt: new Date()
			});

			return {
				success: true
			};
		} catch (e) {
			console.error('[Admin][Games][Delete] Failed to delete game:', e);
			return fail(500, {
				error: 'Failed to delete game'
			});
		}
	}
};

export const actions = {
	...MATCH_ACTIONS,
	...STAGE_ACTIONS,
	...STAGE_ROUND_ACTIONS,
	...STAGE_NODE_ACTIONS,
	...STAGE_NODE_DEPENDENCY_ACTIONS,
	...GAME_ACTIONS
};
