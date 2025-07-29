import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, or } from 'drizzle-orm';
import { processImageURL } from '$lib/server/storage';
import type { Organizer as AppOrganizer } from '$lib/data/organizer';

export async function convertOrganizer(organizer: table.Organizer): Promise<AppOrganizer> {
	return {
		...organizer,
		logo: (await processImageURL(organizer.logo)) || '',
		description: organizer.description ?? undefined,
		url: organizer.url ?? undefined,
		type: organizer.type ?? undefined
	};
}

export async function getOrganizers(): Promise<AppOrganizer[]> {
	const organizers = await db.select().from(table.organizer);

	return Promise.all(organizers.map(convertOrganizer));
}

export async function getOrganizer(slug: string): Promise<AppOrganizer | null> {
	const [organizer] = await db
		.select()
		.from(table.organizer)
		.where(or(eq(table.organizer.slug, slug), eq(table.organizer.id, slug)));
	return organizer ? await convertOrganizer(organizer) : null;
}
