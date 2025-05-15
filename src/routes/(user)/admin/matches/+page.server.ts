import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';

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

	type MatchWithTeams = (typeof events)[number]['match'] & {
		teams: Array<
			(typeof events)[number]['match_team'] & {
				team: (typeof events)[number]['teams'];
			}
		>;
		maps: Array<
			(typeof events)[number]['match_map'] & {
				map: (typeof events)[number]['map'];
			}
		>;
	};

	// Group events by event ID and collect all stages, matches, match teams, and match maps
	const eventsByEvent = events.reduce(
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
				event: (typeof events)[number]['event'];
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
				event: (typeof events)[number]['event'];
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
								team: (typeof events)[number]['teams'];
							}>;
							maps: Array<{
								id: number;
								matchId: string;
								mapId: string;
								order: number;
								side: number;
								map_picker_position: number;
								side_picker_position: number;
								map: (typeof events)[number]['map'];
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
