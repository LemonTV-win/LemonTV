import type { Event as AppEvent } from '$lib/data/events';
import type { Event, EventOrganizer } from '$lib/server/db/schemas/game/event';
import type { Organizer } from '$lib/server/db/schemas/game/organizer';
import { db } from '../db';
import * as table from '$lib/server/db/schema';
import { processImageURL } from '$lib/server/storage';
import type { Region } from '$lib/data/game';
import { eq, or, sql } from 'drizzle-orm';
import { safeParseDateRange } from '$lib/utils/date';
import type { EventParticipant, StageNode } from '$lib/data/events';
import type { GameAccount, GameAccountRegion, GameAccountServer, Player } from '$lib/data/players';
import { normalizePlayer } from '$lib/server/data/players';
import type { PlayerScore } from '$lib/data/matches';
import type { EssentialEvent } from '$lib/components/EventCard.svelte';
import type { LocalizedString } from '$lib/data/string';
import type { Team } from '$lib/data/teams';

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
	region: Region;
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

// Type for event field changes
export interface EventFieldChange {
	from: Event[keyof Event];
	to: Event[keyof Event];
}

// Type for match data structure
export interface EventMatchData {
	id: string;
	teams: Array<{
		team: {
			id: string;
			name: string;
			slug: string;
			abbr: string | null;
			logo: string | null;
			region: string | null;
			createdAt: string | null;
			updatedAt: string | null;
		};
		score: number;
		position: number;
	} | null>;
	maps: Array<{
		map: string;
		map_picker_position: number;
		side: number;
	}>;
	format: string | null;
	stageId: number | null;
}

// Convert application event data to database event data
export function toDatabaseEvent(
	data: CreateEventData
): Omit<Event, 'id' | 'createdAt' | 'updatedAt'> {
	return {
		name: data.name,
		slug: data.slug,
		official: data.official,
		server: data.server as 'calabiyau' | 'strinova',
		format: data.format as 'lan' | 'online' | 'hybrid',
		region: data.region as Region,
		image: data.image,
		status: data.status as 'upcoming' | 'live' | 'finished' | 'cancelled' | 'postponed',
		capacity: data.capacity,
		date: data.date as
			| `${string}-${string}-${string}`
			| `${string}-${string}-${string}/${string}-${string}-${string}`
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
): Record<string, EventFieldChange> {
	const changes: Record<string, EventFieldChange> = {};

	Object.entries(newData).forEach(([key, value]) => {
		if (
			key !== 'id' &&
			key !== 'organizerIds' &&
			JSON.stringify(oldEvent[key as keyof Event]) !== JSON.stringify(value)
		) {
			changes[key] = {
				from: oldEvent[key as keyof Event],
				to: value as Event[keyof Event]
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

export async function getEssentialEvents(): Promise<EssentialEvent[]> {
	const totalStart = performance.now();
	console.info('[Events] Fetching essential events (relations + grouped counts)');

	// 1) Fetch events with only the columns we actually need + nested minimal relations
	const relStart = performance.now();
	const eventsWithRelations = await db.query.event.findMany({
		columns: {
			id: true,
			slug: true,
			image: true,
			name: true,
			status: true,
			date: true,
			capacity: true,
			region: true,
			format: true,
			official: true
		},
		with: {
			organizers: {
				with: {
					organizer: {
						columns: {
							id: true,
							slug: true,
							name: true,
							logo: true,
							url: true
						}
					}
				}
			},
			videos: {
				columns: {
					type: true,
					platform: true,
					url: true,
					title: true
				}
			}
		}
	});
	console.info(
		`[Events] Relations query took ${(performance.now() - relStart).toFixed(2)}ms (rows=${eventsWithRelations.length})`
	);

	if (eventsWithRelations.length === 0) return [];

	// 2) Get distinct team counts per event in ONE grouped query (no N+1, no row overfetch)
	const countStart = performance.now();
	const participantRows = await db
		.select({
			eventId: table.event.id,
			participantCount: sql<number>`coalesce(count(distinct ${table.eventTeamPlayer.teamId}), 0)`
		})
		.from(table.event)
		.leftJoin(table.eventTeamPlayer, eq(table.eventTeamPlayer.eventId, table.event.id))
		.groupBy(table.event.id);

	const participantCountMap = new Map<string, number>();
	for (const r of participantRows) participantCountMap.set(r.eventId, r.participantCount);
	console.info(
		`[Events] Distinct team counts took ${(performance.now() - countStart).toFixed(2)}ms`
	);

	// 3) Collect & process images in bulk (deduped, concurrent)
	const imgStart = performance.now();
	const uniqueImageUrls = new Set<string>();
	for (const e of eventsWithRelations) {
		if (e.image) uniqueImageUrls.add(e.image);
		for (const eo of e.organizers) {
			const org = eo.organizer;
			if (org?.logo) uniqueImageUrls.add(org.logo);
		}
	}

	const imageUrlMap = new Map<string, string>();
	await Promise.allSettled(
		Array.from(uniqueImageUrls).map(async (url) => {
			try {
				const processed = await processImageURL(url);
				imageUrlMap.set(url, processed);
			} catch {
				// fall back to original URL on any processing error
				imageUrlMap.set(url, url);
			}
		})
	);
	console.info(
		`[Events] Image processing for ${uniqueImageUrls.size} URLs took ${(performance.now() - imgStart).toFixed(2)}ms`
	);

	// 4) Shape into EssentialEvent[]
	const result: EssentialEvent[] = eventsWithRelations.map((e) => {
		const organizers =
			e.organizers
				.map((eo) => eo.organizer)
				.filter((org): org is NonNullable<typeof org> => !!org)
				.map((org) => ({
					...org,
					logo: org.logo ? (imageUrlMap.get(org.logo) ?? org.logo) : org.logo
				})) || undefined;

		const participantsSize = participantCountMap.get(e.id) ?? 0;

		return {
			slug: e.slug,
			imageURL: e.image ? imageUrlMap.get(e.image) : undefined,
			image: e.image,
			name: e.name,
			status: e.status as 'upcoming' | 'live' | 'finished' | 'cancelled' | 'postponed',
			date: e.date,
			participants: Array.from({ length: participantsSize }),
			capacity: e.capacity,
			region: e.region,
			format: e.format as 'lan' | 'online' | 'hybrid',
			official: e.official,
			organizers: organizers && organizers.length ? organizers : undefined,
			videos: e.videos.length
				? e.videos.map((v) => ({
						type: v.type as 'stream' | 'clip' | 'vod',
						platform: v.platform as 'twitch' | 'youtube' | 'bilibili',
						url: v.url,
						title: v.title ?? undefined
					}))
				: undefined
		};
	});

	console.info(
		`[Events] Total getEssentialEvents took ${(performance.now() - totalStart).toFixed(2)}ms`
	);
	return result;
}

// before: 80ms

function fakeLocalizedString(str: string): LocalizedString {
	return {
		en: str,
		es: str,
		fr: str,
		de: str,
		ja: str,
		'pt-br': str,
		ko: str,
		zh: str,
		ru: str,
		id: str,
		'uk-ua': str,
		'zh-tw': str,
		vi: str
	};
}

export async function getEvent(id: string): Promise<AppEvent | undefined> {
	console.info(`[Events] Fetching single event: ${id}`);

	// Simple query to get basic event data first
	// #region Event query
	const eventQueryStart = performance.now();
	const eventData = await db.query.event.findFirst({
		where: or(eq(table.event.id, id), eq(table.event.slug, id)),
		columns: {
			id: true,
			slug: true,
			name: true,
			official: true,
			server: true,
			format: true,
			region: true,
			image: true,
			status: true,
			capacity: true,
			date: true
		},
		with: {
			organizers: {
				with: {
					organizer: {
						columns: {
							id: true,
							slug: true,
							name: true,
							logo: true,
							url: true
						}
					}
				}
			},
			results: {
				columns: {
					rank: true,
					rankTo: true,
					prizeAmount: true,
					prizeCurrency: true
				},
				with: {
					team: true
				}
			},
			websites: {
				columns: {
					url: true,
					label: true
				}
			},
			videos: {
				columns: {
					type: true,
					platform: true,
					url: true,
					title: true
				}
			},
			casters: {
				columns: {
					role: true
				},
				with: {
					player: {
						columns: {
							id: true,
							name: true,
							slug: true,
							nationality: true
						},
						with: {
							additionalNationalities: {
								columns: {
									nationality: true
								}
							},
							aliases: {
								columns: {
									alias: true
								}
							}
						}
					}
				}
			},
			teamPlayers: {
				columns: {
					role: true
				},
				with: {
					team: {
						columns: {
							id: true,
							name: true,
							slug: true,
							logo: true,
							abbr: true,
							region: true
						}
					},
					player: {
						columns: {
							id: true,
							name: true,
							slug: true,
							nationality: true
						},
						with: {
							aliases: {
								columns: {
									alias: true
								}
							},
							additionalNationalities: {
								columns: {
									nationality: true
								}
							},
							gameAccounts: {
								columns: {
									accountId: true,
									server: true,
									currentName: true,
									region: true
								}
							},
							socialAccounts: {
								columns: {
									platformId: true,
									accountId: true
								}
							}
						}
					},
					eventTeam: {
						columns: {
							entry: true,
							status: true
						}
						// with: {
						// 	team: {
						// 		columns: {
						// 			id: true,
						// 			slug: true,
						// 			name: true,
						// 			abbr: true,
						// 			logo: true,
						// 			region: true
						// 		}
						// 	}
						// }
					}
				}
			},
			stages: {
				columns: {
					id: true,
					title: true,
					stage: true,
					format: true
				},
				with: {
					rounds: {
						columns: {
							id: true,
							type: true,
							title: true,
							parallelGroup: true
						}
					},
					nodes: {
						columns: {
							matchId: true,
							roundId: true,
							order: true
						},
						with: {
							dependencies: {
								columns: {
									dependencyMatchId: true,
									outcome: true
								}
							}
						}
					},
					matches: {
						columns: {
							id: true,
							format: true
						},
						with: {
							games: {
								with: {
									gameTeams: {
										with: {
											team: true
										}
									},
									gameVods: true,
									gamePlayerScores: true,
									map: {
										columns: {
											id: true
										}
									}
								}
							},
							matchMaps: {
								columns: {
									map_picker_position: true,
									side: true
								},
								with: {
									map: {
										columns: {
											id: true
										}
									}
								}
							},
							matchTeams: {
								columns: {
									teamId: true,
									score: true,
									position: true
								},
								with: {
									team: {
										columns: {
											id: true,
											slug: true,
											name: true,
											abbr: true,
											logo: true,
											region: true,
											createdAt: true,
											updatedAt: true
										}
									}
								}
							}
						}
					}
				}
			}
		}
	});
	console.info(`[Events] Event query took ${(performance.now() - eventQueryStart).toFixed(2)}ms`);

	if (!eventData) {
		console.info(`[Events] Event not found: ${id}`);
		return undefined;
	}
	console.info(`[Events] Event data: ${JSON.stringify(eventData, null, 2)}`);

	// #endregion

	// #region Event postprocessing

	const eventPostprocessingStart = performance.now();

	function normalizePlayerGameAccount<
		T extends {
			gameAccounts: {
				server: string;
				accountId: number;
				currentName: string;
				region: string | null;
			}[];
		}
	>(player: T): Omit<T, 'gameAccounts'> & { gameAccounts: GameAccount[] } {
		return {
			...player,
			gameAccounts: player.gameAccounts.map((ga) => ({
				...ga,
				region: ga.region ? (ga.region as GameAccountRegion) : undefined,
				server: ga.server as GameAccountServer
			}))
		};
	}

	const teamPlayersMap = new Map<string, EventParticipant>();
	for (const teamPlayer of eventData.teamPlayers) {
		if (!teamPlayer.team || !teamPlayer.player) continue;
		if (!teamPlayersMap.has(teamPlayer.team.id)) {
			teamPlayersMap.set(teamPlayer.team.id, {
				main: [],
				reserve: [],
				coach: [],
				entry: teamPlayer.eventTeam?.entry as typeof teamData.entry,
				status: teamPlayer.eventTeam?.status as typeof teamData.status,
				team: teamPlayer.team
			});
		}
		const teamData = teamPlayersMap.get(teamPlayer.team.id)!;
		if (teamPlayer.role === 'main') {
			teamData.main.push(normalizePlayerGameAccount(normalizePlayer(teamPlayer.player)));
		} else if (teamPlayer.role === 'sub') {
			teamData.reserve.push(normalizePlayerGameAccount(normalizePlayer(teamPlayer.player)));
		} else if (teamPlayer.role === 'coach') {
			teamData.coach.push(normalizePlayerGameAccount(normalizePlayer(teamPlayer.player)));
		}

		if (teamPlayer.eventTeam) {
			teamData.entry = teamPlayer.eventTeam.entry as typeof teamData.entry;
			teamData.status = teamPlayer.eventTeam.status as typeof teamData.status;
			teamData.team = teamPlayer.team;
		}
	}

	const participants = Array.from(teamPlayersMap.values()).map(
		(teamData) =>
			({
				main: teamData.main,
				reserve: teamData.reserve,
				coach: teamData.coach,
				entry: teamData.entry,
				status: teamData.status,
				team: teamData.team
			}) satisfies EventParticipant
	);

	const compiledEventData = {
		...eventData,
		websites: eventData.websites.map((website) => ({
			...website,
			label: website.label ?? undefined
		})),
		organizers: eventData.organizers.map((organizer) => {
			return {
				...organizer.organizer,
				url: organizer.organizer.url ?? undefined
			};
		}),
		results: eventData.results.map((result) => ({
			...result,
			rankTo: result.rankTo ?? undefined,
			team: result.team,
			prizes: [
				{
					amount: result.prizeAmount ?? 0,
					currency: result.prizeCurrency ?? 'Bablo' // TODO: Good default
				}
			]
		})),
		videos: eventData.videos.map((video) => ({
			...video,
			platform: video.platform as 'twitch' | 'youtube' | 'bilibili',
			title: video.title ?? undefined
		})),
		participants,
		stages: eventData.stages.map((stage) => ({
			id: stage.id,
			title: stage.title,
			stage: stage.stage,
			format: stage.format,
			matches: stage.matches.map((match) => {
				const teamA = match.matchTeams.find((mt) => mt.position === 0);
				const teamB = match.matchTeams.find((mt) => mt.position === 1);

				return {
					id: match.id,
					teams: [
						{
							team: teamA?.team ?? {
								id: 'unknown-a',
								slug: 'unknown',
								name: 'Unknown',
								abbr: 'UNK',
								region: 'unknown',
								logo: 'unknown',
								createdAt: 'unknown',
								updatedAt: 'unknown'
							},
							score: teamA?.score ?? 0,
							roaster: [], // TODO:,
							substitutes: [] // TODO:
						},
						{
							team: teamB?.team ?? {
								id: 'unknown-b',
								slug: 'unknown',
								name: 'Unknown',
								abbr: 'UNK',
								region: 'unknown',
								logo: 'unknown',
								createdAt: 'unknown',
								updatedAt: 'unknown'
							},
							score: teamB?.score ?? 0,
							roaster: [], // TODO:,
							substitutes: [] // TODO:
						}
					] satisfies [
						{
							team: Team;
							score: number;
							roaster: Player[];
							substitutes: Player[];
						},
						{
							team: Team;
							score: number;
							roaster: Player[];
							substitutes: Player[];
						}
					],
					battleOf: match.format ?? 'BO3', // TODO: Should be non-null
					maps: match.matchMaps.map((map) => ({
						map: map.map.id,
						map_picker_position: map.map_picker_position,
						side: map.side === 0 ? 'Attack' : 'Defense'
					})),
					games: match.games.map((game) => {
						const teamA = game.gameTeams.find((gt) => gt.position === 0);
						const teamB = game.gameTeams.find((gt) => gt.position === 1);

						const teamAScores = game.gamePlayerScores
							.filter((ps) => ps.teamId === teamA?.team?.id)
							.map((ps) => ({
								accountId: ps.accountId,
								player: ps.player,
								playerSlug: undefined, // We don't have slug mapping here
								characters: [ps.characterFirstHalf, ps.characterSecondHalf] satisfies [
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

						const teamBScores = game.gamePlayerScores
							.filter((ps) => ps.teamId === teamB?.team?.id)
							.map((ps) => ({
								accountId: ps.accountId,
								player: ps.player,
								playerSlug: undefined, // We don't have slug mapping here
								characters: [ps.characterFirstHalf, ps.characterSecondHalf] satisfies [
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
							id: game.id,
							map: game.map?.id,
							duration: game.duration,
							teams: [teamA?.team?.id ?? '', teamB?.team?.id ?? ''] satisfies [string, string],
							result: [teamA?.score ?? 0, teamB?.score ?? 0] satisfies [number, number],
							winner: game.winner,
							vods: game.gameVods.map((vod) => ({
								url: vod.url,
								type: vod.type,
								platform: vod.platform ?? 'youtube', // TODO: Should be non-null
								playerId: vod.playerId ?? undefined,
								teamId: vod.teamId ?? undefined,
								language: vod.language ?? undefined,
								title: vod.title ?? undefined,
								official: vod.official,
								startTime: vod.startTime ?? undefined,
								available: vod.available,
								createdAt: vod.createdAt,
								updatedAt: vod.updatedAt
							})),
							scores: [teamAScoresFixed, teamBScoresFixed] satisfies [
								A: [PlayerScore, PlayerScore, PlayerScore, PlayerScore, PlayerScore],
								B: [PlayerScore, PlayerScore, PlayerScore, PlayerScore, PlayerScore]
							]
							// teams: match.teamsg.map((team) => team?.team)
						};
					})
				};
			}),
			structure: {
				rounds: stage.rounds.map((round) => ({
					id: round.id,
					type: round.type,
					title: round.title ? fakeLocalizedString(round.title) : undefined,
					parallelGroup: round.parallelGroup ?? undefined
				})),
				nodes: stage.nodes.map((node) => ({
					matchId: node.matchId,
					round: node.roundId,
					dependsOn: node.dependencies?.map((dep) => ({
						matchId: dep.dependencyMatchId,
						outcome: dep.outcome
					})),
					order: node.order
				})) satisfies StageNode[]
			}
		})),
		casters: eventData.casters.map((caster) => ({
			...caster,
			player: normalizePlayer(caster.player)
		}))
	};

	console.info(
		`[Events] Event postprocessing took ${(performance.now() - eventPostprocessingStart).toFixed(2)}ms`
	);

	// #endregion

	// #region Image URL processing
	const imageUrlProcessingStart = performance.now();

	const uniqueImageUrls = new Set<string>();

	if (compiledEventData.image) uniqueImageUrls.add(compiledEventData.image);
	for (const organizer of compiledEventData.organizers) {
		if (organizer.logo) uniqueImageUrls.add(organizer.logo);
	}
	for (const result of compiledEventData.results) {
		if (result.team.logo) uniqueImageUrls.add(result.team.logo);
	}
	for (const participant of compiledEventData.participants) {
		for (const player of participant.main) {
			if (player.avatar) uniqueImageUrls.add(player.avatar);
		}
	}
	for (const stage of compiledEventData.stages) {
		for (const match of stage.matches) {
			for (const team of match.teams) {
				if (team.team.logo) uniqueImageUrls.add(team.team.logo);
			}
		}
	}

	const imageUrlMap = new Map<string, string>();

	await Promise.all(
		Array.from(uniqueImageUrls).map(async (url) => {
			const processed = await processImageURL(url);
			imageUrlMap.set(url, processed);
		})
	);

	const compiledEventDataWithImageURLs = {
		...compiledEventData,
		imageURL: imageUrlMap.get(compiledEventData.image),
		organizers: compiledEventData.organizers.map((organizer) => ({
			...organizer,
			logoURL: imageUrlMap.get(organizer.logo)
		}))
	};

	console.info(
		`[Events] Image URL processing took ${(performance.now() - imageUrlProcessingStart).toFixed(2)}ms`
	);

	// #endregion

	return compiledEventDataWithImageURLs;
}

export async function getEventsForAdminPage(): Promise<
	Array<{
		id: string;
		slug: string;
		name: string;
		server: string;
		capacity: number;
		format: string;
		region: string;
		status: string;
		official: boolean;
		date: string;
		image: string;
		imageURL?: string;
		organizers: Array<{
			id: string;
			name: string;
			slug: string;
			description?: string;
			url?: string;
			type?: string;
			logo: string;
		}>;
		websites?: Array<{
			url: string;
			label?: string;
		}>;
		videos?: Array<{
			type: 'stream' | 'clip' | 'vod';
			platform: 'twitch' | 'youtube' | 'bilibili';
			url: string;
			title?: string;
		}>;
		results?: Array<{
			rank: number;
			rankTo?: number;
			team: {
				id: string;
				name: string;
				slug: string;
				logo?: string;
				logoURL?: string;
			};
			prizes: Array<{
				amount: number;
				currency: string;
			}>;
		}>;
	}>
> {
	const totalStart = performance.now();
	console.info('[Events] Fetching events for admin page');

	// Direct Drizzle query for admin page essential data only
	const eventsQueryStart = performance.now();
	const eventsWithOrganizers = await db
		.select({
			event: table.event,
			organizer: table.organizer,
			eventWebsite: table.eventWebsite,
			eventVideo: table.eventVideo,
			eventResult: table.eventResult,
			team: table.team
		})
		.from(table.event)
		.leftJoin(table.eventOrganizer, eq(table.eventOrganizer.eventId, table.event.id))
		.leftJoin(table.organizer, eq(table.organizer.id, table.eventOrganizer.organizerId))
		.leftJoin(table.eventWebsite, eq(table.eventWebsite.eventId, table.event.id))
		.leftJoin(table.eventVideo, eq(table.eventVideo.eventId, table.event.id))
		.leftJoin(table.eventResult, eq(table.eventResult.eventId, table.event.id))
		.leftJoin(table.team, eq(table.team.id, table.eventResult.teamId));
	const eventsQueryDuration = performance.now() - eventsQueryStart;
	console.info(`[Events] Admin events query took ${eventsQueryDuration.toFixed(2)}ms`);

	// Group data by event
	const dataProcessingStart = performance.now();
	const eventsMap = new Map<
		string,
		{
			event: Event;
			organizers: Organizer[];
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
			results: Array<{
				rank: number;
				rankTo?: number;
				team: {
					id: string;
					name: string;
					slug: string;
					logo?: string;
					logoURL?: string;
				};
				prizes: Array<{
					amount: number;
					currency: string;
				}>;
			}>;
		}
	>();

	eventsWithOrganizers.forEach(
		({ event, organizer, eventWebsite, eventVideo, eventResult, team }) => {
			if (!eventsMap.has(event.id)) {
				eventsMap.set(event.id, {
					event,
					organizers: [],
					websites: [],
					videos: [],
					results: []
				});
			}
			const eventData = eventsMap.get(event.id)!;

			if (organizer) {
				// Only add the organizer if it's not already in the array
				if (!eventData.organizers.some((o) => o.id === organizer.id)) {
					eventData.organizers.push(organizer);
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

			if (eventResult && team) {
				// Only add the result if it's not already in the array and has valid data
				if (
					!eventData.results.some((r) => r.team.id === team.id && r.rank === eventResult.rank) &&
					eventResult.rank !== null &&
					eventResult.prizeAmount !== null &&
					eventResult.prizeCurrency !== null
				) {
					eventData.results.push({
						rank: eventResult.rank,
						rankTo: eventResult.rankTo ?? undefined,
						team: {
							id: team.id,
							name: team.name,
							slug: team.slug,
							logo: team.logo || undefined,
							logoURL: team.logo ? undefined : undefined // Will be processed later
						},
						prizes: [
							{
								amount: eventResult.prizeAmount,
								currency: eventResult.prizeCurrency
							}
						]
					});
				}
			}
		}
	);
	const dataProcessingDuration = performance.now() - dataProcessingStart;
	console.info(`[Events] Admin data processing took ${dataProcessingDuration.toFixed(2)}ms`);

	// Convert to admin page format
	const finalProcessingStart = performance.now();

	// Step 1: Collect unique image URLs
	const uniqueImageUrls = new Set<string>();

	for (const { event, organizers, results } of eventsMap.values()) {
		if (event.image) uniqueImageUrls.add(event.image);
		for (const organizer of organizers) {
			if (organizer.logo) uniqueImageUrls.add(organizer.logo);
		}
		for (const result of results) {
			if (result.team.logo) uniqueImageUrls.add(result.team.logo);
		}
	}

	// Step 2: Process all image URLs in parallel
	const imageUrlMap = new Map<string, string>();

	await Promise.all(
		Array.from(uniqueImageUrls).map(async (url) => {
			const processed = await processImageURL(url);
			imageUrlMap.set(url, processed);
		})
	);

	// Step 3: Apply processed URLs to the data
	const result = Array.from(eventsMap.values()).map(
		({ event, organizers, websites, videos, results }) => {
			return {
				id: event.id,
				slug: event.slug,
				name: event.name,
				server: event.server,
				capacity: event.capacity,
				format: event.format,
				region: event.region,
				status: event.status,
				official: event.official,
				date: event.date,
				image: event.image,
				imageURL: event.image ? imageUrlMap.get(event.image) || undefined : undefined,
				organizers:
					organizers.length > 0
						? organizers.map((organizer) => ({
								...organizer,
								logo: organizer.logo
									? imageUrlMap.get(organizer.logo) || organizer.logo
									: organizer.logo,
								description: organizer.description ?? undefined,
								url: organizer.url ?? undefined,
								type: organizer.type ?? undefined
							}))
						: [],
				websites: websites.length > 0 ? websites : undefined,
				videos: videos.length > 0 ? videos : undefined,
				results:
					results.length > 0
						? results.map((result) => ({
								...result,
								team: {
									...result.team,
									logoURL: result.team.logo
										? imageUrlMap.get(result.team.logo) || undefined
										: undefined
								}
							}))
						: undefined
			};
		}
	);
	const finalProcessingDuration = performance.now() - finalProcessingStart;
	console.info(`[Events] Admin final processing took ${finalProcessingDuration.toFixed(2)}ms`);

	const totalDuration = performance.now() - totalStart;
	console.info(`[Events] Total getEventsForAdminPage took ${totalDuration.toFixed(2)}ms`);

	return result;
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

export async function getAdminEventSummaries(): Promise<
	Array<{ id: string; name: string; date: string; image: string; imageURL?: string }>
> {
	const rows = await db.query.event.findMany({
		columns: { id: true, name: true, date: true, image: true }
	});

	const uniqueImages = new Set<string>();
	for (const r of rows) if (r.image) uniqueImages.add(r.image);

	const imageUrlMap = new Map<string, string>();
	await Promise.all(
		Array.from(uniqueImages).map(async (url) => {
			try {
				const processed = await processImageURL(url);
				imageUrlMap.set(url, processed);
			} catch {
				imageUrlMap.set(url, url);
			}
		})
	);

	return rows
		.map((e) => ({
			id: e.id,
			name: e.name,
			date: e.date,
			image: e.image,
			imageURL: e.image ? imageUrlMap.get(e.image) : undefined
		}))
		.sort((a, b) => {
			const at = safeParseDateRange(a.date)?.start.getTime() ?? 0;
			const bt = safeParseDateRange(b.date)?.start.getTime() ?? 0;
			return bt - at;
		});
}
