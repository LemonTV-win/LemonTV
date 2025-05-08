import { db } from '$lib/server/db';
import {
	player,
	playerAlias,
	gameAccount,
	player_social_account,
	social_platform
} from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { Player } from '$lib/data/players';
import { randomUUID } from 'crypto';
import { getPlayerMatches, getTeams, identifyPlayer, isPlayerInTeam } from '$lib/data';
import type { Team } from '$lib/data/teams';
import type { Character } from '$lib/data/game';
import { or } from 'drizzle-orm';
export async function getPlayer(keyword: string): Promise<Player | null> {
	console.info('[Players] Attempting to get player:', keyword);
	const [playerData] = await db
		.select()
		.from(player)
		.where(or(eq(player.id, keyword), eq(player.slug, keyword), eq(player.name, keyword)));

	if (!playerData) {
		console.warn('[Players] Player not found:', keyword);
		return null;
	}

	const aliases = await db.select().from(playerAlias).where(eq(playerAlias.playerId, keyword));
	const accounts = await db.select().from(gameAccount).where(eq(gameAccount.playerId, keyword));
	const socialAccounts = await db
		.select()
		.from(player_social_account)
		.where(eq(player_social_account.playerId, playerData.id));

	console.info('[Players] Successfully retrieved player:', keyword);
	return {
		id: playerData.id,
		name: playerData.name,
		nationality: playerData.nationality as Player['nationality'],
		aliases: aliases.map((a) => a.alias),
		gameAccounts: accounts.map((acc) => ({
			accountId: acc.accountId,
			currentName: acc.currentName,
			region: acc.region as Player['gameAccounts'][0]['region']
		})),
		socialAccounts: socialAccounts.map((acc) => ({
			platformId: acc.platformId,
			accountId: acc.accountId,
			overridingUrl: acc.overriding_url || undefined
		}))
	};
}

export async function getPlayers(): Promise<Player[]> {
	console.info('[Players] Fetching all players');
	const players = await db.select().from(player);

	const aliases = await db.select().from(playerAlias);
	const aliasesByPlayer = new Map<string, string[]>();
	for (const alias of aliases) {
		if (!aliasesByPlayer.has(alias.playerId)) {
			aliasesByPlayer.set(alias.playerId, []);
		}
		aliasesByPlayer.get(alias.playerId)!.push(alias.alias);
	}

	const accounts = await db.select().from(gameAccount);
	const accountsByPlayer = new Map<string, typeof accounts>();
	for (const acc of accounts) {
		if (!accountsByPlayer.has(acc.playerId)) {
			accountsByPlayer.set(acc.playerId, []);
		}
		accountsByPlayer.get(acc.playerId)!.push(acc);
	}

	const socialAccounts = await db.select().from(player_social_account);
	const socialAccountsByPlayer = new Map<string, typeof socialAccounts>();
	for (const acc of socialAccounts) {
		if (!socialAccountsByPlayer.has(acc.playerId)) {
			socialAccountsByPlayer.set(acc.playerId, []);
		}
		socialAccountsByPlayer.get(acc.playerId)!.push(acc);
	}

	const result: Player[] = players.map((p) => ({
		id: p.id,
		name: p.name,
		slug: p.slug,
		nationality: p.nationality as Player['nationality'],
		aliases: aliasesByPlayer.get(p.id) ?? [],
		gameAccounts: (accountsByPlayer.get(p.id) ?? []).map((acc) => ({
			accountId: acc.accountId,
			currentName: acc.currentName,
			region: acc.region as Player['gameAccounts'][0]['region']
		})),
		socialAccounts: (socialAccountsByPlayer.get(p.id) ?? []).map((acc) => ({
			platformId: acc.platformId,
			accountId: acc.accountId,
			overridingUrl: acc.overriding_url || undefined
		}))
	}));

	console.info('[Players] Successfully retrieved', result.length, 'players');
	return result;
}

export function getPlayerTeams(slug: string) {
	return [
		...new Set(
			getTeams()
				.filter((team) => isPlayerInTeam(slug, team))
				.map((team) => team.id)
		)
	].map((id) => getTeams().find((team) => team.id === id)!);
}

export function getPlayersTeams(players: Player[], limit: number = 3): Record<string, Team[]> {
	return Object.fromEntries(
		players.map((player) => [player.id, getPlayerTeams(player.slug ?? player.name).slice(0, limit)])
	);
}

export function getPlayerAgents(player: Player): [Character, number][] {
	const characters = getPlayerMatches(player.slug ?? player.name)
		.flatMap((match) =>
			(match.games ?? []).flatMap((game) => {
				for (const score of game.scores[match.playerTeamIndex]) {
					if (identifyPlayer(score.player, player)) {
						return score.characters;
					}
				}
			})
		)
		.filter(Boolean) as Character[];

	// Count occurrences of each character
	const characterCounts = new Map<Character, number>();
	for (const character of characters) {
		characterCounts.set(character, (characterCounts.get(character) ?? 0) + 1);
	}

	// Convert to array of tuples
	return Array.from(characterCounts.entries());
}

export function getPlayersAgents(
	players: Player[],
	limit: number = 3
): Record<string, [Character, number][]> {
	return Object.fromEntries(
		players.map((player) => [player.id, getPlayerAgents(player).slice(0, limit)])
	);
}

export function calculatePlayerRating(player: Player) {
	if (!player.slug && !player.name) {
		return 0;
	}

	const matches = getPlayerMatches(player.slug ?? player.name);
	if (!matches || matches.length === 0) {
		return 0;
	}

	const scores = matches
		.flatMap((match) => {
			const playerTeamIndex = match.playerTeamIndex;

			const playerScore = match.games?.flatMap((game) =>
				game.scores[playerTeamIndex]
					.filter((score) => identifyPlayer(score.player, player))
					.map((score) => score.score)
			);

			return playerScore;
		})
		.filter(Boolean) as number[];

	const averageScore = scores.reduce((acc, score) => acc + score, 0) / scores.length;

	return isNaN(averageScore) ? 0 : averageScore / 200;
}

export function calculatePlayerKD(player: Player): number {
	const matches = getPlayerMatches(player.id ?? '');
	return matches.reduce((acc, match) => {
		const playerTeamIndex = match.playerTeamIndex;
		const opponentTeamIndex = 1 - playerTeamIndex;

		if (!match.games) {
			return acc;
		}

		const kills = match.games
			?.flatMap((game) =>
				game.scores[playerTeamIndex]
					.filter((score) => identifyPlayer(score.player, player))
					.map((score) => score.kills)
					.reduce((acc, kill) => acc + kill, 0)
			)
			.reduce((acc, kill) => acc + kill, 0);

		const deaths = match.games
			?.flatMap((game) =>
				game.scores[playerTeamIndex]
					.filter((score) => identifyPlayer(score.player, player))
					.map((score) => score.deaths)
			)
			.reduce((acc, death) => acc + death, 0);

		console.log('KD', kills, deaths);

		return kills / deaths;
	}, 0);
}

export async function createPlayer(
	data: Omit<Player, 'id' | 'gameAccounts'> & { gameAccounts: Player['gameAccounts'] }
) {
	const id = randomUUID();
	const slug = data.slug ?? data.name.toLowerCase().replace(/[^a-z0-9]/g, '-');

	await db.transaction(async (tx) => {
		await tx.insert(player).values({
			id,
			name: data.name,
			slug,
			nationality: data.nationality
		});

		if (data.aliases?.length) {
			await tx.insert(playerAlias).values(
				data.aliases.map((alias) => ({
					playerId: id,
					alias
				}))
			);
		}

		if (data.gameAccounts?.length) {
			await tx.insert(gameAccount).values(
				data.gameAccounts.map((account) => ({
					playerId: id,
					server: 'Strinova',
					accountId: account.accountId,
					currentName: account.currentName,
					region: account.region
				}))
			);
		}

		if (data.socialAccounts?.length) {
			await tx.insert(player_social_account).values(
				data.socialAccounts.map((account) => ({
					id: randomUUID(),
					playerId: id,
					platformId: account.platformId,
					accountId: account.accountId,
					overriding_url: account.overridingUrl
				}))
			);
		}
	});

	return id;
}

export async function updatePlayer(
	data: { id: string } & Partial<Omit<Player, 'gameAccounts'>> & {
			gameAccounts: Player['gameAccounts'];
		}
) {
	await db.transaction(async (tx) => {
		await tx
			.update(player)
			.set({
				name: data.name,
				nationality: data.nationality
			})
			.where(eq(player.id, data.id));

		// Update aliases
		await tx.delete(playerAlias).where(eq(playerAlias.playerId, data.id));
		if (data.aliases?.length) {
			await tx.insert(playerAlias).values(
				data.aliases.map((alias) => ({
					playerId: data.id,
					alias
				}))
			);
		}

		// Update game accounts
		await tx.delete(gameAccount).where(eq(gameAccount.playerId, data.id));
		if (data.gameAccounts?.length) {
			await tx.insert(gameAccount).values(
				data.gameAccounts.map((account) => ({
					playerId: data.id,
					server: 'Strinova',
					accountId: account.accountId,
					currentName: account.currentName,
					region: account.region
				}))
			);
		}

		// Update social accounts
		await tx.delete(player_social_account).where(eq(player_social_account.playerId, data.id));
		if (data.socialAccounts?.length) {
			await tx.insert(player_social_account).values(
				data.socialAccounts.map((account) => ({
					id: randomUUID(),
					playerId: data.id,
					platformId: account.platformId,
					accountId: account.accountId,
					overriding_url: account.overridingUrl
				}))
			);
		}
	});
}

export async function deletePlayer(id: string) {
	console.info('[Players] Attempting to delete player:', id);
	await db.transaction(async (tx) => {
		await tx.delete(playerAlias).where(eq(playerAlias.playerId, id));
		await tx.delete(gameAccount).where(eq(gameAccount.playerId, id));
		await tx.delete(player_social_account).where(eq(player_social_account.playerId, id));
		await tx.delete(player).where(eq(player.id, id));
	});
	console.info('[Players] Successfully deleted player:', id);
}

export async function getSocialPlatforms() {
	const platforms = await db.select().from(social_platform);
	return platforms.map((platform) => ({
		id: platform.id,
		name: platform.name,
		url_template: platform.url_template
	}));
}
