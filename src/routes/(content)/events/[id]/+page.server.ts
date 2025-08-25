import type { PageServerLoad } from './$types';
import type { Event, EventResult, EventParticipant } from '$lib/data/events';

import { getEvent } from '$lib/server/data/events';
import { error } from '@sveltejs/kit';
import type { Team } from '$lib/data/teams';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { processImageURL } from '$lib/server/storage';

export const load: PageServerLoad = async ({ params }) => {
	let event: Event | undefined = await getEvent(params.id);

	if (!event) {
		throw error(404, 'Event not found');
	}

	// Extract all team IDs that appear in this event (matches and participants)
	const eventTeamIds = new Set<string>();

	// Add teams from matches
	for (const stage of event.stages) {
		for (const match of stage.matches) {
			for (const team of match.teams) {
				if (team.team) {
					eventTeamIds.add(team.team.id);
				}
			}
		}
	}

	// Add teams from participants
	for (const participant of event.participants) {
		eventTeamIds.add(participant.team.id);
	}

	type EssentialTeam = {
		id: string;
		name: string;
		slug: string;
		abbr: string | null;
		logo: string | null;
		region: string | null;
	};

	// Fetch only the teams needed for this event
	let teams: EssentialTeam[] = [];
	if (eventTeamIds.size > 0) {
		teams = await db
			.select({
				id: table.team.id,
				name: table.team.name,
				slug: table.team.slug,
				abbr: table.team.abbr,
				logo: table.team.logo,
				region: table.team.region
			})
			.from(table.team)
			.where(inArray(table.team.id, Array.from(eventTeamIds)));

		const uniqueImageUrls = new Set<string>();
		for (const team of teams) {
			if (team.logo) {
				uniqueImageUrls.add(team.logo);
			}
		}

		const imageUrlMap = new Map<string, string>();
		await Promise.all(
			Array.from(uniqueImageUrls).map(async (imageUrl) => {
				const processed = await processImageURL(imageUrl);
				imageUrlMap.set(imageUrl, processed);
			})
		);

		teams = teams.map((team) => ({
			...team,
			logoURL: imageUrlMap.get(team.logo || '') || team.logo
		}));
	}

	const teamMap = new Map<string, EssentialTeam>(teams.map((team) => [team.id, team]));

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

				// Find the team object from the teamMap to get additional data (logoURL, etc.)
				const enrichedTeam = teamMap.get(teamData.team.id);
				if (enrichedTeam) {
					// Use enriched team data but preserve original score and order
					return {
						team: enrichedTeam,
						score: teamData.score
					};
				}

				// Fallback to original team data if not found in teamMap
				return {
					team: {
						id: teamData.team.id,
						name: teamData.team.name,
						slug: teamData.team.slug,
						abbr: teamData.team.abbr,
						region: teamData.team.region,
						logo: teamData.team.logo,
						createdAt: teamData.team.createdAt,
						updatedAt: teamData.team.updatedAt
					},
					score: teamData.score
				};
			});

			match.teams = transformedTeams as [
				(typeof transformedTeams)[0],
				(typeof transformedTeams)[1]
			];

			// Transform game data to include team objects
			match.games?.forEach((game) => {
				// Find team objects for the game teams
				const teamA = teamMap.get(game.teams[0]) || {
					id: game.teams[0],
					name: game.teams[0],
					slug: game.teams[0].toLowerCase(),
					abbr: game.teams[0],
					region: null,
					logo: null
				};
				const teamB = teamMap.get(game.teams[1]) || {
					id: game.teams[1],
					name: game.teams[1],
					slug: game.teams[1].toLowerCase(),
					abbr: game.teams[1],
					region: null,
					logo: null
				};

				// CRITICAL: Align game teams with match teams by team ID, not by gameTeam position
				// The brackets component expects game.teams[0] to be the same team as match.teams[0]
				// and game.teams[1] to be the same team as match.teams[1]
				const matchTeamA = match.teams[0]?.team;
				const matchTeamB = match.teams[1]?.team;

				// Find which game team corresponds to which match team
				const gameTeamA =
					game.teams[0] === matchTeamA?.id
						? teamA
						: game.teams[1] === matchTeamA?.id
							? teamB
							: teamA;
				const gameTeamB =
					game.teams[0] === matchTeamB?.id
						? teamA
						: game.teams[1] === matchTeamB?.id
							? teamB
							: teamB;

				// Update the game teams to use team objects in the correct order
				// [match.teams[0], match.teams[1]] for consistent bracket display
				(game as any).teams = [gameTeamA, gameTeamB];
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
