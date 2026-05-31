import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { mcpAuditLog } from '$lib/server/db/schemas/auth/mcp-audit-log';
import { mcpToken } from '$lib/server/db/schemas/auth/mcp-token';
import { user } from '$lib/server/db/schemas/auth/user';
import { count, desc, eq } from 'drizzle-orm';

const PAGE_SIZE = 50;
const STATUSES = ['success', 'denied', 'error', 'rate_limited'] as const;
type Status = (typeof STATUSES)[number];

export const load: PageServerLoad = async ({ locals, url }) => {
	// Moderation view — shows every editor's token activity and IPs, so admin only.
	if (!locals.user || !locals.user.roles.includes('admin')) {
		throw redirect(302, '/admin');
	}

	const statusParam = url.searchParams.get('status');
	const status: Status | undefined = STATUSES.includes(statusParam as Status)
		? (statusParam as Status)
		: undefined;
	const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
	const where = status ? eq(mcpAuditLog.status, status) : undefined;

	const [{ total }] = await db.select({ total: count() }).from(mcpAuditLog).where(where);

	const entries = await db
		.select({
			id: mcpAuditLog.id,
			tool: mcpAuditLog.tool,
			status: mcpAuditLog.status,
			detail: mcpAuditLog.detail,
			ip: mcpAuditLog.ip,
			createdAt: mcpAuditLog.createdAt,
			username: user.username,
			tokenName: mcpToken.name,
			tokenPrefix: mcpToken.prefix
		})
		.from(mcpAuditLog)
		.leftJoin(user, eq(mcpAuditLog.userId, user.id))
		.leftJoin(mcpToken, eq(mcpAuditLog.tokenId, mcpToken.id))
		.where(where)
		.orderBy(desc(mcpAuditLog.createdAt))
		.limit(PAGE_SIZE)
		.offset((page - 1) * PAGE_SIZE);

	return {
		entries,
		page,
		pageSize: PAGE_SIZE,
		total,
		totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
		status: status ?? null,
		statuses: STATUSES
	};
};
