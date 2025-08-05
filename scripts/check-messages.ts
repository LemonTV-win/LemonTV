// Read all files in the messages directory, and check if any language is missing any translations

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

const messagesPath = path.join(__dirname, '../messages');
console.log(chalk.blue('[Check Messages]'), 'Checking messages in:', chalk.cyan(messagesPath));

const allMessageIDs = new Set<string>();
const referenceLanguages = ['en', 'zh', 'ja'];
const referenceMessages: Record<string, any> = {};

// Load reference language files
for (const lang of referenceLanguages) {
	const filePath = path.join(messagesPath, `${lang}.json`);
	if (fs.existsSync(filePath)) {
		referenceMessages[lang] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
	}
}

// First pass: collect all message IDs
for (const file of fs.readdirSync(messagesPath)) {
	const messages = JSON.parse(fs.readFileSync(path.join(messagesPath, file), 'utf8'));
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
const missingTranslations: Record<string, string[]> = {};

// Collect all missing translations by message ID
for (const file of fs.readdirSync(messagesPath)) {
	const messages = JSON.parse(fs.readFileSync(path.join(messagesPath, file), 'utf8'));
	const fileMessageIDs = new Set(Object.keys(messages).filter((key) => key !== '$schema'));

	const missingMessages = Array.from(allMessageIDs).filter((id) => !fileMessageIDs.has(id));
	missingMessages.forEach((id) => {
		if (!missingTranslations[id]) {
			missingTranslations[id] = [];
		}
		missingTranslations[id].push(file);
	});
}

// Display missing translations grouped by message ID
if (Object.keys(missingTranslations).length > 0) {
	console.warn(chalk.yellow(`[Check Messages] Missing translations found:`));

	for (const [messageId, files] of Object.entries(missingTranslations)) {
		console.log(chalk.white(`  - ${messageId}`));
		console.log(chalk.cyan(`    Missing in: ${files.join(', ')}`));

		// Display reference translations
		const references: string[] = [];
		for (const lang of referenceLanguages) {
			if (referenceMessages[lang] && referenceMessages[lang][messageId]) {
				const translation = referenceMessages[lang][messageId];
				// Truncate long translations for display
				const displayText =
					translation.length > 60 ? translation.substring(0, 60) + '...' : translation;
				references.push(`${chalk.magenta(lang)}: "${chalk.yellow(displayText)}"`);
			}
		}

		if (references.length > 0) {
			console.log(chalk.blue(`    References: ${references.join(' | ')}`));
		}
		console.log(''); // Add spacing between entries
	}
	hasWarnings = true;
}

// Check if any message is duplicated
for (const file of fs.readdirSync(messagesPath)) {
	const messages = JSON.parse(fs.readFileSync(path.join(messagesPath, file), 'utf8'));
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
