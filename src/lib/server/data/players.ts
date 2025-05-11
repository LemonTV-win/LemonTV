import { db } from '$lib/server/db';
import {
	player,
	playerAlias,
	gameAccount,
	player_social_account,
	social_platform,
	editHistory
} from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { Player } from '$lib/data/players';
import { randomUUID } from 'crypto';
import { calculateWinnerIndex, getEvents, getMatches, identifyPlayer } from '$lib/data';
import type { Team } from '$lib/data/teams';
import type { Character, Region } from '$lib/data/game';
import { or } from 'drizzle-orm';

import * as schema from '$lib/server/db/schema';
import type { Match, PlayerScore } from '$lib/data/matches';
import type { Event } from '$lib/data/events';

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
		slug: playerData.slug,
		name: playerData.name,
		nationality: playerData.nationality as Player['nationality'],
		aliases: aliases.map((a) => a.alias),
		gameAccounts: accounts.map((acc) => ({
			accountId: acc.accountId,
			currentName: acc.currentName,
			region: acc.region as Player['gameAccounts'][0]['region'],
			server: acc.server as 'Strinova' | 'CalabiYau' // TODO: Add validation
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
			region: acc.region as Player['gameAccounts'][0]['region'],
			server: acc.server as 'Strinova' | 'CalabiYau' // TODO: Add validation
		})),
		socialAccounts: (socialAccountsByPlayer.get(p.id) ?? []).map((acc) => ({
			platformId: acc.platformId,
			accountId: acc.accountId,
			overridingUrl: acc.overriding_url || undefined
		})),
		user: p.userId
			? {
					id: p.userId,
					username: '',
					email: '',
					roles: []
				}
			: undefined
	}));

	console.info('[Players] Successfully retrieved', result.length, 'players');
	return result;
}

export async function getPlayerTeams(slug: string) {
	const teams = await db
		.select()
		.from(schema.player)
		.where(eq(schema.player.slug, slug))
		.innerJoin(schema.teamPlayer, eq(schema.teamPlayer.playerId, schema.player.id))
		.innerJoin(schema.teams, eq(schema.teamPlayer.teamId, schema.teams.id));

	return teams;
}

export async function getPlayersTeams(): Promise<Record<string, Team[]>> {
	const rows = await db
		.select()
		.from(schema.player)
		.innerJoin(schema.teamPlayer, eq(schema.teamPlayer.playerId, schema.player.id))
		.innerJoin(schema.teams, eq(schema.teamPlayer.teamId, schema.teams.id));

	const result: Record<string, Team[]> = {};
	for (const row of rows) {
		if (!result[row.player.id]) {
			result[row.player.id] = [];
		}
		result[row.player.id].push({
			id: row.teams.id,
			name: row.teams.name,
			slug: row.teams.slug,
			abbr: row.teams.abbr ?? undefined,
			logo: row.teams.logo ?? undefined,
			region: row.teams.region as Region | undefined
		});
	}
	return result;
}

export function getPlayerMatches(
	slug: string
): (Match & { playerTeamIndex: number; event: Event })[] {
	return (
		getMatches()
			// .filter((match) => match.teams.some((team) => isPlayerInTeam(id, team.team)))
			.filter((match) =>
				match.teams.some((participant) =>
					[...(participant.roaster ?? []), ...(participant.substitutes ?? [])].includes(slug)
				)
			)
			.map((match) => ({
				...match,
				playerTeamIndex: match.teams.findIndex((team) =>
					[...(team.roaster ?? []), ...(team.substitutes ?? [])].includes(slug)
				)
			}))
	);
}

export function getPlayerAgents(player: Player): [Character, number][] {
	const characters = getPlayerMatches(player.slug ?? player.name)
		.flatMap((match) =>
			(match.games ?? []).flatMap((game) => {
				for (const score of game.scores[match.playerTeamIndex]) {
					if (identifyPlayerFromScore(score, player)) {
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

export function getPlayerWins(id: string): number {
	return getPlayerMatches(id).filter((match) => {
		return calculateWinnerIndex(match) === match.playerTeamIndex + 1;
	}).length;
}

export function getPlayerEvents(id: string) {
	return getEvents().filter((event) =>
		event.participants.some(({ main, reserve, coach }) =>
			[...main, ...reserve, ...coach].some((player) => identifyPlayer(id, player))
		)
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
					.filter((score) => identifyPlayerFromScore(score, player))
					.map((score) => score.score)
			);

			return playerScore;
		})
		.filter(Boolean) as number[];

	const averageScore = scores.reduce((acc, score) => acc + score, 0) / scores.length;

	return isNaN(averageScore) ? 0 : averageScore / 200;
}

function identifyPlayerFromScore(score: PlayerScore, player: Player): boolean {
	return (
		(player.gameAccounts.some((acc) => acc.accountId === score.accountId) ||
			player.aliases?.some((alias) => alias === score.player)) ??
		false
	);
}

export function calculatePlayerKD(player: Player): number {
	const matches = getPlayerMatches(player.slug ?? player.name);

	return matches.reduce((acc, match) => {
		const playerTeamIndex = match.playerTeamIndex;
		const opponentTeamIndex = 1 - playerTeamIndex;

		if (!match.games) {
			return acc;
		}

		const kills = match.games
			?.flatMap((game) =>
				game.scores[playerTeamIndex]
					.filter((score) => identifyPlayerFromScore(score, player))
					.map((score) => score.kills)
					.reduce((acc, kill) => acc + kill, 0)
			)
			.reduce((acc, kill) => acc + kill, 0);

		const deaths = match.games
			?.flatMap((game) =>
				game.scores[playerTeamIndex]
					.filter((score) => identifyPlayerFromScore(score, player))
					.map((score) => score.deaths)
			)
			.reduce((acc, death) => acc + death, 0);

		return kills / deaths;
	}, 0);
}

export async function createPlayer(
	data: Omit<Player, 'id' | 'gameAccounts'> & { gameAccounts: Player['gameAccounts'] },
	editedBy: string
) {
	const id = randomUUID();
	const slug = data.slug ?? data.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
	const userId = data.user?.id;

	await db.transaction(async (tx) => {
		await tx.insert(player).values({
			id,
			name: data.name,
			slug,
			nationality: data.nationality,
			userId
		});

		// Record initial creation in edit history
		await tx.insert(editHistory).values({
			id: randomUUID(),
			tableName: 'player',
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
				tableName: 'player',
				recordId: id,
				fieldName: 'name',
				oldValue: null,
				newValue: data.name.toString(),
				editedBy
			});
		}

		if (data.nationality) {
			await tx.insert(editHistory).values({
				id: randomUUID(),
				tableName: 'player',
				recordId: id,
				fieldName: 'nationality',
				oldValue: null,
				newValue: data.nationality.toString(),
				editedBy
			});
		}

		if (userId) {
			await tx.insert(editHistory).values({
				id: randomUUID(),
				tableName: 'player',
				recordId: id,
				fieldName: 'user',
				oldValue: null,
				newValue: userId,
				editedBy
			});
		}

		if (data.aliases?.length) {
			await tx.insert(playerAlias).values(
				data.aliases.map((alias) => ({
					playerId: id,
					alias
				}))
			);

			// Record initial aliases
			for (const alias of data.aliases) {
				await tx.insert(editHistory).values({
					id: randomUUID(),
					tableName: 'player_alias',
					recordId: id,
					fieldName: 'alias',
					oldValue: null,
					newValue: alias.toString(),
					editedBy
				});
			}
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

			// Record initial game accounts
			for (const account of data.gameAccounts) {
				await tx.insert(editHistory).values({
					id: randomUUID(),
					tableName: 'game_account',
					recordId: id,
					fieldName: 'account',
					oldValue: null,
					newValue: account.accountId.toString(),
					editedBy
				});
			}
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

			// Record initial social accounts
			for (const account of data.socialAccounts) {
				await tx.insert(editHistory).values({
					id: randomUUID(),
					tableName: 'player_social_account',
					recordId: id,
					fieldName: 'account',
					oldValue: null,
					newValue: account.accountId.toString(),
					editedBy
				});
			}
		}
	});

	return id;
}

export async function updatePlayer(
	data: { id: string } & Partial<Omit<Player, 'gameAccounts'>> & {
			gameAccounts: Player['gameAccounts'];
		},
	editedBy: string
) {
	await db.transaction(async (tx) => {
		// Get the current player data before update
		const [currentPlayer] = await tx.select().from(player).where(eq(player.id, data.id));

		console.log('currentPlayer', currentPlayer);
		console.log('data', data);

		// Update player
		await tx
			.update(player)
			.set({
				name: data.name,
				nationality: data.nationality,
				userId: data.user?.id
			})
			.where(eq(player.id, data.id));

		// Track changes in edit_history
		if (data.name !== currentPlayer.name) {
			await tx.insert(editHistory).values({
				id: randomUUID(),
				tableName: 'player',
				recordId: data.id,
				fieldName: 'name',
				oldValue: currentPlayer.name?.toString() || null,
				newValue: data.name?.toString() || null,
				editedBy
			});
		}

		if (data.nationality !== currentPlayer.nationality) {
			await tx.insert(editHistory).values({
				id: randomUUID(),
				tableName: 'player',
				recordId: data.id,
				fieldName: 'nationality',
				oldValue: currentPlayer.nationality?.toString() || null,
				newValue: data.nationality?.toString() || null,
				editedBy
			});
		}

		if (data.user?.id !== currentPlayer.userId) {
			await tx.insert(editHistory).values({
				id: randomUUID(),
				tableName: 'player',
				recordId: data.id,
				fieldName: 'user',
				oldValue: currentPlayer.userId?.toString() || null,
				newValue: data.user?.id?.toString() || null,
				editedBy
			});
		}

		// Get current aliases
		const currentAliases = await tx
			.select()
			.from(playerAlias)
			.where(eq(playerAlias.playerId, data.id));

		// Update aliases
		await tx.delete(playerAlias).where(eq(playerAlias.playerId, data.id));
		if (data.aliases?.length) {
			await tx.insert(playerAlias).values(
				data.aliases.map((alias) => ({
					playerId: data.id,
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
						tableName: 'player_alias',
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
						tableName: 'player_alias',
						recordId: data.id,
						fieldName: 'alias',
						oldValue: null,
						newValue: newAlias.toString(),
						editedBy
					});
				}
			}
		}

		// Get current game accounts
		const currentGameAccounts = await tx
			.select()
			.from(gameAccount)
			.where(eq(gameAccount.playerId, data.id));

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

			// Track game account changes
			const oldAccounts = currentGameAccounts.map((acc) => acc.accountId);
			const newAccounts = data.gameAccounts.map((acc) => acc.accountId);

			// Track removed accounts
			for (const oldAcc of oldAccounts) {
				if (!newAccounts.includes(oldAcc)) {
					await tx.insert(editHistory).values({
						id: randomUUID(),
						tableName: 'game_account',
						recordId: data.id,
						fieldName: 'account',
						oldValue: oldAcc.toString(),
						newValue: null,
						editedBy
					});
				}
			}

			// Track added accounts
			for (const newAcc of newAccounts) {
				if (!oldAccounts.includes(newAcc)) {
					await tx.insert(editHistory).values({
						id: randomUUID(),
						tableName: 'game_account',
						recordId: data.id,
						fieldName: 'account',
						oldValue: null,
						newValue: newAcc.toString(),
						editedBy
					});
				}
			}
		}

		// Get current social accounts
		const currentSocialAccounts = await tx
			.select()
			.from(player_social_account)
			.where(eq(player_social_account.playerId, data.id));

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

			// Track social account changes
			const oldAccounts = currentSocialAccounts.map((acc) => acc.accountId);
			const newAccounts = data.socialAccounts.map((acc) => acc.accountId);

			// Track removed accounts
			for (const oldAcc of oldAccounts) {
				if (!newAccounts.includes(oldAcc)) {
					await tx.insert(editHistory).values({
						id: randomUUID(),
						tableName: 'player_social_account',
						recordId: data.id,
						fieldName: 'account',
						oldValue: oldAcc.toString(),
						newValue: null,
						editedBy
					});
				}
			}

			// Track added accounts
			for (const newAcc of newAccounts) {
				if (!oldAccounts.includes(newAcc)) {
					await tx.insert(editHistory).values({
						id: randomUUID(),
						tableName: 'player_social_account',
						recordId: data.id,
						fieldName: 'account',
						oldValue: null,
						newValue: newAcc.toString(),
						editedBy
					});
				}
			}
		}
	});
}

export async function deletePlayer(id: string, deletedBy: string) {
	console.info('[Players] Attempting to delete player:', id);

	// Get the player data before deletion
	const [playerData] = await db.select().from(player).where(eq(player.id, id));

	if (!playerData) {
		console.warn('[Players] Player not found:', id);
		return;
	}

	await db.transaction(async (tx) => {
		// Record deletion in edit history
		await tx.insert(editHistory).values({
			id: randomUUID(),
			tableName: 'player',
			recordId: id,
			fieldName: 'deletion',
			oldValue: 'active',
			newValue: 'deleted',
			editedBy: deletedBy
		});

		// Record the final state of the player
		await tx.insert(editHistory).values({
			id: randomUUID(),
			tableName: 'player',
			recordId: id,
			fieldName: 'name',
			oldValue: playerData.name,
			newValue: null,
			editedBy: deletedBy
		});

		if (playerData.nationality) {
			await tx.insert(editHistory).values({
				id: randomUUID(),
				tableName: 'player',
				recordId: id,
				fieldName: 'nationality',
				oldValue: playerData.nationality,
				newValue: null,
				editedBy: deletedBy
			});
		}

		// Get and record aliases
		const aliases = await tx.select().from(playerAlias).where(eq(playerAlias.playerId, id));

		for (const alias of aliases) {
			await tx.insert(editHistory).values({
				id: randomUUID(),
				tableName: 'player_alias',
				recordId: id,
				fieldName: 'alias',
				oldValue: alias.alias,
				newValue: null,
				editedBy: deletedBy
			});
		}

		// Get and record game accounts
		const gameAccounts = await tx.select().from(gameAccount).where(eq(gameAccount.playerId, id));

		for (const account of gameAccounts) {
			await tx.insert(editHistory).values({
				id: randomUUID(),
				tableName: 'game_account',
				recordId: id,
				fieldName: 'account',
				oldValue: account.accountId.toString(),
				newValue: null,
				editedBy: deletedBy
			});
		}

		// Get and record social accounts
		const socialAccounts = await tx
			.select()
			.from(player_social_account)
			.where(eq(player_social_account.playerId, id));

		for (const account of socialAccounts) {
			await tx.insert(editHistory).values({
				id: randomUUID(),
				tableName: 'player_social_account',
				recordId: id,
				fieldName: 'account',
				oldValue: account.accountId,
				newValue: null,
				editedBy: deletedBy
			});
		}

		// Delete the records
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

export async function getPlayerEditHistory(playerId: string) {
	const history = await db
		.select()
		.from(editHistory)
		.where(eq(editHistory.recordId, playerId))
		.orderBy(editHistory.editedAt);

	return history;
}
