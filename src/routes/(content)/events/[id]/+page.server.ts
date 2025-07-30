import type { PageServerLoad } from './$types';
import type {
	LegacyEventResult,
	Event,
	EventResult,
	EventParticipant,
	LegacyEventParticipant
} from '$lib/data/events';

import { getEvent } from '$lib/data';
import { getEvent as getServerEvent } from '$lib/server/data/events';
import { getTeams } from '$lib/server/data/teams';
import { error } from '@sveltejs/kit';
import type { Team } from '$lib/data/teams';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, inArray } from 'drizzle-orm';
import type { GameMap } from '$lib/data/game';

export const load: PageServerLoad = async ({ params }) => {
	let event: Event | undefined = getEvent(params.id) || (await getServerEvent(params.id));

	if (!event) {
		throw error(404, 'Event not found');
	}

	const teams = await getTeams();

	// Get all team abbreviations that appear in the event's matches
	const matchTeamAbbrs = new Set<string>();
	event.stages?.forEach((stage) => {
		stage.matches?.forEach((match) => {
			match.teams.forEach((team) => {
				if (team.team) {
					matchTeamAbbrs.add(team.team);
				}
			});
		});
	});

	// Filter teams to include those that appear in matches or participants
	const filteredTeams = teams.filter(
		(t) =>
			event &&
			(matchTeamAbbrs.has(t.abbr || '') ||
				event.participants.some(
					(p) => p.team === t.abbr || p.team === t.id || p.team === t.name || p.team === t.slug
				))
	);

	// Create team map with multiple keys for each team (abbr, id, name, slug)
	const teamMap = new Map<string, Team & { logoURL: string | null }>();
	filteredTeams.forEach((team) => {
		// Add team with abbreviation as key
		if (team.abbr) {
			teamMap.set(team.abbr, team);
		}
		// Add team with ID as key
		teamMap.set(team.id, team);
		// Add team with name as key
		teamMap.set(team.name, team);
		// Add team with slug as key
		teamMap.set(team.slug, team);
	});

	// Fetch detailed game data for all matches in the event
	const matchIds = new Set<string>();
	event.stages?.forEach((stage) => {
		stage.matches?.forEach((match) => {
			matchIds.add(match.id);
		});
	});

	let gamesData: Array<{
		id: number;
		matchId: string;
		mapId: string;
		duration: number;
		winner: number;
		map: {
			id: string;
		};
		teams: Array<{
			gameId: number;
			teamId: string;
			position: number;
			score: number;
			team: {
				id: string;
				name: string;
				slug: string;
				abbr: string | null;
				logo: string | null;
				region: string | null;
			};
		}>;
	}> = [];

	if (matchIds.size > 0) {
		// Fetch games with their teams and maps
		const games = await db
			.select({
				game: table.game,
				gameTeam: table.gameTeam,
				team: table.team,
				map: table.map
			})
			.from(table.game)
			.leftJoin(table.gameTeam, eq(table.gameTeam.gameId, table.game.id))
			.leftJoin(table.team, eq(table.gameTeam.teamId, table.team.id))
			.leftJoin(table.map, eq(table.game.mapId, table.map.id))
			.where(inArray(table.game.matchId, Array.from(matchIds)));

		// Group games by game ID
		const gamesMap = new Map<number, (typeof gamesData)[0]>();
		for (const row of games) {
			if (!row.game) continue;

			if (!gamesMap.has(row.game.id)) {
				gamesMap.set(row.game.id, {
					id: row.game.id,
					matchId: row.game.matchId,
					mapId: row.game.mapId,
					duration: row.game.duration,
					winner: row.game.winner,
					map: row.map || { id: row.game.mapId },
					teams: []
				});
			}

			const game = gamesMap.get(row.game.id)!;
			if (row.gameTeam && row.team) {
				game.teams.push({
					gameId: row.gameTeam.gameId,
					teamId: row.gameTeam.teamId,
					position: row.gameTeam.position,
					score: row.gameTeam.score,
					team: {
						id: row.team.id,
						name: row.team.name,
						slug: row.team.slug,
						abbr: row.team.abbr || '',
						logo: row.team.logo || '',
						region: row.team.region || ''
					}
				});
			}
		}

		gamesData = Array.from(gamesMap.values());
	}

	// Add games data to matches
	event.stages?.forEach((stage) => {
		stage.matches?.forEach((match) => {
			const matchGames = gamesData.filter((game) => game.matchId === match.id);
			// Transform games data to match the expected format
			match.games = matchGames.map((game) => ({
				id: game.id,
				map: game.map.id as GameMap,
				duration: game.duration,
				teams: [game.teams[0]?.team?.id || '', game.teams[1]?.team?.id || ''] as [string, string],
				result: [game.teams[0]?.score || 0, game.teams[1]?.score || 0] as [number, number],
				scores: [
					// Create empty PlayerScore arrays for each team (5 players each)
					Array(5)
						.fill(null)
						.map(() => ({
							accountId: 0,
							player: '',
							characters: [null, null] as [null, null],
							score: 0,
							damageScore: 0,
							kills: 0,
							knocks: 0,
							deaths: 0,
							assists: 0,
							damage: 0
						})) as [any, any, any, any, any],
					Array(5)
						.fill(null)
						.map(() => ({
							accountId: 0,
							player: '',
							characters: [null, null] as [null, null],
							score: 0,
							damageScore: 0,
							kills: 0,
							knocks: 0,
							deaths: 0,
							assists: 0,
							damage: 0
						})) as [any, any, any, any, any]
				] as [[any, any, any, any, any], [any, any, any, any, any]],
				winner: game.winner
			}));

			// Calculate match scores from games
			let team1Wins = 0;
			let team2Wins = 0;

			for (const game of match.games) {
				if (game.winner === 0) {
					team1Wins++;
				} else if (game.winner === 1) {
					team2Wins++;
				}
			}

			// Set match scores
			match.teams[0].score = team1Wins;
			match.teams[1].score = team2Wins;
		});
	});

	// Convert legacy results to new format if needed
	if (event.results && typeof (event.results[0] as LegacyEventResult)?.team === 'string') {
		const convertedResults: EventResult[] = (event.results as LegacyEventResult[]).map(
			(result) => ({
				...result,
				team: teamMap.get(result.team) ?? {
					id: result.team,
					name: result.team,
					slug: result.team.toLowerCase(),
					abbr: result.team,
					region: null,
					logo: null,
					createdAt: null,
					updatedAt: null
				}
			})
		);
		event = {
			...event,
			results: convertedResults
		};
	}

	// Ensure event has the correct type by creating a new object with only the new format
	const typedEvent: Omit<Event, 'results'> & {
		results?: (Omit<EventResult, 'team'> & { team: Team & { logoURL: string | null } })[];
		participants:
			| LegacyEventParticipant[]
			| (Omit<EventParticipant, 'team'> & { team: Team & { logoURL: string | null } })[];
	} = {
		...event,
		results: event.results as
			| (Omit<EventResult, 'team'> & { team: Team & { logoURL: string | null } })[]
			| undefined,
		participants: event.participants as
			| LegacyEventParticipant[]
			| (Omit<EventParticipant, 'team'> & { team: Team & { logoURL: string | null } })[]
	};

	return {
		event: typedEvent,
		teams: teamMap
	};
};
