import type { PageServerLoad } from './$types';

import { getMatch } from '$lib/data';
import { error } from '@sveltejs/kit';
import { getTeam } from '$lib/server/data/teams';

export const load: PageServerLoad = async ({ params }) => {
	const match = getMatch(Number(params.id));
	if (!match) {
		throw error(404, 'Match not found');
	}

	return {
		match: {
			...match,
			teams: await Promise.all(
				match.teams.map(async (participant) => {
					const team = await getTeam(participant.team);
					return {
						...participant,
						team
					};
				})
			)
		}
	};
};
