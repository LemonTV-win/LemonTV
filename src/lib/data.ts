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
	id?: string;
	name: string;
	nationality?: 'KR' | 'JP' | 'TW' | 'US' | 'VN' | 'ID' | 'CN';
	aliases?: string[];
	gameAccounts: GameAccount[];
}

export type Region =
	| 'CN' // China
	| 'APAC' // Asia Pacific
	| 'NA' // North America
	| 'SA' // South America
	| 'EU' // Europe
	| 'WA'; // Western Asia

export interface GameAccount {
	id?: number;
	accountId: number;
	currentName: string;
	previousNames?: string[];
	region: Region;
}

export interface Team {
	name: string;
	logo?: string;
	region: Region;
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
	teams: Team[];
}

const players: Record<string, Player> = {
	frostyZK: {
		id: 'frostyZK',
		name: 'frostyZK',
		nationality: 'US',
		gameAccounts: [
			{
				accountId: 2947836,
				currentName: 'frostyZK',
				region: 'NA'
			}
		]
	},
	grustleking: {
		id: 'grustleking',
		name: 'grustleking',
		nationality: 'US',
		gameAccounts: [
			{
				accountId: 2003944,
				currentName: 'grustleking',
				region: 'NA'
			}
		]
	},
	gengu: {
		id: 'gengu',
		name: 'gengu',
		nationality: 'US',
		gameAccounts: [
			{
				accountId: 2005346,
				currentName: 'gengu',
				region: 'NA'
			}
		]
	},
	Ascinei: {
		id: 'Ascinei',
		name: 'Ascinei',
		nationality: 'US',
		gameAccounts: [
			{
				accountId: 2003513,
				currentName: 'Ascinei',
				region: 'NA'
			}
		]
	},
	Blexiss: {
		id: 'Blexiss',
		name: 'Blexiss',
		nationality: 'US',
		gameAccounts: [
			{
				accountId: 2003592,
				currentName: 'Blexiss',
				region: 'NA'
			}
		]
	},
	JY10137: {
		id: 'JY10137',
		name: '瑾玥',
		nationality: 'CN',
		gameAccounts: [
			{
				accountId: 2340207,
				currentName: 'JY10137',
				region: 'APAC'
			}
		]
	},
	逍遥sama: {
		id: '逍遥Samaノ',
		name: '逍遥Samaノ',
		nationality: 'CN',
		gameAccounts: []
	},
	羽生翼: {
		id: '羽生翼',
		name: '羽生翼',
		nationality: 'CN',
		gameAccounts: []
	},
	MIZU: {
		id: 'MIZU',
		name: 'MIZU',
		nationality: 'JP',
		gameAccounts: [
			{
				accountId: 2047299,
				currentName: 'ぺこどん',
				region: 'APAC'
			}
		]
	},
	BOXCAT: {
		id: 'BOXCAT',
		name: 'BOXCAT',
		nationality: 'CN',
		gameAccounts: [
			{
				accountId: 2988260,
				currentName: '箱子箱',
				region: 'APAC'
			}
		]
	},
	Chtho1ly: {
		id: 'Chtho1ly',
		name: 'Chtho1ly',
		nationality: 'CN',
		gameAccounts: []
	},
	ChengCheng: {
		id: 'ChengCheng',
		name: 'ChengCheng',
		nationality: 'CN',
		gameAccounts: [
			{
				accountId: 2108435,
				currentName: 'ChengCheng',
				region: 'APAC'
			}
		]
	},
	xohfiy: {
		id: 'xohfiy',
		name: 'xohfiy',
		nationality: 'US',
		gameAccounts: [
			{
				accountId: 2007805,
				currentName: 'xohfiy',
				region: 'NA'
			}
		]
	},
	Kariyu: {
		id: 'Kariyu',
		name: 'Kariyu',
		nationality: 'JP',
		gameAccounts: [
			{
				accountId: 2000837,
				currentName: 'Kariyu',
				region: 'NA'
			}
		]
	},
	FOX1Yukino: {
		id: 'FOX1Yukino',
		name: 'FOX1Yukino',
		nationality: 'JP',
		gameAccounts: [
			{
				accountId: 2153306,
				currentName: 'FOX1Yukino',
				region: 'NA'
			}
		]
	},
	HonkWith4ks: {
		id: 'HonkWith4ks',
		name: 'HonkWith4ks',
		nationality: 'JP',
		gameAccounts: [
			{
				accountId: 2024432,
				currentName: 'HonkWith4ks',
				region: 'NA'
			}
		]
	},
	numOneZKFan: {
		id: 'numOneZKFan',
		name: 'numOneZKFan',
		nationality: 'US',
		gameAccounts: []
	},
	Creepz: {
		id: 'Creepz',
		name: 'Creepz',
		nationality: 'US',
		gameAccounts: [
			{
				accountId: 2002886,
				currentName: 'Creepz',
				region: 'NA'
			}
		]
	},
	Poison: {
		id: 'Poison',
		name: 'Poison',
		nationality: 'US',
		gameAccounts: []
	},
	Moozor: {
		id: 'Moozor',
		name: 'Moozor',
		nationality: 'US',
		gameAccounts: [
			{
				accountId: 2003583,
				currentName: 'Moozor',
				region: 'NA'
			}
		]
	},
	Vampire: {
		id: 'Vampire',
		name: 'Vampire',
		nationality: 'US',
		gameAccounts: [
			{
				accountId: 2088110,
				currentName: 'Vampire',
				region: 'NA'
			}
		]
	},
	GWZH: {
		id: 'GWZH',
		name: 'GWZH',
		nationality: 'US',
		gameAccounts: [
			{
				accountId: 2027849,
				currentName: 'GWZH',
				region: 'NA'
			}
		]
	},
	cherry: {
		id: 'cherry',
		name: 'cherry',
		nationality: 'VN',
		gameAccounts: [
			{
				accountId: 3721658,
				currentName: 'cherry',
				region: 'APAC'
			}
		]
	},
	iYu: {
		id: 'iYu',
		name: 'iYu',
		nationality: 'VN',
		gameAccounts: [
			{
				accountId: 2017921,
				currentName: 'iYu',
				region: 'APAC'
			}
		]
	},
	Actyuki: {
		id: 'Actyuki',
		name: 'Actyuki',
		nationality: 'ID',
		gameAccounts: [
			{
				accountId: 2002930,
				currentName: 'Actyuki',
				region: 'APAC'
			}
		]
	},
	Saya: {
		id: 'Saya',
		name: 'Saya',
		gameAccounts: [
			{
				accountId: 2001148,
				currentName: 'Saya',
				region: 'APAC'
			}
		]
	},
	Jav: {
		id: 'Jav',
		name: 'Jav',
		gameAccounts: [
			{
				accountId: 2035970,
				currentName: 'Jav',
				region: 'APAC'
			}
		]
	},
	SilliestOfThreat: {
		id: 'SilliestOfThreat',
		name: 'SilliestOfThreat',
		gameAccounts: [
			{
				accountId: 2002681,
				currentName: 'SilliestOfThreat',
				region: 'APAC'
			}
		]
	},
	Actyuki丶Student: {
		id: 'Actyuki丶Student',
		name: 'Actyuki丶Student',
		gameAccounts: [
			{
				accountId: 3097341,
				currentName: 'Actyuki丶Student',
				region: 'APAC'
			}
		]
	},
	ChildHelper: {
		id: 'ChildHelper',
		name: 'ChildHelper',
		gameAccounts: [
			{
				accountId: 2526837,
				currentName: 'ChildHelper',
				region: 'APAC'
			}
		]
	},
	MemeVPND: {
		id: 'MemeVPND',
		name: 'MemeVPND',
		gameAccounts: [
			{
				accountId: 2116730,
				currentName: 'MemeVPND',
				region: 'APAC'
			}
		]
	},
	京こ: {
		id: '京こ',
		name: '京こ',
		aliases: ['きょうこ'],
		gameAccounts: [
			{
				accountId: 2202592,
				currentName: '運トリいくわ',
				region: 'APAC'
			}
		]
	},
	xelcee: {
		id: 'xelcee',
		name: 'xelcee',
		aliases: ['せら'],
		gameAccounts: []
	},
	Zacro: {
		id: 'Zacro',
		name: 'Zacro',
		aliases: ['ザクロ'],
		gameAccounts: [
			{
				accountId: 2033264,
				currentName: 'Zacro',
				region: 'APAC'
			}
		]
	},
	kuronory: {
		id: 'kuronory',
		name: 'kuronory',
		aliases: ['くろのりー'],
		gameAccounts: [
			{
				accountId: 2216164,
				currentName: 'uonory',
				region: 'APAC'
			}
		]
	},
	rt0803: {
		id: 'rt0803',
		name: 'rt0803',
		aliases: ['あーるてぃー', 'arutei0803'],
		gameAccounts: [
			{
				accountId: 2018404,
				currentName: 'rt0803',
				region: 'APAC'
			}
		]
	},
	おっか: {
		id: 'おっか',
		name: 'おっか',
		aliases: ['おっか'],
		gameAccounts: [
			{
				accountId: 2002634,
				currentName: 'おっか',
				region: 'APAC'
			}
		]
	},
	Nanase: {
		id: 'Nanase',
		name: 'Nanase',
		aliases: ['ななせ'],
		gameAccounts: [
			{
				accountId: 2005800,
				currentName: 'Nanase',
				region: 'APAC'
			}
		]
	},
	Lph4m4218: {
		id: 'Lph4m4218',
		name: 'Lph4m4218',
		gameAccounts: [
			{
				accountId: 2202592,
				currentName: 'Lph4m4218',
				region: 'APAC'
			}
		]
	},
	FrostyNade: {
		id: 'FrostyNade',
		name: 'FrostyNade',
		gameAccounts: [
			{
				accountId: 2028856,
				currentName: 'FrostyNade',
				region: 'APAC'
			}
		]
	},
	Fis: {
		id: 'Fis',
		name: 'Fis',
		gameAccounts: [
			{
				accountId: 2248385,
				currentName: 'Fis',
				region: 'APAC'
			}
		]
	},
	HoangTuHaDong: {
		id: 'HoangTuHaDong',
		name: 'HoangTuHaDong',
		gameAccounts: [
			{
				accountId: 2306692,
				currentName: 'HoangTuHaDong',
				region: 'APAC'
			}
		]
	},
	Dinaaa: {
		id: 'Dinaaa',
		name: 'Dinaaa',
		gameAccounts: [
			{
				accountId: 2108374,
				currentName: 'Dinaaa',
				region: 'APAC'
			}
		]
	},
	nekocyan: {
		id: 'nekocyan',
		name: 'nekocyan',
		gameAccounts: []
	},
	Khanh3993: {
		id: 'Khanh3993',
		name: 'Khanh3993',
		gameAccounts: []
	},
	Teakomi: {
		id: 'Teakomi',
		name: 'Teakomi',
		gameAccounts: [
			{
				accountId: 3258110,
				currentName: 'Teakomi',
				region: 'APAC'
			}
		]
	},
	Emilinaz: {
		id: 'Emilinaz',
		name: 'Emilinaz',
		gameAccounts: [
			{
				accountId: 3873106,
				currentName: 'Emilinaz',
				region: 'APAC'
			}
		]
	},
	hyacinexcon: {
		id: 'hyacinexcon',
		name: 'hyacinexcon',
		gameAccounts: []
	},
	Flamesicon: {
		id: 'Flamesicon',
		name: 'Flamesicon',
		gameAccounts: [
			{
				accountId: 5832641,
				currentName: 'Flamesicon',
				region: 'APAC'
			}
		]
	},
	Put: {
		id: 'Put',
		name: 'Put',
		gameAccounts: [
			{
				accountId: 5529053,
				currentName: 'Put',
				region: 'APAC'
			}
		]
	},
	KanamiMyDearest: {
		id: 'KanamiMyDearest',
		name: 'KanamiMyDearest',
		gameAccounts: [
			{
				accountId: 2456956,
				currentName: 'KanamiMyDearest',
				region: 'APAC'
			}
		]
	},
	bululelysia: {
		id: 'bululelysia',
		name: 'bululelysia',
		gameAccounts: []
	},
	ToiYeuRem: {
		id: 'ToiYeuRem',
		name: 'ToiYeuRem',
		gameAccounts: []
	},
	Unmei: {
		id: 'Unmei',
		name: 'Unmei',
		gameAccounts: [
			{
				accountId: 7678631,
				currentName: 'Unmei',
				region: 'APAC'
			}
		]
	},
	Miaa: {
		id: 'Miaa',
		name: 'Miaa',
		gameAccounts: []
	},
	Korofunk: {
		id: 'Korofunk',
		name: 'Korofunk',
		gameAccounts: [
			{
				accountId: 2144717,
				currentName: 'Korofunk',
				region: 'APAC'
			}
		]
	},
	Helixu: {
		id: 'Helixu',
		name: 'Helixu',
		gameAccounts: []
	},
	Davy: {
		id: 'Davy',
		name: 'Davy',
		gameAccounts: [
			{
				accountId: 3680447,
				currentName: 'Davy',
				region: 'APAC'
			}
		]
	},
	HVO: {
		id: 'HVO',
		name: 'HVO',
		gameAccounts: []
	},
	EFFECT: {
		id: 'EFFECT',
		name: 'EFFECT',
		gameAccounts: [
			{
				accountId: 2006752,
				currentName: 'EFFECT',
				region: 'APAC'
			}
		]
	},
	마들렌: {
		id: '마들렌',
		name: '마들렌',
		gameAccounts: [
			{
				accountId: 2007795,
				currentName: '마들렌',
				region: 'APAC'
			}
		]
	},
	Y0ungEgg: {
		id: 'Y0ungEgg',
		name: 'Y0ungEgg',
		gameAccounts: [
			{
				accountId: 2005475,
				currentName: 'Y0ungEgg',
				region: 'APAC'
			}
		]
	},
	P1ckUp: {
		id: 'P1ckUp',
		name: 'P1ckUp',
		gameAccounts: [
			{
				accountId: 2004045,
				currentName: 'P1ckUp',
				region: 'APAC'
			}
		]
	},
	aewan: {
		id: 'aewan',
		name: 'aewan',
		gameAccounts: [
			{
				accountId: 2383768,
				currentName: 'aewan',
				region: 'APAC'
			}
		]
	},
	Shingwan: {
		id: 'Shingwan',
		name: 'Shingwan',
		gameAccounts: [
			{
				accountId: 2030904,
				currentName: 'Shingwan',
				region: 'APAC'
			}
		]
	},
	clown: {
		id: 'clown',
		name: 'clown',
		gameAccounts: [
			{
				accountId: 2334799,
				currentName: 'clown',
				region: 'APAC'
			}
		]
	},
	時雨綺羅: {
		id: '時雨綺羅',
		name: '時雨綺羅',
		gameAccounts: [
			{
				accountId: 4900249,
				currentName: '時雨綺羅',
				region: 'APAC'
			}
		]
	},
	myan777みゃん: {
		id: 'myan777みゃん',
		name: 'myan777みゃん',
		gameAccounts: []
	},
	さめじまさめみ: {
		id: 'さめじまさめみ',
		name: 'さめじまさめみ',
		gameAccounts: []
	},
	Yueee: {
		id: 'Yueee',
		name: 'Yueee',
		gameAccounts: [
			{
				accountId: 2418504,
				currentName: 'Yueee',
				region: 'APAC'
			}
		]
	},
	Killersans: {
		id: 'Killersans',
		name: 'Killersans',
		gameAccounts: [
			{
				accountId: 2206234,
				currentName: 'Killersans',
				region: 'APAC'
			}
		]
	},
	LOVE: {
		id: 'LOVE',
		name: 'LOVE',
		gameAccounts: [
			{
				accountId: 2037110,
				currentName: 'LOVE',
				region: 'APAC'
			}
		]
	},
	Katarieeku: {
		id: 'Katarieeku',
		name: 'Katarieeku',
		gameAccounts: [
			{
				accountId: 4810803,
				currentName: 'Katarieeku',
				region: 'APAC'
			}
		]
	},
	belongtoyou: {
		id: 'belongtoyou',
		name: 'belongtoyou',
		gameAccounts: [
			{
				accountId: 5807525,
				currentName: 'belongtoyou',
				region: 'APAC'
			}
		]
	},
	YunaLiv: {
		id: 'YunaLiv',
		name: 'YunaLiv',
		nationality: 'VN',
		gameAccounts: [
			{
				accountId: 2003669,
				currentName: 'YunaLiv',
				region: 'APAC'
			}
		]
	},
	Karuto丶Beloved: {
		id: 'Karuto丶Beloved',
		name: 'Karuto丶Beloved',
		nationality: 'VN',
		gameAccounts: [
			{
				accountId: 2130819,
				currentName: 'Karuto丶Beloved',
				region: 'APAC'
			}
		]
	},
	Rinko: {
		id: 'Rinko',
		name: 'Rinko',
		gameAccounts: [
			{
				accountId: 2117119,
				currentName: 'Rinko',
				region: 'APAC'
			}
		]
	},
	zKeiser: {
		id: 'zKeiser',
		name: 'zKeiser',
		gameAccounts: []
	}
};

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
		date: '2025-02-01',
		teams: Object.values(teams)
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
			}
		]
	},
	{
		id: 3,
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
		teams: [],
		matches: [],
		website:
			'https://docs.google.com/spreadsheets/d/1eL5kWIBFGlrQ4HLLAaYyFoJvAMNswvQFSFC00-A8M9M/edit'
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

export function getTeams() {
	return [
		...new Set(
			events
				.flatMap((event) => event.teams)
				.map((team) => ({
					id: team.name,
					...team
				}))
		)
	];
}

export function getTeam(id: string) {
	return teams[id];
}

export function getPlayers() {
	return Object.values(players);
}

export function getPlayer(id: string) {
	return players[id];
}

export function getPlayerTeams(id: string) {
	return getTeams().filter((team) => team.players?.some((player) => player && player.id === id));
}

export function getPlayerEvents(id: string) {
	return getEvents().filter((event) =>
		event.teams.some((team) => team.players?.some((player) => player && player.id === id))
	);
}
