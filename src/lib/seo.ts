import { SITE_CANONICAL_HOST } from '$lib/consts';
export interface PageMetadata {
	title: string;
	description: string;
	image?: string;
	ogImageUrl?: string; // Overrides the default og:image
}
