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

export interface LegacyEventResult {
	rank: number;
	team: string; // team abbr
	prizes: EventPrize[];
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

export interface LegacyEventParticipant {
	team: string; // team abbr
	main: string[];
	reserve: string[];
	coach: string[];
}

export interface EventParticipant {
	legacy: false;
	team: Team;
	main: Player[];
	reserve: Player[];
	coach: Player[];
}

export function isLegacyEventParticipant(
	participant: EventParticipant | LegacyEventParticipant
): participant is LegacyEventParticipant {
	return !('legacy' in participant && participant.legacy === false);
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
	participants: (EventParticipant | LegacyEventParticipant)[];
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
	results?: LegacyEventResult[] | EventResult[];
}

export const events: Event[] = [
	{
		id: crypto.randomUUID(),
		slug: 'mmcs1',
		name: 'Mighty Meow Cup Season 1',
		official: false,
		server: 'strinova',
		format: 'online',
		image: 'https://i.ytimg.com/vi/j7Nt3gGzLkg/hq720.jpg',
		status: 'finished',
		region: 'Global',
		organizers: [
			{
				id: crypto.randomUUID(),
				name: 'BriBri',
				logo: 'https://pbs.twimg.com/profile_images/1863502296023531520/ALjMfroI_400x400.jpg',
				url: 'https://x.com/BriBri_TSG',
				slug: 'bribri'
			}
		],
		stages: [
			{
				id: 3,
				title: 'Main Bracket', // Knockout Stage
				stage: 'playoff',
				format: 'single',
				matches: [
					// Top16: GUGF vs GA
					{
						id: 'legacy-1001',
						teams: [
							{
								team: 'GUGF',
								score: 2,
								roaster: ['JY10137', 'BOXCAT', '羽生翼', 'MIZU', 'ChengCheng'] // TODO: Fix this
							},
							{
								team: 'GA',
								score: 0,
								roaster: ['iYu', 'cherry', 'Saya', 'Actyuki', 'Jav']
							}
						],
						battleOf: 'BO3',
						maps: [
							{ map: 'cauchy_district', pickerId: 1, pickedSide: 'Attack' },
							{ map: 'area_88', pickerId: 2, pickedSide: 'Defense' },
							{ map: 'space_lab', pickerId: 2, pickedSide: 'Defense' }
						],
						vod: 'https://youtu.be/gEPv96BlZRc?t=1299',
						games: [
							{
								id: 1,
								map: 'cauchy_district',
								teams: ['GUGF', 'GA'],
								duration: 1830,
								result: [9, 5],
								winner: 1,
								scores: [
									[
										{
											accountId: 2017921,
											player: 'iYu',
											characters: ['Fuchsia', 'Ming'],
											score: 204,
											damageScore: 172,
											kills: 10,
											knocks: 13,
											deaths: 10,
											assists: 11,
											damage: 3812
										},
										{
											accountId: 372165,
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
											accountId: 2035970,
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
											accountId: 2002930,
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
											accountId: 2001148,
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
											accountId: 2340207,
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
											accountId: 2988260,
											player: '箱子箱',
											characters: ['Lawine', 'Fuchsia'],
											score: 232,
											damageScore: 164,
											kills: 11,
											knocks: 14,
											deaths: 6,
											assists: 29,
											damage: 3462
										},
										{
											accountId: 2352901,
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
											accountId: 2108435,
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
											accountId: 2047299,
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
								teams: ['GUGF', 'GA'],
								duration: 1830,
								result: [9, 4],
								winner: 1,
								scores: [
									[
										{
											accountId: 2047299,
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
											accountId: 2988260,
											player: '箱子箱',
											characters: ['Fuchsia', 'Michele'],
											score: 252,
											damageScore: 189,
											kills: 12,
											knocks: 12,
											deaths: 4,
											assists: 23,
											damage: 3793
										},
										{
											accountId: 2352901,
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
											accountId: 2047299,
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
											accountId: 2001148,
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
											accountId: 372165,
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
											accountId: 2002930,
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
											accountId: 2035970,
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
											accountId: 2017921,
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
											accountId: 2001148,
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

					// M1: TA vs DrA
					{
						id: 'legacy-1',
						teams: [
							{
								team: 'TA',
								score: 0
							},
							{
								team: 'DA',
								score: 999
							}
						],
						battleOf: 'BO3',
						maps: []
					},

					// M2: TG vs GA
					{
						id: 'legacy-2',
						teams: [
							{
								team: 'TG',
								score: 999
							},
							{
								team: 'GA',
								score: 0
							}
						],
						battleOf: 'BO3',
						maps: []
					},

					// M3: BP vs DRI
					{
						id: 'legacy-3',
						teams: [
							{
								team: 'BP',
								score: 0
							},
							{
								team: 'DRI',
								score: 999
							}
						],
						battleOf: 'BO3',
						maps: []
					},

					// M4: GUGF vs GA
					{
						id: 'legacy-4',
						teams: [
							{
								team: 'GUGF',
								score: 999
							},
							{
								team: 'KRC',
								score: 0
							}
						],
						battleOf: 'BO3',
						maps: []
					},

					// M5: DA vs. TG
					{
						id: 'legacy-5',
						teams: [
							{
								team: 'DA',
								score: 0
							},
							{
								team: 'TG',
								score: 999
							}
						],
						battleOf: 'BO3',
						maps: []
					},

					// M6: DRI vs. GUGF
					{
						id: 'legacy-6',
						teams: [
							{
								team: 'DRI',
								score: 0
							},
							{
								team: 'GUGF',
								score: 999
							}
						],
						battleOf: 'BO3',
						maps: []
					},

					// M7: TA vs GA
					{
						id: 'legacy-7',
						teams: [
							{
								team: 'TA',
								score: 0
							},
							{
								team: 'GA',
								score: 999
							}
						],
						battleOf: 'BO3',
						maps: []
					},

					// M8: BP vs. KRC
					{
						id: 'legacy-8',
						teams: [
							{
								team: 'BP',
								score: 0
							},
							{
								team: 'KRC',
								score: 999
							}
						],
						battleOf: 'BO3',
						maps: []
					},

					// M9: TG vs GUGF
					{
						id: 'legacy-9',
						teams: [
							{
								team: 'TG',
								score: 999
							},
							{
								team: 'GUGF',
								score: 0
							}
						],
						battleOf: 'BO3',
						maps: []
					},

					// M10: Drillas vs. N/A (skipped phantom match, should be Drillas Academy but forfeited/walkover or something)

					// M11: Drillas Academy vs. KITTEN ROLL CALL
					// TODO:
					{
						id: 'legacy-11',
						teams: [
							{
								team: 'DA',
								score: 0
							},
							{
								team: 'KRC',
								score: 999
							}
						],
						battleOf: 'BO3',
						maps: []
					},

					// M12: DRI vs KRC
					{
						id: 'legacy-12',
						teams: [
							{
								team: 'DRI',
								score: 2
							},
							{
								team: 'KRC',
								score: 0
							}
						],
						battleOf: 'BO3',
						maps: [
							{ map: 'space_lab', pickerId: 1, pickedSide: 'Attack' },
							{ map: 'cosmite', pickerId: 2, pickedSide: 'Defense' },
							{ map: 'cauchy_district', pickerId: 2, pickedSide: 'Attack' }
						],
						vod: 'https://youtu.be/j7Nt3gGzLkg?t=1565',
						games: [
							{
								id: 1,
								map: 'space_lab',
								teams: ['DRI', 'KRC'],
								duration: 1353,
								result: [3, 9],
								winner: 2,
								scores: [
									[
										{
											accountId: 2007805,
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
											accountId: 2024432,
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
											accountId: 2000837,
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
											accountId: 2153306,
											player: 'FOX1Yukino',
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
											accountId: 2014735,
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
											accountId: 2003112,
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
											accountId: 2002886,
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
											accountId: 2003583,
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
											accountId: 2027849,
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
											accountId: 2088110,
											player: 'Vampire',
											characters: ['Reiichi', 'Fuchsia'],
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
								teams: ['DRI', 'KRC'],
								duration: 1604,
								result: [5, 9],
								winner: 2,
								scores: [
									[
										{
											accountId: 2002886,
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
											accountId: 2003583,
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
											accountId: 2088110,
											player: 'Vampire',
											characters: ['Reiichi', 'Fuchsia'],
											score: 109,
											damageScore: 80,
											kills: 6,
											knocks: 6,
											deaths: 12,
											assists: 13,
											damage: 1691
										},
										{
											accountId: 2003112,
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
											accountId: 2002886,
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
											accountId: 2007805,
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
											accountId: 2024432,
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
											accountId: 2000837,
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
											accountId: 2153306,
											player: 'FOX1Yukino',
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
											accountId: 2014735,
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

					// M13: KRC vs GUGF
					{
						id: 'legacy-13',
						teams: [
							{
								team: 'GUGF',
								score: 2,
								roaster: ['JY10137', 'BOXCAT', '羽生翼', 'MIZU', 'ChengCheng', '逍遥sama'] // TODO: Fix this
							},
							{
								team: 'KRC',
								score: 0,
								roaster: ['xohfiy', 'HonkWith4ks', 'FOX1Yukino', 'numOneZKFan', 'Kariyu'] // TODO: Fix this
							}
						],
						battleOf: 'BO3',
						maps: [
							{ map: 'space_lab', pickerId: 1, pickedSide: 'Attack' },
							{ map: 'windy_town', pickerId: 2, pickedSide: 'Attack' },
							{ map: 'cauchy_district', pickerId: 2, pickedSide: 'Attack' }
						],
						vod: 'https://youtu.be/j7Nt3gGzLkg?t=8463',
						games: [
							{
								id: 1,
								map: 'space_lab',
								teams: ['GUGF', 'KRC'],
								duration: 1518,
								result: [9, 6],
								winner: 1,
								scores: [
									[
										{
											accountId: 2413674,
											player: '丨結城さくな丨',
											characters: ['Ming', 'Flavia'],
											score: 244,
											damageScore: 206,
											kills: 16,
											knocks: 17,
											deaths: 7,
											assists: 19,
											damage: 4737
										},
										{
											accountId: 2340207,
											player: 'JY10137',
											characters: ['Meredith', 'Celestia'],
											score: 206,
											damageScore: 163,
											kills: 14,
											knocks: 15,
											deaths: 6,
											assists: 22,
											damage: 3615
										},
										{
											accountId: 2047299,
											player: 'ぺこどん',
											characters: ['Celestia', 'Michele'],
											score: 194,
											damageScore: 140,
											kills: 9,
											knocks: 11,
											deaths: 6,
											assists: 15,
											damage: 3368
										},
										{
											accountId: 2988260,
											player: '箱子箱',
											characters: ['Lawine', 'Fuchsia'],
											score: 188,
											damageScore: 126,
											kills: 6,
											knocks: 8,
											deaths: 9,
											assists: 26,
											damage: 3190
										},
										{
											accountId: 2352901,
											player: 'twitch一77427',
											characters: ['Kanami', 'Kokona'],
											score: 160,
											damageScore: 99,
											kills: 4,
											knocks: 4,
											deaths: 8,
											assists: 25,
											damage: 2663
										}
									],
									[
										{
											accountId: 2007805,
											player: 'xohfiy',
											characters: ['Michele', 'Lawine'],
											score: 207,
											damageScore: 167,
											kills: 9,
											knocks: 14,
											deaths: 9,
											assists: 15,
											damage: 4094
										},
										{
											accountId: 2024432,
											player: 'HonkWith4ks',
											characters: ['Yugiri', 'Reiichi'],
											score: 145,
											damageScore: 127,
											kills: 8,
											knocks: 9,
											deaths: 9,
											assists: 10,
											damage: 3131
										},
										{
											accountId: 2003112,
											player: 'FOX1Yukino',
											characters: ['Nobunaga', 'Ming'],
											score: 135,
											damageScore: 120,
											kills: 7,
											knocks: 7,
											deaths: 10,
											assists: 13,
											damage: 2999
										},
										{
											accountId: 2000837,
											player: 'Kariyu',
											characters: ['Audrey', 'Celestia'],
											score: 126,
											damageScore: 103,
											kills: 6,
											knocks: 7,
											deaths: 11,
											assists: 10,
											damage: 2553
										},
										{
											accountId: 2014735,
											player: 'numOneZKFan',
											characters: ['Flavia', 'Eika'],
											score: 120,
											damageScore: 105,
											kills: 6,
											knocks: 6,
											deaths: 10,
											assists: 8,
											damage: 2592
										}
									]
								]
							},
							{
								id: 2,
								map: 'windy_town',
								teams: ['GUGF', 'KRC'],
								duration: 1396,
								result: [9, 5],
								winner: 1,
								scores: [
									[
										{
											accountId: 2340207,
											player: '丨結城さくな丨',
											characters: ['Flavia', 'Ming'],
											score: 225,
											damageScore: 184,
											kills: 10,
											knocks: 12,
											deaths: 5,
											assists: 22,
											damage: 4322
										},
										{
											accountId: 2352901,
											player: 'twitch一77427',
											characters: ['Kokona', 'Kanami'],
											score: 221,
											damageScore: 155,
											kills: 12,
											knocks: 12,
											deaths: 5,
											assists: 25,
											damage: 3222
										},
										{
											accountId: 2988260,
											player: '箱子箱',
											characters: ['Fuchsia', 'Celestia'],
											score: 203,
											damageScore: 162,
											kills: 15,
											knocks: 14,
											deaths: 9,
											assists: 15,
											damage: 3185
										},
										{
											accountId: 2047299,
											player: 'ぺこどん',
											characters: ['Michele', 'Lawine'],
											score: 180,
											damageScore: 134,
											kills: 8,
											knocks: 7,
											deaths: 9,
											assists: 20,
											damage: 3035
										},
										{
											accountId: 2340207,
											player: 'JY10137',
											characters: ['Celestia', 'Reiichi'],
											score: 175,
											damageScore: 146,
											kills: 9,
											knocks: 11,
											deaths: 6,
											assists: 14,
											damage: 3239
										}
									],
									[
										{
											accountId: 2007805,
											player: 'xohfiy',
											characters: ['Lawine', 'Bai Mo'],
											score: 215,
											damageScore: 166,
											kills: 9,
											knocks: 12,
											deaths: 12,
											assists: 12,
											damage: 3742
										},
										{
											accountId: 2000837,
											player: 'Kariyu',
											characters: ['Meredith', 'Michele'],
											score: 164,
											damageScore: 118,
											kills: 4,
											knocks: 9,
											deaths: 11,
											assists: 16,
											damage: 2833
										},
										{
											accountId: 2003112,
											player: 'FOX1Yukino',
											characters: ['Ming', 'Fuchsia'],
											score: 160,
											damageScore: 135,
											kills: 7,
											knocks: 7,
											deaths: 11,
											assists: 14,
											damage: 3335
										},
										{
											accountId: 2024432,
											player: 'HonkWith4ks',
											characters: ['Reiichi', 'Yugiri'],
											score: 144,
											damageScore: 102,
											kills: 6,
											knocks: 10,
											deaths: 10,
											assists: 3,
											damage: 2567
										},
										{
											accountId: 2014735,
											player: 'numOneZKFan',
											characters: ['Eika', 'Flavia'],
											score: 142,
											damageScore: 122,
											kills: 8,
											knocks: 8,
											deaths: 10,
											assists: 7,
											damage: 2721
										}
									]
								]
							}
						]
					},

					// M14: TG vs GUGF ???

					// M15: TG vs GUGF
					{
						id: 'legacy-15',
						teams: [
							{
								team: 'TG',
								score: 2,
								roaster: ['Ascinei', 'Blexiss', 'gengu', 'grustleking', 'frostyZK']
							},
							{
								team: 'GUGF',
								score: 0,
								roaster: ['瑾玥', '逍遥sama', '羽生翼', 'ぺこどん', 'BOXCAT']
							}
						],
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
								teams: ['TG', 'GUGF'],
								duration: 1830,
								result: [11, 9],
								winner: 1,
								scores: [
									[
										{
											accountId: 2003513,
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
											accountId: 2001148,
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
											accountId: 2005346,
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
											accountId: 2003944,
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
											accountId: 2947836,
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
											accountId: 2413674,
											player: '丨結城さくな丨',
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
											accountId: 2047299,
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
											accountId: 2340207,
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
											accountId: 2352901,
											player: 'twitch一77427',
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
											accountId: 2988260,
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
								teams: ['TG', 'GUGF'],
								duration: 1830,
								result: [9, 7],
								scores: [
									[
										{
											accountId: 2003513,
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
											accountId: 2947836,
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
											accountId: 2005346,
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
											accountId: 2001148,
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
											accountId: 2003944,
											player: 'grustleking',
											characters: ['Celestia', 'Fuchsia'],
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
											accountId: 2352901,
											player: 'twitch一77427',
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
											accountId: 2413674,
											player: '丨結城さくな丨',
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
											accountId: 2988260,
											player: '箱子箱',
											characters: ['Fuchsia', 'Lawine'],
											score: 182,
											damageScore: 151,
											kills: 12,
											knocks: 14,
											deaths: 12,
											assists: 8,
											damage: 3709
										},
										{
											accountId: 2340207,
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
											accountId: 2047299,
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
				],
				structure: {
					rounds: [
						{
							id: 0,
							type: 'top16'
						},
						{
							id: 1,
							type: 'quarterfinals'
						},
						{
							id: 2,
							type: 'semifinals'
						},
						{
							id: 3,
							type: 'final'
						},
						{
							id: 4,
							type: 'lower',
							parallelGroup: 1
						},
						{
							id: 5,
							type: 'lower',
							parallelGroup: 2
						},
						{
							id: 6,
							type: 'lower',
							parallelGroup: 3
						},
						{
							id: 7,
							type: 'lower'
							// parallelGroup: 3
						},
						{
							id: 8,
							type: 'grandfinal'
						}
					],
					nodes: [
						{
							matchId: 'legacy-1001',
							round: 0,
							order: 0
						},
						{
							matchId: 'legacy-1',
							round: 1,
							order: 0
						},
						{
							matchId: 'legacy-2',
							round: 1,
							order: 1
						},
						{
							matchId: 'legacy-5',
							round: 2,
							order: 0,
							dependsOn: [
								{ matchId: 'legacy-1', outcome: 'winner' },
								{ matchId: 'legacy-2', outcome: 'winner' }
							]
						},
						{
							matchId: 'legacy-3',
							round: 1,
							order: 2
						},
						{
							matchId: 'legacy-4',
							round: 1,
							order: 3
						},
						{
							matchId: 'legacy-6',
							round: 2,
							order: 1,
							dependsOn: [
								{ matchId: 'legacy-3', outcome: 'winner' },
								{ matchId: 'legacy-4', outcome: 'winner' }
							]
						},
						{
							matchId: 'legacy-9',
							round: 3,
							order: 0,
							dependsOn: [
								{ matchId: 'legacy-5', outcome: 'winner' },
								{ matchId: 'legacy-6', outcome: 'winner' }
							]
						},
						{
							matchId: 'legacy-7',
							round: 4,
							order: 0
						},
						{
							matchId: 'legacy-8',
							round: 4,
							order: 1
						},
						{
							matchId: 'legacy-11',
							round: 5,
							order: 0,
							dependsOn: [
								{ matchId: 'legacy-8', outcome: 'winner' },
								{
									matchId: 'legacy-5',
									outcome: 'loser'
								}
							]
						},
						{
							matchId: 'legacy-12',
							round: 6,
							order: 0,
							dependsOn: [
								{ matchId: 'legacy-6', outcome: 'loser' },
								{ matchId: 'legacy-11', outcome: 'winner' }
							]
						},
						{
							matchId: 'legacy-13',
							round: 7,
							order: 0,
							dependsOn: [
								{ matchId: 'legacy-9', outcome: 'loser' },
								{ matchId: 'legacy-12', outcome: 'winner' }
							]
						},
						{
							matchId: 'legacy-15',
							round: 8,
							order: 0,
							dependsOn: [
								{ matchId: 'legacy-13', outcome: 'winner' },
								{ matchId: 'legacy-9', outcome: 'winner' }
							]
						}
					]
				}
			}
		],
		capacity: 16,
		date: '2025-02-01',
		participants: [
			// TODO: Add roaster at the time
			{
				team: 'TG',
				main: ['frostyZK', 'grustleking', 'gengu', 'Ascinei', 'Blexiss'],
				reserve: ['uno'],
				coach: []
			},
			{
				team: 'GUGF',
				main: ['JY10137', '逍遥sama', '羽生翼', 'MIZU', 'BOXCAT'],
				reserve: ['Chtho1ly', 'ChengCheng'],
				coach: []
			},
			{
				team: 'KRC',
				main: ['xohfiy', 'Kariyu', 'FOX1Yukino', 'HonkWith4ks', 'numOneZKFan'],
				reserve: [],
				coach: []
			},
			{
				team: 'DRI',
				main: ['Creepz', 'Poison', 'Moozor', 'Vampire', 'GWZH'],
				reserve: [],
				coach: []
			},
			{
				team: 'GA',
				main: ['cherry', 'iYu', 'Actyuki', 'Saya', 'Jav'],
				reserve: ['SilliestOfThreat', 'Actyuki丶Student'],
				coach: []
			},
			{
				team: 'DA',
				main: ['Mansek', 'Scylla', 'sinna', 'ARGHGHGHGHGHHGHG', 'will'],
				reserve: ['Voxy'],
				coach: []
			}
		]
	}
];
