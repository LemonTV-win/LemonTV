import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { sql, isNotNull, eq } from 'drizzle-orm';

async function getRegionRankingData() {}

export const load: PageServerLoad = async ({ locals: { user } }) => {
	// TODO: 1. Use layout to help tab and move this to a sub page with separated data acquirement
	// TODO: 2. Use a summary table specifically for region ranking
	// TODO: 3. Account for players with multiple nationalities (additionalNationalities)
	const regionRankingData = await db
		.select({
			nationality: schema.player.nationality,
			totalPlayers: sql<number>`count(${schema.player.id})`.mapWith(Number),
			totalWins: sql<number>`sum(${schema.playerStats.totalWins})`.mapWith(Number),
			avgRating:
				sql<number>`avg(case when ${schema.playerStats.playerRating} > 0 then ${schema.playerStats.playerRating} end)`.mapWith(
					Number
				)
		})
		.from(schema.player)
		.leftJoin(schema.playerStats, eq(schema.player.id, schema.playerStats.playerId))
		.where(isNotNull(schema.player.nationality))
		.groupBy(schema.player.nationality);

	return {
		regionRankingData
	};
};
