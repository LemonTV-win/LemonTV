import { readPlayerRatingsForComparison } from '../src/lib/server/data/stats';
import { db } from './lib/db';
import { createWriteStream } from 'node:fs';
import { resolve as resolvePath } from 'node:path';

function parseLambdaEnv(): number[] {
	// Accept comma-separated numeric list via env LAMBDAS, or default
	const raw = (import.meta as any).env?.LAMBDAS || process.env.LAMBDAS || '';
	const defaults = [1, 5, 10, 15, 20];
	if (!raw || typeof raw !== 'string') return defaults;
	const parsed = raw
		.split(',')
		.map((s) => Number(s.trim()))
		.filter((n) => Number.isFinite(n) && n >= 0);
	return parsed.length > 0 ? parsed : defaults;
}

function csvEscape(value: string | number): string {
	const str = String(value ?? '');
	if (str.includes(',') || str.includes('"') || str.includes('\n')) {
		return '"' + str.replace(/"/g, '""') + '"';
	}
	return str;
}

console.info('[Scripts][CompareRatingSystem] Generating CSV...');
const lambdas = parseLambdaEnv();
const rows = await readPlayerRatingsForComparison(db, lambdas);

// Header
const headers = [
	'player_id',
	'player_name',
	'rating_v1',
	...lambdas.map((l) => `rating_v2_lambda_${l}`),
	'total_games',
	'total_wins',
	'total_losses',
	'total_kills',
	'total_deaths',
	'total_assists',
	'total_knocks',
	'total_score',
	'total_damage',
	'win_rate',
	'kd',
	'average_score',
	'average_damage',
	'events_count'
];
function parseOutputPath(): string {
	const envAny = (import.meta as any).env || {};
	const raw = envAny.CSV_OUTPUT || envAny.OUTPUT || process.env.CSV_OUTPUT || process.env.OUTPUT;
	const fallback = 'compared.csv';
	const target = typeof raw === 'string' && raw.trim().length > 0 ? raw.trim() : fallback;
	return resolvePath(process.cwd(), target);
}

const outPath = parseOutputPath();
const out = createWriteStream(outPath, { encoding: 'utf8' });
out.write(headers.join(',') + '\n');

for (const r of rows) {
	const base = [csvEscape(r.playerId), csvEscape(r.playerName), csvEscape(r.ratingv1.toFixed(6))];
	const v2Cols = lambdas.map((l) => csvEscape((r.v2Ratings[String(l)] ?? 0).toFixed(6)));
	const metrics = [
		r.totalGames,
		r.totalWins,
		r.totalLosses,
		r.totalKills,
		r.totalDeaths,
		r.totalAssists,
		r.totalKnocks,
		r.totalScore,
		r.totalDamage,
		Number(r.winRate.toFixed(6)),
		Number(r.kd.toFixed(6)),
		Number(r.averageScore.toFixed(6)),
		Number(r.averageDamage.toFixed(6)),
		r.eventsCount
	].map(csvEscape);
	out.write([...base, ...v2Cols, ...metrics].join(',') + '\n');
}
await new Promise<void>((resolve) => {
	out.end(resolve);
});

console.info(`[Scripts][CompareRatingSystem] Wrote CSV to ${outPath}`);
