#!/usr/bin/env bun
import { ESLint } from 'eslint';
import fg from 'fast-glob';
import { select } from '@inquirer/prompts';
import chalk from 'chalk';
import { basename, sep } from 'node:path';
import { performance } from 'node:perf_hooks';

type Msg = {
	ruleId?: string | null;
	line?: number;
	column?: number;
	message: string;
	severity: 0 | 1 | 2;
};
type Res = { filePath: string; messages: Msg[] };

const ruleKey = (id?: string | null) => id ?? '<no-rule-id>';
const sevLabel = (s: number) => (s === 2 ? 'error' : s === 1 ? 'warn' : 'info');
const sevColor = (s: number) => (s === 2 ? chalk.red : s === 1 ? chalk.yellow : chalk.cyan);
const byLocale = (a: string, b: string) => a.localeCompare(b);

const isTTY = process.stdout.isTTY === true;

function bar(done: number, total: number, width = 24) {
	if (total <= 0) return ''.padEnd(width, ' ');
	const ratio = Math.max(0, Math.min(1, done / total));
	const fill = Math.round(ratio * width);
	return chalk.green('█').repeat(fill) + chalk.dim('░').repeat(width - fill);
}

function fmtNs(ms: number) {
	if (ms < 1000) return `${ms | 0}ms`;
	const s = ms / 1000;
	if (s < 60) return `${s.toFixed(1)}s`;
	const m = Math.floor(s / 60);
	const rs = (s % 60).toFixed(0).padStart(2, '0');
	return `${m}m${rs}s`;
}

async function collectFiles(targets: string[]) {
	// If the user passed explicit files/globs, respect them; otherwise scan common extensions.
	const patterns = targets.length > 0 ? targets : ['**/*.{js,jsx,ts,tsx,svelte}'];

	const entries = await fg(patterns, {
		ignore: [
			'**/node_modules/**',
			'**/dist/**',
			'**/.svelte-kit/**',
			'**/build/**',
			'**/coverage/**',
			'**/.git/**'
		],
		dot: false,
		onlyFiles: true,
		unique: true,
		followSymbolicLinks: true
	});
	return entries;
}

async function filterIgnored(eslint: ESLint, files: string[]) {
	const out: string[] = [];
	for (const f of files) {
		// Respect .eslintignore / ignorePatterns
		const ignored = await eslint.isPathIgnored(f);
		if (!ignored) out.push(f);
	}
	return out;
}

async function lintWithProgress(eslint: ESLint, files: string[], chunkSize = 5) {
	const results: Res[] = [];
	const total = files.length;
	let done = 0;
	const t0 = performance.now();

	const update = (prefix: string) => {
		if (!isTTY) return;
		const line = `${prefix} ${bar(done, total)}  ${done}/${total}  ${chalk.dim(fmtNs(performance.now() - t0))}`;
		process.stdout.write(
			'\r' + line + ' '.repeat(Math.max(0, process.stdout.columns - line.length))
		);
	};

	if (isTTY) {
		process.stdout.write(chalk.dim('Discovering files…') + '\r');
	}

	// Lint in batches to keep memory reasonable and allow interactive progress
	for (let i = 0; i < files.length; i += chunkSize) {
		const batch = files.slice(i, i + chunkSize);
		// Optional: short status about current file
		if (isTTY) {
			const hint = basename(batch[0] ?? '');
			update(`${chalk.bold('ESLint')} ${chalk.dim('linting…')} ${chalk.cyan(hint)}`);
		} else if (i === 0) {
			console.log(`Linting ${files.length} files…`);
		}

		const r = (await eslint.lintFiles(batch)) as Res[];
		results.push(...r);
		done += batch.length;
		if (isTTY) update(`${chalk.bold('ESLint')} ${chalk.dim('linting…')}`);
	}

	if (isTTY) {
		process.stdout.write('\n');
	}
	return results;
}

async function run() {
	const argv = process.argv.slice(2);
	const eslint = new ESLint(); // uses your project config

	const all = await collectFiles(argv);
	const files = await filterIgnored(eslint, all);

	if (files.length === 0) {
		console.log(chalk.green('✔ No matching source files (after ignore).'));
		process.exit(0);
	}

	// Progress + lint
	const results = await lintWithProgress(eslint, files);

	// Aggregate
	let totalErrors = 0;
	let totalWarnings = 0;
	const perRule = new Map<string, { errors: number; warnings: number }>();
	const bucket = new Map<string, Array<{ file: string; msg: Msg }>>();

	for (const r of results) {
		for (const m of r.messages) {
			const key = ruleKey(m.ruleId);
			const entry = perRule.get(key) ?? { errors: 0, warnings: 0 };
			if (m.severity === 2) entry.errors++;
			else if (m.severity === 1) entry.warnings++;
			perRule.set(key, entry);
			(bucket.get(key) ?? bucket.set(key, []).get(key)!).push({ file: r.filePath, msg: m });
			if (m.severity === 2) totalErrors++;
			else if (m.severity === 1) totalWarnings++;
		}
	}

	// Summary
	console.log(
		chalk.bold('ESLint summary') +
			'  ' +
			chalk.red(`errors: ${totalErrors}`) +
			'  ' +
			chalk.yellow(`warnings: ${totalWarnings}`)
	);

	if (perRule.size === 0) {
		console.log(chalk.green('✔ No lint messages. Nothing to focus.'));
		process.exit(0);
	}

	// Rule picker from *observed* rules
	const choices = [...perRule.entries()]
		.sort(([a], [b]) => byLocale(a, b))
		.map(([rule, { errors, warnings }]) => {
			const right = [
				errors ? chalk.red(`E:${errors}`) : null,
				warnings ? chalk.yellow(`W:${warnings}`) : null
			]
				.filter(Boolean)
				.join(' ');
			const name = right ? `${rule}  ${right}` : rule;
			return { name, value: rule };
		});

	const selectedRule = await select({
		message: 'Focus ESLint rule to display',
		pageSize: 16,
		choices
	});

	const hits = bucket.get(selectedRule) ?? [];
	if (hits.length === 0) {
		console.log(chalk.dim(`No messages for "${selectedRule}".`));
		process.exit(0);
	}

	// Sort and print
	hits.sort((a, b) =>
		a.file === b.file
			? (a.msg.line ?? 0) - (b.msg.line ?? 0) || (a.msg.column ?? 0) - (b.msg.column ?? 0)
			: byLocale(a.file, b.file)
	);

	const { errors, warnings } = perRule.get(selectedRule)!;
	console.log(
		chalk.bold(`\n[${selectedRule}]`) +
			'  ' +
			(errors ? chalk.red(`errors: ${errors}`) + '  ' : '') +
			(warnings ? chalk.yellow(`warnings: ${warnings}`) : '')
	);

	for (const { file, msg } of hits) {
		const color = sevColor(msg.severity);
		const where = `${file}:${msg.line ?? 0}:${msg.column ?? 0}`;
		const sev = color(sevLabel(msg.severity).padEnd(5, ' '));
		const rule = chalk.dim(`[${ruleKey(msg.ruleId)}]`);
		console.log(`${where}  ${sev} ${rule} ${msg.message}`);
	}

	process.exit(1);
}

run().catch((e) => {
	if (isTTY) process.stdout.write('\n');
	console.error(e);
	process.exit(2);
});
