import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, or } from 'drizzle-orm';

// Returns a consolidated snapshot of an event suitable for "Create from" templating in the editor
// Notes:
// - Results are intentionally omitted
// - Websites and videos are included
// - Organizers returned as organizerIds
// - Team-players and per-team metadata (entry/status) included
export const GET: RequestHandler = async ({ params }) => {
	const { id } = params;

	try {
		// Find event by id or slug
		const baseEvent = await db.query.event.findFirst({
			where: or(eq(table.event.id, id), eq(table.event.slug, id)),
			columns: {
				id: true,
				slug: true,
				name: true,
				server: true,
				format: true,
				region: true,
				status: true,
				capacity: true,
				date: true,
				image: true,
				official: true
			}
		});

		if (!baseEvent) return json({ error: 'Event not found' }, { status: 404 });

		// Organizers
		const organizerRows = await db
			.select({ organizerId: table.eventOrganizer.organizerId })
			.from(table.eventOrganizer)
			.where(eq(table.eventOrganizer.eventId, baseEvent.id));

		const organizerIds = organizerRows.map((r) => r.organizerId);

		// Websites
		const websites = await db
			.select({ url: table.eventWebsite.url, label: table.eventWebsite.label })
			.from(table.eventWebsite)
			.where(eq(table.eventWebsite.eventId, baseEvent.id));

		// Videos
		const videos = await db
			.select({
				type: table.eventVideo.type,
				platform: table.eventVideo.platform,
				url: table.eventVideo.url,
				title: table.eventVideo.title
			})
			.from(table.eventVideo)
			.where(eq(table.eventVideo.eventId, baseEvent.id));

		// Casters
		const casters = await db
			.select({ playerId: table.eventCaster.playerId, role: table.eventCaster.role })
			.from(table.eventCaster)
			.where(eq(table.eventCaster.eventId, baseEvent.id));

		// Event teams metadata (entry/status)
		const eventTeams = await db
			.select({
				teamId: table.eventTeam.teamId,
				entry: table.eventTeam.entry,
				status: table.eventTeam.status
			})
			.from(table.eventTeam)
			.where(eq(table.eventTeam.eventId, baseEvent.id));

		// Team players
		const teamPlayers = await db
			.select({
				teamId: table.eventTeamPlayer.teamId,
				playerId: table.eventTeamPlayer.playerId,
				role: table.eventTeamPlayer.role
			})
			.from(table.eventTeamPlayer)
			.where(eq(table.eventTeamPlayer.eventId, baseEvent.id));

		return json({
			event: baseEvent,
			organizerIds,
			websites: websites.map((w) => ({ url: w.url, label: w.label ?? undefined })),
			videos: videos.map((v) => ({
				type: v.type as 'stream' | 'clip' | 'vod',
				platform: v.platform as 'twitch' | 'youtube' | 'bilibili',
				url: v.url,
				title: v.title ?? undefined
			})),
			casters: casters.map((c) => ({ playerId: c.playerId, role: c.role })),
			eventTeams: eventTeams.map((et) => ({
				teamId: et.teamId,
				entry: et.entry,
				status: et.status
			})),
			teamPlayers: teamPlayers.map((tp) => ({
				teamId: tp.teamId,
				playerId: tp.playerId,
				role: tp.role
			}))
		});
	} catch (e) {
		console.error('[API][Events][Template] Failed to fetch template snapshot:', e);
		return json({ error: 'Failed to fetch template' }, { status: 500 });
	}
};
