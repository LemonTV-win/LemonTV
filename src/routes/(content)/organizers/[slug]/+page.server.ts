import { getOrganizer } from '$lib/server/data/organizers';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { events } from '$lib/data/events';
import { getEvents as getServerEvents } from '$lib/server/data/events';

export const load: PageServerLoad = async ({ params }) => {
	const organizer = await getOrganizer(params.slug);

	if (!organizer) {
		throw error(404, 'Organizer not found');
	}

	const organizedEvents = events
		.filter((event) => event.organizers.some((org) => org.name === organizer.name))
		.concat(await getServerEvents({ organizerIds: [organizer.id] }));

	return {
		organizer,
		events: organizedEvents
	};
};
