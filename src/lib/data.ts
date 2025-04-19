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

import { players, type Player } from '$lib/data/players';
import { type Region } from '$lib/data/region';

export interface Team {
	name: string;
	logo?: string;
	region?: Region;
	players?: Player[];
	substitutes?: Player[];
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
	participants: number;
	date: string;
	website?: string;
	teams: Team[];
}

const teams: Record<string, Team> = {
	TG: {
		name: 'The Grustlers',
		region: 'NA',
		players: [
			players['frostyZK'],
			players['grustleking'],
			players['gengu'],
			players['Ascinei'],
			players['Blexiss']
		]
	},
	GUGF: {
		name: 'GUGF(give us girlfriend)',
		region: 'APAC',
		players: [
			players['JY10137'],
			players['逍遥sama'],
			players['羽生翼'],
			players['MIZU'],
			players['BOXCAT'],
			players['Chtho1ly'],
			players['ChengCheng']
		]
	},
	KRC: {
		name: 'KITTEN ROLL CALL',
		region: 'NA',
		players: [
			players['xohfiy'],
			players['Kariyu'],
			players['FOX1Yukino'],
			players['HonkWith4ks'],
			players['numOneZKFan']
		]
	},
	DRI: {
		name: 'Drillas',
		region: 'NA',
		players: [
			players['Creepz'],
			players['Poison'],
			players['Moozor'],
			players['Vampire'],
			players['GWZH']
		]
	},
	GA: {
		name: 'GachaAddicts',
		region: 'APAC',
		players: [
			players['cherry'],
			players['iYu'],
			players['Actyuki'],
			players['Saya'],
			players['Jav'],
			players['SilliestOfThreat'],
			players['Actyuki丶Student']
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

const origamiTeams: Record<string, Team> = {
	TG: {
		name: 'The Grustlers',
		region: 'NA',
		players: [
			players['gengu'],
			players['Ascinei'],
			players['grustleking'],
			players['ttvBlexiss'],
			players['frostyZK']
		],
		substitutes: [players['uno']]
	},
	WK: {
		name: 'Wilden Kerle',
		region: 'NA',
		players: [
			players['Jstn'],
			players['Xaly'],
			players['extraya'],
			players['GloriousNico'],
			players['DEMXN']
		],
		substitutes: [players['Juzify'], players['Vora']]
	},
	ML: {
		name: 'Meowliora',
		region: 'NA',
		players: [
			players['akwa'],
			players['BriBri'],
			players['nine'],
			players['HiroRune'],
			players['Kito']
		],
		substitutes: [players['jayeezy']]
	},
	OC: {
		name: 'October',
		region: 'NA',
		players: [
			players['Skyerzz'],
			players['whoisLexu'],
			players['AjDemon'],
			players['MEGATRONOFDEATH'],
			players['Fjin']
		],
		substitutes: [players['Stykades'], players['zcz']]
	},
	DA: {
		name: 'Drillas Academy',
		region: 'NA',
		players: [
			players['Mansek'],
			players['Scylla'],
			players['sinna'],
			players['ARGHGHGHGHGHHGHG'],
			players['will']
		],
		substitutes: [players['Voxy']]
	},
	YU: {
		name: 'YugifeetLover',
		region: 'NA',
		players: [
			players['aKura'],
			players['Flausch'],
			players['00YUE00'],
			players['GrizzlyGripper28'],
			players['NekoNoTsuki']
		],
		substitutes: [players['schwertfish'], players['KatzenMilch']]
	},
	YG: {
		name: "yuri's gang",
		region: 'NA',
		players: [
			players['nxreq'],
			players['pookie'],
			players['ze'],
			players['KanamiDoggye'],
			players['audience']
		],
		substitutes: [players['MaddeFeetSniffer'], players['SophieRain']]
	},
	HC: {
		name: 'hopecore',
		region: 'NA',
		players: [
			players['Krihville'],
			players['трагедия'],
			players['m1sa'],
			players['canparty'],
			players['Stardx']
		],
		substitutes: [players['NikZON'], players['GigglingWill']]
	},
	GS: {
		name: 'GweahShindago!!',
		region: 'NA',
		players: [
			players['kane'],
			players['Unknown0Neko'],
			players['Squall'],
			players['WEGOINGMENTAL'],
			players['polishcat']
		],
		substitutes: [players['S1nine'], players['Majime']]
	},
	DR: {
		name: 'Drillas',
		region: 'NA',
		players: [
			players['Poison'],
			players['Vampire'],
			players['Creepz'],
			players['Moozor'],
			players['GWZH']
		],
		substitutes: []
	},
	KK: {
		name: '小可爱们',
		region: 'NA',
		players: [
			players['진주'],
			players['百荷'],
			players['AmyamyaThe女神'],
			players['Accellerator'],
			players['RuleR']
		],
		substitutes: [players['爱莉希雅丨侵蚀']]
	},
	LD: {
		name: 'LONG DISTANCE PALS <3',
		region: 'NA',
		players: [
			players['FOX1Yukino'],
			players['HonkWith4ks'],
			players['xohfiy'],
			players['weeping'],
			players['Asscinei']
		],
		substitutes: [players['numoneZKFan']]
	},
	MA: {
		name: 'Michele Armpits',
		region: 'NA',
		players: [
			players['Ely'],
			players['shadow'],
			players['lachevre'],
			players['Revali'],
			players['BurningStar']
		],
		substitutes: [players['PHRESHBOYSWAG']]
	},
	SF: {
		name: 'Stringifries',
		region: 'NA',
		players: [
			players['GhostElectricity'],
			players['Ria'],
			players['FocalorsinBlue'],
			players['JustZero'],
			players['messup']
		],
		substitutes: [players['supercrownnegev'], players['Soulen']]
	}
};

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
		participants: 16,
		date: '2025-02-01',
		teams: Object.values(teams)
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
		participants: 16,
		date: '2025-05-04/2025-05-05',
		website: 'https://tonamel.com/competition/OU2cd',
		teams: [
			{
				name: 'Cơm Rang Cháy Chảo',
				region: 'APAC',
				players: [
					players['Lph4m4218'],
					players['FrostyNade'],
					players['Fis'],
					players['HoangTuHaDong'],
					players['Dinaaa'],
					players['nekocyan'],
					players['Khanh3993']
				]
			},
			{
				name: 'All for tada',
				region: 'APAC',
				players: [
					players['京こ'],
					players['xelcee'],
					players['Zacro'],
					players['kuronory'],
					players['rt0803'],
					players['おっか'],
					players['ななせ']
				]
			},
			{
				name: 'Gà Chiên Sốt Cay',
				region: 'APAC',
				players: [
					players['Teakomi'],
					players['Emilinaz'],
					players['hyacinexcon'],
					players['Flamesicon'],
					players['Put'],
					players['KanamiMyDearest'],
					players['bululelysia']
				]
			},
			{
				name: 'Skill Issues',
				region: 'APAC',
				players: [
					players['ToiYeuRem'],
					players['Unmei'],
					players['Miaa'],
					players['Korofunk'],
					players['Helixu'],
					players['Davy'],
					players['HVO']
				]
			},
			{
				name: 'Become Paper',
				region: 'APAC',
				players: [
					players['EFFECT'],
					players['마들렌'],
					players['Y0ungEgg'],
					players['P1ckUp'],
					players['aewan'],
					players['Shingwan'],
					players['clown']
				]
			},
			{
				name: 'Shigure Kira Saikyou',
				region: 'APAC',
				players: [
					players['時雨綺羅'],
					players['myan777みゃん'],
					players['さめじまさめみ'],
					players['Yueee'],
					players['Killersans'],
					players['LOVE']
				]
			},
			{
				name: 'Kanojo ga hoshi',
				region: 'APAC',
				players: [
					players['Saya'],
					players['iYu'],
					players['SilliestOfThreat'],
					players['MemeVPND'],
					players['ChildHelper']
				]
			},
			{
				name: 'CryWolf ( new Strinoway )',
				region: 'APAC',
				players: [
					players['Katarieeku'],
					players['belongtoyou'],
					players['YunaLiv'],
					players['Karuto丶Beloved'],
					players['Rinko'],
					players['Actyuki丶Student'],
					players['zKeiser']
				]
			},
			{
				name: 'おとげのぅ゙ぁ',
				region: 'APAC',
				players: [
					players['0nesyo (あねしょ)'],
					players['begonia (べごにあ)'],
					players['dore52x (どれっくす)'],
					players['visucuit125 (ゆきむら)'],
					players['yusia (ゆしゃ)'],
					players['iLiss (いりす)'],
					players['いよたけ']
				]
			},
			{
				name: '뉴비팀',
				region: 'APAC',
				players: [
					players['FPThahyun'],
					players['시벌'],
					players['레고'],
					players['살찐족제비'],
					players['만두도둑'],
					players['리로'],
					players['공백']
				]
			},
			{
				name: "Kokona's Drones",
				region: 'APAC',
				players: [
					players['RiN林'],
					players['Papyrus'],
					players['Koalski'],
					players['itsChun'],
					players['Airii'],
					players['Naphta'],
					players['KuroTama39']
				]
			},
			{
				name: '受け皿',
				region: 'APAC',
				players: [
					players['Ken256'],
					players['暗闇の紅茶'],
					players['maimainoob'],
					players['Cream6230'],
					players['Viatorice'],
					players['カミリウイ'],
					players['Hiyokotte']
				]
			},
			{
				name: 'Supreme Shadow Emperor Hik-Jinwoo',
				region: 'APAC',
				players: [
					players['Hinako'],
					players['Su4y'],
					players['はーいあなた'],
					players['RoiPaetSip'],
					players['Artツ'],
					players['Hik'],
					players['EmperorHikJinwoo']
				]
			},
			{
				name: 'KSQ',
				region: 'APAC',
				players: [
					players['칠흑'],
					players['Mejiro Ryan'],
					players['한월2'],
					players['PGtexas'],
					players['AKUKU']
				]
			},
			{
				name: 'Knotorious',
				region: 'APAC',
				players: [
					players['swaegaepinoe'],
					players['redARA'],
					players['whattheskibidi'],
					players['DPTTDM'],
					players['AerixD'],
					players['MistaGojoooookun'],
					players['AeriMayBee']
				]
			},
			{
				name: 'しゅうどうふ',
				region: 'APAC',
				players: [
					players['月神'],
					players['世間天使雨宮優子'],
					players['twitchWenli'],
					players['ChengCheng'],
					players['陌悠理'],
					players['bili会求风的鱼'],
					players['Asuaka']
				]
			}
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
		participants: 16,
		date: '2025-02-24',
		teams: Object.values(origamiTeams),
		matches: [
			{
				id: 1,
				round: 1,
				teams: [
					{ team: origamiTeams['TG'], score: 2 },
					{ team: origamiTeams['MA'], score: 0 }
				],
				winnerId: 1,
				battleOf: 'BO3',
				maps: []
			},
			{
				id: 2,
				round: 1,
				teams: [
					{ team: origamiTeams['HC'], score: 1 },
					{ team: origamiTeams['DA'], score: 2 }
				],
				winnerId: 2,
				battleOf: 'BO3',
				maps: []
			},
			{
				id: 3,
				round: 1,
				teams: [
					{ team: origamiTeams['ML'], score: 2 },
					{ team: origamiTeams['OC'], score: 1 }
				],
				winnerId: 1,
				battleOf: 'BO3',
				maps: []
			},
			{
				id: 4,
				round: 1,
				teams: [
					{ team: origamiTeams['KK'], score: 0 },
					{ team: origamiTeams['YG'], score: 2 }
				],
				winnerId: 2,
				battleOf: 'BO3',
				maps: []
			},
			{
				id: 5,
				round: 2,
				teams: [
					{ team: origamiTeams['TG'], score: 2 },
					{ team: origamiTeams['DR'], score: 0 }
				],
				winnerId: 1,
				battleOf: 'BO3',
				maps: []
			},
			{
				id: 6,
				round: 2,
				teams: [
					{ team: origamiTeams['ML'], score: 2 },
					{ team: origamiTeams['DA'], score: 0 }
				],
				winnerId: 1,
				battleOf: 'BO3',
				maps: []
			},
			{
				id: 7,
				round: 3,
				teams: [
					{ team: origamiTeams['TG'], score: 2 },
					{ team: origamiTeams['ML'], score: 0 }
				],
				winnerId: 1,
				battleOf: 'BO3',
				maps: []
			},
			{
				id: 8,
				round: 3,
				teams: [
					{ team: origamiTeams['DR'], score: 0 },
					{ team: origamiTeams['DA'], score: 2 }
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
	return [
		...new Set(
			events
				.flatMap((event) => event.teams)
				.map((team) => ({
					id: team.name,
					wins: events
						.flatMap((event) => event.matches)
						.filter(
							(match) =>
								match.teams.some((t) => t.team?.name === team.name) &&
								match.teams[(match.winnerId ?? 0) - 1].team.name === team.name
						).length,
					...team
				}))
		)
	];
}

export function getTeam(id: string) {
	return teams[id];
}

export function getPlayers() {
	return Object.values(players).map((player) => ({
		...player,
		wins: getPlayerWins(player.id ?? '')
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
	return getPlayerMatches(id).filter((match) =>
		match.teams[(match.winnerId ?? 0) - 1].team.players?.some(
			(player) => player && player.id === id
		)
	).length;
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
