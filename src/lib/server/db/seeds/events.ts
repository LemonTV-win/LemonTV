import { randomUUID } from 'node:crypto';
import { ORGANIZERS } from './organizers';
import { TEAMS } from './teams';
import { PLAYERS } from './players';

export const EVENTS = [
	{
		id: randomUUID(),
		slug: 'imaginary-cup-1',
		name: 'Imaginary Cup 1',
		official: false,
		server: 'strinova',
		format: 'online',
		region: 'Global',
		image: 'https://picsum.photos/seed/imaginary-cup-1/300/200?blur',
		status: 'finished',
		capacity: 16,
		date: '2024-01-01'
	},
	{
		id: randomUUID(),
		slug: 'imaginary-cup-2',
		name: 'Imaginary Cup 2',
		official: true,
		server: 'calabiyau',
		format: 'lan',
		region: 'EU',
		image: 'https://picsum.photos/seed/imaginary-cup-2/300/200?blur',
		status: 'live',
		capacity: 32,
		date: '2024-03-15'
	},
	{
		id: randomUUID(),
		slug: 'imaginary-cup-3',
		name: 'Imaginary Cup 3',
		official: true,
		server: 'strinova',
		format: 'hybrid',
		region: 'APAC',
		image: 'https://picsum.photos/seed/imaginary-cup-3/300/200?blur',
		status: 'upcoming',
		capacity: 64,
		date: '2024-06-01'
	},
	{
		id: randomUUID(),
		slug: 'imaginary-cup-4',
		name: 'Imaginary Cup 4',
		official: false,
		server: 'calabiyau',
		format: 'online',
		region: 'NA',
		image: 'https://picsum.photos/seed/imaginary-cup-4/300/200?blur',
		status: 'postponed',
		capacity: 24,
		date: '2024-04-20'
	},
	{
		id: randomUUID(),
		slug: 'imaginary-cup-5',
		name: 'Imaginary Cup 5',
		official: true,
		server: 'strinova',
		format: 'lan',
		region: 'CN',
		image: 'https://picsum.photos/seed/imaginary-cup-5/300/200?blur',
		status: 'cancelled',
		capacity: 48,
		date: '2024-05-10'
	},
	{
		id: randomUUID(),
		slug: 'imaginary-cup-6',
		name: 'Imaginary Cup 6',
		official: false,
		server: 'calabiyau',
		format: 'hybrid',
		region: 'SA',
		image: 'https://picsum.photos/seed/imaginary-cup-6/300/200?blur',
		status: 'upcoming',
		capacity: 16,
		date: '2024-07-01'
	},
	{
		id: randomUUID(),
		slug: 'imaginary-cup-7',
		name: 'Imaginary Cup 7',
		official: true,
		server: 'strinova',
		format: 'online',
		region: 'OC',
		image: 'https://picsum.photos/seed/imaginary-cup-7/300/200?blur',
		status: 'upcoming',
		capacity: 32,
		date: '2024-08-15'
	},
	{
		id: randomUUID(),
		slug: 'imaginary-cup-8',
		name: 'Imaginary Cup 8',
		official: false,
		server: 'calabiyau',
		format: 'lan',
		region: 'AF',
		image: 'https://picsum.photos/seed/imaginary-cup-8/300/200?blur',
		status: 'upcoming',
		capacity: 24,
		date: '2024-09-01'
	}
];

export const EVENT_WEBSITES = [
	// Event 1 websites
	{
		id: randomUUID(),
		eventId: EVENTS[0].id,
		url: 'https://imaginary-cup-1.com',
		label: 'Official Website'
	},
	{
		id: randomUUID(),
		eventId: EVENTS[0].id,
		url: 'https://twitch.tv/imaginary-cup-1',
		label: 'Stream'
	},
	// Event 2 websites
	{
		id: randomUUID(),
		eventId: EVENTS[1].id,
		url: 'https://imaginary-cup-2.com',
		label: 'Official Website'
	},
	{
		id: randomUUID(),
		eventId: EVENTS[1].id,
		url: 'https://youtube.com/imaginary-cup-2',
		label: 'Stream'
	},
	{
		id: randomUUID(),
		eventId: EVENTS[1].id,
		url: 'https://imaginary-cup-2.com/register',
		label: 'Registration'
	},
	// Event 3 websites
	{
		id: randomUUID(),
		eventId: EVENTS[2].id,
		url: 'https://imaginary-cup-3.com',
		label: 'Official Website'
	},
	{
		id: randomUUID(),
		eventId: EVENTS[2].id,
		url: 'https://twitter.com/imaginary-cup-3',
		label: 'Social Media'
	},
	// Event 4 websites
	{
		id: randomUUID(),
		eventId: EVENTS[3].id,
		url: 'https://imaginary-cup-4.com',
		label: 'Official Website'
	},
	// Event 5 websites
	{
		id: randomUUID(),
		eventId: EVENTS[4].id,
		url: 'https://imaginary-cup-5.com',
		label: 'Official Website'
	},
	{
		id: randomUUID(),
		eventId: EVENTS[4].id,
		url: 'https://imaginary-cup-5.com/brackets',
		label: 'Brackets'
	},
	// Event 6 websites
	{
		id: randomUUID(),
		eventId: EVENTS[5].id,
		url: 'https://imaginary-cup-6.com',
		label: 'Official Website'
	},
	// Event 7 websites
	{
		id: randomUUID(),
		eventId: EVENTS[6].id,
		url: 'https://imaginary-cup-7.com',
		label: 'Official Website'
	},
	{
		id: randomUUID(),
		eventId: EVENTS[6].id,
		url: 'https://discord.gg/imaginary-cup-7',
		label: 'Discord'
	},
	// Event 8 websites
	{
		id: randomUUID(),
		eventId: EVENTS[7].id,
		url: 'https://imaginary-cup-8.com',
		label: 'Official Website'
	},
	{
		id: randomUUID(),
		eventId: EVENTS[7].id,
		url: 'https://imaginary-cup-8.com/rules',
		label: 'Rules'
	}
];

export const EVENT_ORGANIZERS = [
	{
		eventId: EVENTS[0].id,
		organizerId: ORGANIZERS[0].id
	},
	{
		eventId: EVENTS[1].id,
		organizerId: ORGANIZERS[0].id
	},
	{
		eventId: EVENTS[1].id,
		organizerId: ORGANIZERS[1].id
	},
	{
		eventId: EVENTS[2].id,
		organizerId: ORGANIZERS[1].id
	}
];

export const EVENT_TEAM_PLAYERS = [
	// Event 1 - Team 1 players
	{
		eventId: EVENTS[0].id,
		teamId: TEAMS[0].id,
		playerId: PLAYERS[0].id,
		role: 'main' as const
	},
	{
		eventId: EVENTS[0].id,
		teamId: TEAMS[0].id,
		playerId: PLAYERS[1].id,
		role: 'main' as const
	},
	{
		eventId: EVENTS[0].id,
		teamId: TEAMS[0].id,
		playerId: PLAYERS[2].id,
		role: 'sub' as const
	},
	{
		eventId: EVENTS[0].id,
		teamId: TEAMS[0].id,
		playerId: PLAYERS[3].id,
		role: 'coach' as const
	},
	// Event 1 - Team 2 players
	{
		eventId: EVENTS[0].id,
		teamId: TEAMS[1].id,
		playerId: PLAYERS[2].id,
		role: 'main' as const
	},
	{
		eventId: EVENTS[0].id,
		teamId: TEAMS[1].id,
		playerId: PLAYERS[3].id,
		role: 'main' as const
	},
	{
		eventId: EVENTS[0].id,
		teamId: TEAMS[1].id,
		playerId: PLAYERS[4].id,
		role: 'sub' as const
	},
	{
		eventId: EVENTS[0].id,
		teamId: TEAMS[1].id,
		playerId: PLAYERS[5].id,
		role: 'sub' as const
	},
	// Event 2 - Team 3 players
	{
		eventId: EVENTS[1].id,
		teamId: TEAMS[2].id,
		playerId: PLAYERS[0].id,
		role: 'main' as const
	},
	{
		eventId: EVENTS[1].id,
		teamId: TEAMS[2].id,
		playerId: PLAYERS[1].id,
		role: 'main' as const
	},
	{
		eventId: EVENTS[1].id,
		teamId: TEAMS[2].id,
		playerId: PLAYERS[2].id,
		role: 'sub' as const
	},
	{
		eventId: EVENTS[1].id,
		teamId: TEAMS[2].id,
		playerId: PLAYERS[3].id,
		role: 'coach' as const
	},
	// Event 2 - Team 4 players
	{
		eventId: EVENTS[1].id,
		teamId: TEAMS[3].id,
		playerId: PLAYERS[4].id,
		role: 'main' as const
	},
	{
		eventId: EVENTS[1].id,
		teamId: TEAMS[3].id,
		playerId: PLAYERS[5].id,
		role: 'main' as const
	},
	{
		eventId: EVENTS[1].id,
		teamId: TEAMS[3].id,
		playerId: PLAYERS[0].id,
		role: 'sub' as const
	},
	// Event 3 - Team 1 players
	{
		eventId: EVENTS[2].id,
		teamId: TEAMS[0].id,
		playerId: PLAYERS[1].id,
		role: 'main' as const
	},
	{
		eventId: EVENTS[2].id,
		teamId: TEAMS[0].id,
		playerId: PLAYERS[2].id,
		role: 'main' as const
	},
	{
		eventId: EVENTS[2].id,
		teamId: TEAMS[0].id,
		playerId: PLAYERS[3].id,
		role: 'sub' as const
	},
	{
		eventId: EVENTS[2].id,
		teamId: TEAMS[0].id,
		playerId: PLAYERS[4].id,
		role: 'sub' as const
	},
	{
		eventId: EVENTS[2].id,
		teamId: TEAMS[0].id,
		playerId: PLAYERS[5].id,
		role: 'coach' as const
	},
	// Event 3 - Team 2 players
	{
		eventId: EVENTS[2].id,
		teamId: TEAMS[1].id,
		playerId: PLAYERS[0].id,
		role: 'main' as const
	},
	{
		eventId: EVENTS[2].id,
		teamId: TEAMS[1].id,
		playerId: PLAYERS[1].id,
		role: 'main' as const
	},
	{
		eventId: EVENTS[2].id,
		teamId: TEAMS[1].id,
		playerId: PLAYERS[2].id,
		role: 'sub' as const
	},
	{
		eventId: EVENTS[2].id,
		teamId: TEAMS[1].id,
		playerId: PLAYERS[3].id,
		role: 'coach' as const
	}
];

export const EVENT_RESULTS = [
	// Event 1 (Imaginary Cup 1) Results
	{
		id: randomUUID(),
		eventId: EVENTS[0].id,
		teamId: TEAMS[0].id,
		rank: 1,
		prizeAmount: 45000,
		prizeCurrency: 'Bablo'
	},
	{
		id: randomUUID(),
		eventId: EVENTS[0].id,
		teamId: TEAMS[1].id,
		rank: 2,
		prizeAmount: 35000,
		prizeCurrency: 'Bablo'
	},
	{
		id: randomUUID(),
		eventId: EVENTS[0].id,
		teamId: TEAMS[2].id,
		rank: 3,
		rankTo: 4,
		prizeAmount: 25000,
		prizeCurrency: 'Bablo'
	},
	{
		id: randomUUID(),
		eventId: EVENTS[0].id,
		teamId: TEAMS[3].id,
		rank: 3,
		rankTo: 4,
		prizeAmount: 25000,
		prizeCurrency: 'Bablo'
	},
	// Event 2 (Imaginary Cup 2) Results
	{
		id: randomUUID(),
		eventId: EVENTS[1].id,
		teamId: TEAMS[0].id,
		rank: 1,
		prizeAmount: 50000,
		prizeCurrency: 'Bablo'
	},
	{
		id: randomUUID(),
		eventId: EVENTS[1].id,
		teamId: TEAMS[1].id,
		rank: 2,
		prizeAmount: 40000,
		prizeCurrency: 'Bablo'
	},
	{
		id: randomUUID(),
		eventId: EVENTS[1].id,
		teamId: TEAMS[2].id,
		rank: 3,
		rankTo: 4,
		prizeAmount: 30000,
		prizeCurrency: 'Bablo'
	},
	{
		id: randomUUID(),
		eventId: EVENTS[1].id,
		teamId: TEAMS[3].id,
		rank: 3,
		rankTo: 4,
		prizeAmount: 30000,
		prizeCurrency: 'Bablo'
	},
	// Event 3 (Imaginary Cup 3) Results - showing different ranking scenarios
	{
		id: randomUUID(),
		eventId: EVENTS[2].id,
		teamId: TEAMS[0].id,
		rank: 1,
		prizeAmount: 55000,
		prizeCurrency: 'Bablo'
	},
	{
		id: randomUUID(),
		eventId: EVENTS[2].id,
		teamId: TEAMS[1].id,
		rank: 2,
		prizeAmount: 45000,
		prizeCurrency: 'Bablo'
	},
	{
		id: randomUUID(),
		eventId: EVENTS[2].id,
		teamId: TEAMS[2].id,
		rank: 3,
		prizeAmount: 35000,
		prizeCurrency: 'Bablo'
	},
	{
		id: randomUUID(),
		eventId: EVENTS[2].id,
		teamId: TEAMS[3].id,
		rank: 3,
		prizeAmount: 35000,
		prizeCurrency: 'Bablo'
	},
	// Event 4 (Imaginary Cup 4) Results - showing different ranking scenarios
	{
		id: randomUUID(),
		eventId: EVENTS[3].id,
		teamId: TEAMS[0].id,
		rank: 1,
		prizeAmount: 60000,
		prizeCurrency: 'Bablo'
	},
	{
		id: randomUUID(),
		eventId: EVENTS[3].id,
		teamId: TEAMS[1].id,
		rank: 2,
		prizeAmount: 50000,
		prizeCurrency: 'Bablo'
	},
	{
		id: randomUUID(),
		eventId: EVENTS[3].id,
		teamId: TEAMS[2].id,
		rank: 3,
		prizeAmount: 40000,
		prizeCurrency: 'Bablo'
	},
	{
		id: randomUUID(),
		eventId: EVENTS[3].id,
		teamId: TEAMS[3].id,
		rank: 4,
		prizeAmount: 30000,
		prizeCurrency: 'Bablo'
	},
	// Event 5 (Imaginary Cup 5) Results - showing different ranking scenarios
	{
		id: randomUUID(),
		eventId: EVENTS[4].id,
		teamId: TEAMS[0].id,
		rank: 1,
		prizeAmount: 65000,
		prizeCurrency: 'Bablo'
	},
	{
		id: randomUUID(),
		eventId: EVENTS[4].id,
		teamId: TEAMS[1].id,
		rank: 2,
		prizeAmount: 55000,
		prizeCurrency: 'Bablo'
	},
	{
		id: randomUUID(),
		eventId: EVENTS[4].id,
		teamId: TEAMS[2].id,
		rank: 3,
		rankTo: 4,
		prizeAmount: 45000,
		prizeCurrency: 'Bablo'
	},
	{
		id: randomUUID(),
		eventId: EVENTS[4].id,
		teamId: TEAMS[3].id,
		rank: 3,
		rankTo: 4,
		prizeAmount: 45000,
		prizeCurrency: 'Bablo'
	},
	// KAWA Cup Results - showing same rank (3rd)
	{
		id: randomUUID(),
		eventId: EVENTS[5].id,
		teamId: TEAMS[0].id,
		rank: 1,
		prizeAmount: 55000,
		prizeCurrency: 'Bablo'
	},
	{
		id: randomUUID(),
		eventId: EVENTS[5].id,
		teamId: TEAMS[1].id,
		rank: 2,
		prizeAmount: 45000,
		prizeCurrency: 'Bablo'
	},
	{
		id: randomUUID(),
		eventId: EVENTS[5].id,
		teamId: TEAMS[2].id,
		rank: 3,
		prizeAmount: 35000,
		prizeCurrency: 'Bablo'
	},
	{
		id: randomUUID(),
		eventId: EVENTS[5].id,
		teamId: TEAMS[3].id,
		rank: 3,
		prizeAmount: 35000,
		prizeCurrency: 'Bablo'
	},
	// Origami Cup Results - showing normal sequential ranks
	{
		id: randomUUID(),
		eventId: EVENTS[6].id,
		teamId: TEAMS[0].id,
		rank: 1,
		prizeAmount: 60000,
		prizeCurrency: 'Bablo'
	},
	{
		id: randomUUID(),
		eventId: EVENTS[6].id,
		teamId: TEAMS[1].id,
		rank: 2,
		prizeAmount: 50000,
		prizeCurrency: 'Bablo'
	},
	{
		id: randomUUID(),
		eventId: EVENTS[6].id,
		teamId: TEAMS[2].id,
		rank: 3,
		prizeAmount: 40000,
		prizeCurrency: 'Bablo'
	},
	{
		id: randomUUID(),
		eventId: EVENTS[6].id,
		teamId: TEAMS[3].id,
		rank: 4,
		prizeAmount: 30000,
		prizeCurrency: 'Bablo'
	},
	// Mighty Meow Cup Results - showing range ranks (3rd-4th)
	{
		id: randomUUID(),
		eventId: EVENTS[7].id,
		teamId: TEAMS[0].id,
		rank: 1,
		prizeAmount: 65000,
		prizeCurrency: 'Bablo'
	},
	{
		id: randomUUID(),
		eventId: EVENTS[7].id,
		teamId: TEAMS[1].id,
		rank: 2,
		prizeAmount: 55000,
		prizeCurrency: 'Bablo'
	},
	{
		id: randomUUID(),
		eventId: EVENTS[7].id,
		teamId: TEAMS[2].id,
		rank: 3,
		rankTo: 4,
		prizeAmount: 45000,
		prizeCurrency: 'Bablo'
	},
	{
		id: randomUUID(),
		eventId: EVENTS[7].id,
		teamId: TEAMS[3].id,
		rank: 3,
		rankTo: 4,
		prizeAmount: 45000,
		prizeCurrency: 'Bablo'
	}
];

export const EVENT_VIDEOS = [
	{
		id: randomUUID(),
		eventId: EVENTS[0].id,
		type: 'stream' as const,
		url: 'https://www.twitch.tv/example1',
		platform: 'twitch',
		title: 'Day 1 Main Stream',
		createdAt: new Date(),
		updatedAt: new Date()
	},
	{
		id: randomUUID(),
		eventId: EVENTS[0].id,
		type: 'vod' as const,
		url: 'https://www.youtube.com/watch?v=example1',
		platform: 'youtube',
		title: 'Grand Finals VOD',
		createdAt: new Date(),
		updatedAt: new Date()
	},
	{
		id: randomUUID(),
		eventId: EVENTS[1].id,
		type: 'clip' as const,
		url: 'https://www.twitch.tv/example2/clip/example',
		platform: 'twitch',
		title: 'Amazing Play Highlight',
		createdAt: new Date(),
		updatedAt: new Date()
	}
];

export const EVENT_CASTERS = [
	// Event 1 casters
	{
		eventId: EVENTS[0].id,
		playerId: PLAYERS[0].id,
		role: 'host' as const,
		createdAt: new Date(),
		updatedAt: new Date()
	},
	{
		eventId: EVENTS[0].id,
		playerId: PLAYERS[1].id,
		role: 'commentator' as const,
		createdAt: new Date(),
		updatedAt: new Date()
	},
	{
		eventId: EVENTS[0].id,
		playerId: PLAYERS[2].id,
		role: 'analyst' as const,
		createdAt: new Date(),
		updatedAt: new Date()
	},
	// Event 2 casters
	{
		eventId: EVENTS[1].id,
		playerId: PLAYERS[3].id,
		role: 'host' as const,
		createdAt: new Date(),
		updatedAt: new Date()
	},
	{
		eventId: EVENTS[1].id,
		playerId: PLAYERS[4].id,
		role: 'commentator' as const,
		createdAt: new Date(),
		updatedAt: new Date()
	},
	// Event 3 casters
	{
		eventId: EVENTS[2].id,
		playerId: PLAYERS[5].id,
		role: 'host' as const,
		createdAt: new Date(),
		updatedAt: new Date()
	},
	{
		eventId: EVENTS[2].id,
		playerId: PLAYERS[0].id,
		role: 'analyst' as const,
		createdAt: new Date(),
		updatedAt: new Date()
	},
	{
		eventId: EVENTS[2].id,
		playerId: PLAYERS[1].id,
		role: 'commentator' as const,
		createdAt: new Date(),
		updatedAt: new Date()
	}
];
