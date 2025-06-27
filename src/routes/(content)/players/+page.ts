import type { PageMetadata } from '$lib/seo';
import type { PageLoad } from './$types';
import { m } from '$lib/paraglide/messages';

// Type guard for sortBy validation
function isValidSortBy(
	value: string
): value is
	| 'name-abc'
	| 'name-cba'
	| 'wins-asc'
	| 'wins-desc'
	| 'rating-asc'
	| 'rating-desc'
	| 'region-asc'
	| 'region-desc'
	| 'team-asc'
	| 'team-desc'
	| 'kd-asc'
	| 'kd-desc' {
	return [
		'name-abc',
		'name-cba',
		'wins-asc',
		'wins-desc',
		'rating-asc',
		'rating-desc',
		'region-asc',
		'region-desc',
		'team-asc',
		'team-desc',
		'kd-asc',
		'kd-desc'
	].includes(value);
}

export const load: PageLoad = async ({ data, url }) => {
	const search = url.searchParams.get('search') || '';
	const sortBy = url.searchParams.get('sortBy') || 'name-abc';
	const nationalities = url.searchParams.get('nationalities') || '';
	const superstrings = url.searchParams.get('superstrings') || '';

	return {
		...data,
		search,
		sortBy: isValidSortBy(sortBy) ? sortBy : 'name-abc',
		nationalities: nationalities ? nationalities.split(',') : [],
		superstrings: superstrings ? superstrings.split(',') : [],
		metadata: {
			title: `${m.players()} | LemonTV`,
			description: m.players_description()
		} as PageMetadata
	};
};
