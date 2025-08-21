import { syncAll } from '../src/lib/server/db/sync';

import { drizzle } from 'drizzle-orm/libsql';
import { createClient, type Client } from '@libsql/client';
import * as schema from '../src/lib/server/db/schema';

console.info('[SyncDB] Syncing database...');
let client: Client;

if (import.meta.env.DEV) {
	console.info('[SyncDB] Development environment detected');
	client = createClient({
		url: 'file:./dev.db'
	});
} else {
	console.info('[SyncDB] Production environment detected');
	if (!import.meta.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
	if (!import.meta.env.DEV && !import.meta.env.DATABASE_AUTH_TOKEN)
		throw new Error('DATABASE_AUTH_TOKEN is not set');

	client = createClient({
		url: import.meta.env.DATABASE_URL,
		authToken: import.meta.env.DATABASE_AUTH_TOKEN
	});
}
console.info('[SyncDB] LibSQL Client created');

const db = drizzle(client, { schema });
console.info('[SyncDB] Database connected');

await syncAll(db);
console.info('[SyncDB] Database synced');
