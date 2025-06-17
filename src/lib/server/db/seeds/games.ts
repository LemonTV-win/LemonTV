import { TEAMS } from './teams';
import { MATCHES } from './stages';

// Function to generate games with correct match IDs
export function generateGames() {
	return [
		// Grand Finals (BO5) - Match 11 (last playoff match)
		{
			id: 1,
			matchId: MATCHES[MATCHES.length - 1].id, // Last match (Grand Finals)
			mapId: 'port_euler',
			duration: 1800,
			winner: 0
		},
		{
			id: 2,
			matchId: MATCHES[MATCHES.length - 1].id, // Last match (Grand Finals)
			mapId: 'windy_town',
			duration: 2100,
			winner: 1
		},
		{
			id: 3,
			matchId: MATCHES[MATCHES.length - 1].id, // Last match (Grand Finals)
			mapId: 'space_lab',
			duration: 1950,
			winner: 0
		},
		{
			id: 4,
			matchId: MATCHES[MATCHES.length - 1].id, // Last match (Grand Finals)
			mapId: 'cauchy_district',
			duration: 2400,
			winner: 1
		},
		{
			id: 5,
			matchId: MATCHES[MATCHES.length - 1].id, // Last match (Grand Finals)
			mapId: 'cosmite',
			duration: 2250,
			winner: 0
		},
		// Semi Finals (BO5) - Match 10 (second to last playoff match)
		{
			id: 6,
			matchId: MATCHES[MATCHES.length - 2].id, // Second to last match (Semi Finals)
			mapId: 'orcanus',
			duration: 1950,
			winner: 0
		},
		{
			id: 7,
			matchId: MATCHES[MATCHES.length - 2].id, // Second to last match (Semi Finals)
			mapId: 'base_404',
			duration: 2100,
			winner: 0
		},
		{
			id: 8,
			matchId: MATCHES[MATCHES.length - 2].id, // Second to last match (Semi Finals)
			mapId: 'area_88',
			duration: 1800,
			winner: 1
		},
		{
			id: 9,
			matchId: MATCHES[MATCHES.length - 2].id, // Second to last match (Semi Finals)
			mapId: 'windy_town',
			duration: 2400,
			winner: 0
		},
		{
			id: 10,
			matchId: MATCHES[MATCHES.length - 2].id, // Second to last match (Semi Finals)
			mapId: 'space_lab',
			duration: 2250,
			winner: 0
		}
	];
}

export const GAMES = generateGames();

export const GAME_TEAMS = [
	// Grand Finals Game 1
	{
		gameId: 1,
		teamId: TEAMS[0].id,
		position: 0,
		score: 13
	},
	{
		gameId: 1,
		teamId: TEAMS[1].id,
		position: 1,
		score: 11
	},
	// Grand Finals Game 2
	{
		gameId: 2,
		teamId: TEAMS[0].id,
		position: 0,
		score: 9
	},
	{
		gameId: 2,
		teamId: TEAMS[1].id,
		position: 1,
		score: 13
	},
	// Grand Finals Game 3
	{
		gameId: 3,
		teamId: TEAMS[0].id,
		position: 0,
		score: 13
	},
	{
		gameId: 3,
		teamId: TEAMS[1].id,
		position: 1,
		score: 10
	},
	// Grand Finals Game 4
	{
		gameId: 4,
		teamId: TEAMS[0].id,
		position: 0,
		score: 11
	},
	{
		gameId: 4,
		teamId: TEAMS[1].id,
		position: 1,
		score: 13
	},
	// Grand Finals Game 5
	{
		gameId: 5,
		teamId: TEAMS[0].id,
		position: 0,
		score: 13
	},
	{
		gameId: 5,
		teamId: TEAMS[1].id,
		position: 1,
		score: 9
	},
	// Semi Finals Game 1
	{
		gameId: 6,
		teamId: TEAMS[1].id,
		position: 0,
		score: 13
	},
	{
		gameId: 6,
		teamId: TEAMS[3].id,
		position: 1,
		score: 8
	},
	// Semi Finals Game 2
	{
		gameId: 7,
		teamId: TEAMS[1].id,
		position: 0,
		score: 13
	},
	{
		gameId: 7,
		teamId: TEAMS[3].id,
		position: 1,
		score: 10
	},
	// Semi Finals Game 3
	{
		gameId: 8,
		teamId: TEAMS[1].id,
		position: 0,
		score: 9
	},
	{
		gameId: 8,
		teamId: TEAMS[3].id,
		position: 1,
		score: 13
	},
	// Semi Finals Game 4
	{
		gameId: 9,
		teamId: TEAMS[1].id,
		position: 0,
		score: 13
	},
	{
		gameId: 9,
		teamId: TEAMS[3].id,
		position: 1,
		score: 11
	},
	// Semi Finals Game 5
	{
		gameId: 10,
		teamId: TEAMS[1].id,
		position: 0,
		score: 13
	},
	{
		gameId: 10,
		teamId: TEAMS[3].id,
		position: 1,
		score: 7
	}
];

export const GAME_PLAYER_SCORES = [
	// Grand Finals Game 1 - Team 1 Player 1
	{
		id: 1,
		gameId: 1,
		teamId: TEAMS[0].id,
		accountId: 123456,
		player: 'Player1',
		characterFirstHalf: 'Flavia',
		characterSecondHalf: 'Ming',
		score: 250,
		damageScore: 180,
		kills: 15,
		knocks: 8,
		deaths: 12,
		assists: 5,
		damage: 2800
	},
	// Grand Finals Game 1 - Team 1 Player 2
	{
		id: 2,
		gameId: 1,
		teamId: TEAMS[0].id,
		accountId: 123457,
		player: 'Player2',
		characterFirstHalf: 'Celestia',
		characterSecondHalf: 'Celestia',
		score: 220,
		damageScore: 160,
		kills: 12,
		knocks: 6,
		deaths: 14,
		assists: 8,
		damage: 2500
	},
	// Grand Finals Game 1 - Team 2 Player 1
	{
		id: 3,
		gameId: 1,
		teamId: TEAMS[1].id,
		accountId: 123458,
		player: 'Player3',
		characterFirstHalf: 'Nobunaga',
		characterSecondHalf: 'Reiichi',
		score: 240,
		damageScore: 170,
		kills: 14,
		knocks: 7,
		deaths: 13,
		assists: 6,
		damage: 2700
	},
	// Grand Finals Game 1 - Team 2 Player 2
	{
		id: 4,
		gameId: 1,
		teamId: TEAMS[1].id,
		accountId: 123459,
		player: 'Player4',
		characterFirstHalf: 'Ming',
		characterSecondHalf: 'Flavia',
		score: 210,
		damageScore: 150,
		kills: 11,
		knocks: 5,
		deaths: 15,
		assists: 9,
		damage: 2300
	},
	// Grand Finals Game 2 - Team 1 Player 1
	{
		id: 5,
		gameId: 2,
		teamId: TEAMS[0].id,
		accountId: 123456,
		player: 'Player1',
		characterFirstHalf: 'Reiichi',
		characterSecondHalf: 'Nobunaga',
		score: 190,
		damageScore: 140,
		kills: 10,
		knocks: 7,
		deaths: 15,
		assists: 4,
		damage: 2200
	},
	// Grand Finals Game 2 - Team 1 Player 2
	{
		id: 6,
		gameId: 2,
		teamId: TEAMS[0].id,
		accountId: 123457,
		player: 'Player2',
		characterFirstHalf: 'Ming',
		characterSecondHalf: 'Flavia',
		score: 180,
		damageScore: 130,
		kills: 9,
		knocks: 6,
		deaths: 16,
		assists: 7,
		damage: 2100
	},
	// Grand Finals Game 2 - Team 2 Player 1
	{
		id: 7,
		gameId: 2,
		teamId: TEAMS[1].id,
		accountId: 123458,
		player: 'Player3',
		characterFirstHalf: 'Celestia',
		characterSecondHalf: 'Celestia',
		score: 260,
		damageScore: 190,
		kills: 16,
		knocks: 9,
		deaths: 11,
		assists: 5,
		damage: 2900
	},
	// Grand Finals Game 2 - Team 2 Player 2
	{
		id: 8,
		gameId: 2,
		teamId: TEAMS[1].id,
		accountId: 123459,
		player: 'Player4',
		characterFirstHalf: 'Flavia',
		characterSecondHalf: 'Ming',
		score: 230,
		damageScore: 170,
		kills: 13,
		knocks: 8,
		deaths: 12,
		assists: 6,
		damage: 2600
	},
	// Grand Finals Game 3 - Team 1 Player 1
	{
		id: 9,
		gameId: 3,
		teamId: TEAMS[0].id,
		accountId: 123456,
		player: 'Player1',
		characterFirstHalf: 'Ming',
		characterSecondHalf: 'Flavia',
		score: 270,
		damageScore: 200,
		kills: 17,
		knocks: 9,
		deaths: 10,
		assists: 4,
		damage: 3000
	},
	// Grand Finals Game 3 - Team 1 Player 2
	{
		id: 10,
		gameId: 3,
		teamId: TEAMS[0].id,
		accountId: 123457,
		player: 'Player2',
		characterFirstHalf: 'Nobunaga',
		characterSecondHalf: 'Reiichi',
		score: 240,
		damageScore: 180,
		kills: 14,
		knocks: 7,
		deaths: 12,
		assists: 6,
		damage: 2700
	},
	// Grand Finals Game 3 - Team 2 Player 1
	{
		id: 11,
		gameId: 3,
		teamId: TEAMS[1].id,
		accountId: 123458,
		player: 'Player3',
		characterFirstHalf: 'Celestia',
		characterSecondHalf: 'Celestia',
		score: 220,
		damageScore: 160,
		kills: 12,
		knocks: 6,
		deaths: 14,
		assists: 8,
		damage: 2500
	},
	// Grand Finals Game 3 - Team 2 Player 2
	{
		id: 12,
		gameId: 3,
		teamId: TEAMS[1].id,
		accountId: 123459,
		player: 'Player4',
		characterFirstHalf: 'Flavia',
		characterSecondHalf: 'Ming',
		score: 200,
		damageScore: 150,
		kills: 10,
		knocks: 5,
		deaths: 16,
		assists: 9,
		damage: 2300
	},
	// Grand Finals Game 4 - Team 1 Player 1
	{
		id: 13,
		gameId: 4,
		teamId: TEAMS[0].id,
		accountId: 123456,
		player: 'Player1',
		characterFirstHalf: 'Reiichi',
		characterSecondHalf: 'Nobunaga',
		score: 230,
		damageScore: 170,
		kills: 13,
		knocks: 8,
		deaths: 13,
		assists: 5,
		damage: 2600
	},
	// Grand Finals Game 4 - Team 1 Player 2
	{
		id: 14,
		gameId: 4,
		teamId: TEAMS[0].id,
		accountId: 123457,
		player: 'Player2',
		characterFirstHalf: 'Celestia',
		characterSecondHalf: 'Celestia',
		score: 210,
		damageScore: 160,
		kills: 11,
		knocks: 7,
		deaths: 14,
		assists: 7,
		damage: 2400
	},
	// Grand Finals Game 4 - Team 2 Player 1
	{
		id: 15,
		gameId: 4,
		teamId: TEAMS[1].id,
		accountId: 123458,
		player: 'Player3',
		characterFirstHalf: 'Ming',
		characterSecondHalf: 'Flavia',
		score: 250,
		damageScore: 190,
		kills: 15,
		knocks: 9,
		deaths: 11,
		assists: 4,
		damage: 2800
	},
	// Grand Finals Game 4 - Team 2 Player 2
	{
		id: 16,
		gameId: 4,
		teamId: TEAMS[1].id,
		accountId: 123459,
		player: 'Player4',
		characterFirstHalf: 'Flavia',
		characterSecondHalf: 'Ming',
		score: 240,
		damageScore: 180,
		kills: 14,
		knocks: 8,
		deaths: 12,
		assists: 5,
		damage: 2700
	},
	// Grand Finals Game 5 - Team 1 Player 1
	{
		id: 17,
		gameId: 5,
		teamId: TEAMS[0].id,
		accountId: 123456,
		player: 'Player1',
		characterFirstHalf: 'Ming',
		characterSecondHalf: 'Flavia',
		score: 280,
		damageScore: 210,
		kills: 18,
		knocks: 10,
		deaths: 9,
		assists: 3,
		damage: 3100
	},
	// Grand Finals Game 5 - Team 1 Player 2
	{
		id: 18,
		gameId: 5,
		teamId: TEAMS[0].id,
		accountId: 123457,
		player: 'Player2',
		characterFirstHalf: 'Nobunaga',
		characterSecondHalf: 'Reiichi',
		score: 250,
		damageScore: 190,
		kills: 15,
		knocks: 8,
		deaths: 11,
		assists: 5,
		damage: 2800
	},
	// Grand Finals Game 5 - Team 2 Player 1
	{
		id: 19,
		gameId: 5,
		teamId: TEAMS[1].id,
		accountId: 123458,
		player: 'Player3',
		characterFirstHalf: 'Celestia',
		characterSecondHalf: 'Celestia',
		score: 200,
		damageScore: 150,
		kills: 10,
		knocks: 6,
		deaths: 16,
		assists: 8,
		damage: 2300
	},
	// Grand Finals Game 5 - Team 2 Player 2
	{
		id: 20,
		gameId: 5,
		teamId: TEAMS[1].id,
		accountId: 123459,
		player: 'Player4',
		characterFirstHalf: 'Flavia',
		characterSecondHalf: 'Ming',
		score: 190,
		damageScore: 140,
		kills: 9,
		knocks: 5,
		deaths: 17,
		assists: 9,
		damage: 2200
	},
	// Semi Finals Game 1 - Team 2 Player 1
	{
		id: 21,
		gameId: 6,
		teamId: TEAMS[1].id,
		accountId: 123458,
		player: 'Player3',
		characterFirstHalf: 'Ming',
		characterSecondHalf: 'Flavia',
		score: 290,
		damageScore: 220,
		kills: 19,
		knocks: 11,
		deaths: 8,
		assists: 2,
		damage: 3200
	},
	// Semi Finals Game 1 - Team 2 Player 2
	{
		id: 22,
		gameId: 6,
		teamId: TEAMS[1].id,
		accountId: 123459,
		player: 'Player4',
		characterFirstHalf: 'Nobunaga',
		characterSecondHalf: 'Reiichi',
		score: 260,
		damageScore: 200,
		kills: 16,
		knocks: 9,
		deaths: 10,
		assists: 4,
		damage: 2900
	},
	// Semi Finals Game 1 - Team 4 Player 1
	{
		id: 23,
		gameId: 6,
		teamId: TEAMS[3].id,
		accountId: 123460,
		player: 'Player5',
		characterFirstHalf: 'Celestia',
		characterSecondHalf: 'Celestia',
		score: 180,
		damageScore: 130,
		kills: 8,
		knocks: 5,
		deaths: 18,
		assists: 10,
		damage: 2100
	},
	// Semi Finals Game 1 - Team 4 Player 2
	{
		id: 24,
		gameId: 6,
		teamId: TEAMS[3].id,
		accountId: 123461,
		player: 'Player6',
		characterFirstHalf: 'Flavia',
		characterSecondHalf: 'Ming',
		score: 160,
		damageScore: 120,
		kills: 6,
		knocks: 4,
		deaths: 19,
		assists: 11,
		damage: 1900
	},
	// Semi Finals Game 2 - Team 2 Player 1
	{
		id: 25,
		gameId: 7,
		teamId: TEAMS[1].id,
		accountId: 123458,
		player: 'Player3',
		characterFirstHalf: 'Reiichi',
		characterSecondHalf: 'Nobunaga',
		score: 270,
		damageScore: 210,
		kills: 17,
		knocks: 10,
		deaths: 9,
		assists: 3,
		damage: 3000
	},
	// Semi Finals Game 2 - Team 2 Player 2
	{
		id: 26,
		gameId: 7,
		teamId: TEAMS[1].id,
		accountId: 123459,
		player: 'Player4',
		characterFirstHalf: 'Celestia',
		characterSecondHalf: 'Celestia',
		score: 240,
		damageScore: 190,
		kills: 14,
		knocks: 8,
		deaths: 11,
		assists: 5,
		damage: 2700
	},
	// Semi Finals Game 2 - Team 4 Player 1
	{
		id: 27,
		gameId: 7,
		teamId: TEAMS[3].id,
		accountId: 123460,
		player: 'Player5',
		characterFirstHalf: 'Ming',
		characterSecondHalf: 'Flavia',
		score: 220,
		damageScore: 170,
		kills: 12,
		knocks: 7,
		deaths: 13,
		assists: 6,
		damage: 2500
	},
	// Semi Finals Game 2 - Team 4 Player 2
	{
		id: 28,
		gameId: 7,
		teamId: TEAMS[3].id,
		accountId: 123461,
		player: 'Player6',
		characterFirstHalf: 'Flavia',
		characterSecondHalf: 'Ming',
		score: 200,
		damageScore: 160,
		kills: 10,
		knocks: 6,
		deaths: 15,
		assists: 8,
		damage: 2300
	},
	// Semi Finals Game 3 - Team 2 Player 1
	{
		id: 29,
		gameId: 8,
		teamId: TEAMS[2].id,
		accountId: 123458,
		player: 'Player3',
		characterFirstHalf: 'Ming',
		characterSecondHalf: 'Flavia',
		score: 190,
		damageScore: 140,
		kills: 9,
		knocks: 6,
		deaths: 16,
		assists: 9,
		damage: 2200
	},
	// Semi Finals Game 3 - Team 2 Player 2
	{
		id: 30,
		gameId: 8,
		teamId: TEAMS[2].id,
		accountId: 123459,
		player: 'Player4',
		characterFirstHalf: 'Nobunaga',
		characterSecondHalf: 'Reiichi',
		score: 180,
		damageScore: 130,
		kills: 8,
		knocks: 5,
		deaths: 17,
		assists: 10,
		damage: 2100
	},
	// Semi Finals Game 3 - Team 4 Player 1
	{
		id: 31,
		gameId: 8,
		teamId: TEAMS[3].id,
		accountId: 123460,
		player: 'Player5',
		characterFirstHalf: 'Celestia',
		characterSecondHalf: 'Celestia',
		score: 260,
		damageScore: 200,
		kills: 16,
		knocks: 9,
		deaths: 10,
		assists: 4,
		damage: 2900
	},
	// Semi Finals Game 3 - Team 4 Player 2
	{
		id: 32,
		gameId: 8,
		teamId: TEAMS[3].id,
		accountId: 123461,
		player: 'Player6',
		characterFirstHalf: 'Flavia',
		characterSecondHalf: 'Ming',
		score: 240,
		damageScore: 190,
		kills: 14,
		knocks: 8,
		deaths: 11,
		assists: 5,
		damage: 2700
	},
	// Semi Finals Game 4 - Team 2 Player 1
	{
		id: 33,
		gameId: 9,
		teamId: TEAMS[2].id,
		accountId: 123458,
		player: 'Player3',
		characterFirstHalf: 'Reiichi',
		characterSecondHalf: 'Nobunaga',
		score: 280,
		damageScore: 220,
		kills: 18,
		knocks: 11,
		deaths: 8,
		assists: 2,
		damage: 3100
	},
	// Semi Finals Game 4 - Team 2 Player 2
	{
		id: 34,
		gameId: 9,
		teamId: TEAMS[2].id,
		accountId: 123459,
		player: 'Player4',
		characterFirstHalf: 'Celestia',
		characterSecondHalf: 'Celestia',
		score: 250,
		damageScore: 200,
		kills: 15,
		knocks: 9,
		deaths: 10,
		assists: 4,
		damage: 2800
	},
	// Semi Finals Game 4 - Team 4 Player 1
	{
		id: 35,
		gameId: 9,
		teamId: TEAMS[3].id,
		accountId: 123460,
		player: 'Player5',
		characterFirstHalf: 'Ming',
		characterSecondHalf: 'Flavia',
		score: 230,
		damageScore: 180,
		kills: 13,
		knocks: 8,
		deaths: 12,
		assists: 6,
		damage: 2600
	},
	// Semi Finals Game 4 - Team 4 Player 2
	{
		id: 36,
		gameId: 9,
		teamId: TEAMS[3].id,
		accountId: 123461,
		player: 'Player6',
		characterFirstHalf: 'Flavia',
		characterSecondHalf: 'Ming',
		score: 210,
		damageScore: 170,
		kills: 11,
		knocks: 7,
		deaths: 14,
		assists: 8,
		damage: 2400
	},
	// Semi Finals Game 5 - Team 2 Player 1
	{
		id: 37,
		gameId: 10,
		teamId: TEAMS[1].id,
		accountId: 123458,
		player: 'Player3',
		characterFirstHalf: 'Ming',
		characterSecondHalf: 'Flavia',
		score: 300,
		damageScore: 230,
		kills: 20,
		knocks: 12,
		deaths: 7,
		assists: 1,
		damage: 3300
	},
	// Semi Finals Game 5 - Team 2 Player 2
	{
		id: 38,
		gameId: 10,
		teamId: TEAMS[1].id,
		accountId: 123459,
		player: 'Player4',
		characterFirstHalf: 'Nobunaga',
		characterSecondHalf: 'Reiichi',
		score: 270,
		damageScore: 210,
		kills: 17,
		knocks: 10,
		deaths: 9,
		assists: 3,
		damage: 3000
	},
	// Semi Finals Game 5 - Team 4 Player 1
	{
		id: 39,
		gameId: 10,
		teamId: TEAMS[3].id,
		accountId: 123460,
		player: 'Player5',
		characterFirstHalf: 'Celestia',
		characterSecondHalf: 'Celestia',
		score: 160,
		damageScore: 120,
		kills: 6,
		knocks: 4,
		deaths: 20,
		assists: 12,
		damage: 1900
	},
	// Semi Finals Game 5 - Team 4 Player 2
	{
		id: 40,
		gameId: 10,
		teamId: TEAMS[3].id,
		accountId: 123461,
		player: 'Player6',
		characterFirstHalf: 'Flavia',
		characterSecondHalf: 'Ming',
		score: 150,
		damageScore: 110,
		kills: 5,
		knocks: 3,
		deaths: 21,
		assists: 13,
		damage: 1800
	}
];
