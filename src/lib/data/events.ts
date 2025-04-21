import { teams, type Team } from '$lib/data/teams';
import type { Match } from '$lib/data/matches';
import type { LocalizedString } from '$lib/data/string';

export interface Stage {
	id: number;
	title: string; // Qualifier A1, EU Qualifier, Main Bracket, etc.
	stage: 'qualifier' | 'playoff' | 'group' | 'showmatch';
	format: 'single' | 'double' | 'swiss' | 'round-robin' | 'rematch';
	matches: Match[];
	structure: StageStructure;
}

export interface StageRound {
	id: number;
	type: 'quarterfinals' | 'semifinals' | 'final' | 'top16' | 'group' | 'thirdplace';
	title?: LocalizedString;
	parallelGroup?: number;
}

export interface StageNode {
	matchId: number;
	round: number; // e.g., 1 = quarterfinals
	dependsOn?: {
		matchId: number;
		outcome: 'winner' | 'loser';
	}[]; // match IDs that this match depends on
}

export interface StageStructure {
	rounds: StageRound[];
	nodes: StageNode[];
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
	stages: Stage[];

	//// matches: Match[];
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

export const events: Event[] = [
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
		stages: [
			{
				id: 3,
				title: 'Main Bracket', // Knockout Stage
				stage: 'playoff',
				format: 'single',
				matches: [
					// M1: TA vs DrA
					{
						id: 1,
						teams: [
							{
								team: teams['TA'],
								score: 0
							},
							{
								team: teams['DA'],
								score: 999
							}
						],
						battleOf: 'BO3',
						maps: []
					},

					// M2: TG vs GA
					{
						id: 2,
						teams: [
							{
								team: teams['TG'],
								score: 999
							},
							{
								team: teams['GA'],
								score: 0
							}
						],
						battleOf: 'BO3',
						maps: []
					},

					// M3: BP vs DRI
					{
						id: 3,
						teams: [
							{
								team: teams['BP'],
								score: 0
							},
							{
								team: teams['DRI'],
								score: 999
							}
						],
						battleOf: 'BO3',
						maps: []
					},

					// M4: GUGF vs GA
					{
						id: 4,
						teams: [
							{
								team: teams['GUGF'],
								score: 999
							},
							{
								team: teams['KRC'],
								score: 0
							}
						],
						battleOf: 'BO3',
						maps: []
					},

					// M5: DA vs. TG
					{
						id: 5,
						teams: [
							{
								team: teams['DA'],
								score: 0
							},
							{
								team: teams['TG'],
								score: 999
							}
						],
						battleOf: 'BO3',
						maps: []
					},

					// M6: DRI vs. GUGF
					{
						id: 6,
						teams: [
							{
								team: teams['DRI'],
								score: 0
							},
							{
								team: teams['GUGF'],
								score: 999
							}
						],
						battleOf: 'BO3',
						maps: []
					},

					// M7: TA vs GA
					{
						id: 7,
						teams: [
							{
								team: teams['TA'],
								score: 0
							},
							{
								team: teams['GA'],
								score: 999
							}
						],
						battleOf: 'BO3',
						maps: []
					},

					// M8: BP vs. KRC
					{
						id: 8,
						teams: [
							{
								team: teams['BP'],
								score: 0
							},
							{
								team: teams['KRC'],
								score: 999
							}
						],
						battleOf: 'BO3',
						maps: []
					},

					// M9: TG vs GUGF
					{
						id: 9,
						teams: [
							{
								team: teams['TG'],
								score: 999
							},
							{
								team: teams['GUGF'],
								score: 0
							}
						],
						battleOf: 'BO3',
						maps: []
					},

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

					// KRC vs GUGF
					{
						id: 12,
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
								teams: [teams['GUGF'], teams['KRC']],
								duration: 1518,
								result: [9, 6],
								winner: 1,
								scores: [
									[
										{
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
											player: '箱子箱',
											characters: ['Lawine', 'Fuschia'],
											score: 188,
											damageScore: 126,
											kills: 6,
											knocks: 8,
											deaths: 9,
											assists: 26,
											damage: 3190
										},
										{
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
											player: 'FOXY1Yukino',
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
								teams: [teams['GUGF'], teams['KRC']],
								duration: 1396,
								result: [9, 5],
								winner: 1,
								scores: [
									[
										{
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
											player: '箱子箱',
											characters: ['Fuschia', 'Celestia'],
											score: 203,
											damageScore: 162,
											kills: 15,
											knocks: 14,
											deaths: 9,
											assists: 15,
											damage: 3185
										},
										{
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
											player: 'FOXY1Yukino',
											characters: ['Ming', 'Fuschia'],
											score: 160,
											damageScore: 135,
											kills: 7,
											knocks: 7,
											deaths: 11,
											assists: 14,
											damage: 3335
										},
										{
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

					// TG vs GUGF
					{
						id: 16,
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
								result: [11, 9],
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
								result: [9, 7],
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
				],
				structure: {
					rounds: [
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
						}
					],
					nodes: [
						{
							matchId: 1,
							round: 1
						},
						{
							matchId: 2,
							round: 1
						},
						{
							matchId: 5,
							round: 2,
							dependsOn: [
								{ matchId: 1, outcome: 'winner' },
								{ matchId: 2, outcome: 'winner' }
							]
						},
						{
							matchId: 3,
							round: 1
						},
						{
							matchId: 4,
							round: 1
						},
						{
							matchId: 6,
							round: 2,
							dependsOn: [
								{ matchId: 3, outcome: 'winner' },
								{ matchId: 4, outcome: 'winner' }
							]
						},

						{
							matchId: 9,
							round: 3,
							dependsOn: [
								{ matchId: 5, outcome: 'winner' },
								{ matchId: 6, outcome: 'winner' }
							]
						},

						{
							matchId: 7,
							round: 1
						},
						{
							matchId: 8,
							round: 1
						},

						{
							matchId: 10,
							round: 1
						},
						{
							matchId: 11,
							round: 2
						},
						{
							matchId: 12,
							round: 2
						},
						{
							matchId: 16,
							round: 3,
							dependsOn: [{ matchId: 12, outcome: 'winner' }]
						}
					]
				}
			}
		],
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
		stages: [],
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
			logo: 'https://static-cdn.jtvnw.net/jtv_user_pictures/ba65e84b-8314-46e2-8b9a-becd794fcd48-profile_image-70x70.png',
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

		stages: [
			// {
			// 	id: 1,
			// 	title: 'Qualifiers',
			// 	stage: 'qualifier',
			// 	format: 'swiss',
			// 	matches: []
			// },
			{
				id: 2,
				title: 'Main Bracket',
				stage: 'playoff',
				format: 'single',
				matches: [
					{
						id: 10001,
						teams: [
							{ team: teams['TG'], score: 2 },
							{ team: teams['MA'], score: 0 }
						],
						battleOf: 'BO3',
						maps: []
					},
					{
						id: 10002,
						teams: [
							{ team: teams['HC'], score: 1 },
							{ team: teams['DRI'], score: 2 }
						],
						battleOf: 'BO3',
						maps: []
					},
					{
						id: 10003,
						teams: [
							{ team: teams['ML'], score: 2 },
							{ team: teams['OC'], score: 1 }
						],
						battleOf: 'BO3',
						maps: []
					},
					{
						id: 10004,
						teams: [
							{ team: teams['XKAM'], score: 0 },
							{ team: teams['DA'], score: 2 }
						],
						battleOf: 'BO3',
						maps: []
					},
					{
						id: 10005,
						teams: [
							{ team: teams['TG'], score: 2 },
							{ team: teams['DRI'], score: 0 }
						],
						battleOf: 'BO3',
						maps: []
					},
					{
						id: 10006,
						teams: [
							{ team: teams['ML'], score: 2 },
							{ team: teams['DA'], score: 0 }
						],
						battleOf: 'BO3',
						maps: []
					},
					{
						id: 10007,
						teams: [
							{ team: teams['TG'], score: 2 },
							{ team: teams['ML'], score: 0 }
						],
						battleOf: 'BO3',
						maps: []
					},
					{
						id: 10008,
						teams: [
							{ team: teams['DRI'], score: 0 },
							{ team: teams['DA'], score: 2 }
						],
						battleOf: 'BO3',
						maps: []
					}
				],
				structure: {
					rounds: [
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
							type: 'thirdplace',
							parallelGroup: 3
						}
					],
					nodes: [
						// QFs
						{ matchId: 10001, round: 1 },
						{ matchId: 10002, round: 1 },
						{ matchId: 10003, round: 1 },
						{ matchId: 10004, round: 1 },

						// SFs
						{
							matchId: 10005,
							round: 2,
							dependsOn: [
								{ matchId: 10001, outcome: 'winner' },
								{ matchId: 10002, outcome: 'winner' }
							]
						},
						{
							matchId: 10006,
							round: 2,
							dependsOn: [
								{ matchId: 10003, outcome: 'winner' },
								{ matchId: 10004, outcome: 'winner' }
							]
						},

						// Final
						{
							matchId: 10007,
							round: 3,
							dependsOn: [
								{ matchId: 10005, outcome: 'winner' },
								{ matchId: 10006, outcome: 'winner' }
							]
						},

						// Third-place match
						{
							matchId: 10008,
							round: 4,
							dependsOn: [
								{ matchId: 10005, outcome: 'loser' },
								{ matchId: 10006, outcome: 'loser' }
							]
						}
					]
				}
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
