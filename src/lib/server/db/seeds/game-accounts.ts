import { PLAYERS } from './players';

// Generate game accounts for players
// Each player can have multiple game accounts across different servers
export const GAME_ACCOUNTS = [
	// Player 1 - Multiple accounts across servers
	{
		server: 'Strinova' as const,
		accountId: 1001,
		playerId: PLAYERS[0].id, // Player 1
		currentName: 'Player1_Strinova',
		region: 'NA'
	},
	{
		server: 'CalabiYau' as const,
		accountId: 2001,
		playerId: PLAYERS[0].id, // Player 1
		currentName: 'Player1_Calabi',
		region: 'NA'
	},
	// Player 2 - Single account
	{
		server: 'Strinova' as const,
		accountId: 1002,
		playerId: PLAYERS[1].id, // Player 2
		currentName: 'Player2_Main',
		region: 'NA'
	},
	// Player 3 - Multiple accounts
	{
		server: 'Strinova' as const,
		accountId: 1003,
		playerId: PLAYERS[2].id, // Player 3
		currentName: 'Player3_Strinova',
		region: 'EU'
	},
	{
		server: 'CalabiYau' as const,
		accountId: 2003,
		playerId: PLAYERS[2].id, // Player 3
		currentName: 'Player3_Calabi',
		region: 'EU'
	},
	// Player 4 - Korean player
	{
		server: 'Strinova' as const,
		accountId: 1004,
		playerId: PLAYERS[3].id, // Player 4
		currentName: 'Player4_KR',
		region: 'KR'
	},
	// Player 5 - European player
	{
		server: 'Strinova' as const,
		accountId: 1005,
		playerId: PLAYERS[4].id, // Player 5
		currentName: 'Player5_EU',
		region: 'EU'
	},
	// Player 6 - Multiple accounts
	{
		server: 'Strinova' as const,
		accountId: 1006,
		playerId: PLAYERS[5].id, // Player 6
		currentName: 'Player6_Strinova',
		region: 'NA'
	},
	{
		server: 'CalabiYau' as const,
		accountId: 2006,
		playerId: PLAYERS[5].id, // Player 6
		currentName: 'Player6_Calabi',
		region: 'NA'
	},
	// Player 7 - Canadian player
	{
		server: 'Strinova' as const,
		accountId: 1007,
		playerId: PLAYERS[6].id, // Player 7
		currentName: 'Player7_CA',
		region: 'NA'
	},
	// Player 8 - Korean player
	{
		server: 'Strinova' as const,
		accountId: 1008,
		playerId: PLAYERS[7].id, // Player 8
		currentName: 'Player8_KR',
		region: 'KR'
	},
	// Player 9 - Korean player
	{
		server: 'Strinova' as const,
		accountId: 1009,
		playerId: PLAYERS[8].id, // Player 9
		currentName: 'Player9_KR',
		region: 'KR'
	},
	// Player 10 - Japanese player
	{
		server: 'Strinova' as const,
		accountId: 1010,
		playerId: PLAYERS[9].id, // Player 10
		currentName: 'Player10_JP',
		region: 'JP'
	},
	// Player 11 - Korean player
	{
		server: 'Strinova' as const,
		accountId: 1011,
		playerId: PLAYERS[10].id, // Player 11
		currentName: 'Player11_KR',
		region: 'KR'
	},
	// Player 12 - Taiwanese player
	{
		server: 'Strinova' as const,
		accountId: 1012,
		playerId: PLAYERS[11].id, // Player 12
		currentName: 'Player12_TW',
		region: 'TW'
	},
	// Player 13 - Korean player
	{
		server: 'Strinova' as const,
		accountId: 1013,
		playerId: PLAYERS[12].id, // Player 13
		currentName: 'Player13_KR',
		region: 'KR'
	},
	// Player 14 - Japanese player
	{
		server: 'Strinova' as const,
		accountId: 1014,
		playerId: PLAYERS[13].id, // Player 14
		currentName: 'Player14_JP',
		region: 'JP'
	},
	// Player 15 - German player
	{
		server: 'Strinova' as const,
		accountId: 1015,
		playerId: PLAYERS[14].id, // Player 15
		currentName: 'Player15_DE',
		region: 'EU'
	},
	// Player 16 - German player
	{
		server: 'Strinova' as const,
		accountId: 1016,
		playerId: PLAYERS[15].id, // Player 16
		currentName: 'Player16_DE',
		region: 'EU'
	},
	// Player 17 - German player
	{
		server: 'Strinova' as const,
		accountId: 1017,
		playerId: PLAYERS[16].id, // Player 17
		currentName: 'Player17_DE',
		region: 'EU'
	},
	// Player 18 - German player
	{
		server: 'Strinova' as const,
		accountId: 1018,
		playerId: PLAYERS[17].id, // Player 18
		currentName: 'Player18_DE',
		region: 'EU'
	},
	// Player 19 - German player
	{
		server: 'Strinova' as const,
		accountId: 1019,
		playerId: PLAYERS[18].id, // Player 19
		currentName: 'Player19_DE',
		region: 'EU'
	},
	// Player 20 - German player
	{
		server: 'Strinova' as const,
		accountId: 1020,
		playerId: PLAYERS[19].id, // Player 20
		currentName: 'Player20_DE',
		region: 'EU'
	},
	// Player 21 - German player
	{
		server: 'Strinova' as const,
		accountId: 1021,
		playerId: PLAYERS[20].id, // Player 21
		currentName: 'Player21_DE',
		region: 'EU'
	},
	// Player 22 - German player
	{
		server: 'Strinova' as const,
		accountId: 1022,
		playerId: PLAYERS[21].id, // Player 22
		currentName: 'Player22_DE',
		region: 'EU'
	},
	// Player 23 - Chinese player
	{
		server: 'Strinova' as const,
		accountId: 1023,
		playerId: PLAYERS[22].id, // Player 23
		currentName: 'Player23_CN',
		region: 'CN'
	},
	// Player 24 - Chinese player
	{
		server: 'Strinova' as const,
		accountId: 1024,
		playerId: PLAYERS[23].id, // Player 24
		currentName: 'Player24_CN',
		region: 'CN'
	},
	// Player 25 - Chinese player
	{
		server: 'Strinova' as const,
		accountId: 1025,
		playerId: PLAYERS[24].id, // Player 25
		currentName: 'Player25_CN',
		region: 'CN'
	},
	// Player 26 - Chinese player
	{
		server: 'Strinova' as const,
		accountId: 1026,
		playerId: PLAYERS[25].id, // Player 26
		currentName: 'Player26_CN',
		region: 'CN'
	},
	// Player 27 - Chinese player
	{
		server: 'Strinova' as const,
		accountId: 1027,
		playerId: PLAYERS[26].id, // Player 27
		currentName: 'Player27_CN',
		region: 'CN'
	},
	// Player 28 - Chinese player
	{
		server: 'Strinova' as const,
		accountId: 1028,
		playerId: PLAYERS[27].id, // Player 28
		currentName: 'Player28_CN',
		region: 'CN'
	},
	// Player 29 - Chinese player
	{
		server: 'Strinova' as const,
		accountId: 1029,
		playerId: PLAYERS[28].id, // Player 29
		currentName: 'Player29_CN',
		region: 'CN'
	},
	// Player 30 - Chinese player
	{
		server: 'Strinova' as const,
		accountId: 1030,
		playerId: PLAYERS[29].id, // Player 30
		currentName: 'Player30_CN',
		region: 'CN'
	},
	// Player 31 - Chinese player
	{
		server: 'Strinova' as const,
		accountId: 1031,
		playerId: PLAYERS[30].id, // Player 31
		currentName: 'Player31_CN',
		region: 'CN'
	},
	// Player 32 - Chinese player
	{
		server: 'Strinova' as const,
		accountId: 1032,
		playerId: PLAYERS[31].id, // Player 32
		currentName: 'Player32_CN',
		region: 'CN'
	},
	// Player 33 - Chinese player
	{
		server: 'Strinova' as const,
		accountId: 1033,
		playerId: PLAYERS[32].id, // Player 33
		currentName: 'Player33_CN',
		region: 'CN'
	},
	// Player 34 - Chinese player
	{
		server: 'Strinova' as const,
		accountId: 1034,
		playerId: PLAYERS[33].id, // Player 34
		currentName: 'Player34_CN',
		region: 'CN'
	},
	// Player 35 - Chinese player
	{
		server: 'Strinova' as const,
		accountId: 1035,
		playerId: PLAYERS[34].id, // Player 35
		currentName: 'Player35_CN',
		region: 'CN'
	},
	// Player 36 - Chinese player
	{
		server: 'Strinova' as const,
		accountId: 1036,
		playerId: PLAYERS[35].id, // Player 36
		currentName: 'Player36_CN',
		region: 'CN'
	},
	// Player 37 - Chinese player
	{
		server: 'Strinova' as const,
		accountId: 1037,
		playerId: PLAYERS[36].id, // Player 37
		currentName: 'Player37_CN',
		region: 'CN'
	},
	// Player 38 - Chinese player
	{
		server: 'Strinova' as const,
		accountId: 1038,
		playerId: PLAYERS[37].id, // Player 38
		currentName: 'Player38_CN',
		region: 'CN'
	},
	// Player 39 - Chinese player
	{
		server: 'Strinova' as const,
		accountId: 1039,
		playerId: PLAYERS[38].id, // Player 39
		currentName: 'Player39_CN',
		region: 'CN'
	},
	// Player 40 - Chinese player
	{
		server: 'Strinova' as const,
		accountId: 1040,
		playerId: PLAYERS[39].id, // Player 40
		currentName: 'Player40_CN',
		region: 'CN'
	},
	// Player 41 - Chinese player
	{
		server: 'Strinova' as const,
		accountId: 1041,
		playerId: PLAYERS[40].id, // Player 41
		currentName: 'Player41_CN',
		region: 'CN'
	},
	// Player 42 - Chinese player
	{
		server: 'Strinova' as const,
		accountId: 1042,
		playerId: PLAYERS[41].id, // Player 42
		currentName: 'Player42_CN',
		region: 'CN'
	},
	// Player 43 - Chinese player
	{
		server: 'Strinova' as const,
		accountId: 1043,
		playerId: PLAYERS[42].id, // Player 43
		currentName: 'Player43_CN',
		region: 'CN'
	},
	// Player 44 - Chinese player
	{
		server: 'Strinova' as const,
		accountId: 1044,
		playerId: PLAYERS[43].id, // Player 44
		currentName: 'Player44_CN',
		region: 'CN'
	},
	// Player 45 - Chinese player
	{
		server: 'Strinova' as const,
		accountId: 1045,
		playerId: PLAYERS[44].id, // Player 45
		currentName: 'Player45_CN',
		region: 'CN'
	},
	// Player 46 - Norwegian player
	{
		server: 'Strinova' as const,
		accountId: 1046,
		playerId: PLAYERS[45].id, // Player 46
		currentName: 'Player46_NO',
		region: 'EU'
	},
	// Player 47 - Danish player
	{
		server: 'Strinova' as const,
		accountId: 1047,
		playerId: PLAYERS[46].id, // Player 47
		currentName: 'Player47_DK',
		region: 'EU'
	},
	// Player 48 - Finnish player
	{
		server: 'Strinova' as const,
		accountId: 1048,
		playerId: PLAYERS[47].id, // Player 48
		currentName: 'Player48_FI',
		region: 'EU'
	},
	// Player 49 - Polish player
	{
		server: 'Strinova' as const,
		accountId: 1049,
		playerId: PLAYERS[48].id, // Player 49
		currentName: 'Player49_PL',
		region: 'EU'
	},
	// Player 50 - Brazilian player
	{
		server: 'Strinova' as const,
		accountId: 1050,
		playerId: PLAYERS[49].id, // Player 50
		currentName: 'Player50_BR',
		region: 'SA'
	},
	// Player 51 - Argentine player
	{
		server: 'Strinova' as const,
		accountId: 1051,
		playerId: PLAYERS[50].id, // Player 51
		currentName: 'Player51_AR',
		region: 'SA'
	},
	// Player 52 - Chilean player
	{
		server: 'Strinova' as const,
		accountId: 1052,
		playerId: PLAYERS[51].id, // Player 52
		currentName: 'Player52_CL',
		region: 'SA'
	},
	// Player 53 - Peruvian player
	{
		server: 'Strinova' as const,
		accountId: 1053,
		playerId: PLAYERS[52].id, // Player 53
		currentName: 'Player53_PE',
		region: 'SA'
	},
	// Player 54 - Colombian player
	{
		server: 'Strinova' as const,
		accountId: 1054,
		playerId: PLAYERS[53].id, // Player 54
		currentName: 'Player54_CO',
		region: 'SA'
	},
	// Player 55 - Mexican player
	{
		server: 'Strinova' as const,
		accountId: 1055,
		playerId: PLAYERS[54].id, // Player 55
		currentName: 'Player55_MX',
		region: 'NA'
	},
	// Player 56 - Uruguayan player
	{
		server: 'Strinova' as const,
		accountId: 1056,
		playerId: PLAYERS[55].id, // Player 56
		currentName: 'Player56_UY',
		region: 'SA'
	}
];
