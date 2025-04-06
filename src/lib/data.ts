export type Map =
	| 'base_404'
	| 'space_lab'
	| 'windy_town'
	| 'area_88'
	| 'port_euler'
	| 'cosmite'
	| 'orcanus'
	| 'cauchy_district';

export type PUSCharacter =
	| 'Yvette'
	| 'Nobunaga'
	| 'Kokona'
	| 'Michele'
	| 'Flavia'
	| 'Yugiri'
	| 'Leona';
export type ScissorsCharacter =
	| 'Reiichi'
	| 'Lawine'
	| 'Ming'
	| 'Meredith'
	| 'Eika'
	| 'Kanami'
	| 'Fragrans'
	| 'Mara';
export type UrbinoCharacter =
	| 'Audrey'
	| 'Celestia'
	| 'Maddelena'
	| 'Bai Mo'
	| 'Fuschia'
	| 'Galatea';

export type Character = PUSCharacter | ScissorsCharacter | UrbinoCharacter;

export interface Player {
	ingame: string;
	common: string;
}

export interface Team {
	name: string;
	logo?: string;
	region: 'APAC' | 'NA' | 'EU' | 'CN';
	players?: Player[];
}

export interface Participant {
	team: Team;
	score: number;
	roaster?: string[];
}

export interface Match {
	id: number;
	teams: [Participant, Participant];
	round: number;
	winnerId?: number;
	battleOf: 'BO1' | 'BO3' | 'BO5';
	maps: {
		map: Map;
		pickerId: number;
		pickedSide: 'Attack' | 'Defense';
	}[];
	games?: Game[];
}

export interface PlayerScore {
	player: string;
	characters: [firstHalf: Character, secondHalf: Character];
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
	map: Map;
	duration: number;
	teams: [A: Team, B: Team];
	result: [A: number, B: number];
	scores: [
		A: [PlayerScore, PlayerScore, PlayerScore, PlayerScore, PlayerScore],
		B: [PlayerScore, PlayerScore, PlayerScore, PlayerScore, PlayerScore]
	];
	winner: number;
}

export interface Event {
	id: number;
	name: string;
	official: boolean;
	server: 'calabiyau' | 'strinova';
	// host: string;
	// date: string;
	// location: string;
	// description: string;
	image: string;
	status: 'upcoming' | 'live' | 'finished' | 'cancelled' | 'postponed';
	matches: Match[];
	// prizePool: number;
	// teams: Team[];
	organizer: {
		name: string;
		logo?: string;
		url: string;
	};
	participants: number;
	date: string;
	website?: string;
}

const teams: Record<string, Team> = {
	TG: {
		name: 'The Grustlers',
		region: 'NA',
		players: [
			{
				ingame: 'frostyZK',
				common: 'frostyZK'
			},
			{
				ingame: 'grustleking',
				common: 'grustleking'
			},
			{
				ingame: 'gengu',
				common: 'gengu'
			},
			{
				ingame: 'Ascinei',
				common: 'Ascinei'
			},
			{
				ingame: 'ttvBlexiss',
				common: 'Blexiss'
			}
		]
	},
	GUGF: {
		name: 'GUGF(give us girlfriend)',
		region: 'APAC',
		players: [
			{
				ingame: 'JY10137',
				common: '瑾玥'
			},
			{
				ingame: '｜結城さくな｜',
				common: '逍遥sama'
			},
			{
				ingame: 'twitchー77427',
				common: '羽生翼'
			},
			{
				ingame: 'ぺこどん',
				common: 'MIZU'
			},
			{
				ingame: '箱子箱',
				common: 'BOXCAT'
			},
			{
				ingame: 'Chtho1ly',
				common: 'Chtho1ly'
			},
			{
				ingame: 'ChengCheng',
				common: 'ChengCheng'
			}
		]
	},
	KRC: {
		name: 'KITTEN ROLL CALL',
		region: 'NA',
		players: [
			{
				ingame: 'xohfiy',
				common: 'xohfiy'
			},
			{
				ingame: 'Kariyuu',
				common: 'Kariyuu'
			},
			{
				ingame: 'FOX1Yukino',
				common: 'FOX1Yukino'
			},
			{
				ingame: 'HonkWith4ks',
				common: 'HonkWith4ks'
			},
			{
				ingame: 'numOneZKFan',
				common: 'numOneZKFan'
			}
		]
	},
	DRI: {
		name: 'Drillas',
		region: 'NA',
		players: [
			{
				ingame: 'Creepz',
				common: 'Creepz'
			},
			{
				ingame: 'Poison',
				common: 'Poison'
			},
			{
				ingame: 'Moozor',
				common: 'Moozor'
			},
			{
				ingame: 'Vampire',
				common: 'Vampire'
			},
			{
				ingame: 'GWZH',
				common: 'GWZH'
			}
		]
	},
	GA: {
		name: 'GachaAddicts',
		region: 'APAC',
		players: [
			{
				ingame: 'cherry',
				common: 'cherry'
			},
			{
				ingame: 'iYu',
				common: 'iYu'
			},
			{
				ingame: 'Actyuki',
				common: 'Actyuki'
			},
			{
				ingame: 'Saya',
				common: 'Saya'
			},
			{
				ingame: 'Jav',
				common: 'Jav'
			},
			{
				ingame: 'SilliestOfThreat',
				common: 'SilliestOfThreat'
			},
			{
				ingame: 'Actyuki丶Student',
				common: 'Actyuki丶Student'
			}
		]
	}
};

const tournamentMatches: Match[] = [
	{
		id: 1,
		teams: [
			{
				team: teams['TG'],
				score: 2
			},
			{
				team: teams['DRI'],
				score: 0
			}
		],
		battleOf: 'BO3',
		maps: [],
		round: 1,
		winnerId: 1
	},
	{
		id: 2,
		teams: [
			{
				team: teams['TG'],
				score: 1
			},
			{
				team: teams['GA'],
				score: 2
			}
		],
		battleOf: 'BO3',
		maps: [],
		round: 1,
		winnerId: 2
	},
	{
		id: 5,
		teams: [
			{
				team: teams['GUGF'],
				score: 2
			},
			{
				team: teams['KRC'],
				score: 0
			}
		],
		battleOf: 'BO3',
		maps: [],
		round: 2,
		winnerId: 1
	},

	{
		id: 10,
		teams: [
			{
				team: teams['GUGF'],
				score: 0
			},
			{
				team: teams['GA'],
				score: 0
			}
		],
		battleOf: 'BO3',
		maps: [],
		round: 3,
		winnerId: 2
	},

	{
		id: 14,
		teams: [
			{
				team: teams['KRC'],
				score: 2
			},
			{
				team: teams['DRI'],
				score: 0
			}
		],
		round: 3,
		winnerId: 1,
		battleOf: 'BO3',
		maps: []
	},
	{
		id: 15,
		teams: [
			{
				team: teams['KRC'],
				score: 0
			},
			{
				team: teams['GUGF'],
				score: 2
			}
		],
		round: 3,
		winnerId: 2,
		battleOf: 'BO3',
		maps: []
	},
	{
		id: 16,
		round: 4,
		teams: [
			{
				team: teams['TG'],
				score: 2
			},
			{
				team: teams['GUGF'],
				score: 0,
				roaster: ['瑾玥', '逍遥sama', '羽生翼', 'ぺこどん', 'BOXCAT']
			}
		],
		winnerId: 1, // 0 means draw, 1 means team1 wins, 2 means team2 wins
		maps: [
			{ map: 'base_404', pickerId: 2, pickedSide: 'Attack' },
			{ map: 'space_lab', pickerId: 1, pickedSide: 'Attack' },
			{ map: 'windy_town', pickerId: 1, pickedSide: 'Defense' }
		],
		battleOf: 'BO3',
		games: [
			{
				id: 1,
				map: 'base_404',
				teams: [teams['TG'], teams['GUGF']],
				duration: 1830,
				result: [2, 0],
				winner: 1,
				scores: [
					[
						{
							player: 'Ascinei',
							characters: ['Kokona', 'Kanami'],
							score: 271,
							damageScore: 183,
							kills: 11,
							knocks: 15,
							deaths: 12,
							assists: 31,
							damage: 6242
						},
						{
							player: 'ttvBlexiss',
							characters: ['Flavia', 'Lawine'],
							score: 245,
							damageScore: 186,
							kills: 15,
							knocks: 19,
							deaths: 13,
							assists: 24,
							damage: 5967
						},
						{
							player: 'gengu',
							characters: ['Celestia', 'Ming'],
							score: 227,
							damageScore: 190,
							kills: 16,
							knocks: 18,
							deaths: 12,
							assists: 17,
							damage: 6125
						},
						{
							player: 'grustleking',
							characters: ['Michele', 'Celestia'],
							score: 186,
							damageScore: 122,
							kills: 10,
							knocks: 12,
							deaths: 19,
							assists: 19,
							damage: 4254
						},
						{
							player: 'frostyZK',
							characters: ['Yugiri', 'Meredith'],
							score: 178,
							damageScore: 125,
							kills: 12,
							knocks: 16,
							deaths: 21,
							assists: 16,
							damage: 3998
						}
					],
					[
						{
							player: '| 結城さくな |',
							characters: ['Ming', 'Flavia'],
							score: 263,
							damageScore: 229,
							kills: 20,
							knocks: 21,
							deaths: 12,
							assists: 19,
							damage: 7446
						},
						{
							player: 'ぺこどん',
							characters: ['Lawine', 'Michele'],
							score: 203,
							damageScore: 140,
							kills: 10,
							knocks: 11,
							deaths: 13,
							assists: 28,
							damage: 4763
						},
						{
							player: 'JY10137',
							characters: ['Meredith', 'Bai Mo'],
							score: 197,
							damageScore: 148,
							kills: 14,
							knocks: 16,
							deaths: 11,
							assists: 20,
							damage: 4627
						},
						{
							player: 'twitchー77427',
							characters: ['Kanami', 'Kokona'],
							score: 193,
							damageScore: 128,
							kills: 9,
							knocks: 11,
							deaths: 14,
							assists: 20,
							damage: 4276
						},
						{
							player: '箱子箱',
							characters: ['Celestia', 'Celestia'],
							score: 157,
							damageScore: 99,
							kills: 7,
							knocks: 8,
							deaths: 12,
							assists: 18,
							damage: 3286
						}
					]
				]
			},

			{
				id: 2,
				map: 'space_lab',
				teams: [teams['TG'], teams['GUGF']],
				duration: 1830,
				result: [2, 0],
				scores: [
					[
						{
							player: 'Ascinei',
							characters: ['Kanami', 'Kokona'],
							score: 223,
							damageScore: 150,
							kills: 11,
							knocks: 13,
							deaths: 9,
							assists: 26,
							damage: 3730
						},
						{
							player: 'frostyZK',
							characters: ['Meredith', 'Yugiri'],
							score: 217,
							damageScore: 159,
							kills: 10,
							knocks: 10,
							deaths: 8,
							assists: 25,
							damage: 4259
						},
						{
							player: 'gengu',
							characters: ['Ming', 'Michele'],
							score: 199,
							damageScore: 168,
							kills: 10,
							knocks: 9,
							deaths: 10,
							assists: 17,
							damage: 4528
						},
						{
							player: 'ttvBlexiss',
							characters: ['Lawine', 'Flavia'],
							score: 186,
							damageScore: 150,
							kills: 14,
							knocks: 17,
							deaths: 10,
							assists: 16,
							damage: 3348
						},
						{
							player: 'grustleking',
							characters: ['Celestia', 'Fuschia'],
							score: 172,
							damageScore: 114,
							kills: 9,
							knocks: 9,
							deaths: 8,
							assists: 23,
							damage: 2929
						}
					],
					[
						{
							player: 'twitchー77427',
							characters: ['Kokona', 'Kanami'],
							score: 205,
							damageScore: 146,
							kills: 8,
							knocks: 11,
							deaths: 10,
							assists: 19,
							damage: 3917
						},
						{
							player: '| 結城さくな |',
							characters: ['Flavia', 'Ming'],
							score: 203,
							damageScore: 169,
							kills: 12,
							knocks: 13,
							deaths: 10,
							assists: 21,
							damage: 4314
						},
						{
							player: '箱子箱',
							characters: ['Fuschia', 'Lawine'],
							score: 182,
							damageScore: 151,
							kills: 12,
							knocks: 14,
							deaths: 12,
							assists: 8,
							damage: 3709
						},
						{
							player: 'JY10137',
							characters: ['Celestia', 'Reiichi'],
							score: 134,
							damageScore: 104,
							kills: 6,
							knocks: 7,
							deaths: 11,
							assists: 11,
							damage: 2809
						},
						{
							player: 'ぺこどん',
							characters: ['Michele', 'Celestia'],
							score: 124,
							damageScore: 91,
							kills: 7,
							knocks: 7,
							deaths: 11,
							assists: 13,
							damage: 2256
						}
					]
				],
				winner: 1
			}
		]
	}
];

const events: Event[] = [
	{
		id: 1,
		name: 'Mighty Meow Cup Season 1',
		official: false,
		server: 'strinova',
		image: 'https://i.ytimg.com/vi/j7Nt3gGzLkg/hq720.jpg',
		status: 'finished',
		organizer: {
			name: 'BriBri',
			logo: 'https://pbs.twimg.com/profile_images/1863502296023531520/ALjMfroI_400x400.jpg',
			url: 'https://x.com/BriBri_TSG'
		},
		matches: tournamentMatches,
		participants: 16,
		date: '2025-02-01'
	},
	{
		id: 2,
		name: 'Apac No.1 tournament KAWA cup',
		official: false,
		server: 'strinova',
		image:
			'https://img.tonamel.com/c!/f=webp:auto,w=1600,h=900,a=2/upload_images/organize_competition/yROLW/fc1ed3f7ca5a35d6de5c20a8db90b617b89a063bedaaba6a205de19c1b00ad07.jpg',
		status: 'upcoming',
		matches: [],
		organizer: {
			name: '川島宮殿',
			logo: 'https://pbs.twimg.com/profile_images/1792733020912545792/NKEIhBSI_400x400.jpg',
			url: 'https://x.com/kawakyuden'
		},
		participants: 8,
		date: '2025-05-04',
		website: 'https://tonamel.com/competition/OU2cd'
	}
];

export function getEvents() {
	return events;
}

export function getEvent(id: number) {
	return events.find((event) => event.id === id);
}

export function getMatch(id: number) {
	return tournamentMatches.find((match) => match.id === id);
}
