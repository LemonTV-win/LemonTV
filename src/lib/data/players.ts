import type { Region } from '$lib/data/region';

export interface Player {
	id?: string;
	name: string;
	nationality?: 'KR' | 'JP' | 'TW' | 'US' | 'VN' | 'ID' | 'CN';
	aliases?: string[];
	gameAccounts: GameAccount[];
}

export interface GameAccount {
	accountId: number;
	currentName: string;
	region?: Region;
}

export const players: Record<string, Player> = {
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
	},
	'0nesyo (あねしょ)': {
		id: '0nesyo',
		name: '0nesyo',
		aliases: ['あねしょ'],
		gameAccounts: [
			{
				accountId: 3379762,
				currentName: '0nesyo',
				region: 'APAC'
			}
		]
	},
	AKUKU: {
		id: 'AKUKU',
		name: 'AKUKU',
		nationality: 'KR',
		gameAccounts: [
			{
				accountId: 6603250,
				currentName: 'AKUKU',
				region: 'APAC'
			}
		]
	},
	AeriMayBee: {
		id: 'AeriMayBee',
		name: 'AeriMayBee',
		gameAccounts: [
			{
				accountId: 6190211,
				currentName: 'AeriMayBee',
				region: 'APAC'
			}
		]
	},
	AerixD: {
		id: 'AerixD',
		name: 'AerixD',
		gameAccounts: [
			{
				accountId: 3022369,
				currentName: 'AerixD',
				region: 'APAC'
			}
		]
	},
	Airii: {
		id: 'Airii',
		name: 'Airii',
		gameAccounts: [
			{
				accountId: 2240051,
				currentName: 'Airii',
				region: 'APAC'
			}
		]
	},
	DPTTDM: {
		id: 'DPTTDM',
		name: 'DPTTDM',
		gameAccounts: [
			{
				accountId: 7223310,
				currentName: 'DPTTDM',
				region: 'APAC'
			}
		]
	},
	EmperorHikJinwoo: {
		id: 'EmperorHikJinwoo',
		name: 'EmperorHikJinwoo',
		nationality: 'KR',
		gameAccounts: [
			{
				accountId: 5823704,
				currentName: 'EmperorHikJinwoo',
				region: 'APAC'
			}
		]
	},
	FPThahyun: {
		id: 'FPThahyun',
		name: 'FPThahyun',
		nationality: 'KR',
		gameAccounts: [
			{
				accountId: 6554943,
				currentName: 'FPThahyun',
				region: 'APAC'
			}
		]
	},
	Hik: { id: 'Hik', name: 'Hik', gameAccounts: [] },
	Hinako: { id: 'Hinako', name: 'Hinako', gameAccounts: [] },
	Hiyokotte: { id: 'Hiyokotte', name: 'Hiyokotte', gameAccounts: [] },
	Ken256: { id: 'Ken256', name: 'Ken256', gameAccounts: [] },
	Koalski: { id: 'Koalski', name: 'Koalski', gameAccounts: [] },
	KuroTama39: { id: 'KuroTama39', name: 'KuroTama39', gameAccounts: [] },
	'Mejiro Ryan': { id: 'Mejiro Ryan', name: 'Mejiro Ryan', gameAccounts: [] },
	MistaGojoooookun: { id: 'MistaGojoooookun', name: 'MistaGojoooookun', gameAccounts: [] },
	Naphta: { id: 'Naphta', name: 'Naphta', gameAccounts: [] },
	PGtexas: { id: 'PGtexas', name: 'PGtexas', gameAccounts: [] },
	Papyrus: { id: 'Papyrus', name: 'Papyrus', gameAccounts: [] },
	RiN林: { id: 'RiN林', name: 'RiN林', gameAccounts: [] },
	RoiPaetSip: { id: 'RoiPaetSip', name: 'RoiPaetSip', gameAccounts: [] },
	Su4y: { id: 'Su4y', name: 'Su4y', gameAccounts: [] },
	Viatorice: { id: 'Viatorice', name: 'Viatorice', gameAccounts: [] },
	'begonia (べごにあ)': { id: 'begonia (べごにあ)', name: 'begonia (べごにあ)', gameAccounts: [] },
	bili会求风的鱼: {
		id: 'bili会求风的鱼',
		name: 'bili会求风的鱼',
		nationality: 'CN',
		gameAccounts: [
			{
				accountId: 4363073,
				currentName: 'bili会求风的鱼',
				region: 'APAC'
			}
		]
	},
	'dore52x (どれっくす)': {
		id: 'dore52x (どれっくす)',
		name: 'dore52x (どれっくす)',
		gameAccounts: []
	},
	'iLiss (いりす)': { id: 'iLiss (いりす)', name: 'iLiss (いりす)', gameAccounts: [] },
	itsChun: { id: 'itsChun', name: 'itsChun', gameAccounts: [] },
	maimainoob: { id: 'maimainoob', name: 'maimainoob', gameAccounts: [] },
	redARA: { id: 'redARA', name: 'redARA', gameAccounts: [] },
	swaegaepinoe: { id: 'swaegaepinoe', name: 'swaegaepinoe', gameAccounts: [] },
	twitchWenli: { id: 'twitchWenli', name: 'twitchWenli', gameAccounts: [] },
	'visucuit125 (ゆきむら)': {
		id: 'visucuit125 (ゆきむら)',
		name: 'visucuit125 (ゆきむら)',
		gameAccounts: []
	},
	whattheskibidi: { id: 'whattheskibidi', name: 'whattheskibidi', gameAccounts: [] },
	'yusia (ゆしゃ)': { id: 'yusia (ゆしゃ)', name: 'yusia (ゆしゃ)', gameAccounts: [] },
	いよたけ: { id: 'いよたけ', name: 'いよたけ', gameAccounts: [] },
	はーいあなた: { id: 'はーいあなた', name: 'はーいあなた', gameAccounts: [] },
	カミリウイ: { id: 'カミリウイ', name: 'カミリウイ', gameAccounts: [] },
	世間天使雨宮優子: { id: '世間天使雨宮優子', name: '世間天使雨宮優子', gameAccounts: [] },
	暗闇の紅茶: { id: '暗闇の紅茶', name: '暗闇の紅茶', gameAccounts: [] },
	月神: {
		id: '月神',
		name: '月神',
		gameAccounts: [
			{
				accountId: 2521681,
				currentName: '月神',
				region: 'APAC'
			}
		]
	},
	陌悠理: {
		id: '陌悠理',
		name: '陌悠理',
		gameAccounts: [
			{
				accountId: 2364502,
				currentName: '陌悠理',
				region: 'APAC'
			}
		]
	},
	공백: { id: '공백', name: '공백', gameAccounts: [] },
	레고: { id: '레고', name: '레고', gameAccounts: [] },
	리로: { id: '리로', name: '리로', gameAccounts: [] },
	만두도둑: { id: '만두도둑', name: '만두도둑', gameAccounts: [] },
	살찐족제비: { id: '살찐족제비', name: '살찐족제비', gameAccounts: [] },
	시벌: { id: '시벌', name: '시벌', gameAccounts: [] },
	칠흑: { id: '칠흑', name: '칠흑', gameAccounts: [] },
	한월2: { id: '한월2', name: '한월2', gameAccounts: [] },
	'00YUE00': {
		id: '00YUE00',
		name: '00YUE00',
		gameAccounts: [
			{
				accountId: 2984603,
				currentName: '00YUE00'
			}
		]
	},
	ARGHGHGHGHGHHGHG: {
		id: 'ARGHGHGHGHGHHGHG',
		name: 'ARGHGHGHGHGHHGHG',
		gameAccounts: [
			{
				accountId: 2007660,
				currentName: 'ARGHGHGHGHGHHGHG'
			}
		]
	},
	Accellerator: {
		id: 'Accellerator',
		name: 'Accellerator',
		gameAccounts: [
			{
				accountId: 2692001,
				currentName: 'Accellerator'
			}
		]
	},
	AjDemon: {
		id: 'AjDemon',
		name: 'AjDemon',
		gameAccounts: [
			{
				accountId: 2574258,
				currentName: 'AjDemon'
			}
		]
	},
	AmyamyaThe女神: {
		id: 'AmyamyaThe女神',
		name: 'AmyamyaThe女神',
		gameAccounts: [
			{
				accountId: 2027000,
				currentName: 'AmyamyaThe女神'
			}
		]
	},
	Asscinei: {
		id: 'Asscinei',
		name: 'Asscinei',
		gameAccounts: [
			{
				accountId: 2569573,
				currentName: 'Asscinei'
			}
		]
	},
	BriBri: {
		id: 'BriBri',
		name: 'BriBri',
		gameAccounts: [
			{
				accountId: 2007650,
				currentName: 'BriBri'
			}
		]
	},
	BurningStar: {
		id: 'BurningStar',
		name: 'BurningStar',
		gameAccounts: [
			{
				accountId: 2012519,
				currentName: 'BurningStar'
			}
		]
	},
	DEMXN: {
		id: 'DEMXN',
		name: 'DEMXN',
		gameAccounts: [
			{
				accountId: 3158888,
				currentName: 'DEMXN'
			}
		]
	},
	Ely: {
		id: 'Ely',
		name: 'Ely',
		gameAccounts: [
			{
				accountId: 2002426,
				currentName: 'Ely'
			}
		]
	},
	Fjin: {
		id: 'Fjin',
		name: 'Fjin',
		gameAccounts: [
			{
				accountId: 4963044,
				currentName: 'Fjin'
			}
		]
	},
	Flausch: {
		id: 'Flausch',
		name: 'Flausch',
		gameAccounts: [
			{
				accountId: 4931134,
				currentName: 'Flausch'
			}
		]
	},
	FocalorsinBlue: {
		id: 'FocalorsinBlue',
		name: 'FocalorsinBlue',
		gameAccounts: [
			{
				accountId: 2295429,
				currentName: 'FocalorsinBlue'
			}
		]
	},
	GhostElectricity: {
		id: 'GhostElectricity',
		name: 'GhostElectricity',
		gameAccounts: [
			{
				accountId: 2060350,
				currentName: 'GhostElectricity'
			}
		]
	},
	GigglingWill: {
		id: 'GigglingWill',
		name: 'GigglingWill',
		gameAccounts: [
			{
				accountId: 2018900,
				currentName: 'GigglingWill'
			}
		]
	},
	GloriousNico: {
		id: 'GloriousNico',
		name: 'GloriousNico',
		gameAccounts: [
			{
				accountId: 2569105,
				currentName: 'GloriousNico'
			}
		]
	},
	GrizzlyGripper28: {
		id: 'GrizzlyGripper28',
		name: 'GrizzlyGripper28',
		gameAccounts: [
			{
				accountId: 2746798,
				currentName: 'GrizzlyGripper28'
			}
		]
	},
	HiroRune: {
		id: 'HiroRune',
		name: 'HiroRune',
		gameAccounts: [
			{
				accountId: 2003207,
				currentName: 'HiroRune'
			}
		]
	},
	Jstn: {
		id: 'Jstn',
		name: 'Jstn',
		gameAccounts: [
			{
				accountId: 2557678,
				currentName: 'Jstn'
			}
		]
	},
	JustZero: {
		id: 'JustZero',
		name: 'JustZero',
		gameAccounts: [
			{
				accountId: 2007702,
				currentName: 'JustZero'
			}
		]
	},
	Juzify: {
		id: 'Juzify',
		name: 'Juzify',
		gameAccounts: [
			{
				accountId: 2214148,
				currentName: 'Juzify'
			}
		]
	},
	KanamiDoggye: {
		id: 'KanamiDoggye',
		name: 'KanamiDoggye',
		gameAccounts: [
			{
				accountId: 2004316,
				currentName: 'KanamiDoggye'
			}
		]
	},
	KatzenMilch: {
		id: 'KatzenMilch',
		name: 'KatzenMilch',
		gameAccounts: [
			{
				accountId: 2727532,
				currentName: 'KatzenMilch'
			}
		]
	},
	Kito: {
		id: 'Kito',
		name: 'Kito',
		gameAccounts: [
			{
				accountId: 2003596,
				currentName: 'Kito'
			}
		]
	},
	Krihville: {
		id: 'Krihville',
		name: 'Krihville',
		gameAccounts: [
			{
				accountId: 2016425,
				currentName: 'Krihville'
			}
		]
	},
	MEGATRONOFDEATH: {
		id: 'MEGATRONOFDEATH',
		name: 'MEGATRONOFDEATH',
		gameAccounts: [
			{
				accountId: 2008638,
				currentName: 'MEGATRONOFDEATH'
			}
		]
	},
	MaddeFeetSniffer: {
		id: 'MaddeFeetSniffer',
		name: 'MaddeFeetSniffer',
		gameAccounts: [
			{
				accountId: 5446199,
				currentName: 'MaddeFeetSniffer'
			}
		]
	},
	Majime: {
		id: 'Majime',
		name: 'Majime',
		gameAccounts: [
			{
				accountId: 2654916,
				currentName: 'Majime'
			}
		]
	},
	Mansek: {
		id: 'Mansek',
		name: 'Mansek',
		gameAccounts: [
			{
				accountId: 2012280,
				currentName: 'Mansek'
			}
		]
	},
	NekoNoTsuki: {
		id: 'NekoNoTsuki',
		name: 'NekoNoTsuki',
		gameAccounts: [
			{
				accountId: 2319511,
				currentName: 'NekoNoTsuki'
			}
		]
	},
	NikZON: {
		id: 'NikZON',
		name: 'NikZON',
		gameAccounts: [
			{
				accountId: 2475875,
				currentName: 'NikZON'
			}
		]
	},
	PHRESHBOYSWAG: {
		id: 'PHRESHBOYSWAG',
		name: 'PHRESHBOYSWAG',
		gameAccounts: [
			{
				accountId: 2005876,
				currentName: 'PHRESHBOYSWAG'
			}
		]
	},
	Poison: {
		id: 'Poison',
		name: 'Poison',
		gameAccounts: [
			{
				accountId: 2003112,
				currentName: 'Poison'
			}
		]
	},
	Revali: {
		id: 'Revali',
		name: 'Revali',
		gameAccounts: [
			{
				accountId: 2004219,
				currentName: 'Revali'
			}
		]
	},
	Ria: {
		id: 'Ria',
		name: 'Ria',
		gameAccounts: [
			{
				accountId: 2178958,
				currentName: 'Ria'
			}
		]
	},
	RuleR: {
		id: 'RuleR',
		name: 'RuleR',
		gameAccounts: [
			{
				accountId: 3478691,
				currentName: 'RuleR'
			}
		]
	},
	S1nine: {
		id: 'S1nine',
		name: 'S1nine',
		gameAccounts: [
			{
				accountId: 2740790,
				currentName: 'S1nine'
			}
		]
	},
	Scylla: {
		id: 'Scylla',
		name: 'Scylla',
		gameAccounts: [
			{
				accountId: 2002698,
				currentName: 'Scylla'
			}
		]
	},
	Skyerzz: {
		id: 'Skyerzz',
		name: 'Skyerzz',
		gameAccounts: [
			{
				accountId: 4170695,
				currentName: 'Skyerzz'
			}
		]
	},
	SophieRain: {
		id: 'SophieRain',
		name: 'SophieRain',
		gameAccounts: [
			{
				accountId: 2644405,
				currentName: 'SophieRain'
			}
		]
	},
	Soulen: {
		id: 'Soulen',
		name: 'Soulen',
		gameAccounts: [
			{
				accountId: 2046500,
				currentName: 'Soulen'
			}
		]
	},
	Squall: {
		id: 'Squall',
		name: 'Squall',
		gameAccounts: [
			{
				accountId: 2012734,
				currentName: 'Squall'
			}
		]
	},
	Stardx: {
		id: 'Stardx',
		name: 'Stardx',
		gameAccounts: [
			{
				accountId: 4337349,
				currentName: 'Stardx'
			}
		]
	},
	Stykades: {
		id: 'Stykades',
		name: 'Stykades',
		gameAccounts: [
			{
				accountId: 2119392,
				currentName: 'Stykades'
			}
		]
	},
	Unknown0Neko: {
		id: 'Unknown0Neko',
		name: 'Unknown0Neko',
		gameAccounts: [
			{
				accountId: 5054096,
				currentName: 'Unknown0Neko'
			}
		]
	},
	Vora: {
		id: 'Vora',
		name: 'Vora',
		gameAccounts: [
			{
				accountId: 2062111,
				currentName: 'Vora'
			}
		]
	},
	Voxy: {
		id: 'Voxy',
		name: 'Voxy',
		gameAccounts: [
			{
				accountId: 2004030,
				currentName: 'Voxy'
			}
		]
	},
	WEGOINGMENTAL: {
		id: 'WEGOINGMENTAL',
		name: 'WEGOINGMENTAL',
		gameAccounts: [
			{
				accountId: 3244489,
				currentName: 'WEGOINGMENTAL'
			}
		]
	},
	Xaly: {
		id: 'Xaly',
		name: 'Xaly',
		gameAccounts: [
			{
				accountId: 2526198,
				currentName: 'Xaly'
			}
		]
	},
	aKura: {
		id: 'aKura',
		name: 'aKura',
		gameAccounts: [
			{
				accountId: 2422046,
				currentName: 'aKura'
			}
		]
	},
	akwa: {
		id: 'akwa',
		name: 'akwa',
		gameAccounts: [
			{
				accountId: 2003027,
				currentName: 'akwa'
			}
		]
	},
	audience: {
		id: 'audience',
		name: 'audience',
		gameAccounts: [
			{
				accountId: 2665882,
				currentName: 'audience'
			}
		]
	},
	canparty: {
		id: 'canparty',
		name: 'canparty',
		gameAccounts: [
			{
				accountId: 2102581,
				currentName: 'canparty'
			}
		]
	},
	extraya: {
		id: 'extraya',
		name: 'extraya',
		gameAccounts: [
			{
				accountId: 3145854,
				currentName: 'extraya'
			}
		]
	},
	jayeezy: {
		id: 'jayeezy',
		name: 'jayeezy',
		gameAccounts: [
			{
				accountId: 2029185,
				currentName: 'jayeezy'
			}
		]
	},
	kane: {
		id: 'kane',
		name: 'kane',
		gameAccounts: [
			{
				accountId: 2023440,
				currentName: 'kane'
			}
		]
	},
	lachevre: {
		id: 'lachevre',
		name: 'lachevre',
		gameAccounts: [
			{
				accountId: 2014568,
				currentName: 'lachevre'
			}
		]
	},
	m1sa: {
		id: 'm1sa',
		name: 'm1sa',
		gameAccounts: [
			{
				accountId: 2312734,
				currentName: 'm1sa'
			}
		]
	},
	messup: {
		id: 'messup',
		name: 'messup',
		gameAccounts: [
			{
				accountId: 4931249,
				currentName: 'messup'
			}
		]
	},
	nine: {
		id: 'nine',
		name: 'nine',
		gameAccounts: [
			{
				accountId: 2003285,
				currentName: 'nine'
			}
		]
	},
	numoneZKFan: {
		id: 'numoneZKFan',
		name: 'numoneZKFan',
		gameAccounts: [
			{
				accountId: 2014735,
				currentName: 'numoneZKFan'
			}
		]
	},
	nxreq: {
		id: 'nxreq',
		name: 'nxreq',
		gameAccounts: [
			{
				accountId: 2007004,
				currentName: 'nxreq'
			}
		]
	},
	polishcat: {
		id: 'polishcat',
		name: 'polishcat',
		gameAccounts: [
			{
				accountId: 2777256,
				currentName: 'polishcat'
			}
		]
	},
	pookie: {
		id: 'pookie',
		name: 'pookie',
		gameAccounts: [
			{
				accountId: 2001623,
				currentName: 'pookie'
			}
		]
	},
	schwertfish: {
		id: 'schwertfish',
		name: 'schwertfish',
		gameAccounts: [
			{
				accountId: 2473204,
				currentName: 'schwertfish'
			}
		]
	},
	shadow: {
		id: 'shadow',
		name: 'shadow',
		gameAccounts: [
			{
				accountId: 2008299,
				currentName: 'shadow'
			}
		]
	},
	sinna: {
		id: 'sinna',
		name: 'sinna',
		gameAccounts: [
			{
				accountId: 2233623,
				currentName: 'sinna'
			}
		]
	},
	supercrownnegev: {
		id: 'supercrownnegev',
		name: 'supercrownnegev',
		gameAccounts: [
			{
				accountId: 4049780,
				currentName: 'supercrownnegev'
			}
		]
	},
	ttvBlexiss: {
		id: 'ttvBlexiss',
		name: 'ttvBlexiss',
		gameAccounts: [
			{
				accountId: 2003592,
				currentName: 'ttvBlexiss'
			}
		]
	},
	uno: {
		id: 'uno',
		name: 'uno',
		gameAccounts: [
			{
				accountId: 2004861,
				currentName: 'uno'
			}
		]
	},
	weeping: {
		id: 'weeping',
		name: 'weeping',
		gameAccounts: [
			{
				accountId: 2962341,
				currentName: 'weeping'
			}
		]
	},
	whoisLexu: {
		id: 'whoisLexu',
		name: 'whoisLexu',
		gameAccounts: [
			{
				accountId: 4496059,
				currentName: 'whoisLexu'
			}
		]
	},
	will: {
		id: 'will',
		name: 'will',
		gameAccounts: [
			{
				accountId: 2002667,
				currentName: 'will'
			}
		]
	},
	zcz: {
		id: 'zcz',
		name: 'zcz',
		gameAccounts: [
			{
				accountId: 2548614,
				currentName: 'zcz'
			}
		]
	},
	ze: {
		id: 'ze',
		name: 'ze',
		gameAccounts: [
			{
				accountId: 2140210,
				currentName: 'ze'
			}
		]
	},
	трагедия: {
		id: 'трагедия',
		name: 'трагедия',
		gameAccounts: [
			{
				accountId: 5810047,
				currentName: 'трагедия'
			}
		]
	},
	爱莉希雅丨侵蚀: {
		id: '爱莉希雅丨侵蚀',
		name: '爱莉希雅丨侵蚀',
		gameAccounts: [
			{
				accountId: 3652265,
				currentName: '爱莉希雅丨侵蚀'
			}
		]
	},
	百荷: {
		id: '百荷',
		name: '百荷',
		gameAccounts: [
			{
				accountId: 3394080,
				currentName: '百荷'
			}
		]
	},
	진주: {
		id: '진주',
		name: '진주',
		gameAccounts: [
			{
				accountId: 2437416,
				currentName: '진주'
			}
		]
	}
};
