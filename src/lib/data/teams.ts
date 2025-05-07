import { type Region } from './game';

export interface Team {
	id: string;
	name: string;
	logo?: string;
	region?: Region;
	players?: string[]; // active roaster
	substitutes?: string[]; // bench
	former?: string[]; // former players
}

export const teams: Record<string, Team> = {
	TA: {
		id: 'temu-avengers',
		name: 'Temu Avengers',
		players: []
	},

	TG: {
		id: 'the-grustlers',
		name: 'The Grustlers',
		region: 'NA',
		players: ['frostyZK', 'grustleking', 'gengu', 'Ascinei', 'Blexiss', 'uno']
	},
	GUGF: {
		id: 'gugf',
		name: 'GUGF(give us girlfriend)',
		region: 'APAC',
		players: ['JY10137', '逍遥sama', '羽生翼', 'MIZU', 'BOXCAT', 'Chtho1ly', 'ChengCheng']
	},
	KRC: {
		id: 'kitten-roll-call',
		name: 'KITTEN ROLL CALL',
		region: 'NA',
		players: ['xohfiy', 'Kariyu', 'FOX1Yukino', 'HonkWith4ks', 'numOneZKFan']
	},
	DRI: {
		id: 'drillas',
		name: 'Drillas',
		region: 'NA',
		players: ['Creepz', 'Poison', 'Moozor', 'Vampire', 'GWZH']
	},
	GA: {
		id: 'gacha-addicts',
		name: 'GachaAddicts',
		region: 'APAC',
		players: ['cherry', 'iYu', 'Actyuki', 'Saya', 'Jav', 'SilliestOfThreat', 'Actyuki丶Student']
	},
	WK: {
		id: 'wilden-kerle',
		name: 'Wilden Kerle',
		region: 'NA',
		players: ['Jstn', 'Xaly', 'extraya', 'GloriousNico', 'DEMXN'],
		substitutes: ['Juzify', 'Vora']
	},
	ML: {
		id: 'meowliora',
		name: 'Meowliora',
		region: 'NA',
		players: ['akwa', 'BriBri', 'nine', 'HiroRune', 'Kito'],
		substitutes: ['jayeezy']
	},
	OC: {
		id: 'october',
		name: 'October',
		region: 'NA',
		players: ['Skyerzz', 'whoisLexu', 'AjDemon', 'MEGATRONOFDEATH', 'Fjin'],
		substitutes: ['Stykades', 'zcz']
	},
	DA: {
		id: 'drillas-academy',
		name: 'Drillas Academy',
		region: 'NA',
		players: ['Mansek', 'Scylla', 'sinna', 'ARGHGHGHGHGHHGHG', 'will'],
		substitutes: ['Voxy']
	},
	YU: {
		id: 'yugifeetlover',
		name: 'YugifeetLover',
		region: 'NA',
		players: ['aKura', 'Flausch', '00YUE00', 'GrizzlyGripper28', 'NekoNoTsuki'],
		substitutes: ['schwertfish', 'KatzenMilch']
	},
	YG: {
		id: "yuri's-gang",
		name: "yuri's gang",
		region: 'NA',
		players: ['nxreq', 'pookie', 'ze', 'KanamiDoggye', 'audience'],
		substitutes: ['MaddeFeetSniffer', 'SophieRain']
	},
	HC: {
		id: 'hopecore',
		name: 'hopecore',
		region: 'NA',
		players: ['Krihville', 'трагедия', 'm1sa', 'canparty', 'Stardx'],
		substitutes: ['NikZON', 'GigglingWill']
	},
	GS: {
		id: 'gweah-shindago',
		name: 'GweahShindago!!',
		region: 'NA',
		players: ['kane', 'Unknown0Neko', 'Squall', 'WEGOINGMENTAL', 'polishcat'],
		substitutes: ['S1nine', 'Majime']
	},
	XKAM: {
		id: 'xiao-ke-ai-men',
		name: '小可爱们',
		region: 'NA',
		players: ['진주', '百荷', 'AmyamyaThe女神', 'Accellerator', 'RuleR'],
		substitutes: ['爱莉希雅丨侵蚀']
	},
	LDP: {
		id: 'long-distance-pals',
		name: 'LONG DISTANCE PALS <3',
		region: 'NA',
		players: ['FOX1Yukino', 'HonkWith4ks', 'xohfiy', 'weeping', 'Asscinei'],
		substitutes: ['numoneZKFan']
	},
	MA: {
		id: 'michele-armpits',
		name: 'Michele Armpits',
		region: 'NA',
		players: ['Ely', 'shadow', 'lachevre', 'Revali', 'BurningStar'],
		substitutes: ['PHRESHBOYSWAG']
	},
	SF: {
		id: 'stringifries',
		name: 'Stringifries',
		region: 'NA',
		players: ['GhostElectricity', 'Ria', 'FocalorsinBlue', 'JustZero', 'messup'],
		substitutes: ['supercrownnegev', 'Soulen']
	},
	CRCC: {
		id: 'com-rang-chay-chao',
		name: 'Cơm Rang Cháy Chảo',
		region: 'APAC',
		players: ['Lph4m4218', 'FrostyNade', 'Fis', 'HoangTuHaDong', 'Dinaaa', 'nekocyan', 'Khanh3993']
	},
	AFT: {
		id: 'all-for-tada',
		name: 'All for tada',
		region: 'APAC',
		players: ['京こ', 'xelcee', 'Zacro', 'kuronory', 'rt0803', 'おっか', 'ななせ']
	},
	GCSC: {
		id: 'ga-chien-so-tay',
		name: 'Gà Chiên Sốt Cay',
		region: 'APAC',
		players: [
			'Teakomi',
			'Emilinaz',
			'hyacinexcon',
			'Flamesicon',
			'Put',
			'KanamiMyDearest',
			'bululelysia',
			'xXBunDauSlayerXx',
			'KNDxFlamescion2',
			'Fumin0'
		]
	},
	SI: {
		id: 'skill-issues',
		name: 'Skill Issues',
		region: 'APAC',
		players: ['ToiYeuRem', 'Unmei', 'Miaa', 'Korofunk', 'Helixu', 'Davy', 'HVO']
	},
	BP: {
		id: 'become-paper',
		name: 'Become Paper',
		region: 'APAC',
		players: ['EFFECT', '마들렌', 'Y0ungEgg', 'P1ckUp', 'aewan', 'Shingwan', 'clown']
	},
	SKS: {
		id: 'shigure-kira-saikyou',
		name: 'Shigure Kira Saikyou',
		region: 'APAC',
		players: ['時雨綺羅', 'myan777みゃん', 'さめじまさめみ', 'Yueee', 'Killersans']
	},
	KGH: {
		id: 'kanojo-ga-hoshi',
		name: 'Kanojo ga hoshi',
		region: 'APAC',
		players: ['Saya', 'iYu', 'SilliestOfThreat', 'MemeVPND', 'ChildHelper']
	},
	CW: {
		id: 'crywolf',
		name: 'CryWolf', // (new Strinoway)
		region: 'APAC',
		players: [
			'Katarieeku',
			'belongtoyou',
			'YunaLiv',
			'Karuto丶Beloved',
			'Rinko',
			'Actyuki丶Student',
			'fumiko好き'
		]
	},
	OTG: {
		id: 'otogenova',
		name: 'おとげのぅ゙ぁ',
		region: 'APAC',
		players: ['0nesyo', 'begonia', 'dore52x', 'visucuit125', 'yusia', 'iLiss', 'いよたけ']
	},
	NBT: {
		id: 'newbie-team',
		name: '뉴비팀',
		region: 'APAC',
		players: ['FPThahyun', '시벌', '레고', '살찐족제비', '만두도둑', '리로', '공백']
	},
	KD: {
		id: "kokona's-drones",
		name: "Kokona's Drones",
		region: 'APAC',
		players: ['RiN林', 'Papyrus', 'Koalski', 'itsChun', 'Airii', 'Naphta', 'KuroTama39']
	},
	UKZ: {
		id: 'ukezara',
		name: '受け皿',
		region: 'APAC',
		players: [
			'Ken256',
			'暗闇の紅茶',
			'maimainoob',
			'kobo1010',
			'Viatorice',
			'カミリウイ',
			'Hiyokotte',
			'Cream6230'
		]
	},
	SSE: {
		id: 'supreme-shadow-emperor-hik-jinwoo',
		name: 'Supreme Shadow Emperor Hik-Jinwoo',
		region: 'APAC',
		players: ['Hinako', 'Su4y', 'はーいあなた', 'RoiPaetSip', 'Artツ', 'Hik', 'EmperorHikJinwoo']
	},
	KSQ: {
		id: 'ksq',
		name: 'KSQ',
		region: 'APAC',
		players: ['칠흑', 'Mejiro Ryan', '한월2', 'PGtexas', 'AKUKU']
	},
	KNO: {
		id: 'knotorious',
		name: 'Knotorious',
		region: 'APAC',
		players: [
			'swaegaepinoe',
			'redARA',
			'whattheskibidi',
			'DPTTDM',
			'AerixD',
			'MistaGojoooookun',
			'AeriMayBee'
		]
	},
	SDF: {
		id: 'shudoufu',
		name: 'しゅうどうふ',
		region: 'APAC',
		players: [
			'月神',
			'世間天使雨宮優子',
			'twitchWenli',
			'ChengCheng',
			'陌悠理',
			'bili会求风的鱼',
			'Asuaka'
		]
	},
	MMR: {
		id: 'mmr',
		name: 'MMR',
		region: 'CN',
		players: ['Fan', 'yzii', 'Rite', 'Xiaowu', 'ON']
	},
	SUS: {
		id: 'ss',
		name: 'Super Shuai',
		region: 'NA',
		players: ['lyr1c', 'Kariyu', 'BriBri', 'BTMC', 'Tuonto']
	},
	NG: {
		id: 'ng',
		name: 'Nova Guardians',
		region: 'APAC',
		players: ['Masuo', 'kept', 'SKJsa2', 'SKJShinka', 'SoVault']
	},
	TM: {
		id: 'tm',
		name: 'Twisted Minds',
		region: 'WA',
		players: [
			'Zimo',
			'ExiT',
			'Saint',
			// 'Gwzh',
			'GWZH',
			'Fr4nky'
		]
	}
};

// TODO: Add abbr
