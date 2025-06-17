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

	// Get all team abbreviations that appear in the event's matches
	const matchTeamAbbrs = new Set<string>();
	event.stages?.forEach((stage) => {
		stage.matches?.forEach((match) => {
			match.teams.forEach((team) => {
				if (team.team) {
					matchTeamAbbrs.add(team.team);
				}
			});
		});
	});

	// Filter teams to include those that appear in matches or participants
	const filteredTeams = teams.filter(
		(t) =>
			event &&
			(matchTeamAbbrs.has(t.abbr || '') ||
				event.participants.some(
					(p) => p.team === t.abbr || p.team === t.id || p.team === t.name || p.team === t.slug
				))
	);

	// Create team map with multiple keys for each team (abbr, id, name, slug)
	const teamMap = new Map<string, Team & { logoURL: string | null }>();
	filteredTeams.forEach((team) => {
		// Add team with abbreviation as key
		if (team.abbr) {
			teamMap.set(team.abbr, team);
		}
		// Add team with ID as key
		teamMap.set(team.id, team);
		// Add team with name as key
		teamMap.set(team.name, team);
		// Add team with slug as key
		teamMap.set(team.slug, team);
	});

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
