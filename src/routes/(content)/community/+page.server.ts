import type { PageServerLoad } from './$types';
import { getDiscordServers } from '$lib/server/data/community';

export const load: PageServerLoad = async ({ locals }) => {
	return {
		discordServers: await getDiscordServers(),
		user: locals.user
	};
};
