import { randomUUID } from 'node:crypto';
import * as schema from '$lib/server/db/schema';
import { db } from '$lib/server/db';

const firstUser = await db.select().from(schema.user).limit(1);

export const PLAYERS = [
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
		nationality: 'CN'
	}
];
