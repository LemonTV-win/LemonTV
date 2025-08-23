import { SITE_CANONICAL_HOST } from '$lib/consts';
import type { RequestHandler } from './$types';
import { ImageResponse } from '@vercel/og';

// Basic dynamic OG image generator using @vercel/og
// URL params: title, description, image, url
export const GET: RequestHandler = async ({ url }) => {
	const title = url.searchParams.get('title') || 'LemonTV';
	const description = url.searchParams.get('description') || '';
	const image = url.searchParams.get('image');
	const pageUrl = url.searchParams.get('url') || SITE_CANONICAL_HOST;

	const element: any = {
		type: 'div',
		props: {
			style: {
				display: 'flex',
				width: '100%',
				height: '100%',
				background: 'linear-gradient(135deg, #0f172a, #1f2937)',
				color: '#f8fafc',
				padding: '48px',
				flexDirection: 'column',
				justifyContent: 'space-between'
			}
		}
	};

	const header: any = {
		type: 'div',
		props: {
			style: { display: 'flex', alignItems: 'center', gap: '16px' },
			children: [
				{
					type: 'img',
					props: { src: `${SITE_CANONICAL_HOST}/favicon.svg`, width: 64, height: 64 }
				},
				{ type: 'div', props: { style: { fontSize: 36, fontWeight: 800 }, children: 'LemonTV' } }
			]
		}
	};

	const content: any = {
		type: 'div',
		props: {
			style: { display: 'flex', flexDirection: 'column', gap: '16px' },
			children: [
				{
					type: 'div',
					props: { style: { fontSize: 64, fontWeight: 800, lineHeight: 1.1 }, children: title }
				},
				description
					? {
							type: 'div',
							props: { style: { fontSize: 28, color: '#e5e7eb' }, children: description }
						}
					: null
			]
		}
	};

	const footer: any = {
		type: 'div',
		props: {
			style: {
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
				fontSize: 20,
				color: '#cbd5e1'
			},
			children: [
				{ type: 'div', props: { children: pageUrl } },
				image ? { type: 'img', props: { src: image, height: 72 } } : null
			]
		}
	};

	(element.props as any).children = [header, content, footer].filter(Boolean);

	return new ImageResponse(element, {
		width: 1200,
		height: 630
	});
};
