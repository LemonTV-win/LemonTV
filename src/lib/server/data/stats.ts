import { LibSQLDatabase } from 'drizzle-orm/libsql';
import { and, eq, sql, inArray } from 'drizzle-orm';
import * as math from 'mathjs';
import { randomUUID } from 'node:crypto';
import * as schema from '$lib/server/db/schemas';

type RecalcOptions = {
	/** Save a snapshot into history tables with this reason (optional). */
	snapshotReason?: (typeof schema.PLAYER_STATS_UPDATE_REASONS)[number];
	/** Watermark for incremental updates (ignored for now; see TODO). */
	sinceMs?: number;
	/** Upsert batch size. */
	batchSize?: number;
};

// Helper interface for the raw performance data needed by the model
interface PerformanceRecord {
	playerId: string;
	opponents: string[];
	performanceScore: number;
}

/**
 * Rating v1.0: Average Score adjusted around 1.0 by dividing by 200
 *
 * Calculates player ratings using the legacy rating system.
 * This function determines player skill by analyzing their performance across all games.
 * @param aggregates - Array of player aggregates.
 * @returns A Map of player IDs to their calculated legacy rating.
 */
function calculateRatingV1(
	aggregates: Array<{ playerId: string; totalScore: number; totalGames: number }>
): Map<string, number> {
	const ratings = new Map<string, number>();
	for (const a of aggregates) {
		const games = Number(a.totalGames || 0);
		const score = Number(a.totalScore || 0);
		ratings.set(a.playerId, games > 0 ? score / games / 200 : 0);
	}
	return ratings;
}

/**
 * Rating v2.0: Ridge Regression
 *
 * Calculates player ratings using an unweighted ridge regression model.
 * This function determines player skill by analyzing performance against specific opponents.
 * @param performanceData - Array of individual game performances.
 * @param lambda - The regularization strength to prevent overfitting.
 * @returns A Map of player IDs to their calculated regression rating.
 */
function calculateRatingV2(
	performanceData: PerformanceRecord[],
	lambda: number = 2.5
): Map<string, number> {
	const allPlayerIds = new Set<string>();
	performanceData.forEach((record) => {
		allPlayerIds.add(record.playerId);
		record.opponents.forEach((opp) => allPlayerIds.add(opp));
	});

	if (allPlayerIds.size === 0) {
		return new Map();
	}

	const featureMap: Map<string, number> = new Map();
	Array.from(allPlayerIds).forEach((id, index) => {
		featureMap.set(`player_${id}`, index);
	});
	const numFeatures = featureMap.size;
	const N = performanceData.length;

	// Standardize performance score (y) to center the data
	const scores = performanceData.map((p) => p.performanceScore);
	const meanScore = math.mean(scores) as number;
	const stdDevScore = math.std(scores, 'uncorrected') as number;
	const y_array =
		stdDevScore > 0 ? scores.map((s) => (s - meanScore) / stdDevScore) : scores.map(() => 0);

	const X_array: number[][] = Array(N)
		.fill(0)
		.map(() => Array(numFeatures).fill(0));

	for (let i = 0; i < N; i++) {
		const record = performanceData[i];
		const playerIndex = featureMap.get(`player_${record.playerId}`);
		if (playerIndex !== undefined) X_array[i][playerIndex] = 1;

		const numOpponents = record.opponents.length;
		if (numOpponents > 0) {
			record.opponents.forEach((oppId) => {
				const oppIndex = featureMap.get(`player_${oppId}`);
				if (oppIndex !== undefined) X_array[i][oppIndex] -= 1 / numOpponents;
			});
		}
	}

	const X = math.matrix(X_array);
	const y = math.matrix(y_array);

	const Xt = math.transpose(X) as math.Matrix;
	const XtX = math.multiply(Xt, X) as math.Matrix;
	const identityMatrix = math.identity(numFeatures) as math.Matrix;
	const lambdaI = math.multiply(lambda, identityMatrix) as math.Matrix;

	const termToInvert = math.add(XtX, lambdaI) as math.Matrix;
	const invertedTerm = math.inv(termToInvert);
	const Xty = math.multiply(Xt, y);
	const theta = (math.multiply(invertedTerm, Xty) as any).toArray() as number[];

	const ratingsMap = new Map<string, number>();
	featureMap.forEach((index, featureName) => {
		const playerId = featureName.substring('player_'.length);
		// Scale the raw rating for better readability (e.g., to a 1000-2000 range)
		const scaledRating = meanScore > 0 ? 1 + (theta[index] * stdDevScore) / meanScore : 1.0;
		ratingsMap.set(playerId, scaledRating);
	});

	return ratingsMap;
}

/**
 * Recalculates all player stats (overall + per-character) using set-based SQL
 * for aggregations safe upserts and an in-memory regression model for player ratings.
 * Time fields are intentionally left NULL for now.
 */
export async function recalculateAllPlayerStats(
	db: LibSQLDatabase<typeof schema>,
	opts: RecalcOptions = {}
): Promise<void> {
	const logp = '[PlayerStats][recalculateAllPlayerStats]';
	const batchSize = opts.batchSize ?? 500;

	// We don't have game.playedAt / event.startDate yet, so we ignore sinceMs for now.
	// TODO: When you add playedAt (or match.startedAt) / event.startDate, re-enable dynamic "since" predicates.
	// const sinceGame = opts.sinceMs ? sql`AND ${schema.game.playedAt} >= ${opts.sinceMs}` : sql``;
	// const sinceEvent = opts.sinceMs ? sql`AND ${schema.event.startDate} >= ${opts.sinceMs}` : sql``;

	console.info(
		`${logp} starting... ${opts.sinceMs ? `(since ${new Date(opts.sinceMs).toISOString()} — ignored for now)` : ''}`
	);

	await db.transaction(async (tx) => {
		// ────────────────── Phase 1: Fetch Raw Data for Regression Model ───────────────────
		console.info(`${logp} Phase 1: Fetching raw data for regression model`);

		// This SQL query is the most crucial part for the new model.
		// It gets every player's performance score and their opponents for every game.
		const performanceRecordsQuery = sql`
			WITH game_opponents AS (
				SELECT
					g.id AS game_id,
					gps.account_id,
					json_group_array(opp_p.id) AS opponent_ids
				FROM game g
				JOIN game_player_score gps ON gps.game_id = g.id
				JOIN game_team gt ON gt.team_id = gps.team_id
				JOIN game_team opponent_team ON opponent_team.game_id = g.id AND opponent_team.position != gt.position
				JOIN game_player_score opponent_gps ON opponent_gps.team_id = opponent_team.team_id
				JOIN game_account opp_ga ON opp_ga.account_id = opponent_gps.account_id
				JOIN player opp_p ON opp_p.id = opp_ga.player_id
				GROUP BY g.id, gps.account_id
			)
			SELECT
				p.id as playerId,
				-- This is our performance metric. Using raw score is a good start.
				gps.score as performanceScore,
				opp.opponent_ids as opponents
			FROM game_player_score gps
			JOIN game_account ga ON ga.account_id = gps.account_id
			JOIN player p ON p.id = ga.player_id
			JOIN game_opponents opp ON opp.game_id = gps.game_id AND opp.account_id = gps.account_id;
		`;
		const rawRecords = (await tx.all(performanceRecordsQuery)) as {
			playerId: string;
			performanceScore: number;
			opponents: string; // Comes from DB as a JSON string
		}[];

		const performanceData: PerformanceRecord[] = rawRecords.map((r) => ({
			...r,
			opponents: JSON.parse(r.opponents) // Deserialize the opponents string
		}));

		// Calculate the new, advanced ratings in memory
		const ratingsV2 = calculateRatingV2(performanceData);
		console.log(`${logp} Calculated new ratings for ${ratingsV2.size} players.`);

		// ────────────────── Phase 2: Aggregate Traditional Stats (K/D, Wins, etc.) ─────────
		console.info(`${logp} Phase 2: Aggregating traditional player stats`);

		const coreStatsAgg = tx
			.select({
				playerId: schema.gameAccount.playerId,
				totalGames: sql<number>`count(distinct ${schema.gamePlayerScore.gameId})`.as('totalGames'),
				totalKills: sql<number>`sum(${schema.gamePlayerScore.kills})`.as('totalKills'),
				totalDeaths: sql<number>`sum(${schema.gamePlayerScore.deaths})`.as('totalDeaths'),
				totalAssists: sql<number>`sum(${schema.gamePlayerScore.assists})`.as('totalAssists'),
				totalKnocks: sql<number>`sum(${schema.gamePlayerScore.knocks})`.as('totalKnocks'),
				totalScore: sql<number>`sum(${schema.gamePlayerScore.score})`.as('totalScore'),
				totalDamage: sql<number>`sum(${schema.gamePlayerScore.damage})`.as('totalDamage')
			})
			.from(schema.gamePlayerScore)
			.innerJoin(
				schema.gameAccount,
				eq(schema.gamePlayerScore.accountId, schema.gameAccount.accountId)
			)
			.innerJoin(schema.game, eq(schema.gamePlayerScore.gameId, schema.game.id))
			// .where(sql`1=1 ${sinceGame}`) // TODO: enable once playedAt exists
			.groupBy(schema.gameAccount.playerId)
			.as('core_stats');

		const winAgg = tx
			.select({
				playerId: schema.gameAccount.playerId,
				totalWins: sql<number>`count(distinct ${schema.game}.id)`.as('totalWins')
			})
			.from(schema.game)
			.innerJoin(
				schema.gameTeam,
				and(
					eq(schema.game.id, schema.gameTeam.gameId),
					eq(schema.game.winner, schema.gameTeam.position)
				)
			)
			.innerJoin(schema.gamePlayerScore, eq(schema.gameTeam.teamId, schema.gamePlayerScore.teamId))
			.innerJoin(
				schema.gameAccount,
				eq(schema.gamePlayerScore.accountId, schema.gameAccount.accountId)
			)
			// .where(sql`1=1 ${sinceGame}`) // TODO: enable once playedAt exists
			.groupBy(schema.gameAccount.playerId)
			.as('win_stats');

		const eventAgg = tx
			.select({
				playerId: schema.eventTeamPlayer.playerId,
				eventsCount: sql<number>`count(distinct ${schema.eventTeamPlayer.eventId})`.as(
					'eventsCount'
				)
			})
			.from(schema.eventTeamPlayer)
			// .innerJoin(schema.event, eq(schema.eventTeamPlayer.eventId, schema.event.id)) // TODO: when event.startDate exists
			// .where(sql`1=1 ${sinceEvent}`) // TODO
			.groupBy(schema.eventTeamPlayer.playerId)
			.as('event_stats');

		const allPlayerStatsData = await tx
			.select({
				playerId: schema.player.id,
				totalGames: sql<number>`coalesce(${coreStatsAgg.totalGames}, 0)`,
				totalWins: sql<number>`coalesce(${winAgg.totalWins}, 0)`,
				totalKills: sql<number>`coalesce(${coreStatsAgg.totalKills}, 0)`,
				totalDeaths: sql<number>`coalesce(${coreStatsAgg.totalDeaths}, 0)`,
				totalAssists: sql<number>`coalesce(${coreStatsAgg.totalAssists}, 0)`,
				totalKnocks: sql<number>`coalesce(${coreStatsAgg.totalKnocks}, 0)`,
				totalScore: sql<number>`coalesce(${coreStatsAgg.totalScore}, 0)`,
				totalDamage: sql<number>`coalesce(${coreStatsAgg.totalDamage}, 0)`,
				eventsCount: sql<number>`coalesce(${eventAgg.eventsCount}, 0)`
			})
			.from(schema.player)
			.leftJoin(coreStatsAgg, eq(schema.player.id, coreStatsAgg.playerId))
			.leftJoin(winAgg, eq(schema.player.id, winAgg.playerId))
			.leftJoin(eventAgg, eq(schema.player.id, eventAgg.playerId));

		// ────────────────── Phase 3: Combine and Upsert Player Stats ───────────────────────
		console.info(
			`${logp} Phase 3: Combining and upserting ${allPlayerStatsData.length} player rows`
		);

		const playerRows = allPlayerStatsData.map((p) => {
			const tg = Number(p.totalGames || 0);
			const tw = Number(p.totalWins || 0);
			const tk = Number(p.totalKills || 0);
			const td = Number(p.totalDeaths || 0);
			const ts = Number(p.totalScore || 0);
			const dmg = Number(p.totalDamage || 0);

			return {
				playerId: p.playerId,
				totalGames: tg,
				totalWins: tw,
				totalLosses: Math.max(0, tg - tw),
				totalKills: tk,
				totalDeaths: td,
				totalAssists: Number(p.totalAssists || 0),
				totalKnocks: Number(p.totalKnocks || 0),
				totalScore: ts,
				totalDamage: dmg,
				winRate: tg > 0 ? tw / tg : 0,
				kd: td > 0 ? tk / td : tk,
				averageScore: tg > 0 ? ts / tg : 0,
				averageDamage: tg > 0 ? dmg / tg : 0,
				playerRating: ratingsV2.get(p.playerId) ?? 1.0,
				eventsCount: Number(p.eventsCount || 0),

				// TODO: keep NULL for now; when you add game.playedAt or match.startedAt, set Date here
				// lastGameAt: new Date(ms),
				lastGameAt: null as Date | null,

				// TODO: keep NULL for now; when you add event.startDate, set Date here
				// lastEventAt: new Date(ms),
				lastEventAt: null as Date | null,

				updatedAt: sql`(unixepoch() * 1000)`
			};
		});

		for (let i = 0; i < playerRows.length; i += batchSize) {
			const batch = playerRows.slice(i, i + batchSize);
			await tx
				.insert(schema.playerStats)
				.values(batch)
				.onConflictDoUpdate({
					target: schema.playerStats.playerId,
					set: {
						// Update all fields, including the new playerRating
						totalGames: sql`excluded.total_games`,
						totalWins: sql`excluded.total_wins`,
						totalLosses: sql`excluded.total_losses`,
						totalKills: sql`excluded.total_kills`,
						totalDeaths: sql`excluded.total_deaths`,
						totalAssists: sql`excluded.total_assists`,
						totalKnocks: sql`excluded.total_knocks`,
						totalScore: sql`excluded.total_score`,
						totalDamage: sql`excluded.total_damage`,
						winRate: sql`excluded.win_rate`,
						kd: sql`excluded.kd`,
						averageScore: sql`excluded.average_score`,
						averageDamage: sql`excluded.average_damage`,
						playerRating: sql`excluded.player_rating`,
						eventsCount: sql`excluded.events_count`,
						lastGameAt: sql`excluded.last_game_at`, // TODO: will be Date once populated
						lastEventAt: sql`excluded.last_event_at`, // TODO: will be Date once populated
						updatedAt: sql`excluded.updated_at`
					}
				});
		}

		// ────────────────── Phase 4: Per-character aggregates ───────────────────
		console.info(`${logp} Phase 4: Aggregating per-character stats`);

		const characterStatsQuery = sql`
  WITH unpivoted AS (
    SELECT account_id, game_id, team_id, character_first_half AS character_id, kills, deaths, assists, knocks, score, damage
    FROM game_player_score WHERE character_first_half IS NOT NULL AND TRIM(character_first_half) <> ''
    UNION ALL
    SELECT account_id, game_id, team_id, character_second_half AS character_id, kills, deaths, assists, knocks, score, damage
    FROM game_player_score WHERE character_second_half IS NOT NULL AND TRIM(character_second_half) <> ''
  ),
  -- keep only known characters (avoids FK violations)
  unpivoted_valid AS (
    SELECT u.*
    FROM unpivoted u
    JOIN character c ON c.id = u.character_id
  ),
  agg AS (
    SELECT
      ga.player_id AS playerId,
      u.character_id AS characterId,
      COUNT(DISTINCT u.game_id) AS totalGames,
      SUM(u.kills) AS totalKills,
      SUM(u.deaths) AS totalDeaths,
      SUM(u.assists) AS totalAssists,
      SUM(u.knocks) AS totalKnocks,
      SUM(u.score) AS totalScore,
      SUM(u.damage) AS totalDamage
    FROM unpivoted_valid u
    JOIN game_account ga ON ga.account_id = u.account_id
    JOIN game g ON g.id = u.game_id
    GROUP BY ga.player_id, u.character_id
  ),
  wins AS (
    SELECT
      ga.player_id AS playerId,
      x.character_id AS characterId,
      COUNT(DISTINCT x.game_id) AS totalWins
    FROM (
      SELECT account_id, game_id, team_id, character_first_half AS character_id
      FROM game_player_score
      WHERE character_first_half IS NOT NULL AND TRIM(character_first_half) <> ''
      UNION ALL
      SELECT account_id, game_id, team_id, character_second_half AS character_id
      FROM game_player_score
      WHERE character_second_half IS NOT NULL AND TRIM(character_second_half) <> ''
    ) x
    JOIN character c ON c.id = x.character_id
    JOIN game_account ga ON ga.account_id = x.account_id
    JOIN game g ON g.id = x.game_id
    JOIN game_team gt ON gt.game_id = g.id AND gt.team_id = x.team_id
    WHERE g.winner = gt.position
    GROUP BY ga.player_id, x.character_id
  )
  SELECT
    a.playerId, a.characterId, a.totalGames,
    COALESCE(w.totalWins, 0) AS totalWins,
    a.totalKills, a.totalDeaths, a.totalAssists, a.totalKnocks, a.totalScore, a.totalDamage
  FROM agg a
  LEFT JOIN wins w ON w.playerId = a.playerId AND w.characterId = a.characterId
`;

		type CharAggRow = {
			playerId: string;
			characterId: string;
			totalGames: number;
			totalWins: number;
			totalKills: number;
			totalDeaths: number;
			totalAssists: number;
			totalKnocks: number;
			totalScore: number;
			totalDamage: number;
		};

		const charRowsRaw = (await tx.all(characterStatsQuery)) as CharAggRow[];

		const charRows = charRowsRaw.map((r) => {
			const tg = Number(r.totalGames || 0);
			const tw = Number(r.totalWins || 0);
			const tk = Number(r.totalKills || 0);
			const td = Number(r.totalDeaths || 0);
			const ts = Number(r.totalScore || 0);
			const dmg = Number(r.totalDamage || 0);

			const winRate = tg > 0 ? tw / tg : 0;
			const kd = td > 0 ? tk / td : tk;
			const averageScore = tg > 0 ? ts / tg : 0;
			const averageDamage = tg > 0 ? dmg / tg : 0;

			// Same placeholder formula you used; easy to change later
			const superstringPower = winRate * 100 + kd * 10 + averageScore / 100;

			return {
				playerId: r.playerId,
				characterId: r.characterId,
				totalGames: tg,
				totalWins: tw,
				totalLosses: Math.max(0, tg - tw),
				totalKills: tk,
				totalDeaths: td,
				totalAssists: Number(r.totalAssists || 0),
				totalKnocks: Number(r.totalKnocks || 0),
				totalScore: ts,
				totalDamage: dmg,
				winRate,
				kd,
				averageScore,
				averageDamage,
				superstringPower,

				// TODO: keep NULL for now; when you add playedAt/match time, set Date here
				// lastGameAt: new Date(ms),
				lastGameAt: null as Date | null,

				updatedAt: sql`(unixepoch() * 1000)`
			};
		});

		console.info(`${logp} Phase 4: upserting ${charRows.length} character rows`);
		for (let i = 0; i < charRows.length; i += batchSize) {
			const batch = charRows.slice(i, i + batchSize);
			await tx
				.insert(schema.playerCharacterStats)
				.values(batch)
				.onConflictDoUpdate({
					target: [schema.playerCharacterStats.playerId, schema.playerCharacterStats.characterId],
					set: {
						totalGames: sql`excluded.total_games`,
						totalWins: sql`excluded.total_wins`,
						totalLosses: sql`excluded.total_losses`,
						totalKills: sql`excluded.total_kills`,
						totalDeaths: sql`excluded.total_deaths`,
						totalAssists: sql`excluded.total_assists`,
						totalKnocks: sql`excluded.total_knocks`,
						totalScore: sql`excluded.total_score`,
						totalDamage: sql`excluded.total_damage`,
						winRate: sql`excluded.win_rate`,
						kd: sql`excluded.kd`,
						averageScore: sql`excluded.average_score`,
						averageDamage: sql`excluded.average_damage`,
						superstringPower: sql`excluded.superstring_power`,
						lastGameAt: sql`excluded.last_game_at`, // TODO: will be Date once populated
						updatedAt: sql`excluded.updated_at`
					}
				});
		}

		// ────────────────── Phase 5: History snapshot (optional) ─────────────────────────
		if (opts.snapshotReason) {
			console.info(`${logp} Phase 5: creating history snapshot (reason="${opts.snapshotReason}")`);
			const nowDate = new Date();

			const currentPlayers = (await tx
				.select()
				.from(schema.playerStats)) as (typeof schema.playerStats.$inferSelect)[];
			const playerHistoryRows = currentPlayers.map((p) => ({
				id: randomUUID(),
				playerId: p.playerId,
				totalGames: p.totalGames,
				totalWins: p.totalWins,
				totalLosses: p.totalLosses,
				totalKills: p.totalKills,
				totalDeaths: p.totalDeaths,
				totalAssists: p.totalAssists,
				totalKnocks: p.totalKnocks,
				totalScore: p.totalScore,
				totalDamage: p.totalDamage,
				winRate: p.winRate,
				kd: p.kd,
				averageScore: p.averageScore,
				averageDamage: p.averageDamage,
				playerRating: p.playerRating,
				eventsCount: p.eventsCount,
				snapshotDate: nowDate,
				reason: opts.snapshotReason!
				// createdAt has default
			}));
			for (let i = 0; i < playerHistoryRows.length; i += batchSize) {
				await tx
					.insert(schema.playerStatsHistory)
					.values(playerHistoryRows.slice(i, i + batchSize));
			}

			const currentCharStats = (await tx
				.select()
				.from(schema.playerCharacterStats)) as (typeof schema.playerCharacterStats.$inferSelect)[];
			const charHistoryRows = currentCharStats.map((c) => ({
				id: randomUUID(),
				playerId: c.playerId,
				characterId: c.characterId,
				totalGames: c.totalGames,
				totalWins: c.totalWins,
				totalLosses: c.totalLosses,
				totalKills: c.totalKills,
				totalDeaths: c.totalDeaths,
				totalAssists: c.totalAssists,
				totalKnocks: c.totalKnocks,
				totalScore: c.totalScore,
				totalDamage: c.totalDamage,
				winRate: c.winRate,
				kd: c.kd,
				averageScore: c.averageScore,
				averageDamage: c.averageDamage,
				superstringPower: c.superstringPower,
				snapshotDate: nowDate,
				reason: opts.snapshotReason!
			}));
			for (let i = 0; i < charHistoryRows.length; i += batchSize) {
				await tx
					.insert(schema.playerCharacterStatsHistory)
					.values(charHistoryRows.slice(i, i + batchSize));
			}

			console.info(`${logp} Phase 5: history snapshot done`);
		}
	}); // end transaction

	console.info(`${logp} success`);
}

/**
 * Read-only helper that returns legacy and new ratings for comparison.
 * - Legacy rating (v1): average score per game divided by 200
 * - New rating (v2): ridge-regression rating computed for given lambda values
 *
 * This function only reads data and does not write to the database.
 */
export async function readPlayerRatingsForComparison(
	db: LibSQLDatabase<typeof schema>,
	lambdas: number[] = [5, 10, 15, 20, 30]
): Promise<
	Array<{
		playerId: string;
		playerName: string;
		ratingv1: number;
		v2Ratings: Record<string, number>;
		totalGames: number;
		totalWins: number;
		totalLosses: number;
		totalKills: number;
		totalDeaths: number;
		totalAssists: number;
		totalKnocks: number;
		totalScore: number;
		totalDamage: number;
		winRate: number;
		kd: number;
		averageScore: number;
		averageDamage: number;
		eventsCount: number;
	}>
> {
	// Fetch minimal raw data needed to compute both legacy and v2 ratings
	const performanceRecordsQuery = sql`
        WITH game_opponents AS (
            SELECT
                g.id AS game_id,
                gps.account_id,
                json_group_array(opp_p.id) AS opponent_ids
            FROM game g
            JOIN game_player_score gps ON gps.game_id = g.id
            JOIN game_team gt ON gt.team_id = gps.team_id
            JOIN game_team opponent_team ON opponent_team.game_id = g.id AND opponent_team.position != gt.position
            JOIN game_player_score opponent_gps ON opponent_gps.team_id = opponent_team.team_id
            JOIN game_account opp_ga ON opp_ga.account_id = opponent_gps.account_id
            JOIN player opp_p ON opp_p.id = opp_ga.player_id
            GROUP BY g.id, gps.account_id
        )
        SELECT
            p.id as playerId,
            p.name as playerName,
            gps.score as performanceScore,
            opp.opponent_ids as opponents
        FROM game_player_score gps
        JOIN game_account ga ON ga.account_id = gps.account_id
        JOIN player p ON p.id = ga.player_id
        JOIN game_opponents opp ON opp.game_id = gps.game_id AND opp.account_id = gps.account_id;
    `;

	const rawRecords = (await db.all(performanceRecordsQuery)) as {
		playerId: string;
		playerName: string;
		performanceScore: number | null;
		opponents: string; // JSON string array
	}[];

	// Build performance data for regression
	const performanceData: PerformanceRecord[] = rawRecords.map((r) => ({
		playerId: r.playerId,
		performanceScore: Number(r.performanceScore ?? 0),
		opponents: JSON.parse(r.opponents)
	}));

	// Compute v2 ratings for each lambda
	const v2Maps: Map<string, number>[] = lambdas.map((lambda) =>
		calculateRatingV2(performanceData, lambda)
	);

	// Name map for players seen in raw records
	const nameById = new Map<string, string>();
	for (const r of rawRecords) {
		if (!nameById.has(r.playerId) && r.playerName) nameById.set(r.playerId, r.playerName);
	}

	const lambdaKeys = lambdas.map((l) => String(l));

	// Aggregate traditional stats only for involved players
	const involvedPlayerIds = Array.from(new Set(rawRecords.map((r) => r.playerId)));

	const rows: Array<{
		playerId: string;
		playerName: string;
		ratingv1: number;
		v2Ratings: Record<string, number>;
		totalGames: number;
		totalWins: number;
		totalLosses: number;
		totalKills: number;
		totalDeaths: number;
		totalAssists: number;
		totalKnocks: number;
		totalScore: number;
		totalDamage: number;
		winRate: number;
		kd: number;
		averageScore: number;
		averageDamage: number;
		eventsCount: number;
	}> = [];

	if (involvedPlayerIds.length === 0) return rows;

	const coreStatsAgg = db
		.select({
			playerId: schema.gameAccount.playerId,
			totalGames: sql<number>`count(distinct ${schema.gamePlayerScore.gameId})`.as('totalGames'),
			totalKills: sql<number>`sum(${schema.gamePlayerScore.kills})`.as('totalKills'),
			totalDeaths: sql<number>`sum(${schema.gamePlayerScore.deaths})`.as('totalDeaths'),
			totalAssists: sql<number>`sum(${schema.gamePlayerScore.assists})`.as('totalAssists'),
			totalKnocks: sql<number>`sum(${schema.gamePlayerScore.knocks})`.as('totalKnocks'),
			totalScore: sql<number>`sum(${schema.gamePlayerScore.score})`.as('totalScore'),
			totalDamage: sql<number>`sum(${schema.gamePlayerScore.damage})`.as('totalDamage')
		})
		.from(schema.gamePlayerScore)
		.innerJoin(
			schema.gameAccount,
			eq(schema.gamePlayerScore.accountId, schema.gameAccount.accountId)
		)
		.innerJoin(schema.game, eq(schema.gamePlayerScore.gameId, schema.game.id))
		.groupBy(schema.gameAccount.playerId)
		.as('core_stats');

	const winAgg = db
		.select({
			playerId: schema.gameAccount.playerId,
			totalWins: sql<number>`count(distinct ${schema.game}.id)`.as('totalWins')
		})
		.from(schema.game)
		.innerJoin(
			schema.gameTeam,
			and(
				eq(schema.game.id, schema.gameTeam.gameId),
				eq(schema.game.winner, schema.gameTeam.position)
			)
		)
		.innerJoin(schema.gamePlayerScore, eq(schema.gameTeam.teamId, schema.gamePlayerScore.teamId))
		.innerJoin(
			schema.gameAccount,
			eq(schema.gamePlayerScore.accountId, schema.gameAccount.accountId)
		)
		.groupBy(schema.gameAccount.playerId)
		.as('win_stats');

	const eventAgg = db
		.select({
			playerId: schema.eventTeamPlayer.playerId,
			eventsCount: sql<number>`count(distinct ${schema.eventTeamPlayer.eventId})`.as('eventsCount')
		})
		.from(schema.eventTeamPlayer)
		.groupBy(schema.eventTeamPlayer.playerId)
		.as('event_stats');

	const aggRows = await db
		.select({
			playerId: schema.player.id,
			totalGames: sql<number>`coalesce(${coreStatsAgg.totalGames}, 0)`,
			totalWins: sql<number>`coalesce(${winAgg.totalWins}, 0)`,
			totalKills: sql<number>`coalesce(${coreStatsAgg.totalKills}, 0)`,
			totalDeaths: sql<number>`coalesce(${coreStatsAgg.totalDeaths}, 0)`,
			totalAssists: sql<number>`coalesce(${coreStatsAgg.totalAssists}, 0)`,
			totalKnocks: sql<number>`coalesce(${coreStatsAgg.totalKnocks}, 0)`,
			totalScore: sql<number>`coalesce(${coreStatsAgg.totalScore}, 0)`,
			totalDamage: sql<number>`coalesce(${coreStatsAgg.totalDamage}, 0)`,
			eventsCount: sql<number>`coalesce(${eventAgg.eventsCount}, 0)`
		})
		.from(schema.player)
		.leftJoin(coreStatsAgg, eq(schema.player.id, coreStatsAgg.playerId))
		.leftJoin(winAgg, eq(schema.player.id, winAgg.playerId))
		.leftJoin(eventAgg, eq(schema.player.id, eventAgg.playerId))
		.where(inArray(schema.player.id, involvedPlayerIds));

	const aggById = new Map(aggRows.map((r) => [r.playerId, { ...r }]));

	// Compute rating v1 using aggregates (avg score per game / 200)
	const v1Map = calculateRatingV1(
		aggRows.map((r) => ({
			playerId: r.playerId,
			totalScore: Number(r.totalScore || 0),
			totalGames: Number(r.totalGames || 0)
		}))
	);

	for (const playerId of involvedPlayerIds) {
		const legacy = v1Map.get(playerId) ?? 0;
		const v2: Record<string, number> = {};
		for (let i = 0; i < lambdas.length; i++) {
			const map = v2Maps[i];
			v2[lambdaKeys[i]] = map.get(playerId) ?? 1.0;
		}
		const a = aggById.get(playerId);
		const tg = Number(a?.totalGames || 0);
		const tw = Number(a?.totalWins || 0);
		const tk = Number(a?.totalKills || 0);
		const td = Number(a?.totalDeaths || 0);
		const ts = Number(a?.totalScore || 0);
		const dmg = Number(a?.totalDamage || 0);
		const totalAssists = Number(a?.totalAssists || 0);
		const totalKnocks = Number(a?.totalKnocks || 0);
		const eventsCount = Number(a?.eventsCount || 0);

		const winRate = tg > 0 ? tw / tg : 0;
		const kd = td > 0 ? tk / td : tk;
		const averageScore = tg > 0 ? ts / tg : 0;
		const averageDamage = tg > 0 ? dmg / tg : 0;

		rows.push({
			playerId,
			playerName: nameById.get(playerId) || '',
			ratingv1: legacy,
			v2Ratings: v2,
			totalGames: tg,
			totalWins: tw,
			totalLosses: Math.max(0, tg - tw),
			totalKills: tk,
			totalDeaths: td,
			totalAssists,
			totalKnocks,
			totalScore: ts,
			totalDamage: dmg,
			winRate,
			kd,
			averageScore,
			averageDamage,
			eventsCount
		});
	}

	return rows;
}
