import { TEAMS } from './teams';
import { MATCHES } from './stages';
import { GAME_ACCOUNTS } from './game-accounts';
import type { GameTeam } from '../schema';
import type { GamePlayerScore } from '../schema';
import type { GameMap } from '$lib/data/game';
import { MATCH_TEAMS } from './matches';

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
			'ocarnus'
		],
		showmatch: [
			'base_404',
			'area_88',
			'port_euler',
			'windy_town',
			'space_lab',
			'cauchy_district',
			'cosmite',
			'ocarnus'
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
		ocarnus: { min: 1900, max: 2500 }
	}
};

// Character pool for players
const CHARACTERS = [
	'Yvette',
	'Nobunaga',
	'Kokona',
	'Michele',
	'Flavia',
	'Yugiri',
	'Leona',
	'Reiichi',
	'Lawine',
	'Ming',
	'Meredith',
	'Eika',
	'Kanami',
	'Fragrans',
	'Mara',
	'Audrey',
	'Celestia',
	'Maddelena',
	'Bai Mo',
	'Fuchsia',
	'Galatea',
	'Chiyo'
];

// Player names for different teams - updated for new 12-team structure
const TEAM_PLAYERS = {
	[TEAMS[0].id]: [
		// Thunder Wolves
		'Alex "Thunder" Rodriguez',
		'Sarah "Viper" Chen',
		'Marcus "Shadow" Johnson',
		'Jin "Dragon" Kim',
		'Emma "Frost" Williams',
		'David "Phoenix" Martinez',
		'Lisa "Raven" Thompson'
	],
	[TEAMS[1].id]: [
		// Dragon Phoenix
		'Hiroshi "Samurai" Tanaka',
		'Min-ji "Luna" Park',
		'Wei "Storm" Zhang',
		'Yuki "Blitz" Yamamoto',
		'Jae-hyun "Void" Lee',
		'Xia "Nova" Wang',
		'Kenji "Zen" Nakamura'
	],
	[TEAMS[2].id]: [
		// Viking Storm
		'Lukas "Wolf" Mueller',
		'Pierre "Eagle" Dubois',
		'Oliver "Hawk" Smith',
		'Erik "Viking" Andersson',
		'Hans "Bear" Weber',
		'Claude "Fox" Moreau',
		'Marco "Lion" Rossi'
	],
	[TEAMS[3].id]: [
		// Tiger Blades
		'Li "Tiger" Wei',
		'Ming "Phoenix" Chen',
		'Kai "Dragon" Wong',
		'Yuan "Storm" Liu',
		'Jin "Blade" Tan',
		'Feng "Thunder" Zhao',
		'Tai "Shadow" Lin'
	],
	[TEAMS[4].id]: [
		// Kangaroo Eagles
		'Jack "Kangaroo" Wilson',
		'Maya "Kiwi" Thompson',
		'Gabriel "Eagle" Santos',
		'Isabella "Koala" Brown',
		'Liam "Tui" Davis',
		'Sophia "Wombat" Garcia',
		'Mateo "Hawk" Cruz'
	],
	[TEAMS[5].id]: [
		// Bear Falcons
		'Dmitry "Bear" Petrov',
		'Olena "Wolf" Kovalenko',
		'Piotr "Eagle" Kowalski',
		'Ivan "Tiger" Sokolov',
		'Anastasia "Falcon" Melnyk',
		'Tomasz "Lynx" Nowak',
		'Vladimir "Wolf" Volkov'
	],
	[TEAMS[6].id]: [
		// Frost Valkyries
		'Magnus "Viking" Hansen',
		'Freja "Valkyrie" Nielsen',
		'Eero "Frost" Virtanen',
		'Astrid "Storm" Berg',
		'Lars "Thunder" Jorgensen',
		'Aino "Aurora" Laaksonen',
		'Wojciech "Bear" Mazur'
	],
	[TEAMS[7].id]: [
		// Jaguar Condors
		'Rafael "Jaguar" Silva',
		'Sofia "Condor" Rodriguez',
		'Diego "Puma" Gonzalez',
		'Valentina "Llama" Torres',
		'Carlos "Eagle" Ramirez',
		'Ana "Jaguar" Morales',
		'Mateo "Puma" Fernandez'
	],
	[TEAMS[8].id]: [
		// Desert Lions
		'Ahmed "Desert" Al-Mahmoud',
		'Fatima "Phoenix" Al-Zahra',
		'Omar "Lion" Hassan',
		'Layla "Falcon" Mansour',
		'Khalid "Eagle" Rahman',
		'Nour "Storm" El-Sayed',
		'Zaid "Wolf" Al-Rashid'
	],
	[TEAMS[9].id]: [
		// Tiger Dragons
		'Priya "Tiger" Patel',
		'Arjun "Lion" Singh',
		'Mei "Dragon" Lin',
		'Raj "Eagle" Kumar',
		'Yuki "Phoenix" Tanaka',
		'Aisha "Storm" Khan',
		'Hiroto "Blade" Yamamoto'
	],
	[TEAMS[10].id]: [
		// Rose Thunder
		'Isabella "Rose" Santos',
		'Lucas "Thunder" Costa',
		'Valentina "Moon" Rodriguez',
		'Santiago "Sun" Fernandez',
		'Camila "Star" Silva',
		'Mateo "Ocean" Torres',
		'Sofia "River" Morales'
	],
	[TEAMS[11].id]: [
		// Aurora Vikings
		'Emma "Frost" Johansson',
		'Lars "Storm" Bergman',
		'Anna "Aurora" Virtanen',
		'Johan "Viking" Hansen',
		'Elin "Snow" Lindberg',
		'Magnus "Ice" Jorgensen',
		'Helena "Frost" Virtanen'
	],
	[TEAMS[12].id]: [
		// Shadow Phoenixes
		'Akira "Shadow" Nakamura',
		'Zara "Phoenix" Al-Rashid',
		'Mikhail "Specter" Volkov',
		'Luna "Eclipse" Santos',
		'Kai "Wraith" Thompson',
		'Elena "Viper" Kozlov'
	],
	[TEAMS[13].id]: [
		// Storm Eagles
		'Hassan "Storm" Ibrahim',
		'Yuki "Eagle" Tanaka',
		'Liam "Thunder" O\'Connor',
		'Aria "Lightning" Kumar',
		'Viktor "Falcon" Petrov',
		'Mei "Spark" Chen'
	]
};

// Team matchups for different stages
const TEAM_MATCHUPS = [
	// Qualifier stage - random matchups
	[TEAMS[0].id, TEAMS[1].id], // Thunder Wolves vs Dragon Phoenix
	[TEAMS[2].id, TEAMS[3].id], // Viking Storm vs Tiger Blades
	[TEAMS[4].id, TEAMS[5].id], // Kangaroo Eagles vs Bear Falcons
	[TEAMS[6].id, TEAMS[7].id], // Frost Valkyries vs Jaguar Condors
	[TEAMS[8].id, TEAMS[9].id], // Desert Lions vs Tiger Dragons
	[TEAMS[10].id, TEAMS[11].id], // Rose Thunder vs Aurora Vikings
	// Cross-region matchups
	[TEAMS[0].id, TEAMS[6].id], // Thunder Wolves vs Frost Valkyries
	[TEAMS[1].id, TEAMS[7].id], // Dragon Phoenix vs Jaguar Condors
	[TEAMS[2].id, TEAMS[8].id], // Viking Storm vs Desert Lions
	[TEAMS[3].id, TEAMS[9].id], // Tiger Blades vs Tiger Dragons
	[TEAMS[4].id, TEAMS[10].id], // Kangaroo Eagles vs Rose Thunder
	[TEAMS[5].id, TEAMS[11].id], // Bear Falcons vs Aurora Vikings
	// Additional matchups for more variety
	[TEAMS[0].id, TEAMS[3].id], // Thunder Wolves vs Tiger Blades
	[TEAMS[1].id, TEAMS[4].id], // Dragon Phoenix vs Kangaroo Eagles
	[TEAMS[2].id, TEAMS[5].id], // Viking Storm vs Bear Falcons
	[TEAMS[6].id, TEAMS[9].id], // Frost Valkyries vs Tiger Dragons
	[TEAMS[7].id, TEAMS[10].id], // Jaguar Condors vs Rose Thunder
	[TEAMS[8].id, TEAMS[11].id], // Desert Lions vs Aurora Vikings
	// New teams matchups
	[TEAMS[12].id, TEAMS[0].id], // Shadow Phoenixes vs Thunder Wolves
	[TEAMS[13].id, TEAMS[1].id], // Storm Eagles vs Dragon Phoenix
	[TEAMS[12].id, TEAMS[13].id], // Shadow Phoenixes vs Storm Eagles
	[TEAMS[12].id, TEAMS[6].id], // Shadow Phoenixes vs Frost Valkyries
	[TEAMS[13].id, TEAMS[8].id] // Storm Eagles vs Desert Lions
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
function generateGames() {
	const games: {
		id: number;
		matchId: string;
		mapId: GameMap;
		duration: number;
		winner: 0 | 1 | -1;
	}[] = [];
	const gameTeams: GameTeam[] = [];
	const gamePlayerScores: GamePlayerScore[] = [];
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

		const teamsForThisMatch = MATCH_TEAMS.filter((mt) => mt.matchId === match.id);

		// Get team combination for this match (cycle through combinations)
		const teamAEntry = teamsForThisMatch.find((mt) => mt.position === 0);
		const teamBEntry = teamsForThisMatch.find((mt) => mt.position === 1);
		if (!teamAEntry || !teamBEntry) {
			console.warn(
				`No teams found in MATCH_TEAMS for matchId: ${match.id}. Skipping game generation.`
			);
			return; // Skips to the next match in the forEach loop
		}
		const teamAId = teamAEntry.teamId;
		const teamBId = teamBEntry.teamId;

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
				mapId: mapId as GameMap,
				duration,
				winner: winner as 0 | 1 | -1
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
) {
	const baseScore = isWinner ? getRandomInt(200, 300) : getRandomInt(150, 250);
	const kills = isWinner ? getRandomInt(12, 20) : getRandomInt(8, 15);
	const deaths = isWinner ? getRandomInt(8, 14) : getRandomInt(12, 18);
	const assists = getRandomInt(3, 10);
	const knocks = Math.floor(kills * 0.6);
	const damage = kills * 150 + assists * 50 + getRandomInt(500, 1000);
	const damageScore = Math.floor(damage * 0.8);

	// Use actual account IDs from the game accounts seed
	const availableAccountIds = GAME_ACCOUNTS.map((account) => account.accountId);
	const accountId = availableAccountIds[uniqueId % availableAccountIds.length] || 100000 + uniqueId;

	return {
		id: uniqueId,
		gameId,
		teamId,
		accountId,
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
