import { error, fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';
import { processImageURL } from '$lib/server/storage';

type PermissionResult =
	| { status: 'success'; userId: string }
	| { status: 'error'; error: string; statusCode: 401 | 403 };

type MapAction = 'ban' | 'pick' | 'decider' | null;

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
	if (!locals.user?.roles.includes('admin')) {
		throw error(403, 'Forbidden');
	}

	// Get event ID from URL if present
	const eventId = url.searchParams.get('event');

	// Load all events with their stages, matches, match teams, and match maps
	const events = await db
		.select({
			event: table.event,
			event_stage: table.stage,
			match: table.match,
			match_team: table.matchTeam,
			teams: table.teams,
			match_map: table.matchMap,
			map: table.map
		})
		.from(table.event)
		.leftJoin(table.stage, eq(table.event.id, table.stage.eventId))
		.leftJoin(table.match, eq(table.stage.id, table.match.stageId))
		.leftJoin(table.matchTeam, eq(table.match.id, table.matchTeam.matchId))
		.leftJoin(table.teams, eq(table.matchTeam.teamId, table.teams.id))
		.leftJoin(table.matchMap, eq(table.match.id, table.matchMap.matchId))
		.leftJoin(table.map, eq(table.matchMap.mapId, table.map.id))
		.orderBy(desc(table.event.createdAt));

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
						matches: new Map<string, MatchWithTeams>()
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
								maps: []
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
					}
				>;
			}
		>
	);

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
							}))
						}));
						return [
							Number(stageId),
							{
								stage: stageData.stage,
								matches
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
						}>;
					}
				>;
			}
		>
	);

	return {
		events: serializedEvents,
		event: eventId
	};
}

export const actions = {
	create: async ({ request, locals }) => {
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
			return fail(400, {
				error: 'Format and stage are required'
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

	update: async ({ request, locals }) => {
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

	delete: async ({ request, locals }) => {
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
	},

	createStage: async ({ request, locals }) => {
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

	updateStage: async ({ request, locals }) => {
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

	deleteStage: async ({ request, locals }) => {
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
