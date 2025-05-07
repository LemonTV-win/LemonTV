import { fail, type Actions } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';
import type { PageServerLoad } from './$types';
import { getPlayers, getPlayersTeams } from '$lib/server/data/players';
import { calculatePlayerRating, getEvents, getTeams } from '$lib/data';

export const load: PageServerLoad = async () => {
	const players = await getPlayers(); // TODO: limit =5
	const playersTeams = getPlayersTeams(players);
	return {
		events: getEvents(), // TODO: limit = 5
		teams: getTeams(), // TODO: limit = 5
		players: players
			.map((player) => ({
				...player,
				teams:
					playersTeams[player.id ?? '']?.map((team) => team?.name ?? undefined).filter(Boolean) ??
					[],
				rating: calculatePlayerRating(player)
			}))
			.toSorted((a, b) => b.rating - a.rating)
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
