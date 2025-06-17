import { randomUUID } from 'node:crypto';

export const DISCORD_SERVERS = [
	{
		id: randomUUID(),
		title: 'Strinova Esports Hub',
		url: 'https://discord.gg/mY8DMatXM4',
		icon: 'https://cdn.discordapp.com/icons/1371077914723881010/17d112c45f5dbeac98c746c158605696.webp',
		description:
			'Community server focused on competitive play, resources, and media for Strinova Esports.',
		createdAt: new Date(),
		updatedAt: new Date()
	},
	{
		id: randomUUID(),
		title: 'Official Strinova Discord Server',
		url: 'https://discord.com/invite/strinova',
		icon: 'https://cdn.discordapp.com/icons/1182952140684136470/b05a9cb0f65b845b6d2ad7a63182081d.webp',
		description: 'The main community hub for Strinova players worldwide',
		additionalLinkText: '#tournament-chat',
		additionalLinkUrl: 'https://discord.com/channels/1182952140684136470/1320683196698066954',
		createdAt: new Date(),
		updatedAt: new Date()
	}
];

export const COMMUNITY_TAGS = [
	// Language tags
	{
		id: randomUUID(),
		name: 'Japanese',
		category: 'language',
		value: 'ja',
		createdAt: new Date(),
		updatedAt: new Date()
	},
	{
		id: randomUUID(),
		name: 'English',
		category: 'language',
		value: 'en',
		createdAt: new Date(),
		updatedAt: new Date()
	},
	{
		id: randomUUID(),
		name: 'Korean',
		category: 'language',
		value: 'ko',
		createdAt: new Date(),
		updatedAt: new Date()
	},
	// Type tags
	{
		id: randomUUID(),
		name: 'Competitive',
		category: 'type',
		value: 'competitive',
		createdAt: new Date(),
		updatedAt: new Date()
	},
	{
		id: randomUUID(),
		name: 'Casual',
		category: 'type',
		value: 'casual',
		createdAt: new Date(),
		updatedAt: new Date()
	},
	{
		id: randomUUID(),
		name: 'Tournament',
		category: 'type',
		value: 'tournament',
		createdAt: new Date(),
		updatedAt: new Date()
	},
	// Status tags
	{
		id: randomUUID(),
		name: 'Active',
		category: 'status',
		value: 'active',
		createdAt: new Date(),
		updatedAt: new Date()
	},
	{
		id: randomUUID(),
		name: 'New',
		category: 'status',
		value: 'new',
		createdAt: new Date(),
		updatedAt: new Date()
	}
];

export const DISCORD_SERVER_TAGS = [
	// Strinova Esports Hub tags
	{
		serverId: DISCORD_SERVERS[0].id,
		tagId: COMMUNITY_TAGS[0].id, // Japanese
		createdAt: new Date(),
		updatedAt: new Date()
	},
	{
		serverId: DISCORD_SERVERS[0].id,
		tagId: COMMUNITY_TAGS[1].id, // English
		createdAt: new Date(),
		updatedAt: new Date()
	},
	{
		serverId: DISCORD_SERVERS[0].id,
		tagId: COMMUNITY_TAGS[3].id, // Competitive
		createdAt: new Date(),
		updatedAt: new Date()
	},
	{
		serverId: DISCORD_SERVERS[0].id,
		tagId: COMMUNITY_TAGS[6].id, // Active
		createdAt: new Date(),
		updatedAt: new Date()
	},
	// Official Strinova Discord Server tags
	{
		serverId: DISCORD_SERVERS[1].id,
		tagId: COMMUNITY_TAGS[1].id, // English
		createdAt: new Date(),
		updatedAt: new Date()
	},
	{
		serverId: DISCORD_SERVERS[1].id,
		tagId: COMMUNITY_TAGS[2].id, // Korean
		createdAt: new Date(),
		updatedAt: new Date()
	},
	{
		serverId: DISCORD_SERVERS[1].id,
		tagId: COMMUNITY_TAGS[4].id, // Casual
		createdAt: new Date(),
		updatedAt: new Date()
	},
	{
		serverId: DISCORD_SERVERS[1].id,
		tagId: COMMUNITY_TAGS[5].id, // Tournament
		createdAt: new Date(),
		updatedAt: new Date()
	},
	{
		serverId: DISCORD_SERVERS[1].id,
		tagId: COMMUNITY_TAGS[7].id, // New
		createdAt: new Date(),
		updatedAt: new Date()
	}
];
