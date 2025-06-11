import type { PageServerLoad } from './$types';
import { getDiscordServers, getTags } from '$lib/server/data/community';

export const load: PageServerLoad = async ({ locals }) => {
	return {
		discordServers: await getDiscordServers(),
		tags: await getTags(),
		user: locals.user
	};
};
