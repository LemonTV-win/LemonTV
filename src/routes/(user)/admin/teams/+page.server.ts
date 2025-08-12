import { fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { createTeam, updateTeam, deleteTeam } from '$lib/server/data/teams';
import { createPlayer } from '$lib/server/data/players';
import type { Region } from '$lib/data/game';
import { processImageURL } from '$lib/server/storage';
import { checkPermissions } from '$lib/server/security/permission';

export const load: PageServerLoad = async ({ url, locals }) => {
	const teamsList = await db.select().from(table.team);
	const teamPlayers = await db.select().from(table.teamPlayer);
	const teamAliases = await db.select().from(table.teamAlias);
	const players = await db.select().from(table.player);

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

	const action = url.searchParams.get('action');
	const id = url.searchParams.get('id');
	const searchQuery = url.searchParams.get('searchQuery');
	return {
		teams: teamsWithLogos,
		teamPlayers,
		teamAliases,
		players,
		user: locals.user,
		action,
		id,
		searchQuery
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
					players
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
					players
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
				players?: {
					player: {
						name: string;
						slug?: string;
						nationalities?: string[];
						aliases?: string[];
						gameAccounts?: {
							server: 'Strinova' | 'CalabiYau';
							accountId: number;
							currentName: string;
							region?: string;
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
			let playersCreated = 0;

			// Use a single transaction for all operations
			await db.transaction(async (tx) => {
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

				// Now create teams with the proper player relationships using the transaction
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
									startedOn: teamPlayer.startedOn,
									endedOn: teamPlayer.endedOn,
									note: teamPlayer.note
								};
							}) || [];

						await createTeam(
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
				playersCreated
			};
		} catch (e) {
			console.error('Error in batch team creation:', e);
			return fail(500, {
				error: 'Failed to create teams'
			});
		}
	}
};
