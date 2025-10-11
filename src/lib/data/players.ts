import type { TCountryCode } from 'countries-list';
import type { User } from './user';

export interface Player {
	id: string;
	name: string; // display name
	slug: string; // url name (/players/<slug>)
	nationalities: TCountryCode[]; // First element is primary nationality, rest are additional
	avatar?: string;
	aliases: string[];
	gameAccounts: GameAccount[];
	socialAccounts?: SocialAccount[];
	user?: User;
	teams?: PlayerTeam[];
}

export interface PlayerTeam {
	id: string;
	name: string;
	slug: string;
	abbr: string | null;
	logo: string | null;
	region: string | null;
	createdAt: string | null;
	updatedAt: string | null;
	role: 'active' | 'substitute' | 'former' | 'coach' | 'manager' | 'owner';
	startedOn?: string;
	endedOn?: string;
	note?: string;
}

export type GameAccountServer = 'Strinova' | 'CalabiYau';
export type GameAccountRegion = 'APAC' | 'NA' | 'EU' | 'CN';

export interface GameAccount {
	server: GameAccountServer;
	accountId: number;
	currentName: string;
	region?: GameAccountRegion;
	// names?: string[];  // TODO:
}

/**
 * Get the server from the region
 *
 * The game has two servers, CN Server that is called CalabiYau, and later release global server that is called Strinova.
 *
 * CalabiYau only has one region of CN, and Strinova has three of APAC, NA (covers NA and SA), EU (covers EMEA).
 *
 * So if the region is CN, we use CalabiYau, otherwise we use Strinova. If no region is provided, we use Strinova as a default.
 *
 * @param region - The region of the player
 * @returns The server of the player
 */
export function getGameAccountServer(region: GameAccountRegion | undefined): GameAccountServer {
	// Default to Strinova if no region is provided
	if (!region) return 'Strinova';
	return region === 'CN' ? 'CalabiYau' : 'Strinova';
}

const SERVER_ABBREVIATIONS: Record<string, string> = {
	Strinova: 'S',
	CalabiYau: 'C'
};

/**
 * Format the game account ID to C:1234567 or S:1234567
 *
 * @param gameAccount - The game account to format
 * @returns The formatted game account ID
 */
export function formatGameAccountID(
	gameAccount: Pick<GameAccount, 'server' | 'accountId'>
): string {
	return `${SERVER_ABBREVIATIONS[gameAccount.server]}:${gameAccount.accountId}`;
}

export interface SocialAccount {
	platformId: string;
	accountId: string;
	overridingUrl?: string;
}

export function getAllNames(player: {
	name: string;
	gameAccounts: {
		currentName: string;
		names?: string[];
	}[];
	aliases: string[];
}): string[] {
	return [
		...new Set([
			// player.slug,
			player.name,
			...(player.gameAccounts?.flatMap((account) => [
				account.currentName,
				...(account.names ?? [])
			]) ?? []),
			...(player.aliases ?? [])
		])
	];
}
