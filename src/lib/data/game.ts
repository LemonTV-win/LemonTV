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
	'orcanus'
] as const;
export type GameMap = (typeof MAPS)[number];

export const MAP_NAMES: Record<GameMap, () => string> = {
	base_404: m.base_404,
	area_88: m.area_88,
	port_euler: m.port_euler,
	space_lab: m.space_lab,
	windy_town: m.windy_town,
	cauchy_district: m.cauchy_district,
	cosmite: m.cosmite,
	orcanus: m.orcanus
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
	Yvette: m.Yvette,
	Nobunaga: m.Nobunaga,
	Kokona: m.Kokona,
	Michele: m.Michele,
	Flavia: m.Flavia,
	Yugiri: m.Yugiri,
	Leona: m.Leona,
	Chiyo: m.Chiyo,

	// The Scissors
	Reiichi: m.Reiichi,
	Lawine: m.Lawine,
	Ming: m.Ming,
	Meredith: m.Meredith,
	Eika: m.Eika,
	Kanami: m.Kanami,
	Fragrans: m.Fragrans,
	Mara: m.Mara,

	// Urbino
	Audrey: m.Audrey,
	Maddelena: m.Maddelena,
	'Bai Mo': m['Bai Mo'],
	Fuchsia: m.Fuchsia,
	Galatea: m.Galatea,
	Celestia: m.Celestia
};

// #endregion
