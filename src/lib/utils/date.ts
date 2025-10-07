const DATE_RANGE_DELIMITER = '/';
const INVALID_DATE_LABEL = 'Invalid Date' as const;

function parseDate(value: string | undefined): Date | null {
	const trimmed = value?.trim();
	if (!trimmed) {
		return null;
	}

	const date = new Date(trimmed);
	return Number.isNaN(date.getTime()) ? null : date;
}

function splitDateRange(dateString: string): readonly [string, string | undefined] {
	const trimmed = dateString.trim();
	if (!trimmed.includes(DATE_RANGE_DELIMITER)) {
		return [trimmed, undefined];
	}

	const [start, end] = trimmed.split(DATE_RANGE_DELIMITER, 2).map((segment) => segment.trim());
	return [start, end || undefined];
}

export interface ParsedDateRange {
	start: Date;
	end?: Date;
}

/**
 * Safely parse a date string and return a Date object or null if invalid
 * Handles both single dates and date ranges (e.g., '2024-01-01' or '2024-01-01/2024-01-02')
 */
export function safeParseDate(dateString: string): Date | null {
	if (!dateString) {
		return null;
	}

	const [rawDate] = splitDateRange(dateString);
	return parseDate(rawDate);
}

/**
 * Safely parse a date range string and return both start and end dates when valid.
 */
export function safeParseDateRange(dateString: string): ParsedDateRange | null {
	if (!dateString) {
		return null;
	}

	const [rawStart, rawEnd] = splitDateRange(dateString);
	const start = parseDate(rawStart);
	if (!start) {
		return null;
	}

	if (!rawEnd) {
		return { start };
	}

	const end = parseDate(rawEnd);
	return end ? { start, end } : null;
}

/**
 * Safely format a date string using the provided formatter
 * Handles both single dates and date ranges
 */
export function safeFormatDate(dateString: string, formatter: Intl.DateTimeFormat): string {
	const date = safeParseDate(dateString);
	if (!date) {
		return INVALID_DATE_LABEL;
	}
	return formatter.format(date);
}

/**
 * Safely get the timestamp of a date string for sorting purposes
 * Handles both single dates and date ranges by using the first date
 */
export function safeGetTimestamp(dateString: string): number {
	const date = safeParseDate(dateString);
	return date ? date.getTime() : 0;
}

/**
 * Safely format a date string to locale date string
 * Handles both single dates and date ranges
 */
export function safeToLocaleDateString(dateString: string): string {
	const date = safeParseDate(dateString);
	if (!date) {
		return INVALID_DATE_LABEL;
	}
	return date.toLocaleDateString();
}

/**
 * Safely format an event date string, preserving the range format if present
 * Returns the original format with '/' replaced by ' - ' for display
 */
export function safeFormatEventDate(dateString: string): string {
	const range = safeParseDateRange(dateString);
	if (!range) {
		return INVALID_DATE_LABEL;
	}

	if (!range.end) {
		return range.start.toLocaleDateString();
	}

	return `${range.start.toLocaleDateString()} - ${range.end.toLocaleDateString()}`;
}
