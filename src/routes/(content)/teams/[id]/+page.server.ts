import type { PageServerLoad } from './$types';

import {
	getTeam,
	getTeamStatistics,
	getTeamMemberStatistics,
	getServerTeamDetailedMatches
} from '$lib/server/data/teams';
import { error } from '@sveltejs/kit';
import { processImageURL } from '$lib/server/storage';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async ({ params, locals: { user } }) => {
	const team = await getTeam(params.id);

	if (!team) {
		throw error(404, 'Team not found');
	}

	// Get all player ratings for global ranking
	// TODO: Optimize further
	const allPlayerRatings = await db.query.playerStats.findMany({
		orderBy: (playerStats, { desc }) => [desc(playerStats.playerRating)]
	});
	const globalRankingByPlayerId = new Map(
		allPlayerRatings.map((rating, index) => [rating.playerId, index + 1])
	);

	// Process player avatar URLs
	const uniqueAvatarUrls = new Set<string>();
	for (const teamPlayer of team.players || []) {
		if (teamPlayer.player.avatar) {
			uniqueAvatarUrls.add(teamPlayer.player.avatar);
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

	// Transform match data to include team objects
	const transformedMatches = teamDetailedMatches.map((match) => ({
		...match,
		teams: match.teams.map((teamData) => ({
			team: {
				id: teamData.team || 'unknown',
				name: teamData.team,
				slug: teamData.team.toLowerCase(),
				abbr: teamData.team,
				region: null,
				logo: null,
				createdAt: null,
				updatedAt: null
			},
			score: teamData.score
		}))
	}));

	return {
		team: {
			...team,
			logoURL: team.logo ? await processImageURL(team.logo) : null,
			players: team.players?.map((teamPlayer) => ({
				...teamPlayer,
				avatarURL: teamPlayer.player.avatar
					? avatarUrlMap.get(teamPlayer.player.avatar) || null
					: null,
				globalRank: globalRankingByPlayerId.get(teamPlayer.player.id) ?? 0
			}))
		},
		teamMemberStatistics: await getTeamMemberStatistics(team),
		teamStatistics: await getTeamStatistics(team),
		teamMatches: transformedMatches,
		user
	};
};
