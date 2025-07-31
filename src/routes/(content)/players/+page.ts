import type { PageMetadata } from '$lib/seo';
import type { PageLoad } from './$types';
import { m } from '$lib/paraglide/messages';
import { countries, type TCountryCode } from 'countries-list';
import { CHARACTERS, type Character } from '$lib/data/game';

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

function isValidActiveTab(value: string): value is 'players' | 'region-ranking' {
	return ['players', 'region-ranking'].includes(value);
}

function isValidNationality(value: string): value is TCountryCode {
	return Object.keys(countries).includes(value);
}

function isValidSuperstring(value: string): value is Character {
	return Object.keys(CHARACTERS).includes(value);
}

export const load: PageLoad = async ({ data, url }) => {
	const activeTab = url.searchParams.get('activeTab') || 'players';

	const search = url.searchParams.get('search') || '';
	const sortBy = url.searchParams.get('sortBy') || 'rating-desc';
	const regionSortBy = url.searchParams.get('regionSortBy') || 'players-desc';

	const nationalities = url.searchParams.get('nationalities') || '';
	const superstrings = url.searchParams.get('superstrings') || '';

	return {
		...data,
		activeTab: isValidActiveTab(activeTab) ? activeTab : 'players',
		search,
		sortBy: isValidSortBy(sortBy) ? sortBy : 'rating-desc',
		regionSortBy: isValidRegionSortBy(regionSortBy) ? regionSortBy : 'players-desc',
		nationalities: nationalities ? nationalities.split(',').filter(isValidNationality) : [],
		superstrings: superstrings ? superstrings.split(',').filter(isValidSuperstring) : [],
		metadata: {
			title: `${m.players()} | LemonTV`,
			description: m.players_description()
		} as PageMetadata
	};
};
