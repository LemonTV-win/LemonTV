import type { PageServerLoad } from './$types';

import { getTeam, getTeamMatches, getTeamStatistics } from '$lib/data';
import { getTeamMemberStatistics } from '$lib/server/data/teams';
import { error } from '@sveltejs/kit';
import { getPlayers } from '$lib/server/data/players';
import type { Player } from '$lib/data/players';

export const load: PageServerLoad = async ({ params }) => {
	const players = await getPlayers();
	const rawTeam = getTeam(params.id);
	if (!rawTeam) {
		throw error(404, 'Team not found');
	}

	const team = {
		...rawTeam,
		players: rawTeam.players
			?.map((player) => players.find((p) => p.slug === player))
			.filter(Boolean) as Player[] | undefined,
		substitutes: rawTeam.substitutes
			?.map((player) => players.find((p) => p.slug === player))
			.filter(Boolean) as Player[] | undefined,
		former: rawTeam.former
			?.map((player) => players.find((p) => p.slug === player))
			.filter(Boolean) as Player[] | undefined
	};

	return {
		team,
		teamMatches: getTeamMatches(params.id),
		teamMemberStatistics: getTeamMemberStatistics(team),
		teamStatistics: getTeamStatistics(team)
	};
};
