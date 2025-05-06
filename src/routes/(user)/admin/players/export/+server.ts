import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getPlayers } from '$lib/server/data/players';
import type { Player } from '$lib/data/players';

export const GET: RequestHandler = async () => {
	try {
		const players = await getPlayers();
		const playersObject = players.reduce(
			(acc, player) => {
				acc[player.id] = player;
				return acc;
			},
			{} as Record<string, Player>
		);

		return json(playersObject);
	} catch (e) {
		console.error('Error exporting players:', e);
		return json({ error: 'Failed to export players' }, { status: 500 });
	}
};
