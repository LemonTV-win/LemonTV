import { fail, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { uploadImage } from '$lib/server/storage';
import {
	type CreateEventData,
	type UpdateEventData,
	type EventTeamPlayerData,
	toDatabaseEvent,
	toDatabaseEventOrganizers,
	toDatabaseEventVideos,
	getEventChanges,
	getEventsForAdminPage,
	updateEventTeamPlayers,
	updateEventCasters
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

function withTimer<T>(name: string, fn: () => Promise<T>): () => Promise<T> {
	return async () => {
		const start = performance.now();
		const result = await fn();
		const duration = performance.now() - start;
		console.info(`[Timer] ${name} took ${duration.toFixed(2)}ms`);
		return result;
	};
}

export const load: PageServerLoad = async ({ locals, url }) => {
	const result = checkPermissions(locals, ['admin', 'editor']);
	if (result.status === 'error') {
		throw error(result.statusCode, result.error);
	}

	const [events, organizers, eventOrganizers, teams, players, teamPlayers] = await Promise.all([
		withTimer('getEventsForAdminPage', () => getEventsForAdminPage())(),
		withTimer('getOrganizers', () => db.select().from(table.organizer))(),
		withTimer('getEventOrganizers', () => db.select().from(table.eventOrganizer))(),
		withTimer('getTeams', () => db.select().from(table.team))(),
		withTimer('getPlayers', () => db.select().from(table.player))(),
		withTimer('getTeamPlayers', () => db.select().from(table.teamPlayer))()
	]);

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

// Helper function to handle team players update
async function handleTeamPlayersUpdate(eventId: string, playersData: string, userId: string) {
	console.info('[Admin][Events][HandleTeamPlayersUpdate] Updating event team players');

	if (!eventId || !playersData) {
		return fail(400, {
			error: 'Event ID and players data are required'
		});
	}

	try {
		const players = JSON.parse(playersData) as EventTeamPlayerData[];

		// Check for duplicate players in the same team
		const teamPlayerMap = new Map<string, Set<string>>();
		for (const player of players) {
			if (!teamPlayerMap.has(player.teamId)) {
				teamPlayerMap.set(player.teamId, new Set());
			}
			const teamPlayers = teamPlayerMap.get(player.teamId)!;
			if (teamPlayers.has(player.playerId)) {
				return fail(400, {
					error: 'A player cannot be added multiple times to the same team'
				});
			}
			teamPlayers.add(player.playerId);
		}

		await updateEventTeamPlayers(eventId, players, userId);

		return {
			success: true
		};
	} catch (e) {
		console.error(
			'[Admin][Events][HandleTeamPlayersUpdate] Failed to update event team players:',
			e
		);
		return fail(500, {
			error: 'Failed to update event team players'
		});
	}
}

export const actions = {
	create: async ({ request, locals }: { request: Request; locals: App.Locals }) => {
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
			official: formData.get('official') === 'on',
			server: formData.get('server') as string,
			format: formData.get('format') as string,
			region: formData.get('region') as string,
			image: formData.get('image') as string,
			status: formData.get('status') as string,
			capacity: parseInt(formData.get('capacity') as string),
			date: formData.get('date') as string,
			organizerIds: (formData.getAll('organizers') as string[]) || [],
			websites: JSON.parse((formData.get('websites') as string) || '[]'),
			videos: JSON.parse((formData.get('videos') as string) || '[]'),
			casters: JSON.parse((formData.get('casters') as string) || '[]')
		};

		console.info('[Admin][Events][Create] Event data:', eventData);

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
			const missingFields = [];
			if (!eventData.name) missingFields.push('name');
			if (!eventData.slug) missingFields.push('slug');
			if (!eventData.server) missingFields.push('server');
			if (!eventData.format) missingFields.push('format');
			if (!eventData.region) missingFields.push('region');
			if (!eventData.image) missingFields.push('image');
			if (!eventData.status) missingFields.push('status');
			// if (!eventData.capacity) missingFields.push('capacity');
			if (!eventData.date) missingFields.push('date');

			return fail(400, {
				error: `Missing required fields: ${missingFields.join(', ')}`
			});
		}

		try {
			const eventId = crypto.randomUUID();
			const dbEvent = toDatabaseEvent(eventData);
			await db.insert(table.event).values({
				id: eventId,
				...dbEvent
			});

			// Handle event organizers
			if (eventData.organizerIds && eventData.organizerIds.length > 0) {
				await db
					.insert(table.eventOrganizer)
					.values(toDatabaseEventOrganizers(eventId, eventData.organizerIds));
			}

			// Handle event websites
			if (eventData.websites && eventData.websites.length > 0) {
				const websiteValues = eventData.websites
					.filter((website) => website.url) // Only include websites with URLs
					.map((website) => ({
						id: crypto.randomUUID(),
						eventId,
						url: website.url,
						label: website.label || null,
						createdAt: new Date(),
						updatedAt: new Date()
					}));

				if (websiteValues.length > 0) {
					await db.insert(table.eventWebsite).values(websiteValues);
				}
			}

			// Handle event videos
			if (eventData.videos && eventData.videos.length > 0) {
				const videoValues = toDatabaseEventVideos(eventId, eventData.videos).map((video) => ({
					...video,
					id: crypto.randomUUID(),
					createdAt: new Date(),
					updatedAt: new Date()
				}));

				if (videoValues.length > 0) {
					await db.insert(table.eventVideo).values(videoValues);
				}
			}

			// Handle event casters
			const castersData = formData.get('casters') as string;
			if (castersData) {
				const casters = JSON.parse(castersData) as Array<{
					playerId: string;
					role: 'host' | 'analyst' | 'commentator';
				}>;

				if (casters.length > 0) {
					await updateEventCasters(eventId, casters, result.userId);
				}
			}

			// Handle event results
			const resultsData = formData.get('results') as string;
			if (resultsData) {
				const results = JSON.parse(resultsData) as Array<{
					teamId: string;
					rank: number;
					rankTo?: number;
					prizeAmount: number;
					prizeCurrency: string;
				}>;

				// First delete all existing results
				await db.delete(table.eventResult).where(eq(table.eventResult.eventId, eventId));

				// Then insert the new results if there are any
				if (results.length > 0) {
					await db.insert(table.eventResult).values(
						results.map((result) => ({
							id: crypto.randomUUID(),
							eventId,
							teamId: result.teamId,
							rank: result.rank,
							rankTo: result.rankTo ?? null,
							prizeAmount: result.prizeAmount,
							prizeCurrency: result.prizeCurrency,
							createdAt: new Date(),
							updatedAt: new Date()
						}))
					);
				}
			}

			// Handle team players
			const playersData = formData.get('players') as string;
			if (playersData) {
				const teamPlayersResult = await handleTeamPlayersUpdate(
					eventId,
					playersData,
					result.userId
				);
				if ('error' in teamPlayersResult) {
					return teamPlayersResult;
				}
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

	update: async ({ request, locals }: { request: Request; locals: App.Locals }) => {
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
			official: formData.get('official') === 'on',
			server: formData.get('server') as string,
			format: formData.get('format') as string,
			region: formData.get('region') as string,
			image: formData.get('image') as string,
			status: formData.get('status') as string,
			capacity: parseInt(formData.get('capacity') as string),
			date: formData.get('date') as string,
			organizerIds: (formData.getAll('organizers') as string[]) || [],
			websites: JSON.parse((formData.get('websites') as string) || '[]'),
			videos: JSON.parse((formData.get('videos') as string) || '[]'),
			casters: JSON.parse((formData.get('casters') as string) || '[]')
		};

		console.info('[Admin][Events][Update] Event data:', eventData);

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
			const missingFields = [];
			if (!eventData.id) missingFields.push('id');
			if (!eventData.name) missingFields.push('name');
			if (!eventData.slug) missingFields.push('slug');
			if (!eventData.server) missingFields.push('server');
			if (!eventData.format) missingFields.push('format');
			if (!eventData.region) missingFields.push('region');
			if (!eventData.image) missingFields.push('image');
			if (!eventData.status) missingFields.push('status');
			// if (!eventData.capacity) missingFields.push('capacity');
			if (!eventData.date) missingFields.push('date');

			return fail(400, {
				error: `Missing required fields: ${missingFields.join(', ')}`
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

			// Handle event organizers
			if (eventData.organizerIds && eventData.organizerIds.length > 0) {
				// First remove all existing organizers
				await db.delete(table.eventOrganizer).where(eq(table.eventOrganizer.eventId, eventData.id));

				// Then add the new organizers
				await db
					.insert(table.eventOrganizer)
					.values(toDatabaseEventOrganizers(eventData.id, eventData.organizerIds));
			} else {
				// If no organizers are selected, remove all existing organizers
				await db.delete(table.eventOrganizer).where(eq(table.eventOrganizer.eventId, eventData.id));
			}

			// Handle event websites
			if (eventData.websites && eventData.websites.length > 0) {
				// First remove all existing websites
				await db.delete(table.eventWebsite).where(eq(table.eventWebsite.eventId, eventData.id));

				// Then add the new websites
				const websiteValues = eventData.websites
					.filter((website) => website.url) // Only include websites with URLs
					.map((website) => ({
						id: crypto.randomUUID(),
						eventId: eventData.id,
						url: website.url,
						label: website.label || null,
						createdAt: new Date(),
						updatedAt: new Date()
					}));

				if (websiteValues.length > 0) {
					await db.insert(table.eventWebsite).values(websiteValues);
				}
			} else {
				// If no websites are provided, remove all existing websites
				await db.delete(table.eventWebsite).where(eq(table.eventWebsite.eventId, eventData.id));
			}

			// Handle event videos
			if (eventData.videos && eventData.videos.length > 0) {
				// First remove all existing videos
				await db.delete(table.eventVideo).where(eq(table.eventVideo.eventId, eventData.id));

				// Then add the new videos
				const videoValues = toDatabaseEventVideos(eventData.id, eventData.videos).map((video) => ({
					...video,
					id: crypto.randomUUID(),
					createdAt: new Date(),
					updatedAt: new Date()
				}));

				if (videoValues.length > 0) {
					await db.insert(table.eventVideo).values(videoValues);
				}
			} else {
				// If no videos are provided, remove all existing videos
				await db.delete(table.eventVideo).where(eq(table.eventVideo.eventId, eventData.id));
			}

			// Handle event casters
			const castersData = formData.get('casters') as string;
			if (castersData) {
				const casters = JSON.parse(castersData) as Array<{
					playerId: string;
					role: 'host' | 'analyst' | 'commentator';
				}>;

				await updateEventCasters(eventData.id, casters, result.userId);
			}

			// Handle event results
			const resultsData = formData.get('results') as string;
			if (resultsData) {
				const results = JSON.parse(resultsData) as Array<{
					teamId: string;
					rank: number;
					rankTo?: number;
					prizeAmount: number;
					prizeCurrency: string;
				}>;

				// First delete all existing results
				await db.delete(table.eventResult).where(eq(table.eventResult.eventId, eventData.id));

				// Then insert the new results if there are any
				if (results.length > 0) {
					await db.insert(table.eventResult).values(
						results.map((result) => ({
							id: crypto.randomUUID(),
							eventId: eventData.id,
							teamId: result.teamId,
							rank: result.rank,
							rankTo: result.rankTo ?? null,
							prizeAmount: result.prizeAmount,
							prizeCurrency: result.prizeCurrency,
							createdAt: new Date(),
							updatedAt: new Date()
						}))
					);
				}
			}

			// Handle team players
			const playersData = formData.get('players') as string;
			if (playersData) {
				const teamPlayersResult = await handleTeamPlayersUpdate(
					eventData.id,
					playersData,
					result.userId
				);
				if ('error' in teamPlayersResult) {
					return teamPlayersResult;
				}
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

	updateResults: async ({ request, locals }: { request: Request; locals: App.Locals }) => {
		const result = checkPermissions(locals, ['admin', 'editor']);
		if (result.status === 'error') {
			return fail(result.statusCode, {
				error: result.error
			});
		}

		const formData = await request.formData();
		const eventId = formData.get('eventId') as string;
		const resultsData = formData.get('results') as string;

		if (!eventId || !resultsData) {
			return fail(400, {
				error: 'Event ID and results data are required'
			});
		}

		try {
			const results = JSON.parse(resultsData) as Array<{
				teamId: string;
				rank: number;
				rankTo?: number;
				prizeAmount: number;
				prizeCurrency: string;
			}>;

			// First delete all existing results
			await db.delete(table.eventResult).where(eq(table.eventResult.eventId, eventId));

			// Then insert the new results
			await db.insert(table.eventResult).values(
				results.map((result) => ({
					id: crypto.randomUUID(),
					eventId,
					teamId: result.teamId,
					rank: result.rank,
					rankTo: result.rankTo ?? null,
					prizeAmount: result.prizeAmount,
					prizeCurrency: result.prizeCurrency,
					createdAt: new Date(),
					updatedAt: new Date()
				}))
			);

			// Add edit history
			await db.insert(table.editHistory).values({
				id: crypto.randomUUID(),
				tableName: 'event_result',
				recordId: eventId,
				fieldName: 'results',
				oldValue: null,
				newValue: JSON.stringify(results),
				editedBy: result.userId,
				editedAt: new Date()
			});

			return {
				success: true
			};
		} catch (e) {
			console.error('[Admin][Events][UpdateResults] Failed to update event results:', e);
			return fail(500, {
				error: 'Failed to update event results'
			});
		}
	}
};
