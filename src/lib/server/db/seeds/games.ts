import { TEAMS } from './teams';
import { MATCHES } from './stages';

// Game metadata and configuration
const GAME_CONFIG = {
	// Map pool for different tournament stages
	maps: {
		qualifier: ['base_404', 'area_88', 'port_euler', 'windy_town'],
		group: ['base_404', 'area_88', 'port_euler', 'windy_town', 'space_lab', 'cauchy_district'],
		playoff: [
			'base_404',
			'area_88',
			'port_euler',
			'windy_town',
			'space_lab',
			'cauchy_district',
			'cosmite',
			'orcanus'
		],
		showmatch: [
			'base_404',
			'area_88',
			'port_euler',
			'windy_town',
			'space_lab',
			'cauchy_district',
			'cosmite',
			'orcanus'
		]
	},
	// Duration ranges for different map types (in seconds)
	duration: {
		base_404: { min: 1200, max: 1800 },
		area_88: { min: 1400, max: 2000 },
		port_euler: { min: 1600, max: 2200 },
		windy_town: { min: 1800, max: 2400 },
		space_lab: { min: 1500, max: 2100 },
		cauchy_district: { min: 2000, max: 2800 },
		cosmite: { min: 1700, max: 2300 },
		orcanus: { min: 1900, max: 2500 }
	}
};

// Character pool for players
const CHARACTERS = [
	'Flavia',
	'Ming',
	'Celestia',
	'Nobunaga',
	'Reiichi',
	'Aria',
	'Kai',
	'Luna',
	'Shadow',
	'Phoenix',
	'Void',
	'Echo',
	'Nova',
	'Zen',
	'Blitz',
	'Frost'
];

// Player names for different teams
const TEAM_PLAYERS = {
	[TEAMS[0].id]: [
		'Alex "Thunder" Chen',
		'Sarah "Viper" Rodriguez',
		'Mike "Shadow" Johnson',
		'Emma "Frost" Williams',
		'David "Blitz" Kim'
	],
	[TEAMS[1].id]: [
		'Jake "Phoenix" Smith',
		'Lisa "Nova" Brown',
		'Tom "Zen" Davis',
		'Rachel "Echo" Wilson',
		'Chris "Void" Taylor'
	],
	[TEAMS[2].id]: [
		'Maria "Luna" Garcia',
		'Kevin "Kai" Lee',
		'Anna "Aria" Martinez',
		'Ryan "Shadow" Anderson',
		'Sophie "Frost" Thompson'
	],
	[TEAMS[3].id]: [
		'Daniel "Blitz" White',
		'Jessica "Viper" Clark',
		'Andrew "Phoenix" Lewis',
		'Michelle "Nova" Hall',
		'Robert "Zen" Young'
	],
	[TEAMS[4].id]: [
		'Emily "Echo" Scott',
		'James "Void" Green',
		'Nicole "Luna" Adams',
		'Michael "Kai" Baker',
		'Amanda "Aria" Nelson'
	],
	[TEAMS[5].id]: [
		'Steven "Shadow" Carter',
		'Jennifer "Frost" Mitchell',
		'Brian "Blitz" Perez',
		'Stephanie "Viper" Roberts',
		'Jason "Phoenix" Turner'
	],
	[TEAMS[6].id]: [
		'Melissa "Nova" Phillips',
		'Eric "Zen" Campbell',
		'Ashley "Echo" Parker',
		'Mark "Void" Evans',
		'Lauren "Luna" Edwards'
	],
	[TEAMS[7].id]: [
		'Timothy "Kai" Collins',
		'Rebecca "Aria" Stewart',
		'Jonathan "Shadow" Morris',
		'Victoria "Frost" Rogers',
		'Nicholas "Blitz" Reed'
	]
};

// Team combinations for different matches (more variety)
const TEAM_COMBINATIONS = [
	[TEAMS[0].id, TEAMS[1].id], // Team 1 vs Team 2
	[TEAMS[2].id, TEAMS[3].id], // Team 3 vs Team 4
	[TEAMS[4].id, TEAMS[5].id], // Team 5 vs Team 6
	[TEAMS[6].id, TEAMS[7].id], // Team 7 vs Team 8
	[TEAMS[0].id, TEAMS[3].id], // Team 1 vs Team 4
	[TEAMS[1].id, TEAMS[2].id], // Team 2 vs Team 3
	[TEAMS[4].id, TEAMS[7].id], // Team 5 vs Team 8
	[TEAMS[5].id, TEAMS[6].id], // Team 6 vs Team 7
	[TEAMS[0].id, TEAMS[5].id], // Team 1 vs Team 6
	[TEAMS[1].id, TEAMS[4].id], // Team 2 vs Team 5
	[TEAMS[2].id, TEAMS[7].id], // Team 3 vs Team 8
	[TEAMS[3].id, TEAMS[6].id], // Team 4 vs Team 7
	[TEAMS[0].id, TEAMS[7].id], // Team 1 vs Team 8
	[TEAMS[1].id, TEAMS[6].id], // Team 2 vs Team 7
	[TEAMS[2].id, TEAMS[5].id], // Team 3 vs Team 6
	[TEAMS[3].id, TEAMS[4].id] // Team 4 vs Team 5
];

// Helper functions
function getRandomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElement<T>(array: T[]): T {
	return array[Math.floor(Math.random() * array.length)];
}

function getRandomDuration(mapId: string): number {
	const range = GAME_CONFIG.duration[mapId as keyof typeof GAME_CONFIG.duration];
	return getRandomInt(range.min, range.max);
}

function getRandomScore(): { winnerScore: number; loserScore: number } {
	// 9-win format with overtime possibility
	const overtimeChance = 0.15; // 15% chance of overtime

	if (Math.random() < overtimeChance) {
		// Overtime: 9:8 or 8:9
		const winnerScore = 9;
		const loserScore = 8;
		return { winnerScore, loserScore };
	} else {
		// Regular game: 9:X where X is 0-7
		const winnerScore = 9;
		const loserScore = getRandomInt(0, 7);
		return { winnerScore, loserScore };
	}
}

function getRandomCharacter(): string {
	return getRandomElement(CHARACTERS);
}

function shuffleArray<T>(array: T[]): T[] {
	const shuffled = [...array];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}

// Function to get unique maps for a match
function getUniqueMapsForMatch(stageType: string, numGames: number): string[] {
	const availableMaps = [...GAME_CONFIG.maps[stageType as keyof typeof GAME_CONFIG.maps]];
	const uniqueMaps: string[] = [];

	// Shuffle the available maps
	const shuffledMaps = shuffleArray(availableMaps);

	// Take unique maps up to the number of games needed
	for (let i = 0; i < numGames; i++) {
		// If we run out of unique maps, shuffle and start over
		if (i >= shuffledMaps.length) {
			const additionalMaps = shuffleArray([...availableMaps]);
			uniqueMaps.push(additionalMaps[i % additionalMaps.length]);
		} else {
			uniqueMaps.push(shuffledMaps[i]);
		}
	}

	return uniqueMaps;
}

// Enhanced game generation function
export function generateGames() {
	const games: any[] = [];
	const gameTeams: any[] = [];
	const gamePlayerScores: any[] = [];
	let gameId = 1;
	let playerScoreId = 1; // Global counter for unique player score IDs

	// Generate games for each match based on its format and stage
	MATCHES.forEach((match, matchIndex) => {
		const matchFormat = match.format;
		const stageId = match.stageId;

		// Determine stage type based on stage ID
		let stageType = 'playoff'; // default
		if (stageId <= 4) stageType = 'qualifier';
		else if (stageId <= 6) stageType = 'group';
		else if (stageId <= 8) stageType = 'playoff';
		else stageType = 'group';

		// Determine number of games based on match format
		const numGames =
			{
				BO1: 1,
				BO3: 3,
				BO5: 5
			}[matchFormat] ?? 1;

		// Get unique maps for this match
		const matchMaps = getUniqueMapsForMatch(stageType, numGames);

		// Get team combination for this match (cycle through combinations)
		const teamComboIndex = matchIndex % TEAM_COMBINATIONS.length;
		const [teamAId, teamBId] = TEAM_COMBINATIONS[teamComboIndex];

		// Generate games for this match
		for (let gameIndex = 0; gameIndex < numGames; gameIndex++) {
			// Use a different map for each game in the match
			const mapId = matchMaps[gameIndex];
			const duration = getRandomDuration(mapId);

			// Determine winner (0 for team A, 1 for team B)
			const winner = getRandomInt(0, 1);

			// Create game
			const game = {
				id: gameId,
				matchId: match.id,
				mapId,
				duration,
				winner
			};
			games.push(game);

			// Generate scores using 9-win format
			const { winnerScore, loserScore } = getRandomScore();

			// Assign scores based on winner
			const teamAScore = winner === 0 ? winnerScore : loserScore;
			const teamBScore = winner === 1 ? winnerScore : loserScore;

			// Add game teams
			gameTeams.push({
				gameId,
				teamId: teamAId,
				position: 0,
				score: teamAScore
			});
			gameTeams.push({
				gameId,
				teamId: teamBId,
				position: 1,
				score: teamBScore
			});

			// Generate player scores for this game
			for (let playerIndex = 0; playerIndex < 5; playerIndex++) {
				// Generate player score for Team A
				const teamAPlayerScore = generatePlayerScore(
					gameId,
					teamAId,
					playerIndex,
					winner === 0,
					playerScoreId++
				);
				gamePlayerScores.push(teamAPlayerScore);

				// Generate player score for Team B
				const teamBPlayerScore = generatePlayerScore(
					gameId,
					teamBId,
					playerIndex,
					winner === 1,
					playerScoreId++
				);
				gamePlayerScores.push(teamBPlayerScore);
			}

			gameId++;
		}
	});

	return { games, gameTeams, gamePlayerScores };
}

function generatePlayerScore(
	gameId: number,
	teamId: string,
	playerIndex: number,
	isWinner: boolean,
	uniqueId: number
): any {
	const baseScore = isWinner ? getRandomInt(200, 300) : getRandomInt(150, 250);
	const kills = isWinner ? getRandomInt(12, 20) : getRandomInt(8, 15);
	const deaths = isWinner ? getRandomInt(8, 14) : getRandomInt(12, 18);
	const assists = getRandomInt(3, 10);
	const knocks = Math.floor(kills * 0.6);
	const damage = kills * 150 + assists * 50 + getRandomInt(500, 1000);
	const damageScore = Math.floor(damage * 0.8);

	return {
		id: uniqueId,
		gameId,
		teamId,
		accountId: 100000 + uniqueId,
		player: TEAM_PLAYERS[teamId as keyof typeof TEAM_PLAYERS][playerIndex],
		characterFirstHalf: getRandomCharacter(),
		characterSecondHalf: getRandomCharacter(),
		score: baseScore,
		damageScore,
		kills,
		knocks,
		deaths,
		assists,
		damage
	};
}

// Generate all game data
const { games, gameTeams, gamePlayerScores } = generateGames();

export const GAMES = games;
export const GAME_TEAMS = gameTeams;
export const GAME_PLAYER_SCORES = gamePlayerScores;

// Additional game metadata for enhanced features
export const GAME_METADATA = {
	// Game statistics
	statistics: {
		totalGames: games.length,
		averageDuration: Math.round(games.reduce((sum, game) => sum + game.duration, 0) / games.length),
		totalPlayerScores: gamePlayerScores.length,
		mostPlayedMap: games.reduce(
			(acc, game) => {
				acc[game.mapId] = (acc[game.mapId] || 0) + 1;
				return acc;
			},
			{} as Record<string, number>
		)
	},
	// Tournament progression tracking
	tournamentProgress: {
		qualifierGames: games.filter((game) => {
			const match = MATCHES.find((m) => m.id === game.matchId);
			return match && match.stageId <= 4;
		}).length,
		groupGames: games.filter((game) => {
			const match = MATCHES.find((m) => m.id === game.matchId);
			return match && match.stageId > 4 && match.stageId <= 6;
		}).length,
		playoffGames: games.filter((game) => {
			const match = MATCHES.find((m) => m.id === game.matchId);
			return match && match.stageId > 6 && match.stageId <= 8;
		}).length
	},
	// Performance analytics
	analytics: {
		topPerformers: gamePlayerScores
			.sort((a, b) => b.score - a.score)
			.slice(0, 10)
			.map((score) => ({
				player: score.player,
				team: TEAMS.find((team) => team.id === score.teamId)?.name,
				score: score.score,
				kills: score.kills,
				damage: score.damage
			})),
		teamPerformance: TEAMS.map((team) => {
			const teamGames = gameTeams.filter((gt) => gt.teamId === team.id);
			const wins = teamGames.filter((gt) => {
				const game = games.find((g) => g.id === gt.gameId);
				return game && game.winner === gt.position;
			}).length;
			return {
				team: team.name,
				gamesPlayed: teamGames.length,
				wins,
				winRate: Math.round((wins / teamGames.length) * 100)
			};
		})
	}
};
