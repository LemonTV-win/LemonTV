export function countryCodeToLocalizedName(code: string, locale: string) {
	return new Intl.DisplayNames([locale], { type: 'region' }).of(code);
}
