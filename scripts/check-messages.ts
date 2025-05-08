// Read all files in the messages directory, and check if any language is missing any translations

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

const allMessageIDs = new Set<string>();

// First pass: collect all message IDs
for (const file of fs.readdirSync(path.join(__dirname, '../messages'))) {
	const messages = JSON.parse(fs.readFileSync(path.join(__dirname, '../messages', file), 'utf8'));
	// Skip the schema property
	Object.keys(messages).forEach((key) => {
		if (key !== '$schema') {
			allMessageIDs.add(key);
		}
	});
}

console.log(
	chalk.blue('[Check Messages]'),
	'Found',
	chalk.yellow(allMessageIDs.size),
	'message IDs'
);

// Check if any language is missing any translations
let hasWarnings = false;
for (const file of fs.readdirSync(path.join(__dirname, '../messages'))) {
	const messages = JSON.parse(fs.readFileSync(path.join(__dirname, '../messages', file), 'utf8'));
	const fileMessageIDs = new Set(Object.keys(messages).filter((key) => key !== '$schema'));

	const missingMessages = Array.from(allMessageIDs).filter((id) => !fileMessageIDs.has(id));
	if (missingMessages.length > 0) {
		console.warn(chalk.yellow(`[Check Messages] ${file} is missing translations for:`));
		missingMessages.forEach((id) => console.log(chalk.white(`  - ${id}`)));
		hasWarnings = true;
	}
}

// Check if any message is duplicated
for (const file of fs.readdirSync(path.join(__dirname, '../messages'))) {
	const messages = JSON.parse(fs.readFileSync(path.join(__dirname, '../messages', file), 'utf8'));
	const messageIDs = Object.keys(messages).filter((key) => key !== '$schema');
	if (messageIDs.length !== new Set(messageIDs).size) {
		console.warn(chalk.yellow(`[Check Messages] ${file} has duplicated translations`));
		hasWarnings = true;
	}
}

if (!hasWarnings) {
	console.log(chalk.green('[Check Messages] All checks passed successfully!'));
} else {
	console.error(chalk.red('[Check Messages] Validation failed - see warnings above'));
	process.exit(1);
}
