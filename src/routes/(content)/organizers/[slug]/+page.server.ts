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

	const legacyEvents = events.filter((event) =>
		event.organizers.some((org) => org.name === organizer.name)
	);
	console.log(
		`[Content][Organizer][${organizer.name}] Found ${legacyEvents.length} legacy events`,
		legacyEvents.map((e) => ({ id: e.id, name: e.name }))
	);

	console.log(`[Content][Organizer][${organizer.name}] Organizer ID: ${organizer.id}`);
	const serverEvents = await getServerEvents({ organizerIds: [organizer.id] });
	console.log(
		`[Content][Organizer][${organizer.name}] Found ${serverEvents.length} server events`,
		serverEvents.map((e) => ({
			id: e.id,
			name: e.name,
			organizers: e.organizers.map((o) => o.name)
		}))
	);

	const organizedEvents = [...legacyEvents, ...serverEvents];

	return {
		organizer,
		events: organizedEvents
	};
};
