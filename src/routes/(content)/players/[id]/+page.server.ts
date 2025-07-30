import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import {
	getPlayer,
	getPlayerTeams,
	getPlayerAgents,
	getServerPlayerAgents,
	getServerPlayerMapStats,
	getSocialPlatforms,
	getPlayerMatches,
	getPlayerWins,
	getPlayerEvents,
	calculatePlayerKD,
	getServerPlayerEvents,
	getServerPlayerMatches
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

	const playerEvents = await Promise.all(
		(await getServerPlayerEvents(playerID)).map(async (event) => ({
			...event,
			imageURL: await processImageURL(event.image)
		}))
	);
	const legacyPlayerEvents =
		getPlayerEvents(params.id) || getPlayerEvents(player.slug ?? player.name);

	const playerMatches = await getServerPlayerMatches(playerID);
	const legacyPlayerMatches =
		getPlayerMatches(params.id) || getPlayerMatches(player.slug ?? player.name);

	const playerAgents = await getServerPlayerAgents(playerID);
	const legacyPlayerAgents = getPlayerAgents(player);

	const playerMapStats = await getServerPlayerMapStats(playerID);

	return {
		player,
		playerTeams: await getPlayerTeams(params.id),
		playerEvents: [...playerEvents, ...legacyPlayerEvents],
		playerMatches: [...playerMatches, ...legacyPlayerMatches],
		playerWins: getPlayerWins(params.id) || getPlayerWins(player.slug ?? player.name),
		playerAgents: [...playerAgents, ...legacyPlayerAgents].reduce(
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
		),
		playerMapStats,
		playerKD: calculatePlayerKD(player),
		socialPlatforms: await getSocialPlatforms(),
		teams: new Map(teams.map((team) => [team.abbr ?? team.id ?? team.name ?? team.slug, team])), // TODO: remove this
		user
	};
};
