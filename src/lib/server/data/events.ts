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
import type {
	LegacyEventParticipant,
	EventParticipant,
	StageNode,
	Stage,
	EventResult
} from '$lib/data/events';
import type { Player } from '$lib/data/players';
import { getPlayer } from '$lib/server/data/players';
import type { UserRole } from '$lib/data/user';
import type { TCountryCode } from 'countries-list';
import type { Participant } from '$lib/data/matches';
import type { EssentialEvent } from '$lib/components/EventCard.svelte';
import type { GameMap } from '$lib/data/game';

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

// Type for event field changes
export interface EventFieldChange {
	from: Event[keyof Event];
	to: Event[keyof Event];
}

// Type for match data structure
export interface EventMatchData {
	id: string;
	teams: Array<{
		team: string;
		score: number;
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
	console.info('[Events] Fetching essential events');

	// Simple query to get only essential event data
	const eventsQueryStart = performance.now();
	const eventsWithOrganizers = await db
		.select({
			event: table.event,
			organizer: table.organizer,
			eventVideo: table.eventVideo,
			eventTeamPlayer: table.eventTeamPlayer
		})
		.from(table.event)
		.leftJoin(table.eventOrganizer, eq(table.eventOrganizer.eventId, table.event.id))
		.leftJoin(table.organizer, eq(table.organizer.id, table.eventOrganizer.organizerId))
		.leftJoin(table.eventVideo, eq(table.eventVideo.eventId, table.event.id))
		.leftJoin(table.eventTeamPlayer, eq(table.eventTeamPlayer.eventId, table.event.id));
	const eventsQueryDuration = performance.now() - eventsQueryStart;
	console.info(`[Events] Essential events query took ${eventsQueryDuration.toFixed(2)}ms`);

	// Group data by event
	const dataProcessingStart = performance.now();
	const eventsMap = new Map<
		string,
		{
			event: Event;
			organizers: Organizer[];
			videos: Array<{
				type: 'stream' | 'clip' | 'vod';
				platform: 'twitch' | 'youtube' | 'bilibili';
				url: string;
				title?: string;
			}>;
			uniqueTeams: Set<string>;
		}
	>();

	eventsWithOrganizers.forEach(({ event, organizer, eventVideo, eventTeamPlayer }) => {
		if (!eventsMap.has(event.id)) {
			eventsMap.set(event.id, {
				event,
				organizers: [],
				videos: [],
				uniqueTeams: new Set()
			});
		}
		const eventData = eventsMap.get(event.id)!;

		if (organizer) {
			// Only add the organizer if it's not already in the array
			if (!eventData.organizers.some((o) => o.id === organizer.id)) {
				eventData.organizers.push(organizer);
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

		// Track unique teams
		if (eventTeamPlayer) {
			eventData.uniqueTeams.add(eventTeamPlayer.teamId);
		}
	});
	const dataProcessingDuration = performance.now() - dataProcessingStart;
	console.info(`[Events] Essential data processing took ${dataProcessingDuration.toFixed(2)}ms`);

	// Convert to EssentialEvent format
	const finalProcessingStart = performance.now();
	const result = await Promise.all(
		Array.from(eventsMap.values()).map(async ({ event, organizers, videos, uniqueTeams }) => {
			return {
				slug: event.slug,
				imageURL: await processImageURL(event.image),
				image: event.image,
				name: event.name,
				status: event.status as 'upcoming' | 'live' | 'finished' | 'cancelled' | 'postponed',
				date: event.date,
				participants: Array(uniqueTeams.size).fill(null), // Create array with actual team count
				capacity: event.capacity,
				region: event.region,
				format: event.format as 'lan' | 'online' | 'hybrid',
				official: event.official,
				organizers:
					organizers.length > 0 ? await Promise.all(organizers.map(convertOrganizer)) : undefined,
				videos: videos.length > 0 ? videos : undefined
			};
		})
	);
	const finalProcessingDuration = performance.now() - finalProcessingStart;
	console.info(`[Events] Essential final processing took ${finalProcessingDuration.toFixed(2)}ms`);

	const totalDuration = performance.now() - totalStart;
	console.info(`[Events] Total getEssentialEvents took ${totalDuration.toFixed(2)}ms`);

	return result;
}

export async function getEvent(id: string): Promise<AppEvent | undefined> {
	const totalStart = performance.now();
	console.info(`[Events] Fetching single event: ${id}`);

	// Simple query to get basic event data first
	const eventQueryStart = performance.now();
	const [eventData] = await db
		.select({
			event: table.event,
			organizer: table.organizer
		})
		.from(table.event)
		.leftJoin(table.eventOrganizer, eq(table.eventOrganizer.eventId, table.event.id))
		.leftJoin(table.organizer, eq(table.organizer.id, table.eventOrganizer.organizerId))
		.where(or(eq(table.event.id, id), eq(table.event.slug, id)));
	const eventQueryDuration = performance.now() - eventQueryStart;
	console.info(`[Events] Event query took ${eventQueryDuration.toFixed(2)}ms`);

	if (!eventData?.event) {
		console.info(`[Events] Event not found: ${id}`);
		return undefined;
	}

	// Get organizers separately
	const organizersQueryStart = performance.now();
	const organizers = await db
		.select({
			organizer: table.organizer
		})
		.from(table.eventOrganizer)
		.leftJoin(table.organizer, eq(table.organizer.id, table.eventOrganizer.organizerId))
		.where(eq(table.eventOrganizer.eventId, eventData.event.id));
	const organizersQueryDuration = performance.now() - organizersQueryStart;
	console.info(`[Events] Organizers query took ${organizersQueryDuration.toFixed(2)}ms`);

	// Get event results separately
	const resultsQueryStart = performance.now();
	const eventResults = await db
		.select({
			eventId: table.eventResult.eventId,
			teamId: table.eventResult.teamId,
			rank: table.eventResult.rank,
			rankTo: table.eventResult.rankTo,
			prizeAmount: table.eventResult.prizeAmount,
			prizeCurrency: table.eventResult.prizeCurrency,
			team: table.team
		})
		.from(table.eventResult)
		.leftJoin(table.team, eq(table.team.id, table.eventResult.teamId))
		.where(eq(table.eventResult.eventId, eventData.event.id));
	const resultsQueryDuration = performance.now() - resultsQueryStart;
	console.info(`[Events] Results query took ${resultsQueryDuration.toFixed(2)}ms`);

	// Get event websites separately
	const websitesQueryStart = performance.now();
	const websites = await db
		.select({
			url: table.eventWebsite.url,
			label: table.eventWebsite.label
		})
		.from(table.eventWebsite)
		.where(eq(table.eventWebsite.eventId, eventData.event.id));
	const websitesQueryDuration = performance.now() - websitesQueryStart;
	console.info(`[Events] Websites query took ${websitesQueryDuration.toFixed(2)}ms`);

	// Get event videos separately
	const videosQueryStart = performance.now();
	const videos = await db
		.select({
			type: table.eventVideo.type,
			platform: table.eventVideo.platform,
			url: table.eventVideo.url,
			title: table.eventVideo.title
		})
		.from(table.eventVideo)
		.where(eq(table.eventVideo.eventId, eventData.event.id));
	const videosQueryDuration = performance.now() - videosQueryStart;
	console.info(`[Events] Videos query took ${videosQueryDuration.toFixed(2)}ms`);

	// Get event casters separately
	const castersQueryStart = performance.now();
	const casters = await db
		.select({
			role: table.eventCaster.role,
			player: table.player
		})
		.from(table.eventCaster)
		.leftJoin(table.player, eq(table.player.id, table.eventCaster.playerId))
		.where(eq(table.eventCaster.eventId, eventData.event.id));
	const castersQueryDuration = performance.now() - castersQueryStart;
	console.info(`[Events] Casters query took ${castersQueryDuration.toFixed(2)}ms`);

	// Get event team players separately
	const teamPlayersQueryStart = performance.now();
	const teamPlayers = await db
		.select({
			team: table.team,
			player: table.player,
			role: table.eventTeamPlayer.role
		})
		.from(table.eventTeamPlayer)
		.leftJoin(table.team, eq(table.team.id, table.eventTeamPlayer.teamId))
		.leftJoin(table.player, eq(table.player.id, table.eventTeamPlayer.playerId))
		.where(eq(table.eventTeamPlayer.eventId, eventData.event.id));
	const teamPlayersQueryDuration = performance.now() - teamPlayersQueryStart;
	console.info(`[Events] Team players query took ${teamPlayersQueryDuration.toFixed(2)}ms`);

	// Get stages and related data separately
	const stagesQueryStart = performance.now();
	const stages = await db
		.select({
			stage: table.stage,
			stageRound: table.stageRound,
			stageNode: table.stageNode,
			stageNodeDependency: table.stageNodeDependency,
			match: table.match
		})
		.from(table.stage)
		.leftJoin(table.stageRound, eq(table.stageRound.stageId, table.stage.id))
		.leftJoin(table.stageNode, eq(table.stageNode.stageId, table.stage.id))
		.leftJoin(table.stageNodeDependency, eq(table.stageNodeDependency.nodeId, table.stageNode.id))
		.leftJoin(table.match, eq(table.match.id, table.stageNode.matchId))
		.where(eq(table.stage.eventId, eventData.event.id));
	const stagesQueryDuration = performance.now() - stagesQueryStart;
	console.info(`[Events] Stages query took ${stagesQueryDuration.toFixed(2)}ms`);

	// Process the data
	const processingStart = performance.now();

	// Process organizers
	const processedOrganizers = organizers
		.filter(
			(o): o is typeof o & { organizer: NonNullable<typeof o.organizer> } => o.organizer !== null
		)
		.map((o) => o.organizer);

	// Process results
	const processedResults = eventResults
		.filter(
			(r): r is typeof r & { team: NonNullable<typeof r.team> } =>
				r.team !== null && r.rank !== null && r.prizeAmount !== null && r.prizeCurrency !== null
		)
		.map(async (r) => ({
			rank: r.rank,
			rankTo: r.rankTo ?? undefined,
			team: {
				...r.team,
				logoURL: r.team.logo ? await processImageURL(r.team.logo) : null
			},
			prizes: [
				{
					amount: r.prizeAmount,
					currency: r.prizeCurrency
				}
			]
		}));

	// Process websites
	const processedWebsites = websites.map((w) => ({
		url: w.url,
		label: w.label || undefined
	}));

	// Process videos
	const processedVideos = videos.map((v) => ({
		type: v.type as 'stream' | 'clip' | 'vod',
		platform: v.platform as 'twitch' | 'youtube' | 'bilibili',
		url: v.url,
		title: v.title || undefined
	}));

	// Process casters
	const processedCasters = await Promise.all(
		casters
			.filter((c): c is typeof c & { player: NonNullable<typeof c.player> } => c.player !== null)
			.map(async (c) => {
				const player = await getPlayer(c.player.id);
				return player ? { player, role: c.role as 'host' | 'analyst' | 'commentator' } : null;
			})
	);
	const validCasters = processedCasters.filter((c): c is NonNullable<typeof c> => c !== null);

	// Get full player data for team players
	const uniquePlayerIds = Array.from(
		new Set(
			teamPlayers
				.map((tp) => tp.player?.id)
				.filter((id): id is string => id !== undefined && id !== null)
		)
	);

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
	const teamPlayersMap = new Map<string, { main: Player[]; reserve: Player[]; coach: Player[] }>();

	teamPlayers.forEach(({ team, player, role }) => {
		if (!team || !player) return;

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

	// Convert to participants
	const participants = await Promise.all(
		Array.from(teamPlayersMap.entries()).map(async ([teamId, players]) => {
			const teamObj = teamPlayers.find((t) => t.team?.id === teamId)?.team;
			if (!teamObj) {
				return {
					team: teamId,
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

	// Process stages with matches
	const stageMap = new Map<
		number,
		{
			stage: typeof table.stage.$inferSelect;
			rounds: Map<
				number,
				{
					round: typeof table.stageRound.$inferSelect;
					nodes: Array<{
						node: typeof table.stageNode.$inferSelect;
						dependencies: Array<{
							dependencyMatchId: string;
							outcome: string;
						}>;
					}>;
				}
			>;
		}
	>();

	stages.forEach((row) => {
		if (!row.stage) return;

		if (!stageMap.has(row.stage.id)) {
			stageMap.set(row.stage.id, {
				stage: row.stage,
				rounds: new Map()
			});
		}

		const stageData = stageMap.get(row.stage.id)!;

		if (row.stageRound) {
			if (!stageData.rounds.has(row.stageRound.id)) {
				stageData.rounds.set(row.stageRound.id, {
					round: row.stageRound,
					nodes: []
				});
			}

			const roundData = stageData.rounds.get(row.stageRound.id)!;

			if (row.stageNode) {
				const nodeData = {
					node: row.stageNode,
					dependencies: [] as Array<{
						dependencyMatchId: string;
						outcome: string;
					}>
				};

				if (row.stageNodeDependency) {
					nodeData.dependencies.push({
						dependencyMatchId: row.stageNodeDependency.dependencyMatchId,
						outcome: row.stageNodeDependency.outcome
					});
				}

				roundData.nodes.push(nodeData);
			}
		}
	});

	// Get all match IDs from stages
	const allMatchIds = new Set<string>();
	Array.from(stageMap.values()).forEach((stageData) => {
		stageData.rounds.forEach((roundData) => {
			roundData.nodes.forEach((nodeData) => {
				if (nodeData.node.matchId) {
					allMatchIds.add(nodeData.node.matchId);
				}
			});
		});
	});

	// Query all matches for this event
	let eventMatches: EventMatchData[] = [];
	if (allMatchIds.size > 0) {
		const matchData = await db
			.select({
				match: table.match,
				matchTeam: table.matchTeam,
				team: table.team
			})
			.from(table.match)
			.leftJoin(table.matchTeam, eq(table.matchTeam.matchId, table.match.id))
			.leftJoin(table.team, eq(table.team.id, table.matchTeam.teamId))
			.where(inArray(table.match.id, Array.from(allMatchIds)));

		// Group match data by match ID
		const matchMap = new Map<string, EventMatchData>();
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
				if (matchObj) {
					matchObj.teams[matchTeam.position] = {
						team: team.abbr || team.name,
						score: matchTeam.score || 0
					};
				}
			}
		});
		eventMatches = Array.from(matchMap.values());
	}

	// Convert stages to expected format with matches
	const processedStages: Stage[] = Array.from(stageMap.values()).map((stageData) => {
		// Get matches for this stage
		const stageMatches = eventMatches
			.filter((match) =>
				Array.from(stageData.rounds.values()).some((roundData) =>
					roundData.nodes.some((nodeData) => nodeData.node.matchId === match.id)
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
					(mapData: { map: string; map_picker_position: number; side: number }) => ({
						map: mapData.map as GameMap,
						pickerId: mapData.map_picker_position,
						pickedSide: mapData.side === 0 ? ('Attack' as const) : ('Defense' as const)
					})
				)
			}));

		return {
			id: stageData.stage.id,
			title: stageData.stage.title,
			stage: stageData.stage.stage as 'qualifier' | 'playoff' | 'group' | 'showmatch',
			format: stageData.stage.format as 'single' | 'double' | 'swiss' | 'round-robin',
			matches: stageMatches,
			structure: {
				rounds: Array.from(stageData.rounds.values()).map((roundData) => ({
					id: roundData.round.id,
					type: roundData.round.type as
						| 'quarterfinals'
						| 'semifinals'
						| 'final'
						| 'top16'
						| 'group'
						| 'thirdplace'
						| 'lower'
						| 'grandfinal',
					title: roundData.round.title
						? {
								en: roundData.round.title,
								es: roundData.round.title,
								zh: roundData.round.title,
								ko: roundData.round.title,
								ja: roundData.round.title,
								'pt-br': roundData.round.title,
								de: roundData.round.title,
								ru: roundData.round.title,
								'zh-tw': roundData.round.title,
								vi: roundData.round.title,
								id: roundData.round.title,
								fr: roundData.round.title,
								'uk-ua': roundData.round.title
							}
						: undefined,
					parallelGroup: roundData.round.parallelGroup ?? undefined
				})),
				nodes: Array.from(stageData.rounds.values()).flatMap((roundData) =>
					roundData.nodes.map(
						(nodeData) =>
							({
								matchId: nodeData.node.matchId,
								round: nodeData.node.roundId,
								dependsOn: nodeData.dependencies?.map((dep) => ({
									matchId: dep.dependencyMatchId,
									outcome: dep.outcome as 'winner' | 'loser'
								})),
								order: nodeData.node.order
							}) as StageNode
					)
				)
			}
		};
	});

	const processingDuration = performance.now() - processingStart;
	console.info(`[Events] Data processing took ${processingDuration.toFixed(2)}ms`);

	// Build the final event object
	const event: AppEvent = {
		id: eventData.event.id,
		slug: eventData.event.slug,
		name: eventData.event.name,
		official: Boolean(eventData.event.official),
		server: eventData.event.server as 'calabiyau' | 'strinova',
		format: eventData.event.format as 'lan' | 'online' | 'hybrid',
		region: eventData.event.region as Region,
		image: eventData.event.image,
		imageURL: await processImageURL(eventData.event.image),
		status: eventData.event.status as 'upcoming' | 'live' | 'finished' | 'cancelled' | 'postponed',
		stages: processedStages,
		organizers: await Promise.all(processedOrganizers.map(convertOrganizer)),
		capacity: eventData.event.capacity,
		date: eventData.event.date,
		websites: processedWebsites.length > 0 ? processedWebsites : undefined,
		participants: participants,
		videos: processedVideos.length > 0 ? processedVideos : undefined,
		casters: validCasters.length > 0 ? validCasters : undefined,
		results:
			processedResults.length > 0
				? ((await Promise.all(processedResults)) as EventResult[])
				: undefined
	};

	const totalDuration = performance.now() - totalStart;
	console.info(`[Events] Total getEvent took ${totalDuration.toFixed(2)}ms`);

	return event;
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
			eventVideo: table.eventVideo
		})
		.from(table.event)
		.leftJoin(table.eventOrganizer, eq(table.eventOrganizer.eventId, table.event.id))
		.leftJoin(table.organizer, eq(table.organizer.id, table.eventOrganizer.organizerId))
		.leftJoin(table.eventWebsite, eq(table.eventWebsite.eventId, table.event.id))
		.leftJoin(table.eventVideo, eq(table.eventVideo.eventId, table.event.id));
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
		}
	>();

	eventsWithOrganizers.forEach(({ event, organizer, eventWebsite, eventVideo }) => {
		if (!eventsMap.has(event.id)) {
			eventsMap.set(event.id, {
				event,
				organizers: [],
				websites: [],
				videos: []
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
	});
	const dataProcessingDuration = performance.now() - dataProcessingStart;
	console.info(`[Events] Admin data processing took ${dataProcessingDuration.toFixed(2)}ms`);

	// Convert to admin page format
	const finalProcessingStart = performance.now();
	const result = await Promise.all(
		Array.from(eventsMap.values()).map(async ({ event, organizers, websites, videos }) => {
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
				imageURL: await processImageURL(event.image),
				organizers:
					organizers.length > 0 ? await Promise.all(organizers.map(convertOrganizer)) : [],
				websites: websites.length > 0 ? websites : undefined,
				videos: videos.length > 0 ? videos : undefined
			};
		})
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
