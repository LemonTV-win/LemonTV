// Read all files in the messages directory, and check if any language is missing any translations

import fs from 'fs';
import path from 'path';

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

console.log('All message IDs:', Array.from(allMessageIDs).sort());

// Check if any language is missing any translations
for (const file of fs.readdirSync(path.join(__dirname, '../messages'))) {
	const messages = JSON.parse(fs.readFileSync(path.join(__dirname, '../messages', file), 'utf8'));
	const fileMessageIDs = new Set(Object.keys(messages).filter((key) => key !== '$schema'));

	const missingMessages = Array.from(allMessageIDs).filter((id) => !fileMessageIDs.has(id));
	if (missingMessages.length > 0) {
		console.log(`\n${file} is missing translations for:`);
		missingMessages.forEach((id) => console.log(`  - ${id}`));
	}
}

// Check if any message is duplicated
for (const file of fs.readdirSync(path.join(__dirname, '../messages'))) {
	const messages = JSON.parse(fs.readFileSync(path.join(__dirname, '../messages', file), 'utf8'));
	const messageIDs = Object.keys(messages).filter((key) => key !== '$schema');
	if (messageIDs.length !== new Set(messageIDs).size) {
		console.log(`\n${file} has duplicated translations`);
	}
}
