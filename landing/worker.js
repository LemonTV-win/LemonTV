import html from './index.html';

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
	<url>
		<loc>https://strinova.win/</loc>
		<lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
		<changefreq>monthly</changefreq>
		<priority>1.0</priority>
	</url>
</urlset>`;

export default {
	async fetch(request, _env, _ctx) {
		const url = new URL(request.url);

		// Handle sitemap
		if (url.pathname === '/sitemap.xml') {
			return new Response(sitemap, {
				headers: {
					'content-type': 'application/xml;charset=UTF-8'
				}
			});
		}

		// Handle robots.txt
		if (url.pathname === '/robots.txt') {
			return new Response(`User-agent: *\nAllow: /\nSitemap: https://strinova.win/sitemap.xml`, {
				headers: {
					'content-type': 'text/plain;charset=UTF-8'
				}
			});
		}

		// Default to homepage for strinova.win and others
		return new Response(html, {
			headers: {
				'content-type': 'text/html;charset=UTF-8'
			}
		});
	}
};
