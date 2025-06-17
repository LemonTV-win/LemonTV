import type { Event as AppEvent } from '$lib/data/events';
import type { Event, EventOrganizer } from '$lib/server/db/schemas/game/event';
import type { Organizer } from '$lib/server/db/schemas/game/organizer';
import { db } from '../db';
import * as table from '$lib/server/db/schema';
import { processImageURL } from '$lib/server/storage';
import type { Region } from '$lib/data/game';
import { inArray, eq, or } from 'drizzle-orm';
import { alias } from 'drizzle-orm/sqlite-core';
import { convertOrganizer } from './organizers';
import type { LegacyEventParticipant, EventParticipant, StageNode } from '$lib/data/events';
import type { Player } from '$lib/data/players';
import { getPlayer } from '$lib/server/data/players';
import type { UserRole } from '$lib/data/user';
import type { TCountryCode } from 'countries-list';
import type { Participant } from '$lib/data/matches';

// Types for the application layer
export interface EventWithOrganizers extends Event {
	organizers: Organizer[];
}

export interface CreateEventData {
	name: string;
	slug: string;
	official: boolean;
	server: string;
	format: string;
	region: string;
	image: string;
	status: string;
	capacity: number;
	date: string;
	organizerIds: string[];
	websites: { url: string; label?: string }[];
	videos: {
		type: 'stream' | 'clip' | 'vod';
		platform: 'twitch' | 'youtube' | 'bilibili';
		url: string;
		title?: string;
	}[];
	casters: EventCasterData[];
}

export interface UpdateEventData extends Partial<CreateEventData> {
	id: string;
}

// Types for event team player management
export interface EventTeamPlayerData {
	eventId: string;
	teamId: string;
	playerId: string;
	role: 'main' | 'sub' | 'coach';
}

export interface EventCasterData {
	playerId: string;
	role: 'host' | 'analyst' | 'commentator';
}

export interface UpdateEventTeamPlayerData extends EventTeamPlayerData {
	id?: string;
}

// Convert database event to application event with organizers
export function toEventWithOrganizers(
	event: Event,
	eventOrganizers: EventOrganizer[],
	organizers: Organizer[]
): EventWithOrganizers {
	const eventOrganizerIds = eventOrganizers
		.filter((eo) => eo.eventId === event.id)
		.map((eo) => eo.organizerId);

	return {
		...event,
		organizers: organizers.filter((o) => eventOrganizerIds.includes(o.id))
	};
}

// Convert application event data to database event data
export function toDatabaseEvent(
	data: CreateEventData
): Omit<Event, 'id' | 'createdAt' | 'updatedAt'> {
	return {
		name: data.name,
		slug: data.slug,
		official: data.official,
		server: data.server,
		format: data.format,
		region: data.region,
		image: data.image,
		status: data.status,
		capacity: data.capacity,
		date: data.date
	};
}

// Convert application event data to database event organizer data
export function toDatabaseEventOrganizers(
	eventId: string,
	organizerIds: string[]
): Omit<EventOrganizer, 'createdAt' | 'updatedAt'>[] {
	return organizerIds.map((organizerId) => ({
		eventId,
		organizerId
	}));
}

// Convert application event data to database event video data
export function toDatabaseEventVideos(
	eventId: string,
	videos: CreateEventData['videos']
): Omit<typeof table.eventVideo.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>[] {
	return videos.map((video) => ({
		eventId,
		type: video.type,
		platform: video.platform,
		url: video.url,
		title: video.title || null
	}));
}

// Get changes between old and new event data
export function getEventChanges(
	oldEvent: Event,
	newData: UpdateEventData
): Record<string, { from: any; to: any }> {
	const changes: Record<string, { from: any; to: any }> = {};

	Object.entries(newData).forEach(([key, value]) => {
		if (
			key !== 'id' &&
			key !== 'organizerIds' &&
			JSON.stringify(oldEvent[key as keyof Event]) !== JSON.stringify(value)
		) {
			changes[key] = {
				from: oldEvent[key as keyof Event],
				to: value
			};
		}
	});

	return changes;
}

// Get organizer changes between old and new event data
export function getOrganizerChanges(
	currentOrganizerIds: string[],
	newOrganizerIds: string[]
): { toAdd: string[]; toRemove: string[] } {
	return {
		toAdd: newOrganizerIds.filter((id) => !currentOrganizerIds.includes(id)),
		toRemove: currentOrganizerIds.filter((id) => !newOrganizerIds.includes(id))
	};
}

export async function getEvents(
	conditions: { organizerIds?: string[]; searchKeyword?: string } = {}
): Promise<AppEvent[]> {
	if (conditions.organizerIds || conditions.searchKeyword) {
		console.info('[Events] Fetching events with conditions: ', conditions);
	} else {
		console.info('[Events] Fetching all events');
	}

	// Create alias for player table for casters
	const casterPlayer = alias(table.player, 'casterPlayer');

	// First get the event results separately
	const eventResults = await db
		.select({
			eventId: table.eventResult.eventId,
			teamId: table.eventResult.teamId,
			rank: table.eventResult.rank,
			rankTo: table.eventResult.rankTo,
			prizeAmount: table.eventResult.prizeAmount,
			prizeCurrency: table.eventResult.prizeCurrency,
			team: table.team,
			event: table.event
		})
		.from(table.eventResult)
		.leftJoin(table.team, eq(table.team.id, table.eventResult.teamId))
		.leftJoin(table.event, eq(table.event.id, table.eventResult.eventId))
		.leftJoin(table.eventOrganizer, eq(table.eventOrganizer.eventId, table.event.id))
		.where(
			conditions.organizerIds
				? inArray(table.eventOrganizer.organizerId, conditions.organizerIds)
				: conditions.searchKeyword
					? or(
							eq(table.event.id, conditions.searchKeyword),
							eq(table.event.slug, conditions.searchKeyword)
						)
					: undefined
		);

	// Then get the main event data
	const eventsWithOrganizers = await db
		.select({
			event: table.event,
			organizer: table.organizer,
			eventTeamPlayer: table.eventTeamPlayer,
			team: table.team,
			player: table.player,
			eventWebsite: table.eventWebsite,
			eventVideo: table.eventVideo,
			eventCaster: table.eventCaster,
			casterPlayer: casterPlayer,
			stage: table.stage,
			stageRound: table.stageRound,
			stageNode: table.stageNode,
			stageNodeDependency: table.stageNodeDependency,
			match: table.match
		})
		.from(table.event)
		.leftJoin(table.eventOrganizer, eq(table.eventOrganizer.eventId, table.event.id))
		.leftJoin(table.organizer, eq(table.organizer.id, table.eventOrganizer.organizerId))
		.leftJoin(table.eventTeamPlayer, eq(table.eventTeamPlayer.eventId, table.event.id))
		.leftJoin(table.team, eq(table.team.id, table.eventTeamPlayer.teamId))
		.leftJoin(table.player, eq(table.player.id, table.eventTeamPlayer.playerId))
		.leftJoin(table.eventWebsite, eq(table.eventWebsite.eventId, table.event.id))
		.leftJoin(table.eventVideo, eq(table.eventVideo.eventId, table.event.id))
		.leftJoin(table.eventCaster, eq(table.eventCaster.eventId, table.event.id))
		.leftJoin(casterPlayer, eq(casterPlayer.id, table.eventCaster.playerId))
		.leftJoin(table.stage, eq(table.stage.eventId, table.event.id))
		.leftJoin(table.stageRound, eq(table.stageRound.stageId, table.stage.id))
		.leftJoin(table.stageNode, eq(table.stageNode.stageId, table.stage.id))
		.leftJoin(table.stageNodeDependency, eq(table.stageNodeDependency.nodeId, table.stageNode.id))
		.leftJoin(table.match, eq(table.match.id, table.stageNode.matchId))
		.where(
			conditions.organizerIds
				? inArray(table.eventOrganizer.organizerId, conditions.organizerIds)
				: conditions.searchKeyword
					? or(
							eq(table.event.id, conditions.searchKeyword),
							eq(table.event.slug, conditions.searchKeyword)
						)
					: undefined
		);

	// Group organizers and team players by event
	const eventsMap = new Map<
		string,
		{
			event: Event;
			organizers: Organizer[];
			teamPlayers: Array<{
				team: typeof table.team.$inferSelect;
				player: typeof table.player.$inferSelect;
				role: 'main' | 'sub' | 'coach';
			}>;
			results: Array<{
				rank: number;
				rankTo?: number;
				team: typeof table.team.$inferSelect;
				prizes: Array<{
					amount: number;
					currency: string;
				}>;
			}>;
			websites: Array<{
				url: string;
				label?: string;
			}>;
			videos: Array<{
				type: 'stream' | 'clip' | 'vod';
				platform: 'twitch' | 'youtube' | 'bilibili';
				url: string;
				title?: string;
			}>;
			casters: Array<{
				player: typeof table.player.$inferSelect;
				role: 'host' | 'analyst' | 'commentator';
			}>;
			stages: Array<{
				id: number;
				title: string;
				stage: string;
				format: string;
				rounds: Array<{
					id: number;
					type: string;
					title: string;
					bracket: string;
					parallelGroup: number | undefined;
					nodes: Array<{
						id: number;
						matchId: string;
						roundId: number;
						dependencies: Array<{
							dependencyMatchId: string;
							outcome: string;
						}>;
					}>;
				}>;
			}>;
			participants: Array<LegacyEventParticipant | EventParticipant>;
		}
	>();

	// Process event results first
	eventResults.forEach((result) => {
		if (!eventsMap.has(result.eventId) && result.event) {
			eventsMap.set(result.eventId, {
				event: result.event,
				organizers: [],
				teamPlayers: [],
				results: [],
				websites: [],
				videos: [],
				casters: [],
				stages: [],
				participants: []
			});
		}
		const eventData = eventsMap.get(result.eventId)!;
		if (
			result.team &&
			result.rank !== null &&
			result.prizeAmount !== null &&
			result.prizeCurrency
		) {
			eventData.results.push({
				rank: result.rank,
				rankTo: result.rankTo ?? undefined,
				team: {
					id: result.team.id,
					name: result.team.name,
					slug: result.team.slug,
					abbr: result.team.abbr,
					region: result.team.region,
					logo: result.team.logo,
					createdAt: result.team.createdAt,
					updatedAt: result.team.updatedAt
				},
				prizes: [
					{
						amount: result.prizeAmount,
						currency: result.prizeCurrency
					}
				]
			});
		}
	});

	// Then process the main event data
	eventsWithOrganizers.forEach(
		({
			event,
			organizer,
			eventTeamPlayer,
			team,
			player,
			eventWebsite,
			eventVideo,
			eventCaster,
			casterPlayer,
			stage,
			stageRound,
			stageNode,
			stageNodeDependency
		}) => {
			if (!eventsMap.has(event.id)) {
				eventsMap.set(event.id, {
					event,
					organizers: [],
					teamPlayers: [],
					results: [],
					websites: [],
					videos: [],
					casters: [],
					stages: [],
					participants: []
				});
			}
			const eventData = eventsMap.get(event.id)!;

			if (organizer) {
				// Only add the organizer if it's not already in the array
				if (!eventData.organizers.some((o) => o.id === organizer.id)) {
					eventData.organizers.push(organizer);
				}
			}

			if (eventTeamPlayer && team && player) {
				// Check if this team-player combination already exists
				const exists = eventData.teamPlayers.some(
					(tp) => tp.team.id === team.id && tp.player.id === player.id
				);
				if (!exists) {
					eventData.teamPlayers.push({
						team,
						player,
						role: eventTeamPlayer.role
					});
				}
			}

			if (eventWebsite) {
				// Only add the website if it's not already in the array
				if (!eventData.websites.some((w) => w.url === eventWebsite.url)) {
					eventData.websites.push({
						url: eventWebsite.url,
						label: eventWebsite.label || undefined
					});
				}
			}

			if (eventVideo) {
				// Only add the video if it's not already in the array
				if (!eventData.videos.some((v) => v.url === eventVideo.url)) {
					eventData.videos.push({
						type: eventVideo.type as 'stream' | 'clip' | 'vod',
						platform: eventVideo.platform as 'twitch' | 'youtube' | 'bilibili',
						url: eventVideo.url,
						title: eventVideo.title || undefined
					});
				}
			}

			if (eventCaster && casterPlayer) {
				// Only add the caster if it's not already in the array
				if (!eventData.casters.some((c) => c.player.id === casterPlayer.id)) {
					eventData.casters.push({
						player: casterPlayer,
						role: eventCaster.role as 'host' | 'analyst' | 'commentator'
					});
				}
			}

			if (stage) {
				// Check if this stage already exists
				const existingStage = eventData.stages.find((s) => s.id === stage.id);
				if (!existingStage) {
					eventData.stages.push({
						id: stage.id,
						title: stage.title,
						stage: stage.stage,
						format: stage.format,
						rounds: []
					});
				}
			}

			if (stageRound) {
				const stage = eventData.stages.find((s) => s.id === stageRound.stageId);
				if (stage) {
					// Check if this round already exists
					const existingRound = stage.rounds.find((r) => r.id === stageRound.id);
					if (!existingRound) {
						stage.rounds.push({
							id: stageRound.id,
							type: stageRound.type,
							title: stageRound.title || '',
							bracket: stageRound.bracket || '',
							parallelGroup: stageRound.parallelGroup || undefined,
							nodes: []
						});
					}
				}
			}

			if (stageNode) {
				const stage = eventData.stages.find((s) => s.id === stageNode.stageId);
				if (stage) {
					const round = stage.rounds.find((r) => r.id === stageNode.roundId);
					if (round) {
						// Check if this node already exists
						const existingNode = round.nodes.find((n) => n.id === stageNode.id);
						if (!existingNode) {
							round.nodes.push({
								id: stageNode.id,
								matchId: stageNode.matchId,
								roundId: stageNode.roundId,
								dependencies: []
							});
						}
					}
				}
			}

			if (stageNodeDependency) {
				const stage = eventData.stages.find((s) => s.id === stageNode?.stageId);
				if (stage) {
					const round = stage.rounds.find((r) => r.id === stageNode?.roundId);
					if (round) {
						const node = round.nodes.find((n) => n.id === stageNodeDependency.nodeId);
						if (node) {
							// Check if this dependency already exists
							const existingDependency = node.dependencies.find(
								(d) => d.dependencyMatchId === stageNodeDependency.dependencyMatchId
							);
							if (!existingDependency) {
								node.dependencies.push({
									dependencyMatchId: stageNodeDependency.dependencyMatchId,
									outcome: stageNodeDependency.outcome
								});
							}
						}
					}
				}
			}
		}
	);

	const events = await Promise.all(
		Array.from(eventsMap.values()).map(
			async ({ event, organizers, teamPlayers, results, websites, videos, casters, stages }) => {
				// Gather all matches for this event from the structure
				const allMatchIds = new Set<string>();
				stages.forEach((stage) => {
					stage.rounds.forEach((round) => {
						round.nodes.forEach((node) => {
							if (node.matchId) {
								allMatchIds.add(node.matchId);
							}
						});
					});
				});

				// Query all matches for this event
				let eventMatches: any[] = [];
				if (allMatchIds.size > 0) {
					const matchData = await db
						.select({
							match: table.match,
							matchTeam: table.matchTeam,
							team: table.team
						})
						.from(table.match)
						.leftJoin(table.matchTeam, eq(table.matchTeam.matchId, table.match.id))
						.leftJoin(table.team, eq(table.matchTeam.teamId, table.team.id))
						.where(inArray(table.match.id, Array.from(allMatchIds)));

					// Group match data by match ID
					const matchMap = new Map<string, any>();
					matchData.forEach(({ match, matchTeam, team }) => {
						if (!matchMap.has(match.id)) {
							matchMap.set(match.id, {
								...match,
								id: match.id,
								teams: [null, null],
								maps: []
							});
						}
						if (team && matchTeam && matchTeam.position !== null) {
							const matchObj = matchMap.get(match.id);
							matchObj.teams[matchTeam.position] = {
								team: team.abbr || team.name,
								score: matchTeam.score || 0
							};
						}
					});
					eventMatches = Array.from(matchMap.values());
				}

				return {
					...event,
					organizers,
					imageURL: await processImageURL(event.image),
					teamPlayers,
					results:
						results.length > 0
							? await Promise.all(
									results.map(async (r) => ({
										...r,
										team: {
											...r.team,
											logoURL: r.team.logo ? await processImageURL(r.team.logo) : null
										}
									}))
								)
							: undefined,
					websites: websites.length > 0 ? websites : undefined,
					videos: videos.length > 0 ? videos : undefined,
					casters:
						casters.length > 0
							? ((
									await Promise.all(
										casters.map(async (c) => {
											// TODO: getPlayers with conditions
											const player = await getPlayer(c.player.id);
											return player ? { player, role: c.role } : null;
										})
									)
								).filter((c): c is NonNullable<typeof c> => c !== null) as Array<{
									player: Player;
									role: 'host' | 'analyst' | 'commentator';
								}>)
							: undefined,
					stages:
						stages.length > 0
							? stages.map((stage) => {
									// Get matches for this stage
									const stageMatches = eventMatches
										.filter((match) =>
											stage.rounds.some((round) =>
												round.nodes.some((node) => node.matchId === match.id)
											)
										)
										.map((match) => ({
											id: match.id,
											teams: [
												{
													team: match.teams[0]?.team || '',
													score: match.teams[0]?.score || 0,
													roaster: [],
													substitutes: []
												},
												{
													team: match.teams[1]?.team || '',
													score: match.teams[1]?.score || 0,
													roaster: [],
													substitutes: []
												}
											] as [Participant, Participant],
											battleOf: match.format as 'BO1' | 'BO3' | 'BO5',
											maps: (match.maps || []).map(
												(map: { map: string; map_picker_position: number; side: number }) => ({
													map: {
														id: map.map,
														name: map.map,
														image: `/maps/${map.map}.png`
													},
													pickerId: map.map_picker_position,
													pickedSide: map.side === 0 ? 'Attack' : 'Defense'
												})
											)
										}));

									return {
										id: stage.id,
										title: stage.title,
										stage: stage.stage as 'qualifier' | 'playoff' | 'group' | 'showmatch',
										format: stage.format as 'single' | 'double' | 'swiss' | 'round-robin',
										matches: stageMatches,
										structure: {
											rounds: stage.rounds.map((round) => ({
												id: round.id,
												type: round.type as
													| 'quarterfinals'
													| 'semifinals'
													| 'final'
													| 'top16'
													| 'group'
													| 'thirdplace'
													| 'lower'
													| 'grandfinal',
												title: round.title
													? {
															en: round.title,
															es: round.title,
															zh: round.title,
															ko: round.title,
															ja: round.title,
															'pt-br': round.title,
															de: round.title,
															ru: round.title,
															'zh-tw': round.title,
															vi: round.title,
															id: round.title,
															fr: round.title
														}
													: undefined,
												parallelGroup: round.parallelGroup
											})),
											nodes: stage.rounds.flatMap((round) =>
												round.nodes.map(
													(node: {
														id: number;
														matchId: string;
														roundId: number;
														dependencies: { dependencyMatchId: string; outcome: string }[];
													}) =>
														({
															matchId: parseInt(node.matchId),
															round: node.roundId,
															dependsOn: node.dependencies?.map((dep) => ({
																matchId: parseInt(dep.dependencyMatchId),
																outcome: dep.outcome as 'winner' | 'loser'
															}))
														}) as StageNode
												)
											)
										}
									};
								})
							: undefined
				};
			}
		)
	);

	return await Promise.all(
		events.map(async (event) => {
			// Fetch full Player objects for all unique player IDs
			const uniquePlayerIds = Array.from(new Set(event.teamPlayers.map((tp) => tp.player.id)));

			// Fetch all player data in a single batch query
			const playerRows = await db
				.select({
					player: table.player,
					playerAlias: table.playerAlias,
					gameAccount: table.gameAccount,
					socialAccount: table.player_social_account,
					user: table.user,
					userRole: table.userRole,
					playerAdditionalNationality: table.playerAdditionalNationality
				})
				.from(table.player)
				.leftJoin(table.playerAlias, eq(table.playerAlias.playerId, table.player.id))
				.leftJoin(table.gameAccount, eq(table.gameAccount.playerId, table.player.id))
				.leftJoin(
					table.player_social_account,
					eq(table.player_social_account.playerId, table.player.id)
				)
				.leftJoin(table.user, eq(table.user.id, table.player.userId))
				.leftJoin(table.userRole, eq(table.userRole.userId, table.user.id))
				.leftJoin(
					table.playerAdditionalNationality,
					eq(table.playerAdditionalNationality.playerId, table.player.id)
				)
				.where(inArray(table.player.id, uniquePlayerIds));

			// Group data by player
			const playerMap: Record<string, Player> = {};
			for (const row of playerRows) {
				const p = row.player;
				if (!p?.id) continue;

				if (!playerMap[p.id]) {
					playerMap[p.id] = {
						id: p.id,
						name: p.name,
						slug: p.slug,
						nationalities: p.nationality ? [p.nationality as TCountryCode] : [],
						aliases: [],
						gameAccounts: [],
						socialAccounts: [],
						user: row.user
							? {
									id: row.user.id,
									username: row.user.username,
									email: row.user.email,
									roles: []
								}
							: undefined
					};
				}

				const player = playerMap[p.id];

				// Add additional nationality
				const additionalNationality = row.playerAdditionalNationality?.nationality;
				if (
					additionalNationality &&
					!player.nationalities.includes(additionalNationality as TCountryCode)
				) {
					player.nationalities.push(additionalNationality as TCountryCode);
				}

				// Add alias
				const alias = row.playerAlias?.alias;
				if (alias && !player.aliases!.includes(alias)) {
					player.aliases!.push(alias);
				}

				// Add game account
				const ga = row.gameAccount;
				if (
					ga?.accountId &&
					!player.gameAccounts.some((a) => a.accountId === ga.accountId && a.server === ga.server)
				) {
					player.gameAccounts.push({
						server: ga.server as 'Strinova' | 'CalabiYau',
						accountId: ga.accountId,
						currentName: ga.currentName,
						region: ga.region as Player['gameAccounts'][0]['region']
					});
				}

				// Add social account
				const sa = row.socialAccount;
				if (
					sa?.platformId &&
					!player.socialAccounts!.some(
						(a) => a.platformId === sa.platformId && a.accountId === sa.accountId
					)
				) {
					player.socialAccounts!.push({
						platformId: sa.platformId,
						accountId: sa.accountId,
						overridingUrl: sa.overriding_url || undefined
					});
				}

				// Add user role
				const role = row.userRole?.roleId;
				if (player.user && role && !player.user.roles.includes(role as UserRole)) {
					player.user.roles.push(role as UserRole);
				}
			}

			// Group team players by team
			const teamPlayersMap = new Map<
				string,
				{ main: Player[]; reserve: Player[]; coach: Player[] }
			>();

			event.teamPlayers.forEach(({ team, player, role }) => {
				const fullPlayer = playerMap[player.id];
				if (!fullPlayer) return;

				if (!teamPlayersMap.has(team.id)) {
					teamPlayersMap.set(team.id, { main: [], reserve: [], coach: [] });
				}
				const teamData = teamPlayersMap.get(team.id)!;
				if (role === 'main') {
					teamData.main.push(fullPlayer);
				} else if (role === 'sub') {
					teamData.reserve.push(fullPlayer);
				} else if (role === 'coach') {
					teamData.coach.push(fullPlayer);
				}
			});

			// Convert to the expected format
			const participants = await Promise.all(
				Array.from(teamPlayersMap.entries()).map(async ([team, players]) => {
					const teamObj = event.teamPlayers.find((t) => t.team.id === team)?.team;
					if (!teamObj) {
						return {
							team,
							main: players.main.map((p) => p.name),
							reserve: players.reserve.map((p) => p.name),
							coach: players.coach.map((p) => p.name)
						} as LegacyEventParticipant;
					}
					return {
						legacy: false,
						team: {
							...teamObj,
							logoURL: teamObj.logo ? await processImageURL(teamObj.logo) : null
						},
						main: players.main,
						reserve: players.reserve,
						coach: players.coach
					} as EventParticipant;
				})
			);

			return {
				id: event.id,
				slug: event.slug,
				name: event.name,
				official: event.official,
				server: event.server as 'calabiyau' | 'strinova',
				format: event.format as 'lan' | 'online' | 'hybrid',
				region: event.region as Region,
				image: event.image,
				imageURL: event.image ? await processImageURL(event.image) : undefined,
				status: event.status as 'upcoming' | 'live' | 'finished' | 'cancelled' | 'postponed',
				stages: event.stages || [],
				organizers:
					event.organizers.length > 0
						? await Promise.all(event.organizers.map(convertOrganizer))
						: [],
				capacity: event.capacity,
				date: event.date,
				websites: event.websites?.map((website) => ({
					url: website.url,
					label: website.label
				})),
				videos: event.videos?.map((video) => ({
					type: video.type,
					platform: video.platform,
					url: video.url,
					title: video.title
				})),
				casters: event.casters?.map((c) => {
					return {
						player: c.player,
						role: c.role
					};
				}),
				participants: participants,
				livestreams: [],
				results: event.results?.map((result) => ({
					rank: result.rank,
					rankTo: result.rankTo,
					team: result.team,
					prizes: result.prizes?.map((prize) => ({
						amount: prize.amount,
						currency: prize.currency
					}))
				})),
				highlights: []
			};
		})
	);
}

export async function getEvent(id: string): Promise<AppEvent | undefined> {
	const events = await getEvents({ searchKeyword: id });
	return events[0];
}

// Update event team players
export async function updateEventTeamPlayers(
	eventId: string,
	players: EventTeamPlayerData[],
	userId: string
) {
	await db.transaction(async (tx) => {
		// Get current players for history
		const currentPlayers = await tx
			.select()
			.from(table.eventTeamPlayer)
			.where(eq(table.eventTeamPlayer.eventId, eventId));

		// Delete all players for this event
		await tx.delete(table.eventTeamPlayer).where(eq(table.eventTeamPlayer.eventId, eventId));

		// Add new players
		if (players.length > 0) {
			await tx.insert(table.eventTeamPlayer).values(
				players.map((player) => ({
					eventId: eventId,
					teamId: player.teamId,
					playerId: player.playerId,
					role: player.role,
					createdAt: new Date(),
					updatedAt: new Date()
				}))
			);
		}

		// Add edit history
		await tx.insert(table.editHistory).values({
			id: crypto.randomUUID(),
			tableName: 'event_team_player',
			recordId: eventId,
			fieldName: 'players',
			oldValue: JSON.stringify(currentPlayers),
			newValue: JSON.stringify(players),
			editedBy: userId,
			editedAt: new Date()
		});
	});
}

export async function updateEventCasters(
	eventId: string,
	casters: EventCasterData[],
	userId: string
) {
	await db.transaction(async (tx) => {
		// Get current casters for history
		const currentCasters = await tx
			.select()
			.from(table.eventCaster)
			.where(eq(table.eventCaster.eventId, eventId));

		// Delete all casters for this event
		await tx.delete(table.eventCaster).where(eq(table.eventCaster.eventId, eventId));

		// Add new casters
		if (casters.length > 0) {
			await tx.insert(table.eventCaster).values(
				casters.map((caster) => ({
					eventId: eventId,
					playerId: caster.playerId,
					role: caster.role,
					createdAt: new Date(),
					updatedAt: new Date()
				}))
			);
		}

		// Add edit history
		await tx.insert(table.editHistory).values({
			id: crypto.randomUUID(),
			tableName: 'event_caster',
			recordId: eventId,
			fieldName: 'casters',
			oldValue: JSON.stringify(currentCasters),
			newValue: JSON.stringify(casters),
			editedBy: userId,
			editedAt: new Date()
		});
	});
}

// export interface Event {
// 	id: number;
// 	slug: string;
// 	name: string;
// 	official: boolean;
// 	server: 'calabiyau' | 'strinova';
// 	format: 'lan' | 'online' | 'hybrid';
// 	// host: string;
// 	// date: string;
// 	region: Region;
// 	// location: string;
// 	// description: string;
// 	image: string;
// 	status: 'upcoming' | 'live' | 'finished' | 'cancelled' | 'postponed';
// 	stages: Stage[];

// 	//// matches: Match[];
// 	// prizePool: number;
// 	// teams: Team[];
// 	organizer: {
// 		name: string;
// 		logo?: string;
// 		url: string;
// 	};
// 	capacity: number; // expected number of teams
// 	date: string;
// 	websites?: string[];
// 	participants: {
// 		team: string; // team abbr
// 		main: string[];
// 		reserve: string[];
// 		coach: string[];
// 	}[];
// 	livestreams?: {
// 		platform: 'twitch' | 'youtube' | 'bilibili';
// 		url: string;
// 	}[];
// 	results?: {
// 		rank: number;
// 		team: string;
// 		prizes: EventPrize[];
// 	}[];
// 	highlights?: string[];
// }

// }
