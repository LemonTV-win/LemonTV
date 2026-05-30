import { describe, it, expect } from 'bun:test';
import {
	dispatch,
	MCP_PROTOCOL_VERSION,
	type JsonRpcRequest,
	type McpTool,
	type McpIdentity
} from './dispatch';

const readTool: McpTool = {
	name: 'echo',
	description: 'echo args',
	requiresWrite: false,
	inputSchema: { type: 'object' },
	handler: async (args) => ({ echoed: args })
};

const writeTool: McpTool = {
	name: 'mutate',
	description: 'mutate something',
	requiresWrite: true,
	inputSchema: { type: 'object' },
	handler: async () => ({ done: true })
};

const throwingTool: McpTool = {
	name: 'boom',
	description: 'always throws',
	requiresWrite: false,
	inputSchema: { type: 'object' },
	handler: async () => {
		throw new Error('kaboom');
	}
};

const TOOLS = [readTool, writeTool, throwingTool];
const reader: McpIdentity = { userId: 'u-read', username: 'reader', canWrite: false };
const writer: McpIdentity = { userId: 'u-write', username: 'writer', canWrite: true };

interface RpcResponse {
	jsonrpc: string;
	id: number | string | null;
	result?: {
		protocolVersion?: string;
		capabilities?: { tools?: unknown };
		serverInfo?: { name?: string };
		tools?: { name: string; description?: string; inputSchema?: unknown }[];
		content?: { type: string; text: string }[];
		isError?: boolean;
	};
	error?: { code: number; message: string };
}

async function rpc(
	message: JsonRpcRequest,
	identity: McpIdentity = reader
): Promise<RpcResponse> {
	return (await dispatch(message, identity, TOOLS)) as unknown as RpcResponse;
}

const call = (id: number | string | null | undefined, method: string, params?: Record<string, unknown>) =>
	rpc({ jsonrpc: '2.0', id, method, params });

describe('dispatch — protocol', () => {
	it('initialize advertises the protocol version, tool capability and server info', async () => {
		const res = await call(1, 'initialize');
		expect(res.jsonrpc).toBe('2.0');
		expect(res.id).toBe(1);
		expect(res.result?.protocolVersion).toBe(MCP_PROTOCOL_VERSION);
		expect(res.result?.capabilities?.tools).toBeDefined();
		expect(res.result?.serverInfo?.name).toBe('lemontv-mcp');
	});

	it('tools/list returns each tool with name, description, inputSchema', async () => {
		const res = await call(2, 'tools/list');
		expect(res.result?.tools?.map((t) => t.name)).toEqual(['echo', 'mutate', 'boom']);
		expect(res.result?.tools?.[0]).toHaveProperty('inputSchema');
	});

	it('ping returns an empty result', async () => {
		const res = await call(3, 'ping');
		expect(res.result).toEqual({});
	});

	it('returns method-not-found for unknown methods', async () => {
		const res = await call(4, 'does/not/exist');
		expect(res.error?.code).toBe(-32601);
	});

	it('rejects malformed (non-2.0) messages', async () => {
		const res = await rpc({ jsonrpc: '1.0' as never, id: 9, method: 'ping' });
		expect(res.error?.code).toBe(-32600);
	});

	it('treats id-less messages as notifications (no reply)', async () => {
		expect(
			await dispatch({ jsonrpc: '2.0', method: 'notifications/initialized' }, reader, TOOLS)
		).toBeNull();
		// Unknown notification (no id) also yields no reply.
		expect(await dispatch({ jsonrpc: '2.0', method: 'whatever' }, reader, TOOLS)).toBeNull();
	});
});

describe('dispatch — tools/call', () => {
	it('runs a read tool and wraps the result as MCP text content', async () => {
		const res = await rpc({
			jsonrpc: '2.0',
			id: 5,
			method: 'tools/call',
			params: { name: 'echo', arguments: { a: 1 } }
		});
		expect(res.result?.isError).toBeUndefined();
		expect(JSON.parse(res.result!.content![0].text)).toEqual({ echoed: { a: 1 } });
	});

	it('errors on an unknown tool', async () => {
		const res = await rpc({
			jsonrpc: '2.0',
			id: 6,
			method: 'tools/call',
			params: { name: 'nope' }
		});
		expect(res.error?.code).toBe(-32602);
	});

	it('DENIES a write tool to a read-only identity (the security guard)', async () => {
		const res = await rpc({
			jsonrpc: '2.0',
			id: 7,
			method: 'tools/call',
			params: { name: 'mutate' }
		});
		expect(res.result?.isError).toBe(true);
		expect(res.result!.content![0].text).toContain('requires a write-scoped token');
	});

	it('ALLOWS a write tool for a write-capable identity', async () => {
		const res = await rpc(
			{ jsonrpc: '2.0', id: 8, method: 'tools/call', params: { name: 'mutate' } },
			writer
		);
		expect(res.result?.isError).toBeUndefined();
		expect(JSON.parse(res.result!.content![0].text)).toEqual({ done: true });
	});

	it('surfaces a throwing handler as an isError result, not a crash', async () => {
		const res = await rpc({
			jsonrpc: '2.0',
			id: 10,
			method: 'tools/call',
			params: { name: 'boom' }
		});
		expect(res.result?.isError).toBe(true);
		expect(res.result!.content![0].text).toContain('kaboom');
	});
});
