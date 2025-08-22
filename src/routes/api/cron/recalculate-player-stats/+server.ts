import { json } from '@sveltejs/kit';
import { recalculateAllPlayerStats } from '$lib/server/data/stats';
import { db } from '$lib/server/db';
import { CRON_SECRET } from '$env/static/private';

export async function GET({ request }) {
	// Verify this is a legitimate Vercel cron job request
	if (request.headers.get('Authorization') !== `Bearer ${CRON_SECRET}`) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		console.info('[Cron][RecalculatePlayerStats] Starting daily player stats recalculation...');

		await recalculateAllPlayerStats(db, {
			snapshotReason: 'periodic'
		});

		console.info(
			'[Cron][RecalculatePlayerStats] Daily player stats recalculation completed successfully'
		);

		return json({
			success: true,
			message: 'Player stats recalculated successfully',
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		console.error('[Cron][RecalculatePlayerStats] Error during player stats recalculation:', error);

		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error occurred',
				timestamp: new Date().toISOString()
			},
			{ status: 500 }
		);
	}
}
