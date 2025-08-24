import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import {
	getPlayer,
	getServerPlayerStats,
	getSocialPlatforms,
	getServerPlayerDetailedMatches
} from '$lib/server/data/players';
import { processImageURL } from '$lib/server/storage';
import { db } from '$lib/server/db';
import type { Character } from '$lib/data/game';

export const load: PageServerLoad = async ({ params, locals: { user } }) => {
	const player = await getPlayer(params.id);
	if (!player) {
		throw error(404, 'Player not found');
	}

	const playerID = player.id;

	// Process player avatar URL
	let playerAvatarURL: string | null = null;
	if (player.avatar) {
		playerAvatarURL = await processImageURL(player.avatar);
	}

	// Get unified server stats
	const serverStats = await getServerPlayerStats(playerID);

	// Get simplified latest pro settings
	const proSettings = await db.query.mouseSettings.findFirst({
		where: (t, { eq }) => eq(t.playerId, playerID)
	});

	// Get detailed match data for the player

	const playerDetailedMatches = await getServerPlayerDetailedMatches(playerID);
	// Transform match data to include team objects
	const transformedMatches = playerDetailedMatches.map((match) => ({
		...match,
		teams: match.teams.map((teamData) => ({
			team: {
				id: teamData.teamId || teamData.team,
				name: teamData.team,
				slug: teamData.teamId || teamData.team,
				abbr: teamData.team,
				region: null,
				logo: null,
				createdAt: null,
				updatedAt: null
			},
			score: teamData.score
		}))
	}));

	console.log(`[players/[id]] playerDetailedMatches`, playerDetailedMatches);

	// Create a teams Map using team names/abbreviations as keys
	// This is what the MatchCard component expects
	const teamsMap = new Map<string, any>();
	for (const match of playerDetailedMatches) {
		for (const team of match.teams) {
			if (team.team && team.team !== 'Unknown Team' && !teamsMap.has(team.team)) {
				// Create a minimal team object with just the name
				teamsMap.set(team.team, {
					id: team.teamId || team.team,
					name: team.team,
					slug: team.teamId || team.team,
					abbr: team.team
				});
			}
		}
	}

	// Process server events with image URLs
	// Collect unique image URLs
	const uniqueImageUrls = new Set<string>();
	for (const event of serverStats.events) {
		if (event.image) {
			uniqueImageUrls.add(event.image);
		}
	}

	// Process all image URLs in parallel
	const imageUrlMap = new Map<string, string>();
	await Promise.all(
		Array.from(uniqueImageUrls).map(async (url) => {
			const processed = await processImageURL(url);
			imageUrlMap.set(url, processed);
		})
	);

	// Apply processed URLs to server events
	const serverEvents = serverStats.events.map((event) => ({
		...event,
		imageURL: event.image ? imageUrlMap.get(event.image) || event.image : event.image
	}));

	const playerAgents = serverStats.agents.reduce(
		(acc, [character, count]) => {
			const existing = acc.find(([c]) => c === character);
			if (existing) {
				existing[1] += count;
			} else {
				acc.push([character, count]);
			}
			return acc;
		},
		[] as [Character, number][]
	);

	return {
		player: {
			...player,
			avatarURL: playerAvatarURL
		},
		proSettings,
		playerEvents: serverEvents,
		playerMatches: transformedMatches,
		playerWins: serverStats.wins,
		playerKD: serverStats.kd,
		// Additional stats
		playerStats: {
			wins: serverStats.wins,
			losses: serverStats.losses,
			totalGames: serverStats.totalGames,
			winRate: serverStats.winRate,
			kd: serverStats.kd,
			totalKills: serverStats.totalKills,
			totalDeaths: serverStats.totalDeaths,
			totalAssists: serverStats.totalAssists,
			totalDamage: serverStats.totalDamage,
			averageScore: serverStats.averageScore
		},
		playerAgents,
		playerMapStats: serverStats.mapStats,
		socialPlatforms: await getSocialPlatforms(),
		teams: teamsMap,
		user
	};
};
