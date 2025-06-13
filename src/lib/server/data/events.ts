import type { Event as AppEvent } from '$lib/data/events';
import type { Event, EventOrganizer } from '$lib/server/db/schemas/game/event';
import type { Organizer } from '$lib/server/db/schemas/game/organizer';
import { db } from '../db';
import * as table from '$lib/server/db/schema';
import { processImageURL } from '$lib/server/storage';
import type { Region } from '$lib/data/game';
import { inArray, eq, or } from 'drizzle-orm';
import { convertOrganizer } from './organizers';
import type { LegacyEventParticipant, EventParticipant } from '$lib/data/events';
import type { Player } from '$lib/data/players';
import { getPlayer } from '$lib/server/data/players';
import type { UserRole } from '$lib/data/user';
import type { TCountryCode } from 'countries-list';

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
		.where(
			conditions.searchKeyword
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
			eventWebsite: table.eventWebsite
		})
		.from(table.event)
		.leftJoin(table.eventOrganizer, eq(table.eventOrganizer.eventId, table.event.id))
		.leftJoin(table.organizer, eq(table.organizer.id, table.eventOrganizer.organizerId))
		.leftJoin(table.eventTeamPlayer, eq(table.eventTeamPlayer.eventId, table.event.id))
		.leftJoin(table.team, eq(table.team.id, table.eventTeamPlayer.teamId))
		.leftJoin(table.player, eq(table.player.id, table.eventTeamPlayer.playerId))
		.leftJoin(table.eventWebsite, eq(table.eventWebsite.eventId, table.event.id))
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
				websites: []
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
		({ event, organizer, eventTeamPlayer, team, player, eventWebsite }) => {
			if (!eventsMap.has(event.id)) {
				eventsMap.set(event.id, {
					event,
					organizers: [],
					teamPlayers: [],
					results: [],
					websites: []
				});
			}
			if (organizer) {
				const eventData = eventsMap.get(event.id)!;
				// Only add the organizer if it's not already in the array
				if (!eventData.organizers.some((o) => o.id === organizer.id)) {
					eventData.organizers.push(organizer);
				}
			}
			if (eventTeamPlayer && team && player) {
				const eventData = eventsMap.get(event.id)!;
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
				const eventData = eventsMap.get(event.id)!;
				// Only add the website if it's not already in the array
				if (!eventData.websites.some((w) => w.url === eventWebsite.url)) {
					eventData.websites.push({
						url: eventWebsite.url,
						label: eventWebsite.label || undefined
					});
				}
			}
		}
	);

	const events = await Promise.all(
		Array.from(eventsMap.values()).map(
			async ({ event, organizers, teamPlayers, results, websites }) => ({
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
				websites: websites.length > 0 ? websites : undefined
			})
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
				...event,
				stages: [],
				organizers:
					event.organizers.length > 0
						? await Promise.all(event.organizers.map(convertOrganizer))
						: [],
				participants,
				server: event.server as 'calabiyau' | 'strinova',
				format: event.format as 'lan' | 'online' | 'hybrid',
				region: event.region as Region,
				status: event.status as 'upcoming' | 'live' | 'finished' | 'cancelled' | 'postponed'
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
