import { fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createPlayer, updatePlayer, getPlayers, deletePlayer } from '$lib/server/data/players';
import type { Region } from '$lib/data/game';
import type { Player } from '$lib/data/players';

export const load: PageServerLoad = async () => {
	const players = await getPlayers();

	return {
		players
	};
};

export const actions = {
	create: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		const name = formData.get('name') as string;
		const nationality = formData.get('nationality') as string | null;
		const aliases = JSON.parse(formData.get('aliases') as string) as string[];
		const gameAccounts = JSON.parse(formData.get('gameAccounts') as string) as {
			accountId: number;
			currentName: string;
			region?: string;
		}[];

		if (!id || !name) {
			return fail(400, {
				error: 'ID and name are required'
			});
		}

		try {
			await createPlayer({
				name,
				nationality: nationality as any,
				aliases,
				gameAccounts: gameAccounts.map((acc) => ({
					...acc,
					region: acc.region as Region | undefined
				}))
			});

			return {
				success: true
			};
		} catch (e) {
			console.error('Error creating player:', e);
			return fail(500, {
				error: 'Failed to create player'
			});
		}
	},

	update: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		const name = formData.get('name') as string;
		const nationality = formData.get('nationality') as string | null;
		const aliases = JSON.parse(formData.get('aliases') as string) as string[];
		const gameAccounts = JSON.parse(formData.get('gameAccounts') as string) as {
			accountId: number;
			currentName: string;
			region?: string;
		}[];

		if (!id || !name) {
			return fail(400, {
				error: 'ID and name are required'
			});
		}

		try {
			await updatePlayer({
				id,
				name,
				nationality: nationality as any,
				aliases,
				gameAccounts: gameAccounts.map((acc) => ({
					...acc,
					region: acc.region as Region | undefined
				}))
			});

			return {
				success: true
			};
		} catch (e) {
			console.error('Error updating player:', e);
			return fail(500, {
				error: 'Failed to update player'
			});
		}
	},

	import: async ({ request }) => {
		const formData = await request.formData();
		const file = formData.get('file') as File;

		if (!file) {
			return fail(400, {
				error: 'No file provided'
			});
		}

		try {
			const text = await file.text();
			const players = JSON.parse(text) as Record<string, Player>;

			// Delete all existing players first
			const existingPlayers = await getPlayers();
			for (const player of existingPlayers) {
				await deletePlayer(player.id);
			}

			// Import new players
			for (const [id, playerData] of Object.entries(players)) {
				await createPlayer({
					name: playerData.name,
					nationality: playerData.nationality,
					aliases: playerData.aliases || [],
					gameAccounts: playerData.gameAccounts,
					slug: playerData.slug
				});
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
	}
};
