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
