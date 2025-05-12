import { dev } from '$app/environment';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';
import { env } from '$env/dynamic/private';

let client;

if (dev) {
	client = createClient({
		url: 'file:./dev.db'
	});
} else {
	if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
	if (!dev && !env.DATABASE_AUTH_TOKEN) throw new Error('DATABASE_AUTH_TOKEN is not set');

	client = createClient({
		url: env.DATABASE_URL,
		authToken: env.DATABASE_AUTH_TOKEN
	});
}

export const db = drizzle(client, { schema });
