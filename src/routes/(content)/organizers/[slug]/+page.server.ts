import { getOrganizer } from '$lib/server/data/organizers';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { events } from '$lib/data/events';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { processImageURL } from '$lib/server/storage';

export const load: PageServerLoad = async ({ params }) => {
	const organizer = await getOrganizer(params.slug);

	if (!organizer) {
		throw error(404, 'Organizer not found');
	}

	const legacyEvents = events.filter((event) =>
		event.organizers.some((org) => org.name === organizer.name)
	);
	console.log(
		`[Content][Organizer][${organizer.name}] Found ${legacyEvents.length} legacy events`,
		legacyEvents.map((e) => ({ id: e.id, name: e.name }))
	);

	console.log(`[Content][Organizer][${organizer.name}] Organizer ID: ${organizer.id}`);

	// Direct Drizzle query for essential event data only
	const serverEvents = await db
		.select({
			id: table.event.id,
			slug: table.event.slug,
			name: table.event.name,
			image: table.event.image,
			date: table.event.date,
			region: table.event.region,
			format: table.event.format
		})
		.from(table.event)
		.innerJoin(table.eventOrganizer, eq(table.eventOrganizer.eventId, table.event.id))
		.where(eq(table.eventOrganizer.organizerId, organizer.id));

	console.log(
		`[Content][Organizer][${organizer.name}] Found ${serverEvents.length} server events`,
		serverEvents.map((e) => ({ id: e.id, name: e.name }))
	);

	// Process image URLs for server events
	// Collect unique image URLs
	const uniqueImageUrls = new Set<string>();
	for (const event of serverEvents) {
		if (event.image) {
			uniqueImageUrls.add(event.image);
		}
	}

	// Process all image URLs in parallel
	const imageUrlMap = new Map<string, string>();
	await Promise.all(
		Array.from(uniqueImageUrls).map(async (url) => {
			const processed = await processImageURL(url);
			imageUrlMap.set(url, processed);
		})
	);

	// Apply processed URLs to server events
	const processedServerEvents = serverEvents.map((event) => ({
		...event,
		imageURL: event.image ? imageUrlMap.get(event.image) || event.image : event.image
	}));

	const organizedEvents = [...legacyEvents, ...processedServerEvents];

	return {
		organizer,
		events: organizedEvents
	};
};
