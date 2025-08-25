import { m } from '$lib/paraglide/messages';
import type { Character } from './game';
import type { GameMap } from './game';
import type { Team } from './teams';

export interface EventParticipant {
	team: string;
	roaster?: string[];
	substitutes?: string[];
}

export interface Participant {
	team: Team;
	score: number;
	roaster?: string[];
	substitutes?: string[];
}

export interface CompiledParticipant extends Participant {
	team: Team & { logoURL: string | null };
}

export interface Match {
	id: string;
	result?: [number, number];
	teams: [Participant, Participant];
	battleOf: 'BO1' | 'BO3' | 'BO5';
	maps: {
		map: GameMap;
		pickerId?: number;
		pickedSide?: 'Attack' | 'Defense';
	}[];
	games: Game[];
	vod?: string; // url to the vod
}

export interface CompiledMatch extends Omit<Match, 'teams'> {
	teams: [CompiledParticipant, CompiledParticipant];
}

export interface PlayerScore {
	accountId: number;
	player: string;
	playerSlug?: string; // Optional for backward compatibility
	characters: [firstHalf: Character | null, secondHalf: Character | null];
	score: number;
	damageScore: number;
	kills: number;
	knocks: number;
	deaths: number;
	assists: number;
	damage: number;
}

export interface Game {
	id: number;
	map: GameMap;
	duration: number;
	teams: [A: string, B: string];
	result: [A: number, B: number];
	scores: [
		A: [PlayerScore, PlayerScore, PlayerScore, PlayerScore, PlayerScore],
		B: [PlayerScore, PlayerScore, PlayerScore, PlayerScore, PlayerScore]
	];
	winner: number;
	vods?: Array<{
		url: string;
		type: 'main' | 'sub' | 'restream' | 'pov' | 'archive' | 'clip' | 'analysis';
		playerId?: string;
		teamId?: string;
		language?: string;
		platform?: 'youtube' | 'bilibili' | 'twitch';
		title?: string;
		official: boolean;
		startTime?: number;
		available: boolean;
		createdAt: Date;
		updatedAt: Date;
	}>;
}

export type Round =
	| 'quarterfinals'
	| 'semifinals'
	| 'final'
	| 'thirdplace'
	| 'grandfinal'
	| 'top16';

export const ROUND_NAMES: Record<Round, () => string> = {
	quarterfinals: m.quarterfinals,
	semifinals: m.semifinals,
	final: m.final,
	thirdplace: m.thirdplace,
	grandfinal: m.grandfinal,
	top16: m.top16
};
