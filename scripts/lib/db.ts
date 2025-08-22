import { drizzle } from 'drizzle-orm/libsql';
import { createClient, type Client } from '@libsql/client';
import * as schema from '../../src/lib/server/db/schema';

let client: Client;

console.info('[Scripts][Lib][DB] Connecting to database...');

console.info('[Scripts][Lib][DB] DEV:', import.meta.env.DEV);

if (import.meta.env.DEV === 'true') {
	console.info('[Scripts][Lib][DB] Development environment detected');
	client = createClient({
		url: 'file:./dev.db'
	});
} else {
	console.info('[Scripts][Lib][DB] Production environment detected');
	if (!import.meta.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
	if (!import.meta.env.DEV && !import.meta.env.DATABASE_AUTH_TOKEN)
		throw new Error('DATABASE_AUTH_TOKEN is not set');

	client = createClient({
		url: import.meta.env.DATABASE_URL,
		authToken: import.meta.env.DATABASE_AUTH_TOKEN
	});
}
console.info('[Scripts][Lib][DB] LibSQL Client created');

export const db = drizzle(client, { schema });
console.info('[Scripts][Lib][DB] Database connected');
