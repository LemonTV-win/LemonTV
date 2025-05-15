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

	// Load all events with their stages and matches
	const events = await db
		.select()
		.from(table.event)
		.leftJoin(table.stage, eq(table.event.id, table.stage.eventId))
		.leftJoin(table.match, eq(table.stage.id, table.match.stageId))
		.orderBy(desc(table.event.createdAt));

	// Group events by event ID and collect all stages and matches
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
						stage: row.event_stage,
						matches: []
					});
				}

				// If there's a match, add it to the stage's matches
				if (row.match) {
					acc[eventId].stages.get(stageId)?.matches.push(row.match);
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
						stage: (typeof events)[number]['event_stage'];
						matches: (typeof events)[number]['match'][];
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
					Array.from(eventData.stages.entries()).map(([stageId, stageData]) => [
						stageId,
						{
							stage: stageData.stage,
							matches: stageData.matches
						}
					])
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
						stage: (typeof events)[number]['event_stage'];
						matches: (typeof events)[number]['match'][];
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
