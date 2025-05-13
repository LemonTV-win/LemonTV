import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { processImageURL } from '$lib/server/storage';
import type { Organizer as AppOrganizer } from '$lib/data/organizer';

async function convertOrganizer(organizer: table.Organizer): Promise<AppOrganizer> {
	return {
		...organizer,
		logo: await processImageURL(organizer.logo)
	};
}

export async function getOrganizers(): Promise<AppOrganizer[]> {
	const organizers = await db.select().from(table.organizer);

	return Promise.all(organizers.map(convertOrganizer));
}

export async function getOrganizer(id: string): Promise<AppOrganizer | null> {
	const [organizer] = await db.select().from(table.organizer).where(eq(table.organizer.id, id));
	return organizer ? await convertOrganizer(organizer) : null;
}
