import type { Character } from '$lib/data/game';
import type { CompiledTeam } from '$lib/data';
import { calculatePlayerKD, calculatePlayerRating, getPlayerAgents } from './players';

export function getTeamMemberStatistics(team: CompiledTeam): Record<
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
