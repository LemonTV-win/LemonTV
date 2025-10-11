export function countryCodeToLocalizedName(code: string, locale: string) {
	return new Intl.DisplayNames([locale], { type: 'region' }).of(code);
}

/**
 * Generates a URL-friendly slug from a string.
 * More lenient than basic slug generation - preserves case and only replaces
 * problematic characters while keeping most of the original text intact.
 */
export function formatSlug(name: string): string {
	return name
		.trim()
		.replace(/\s+/gu, '-') // Replace spaces with hyphens
		.replace(/[^\p{L}\p{N}-]/gu, '') // Remove special characters except hyphens and alphanumeric
		.replace(/-+/gu, '-') // Collapse multiple hyphens
		.replace(/^-+|-+$/gu, ''); // Remove leading/trailing hyphens
}

/**
 * Converts a string to title case.
 *
 * @param text - The string to convert to title case.
 * @param locale - The locale to use for the title case.
 * @returns The title case string.
 */
export function toLocaleTitleCase(text: string, locale: string): string {
	return text
		.toLocaleLowerCase(locale)
		.replace(/(?<!\S)\S/gu, (match) => match.toLocaleUpperCase(locale));
}
