import { type Player } from '$lib/data/players';
import { type Team } from '$lib/data/teams';
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

export function isPlayerInTeam(id: string, team: Team) {
	return team.players?.some((player) => identifyPlayer(id, player)) ?? false;
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
