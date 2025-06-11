import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import {
	getDiscordServers,
	createDiscordServer,
	updateDiscordServer,
	deleteDiscordServer
} from '$lib/server/data/community';
import { randomUUID } from 'node:crypto';
import type { PageServerLoad } from './$types';

const serverSchema = z.object({
	id: z.string(),
	title: z.string().min(1),
	url: z.string().url(),
	icon: z.string().url(),
	description: z.string().min(1),
	additionalLinkText: z.string().nullable(),
	additionalLinkUrl: z.string().url().nullable(),
	createdAt: z.date(),
	updatedAt: z.date()
});

const createServerSchema = serverSchema.omit({ id: true, createdAt: true, updatedAt: true });
const updateServerSchema = serverSchema.omit({ updatedAt: true, createdAt: true });

export const load: PageServerLoad = async ({ locals, url }) => {
	const action = url.searchParams.get('action');
	const id = url.searchParams.get('id');

	return {
		discordServers: await getDiscordServers(),
		user: locals.user,
		action,
		id
	};
};

export const actions = {
	create: async ({ request }) => {
		const formData = await request.formData();
		const data = {
			title: formData.get('title'),
			url: formData.get('url'),
			icon: formData.get('icon'),
			description: formData.get('description'),
			additionalLinkText: formData.get('additionalLinkText') || null,
			additionalLinkUrl: formData.get('additionalLinkUrl') || null
		};

		const result = createServerSchema.safeParse(data);
		if (!result.success) {
			return fail(400, { error: 'Invalid data' });
		}

		try {
			const now = new Date();
			await createDiscordServer({
				...result.data,
				id: randomUUID(),
				createdAt: now,
				updatedAt: now
			});
			return { success: true };
		} catch (error) {
			return fail(500, { error: 'Failed to create Discord server' });
		}
	},

	update: async ({ request }) => {
		const formData = await request.formData();
		const data = {
			id: formData.get('id'),
			title: formData.get('title'),
			url: formData.get('url'),
			icon: formData.get('icon'),
			description: formData.get('description'),
			additionalLinkText: formData.get('additionalLinkText') || null,
			additionalLinkUrl: formData.get('additionalLinkUrl') || null
		};

		const result = updateServerSchema.safeParse(data);
		if (!result.success) {
			console.error('Validation error:', result.error);
			return fail(400, { error: 'Invalid data' });
		}

		try {
			// Get existing server data to preserve createdAt
			const servers = await getDiscordServers();
			const existingServer = servers.find((s) => s.id === result.data.id);
			if (!existingServer) {
				return fail(404, { error: 'Server not found' });
			}

			await updateDiscordServer({
				...result.data,
				createdAt: existingServer.createdAt,
				updatedAt: new Date()
			});
			return { success: true };
		} catch (error) {
			console.error('Update error:', error);
			return fail(500, { error: 'Failed to update Discord server' });
		}
	},

	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id');

		if (!id || typeof id !== 'string') {
			return fail(400, { error: 'Invalid ID' });
		}

		try {
			await deleteDiscordServer(id);
			return { success: true };
		} catch (error) {
			return fail(500, { error: 'Failed to delete Discord server' });
		}
	}
};
