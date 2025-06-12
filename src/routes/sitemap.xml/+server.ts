import { getEvents } from '$lib/server/data/events';
import { getOrganizers } from '$lib/server/data/organizers';
import { getPlayers } from '$lib/server/data/players';
import { getTeams } from '$lib/server/data/teams';

function generateSitemap(hostname: string, urls: string[]) {
	return `<?xml version="1.0" encoding="UTF-8" ?>
		<urlset
			xmlns="https://www.sitemaps.org/schemas/sitemap/0.9"
			xmlns:xhtml="https://www.w3.org/1999/xhtml"
			xmlns:mobile="https://www.google.com/schemas/sitemap-mobile/1.0"
			xmlns:news="https://www.google.com/schemas/sitemap-news/0.9"
			xmlns:image="https://www.google.com/schemas/sitemap-image/1.1"
			xmlns:video="https://www.google.com/schemas/sitemap-video/1.1"
		>
      <url>
        <loc>${hostname}</loc>
        <changefreq>daily</changefreq>
      </url>
      ${urls
				.map(
					(url) =>
						`<url><loc>${new URL(url, hostname).toString()}</loc><changefreq>daily</changefreq></url>`
				)
				.join('\n')}
		</urlset>`;
}

export async function GET() {
	const players = await getPlayers();
	const events = await getEvents();
	const teams = await getTeams();
	const organizers = await getOrganizers();

	const urls: Set<string> = new Set([
		'/',
		'/about',
		'/community',
		'/contact',
		// TODO: '/privacy',
		// TODO: '/terms',
		'/events',
		// TODO: '/matches',
		'/news',
		'/teams',
		'/players',
		'/organizers',
		...players.map((player) => `/players/${player.slug}`),
		...events.map((event) => `/events/${event.slug}`),
		...teams.map((team) => `/teams/${team.slug}`),
		...organizers.map((organizer) => `/organizers/${organizer.slug}`)
	]);
	return new Response(generateSitemap('https://lemontv.win/', Array.from(urls)), {
		headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'max-age=0' }
	});
}
