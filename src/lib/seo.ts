import { SITE_CANONICAL_HOST } from '$lib/consts';
export interface PageMetadata {
	title: string;
	description: string;
	image?: string;
	ogImageUrl?: string; // Overrides the default og:image
}

export function buildOgImageUrl(args: {
	title: string;
	description?: string;
	image?: string;
	url?: string;
}) {
	const params = new URLSearchParams();
	params.set('title', args.title);
	if (args.description) params.set('description', args.description);
	if (args.image) params.set('image', args.image);
	if (args.url) params.set('url', args.url);
	const base = typeof window === 'undefined' ? SITE_CANONICAL_HOST : window.location.origin;
	return `${base}/api/og?${params.toString()}`;
}
