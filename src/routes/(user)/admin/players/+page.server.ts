import { fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import {
	createPlayer,
	updatePlayer,
	getPlayers,
	deletePlayer,
	getPlayersTeams
} from '$lib/server/data/players';
import type { Region } from '$lib/data/game';
import type { Player } from '$lib/data/players';
import type { TCountryCode } from 'countries-list';
import { social_platform, player_social_account } from '$lib/server/db/schemas/game/social';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schemas/auth';
import { getUsers } from '$lib/server/data/users';

export const load: PageServerLoad = async ({ url }) => {
	const players = await getPlayers();
	const socialPlatforms = await db.select().from(social_platform);
	const playersTeams = await getPlayersTeams();
	const users = await getUsers();

	const action = url.searchParams.get('action');
	const id = url.searchParams.get('id');

	return {
		players: players.map((player) => ({
			...player,
			user: users.find((u) => u.id === player.user?.id)
		})),
		socialPlatforms,
		playersTeams,
		users,
		action,
		id
	};
};

export const actions = {
	create: async ({ request, locals }) => {
		if (!locals.user?.roles.includes('admin')) {
			return fail(403, {
				error: 'Insufficient permissions'
			});
		}

		const formData = await request.formData();
		const name = formData.get('name') as string;
		const nationality = formData.get('nationality') as TCountryCode | null;
		const aliases = JSON.parse(formData.get('aliases') as string) as string[];
		const gameAccounts = JSON.parse(
			formData.get('gameAccounts') as string
		) as Player['gameAccounts'];
		const socialAccounts = JSON.parse(
			formData.get('socialAccounts') as string
		) as Player['socialAccounts'];
		const slug = formData.get('slug') as string;
		const userId = formData.get('user') as string | null;

		if (!name || !slug) {
			return fail(400, {
				error: 'Name and slug are required'
			});
		}

		if (!locals.user?.id) {
			return fail(401, {
				error: 'Unauthorized'
			});
		}

		try {
			await createPlayer(
				{
					name,
					nationality: nationality || undefined,
					aliases,
					gameAccounts,
					socialAccounts,
					slug,
					user: userId ? { id: userId, email: '', username: '', roles: [] } : undefined
				},
				locals.user.id
			);

			return {
				success: true
			};
		} catch (e) {
			console.error('Error creating player:', e);
			return fail(500, {
				error: 'Failed to create player: ' + (e instanceof Error ? e.message : String(e))
			});
		}
	},

	update: async ({ request, locals }) => {
		if (!locals.user?.roles.includes('admin')) {
			return fail(403, {
				error: 'Insufficient permissions'
			});
		}

		const formData = await request.formData();
		const id = formData.get('id') as string;
		const name = formData.get('name') as string;
		const nationality = formData.get('nationality') as TCountryCode | null;
		const aliases = JSON.parse(formData.get('aliases') as string) as string[];
		const gameAccounts = JSON.parse(
			formData.get('gameAccounts') as string
		) as Player['gameAccounts'];
		const socialAccounts = JSON.parse(
			formData.get('socialAccounts') as string
		) as Player['socialAccounts'];
		const slug = formData.get('slug') as string;
		const userId = formData.get('user') as string | null;

		if (!id || !name || !slug) {
			return fail(400, {
				error: 'ID, name and slug are required'
			});
		}

		if (!locals.user?.id) {
			return fail(401, {
				error: 'Unauthorized'
			});
		}

		try {
			await updatePlayer(
				{
					id,
					name,
					nationality: nationality || undefined,
					aliases,
					gameAccounts,
					socialAccounts,
					slug,
					user: userId ? { id: userId, email: '', username: '', roles: [] } : undefined
				},
				locals.user.id
			);

			return {
				success: true
			};
		} catch (e) {
			console.error('Error updating player:', e);
			return fail(500, {
				error: 'Failed to update player: ' + (e instanceof Error ? e.message : String(e))
			});
		}
	},

	import: async ({ request, locals }) => {
		if (!locals.user?.roles.includes('admin')) {
			return fail(403, {
				error: 'Insufficient permissions'
			});
		}

		const formData = await request.formData();
		const file = formData.get('file') as File;

		if (!file) {
			return fail(400, {
				error: 'No file provided'
			});
		}

		if (!locals.user?.id) {
			return fail(401, {
				error: 'Unauthorized'
			});
		}

		try {
			const text = await file.text();
			const players = JSON.parse(text) as Record<string, Player>;

			// Delete all existing players first
			const existingPlayers = await getPlayers();
			for (const player of existingPlayers) {
				await deletePlayer(player.id, locals.user.id);
			}

			// Import new players
			for (const [id, playerData] of Object.entries(players)) {
				await createPlayer(
					{
						name: playerData.name,
						nationality: playerData.nationality,
						aliases: playerData.aliases || [],
						gameAccounts: playerData.gameAccounts,
						slug: playerData.slug
					},
					locals.user.id
				);
			}

			return {
				success: true,
				message: `Successfully imported ${Object.keys(players).length} players`
			};
		} catch (e) {
			console.error('Error importing players:', e);
			return fail(500, {
				error: 'Failed to import players: ' + (e instanceof Error ? e.message : String(e))
			});
		}
	},

	delete: async ({ request, locals }) => {
		let id: string;

		// Check content type to handle both form data and JSON
		const contentType = request.headers.get('content-type') || '';
		if (contentType.includes('application/json')) {
			const data = await request.json();
			id = data.id;
		} else {
			const formData = await request.formData();
			id = formData.get('id') as string;
		}

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
			await deletePlayer(id, locals.user.id);
			return {
				success: true
			};
		} catch (e) {
			console.error('Error deleting player:', e);
			return fail(500, {
				error: 'Failed to delete player'
			});
		}
	}
};
