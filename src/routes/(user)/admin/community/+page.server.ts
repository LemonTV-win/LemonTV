import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import {
	getDiscordServers,
	createDiscordServer,
	updateDiscordServer,
	deleteDiscordServer,
	createTag,
	updateTag,
	deleteTag,
	addTagToServer,
	removeTagFromServer,
	getTags,
	getServerTags
} from '$lib/server/data/community';
import { randomUUID } from 'crypto';
import type { PageServerLoad, Actions } from './$types';
import type { DiscordServer, CommunityTag } from '$lib/server/db/schemas/about/community';

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

export const load: PageServerLoad = async ({ locals, url }) => {
	const user = locals.user;
	if (!user?.roles) {
		const fullUrl = url.pathname + url.search;
		throw redirect(302, `/login?redirect=${encodeURIComponent(fullUrl)}`);
	}

	const searchParams = url.searchParams;
	const action = searchParams.get('action');
	const id = searchParams.get('id');

	if (!['admin', 'editor'].some((role) => user.roles.includes(role))) {
		throw redirect(302, '/');
	}

	return {
		discordServers: await getDiscordServers(),
		tags: await getTags(),
		action,
		id
	};
};

export const actions: Actions = {
	create: async ({ request }) => {
		const formData = await request.formData();
		const title = formData.get('title') as string;
		const url = formData.get('url') as string;
		const icon = formData.get('icon') as string;
		const description = formData.get('description') as string;
		const additionalLinkText = formData.get('additionalLinkText') as string;
		const additionalLinkUrl = formData.get('additionalLinkUrl') as string;
		const tags = JSON.parse(formData.get('tags') as string) as string[];

		if (!title || !url || !icon || !description) {
			return fail(400, { error: 'Missing required fields' });
		}

		const server: DiscordServer = {
			id: randomUUID(),
			title,
			url,
			icon,
			description,
			additionalLinkText: additionalLinkText || null,
			additionalLinkUrl: additionalLinkUrl || null,
			createdAt: new Date(),
			updatedAt: new Date()
		};

		await createDiscordServer(server);

		for (const tagId of tags) {
			await addTagToServer(server.id, tagId);
		}

		return {
			success: true
		};
	},

	update: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		const title = formData.get('title') as string;
		const url = formData.get('url') as string;
		const icon = formData.get('icon') as string;
		const description = formData.get('description') as string;
		const additionalLinkText = formData.get('additionalLinkText') as string;
		const additionalLinkUrl = formData.get('additionalLinkUrl') as string;
		const tags = JSON.parse(formData.get('tags') as string) as string[];

		if (!id || !title || !url || !icon || !description) {
			return fail(400, { error: 'Missing required fields' });
		}

		const server: DiscordServer = {
			id,
			title,
			url,
			icon,
			description,
			additionalLinkText: additionalLinkText || null,
			additionalLinkUrl: additionalLinkUrl || null,
			createdAt: new Date(),
			updatedAt: new Date()
		};

		await updateDiscordServer(server);

		const previousTags = await getServerTags(server.id);
		for (const tag of previousTags) {
			await removeTagFromServer(server.id, tag.tag.id);
		}

		for (const tagId of tags) {
			await addTagToServer(server.id, tagId);
		}

		return {
			success: true
		};
	},

	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;

		if (!id) {
			return fail(400, { error: 'Missing server ID' });
		}

		const tags = await getServerTags(id);
		for (const tag of tags) {
			await removeTagFromServer(id, tag.tag.id);
		}

		await deleteDiscordServer(id);

		return {
			success: true
		};
	},

	tag: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		const category = formData.get('category') as string;
		const value = formData.get('value') as string;
		const name = formData.get('name') as string;

		if (!category || !value || !name) {
			return fail(400, { error: 'Missing required fields' });
		}

		const tag: CommunityTag = {
			id: id || randomUUID(),
			category,
			value,
			name,
			createdAt: new Date(),
			updatedAt: new Date()
		};

		if (id) {
			await updateTag(tag);
		} else {
			await createTag(tag);
		}

		return {
			success: true
		};
	},

	deleteTag: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;

		if (!id) {
			return fail(400, { error: 'Missing tag ID' });
		}

		await deleteTag(id);
		return {
			success: true
		};
	},

	addTagToServer: async ({ request }) => {
		const formData = await request.formData();
		const serverId = formData.get('serverId') as string;
		const tagId = formData.get('tagId') as string;

		if (!serverId || !tagId) {
			return fail(400, { error: 'Missing required fields' });
		}

		await addTagToServer(serverId, tagId);
		return {
			success: true
		};
	},

	removeTagFromServer: async ({ request }) => {
		const formData = await request.formData();
		const serverId = formData.get('serverId') as string;
		const tagId = formData.get('tagId') as string;

		if (!serverId || !tagId) {
			return fail(400, { error: 'Missing required fields' });
		}

		await removeTagFromServer(serverId, tagId);
		return {
			success: true
		};
	}
};
