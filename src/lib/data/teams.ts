import { players, type Player } from './players';
import { type Region } from './game';

export interface Team {
	id: string;
	name: string;
	logo?: string;
	region?: Region;
	players?: Player[]; // active roaster
	substitutes?: Player[]; // bench
	former?: Player[]; // former players
}

export const teams: Record<string, Team> = {
	TG: {
		id: 'the-grustlers',
		name: 'The Grustlers',
		region: 'NA',
		players: [
			players['frostyZK'],
			players['grustleking'],
			players['gengu'],
			players['Ascinei'],
			players['Blexiss'],
			players['uno']
		]
	},
	GUGF: {
		id: 'gugf',
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
		id: 'kitten-roll-call',
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
		id: 'drillas',
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
		id: 'gacha-addicts',
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
	},
	WK: {
		id: 'wilden-kerle',
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
		id: 'meowliora',
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
		id: 'october',
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
		id: 'drillas-academy',
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
		id: 'yugifeetlover',
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
		id: "yuri's-gang",
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
		id: 'hopecore',
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
		id: 'gweah-shindago',
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
	XKAM: {
		id: 'xiao-ke-ai-men',
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
	LDP: {
		id: 'long-distance-pals',
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
		id: 'michele-armpits',
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
		id: 'stringifries',
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
	},
	CRCC: {
		id: 'com-rang-chay-chao',
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
	AFT: {
		id: 'all-for-tada',
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
	GCSC: {
		id: 'ga-chien-so-tay',
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
	SI: {
		id: 'skill-issues',
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
	BP: {
		id: 'become-paper',
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
	SKS: {
		id: 'shigure-kira-saikyou',
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
	KGH: {
		id: 'kanojo-ga-hoshi',
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
	CW: {
		id: 'crywolf',
		name: 'CryWolf', // (new Strinoway)
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
	OTG: {
		id: 'otogenova',
		name: 'おとげのぅ゙ぁ',
		region: 'APAC',
		players: [
			players['0nesyo'],
			players['begonia'],
			players['dore52x'],
			players['visucuit125'],
			players['yusia'],
			players['iLiss'],
			players['いよたけ']
		]
	},
	NBT: {
		id: 'newbie-team',
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
	KD: {
		id: "kokona's-drones",
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
	UKZ: {
		id: 'ukezara',
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
	SSE: {
		id: 'supreme-shadow-emperor-hik-jinwoo',
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
	KSQ: {
		id: 'ksq',
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
	KNO: {
		id: 'knotorious',
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
	SDF: {
		id: 'shudoufu',
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
};

// TODO: Add abbr
