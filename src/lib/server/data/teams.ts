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
		.from(table.teams)
		.where(or(eq(table.teams.slug, slug), eq(table.teams.id, slug)))
		.leftJoin(table.teamPlayer, eq(table.teamPlayer.teamId, table.teams.id))
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

	const fullTeam: Team = {
		id: teamRow.id,
		name: teamRow.name,
		slug: teamRow.slug,
		abbr: teamRow.abbr ?? undefined,
		logo: teamRow.logo ?? undefined,
		region: (teamRow.region as Region) ?? undefined,
		players: Array.from(playerMap.values()),
		wins: getTeamWins({
			id: teamRow.id,
			name: teamRow.name,
			slug: teamRow.slug,
			abbr: teamRow.abbr ?? undefined
		})
	};

	return fullTeam;
}

export async function getTeams(): Promise<Team[]> {
	const rows = await db
		.select()
		.from(table.teams)
		.leftJoin(table.teamPlayer, eq(table.teamPlayer.teamId, table.teams.id))
		.leftJoin(table.player, eq(table.player.id, table.teamPlayer.playerId))
		.leftJoin(table.playerAlias, eq(table.playerAlias.playerId, table.player.id))
		.leftJoin(table.gameAccount, eq(table.gameAccount.playerId, table.player.id))
		.leftJoin(
			table.player_social_account,
			eq(table.player_social_account.playerId, table.player.id)
		)
		.leftJoin(table.user, eq(table.user.id, table.player.userId))
		.leftJoin(table.userRole, eq(table.userRole.userId, table.user.id));

	const teamMap = new Map<string, Omit<Team, 'players'> & { players: Map<string, Player> }>();

	for (const row of rows) {
		const t = row.teams;
		if (!teamMap.has(t.id)) {
			teamMap.set(t.id, {
				id: t.id,
				name: t.name,
				slug: t.slug,
				abbr: t.abbr ?? undefined,
				logo: t.logo ?? undefined,
				region: (t.region as Region) ?? undefined,
				players: new Map<string, Player>(),
				wins: getTeamWins({
					id: t.id,
					name: t.name,
					slug: t.slug,
					abbr: t.abbr ?? undefined
				})
			});
		}

		const team = teamMap.get(t.id)!;

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

	return Array.from(teamMap.values()).map((t) => ({
		...t,
		players: Array.from(t.players.values())
	}));
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
