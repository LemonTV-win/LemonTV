import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { teams, teamPlayer, teamAlias } from '$lib/server/db/schemas/game/teams';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user?.roles.includes('admin')) {
		return json({ error: 'Insufficient permissions' }, { status: 403 });
	}

	try {
		const teamsList = await db.select().from(teams);
		const teamPlayers = await db.select().from(teamPlayer);
		const teamAliases = await db.select().from(teamAlias);

		// Convert to a format similar to the import format
		const teamsData = teamsList.reduce(
			(acc, team) => {
				acc[team.id] = {
					...team,
					aliases: teamAliases.filter((ta) => ta.teamId === team.id).map((ta) => ta.alias),
					players: teamPlayers
						.filter((tp) => tp.teamId === team.id)
						.map((tp) => ({
							playerId: tp.playerId,
							role: tp.role,
							startedOn: tp.startedOn,
							endedOn: tp.endedOn,
							note: tp.note
						}))
				};
				return acc;
			},
			{} as Record<string, any>
		);

		return json(teamsData);
	} catch (e) {
		console.error('Error exporting teams:', e);
		return json({ error: 'Failed to export teams' }, { status: 500 });
	}
};
