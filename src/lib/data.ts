import type { Player } from './data/players';

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

import { players } from '$lib/data/players';
import { teams, type Team } from '$lib/data/teams';

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
	round: number;
	winnerId?: number;
	battleOf: 'BO1' | 'BO3' | 'BO5';
	maps: {
		map: Map;
		pickerId: number;
		pickedSide: 'Attack' | 'Defense';
	}[];
	games?: Game[];
	vod?: string; // url to the vod
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
	slug: string;
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
	capacity: number; // expected number of teams
	date: string;
	website?: string;
	teams: Team[];
}

const tournamentMatches: Match[] = [
	// GUGF vs GA
	{
		id: 10,
		teams: [
			{
				team: teams['GUGF'],
				score: 2
			},
			{
				team: teams['GA'],
				score: 0
			}
		],
		battleOf: 'BO3',
		maps: [
			{ map: 'cauchy_district', pickerId: 1, pickedSide: 'Attack' },
			{ map: 'area_88', pickerId: 2, pickedSide: 'Defense' },
			{ map: 'space_lab', pickerId: 2, pickedSide: 'Defense' }
		],
		round: 3,
		winnerId: 2,
		vod: 'https://youtu.be/gEPv96BlZRc?t=1299',
		games: [
			{
				id: 1,
				map: 'cauchy_district',
				teams: [teams['GUGF'], teams['GA']],
				duration: 1830,
				result: [9, 5],
				winner: 1,
				scores: [
					[
						{
							player: 'iYu',
							characters: ['Fuschia', 'Ming'],
							score: 204,
							damageScore: 172,
							kills: 10,
							knocks: 13,
							deaths: 10,
							assists: 11,
							damage: 3812
						},
						{
							player: 'cherry',
							characters: ['Audrey', 'Reiichi'],
							score: 180,
							damageScore: 177,
							kills: 7,
							knocks: 9,
							deaths: 10,
							assists: 12,
							damage: 4309
						},
						{
							player: 'Jav',
							characters: ['Flavia', 'Celestia'],
							score: 153,
							damageScore: 120,
							kills: 7,
							knocks: 9,
							deaths: 10,
							assists: 14,
							damage: 2746
						},
						{
							player: 'Actyuki',
							characters: ['Bai Mo', 'Eika'],
							score: 139,
							damageScore: 129,
							kills: 4,
							knocks: 5,
							deaths: 9,
							assists: 12,
							damage: 3291
						},
						{
							player: 'Saya',
							characters: ['Michele', 'Lawine'],
							score: 115,
							damageScore: 68,
							kills: 3,
							knocks: 5,
							deaths: 12,
							assists: 13,
							damage: 1588
						}
					],
					[
						{
							player: 'JY10137',
							characters: ['Ming', 'Bai Mo'], // Not provided
							score: 244,
							damageScore: 216,
							kills: 9,
							knocks: 9,
							deaths: 7,
							assists: 25,
							damage: 5371
						},
						{
							player: '箱子箱',
							characters: ['Lawine', 'Fuschia'],
							score: 232,
							damageScore: 164,
							kills: 11,
							knocks: 14,
							deaths: 6,
							assists: 29,
							damage: 3462
						},
						{
							player: 'twitch一77427',
							characters: ['Kanami', 'Kokona'],
							score: 217,
							damageScore: 160,
							kills: 9,
							knocks: 10,
							deaths: 5,
							assists: 19,
							damage: 3700
						},
						{
							player: 'ChengCheng',
							characters: ['Eika', 'Flavia'],
							score: 153,
							damageScore: 132,
							kills: 14,
							knocks: 13,
							deaths: 7,
							assists: 11,
							damage: 2428
						},
						{
							player: 'ぺこどん',
							characters: ['Celestia', 'Michele'],
							score: 172,
							damageScore: 141,
							kills: 11,
							knocks: 12,
							deaths: 6,
							assists: 13,
							damage: 2944
						}
					]
				]
			},
			{
				id: 2,
				map: 'area_88',
				teams: [teams['GUGF'], teams['GA']],
				duration: 1830,
				result: [9, 4],
				winner: 1,
				scores: [
					[
						{
							player: 'ChengCheng',
							characters: ['Lawine', 'Audrey'],
							score: 273,
							damageScore: 201,
							kills: 14,
							knocks: 14,
							deaths: 4,
							assists: 21,
							damage: 4082
						},
						{
							player: '箱子箱',
							characters: ['Fuschia', 'Michele'],
							score: 252,
							damageScore: 189,
							kills: 12,
							knocks: 12,
							deaths: 4,
							assists: 23,
							damage: 3793
						},
						{
							player: 'twitch一77427',
							characters: ['Kanami', 'Kokona'],
							score: 240,
							damageScore: 169,
							kills: 9,
							knocks: 9,
							deaths: 8,
							assists: 20,
							damage: 3648
						},
						{
							player: 'ぺこどん',
							characters: ['Ming', 'Flavia'],
							score: 222,
							damageScore: 182,
							kills: 10,
							knocks: 11,
							deaths: 6,
							assists: 19,
							damage: 3834
						},
						{
							player: 'JY10137',
							characters: ['Reiichi', 'Nobunaga'],
							score: 130,
							damageScore: 108,
							kills: 5,
							knocks: 6,
							deaths: 6,
							assists: 12,
							damage: 2353
						}
					],
					[
						{
							player: 'cherry',
							characters: ['Kokona', 'Kanami'],
							score: 187,
							damageScore: 162,
							kills: 7,
							knocks: 9,
							deaths: 11,
							assists: 6,
							damage: 3461
						},
						{
							player: 'Saya',
							characters: ['Celestia', 'Lawine'],
							score: 184,
							damageScore: 139,
							kills: 8,
							knocks: 9,
							deaths: 9,
							assists: 8,
							damage: 2904
						},
						{
							player: 'Jav',
							characters: ['Michele', 'Celestia'],
							score: 165,
							damageScore: 128,
							kills: 8,
							knocks: 10,
							deaths: 9,
							assists: 4,
							damage: 2769
						},
						{
							player: 'iYu',
							characters: ['Flavia', 'Ming'],
							score: 125,
							damageScore: 96,
							kills: 3,
							knocks: 4,
							deaths: 10,
							assists: 12,
							damage: 2213
						},
						{
							player: 'Actyuki',
							characters: ['Bai Mo', 'Meredith'],
							score: 122,
							damageScore: 102,
							kills: 3,
							knocks: 5,
							deaths: 10,
							assists: 9,
							damage: 2349
						}
					]
				]
			}
		]
	},

	// DRI vs KRC
	{
		id: 11,
		teams: [
			{
				team: teams['DRI'],
				score: 2
			},
			{
				team: teams['KRC'],
				score: 0
			}
		],
		battleOf: 'BO3',
		maps: [
			{ map: 'space_lab', pickerId: 1, pickedSide: 'Attack' },
			{ map: 'cosmite', pickerId: 2, pickedSide: 'Defense' },
			{ map: 'cauchy_district', pickerId: 2, pickedSide: 'Attack' }
		],
		round: 3,
		winnerId: 1,
		vod: 'https://youtu.be/j7Nt3gGzLkg?t=1565',
		games: [
			{
				id: 1,
				map: 'space_lab',
				teams: [teams['DRI'], teams['KRC']],
				duration: 1353,
				result: [3, 9],
				winner: 2,
				scores: [
					[
						{
							player: 'xohfiy',
							characters: ['Michele', 'Lawine'],
							score: 230,
							damageScore: 170,
							kills: 13,
							knocks: 13,
							deaths: 3,
							assists: 18,
							damage: 2948
						},
						{
							player: 'HonkWith4ks',
							characters: ['Yugiri', 'Reiichi'],
							score: 228,
							damageScore: 198,
							kills: 12,
							knocks: 16,
							deaths: 3,
							assists: 11,
							damage: 3535
						},
						{
							player: 'Kariyu',
							characters: ['Audrey', 'Celestia'],
							score: 202,
							damageScore: 183,
							kills: 11,
							knocks: 11,
							deaths: 5,
							assists: 10,
							damage: 3342
						},
						{
							player: 'FOXY1Yukino',
							characters: ['Nobunaga', 'Ming'],
							score: 169,
							damageScore: 123,
							kills: 7,
							knocks: 7,
							deaths: 4,
							assists: 18,
							damage: 2318
						},
						{
							player: 'numOneZKFan',
							characters: ['Flavia', 'Eika'],
							score: 129,
							damageScore: 106,
							kills: 6,
							knocks: 6,
							deaths: 6,
							assists: 11,
							damage: 2061
						}
					],
					[
						{
							player: 'Poison',
							characters: ['Lawine', 'Nobunaga'],
							score: 191,
							damageScore: 158,
							kills: 8,
							knocks: 11,
							deaths: 9,
							assists: 4,
							damage: 2948
						},
						{
							player: 'Creepz',
							characters: ['Galatea', 'Michele'],
							score: 149,
							damageScore: 129,
							kills: 3,
							knocks: 5,
							deaths: 10,
							assists: 5,
							damage: 2798
						},
						{
							player: 'Moozor',
							characters: ['Meredith', 'Audrey'],
							score: 140,
							damageScore: 117,
							kills: 5,
							knocks: 5,
							deaths: 10,
							assists: 6,
							damage: 2399
						},
						{
							player: 'GWZH',
							characters: ['Ming', 'Flavia'],
							score: 118,
							damageScore: 97,
							kills: 4,
							knocks: 4,
							deaths: 9,
							assists: 3,
							damage: 2001
						},
						{
							player: 'Vampire',
							characters: ['Reiichi', 'Fuschia'],
							score: 79,
							damageScore: 62,
							kills: 1,
							knocks: 2,
							deaths: 11,
							assists: 4,
							damage: 1413
						}
					]
				]
			},
			{
				id: 4,
				map: 'cosmite',
				teams: [teams['DRI'], teams['KRC']],
				duration: 1604,
				result: [5, 9],
				winner: 2,
				scores: [
					[
						{
							player: 'Creepz',
							characters: ['Kanami', 'Galatea'],
							score: 254,
							damageScore: 196,
							kills: 9,
							knocks: 14,
							deaths: 9,
							assists: 16,
							damage: 4583
						},
						{
							player: 'Moozor',
							characters: ['Meredith', 'Audrey'],
							score: 184,
							damageScore: 138,
							kills: 5,
							knocks: 6,
							deaths: 11,
							assists: 16,
							damage: 3430
						},
						{
							player: 'Vampire',
							characters: ['Reiichi', 'Fuschia'],
							score: 109,
							damageScore: 80,
							kills: 6,
							knocks: 6,
							deaths: 12,
							assists: 13,
							damage: 1691
						},
						{
							player: 'GWZH',
							characters: ['Ming', 'Flavia'],
							score: 80,
							damageScore: 60,
							kills: 3,
							knocks: 3,
							deaths: 12,
							assists: 9,
							damage: 1437
						},
						{
							player: 'Poison',
							characters: ['Lawine', 'Nobunaga'],
							score: 216,
							damageScore: 170,
							kills: 9,
							knocks: 13,
							deaths: 10,
							assists: 11,
							damage: 3841
						}
					],
					[
						{
							player: 'xohfiy',
							characters: ['Michele', 'Lawine'],
							score: 239,
							damageScore: 177,
							kills: 17,
							knocks: 17,
							deaths: 5,
							assists: 14,
							damage: 3403
						},
						{
							player: 'HonkWith4ks',
							characters: ['Yugiri', 'Reiichi'],
							score: 208,
							damageScore: 167,
							kills: 13,
							knocks: 14,
							deaths: 7,
							assists: 15,
							damage: 3414
						},
						{
							player: 'Kariyu',
							characters: ['Audrey', 'Audrey'],
							score: 169,
							damageScore: 151,
							kills: 9,
							knocks: 12,
							deaths: 7,
							assists: 15,
							damage: 3320
						},
						{
							player: 'FOXY1Yukino',
							characters: ['Nobunaga', 'Ming'],
							score: 161,
							damageScore: 123,
							kills: 8,
							knocks: 8,
							deaths: 6,
							assists: 17,
							damage: 2749
						},
						{
							player: 'numOneZKFan',
							characters: ['Flavia', 'Eika'],
							score: 117,
							damageScore: 91,
							kills: 7,
							knocks: 7,
							deaths: 10,
							assists: 10,
							damage: 1977
						}
					]
				]
			}
		]
	},

	// TG vs GUGF
	{
		id: 16,
		round: 4,
		teams: [
			{
				team: teams['TG'],
				score: 2,
				roaster: ['Ascinei', 'Ascinei', 'Ascinei', 'Ascinei', 'Ascinei']
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
		slug: 'mmcs1',
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
		capacity: 16,
		date: '2025-02-01',
		teams: [teams['TG'], teams['GUGF'], teams['KRC'], teams['DRI'], teams['GA']]
	},
	{
		id: 2,
		slug: 'kawacup',
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
		capacity: 16,
		date: '2025-05-04/2025-05-05',
		website: 'https://tonamel.com/competition/OU2cd',
		teams: [
			teams['CRCC'],
			teams['AFT'],
			teams['GCSC'],
			teams['SI'],
			teams['BP'],
			teams['SKS'],
			teams['KGH'],
			teams['CW'],
			teams['OTG'],
			teams['NBT'],
			teams['KD'],
			teams['UKZ'],
			teams['SSE'],
			teams['KSQ'],
			teams['KNO'],
			teams['SDF']
		]
	},
	{
		id: 3,
		slug: 'origami',
		name: 'Origami Cup',
		official: false,
		server: 'strinova',
		image: 'https://panels.twitch.tv/panel-1266163234-image-05e3f805-6cda-43d1-98b1-e28a540f9003',
		status: 'finished',
		organizer: {
			name: 'OrigamiCup',
			logo: 'https://lh3.googleusercontent.com/docsubipk/AP9E6xXsS7f7lkPdHZI-Q3JGePPY3jLvytkH87Nv3xjq_ZLxAOfz2bLeSdCQL59MrLnTbTX2M5jfSaLuhR4dKJghXD6Ts6ttN_Dv47311ySQgkj7Zy9h',
			url: 'https://www.twitch.tv/origamicup'
		},
		capacity: 14,
		date: '2025-02-24',
		teams: [
			teams['TG'],
			teams['WK'],
			teams['ML'],
			teams['OC'],
			teams['DA'],
			teams['YU'],
			teams['YG'],
			teams['HC'],
			teams['GS'],
			teams['DRI'],
			teams['XKAM'],
			teams['LDP'],
			teams['MA'],
			teams['SF']
		],
		matches: [
			{
				id: 10001,
				round: 1,
				teams: [
					{ team: teams['TG'], score: 2 },
					{ team: teams['MA'], score: 0 }
				],
				winnerId: 1,
				battleOf: 'BO3',
				maps: []
			},
			{
				id: 10002,
				round: 1,
				teams: [
					{ team: teams['HC'], score: 1 },
					{ team: teams['DA'], score: 2 }
				],
				winnerId: 2,
				battleOf: 'BO3',
				maps: []
			},
			{
				id: 10003,
				round: 1,
				teams: [
					{ team: teams['ML'], score: 2 },
					{ team: teams['OC'], score: 1 }
				],
				winnerId: 1,
				battleOf: 'BO3',
				maps: []
			},
			{
				id: 10004,
				round: 1,
				teams: [
					{ team: teams['XKAM'], score: 0 },
					{ team: teams['YG'], score: 2 }
				],
				winnerId: 2,
				battleOf: 'BO3',
				maps: []
			},
			{
				id: 10005,
				round: 2,
				teams: [
					{ team: teams['TG'], score: 2 },
					{ team: teams['DRI'], score: 0 }
				],
				winnerId: 1,
				battleOf: 'BO3',
				maps: []
			},
			{
				id: 10006,
				round: 2,
				teams: [
					{ team: teams['ML'], score: 2 },
					{ team: teams['DA'], score: 0 }
				],
				winnerId: 1,
				battleOf: 'BO3',
				maps: []
			},
			{
				id: 10007,
				round: 3,
				teams: [
					{ team: teams['TG'], score: 2 },
					{ team: teams['ML'], score: 0 }
				],
				winnerId: 1,
				battleOf: 'BO3',
				maps: []
			},
			{
				id: 10008,
				round: 3,
				teams: [
					{ team: teams['DRI'], score: 0 },
					{ team: teams['DA'], score: 2 }
				],
				winnerId: 2,
				battleOf: 'BO3',
				maps: []
			}
		],
		website:
			'https://docs.google.com/spreadsheets/d/1eL5kWIBFGlrQ4HLLAaYyFoJvAMNswvQFSFC00-A8M9M/edit'
	}
];

for (const event of events) {
	for (const team of event.teams) {
		if (!team) {
			console.log(event.teams);
		}
	}
}

export function getEvents() {
	return events;
}

export function getEvent(id: string) {
	if (!isNaN(Number(id))) {
		return events.find((event) => event.id === Number(id));
	}
	return events.find((event) => event.slug === id);
}

export function getMatch(id: number) {
	return tournamentMatches.find((match) => match.id === id);
}

export function getTeams() {
	return Object.entries(teams).map(([id, team]) => ({
		id,
		wins: events
			.flatMap((event) => event.matches)
			.filter(
				(match) =>
					match.teams.some((t) => t.team?.name === team.name) &&
					match.teams[(match.winnerId ?? 0) - 1].team.name === team.name
			).length,
		...team
	}));
}

export function getTeam(id: string) {
	return teams[id];
}

export function getPlayers() {
	return Object.values(players).map((player) => ({
		...player,
		wins: getPlayerWins(player.id ?? ''),
		rating: calculatePlayerRating(player)
	}));
}

export function getPlayer(id: string) {
	return players[id];
}

export function isPlayerInTeam(id: string, team: Team) {
	return [...(team.players ?? []), ...(team.substitutes ?? [])]?.some(
		(player) => player && player.id === id
	);
}

export function getPlayerTeams(id: string) {
	return [
		...new Set(
			getTeams()
				.filter((team) => isPlayerInTeam(id, team))
				.map((team) => team.id)
		)
	].map((id) => getTeams().find((team) => team.id === id)!);
}

export function getPlayerEvents(id: string) {
	return getEvents().filter((event) => event.teams.some((team) => isPlayerInTeam(id, team)));
}

export function getPlayerMatches(id: string): (Match & { playerTeamIndex: number })[] {
	return getEvents()
		.flatMap((event) => event.matches)
		.filter((match) => match.teams.some((team) => isPlayerInTeam(id, team.team)))
		.map((match) => ({
			...match,
			playerTeamIndex: match.teams.findIndex((team) =>
				team.team.players?.some((player) => player && player.id === id)
			)
		}));
}

export function getPlayerWins(id: string): number {
	return getPlayerMatches(id).filter((match) => {
		return match.winnerId === match.playerTeamIndex + 1;
	}).length;
}
export function getPlayerAgents(id: string): [Character, number][] {
	const characters = getPlayerMatches(id).flatMap((match) => {
		// get the team that the player is on
		const teamIndex = match.teams.findIndex((team) =>
			team.team.players?.some((player) => player && player.id === id)
		);

		if (teamIndex === -1) {
			return [];
		}

		const playerIndex =
			match.teams[teamIndex].team.players?.findIndex((player) => player && player.id === id) ?? -1;

		if (playerIndex === -1) {
			return [];
		}

		// get the scores for the player
		const scores = match.games?.flatMap((game) => game.scores[teamIndex][playerIndex]) ?? [];

		// get the characters for the player
		return scores.flatMap((score) => score?.characters ?? []);
	});

	// Count occurrences of each character
	const characterCounts = new Map<Character, number>();
	for (const character of characters) {
		characterCounts.set(character, (characterCounts.get(character) ?? 0) + 1);
	}

	// Convert to array of tuples
	return Array.from(characterCounts.entries());
}

export function getPlayersAgents(limit: number = 3): Record<string, [Character, number][]> {
	return Object.fromEntries(
		Object.entries(players).map(([id, _player]) => [id, getPlayerAgents(id).slice(0, limit)])
	);
}

export function getPlayersTeams(limit: number = 3): Record<string, Team[]> {
	return Object.fromEntries(
		Object.entries(players).map(([id, _player]) => [id, getPlayerTeams(id).slice(0, limit)])
	);
}

function calculatePlayerRating(player: Player) {
	if (!player.id) {
		return 0;
	}

	const matches = getPlayerMatches(player.id);
	if (!matches || matches.length === 0) {
		return 0;
	}

	const scores = matches
		.flatMap((match) => {
			const playerTeamIndex = match.playerTeamIndex;

			const playerScore = match.games?.flatMap((game) =>
				game.scores[playerTeamIndex]
					.filter(
						(score) =>
							score.player === player.id ||
							player.gameAccounts?.some((account) => account.currentName === score.player)
					)
					.map((score) => score.score)
			);

			return playerScore;
		})
		.filter(Boolean) as number[];

	const averageScore = scores.reduce((acc, score) => acc + score, 0) / scores.length;

	return isNaN(averageScore) ? 0 : averageScore / 200;
}
