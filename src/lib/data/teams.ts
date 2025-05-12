import type { Region } from './game';
import type { Player } from './players';

export interface Team {
	id: string;
	name: string;
	abbr?: string;
	slug: string;
	logo?: string;
	region?: Region;
	players?: Player[];
	wins?: number;
	createdAt?: string;
}
