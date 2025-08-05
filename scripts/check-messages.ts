// Read all files in the messages directory, and check if any language is missing any translations

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

const messagesPath = path.join(__dirname, '../messages');
console.log(chalk.blue('[Check Messages]'), 'Checking messages in:', chalk.cyan(messagesPath));

const allMessageIDs = new Set<string>();
const referenceLanguages = ['en', 'zh', 'ja'];
const referenceMessages: Record<string, any> = {};

// Helper function to recursively extract all nested message IDs
function extractMessageIDs(obj: any, prefix = ''): string[] {
	const ids: string[] = [];

	for (const [key, value] of Object.entries(obj)) {
		if (key === '$schema') continue;

		const currentPath = prefix ? `${prefix}.${key}` : key;

		if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
			// Recursively extract from nested objects
			ids.push(...extractMessageIDs(value, currentPath));
		} else if (typeof value === 'string') {
			// This is a leaf node (actual translation)
			ids.push(currentPath);
		}
	}

	return ids;
}

// Helper function to get nested value from an object using dot notation
function getNestedValue(obj: any, path: string): any {
	return path.split('.').reduce((current, key) => {
		return current && typeof current === 'object' ? current[key] : undefined;
	}, obj);
}

// Helper function to check if a nested path exists in an object
function hasNestedPath(obj: any, path: string): boolean {
	return getNestedValue(obj, path) !== undefined;
}

// Load reference language files
for (const lang of referenceLanguages) {
	const filePath = path.join(messagesPath, `${lang}.json`);
	if (fs.existsSync(filePath)) {
		referenceMessages[lang] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
	}
}

// First pass: collect all message IDs from all files
for (const file of fs.readdirSync(messagesPath)) {
	const messages = JSON.parse(fs.readFileSync(path.join(messagesPath, file), 'utf8'));
	const messageIDs = extractMessageIDs(messages);
	messageIDs.forEach((id) => allMessageIDs.add(id));
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
	const fileMessageIDs = new Set(extractMessageIDs(messages));

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
			const translation = getNestedValue(referenceMessages[lang], messageId);
			if (translation && typeof translation === 'string') {
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

// Check if any message is duplicated (including nested ones)
for (const file of fs.readdirSync(messagesPath)) {
	const messages = JSON.parse(fs.readFileSync(path.join(messagesPath, file), 'utf8'));
	const messageIDs = extractMessageIDs(messages);
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
