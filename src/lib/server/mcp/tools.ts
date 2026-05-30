/**
 * Authorized MCP server — concrete tool registry.
 *
 * Each tool wraps the shared data layer (`$lib/server/data/*`) so MCP edits get
 * the same validation + `edit_history` attribution as the admin UI. Write tools
 * are flagged `requiresWrite` and enforced by `dispatch`.
 */
import { desc, eq, or } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { createEvent, EVENT_FORMATS, EVENT_SERVERS, EVENT_STATUSES } from '$lib/server/data/events';
import type { McpTool } from './dispatch';
import { requireString } from './args';

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
	}
];
