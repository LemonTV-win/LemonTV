import { error, fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { desc, eq, and, inArray } from 'drizzle-orm';
import { processImageURL } from '$lib/server/storage';
import type { TCountryCode, TLanguageCode } from 'countries-list';
import type { Region, GameMap } from '$lib/data/game';
import { MAPS } from '$lib/data/game';
import type { ActionData, Actions, PageServerLoad, RequestEvent } from './$types';
import { dev } from '$app/environment';
import { checkPermissions } from '$lib/server/security/permission';
import type { GameAccount, GameAccountRegion, GameAccountServer, Player } from '$lib/data/players';

type MapAction = 'ban' | 'pick' | 'decider' | 'set' | null;

export type GameParticipant = {
	id: string;
	name: string;
	aliases: string[];
	nationalities: TCountryCode[];
	gameAccounts: Array<{
		server: GameAccountServer;
		accountId: number;
		currentName: string;
		region?: GameAccountRegion;
	}>;
};

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

// export const load: PageServerLoad = async ({ locals, params }) => {
// 	const startTime = performance.now();
// 	console.log(`[Admin][Matches][Event][Load] Starting load function for event: ${params.eventId}`);

// 	const result = checkPermissions(locals, ['admin', 'editor']);
// 	if (result.status === 'error') {
// 		throw error(result.statusCode, result.error);
// 	}

// 	const eventId = params.eventId;

// 	// Get the specific event
// 	const [event] = await db.select().from(table.event).where(eq(table.event.id, eventId)).limit(1);

// 	if (!event) {
// 		throw error(404, 'Event not found');
// 	}

// 	console.log(`[Admin][Matches][Event][Load] Loading data for event: ${event.name}`);

// 	// Get stages for this event
// 	const stages = await db
// 		.select()
// 		.from(table.stage)
// 		.where(eq(table.stage.eventId, eventId))
// 		.orderBy(table.stage.id);

// 	// Get matches for this event (with basic team info)
// 	const matches = await db
// 		.select({
// 			match: table.match,
// 			stage: table.stage,
// 			matchTeam: table.matchTeam,
// 			team: table.team
// 		})
// 		.from(table.match)
// 		.innerJoin(table.stage, eq(table.stage.id, table.match.stageId))
// 		.leftJoin(table.matchTeam, eq(table.match.id, table.matchTeam.matchId))
// 		.leftJoin(table.team, eq(table.matchTeam.teamId, table.team.id))
// 		.where(eq(table.stage.eventId, eventId))
// 		.orderBy(table.match.id);

// 	// Get match maps for this event
// 	const matchMaps = await db
// 		.select({
// 			matchMap: table.matchMap,
// 			map: table.map,
// 			match: table.match
// 		})
// 		.from(table.matchMap)
// 		.innerJoin(table.map, eq(table.matchMap.mapId, table.map.id))
// 		.innerJoin(table.match, eq(table.matchMap.matchId, table.match.id))
// 		.innerJoin(table.stage, eq(table.stage.id, table.match.stageId))
// 		.where(eq(table.stage.eventId, eventId))
// 		.orderBy(table.matchMap.order);

// 	// Get games for this event (with basic info only)
// 	const games = await db
// 		.select({
// 			game: table.game,
// 			map: table.map,
// 			match: table.match
// 		})
// 		.from(table.game)
// 		.innerJoin(table.map, eq(table.game.mapId, table.map.id))
// 		.innerJoin(table.match, eq(table.game.matchId, table.match.id))
// 		.innerJoin(table.stage, eq(table.stage.id, table.match.stageId))
// 		.where(eq(table.stage.eventId, eventId))
// 		.orderBy(table.game.id);

// 	// Get game teams for this event
// 	const gameTeams = await db
// 		.select({
// 			gameTeam: table.gameTeam,
// 			team: table.team,
// 			game: table.game
// 		})
// 		.from(table.gameTeam)
// 		.innerJoin(table.team, eq(table.gameTeam.teamId, table.team.id))
// 		.innerJoin(table.game, eq(table.gameTeam.gameId, table.game.id))
// 		.innerJoin(table.match, eq(table.game.matchId, table.match.id))
// 		.innerJoin(table.stage, eq(table.stage.id, table.match.stageId))
// 		.where(eq(table.stage.eventId, eventId));

// 	// Get bracket structure data for this event
// 	const stageRounds = await db
// 		.select()
// 		.from(table.stageRound)
// 		.innerJoin(table.stage, eq(table.stage.id, table.stageRound.stageId))
// 		.where(eq(table.stage.eventId, eventId))
// 		.orderBy(table.stageRound.id);

// 	const stageNodes = await db
// 		.select()
// 		.from(table.stageNode)
// 		.innerJoin(table.stage, eq(table.stage.id, table.stageNode.stageId))
// 		.where(eq(table.stage.eventId, eventId))
// 		.orderBy(table.stageNode.order);

// 	const stageNodeDependencies = await db
// 		.select()
// 		.from(table.stageNodeDependency)
// 		.innerJoin(table.stageNode, eq(table.stageNode.id, table.stageNodeDependency.nodeId))
// 		.innerJoin(table.stage, eq(table.stage.id, table.stageNode.stageId))
// 		.where(eq(table.stage.eventId, eventId))
// 		.orderBy(table.stageNodeDependency.id);

// 	// Get team rosters for this event
// 	const teamRosters = await db
// 		.select({
// 			eventId: table.eventTeamPlayer.eventId,
// 			teamId: table.eventTeamPlayer.teamId,
// 			playerId: table.eventTeamPlayer.playerId,
// 			role: table.eventTeamPlayer.role,
// 			player: table.player
// 		})
// 		.from(table.eventTeamPlayer)
// 		.leftJoin(table.player, eq(table.player.id, table.eventTeamPlayer.playerId))
// 		.where(eq(table.eventTeamPlayer.eventId, eventId));

// 	// Get all teams for dropdowns
// 	const teams = await db.select().from(table.team);

// 	const totalEndTime = performance.now();
// 	console.log(
// 		`[Admin][Matches][Event][Load] Total load function time: ${totalEndTime - startTime}ms`
// 	);

// 	// Transform data into the structure expected by the frontend
// 	const stagesWithMatches = stages.map((stage) => {
// 		const stageMatches = matches
// 			.filter((m) => m.stage.id === stage.id)
// 			.map((match) => {
// 				const matchTeams = matches
// 					.filter((mt) => mt.match.id === match.match.id)
// 					.map((mt) => ({
// 						matchId: mt.match.id,
// 						teamId: mt.matchTeam?.teamId ?? null,
// 						position: mt.matchTeam?.position ?? 0,
// 						score: mt.matchTeam?.score ?? 0,
// 						team: mt.team
// 					}));

// 				const matchMapsForMatch = matchMaps
// 					.filter((mm) => mm.match.id === match.match.id)
// 					.map((mm) => ({
// 						id: mm.matchMap.id,
// 						matchId: mm.matchMap.matchId,
// 						mapId: mm.matchMap.mapId,
// 						order: mm.matchMap.order ?? 0,
// 						side: mm.matchMap.side ?? 0,
// 						action: mm.matchMap.action ?? null,
// 						map_picker_position: mm.matchMap.map_picker_position ?? 0,
// 						side_picker_position: mm.matchMap.side_picker_position ?? 0,
// 						map: mm.map
// 					}));

// 				const matchGames = games
// 					.filter((g) => g.match.id === match.match.id)
// 					.map((game) => {
// 						const gameTeamsForGame = gameTeams
// 							.filter((gt) => gt.game.id === game.game.id)
// 							.map((gt) => ({
// 								gameId: gt.gameTeam.gameId,
// 								teamId: gt.gameTeam.teamId,
// 								position: gt.gameTeam.position,
// 								score: gt.gameTeam.score,
// 								team: gt.team
// 							}));

// 						return {
// 							id: game.game.id,
// 							matchId: game.game.matchId,
// 							mapId: game.game.mapId,
// 							duration: game.game.duration,
// 							winner: game.game.winner,
// 							map: game.map,
// 							teams: gameTeamsForGame
// 						};
// 					});

// 				return {
// 					id: match.match.id,
// 					format: match.match.format,
// 					stageId: match.match.stageId,
// 					teams: matchTeams,
// 					maps: matchMapsForMatch,
// 					games: matchGames
// 				};
// 			});

// 		return {
// 			stage,
// 			matches: stageMatches
// 		};
// 	});

// 	return {
// 		event,
// 		stages: stagesWithMatches,
// 		stageRounds,
// 		stageNodes,
// 		stageNodeDependencies,
// 		teamRosters,
// 		teams
// 	};
// };

// export const actions = {
// 	// Stage actions
// 	createStage: async ({ request, locals, params }) => {
// 		const result = checkPermissions(locals, ['admin', 'editor']);
// 		if (result.status === 'error') {
// 			return fail(result.statusCode, {
// 				error: result.error
// 			});
// 		}

// 		const formData = await request.formData();
// 		const stageData = {
// 			eventId: params.eventId,
// 			title: formData.get('title') as string,
// 			stage: formData.get('stage') as string,
// 			format: formData.get('format') as string
// 		};

// 		if (!stageData.title || !stageData.stage || !stageData.format) {
// 			return fail(400, {
// 				error: 'All fields are required'
// 			});
// 		}

// 		try {
// 			// Create the stage
// 			const [newStage] = await db
// 				.insert(table.stage)
// 				.values({
// 					eventId: stageData.eventId,
// 					title: stageData.title,
// 					stage: stageData.stage,
// 					format: stageData.format
// 				})
// 				.returning();

// 			// Add edit history
// 			await db.insert(table.editHistory).values({
// 				id: crypto.randomUUID(),
// 				tableName: 'stage',
// 				recordId: newStage.id.toString(),
// 				fieldName: 'creation',
// 				oldValue: null,
// 				newValue: 'created',
// 				editedBy: result.userId,
// 				editedAt: new Date()
// 			});

// 			return {
// 				success: true
// 			};
// 		} catch (e) {
// 			console.error('[Admin][Stages][Create] Failed to create stage:', e);
// 			return fail(500, {
// 				error: 'Failed to create stage'
// 			});
// 		}
// 	},

// 	updateStage: async ({ request, locals }) => {
// 		const result = checkPermissions(locals, ['admin', 'editor']);
// 		if (result.status === 'error') {
// 			return fail(result.statusCode, {
// 				error: result.error
// 			});
// 		}

// 		const formData = await request.formData();
// 		const stageData = {
// 			id: parseInt(formData.get('id') as string),
// 			eventId: formData.get('eventId') as string,
// 			title: formData.get('title') as string,
// 			stage: formData.get('stage') as string,
// 			format: formData.get('format') as string
// 		};

// 		if (
// 			!stageData.id ||
// 			!stageData.eventId ||
// 			!stageData.title ||
// 			!stageData.stage ||
// 			!stageData.format
// 		) {
// 			return fail(400, {
// 				error: 'All fields are required'
// 			});
// 		}

// 		try {
// 			// Get the current stage data for comparison
// 			const currentStage = await db
// 				.select()
// 				.from(table.stage)
// 				.where(eq(table.stage.id, stageData.id))
// 				.limit(1);

// 			if (!currentStage.length) {
// 				return fail(404, {
// 					error: 'Stage not found'
// 				});
// 			}

// 			// Update the stage
// 			await db
// 				.update(table.stage)
// 				.set({
// 					title: stageData.title,
// 					stage: stageData.stage,
// 					format: stageData.format
// 				})
// 				.where(eq(table.stage.id, stageData.id));

// 			// Add edit history
// 			await db.insert(table.editHistory).values({
// 				id: crypto.randomUUID(),
// 				tableName: 'stage',
// 				recordId: stageData.id.toString(),
// 				fieldName: 'update',
// 				oldValue: JSON.stringify(currentStage[0]),
// 				newValue: JSON.stringify({
// 					title: stageData.title,
// 					stage: stageData.stage,
// 					format: stageData.format
// 				}),
// 				editedBy: result.userId,
// 				editedAt: new Date()
// 			});

// 			return {
// 				success: true
// 			};
// 		} catch (e) {
// 			console.error('[Admin][Stages][Update] Failed to update stage:', e);
// 			return fail(500, {
// 				error: 'Failed to update stage'
// 			});
// 		}
// 	},

// 	deleteStage: async ({ request, locals }) => {
// 		const result = checkPermissions(locals, ['admin', 'editor']);
// 		if (result.status === 'error') {
// 			return fail(result.statusCode, {
// 				error: result.error
// 			});
// 		}

// 		const formData = await request.formData();
// 		const id = parseInt(formData.get('id') as string);

// 		if (!id) {
// 			return fail(400, {
// 				error: 'ID is required'
// 			});
// 		}

// 		try {
// 			// Get the current stage data for history
// 			const currentStage = await db
// 				.select()
// 				.from(table.stage)
// 				.where(eq(table.stage.id, id))
// 				.limit(1);

// 			if (!currentStage.length) {
// 				return fail(404, {
// 					error: 'Stage not found'
// 				});
// 			}

// 			// Delete all matches in this stage first
// 			await db.delete(table.match).where(eq(table.match.stageId, id));

// 			// Delete the stage
// 			await db.delete(table.stage).where(eq(table.stage.id, id));

// 			// Add edit history
// 			await db.insert(table.editHistory).values({
// 				id: crypto.randomUUID(),
// 				tableName: 'stage',
// 				recordId: id.toString(),
// 				fieldName: 'deletion',
// 				oldValue: JSON.stringify(currentStage[0]),
// 				newValue: 'deleted',
// 				editedBy: result.userId,
// 				editedAt: new Date()
// 			});

// 			return {
// 				success: true
// 			};
// 		} catch (e) {
// 			console.error('[Admin][Stages][Delete] Failed to delete stage:', e);
// 			return fail(500, {
// 				error: 'Failed to delete stage'
// 			});
// 		}
// 	}
// };

export const load: PageServerLoad = async ({ locals, params }) => {
	console.info('[Admin][Matches][Event][Load] Starting...');
	const startTime = performance.now();

	// --- 1. Permissions and Basic Setup ---
	checkPermissions(locals, ['admin', 'editor']); // This will throw on error
	const eventId = params.eventId;

	// --- 2. Fetch Core Event Data ---
	// Get the specific event first. If it doesn't exist, we can't continue.
	const eventQueryStart = performance.now();
	const event = await db.query.event.findFirst({
		where: eq(table.event.id, eventId)
	});
	console.info(
		`[Admin][Matches][Event][Load] Event query took ${performance.now() - eventQueryStart}ms`
	);

	if (!event) {
		throw error(404, 'Event not found');
	}

	// Get all stages for this specific event
	const stagesQueryStart = performance.now();
	const stages = await db.query.stage.findMany({
		where: eq(table.stage.eventId, eventId)
	});
	console.info(
		`[Admin][Matches][Event][Load] Stages query took ${performance.now() - stagesQueryStart}ms (returned ${stages.length})`
	);
	const stageIds = stages.map((s) => s.id);

	// If there are no stages, we can stop fetching stage-related data
	if (stageIds.length === 0) {
		return { event, stages: [], teams: [], teamRosters: new Map() };
	}

	// --- 3. Fetch All Related Data in Parallel ---
	// Instead of a huge JOIN or sequential queries, we run them all at once.
	const matchesQueryStart = performance.now();
	const matchesPromise = db.query.match
		.findMany({
			where: inArray(table.match.stageId, stageIds),
			with: {
				matchTeams: { with: { team: true } },
				matchMaps: { with: { map: true } },
				games: {
					with: {
						gameTeams: { with: { team: true } },
						gamePlayerScores: true,
						gameVods: true,
						map: true
					}
				}
			}
		})
		.then((result) => {
			// Compute nested sizes to understand read amplification
			const matchCount = result.length;
			const gameCount = result.reduce((acc, m) => acc + (m.games?.length || 0), 0);
			const scoreCount = result.reduce(
				(acc, m) =>
					acc + (m.games?.reduce((sa, g) => sa + (g.gamePlayerScores?.length || 0), 0) || 0),
				0
			);
			const vodCount = result.reduce(
				(acc, m) => acc + (m.games?.reduce((sa, g) => sa + (g.gameVods?.length || 0), 0) || 0),
				0
			);
			console.info(
				`[Admin][Matches][Event][Load] Matches query took ${performance.now() - matchesQueryStart}ms (matches=${matchCount}, games=${gameCount}, playerScores=${scoreCount}, vods=${vodCount})`
			);

			return result.map((m) => ({
				...m,
				games: m.games?.map((g) => ({
					...g,
					teams: g.gameTeams,
					playerScores: g.gamePlayerScores,
					vods: g.gameVods
				}))
			}));
		});

	const stageRoundsQueryStart = performance.now();
	const stageRoundsPromise = db.query.stageRound
		.findMany({ where: inArray(table.stageRound.stageId, stageIds) })
		.then((rows) => {
			console.info(
				`[Admin][Matches][Event][Load] StageRounds query took ${performance.now() - stageRoundsQueryStart}ms (rows=${rows.length})`
			);
			return rows;
		});

	const stageNodesQueryStart = performance.now();
	const stageNodesPromise = db.query.stageNode
		.findMany({ where: inArray(table.stageNode.stageId, stageIds), with: { dependencies: true } })
		.then((rows) => {
			const depCount = rows.reduce((acc, n) => acc + (n.dependencies?.length || 0), 0);
			console.info(
				`[Admin][Matches][Event][Load] StageNodes query took ${performance.now() - stageNodesQueryStart}ms (nodes=${rows.length}, dependencies=${depCount})`
			);
			return rows;
		});

	const teamRostersQueryStart = performance.now();
	const teamRostersPromise = db.query.eventTeamPlayer
		.findMany({
			where: eq(table.eventTeamPlayer.eventId, eventId),
			with: {
				player: {
					with: {
						additionalNationalities: true,
						aliases: true,
						gameAccounts: true
					}
				}
			}
		})
		.then((rows) => {
			const players = rows.filter((r) => r.player).length;
			console.info(
				`[Admin][Matches][Event][Load] TeamRosters query took ${performance.now() - teamRostersQueryStart}ms (rows=${rows.length}, players=${players})`
			);
			return rows;
		});

	const teamsQueryStart = performance.now();
	const teamsForEventPromise = db.query.team
		.findMany({
			where: inArray(
				table.team.id,
				db
					.select({ teamId: table.eventTeamPlayer.teamId })
					.from(table.eventTeamPlayer)
					.where(eq(table.eventTeamPlayer.eventId, eventId))
			)
		})
		.then((rows) => {
			console.info(
				`[Admin][Matches][Event][Load] Teams query took ${performance.now() - teamsQueryStart}ms (rows=${rows.length})`
			);
			return rows;
		});

	const [matches, stageRounds, stageNodes, teamRostersRaw, teamsForEvent] = await Promise.all([
		matchesPromise,
		stageRoundsPromise,
		stageNodesPromise,
		teamRostersPromise,
		teamsForEventPromise
	]);

	type StageMatch = (typeof matches)[number];
	type StageRound = (typeof stageRounds)[number];
	type StageNode = (typeof stageNodes)[number];

	// --- 4. Process Images and Rosters (Efficiently) ---
	const [processedEvent, teamRosterMap] = await Promise.all([
		// Process event image
		(async () => {
			return {
				...event,
				image: event.image ? await processImageURL(event.image) : null
			};
		})(),
		// Process the raw roster data into the nested map structure
		(async () => {
			const rosters = new Map<string, { player: Player; job: string }[]>();
			for (const row of teamRostersRaw) {
				if (!row.teamId || !row.player) continue;

				if (!rosters.has(row.teamId)) {
					rosters.set(row.teamId, []);
				}
				rosters.get(row.teamId)!.push({
					// Assuming your PlayerData structure matches this
					player: {
						id: row.player.id,
						slug: row.player.slug,
						name: row.player.name,
						aliases: row.player.aliases.map((a) => a.alias),
						nationalities: [
							row.player.nationality,
							...row.player.additionalNationalities.map((n) => n.nationality)
						] as TCountryCode[],
						gameAccounts: row.player.gameAccounts as GameAccount[]
					},
					job: row.role
				});
			}
			return rosters;
		})()
	]);

	// Process matches[i].games[j].teams[k]'s & matches[i].matchTeams[j]'s image URLs
	const uniqueImageUrls = new Set<string>();
	for (const match of matches) {
		for (const team of match.matchTeams) {
			if (team.team?.logo) {
				uniqueImageUrls.add(team.team.logo);
			}
		}
		for (const game of match.games) {
			for (const team of game.teams) {
				if (team.team.logo) {
					uniqueImageUrls.add(team.team.logo);
				}
			}
		}
	}

	const imageUrlMap = new Map<string, string>();
	await Promise.all(
		Array.from(uniqueImageUrls).map(async (url) => {
			const processed = await processImageURL(url);
			imageUrlMap.set(url, processed);
		})
	);

	// --- 5. Assemble Final Data Structure (Simplified) ---
	// The data is already structured by the queries, so assembly is much easier.
	const finalStages = stages.reduce(
		(acc, stage) => {
			acc[stage.id] = {
				stage: {
					id: stage.id,
					title: stage.title,
					stage: stage.stage,
					format: stage.format
				},
				matches: matches
					.filter((m) => m.stageId === stage.id)
					.map((m) => ({
						...m,
						matchTeams: m.matchTeams.map((mt) => ({
							matchId: mt.matchId,
							teamId: mt.teamId,
							position: mt.position,
							score: mt.score,
							team: mt.team
								? {
										...mt.team,
										logoURL: mt.team.logo ? (imageUrlMap.get(mt.team.logo) ?? mt.team.logo) : null
									}
								: null
						})),
						games: m.games.map((g) => ({
							...g,
							teams: g.teams.map((gt) => ({
								...gt.team,
								logoURL: gt.team.logo ? (imageUrlMap.get(gt.team.logo) ?? gt.team.logo) : null
							}))
						}))
					})),
				rounds: stageRounds.filter((r) => r.stageId === stage.id),
				nodes: stageNodes.filter((n) => n.stageId === stage.id)
			};
			return acc;
		},
		{} as Record<
			number,
			{
				stage: {
					id: number;
					title: string;
					stage: string;
					format: string;
				};
				matches: (Omit<StageMatch, 'games' | 'matchTeams'> & {
					matchTeams: (StageMatch['matchTeams'][number] & {
						team: (StageMatch['matchTeams'][number]['team'] & { logoURL: string | null }) | null;
					})[];
					games: (Omit<StageMatch['games'][number], 'teams'> & {
						teams: (StageMatch['games'][number]['teams'][number]['team'] & {
							logoURL: string | null;
						})[];
					})[];
				})[];
				rounds: StageRound[];
				nodes: StageNode[];
			}
		>
	);
	console.info(`[Admin][Matches][Event][Load] Total load time: ${performance.now() - startTime}ms`);

	return {
		event: processedEvent,
		stages: finalStages,
		teams: teamsForEvent,
		teamRosters: teamRosterMap
	};
};

function isValidMatchFormat(format: string): format is 'BO1' | 'BO3' | 'BO5' {
	return format === 'BO1' || format === 'BO3' || format === 'BO5';
}

const MATCH_ACTIONS = {
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
			const missingFields = [];
			if (!matchData.format) missingFields.push('format');
			if (!matchData.stageId) missingFields.push('stage');

			return fail(400, {
				error: `Missing required fields: ${missingFields.join(', ')}`
			});
		}

		if (!isValidMatchFormat(matchData.format)) {
			return fail(400, {
				error: 'Invalid match format'
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

		if (!isValidMatchFormat(matchData.format)) {
			return fail(400, {
				error: 'Invalid match format'
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
	}
} satisfies Actions;

function isValidStageFormat(
	format: string
): format is 'single' | 'double' | 'swiss' | 'round-robin' {
	return (
		format === 'single' || format === 'double' || format === 'swiss' || format === 'round-robin'
	);
}

function isValidStageStage(
	stage: string
): stage is 'group' | 'qualifier' | 'showmatch' | 'playoff' {
	return stage === 'group' || stage === 'qualifier' || stage === 'showmatch' || stage === 'playoff';
}

const STAGE_ACTIONS = {
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

		if (!isValidStageFormat(stageData.format)) {
			return fail(400, {
				error: 'Invalid stage format'
			});
		}

		if (!isValidStageStage(stageData.stage)) {
			return fail(400, {
				error: 'Invalid stage stage'
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

		if (!isValidStageFormat(stageData.format)) {
			return fail(400, {
				error: 'Invalid stage format'
			});
		}

		if (!isValidStageStage(stageData.stage)) {
			return fail(400, {
				error: 'Invalid stage stage'
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
} satisfies Actions;

const STAGE_ROUND_ACTIONS = {
	// New bracket structure actions
	createStageRound: async ({ request, locals }) => {
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

	updateStageRound: async ({ request, locals }) => {
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

	deleteStageRound: async ({ request, locals }) => {
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
} satisfies Actions;

const STAGE_NODE_ACTIONS = {
	createStageNode: async ({ request, locals }) => {
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

	updateStageNode: async ({ request, locals }) => {
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

	deleteStageNode: async ({ request, locals }) => {
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
} satisfies Actions;

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
			console.info(JSON.stringify(Object.fromEntries(formData.entries()), null, 2));
		}
		if (formData.get('winner') !== '0' && formData.get('winner') !== '1') {
			return fail(400, {
				error: 'Winner must be either 0 or 1'
			});
		}
		const gameData = {
			matchId: formData.get('matchId') as string,
			mapId: formData.get('mapId') as string,
			duration: parseInt(formData.get('duration') as string),
			winner: parseInt(formData.get('winner') as string) as 0 | 1
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

		// Parse VODs for new games
		const gameVods: any[] = [];
		for (let i = 0; i < 10; i++) {
			// Allow up to 10 VODs
			const url = formData.get(`gameVods[${i}].url`);
			if (!url) continue;

			gameVods.push({
				url: String(url),
				type:
					(formData.get(`gameVods[${i}].type`) as
						| 'main'
						| 'sub'
						| 'restream'
						| 'pov'
						| 'archive'
						| 'clip'
						| 'analysis') || 'main',
				playerId: formData.get(`gameVods[${i}].playerId`) || null,
				teamId: formData.get(`gameVods[${i}].teamId`) || null,
				language: formData.get(`gameVods[${i}].language`) || null,
				platform:
					(formData.get(`gameVods[${i}].platform`) as 'youtube' | 'bilibili' | 'twitch') || null,
				title: formData.get(`gameVods[${i}].title`) || null,
				official: formData.get(`gameVods[${i}].official`) === 'on',
				startTime: formData.get(`gameVods[${i}].startTime`)
					? parseInt(formData.get(`gameVods[${i}].startTime`) as string)
					: null,
				available: formData.get(`gameVods[${i}].available`) === 'on',
				gameId: undefined // will set after game insert
			});
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

		// Validate mapId is a valid GameMap
		if (!MAPS.includes(gameData.mapId as GameMap)) {
			return fail(400, {
				error: `Invalid map ID: ${gameData.mapId}. Valid maps are: ${MAPS.join(', ')}`
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
						mapId: gameData.mapId as GameMap,
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

				// Insert VODs
				if (gameVods.length) {
					await tx.insert(table.gameVod).values(
						gameVods.map((vod) => ({
							gameId: newGame.id,
							url: vod.url,
							type: vod.type,
							playerId: vod.playerId,
							teamId: vod.teamId,
							language: vod.language,
							platform: vod.platform,
							title: vod.title,
							official: vod.official,
							startTime: vod.startTime,
							available: vod.available
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
			console.info(JSON.stringify(Object.fromEntries(formData.entries()), null, 2));
		}
		if (
			formData.get('winner') !== '0' &&
			formData.get('winner') !== '1' &&
			formData.get('winner') !== '-1'
		) {
			return fail(400, {
				error: 'Winner must be either 0, 1, or -1'
			});
		}
		const gameData = {
			id: parseInt(formData.get('id') as string),
			matchId: formData.get('matchId') as string,
			mapId: formData.get('mapId') as string,
			duration: parseInt(formData.get('duration') as string),
			winner: parseInt(formData.get('winner') as string) as 0 | 1 | -1
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

		// Validate mapId is a valid GameMap
		if (!MAPS.includes(gameData.mapId as GameMap)) {
			return fail(400, {
				error: `Invalid map ID: ${gameData.mapId}. Valid maps are: ${MAPS.join(', ')}`
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
						mapId: gameData.mapId as GameMap,
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
			await db.delete(table.gameVod).where(eq(table.gameVod.gameId, id));

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

const VOD_ACTIONS = {
	saveGameVod: async ({ request, locals }: { request: Request; locals: App.Locals }) => {
		const permissionResult = checkPermissions(locals, ['admin', 'editor']);
		if (permissionResult.status === 'error') {
			return fail(permissionResult.statusCode, {
				error: permissionResult.error
			});
		}

		const formData = await request.formData();
		const gameId = parseInt(formData.get('gameId') as string);
		const url = formData.get('url') as string;
		const type = formData.get('type') as
			| 'main'
			| 'sub'
			| 'restream'
			| 'pov'
			| 'archive'
			| 'clip'
			| 'analysis';
		const playerId = formData.get('playerId') as string;
		const teamId = formData.get('teamId') as string;
		const language = formData.get('language') as TLanguageCode;
		const platform = formData.get('platform') as 'youtube' | 'bilibili' | 'twitch' | null;
		const title = formData.get('title') as string;
		const official = formData.get('official') === 'on';
		const startTime = formData.get('startTime') as string;
		const available = formData.get('available') === 'on';

		if (!gameId || !url || !type) {
			return fail(400, {
				error: 'Game ID, URL, and Type are required'
			});
		}

		try {
			// Check if game exists
			const game = await db.select().from(table.game).where(eq(table.game.id, gameId)).limit(1);
			if (!game.length) {
				return fail(404, {
					error: 'Game not found'
				});
			}

			// Check if VOD already exists
			const existingVod = await db
				.select()
				.from(table.gameVod)
				.where(and(eq(table.gameVod.gameId, gameId), eq(table.gameVod.url, url)))
				.limit(1);

			const vodData = {
				gameId,
				url,
				type,
				playerId: playerId || null,
				teamId: teamId || null,
				language: language || null,
				platform: platform || null,
				title: title || null,
				official,
				startTime: startTime ? parseInt(startTime) : null,
				available
			};

			if (existingVod.length > 0) {
				// Update existing VOD
				await db
					.update(table.gameVod)
					.set({
						...vodData,
						createdAt: existingVod[0].createdAt // Preserve original creation date
					})
					.where(and(eq(table.gameVod.gameId, gameId), eq(table.gameVod.url, url)));

				// Add edit history
				await db.insert(table.editHistory).values({
					id: crypto.randomUUID(),
					tableName: 'game_vod',
					recordId: `${gameId}-${url}`,
					fieldName: 'update',
					oldValue: JSON.stringify(existingVod[0]),
					newValue: JSON.stringify(vodData),
					editedBy: permissionResult.userId,
					editedAt: new Date()
				});
			} else {
				// Insert new VOD
				await db.insert(table.gameVod).values(vodData);

				// Add edit history
				await db.insert(table.editHistory).values({
					id: crypto.randomUUID(),
					tableName: 'game_vod',
					recordId: `${gameId}-${url}`,
					fieldName: 'creation',
					oldValue: '',
					newValue: JSON.stringify(vodData),
					editedBy: permissionResult.userId,
					editedAt: new Date()
				});
			}

			return {
				success: true
			};
		} catch (e) {
			console.error('[Admin][VODs][Save] Failed to save VOD:', e);
			return fail(500, {
				error: 'Failed to save VOD'
			});
		}
	},

	deleteGameVod: async ({ request, locals }: { request: Request; locals: App.Locals }) => {
		const permissionResult = checkPermissions(locals, ['admin', 'editor']);
		if (permissionResult.status === 'error') {
			return fail(permissionResult.statusCode, {
				error: permissionResult.error
			});
		}

		const formData = await request.formData();
		const gameId = parseInt(formData.get('gameId') as string);
		const url = formData.get('url') as string;

		if (!gameId || !url) {
			return fail(400, {
				error: 'Game ID and URL are required'
			});
		}

		try {
			// Get the VOD data before deletion for history
			const vod = await db
				.select()
				.from(table.gameVod)
				.where(and(eq(table.gameVod.gameId, gameId), eq(table.gameVod.url, url)))
				.limit(1);

			if (!vod.length) {
				return fail(404, {
					error: 'VOD not found'
				});
			}

			// Delete the VOD
			await db
				.delete(table.gameVod)
				.where(and(eq(table.gameVod.gameId, gameId), eq(table.gameVod.url, url)));

			// Add edit history
			await db.insert(table.editHistory).values({
				id: crypto.randomUUID(),
				tableName: 'game_vod',
				recordId: `${gameId}-${url}`,
				fieldName: 'deletion',
				oldValue: JSON.stringify(vod[0]),
				newValue: 'deleted',
				editedBy: permissionResult.userId,
				editedAt: new Date()
			});

			return {
				success: true
			};
		} catch (e) {
			console.error('[Admin][VODs][Delete] Failed to delete VOD:', e);
			return fail(500, {
				error: 'Failed to delete VOD'
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
	...GAME_ACTIONS,
	...VOD_ACTIONS
};
