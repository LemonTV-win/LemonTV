import type { Region } from '$lib/data/game';
import type { TCountryCode } from 'countries-list';

export interface Player {
	id: string;
	name: string; // display name
	slug?: string; // url name (https://lemon.mkpo.li/players/<slug>)
	nationality?: TCountryCode;
	aliases?: string[];
	gameAccounts: GameAccount[];
}

export interface GameAccount {
	accountId: number;
	currentName: string;
	region?: Region;
	names?: string[];
}

export function getAllNames(player: Player) {
	return [
		// player.name,
		...(player.gameAccounts?.flatMap((account) => [
			account.currentName,
			...(account.names ?? [])
		]) ?? []),
		...(player.aliases ?? [])
	];
}
