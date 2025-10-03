/**
 * Converts TypeScript object literal syntax to valid JSON
 * Handles common TypeScript patterns like unquoted property names, single quotes, etc.
 *
 * This function uses eval() to parse TypeScript object literal syntax directly,
 * since JavaScript natively supports unquoted property names and single quotes.
 */
export function typescriptToJson(typescriptCode: string): string {
	// Handle empty or whitespace-only input
	if (!typescriptCode.trim()) {
		return '';
	}

	// Use Function constructor to parse the TypeScript object literal
	// This is safer than eval() and handles strict contexts better
	try {
		// Create a function that returns the parsed data
		const parsed = new Function(`return ${typescriptCode}`)();
		return JSON.stringify(parsed, null, 2);
	} catch (error) {
		throw new Error(
			`Failed to parse TypeScript object literal: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}

/**
 * Automatically wraps incomplete JSON input with square brackets
 * Detects when input appears to be a single object that needs to be wrapped in an array
 *
 * @param data - The input data string to potentially wrap
 * @returns The wrapped data string if wrapping was applied, otherwise the original data
 */
export function wrapIncompleteJsonArray(data: string): string {
	const trimmedData = data.trim();

	// Don't wrap empty strings
	if (!trimmedData) {
		return trimmedData;
	}

	// If the input doesn't start and end with exactly one `[` and `]`,
	// it might be incomplete JSON - try wrapping it
	if (!trimmedData.startsWith('[') || !trimmedData.endsWith(']')) {
		// Count opening and closing brackets to see if it's truly incomplete
		const openBrackets = (trimmedData.match(/\[/g) || []).length;
		const closeBrackets = (trimmedData.match(/\]/g) || []).length;

		// If there are fewer closing brackets than opening brackets,
		// or if it doesn't start/end with brackets, try wrapping
		if (
			openBrackets === 0 ||
			closeBrackets < openBrackets ||
			!trimmedData.startsWith('[') ||
			!trimmedData.endsWith(']')
		) {
			// If it already ends with ], don't add another one
			if (trimmedData.endsWith(']')) {
				return `[${trimmedData.slice(0, -1)}]`;
			}
			return `[${trimmedData}]`;
		}
	}

	return trimmedData;
}

/**
 * Parses data and returns parsed result or error
 * Supports both JSON and TypeScript object literal formats
 * Automatically wraps incomplete JSON input with square brackets
 *
 * Strategy: Try JSON parsing first (fast path), fall back to TypeScript parsing if JSON fails
 */
export function parseData<T>(
	data: string,
	validateData: (parsed: any) => parsed is T[]
): { type: 'success'; data: T[] } | { type: 'error'; error: string } | null {
	// Only parse if there's actual data
	if (!data.trim()) {
		return null;
	}

	// Check if input needs to be wrapped with square brackets
	const dataToParse = wrapIncompleteJsonArray(data);

	try {
		// First, try to parse as JSON (fast path)
		const parsedData = JSON.parse(dataToParse);

		// Validate the data using the provided validator
		if (!validateData(parsedData)) {
			throw new Error('Data validation failed');
		}

		return {
			type: 'success',
			data: parsedData
		};
	} catch (jsonError) {
		// JSON parsing failed, try TypeScript object literal parsing as fallback
		try {
			const cleanedData = typescriptToJson(dataToParse);
			const parsedData = JSON.parse(cleanedData);

			// Validate the data using the provided validator
			if (!validateData(parsedData)) {
				throw new Error('Data validation failed');
			}

			return {
				type: 'success',
				data: parsedData
			};
		} catch (typescriptError) {
			// Both JSON and TypeScript parsing failed
			console.error('Parse error:', { jsonError, typescriptError });

			// Try to provide a more specific error message if possible
			if (
				typescriptError instanceof Error &&
				typescriptError.message === 'Data validation failed'
			) {
				return {
					type: 'error',
					error: 'Data validation failed'
				};
			}

			return {
				type: 'error',
				error:
					'Invalid format. Please check your data. The import supports both JSON and TypeScript object literal formats.'
			};
		}
	}
}
