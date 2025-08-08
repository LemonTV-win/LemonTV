import type { PageServerLoad } from './$types';

import {
	getTeam,
	getTeamStatistics,
	getTeams,
	getTeamMemberStatistics,
	getServerTeamDetailedMatches
} from '$lib/server/data/teams';
import { error } from '@sveltejs/kit';
import { processImageURL } from '$lib/server/storage';

export const load: PageServerLoad = async ({ params, locals: { user } }) => {
	const team = await getTeam(params.id);

	if (!team) {
		throw error(404, 'Team not found');
	}

	const teams = await getTeams();

	// Process player avatar URLs
	const uniqueAvatarUrls = new Set<string>();
	for (const player of team.players || []) {
		if (player.avatar) {
			uniqueAvatarUrls.add(player.avatar);
		}
	}

	// Process all avatar URLs in parallel
	const avatarUrlMap = new Map<string, string>();
	await Promise.all(
		Array.from(uniqueAvatarUrls).map(async (url) => {
			const processed = await processImageURL(url);
			avatarUrlMap.set(url, processed);
		})
	);

	// Get detailed match data for the team
	const teamDetailedMatches = await getServerTeamDetailedMatches(team.id);

	return {
		team: {
			...team,
			logoURL: team.logo ? await processImageURL(team.logo) : null,
			players: team.players?.map((player) => ({
				...player,
				avatarURL: player.avatar ? avatarUrlMap.get(player.avatar) || null : null
			}))
		},
		teams: new Map(teams.map((team) => [team.abbr ?? team.id ?? team.name ?? team.slug, team])), // TODO: remove this
		teamMemberStatistics: await getTeamMemberStatistics(team),
		teamStatistics: await getTeamStatistics(team),
		teamMatches: teamDetailedMatches,
		user
	};
};
