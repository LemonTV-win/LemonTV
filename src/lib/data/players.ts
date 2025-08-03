import type { Region } from '$lib/data/game';
import type { TCountryCode } from 'countries-list';
import type { User } from './user';

export interface Player {
	id: string;
	name: string; // display name
	slug: string; // url name (/players/<slug>)
	nationalities: TCountryCode[]; // First element is primary nationality, rest are additional
	avatar?: string;
	aliases?: string[];
	gameAccounts: GameAccount[];
	socialAccounts?: SocialAccount[];
	user?: User;
}

export interface GameAccount {
	server: 'Strinova' | 'CalabiYau';
	accountId: number;
	currentName: string;
	region?: Region;
	names?: string[];
}

export interface SocialAccount {
	platformId: string;
	accountId: string;
	overridingUrl?: string;
}

export function getAllNames(player: {
	name: string;
	gameAccounts?: {
		currentName: string;
		names?: string[];
	}[];
	aliases?: string[];
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
