export interface PageMetadata {
	title: string;
	description: string;
	image?: string;
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
	return `/api/og?${params.toString()}`;
}
