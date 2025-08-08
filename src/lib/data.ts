import { type Player } from '$lib/data/players';
import type { Match } from '$lib/data/matches';

export function identifyPlayer(id: string, player: Player | string): boolean {
	if (typeof player === 'string') {
		return player === id;
	}

	return (
		player.id === id ||
		player.slug === id ||
		player.name === id ||
		(player.gameAccounts?.some(
			(account) => account.currentName === id || account.names?.includes(id)
		) ??
			false) ||
		(player.aliases?.includes(id) ?? false)
	);
}

export function calculateMatchScoreFromGames(match: {
	games: {
		winner: number;
	}[];
}): [number, number] {
	if (!match.games || match.games.length === 0) {
		return [0, 0];
	}

	let team1Wins = 0;
	let team2Wins = 0;

	for (const game of match.games) {
		if (game.winner === 0) {
			team1Wins++;
		} else if (game.winner === 1) {
			team2Wins++;
		}
	}

	return [team1Wins, team2Wins];
}

export function calculateWinnerIndex(match: {
	teams: {
		score: number;
	}[];
	games: {
		winner: number;
	}[];
}): number | null {
	if (match.teams.length !== 2) {
		throw new Error('Match must have 2 and only 2 teams');
	}

	// If match scores are not set, calculate them from games
	let team1Score = match.teams[0].score;
	let team2Score = match.teams[1].score;

	if (team1Score === undefined || team2Score === undefined) {
		const [score1, score2] = calculateMatchScoreFromGames(match);
		team1Score = score1;
		team2Score = score2;
	}

	if (team1Score === team2Score) {
		return null; // Draw - no winner
	}

	return team1Score > team2Score ? 1 : 2;
}
