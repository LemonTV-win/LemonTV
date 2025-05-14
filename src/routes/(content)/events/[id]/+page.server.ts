import type { PageServerLoad } from './$types';

import { getEvent } from '$lib/data';
import { getEvents as getServerEvents } from '$lib/server/data/events';
import { getTeams } from '$lib/server/data/teams';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	// Try to get event from local data first
	let event = getEvent(params.id);

	// If not found locally, try to get from database
	if (!event) {
		const serverEvents = await getServerEvents();
		const serverEvent = serverEvents.find((e) => e.id === params.id || e.slug === params.id);
		if (serverEvent) {
			event = serverEvent;
		}
	}

	if (!event) {
		throw error(404, 'Event not found');
	}

	const teams = await getTeams();
	const filteredTeams = teams.filter((t) =>
		event.participants.some(
			(p) => p.team === t.abbr || p.team === t.id || p.team === t.name || p.team === t.slug
		)
	);
	const teamMap = new Map(filteredTeams.map((t) => [t.abbr ?? t.id ?? t.name ?? t.slug, t]));
	return {
		event,
		teams: teamMap
	};
};
