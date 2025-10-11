import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { desc, eq, inArray, sql } from 'drizzle-orm';
import { checkPermissions } from '$lib/server/security/permission';
import type { PageServerLoad } from './$types';
import { processImageURL } from '$lib/server/storage';

export const load: PageServerLoad = async ({ locals }) => {
	const startTime = Date.now();
	console.info('[Admin][Matches][Load] Starting load function');

	const result = checkPermissions(locals, ['admin', 'editor']);
	if (result.status === 'error') {
		throw error(result.statusCode, result.error);
	}

	console.info('[Admin][Matches][Load] Starting events query');
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
	console.info(
		`[Admin][Matches][Load] Events query completed in ${queryEndTime - queryStartTime}ms, returned ${events.length} rows`
	);

	// Get basic stats for each event using aggregated COUNTs grouped by eventId
	const statsStartTime = Date.now();
	const eventIds = events.map((e) => e.id);

	let eventStatsMap = new Map<
		string,
		{ eventId: string; stageCount: number; matchCount: number; gameCount: number }
	>();

	if (eventIds.length > 0) {
		const stageCounts = await db
			.select({
				eventId: table.stage.eventId,
				count: sql<number>`count(*)`.mapWith(Number)
			})
			.from(table.stage)
			.where(inArray(table.stage.eventId, eventIds))
			.groupBy(table.stage.eventId);

		const matchCounts = await db
			.select({
				eventId: table.stage.eventId,
				count: sql<number>`count(*)`.mapWith(Number)
			})
			.from(table.match)
			.innerJoin(table.stage, eq(table.stage.id, table.match.stageId))
			.where(inArray(table.stage.eventId, eventIds))
			.groupBy(table.stage.eventId);

		const gameCounts = await db
			.select({
				eventId: table.stage.eventId,
				count: sql<number>`count(*)`.mapWith(Number)
			})
			.from(table.game)
			.innerJoin(table.match, eq(table.match.id, table.game.matchId))
			.innerJoin(table.stage, eq(table.stage.id, table.match.stageId))
			.where(inArray(table.stage.eventId, eventIds))
			.groupBy(table.stage.eventId);

		const stageCountMap = new Map(stageCounts.map((r) => [r.eventId, r.count]));
		const matchCountMap = new Map(matchCounts.map((r) => [r.eventId, r.count]));
		const gameCountMap = new Map(gameCounts.map((r) => [r.eventId, r.count]));

		eventStatsMap = new Map(
			events.map((e) => [
				e.id,
				{
					eventId: e.id,
					stageCount: stageCountMap.get(e.id) ?? 0,
					matchCount: matchCountMap.get(e.id) ?? 0,
					gameCount: gameCountMap.get(e.id) ?? 0
				}
			])
		);
	}

	const statsEndTime = Date.now();
	console.info(
		`[Admin][Matches][Load] Aggregated stats queries completed in ${statsEndTime - statsStartTime}ms`
	);

	const totalEndTime = Date.now();
	console.info(`[Admin][Matches][Load] Total load function time: ${totalEndTime - startTime}ms`);

	const uniqueImageUrls = new Set<string>();

	for (const event of events) {
		if (event.image) uniqueImageUrls.add(event.image);
	}

	// Step 2: Process all image URLs in parallel
	const imageUrlMap = new Map<string, string>();

	await Promise.all(
		Array.from(uniqueImageUrls).map(async (url) => {
			const processed = await processImageURL(url);
			imageUrlMap.set(url, processed);
		})
	);

	return {
		events: events.map((event) => ({
			...event,
			imageURL: imageUrlMap.get(event.image) || event.image,
			stats: eventStatsMap.get(event.id) || { stageCount: 0, matchCount: 0, gameCount: 0 }
		}))
	};
};
