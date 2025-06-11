import type { Character, Region } from '$lib/data/game';
import { calculateWinnerIndex, getMatches } from '$lib/data';
import { calculatePlayerKD, calculatePlayerRating, getPlayerAgents, getPlayers } from './players';

import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, or } from 'drizzle-orm';

import type { Team } from '$lib/data/teams';
import type { Player } from '$lib/data/players';
import type { User, UserRole } from '$lib/data/user';
import type { TCountryCode } from 'countries-list';
import type { Match } from '$lib/data/matches';
import type { Event } from '$lib/data/events';

import { randomUUID } from 'crypto';
import { editHistory } from '$lib/server/db/schemas/edit-history';
import { processImageURL } from '../storage';

export function getTeamMemberStatistics(team: Team): Record<
	string,
	{
		kd: number;
		rating: number;
		characters: [Character, number][];
	}
> | null {
	return Object.fromEntries(
		team.players?.filter(Boolean).map((player) => [
			player.id ?? '',
			{
				kd: calculatePlayerKD(player),
				rating: calculatePlayerRating(player),
				characters: getPlayerAgents(player)
			}
		]) ?? []
	);
}

export async function getTeam(slug: string): Promise<Team | null> {
	const rows = await db
		.select()
		.from(table.team)
		.where(or(eq(table.team.slug, slug), eq(table.team.id, slug)))
		.leftJoin(table.teamPlayer, eq(table.teamPlayer.teamId, table.team.id))
		.leftJoin(table.player, eq(table.player.id, table.teamPlayer.playerId))
		.leftJoin(table.playerAlias, eq(table.playerAlias.playerId, table.player.id))
		.leftJoin(table.gameAccount, eq(table.gameAccount.playerId, table.player.id))
		.leftJoin(
			table.player_social_account,
			eq(table.player_social_account.playerId, table.player.id)
		)
		.leftJoin(table.user, eq(table.user.id, table.player.userId))
		.leftJoin(table.userRole, eq(table.userRole.userId, table.user.id));

	if (rows.length === 0) return null;

	const teamRow = rows[0].teams;
	const playerMap = new Map<string, Player>();

	for (const row of rows) {
		const p = row.player;
		if (!p?.id) continue;

		if (!playerMap.has(p.id)) {
			playerMap.set(p.id, {
				id: p.id,
				name: p.name,
				slug: p.slug ?? undefined,
				nationality: (p.nationality as TCountryCode) ?? undefined,
				aliases: [],
				gameAccounts: [],
				socialAccounts: [],
				user: row.user
					? ({
							id: row.user.id,
							email: row.user.email,
							username: row.user.username,
							roles: []
						} as User)
					: undefined
			});
		}

		const player = playerMap.get(p.id)!;

		// Add alias
		const alias = row.player_alias?.alias;
		if (alias && !player.aliases!.includes(alias)) {
			player.aliases!.push(alias);
		}

		// Add game account
		const ga = row.game_account;
		if (
			ga?.accountId &&
			!player.gameAccounts.some((a) => a.accountId === ga.accountId && a.server === ga.server)
		) {
			player.gameAccounts.push({
				server: ga.server as 'Strinova' | 'CalabiYau',
				accountId: ga.accountId,
				currentName: ga.currentName,
				region: (ga.region as Region) ?? undefined
			});
		}

		// Add social account
		const sa = row.social_account;
		if (
			sa?.platformId &&
			!player.socialAccounts!.some(
				(a) => a.platformId === sa.platformId && a.accountId === sa.accountId
			)
		) {
			player.socialAccounts!.push({
				platformId: sa.platformId,
				accountId: sa.accountId,
				overridingUrl: sa.overriding_url ?? undefined
			});
		}

		// Add user role
		const role = row.user_role?.roleId as UserRole | undefined;
		if (player.user && role && !player.user.roles.includes(role)) {
			player.user.roles.push(role);
		}
	}

	const fullTeam: Team & { logoURL: string | null } = {
		id: teamRow.id,
		name: teamRow.name,
		slug: teamRow.slug,
		abbr: teamRow.abbr,
		logo: teamRow.logo,
		logoURL: teamRow.logo ? await processImageURL(teamRow.logo) : null,
		region: (teamRow.region as Region) ?? undefined,
		players: Array.from(playerMap.values()),
		wins: getTeamWins({
			id: teamRow.id,
			name: teamRow.name,
			slug: teamRow.slug,
			abbr: teamRow.abbr
		}),
		createdAt: teamRow.createdAt,
		updatedAt: teamRow.updatedAt
	};

	return fullTeam;
}

export async function getTeams(): Promise<(Team & { logoURL: string | null })[]> {
	const rows = await db
		.select()
		.from(table.team)
		.leftJoin(table.teamPlayer, eq(table.teamPlayer.teamId, table.team.id))
		.leftJoin(table.player, eq(table.player.id, table.teamPlayer.playerId))
		.leftJoin(table.playerAlias, eq(table.playerAlias.playerId, table.player.id))
		.leftJoin(table.gameAccount, eq(table.gameAccount.playerId, table.player.id))
		.leftJoin(
			table.player_social_account,
			eq(table.player_social_account.playerId, table.player.id)
		)
		.leftJoin(table.user, eq(table.user.id, table.player.userId))
		.leftJoin(table.userRole, eq(table.userRole.userId, table.user.id))
		.leftJoin(table.teamAlias, eq(table.teamAlias.teamId, table.team.id));

	const teamMap = new Map<
		string,
		Omit<Team, 'players' | 'aliases'> & { players: Map<string, Player>; aliases: Set<string> }
	>();

	for (const row of rows) {
		const t = row.teams;
		if (!teamMap.has(t.id)) {
			teamMap.set(t.id, {
				id: t.id,
				name: t.name,
				slug: t.slug,
				abbr: t.abbr,
				logo: t.logo,
				region: (t.region as Region) ?? undefined,
				players: new Map<string, Player>(),
				aliases: new Set<string>(),
				wins: getTeamWins({
					id: t.id,
					name: t.name,
					slug: t.slug,
					abbr: t.abbr
				}),
				createdAt: t.createdAt,
				updatedAt: t.updatedAt
			});
		}

		const team = teamMap.get(t.id)!;

		// Add team alias
		const teamAlias = row.team_alias?.alias;
		if (teamAlias) {
			team.aliases.add(teamAlias);
		}

		const p = row.player;
		if (!p?.id) continue;

		if (!team.players.has(p.id)) {
			team.players.set(p.id, {
				id: p.id,
				name: p.name,
				slug: p.slug ?? undefined,
				nationality: (p.nationality as TCountryCode) ?? undefined,
				aliases: [],
				gameAccounts: [],
				socialAccounts: [],
				user: row.user
					? ({
							id: row.user.id,
							email: row.user.email,
							username: row.user.username,
							roles: []
						} as User)
					: undefined
			});
		}

		const player = team.players.get(p.id)!;

		const alias = row.player_alias?.alias;
		if (alias && !player.aliases!.includes(alias)) {
			player.aliases!.push(alias);
		}

		const ga = row.game_account;
		if (
			ga?.accountId &&
			!player.gameAccounts.some((a) => a.accountId === ga.accountId && a.server === ga.server)
		) {
			player.gameAccounts.push({
				server: ga.server as 'Strinova' | 'CalabiYau',
				accountId: ga.accountId,
				currentName: ga.currentName,
				region: (ga.region as Region) ?? undefined
			});
		}

		const sa = row.social_account;
		if (
			sa?.platformId &&
			!player.socialAccounts!.some(
				(a) => a.platformId === sa.platformId && a.accountId === sa.accountId
			)
		) {
			player.socialAccounts!.push({
				platformId: sa.platformId,
				accountId: sa.accountId,
				overridingUrl: sa.overriding_url ?? undefined
			});
		}

		const role = row.user_role?.roleId as UserRole | undefined;
		if (player.user && role && !player.user.roles.includes(role)) {
			player.user.roles.push(role);
		}
	}

	return await Promise.all(
		Array.from(teamMap.values()).map(async (t) => ({
			...t,
			players: Array.from(t.players.values()),
			aliases: Array.from(t.aliases),
			logoURL: t.logo ? await processImageURL(t.logo) : null
		}))
	);
}

export function getTeamMatches(
	team: Pick<Team, 'id' | 'name' | 'slug' | 'abbr'>
): (Match & { event: Event; teamIndex: number })[] {
	return getMatches()
		.filter((match) =>
			match.teams.some(
				(p) =>
					p.team === team.id || p.team === team.slug || p.team === team.abbr || p.team === team.name
			)
		)
		.map((match) => ({
			...match,
			teamIndex: match.teams.findIndex(
				(p) =>
					p.team === team.id || p.team === team.slug || p.team === team.abbr || p.team === team.name
			)
		}));
}

export function getTeamWins(team: Pick<Team, 'id' | 'name' | 'slug' | 'abbr'>): number {
	const matches = getTeamMatches(team);
	return matches.filter(
		(match) =>
			calculateWinnerIndex(match) ===
			match.teams.findIndex(
				(t) =>
					t.team === team.id || t.team === team.slug || t.team === team.abbr || t.team === team.name
			) +
				1
	).length;
}

export async function getTeamStatistics(team: Team): Promise<{
	ranking: number;
	wins: number;
}> {
	// TODO: More efficent algorithm
	const teams = (await getTeams()).map((t) => ({
		...t,
		wins: getTeamWins(t)
	}));

	const sortedByWins = teams.sort((a, b) => b.wins - a.wins);

	const currentTeamIndex = sortedByWins.findIndex((t) => t.id === team.id);

	return {
		ranking: currentTeamIndex + 1,
		wins: sortedByWins[currentTeamIndex]?.wins ?? 0
	};
}

export async function createTeam(
	data: {
		name: string;
		slug?: string;
		abbr?: string;
		logo?: string;
		region?: Region;
		aliases?: string[];
		players?: {
			playerId: string;
			role: string;
			startedOn?: string;
			endedOn?: string;
			note?: string;
		}[];
	},
	editedBy: string
) {
	const id = randomUUID();
	const slug = data.slug ?? data.name.toLowerCase().replace(/[^a-z0-9]/g, '-');

	await db.transaction(async (tx) => {
		await tx.insert(table.team).values({
			id,
			name: data.name,
			slug,
			abbr: data.abbr,
			logo: data.logo,
			region: data.region
		});

		// Record initial creation in edit history
		await tx.insert(editHistory).values({
			id: randomUUID(),
			tableName: 'teams',
			recordId: id,
			fieldName: 'creation',
			oldValue: null,
			newValue: 'created',
			editedBy
		});

		// Record initial values
		if (data.name) {
			await tx.insert(editHistory).values({
				id: randomUUID(),
				tableName: 'teams',
				recordId: id,
				fieldName: 'name',
				oldValue: null,
				newValue: data.name.toString(),
				editedBy
			});
		}

		if (data.region) {
			await tx.insert(editHistory).values({
				id: randomUUID(),
				tableName: 'teams',
				recordId: id,
				fieldName: 'region',
				oldValue: null,
				newValue: data.region.toString(),
				editedBy
			});
		}

		if (data.abbr) {
			await tx.insert(editHistory).values({
				id: randomUUID(),
				tableName: 'teams',
				recordId: id,
				fieldName: 'abbr',
				oldValue: null,
				newValue: data.abbr.toString(),
				editedBy
			});
		}

		if (data.logo) {
			await tx.insert(editHistory).values({
				id: randomUUID(),
				tableName: 'teams',
				recordId: id,
				fieldName: 'logo',
				oldValue: null,
				newValue: data.logo.toString(),
				editedBy
			});
		}

		if (data.aliases?.length) {
			await tx.insert(table.teamAlias).values(
				data.aliases.map((alias) => ({
					teamId: id,
					alias
				}))
			);

			// Record initial aliases
			for (const alias of data.aliases) {
				await tx.insert(editHistory).values({
					id: randomUUID(),
					tableName: 'team_alias',
					recordId: id,
					fieldName: 'alias',
					oldValue: null,
					newValue: alias.toString(),
					editedBy
				});
			}
		}

		if (data.players?.length) {
			await tx.insert(table.teamPlayer).values(
				data.players.map((player) => ({
					teamId: id,
					playerId: player.playerId,
					role: player.role,
					startedOn: player.startedOn,
					endedOn: player.endedOn,
					note: player.note
				}))
			);

			// Record initial players
			for (const player of data.players) {
				await tx.insert(editHistory).values({
					id: randomUUID(),
					tableName: 'team_player',
					recordId: id,
					fieldName: 'player',
					oldValue: null,
					newValue: player.playerId.toString(),
					editedBy
				});
			}
		}
	});

	return id;
}

export async function updateTeam(
	data: {
		id: string;
		name: string;
		slug?: string;
		abbr?: string;
		logo?: string;
		region?: Region;
		aliases?: string[];
		players?: {
			playerId: string;
			role: string;
			startedOn?: string;
			endedOn?: string;
			note?: string;
		}[];
	},
	editedBy: string
) {
	await db.transaction(async (tx) => {
		// Get the current team data before update
		const [currentTeam] = await tx.select().from(table.team).where(eq(table.team.id, data.id));

		// Update team
		await tx
			.update(table.team)
			.set({
				name: data.name,
				slug: data.slug ?? data.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
				abbr: data.abbr,
				logo: data.logo,
				region: data.region,
				updatedAt: new Date().toISOString()
			})
			.where(eq(table.team.id, data.id));

		// Track changes in edit_history
		if (data.name !== currentTeam.name) {
			await tx.insert(editHistory).values({
				id: randomUUID(),
				tableName: 'teams',
				recordId: data.id,
				fieldName: 'name',
				oldValue: currentTeam.name?.toString() || null,
				newValue: data.name?.toString() || null,
				editedBy
			});
		}

		if (data.region !== currentTeam.region) {
			await tx.insert(editHistory).values({
				id: randomUUID(),
				tableName: 'teams',
				recordId: data.id,
				fieldName: 'region',
				oldValue: currentTeam.region?.toString() || null,
				newValue: data.region?.toString() || null,
				editedBy
			});
		}

		if (data.abbr !== currentTeam.abbr) {
			await tx.insert(editHistory).values({
				id: randomUUID(),
				tableName: 'teams',
				recordId: data.id,
				fieldName: 'abbr',
				oldValue: currentTeam.abbr?.toString() || null,
				newValue: data.abbr?.toString() || null,
				editedBy
			});
		}

		if (data.logo !== currentTeam.logo) {
			await tx.insert(editHistory).values({
				id: randomUUID(),
				tableName: 'teams',
				recordId: data.id,
				fieldName: 'logo',
				oldValue: currentTeam.logo?.toString() || null,
				newValue: data.logo?.toString() || null,
				editedBy
			});
		}

		// Get current aliases
		const currentAliases = await tx
			.select()
			.from(table.teamAlias)
			.where(eq(table.teamAlias.teamId, data.id));

		// Update aliases
		await tx.delete(table.teamAlias).where(eq(table.teamAlias.teamId, data.id));
		if (data.aliases?.length) {
			await tx.insert(table.teamAlias).values(
				data.aliases.map((alias) => ({
					teamId: data.id,
					alias
				}))
			);

			// Track alias changes
			const oldAliases = currentAliases.map((a) => a.alias);
			const newAliases = data.aliases;

			// Track removed aliases
			for (const oldAlias of oldAliases) {
				if (!newAliases.includes(oldAlias)) {
					await tx.insert(editHistory).values({
						id: randomUUID(),
						tableName: 'team_alias',
						recordId: data.id,
						fieldName: 'alias',
						oldValue: oldAlias.toString(),
						newValue: null,
						editedBy
					});
				}
			}

			// Track added aliases
			for (const newAlias of newAliases) {
				if (!oldAliases.includes(newAlias)) {
					await tx.insert(editHistory).values({
						id: randomUUID(),
						tableName: 'team_alias',
						recordId: data.id,
						fieldName: 'alias',
						oldValue: null,
						newValue: newAlias.toString(),
						editedBy
					});
				}
			}
		}

		// Get current players
		const currentPlayers = await tx
			.select()
			.from(table.teamPlayer)
			.where(eq(table.teamPlayer.teamId, data.id));

		// Update players
		await tx.delete(table.teamPlayer).where(eq(table.teamPlayer.teamId, data.id));
		if (data.players?.length) {
			await tx.insert(table.teamPlayer).values(
				data.players.map((player) => ({
					teamId: data.id,
					playerId: player.playerId,
					role: player.role,
					startedOn: player.startedOn,
					endedOn: player.endedOn,
					note: player.note
				}))
			);

			// Track player changes
			const oldPlayers = currentPlayers.map((p) => p.playerId);
			const newPlayers = data.players.map((p) => p.playerId);

			// Track removed players
			for (const oldPlayer of oldPlayers) {
				if (!newPlayers.includes(oldPlayer)) {
					await tx.insert(editHistory).values({
						id: randomUUID(),
						tableName: 'team_player',
						recordId: data.id,
						fieldName: 'player',
						oldValue: oldPlayer.toString(),
						newValue: null,
						editedBy
					});
				}
			}

			// Track added players
			for (const newPlayer of newPlayers) {
				if (!oldPlayers.includes(newPlayer)) {
					await tx.insert(editHistory).values({
						id: randomUUID(),
						tableName: 'team_player',
						recordId: data.id,
						fieldName: 'player',
						oldValue: null,
						newValue: newPlayer.toString(),
						editedBy
					});
				}
			}
		}
	});
}

export async function deleteTeam(id: string, deletedBy: string) {
	console.info('[Teams] Attempting to delete team:', id);

	// Get the team data before deletion
	const [teamData] = await db.select().from(table.team).where(eq(table.team.id, id));

	if (!teamData) {
		console.warn('[Teams] Team not found:', id);
		return;
	}

	await db.transaction(async (tx) => {
		// Record deletion in edit history
		await tx.insert(editHistory).values({
			id: randomUUID(),
			tableName: 'teams',
			recordId: id,
			fieldName: 'deletion',
			oldValue: 'active',
			newValue: 'deleted',
			editedBy: deletedBy
		});

		// Record the final state of the team
		await tx.insert(editHistory).values({
			id: randomUUID(),
			tableName: 'teams',
			recordId: id,
			fieldName: 'name',
			oldValue: teamData.name,
			newValue: null,
			editedBy: deletedBy
		});

		if (teamData.region) {
			await tx.insert(editHistory).values({
				id: randomUUID(),
				tableName: 'teams',
				recordId: id,
				fieldName: 'region',
				oldValue: teamData.region,
				newValue: null,
				editedBy: deletedBy
			});
		}

		if (teamData.abbr) {
			await tx.insert(editHistory).values({
				id: randomUUID(),
				tableName: 'teams',
				recordId: id,
				fieldName: 'abbr',
				oldValue: teamData.abbr,
				newValue: null,
				editedBy: deletedBy
			});
		}

		if (teamData.logo) {
			await tx.insert(editHistory).values({
				id: randomUUID(),
				tableName: 'teams',
				recordId: id,
				fieldName: 'logo',
				oldValue: teamData.logo,
				newValue: null,
				editedBy: deletedBy
			});
		}

		// Get and record aliases
		const aliases = await tx.select().from(table.teamAlias).where(eq(table.teamAlias.teamId, id));

		for (const alias of aliases) {
			await tx.insert(editHistory).values({
				id: randomUUID(),
				tableName: 'team_alias',
				recordId: id,
				fieldName: 'alias',
				oldValue: alias.alias,
				newValue: null,
				editedBy: deletedBy
			});
		}

		// Get and record players
		const players = await tx.select().from(table.teamPlayer).where(eq(table.teamPlayer.teamId, id));

		for (const player of players) {
			await tx.insert(editHistory).values({
				id: randomUUID(),
				tableName: 'team_player',
				recordId: id,
				fieldName: 'player',
				oldValue: player.playerId,
				newValue: null,
				editedBy: deletedBy
			});
		}

		// Delete the records
		await tx.delete(table.teamAlias).where(eq(table.teamAlias.teamId, id));
		await tx.delete(table.teamPlayer).where(eq(table.teamPlayer.teamId, id));
		await tx.delete(table.team).where(eq(table.team.id, id));
	});

	console.info('[Teams] Successfully deleted team:', id);
}

export async function getTeamEditHistory(teamId: string) {
	const history = await db
		.select()
		.from(editHistory)
		.where(eq(editHistory.recordId, teamId))
		.orderBy(editHistory.editedAt);

	return history;
}
