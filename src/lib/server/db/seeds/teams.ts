import { randomUUID } from 'node:crypto';
import { PLAYERS } from './players';

export const TEAMS = [
	{
		id: randomUUID(),
		name: 'Team 1',
		slug: 'team-1',
		abbr: 'T1',
		logo: 'https://picsum.photos/seed/team-1/256/256?blur',
		region: 'NA',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	},
	{
		id: randomUUID(),
		name: 'Team 2',
		slug: 'team-2',
		abbr: 'T2',
		logo: 'https://picsum.photos/seed/team-2/256/256?blur',
		region: 'NA',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	},
	{
		id: randomUUID(),
		name: 'Team 3',
		slug: 'team-3',
		abbr: 'T3',
		logo: 'https://picsum.photos/seed/team-3/256/256?blur',
		region: 'EU',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	},
	{
		id: randomUUID(),
		name: 'Team 4',
		slug: 'team-4',
		abbr: 'T4',
		logo: 'https://picsum.photos/seed/team-4/256/256?blur',
		region: 'KR',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	},
	{
		id: randomUUID(),
		name: 'Team 5',
		slug: 'team-5',
		abbr: 'T5',
		logo: 'https://picsum.photos/seed/team-5/256/256?blur',
		region: 'APAC',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	},
	{
		id: randomUUID(),
		name: 'Team 6',
		slug: 'team-6',
		abbr: 'T6',
		logo: 'https://picsum.photos/seed/team-6/256/256?blur',
		region: 'CN',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	},
	{
		id: randomUUID(),
		name: 'Team 7',
		slug: 'team-7',
		abbr: 'T7',
		logo: 'https://picsum.photos/seed/team-7/256/256?blur',
		region: 'EU',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	},
	{
		id: randomUUID(),
		name: 'Team 8',
		slug: 'team-8',
		abbr: 'T8',
		logo: 'https://picsum.photos/seed/team-8/256/256?blur',
		region: 'SA',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	}
];

export const TEAM_PLAYERS = [
	// Team 1 Players (7 players)
	{
		id: 1,
		teamId: TEAMS[0].id,
		playerId: PLAYERS[0].id,
		role: 'active'
	},
	{
		id: 2,
		teamId: TEAMS[0].id,
		playerId: PLAYERS[1].id,
		role: 'active'
	},
	{
		id: 3,
		teamId: TEAMS[0].id,
		playerId: PLAYERS[2].id,
		role: 'active'
	},
	{
		id: 4,
		teamId: TEAMS[0].id,
		playerId: PLAYERS[3].id,
		role: 'active'
	},
	{
		id: 5,
		teamId: TEAMS[0].id,
		playerId: PLAYERS[4].id,
		role: 'active'
	},
	{
		id: 6,
		teamId: TEAMS[0].id,
		playerId: PLAYERS[5].id,
		role: 'substitute'
	},
	{
		id: 7,
		teamId: TEAMS[0].id,
		playerId: PLAYERS[6].id,
		role: 'substitute'
	},
	// Team 2 Players (7 players)
	{
		id: 8,
		teamId: TEAMS[1].id,
		playerId: PLAYERS[7].id,
		role: 'active'
	},
	{
		id: 9,
		teamId: TEAMS[1].id,
		playerId: PLAYERS[8].id,
		role: 'active'
	},
	{
		id: 10,
		teamId: TEAMS[1].id,
		playerId: PLAYERS[9].id,
		role: 'active'
	},
	{
		id: 11,
		teamId: TEAMS[1].id,
		playerId: PLAYERS[10].id,
		role: 'active'
	},
	{
		id: 12,
		teamId: TEAMS[1].id,
		playerId: PLAYERS[11].id,
		role: 'active'
	},
	{
		id: 13,
		teamId: TEAMS[1].id,
		playerId: PLAYERS[12].id,
		role: 'substitute'
	},
	{
		id: 14,
		teamId: TEAMS[1].id,
		playerId: PLAYERS[13].id,
		role: 'substitute'
	},
	// Team 3 Players (7 players)
	{
		id: 15,
		teamId: TEAMS[2].id,
		playerId: PLAYERS[14].id,
		role: 'active'
	},
	{
		id: 16,
		teamId: TEAMS[2].id,
		playerId: PLAYERS[15].id,
		role: 'active'
	},
	{
		id: 17,
		teamId: TEAMS[2].id,
		playerId: PLAYERS[16].id,
		role: 'active'
	},
	{
		id: 18,
		teamId: TEAMS[2].id,
		playerId: PLAYERS[17].id,
		role: 'active'
	},
	{
		id: 19,
		teamId: TEAMS[2].id,
		playerId: PLAYERS[18].id,
		role: 'active'
	},
	{
		id: 20,
		teamId: TEAMS[2].id,
		playerId: PLAYERS[19].id,
		role: 'substitute'
	},
	{
		id: 21,
		teamId: TEAMS[2].id,
		playerId: PLAYERS[20].id,
		role: 'substitute'
	},
	// Team 4 Players (7 players)
	{
		id: 22,
		teamId: TEAMS[3].id,
		playerId: PLAYERS[21].id,
		role: 'active'
	},
	{
		id: 23,
		teamId: TEAMS[3].id,
		playerId: PLAYERS[22].id,
		role: 'active'
	},
	{
		id: 24,
		teamId: TEAMS[3].id,
		playerId: PLAYERS[23].id,
		role: 'active'
	},
	{
		id: 25,
		teamId: TEAMS[3].id,
		playerId: PLAYERS[24].id,
		role: 'active'
	},
	{
		id: 26,
		teamId: TEAMS[3].id,
		playerId: PLAYERS[25].id,
		role: 'active'
	},
	{
		id: 27,
		teamId: TEAMS[3].id,
		playerId: PLAYERS[26].id,
		role: 'substitute'
	},
	{
		id: 28,
		teamId: TEAMS[3].id,
		playerId: PLAYERS[27].id,
		role: 'substitute'
	},
	// Team 5 Players (7 players)
	{
		id: 29,
		teamId: TEAMS[4].id,
		playerId: PLAYERS[28].id,
		role: 'active'
	},
	{
		id: 30,
		teamId: TEAMS[4].id,
		playerId: PLAYERS[29].id,
		role: 'active'
	},
	{
		id: 31,
		teamId: TEAMS[4].id,
		playerId: PLAYERS[30].id,
		role: 'active'
	},
	{
		id: 32,
		teamId: TEAMS[4].id,
		playerId: PLAYERS[31].id,
		role: 'active'
	},
	{
		id: 33,
		teamId: TEAMS[4].id,
		playerId: PLAYERS[32].id,
		role: 'active'
	},
	{
		id: 34,
		teamId: TEAMS[4].id,
		playerId: PLAYERS[33].id,
		role: 'substitute'
	},
	{
		id: 35,
		teamId: TEAMS[4].id,
		playerId: PLAYERS[34].id,
		role: 'substitute'
	},
	// Team 6 Players (7 players)
	{
		id: 36,
		teamId: TEAMS[5].id,
		playerId: PLAYERS[35].id,
		role: 'active'
	},
	{
		id: 37,
		teamId: TEAMS[5].id,
		playerId: PLAYERS[36].id,
		role: 'active'
	},
	{
		id: 38,
		teamId: TEAMS[5].id,
		playerId: PLAYERS[37].id,
		role: 'active'
	},
	{
		id: 39,
		teamId: TEAMS[5].id,
		playerId: PLAYERS[38].id,
		role: 'active'
	},
	{
		id: 40,
		teamId: TEAMS[5].id,
		playerId: PLAYERS[39].id,
		role: 'active'
	},
	{
		id: 41,
		teamId: TEAMS[5].id,
		playerId: PLAYERS[40].id,
		role: 'substitute'
	},
	{
		id: 42,
		teamId: TEAMS[5].id,
		playerId: PLAYERS[41].id,
		role: 'substitute'
	},
	// Team 7 Players (7 players)
	{
		id: 43,
		teamId: TEAMS[6].id,
		playerId: PLAYERS[42].id,
		role: 'active'
	},
	{
		id: 44,
		teamId: TEAMS[6].id,
		playerId: PLAYERS[43].id,
		role: 'active'
	},
	{
		id: 45,
		teamId: TEAMS[6].id,
		playerId: PLAYERS[44].id,
		role: 'active'
	},
	{
		id: 46,
		teamId: TEAMS[6].id,
		playerId: PLAYERS[45].id,
		role: 'active'
	},
	{
		id: 47,
		teamId: TEAMS[6].id,
		playerId: PLAYERS[46].id,
		role: 'active'
	},
	{
		id: 48,
		teamId: TEAMS[6].id,
		playerId: PLAYERS[47].id,
		role: 'substitute'
	},
	{
		id: 49,
		teamId: TEAMS[6].id,
		playerId: PLAYERS[48].id,
		role: 'substitute'
	},
	// Team 8 Players (7 players)
	{
		id: 50,
		teamId: TEAMS[7].id,
		playerId: PLAYERS[49].id,
		role: 'active'
	},
	{
		id: 51,
		teamId: TEAMS[7].id,
		playerId: PLAYERS[50].id,
		role: 'active'
	},
	{
		id: 52,
		teamId: TEAMS[7].id,
		playerId: PLAYERS[51].id,
		role: 'active'
	},
	{
		id: 53,
		teamId: TEAMS[7].id,
		playerId: PLAYERS[52].id,
		role: 'active'
	},
	{
		id: 54,
		teamId: TEAMS[7].id,
		playerId: PLAYERS[53].id,
		role: 'active'
	},
	{
		id: 55,
		teamId: TEAMS[7].id,
		playerId: PLAYERS[54].id,
		role: 'substitute'
	},
	{
		id: 56,
		teamId: TEAMS[7].id,
		playerId: PLAYERS[55].id,
		role: 'substitute'
	}
];
