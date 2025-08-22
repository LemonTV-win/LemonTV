import { PLAYERS } from './players';

// Seed all players with diverse pro settings
export const PRO_SETTINGS = PLAYERS.map((p, idx) => {
	const dpiOptions = [400, 800, 1200, 1600, 2400, 3200];
	const mouseModels = [
		'Logitech G Pro X Superlight',
		'Razer Viper V2 Pro',
		'Zowie EC2',
		'Finalmouse Starlight',
		'SteelSeries Prime Pro',
		'Glorious Model O',
		'Endgame Gear XM1r',
		'Vaxee ZYGEN NP-01',
		'Logitech G Pro Wireless',
		'Razer DeathAdder V3 Pro',
		'Zowie FK2-C',
		'SteelSeries Aerox 3',
		'Corsair M65 RGB Elite',
		'HyperX Pulsefire Haste',
		'Cooler Master MM711',
		'ASUS ROG Gladius III'
	];
	const dpi = dpiOptions[idx % dpiOptions.length];
	const sensitivity = [0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5][idx % 8];
	const pollingRateHz = [500, 1000, 2000][idx % 3];
	const windowsPointerSpeed = [5, 6, 7, 8][idx % 4];
	const mouseSmoothing = idx % 4 === 0 ? true : false;
	const mouseModel = mouseModels[idx % mouseModels.length];

	return {
		playerId: p.id,
		dpi,
		sensitivity,
		pollingRateHz,
		windowsPointerSpeed,
		mouseSmoothing,
		mouseModel,
		verticalSensMultiplier: [0.8, 0.9, 1.0, 1.1, 1.2][idx % 5],
		shoulderFireSensMultiplier: [0.9, 0.95, 1.0, 1.05, 1.1][idx % 5],
		adsSens1_25x: [0.8, 0.9, 1.0, 1.1, 1.2][idx % 5],
		adsSens1_5x: [0.8, 0.9, 1.0, 1.1, 1.2][idx % 5],
		adsSens2_5x: [0.75, 0.85, 1.0, 1.15, 1.25][idx % 5],
		adsSens4_0x: [0.7, 0.8, 1.0, 1.2, 1.3][idx % 5]
	} as const;
});
