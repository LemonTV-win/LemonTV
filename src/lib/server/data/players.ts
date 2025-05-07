import { db } from '../db';
import { player, playerAlias, gameAccount } from '../db/schema';
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

export async function createPlayer(
	data: Omit<Player, 'gameAccounts' | 'id'> & { gameAccounts: Player['gameAccounts'] }
) {
	console.info('[Players] ====== Attempting to create player ======');
	const { name, nationality, aliases, gameAccounts, slug } = data;
	const id = randomUUID();

	try {
		await db.insert(player).values({
			id,
			name,
			nationality: nationality || null,
			slug: slug || id
		});

		if (aliases && aliases.length > 0) {
			await db.insert(playerAlias).values(
				aliases.map((alias) => ({
					playerId: id,
					alias
				}))
			);
		}

		if (gameAccounts && gameAccounts.length > 0) {
			await db.insert(gameAccount).values(
				gameAccounts.map((account) => ({
					server: 'Strinova',
					accountId: account.accountId,
					playerId: id,
					currentName: account.currentName,
					region: account.region || null
				}))
			);
		}

		console.info('[Players] Successfully created player:', name);
		return id;
	} catch (e) {
		console.error('[Players] Error creating player:', e);
		throw e;
	} finally {
		console.info('[Players] ====== Player creation complete ======');
	}
}

export async function updatePlayer(
	data: { id: string } & Partial<
		Omit<Player, 'gameAccounts'> & { gameAccounts: Player['gameAccounts'] }
	>
) {
	console.info('[Players] ====== Attempting to update player ======');
	const { id, name, nationality, aliases, gameAccounts, slug } = data;

	try {
		// Only update fields that are provided
		const updateData: Record<string, any> = {};
		if (name !== undefined) updateData.name = name;
		if (nationality !== undefined) updateData.nationality = nationality || null;
		if (slug !== undefined) updateData.slug = slug || id;

		if (Object.keys(updateData).length > 0) {
			await db.update(player).set(updateData).where(eq(player.id, id));
		}

		// Only update aliases if provided
		if (aliases !== undefined) {
			await db.delete(playerAlias).where(eq(playerAlias.playerId, id));
			if (aliases.length > 0) {
				await db
					.insert(playerAlias)
					.values(
						aliases.map((alias) => ({
							playerId: id,
							alias
						}))
					)
					.onConflictDoNothing();
			}
		}

		// Only update game accounts if provided
		if (gameAccounts !== undefined) {
			await db.delete(gameAccount).where(eq(gameAccount.playerId, id));
			if (gameAccounts.length > 0) {
				await db
					.insert(gameAccount)
					.values(
						gameAccounts.map((account) => ({
							server: 'Strinova',
							accountId: account.accountId,
							playerId: id,
							currentName: account.currentName,
							region: account.region || null
						}))
					)
					.onConflictDoNothing();
			}
		}

		console.info('[Players] Successfully updated player:', id);
	} catch (e) {
		console.error('[Players] Error updating player:', e);
		throw e;
	} finally {
		console.info('[Players] ====== Player update complete ======');
	}
}

export async function deletePlayer(id: string) {
	console.info('[Players] ====== Attempting to delete player ======');
	try {
		await db.delete(playerAlias).where(eq(playerAlias.playerId, id));
		await db.delete(gameAccount).where(eq(gameAccount.playerId, id));
		await db.delete(player).where(eq(player.id, id));
		console.info('[Players] Successfully deleted player:', id);
	} catch (e) {
		console.error('[Players] Error deleting player:', e);
		throw e;
	} finally {
		console.info('[Players] ====== Player deletion complete ======');
	}
}
