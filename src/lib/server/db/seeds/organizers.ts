import { randomUUID } from 'node:crypto';

export const ORGANIZERS = [
	{
		id: randomUUID(),
		slug: 'organizer-1',
		name: 'Organizer 1',
		logo: 'https://picsum.photos/seed/organizer-1/256/256?blur',
		description: 'Organizer 1 description',
		url: 'https://organizer-1.com',
		type: 'organization',
		createdAt: new Date(),
		updatedAt: new Date()
	},
	{
		id: randomUUID(),
		slug: 'organizer-2',
		name: 'Organizer 2',
		logo: 'https://picsum.photos/seed/organizer-2/256/256?blur',
		description: 'Organizer 2 description',
		url: 'https://organizer-2.com',
		type: 'tournament_series',
		createdAt: new Date(),
		updatedAt: new Date()
	},
	{
		id: randomUUID(),
		slug: 'organizer-3',
		name: 'Organizer 3',
		logo: 'https://picsum.photos/seed/organizer-3/256/256?blur',
		description: 'Organizer 3 description',
		url: 'https://organizer-3.com',
		type: 'community',
		createdAt: new Date(),
		updatedAt: new Date()
	},
	{
		id: randomUUID(),
		slug: 'organizer-4',
		name: 'Organizer 4',
		logo: 'https://picsum.photos/seed/organizer-4/256/256?blur',
		description: 'Organizer 4 description',
		url: 'https://organizer-4.com',
		type: 'individual',
		createdAt: new Date(),
		updatedAt: new Date()
	},
	{
		id: randomUUID(),
		slug: 'organizer-5',
		name: 'Organizer 5',
		logo: 'https://picsum.photos/seed/organizer-5/256/256?blur',
		description: 'Organizer 5 description',
		url: 'https://organizer-5.com',
		type: 'league',
		createdAt: new Date(),
		updatedAt: new Date()
	},
	{
		id: randomUUID(),
		slug: 'organizer-6',
		name: 'Organizer 6',
		logo: 'https://picsum.photos/seed/organizer-6/256/256?blur',
		description: 'Organizer 6 description',
		url: 'https://organizer-6.com',
		type: 'tournament_series',
		createdAt: new Date(),
		updatedAt: new Date()
	},
	{
		id: randomUUID(),
		slug: 'organizer-7',
		name: 'Organizer 7',
		logo: 'https://picsum.photos/seed/organizer-7/256/256?blur',
		description: 'Organizer 7 description',
		url: 'https://organizer-7.com',
		type: 'community',
		createdAt: new Date(),
		updatedAt: new Date()
	},
	{
		id: randomUUID(),
		slug: 'organizer-8',
		name: 'Organizer 8',
		logo: 'https://picsum.photos/seed/organizer-8/256/256?blur',
		description: 'Organizer 8 description',
		url: 'https://organizer-8.com',
		type: null,
		createdAt: new Date(),
		updatedAt: new Date()
	}
];
