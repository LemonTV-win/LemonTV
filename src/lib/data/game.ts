import { m } from '$lib/paraglide/messages';

export type Region =
	| 'CN' // China
	| 'APAC' // Asia Pacific
	| 'NA' // North America
	| 'SA' // South America
	| 'EU' // Europe
	| 'WA' // Western Asia
	| 'Global';

// #region Maps
export const MAPS = [
	'base_404',
	'area_88',
	'port_euler',
	'windy_town',
	'space_lab',
	'cauchy_district',
	'cosmite',
	'ocarnus'
] as const;
export type GameMap = (typeof MAPS)[number];

export const MAP_NAMES: Record<GameMap, () => string> = {
	base_404: m['game.map.base_404'],
	area_88: m['game.map.area_88'],
	port_euler: m['game.map.port_euler'],
	space_lab: m['game.map.space_lab'],
	windy_town: m['game.map.windy_town'],
	cauchy_district: m['game.map.cauchy_district'],
	cosmite: m['game.map.cosmite'],
	ocarnus: m['game.map.ocarnus']
};
// #endregion

// #region Characters
export const PUS_CHARACTERS = [
	'Yvette',
	'Nobunaga',
	'Kokona',
	'Michele',
	'Flavia',
	'Yugiri',
	'Leona',
	'Chiyo'
] as const;

export const SCISORS_CHARACTERS = [
	'Reiichi',
	'Lawine',
	'Ming',
	'Meredith',
	'Eika',
	'Kanami',
	'Fragrans',
	'Mara'
] as const;

export const URBINO_CHARACTERS = [
	'Audrey',
	'Celestia',
	'Maddelena',
	'Bai Mo',
	'Fuchsia',
	'Galatea'
] as const;

export type PUSCharacter = (typeof PUS_CHARACTERS)[number];
export type ScissorsCharacter = (typeof SCISORS_CHARACTERS)[number];
export type UrbinoCharacter = (typeof URBINO_CHARACTERS)[number];

export const CHARACTERS = [...PUS_CHARACTERS, ...SCISORS_CHARACTERS, ...URBINO_CHARACTERS] as const;

export type Character = (typeof CHARACTERS)[number];

export const CHARACTER_NAMES: Record<Character, () => string> = {
	// P.U.S
	Yvette: m['game.character.Yvette'],
	Nobunaga: m['game.character.Nobunaga'],
	Kokona: m['game.character.Kokona'],
	Michele: m['game.character.Michele'],
	Flavia: m['game.character.Flavia'],
	Yugiri: m['game.character.Yugiri'],
	Leona: m['game.character.Leona'],
	Chiyo: m['game.character.Chiyo'],

	// The Scissors
	Reiichi: m['game.character.Reiichi'],
	Lawine: m['game.character.Lawine'],
	Ming: m['game.character.Ming'],
	Meredith: m['game.character.Meredith'],
	Eika: m['game.character.Eika'],
	Kanami: m['game.character.Kanami'],
	Fragrans: m['game.character.Fragrans'],
	Mara: m['game.character.Mara'],

	// Urbino
	Audrey: m['game.character.Audrey'],
	Maddelena: m['game.character.Maddelena'],
	'Bai Mo': m['game.character.Bai Mo'],
	Fuchsia: m['game.character.Fuchsia'],
	Galatea: m['game.character.Galatea'],
	Celestia: m['game.character.Celestia']
};

// #endregion
