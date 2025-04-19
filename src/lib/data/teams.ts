import { players, type Player } from './players';
import { type Region } from './region';

export interface Team {
	name: string;
	logo?: string;
	region?: Region;
	players?: Player[];
	substitutes?: Player[];
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

// TODO: Add abbr

export const origamiTeams: Record<string, Team> = {
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

// TG WK ML OC DA YU YG HC GS DR KK LD MA SF
