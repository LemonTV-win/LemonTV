import type { Event as AppEvent } from '$lib/data/events';
import type { Event, EventOrganizer } from '$lib/server/db/schemas/game/event';
import type { Organizer } from '$lib/server/db/schemas/game/organizer';
import { db } from '../db';
import * as table from '$lib/server/db/schema';
import { processImageURL } from '$lib/server/storage';
import type { Region } from '$lib/data/game';
import { inArray, eq } from 'drizzle-orm';
import { convertOrganizer } from './organizers';

// Types for the application layer
export interface EventWithOrganizers extends Event {
	organizers: Organizer[];
}

export interface CreateEventData {
	name: string;
	slug: string;
	official: boolean;
	server: string;
	format: string;
	region: string;
	image: string;
	status: string;
	capacity: number;
	date: string;
	organizerIds: string[];
}

export interface UpdateEventData extends Partial<CreateEventData> {
	id: string;
}

// Types for event team player management
export interface EventTeamPlayerData {
	eventId: string;
	teamId: string;
	playerId: string;
	role: 'main' | 'sub' | 'coach';
}

export interface UpdateEventTeamPlayerData extends EventTeamPlayerData {
	id?: string;
}

// Convert database event to application event with organizers
export function toEventWithOrganizers(
	event: Event,
	eventOrganizers: EventOrganizer[],
	organizers: Organizer[]
): EventWithOrganizers {
	const eventOrganizerIds = eventOrganizers
		.filter((eo) => eo.eventId === event.id)
		.map((eo) => eo.organizerId);

	return {
		...event,
		organizers: organizers.filter((o) => eventOrganizerIds.includes(o.id))
	};
}

// Convert application event data to database event data
export function toDatabaseEvent(
	data: CreateEventData
): Omit<Event, 'id' | 'createdAt' | 'updatedAt'> {
	return {
		name: data.name,
		slug: data.slug,
		official: data.official,
		server: data.server,
		format: data.format,
		region: data.region,
		image: data.image,
		status: data.status,
		capacity: data.capacity,
		date: data.date
	};
}

// Convert application event data to database event organizer data
export function toDatabaseEventOrganizers(
	eventId: string,
	organizerIds: string[]
): Omit<EventOrganizer, 'createdAt' | 'updatedAt'>[] {
	return organizerIds.map((organizerId) => ({
		eventId,
		organizerId
	}));
}

// Get changes between old and new event data
export function getEventChanges(
	oldEvent: Event,
	newData: UpdateEventData
): Record<string, { from: any; to: any }> {
	const changes: Record<string, { from: any; to: any }> = {};

	Object.entries(newData).forEach(([key, value]) => {
		if (
			key !== 'id' &&
			key !== 'organizerIds' &&
			JSON.stringify(oldEvent[key as keyof Event]) !== JSON.stringify(value)
		) {
			changes[key] = {
				from: oldEvent[key as keyof Event],
				to: value
			};
		}
	});

	return changes;
}

// Get organizer changes between old and new event data
export function getOrganizerChanges(
	currentOrganizerIds: string[],
	newOrganizerIds: string[]
): { toAdd: string[]; toRemove: string[] } {
	return {
		toAdd: newOrganizerIds.filter((id) => !currentOrganizerIds.includes(id)),
		toRemove: currentOrganizerIds.filter((id) => !newOrganizerIds.includes(id))
	};
}

export async function getEvents(conditions: { organizerIds?: string[] } = {}): Promise<AppEvent[]> {
	// First get the event results separately
	const eventResults = await db
		.select({
			eventId: table.eventResult.eventId,
			teamId: table.eventResult.teamId,
			rank: table.eventResult.rank,
			prizeAmount: table.eventResult.prizeAmount,
			prizeCurrency: table.eventResult.prizeCurrency,
			team: table.team,
			event: table.event
		})
		.from(table.eventResult)
		.leftJoin(table.team, eq(table.team.id, table.eventResult.teamId))
		.leftJoin(table.event, eq(table.event.id, table.eventResult.eventId));

	// Then get the main event data
	const eventsWithOrganizers = await db
		.select({
			event: table.event,
			organizer: table.organizer,
			eventTeamPlayer: table.eventTeamPlayer,
			team: table.team,
			player: table.player,
			eventWebsite: table.eventWebsite
		})
		.from(table.event)
		.leftJoin(table.eventOrganizer, eq(table.eventOrganizer.eventId, table.event.id))
		.leftJoin(table.organizer, eq(table.organizer.id, table.eventOrganizer.organizerId))
		.leftJoin(table.eventTeamPlayer, eq(table.eventTeamPlayer.eventId, table.event.id))
		.leftJoin(table.team, eq(table.team.id, table.eventTeamPlayer.teamId))
		.leftJoin(table.player, eq(table.player.id, table.eventTeamPlayer.playerId))
		.leftJoin(table.eventWebsite, eq(table.eventWebsite.eventId, table.event.id))
		.where(
			conditions.organizerIds
				? inArray(table.eventOrganizer.organizerId, conditions.organizerIds)
				: undefined
		);

	// Group organizers and team players by event
	const eventsMap = new Map<
		string,
		{
			event: Event;
			organizers: Organizer[];
			teamPlayers: Array<{
				team: typeof table.team.$inferSelect;
				player: typeof table.player.$inferSelect;
				role: 'main' | 'sub' | 'coach';
			}>;
			results: Array<{
				rank: number;
				team: typeof table.team.$inferSelect;
				prizes: Array<{
					amount: number;
					currency: string;
				}>;
			}>;
			websites: Array<{
				url: string;
				label?: string;
			}>;
		}
	>();

	// Process event results first
	eventResults.forEach((result) => {
		if (!eventsMap.has(result.eventId) && result.event) {
			eventsMap.set(result.eventId, {
				event: result.event,
				organizers: [],
				teamPlayers: [],
				results: [],
				websites: []
			});
		}
		const eventData = eventsMap.get(result.eventId)!;
		if (
			result.team &&
			result.rank !== null &&
			result.prizeAmount !== null &&
			result.prizeCurrency
		) {
			eventData.results.push({
				rank: result.rank,
				team: {
					id: result.team.id,
					name: result.team.name,
					slug: result.team.slug,
					abbr: result.team.abbr,
					region: result.team.region,
					logo: result.team.logo,
					createdAt: result.team.createdAt,
					updatedAt: result.team.updatedAt
				},
				prizes: [
					{
						amount: result.prizeAmount,
						currency: result.prizeCurrency
					}
				]
			});
		}
	});

	// Then process the main event data
	eventsWithOrganizers.forEach(
		({ event, organizer, eventTeamPlayer, team, player, eventWebsite }) => {
			if (!eventsMap.has(event.id)) {
				eventsMap.set(event.id, {
					event,
					organizers: [],
					teamPlayers: [],
					results: [],
					websites: []
				});
			}
			if (organizer) {
				const eventData = eventsMap.get(event.id)!;
				// Only add the organizer if it's not already in the array
				if (!eventData.organizers.some((o) => o.id === organizer.id)) {
					eventData.organizers.push(organizer);
				}
			}
			if (eventTeamPlayer && team && player) {
				eventsMap.get(event.id)?.teamPlayers.push({
					team,
					player,
					role: eventTeamPlayer.role
				});
			}
			if (eventWebsite) {
				const eventData = eventsMap.get(event.id)!;
				// Only add the website if it's not already in the array
				if (!eventData.websites.some((w) => w.url === eventWebsite.url)) {
					eventData.websites.push({
						url: eventWebsite.url,
						label: eventWebsite.label || undefined
					});
				}
			}
		}
	);

	const events = await Promise.all(
		Array.from(eventsMap.values()).map(
			async ({ event, organizers, teamPlayers, results, websites }) => ({
				...event,
				organizers,
				imageURL: await processImageURL(event.image),
				teamPlayers,
				results: results.length > 0 ? results : undefined,
				websites: websites.length > 0 ? websites : undefined
			})
		)
	);

	return await Promise.all(
		events.map(async (event) => {
			// Group team players by team
			const teamPlayersMap = new Map<
				string,
				{ main: string[]; reserve: string[]; coach: string[] }
			>();

			event.teamPlayers.forEach(({ team, player, role }) => {
				if (!team.abbr || !player.name) return; // Skip if team abbreviation or player name is missing

				if (!teamPlayersMap.has(team.abbr)) {
					teamPlayersMap.set(team.abbr, { main: [], reserve: [], coach: [] });
				}
				const teamData = teamPlayersMap.get(team.abbr)!;
				if (role === 'main') {
					teamData.main.push(player.name);
				} else if (role === 'sub') {
					teamData.reserve.push(player.name);
				} else if (role === 'coach') {
					teamData.coach.push(player.name);
				}
			});

			// Convert to the expected format
			const participants = Array.from(teamPlayersMap.entries()).map(([team, players]) => ({
				team,
				main: players.main,
				reserve: players.reserve,
				coach: players.coach
			}));

			return {
				...event,
				stages: [],
				organizers:
					event.organizers.length > 0
						? await Promise.all(event.organizers.map(convertOrganizer))
						: [],
				participants,
				server: event.server as 'calabiyau' | 'strinova',
				format: event.format as 'lan' | 'online' | 'hybrid',
				region: event.region as Region,
				status: event.status as 'upcoming' | 'live' | 'finished' | 'cancelled' | 'postponed'
			};
		})
	);
}

// Get event team player changes
export function getEventTeamPlayerChanges(
	currentPlayers: (typeof table.eventTeamPlayer.$inferSelect)[],
	newPlayers: EventTeamPlayerData[]
): {
	toAdd: EventTeamPlayerData[];
	toRemove: (typeof table.eventTeamPlayer.$inferSelect)[];
} {
	const toAdd: EventTeamPlayerData[] = [];
	const toRemove: (typeof table.eventTeamPlayer.$inferSelect)[] = [];

	// Find players to add
	newPlayers.forEach((newPlayer) => {
		const exists = currentPlayers.some(
			(current) =>
				current.eventId === newPlayer.eventId &&
				current.teamId === newPlayer.teamId &&
				current.playerId === newPlayer.playerId
		);
		if (!exists) {
			toAdd.push(newPlayer);
		}
	});

	// Find players to remove
	currentPlayers.forEach((current) => {
		const exists = newPlayers.some(
			(newPlayer) =>
				current.eventId === newPlayer.eventId &&
				current.teamId === newPlayer.teamId &&
				current.playerId === newPlayer.playerId
		);
		if (!exists) {
			toRemove.push(current);
		}
	});

	return { toAdd, toRemove };
}

// Get event team players
export async function getEventTeamPlayers(eventId: string) {
	return await db
		.select({
			eventTeamPlayer: table.eventTeamPlayer,
			team: table.team,
			player: table.player
		})
		.from(table.eventTeamPlayer)
		.leftJoin(table.team, eq(table.team.id, table.eventTeamPlayer.teamId))
		.leftJoin(table.player, eq(table.player.id, table.eventTeamPlayer.playerId))
		.where(eq(table.eventTeamPlayer.eventId, eventId));
}

// Update event team players
export async function updateEventTeamPlayers(
	eventId: string,
	players: EventTeamPlayerData[],
	userId: string
) {
	await db.transaction(async (tx) => {
		// Get current players for history
		const currentPlayers = await tx
			.select()
			.from(table.eventTeamPlayer)
			.where(eq(table.eventTeamPlayer.eventId, eventId));

		// Delete all players for this event
		await tx.delete(table.eventTeamPlayer).where(eq(table.eventTeamPlayer.eventId, eventId));

		// Add new players
		if (players.length > 0) {
			await tx.insert(table.eventTeamPlayer).values(
				players.map((player) => ({
					eventId: eventId,
					teamId: player.teamId,
					playerId: player.playerId,
					role: player.role,
					createdAt: new Date(),
					updatedAt: new Date()
				}))
			);
		}

		// Add edit history
		await tx.insert(table.editHistory).values({
			id: crypto.randomUUID(),
			tableName: 'event_team_player',
			recordId: eventId,
			fieldName: 'players',
			oldValue: JSON.stringify(currentPlayers),
			newValue: JSON.stringify(players),
			editedBy: userId,
			editedAt: new Date()
		});
	});
}

// export interface Event {
// 	id: number;
// 	slug: string;
// 	name: string;
// 	official: boolean;
// 	server: 'calabiyau' | 'strinova';
// 	format: 'lan' | 'online' | 'hybrid';
// 	// host: string;
// 	// date: string;
// 	region: Region;
// 	// location: string;
// 	// description: string;
// 	image: string;
// 	status: 'upcoming' | 'live' | 'finished' | 'cancelled' | 'postponed';
// 	stages: Stage[];

// 	//// matches: Match[];
// 	// prizePool: number;
// 	// teams: Team[];
// 	organizer: {
// 		name: string;
// 		logo?: string;
// 		url: string;
// 	};
// 	capacity: number; // expected number of teams
// 	date: string;
// 	websites?: string[];
// 	participants: {
// 		team: string; // team abbr
// 		main: string[];
// 		reserve: string[];
// 		coach: string[];
// 	}[];
// 	livestreams?: {
// 		platform: 'twitch' | 'youtube' | 'bilibili';
// 		url: string;
// 	}[];
// 	results?: {
// 		rank: number;
// 		team: string;
// 		prizes: EventPrize[];
// 	}[];
// 	highlights?: string[];
// }
