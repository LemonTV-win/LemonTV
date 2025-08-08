/**
 * Safely parse a date string and return a Date object or null if invalid
 * Handles both single dates and date ranges (e.g., '2024-01-01' or '2024-01-01/2024-01-02')
 */
export function safeParseDate(dateString: string): Date | null {
	if (!dateString) return null;

	try {
		// Handle date ranges by taking the first date
		const actualDate = dateString.includes('/') ? dateString.split('/')[0] : dateString;
		const date = new Date(actualDate);
		// Check if the date is valid
		if (isNaN(date.getTime())) {
			return null;
		}
		return date;
	} catch {
		return null;
	}
}

/**
 * Safely format a date string using the provided formatter
 * Handles both single dates and date ranges
 */
export function safeFormatDate(dateString: string, formatter: Intl.DateTimeFormat): string {
	const date = safeParseDate(dateString);
	if (!date) {
		return 'Invalid Date';
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
		return 'Invalid Date';
	}
	return date.toLocaleDateString();
}

/**
 * Safely format an event date string, preserving the range format if present
 * Returns the original format with '/' replaced by ' - ' for display
 */
export function safeFormatEventDate(dateString: string): string {
	if (!dateString) return 'Invalid Date';

	try {
		if (dateString.includes('/')) {
			// Handle date range
			const [start, end] = dateString.split('/');
			const startDate = safeParseDate(start);
			const endDate = safeParseDate(end);

			if (!startDate || !endDate) {
				return 'Invalid Date';
			}

			return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
		} else {
			// Handle single date
			const date = safeParseDate(dateString);
			if (!date) {
				return 'Invalid Date';
			}
			return date.toLocaleDateString();
		}
	} catch {
		return 'Invalid Date';
	}
}
