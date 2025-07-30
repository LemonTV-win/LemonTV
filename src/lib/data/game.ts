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

export type PUSCharacter =
	| 'Yvette'
	| 'Nobunaga'
	| 'Kokona'
	| 'Michele'
	| 'Flavia'
	| 'Yugiri'
	| 'Leona'
	| 'Chiyo';
export type ScissorsCharacter =
	| 'Reiichi'
	| 'Lawine'
	| 'Ming'
	| 'Meredith'
	| 'Eika'
	| 'Kanami'
	| 'Fragrans'
	| 'Mara';
export type UrbinoCharacter =
	| 'Audrey'
	| 'Celestia'
	| 'Maddelena'
	| 'Bai Mo'
	| 'Fuschia'
	| 'Galatea';

export type Character = PUSCharacter | ScissorsCharacter | UrbinoCharacter;
