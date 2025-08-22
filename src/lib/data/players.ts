import type { Region } from '$lib/data/game';
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

export interface GameAccount {
	server: 'Strinova' | 'CalabiYau';
	accountId: number;
	currentName: string;
	region?: Region;
	names?: string[];
}

export const SERVER_ABBREVIATIONS: Record<string, string> = {
	Strinova: 'S',
	CalabiYau: 'C'
};

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
