import type { Event as AppEvent } from '$lib/data/events';
import type { Event, EventOrganizer } from '$lib/server/db/schemas/game/event';
import type { Organizer } from '$lib/server/db/schemas/game/organizer';
import { db } from '../db';
import * as table from '$lib/server/db/schema';
import { processImageURL } from '$lib/server/storage';
import type { Region } from '$lib/data/game';

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

export async function getEvents(): Promise<AppEvent[]> {
	const eventsList = await db.select().from(table.event);
	const organizersList = await db.select().from(table.organizer);
	const eventOrganizersList = await db.select().from(table.eventOrganizer);

	// Transform events to include organizers
	const eventsWithOrganizers: EventWithOrganizers[] = eventsList.map((event) =>
		toEventWithOrganizers(event, eventOrganizersList, organizersList)
	);

	const events = await Promise.all(
		eventsWithOrganizers.map(async (event) => ({
			...event,
			image: await processImageURL(event.image)
		}))
	);

	function uuidToNumber(uuid: string): number {
		let hash = 0;
		for (const char of uuid) {
			hash = (hash * 31 + char.charCodeAt(0)) >>> 0; // 32-bit unsigned
		}
		return hash;
	}

	return events.map((event) => ({
		...event,
		stages: [],
		organizer: event.organizers[0],
		participants: [],
		id: uuidToNumber(event.id),
		server: event.server as 'calabiyau' | 'strinova',
		format: event.format as 'lan' | 'online' | 'hybrid',
		region: event.region as Region,
		status: event.status as 'upcoming' | 'live' | 'finished' | 'cancelled' | 'postponed'
	}));
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
