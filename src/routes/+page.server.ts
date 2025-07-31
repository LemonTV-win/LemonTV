import { fail, type Actions } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';
import type { PageServerLoad } from './$types';
import { getPlayers, getPlayersTeams, getAllPlayersRatings } from '$lib/server/data/players';
import { getEvents } from '$lib/data';
import { getEssentialEvents } from '$lib/server/data/events';
import { getTeams } from '$lib/server/data/teams';
import type { EssentialEvent } from '$lib/components/EventCard.svelte';
import type { Event } from '$lib/data/events';

export const load: PageServerLoad = async () => {
	// TODO: Only get top players by pre populate player rating and rank them later, then limit to 5
	const players = await getPlayers();
	const playersTeams = await getPlayersTeams();

	// Get top 5 player ratings (optimized)
	const playersRatings = await getAllPlayersRatings(5);

	// Create a map for quick lookup
	const ratingsByPlayerId = new Map(
		playersRatings.map((rating) => [rating.playerId, rating.rating])
	);

	return {
		events: [...getEvents(), ...(await getEssentialEvents())] as (Event | EssentialEvent)[], // TODO: limit = 5
		teams: (await getTeams())
			.toSorted((a, b) => (b.wins ?? 0) - (a.wins ?? 0))
			.map((team, index) => ({
				...team,
				rank: index + 1
			})),
		players: players
			.filter((player) => ratingsByPlayerId.has(player.id)) // Only include players with ratings
			.map((player) => ({
				...player,
				teams:
					playersTeams[player.id ?? '']?.map((team) => team?.name ?? undefined).filter(Boolean) ??
					[],
				rating: ratingsByPlayerId.get(player.id) ?? 0
			}))
			.map((player, index) => ({
				...player,
				rank: index + 1
			}))
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
