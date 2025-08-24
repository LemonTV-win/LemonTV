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

export const MAP_IMAGES: Record<GameMap, string> = {
	base_404:
		'https://klbq-web-cms.strinova.com/prod/strinova_web/images/202411/830d991d-24ce-4c00-92e9-2b4eb5ff703c.jpg',
	area_88:
		'https://klbq-web-cms.strinova.com/prod/strinova_web/images/202411/24c1ac4e-40d0-4383-a060-15bb59db183e.jpg',
	port_euler:
		'https://klbq-web-cms.strinova.com/prod/strinova_web/images/202411/e46ea826-5ff4-465a-b575-fe5f29e02cd5.jpg',
	windy_town:
		'https://klbq-web-cms.strinova.com/prod/strinova_web/images/202411/47755586-4bf9-465d-9e88-566c70fab0bc.jpg',
	space_lab:
		'https://klbq-web-cms.strinova.com/prod/strinova_web/images/202411/be6f044e-0ace-4b85-89f5-0c8710b9c1fd.jpg',
	cauchy_district:
		'https://klbq-web-cms.strinova.com/prod/strinova_web/images/202411/f704a413-6e0b-476b-bec5-a442a890079e.jpg',
	cosmite:
		'https://klbq-web-cms.strinova.com/prod/strinova_web/images/202411/c0951e88-691f-4698-8c27-e65ab25ff166.jpg',
	ocarnus:
		'https://static.wikitide.net/strinovawiki/thumb/9/9d/Intro_Ocarnus.png/450px-Intro_Ocarnus.png'
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

export const FACTIONS = ['PUS', 'Scissors', 'Urbino'] as const;

export type Faction = (typeof FACTIONS)[number];

export const FACTION_NAMES: Record<Faction, () => string> = {
	PUS: m['game.faction.PUS'],
	Scissors: m['game.faction.Scissors'],
	Urbino: m['game.faction.Urbino']
};

// #endregion
