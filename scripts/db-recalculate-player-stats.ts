import { recalculateAllPlayerStats } from '../src/lib/server/data/stats';
import { db } from './lib/db';
import * as schema from '../src/lib/server/db/schema';

console.info('[Scripts][RecalculatePlayerStats] Recalculating player stats...');
await recalculateAllPlayerStats(db, {
	snapshotReason:
		(import.meta.env
			.PLAYER_STATS_UPDATE_REASON as (typeof schema.PLAYER_STATS_UPDATE_REASONS)[number]) ||
		'manual'
});
console.info('[Scripts][RecalculatePlayerStats] Player stats recalculated');
