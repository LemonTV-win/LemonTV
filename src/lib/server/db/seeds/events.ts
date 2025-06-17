import { randomUUID } from 'node:crypto';

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
