import type { PageServerLoad } from './$types';
import type {
	LegacyEventResult,
	Event,
	EventResult,
	EventParticipant,
	LegacyEventParticipant
} from '$lib/data/events';

import { getEvent } from '$lib/data';
import { getEvent as getServerEvent } from '$lib/server/data/events';
import { getTeams } from '$lib/server/data/teams';
import { error } from '@sveltejs/kit';
import type { Team } from '$lib/data/teams';

export const load: PageServerLoad = async ({ params }) => {
	let event: Event | undefined = getEvent(params.id) || (await getServerEvent(params.id));

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
	const teamMap = new Map(filteredTeams.map((t) => [t.abbr ?? t.id, t]));

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
	const typedEvent: Omit<Event, 'results'> & {
		results?: (Omit<EventResult, 'team'> & { team: Team & { logoURL: string | null } })[];
		participants:
			| LegacyEventParticipant[]
			| (Omit<EventParticipant, 'team'> & { team: Team & { logoURL: string | null } })[];
	} = {
		...event,
		results: event.results as
			| (Omit<EventResult, 'team'> & { team: Team & { logoURL: string | null } })[]
			| undefined,
		participants: event.participants as
			| LegacyEventParticipant[]
			| (Omit<EventParticipant, 'team'> & { team: Team & { logoURL: string | null } })[]
	};

	return {
		event: typedEvent,
		teams: teamMap
	};
};
