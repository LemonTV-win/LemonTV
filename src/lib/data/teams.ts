import { players, type Player } from './players';
import { type Region } from './region';

export interface Team {
	name: string;
	logo?: string;
	region?: Region;
	players?: Player[]; // active roaster
	substitutes?: Player[]; // bench
	former?: Player[]; // former players
}

export const teams: Record<string, Team> = {
	TG: {
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
	XKAM: {
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
	},
	CRCC: {
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
	NBT: {
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
