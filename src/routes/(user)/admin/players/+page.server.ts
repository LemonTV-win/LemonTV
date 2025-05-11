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

type PermissionResult =
	| { status: 'success'; userId: string }
	| { status: 'error'; error: string; statusCode: 401 | 403 };

function checkPermissions(locals: App.Locals, requiredRoles: string[]): PermissionResult {
	if (!locals.user?.id) {
		console.error('[Admin][Players] Unauthorized: user is not authenticated');
		return { status: 'error', error: 'Unauthorized', statusCode: 401 };
	}

	if (!requiredRoles.some((role) => locals.user?.roles.includes(role))) {
		console.error(
			`[Admin][Players] Forbidden: user "${locals.user.username}" (${locals.user.id}) lacks required roles (${requiredRoles.join(', ')}). Current roles: ${locals.user.roles.join(', ')}`
		);
		return { status: 'error', error: 'Insufficient permissions', statusCode: 403 };
	}

	return { status: 'success', userId: locals.user.id };
}

export const actions = {
	create: async ({ request, locals }) => {
		const result = checkPermissions(locals, ['admin', 'editor']);
		if (result.status === 'error') {
			return fail(result.statusCode, {
				error: result.error
			});
		}

		const formData = await request.formData();

		const slug = formData.get('slug') as string;
		const name = formData.get('name') as string;
		const userId = (formData.get('userId') || null) as string | null;
		const nationality = (formData.get('nationality') || null) as TCountryCode | null;
		const aliases = JSON.parse(formData.get('aliases') as string) as string[];
		const gameAccounts = JSON.parse(
			formData.get('gameAccounts') as string
		) as Player['gameAccounts'];
		const socialAccounts = JSON.parse(
			formData.get('socialAccounts') as string
		) as Player['socialAccounts'];

		if (!name || !slug) {
			return fail(400, {
				error: 'Name and slug are required'
			});
		}

		try {
			await createPlayer(
				{
					slug,
					name,
					nationality: nationality ?? undefined,
					aliases,
					gameAccounts,
					socialAccounts,
					user: userId ? { id: userId, email: '', username: '', roles: [] } : undefined
				},
				result.userId
			);

			return {
				success: true
			};
		} catch (e) {
			console.error(
				'[Admin][Players][Create] Failed to create player:',
				e instanceof Error ? e.message : String(e)
			);

			if (e instanceof Error && 'code' in e && e.code === 'SQLITE_CONSTRAINT') {
				const errorMessage = e instanceof Error ? e.message : String(e);
				let userMessage = 'Operation failed due to a duplicate entry.';

				if (errorMessage.includes('player.slug')) {
					userMessage = 'A player with the same `slug` already exists.';
				} else if (errorMessage.includes('player.user_id')) {
					userMessage = 'This user is already linked to another player.';
				} else if (errorMessage.includes('player_social_account')) {
					userMessage = 'This social account is already linked to another player.';
				}

				return fail(409, {
					error: userMessage
				});
			} else {
				return fail(500, {
					error: 'Failed to create player: ' + (e instanceof Error ? e.message : String(e))
				});
			}
		}
	},

	update: async ({ request, locals }) => {
		const result = checkPermissions(locals, ['admin', 'editor']);
		if (result.status === 'error') {
			return fail(result.statusCode, {
				error: result.error
			});
		}

		const formData = await request.formData();

		const id = formData.get('id') as string;
		const slug = formData.get('slug') as string;
		const name = formData.get('name') as string;
		const userId = (formData.get('userId') || null) as string | null;
		const nationality = (formData.get('nationality') || null) as TCountryCode | null;
		const aliases = JSON.parse(formData.get('aliases') as string) as string[];
		const gameAccounts = JSON.parse(
			formData.get('gameAccounts') as string
		) as Player['gameAccounts'];
		const socialAccounts = JSON.parse(
			formData.get('socialAccounts') as string
		) as Player['socialAccounts'];

		if (!id || !name || !slug) {
			return fail(400, {
				error: 'ID, name and slug are required'
			});
		}

		try {
			await updatePlayer(
				{
					id,
					slug,
					name,
					nationality: nationality ?? undefined,
					aliases,
					gameAccounts,
					socialAccounts,
					user: userId ? { id: userId, email: '', username: '', roles: [] } : undefined
				},
				result.userId
			);

			return {
				success: true
			};
		} catch (e: unknown) {
			console.error('[Admin][Players][Update] Failed to update player:', e);

			if (e instanceof Error && 'code' in e && e.code === 'SQLITE_CONSTRAINT') {
				const errorMessage = e instanceof Error ? e.message : String(e);
				let userMessage = 'Operation failed due to a duplicate entry.';

				if (errorMessage.includes('player.slug')) {
					userMessage = 'A player with the same `slug` already exists.';
				} else if (errorMessage.includes('player.user_id')) {
					userMessage = 'This user is already linked to another player.';
				} else if (errorMessage.includes('player_social_account')) {
					userMessage = 'This social account is already linked to another player.';
				}

				return fail(409, {
					error: userMessage
				});
			} else {
				return fail(500, {
					error: 'Failed to update player: ' + (e instanceof Error ? e.message : String(e))
				});
			}
		}
	},

	import: async ({ request, locals }) => {
		const result = checkPermissions(locals, ['admin']);
		if (result.status === 'error') {
			return fail(result.statusCode, {
				error: result.error
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
		const result = checkPermissions(locals, ['admin', 'editor']);
		if (result.status === 'error') {
			return fail(result.statusCode, {
				error: result.error
			});
		}

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
