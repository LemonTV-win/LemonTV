/**
 * Authorized MCP server — concrete tool registry.
 *
 * Each tool wraps the shared data layer (`$lib/server/data/*`) so MCP edits get
 * the same validation + `edit_history` attribution as the admin UI. Write tools
 * are flagged `requiresWrite` and enforced by `dispatch`.
 */
import { desc, eq, inArray, or } from 'drizzle-orm';
import type { TCountryCode } from 'countries-list';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import {
	createEvent,
	updateEvent,
	addEventTeams,
	setEventResults,
	addEventTeamPlayers,
	updateEventCasters,
	setEventWebsites,
	EVENT_FORMATS,
	EVENT_SERVERS,
	EVENT_STATUSES,
	type EventWebsiteInput,
	type UpdateEventFields
} from '$lib/server/data/events';
import {
	normalizeEventTeams,
	normalizeEventResults,
	normalizeEventRoster,
	normalizeEventCasters,
	EVENT_TEAM_ENTRIES,
	EVENT_TEAM_STATUSES,
	EVENT_TEAM_PLAYER_ROLES,
	EVENT_CASTER_ROLES
} from './event-args';
import {
	createPlayer,
	getPlayer,
	getPlayers,
	updatePlayerFields,
	type UpdatePlayerFields
} from '$lib/server/data/players';
import {
	createTeam,
	getTeam,
	getTeams,
	updateTeamFields,
	type UpdateTeamFields
} from '$lib/server/data/teams';
import { getGameAccountServer } from '$lib/data/players';
import { formatSlug } from '$lib/utils/strings';
import type { McpTool } from './dispatch';
import {
	requireString,
	requireInt,
	optionalInt,
	optionalBoolean,
	optionalEnum,
	requireEnum
} from './args';
import { stripUser, stripRosterUserPII } from './project';

const GAME_ACCOUNT_REGIONS = ['APAC', 'NA', 'EU', 'CN', 'Unknown'] as const;
const TEAM_REGIONS = ['CN', 'APAC', 'NA', 'SA', 'EU', 'WA', 'Global'] as const;
const TEAM_PLAYER_ROLES = ['active', 'substitute', 'former', 'coach', 'manager', 'owner'] as const;

const EVENT_SUMMARY_COLUMNS = {
	id: table.event.id,
	slug: table.event.slug,
	name: table.event.name,
	status: table.event.status,
	region: table.event.region,
	format: table.event.format,
	server: table.event.server,
	official: table.event.official,
	capacity: table.event.capacity,
	date: table.event.date
} as const;

/** Resolve an event id-or-slug to its id, throwing a clear error if unknown. */
async function resolveEventId(idOrSlug: string): Promise<string> {
	const [row] = await db
		.select({ id: table.event.id })
		.from(table.event)
		.where(or(eq(table.event.id, idOrSlug), eq(table.event.slug, idOrSlug)))
		.limit(1);
	if (!row) throw new Error(`Event not found: ${idOrSlug}`);
	return row.id;
}

/**
 * Verify every team id exists before writing rows that reference them. The FK
 * would reject an unknown id, but with an opaque constraint error; this surfaces
 * exactly which ids are missing so the caller can create_team first.
 */
async function assertTeamsExist(teamIds: string[]): Promise<void> {
	const unique = [...new Set(teamIds)];
	if (unique.length === 0) return;
	const found = await db
		.select({ id: table.team.id })
		.from(table.team)
		.where(inArray(table.team.id, unique));
	const foundIds = new Set(found.map((r) => r.id));
	const missing = unique.filter((id) => !foundIds.has(id));
	if (missing.length > 0) {
		throw new Error(
			`Unknown team id(s): ${missing.join(', ')} (create them with create_team first)`
		);
	}
}

/** Resolve a team id-or-slug to its id, throwing a clear error if unknown. */
async function resolveTeamId(idOrSlug: string): Promise<string> {
	const [row] = await db
		.select({ id: table.team.id })
		.from(table.team)
		.where(or(eq(table.team.id, idOrSlug), eq(table.team.slug, idOrSlug)))
		.limit(1);
	if (!row) throw new Error(`Team not found: ${idOrSlug}`);
	return row.id;
}

/** Resolve a player id-or-slug to its id, throwing a clear error if unknown. */
async function resolvePlayerId(idOrSlug: string): Promise<string> {
	const [row] = await db
		.select({ id: table.player.id })
		.from(table.player)
		.where(or(eq(table.player.id, idOrSlug), eq(table.player.slug, idOrSlug)))
		.limit(1);
	if (!row) throw new Error(`Player not found: ${idOrSlug}`);
	return row.id;
}

/** Verify every player id exists before writing rows that reference them. */
async function assertPlayersExist(playerIds: string[]): Promise<void> {
	const unique = [...new Set(playerIds)];
	if (unique.length === 0) return;
	const found = await db
		.select({ id: table.player.id })
		.from(table.player)
		.where(inArray(table.player.id, unique));
	const foundIds = new Set(found.map((r) => r.id));
	const missing = unique.filter((id) => !foundIds.has(id));
	if (missing.length > 0) {
		throw new Error(
			`Unknown player id(s): ${missing.join(', ')} (create them with create_player first)`
		);
	}
}

async function generateUniqueEventSlug(name: string): Promise<string> {
	const base = formatSlug(name) || 'event';
	for (let i = 0; i < 1000; i += 1) {
		const slug = i === 0 ? base : `${base}-${i + 1}`;
		const [existing] = await db
			.select({ id: table.event.id })
			.from(table.event)
			.where(eq(table.event.slug, slug))
			.limit(1);
		if (!existing) return slug;
	}
	throw new Error(`Could not generate a unique slug for "${name}"`);
}

function parseJsonLikeString(value: string, field: string): unknown {
	try {
		return JSON.parse(value);
	} catch {
		throw new Error(`Invalid ${field}: expected valid JSON when passing a stringified value`);
	}
}

function optionalStringList(value: unknown, field: string): string[] {
	if (value === undefined || value === null || value === '') return [];
	if (typeof value === 'string') {
		const trimmed = value.trim();
		if (!trimmed) return [];
		if (trimmed.startsWith('['))
			return optionalStringList(parseJsonLikeString(trimmed, field), field);
		return trimmed
			.split(',')
			.map((item) => item.trim())
			.filter(Boolean);
	}
	if (!Array.isArray(value)) {
		throw new Error(`Invalid ${field}: expected an array of strings`);
	}
	return value.map((item, index) => {
		if (typeof item !== 'string' || item.trim() === '') {
			throw new Error(`Invalid ${field}[${index}]: expected a non-empty string`);
		}
		return item.trim();
	});
}

function optionalWebsites(value: unknown): { url: string; label?: string }[] {
	if (value === undefined || value === null || value === '') return [];
	if (typeof value === 'string') {
		const trimmed = value.trim();
		if (!trimmed) return [];
		if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
			return optionalWebsites(parseJsonLikeString(trimmed, 'websites'));
		}
		return trimmed
			.split(/\r?\n|,/u)
			.map((url) => url.trim())
			.filter(Boolean)
			.map((url) => ({ url }));
	}
	if (!Array.isArray(value)) {
		throw new Error('Invalid websites: expected an array of URLs or { url, label } objects');
	}
	return value
		.map((item, index) => {
			if (typeof item === 'string') {
				const url = item.trim();
				if (!url) return null;
				return { url };
			}
			if (item && typeof item === 'object') {
				const record = item as Record<string, unknown>;
				if (typeof record.url !== 'string' || record.url.trim() === '') {
					throw new Error(`Invalid websites[${index}].url: expected a non-empty string`);
				}
				const label =
					typeof record.label === 'string' && record.label.trim() !== ''
						? record.label.trim()
						: undefined;
				return { url: record.url.trim(), ...(label ? { label } : {}) };
			}
			throw new Error(`Invalid websites[${index}]: expected a URL string or object`);
		})
		.filter((website): website is { url: string; label?: string } => website !== null);
}

function normalizeEventWebsites(value: unknown): EventWebsiteInput[] {
	const websites = optionalWebsites(value);
	const seen = new Set<string>();
	return websites.map((website, index) => {
		let parsed: URL;
		try {
			parsed = new URL(website.url);
		} catch {
			throw new Error(`Invalid websites[${index}].url: expected an absolute URL`);
		}
		if (!['http:', 'https:'].includes(parsed.protocol)) {
			throw new Error(`Invalid websites[${index}].url: expected http(s) URL`);
		}
		const url = parsed.toString();
		if (seen.has(url)) throw new Error(`Invalid websites: duplicate URL "${url}"`);
		seen.add(url);
		return { url, label: website.label ?? null };
	});
}

async function readEventForMcp(idOrSlug: string) {
	const [row] = await db
		.select()
		.from(table.event)
		.where(or(eq(table.event.id, idOrSlug), eq(table.event.slug, idOrSlug)))
		.limit(1);
	if (!row) return null;

	// Include related rows so write tools can return immediately-verifiable
	// state instead of forcing a follow-up get_event call.
	const teams = await db
		.select({
			teamId: table.eventTeam.teamId,
			name: table.team.name,
			slug: table.team.slug,
			entry: table.eventTeam.entry,
			status: table.eventTeam.status
		})
		.from(table.eventTeam)
		.innerJoin(table.team, eq(table.eventTeam.teamId, table.team.id))
		.where(eq(table.eventTeam.eventId, row.id));

	const results = await db
		.select({
			teamId: table.eventResult.teamId,
			name: table.team.name,
			rank: table.eventResult.rank,
			rankTo: table.eventResult.rankTo,
			prizeAmount: table.eventResult.prizeAmount,
			prizeCurrency: table.eventResult.prizeCurrency
		})
		.from(table.eventResult)
		.innerJoin(table.team, eq(table.eventResult.teamId, table.team.id))
		.where(eq(table.eventResult.eventId, row.id))
		.orderBy(table.eventResult.rank);

	const organizers = await db
		.select({
			id: table.organizer.id,
			slug: table.organizer.slug,
			name: table.organizer.name
		})
		.from(table.eventOrganizer)
		.innerJoin(table.organizer, eq(table.eventOrganizer.organizerId, table.organizer.id))
		.where(eq(table.eventOrganizer.eventId, row.id));

	const websites = await db
		.select({ url: table.eventWebsite.url, label: table.eventWebsite.label })
		.from(table.eventWebsite)
		.where(eq(table.eventWebsite.eventId, row.id));

	const videos = await db
		.select({
			type: table.eventVideo.type,
			url: table.eventVideo.url,
			platform: table.eventVideo.platform,
			title: table.eventVideo.title
		})
		.from(table.eventVideo)
		.where(eq(table.eventVideo.eventId, row.id));

	const casters = await db
		.select({
			playerId: table.eventCaster.playerId,
			name: table.player.name,
			slug: table.player.slug,
			role: table.eventCaster.role
		})
		.from(table.eventCaster)
		.innerJoin(table.player, eq(table.eventCaster.playerId, table.player.id))
		.where(eq(table.eventCaster.eventId, row.id));

	return { ...row, organizers, websites, videos, teams, results, casters };
}

function decodeHtmlEntities(value: string): string {
	return value
		.replace(/&nbsp;/gu, ' ')
		.replace(/&amp;/gu, '&')
		.replace(/&lt;/gu, '<')
		.replace(/&gt;/gu, '>')
		.replace(/&quot;/gu, '"')
		.replace(/&#39;/gu, "'")
		.replace(/&#(\d+);/gu, (_, code) => String.fromCodePoint(Number(code)))
		.replace(/&#x([\da-f]+);/giu, (_, code) => String.fromCodePoint(parseInt(code, 16)));
}

function extractMeta(html: string, property: string): string | null {
	const escaped = property.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
	const patterns = [
		new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']+)["']`, 'iu'),
		new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escaped}["']`, 'iu')
	];
	for (const pattern of patterns) {
		const match = html.match(pattern);
		if (match?.[1]) return decodeHtmlEntities(match[1].trim());
	}
	return null;
}

function extractTitle(html: string): string | null {
	return (
		extractMeta(html, 'og:title') ??
		extractMeta(html, 'twitter:title') ??
		decodeHtmlEntities(html.match(/<title[^>]*>([\s\S]*?)<\/title>/iu)?.[1]?.trim() ?? '') ??
		null
	);
}

function extractImage(html: string, baseUrl: string): string | null {
	const image = extractMeta(html, 'og:image') ?? extractMeta(html, 'twitter:image');
	if (!image) return null;
	try {
		return new URL(image, baseUrl).toString();
	} catch {
		return image;
	}
}

function htmlToText(html: string): string {
	return decodeHtmlEntities(
		html
			.replace(/<script[\s\S]*?<\/script>/giu, ' ')
			.replace(/<style[\s\S]*?<\/style>/giu, ' ')
			.replace(/<[^>]+>/gu, ' ')
			.replace(/\s+/gu, ' ')
			.trim()
	);
}

function toIsoDate(year: string, month: string, day: string): string | null {
	const y = Number(year);
	const m = Number(month);
	const d = Number(day);
	if (y < 2000 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) return null;
	return `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function extractDateCandidates(text: string): string[] {
	const candidates = new Set<string>();
	const patterns = [
		/(20\d{2})[-/.](\d{1,2})[-/.](\d{1,2})/gu,
		/(20\d{2})年\s*(\d{1,2})月\s*(\d{1,2})日?/gu
	];
	for (const pattern of patterns) {
		for (const match of text.matchAll(pattern)) {
			const iso = toIsoDate(match[1], match[2], match[3]);
			if (iso) candidates.add(iso);
		}
	}
	return [...candidates].sort();
}

function inferEventDate(dateCandidates: string[]): string | null {
	if (dateCandidates.length === 0) return null;
	const today = new Date().toISOString().slice(0, 10);
	const usable = dateCandidates.filter((date) => date >= today);
	const dates = usable.length > 0 ? usable : dateCandidates;
	if (dates.length === 1) return dates[0];
	return `${dates[0]}/${dates[dates.length - 1]}`;
}

function inferServer(
	title: string,
	text: string,
	url: string
): (typeof EVENT_SERVERS)[number] | null {
	const haystack = `${title}\n${text}\n${url}`.toLowerCase();
	if (
		haystack.includes('卡拉彼丘') ||
		haystack.includes('calabiyau') ||
		haystack.includes('klbq')
	) {
		return 'calabiyau';
	}
	if (haystack.includes('strinova') || haystack.includes('ストリノヴァ')) return 'strinova';
	return null;
}

function inferRegion(title: string, text: string, url: string): string | null {
	const haystack = `${title}\n${text}\n${url}`;
	if (/[\u4e00-\u9fff]/u.test(haystack) || url.includes('.cn') || url.includes('qq.com'))
		return 'CN';
	if (/[\u3040-\u30ff]/u.test(haystack)) return 'APAC';
	if (/\b(EU|EMEA|Europe)\b/iu.test(haystack)) return 'EU';
	if (/\b(NA|North America)\b/iu.test(haystack)) return 'NA';
	if (/\b(APAC|Asia|Korea|Japan|SEA)\b/iu.test(haystack)) return 'APAC';
	return 'Global';
}

function validatePublicFetchUrl(url: URL): void {
	if (!['http:', 'https:'].includes(url.protocol)) {
		throw new Error('Invalid url: expected http(s) URL');
	}
	const host = url.hostname.replace(/^\[|\]$/gu, '').toLowerCase();
	if (
		host === 'localhost' ||
		host.endsWith('.localhost') ||
		host === '0.0.0.0' ||
		host.startsWith('127.') ||
		host.startsWith('10.') ||
		host.startsWith('192.168.') ||
		host.startsWith('169.254.') ||
		/^172\.(1[6-9]|2\d|3[01])\./u.test(host) ||
		host === '::1' ||
		host.startsWith('fc') ||
		host.startsWith('fd') ||
		host.startsWith('fe80:')
	) {
		throw new Error('Invalid url: private/local hosts are not fetchable');
	}
}

async function fetchUrlText(url: string): Promise<{ finalUrl: string; html: string }> {
	let parsed: URL;
	try {
		parsed = new URL(url);
	} catch {
		throw new Error('Invalid url: expected an absolute URL');
	}
	validatePublicFetchUrl(parsed);

	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 10_000);
	try {
		let current = parsed;
		let response: Response | null = null;
		for (let redirects = 0; redirects <= 5; redirects += 1) {
			response = await fetch(current, {
				headers: { 'User-Agent': 'LemonTV-MCP/1.0 (+https://lemontv.win)' },
				redirect: 'manual',
				signal: controller.signal
			});
			if (![301, 302, 303, 307, 308].includes(response.status)) break;
			const location = response.headers.get('location');
			if (!location) break;
			current = new URL(location, current);
			validatePublicFetchUrl(current);
		}
		if (!response) throw new Error('Failed to fetch url');
		if (!response.ok) throw new Error(`Failed to fetch url: HTTP ${response.status}`);
		const html = (await response.text()).slice(0, 1_000_000);
		return { finalUrl: response.url || parsed.toString(), html };
	} finally {
		clearTimeout(timeout);
	}
}

export const TOOLS: McpTool[] = [
	{
		name: 'list_events',
		description:
			'List LemonTV tournaments/events (most recent first). Optionally filter by status.',
		requiresWrite: false,
		inputSchema: {
			type: 'object',
			properties: {
				status: {
					type: 'string',
					enum: [...EVENT_STATUSES],
					description: 'Optional status filter.'
				},
				limit: {
					type: 'integer',
					minimum: 1,
					maximum: 200,
					description: 'Max events to return (default 50).'
				}
			},
			additionalProperties: false
		},
		handler: async (args) => {
			const limit = Math.min(Math.max(Number(args.limit) || 50, 1), 200);
			const status = typeof args.status === 'string' ? args.status : undefined;
			const rows = await db
				.select(EVENT_SUMMARY_COLUMNS)
				.from(table.event)
				.where(
					status ? eq(table.event.status, status as (typeof EVENT_STATUSES)[number]) : undefined
				)
				.orderBy(desc(table.event.date))
				.limit(limit);
			return { count: rows.length, events: rows };
		}
	},
	{
		name: 'get_event',
		description: 'Get a single LemonTV event by its id or slug.',
		requiresWrite: false,
		inputSchema: {
			type: 'object',
			properties: {
				idOrSlug: { type: 'string', description: 'The event id or slug.' }
			},
			required: ['idOrSlug'],
			additionalProperties: false
		},
		handler: async (args) => {
			const idOrSlug = String(args.idOrSlug ?? '');
			if (!idOrSlug) throw new Error('idOrSlug is required');
			return await readEventForMcp(idOrSlug);
		}
	},
	{
		name: 'draft_event_from_url',
		description:
			'Fetch a public event/source page and return a best-effort event draft plus evidence. This is read-only: review the draft, then call create_event or update_event yourself.',
		requiresWrite: false,
		inputSchema: {
			type: 'object',
			properties: {
				url: { type: 'string', description: 'Public source URL to inspect.' }
			},
			required: ['url'],
			additionalProperties: false
		},
		handler: async (args) => {
			const inputUrl = requireString(args, 'url');
			const { finalUrl, html } = await fetchUrlText(inputUrl);
			const title = extractTitle(html) || null;
			const text = htmlToText(html);
			const image = extractImage(html, finalUrl);
			const dateCandidates = extractDateCandidates(text);
			const eventDate = inferEventDate(dateCandidates);
			const server = inferServer(title ?? '', text, finalUrl);
			const region = inferRegion(title ?? '', text, finalUrl);
			const hostname = new URL(finalUrl).hostname.toLowerCase();
			const official = /(^|\.)idreamsky\.com$/u.test(hostname) || /(^|\.)qq\.com$/u.test(hostname);
			const name = title
				?.replace(/[-_｜|].*?(官网|官方网站|Official).*$/iu, '')
				?.replace(/\s+/gu, ' ')
				?.trim();

			return {
				source: { url: finalUrl, title, image },
				draft: {
					name: name || null,
					slug: name ? formatSlug(name) : null,
					server,
					format: null,
					region,
					status:
						eventDate && eventDate.split('/').at(-1)! < new Date().toISOString().slice(0, 10)
							? 'finished'
							: 'upcoming',
					date: eventDate,
					image,
					official,
					websites: [{ label: 'Source', url: finalUrl }]
				},
				evidence: {
					dateCandidates,
					textPreview: text.slice(0, 1200)
				},
				warnings: [
					'Best-effort extraction only. Verify date/format/capacity/official status before writing.',
					...(dateCandidates.length > 2
						? [
								'Multiple dates found; the inferred date may include announcement or schedule dates.'
							]
						: [])
				]
			};
		}
	},
	{
		name: 'create_event',
		description:
			'Create a new LemonTV tournament/event. Returns the new event id. Teams, results, and casters are added separately. Edits are attributed to the token owner.',
		requiresWrite: true,
		inputSchema: {
			type: 'object',
			properties: {
				name: { type: 'string', description: 'Display name, e.g. "Origami Cup 4".' },
				slug: {
					type: 'string',
					description:
						'URL slug, unique, e.g. "origami-cup-4". Omit to generate a unique slug from the name.'
				},
				server: { type: 'string', enum: [...EVENT_SERVERS], description: 'Game server.' },
				format: { type: 'string', enum: [...EVENT_FORMATS], description: 'Competition format.' },
				region: {
					type: 'string',
					description: 'Region, e.g. "Global", "NA", "EU", "APAC", "CN", "SA".'
				},
				status: { type: 'string', enum: [...EVENT_STATUSES], description: 'Event status.' },
				date: { type: 'string', description: 'YYYY-MM-DD or a range YYYY-MM-DD/YYYY-MM-DD.' },
				image: {
					type: 'string',
					description:
						'Optional banner/logo URL — omit to create the event with no banner (a branded placeholder is shown). An https URL is fetched and stored in our own storage.'
				},
				official: {
					type: 'boolean',
					description: 'Whether it is an official event (default false).'
				},
				capacity: { type: 'integer', minimum: 0, description: 'Team capacity (default 0).' },
				organizerIds: {
					type: 'array',
					items: { type: 'string' },
					description: 'Existing organizer ids to attach (optional).'
				},
				websites: {
					type: 'array',
					items: {
						type: 'object',
						properties: { url: { type: 'string' }, label: { type: 'string' } },
						required: ['url'],
						additionalProperties: false
					},
					description: 'Related links (optional).'
				}
			},
			required: ['name', 'server', 'format', 'region', 'status', 'date'],
			additionalProperties: false
		},
		handler: async (args, identity) => {
			// Enforce required fields up front (dispatch does not validate
			// inputSchema.required); the data layer then validates enum values.
			const name = requireString(args, 'name');
			const slug =
				args.slug !== undefined && args.slug !== null && args.slug !== ''
					? formatSlug(requireString(args, 'slug'))
					: await generateUniqueEventSlug(name);
			if (!slug) throw new Error('Missing or invalid required field: slug');
			const { id } = await createEvent(
				{
					name,
					slug,
					server: requireEnum(args.server, EVENT_SERVERS, 'server'),
					format: requireEnum(args.format, EVENT_FORMATS, 'format'),
					region: requireString(args, 'region') as never,
					status: requireEnum(args.status, EVENT_STATUSES, 'status'),
					date: requireString(args, 'date'),
					image: typeof args.image === 'string' ? args.image : undefined,
					official: optionalBoolean(args, 'official', false),
					capacity: optionalInt(args, 'capacity', 0, { min: 0 }),
					organizerIds: optionalStringList(args.organizerIds, 'organizerIds'),
					websites: optionalWebsites(args.websites)
				},
				identity.userId,
				{ source: 'mcp:create_event' }
			);
			return { id, slug, created: true, event: await readEventForMcp(id) };
		}
	},
	{
		name: 'update_event',
		description:
			'Update fields of an existing LemonTV event, located by id or slug. Only the fields you pass are changed (partial update); useful for filling in dates, region, status, capacity, etc. Returns the id and which fields changed. Edits are attributed to the token owner and recorded in edit history.',
		requiresWrite: true,
		inputSchema: {
			type: 'object',
			properties: {
				idOrSlug: { type: 'string', description: 'The event id or slug to update.' },
				name: { type: 'string', description: 'New display name.' },
				slug: { type: 'string', description: 'New URL slug (lowercase-kebab, unique).' },
				server: { type: 'string', enum: [...EVENT_SERVERS], description: 'Game server.' },
				format: { type: 'string', enum: [...EVENT_FORMATS], description: 'Competition format.' },
				region: {
					type: 'string',
					description: 'Region, e.g. "Global", "NA", "EU", "APAC", "CN", "SA".'
				},
				status: { type: 'string', enum: [...EVENT_STATUSES], description: 'Event status.' },
				date: { type: 'string', description: 'YYYY-MM-DD or a range YYYY-MM-DD/YYYY-MM-DD.' },
				image: { type: 'string', description: 'Banner/logo URL.' },
				official: { type: 'boolean', description: 'Whether it is an official event.' },
				capacity: { type: 'integer', minimum: 0, description: 'Team capacity.' }
			},
			required: ['idOrSlug'],
			additionalProperties: false
		},
		handler: async (args, identity) => {
			const idOrSlug = requireString(args, 'idOrSlug');

			// Build a partial update from only the fields actually supplied, with
			// per-field type/enum validation (the data layer trusts what it gets).
			const fields: UpdateEventFields = {};
			if (args.name !== undefined) fields.name = requireString(args, 'name');
			if (args.slug !== undefined) fields.slug = formatSlug(requireString(args, 'slug'));
			if (args.server !== undefined)
				fields.server = requireEnum(args.server, EVENT_SERVERS, 'server');
			if (args.format !== undefined)
				fields.format = requireEnum(args.format, EVENT_FORMATS, 'format');
			if (args.region !== undefined) fields.region = requireString(args, 'region');
			if (args.status !== undefined)
				fields.status = requireEnum(args.status, EVENT_STATUSES, 'status');
			if (args.date !== undefined) fields.date = requireString(args, 'date');
			if (args.image !== undefined) fields.image = requireString(args, 'image');
			if (args.official !== undefined) fields.official = optionalBoolean(args, 'official');
			if (args.capacity !== undefined)
				fields.capacity = optionalInt(args, 'capacity', 0, { min: 0 });

			const { id, changed } = await updateEvent(idOrSlug, fields, identity.userId, {
				source: 'mcp:update_event'
			});
			return { id, changed, updated: changed.length > 0, event: await readEventForMcp(id) };
		}
	},
	{
		name: 'set_event_websites',
		description:
			'Replace all related links/websites for an event (by id or slug). Pass an empty array to clear links. Accepts {url,label} objects, URL strings, a single URL, newline/comma-separated URLs, or JSON-stringified arrays. Attributed to the token owner.',
		requiresWrite: true,
		inputSchema: {
			type: 'object',
			properties: {
				idOrSlug: { type: 'string', description: 'The event id or slug.' },
				websites: {
					type: 'array',
					description: 'Complete replacement set of related links. Empty array clears all links.',
					items: {
						oneOf: [
							{ type: 'string' },
							{
								type: 'object',
								properties: { url: { type: 'string' }, label: { type: 'string' } },
								required: ['url'],
								additionalProperties: false
							}
						]
					}
				}
			},
			required: ['idOrSlug', 'websites'],
			additionalProperties: false
		},
		handler: async (args, identity) => {
			const eventId = await resolveEventId(requireString(args, 'idOrSlug'));
			const websites = normalizeEventWebsites(args.websites);
			const { count } = await setEventWebsites(eventId, websites, identity.userId, {
				source: 'mcp:set_event_websites'
			});
			return { eventId, count, event: await readEventForMcp(eventId) };
		}
	},
	{
		name: 'add_event_teams',
		description:
			'Attach participant teams to an event (by event id or slug). Additive and idempotent: teams already on the event keep their row with entry/status refreshed, and teams not listed are left untouched (it never drops existing participants). Team ids must already exist (see list_teams / create_team). Returns which teams were added vs. updated. Attributed to the token owner.',
		requiresWrite: true,
		inputSchema: {
			type: 'object',
			properties: {
				idOrSlug: { type: 'string', description: 'The event id or slug.' },
				teams: {
					type: 'array',
					minItems: 1,
					description: 'Participant teams to attach.',
					items: {
						type: 'object',
						properties: {
							teamId: { type: 'string', description: 'Existing team id (see list_teams).' },
							entry: {
								type: 'string',
								enum: [...EVENT_TEAM_ENTRIES],
								description: 'How the team entered (default "open").'
							},
							status: {
								type: 'string',
								enum: [...EVENT_TEAM_STATUSES],
								description: 'Participation status (default "active").'
							}
						},
						required: ['teamId'],
						additionalProperties: false
					}
				}
			},
			required: ['idOrSlug', 'teams'],
			additionalProperties: false
		},
		handler: async (args, identity) => {
			const eventId = await resolveEventId(requireString(args, 'idOrSlug'));
			const teams = normalizeEventTeams(args.teams);
			await assertTeamsExist(teams.map((t) => t.teamId));
			const { added, updated } = await addEventTeams(eventId, teams, identity.userId);
			return { eventId, added, updated };
		}
	},
	{
		name: 'set_event_results',
		description:
			'Set the final placements (results) for an event (by id or slug). Replace-all semantics: results model a complete ranking, so the supplied list replaces any existing results for the event. Use rank (1-based) and optional rankTo for shared placements (e.g. rank 5, rankTo 8 = "5–8th"). Team ids must already exist. Attributed to the token owner.',
		requiresWrite: true,
		inputSchema: {
			type: 'object',
			properties: {
				idOrSlug: { type: 'string', description: 'The event id or slug.' },
				results: {
					type: 'array',
					minItems: 1,
					description: 'Final placements; one entry per team.',
					items: {
						type: 'object',
						properties: {
							teamId: { type: 'string', description: 'Existing team id (see list_teams).' },
							rank: { type: 'integer', minimum: 1, description: 'Placement (1 = winner).' },
							rankTo: {
								type: 'integer',
								minimum: 1,
								description: 'Upper bound for a shared placement, e.g. rank 5 rankTo 8.'
							},
							prizeAmount: {
								type: 'integer',
								minimum: 0,
								description: 'Prize amount in the smallest currency unit or whole units.'
							},
							prizeCurrency: { type: 'string', description: 'Currency code, e.g. "USD".' }
						},
						required: ['teamId', 'rank'],
						additionalProperties: false
					}
				}
			},
			required: ['idOrSlug', 'results'],
			additionalProperties: false
		},
		handler: async (args, identity) => {
			const eventId = await resolveEventId(requireString(args, 'idOrSlug'));
			const results = normalizeEventResults(args.results);
			await assertTeamsExist(results.map((r) => r.teamId));
			const { count } = await setEventResults(eventId, results, identity.userId);
			return { eventId, count };
		}
	},
	{
		name: 'add_event_team_players',
		description:
			'Attach roster players to teams at an event (by event id or slug). Records which players represented each team for this event. Additive and idempotent: upserts by (team, player) and leaves players not listed in place. Team and player ids must already exist. role is one of main/sub/coach. Attributed to the token owner.',
		requiresWrite: true,
		inputSchema: {
			type: 'object',
			properties: {
				idOrSlug: { type: 'string', description: 'The event id or slug.' },
				players: {
					type: 'array',
					minItems: 1,
					description: 'Roster entries to attach.',
					items: {
						type: 'object',
						properties: {
							teamId: { type: 'string', description: 'Existing team id (must be a participant).' },
							playerId: { type: 'string', description: 'Existing player id (see list_players).' },
							role: {
								type: 'string',
								enum: [...EVENT_TEAM_PLAYER_ROLES],
								description: 'Roster role for this event.'
							}
						},
						required: ['teamId', 'playerId', 'role'],
						additionalProperties: false
					}
				}
			},
			required: ['idOrSlug', 'players'],
			additionalProperties: false
		},
		handler: async (args, identity) => {
			const eventId = await resolveEventId(requireString(args, 'idOrSlug'));
			const players = normalizeEventRoster(args.players);
			await assertTeamsExist(players.map((p) => p.teamId));
			await assertPlayersExist(players.map((p) => p.playerId));
			const { count } = await addEventTeamPlayers(eventId, players, identity.userId);
			return { eventId, count };
		}
	},
	{
		name: 'set_event_casters',
		description:
			'Set the casters/talent for an event (by id or slug). Replace-all semantics: the supplied list replaces all existing casters (pass an empty array to clear). Player ids must already exist. role is one of host/analyst/commentator. Attributed to the token owner.',
		requiresWrite: true,
		inputSchema: {
			type: 'object',
			properties: {
				idOrSlug: { type: 'string', description: 'The event id or slug.' },
				casters: {
					type: 'array',
					description: 'Casters; an empty array clears all casters.',
					items: {
						type: 'object',
						properties: {
							playerId: { type: 'string', description: 'Existing player id (see list_players).' },
							role: {
								type: 'string',
								enum: [...EVENT_CASTER_ROLES],
								description: 'Casting role.'
							}
						},
						required: ['playerId', 'role'],
						additionalProperties: false
					}
				}
			},
			required: ['idOrSlug', 'casters'],
			additionalProperties: false
		},
		handler: async (args, identity) => {
			const eventId = await resolveEventId(requireString(args, 'idOrSlug'));
			const casters = normalizeEventCasters(args.casters);
			await assertPlayersExist(casters.map((c) => c.playerId));
			await updateEventCasters(eventId, casters, identity.userId);
			return { eventId, count: casters.length };
		}
	},
	{
		name: 'list_players',
		description:
			'List LemonTV players (id, slug, name, nationalities, aliases, avatar). Optional case-insensitive name/slug filter and limit. No account PII.',
		requiresWrite: false,
		inputSchema: {
			type: 'object',
			properties: {
				search: {
					type: 'string',
					description: 'Case-insensitive substring matched on name and slug.'
				},
				limit: {
					type: 'integer',
					minimum: 1,
					maximum: 500,
					description: 'Max players (default 100).'
				}
			},
			additionalProperties: false
		},
		handler: async (args) => {
			const search = typeof args.search === 'string' ? args.search.toLowerCase() : null;
			const limit = Math.min(Math.max(Number(args.limit) || 100, 1), 500);
			let players = await getPlayers();
			if (search) {
				players = players.filter(
					(p) => p.name.toLowerCase().includes(search) || p.slug.toLowerCase().includes(search)
				);
			}
			const items = players.slice(0, limit).map((p) => ({
				id: p.id,
				slug: p.slug,
				name: p.name,
				nationalities: p.nationalities,
				aliases: p.aliases,
				avatar: p.avatar ?? null
			}));
			return { count: items.length, players: items };
		}
	},
	{
		name: 'get_player',
		description:
			'Get a LemonTV player by id, slug, or name. Account PII (email/username/user linkage) is omitted.',
		requiresWrite: false,
		inputSchema: {
			type: 'object',
			properties: { idOrSlug: { type: 'string', description: 'Player id, slug, or name.' } },
			required: ['idOrSlug'],
			additionalProperties: false
		},
		handler: async (args) => {
			const player = await getPlayer(requireString(args, 'idOrSlug'));
			return player ? stripUser(player as unknown as Record<string, unknown>) : null;
		}
	},
	{
		name: 'create_player',
		description:
			'Create a new LemonTV player. Returns the new player id. Pass the COMPLETE set of nationalities/aliases/gameAccounts/socialAccounts (they are stored as given, not merged). Attributed to the token owner.',
		requiresWrite: true,
		inputSchema: {
			type: 'object',
			properties: {
				name: { type: 'string', description: 'Display name.' },
				slug: { type: 'string', description: 'URL slug; defaults to a slug of the name.' },
				nationalities: {
					type: 'array',
					items: { type: 'string' },
					description: 'ISO country codes; the first is the primary nationality.'
				},
				aliases: { type: 'array', items: { type: 'string' } },
				avatar: { type: 'string', description: 'Avatar image URL/key.' },
				gameAccounts: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							accountId: { type: 'integer' },
							currentName: { type: 'string' },
							region: { type: 'string', enum: [...GAME_ACCOUNT_REGIONS] }
						},
						required: ['accountId', 'currentName'],
						additionalProperties: false
					},
					description: 'In-game accounts; server is derived from region.'
				},
				socialAccounts: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							platformId: { type: 'string' },
							accountId: { type: 'string' },
							overridingUrl: { type: 'string' }
						},
						required: ['platformId', 'accountId'],
						additionalProperties: false
					}
				}
			},
			required: ['name'],
			additionalProperties: false
		},
		handler: async (args, identity) => {
			const name = requireString(args, 'name');
			const slug =
				typeof args.slug === 'string' && args.slug.trim() ? args.slug.trim() : formatSlug(name);
			const gameAccounts = (
				Array.isArray(args.gameAccounts) ? (args.gameAccounts as Record<string, unknown>[]) : []
			).map((a) => {
				const region = optionalEnum(a.region, GAME_ACCOUNT_REGIONS, 'gameAccounts.region');
				return {
					server: getGameAccountServer(region),
					accountId: requireInt(a, 'accountId'),
					currentName: requireString(a, 'currentName'),
					region
				};
			});
			const socialAccounts = Array.isArray(args.socialAccounts)
				? (args.socialAccounts as Record<string, unknown>[]).map((a) => ({
						platformId: requireString(a, 'platformId'),
						accountId: requireString(a, 'accountId'),
						overridingUrl: typeof a.overridingUrl === 'string' ? a.overridingUrl : undefined
					}))
				: undefined;
			const id = await createPlayer(
				{
					name,
					slug,
					nationalities: (Array.isArray(args.nationalities)
						? (args.nationalities as string[])
						: []) as TCountryCode[],
					aliases: Array.isArray(args.aliases) ? (args.aliases as string[]) : [],
					avatar: typeof args.avatar === 'string' ? args.avatar : undefined,
					gameAccounts,
					socialAccounts
				},
				identity.userId
			);
			return { id, slug, created: true };
		}
	},
	{
		name: 'list_teams',
		description:
			'List LemonTV teams (id, slug, name, abbr, region, logo, wins, aliases). Optional region filter and limit. No account PII.',
		requiresWrite: false,
		inputSchema: {
			type: 'object',
			properties: {
				region: { type: 'string', enum: [...TEAM_REGIONS] },
				limit: {
					type: 'integer',
					minimum: 1,
					maximum: 500,
					description: 'Max teams (default 100).'
				}
			},
			additionalProperties: false
		},
		handler: async (args) => {
			const region = optionalEnum(args.region, TEAM_REGIONS, 'region');
			const limit = Math.min(Math.max(Number(args.limit) || 100, 1), 500);
			let teams = await getTeams();
			if (region) teams = teams.filter((t) => t.region === region);
			const items = teams.slice(0, limit).map((t) => ({
				id: t.id,
				slug: t.slug,
				name: t.name,
				abbr: t.abbr,
				region: t.region,
				logo: t.logoURL ?? t.logo ?? null,
				wins: t.wins ?? null,
				aliases: t.aliases ?? []
			}));
			return { count: items.length, teams: items };
		}
	},
	{
		name: 'get_team',
		description:
			'Get a LemonTV team by id or slug, including roster, aliases, region and logo. Account PII on roster players is omitted.',
		requiresWrite: false,
		inputSchema: {
			type: 'object',
			properties: { idOrSlug: { type: 'string', description: 'Team id or slug.' } },
			required: ['idOrSlug'],
			additionalProperties: false
		},
		handler: async (args) => {
			const team = await getTeam(requireString(args, 'idOrSlug'));
			return team ? stripRosterUserPII(team as unknown as { players?: unknown }) : null;
		}
	},
	{
		name: 'create_team',
		description:
			'Create a new LemonTV team. Requires name. Returns the new team id. Roster players (need existing player ids), aliases, and slogans are optional. Attributed to the token owner.',
		requiresWrite: true,
		inputSchema: {
			type: 'object',
			properties: {
				name: { type: 'string' },
				slug: { type: 'string', description: 'Defaults to a slug of the name.' },
				abbr: { type: 'string', description: 'Short tag, e.g. "MMR".' },
				region: { type: 'string', enum: [...TEAM_REGIONS] },
				logo: { type: 'string', description: 'Logo image URL/key.' },
				aliases: { type: 'array', items: { type: 'string' } },
				players: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							playerId: { type: 'string', description: 'Existing player id (see list_players).' },
							role: { type: 'string', enum: [...TEAM_PLAYER_ROLES] },
							startedOn: { type: 'string', description: 'YYYY-MM-DD' },
							endedOn: { type: 'string', description: 'YYYY-MM-DD' },
							note: { type: 'string' }
						},
						required: ['playerId', 'role'],
						additionalProperties: false
					}
				},
				slogans: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							slogan: { type: 'string' },
							language: { type: 'string', description: 'Locale code, e.g. "en".' },
							eventId: { type: 'string', description: 'Existing event id (optional).' }
						},
						required: ['slogan'],
						additionalProperties: false
					}
				}
			},
			required: ['name'],
			additionalProperties: false
		},
		handler: async (args, identity) => {
			const name = requireString(args, 'name');
			const region = optionalEnum(args.region, TEAM_REGIONS, 'region');
			const players = Array.isArray(args.players)
				? (args.players as Record<string, unknown>[]).map((p) => ({
						playerId: requireString(p, 'playerId'),
						role: requireEnum(p.role, TEAM_PLAYER_ROLES, 'players.role'),
						startedOn: typeof p.startedOn === 'string' ? p.startedOn : undefined,
						endedOn: typeof p.endedOn === 'string' ? p.endedOn : undefined,
						note: typeof p.note === 'string' ? p.note : undefined
					}))
				: undefined;
			const slogans = Array.isArray(args.slogans)
				? (args.slogans as Record<string, unknown>[]).map((s) => ({
						slogan: requireString(s, 'slogan'),
						language: typeof s.language === 'string' ? s.language : null,
						eventId: typeof s.eventId === 'string' ? s.eventId : null
					}))
				: undefined;
			const slug =
				typeof args.slug === 'string' && args.slug.trim() ? args.slug.trim() : formatSlug(name);
			const id = await createTeam(
				{
					name,
					slug,
					abbr: typeof args.abbr === 'string' ? args.abbr : undefined,
					logo: typeof args.logo === 'string' ? args.logo : undefined,
					region,
					aliases: Array.isArray(args.aliases) ? (args.aliases as string[]) : undefined,
					players,
					slogans
				},
				identity.userId
			);
			return { id, slug, created: true };
		}
	},
	{
		name: 'update_team',
		description:
			'Update scalar fields of an existing team (by id or slug): name, slug, abbr, logo, region. Partial — only the fields you pass change, and it never touches the roster, aliases, or slogans (use the admin UI for those). Returns which fields changed. Attributed to the token owner.',
		requiresWrite: true,
		inputSchema: {
			type: 'object',
			properties: {
				idOrSlug: { type: 'string', description: 'The team id or slug to update.' },
				name: { type: 'string', description: 'New display name.' },
				slug: { type: 'string', description: 'New URL slug (lowercase-kebab, unique).' },
				abbr: { type: 'string', description: 'Short tag, e.g. "DRG".' },
				logo: { type: 'string', description: 'Logo image URL/key.' },
				region: { type: 'string', enum: [...TEAM_REGIONS], description: 'Team region.' }
			},
			required: ['idOrSlug'],
			additionalProperties: false
		},
		handler: async (args, identity) => {
			const teamId = await resolveTeamId(requireString(args, 'idOrSlug'));
			const fields: UpdateTeamFields = {};
			if (args.name !== undefined) fields.name = requireString(args, 'name');
			if (args.slug !== undefined) fields.slug = formatSlug(requireString(args, 'slug'));
			if (args.abbr !== undefined) fields.abbr = requireString(args, 'abbr');
			if (args.logo !== undefined) fields.logo = requireString(args, 'logo');
			if (args.region !== undefined)
				fields.region = requireEnum(args.region, TEAM_REGIONS, 'region');
			const { changed } = await updateTeamFields(teamId, fields, identity.userId);
			return { id: teamId, changed, updated: changed.length > 0 };
		}
	},
	{
		name: 'update_player',
		description:
			'Update an existing player (by id or slug): name, slug, avatar, and/or nationalities. Partial — only the fields you pass change; it never touches aliases, game accounts, or social accounts (use the admin UI for those). Passing nationalities fully replaces them (first = primary). Returns which fields changed. Attributed to the token owner.',
		requiresWrite: true,
		inputSchema: {
			type: 'object',
			properties: {
				idOrSlug: { type: 'string', description: 'The player id or slug to update.' },
				name: { type: 'string', description: 'New display name.' },
				slug: { type: 'string', description: 'New URL slug.' },
				avatar: { type: 'string', description: 'Avatar image URL/key.' },
				nationalities: {
					type: 'array',
					items: { type: 'string' },
					description: 'ISO country codes; first is primary. Replaces all nationalities.'
				}
			},
			required: ['idOrSlug'],
			additionalProperties: false
		},
		handler: async (args, identity) => {
			const playerId = await resolvePlayerId(requireString(args, 'idOrSlug'));
			const fields: UpdatePlayerFields = {};
			if (args.name !== undefined) fields.name = requireString(args, 'name');
			if (args.slug !== undefined) fields.slug = formatSlug(requireString(args, 'slug'));
			if (args.avatar !== undefined) fields.avatar = requireString(args, 'avatar');
			if (args.nationalities !== undefined) {
				if (!Array.isArray(args.nationalities)) throw new Error('nationalities must be an array');
				const list = args.nationalities
					.map((n) => (typeof n === 'string' ? n.trim().toUpperCase() : ''))
					.filter((n) => n !== '');
				if (new Set(list).size !== list.length)
					throw new Error('nationalities contains duplicates');
				fields.nationalities = list;
			}
			const { changed } = await updatePlayerFields(playerId, fields, identity.userId);
			return { id: playerId, changed, updated: changed.length > 0 };
		}
	}
];
