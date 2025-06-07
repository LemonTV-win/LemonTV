import type { PageServerLoad } from './$types';
import type { LegacyEventResult, Event, EventResult } from '$lib/data/events';

import { getEvent } from '$lib/data';
import { getEvents as getServerEvents } from '$lib/server/data/events';
import { getTeams } from '$lib/server/data/teams';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	// Try to get event from local data first
	let event: Event | undefined = getEvent(params.id);

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
	const filteredTeams = teams.filter(
		(t) =>
			event &&
			event.participants.some(
				(p) => p.team === t.abbr || p.team === t.id || p.team === t.name || p.team === t.slug
			)
	);
	const teamMap = new Map(filteredTeams.map((t) => [t.abbr ?? t.id ?? t.name ?? t.slug, t]));

	// Convert legacy results to new format if needed
	if (event.results && typeof (event.results[0] as LegacyEventResult)?.team === 'string') {
		const convertedResults: EventResult[] = (event.results as LegacyEventResult[]).map(
			(result) => ({
				...result,
				team: teamMap.get(result.team) ?? {
					id: result.team,
					name: result.team,
					slug: result.team.toLowerCase(),
					abbr: result.team,
					region: null,
					logo: null,
					createdAt: null,
					updatedAt: null
				}
			})
		);
		event = {
			...event,
			results: convertedResults
		};
	}

	// Ensure event has the correct type by creating a new object with only the new format
	const typedEvent: Omit<Event, 'results'> & { results?: EventResult[] } = {
		...event,
		results: event.results as EventResult[] | undefined
	};

	return {
		event: typedEvent,
		teams: teamMap
	};
};
