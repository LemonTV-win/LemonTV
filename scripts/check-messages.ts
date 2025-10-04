// Read all files in the messages directory, and check if any language is missing any translations

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

const messagesPath = path.join(__dirname, '../messages');
console.log(chalk.blue('[Check Messages]'), 'Checking messages in:', chalk.cyan(messagesPath));

function findDuplicateKeysInJSON(
	jsonString: string
): Array<{ key: string; line: number; column: number; path: string }> {
	// First validate it's valid JSON
	if (!isValidJSON(jsonString)) {
		throw new Error('Input is not valid JSON.');
	}

	const content = jsonString.trim();
	const duplicates: Array<{ key: string; line: number; column: number; path: string }> = [];
	let currentIndex = 0;

	function parseValue(parentPath: string): void {
		skipWhitespace();

		if (currentIndex >= content.length) return;

		const char = content[currentIndex];

		if (char === '{') {
			parseObject(parentPath);
		} else if (char === '[') {
			parseArray(parentPath);
		} else if (char === '"') {
			// String value, consume and return
			parseString();
		} else if (
			(char >= '0' && char <= '9') ||
			char === '-' ||
			char === 't' ||
			char === 'f' ||
			char === 'n'
		) {
			parsePrimitive();
		}
	}

	function parseObject(parentPath: string): void {
		currentIndex++; // Skip '{'

		// keys at this object level -> list of occurrences (line,col)
		const currentLevelKeys = new Map<string, Array<{ line: number; col: number }>>();

		while (currentIndex < content.length) {
			skipWhitespace();
			const char = content[currentIndex];

			if (char === '}') {
				currentIndex++; // Skip '}'

				// Emit duplicates for this object level
				currentLevelKeys.forEach((occurrences, key) => {
					if (occurrences.length > 1) {
						const fullPath = parentPath ? `${parentPath}.${key}` : key;
						occurrences.forEach(({ line, col }) => {
							duplicates.push({ key, line, column: col, path: fullPath });
						});
					}
				});

				break;
			}

			if (char === '"') {
				const keyStart = currentIndex;
				const key = parseString();

				// Calculate line and column for this key occurrence
				const beforeKey = content.substring(0, keyStart);
				const lines = beforeKey.split('\n');
				const line = lines.length;
				const col = lines[lines.length - 1].length + 1;

				if (!currentLevelKeys.has(key)) currentLevelKeys.set(key, []);
				currentLevelKeys.get(key)!.push({ line, col });

				skipWhitespace();
				if (content[currentIndex] === ':') {
					currentIndex++; // Skip ':'

					// Determine child parent path for value
					const childParentPath = parentPath ? `${parentPath}.${key}` : key;
					parseValue(childParentPath);
				}

				skipWhitespace();
				if (content[currentIndex] === ',') {
					currentIndex++; // Skip ','
				}
			} else {
				// Unexpected content inside object, advance to avoid infinite loop
				currentIndex++;
			}
		}
	}

	function parseArray(parentPath: string): void {
		currentIndex++; // Skip '['
		let indexInArray = 0;

		while (currentIndex < content.length) {
			skipWhitespace();
			const char = content[currentIndex];

			if (char === ']') {
				currentIndex++; // Skip ']'
				break;
			}

			const childPath = `${parentPath}[${indexInArray}]`;
			parseValue(childPath);

			skipWhitespace();
			if (content[currentIndex] === ',') {
				currentIndex++; // Skip ','
				indexInArray++;
			}
		}
	}

	function parseString(): string {
		currentIndex++; // Skip opening quote
		let result = '';

		while (currentIndex < content.length) {
			const char = content[currentIndex];
			currentIndex++;

			if (char === '"') {
				if (content[currentIndex - 2] !== '\\') {
					break; // Unescaped quote ends the string
				}
			}
			result += char;
		}

		return result;
	}

	function parsePrimitive(): void {
		// Skip to end of primitive value (number, boolean, null)
		while (currentIndex < content.length) {
			const char = content[currentIndex];
			if (char === ',' || char === '}' || char === ']') {
				break;
			}
			currentIndex++;
		}
	}

	function skipWhitespace(): void {
		while (currentIndex < content.length) {
			const char = content[currentIndex];
			if (char === ' ' || char === '\t' || char === '\n' || char === '\r') {
				currentIndex++;
			} else {
				break;
			}
		}
	}

	// Kick off by seeking the first value (root must be object or array)
	parseValue('');

	return duplicates;
}

function isValidJSON(content: string): boolean {
	try {
		JSON.parse(content);
		return true;
	} catch {
		return false;
	}
}

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
// - Includes simple string leaves (e.g., "content.teams.active_players")
// - Includes Paraglide-style message nodes (arrays/objects with selectors/match or message)
function extractMessageIDs(obj: any, prefix = ''): string[] {
	const ids: string[] = [];

	for (const [key, value] of Object.entries(obj)) {
		if (key === '$schema') continue;

		const currentPath = prefix ? `${prefix}.${key}` : key;

		// Case 1: Simple string leaf
		if (typeof value === 'string') {
			ids.push(currentPath);
			continue;
		}

		// Case 2: Arrays - treat Paraglide message arrays as leaf IDs
		if (Array.isArray(value)) {
			const looksLikeMessageArray = value.some((item) => {
				return (
					item &&
					typeof item === 'object' &&
					!Array.isArray(item) &&
					(('selectors' in item && 'match' in item) || typeof (item as any).message === 'string')
				);
			});

			if (looksLikeMessageArray) {
				ids.push(currentPath);
			}

			// Do not traverse into arrays to avoid generating index-based IDs
			continue;
		}

		// Case 3: Objects - either Paraglide message objects or containers
		if (typeof value === 'object' && value !== null) {
			const looksLikeMessageObject =
				('selectors' in value && 'match' in value && typeof (value as any).match === 'object') ||
				typeof (value as any).message === 'string';

			if (looksLikeMessageObject) {
				ids.push(currentPath);
				continue;
			}

			// Container object - recurse into children
			ids.push(...extractMessageIDs(value, currentPath));
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

// Check for duplicate JSON keys (same key appears multiple times at the same level)
console.log(chalk.blue('[Check Messages]'), 'Checking for duplicate JSON keys...');
for (const file of fs.readdirSync(messagesPath)) {
	try {
		const content = fs.readFileSync(path.join(messagesPath, file), 'utf8');
		const messages = JSON.parse(content);

		// Check for duplicate keys using custom implementation and expanded key analysis
		const duplicateKeys: Array<{ key: string; locations: string[] }> = [];

		// First, use custom implementation to find basic duplicate keys
		try {
			const basicDuplicates = findDuplicateKeysInJSON(content);
			if (basicDuplicates.length > 0) {
				console.warn(chalk.yellow(`[Check Messages] ${file} has duplicate keys:`));

				// Group duplicates by key to show all occurrences
				const groupedDuplicates = new Map<
					string,
					Array<{ line: number; column: number; path: string }>
				>();
				basicDuplicates.forEach((dup) => {
					if (!groupedDuplicates.has(dup.key)) {
						groupedDuplicates.set(dup.key, []);
					}
					groupedDuplicates.get(dup.key)!.push({
						line: dup.line,
						column: dup.column,
						path: dup.path
					});
				});

				groupedDuplicates.forEach((occurrences, key) => {
					const firstPath = occurrences[0]?.path || key;
					console.log(chalk.white(`  - "${firstPath}" appears ${occurrences.length} times:`));
					occurrences.forEach(({ line, column }) => {
						console.log(chalk.cyan(`    - line ${line}, col ${column}`));
					});
				});
				console.log(''); // Add spacing between files
				hasWarnings = true;
			}
		} catch (error) {
			console.warn(
				chalk.yellow(`[Check Messages] Could not check duplicates for ${file}: ${error}`)
			);
		}

		// Then, check for duplicate expanded translation keys
		const expandedKeyCounts = new Map<string, string[]>();

		// Recursively extract all translation key paths
		function extractExpandedKeys(obj: any, currentPath = '') {
			if (typeof obj === 'object' && obj !== null) {
				if (!Array.isArray(obj)) {
					// Handle Paraglide message objects
					if (isParaglideMessage(obj)) {
						const keyPath = currentPath || 'root';
						if (!expandedKeyCounts.has(keyPath)) {
							expandedKeyCounts.set(keyPath, []);
						}
						expandedKeyCounts.get(keyPath)!.push(keyPath);
						return;
					}

					// Regular object - traverse children
					for (const [key, value] of Object.entries(obj)) {
						if (key === '$schema') continue;

						const newPath = currentPath ? `${currentPath}.${key}` : key;
						extractExpandedKeys(value, newPath);
					}
				} else {
					// Handle arrays
					obj.forEach((item: any, index: number) => {
						const newPath = currentPath ? `${currentPath}[${index}]` : `[${index}]`;
						extractExpandedKeys(item, newPath);
					});
				}
			} else {
				// Leaf value - record the path
				const keyPath = currentPath || 'root';
				if (!expandedKeyCounts.has(keyPath)) {
					expandedKeyCounts.set(keyPath, []);
				}
				expandedKeyCounts.get(keyPath)!.push(keyPath);
			}
		}

		// Helper to check if object is a Paraglide message
		function isParaglideMessage(obj: any): boolean {
			return (
				obj &&
				typeof obj === 'object' &&
				(('selectors' in obj && 'match' in obj) ||
					'message' in obj ||
					(Array.isArray(obj) &&
						obj.some(
							(item) =>
								item && typeof item === 'object' && ('selectors' in item || 'message' in item)
						)))
			);
		}

		extractExpandedKeys(messages);

		// Find duplicate expanded keys
		for (const [keyPath, paths] of expandedKeyCounts.entries()) {
			if (paths.length > 1) {
				duplicateKeys.push({ key: keyPath, locations: paths });
			}
		}

		if (duplicateKeys.length > 0) {
			console.warn(
				chalk.yellow(`[Check Messages] ${file} has duplicate expanded translation keys:`)
			);
			duplicateKeys.forEach(({ key, locations }) => {
				console.log(chalk.white(`  - "${key}"`));
				console.log(chalk.cyan(`    Appears ${locations.length} times`));
			});
			console.log(''); // Add spacing between files
			hasWarnings = true;
		}
	} catch (error) {
		console.error(chalk.red(`[Check Messages] Error parsing ${file}: ${error}`));
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
