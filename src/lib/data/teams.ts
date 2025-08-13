import type { Player } from './players';

export interface TeamPlayerRole {
	role: 'active' | 'substitute' | 'former' | 'coach' | 'manager' | 'owner';
	startedOn?: string;
	endedOn?: string;
	note?: string;
}

export interface TeamPlayer {
	player: Player;
	teamPlayer: TeamPlayerRole;
}

export interface Team {
	id: string;
	slug: string;
	name: string;
	abbr: string | null;
	region: string | null;
	logo: string | null;
	createdAt: string | null;
	updatedAt: string | null;
	players?: TeamPlayer[];
	wins?: number;
	aliases?: string[];
}
