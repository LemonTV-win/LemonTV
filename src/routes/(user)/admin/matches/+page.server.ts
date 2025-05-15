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

	// Load all events with their stages, matches, and match teams
	const events = await db
		.select()
		.from(table.event)
		.leftJoin(table.stage, eq(table.event.id, table.stage.eventId))
		.leftJoin(table.match, eq(table.stage.id, table.match.stageId))
		.leftJoin(table.matchTeam, eq(table.match.id, table.matchTeam.matchId))
		.leftJoin(table.teams, eq(table.matchTeam.teamId, table.teams.id))
		.orderBy(desc(table.event.createdAt));

	type MatchWithTeams = (typeof events)[number]['match'] & {
		teams: Array<
			(typeof events)[number]['match_team'] & {
				team: (typeof events)[number]['teams'];
			}
		>;
	};

	// Group events by event ID and collect all stages, matches, and match teams
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
								teams: []
							});
						}

						// If there's a match team, add it to the match's teams
						if (row.match_team && row.teams) {
							const matchData = stageData.matches.get(matchId);
							if (matchData) {
								matchData.teams.push({
									matchId: row.match_team.matchId,
									teamId: row.match_team.teamId,
									position: row.match_team.position,
									score: row.match_team.score,
									team: row.teams
								});
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
						const matches = Array.from(stageData.matches.values());
						return [
							stageId,
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
								position: number | null;
								score: number | null;
								team: (typeof events)[number]['teams'];
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
