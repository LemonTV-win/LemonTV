import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { Match as AppMatch } from '$lib/data/matches';
import type { Event } from '$lib/data/events';
import type { GameMap, Region } from '$lib/data/game';
import type { PlayerScore } from '$lib/data/matches';
import { getPlayer } from './players';

// Helper function to map player names to their slugs
async function mapPlayerNamesToSlugs(playerNames: string[]): Promise<Record<string, string>> {
	const playerSlugMap: Record<string, string> = {};

	// Get unique player names to avoid duplicate lookups
	const uniqueNames = [...new Set(playerNames)];

	// Look up each player name to get their slug
	for (const playerName of uniqueNames) {
		const player = await getPlayer(playerName);
		if (player) {
			playerSlugMap[playerName] = player.slug;
		}
	}

	return playerSlugMap;
}

export async function getMatch(id: string): Promise<(AppMatch & { event: Event }) | null> {
	// Fetch the entire data graph in a single, comprehensive query
	const matchData = await db.query.match.findFirst({
		where: eq(table.match.id, id),
		with: {
			stage: {
				with: {
					event: true
				}
			},
			matchTeams: {
				with: { team: true },
				orderBy: (mt, { asc }) => [asc(mt.position)]
			},
			matchMaps: {
				with: { map: true },
				orderBy: (mm, { asc }) => [asc(mm.order)]
			},
			games: {
				orderBy: (g, { asc }) => [asc(g.id)],
				with: {
					map: true,
					gameTeams: {
						with: { team: true }
					},
					gamePlayerScores: true,
					gameVods: true
				}
			}
		}
	});

	if (!matchData || !matchData.stage?.event) {
		return null;
	}

	// Collect player names to fetch their slugs in a single batch
	const playerNames = matchData.games.flatMap((g) => g.gamePlayerScores.map((ps) => ps.player));
	const playerSlugMap = await mapPlayerNamesToSlugs(Array.from(new Set(playerNames)));

	const canonicalTeamA = matchData.matchTeams.find((mt) => mt.position === 0);
	const canonicalTeamB = matchData.matchTeams.find((mt) => mt.position === 1);

	// Shape the final response object from the nested data
	const { format } = matchData;
	const event = {
		...matchData.stage.event,
		server: (matchData.stage.event.server === 'calabiyau' ? 'calabiyau' : 'strinova') as
			| 'calabiyau'
			| 'strinova',
		format: (matchData.stage.event.format === 'lan'
			? 'lan'
			: matchData.stage.event.format === 'online'
				? 'online'
				: 'hybrid') as 'lan' | 'online' | 'hybrid',
		region: matchData.stage.event.region as Region,
		status: matchData.stage.event.status as
			| 'upcoming'
			| 'live'
			| 'finished'
			| 'cancelled'
			| 'postponed',
		stages: [],
		organizers: [],
		participants: []
	};

	const validMaps = matchData.matchMaps.filter(
		(m): m is typeof m & { map: NonNullable<typeof m.map> } => m.map !== null && m.action !== 'ban'
	);

	const transformedGames = matchData.games
		.filter((g): g is typeof g & { map: NonNullable<typeof g.map> } => g.map !== null)
		.map((game) => {
			const gameTeamA = game.gameTeams.find((gt) => gt.teamId === canonicalTeamA?.teamId);
			const gameTeamB = game.gameTeams.find((gt) => gt.teamId === canonicalTeamB?.teamId);

			let normalizedWinner: 0 | 1 | -1 = game.winner ?? -1;
			if (game.winner === 0 || game.winner === 1) {
				const originalWinningTeam = game.gameTeams.find((gt) => gt.position === game.winner);
				if (originalWinningTeam?.teamId === canonicalTeamA?.teamId) {
					normalizedWinner = 0;
				} else if (originalWinningTeam?.teamId === canonicalTeamB?.teamId) {
					normalizedWinner = 1;
				}
			}

			const mapPlayerScores = (teamId: string | undefined | null) =>
				game.gamePlayerScores
					.filter((ps) => ps.teamId === teamId)
					.map((ps) => ({
						accountId: ps.accountId,
						player: ps.player,
						playerSlug: playerSlugMap[ps.player],
						characters: [ps.characterFirstHalf, ps.characterSecondHalf] as [
							string | null,
							string | null
						],
						score: ps.score,
						damageScore: ps.damageScore,
						kills: ps.kills,
						knocks: ps.knocks,
						deaths: ps.deaths,
						assists: ps.assists,
						damage: ps.damage
					}));

			const teamAScores = mapPlayerScores(gameTeamA?.teamId);
			const teamBScores = mapPlayerScores(gameTeamB?.teamId);

			const fixedScores = (
				scores: typeof teamAScores
			): [PlayerScore, PlayerScore, PlayerScore, PlayerScore, PlayerScore] =>
				scores.slice(0, 5) as any;

			return {
				id: game.id,
				map: game.map.id as GameMap,
				duration: game.duration,
				teams: [gameTeamA?.team?.id || '', gameTeamB?.team?.id || ''] as [string, string],
				result: [gameTeamA?.score || 0, gameTeamB?.score || 0] as [number, number],
				scores: [fixedScores(teamAScores), fixedScores(teamBScores)] as [
					A: [PlayerScore, PlayerScore, PlayerScore, PlayerScore, PlayerScore],
					B: [PlayerScore, PlayerScore, PlayerScore, PlayerScore, PlayerScore]
				],
				winner: normalizedWinner,
				vods: game.gameVods.map((v) => ({
					url: v.url,
					type: v.type,
					playerId: v.playerId || undefined,
					teamId: v.teamId || undefined,
					language: v.language || undefined,
					platform: v.platform || undefined,
					title: v.title || undefined,
					official: v.official,
					startTime: v.startTime || undefined,
					available: v.available,
					createdAt: v.createdAt,
					updatedAt: v.updatedAt
				}))
			};
		});

	return {
		id: matchData.id,
		// The top-level result is now guaranteed to be consistent with the games' results
		result: [canonicalTeamA?.score || 0, canonicalTeamB?.score || 0],
		battleOf: (format || 'BO1') as 'BO1' | 'BO3' | 'BO5',
		maps: validMaps.map((m) => ({
			map: m.map.id as GameMap,
			pickerId: m.map_picker_position ?? undefined,
			pickedSide: m.side === 0 ? 'Attack' : 'Defense'
		})),
		teams: (() => {
			const teamArray = (matchData.matchTeams ?? [])
				.filter((t): t is typeof t & { team: NonNullable<typeof t.team> } => t.team !== null)
				.map((t) => ({
					team: t.team,
					score: t.score || 0
				}));

			while (teamArray.length < 2) {
				teamArray.push({
					team: {
						id: 'unknown',
						name: 'Unknown Team',
						slug: 'unknown',
						abbr: 'UNK',
						region: null,
						logo: null,
						createdAt: null,
						updatedAt: null
					},
					score: 0
				});
			}
			return teamArray.slice(0, 2) as [AppMatch['teams'][0], AppMatch['teams'][1]];
		})(),
		games: transformedGames,
		event
	};
}
