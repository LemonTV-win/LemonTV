import { error, fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';
import { checkPermissions } from '$lib/server/security/permission';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const startTime = Date.now();
	console.log('[Admin][Matches][Load] Starting load function');

	const result = checkPermissions(locals, ['admin', 'editor']);
	if (result.status === 'error') {
		throw error(result.statusCode, result.error);
	}

	console.log('[Admin][Matches][Load] Starting events query');
	const queryStartTime = Date.now();

	// Only load basic event information - no joins, no cartesian products
	const events = await db
		.select({
			id: table.event.id,
			name: table.event.name,
			slug: table.event.slug,
			official: table.event.official,
			server: table.event.server,
			format: table.event.format,
			region: table.event.region,
			image: table.event.image,
			status: table.event.status,
			date: table.event.date,
			createdAt: table.event.createdAt,
			updatedAt: table.event.updatedAt
		})
		.from(table.event)
		.orderBy(desc(table.event.createdAt));

	const queryEndTime = Date.now();
	console.log(
		`[Admin][Matches][Load] Events query completed in ${queryEndTime - queryStartTime}ms, returned ${events.length} rows`
	);

	// Get basic stats for each event (counts only, no detailed data)
	const eventStats = await Promise.all(
		events.map(async (event) => {
			// Get stage count for this event
			const stageCount = await db
				.select({ count: table.stage.id })
				.from(table.stage)
				.where(eq(table.stage.eventId, event.id))
				.then((result) => result.length);

			// Get match count for this event
			const matchCount = await db
				.select({ count: table.match.id })
				.from(table.match)
				.innerJoin(table.stage, eq(table.stage.id, table.match.stageId))
				.where(eq(table.stage.eventId, event.id))
				.then((result) => result.length);

			// Get game count for this event
			const gameCount = await db
				.select({ count: table.game.id })
				.from(table.game)
				.innerJoin(table.match, eq(table.match.id, table.game.matchId))
				.innerJoin(table.stage, eq(table.stage.id, table.match.stageId))
				.where(eq(table.stage.eventId, event.id))
				.then((result) => result.length);

			return {
				eventId: event.id,
				stageCount,
				matchCount,
				gameCount
			};
		})
	);

	// Create a map of event stats for quick lookup
	const eventStatsMap = new Map(eventStats.map((stat) => [stat.eventId, stat]));

	const totalEndTime = Date.now();
	console.log(`[Admin][Matches][Load] Total load function time: ${totalEndTime - startTime}ms`);

	return {
		events: events.map((event) => ({
			...event,
			stats: eventStatsMap.get(event.id) || { stageCount: 0, matchCount: 0, gameCount: 0 }
		}))
	};
};
