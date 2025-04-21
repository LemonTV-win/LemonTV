import type { Character } from './game';
import type { GameMap } from './game';
import type { Team } from './teams';

export interface EventParticipant {
	team: Team;
	roaster?: string[];
	substitutes?: string[];
}

export interface Participant {
	team: Team;
	score: number;
	roaster?: string[];
	substitutes?: string[];
}

export interface Match {
	id: number;
	teams: [Participant, Participant];
	battleOf: 'BO1' | 'BO3' | 'BO5';
	maps: {
		map: GameMap;
		pickerId: number;
		pickedSide: 'Attack' | 'Defense';
	}[];
	games?: Game[];
	vod?: string; // url to the vod
}

export interface PlayerScore {
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
	teams: [A: Team, B: Team];
	result: [A: number, B: number];
	scores: [
		A: [PlayerScore, PlayerScore, PlayerScore, PlayerScore, PlayerScore],
		B: [PlayerScore, PlayerScore, PlayerScore, PlayerScore, PlayerScore]
	];
	winner: number;
}
