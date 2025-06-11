import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, inArray } from 'drizzle-orm';
import type { Match as AppMatch } from '$lib/data/matches';
import type { Event } from '$lib/data/events';
import type { GameMap, Region } from '$lib/data/game';
import type { PlayerScore } from '$lib/data/matches';

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

	// Get games data
	const games = await db
		.select({
			game: table.game,
			map: table.map
		})
		.from(table.game)
		.leftJoin(table.map, eq(table.game.mapId, table.map.id))
		.where(eq(table.game.matchId, id))
		.orderBy(table.game.id);

	// Get game teams data
	const gameTeams = await db
		.select({
			gameTeam: table.gameTeam,
			team: table.team
		})
		.from(table.gameTeam)
		.leftJoin(table.team, eq(table.gameTeam.teamId, table.team.id))
		.where(
			inArray(
				table.gameTeam.gameId,
				games.map((g) => g.game.id)
			)
		);

	// Get player scores data
	const playerScores = await db
		.select({
			gamePlayerScore: table.gamePlayerScore,
			team: table.team
		})
		.from(table.gamePlayerScore)
		.leftJoin(table.team, eq(table.gamePlayerScore.teamId, table.team.id))
		.where(
			inArray(
				table.gamePlayerScore.gameId,
				games.map((g) => g.game.id)
			)
		);

	// Filter out any null teams or maps
	const validTeams = teams.filter(
		(t): t is typeof t & { team: NonNullable<typeof t.team> } => t.team !== null
	);

	const validMaps = maps.filter(
		(m): m is typeof m & { map: NonNullable<typeof m.map> } => m.map !== null
	);

	const validGames = games.filter(
		(g): g is typeof g & { map: NonNullable<typeof g.map> } => g.map !== null
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

	// Transform games data
	const transformedGames = validGames.map((game) => {
		const gameTeamData = gameTeams.filter((gt) => gt.gameTeam.gameId === game.game.id);
		const teamA = gameTeamData.find((gt) => gt.gameTeam.position === 0);
		const teamB = gameTeamData.find((gt) => gt.gameTeam.position === 1);

		const playerScoreData = playerScores.filter((ps) => ps.gamePlayerScore.gameId === game.game.id);
		const teamAScores = playerScoreData
			.filter((ps) => ps.gamePlayerScore.teamId === teamA?.gameTeam.teamId)
			.map((ps) => ({
				accountId: ps.gamePlayerScore.accountId,
				player: ps.gamePlayerScore.player,
				characters: [
					ps.gamePlayerScore.characterFirstHalf,
					ps.gamePlayerScore.characterSecondHalf
				] as [string | null, string | null],
				score: ps.gamePlayerScore.score,
				damageScore: ps.gamePlayerScore.damageScore,
				kills: ps.gamePlayerScore.kills,
				knocks: ps.gamePlayerScore.knocks,
				deaths: ps.gamePlayerScore.deaths,
				assists: ps.gamePlayerScore.assists,
				damage: ps.gamePlayerScore.damage
			}));

		const teamBScores = playerScoreData
			.filter((ps) => ps.gamePlayerScore.teamId === teamB?.gameTeam.teamId)
			.map((ps) => ({
				accountId: ps.gamePlayerScore.accountId,
				player: ps.gamePlayerScore.player,
				characters: [
					ps.gamePlayerScore.characterFirstHalf,
					ps.gamePlayerScore.characterSecondHalf
				] as [string | null, string | null],
				score: ps.gamePlayerScore.score,
				damageScore: ps.gamePlayerScore.damageScore,
				kills: ps.gamePlayerScore.kills,
				knocks: ps.gamePlayerScore.knocks,
				deaths: ps.gamePlayerScore.deaths,
				assists: ps.gamePlayerScore.assists,
				damage: ps.gamePlayerScore.damage
			}));

		// Ensure we have exactly 5 players per team
		const teamAScoresFixed = teamAScores.slice(0, 5) as [
			PlayerScore,
			PlayerScore,
			PlayerScore,
			PlayerScore,
			PlayerScore
		];
		const teamBScoresFixed = teamBScores.slice(0, 5) as [
			PlayerScore,
			PlayerScore,
			PlayerScore,
			PlayerScore,
			PlayerScore
		];

		return {
			id: game.game.id,
			map: game.map.id as GameMap,
			duration: game.game.duration,
			teams: [teamA?.team?.id || '', teamB?.team?.id || ''] as [string, string],
			result: [teamA?.gameTeam.score || 0, teamB?.gameTeam.score || 0] as [number, number],
			scores: [teamAScoresFixed, teamBScoresFixed] as [
				A: [PlayerScore, PlayerScore, PlayerScore, PlayerScore, PlayerScore],
				B: [PlayerScore, PlayerScore, PlayerScore, PlayerScore, PlayerScore]
			],
			winner: game.game.winner
		};
	});

	const result: AppMatch & { event: Event } = {
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
		games: transformedGames,
		event
	};

	return result;
}
