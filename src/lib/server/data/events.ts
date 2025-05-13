import type { Event, EventOrganizer } from '$lib/server/db/schemas/game/event';
import type { Organizer } from '$lib/server/db/schemas/game/organizer';

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
