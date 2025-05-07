import type { PageServerLoad } from './$types';

import { getTeam, getTeamMatches, getTeamMemberStatistics, getTeamStatistics } from '$lib/data';
import { error } from '@sveltejs/kit';
import { getPlayers } from '$lib/server/data/players';
import type { Player } from '$lib/data/players';

export const load: PageServerLoad = async ({ params }) => {
	const players = await getPlayers();
	const team = getTeam(params.id);
	if (!team) {
		throw error(404, 'Team not found');
	}
	return {
		team: {
			...team,
			players: team.players
				?.map((player) => players.find((p) => p.slug === player))
				.filter(Boolean) as Player[] | undefined,
			substitutes: team.substitutes
				?.map((player) => players.find((p) => p.slug === player))
				.filter(Boolean) as Player[] | undefined,
			former: team.former
				?.map((player) => players.find((p) => p.slug === player))
				.filter(Boolean) as Player[] | undefined
		},
		teamMatches: getTeamMatches(params.id),
		teamMemberStatistics: getTeamMemberStatistics(team),
		teamStatistics: getTeamStatistics(team)
	};
};
