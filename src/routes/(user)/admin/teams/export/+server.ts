import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { team, teamPlayer, teamAlias } from '$lib/server/db/schemas/game/team';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user?.roles.includes('admin')) {
		return json({ error: 'Insufficient permissions' }, { status: 403 });
	}

	try {
		const teamsList = await db.select().from(team);
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
			{} as Record<
				string,
				{
					id: string;
					name: string;
					createdAt: string | null;
					updatedAt: string | null;
					aliases: string[];
					players: {
						playerId: string;
						role: string | null;
						startedOn: string | null;
						endedOn: string | null;
						note: string | null;
					}[];
				}
			>
		);

		return json(teamsData);
	} catch (e) {
		console.error('Error exporting teams:', e);
		return json({ error: 'Failed to export teams' }, { status: 500 });
	}
};
