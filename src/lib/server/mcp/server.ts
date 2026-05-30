/**
 * Authorized MCP server — composition point.
 *
 * Binds the pure protocol `dispatch` (./dispatch) to the concrete DB-backed
 * tool registry (./tools). The HTTP transport + authentication lives in the
 * SvelteKit route `src/routes/api/mcp/+server.ts`.
 */
import { dispatch, type JsonRpcRequest, type McpIdentity, type McpHooks } from './dispatch';
import { TOOLS } from './tools';

export { MCP_PROTOCOL_VERSION, MCP_SERVER_INFO } from './dispatch';
export type { McpIdentity, McpHooks } from './dispatch';

/** Handle one JSON-RPC message against the live tool registry. */
export function handleMcpMessage(
	message: JsonRpcRequest,
	identity: McpIdentity,
	hooks?: McpHooks
): Promise<object | null> {
	return dispatch(message, identity, TOOLS, hooks);
}
