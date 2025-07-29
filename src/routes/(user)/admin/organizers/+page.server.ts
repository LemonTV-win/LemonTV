import { fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';
import { processImageURL } from '$lib/server/storage';

type PermissionResult =
	| { status: 'success'; userId: string }
	| { status: 'error'; error: string; statusCode: 401 | 403 };

function checkPermissions(locals: App.Locals, requiredRoles: string[]): PermissionResult {
	if (!locals.user) {
		return {
			status: 'error',
			error: 'You must be logged in to perform this action',
			statusCode: 401
		};
	}

	if (!locals.user.roles.some((role) => requiredRoles.includes(role))) {
		return {
			status: 'error',
			error: 'You do not have permission to perform this action',
			statusCode: 403
		};
	}

	return {
		status: 'success',
		userId: locals.user.id
	};
}

export const load: PageServerLoad = async ({ url }) => {
	const organizersList = await db.select().from(table.organizer);

	const action = url.searchParams.get('action');
	const id = url.searchParams.get('id');

	return {
		organizers: await Promise.all(
			organizersList.map(async (organizer) => ({
				...organizer,
				logoURL: await processImageURL(organizer.logo)
			}))
		),
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
		const organizerData = {
			name: formData.get('name') as string,
			slug: formData.get('slug') as string,
			logo: formData.get('logo') as string,
			description: formData.get('description') as string,
			url: formData.get('url') as string,
			type: formData.get('type') as string
		};

		if (
			!organizerData.name ||
			!organizerData.slug ||
			!organizerData.description ||
			!organizerData.url
			// || !organizerData.type
		) {
			const missingFields = [];
			if (!organizerData.name) missingFields.push('name');
			if (!organizerData.slug) missingFields.push('slug');
			if (!organizerData.description) missingFields.push('description');
			if (!organizerData.url) missingFields.push('url');

			return fail(400, {
				error: `Missing required fields: ${missingFields.join(', ')}`
			});
		}

		try {
			const organizerId = crypto.randomUUID();
			await db.insert(table.organizer).values({
				id: organizerId,
				...organizerData,
				type: organizerData.type || null
			});

			// Add edit history
			await db.insert(table.editHistory).values({
				id: crypto.randomUUID(),
				tableName: 'organizer',
				recordId: organizerId,
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
			console.error('[Admin][Organizers][Create] Failed to create organizer:', e);
			return fail(500, {
				error: 'Failed to create organizer'
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
		const organizerData = {
			id: formData.get('id') as string,
			name: formData.get('name') as string,
			slug: formData.get('slug') as string,
			logo: formData.get('logo') as string,
			description: formData.get('description') as string,
			url: formData.get('url') as string,
			type: formData.get('type') as string
		};

		if (
			!organizerData.id ||
			!organizerData.name ||
			!organizerData.slug ||
			!organizerData.description ||
			!organizerData.url
		) {
			const missingFields = [];
			if (!organizerData.id) missingFields.push('id');
			if (!organizerData.name) missingFields.push('name');
			if (!organizerData.slug) missingFields.push('slug');
			if (!organizerData.description) missingFields.push('description');
			if (!organizerData.url) missingFields.push('url');

			return fail(400, {
				error: `Missing required fields: ${missingFields.join(', ')}`
			});
		}

		try {
			// Get the current organizer data for comparison
			const currentOrganizer = await db
				.select()
				.from(table.organizer)
				.where(eq(table.organizer.id, organizerData.id))
				.limit(1);

			if (!currentOrganizer.length) {
				return fail(404, {
					error: 'Organizer not found'
				});
			}

			// Update the organizer
			await db
				.update(table.organizer)
				.set({
					name: organizerData.name,
					slug: organizerData.slug,
					logo: organizerData.logo,
					description: organizerData.description,
					url: organizerData.url,
					type: organizerData.type || null,
					updatedAt: new Date()
				})
				.where(eq(table.organizer.id, organizerData.id));

			// Add edit history for each changed field
			type OrganizerFieldValue = string | null;
			const changes: Record<string, { from: OrganizerFieldValue; to: OrganizerFieldValue }> = {};
			Object.entries(organizerData).forEach(([key, value]) => {
				if (
					key !== 'id' &&
					JSON.stringify(currentOrganizer[0][key as keyof (typeof currentOrganizer)[0]]) !==
						JSON.stringify(value)
				) {
					changes[key] = {
						from: currentOrganizer[0][
							key as keyof (typeof currentOrganizer)[0]
						] as OrganizerFieldValue,
						to: value as OrganizerFieldValue
					};
				}
			});

			if (Object.keys(changes).length > 0) {
				await Promise.all(
					Object.entries(changes).map(([fieldName, { from, to }]) =>
						db.insert(table.editHistory).values({
							id: crypto.randomUUID(),
							tableName: 'organizer',
							recordId: organizerData.id,
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
			console.error('[Admin][Organizers][Update] Failed to update organizer:', e);
			return fail(500, {
				error: 'Failed to update organizer'
			});
		}
	},

	checkDependencies: async ({ request, locals }) => {
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
				error: 'Organizer ID is required'
			});
		}

		try {
			// Get the current organizer data
			const currentOrganizer = await db
				.select()
				.from(table.organizer)
				.where(eq(table.organizer.id, id))
				.limit(1);

			if (!currentOrganizer.length) {
				return fail(404, {
					error: 'Organizer not found'
				});
			}

			// Get all dependencies
			const [eventOrganizers, organizerUsers] = await Promise.all([
				db
					.select({
						count: sql<number>`count(*)`,
						events: sql<string>`group_concat(distinct ${table.event.name})`
					})
					.from(table.eventOrganizer)
					.leftJoin(table.event, eq(table.eventOrganizer.eventId, table.event.id))
					.where(eq(table.eventOrganizer.organizerId, id))
					.groupBy(table.eventOrganizer.organizerId),
				db
					.select({
						count: sql<number>`count(*)`,
						users: sql<string>`group_concat(distinct ${table.user.username})`
					})
					.from(table.organizerUser)
					.leftJoin(table.user, eq(table.organizerUser.userId, table.user.id))
					.where(eq(table.organizerUser.organizerId, id))
					.groupBy(table.organizerUser.organizerId)
			]);

			const dependencies = {
				events: eventOrganizers[0] || { count: 0, events: '' },
				users: organizerUsers[0] || { count: 0, users: '' }
			};

			return {
				success: true,
				organizer: currentOrganizer[0],
				dependencies
			};
		} catch (e) {
			console.error('[Admin][Organizers][CheckDependencies] Failed to check dependencies:', e);
			return fail(500, {
				error: 'Failed to check dependencies'
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
		const confirmed = formData.get('confirmed') === 'true';

		if (!id) {
			return fail(400, {
				error: 'Organizer ID is required'
			});
		}

		if (!confirmed) {
			return fail(400, {
				error: 'Deletion must be confirmed'
			});
		}

		try {
			// Get the current organizer data for history
			const currentOrganizer = await db
				.select()
				.from(table.organizer)
				.where(eq(table.organizer.id, id))
				.limit(1);

			if (!currentOrganizer.length) {
				return fail(404, {
					error: 'Organizer not found'
				});
			}

			// Start a transaction to handle all deletions
			await db.transaction(async (tx) => {
				// Delete all related records first
				await Promise.all([
					tx.delete(table.eventOrganizer).where(eq(table.eventOrganizer.organizerId, id)),
					tx.delete(table.organizerUser).where(eq(table.organizerUser.organizerId, id))
				]);

				// Delete the organizer
				await tx.delete(table.organizer).where(eq(table.organizer.id, id));

				// Add edit history
				await tx.insert(table.editHistory).values({
					id: crypto.randomUUID(),
					tableName: 'organizer',
					recordId: id,
					fieldName: 'deletion',
					oldValue: JSON.stringify(currentOrganizer[0]),
					newValue: 'deleted',
					editedBy: result.userId,
					editedAt: new Date()
				});
			});

			return {
				success: true
			};
		} catch (e) {
			console.error('[Admin][Organizers][Delete] Failed to delete organizer:', e);
			return fail(500, {
				error: 'Failed to delete organizer'
			});
		}
	}
};
