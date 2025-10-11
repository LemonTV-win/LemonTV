import type { PageMetadata } from '$lib/seo';
import type { PageLoad } from './$types';
import { m } from '$lib/paraglide/messages';
// Type guard for sortBy validation
function isValidSortBy(
	value: string
): value is
	| 'score-asc'
	| 'score-desc'
	| 'damageScore-asc'
	| 'damageScore-desc'
	| 'kills-asc'
	| 'kills-desc'
	| 'deaths-asc'
	| 'deaths-desc'
	| 'assists-asc'
	| 'assists-desc'
	| 'damage-asc'
	| 'damage-desc'
	| 'player-asc'
	| 'player-desc' {
	return [
		'score-asc',
		'score-desc',
		'damageScore-asc',
		'damageScore-desc',
		'kills-asc',
		'kills-desc',
		'deaths-asc',
		'deaths-desc',
		'assists-asc',
		'assists-desc',
		'damage-asc',
		'damage-desc',
		'player-asc',
		'region-desc',
		'team-asc',
		'team-desc',
		'kd-asc',
		'kd-desc'
	].includes(value);
}

export const load: PageLoad = async ({ data, url }) => {
	const sortBy = url.searchParams.get('sortBy') || 'score-desc';
	const gameId = url.searchParams.get('game');

	return {
		...data,
		sortBy: isValidSortBy(sortBy) ? sortBy : 'score-desc',
		gameId: gameId ? parseInt(gameId) : undefined,
		metadata: {
			title: `${data.match.teams[0]?.team?.name} vs. ${data.match.teams[1]?.team?.name} | ${m.matches()} | LemonTV`,
			description: m.players_description()
		} as PageMetadata
	};
};
