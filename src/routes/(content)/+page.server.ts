import { fail, type Actions } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';
import type { PageServerLoad } from './$types';
import { getPlayers, getPlayersTeams } from '$lib/server/data/players';
import { getAllPlayersRatings } from '$lib/server/data/stats';
import { getEssentialEvents } from '$lib/server/data/events';
import { getTeams } from '$lib/server/data/teams';
import type { EssentialEvent } from '$lib/components/EventCard.svelte';
import type { Event } from '$lib/data/events';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async () => {
	const totalStart = performance.now();
	console.info('[HomePage] Starting home page load');

	// TODO: Only get top players by pre populate player rating and rank them later, then limit to 5
	const playersQueryStart = performance.now();
	const players = await getPlayers();
	const playersQueryDuration = performance.now() - playersQueryStart;
	console.info(`[HomePage] Players query took ${playersQueryDuration.toFixed(2)}ms`);

	const playersTeamsQueryStart = performance.now();
	const playersTeams = await getPlayersTeams();
	const playersTeamsQueryDuration = performance.now() - playersTeamsQueryStart;
	console.info(`[HomePage] Players teams query took ${playersTeamsQueryDuration.toFixed(2)}ms`);

	// Get top 5 player ratings (optimized)
	const playersRatingsQueryStart = performance.now();
	const playersRatings = await getAllPlayersRatings(db, 5);
	const playersRatingsQueryDuration = performance.now() - playersRatingsQueryStart;
	console.info(`[HomePage] Players ratings query took ${playersRatingsQueryDuration.toFixed(2)}ms`);

	// Create a map for quick lookup
	const dataProcessingStart = performance.now();
	const ratingsByPlayerId = new Map(
		playersRatings.map((rating) => [rating.playerId, rating.rating])
	);

	// Get players with ratings and limit to top 5
	const playersWithRatings = players
		.filter((player) => ratingsByPlayerId.has(player.id)) // Only include players with ratings
		.map((player) => ({
			...player,
			teams:
				playersTeams[player.id ?? '']?.map((team) => team?.name ?? undefined).filter(Boolean) ?? [],
			rating: ratingsByPlayerId.get(player.id) ?? 0
		}))
		.toSorted((a, b) => b.rating - a.rating)
		.slice(0, 5)
		.map((player, index) => ({
			...player,
			rank: index + 1
		}));
	const dataProcessingDuration = performance.now() - dataProcessingStart;
	console.info(`[HomePage] Players data processing took ${dataProcessingDuration.toFixed(2)}ms`);

	// Get events with timing
	const eventsQueryStart = performance.now();
	const events = await getEssentialEvents(); // TODO: limit = 5
	const eventsQueryDuration = performance.now() - eventsQueryStart;
	console.info(`[HomePage] Events query took ${eventsQueryDuration.toFixed(2)}ms`);

	// Get teams with timing
	const teamsQueryStart = performance.now();
	const teams = await getTeams();
	const teamsQueryDuration = performance.now() - teamsQueryStart;
	console.info(`[HomePage] Teams query took ${teamsQueryDuration.toFixed(2)}ms`);

	// Process teams data
	const teamsProcessingStart = performance.now();
	const processedTeams = teams
		.toSorted((a, b) => (b.wins ?? 0) - (a.wins ?? 0))
		.map((team, index) => ({
			...team,
			rank: index + 1
		}));
	const teamsProcessingDuration = performance.now() - teamsProcessingStart;
	console.info(`[HomePage] Teams processing took ${teamsProcessingDuration.toFixed(2)}ms`);

	const totalDuration = performance.now() - totalStart;
	console.info(`[HomePage] Total home page load took ${totalDuration.toFixed(2)}ms`);

	return {
		events,
		teams: processedTeams,
		players: playersWithRatings,
		totalPlayers: players.length
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
