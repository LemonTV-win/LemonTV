/**
 * Authorized MCP server — pure JSON-RPC 2.0 / MCP dispatch.
 *
 * Transport- and database-agnostic: the tool registry is injected, so this
 * module imports nothing app-specific and is unit-testable in isolation.
 * Concrete (DB-backed) tools live in `./tools`; the HTTP transport + auth in
 * `src/routes/api/mcp/+server.ts`.
 */
export const MCP_PROTOCOL_VERSION = '2024-11-05';
export const MCP_SERVER_INFO = { name: 'lemontv-mcp', version: '0.1.0' } as const;

/** The authenticated caller, resolved from a Personal Access Token. */
export interface McpIdentity {
	tokenId: string;
	userId: string;
	username: string;
	canWrite: boolean;
}

/** Audit/rate-limit side-effects, injected by the route (DB-backed in prod). */
export interface McpHooks {
	/** Consume one rate-limit token for this caller. */
	rateLimit?: (identity: McpIdentity) => Promise<{ allowed: boolean; retryAfterSeconds: number }>;
	/** Record the outcome of a tool call. */
	audit?: (entry: {
		tool: string;
		status: 'success' | 'denied' | 'error' | 'rate_limited';
		detail?: string;
	}) => Promise<void>;
}

export interface JsonRpcRequest {
	jsonrpc: '2.0';
	id?: string | number | null;
	method: string;
	params?: Record<string, unknown>;
}

export interface McpTool {
	name: string;
	description: string;
	/** When true, the caller must have resolved write capability. */
	requiresWrite: boolean;
	inputSchema: Record<string, unknown>;
	handler: (args: Record<string, unknown>, identity: McpIdentity) => Promise<unknown>;
}

function rpcResult(id: JsonRpcRequest['id'], result: unknown) {
	return { jsonrpc: '2.0' as const, id: id ?? null, result };
}

function rpcError(id: JsonRpcRequest['id'], code: number, message: string) {
	return { jsonrpc: '2.0' as const, id: id ?? null, error: { code, message } };
}

/**
 * Handle one JSON-RPC message against the given tool registry. Returns the
 * response object, or `null` for notifications (which take no reply).
 */
export async function dispatch(
	message: JsonRpcRequest,
	identity: McpIdentity,
	tools: McpTool[],
	hooks?: McpHooks
): Promise<object | null> {
	if (!message || message.jsonrpc !== '2.0' || typeof message.method !== 'string') {
		return rpcError(message?.id ?? null, -32600, 'Invalid Request');
	}

	const { method, id, params } = message;
	const isNotification = id === undefined;

	switch (method) {
		case 'initialize':
			return rpcResult(id, {
				protocolVersion: MCP_PROTOCOL_VERSION,
				capabilities: { tools: {} },
				serverInfo: MCP_SERVER_INFO
			});

		case 'notifications/initialized':
		case 'notifications/cancelled':
			return null;

		case 'ping':
			return rpcResult(id, {});

		case 'tools/list':
			return rpcResult(id, {
				tools: tools.map(({ name, description, inputSchema }) => ({
					name,
					description,
					inputSchema
				}))
			});

		case 'tools/call': {
			const toolName = (params?.name as string) ?? '';
			const args = (params?.arguments as Record<string, unknown>) ?? {};
			const tool = tools.find((t) => t.name === toolName);
			if (!tool) {
				return rpcError(id, -32602, `Unknown tool: ${toolName}`);
			}

			// Rate limit every tool call (so even denied attempts cost a token).
			if (hooks?.rateLimit) {
				const rl = await hooks.rateLimit(identity);
				if (!rl.allowed) {
					await hooks.audit?.({
						tool: toolName,
						status: 'rate_limited',
						detail: `retry after ${rl.retryAfterSeconds}s`
					});
					return rpcResult(id, {
						content: [
							{
								type: 'text',
								text: `Error: rate limit exceeded. Retry after ${rl.retryAfterSeconds}s.`
							}
						],
						isError: true
					});
				}
			}

			// Deny-by-default: write tools require resolved write capability.
			if (tool.requiresWrite && !identity.canWrite) {
				await hooks?.audit?.({
					tool: toolName,
					status: 'denied',
					detail: 'write permission required'
				});
				return rpcResult(id, {
					content: [
						{
							type: 'text',
							text: `Error: the tool "${toolName}" requires a write-scoped token held by an editor or admin.`
						}
					],
					isError: true
				});
			}

			try {
				const result = await tool.handler(args, identity);
				await hooks?.audit?.({ tool: toolName, status: 'success' });
				return rpcResult(id, {
					content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
				});
			} catch (error) {
				const text = error instanceof Error ? error.message : 'Tool execution failed';
				console.error(`[MCP] Tool "${toolName}" failed:`, error);
				await hooks?.audit?.({ tool: toolName, status: 'error', detail: text });
				return rpcResult(id, {
					content: [{ type: 'text', text: `Error: ${text}` }],
					isError: true
				});
			}
		}

		default:
			return isNotification ? null : rpcError(id, -32601, `Method not found: ${method}`);
	}
}
