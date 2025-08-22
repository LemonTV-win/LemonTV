import { drizzle } from 'drizzle-orm/libsql';
import { createClient, type Client } from '@libsql/client';
import * as schema from '../../src/lib/server/db/schema';

console.info('[Scripts] Syncing database...');
let client: Client;

if (import.meta.env.DEV) {
	console.info('[Scripts] Development environment detected');
	client = createClient({
		url: 'file:./dev.db'
	});
} else {
	console.info('[Scripts] Production environment detected');
	if (!import.meta.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
	if (!import.meta.env.DEV && !import.meta.env.DATABASE_AUTH_TOKEN)
		throw new Error('DATABASE_AUTH_TOKEN is not set');

	client = createClient({
		url: import.meta.env.DATABASE_URL,
		authToken: import.meta.env.DATABASE_AUTH_TOKEN
	});
}
console.info('[Scripts] LibSQL Client created');

export const db = drizzle(client, { schema });
console.info('[Scripts] Database connected');
