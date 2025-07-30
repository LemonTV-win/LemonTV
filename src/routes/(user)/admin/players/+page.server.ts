import { fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import {
	createPlayer,
	updatePlayer,
	getPlayers,
	deletePlayer,
	getPlayersTeams
} from '$lib/server/data/players';
import type { Player } from '$lib/data/players';
import type { TCountryCode } from 'countries-list';
import type { User, UserRole } from '$lib/data/user';
import { social_platform } from '$lib/server/db/schemas/game/social';
import { db } from '$lib/server/db';
import { getUsers } from '$lib/server/data/users';

export const load: PageServerLoad = async ({ url }) => {
	const players = await getPlayers();
	const socialPlatforms = await db.select().from(social_platform);
	const playersTeams = await getPlayersTeams();
	const users = await getUsers();

	const action = url.searchParams.get('action');
	const id = url.searchParams.get('id');
	const searchQuery = url.searchParams.get('searchQuery');

	return {
		players: players.map((player) => ({
			...player,
			user: users.find((u) => u.id === player.user?.id)
		})),
		socialPlatforms,
		playersTeams,
		users,
		action,
		id,
		searchQuery
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
		const nationalities = JSON.parse(formData.get('nationalities') as string) as TCountryCode[];
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
					nationalities,
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
		const nationalities = JSON.parse(formData.get('nationalities') as string) as TCountryCode[];
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
					nationalities,
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
	},

	batchCreate: async ({ request, locals }) => {
		const result = checkPermissions(locals, ['admin', 'editor']);
		if (result.status === 'error') {
			return fail(result.statusCode, {
				error: result.error
			});
		}

		const formData = await request.formData();
		const playersJson = formData.get('players') as string;

		if (!playersJson) {
			return fail(400, {
				error: 'No players data provided'
			});
		}

		try {
			const players = JSON.parse(playersJson) as Array<{
				name: string;
				slug?: string;
				nationalities: TCountryCode[];
				aliases?: string[];
				gameAccounts?: Player['gameAccounts'];
				socialAccounts?: Player['socialAccounts'];
				user?: {
					id: string;
					username: string;
					email: string;
					roles: UserRole[];
				};
			}>;

			console.log('Batch create - received players:', players.length); // Debug log

			if (!Array.isArray(players)) {
				return fail(400, {
					error: 'Players data must be an array'
				});
			}

			const createdPlayers: string[] = [];
			const errors: string[] = [];
			const duplicates: string[] = [];
			const validationErrors: string[] = [];

			for (const playerData of players) {
				try {
					// Validation checks
					if (!playerData.name) {
						validationErrors.push(`Player missing name`);
						continue;
					}

					if (!playerData.nationalities || playerData.nationalities.length === 0) {
						validationErrors.push(`Player "${playerData.name}" missing nationalities`);
						continue;
					}

					const playerId = await createPlayer(
						{
							name: playerData.name,
							slug: playerData.slug || playerData.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
							nationalities: playerData.nationalities,
							aliases: playerData.aliases || [],
							gameAccounts: playerData.gameAccounts || [],
							socialAccounts: playerData.socialAccounts || [],
							user: playerData.user
								? ({
										id: playerData.user.id,
										username: playerData.user.username,
										email: playerData.user.email,
										roles: playerData.user.roles
									} as User)
								: undefined
						},
						result.userId
					);

					createdPlayers.push(playerId);
					console.log('Created player:', playerData.name, 'with ID:', playerId); // Debug log
				} catch (e) {
					const errorMessage = e instanceof Error ? e.message : String(e);
					console.log('Error creating player:', playerData.name, errorMessage); // Debug log

					// Check if it's a duplicate error
					if (
						errorMessage.includes('duplicate') ||
						errorMessage.includes('already exists') ||
						errorMessage.includes('SQLITE_CONSTRAINT')
					) {
						duplicates.push(`"${playerData.name}" (${errorMessage})`);
					} else {
						errors.push(`Failed to create player "${playerData.name}": ${errorMessage}`);
					}
				}
			}

			console.log('Batch create results:', {
				// Debug log
				createdCount: createdPlayers.length,
				duplicateCount: duplicates.length,
				validationErrorCount: validationErrors.length,
				errorCount: errors.length
			});

			// Build response message
			let message = '';
			if (createdPlayers.length > 0) {
				message += `Successfully created ${createdPlayers.length} players`;
			}

			if (duplicates.length > 0) {
				if (message) message += '. ';
				message += `Skipped ${duplicates.length} duplicate players`;
			}

			if (validationErrors.length > 0) {
				if (message) message += '. ';
				message += `Skipped ${validationErrors.length} players with validation errors`;
			}

			if (errors.length > 0) {
				if (message) message += '. ';
				message += `Failed to create ${errors.length} players due to errors`;
			}

			// If no players were created at all, return an error
			if (createdPlayers.length === 0 && duplicates.length === 0 && validationErrors.length === 0) {
				return fail(400, {
					error: `Failed to create any players. Errors: ${errors.join('; ')}`
				});
			}

			const response = {
				success: true,
				message,
				createdCount: createdPlayers.length,
				duplicateCount: duplicates.length,
				validationErrorCount: validationErrors.length,
				errorCount: errors.length,
				duplicates,
				validationErrors,
				errors
			};

			console.log('Returning response:', response); // Debug log
			return response;
		} catch (e) {
			console.error('Error batch creating players:', e);
			return fail(500, {
				error: 'Failed to batch create players: ' + (e instanceof Error ? e.message : String(e))
			});
		}
	}
};
