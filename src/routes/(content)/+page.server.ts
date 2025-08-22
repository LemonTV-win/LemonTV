import { fail, type Actions } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';
import type { PageServerLoad } from './$types';
import { getEssentialEvents } from '$lib/server/data/events';
import { getTeams } from '$lib/server/data/teams';
import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schemas';
import { sql } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
	const TOP = 5;
	const totalStart = performance.now();
	console.info('[HomePage] Starting home page load');

	// 1) Get top-N player ids + rating directly from the materialized table
	const topStart = performance.now();
	const topRows = await db.query.playerStats.findMany({
		columns: {
			playerId: true,
			playerRating: true
		},
		orderBy: (playerStats, { desc }) => [desc(playerStats.playerRating)],
		limit: TOP
	});
	const topDuration = performance.now() - topStart;
	console.info(`[HomePage] Top ${TOP} player ids query took ${topDuration.toFixed(2)}ms`);

	const topIds = topRows.map((r) => r.playerId);

	// 2) In parallel: hydrate only those players + their teams, and fetch events/teams
	const hydrateStart = performance.now();
	const [playersWithTeams, events, teams] = await Promise.all([
		db.query.player.findMany({
			columns: {
				id: true,
				name: true,
				slug: true,
				nationality: true
			},
			with: {
				additionalNationalities: {
					columns: {
						nationality: true
					}
				},
				teamMemberships: {
					columns: {
						teamId: true
					},
					with: {
						team: {
							columns: {
								name: true
							}
						}
					}
				}
			},
			where: (player, { inArray }) => inArray(player.id, topIds)
		}),
		getEssentialEvents(), // TODO: { limit: 5 }
		getTeams()
	]);
	const hydrateDuration = performance.now() - hydrateStart;
	console.info(
		`[HomePage] Parallel hydrate (players/teams/events/teams) took ${hydrateDuration.toFixed(2)}ms`
	);

	// If your helpers don’t support ids yet, you can fallback (less optimal):
	// const players = (await getPlayers()).filter(p => topIds.includes(p.id));
	// const playersTeams = pickOnlyThoseTeams(await getPlayersTeams(), topIds);

	// 3) Merge + compute ranks (already ordered by DB; keep that order)
	const buildStart = performance.now();
	const playersById = new Map(playersWithTeams.map((p) => [p.id, p]));
	const playersWithRatings = topRows
		.map((row, index) => {
			const p = playersById.get(row.playerId);
			if (!p) return null; // in case of mismatch
			return {
				...p,
				teams: p.teamMemberships.map((t) => t.team.name),
				nationalities: [p.nationality, ...p.additionalNationalities.map((n) => n.nationality)],
				rating: row.playerRating,
				rank: index + 1
			};
		})
		.filter((x) => x !== null);
	const buildDuration = performance.now() - buildStart;
	console.info(`[HomePage] Players merge/rank build took ${buildDuration.toFixed(2)}ms`);

	// 4) Process teams ranking
	const teamsProcessingStart = performance.now();
	const processedTeams = teams
		.toSorted((a, b) => (b.wins ?? 0) - (a.wins ?? 0))
		.map((team, index) => ({ ...team, rank: index + 1 }));
	const teamsProcessingDuration = performance.now() - teamsProcessingStart;
	console.info(`[HomePage] Teams processing took ${teamsProcessingDuration.toFixed(2)}ms`);

	const totalDuration = performance.now() - totalStart;
	console.info(`[HomePage] Total home page load took ${totalDuration.toFixed(2)}ms`);

	const [{ cnt: totalPlayers }] = await db
		.select({ cnt: sql<number>`count(*)` })
		.from(schema.player);

	return {
		events,
		teams: processedTeams,
		players: playersWithRatings,
		totalPlayers
	};
};

export const actions: Actions = {
	logout: async (event) => {
		if (!event.locals.session) {
			return fail(401);
		}
		await auth.invalidateSession(event.locals.session.id);
		auth.deleteSessionTokenCookie(event);
	}
};
