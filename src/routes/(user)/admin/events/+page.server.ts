import { fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

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

export const load: PageServerLoad = async ({ url }) => {
	const eventsList = await db.select().from(table.event);

	const action = url.searchParams.get('action');
	const id = url.searchParams.get('id');

	return {
		events: eventsList,
		action,
		id
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
		const name = formData.get('name') as string;
		const slug = formData.get('slug') as string;
		const official = formData.get('official') === 'true';
		const server = formData.get('server') as string;
		const format = formData.get('format') as string;
		const region = formData.get('region') as string;
		const image = formData.get('image') as string;
		const status = formData.get('status') as string;
		const capacity = parseInt(formData.get('capacity') as string);
		const date = formData.get('date') as string;

		if (
			!name ||
			!slug ||
			!server ||
			!format ||
			!region ||
			!image ||
			!status ||
			!capacity ||
			!date
		) {
			return fail(400, {
				error: 'All fields are required'
			});
		}

		try {
			const eventId = crypto.randomUUID();
			await db.insert(table.event).values({
				id: eventId,
				name,
				slug,
				official,
				server,
				format,
				region,
				image,
				status,
				capacity,
				date
			});

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
				success: true
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
		const id = formData.get('id') as string;
		const name = formData.get('name') as string;
		const slug = formData.get('slug') as string;
		const official = formData.get('official') === 'true';
		const server = formData.get('server') as string;
		const format = formData.get('format') as string;
		const region = formData.get('region') as string;
		const image = formData.get('image') as string;
		const status = formData.get('status') as string;
		const capacity = parseInt(formData.get('capacity') as string);
		const date = formData.get('date') as string;

		if (
			!id ||
			!name ||
			!slug ||
			!server ||
			!format ||
			!region ||
			!image ||
			!status ||
			!capacity ||
			!date
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
				.where(eq(table.event.id, id))
				.limit(1);

			if (!currentEvent.length) {
				return fail(404, {
					error: 'Event not found'
				});
			}

			const changes: Record<string, { from: any; to: any }> = {};
			const newData = {
				name,
				slug,
				official,
				server,
				format,
				region,
				image,
				status,
				capacity,
				date
			};

			// Compare and record changes
			Object.entries(newData).forEach(([key, value]) => {
				if (
					JSON.stringify(currentEvent[0][key as keyof (typeof currentEvent)[0]]) !==
					JSON.stringify(value)
				) {
					changes[key] = {
						from: currentEvent[0][key as keyof (typeof currentEvent)[0]],
						to: value
					};
				}
			});

			// Update the event
			await db.update(table.event).set(newData).where(eq(table.event.id, id));

			// Add edit history if there are changes
			if (Object.keys(changes).length > 0) {
				await Promise.all(
					Object.entries(changes).map(([fieldName, { from, to }]) =>
						db.insert(table.editHistory).values({
							id: crypto.randomUUID(),
							tableName: 'event',
							recordId: id,
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
	}
};
