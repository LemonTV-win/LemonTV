import { ImageResponse } from '@vercel/og';
import type { RequestHandler } from './$types';
import { SITE_CANONICAL_HOST } from '$lib/consts';
import { getPlayer, getServerPlayerStats } from '$lib/server/data/players';
import { processImageURL } from '$lib/server/storage';
import { html } from 'satori-html';
import { m } from '$lib/paraglide/messages';
import { assertIsLocale, isLocale, type Locale } from '$lib/paraglide/runtime';
import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { sql } from 'drizzle-orm';
import placeholderAvatar from '$assets/placeholder_avatar.png';
export const config = { runtime: 'nodejs22.x' };

async function loadGoogleFont(font: string, text: string) {
	const url = `https://fonts.googleapis.com/css2?family=${font}&text=${encodeURIComponent(text)}`;
	const css = await (await fetch(url)).text();
	const resource = css.match(/src: url\(([^)]+)\) format\('(opentype|truetype|woff)'\)/);

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
		console.info(`[API][OG][Players] Incoming request`, {
			id: params.id,
			q: Object.fromEntries(url.searchParams.entries())
		});
		const searchParams = url.searchParams;
		const locale: Locale = isLocale(searchParams.get('locale'))
			? assertIsLocale(searchParams.get('locale'))
			: 'en';

		console.info(`[API][OG][Players] Fetching player by id/slug`);
		const id = params.id;
		const player = await getPlayer(id);
		if (!player) {
			console.info(`[API][OG][Players] Player not found`);
			return new Response('Player not found', { status: 404 });
		}
		console.info(`[API][OG][Players] Player found: ${player.name}`);

		console.info(`[API][OG][Players] Fetching aggregated stats`);
		const stats = await getServerPlayerStats(player.id);

		console.info(`[API][OG][Players] Fetching materialized rating/events`);
		const mat = await db.query.playerStats.findFirst({
			where: (t, { eq }) => eq(t.playerId, player.id)
		});
		const rating = mat?.playerRating ?? 0;
		const eventsCount = mat?.eventsCount ?? (stats.events?.length || 0);

		console.info(`[API][OG][Players] Calculating approximate global rank by rating`);
		const [{ better }] = await db
			.select({ better: sql<number>`count(*)` })
			.from(schema.playerStats)
			.where(sql`${schema.playerStats.playerRating} > ${rating}`);
		const rank = (better ?? 0) + 1;

		console.info(`[API][OG][Players] Deriving current teams and latest event`);
		const currentTeams = (player.teams || []).filter((t) => t.role === 'active');
		const currentTeamLabel = currentTeams.map((t) => t.name).join(' / ');
		let latestEventName: string | null = null;
		if (stats.events && stats.events.length > 0) {
			const sorted = [...stats.events].sort(
				(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
			);
			latestEventName = sorted[0]?.name || null;
		}

		console.info(`[API][OG][Players] Processing avatar`);
		let avatarURL: string = placeholderAvatar; // fallback
		if (player.avatar) {
			const processed = await processImageURL(player.avatar);
			if (processed) avatarURL = processed;
		}

		const bgImage = `${SITE_CANONICAL_HOST}/blurred.jpg`;
		const labelTeam = m['content.players.current_teams']
			? m['content.players.current_teams']({ count: currentTeams.length }, { locale })
			: 'Team';
		const labelLatestEvent = m.attended_events(undefined, { locale });
		const profileLabel = 'Player Profile • LemonTV';
		const canonicalUrl = `${SITE_CANONICAL_HOST}/players/${player.slug || player.id}`;
		const logo = `${SITE_CANONICAL_HOST}/favicon-96x96.png`;

		console.info(`[API][OG][Players] Building markup`);
		const statBoxStyle =
			'display: flex; flex-direction: column; background: rgba(29,41,61,0.65); border-radius: 14px; padding: 20px 22px; min-width: 180px; align-items: flex-start;';
		const statBoxLabelStyle = 'display: flex; font-size: 20px; color: #cbd5e1';
		const statBoxValueStyle = 'display: flex; font-size: 36px; font-weight: 800';
		const markup = html`
			<div
				style="display: flex; flex-direction: column; width: 1200px; height: 630px; position: relative; font-family: Saira, 'Noto Sans JP', sans-serif; background: black;"
			>
				<!-- Background image -->
				<img
					src="${bgImage}"
					style="display: flex; position: absolute; top: 0; left: 0; width: 1200px; height: 630px; object-fit: cover; filter: blur(18px); opacity: 0.45;"
				/>
				<!-- Branding header -->
				<div
					style="display: flex; flex-direction: row; align-items: center; gap: 12px; opacity: 0.95; padding: 18px 56px; margin-top: 14px;"
				>
					<img
						src="${logo}"
						style="display: flex; width: 58px; height: 58px; border-radius: 10px;"
					/>
					<div
						style="display: flex; font-size:46px; font-weight:700; letter-spacing:0.5px; color:white;"
					>
						LemonTV
					</div>
				</div>
				<!-- Main content -->
				<div
					style="display: flex; position: relative; flex-direction: row; align-items: center; justify-content: center; padding: 32px 48px 56px; width:100%"
				>
					<!-- Card -->
					<div
						style="display:flex; flex-direction:row; gap:32px; align-items:center; background:linear-gradient(135deg, rgba(71,85,105,0.68), rgba(30,41,59,0.90)); border:1px solid rgba(255,255,255,0.30); border-radius:24px; padding:32px 36px; box-shadow:0 12px 42px rgba(0,0,0,0.5); width:1120px;"
					>
						<!-- Left: Avatar inside card -->
						<div
							style="display:flex; flex-direction:column; width:240px; height:240px; border-radius:100%; overflow:hidden; box-shadow:0 10px 36px rgba(0,0,0,0.4)"
						>
							<img
								src="${avatarURL}"
								width="240"
								height="240"
								style="display:flex; object-fit:cover; width:240px; height:240px; background:black;"
							/>
						</div>
						<!-- Right: Branding, name, meta, stats, footer -->
						<div
							style="display:flex; flex-direction:column; gap:18px; color:#f8fafc; flex:1; min-width:0;"
						>
							<!-- Title row with name and rank badge -->
							<div style="display:flex; flex-direction:row; align-items:baseline; gap:16px;">
								<div
									style="display:flex; font-size:68px; font-weight:800; line-height:1.1; text-shadow:0 2px 6px rgba(0,0,0,0.4); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"
								>
									${player.name}
								</div>
								<!-- Player rank -->
								<div style="display:flex; font-size: 36px; font-weight:700; color:#7dd3fc;">
									${m.rank(undefined, { locale })} #${rank}
								</div>
							</div>
							<!-- Meta row for team and latest event -->
							<div
								style="display: flex; flex-direction: row; flex-wrap: wrap; gap: 22px; color: #e2e8f0; font-size: 22px;"
							>
								<div style="display:flex; flex-direction:row;">
									${labelTeam}:
									<span style="color: #fff; font-weight: 600; margin-left: 8px;"
										>${currentTeamLabel || '—'}</span
									>
								</div>
								<div style="display:flex; flex-direction:row;">
									${labelLatestEvent} (${eventsCount}):
									<span style="color: #fff; font-weight: 600; margin-left: 8px;"
										>${latestEventName || '—'}</span
									>
								</div>
							</div>
							<!-- Stats row -->
							<div style="display: flex; flex-direction: row; gap: 18px; margin-top: 10px;">
								<div style="${statBoxStyle}">
									<div style="${statBoxLabelStyle}">${m.wins(undefined, { locale })}</div>
									<div style="${statBoxValueStyle}">${String(stats.wins)}</div>
								</div>
								<div style="${statBoxStyle}">
									<div style="${statBoxLabelStyle}">${m.win_rate(undefined, { locale })}</div>
									<div style="${statBoxValueStyle}">${(stats.winRate || 0).toFixed(1)}%</div>
								</div>
								<div style="${statBoxStyle}">
									<div style="${statBoxLabelStyle}">${m.kd_ratio(undefined, { locale })}</div>
									<div style="${statBoxValueStyle}">${(stats.kd || 0).toFixed(2)}</div>
								</div>
								<div style="${statBoxStyle}">
									<div style="${statBoxLabelStyle}">${m.rating(undefined, { locale })}</div>
									<div style="${statBoxValueStyle}">${rating.toFixed(2)}</div>
								</div>
							</div>
							<!-- Footer row: profile label + canonical URL -->
							<div
								style="display: flex; flex-direction: row; gap: 14px; color: #cbd5e1; font-size: 20px; margin-top: 14px; justify-content: space-between;"
							>
								<div style="display: flex; color: white;">${profileLabel}</div>
								<div style="display: flex; color: #94a3b8;">${canonicalUrl}</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		`;

		console.info(`[API][OG][Players] Loading fonts`);
		const textForFont = `${player.name} Player Profile LemonTV ${m.wins(undefined, { locale })} ${m.win_rate(undefined, { locale })} ${m.kd_ratio(undefined, { locale })} ${m.rating(undefined, { locale })}`;
		const res = new ImageResponse(markup as any, {
			width: 1200,
			height: 630,
			fonts: [
				{ name: 'Saira', data: await loadGoogleFont('Saira', textForFont) },
				{ name: 'Noto Sans JP', data: await loadGoogleFont('Noto+Sans+JP', textForFont) }
			]
		});
		console.info(`[API][OG][Players] Rendering image (awaiting blob)`);
		const blob = await res.blob();
		console.info(`[API][OG][Players] Image ready, sending response (${blob.size} bytes)`);
		return new Response(blob, { headers: { 'Content-Type': 'image/png' } });
	} catch (error) {
		console.error('[API][OG][Players] Failed to generate image:', error);
		return new Response('Failed to generate player OG image', { status: 500 });
	}
};
