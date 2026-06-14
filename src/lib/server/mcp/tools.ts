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
	EVENT_FORMATS,
	EVENT_SERVERS,
	EVENT_STATUSES,
	type UpdateEventFields
} from '$lib/server/data/events';
import {
	normalizeEventTeams,
	normalizeEventResults,
	EVENT_TEAM_ENTRIES,
	EVENT_TEAM_STATUSES
} from './event-args';
import { createPlayer, getPlayer, getPlayers } from '$lib/server/data/players';
import { createTeam, getTeam, getTeams } from '$lib/server/data/teams';
import { getGameAccountServer } from '$lib/data/players';
import { formatSlug } from '$lib/utils/strings';
import type { McpTool } from './dispatch';
import { requireString, requireInt, optionalEnum, requireEnum } from './args';
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
			if (!row) return null;

			// Include participants and final placements so additions made via
			// add_event_teams / set_event_results are verifiable through the API.
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

			return { ...row, teams, results };
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
			required: ['name', 'slug', 'server', 'format', 'region', 'status', 'date'],
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
					image: typeof args.image === 'string' ? args.image : undefined,
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
			if (args.official !== undefined) fields.official = Boolean(args.official);
			if (args.capacity !== undefined) fields.capacity = requireInt(args, 'capacity');

			const { id, changed } = await updateEvent(idOrSlug, fields, identity.userId, {
				source: 'mcp:update_event'
			});
			return { id, changed, updated: changed.length > 0 };
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
	}
];
