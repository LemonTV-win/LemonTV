import { error, fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';
import { processImageURL } from '$lib/server/storage';

type PermissionResult =
	| { status: 'success'; userId: string }
	| { status: 'error'; error: string; statusCode: 401 | 403 };

type MapAction = 'ban' | 'pick' | 'decider' | 'set' | null;

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

export async function load({ locals, url }) {
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

	// Load bracket structure data
	const stageRounds = await db.select().from(table.stageRound).orderBy(table.stageRound.id);

	const stageNodes = await db.select().from(table.stageNode).orderBy(table.stageNode.order);

	const stageNodeDependencies = await db
		.select()
		.from(table.stageNodeDependency)
		.orderBy(table.stageNodeDependency.id);

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
								const teamExists = matchData.teams.some((t) => t.teamId === matchTeam.teamId);
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
								const mapExists = matchData.maps.some((m) => m.id === matchMap.id);
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
						if (row.game && row.map) {
							const matchData = stageData.matches.get(matchId);
							const game = row.game;
							if (matchData && game.id && game.matchId) {
								// Check if game already exists to avoid duplicates
								const gameExists = matchData.games.some((g) => g.id === game.id);
								if (!gameExists) {
									matchData.games.push({
										id: game.id,
										matchId: game.matchId,
										mapId: game.mapId,
										duration: game.duration,
										winner: game.winner,
										map: row.map,
										teams: [],
										playerScores: []
									});
								}

								// Find the game to add teams and player scores
								const gameData = matchData.games.find((g) => g.id === game.id);
								if (gameData) {
									// If there's a game team, add it to the game's teams
									if (row.game_team && row.teams) {
										const gameTeam = row.game_team;
										if (gameTeam.gameId && gameTeam.teamId) {
											// Check if team already exists to avoid duplicates
											const teamExists = gameData.teams.some((t) => t.teamId === gameTeam.teamId);
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
												(s) => s && s.id === playerScore.id
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
		delete: deleteParam
	};
}

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
		const result = checkPermissions(locals, ['admin', 'editor']);
		if (result.status === 'error') {
			return fail(result.statusCode, {
				error: result.error
			});
		}

		const formData = await request.formData();
		const gameData = {
			matchId: formData.get('matchId') as string,
			mapId: formData.get('mapId') as string,
			duration: parseInt(formData.get('duration') as string),
			winner: parseInt(formData.get('winner') as string)
		};

		if (
			!gameData.matchId ||
			!gameData.mapId ||
			!gameData.duration ||
			gameData.winner === undefined
		) {
			return fail(400, {
				error: 'Match ID, map ID, duration, and winner are required'
			});
		}

		try {
			// Create the game
			const [newGame] = await db
				.insert(table.game)
				.values({
					matchId: gameData.matchId,
					mapId: gameData.mapId,
					duration: gameData.duration,
					winner: gameData.winner
				})
				.returning();

			// Add edit history
			await db.insert(table.editHistory).values({
				id: crypto.randomUUID(),
				tableName: 'game',
				recordId: newGame.id.toString(),
				fieldName: 'creation',
				oldValue: null,
				newValue: 'created',
				editedBy: result.userId,
				editedAt: new Date()
			});

			return {
				success: true,
				gameId: newGame.id
			};
		} catch (e) {
			console.error('[Admin][Games][Create] Failed to create game:', e);
			return fail(500, {
				error: 'Failed to create game'
			});
		}
	},

	updateGame: async ({ request, locals }: { request: Request; locals: App.Locals }) => {
		const result = checkPermissions(locals, ['admin', 'editor']);
		if (result.status === 'error') {
			return fail(result.statusCode, {
				error: result.error
			});
		}

		const formData = await request.formData();
		const gameData = {
			id: parseInt(formData.get('id') as string),
			matchId: formData.get('matchId') as string,
			mapId: formData.get('mapId') as string,
			duration: parseInt(formData.get('duration') as string),
			winner: parseInt(formData.get('winner') as string)
		};

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
			// Get the current game data for comparison
			const currentGame = await db
				.select()
				.from(table.game)
				.where(eq(table.game.id, gameData.id))
				.limit(1);

			if (!currentGame.length) {
				return fail(404, {
					error: 'Game not found'
				});
			}

			// Update the game
			await db
				.update(table.game)
				.set({
					matchId: gameData.matchId,
					mapId: gameData.mapId,
					duration: gameData.duration,
					winner: gameData.winner
				})
				.where(eq(table.game.id, gameData.id));

			// Add edit history
			await db.insert(table.editHistory).values({
				id: crypto.randomUUID(),
				tableName: 'game',
				recordId: gameData.id.toString(),
				fieldName: 'update',
				oldValue: JSON.stringify(currentGame[0]),
				newValue: JSON.stringify({
					matchId: gameData.matchId,
					mapId: gameData.mapId,
					duration: gameData.duration,
					winner: gameData.winner
				}),
				editedBy: result.userId,
				editedAt: new Date()
			});

			return {
				success: true
			};
		} catch (e) {
			console.error('[Admin][Games][Update] Failed to update game:', e);
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
