import { PLAYERS } from './players';

// Seed a subset of players with simple, latest-only Strinova settings
export const PRO_SETTINGS = PLAYERS.slice(0, 16).map((p, idx) => {
	const dpiOptions = [400, 800, 1200, 1600];
	const mouseModels = [
		'Logitech G Pro X Superlight',
		'Razer Viper V2 Pro',
		'Zowie EC2',
		'Finalmouse Starlight'
	];
	const dpi = dpiOptions[idx % dpiOptions.length];
	const sensitivity = [0.2, 0.25, 0.3, 0.35, 0.4][idx % 5];
	const pollingRateHz = [500, 1000][idx % 2];
	const windowsPointerSpeed = [6, 6, 6, 7, 5][idx % 5];
	const mouseSmoothing = idx % 3 === 0 ? true : false;
	const mouseModel = mouseModels[idx % mouseModels.length];

	return {
		playerId: p.id,
		dpi,
		sensitivity,
		pollingRateHz,
		windowsPointerSpeed,
		mouseSmoothing,
		mouseModel,
		verticalSensMultiplier: [1.0, 0.9, 1.1][idx % 3],
		shoulderFireSensMultiplier: [1.0, 0.95, 1.05][idx % 3],
		adsSens1_25x: [1.0, 0.9, 1.1][(idx + 1) % 3],
		adsSens1_5x: [1.0, 0.9, 1.1][(idx + 2) % 3],
		adsSens2_5x: [1.0, 0.85, 1.15][idx % 3],
		adsSens4_0x: [1.0, 0.8, 1.2][idx % 3]
	} as const;
});
