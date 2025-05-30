import { fail, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, inArray, and } from 'drizzle-orm';
import { processImageURL, uploadImage } from '$lib/server/storage';
import {
	type CreateEventData,
	type UpdateEventData,
	type EventWithOrganizers,
	type EventTeamPlayerData,
	toDatabaseEvent,
	toDatabaseEventOrganizers,
	getEventChanges,
	getOrganizerChanges,
	toEventWithOrganizers,
	getEvents,
	updateEventTeamPlayers
} from '$lib/server/data/events';

type PermissionResult =
	| { status: 'success'; userId: string }
	| { status: 'error'; error: string; statusCode: 401 | 403 };

function checkPermissions(locals: App.Locals, requiredRoles: string[]): PermissionResult {
	if (!locals.user?.id) {
		console.error('[Admin][Events] Unauthorized: user is not authenticated');
		return { status: 'error', error: 'Unauthorized', statusCode: 401 };
	}

	if (!requiredRoles.some((role) => locals.user?.roles.includes(role))) {
		console.error(
			`[Admin][Events] Forbidden: user "${locals.user.username}" (${locals.user.id}) lacks required roles (${requiredRoles.join(', ')}). Current roles: ${locals.user.roles.join(', ')}`
		);
		return { status: 'error', error: 'Insufficient permissions', statusCode: 403 };
	}

	return { status: 'success', userId: locals.user.id };
}

export const load: PageServerLoad = async ({ locals, url }) => {
	const result = checkPermissions(locals, ['admin', 'editor']);
	if (result.status === 'error') {
		throw error(result.statusCode, result.error);
	}

	const events = await getEvents();
	const organizers = await db.select().from(table.organizer);
	const eventOrganizers = await db.select().from(table.eventOrganizer);
	const teams = await db.select().from(table.team);
	const players = await db.select().from(table.player);
	const teamPlayers = await db.select().from(table.teamPlayer);

	return {
		events,
		organizers,
		eventOrganizers,
		teams,
		players,
		teamPlayers,
		action: url.searchParams.get('action'),
		id: url.searchParams.get('id')
	};
};

export const actions = {
	create: async ({ request, locals }) => {
		const result = checkPermissions(locals, ['admin', 'editor']);
		if (result.status === 'error') {
			return fail(result.statusCode, {
				error: result.error
			});
		}

		const formData = await request.formData();
		const eventData: CreateEventData = {
			name: formData.get('name') as string,
			slug: formData.get('slug') as string,
			official: formData.get('official') === 'true',
			server: formData.get('server') as string,
			format: formData.get('format') as string,
			region: formData.get('region') as string,
			image: formData.get('image') as string,
			status: formData.get('status') as string,
			capacity: parseInt(formData.get('capacity') as string),
			date: formData.get('date') as string,
			organizerIds: (formData.getAll('organizers') as string[]) || []
		};

		if (
			!eventData.name ||
			!eventData.slug ||
			!eventData.server ||
			!eventData.format ||
			!eventData.region ||
			!eventData.image ||
			!eventData.status ||
			// !eventData.capacity ||
			!eventData.date
		) {
			return fail(400, {
				error: 'All fields are required'
			});
		}

		try {
			const eventId = crypto.randomUUID();
			const dbEvent = toDatabaseEvent(eventData);
			await db.insert(table.event).values({
				id: eventId,
				...dbEvent
			});

			// Add event organizers if any are selected
			if (eventData.organizerIds && eventData.organizerIds.length > 0) {
				const dbEventOrganizers = toDatabaseEventOrganizers(eventId, eventData.organizerIds);
				await db.insert(table.eventOrganizer).values(dbEventOrganizers);
			}

			// Add edit history
			await db.insert(table.editHistory).values({
				id: crypto.randomUUID(),
				tableName: 'event',
				recordId: eventId,
				fieldName: 'creation',
				oldValue: null,
				newValue: 'created',
				editedBy: result.userId,
				editedAt: new Date()
			});

			return {
				success: true,
				id: eventId
			};
		} catch (e) {
			console.error('[Admin][Events][Create] Failed to create event:', e);
			return fail(500, {
				error: 'Failed to create event'
			});
		}
	},

	update: async ({ request, locals }) => {
		const result = checkPermissions(locals, ['admin', 'editor']);
		if (result.status === 'error') {
			return fail(result.statusCode, {
				error: result.error
			});
		}

		const formData = await request.formData();
		const eventData: UpdateEventData = {
			id: formData.get('id') as string,
			name: formData.get('name') as string,
			slug: formData.get('slug') as string,
			official: formData.get('official') === 'true',
			server: formData.get('server') as string,
			format: formData.get('format') as string,
			region: formData.get('region') as string,
			image: formData.get('image') as string,
			status: formData.get('status') as string,
			capacity: parseInt(formData.get('capacity') as string),
			date: formData.get('date') as string,
			organizerIds: (formData.getAll('organizers') as string[]) || []
		};

		if (
			!eventData.id ||
			!eventData.name ||
			!eventData.slug ||
			!eventData.server ||
			!eventData.format ||
			!eventData.region ||
			!eventData.image ||
			!eventData.status ||
			// !eventData.capacity ||
			!eventData.date
		) {
			return fail(400, {
				error: 'All fields are required'
			});
		}

		try {
			// Get the current event data for comparison
			const currentEvent = await db
				.select()
				.from(table.event)
				.where(eq(table.event.id, eventData.id))
				.limit(1);

			if (!currentEvent.length) {
				return fail(404, {
					error: 'Event not found'
				});
			}

			const changes = getEventChanges(currentEvent[0], eventData);

			// Update the event
			const dbEvent = toDatabaseEvent(eventData as CreateEventData);
			await db.update(table.event).set(dbEvent).where(eq(table.event.id, eventData.id));

			// Update event organizers
			const currentOrganizers = await db
				.select()
				.from(table.eventOrganizer)
				.where(eq(table.eventOrganizer.eventId, eventData.id));

			const currentOrganizerIds = currentOrganizers.map((eo) => eo.organizerId);
			const { toAdd, toRemove } = getOrganizerChanges(
				currentOrganizerIds,
				eventData.organizerIds ?? []
			);

			if (toAdd.length > 0) {
				const dbEventOrganizers = toDatabaseEventOrganizers(eventData.id, toAdd);
				await db.insert(table.eventOrganizer).values(dbEventOrganizers);
			}

			if (toRemove.length > 0) {
				await db
					.delete(table.eventOrganizer)
					.where(
						and(
							eq(table.eventOrganizer.eventId, eventData.id),
							inArray(table.eventOrganizer.organizerId, toRemove)
						)
					);
			}

			// Add edit history if there are changes
			if (Object.keys(changes).length > 0) {
				await Promise.all(
					Object.entries(changes).map(([fieldName, { from, to }]) =>
						db.insert(table.editHistory).values({
							id: crypto.randomUUID(),
							tableName: 'event',
							recordId: eventData.id,
							fieldName,
							oldValue: JSON.stringify(from),
							newValue: JSON.stringify(to),
							editedBy: result.userId,
							editedAt: new Date()
						})
					)
				);
			}

			// Add edit history for organizer changes
			if (toAdd.length > 0 || toRemove.length > 0) {
				await db.insert(table.editHistory).values({
					id: crypto.randomUUID(),
					tableName: 'event',
					recordId: eventData.id,
					fieldName: 'organizers',
					oldValue: JSON.stringify(currentOrganizerIds),
					newValue: JSON.stringify(eventData.organizerIds),
					editedBy: result.userId,
					editedAt: new Date()
				});
			}

			return {
				success: true
			};
		} catch (e) {
			console.error('[Admin][Events][Update] Failed to update event:', e);
			return fail(500, {
				error: 'Failed to update event'
			});
		}
	},

	delete: async ({ request, locals }) => {
		const result = checkPermissions(locals, ['admin', 'editor']);
		if (result.status === 'error') {
			return fail(result.statusCode, {
				error: result.error
			});
		}

		const formData = await request.formData();
		const id = formData.get('id') as string;

		if (!id) {
			return fail(400, {
				error: 'ID is required'
			});
		}

		try {
			// Get the event data before deletion for history
			const event = await db.select().from(table.event).where(eq(table.event.id, id)).limit(1);

			if (!event.length) {
				return fail(404, {
					error: 'Event not found'
				});
			}

			// Delete the event
			await db.delete(table.event).where(eq(table.event.id, id));

			// Add edit history
			await db.insert(table.editHistory).values({
				id: crypto.randomUUID(),
				tableName: 'event',
				recordId: id,
				fieldName: 'deletion',
				oldValue: JSON.stringify(event[0]),
				newValue: 'deleted',
				editedBy: result.userId,
				editedAt: new Date()
			});

			return {
				success: true
			};
		} catch (e) {
			console.error('[Admin][Events][Delete] Failed to delete event:', e);
			return fail(500, {
				error: 'Failed to delete event'
			});
		}
	},

	uploadImage: async ({ request, locals }) => {
		const result = checkPermissions(locals, ['admin', 'editor']);
		if (result.status === 'error') {
			return fail(result.statusCode, {
				error: result.error
			});
		}

		const formData = await request.formData();
		const file = formData.get('image') as File;

		if (!file) {
			return fail(400, {
				error: 'No file provided'
			});
		}

		try {
			const key = `events/${crypto.randomUUID()}-${file.name}`;
			await uploadImage(file, key);

			return {
				type: 'success',
				data: {
					key
				}
			};
		} catch (e) {
			console.error('[Admin][Events][Upload] Failed to upload image:', e);
			return fail(500, {
				error: 'Failed to upload image'
			});
		}
	},

	updateTeamPlayers: async ({ request, locals }) => {
		const result = checkPermissions(locals, ['admin', 'editor']);
		if (result.status === 'error') {
			return fail(result.statusCode, {
				error: result.error
			});
		}

		const formData = await request.formData();
		const eventId = formData.get('eventId') as string;
		const playersData = formData.get('players') as string;

		if (!eventId || !playersData) {
			return fail(400, {
				error: 'Event ID and players data are required'
			});
		}

		try {
			const players = JSON.parse(playersData) as EventTeamPlayerData[];
			await updateEventTeamPlayers(eventId, players, result.userId);

			return {
				success: true
			};
		} catch (e) {
			console.error('[Admin][Events][UpdateTeamPlayers] Failed to update event team players:', e);
			return fail(500, {
				error: 'Failed to update event team players'
			});
		}
	}
};
