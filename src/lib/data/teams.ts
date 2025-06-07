import type { Region } from './game';
import type { Player } from './players';

export interface Team {
	id: string;
	slug: string;
	name: string;
	abbr: string | null;
	region: string | null;
	logo: string | null;
	createdAt: string | null;
	updatedAt: string | null;
	players?: Player[];
	wins?: number;
	aliases?: string[];
}
