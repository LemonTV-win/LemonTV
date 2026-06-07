import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { count } from 'drizzle-orm';
import { player, team, event, organizer, match, deletedRecord } from '$lib/server/db/schema';

type FromArg = Parameters<ReturnType<typeof db.select>['from']>[0];

async function tableCount(table: FromArg): Promise<number> {
	const [row] = await db.select({ value: count() }).from(table);
	return row?.value ?? 0;
}

export const load: PageServerLoad = async () => {
	const [players, teams, events, organizers, matches, trashed] = await Promise.all([
		tableCount(player),
		tableCount(team),
		tableCount(event),
		tableCount(organizer),
		tableCount(match),
		tableCount(deletedRecord)
	]);

	return {
		stats: { players, teams, events, organizers, matches, trashed }
	};
};
