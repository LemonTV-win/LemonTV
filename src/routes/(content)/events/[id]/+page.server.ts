import type { PageServerLoad } from './$types';
import type { Event, EventResult, EventParticipant } from '$lib/data/events';

import { getEvent as getServerEvent } from '$lib/server/data/events';
import { getTeams } from '$lib/server/data/teams';
import { error } from '@sveltejs/kit';
import type { Team } from '$lib/data/teams';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, inArray } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params }) => {
	let event: Event | undefined = await getServerEvent(params.id);

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
					matchTeamAbbrs.add(team.team.id);
				}
			});
		});
	});

	// Filter teams to include those that appear in matches or participants
	const filteredTeams = teams.filter(
		(t) =>
			event &&
			(matchTeamAbbrs.has(t.abbr || '') || event.participants.some((p) => p.team.id === t.id))
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

	// Transform match data to include team objects
	event.stages?.forEach((stage) => {
		stage.matches?.forEach((match) => {
			// Transform match teams to include full team objects
			const transformedTeams = match.teams.map((teamData) => {
				if (!teamData) {
					// Return a default team object if no team data
					return {
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
					};
				}

				// Find the team object from the teamMap
				const team = teamMap.get(teamData.team.id) || {
					id: teamData.team.id,
					name: teamData.team.name,
					slug: teamData.team.slug,
					abbr: teamData.team.abbr,
					region: teamData.team.region,
					logo: teamData.team.logo,
					createdAt: teamData.team.createdAt,
					updatedAt: teamData.team.updatedAt
				};

				return {
					team,
					score: teamData.score
				};
			});

			// Ensure we have exactly 2 teams
			while (transformedTeams.length < 2) {
				transformedTeams.push({
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

			match.teams = transformedTeams.slice(0, 2) as [
				(typeof transformedTeams)[0],
				(typeof transformedTeams)[1]
			];

			// Transform game data to include team objects
			match.games?.forEach((game) => {
				// Find team objects for the game teams
				const team1 = teamMap.get(game.teams[0]) || {
					id: game.teams[0],
					name: game.teams[0],
					slug: game.teams[0].toLowerCase(),
					abbr: game.teams[0],
					region: null,
					logo: null,
					createdAt: null,
					updatedAt: null
				};
				const team2 = teamMap.get(game.teams[1]) || {
					id: game.teams[1],
					name: game.teams[1],
					slug: game.teams[1].toLowerCase(),
					abbr: game.teams[1],
					region: null,
					logo: null,
					createdAt: null,
					updatedAt: null
				};

				// Update the game teams to use team objects instead of strings
				(game as any).teams = [team1, team2];
			});
		});
	});

	// Ensure event has the correct type by creating a new object with only the new format
	const typedEvent: Omit<Event, 'results'> & {
		results?: (Omit<EventResult, 'team'> & { team: Team & { logoURL: string | null } })[];
		participants: (Omit<EventParticipant, 'team'> & { team: Team & { logoURL: string | null } })[];
	} = {
		...event,
		results: event.results as
			| (Omit<EventResult, 'team'> & { team: Team & { logoURL: string | null } })[]
			| undefined,
		participants: event.participants as (Omit<EventParticipant, 'team'> & {
			team: Team & { logoURL: string | null };
		})[]
	};

	return {
		event: typedEvent
	};
};
