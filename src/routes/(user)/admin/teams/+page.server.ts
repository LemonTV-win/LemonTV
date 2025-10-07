import { fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { getAdminEventSummaries } from '$lib/server/data/events';
import { createTeam, updateTeam, deleteTeam } from '$lib/server/data/teams';
import { createPlayer, normalizePlayer } from '$lib/server/data/players';
import type { Region } from '$lib/data/game';
import { processImageURL } from '$lib/server/storage';
import { formatSlug } from '$lib/utils/strings';
import { checkPermissions } from '$lib/server/security/permission';
import type { GameAccountRegion, GameAccountServer } from '$lib/data/players';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	const teamsList = await db.select().from(table.team);
	const teamPlayers = await db.select().from(table.teamPlayer);
	const teamAliases = await db.select().from(table.teamAlias);
	const teamSlogans = await db.select().from(table.teamSlogan);
	const players = await db.query.player.findMany({
		columns: {
			id: true,
			name: true,
			slug: true,
			avatar: true,
			userId: true,
			nationality: true
		},
		with: {
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
			aliases: {
				columns: {
					alias: true
				}
			}
		}
	});

	// Collect unique logo URLs
	const uniqueLogoUrls = new Set<string>();
	for (const team of teamsList) {
		if (team.logo) {
			uniqueLogoUrls.add(team.logo);
		}
	}

	// Process all logo URLs in parallel
	const logoUrlMap = new Map<string, string>();
	await Promise.all(
		Array.from(uniqueLogoUrls).map(async (url) => {
			const processed = await processImageURL(url);
			logoUrlMap.set(url, processed);
		})
	);

	// Apply processed URLs to teams
	const teamsWithLogos = teamsList.map((team) => ({
		...team,
		logoURL: team.logo ? logoUrlMap.get(team.logo) || null : null
	}));

	// Transform players to include nationalities array
	const normalizedPlayers = players.map(normalizePlayer);

	// Minimal admin events: id, name, date, imageURL (processed)
	const adminEvents = await getAdminEventSummaries();

	return {
		teams: teamsWithLogos,
		teamPlayers,
		teamAliases,
		teamSlogans,
		players: normalizedPlayers,
		adminEvents,
		user: locals.user
	};
};

export const actions = {
	create: async ({ request, locals }) => {
		const result = checkPermissions(locals, ['admin', 'editor']);
		if (result.status === 'error') {
			return fail(result.statusCode, {
				error: result.error
			});
		}

		const formData = await request.formData();
		const name = formData.get('name') as string;
		const logo = formData.get('logo') as string | null;
		const region = formData.get('region') as string | null;
		const slug = formData.get('slug') as string | null;
		const abbr = formData.get('abbr') as string | null;
		const aliases = JSON.parse(formData.get('aliases') as string) as string[];
		const players = JSON.parse(formData.get('players') as string) as {
			playerId: string;
			role: string;
			startedOn?: string;
			endedOn?: string;
			note?: string;
		}[];
		const slogans = JSON.parse((formData.get('slogans') as string) || '[]') as Array<{
			id?: number;
			slogan: string;
			language?: string | null;
			eventId?: string | null;
		}>;

		if (!name) {
			return fail(400, {
				error: 'Name is required'
			});
		}

		try {
			await createTeam(
				{
					name,
					logo: logo || undefined,
					region: region as Region | undefined,
					slug: slug || undefined,
					abbr: abbr || undefined,
					aliases,
					players,
					slogans
				},
				result.userId
			);

			return {
				success: true
			};
		} catch (e) {
			console.error('Error creating team:', e);
			return fail(500, {
				error: 'Failed to create team'
			});
		}
	},

	update: async ({ request, locals }) => {
		const result = checkPermissions(locals, ['admin', 'editor']);
		if (result.status === 'error') {
			return fail(result.statusCode, {
				error: result.error
			});
		}

		const formData = await request.formData();
		const id = formData.get('id') as string;
		const name = formData.get('name') as string;
		const logo = formData.get('logo') as string | null;
		const region = formData.get('region') as string | null;
		const slug = formData.get('slug') as string | null;
		const abbr = formData.get('abbr') as string | null;
		const aliases = JSON.parse(formData.get('aliases') as string) as string[];
		const players = JSON.parse(formData.get('players') as string) as {
			playerId: string;
			role: string;
			startedOn?: string;
			endedOn?: string;
			note?: string;
		}[];
		const slogans = JSON.parse((formData.get('slogans') as string) || '[]') as Array<{
			id?: number;
			slogan: string;
			language?: string | null;
			eventId?: string | null;
		}>;

		if (!id || !name) {
			return fail(400, {
				error: 'ID and name are required'
			});
		}

		try {
			await updateTeam(
				{
					id,
					name,
					logo: logo || undefined,
					region: region as Region | undefined,
					slug: slug || undefined,
					abbr: abbr || undefined,
					aliases,
					players,
					slogans
				},
				result.userId
			);

			return {
				success: true
			};
		} catch (e) {
			console.error('Error updating team:', e);
			return fail(500, {
				error: 'Failed to update team'
			});
		}
	},

	delete: async ({ request, locals }) => {
		const result = checkPermissions(locals, ['admin', 'editor']);
		if (result.status === 'error') {
			return fail(result.statusCode, {
				error: result.error
			});
		}

		const formData = await request.formData();
		const id = formData.get('id') as string;

		if (!id) {
			return fail(400, {
				error: 'ID is required'
			});
		}

		try {
			await deleteTeam(id, result.userId);
			return {
				success: true
			};
		} catch (e) {
			console.error('Error deleting team:', e);
			return fail(500, {
				error: 'Failed to delete team'
			});
		}
	},

	batchCreate: async ({ request, locals }) => {
		const result = checkPermissions(locals, ['admin', 'editor']);
		if (result.status === 'error') {
			return fail(result.statusCode, {
				error: result.error
			});
		}

		const formData = await request.formData();
		const teamsData = formData.get('teams') as string;
		const eventId = formData.get('eventId') as string | null;
		const mergeMode = (formData.get('merge') as string | null) || null;

		if (!teamsData) {
			return fail(400, {
				error: 'Teams data is required'
			});
		}

		try {
			const teams = JSON.parse(teamsData) as Array<{
				name: string;
				slug?: string;
				abbr?: string;
				region?: string;
				logo?: string;
				aliases?: string[];
				slogans?: Array<{
					slogan: string;
					language?: string | null;
					eventId?: string | null;
				}>;
				players?: {
					player: {
						name: string;
						slug?: string;
						nationalities?: string[];
						aliases?: string[];
						gameAccounts?: {
							server: GameAccountServer;
							accountId: number;
							currentName: string;
							region?: GameAccountRegion;
						}[];
						socialAccounts?: {
							platformId: string;
							accountId: string;
							overridingUrl?: string;
						}[];
						user?: {
							id: string;
							username: string;
							email: string;
							roles: string[];
						};
					};
					teamPlayer: {
						role: 'active' | 'substitute' | 'former' | 'coach' | 'manager' | 'owner';
						startedOn?: string;
						endedOn?: string;
						note?: string;
					};
				}[];
			}>;

			let createdCount = 0;
			let mergedCount = 0;
			let playersCreated = 0;

			// Use a single transaction for all operations
			await db.transaction(async (tx) => {
				// Cache existing teams for merge lookups
				const existingTeams = await tx.select().from(table.team);
				const teamsBySlug = new Map<string, (typeof existingTeams)[number]>();
				const teamsByName = new Map<string, (typeof existingTeams)[number]>();
				for (const t of existingTeams) {
					if (t.slug) teamsBySlug.set(t.slug, t);
					if (t.name) teamsByName.set(t.name, t);
				}
				// First, create any new players that are needed
				const existingPlayers = await tx.select().from(table.player);
				const existingPlayerNames = new Set(existingPlayers.map((p) => p.name));
				const existingPlayerIds = new Set(existingPlayers.map((p) => p.id));
				const existingUserIds = new Set(existingPlayers.map((p) => p.userId).filter(Boolean));

				// Get existing game accounts to check for duplicates
				const existingGameAccounts = await tx.select().from(table.gameAccount);
				const existingAccountIds = new Set(existingGameAccounts.map((ga) => ga.accountId));

				// Collect all unique new players that need to be created
				const newPlayers = new Map<string, any>();
				for (const team of teams) {
					team.players?.forEach(({ player }) => {
						// Check if player already exists by ID, name, or account ID
						const hasExistingId = player.user?.id && existingUserIds.has(player.user.id);
						const hasExistingName = existingPlayerNames.has(player.name);
						const hasExistingAccountId = player.gameAccounts?.some((ga) =>
							existingAccountIds.has(ga.accountId)
						);

						if (!hasExistingId && !hasExistingName && !hasExistingAccountId) {
							// This is a new player that needs to be created
							if (!newPlayers.has(player.name)) {
								newPlayers.set(player.name, player);
							}
						}
					});
				}

				// Create new players using the transaction
				const playerIdMap = new Map<string, string>(); // Map from player name to new player ID
				for (const [playerName, playerData] of newPlayers) {
					try {
						// Convert the player data to the format expected by createPlayer
						const playerToCreate = {
							name: playerData.name,
							slug: playerData.slug,
							nationalities: playerData.nationalities || [],
							aliases: playerData.aliases || [],
							gameAccounts: playerData.gameAccounts || [],
							socialAccounts: playerData.socialAccounts || [],
							user: playerData.user
						};

						const newPlayerId = await createPlayer(playerToCreate, result.userId, tx);
						playerIdMap.set(playerName, newPlayerId);
						playersCreated++;
					} catch (error) {
						console.error(`Error creating player ${playerName}:`, error);
						throw new Error(
							`Failed to create player ${playerName}: ${error instanceof Error ? error.message : 'Unknown error'}`
						);
					}
				}

				// Now create or merge teams with the proper player relationships using the transaction
				for (const teamData of teams) {
					try {
						// Convert the new player structure to the expected format
						const convertedPlayers =
							teamData.players?.map(({ player, teamPlayer }) => {
								// If this is a new player, use the generated ID; otherwise, find existing player
								let playerId: string;

								if (playerIdMap.has(player.name)) {
									// This is a newly created player
									playerId = playerIdMap.get(player.name)!;
								} else {
									// This is an existing player - find by name, account ID, or user ID
									let existingPlayer = existingPlayers.find(
										(p) => p.name === player.name || p.userId === player.user?.id
									);

									// If not found by name or user ID, try to find by game account
									if (!existingPlayer && player.gameAccounts?.length) {
										for (const gameAccount of player.gameAccounts) {
											const matchingGameAccount = existingGameAccounts.find(
												(ga) =>
													ga.accountId === gameAccount.accountId && ga.server === gameAccount.server
											);
											if (matchingGameAccount) {
												existingPlayer = existingPlayers.find(
													(p) => p.id === matchingGameAccount.playerId
												);
												break;
											}
										}
									}

									if (!existingPlayer) {
										throw new Error(`Could not find existing player: ${player.name}`);
									}

									playerId = existingPlayer.id;
								}

								return {
									playerId,
									role: teamPlayer.role,
									startedOn: teamPlayer.startedOn ?? new Date().toISOString().split('T')[0],
									endedOn: teamPlayer.endedOn,
									note: teamPlayer.note
								};
							}) || [];

						// Determine if we should merge into an existing team
						const targetSlug = teamData.slug || formatSlug(teamData.name);
						const mergeTarget = mergeMode
							? teamsBySlug.get(targetSlug) || teamsByName.get(teamData.name)
							: undefined;

						let teamIdToUse: string;
						if (mergeTarget) {
							// MERGE: Add missing aliases, players, slogans; do not overwrite core fields
							teamIdToUse = mergeTarget.id;

							// Merge aliases
							if (teamData.aliases?.length) {
								const existingAliases = await tx
									.select()
									.from(table.teamAlias)
									.where(eq(table.teamAlias.teamId, teamIdToUse));
								const existingAliasSet = new Set(existingAliases.map((a) => a.alias));
								const aliasesToAdd = teamData.aliases.filter((a) => a && !existingAliasSet.has(a));
								if (aliasesToAdd.length) {
									await tx
										.insert(table.teamAlias)
										.values(aliasesToAdd.map((alias) => ({ teamId: teamIdToUse, alias })));
								}
							}

							// Merge players (avoid duplicates by playerId)
							if (convertedPlayers.length) {
								const existingTeamPlayers = await tx
									.select()
									.from(table.teamPlayer)
									.where(eq(table.teamPlayer.teamId, teamIdToUse));
								const existingPlayerIds = new Set(existingTeamPlayers.map((p) => p.playerId));
								const teamPlayersToAdd = convertedPlayers.filter(
									(p) => !existingPlayerIds.has(p.playerId)
								);
								if (teamPlayersToAdd.length) {
									await tx.insert(table.teamPlayer).values(
										teamPlayersToAdd.map((p) => ({
											teamId: teamIdToUse,
											playerId: p.playerId,
											role: p.role,
											startedOn: p.startedOn,
											endedOn: p.endedOn,
											note: p.note
										}))
									);
								}
							}

							// Merge slogans
							if (teamData.slogans?.length) {
								const existingSlogans = await tx
									.select()
									.from(table.teamSlogan)
									.where(eq(table.teamSlogan.teamId, teamIdToUse));
								const existingSloganSet = new Set(existingSlogans.map((s) => s.slogan));
								const slogansToAdd = (
									teamData.slogans as Array<{
										slogan: string;
										language?: string | null;
										eventId?: string | null;
									}>
								)
									.filter((s) => s.slogan?.trim())
									.filter((s) => !existingSloganSet.has(s.slogan.trim()));
								if (slogansToAdd.length) {
									await tx.insert(table.teamSlogan).values(
										slogansToAdd.map(
											(s: {
												slogan: string;
												language?: string | null;
												eventId?: string | null;
											}) => ({
												teamId: teamIdToUse,
												slogan: s.slogan.trim(),
												language: (s.language as any) ?? null,
												eventId: s.eventId ?? null
											})
										)
									);
								}
							}

							// Merge into event associations
							if (eventId) {
								const existingEventTeam = await tx
									.select()
									.from(table.eventTeam)
									.where(eq(table.eventTeam.eventId, eventId));
								if (!existingEventTeam.find((et) => et.teamId === teamIdToUse)) {
									await tx.insert(table.eventTeam).values({
										eventId,
										teamId: teamIdToUse,
										entry: 'open',
										status: 'active'
									});
								}

								if (convertedPlayers.length > 0) {
									const toEventRole = (
										role: 'active' | 'substitute' | 'former' | 'coach' | 'manager' | 'owner'
									): 'main' | 'sub' | 'coach' | null => {
										switch (role) {
											case 'active':
												return 'main';
											case 'substitute':
												return 'sub';
											case 'coach':
												return 'coach';
											default:
												return null;
										}
									};

									// Existing event team players for this team/event
									const existingETP = await tx
										.select()
										.from(table.eventTeamPlayer)
										.where(eq(table.eventTeamPlayer.eventId, eventId));
									const existingETPSet = new Set(
										existingETP.filter((p) => p.teamId === teamIdToUse).map((p) => p.playerId)
									);

									const eventTeamPlayers = convertedPlayers.flatMap((player) => {
										const eventRole = toEventRole(
											player.role as
												| 'active'
												| 'substitute'
												| 'former'
												| 'coach'
												| 'manager'
												| 'owner'
										);
										return eventRole && !existingETPSet.has(player.playerId)
											? [
													{
														eventId,
														teamId: teamIdToUse,
														playerId: player.playerId,
														role: eventRole
													}
												]
											: [];
									});

									if (eventTeamPlayers.length > 0) {
										await tx.insert(table.eventTeamPlayer).values(eventTeamPlayers);
									}
								}
							}

							mergedCount++;
						} else {
							// CREATE: No merge target, create a new team
							const newTeamId = await createTeam(
								{
									name: teamData.name,
									logo: teamData.logo || undefined,
									region: teamData.region as Region | undefined,
									slug: teamData.slug || undefined,
									abbr: teamData.abbr || undefined,
									aliases: teamData.aliases || [],
									players: convertedPlayers
								},
								result.userId,
								tx
							);
							createdCount++;

							// If an event is selected, always create eventTeam;
							// add eventTeamPlayer entries only when there are players
							if (eventId) {
								// Add the team to the event with default entry/status
								await tx.insert(table.eventTeam).values({
									eventId,
									teamId: newTeamId,
									entry: 'open',
									status: 'active'
								});

								if (convertedPlayers.length > 0) {
									// Map team roles to event team player roles
									const toEventRole = (
										role: 'active' | 'substitute' | 'former' | 'coach' | 'manager' | 'owner'
									): 'main' | 'sub' | 'coach' | null => {
										switch (role) {
											case 'active':
												return 'main';
											case 'substitute':
												return 'sub';
											case 'coach':
												return 'coach';
											default:
												return null; // skip non-participating roles
										}
									};

									const eventTeamPlayers = convertedPlayers.flatMap((player) => {
										const eventRole = toEventRole(
											player.role as
												| 'active'
												| 'substitute'
												| 'former'
												| 'coach'
												| 'manager'
												| 'owner'
										);
										return eventRole
											? [
													{
														eventId,
														teamId: newTeamId,
														playerId: player.playerId,
														role: eventRole
													}
												]
											: [];
									});

									if (eventTeamPlayers.length > 0) {
										await tx.insert(table.eventTeamPlayer).values(eventTeamPlayers);
									}
								}
							}
						}
					} catch (error) {
						console.error(`Error creating team ${teamData.name}:`, error);
						return fail(500, {
							error: `Failed to create team ${teamData.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
						});
					}
				}
			});

			return {
				success: true,
				createdCount,
				playersCreated,
				mergedCount
			};
		} catch (e) {
			console.error('Error in batch team creation:', e);
			return fail(500, {
				error: 'Failed to create teams'
			});
		}
	}
};
