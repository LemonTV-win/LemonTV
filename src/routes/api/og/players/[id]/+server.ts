import { ImageResponse } from '@vercel/og';
import type { RequestHandler } from './$types';
import { SITE_CANONICAL_HOST } from '$lib/consts';
import { getPlayer, getServerPlayerStats } from '$lib/server/data/players';
import { processImageURL } from '$lib/server/storage';
import { html } from 'satori-html';
import { m } from '$lib/paraglide/messages';
import { assertIsLocale, isLocale, type Locale } from '$lib/paraglide/runtime';
export const config = { runtime: 'nodejs22.x' };

async function loadGoogleFont(font: string, text: string) {
	const url = `https://fonts.googleapis.com/css2?family=${font}&text=${encodeURIComponent(text)}`;
	const css = await (await fetch(url)).text();
	const resource = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/);

	if (resource) {
		const response = await fetch(resource[1]);
		if (response.status == 200) {
			return await response.arrayBuffer();
		}
	}

	throw new Error('failed to load font data');
}

export const GET: RequestHandler = async ({ params, url }) => {
	try {
		console.info(`[API][OG][Players] Attempting to generate player OG image for ${params.id}`);
		const searchParams = url.searchParams;
		const locale: Locale = isLocale(searchParams.get('locale'))
			? assertIsLocale(searchParams.get('locale'))
			: 'en';

		const id = params.id;
		const player = await getPlayer(id);
		if (!player) {
			return new Response('Player not found', { status: 404 });
		}
		console.info(`[API][OG][Players] Player found: ${player.name}`);
		const stats = await getServerPlayerStats(player.id);
		console.info(`[API][OG][Players] Stats: ${JSON.stringify(stats)}`);

		let avatarURL: string = `${SITE_CANONICAL_HOST}/favicon.svg`;
		if (player.avatar) {
			const processed = await processImageURL(player.avatar);
			if (processed) avatarURL = processed;
		}

		const bgImage = `${SITE_CANONICAL_HOST}/blurred.jpg`;

		const markup = html`
			<div
				style="display:flex; width:1200px; height:630px; position:relative; font-family: Saira, sans-serif; background: black;"
			>
				<img
					src="${bgImage}"
					style="display:block; position:absolute; top:0; left:0; width:1200px; height:630px; object-fit:cover; filter:blur(18px); opacity:0.5"
				/>
				<div
					style="display:flex; position:relative; flex-direction:row; gap:36px; align-items:center; padding:64px; width:100%"
				>
					<div
						style="display:flex; width:200px; height:200px; border-radius:100%; overflow:hidden; box-shadow:0 8px 30px rgba(0,0,0,0.35)"
					>
						<img
							src="${avatarURL}"
							width="200"
							height="200"
							style="display:block; object-fit:cover; width:200px; height:200px; background:black;"
						/>
					</div>
					<div style="display:flex; flex-direction:column; gap:12px; color:#f8fafc">
						<div style="display:block; font-size:56px; font-weight:800; line-height:1.1">
							${player.name}
						</div>
						<div style="display:block; font-size:24px; color:#cbd5e1">Player Profile • LemonTV</div>
						<div style="display:flex; flex-direction:row; gap:16px; margin-top:12px;">
							<div
								style="display:flex; flex-direction:column; background:rgba(15,23,42,0.6); border-radius:12px; padding:16px; border:1px solid rgba(148,163,184,0.25)"
							>
								<div style="display:block; font-size:16px; color:#cbd5e1">
									${m.wins(undefined, { locale })}
								</div>
								<div style="display:block; font-size:28px; font-weight:800">${stats.wins}</div>
							</div>
							<div
								style="display:flex; flex-direction:column; background:rgba(15,23,42,0.6); border-radius:12px; padding:16px; border:1px solid rgba(148,163,184,0.25)"
							>
								<div style="display:block; font-size:16px; color:#cbd5e1">
									${m.win_rate(undefined, { locale })}
								</div>
								<div style="display:block; font-size:28px; font-weight:800">
									${Math.round((stats.winRate || 0) * 100)}%
								</div>
							</div>
							<div
								style="display:flex; flex-direction:column; background:rgba(15,23,42,0.6); border-radius:12px; padding:16px; border:1px solid rgba(148,163,184,0.25)"
							>
								<div style="display:block; font-size:16px; color:#cbd5e1">
									${m.kd_ratio(undefined, { locale })}
								</div>
								<div style="display:block; font-size:28px; font-weight:800">
									${(stats.kd || 0).toFixed(2)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		`;

		const res = new ImageResponse(markup as any, {
			width: 1200,
			height: 630,
			fonts: [
				{
					name: 'Saira',
					data: await loadGoogleFont('Saira', 'Hello')
				}
			]
		});
		console.info(`[API][OG][Players] Image generated: ${res.status}`);
		const result = await res.blob();
		console.info(`[API][OG][Players] Image generated: ${result}`);
		return new Response(result, {
			headers: {
				'Content-Type': 'image/png'
			}
		});
	} catch (error) {
		console.error('[API][OG][Players] Failed to generate image:', error);
		return new Response('Failed to generate player OG image', { status: 500 });
	}
};
