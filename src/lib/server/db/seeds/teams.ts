import { randomUUID } from 'node:crypto';
import { PLAYERS } from './players';

export const TEAMS = [
	{
		id: randomUUID(),
		name: 'Thunder Wolves',
		slug: 'thunder-wolves',
		abbr: 'TW',
		logo: 'https://picsum.photos/seed/thunder-wolves/256/256?blur',
		region: 'NA',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	},
	{
		id: randomUUID(),
		name: 'Dragon Phoenix',
		slug: 'dragon-phoenix',
		abbr: 'DP',
		logo: 'https://picsum.photos/seed/dragon-phoenix/256/256?blur',
		region: 'APAC',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	},
	{
		id: randomUUID(),
		name: 'Viking Storm',
		slug: 'viking-storm',
		abbr: 'VS',
		logo: 'https://picsum.photos/seed/viking-storm/256/256?blur',
		region: 'EU',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	},
	{
		id: randomUUID(),
		name: 'Tiger Blades',
		slug: 'tiger-blades',
		abbr: 'TB',
		logo: 'https://picsum.photos/seed/tiger-blades/256/256?blur',
		region: 'APAC',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	},
	{
		id: randomUUID(),
		name: 'Kangaroo Eagles',
		slug: 'kangaroo-eagles',
		abbr: 'KE',
		logo: 'https://picsum.photos/seed/kangaroo-eagles/256/256?blur',
		region: 'APAC',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	},
	{
		id: randomUUID(),
		name: 'Bear Falcons',
		slug: 'bear-falcons',
		abbr: 'BF',
		logo: 'https://picsum.photos/seed/bear-falcons/256/256?blur',
		region: 'EU',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	},
	{
		id: randomUUID(),
		name: 'Frost Valkyries',
		slug: 'frost-valkyries',
		abbr: 'FV',
		logo: 'https://picsum.photos/seed/frost-valkyries/256/256?blur',
		region: 'EU',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	},
	{
		id: randomUUID(),
		name: 'Jaguar Condors',
		slug: 'jaguar-condors',
		abbr: 'JC',
		logo: 'https://picsum.photos/seed/jaguar-condors/256/256?blur',
		region: 'SA',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	},
	{
		id: randomUUID(),
		name: 'Desert Lions',
		slug: 'desert-lions',
		abbr: 'DL',
		logo: 'https://picsum.photos/seed/desert-lions/256/256?blur',
		region: 'MEA',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	},
	{
		id: randomUUID(),
		name: 'Tiger Dragons',
		slug: 'tiger-dragons',
		abbr: 'TD',
		logo: 'https://picsum.photos/seed/tiger-dragons/256/256?blur',
		region: 'APAC',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	},
	{
		id: randomUUID(),
		name: 'Rose Thunder',
		slug: 'rose-thunder',
		abbr: 'RT',
		logo: 'https://picsum.photos/seed/rose-thunder/256/256?blur',
		region: 'SA',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	},
	{
		id: randomUUID(),
		name: 'Aurora Vikings',
		slug: 'aurora-vikings',
		abbr: 'AV',
		logo: 'https://picsum.photos/seed/aurora-vikings/256/256?blur',
		region: 'EU',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	},
	{
		id: randomUUID(),
		name: 'Shadow Phoenixes',
		slug: 'shadow-phoenixes',
		abbr: 'SP',
		logo: 'https://picsum.photos/seed/shadow-phoenixes/256/256?blur',
		region: 'APAC',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	},
	{
		id: randomUUID(),
		name: 'Storm Eagles',
		slug: 'storm-eagles',
		abbr: 'SE',
		logo: 'https://picsum.photos/seed/storm-eagles/256/256?blur',
		region: 'MEA',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	}
];

export const TEAM_PLAYERS = [
	// Team 1 - Thunder Wolves (7 players)
	{
		id: 1,
		teamId: TEAMS[0].id,
		playerId: PLAYERS[0].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 2,
		teamId: TEAMS[0].id,
		playerId: PLAYERS[1].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 3,
		teamId: TEAMS[0].id,
		playerId: PLAYERS[2].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 4,
		teamId: TEAMS[0].id,
		playerId: PLAYERS[3].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 5,
		teamId: TEAMS[0].id,
		playerId: PLAYERS[4].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 6,
		teamId: TEAMS[0].id,
		playerId: PLAYERS[5].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 7,
		teamId: TEAMS[0].id,
		playerId: PLAYERS[6].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	// Team 2 - Dragon Phoenix (7 players)
	{
		id: 8,
		teamId: TEAMS[1].id,
		playerId: PLAYERS[7].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 9,
		teamId: TEAMS[1].id,
		playerId: PLAYERS[8].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 10,
		teamId: TEAMS[1].id,
		playerId: PLAYERS[9].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 11,
		teamId: TEAMS[1].id,
		playerId: PLAYERS[10].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 12,
		teamId: TEAMS[1].id,
		playerId: PLAYERS[11].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 13,
		teamId: TEAMS[1].id,
		playerId: PLAYERS[12].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 14,
		teamId: TEAMS[1].id,
		playerId: PLAYERS[13].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	// Team 3 - Viking Storm (7 players)
	{
		id: 15,
		teamId: TEAMS[2].id,
		playerId: PLAYERS[14].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 16,
		teamId: TEAMS[2].id,
		playerId: PLAYERS[15].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 17,
		teamId: TEAMS[2].id,
		playerId: PLAYERS[16].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 18,
		teamId: TEAMS[2].id,
		playerId: PLAYERS[17].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 19,
		teamId: TEAMS[2].id,
		playerId: PLAYERS[18].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 20,
		teamId: TEAMS[2].id,
		playerId: PLAYERS[19].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 21,
		teamId: TEAMS[2].id,
		playerId: PLAYERS[20].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	// Team 4 - Tiger Blades (7 players)
	{
		id: 22,
		teamId: TEAMS[3].id,
		playerId: PLAYERS[21].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 23,
		teamId: TEAMS[3].id,
		playerId: PLAYERS[22].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 24,
		teamId: TEAMS[3].id,
		playerId: PLAYERS[23].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 25,
		teamId: TEAMS[3].id,
		playerId: PLAYERS[24].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 26,
		teamId: TEAMS[3].id,
		playerId: PLAYERS[25].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 27,
		teamId: TEAMS[3].id,
		playerId: PLAYERS[26].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 28,
		teamId: TEAMS[3].id,
		playerId: PLAYERS[27].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	// Team 5 - Kangaroo Eagles (7 players)
	{
		id: 29,
		teamId: TEAMS[4].id,
		playerId: PLAYERS[28].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 30,
		teamId: TEAMS[4].id,
		playerId: PLAYERS[29].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 31,
		teamId: TEAMS[4].id,
		playerId: PLAYERS[30].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 32,
		teamId: TEAMS[4].id,
		playerId: PLAYERS[31].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 33,
		teamId: TEAMS[4].id,
		playerId: PLAYERS[32].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 34,
		teamId: TEAMS[4].id,
		playerId: PLAYERS[33].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 35,
		teamId: TEAMS[4].id,
		playerId: PLAYERS[34].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	// Team 6 - Bear Falcons (7 players)
	{
		id: 36,
		teamId: TEAMS[5].id,
		playerId: PLAYERS[35].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 37,
		teamId: TEAMS[5].id,
		playerId: PLAYERS[36].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 38,
		teamId: TEAMS[5].id,
		playerId: PLAYERS[37].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 39,
		teamId: TEAMS[5].id,
		playerId: PLAYERS[38].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 40,
		teamId: TEAMS[5].id,
		playerId: PLAYERS[39].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 41,
		teamId: TEAMS[5].id,
		playerId: PLAYERS[40].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 42,
		teamId: TEAMS[5].id,
		playerId: PLAYERS[41].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	// Team 7 - Frost Valkyries (7 players)
	{
		id: 43,
		teamId: TEAMS[6].id,
		playerId: PLAYERS[42].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 44,
		teamId: TEAMS[6].id,
		playerId: PLAYERS[43].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 45,
		teamId: TEAMS[6].id,
		playerId: PLAYERS[44].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 46,
		teamId: TEAMS[6].id,
		playerId: PLAYERS[45].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 47,
		teamId: TEAMS[6].id,
		playerId: PLAYERS[46].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 48,
		teamId: TEAMS[6].id,
		playerId: PLAYERS[47].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 49,
		teamId: TEAMS[6].id,
		playerId: PLAYERS[48].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	// Team 8 - Jaguar Condors (7 players)
	{
		id: 50,
		teamId: TEAMS[7].id,
		playerId: PLAYERS[49].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 51,
		teamId: TEAMS[7].id,
		playerId: PLAYERS[50].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 52,
		teamId: TEAMS[7].id,
		playerId: PLAYERS[51].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 53,
		teamId: TEAMS[7].id,
		playerId: PLAYERS[52].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 54,
		teamId: TEAMS[7].id,
		playerId: PLAYERS[53].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 55,
		teamId: TEAMS[7].id,
		playerId: PLAYERS[54].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 56,
		teamId: TEAMS[7].id,
		playerId: PLAYERS[55].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	// Team 9 - Desert Lions (7 players)
	{
		id: 57,
		teamId: TEAMS[8].id,
		playerId: PLAYERS[56].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 58,
		teamId: TEAMS[8].id,
		playerId: PLAYERS[57].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 59,
		teamId: TEAMS[8].id,
		playerId: PLAYERS[58].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 60,
		teamId: TEAMS[8].id,
		playerId: PLAYERS[59].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 61,
		teamId: TEAMS[8].id,
		playerId: PLAYERS[60].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 62,
		teamId: TEAMS[8].id,
		playerId: PLAYERS[61].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 63,
		teamId: TEAMS[8].id,
		playerId: PLAYERS[62].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	// Team 10 - Tiger Dragons (7 players)
	{
		id: 64,
		teamId: TEAMS[9].id,
		playerId: PLAYERS[63].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 65,
		teamId: TEAMS[9].id,
		playerId: PLAYERS[64].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 66,
		teamId: TEAMS[9].id,
		playerId: PLAYERS[65].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 67,
		teamId: TEAMS[9].id,
		playerId: PLAYERS[66].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 68,
		teamId: TEAMS[9].id,
		playerId: PLAYERS[67].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 69,
		teamId: TEAMS[9].id,
		playerId: PLAYERS[68].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 70,
		teamId: TEAMS[9].id,
		playerId: PLAYERS[69].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	// Team 11 - Rose Thunder (7 players)
	{
		id: 71,
		teamId: TEAMS[10].id,
		playerId: PLAYERS[70].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 72,
		teamId: TEAMS[10].id,
		playerId: PLAYERS[71].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 73,
		teamId: TEAMS[10].id,
		playerId: PLAYERS[72].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 74,
		teamId: TEAMS[10].id,
		playerId: PLAYERS[73].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 75,
		teamId: TEAMS[10].id,
		playerId: PLAYERS[74].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 76,
		teamId: TEAMS[10].id,
		playerId: PLAYERS[75].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 77,
		teamId: TEAMS[10].id,
		playerId: PLAYERS[76].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	// Team 12 - Aurora Vikings (7 players)
	{
		id: 78,
		teamId: TEAMS[11].id,
		playerId: PLAYERS[77].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 79,
		teamId: TEAMS[11].id,
		playerId: PLAYERS[78].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 80,
		teamId: TEAMS[11].id,
		playerId: PLAYERS[79].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 81,
		teamId: TEAMS[11].id,
		playerId: PLAYERS[80].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 82,
		teamId: TEAMS[11].id,
		playerId: PLAYERS[81].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 83,
		teamId: TEAMS[11].id,
		playerId: PLAYERS[82].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 84,
		teamId: TEAMS[11].id,
		playerId: PLAYERS[83].id,
		role: 'active',
		startedOn: '2024-01-01'
	},
	// Team 13 - Shadow Phoenixes (6 active players)
	{
		id: 85,
		teamId: TEAMS[12].id,
		playerId: PLAYERS[84].id, // Akira "Shadow" Nakamura
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 86,
		teamId: TEAMS[12].id,
		playerId: PLAYERS[85].id, // Zara "Phoenix" Al-Rashid
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 87,
		teamId: TEAMS[12].id,
		playerId: PLAYERS[86].id, // Mikhail "Specter" Volkov
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 88,
		teamId: TEAMS[12].id,
		playerId: PLAYERS[87].id, // Luna "Eclipse" Santos
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 89,
		teamId: TEAMS[12].id,
		playerId: PLAYERS[88].id, // Kai "Wraith" Thompson
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 90,
		teamId: TEAMS[12].id,
		playerId: PLAYERS[89].id, // Elena "Viper" Kozlov
		role: 'active',
		startedOn: '2024-01-01'
	},
	// Team 14 - Storm Eagles (6 active players)
	{
		id: 91,
		teamId: TEAMS[13].id,
		playerId: PLAYERS[90].id, // Hassan "Storm" Ibrahim
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 92,
		teamId: TEAMS[13].id,
		playerId: PLAYERS[91].id, // Yuki "Eagle" Tanaka
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 93,
		teamId: TEAMS[13].id,
		playerId: PLAYERS[92].id, // Liam "Thunder" O'Connor
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 94,
		teamId: TEAMS[13].id,
		playerId: PLAYERS[93].id, // Aria "Lightning" Kumar
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 95,
		teamId: TEAMS[13].id,
		playerId: PLAYERS[94].id, // Viktor "Falcon" Petrov
		role: 'active',
		startedOn: '2024-01-01'
	},
	{
		id: 96,
		teamId: TEAMS[13].id,
		playerId: PLAYERS[95].id, // Mei "Spark" Chen
		role: 'active',
		startedOn: '2024-01-01'
	},
	// Substitute players for existing teams
	// Thunder Wolves substitutes
	{
		id: 97,
		teamId: TEAMS[0].id,
		playerId: PLAYERS[96].id, // Tyler "Backup" Williams
		role: 'substitute',
		startedOn: '2024-01-01'
	},
	{
		id: 98,
		teamId: TEAMS[0].id,
		playerId: PLAYERS[97].id, // Grace "Reserve" Johnson
		role: 'substitute',
		startedOn: '2024-01-01'
	},
	// Dragon Phoenix substitutes
	{
		id: 99,
		teamId: TEAMS[1].id,
		playerId: PLAYERS[98].id, // Kenta "Sub" Yamamoto
		role: 'substitute',
		startedOn: '2024-01-01'
	},
	{
		id: 100,
		teamId: TEAMS[1].id,
		playerId: PLAYERS[99].id, // Soo-jin "Bench" Park
		role: 'substitute',
		startedOn: '2024-01-01'
	},
	// Viking Storm substitutes
	{
		id: 101,
		teamId: TEAMS[2].id,
		playerId: PLAYERS[100].id, // Hans "Backup" Schmidt
		role: 'substitute',
		startedOn: '2024-01-01'
	},
	{
		id: 102,
		teamId: TEAMS[2].id,
		playerId: PLAYERS[101].id, // Marie "Reserve" Dubois
		role: 'substitute',
		startedOn: '2024-01-01'
	},
	// Tiger Blades substitutes
	{
		id: 103,
		teamId: TEAMS[3].id,
		playerId: PLAYERS[102].id, // Dao "Sub" Nguyen
		role: 'substitute',
		startedOn: '2024-01-01'
	},
	{
		id: 104,
		teamId: TEAMS[3].id,
		playerId: PLAYERS[103].id, // Ping "Bench" Wang
		role: 'substitute',
		startedOn: '2024-01-01'
	},
	// Kangaroo Eagles substitutes
	{
		id: 105,
		teamId: TEAMS[4].id,
		playerId: PLAYERS[104].id, // Blake "Backup" Mitchell
		role: 'substitute',
		startedOn: '2024-01-01'
	},
	{
		id: 106,
		teamId: TEAMS[4].id,
		playerId: PLAYERS[105].id, // Isla "Reserve" Thompson
		role: 'substitute',
		startedOn: '2024-01-01'
	},
	// Bear Falcons substitutes
	{
		id: 107,
		teamId: TEAMS[5].id,
		playerId: PLAYERS[106].id, // Alexei "Sub" Smirnov
		role: 'substitute',
		startedOn: '2024-01-01'
	},
	{
		id: 108,
		teamId: TEAMS[5].id,
		playerId: PLAYERS[107].id, // Nadia "Bench" Kozlova
		role: 'substitute',
		startedOn: '2024-01-01'
	},
	// Frost Valkyries substitutes
	{
		id: 109,
		teamId: TEAMS[6].id,
		playerId: PLAYERS[108].id, // Olaf "Backup" Kristensen
		role: 'substitute',
		startedOn: '2024-01-01'
	},
	{
		id: 110,
		teamId: TEAMS[6].id,
		playerId: PLAYERS[109].id, // Astrid "Reserve" Eriksson
		role: 'substitute',
		startedOn: '2024-01-01'
	},
	// Jaguar Condors substitutes
	{
		id: 111,
		teamId: TEAMS[7].id,
		playerId: PLAYERS[110].id, // Carlos "Sub" Mendoza
		role: 'substitute',
		startedOn: '2024-01-01'
	},
	{
		id: 112,
		teamId: TEAMS[7].id,
		playerId: PLAYERS[111].id, // Lucia "Bench" Vargas
		role: 'substitute',
		startedOn: '2024-01-01'
	},
	// Desert Lions substitutes
	{
		id: 113,
		teamId: TEAMS[8].id,
		playerId: PLAYERS[112].id, // Amara "Backup" Hassan
		role: 'substitute',
		startedOn: '2024-01-01'
	},
	{
		id: 114,
		teamId: TEAMS[8].id,
		playerId: PLAYERS[113].id, // Omar "Reserve" Al-Zahra
		role: 'substitute',
		startedOn: '2024-01-01'
	},
	// Tiger Dragons substitutes
	{
		id: 115,
		teamId: TEAMS[9].id,
		playerId: PLAYERS[114].id, // Rohan "Sub" Gupta
		role: 'substitute',
		startedOn: '2024-01-01'
	},
	{
		id: 116,
		teamId: TEAMS[9].id,
		playerId: PLAYERS[115].id, // Sakura "Bench" Tanaka
		role: 'substitute',
		startedOn: '2024-01-01'
	},
	// Rose Thunder substitutes
	{
		id: 117,
		teamId: TEAMS[10].id,
		playerId: PLAYERS[116].id, // Gabriela "Backup" Lima
		role: 'substitute',
		startedOn: '2024-01-01'
	},
	{
		id: 118,
		teamId: TEAMS[10].id,
		playerId: PLAYERS[117].id, // Diego "Reserve" Castro
		role: 'substitute',
		startedOn: '2024-01-01'
	},
	// Aurora Vikings substitutes
	{
		id: 119,
		teamId: TEAMS[11].id,
		playerId: PLAYERS[118].id, // Bjorn "Sub" Andersen
		role: 'substitute',
		startedOn: '2024-01-01'
	},
	{
		id: 120,
		teamId: TEAMS[11].id,
		playerId: PLAYERS[119].id, // Elina "Bench" Virtanen
		role: 'substitute',
		startedOn: '2024-01-01'
	},
	// Shadow Phoenixes substitutes
	{
		id: 121,
		teamId: TEAMS[12].id,
		playerId: PLAYERS[120].id, // Ryo "Backup" Sato
		role: 'substitute',
		startedOn: '2024-01-01'
	},
	{
		id: 122,
		teamId: TEAMS[12].id,
		playerId: PLAYERS[121].id, // Fatima "Reserve" Al-Mansouri
		role: 'substitute',
		startedOn: '2024-01-01'
	},
	// Storm Eagles substitutes
	{
		id: 123,
		teamId: TEAMS[13].id,
		playerId: PLAYERS[122].id, // Malik "Sub" Ahmed
		role: 'substitute',
		startedOn: '2024-01-01'
	},
	{
		id: 124,
		teamId: TEAMS[13].id,
		playerId: PLAYERS[123].id, // Priyanka "Bench" Sharma
		role: 'substitute',
		startedOn: '2024-01-01'
	}
];
