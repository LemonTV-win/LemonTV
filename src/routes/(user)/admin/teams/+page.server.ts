import { fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { createTeam, updateTeam, deleteTeam } from '$lib/server/data/teams';
import type { Region } from '$lib/data/game';
import { processImageURL } from '$lib/server/storage';
// import { importTeams } from '$lib/server/data/teams';

export const load: PageServerLoad = async ({ url }) => {
	const teamsList = await db.select().from(table.team);
	const teamPlayers = await db.select().from(table.teamPlayer);
	const teamAliases = await db.select().from(table.teamAlias);
	const players = await db.select().from(table.player);

	const action = url.searchParams.get('action');
	const id = url.searchParams.get('id');

	return {
		teams: await Promise.all(
			teamsList.map(async (team) => ({
				...team,
				logoURL: team.logo ? await processImageURL(team.logo) : null
			}))
		),
		teamPlayers,
		teamAliases,
		players,
		action,
		id
	};
};

export const actions = {
	create: async ({ request, locals }) => {
		const formData = await request.formData();
		const name = formData.get('name') as string;
		const logo = formData.get('logo') as string | null;
		const region = formData.get('region') as string | null;
		const slug = formData.get('slug') as string | null;
		const abbr = formData.get('abbr') as string | null;
		const aliases = JSON.parse(formData.get('aliases') as string) as string[];
		const players = JSON.parse(formData.get('players') as string) as {
			playerId: string;
			role: string;
			startedOn?: string;
			endedOn?: string;
			note?: string;
		}[];

		if (!name) {
			return fail(400, {
				error: 'Name is required'
			});
		}

		if (!locals.user?.id) {
			return fail(401, {
				error: 'Unauthorized'
			});
		}

		try {
			await createTeam(
				{
					name,
					logo: logo || undefined,
					region: region as Region | undefined,
					slug: slug || undefined,
					abbr: abbr || undefined,
					aliases,
					players
				},
				locals.user.id
			);

			return {
				success: true
			};
		} catch (e) {
			console.error('Error creating team:', e);
			return fail(500, {
				error: 'Failed to create team'
			});
		}
	},

	update: async ({ request, locals }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		const name = formData.get('name') as string;
		const logo = formData.get('logo') as string | null;
		const region = formData.get('region') as string | null;
		const slug = formData.get('slug') as string | null;
		const abbr = formData.get('abbr') as string | null;
		const aliases = JSON.parse(formData.get('aliases') as string) as string[];
		const players = JSON.parse(formData.get('players') as string) as {
			playerId: string;
			role: string;
			startedOn?: string;
			endedOn?: string;
			note?: string;
		}[];

		if (!id || !name) {
			return fail(400, {
				error: 'ID and name are required'
			});
		}

		if (!locals.user?.id) {
			return fail(401, {
				error: 'Unauthorized'
			});
		}

		try {
			await updateTeam(
				{
					id,
					name,
					logo: logo || undefined,
					region: region as Region | undefined,
					slug: slug || undefined,
					abbr: abbr || undefined,
					aliases,
					players
				},
				locals.user.id
			);

			return {
				success: true
			};
		} catch (e) {
			console.error('Error updating team:', e);
			return fail(500, {
				error: 'Failed to update team'
			});
		}
	},

	delete: async ({ request, locals }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;

		if (!id) {
			return fail(400, {
				error: 'ID is required'
			});
		}

		if (!locals.user?.id) {
			return fail(401, {
				error: 'Unauthorized'
			});
		}

		try {
			await deleteTeam(id, locals.user.id);
			return {
				success: true
			};
		} catch (e) {
			console.error('Error deleting team:', e);
			return fail(500, {
				error: 'Failed to delete team'
			});
		}
	}
};
