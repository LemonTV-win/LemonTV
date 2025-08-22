import { m } from '$lib/paraglide/messages';
import type { PageMetadata } from '$lib/seo';
import type { PageLoad } from './$types';

function isValidRegionSortBy(
	value: string
): value is
	| 'region-asc'
	| 'region-desc'
	| 'players-asc'
	| 'players-desc'
	| 'wins-asc'
	| 'wins-desc'
	| 'rating-asc'
	| 'rating-desc' {
	return [
		'region-asc',
		'region-desc',
		'players-asc',
		'players-desc',
		'wins-asc',
		'wins-desc',
		'rating-asc',
		'rating-desc'
	].includes(value);
}

export const load: PageLoad = async ({ data, url }) => {
	const sortBy = url.searchParams.get('regionSortBy') || 'players-desc';

	return {
		...data,
		sortBy: isValidRegionSortBy(sortBy) ? sortBy : 'players-desc',
		metadata: {
			title: `${m.region_ranking()} | ${m.strinova_player_profile()} | LemonTV`,
			description: m.region_ranking()
		} as PageMetadata
	};
};
