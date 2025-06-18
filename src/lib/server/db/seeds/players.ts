import { randomUUID } from 'node:crypto';
import * as schema from '$lib/server/db/schema';
import { db } from '$lib/server/db';

const firstUser = await db.select().from(schema.user).limit(1);

export const PLAYERS = [
	// Team 1 Players (5-7 players)
	{
		id: randomUUID(),
		name: 'Player 1',
		slug: 'player-1',
		nationality: 'US',
		userId: firstUser.length > 0 ? firstUser[0].id : null
	},
	{
		id: randomUUID(),
		name: 'Player 2',
		slug: 'player-2',
		nationality: 'US'
	},
	{
		id: randomUUID(),
		name: 'Player 3',
		slug: 'player-3',
		nationality: 'US'
	},
	{
		id: randomUUID(),
		name: 'Player 4',
		slug: 'player-4',
		nationality: 'KR'
	},
	{
		id: randomUUID(),
		name: 'Player 5',
		slug: 'player-5',
		nationality: 'EU'
	},
	{
		id: randomUUID(),
		name: 'Player 6',
		slug: 'player-6',
		nationality: 'US'
	},
	{
		id: randomUUID(),
		name: 'Player 7',
		slug: 'player-7',
		nationality: 'CA'
	},
	// Team 2 Players (5-7 players)
	{
		id: randomUUID(),
		name: 'Player 8',
		slug: 'player-8',
		nationality: 'KR'
	},
	{
		id: randomUUID(),
		name: 'Player 9',
		slug: 'player-9',
		nationality: 'KR'
	},
	{
		id: randomUUID(),
		name: 'Player 10',
		slug: 'player-10',
		nationality: 'JP'
	},
	{
		id: randomUUID(),
		name: 'Player 11',
		slug: 'player-11',
		nationality: 'KR'
	},
	{
		id: randomUUID(),
		name: 'Player 12',
		slug: 'player-12',
		nationality: 'TW'
	},
	{
		id: randomUUID(),
		name: 'Player 13',
		slug: 'player-13',
		nationality: 'KR'
	},
	{
		id: randomUUID(),
		name: 'Player 14',
		slug: 'player-14',
		nationality: 'JP'
	},
	// Team 3 Players (5-7 players)
	{
		id: randomUUID(),
		name: 'Player 15',
		slug: 'player-15',
		nationality: 'DE'
	},
	{
		id: randomUUID(),
		name: 'Player 16',
		slug: 'player-16',
		nationality: 'FR'
	},
	{
		id: randomUUID(),
		name: 'Player 17',
		slug: 'player-17',
		nationality: 'UK'
	},
	{
		id: randomUUID(),
		name: 'Player 18',
		slug: 'player-18',
		nationality: 'SE'
	},
	{
		id: randomUUID(),
		name: 'Player 19',
		slug: 'player-19',
		nationality: 'DE'
	},
	{
		id: randomUUID(),
		name: 'Player 20',
		slug: 'player-20',
		nationality: 'FR'
	},
	{
		id: randomUUID(),
		name: 'Player 21',
		slug: 'player-21',
		nationality: 'IT'
	},
	// Team 4 Players (5-7 players)
	{
		id: randomUUID(),
		name: 'Player 22',
		slug: 'player-22',
		nationality: 'CN'
	},
	{
		id: randomUUID(),
		name: 'Player 23',
		slug: 'player-23',
		nationality: 'CN'
	},
	{
		id: randomUUID(),
		name: 'Player 24',
		slug: 'player-24',
		nationality: 'HK'
	},
	{
		id: randomUUID(),
		name: 'Player 25',
		slug: 'player-25',
		nationality: 'CN'
	},
	{
		id: randomUUID(),
		name: 'Player 26',
		slug: 'player-26',
		nationality: 'SG'
	},
	{
		id: randomUUID(),
		name: 'Player 27',
		slug: 'player-27',
		nationality: 'CN'
	},
	{
		id: randomUUID(),
		name: 'Player 28',
		slug: 'player-28',
		nationality: 'TW'
	}
];

export const PLAYER_ADDITIONAL_NATIONALITIES = [
	{
		playerId: PLAYERS[0].id, // Player 1 (US)
		nationality: 'CA' // Adding Canadian nationality
	},
	{
		playerId: PLAYERS[3].id, // Player 4 (KR)
		nationality: 'US' // Adding US nationality
	},
	{
		playerId: PLAYERS[5].id, // Player 6 (CN)
		nationality: 'HK' // Adding Hong Kong nationality
	},
	{
		playerId: PLAYERS[2].id, // Player 3 (CA)
		nationality: 'US' // Adding US nationality
	},
	{
		playerId: PLAYERS[9].id, // Player 10 (JP)
		nationality: 'KR' // Adding Korean nationality
	},
	{
		playerId: PLAYERS[15].id, // Player 16 (DE)
		nationality: 'AT' // Adding Austrian nationality
	},
	{
		playerId: PLAYERS[22].id, // Player 23 (CN)
		nationality: 'TW' // Adding Taiwanese nationality
	}
];
