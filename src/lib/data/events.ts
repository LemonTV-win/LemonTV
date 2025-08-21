import type { Match } from '$lib/data/matches';
import type { LocalizedString } from '$lib/data/string';
import type { Region } from './game';
import type { Organizer } from './organizer';
import type { Player } from './players';
import type { Team } from './teams';

export interface Stage {
	id: number;
	title: string; // Qualifier A1, EU Qualifier, Main Bracket, etc.
	stage: 'qualifier' | 'playoff' | 'group' | 'showmatch';
	format: 'single' | 'double' | 'swiss' | 'round-robin';
	matches: Match[];
	structure: StageStructure;
}

export interface StageRound {
	id: number;
	type:
		| 'quarterfinals'
		| 'semifinals'
		| 'final'
		| 'top16'
		| 'group'
		| 'thirdplace'
		| 'lower'
		| 'grandfinal';
	title?: LocalizedString;
	parallelGroup?: number;
}

export interface StageNode {
	matchId: string;
	round: number; // e.g., 1 = quarterfinals
	dependsOn?: {
		matchId: string;
		outcome: 'winner' | 'loser';
	}[]; // match IDs that this match depends on
	order: number;
}

export interface StageStructure {
	rounds: StageRound[];
	nodes: StageNode[];
}

export interface EventPrize {
	amount: number;
	currency: string;
}

export interface EventResult {
	rank: number;
	rankTo?: number;
	team: Team;
	prizes: EventPrize[];
}

export interface LabeledURL {
	url: string;
	label?: string;
}

export interface EventParticipant {
	team: Team;
	main: Player[];
	reserve: Player[];
	coach: Player[];
	// Optional metadata from event_team table
	entry?:
		| 'open'
		| 'invited'
		| 'qualified'
		| 'host'
		| 'defending_champion'
		| 'regional_slot'
		| 'exhibition'
		| 'wildcard';
	status?: 'active' | 'disqualified' | 'withdrawn' | 'eliminated';
}

export interface Event {
	id: string;
	slug: string;
	name: string;
	official: boolean;
	server: 'calabiyau' | 'strinova';
	format: 'lan' | 'online' | 'hybrid';
	region: Region;
	// location: string;
	// description: string;
	image: string;
	imageURL?: string;
	status: 'upcoming' | 'live' | 'finished' | 'cancelled' | 'postponed';
	stages: Stage[];

	// prizePool: number;
	// teams: Team[];
	organizers: Organizer[];
	capacity: number; // expected number of teams
	date: string;
	websites?: LabeledURL[];
	participants: EventParticipant[];
	videos?: {
		type: 'stream' | 'clip' | 'vod';
		platform: 'twitch' | 'youtube' | 'bilibili';
		url: string;
		title?: string;
	}[];
	casters?: Array<{
		player: Player;
		role: 'host' | 'analyst' | 'commentator';
	}>;
	results?: EventResult[];
}
