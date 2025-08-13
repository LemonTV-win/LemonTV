// Read all files in the messages directory, and check if any language is missing any translations

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

const messagesPath = path.join(__dirname, '../messages');
console.log(chalk.blue('[Check Messages]'), 'Checking messages in:', chalk.cyan(messagesPath));

const allMessageIDs = new Set<string>();
const referenceLanguages = ['en', 'zh', 'ja'];
const referenceMessages: Record<string, any> = {};

// Unicode CLDR plural rules for different languages
const pluralRules: Record<string, string[]> = {
	en: ['one', 'other'],
	zh: ['other'],
	ja: ['other'],
	// Add more languages as needed
	af: ['one', 'other'],
	ak: ['one', 'other'],
	sq: ['one', 'many', 'other'],
	ar: ['zero', 'one', 'two', 'few', 'many', 'other'],
	be: ['one', 'few', 'many', 'other'],
	bg: ['one', 'other'],
	ca: ['one', 'other'],
	cs: ['one', 'few', 'other'],
	cy: ['zero', 'one', 'two', 'few', 'many', 'other'],
	da: ['one', 'other'],
	de: ['one', 'other'],
	el: ['one', 'other'],
	es: ['one', 'other'],
	et: ['one', 'other'],
	eu: ['one', 'other'],
	fa: ['one', 'other'],
	fi: ['one', 'other'],
	fr: ['one', 'other'],
	ga: ['one', 'two', 'few', 'many', 'other'],
	gl: ['one', 'other'],
	gu: ['one', 'other'],
	he: ['one', 'two', 'many', 'other'],
	hi: ['one', 'other'],
	hr: ['one', 'few', 'other'],
	hu: ['one', 'other'],
	id: ['other'],
	is: ['one', 'other'],
	it: ['one', 'other'],
	ko: ['other'],
	lt: ['one', 'few', 'many', 'other'],
	lv: ['zero', 'one', 'other'],
	mk: ['one', 'other'],
	ml: ['one', 'other'],
	mr: ['one', 'other'],
	ms: ['other'],
	nb: ['one', 'other'],
	nl: ['one', 'other'],
	nn: ['one', 'other'],
	pl: ['one', 'few', 'many', 'other'],
	pt: ['one', 'other'],
	ro: ['one', 'few', 'other'],
	ru: ['one', 'few', 'many', 'other'],
	sk: ['one', 'few', 'other'],
	sl: ['one', 'two', 'few', 'other'],
	sr: ['one', 'few', 'other'],
	sv: ['one', 'other'],
	sw: ['one', 'other'],
	ta: ['one', 'other'],
	te: ['one', 'other'],
	th: ['other'],
	tr: ['one', 'other'],
	uk: ['one', 'few', 'many', 'other'],
	ur: ['one', 'other'],
	vi: ['other'],
	zu: ['one', 'other']
};

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

// Helper function to validate plural data according to Unicode CLDR rules
function validatePluralData(messages: any, language: string): string[] {
	const errors: string[] = [];

	function checkPluralObject(obj: any, path = ''): void {
		if (typeof obj !== 'object' || obj === null) {
			return;
		}

		// Check if this object has plural selectors
		if (obj.selectors && Array.isArray(obj.selectors) && obj.selectors.includes('countPlural')) {
			if (!obj.match || typeof obj.match !== 'object') {
				errors.push(`${path}: Missing 'match' object for plural selector`);
				return;
			}

			const expectedCategories = pluralRules[language] || pluralRules['en'];
			const providedCategories = Object.keys(obj.match);

			// Extract actual plural categories from keys like "countPlural=one"
			const actualCategories = providedCategories.map((key) => {
				const match = key.match(/^countPlural=(.+)$/);
				return match ? match[1] : key;
			});

			// Check if all required categories are present
			for (const category of expectedCategories) {
				if (!actualCategories.includes(category)) {
					errors.push(
						`${path}: Missing required plural category '${category}' for language '${language}'`
					);
				}
			}

			// Check if any unexpected categories are present
			for (const category of actualCategories) {
				if (!expectedCategories.includes(category)) {
					errors.push(
						`${path}: Unexpected plural category '${category}' for language '${language}' (expected: ${expectedCategories.join(', ')})`
					);
				}
			}

			// Check if all match values are strings
			for (const [category, value] of Object.entries(obj.match)) {
				if (typeof value !== 'string') {
					errors.push(
						`${path}: Plural match value for '${category}' must be a string, got ${typeof value}`
					);
				}
			}
		}

		// Recursively check nested objects and arrays
		if (Array.isArray(obj)) {
			// Handle arrays - check each item
			for (let i = 0; i < obj.length; i++) {
				const currentPath = path ? `${path}[${i}]` : `[${i}]`;
				checkPluralObject(obj[i], currentPath);
			}
		} else {
			// Handle objects - check each property
			for (const [key, value] of Object.entries(obj)) {
				const currentPath = path ? `${path}.${key}` : key;
				checkPluralObject(value, currentPath);
			}
		}
	}

	checkPluralObject(messages);
	return errors;
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

// Check plural data validation
console.log(chalk.blue('[Check Messages]'), 'Validating plural data...');
for (const file of fs.readdirSync(messagesPath)) {
	const fullLanguage = file.replace('.json', '');
	// Extract base language code (e.g., 'uk' from 'uk-ua', 'en' from 'en-US')
	const language = fullLanguage.split('-')[0];

	const messages = JSON.parse(fs.readFileSync(path.join(messagesPath, file), 'utf8'));

	const pluralErrors = validatePluralData(messages, language);
	if (pluralErrors.length > 0) {
		console.warn(chalk.yellow(`[Check Messages] ${file} has plural data validation errors:`));
		pluralErrors.forEach((error) => {
			console.log(chalk.red(`  - ${error}`));
		});
		hasWarnings = true;
	}
}

if (!hasWarnings) {
	console.log(chalk.green('[Check Messages] All checks passed successfully!'));
} else {
	console.error(chalk.red('[Check Messages] Validation failed - see warnings above'));
	process.exit(1);
}
