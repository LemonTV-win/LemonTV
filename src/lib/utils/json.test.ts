import { describe, it, expect } from 'bun:test';
import { typescriptToJson, parseData, wrapIncompleteJsonArray } from './json';

describe('typescriptToJson', () => {
	it('should convert TypeScript object literal syntax to valid JSON', () => {
		const typescriptCode = `{name: 'Team SoloMid', slug: 'tsm'}`;

		const result = typescriptToJson(typescriptCode);
		const parsed = JSON.parse(result);

		expect(parsed).toHaveProperty('name', 'Team SoloMid');
		expect(parsed).toHaveProperty('slug', 'tsm');
	});

	it('should handle single quotes', () => {
		const typescriptCode = `[
			{
				name: 'Cloud9',
				slug: 'cloud9',
				abbr: 'C9',
				region: 'NA'
			}
		]`;

		const result = typescriptToJson(typescriptCode);
		const parsed = JSON.parse(result);

		expect(parsed[0].name).toBe('Cloud9');
		expect(parsed[0].slug).toBe('cloud9');
	});

	it('should handle boolean values', () => {
		const typescriptCode = `[
			{
				name: 'Test Team',
				isActive: true,
				isVerified: false
			}
		]`;

		const result = typescriptToJson(typescriptCode);
		const parsed = JSON.parse(result);

		expect(parsed[0].isActive).toBe(true);
		expect(parsed[0].isVerified).toBe(false);
	});

	it('should handle numeric values', () => {
		const typescriptCode = `[
			{
				name: 'Test Team',
				rank: 1,
				score: 100
			}
		]`;

		const result = typescriptToJson(typescriptCode);
		const parsed = JSON.parse(result);

		expect(parsed[0].rank).toBe(1);
		expect(parsed[0].score).toBe(100);
	});

	it('should handle nested objects and arrays', () => {
		const typescriptCode = `[
			{
				name: 'Test Team',
				config: {
					enabled: true,
					settings: [1, 2, 3]
				}
			}
		]`;

		const result = typescriptToJson(typescriptCode);
		const parsed = JSON.parse(result);

		expect(parsed[0].config.enabled).toBe(true);
		expect(parsed[0].config.settings).toEqual([1, 2, 3]);
	});

	it('should remove single-line comments', () => {
		const typescriptCode = `[
			{
				name: 'Test Team', // This is a comment
				slug: 'test-team'
			}
		]`;

		const result = typescriptToJson(typescriptCode);
		expect(result).not.toContain('// This is a comment');

		const parsed = JSON.parse(result);
		expect(parsed[0].name).toBe('Test Team');
	});

	it('should remove multi-line comments', () => {
		const typescriptCode = `[
			{
				/* This is a
				   multi-line comment */
				name: 'Test Team',
				slug: 'test-team'
			}
		]`;

		const result = typescriptToJson(typescriptCode);
		expect(result).not.toContain('/* This is a');
		expect(result).not.toContain('multi-line comment */');

		const parsed = JSON.parse(result);
		expect(parsed[0].name).toBe('Test Team');
	});

	it('should handle empty input', () => {
		const result = typescriptToJson('');
		expect(result).toBe('');
	});

	it('should handle whitespace-only input', () => {
		const result = typescriptToJson('   \n\t  ');
		expect(result).toBe('');
	});

	it('should handle URLs with colons correctly', () => {
		const typescriptCode = `[{name: 'Team SoloMid', slug: 'tsm', logo: 'https://example.com/tsm-logo.png', website: 'https://tsm.gg'}]`;

		const result = typescriptToJson(typescriptCode);
		const parsed = JSON.parse(result);

		expect(parsed[0].name).toBe('Team SoloMid');
		expect(parsed[0].logo).toBe('https://example.com/tsm-logo.png');
		expect(parsed[0].website).toBe('https://tsm.gg');
	});
});

describe('parseTypescriptData', () => {
	interface TestTeam {
		name: string;
		slug?: string;
		abbr?: string;
	}

	interface TestPlayer {
		name: string;
		nationalities?: string[];
		gameAccounts?: Array<{
			server: string;
			accountId: number;
		}>;
	}

	it('should parse valid TypeScript data successfully', () => {
		const typescriptData = `[
			{
				name: 'Team SoloMid',
				slug: 'tsm',
				abbr: 'TSM'
			},
			{
				name: 'Cloud9',
				slug: 'cloud9',
				abbr: 'C9'
			}
		]`;

		const result = parseData<TestTeam>(typescriptData, (data): data is TestTeam[] => {
			return Array.isArray(data) && data.every((team) => team.name);
		});

		expect(result).toEqual({
			type: 'success',
			data: [
				{ name: 'Team SoloMid', slug: 'tsm', abbr: 'TSM' },
				{ name: 'Cloud9', slug: 'cloud9', abbr: 'C9' }
			]
		});
	});

	it('should parse valid JSON data successfully', () => {
		const jsonData = `[
			{
				"name": "Player One",
				"nationalities": ["US", "KR"]
			},
			{
				"name": "Player Two",
				"nationalities": ["JP"]
			}
		]`;

		const result = parseData<TestPlayer>(jsonData, (data): data is TestPlayer[] => {
			return Array.isArray(data) && data.every((player) => player.name);
		});

		expect(result).toEqual({
			type: 'success',
			data: [
				{ name: 'Player One', nationalities: ['US', 'KR'] },
				{ name: 'Player Two', nationalities: ['JP'] }
			]
		});
	});

	it('should return null for empty input', () => {
		const result = parseData<TestTeam>('', (data): data is TestTeam[] => {
			return Array.isArray(data) && data.every((team) => team.name);
		});

		expect(result).toBeNull();
	});

	it('should return null for whitespace-only input', () => {
		const result = parseData<TestTeam>('   \n\t  ', (data): data is TestTeam[] => {
			return Array.isArray(data) && data.every((team) => team.name);
		});

		expect(result).toBeNull();
	});

	it('should return error for invalid JSON after conversion', () => {
		const invalidData = `[
			{
				name: 'Test Team',
				slug: 'test-team'
				// Missing closing brace
		]`;

		const result = parseData<TestTeam>(invalidData, (data): data is TestTeam[] => {
			return Array.isArray(data) && data.every((team) => team.name);
		});

		expect(result?.type).toBe('error');
		// The actual error message depends on the JSON parser, so we check for a generic error
		if (result?.type === 'error') {
			expect(result.error).toBeTruthy();
		}
	});

	it('should return error for validation failure', () => {
		const invalidData = `[
			{
				name: 'Valid Team',
				slug: 'valid-team'
			},
			{
				slug: 'missing-name'
			}
		]`;

		const result = parseData<TestTeam>(invalidData, (data): data is TestTeam[] => {
			return Array.isArray(data) && data.every((team) => team.name);
		});

		expect(result?.type).toBe('error');
		if (result?.type === 'error') {
			expect(result.error).toBe('Data validation failed');
		}
	});

	it('should handle complex nested structures', () => {
		const complexData = `[
			{
				name: 'Complex Player',
				nationalities: ['US', 'KR'],
				gameAccounts: [
					{
						server: 'Strinova',
						accountId: 1234567
					},
					{
						server: 'CalabiYau',
						accountId: 7654321
					}
				]
			}
		]`;

		const result = parseData<TestPlayer>(complexData, (data): data is TestPlayer[] => {
			return Array.isArray(data) && data.every((player) => player.name);
		});

		expect(result?.type).toBe('success');
		if (result?.type === 'success') {
			expect(result.data[0].name).toBe('Complex Player');
			expect(result.data[0].nationalities).toEqual(['US', 'KR']);
			expect(result.data[0].gameAccounts).toHaveLength(2);
			expect(result.data[0].gameAccounts?.[0].server).toBe('Strinova');
			expect(result.data[0].gameAccounts?.[0].accountId).toBe(1234567);
		}
	});

	it('should handle mixed TypeScript and JSON syntax', () => {
		const mixedData = `[
			{
				name: 'Mixed Team',
				"slug": 'mixed-team',
				abbr: 'MT'
			}
		]`;

		const result = parseData<TestTeam>(mixedData, (data): data is TestTeam[] => {
			return Array.isArray(data) && data.every((team) => team.name);
		});

		expect(result?.type).toBe('success');
		if (result?.type === 'success') {
			expect(result.data[0].name).toBe('Mixed Team');
			expect(result.data[0].slug).toBe('mixed-team');
			expect(result.data[0].abbr).toBe('MT');
		}
	});
});

describe('wrapIncompleteJsonArray', () => {
	it('should wrap single object with square brackets', () => {
		const input = '{"name": "Team SoloMid", "slug": "tsm"}';
		const result = wrapIncompleteJsonArray(input);
		expect(result).toBe('[{"name": "Team SoloMid", "slug": "tsm"}]');
	});

	it('should wrap TypeScript object literal with square brackets', () => {
		const input = "{name: 'Team SoloMid', slug: 'tsm'}";
		const result = wrapIncompleteJsonArray(input);
		expect(result).toBe("[{name: 'Team SoloMid', slug: 'tsm'}]");
	});

	it('should not wrap already complete JSON array', () => {
		const input = '[{"name": "Team SoloMid", "slug": "tsm"}]';
		const result = wrapIncompleteJsonArray(input);
		expect(result).toBe('[{"name": "Team SoloMid", "slug": "tsm"}]');
	});

	it('should not wrap TypeScript array', () => {
		const input = "[{name: 'Team SoloMid', slug: 'tsm'}]";
		const result = wrapIncompleteJsonArray(input);
		expect(result).toBe("[{name: 'Team SoloMid', slug: 'tsm'}]");
	});

	it('should wrap incomplete array with missing closing bracket', () => {
		const input = '[{"name": "Team SoloMid", "slug": "tsm"}';
		const result = wrapIncompleteJsonArray(input);
		expect(result).toBe('[[{"name": "Team SoloMid", "slug": "tsm"}]');
	});

	it('should wrap incomplete array with missing opening bracket', () => {
		const input = '{"name": "Team SoloMid", "slug": "tsm"}]';
		const result = wrapIncompleteJsonArray(input);
		expect(result).toBe('[{"name": "Team SoloMid", "slug": "tsm"}]');
	});

	it('should handle nested objects correctly', () => {
		const input = '{"name": "Team SoloMid", "players": [{"name": "Player1"}]}';
		const result = wrapIncompleteJsonArray(input);
		expect(result).toBe('[{"name": "Team SoloMid", "players": [{"name": "Player1"}]}]');
	});

	it('should handle empty string', () => {
		const input = '';
		const result = wrapIncompleteJsonArray(input);
		expect(result).toBe('');
	});

	it('should handle whitespace-only string', () => {
		const input = '   \n\t  ';
		const result = wrapIncompleteJsonArray(input);
		expect(result).toBe('');
	});

	it('should handle complex nested structures', () => {
		const input = `{
			"name": "Team SoloMid",
			"players": [
				{
					"name": "Player1",
					"gameAccounts": [
						{"server": "Strinova", "accountId": 1234567}
					]
				}
			]
		}`;
		const result = wrapIncompleteJsonArray(input);
		expect(result).toContain('[');
		expect(result).toContain(']');
		expect(result).toContain('Team SoloMid');
	});
});
