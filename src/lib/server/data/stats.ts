import { and, eq, sql } from 'drizzle-orm';
import * as schema from '$lib/server/db/schemas';
import { randomUUID } from 'crypto';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';

type RecalcOptions = {
	/** Save a snapshot into history tables with this reason (optional). */
	snapshotReason?: (typeof schema.PLAYER_STATS_UPDATE_REASONS)[number];
	/** Watermark for incremental updates (ignored for now; see TODO). */
	sinceMs?: number;
	/** Upsert batch size. */
	batchSize?: number;
};

/**
 * Recalculates all player stats (overall + per-character) using set-based SQL
 * and safe upserts. Time fields are intentionally left NULL for now.
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

	// Begin a transaction (IMMEDIATE to lock early on SQLite/libSQL).
	await db.run(sql`BEGIN IMMEDIATE`);
	try {
		// ───────────────────────────── Phase 1: Overall player aggregates ─────────────────────────────
		console.info(`${logp} Phase 1: aggregating overall player stats`);

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
			// .where(sql`1=1 ${sinceGame}`) // TODO: enable once playedAt exists
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
			// .where(sql`1=1 ${sinceGame}`) // TODO: enable once playedAt exists
			.groupBy(schema.gameAccount.playerId)
			.as('win_stats');

		const eventAgg = db
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

		const allPlayerStatsData = await db
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

		type PlayerAggRow = {
			playerId: string;
			totalGames: number;
			totalWins: number;
			totalKills: number;
			totalDeaths: number;
			totalAssists: number;
			totalKnocks: number;
			totalScore: number;
			totalDamage: number;
			eventsCount: number;
		};

		const playerRows = (allPlayerStatsData as PlayerAggRow[]).map((p) => {
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
				playerRating: tg > 0 ? ts / tg / 200 : 0,
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

		console.info(`${logp} Phase 1: upserting ${playerRows.length} player rows`);
		for (let i = 0; i < playerRows.length; i += batchSize) {
			const batch = playerRows.slice(i, i + batchSize);
			await db
				.insert(schema.playerStats)
				.values(batch)
				.onConflictDoUpdate({
					target: schema.playerStats.playerId,
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
						playerRating: sql`excluded.player_rating`,
						eventsCount: sql`excluded.events_count`,
						lastGameAt: sql`excluded.last_game_at`, // TODO: will be Date once populated
						lastEventAt: sql`excluded.last_event_at`, // TODO: will be Date once populated
						updatedAt: sql`excluded.updated_at`
					}
				});
		}

		// ───────────────────────────── Phase 2: Per-character aggregates ─────────────────────────────
		console.info(`${logp} Phase 2: aggregating per-character stats`);

		const characterStatsQuery = sql`
      WITH unpivoted AS (
        SELECT account_id, game_id, team_id, character_first_half AS character_id, kills, deaths, assists, knocks, score, damage
        FROM game_player_score WHERE character_first_half IS NOT NULL
        UNION ALL
        SELECT account_id, game_id, team_id, character_second_half AS character_id, kills, deaths, assists, knocks, score, damage
        FROM game_player_score WHERE character_second_half IS NOT NULL
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
        FROM unpivoted u
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
          FROM game_player_score WHERE character_first_half IS NOT NULL
          UNION ALL
          SELECT account_id, game_id, team_id, character_second_half AS character_id
          FROM game_player_score WHERE character_second_half IS NOT NULL
        ) x
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

		const charRowsRaw = (await db.all(characterStatsQuery)) as CharAggRow[];

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

		console.info(`${logp} Phase 2: upserting ${charRows.length} character rows`);
		for (let i = 0; i < charRows.length; i += batchSize) {
			const batch = charRows.slice(i, i + batchSize);
			await db
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

		// ───────────────────────────── Phase 3 (optional): history snapshot ─────────────────────────────
		if (opts.snapshotReason) {
			console.info(`${logp} Phase 3: creating history snapshot (reason="${opts.snapshotReason}")`);
			const nowDate = new Date(); // Drizzle timestamp_ms expects Date

			const currentPlayers = (await db
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
				await db
					.insert(schema.playerStatsHistory)
					.values(playerHistoryRows.slice(i, i + batchSize));
			}

			const currentCharStats = (await db
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
				// createdAt has default
			}));
			for (let i = 0; i < charHistoryRows.length; i += batchSize) {
				await db
					.insert(schema.playerCharacterStatsHistory)
					.values(charHistoryRows.slice(i, i + batchSize));
			}

			console.info(`${logp} Phase 3: history snapshot done`);
		}

		await db.run(sql`COMMIT`);
		console.info(`${logp} success`);
	} catch (e) {
		await db.run(sql`ROLLBACK`);
		console.error(`${logp} failed, transaction rolled back`, e);
		throw e;
	}
}

export interface PlayerRating {
	playerId: string;
	rating: number;
}

/**
 * Get player ratings from the materialized table
 */
export async function getAllPlayersRatings(
	db: LibSQLDatabase<typeof schema>,
	limit: number = 1000
): Promise<PlayerRating[]> {
	const stats = await db
		.select({
			playerId: schema.playerStats.playerId,
			rating: schema.playerStats.playerRating
		})
		.from(schema.playerStats)
		.orderBy(sql`${schema.playerStats.playerRating} DESC`)
		.limit(limit);

	return stats;
}
