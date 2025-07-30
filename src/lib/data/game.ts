import { m } from '$lib/paraglide/messages';

export type Region =
	| 'CN' // China
	| 'APAC' // Asia Pacific
	| 'NA' // North America
	| 'SA' // South America
	| 'EU' // Europe
	| 'WA' // Western Asia
	| 'Global';

export type GameMap =
	| 'base_404'
	| 'space_lab'
	| 'windy_town'
	| 'area_88'
	| 'port_euler'
	| 'cosmite'
	| 'orcanus'
	| 'cauchy_district';

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
	'Fuschia',
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
	Fuschia: m.Fuschia,
	Galatea: m.Galatea,
	Celestia: m.Celestia
};

// #endregion
