import type { Character } from './game';
import type { GameMap } from './game';
import type { Team } from './teams';

export interface EventParticipant {
	team: string;
	roaster?: string[];
	substitutes?: string[];
}

export interface Participant {
	team: string;
	score: number;
	roaster?: string[];
	substitutes?: string[];
}

export interface CompiledParticipant {
	team: Team;
	score: number;
	roaster?: string[];
	substitutes?: string[];
}

export interface Match {
	id: string;
	teams: [Participant, Participant];
	battleOf: 'BO1' | 'BO3' | 'BO5';
	maps: {
		map: GameMap;
		pickerId?: number;
		pickedSide?: 'Attack' | 'Defense';
	}[];
	games?: Game[];
	vod?: string; // url to the vod
}

export interface CompiledMatch extends Omit<Match, 'teams'> {
	teams: [CompiledParticipant, CompiledParticipant];
}

export interface PlayerScore {
	accountId: number;
	player: string;
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
}
