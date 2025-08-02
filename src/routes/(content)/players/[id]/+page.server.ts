import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import {
	getPlayer,
	getPlayerTeams,
	getPlayerAgents,
	getServerPlayerStats,
	getSocialPlatforms,
	getPlayerMatches,
	getPlayerWins,
	getPlayerEvents,
	getServerPlayerKD
} from '$lib/server/data/players';
import { getTeams } from '$lib/server/data/teams';
import { processImageURL } from '$lib/server/storage';
import type { Character } from '$lib/data/game';

export const load: PageServerLoad = async ({ params, locals: { user } }) => {
	const player = await getPlayer(params.id);
	if (!player) {
		throw error(404, 'Player not found');
	}

	const teams = await getTeams();
	const playerID = player.id;

	// Get unified server stats
	const serverStats = await getServerPlayerStats(playerID);

	// Get legacy data for fallback
	const legacyPlayerEvents =
		getPlayerEvents(params.id) || getPlayerEvents(player.slug ?? player.name);
	const legacyPlayerMatches =
		getPlayerMatches(params.id) || getPlayerMatches(player.slug ?? player.name);
	const legacyPlayerAgents = getPlayerAgents(player);
	const legacyPlayerWins = getPlayerWins(params.id) || getPlayerWins(player.slug ?? player.name);
	const serverPlayerKD = await getServerPlayerKD(playerID);

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

	// Merge server and legacy data
	const playerEvents = [...serverEvents, ...legacyPlayerEvents];
	const playerMatches = [...serverStats.matches, ...legacyPlayerMatches];
	const playerAgents = [...serverStats.agents, ...legacyPlayerAgents].reduce(
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

	// Use server stats with fallback to legacy
	const playerWins = serverStats.wins > 0 ? serverStats.wins : legacyPlayerWins;
	const playerKD = serverStats.kd > 0 ? serverStats.kd : serverPlayerKD;

	return {
		player,
		playerTeams: await getPlayerTeams(params.id),
		playerEvents,
		playerMatches,
		playerWins,
		playerKD,
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
		teams: new Map(teams.map((team) => [team.abbr ?? team.id ?? team.name ?? team.slug, team])), // TODO: remove this
		user
	};
};
