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
	}
];

export const TEAM_PLAYERS = [
	{
		id: 2,
		teamId: TEAMS[0].id,
		playerId: PLAYERS[0].id,
		role: 'active'
	},
	{
		id: 3,
		teamId: TEAMS[0].id,
		playerId: PLAYERS[1].id,
		role: 'active'
	},
	{
		id: 4,
		teamId: TEAMS[1].id,
		playerId: PLAYERS[2].id,
		role: 'active'
	},
	{
		id: 5,
		teamId: TEAMS[1].id,
		playerId: PLAYERS[3].id,
		role: 'active'
	},
	{
		id: 6,
		teamId: TEAMS[2].id,
		playerId: PLAYERS[4].id,
		role: 'active'
	},
	{
		id: 7,
		teamId: TEAMS[3].id,
		playerId: PLAYERS[5].id,
		role: 'active'
	}
];
