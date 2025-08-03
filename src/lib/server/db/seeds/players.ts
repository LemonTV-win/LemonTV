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
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player1&backgroundColor=b6e3f4',
		userId: firstUser.length > 0 ? firstUser[0].id : null
	},
	{
		id: randomUUID(),
		name: 'Player 2',
		slug: 'player-2',
		nationality: 'US',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player2&backgroundColor=ffdfbf'
	},
	{
		id: randomUUID(),
		name: 'Player 3',
		slug: 'player-3',
		nationality: 'US',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player3&backgroundColor=d1d4f9'
	},
	{
		id: randomUUID(),
		name: 'Player 4',
		slug: 'player-4',
		nationality: 'KR',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player4&backgroundColor=ffd5dc'
	},
	{
		id: randomUUID(),
		name: 'Player 5',
		slug: 'player-5',
		nationality: 'EU',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player5&backgroundColor=c0aede'
	},
	{
		id: randomUUID(),
		name: 'Player 6',
		slug: 'player-6',
		nationality: 'US',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player6&backgroundColor=ffdfbf'
	},
	{
		id: randomUUID(),
		name: 'Player 7',
		slug: 'player-7',
		nationality: 'CA',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player7&backgroundColor=b6e3f4'
	},
	// Team 2 Players (5-7 players)
	{
		id: randomUUID(),
		name: 'Player 8',
		slug: 'player-8',
		nationality: 'KR',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player8&backgroundColor=ffd5dc'
	},
	{
		id: randomUUID(),
		name: 'Player 9',
		slug: 'player-9',
		nationality: 'KR',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player9&backgroundColor=ffd5dc'
	},
	{
		id: randomUUID(),
		name: 'Player 10',
		slug: 'player-10',
		nationality: 'JP',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player10&backgroundColor=ffd5dc'
	},
	{
		id: randomUUID(),
		name: 'Player 11',
		slug: 'player-11',
		nationality: 'KR',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player11&backgroundColor=ffd5dc'
	},
	{
		id: randomUUID(),
		name: 'Player 12',
		slug: 'player-12',
		nationality: 'TW',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player12&backgroundColor=ffd5dc'
	},
	{
		id: randomUUID(),
		name: 'Player 13',
		slug: 'player-13',
		nationality: 'KR',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player13&backgroundColor=ffd5dc'
	},
	{
		id: randomUUID(),
		name: 'Player 14',
		slug: 'player-14',
		nationality: 'JP',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player14&backgroundColor=ffd5dc'
	},
	// Team 3 Players (5-7 players)
	{
		id: randomUUID(),
		name: 'Player 15',
		slug: 'player-15',
		nationality: 'DE',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player15&backgroundColor=c0aede'
	},
	{
		id: randomUUID(),
		name: 'Player 16',
		slug: 'player-16',
		nationality: 'FR',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player16&backgroundColor=c0aede'
	},
	{
		id: randomUUID(),
		name: 'Player 17',
		slug: 'player-17',
		nationality: 'UK',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player17&backgroundColor=c0aede'
	},
	{
		id: randomUUID(),
		name: 'Player 18',
		slug: 'player-18',
		nationality: 'SE',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player18&backgroundColor=c0aede'
	},
	{
		id: randomUUID(),
		name: 'Player 19',
		slug: 'player-19',
		nationality: 'DE',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player19&backgroundColor=c0aede'
	},
	{
		id: randomUUID(),
		name: 'Player 20',
		slug: 'player-20',
		nationality: 'FR',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player20&backgroundColor=c0aede'
	},
	{
		id: randomUUID(),
		name: 'Player 21',
		slug: 'player-21',
		nationality: 'IT',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player21&backgroundColor=c0aede'
	},
	// Team 4 Players (5-7 players)
	{
		id: randomUUID(),
		name: 'Player 22',
		slug: 'player-22',
		nationality: 'CN',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player22&backgroundColor=ffd5dc'
	},
	{
		id: randomUUID(),
		name: 'Player 23',
		slug: 'player-23',
		nationality: 'CN',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player23&backgroundColor=ffd5dc'
	},
	{
		id: randomUUID(),
		name: 'Player 24',
		slug: 'player-24',
		nationality: 'HK',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player24&backgroundColor=ffd5dc'
	},
	{
		id: randomUUID(),
		name: 'Player 25',
		slug: 'player-25',
		nationality: 'CN',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player25&backgroundColor=ffd5dc'
	},
	{
		id: randomUUID(),
		name: 'Player 26',
		slug: 'player-26',
		nationality: 'SG',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player26&backgroundColor=ffd5dc'
	},
	{
		id: randomUUID(),
		name: 'Player 27',
		slug: 'player-27',
		nationality: 'CN',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player27&backgroundColor=ffd5dc'
	},
	{
		id: randomUUID(),
		name: 'Player 28',
		slug: 'player-28',
		nationality: 'TW',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player28&backgroundColor=ffd5dc'
	},
	// Team 5 Players (5-7 players)
	{
		id: randomUUID(),
		name: 'Player 29',
		slug: 'player-29',
		nationality: 'AU',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player29&backgroundColor=ffdfbf'
	},
	{
		id: randomUUID(),
		name: 'Player 30',
		slug: 'player-30',
		nationality: 'NZ',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player30&backgroundColor=ffdfbf'
	},
	{
		id: randomUUID(),
		name: 'Player 31',
		slug: 'player-31',
		nationality: 'PH',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player31&backgroundColor=ffd5dc'
	},
	{
		id: randomUUID(),
		name: 'Player 32',
		slug: 'player-32',
		nationality: 'AU',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player32&backgroundColor=ffdfbf'
	},
	{
		id: randomUUID(),
		name: 'Player 33',
		slug: 'player-33',
		nationality: 'NZ',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player33&backgroundColor=ffdfbf'
	},
	{
		id: randomUUID(),
		name: 'Player 34',
		slug: 'player-34',
		nationality: 'AU',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player34&backgroundColor=ffdfbf'
	},
	{
		id: randomUUID(),
		name: 'Player 35',
		slug: 'player-35',
		nationality: 'PH',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player35&backgroundColor=ffd5dc'
	},
	// Team 6 Players (5-7 players)
	{
		id: randomUUID(),
		name: 'Player 36',
		slug: 'player-36',
		nationality: 'RU',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player36&backgroundColor=c0aede'
	},
	{
		id: randomUUID(),
		name: 'Player 37',
		slug: 'player-37',
		nationality: 'UA',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player37&backgroundColor=c0aede'
	},
	{
		id: randomUUID(),
		name: 'Player 38',
		slug: 'player-38',
		nationality: 'PL',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player38&backgroundColor=c0aede'
	},
	{
		id: randomUUID(),
		name: 'Player 39',
		slug: 'player-39',
		nationality: 'RU',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player39&backgroundColor=c0aede'
	},
	{
		id: randomUUID(),
		name: 'Player 40',
		slug: 'player-40',
		nationality: 'UA',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player40&backgroundColor=c0aede'
	},
	{
		id: randomUUID(),
		name: 'Player 41',
		slug: 'player-41',
		nationality: 'PL',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player41&backgroundColor=c0aede'
	},
	{
		id: randomUUID(),
		name: 'Player 42',
		slug: 'player-42',
		nationality: 'RU',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player42&backgroundColor=c0aede'
	},
	// Team 7 Players (5-7 players)
	{
		id: randomUUID(),
		name: 'Player 43',
		slug: 'player-43',
		nationality: 'NO',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player43&backgroundColor=c0aede'
	},
	{
		id: randomUUID(),
		name: 'Player 44',
		slug: 'player-44',
		nationality: 'DK',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player44&backgroundColor=c0aede'
	},
	{
		id: randomUUID(),
		name: 'Player 45',
		slug: 'player-45',
		nationality: 'FI',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player45&backgroundColor=c0aede'
	},
	{
		id: randomUUID(),
		name: 'Player 46',
		slug: 'player-46',
		nationality: 'NO',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player46&backgroundColor=c0aede'
	},
	{
		id: randomUUID(),
		name: 'Player 47',
		slug: 'player-47',
		nationality: 'DK',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player47&backgroundColor=c0aede'
	},
	{
		id: randomUUID(),
		name: 'Player 48',
		slug: 'player-48',
		nationality: 'FI',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player48&backgroundColor=c0aede'
	},
	{
		id: randomUUID(),
		name: 'Player 49',
		slug: 'player-49',
		nationality: 'PL',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player49&backgroundColor=c0aede'
	},
	// Team 8 Players (5-7 players)
	{
		id: randomUUID(),
		name: 'Player 50',
		slug: 'player-50',
		nationality: 'BR',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player50&backgroundColor=ffdfbf'
	},
	{
		id: randomUUID(),
		name: 'Player 51',
		slug: 'player-51',
		nationality: 'AR',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player51&backgroundColor=ffdfbf'
	},
	{
		id: randomUUID(),
		name: 'Player 52',
		slug: 'player-52',
		nationality: 'CL',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player52&backgroundColor=ffdfbf'
	},
	{
		id: randomUUID(),
		name: 'Player 53',
		slug: 'player-53',
		nationality: 'PE',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player53&backgroundColor=ffdfbf'
	},
	{
		id: randomUUID(),
		name: 'Player 54',
		slug: 'player-54',
		nationality: 'CO',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player54&backgroundColor=ffdfbf'
	},
	{
		id: randomUUID(),
		name: 'Player 55',
		slug: 'player-55',
		nationality: 'MX',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player55&backgroundColor=ffdfbf'
	},
	{
		id: randomUUID(),
		name: 'Player 56',
		slug: 'player-56',
		nationality: 'UY',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player56&backgroundColor=ffdfbf'
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
