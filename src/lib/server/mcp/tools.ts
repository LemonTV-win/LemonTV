/**
 * Authorized MCP server — concrete tool registry.
 *
 * Each tool wraps the shared data layer (`$lib/server/data/*`) so MCP edits get
 * the same validation + `edit_history` attribution as the admin UI. Write tools
 * are flagged `requiresWrite` and enforced by `dispatch`.
 */
import { desc, eq, or } from 'drizzle-orm';
import type { TCountryCode } from 'countries-list';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { createEvent, EVENT_FORMATS, EVENT_SERVERS, EVENT_STATUSES } from '$lib/server/data/events';
import { createPlayer, getPlayer, getPlayers } from '$lib/server/data/players';
import { createTeam, getTeam, getTeams } from '$lib/server/data/teams';
import { getGameAccountServer } from '$lib/data/players';
import { formatSlug } from '$lib/utils/strings';
import type { McpTool } from './dispatch';
import { requireString, optionalEnum } from './args';
import { stripUser, stripRosterUserPII } from './project';

const GAME_ACCOUNT_REGIONS = ['APAC', 'NA', 'EU', 'CN'] as const;
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
			const [row] = await db
				.select()
				.from(table.event)
				.where(or(eq(table.event.id, idOrSlug), eq(table.event.slug, idOrSlug)))
				.limit(1);
			return row ?? null;
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
					description: 'URL slug, lowercase-kebab, unique, e.g. "origami-cup-4".'
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
					description: 'Banner/logo URL (a placeholder URL is acceptable).'
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
			required: ['name', 'slug', 'server', 'format', 'region', 'status', 'date', 'image'],
			additionalProperties: false
		},
		handler: async (args, identity) => {
			// Enforce required fields up front (dispatch does not validate
			// inputSchema.required); the data layer then validates enum values.
			const slug = requireString(args, 'slug');
			const { id } = await createEvent(
				{
					name: requireString(args, 'name'),
					slug,
					server: requireString(args, 'server'),
					format: requireString(args, 'format'),
					region: requireString(args, 'region') as never,
					status: requireString(args, 'status'),
					date: requireString(args, 'date'),
					image: requireString(args, 'image'),
					official: Boolean(args.official ?? false),
					capacity: typeof args.capacity === 'number' ? args.capacity : 0,
					organizerIds: Array.isArray(args.organizerIds) ? (args.organizerIds as string[]) : [],
					websites: Array.isArray(args.websites)
						? (args.websites as { url: string; label?: string }[])
						: []
				},
				identity.userId,
				{ source: 'mcp:create_event' }
			);
			return { id, slug, created: true };
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
					accountId: Number(a.accountId),
					currentName: String(a.currentName ?? ''),
					region
				};
			});
			const socialAccounts = Array.isArray(args.socialAccounts)
				? (args.socialAccounts as Record<string, unknown>[]).map((a) => ({
						platformId: String(a.platformId),
						accountId: String(a.accountId),
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
						role: optionalEnum(p.role, TEAM_PLAYER_ROLES, 'players.role') ?? 'active',
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
	}
];
