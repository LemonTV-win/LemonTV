import { error, fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { db } from '$lib/server/db';
import { player } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

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
			await db.insert(player).values({
				id,
				name,
				nationality: nationality || null,
				slug: id.toLowerCase().replace(/[^a-z0-9]/g, '-')
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
			await db
				.update(player)
				.set({
					name,
					nationality: nationality || null,
					slug: id.toLowerCase().replace(/[^a-z0-9]/g, '-')
				})
				.where(eq(player.id, id));

			return {
				success: true
			};
		} catch (e) {
			console.error('Error updating player:', e);
			return fail(500, {
				error: 'Failed to update player'
			});
		}
	}
} satisfies Actions;
