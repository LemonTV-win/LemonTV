import { PLAYERS } from './players';
import type { GameAccountServer, GameAccountRegion } from '$lib/data/players';

// Generate game accounts for players
// Each player can have multiple game accounts across different servers
export const GAME_ACCOUNTS = [
	// Team 1 - Thunder Wolves (Players 0-6)
	{
		server: 'Strinova' as const,
		accountId: 1001,
		playerId: PLAYERS[0].id, // Alex "Thunder" Rodriguez
		currentName: 'Thunder_Rodriguez',
		region: 'NA'
	},
	{
		server: 'CalabiYau' as const,
		accountId: 2001,
		playerId: PLAYERS[0].id,
		currentName: 'Thunder_Alex',
		region: 'NA'
	},
	{
		server: 'Strinova' as const,
		accountId: 1002,
		playerId: PLAYERS[1].id, // Sarah "Viper" Chen
		currentName: 'Viper_Chen',
		region: 'NA'
	},
	{
		server: 'Strinova' as const,
		accountId: 1003,
		playerId: PLAYERS[2].id, // Marcus "Shadow" Johnson
		currentName: 'Shadow_Johnson',
		region: 'NA'
	},
	{
		server: 'Strinova' as const,
		accountId: 1004,
		playerId: PLAYERS[3].id, // Jin "Dragon" Kim
		currentName: 'Dragon_Kim',
		region: 'APAC'
	},
	{
		server: 'Strinova' as const,
		accountId: 1005,
		playerId: PLAYERS[4].id, // Emma "Frost" Williams
		currentName: 'Frost_Williams',
		region: 'NA'
	},
	{
		server: 'Strinova' as const,
		accountId: 1006,
		playerId: PLAYERS[5].id, // David "Phoenix" Martinez
		currentName: 'Phoenix_Martinez',
		region: 'NA'
	},
	{
		server: 'Strinova' as const,
		accountId: 1007,
		playerId: PLAYERS[6].id, // Lisa "Raven" Thompson
		currentName: 'Raven_Thompson',
		region: 'NA'
	},
	// Team 2 - Dragon Phoenix (Players 7-13)
	{
		server: 'Strinova' as const,
		accountId: 1008,
		playerId: PLAYERS[7].id, // Hiroshi "Samurai" Tanaka
		currentName: 'Samurai_Tanaka',
		region: 'APAC'
	},
	{
		server: 'Strinova' as const,
		accountId: 1009,
		playerId: PLAYERS[8].id, // Min-ji "Luna" Park
		currentName: 'Luna_Park',
		region: 'APAC'
	},
	{
		server: 'Strinova' as const,
		accountId: 1010,
		playerId: PLAYERS[9].id, // Wei "Storm" Zhang
		currentName: 'Storm_Zhang',
		region: 'CN'
	},
	{
		server: 'Strinova' as const,
		accountId: 1011,
		playerId: PLAYERS[10].id, // Yuki "Blitz" Yamamoto
		currentName: 'Blitz_Yamamoto',
		region: 'APAC'
	},
	{
		server: 'Strinova' as const,
		accountId: 1012,
		playerId: PLAYERS[11].id, // Jae-hyun "Void" Lee
		currentName: 'Void_Lee',
		region: 'APAC'
	},
	{
		server: 'Strinova' as const,
		accountId: 1013,
		playerId: PLAYERS[12].id, // Xia "Nova" Wang
		currentName: 'Nova_Wang',
		region: 'CN'
	},
	{
		server: 'Strinova' as const,
		accountId: 1014,
		playerId: PLAYERS[13].id, // Kenji "Zen" Nakamura
		currentName: 'Zen_Nakamura',
		region: 'APAC'
	},
	// Team 3 - Viking Storm (Players 14-20)
	{
		server: 'Strinova' as const,
		accountId: 1015,
		playerId: PLAYERS[14].id, // Lukas "Wolf" Mueller
		currentName: 'Wolf_Mueller',
		region: 'EU'
	},
	{
		server: 'Strinova' as const,
		accountId: 1016,
		playerId: PLAYERS[15].id, // Pierre "Eagle" Dubois
		currentName: 'Eagle_Dubois',
		region: 'EU'
	},
	{
		server: 'Strinova' as const,
		accountId: 1017,
		playerId: PLAYERS[16].id, // Oliver "Hawk" Smith
		currentName: 'Hawk_Smith',
		region: 'EU'
	},
	{
		server: 'Strinova' as const,
		accountId: 1018,
		playerId: PLAYERS[17].id, // Erik "Viking" Andersson
		currentName: 'Viking_Andersson',
		region: 'EU'
	},
	{
		server: 'Strinova' as const,
		accountId: 1019,
		playerId: PLAYERS[18].id, // Hans "Bear" Weber
		currentName: 'Bear_Weber',
		region: 'EU'
	},
	{
		server: 'Strinova' as const,
		accountId: 1020,
		playerId: PLAYERS[19].id, // Claude "Fox" Moreau
		currentName: 'Fox_Moreau',
		region: 'EU'
	},
	{
		server: 'Strinova' as const,
		accountId: 1021,
		playerId: PLAYERS[20].id, // Marco "Lion" Rossi
		currentName: 'Lion_Rossi',
		region: 'EU'
	},
	// Team 4 - Tiger Blades (Players 21-27)
	{
		server: 'Strinova' as const,
		accountId: 1022,
		playerId: PLAYERS[21].id, // Li "Tiger" Wei
		currentName: 'Tiger_Wei',
		region: 'CN'
	},
	{
		server: 'Strinova' as const,
		accountId: 1023,
		playerId: PLAYERS[22].id, // Ming "Phoenix" Chen
		currentName: 'Phoenix_Chen',
		region: 'CN'
	},
	{
		server: 'Strinova' as const,
		accountId: 1024,
		playerId: PLAYERS[23].id, // Kai "Dragon" Wong
		currentName: 'Dragon_Wong',
		region: 'APAC'
	},
	{
		server: 'Strinova' as const,
		accountId: 1025,
		playerId: PLAYERS[24].id, // Yuan "Storm" Liu
		currentName: 'Storm_Liu',
		region: 'CN'
	},
	{
		server: 'Strinova' as const,
		accountId: 1026,
		playerId: PLAYERS[25].id, // Jin "Blade" Tan
		currentName: 'Blade_Tan',
		region: 'APAC'
	},
	{
		server: 'Strinova' as const,
		accountId: 1027,
		playerId: PLAYERS[26].id, // Feng "Thunder" Zhao
		currentName: 'Thunder_Zhao',
		region: 'CN'
	},
	{
		server: 'Strinova' as const,
		accountId: 1028,
		playerId: PLAYERS[27].id, // Tai "Shadow" Lin
		currentName: 'Shadow_Lin',
		region: 'APAC'
	},
	// Team 5 - Kangaroo Eagles (Players 28-34)
	{
		server: 'Strinova' as const,
		accountId: 1029,
		playerId: PLAYERS[28].id, // Jack "Kangaroo" Wilson
		currentName: 'Kangaroo_Wilson',
		region: 'APAC'
	},
	{
		server: 'Strinova' as const,
		accountId: 1030,
		playerId: PLAYERS[29].id, // Maya "Kiwi" Thompson
		currentName: 'Kiwi_Thompson',
		region: 'APAC'
	},
	{
		server: 'Strinova' as const,
		accountId: 1031,
		playerId: PLAYERS[30].id, // Gabriel "Eagle" Santos
		currentName: 'Eagle_Santos',
		region: 'APAC'
	},
	{
		server: 'Strinova' as const,
		accountId: 1032,
		playerId: PLAYERS[31].id, // Isabella "Koala" Brown
		currentName: 'Koala_Brown',
		region: 'APAC'
	},
	{
		server: 'Strinova' as const,
		accountId: 1033,
		playerId: PLAYERS[32].id, // Liam "Tui" Davis
		currentName: 'Tui_Davis',
		region: 'APAC'
	},
	{
		server: 'Strinova' as const,
		accountId: 1034,
		playerId: PLAYERS[33].id, // Sophia "Wombat" Garcia
		currentName: 'Wombat_Garcia',
		region: 'APAC'
	},
	{
		server: 'Strinova' as const,
		accountId: 1035,
		playerId: PLAYERS[34].id, // Mateo "Hawk" Cruz
		currentName: 'Hawk_Cruz',
		region: 'APAC'
	},
	// Team 6 - Bear Falcons (Players 35-41)
	{
		server: 'Strinova' as const,
		accountId: 1036,
		playerId: PLAYERS[35].id, // Dmitry "Bear" Petrov
		currentName: 'Bear_Petrov',
		region: 'EU'
	},
	{
		server: 'Strinova' as const,
		accountId: 1037,
		playerId: PLAYERS[36].id, // Olena "Wolf" Kovalenko
		currentName: 'Wolf_Kovalenko',
		region: 'EU'
	},
	{
		server: 'Strinova' as const,
		accountId: 1038,
		playerId: PLAYERS[37].id, // Piotr "Eagle" Kowalski
		currentName: 'Eagle_Kowalski',
		region: 'EU'
	},
	{
		server: 'Strinova' as const,
		accountId: 1039,
		playerId: PLAYERS[38].id, // Ivan "Tiger" Sokolov
		currentName: 'Tiger_Sokolov',
		region: 'EU'
	},
	{
		server: 'Strinova' as const,
		accountId: 1040,
		playerId: PLAYERS[39].id, // Anastasia "Falcon" Melnyk
		currentName: 'Falcon_Melnyk',
		region: 'EU'
	},
	{
		server: 'Strinova' as const,
		accountId: 1041,
		playerId: PLAYERS[40].id, // Tomasz "Lynx" Nowak
		currentName: 'Lynx_Nowak',
		region: 'EU'
	},
	{
		server: 'Strinova' as const,
		accountId: 1042,
		playerId: PLAYERS[41].id, // Vladimir "Wolf" Volkov
		currentName: 'Wolf_Volkov',
		region: 'EU'
	},
	// Team 7 - Frost Valkyries (Players 42-48)
	{
		server: 'Strinova' as const,
		accountId: 1043,
		playerId: PLAYERS[42].id, // Magnus "Viking" Hansen
		currentName: 'Viking_Hansen',
		region: 'EU'
	},
	{
		server: 'Strinova' as const,
		accountId: 1044,
		playerId: PLAYERS[43].id, // Freja "Valkyrie" Nielsen
		currentName: 'Valkyrie_Nielsen',
		region: 'EU'
	},
	{
		server: 'Strinova' as const,
		accountId: 1045,
		playerId: PLAYERS[44].id, // Eero "Frost" Virtanen
		currentName: 'Frost_Virtanen',
		region: 'EU'
	},
	{
		server: 'Strinova' as const,
		accountId: 1046,
		playerId: PLAYERS[45].id, // Astrid "Storm" Berg
		currentName: 'Storm_Berg',
		region: 'EU'
	},
	{
		server: 'Strinova' as const,
		accountId: 1047,
		playerId: PLAYERS[46].id, // Lars "Thunder" Jorgensen
		currentName: 'Thunder_Jorgensen',
		region: 'EU'
	},
	{
		server: 'Strinova' as const,
		accountId: 1048,
		playerId: PLAYERS[47].id, // Aino "Aurora" Laaksonen
		currentName: 'Aurora_Laaksonen',
		region: 'EU'
	},
	{
		server: 'Strinova' as const,
		accountId: 1049,
		playerId: PLAYERS[48].id, // Wojciech "Bear" Mazur
		currentName: 'Bear_Mazur',
		region: 'EU'
	},
	// Team 8 - Jaguar Condors (Players 49-55)
	{
		server: 'Strinova' as const,
		accountId: 1050,
		playerId: PLAYERS[49].id, // Rafael "Jaguar" Silva
		currentName: 'Jaguar_Silva',
		region: 'NA'
	},
	{
		server: 'Strinova' as const,
		accountId: 1051,
		playerId: PLAYERS[50].id, // Sofia "Condor" Rodriguez
		currentName: 'Condor_Rodriguez',
		region: 'NA'
	},
	{
		server: 'Strinova' as const,
		accountId: 1052,
		playerId: PLAYERS[51].id, // Diego "Puma" Gonzalez
		currentName: 'Puma_Gonzalez',
		region: 'NA'
	},
	{
		server: 'Strinova' as const,
		accountId: 1053,
		playerId: PLAYERS[52].id, // Valentina "Llama" Torres
		currentName: 'Llama_Torres',
		region: 'NA'
	},
	{
		server: 'Strinova' as const,
		accountId: 1054,
		playerId: PLAYERS[53].id, // Carlos "Eagle" Ramirez
		currentName: 'Eagle_Ramirez',
		region: 'NA'
	},
	{
		server: 'Strinova' as const,
		accountId: 1055,
		playerId: PLAYERS[54].id, // Ana "Jaguar" Morales
		currentName: 'Jaguar_Morales',
		region: 'NA'
	},
	{
		server: 'Strinova' as const,
		accountId: 1056,
		playerId: PLAYERS[55].id, // Mateo "Puma" Fernandez
		currentName: 'Puma_Fernandez',
		region: 'NA'
	},
	// Team 9 - Desert Lions (Players 56-62)
	{
		server: 'Strinova' as const,
		accountId: 1057,
		playerId: PLAYERS[56].id, // Ahmed "Desert" Al-Mahmoud
		currentName: 'Desert_AlMahmoud',
		region: 'EU'
	},
	{
		server: 'Strinova' as const,
		accountId: 1058,
		playerId: PLAYERS[57].id, // Fatima "Phoenix" Al-Zahra
		currentName: 'Phoenix_AlZahra',
		region: 'EU'
	},
	{
		server: 'Strinova' as const,
		accountId: 1059,
		playerId: PLAYERS[58].id, // Omar "Lion" Hassan
		currentName: 'Lion_Hassan',
		region: 'EU'
	},
	{
		server: 'Strinova' as const,
		accountId: 1060,
		playerId: PLAYERS[59].id, // Layla "Falcon" Mansour
		currentName: 'Falcon_Mansour',
		region: 'EU'
	},
	{
		server: 'Strinova' as const,
		accountId: 1061,
		playerId: PLAYERS[60].id, // Khalid "Eagle" Rahman
		currentName: 'Eagle_Rahman',
		region: 'EU'
	},
	{
		server: 'Strinova' as const,
		accountId: 1062,
		playerId: PLAYERS[61].id, // Nour "Storm" El-Sayed
		currentName: 'Storm_ElSayed',
		region: 'EU'
	},
	{
		server: 'Strinova' as const,
		accountId: 1063,
		playerId: PLAYERS[62].id, // Zaid "Wolf" Al-Rashid
		currentName: 'Wolf_AlRashid',
		region: 'EU'
	},
	// Team 10 - Tiger Dragons (Players 63-69)
	{
		server: 'Strinova' as const,
		accountId: 1064,
		playerId: PLAYERS[63].id, // Priya "Tiger" Patel
		currentName: 'Tiger_Patel',
		region: 'APAC'
	},
	{
		server: 'Strinova' as const,
		accountId: 1065,
		playerId: PLAYERS[64].id, // Arjun "Lion" Singh
		currentName: 'Lion_Singh',
		region: 'APAC'
	},
	{
		server: 'Strinova' as const,
		accountId: 1066,
		playerId: PLAYERS[65].id, // Mei "Dragon" Lin
		currentName: 'Dragon_Lin',
		region: 'APAC'
	},
	{
		server: 'Strinova' as const,
		accountId: 1067,
		playerId: PLAYERS[66].id, // Raj "Eagle" Kumar
		currentName: 'Eagle_Kumar',
		region: 'APAC'
	},
	{
		server: 'Strinova' as const,
		accountId: 1068,
		playerId: PLAYERS[67].id, // Yuki "Phoenix" Tanaka
		currentName: 'Phoenix_Tanaka',
		region: 'APAC'
	},
	{
		server: 'Strinova' as const,
		accountId: 1069,
		playerId: PLAYERS[68].id, // Aisha "Storm" Khan
		currentName: 'Storm_Khan',
		region: 'APAC'
	},
	{
		server: 'Strinova' as const,
		accountId: 1070,
		playerId: PLAYERS[69].id, // Hiroto "Blade" Yamamoto
		currentName: 'Blade_Yamamoto',
		region: 'APAC'
	},
	// Team 11 - Rose Thunder (Players 70-76)
	{
		server: 'Strinova' as const,
		accountId: 1071,
		playerId: PLAYERS[70].id, // Isabella "Rose" Santos
		currentName: 'Rose_Santos',
		region: 'NA'
	},
	{
		server: 'Strinova' as const,
		accountId: 1072,
		playerId: PLAYERS[71].id, // Lucas "Thunder" Costa
		currentName: 'Thunder_Costa',
		region: 'NA'
	},
	{
		server: 'Strinova' as const,
		accountId: 1073,
		playerId: PLAYERS[72].id, // Valentina "Moon" Rodriguez
		currentName: 'Moon_Rodriguez',
		region: 'NA'
	},
	{
		server: 'Strinova' as const,
		accountId: 1074,
		playerId: PLAYERS[73].id, // Santiago "Sun" Fernandez
		currentName: 'Sun_Fernandez',
		region: 'NA'
	},
	{
		server: 'Strinova' as const,
		accountId: 1075,
		playerId: PLAYERS[74].id, // Camila "Star" Silva
		currentName: 'Star_Silva',
		region: 'NA'
	},
	{
		server: 'Strinova' as const,
		accountId: 1076,
		playerId: PLAYERS[75].id, // Mateo "Ocean" Torres
		currentName: 'Ocean_Torres',
		region: 'NA'
	},
	{
		server: 'Strinova' as const,
		accountId: 1077,
		playerId: PLAYERS[76].id, // Sofia "River" Morales
		currentName: 'River_Morales',
		region: 'NA'
	},
	// Team 12 - Aurora Vikings (Players 77-83)
	{
		server: 'Strinova' as const,
		accountId: 1078,
		playerId: PLAYERS[77].id, // Emma "Frost" Johansson
		currentName: 'Frost_Johansson',
		region: 'EU'
	},
	{
		server: 'Strinova' as const,
		accountId: 1079,
		playerId: PLAYERS[78].id, // Lars "Storm" Bergman
		currentName: 'Storm_Bergman',
		region: 'EU'
	},
	{
		server: 'Strinova' as const,
		accountId: 1080,
		playerId: PLAYERS[79].id, // Anna "Aurora" Virtanen
		currentName: 'Aurora_Virtanen',
		region: 'EU'
	},
	{
		server: 'Strinova' as const,
		accountId: 1081,
		playerId: PLAYERS[80].id, // Johan "Viking" Hansen
		currentName: 'Viking_Hansen',
		region: 'EU'
	},
	{
		server: 'Strinova' as const,
		accountId: 1082,
		playerId: PLAYERS[81].id, // Elin "Snow" Lindberg
		currentName: 'Snow_Lindberg',
		region: 'EU'
	},
	{
		server: 'Strinova' as const,
		accountId: 1083,
		playerId: PLAYERS[82].id, // Magnus "Ice" Jorgensen
		currentName: 'Ice_Jorgensen',
		region: 'EU'
	},
	{
		server: 'Strinova' as const,
		accountId: 1084,
		playerId: PLAYERS[83].id, // Helena "Frost" Virtanen
		currentName: 'Frost_Virtanen',
		region: 'EU'
	},
	// New players accounts (40 new accounts for players 84-123)
	// Team 13 - Shadow Phoenixes
	{
		server: 'Strinova' as const,
		accountId: 1085,
		playerId: PLAYERS[84].id, // Akira "Shadow" Nakamura
		currentName: 'Shadow_Nakamura',
		region: 'APAC'
	},
	{
		server: 'Strinova' as const,
		accountId: 1086,
		playerId: PLAYERS[85].id, // Zara "Phoenix" Al-Rashid
		currentName: 'Phoenix_AlRashid',
		region: 'EU'
	},
	{
		server: 'Strinova' as const,
		accountId: 1087,
		playerId: PLAYERS[86].id, // Mikhail "Specter" Volkov
		currentName: 'Specter_Volkov',
		region: 'EU'
	},
	{
		server: 'Strinova' as const,
		accountId: 1088,
		playerId: PLAYERS[87].id, // Luna "Eclipse" Santos
		currentName: 'Eclipse_Santos',
		region: 'NA'
	},
	{
		server: 'Strinova' as const,
		accountId: 1089,
		playerId: PLAYERS[88].id, // Kai "Wraith" Thompson
		currentName: 'Wraith_Thompson',
		region: 'APAC'
	},
	{
		server: 'Strinova' as const,
		accountId: 1090,
		playerId: PLAYERS[89].id, // Elena "Viper" Kozlov
		currentName: 'Viper_Kozlov',
		region: 'EU'
	},
	// Team 14 - Storm Eagles
	{
		server: 'Strinova' as const,
		accountId: 1091,
		playerId: PLAYERS[90].id, // Hassan "Storm" Ibrahim
		currentName: 'Storm_Ibrahim',
		region: 'EU'
	},
	{
		server: 'Strinova' as const,
		accountId: 1092,
		playerId: PLAYERS[91].id, // Yuki "Eagle" Tanaka
		currentName: 'Eagle_Tanaka',
		region: 'APAC'
	},
	{
		server: 'Strinova' as const,
		accountId: 1093,
		playerId: PLAYERS[92].id, // Liam "Thunder" O'Connor
		currentName: 'Thunder_OConnor',
		region: 'EU'
	},
	{
		server: 'Strinova' as const,
		accountId: 1094,
		playerId: PLAYERS[93].id, // Aria "Lightning" Kumar
		currentName: 'Lightning_Kumar',
		region: 'APAC'
	},
	{
		server: 'Strinova' as const,
		accountId: 1095,
		playerId: PLAYERS[94].id, // Viktor "Falcon" Petrov
		currentName: 'Falcon_Petrov',
		region: 'EU'
	},
	{
		server: 'Strinova' as const,
		accountId: 1096,
		playerId: PLAYERS[95].id, // Mei "Spark" Chen
		currentName: 'Spark_Chen',
		region: 'APAC'
	},
	// Substitute players accounts
	// Thunder Wolves substitutes
	{
		server: 'Strinova' as const,
		accountId: 1097,
		playerId: PLAYERS[96].id, // Tyler "Backup" Williams
		currentName: 'Backup_Williams',
		region: 'NA'
	},
	{
		server: 'Strinova' as const,
		accountId: 1098,
		playerId: PLAYERS[97].id, // Grace "Reserve" Johnson
		currentName: 'Reserve_Johnson',
		region: 'NA'
	},
	// Dragon Phoenix substitutes
	{
		server: 'Strinova' as const,
		accountId: 1099,
		playerId: PLAYERS[98].id, // Kenta "Sub" Yamamoto
		currentName: 'Sub_Yamamoto',
		region: 'APAC'
	},
	{
		server: 'Strinova' as const,
		accountId: 1100,
		playerId: PLAYERS[99].id, // Soo-jin "Bench" Park
		currentName: 'Bench_Park',
		region: 'APAC'
	},
	// Viking Storm substitutes
	{
		server: 'Strinova' as const,
		accountId: 1101,
		playerId: PLAYERS[100].id, // Hans "Backup" Schmidt
		currentName: 'Backup_Schmidt',
		region: 'EU'
	},
	{
		server: 'Strinova' as const,
		accountId: 1102,
		playerId: PLAYERS[101].id, // Marie "Reserve" Dubois
		currentName: 'Reserve_Dubois',
		region: 'EU'
	},
	// Tiger Blades substitutes
	{
		server: 'Strinova' as const,
		accountId: 1103,
		playerId: PLAYERS[102].id, // Dao "Sub" Nguyen
		currentName: 'Sub_Nguyen',
		region: 'APAC'
	},
	{
		server: 'Strinova' as const,
		accountId: 1104,
		playerId: PLAYERS[103].id, // Ping "Bench" Wang
		currentName: 'Bench_Wang',
		region: 'APAC'
	},
	// Kangaroo Eagles substitutes
	{
		server: 'Strinova' as const,
		accountId: 1105,
		playerId: PLAYERS[104].id, // Blake "Backup" Mitchell
		currentName: 'Backup_Mitchell',
		region: 'APAC'
	},
	{
		server: 'Strinova' as const,
		accountId: 1106,
		playerId: PLAYERS[105].id, // Isla "Reserve" Thompson
		currentName: 'Reserve_Thompson',
		region: 'APAC'
	},
	// Bear Falcons substitutes
	{
		server: 'Strinova' as const,
		accountId: 1107,
		playerId: PLAYERS[106].id, // Alexei "Sub" Smirnov
		currentName: 'Sub_Smirnov',
		region: 'EU'
	},
	{
		server: 'Strinova' as const,
		accountId: 1108,
		playerId: PLAYERS[107].id, // Nadia "Bench" Kozlova
		currentName: 'Bench_Kozlova',
		region: 'EU'
	},
	// Frost Valkyries substitutes
	{
		server: 'Strinova' as const,
		accountId: 1109,
		playerId: PLAYERS[108].id, // Olaf "Backup" Kristensen
		currentName: 'Backup_Kristensen',
		region: 'EU'
	},
	{
		server: 'Strinova' as const,
		accountId: 1110,
		playerId: PLAYERS[109].id, // Astrid "Reserve" Eriksson
		currentName: 'Reserve_Eriksson',
		region: 'EU'
	},
	// Jaguar Condors substitutes
	{
		server: 'Strinova' as const,
		accountId: 1111,
		playerId: PLAYERS[110].id, // Carlos "Sub" Mendoza
		currentName: 'Sub_Mendoza',
		region: 'NA'
	},
	{
		server: 'Strinova' as const,
		accountId: 1112,
		playerId: PLAYERS[111].id, // Lucia "Bench" Vargas
		currentName: 'Bench_Vargas',
		region: 'NA'
	},
	// Desert Lions substitutes
	{
		server: 'Strinova' as const,
		accountId: 1113,
		playerId: PLAYERS[112].id, // Amara "Backup" Hassan
		currentName: 'Backup_Hassan',
		region: 'EU'
	},
	{
		server: 'Strinova' as const,
		accountId: 1114,
		playerId: PLAYERS[113].id, // Omar "Reserve" Al-Zahra
		currentName: 'Reserve_AlZahra',
		region: 'EU'
	},
	// Tiger Dragons substitutes
	{
		server: 'Strinova' as const,
		accountId: 1115,
		playerId: PLAYERS[114].id, // Rohan "Sub" Gupta
		currentName: 'Sub_Gupta',
		region: 'APAC'
	},
	{
		server: 'Strinova' as const,
		accountId: 1116,
		playerId: PLAYERS[115].id, // Sakura "Bench" Tanaka
		currentName: 'Bench_Tanaka',
		region: 'APAC'
	},
	// Rose Thunder substitutes
	{
		server: 'Strinova' as const,
		accountId: 1117,
		playerId: PLAYERS[116].id, // Gabriela "Backup" Lima
		currentName: 'Backup_Lima',
		region: 'NA'
	},
	{
		server: 'Strinova' as const,
		accountId: 1118,
		playerId: PLAYERS[117].id, // Diego "Reserve" Castro
		currentName: 'Reserve_Castro',
		region: 'NA'
	},
	// Aurora Vikings substitutes
	{
		server: 'Strinova' as const,
		accountId: 1119,
		playerId: PLAYERS[118].id, // Bjorn "Sub" Andersen
		currentName: 'Sub_Andersen',
		region: 'EU'
	},
	{
		server: 'Strinova' as const,
		accountId: 1120,
		playerId: PLAYERS[119].id, // Elina "Bench" Virtanen
		currentName: 'Bench_Virtanen',
		region: 'EU'
	},
	// Shadow Phoenixes substitutes
	{
		server: 'Strinova' as const,
		accountId: 1121,
		playerId: PLAYERS[120].id, // Ryo "Backup" Sato
		currentName: 'Backup_Sato',
		region: 'APAC'
	},
	{
		server: 'Strinova' as const,
		accountId: 1122,
		playerId: PLAYERS[121].id, // Fatima "Reserve" Al-Mansouri
		currentName: 'Reserve_AlMansouri',
		region: 'EU'
	},
	// Storm Eagles substitutes
	{
		server: 'Strinova' as const,
		accountId: 1123,
		playerId: PLAYERS[122].id, // Malik "Sub" Ahmed
		currentName: 'Sub_Ahmed',
		region: 'EU'
	},
	{
		server: 'Strinova' as const,
		accountId: 1124,
		playerId: PLAYERS[123].id, // Priyanka "Bench" Sharma
		currentName: 'Bench_Sharma',
		region: 'APAC'
	}
] satisfies {
	server: GameAccountServer;
	accountId: number;
	playerId: string;
	currentName: string;
	region?: GameAccountRegion;
}[];
