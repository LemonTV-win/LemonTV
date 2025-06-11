import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { Match as AppMatch } from '$lib/data/matches';
import type { Event } from '$lib/data/events';
import type { GameMap, Region } from '$lib/data/game';

export async function getMatch(id: string): Promise<(AppMatch & { event: Event }) | null> {
	const [match] = await db
		.select({
			match: table.match,
			stage: table.stage,
			event: table.event
		})
		.from(table.match)
		.leftJoin(table.stage, eq(table.match.stageId, table.stage.id))
		.leftJoin(table.event, eq(table.stage.eventId, table.event.id))
		.where(eq(table.match.id, id));

	if (!match || !match.event) {
		return null;
	}

	const { format, stageId } = match.match;

	// Get teams data
	const teams = await db
		.select({
			team: table.team,
			matchTeam: table.matchTeam
		})
		.from(table.matchTeam)
		.leftJoin(table.team, eq(table.matchTeam.teamId, table.team.id))
		.where(eq(table.matchTeam.matchId, id))
		.orderBy(table.matchTeam.position);

	// Get maps data
	const maps = await db
		.select({
			map: table.map,
			matchMap: table.matchMap
		})
		.from(table.matchMap)
		.leftJoin(table.map, eq(table.matchMap.mapId, table.map.id))
		.where(eq(table.matchMap.matchId, id))
		.orderBy(table.matchMap.order);
	// Filter out any null teams or maps
	const validTeams = teams.filter(
		(t): t is typeof t & { team: NonNullable<typeof t.team> } => t.team !== null
	);

	const validMaps = maps.filter(
		(m): m is typeof m & { map: NonNullable<typeof m.map> } => m.map !== null
	);

	// Transform database event to expected Event type
	const event: Event = {
		...match.event,
		server: (match.event.server === 'calabiyau' ? 'calabiyau' : 'strinova') as
			| 'calabiyau'
			| 'strinova',
		format: (match.event.format === 'lan'
			? 'lan'
			: match.event.format === 'online'
				? 'online'
				: 'hybrid') as 'lan' | 'online' | 'hybrid',
		region: match.event.region as Region,
		status: match.event.status as 'upcoming' | 'live' | 'finished' | 'cancelled' | 'postponed',
		stages: [],
		organizers: [],
		participants: []
	};

	const result = {
		id: -1,
		battleOf: (format || 'BO1') as 'BO1' | 'BO3' | 'BO5',
		maps: validMaps.map((m) => ({
			map: m.map.id as GameMap,
			pickerId: m.matchMap.map_picker_position ?? undefined,
			pickedSide: m.matchMap.side === 0 ? 'Attack' : ('Defense' as 'Attack' | 'Defense')
		})),
		teams: validTeams.map((t) => ({
			team: t.team.id,
			score: t.matchTeam.score
		})) as [AppMatch['teams'][0], AppMatch['teams'][1]],
		event
	};

	return result;
}
