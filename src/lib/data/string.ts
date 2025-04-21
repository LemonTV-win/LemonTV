import { type Locale } from '$lib/paraglide/runtime';
export type LocalizedString = {
	[key in Locale]: string;
};
