import type { GameVod } from '../schemas/game/match';

// Simple static VOD data for testing - only for games 1-3
export const GAME_VODS: Omit<GameVod, 'createdAt' | 'updatedAt'>[] = [
	{
		gameId: 1,
		url: 'https://www.youtube.com/watch?v=main1',
		type: 'main',
		title: 'Official Stream - Game 1',
		platform: 'youtube',
		language: 'en',
		official: true,
		available: true,
		startTime: 0,
		playerId: null,
		teamId: null
	},
	{
		gameId: 2,
		url: 'https://www.youtube.com/watch?v=main2',
		type: 'main',
		title: 'Official Stream - Game 2',
		platform: 'youtube',
		language: 'en',
		official: true,
		available: true,
		startTime: 0,
		playerId: null,
		teamId: null
	},
	{
		gameId: 2,
		url: 'https://www.twitch.tv/videos/sub2',
		type: 'sub',
		title: 'Clean Feed - Game 2',
		platform: 'twitch',
		language: 'en',
		official: true,
		available: true,
		startTime: 0,
		playerId: null,
		teamId: null
	},
	{
		gameId: 3,
		url: 'https://www.youtube.com/watch?v=main3',
		type: 'main',
		title: 'Official Stream - Game 3',
		platform: 'youtube',
		language: 'en',
		official: true,
		available: true,
		startTime: 0,
		playerId: null,
		teamId: null
	}
];
