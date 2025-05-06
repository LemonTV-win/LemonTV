import { players, type Player } from '$lib/data/players';
import { teams, type Team } from '$lib/data/teams';
import type { Character } from '$lib/data/game';
import type { Match } from '$lib/data/matches';
import { events, type Event } from '$lib/data/events';

export function getEvents() {
	return events;
}

export function getEvent(id: string) {
	if (!isNaN(Number(id))) {
		return events.find((event) => event.id === Number(id));
	}
	return events.find((event) => event.slug === id);
}

export function getMatches(): (Match & { event: Event })[] {
	return getEvents().flatMap((event) =>
		event.stages.flatMap((stage) =>
			stage.matches.map((match) => ({
				...match,
				event
			}))
		)
	);
}

export function getMatch(id: number) {
	return getMatches().find((match) => match.id === id);
}

export function getTeams() {
	return Object.entries(teams).map(([id, team]) => ({
		wins: events
			.flatMap((event) => event.stages.flatMap((stage) => stage.matches))
			.filter(
				(match) =>
					match.teams.some((t) => t.team?.name === team.name) &&
					match.teams[calculateWinnerIndex(match) - 1].team.name === team.name
			).length,
		...team
	}));
}

export function getTeam(id: string): Team | null {
	return teams[id] ?? Object.values(teams).find((team) => team.id === id) ?? null;
}

export function getTeamMatches(id: string): (Match & { event: Event; teamIndex: number })[] {
	return getMatches()
		.filter((match) => match.teams.some((team) => team.team?.id === id))
		.map((match) => ({
			...match,
			teamIndex: match.teams.findIndex((team) => team.team?.id === id)
		}));
}

export function getTeamMemberStatistics(team: Team): Record<
	string,
	{
		kd: number;
		rating: number;
		characters: [Character, number][];
	}
> | null {
	return Object.fromEntries(
		team.players?.filter(Boolean).map((player) => [
			player.id ?? '',
			{
				kd: calculatePlayerKD(player),
				rating: calculatePlayerRating(player),
				characters: getPlayerAgents(player)
			}
		]) ?? []
	);
}

export function getPlayers() {
	return Object.values(players).map((player) => ({
		...player,
		wins: getPlayerWins(player.id ?? ''),
		rating: calculatePlayerRating(player)
	}));
}

export function getPlayer(id: string) {
	return players[id];
}

export function identifyPlayer(id: string, player: Player): boolean {
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

export function isPlayerInTeam(id: string, team: Team) {
	return [...(team.players ?? []), ...(team.substitutes ?? [])]?.some(
		(player) => player && identifyPlayer(id, player) // TODO: Use more robust method
	);
}

export function getPlayerTeams(id: string) {
	return [
		...new Set(
			getTeams()
				.filter((team) => isPlayerInTeam(id, team))
				.map((team) => team.id)
		)
	].map((id) => getTeams().find((team) => team.id === id)!);
}

export function getPlayerEvents(id: string) {
	return getEvents().filter((event) =>
		event.participants.some(({ team }) => isPlayerInTeam(id, team))
	);
}

export function getPlayerMatches(
	id: string
): (Match & { playerTeamIndex: number; event: Event })[] {
	return getMatches()
		.filter((match) => match.teams.some((team) => isPlayerInTeam(id, team.team)))
		.map((match) => ({
			...match,
			playerTeamIndex: match.teams.findIndex((team) =>
				[...(team.team.players ?? []), ...(team.team.substitutes ?? [])].some(
					(player) => player && identifyPlayer(id, player)
				)
			)
		}));
}

export function calculateWinnerIndex(match: Match): number {
	if (match.teams.length !== 2) {
		throw new Error('Match must have 2 and only 2 teams');
	}

	const team1 = match.teams[0];
	const team2 = match.teams[1];

	if (team1.score === team2.score) {
		throw new Error('Match cannot be a draw');
	}

	return team1.score > team2.score ? 1 : 2;
}

export function getPlayerWins(id: string): number {
	return getPlayerMatches(id).filter((match) => {
		return calculateWinnerIndex(match) === match.playerTeamIndex + 1;
	}).length;
}

export function getPlayerAgents(player: Player): [Character, number][] {
	const characters = getPlayerMatches(player.id ?? '')
		.flatMap((match) =>
			(match.games ?? []).flatMap((game) => {
				for (const score of game.scores[match.playerTeamIndex]) {
					if (identifyPlayer(score.player, player)) {
						return score.characters;
					}
				}
			})
		)
		.filter(Boolean) as Character[];

	// Count occurrences of each character
	const characterCounts = new Map<Character, number>();
	for (const character of characters) {
		characterCounts.set(character, (characterCounts.get(character) ?? 0) + 1);
	}

	// Convert to array of tuples
	return Array.from(characterCounts.entries());
}

export function getPlayersAgents(limit: number = 3): Record<string, [Character, number][]> {
	return Object.fromEntries(
		Object.entries(players).map(([id, player]) => [id, getPlayerAgents(player).slice(0, limit)])
	);
}

export function getPlayersTeams(limit: number = 3): Record<string, Team[]> {
	return Object.fromEntries(
		Object.entries(players).map(([id, _player]) => [id, getPlayerTeams(id).slice(0, limit)])
	);
}

export function calculatePlayerRating(player: Player) {
	if (!player.id) {
		return 0;
	}

	const matches = getPlayerMatches(player.id);
	if (!matches || matches.length === 0) {
		return 0;
	}

	const scores = matches
		.flatMap((match) => {
			const playerTeamIndex = match.playerTeamIndex;

			const playerScore = match.games?.flatMap((game) =>
				game.scores[playerTeamIndex]
					.filter((score) => identifyPlayer(score.player, player))
					.map((score) => score.score)
			);

			return playerScore;
		})
		.filter(Boolean) as number[];

	const averageScore = scores.reduce((acc, score) => acc + score, 0) / scores.length;

	return isNaN(averageScore) ? 0 : averageScore / 200;
}

function calculatePlayerKD(player: Player): number {
	const matches = getPlayerMatches(player.id ?? '');
	return matches.reduce((acc, match) => {
		const playerTeamIndex = match.playerTeamIndex;
		const opponentTeamIndex = 1 - playerTeamIndex;

		if (!match.games) {
			return acc;
		}

		const kills = match.games
			?.flatMap((game) =>
				game.scores[playerTeamIndex]
					.filter((score) => identifyPlayer(score.player, player))
					.map((score) => score.kills)
					.reduce((acc, kill) => acc + kill, 0)
			)
			.reduce((acc, kill) => acc + kill, 0);

		const deaths = match.games
			?.flatMap((game) =>
				game.scores[playerTeamIndex]
					.filter((score) => identifyPlayer(score.player, player))
					.map((score) => score.deaths)
			)
			.reduce((acc, death) => acc + death, 0);

		console.log('KD', kills, deaths);

		return kills / deaths;
	}, 0);
}

export function getTeamStatistics(team: Team): {
	ranking: number;
	wins: number;
} {
	const matches = getTeamMatches(team.id);
	const teams = getTeams();
	const sortedByWins = teams.sort((a, b) => b.wins - a.wins);

	return {
		ranking: sortedByWins.findIndex((t) => t.id === team.id) + 1,
		wins: matches.filter(
			(match) =>
				calculateWinnerIndex(match) === match.teams.findIndex((t) => t.team?.id === team.id) + 1
		).length
	};
}
