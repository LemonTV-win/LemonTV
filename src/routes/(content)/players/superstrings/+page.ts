import { m } from '$lib/paraglide/messages';
import type { PageMetadata } from '$lib/seo';
import type { PageLoad } from './$types';
import { CHARACTERS, type Character } from '$lib/data/game';

type SuperstringSortBy =
	| 'power-asc'
	| 'power-desc'
	| 'games-asc'
	| 'games-desc'
	| 'wins-asc'
	| 'wins-desc'
	| 'name-asc'
	| 'name-desc';

function isValidSortBy(value: string): value is SuperstringSortBy {
	return [
		'power-asc',
		'power-desc',
		'games-asc',
		'games-desc',
		'wins-asc',
		'wins-desc',
		'name-asc',
		'name-desc'
	].includes(value);
}

function isValidCharacter(value: string): value is Character {
	return (CHARACTERS as readonly string[]).includes(value);
}

export const load: PageLoad = async ({ data, url }) => {
	const sortBy = url.searchParams.get('sortBy') || 'power-desc';
	const character = url.searchParams.get('character') || 'Yvette';

	return {
		...data,
		sortBy: isValidSortBy(sortBy) ? sortBy : 'power-desc',
		selectedCharacter: isValidCharacter(character) ? character : 'Yvette',
		metadata: {
			title: `${m.superstring_power()} | ${m.strinova_player_profile()} | LemonTV`,
			description: m.superstring_power() // TODO: Add description
		} as PageMetadata
	};
};
