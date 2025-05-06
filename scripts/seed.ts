// seed.ts
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from '../src/lib/server/db/schema';
import { eq } from 'drizzle-orm';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
if (!process.env.DATABASE_AUTH_TOKEN) throw new Error('DATABASE_AUTH_TOKEN is not set');

const logger = {
	info: (message: string) => {
		console.log(`[${new Date().toISOString()}] INFO: ${message}`);
	},
	error: (message: string, error?: unknown) => {
		console.error(`[${new Date().toISOString()}] ERROR: ${message}`, error || '');
	},
	debug: (message: string) => {
		console.debug(`[${new Date().toISOString()}] DEBUG: ${message}`);
	}
};

logger.info('Starting database seeding process...');

const client = createClient({
	url: process.env.DATABASE_URL,
	authToken: process.env.DATABASE_AUTH_TOKEN
});

const db = drizzle(client, { schema });

async function seedInitialRoles() {
	logger.info('Seeding initial roles...');
	const roles = [
		{ id: 'admin', label: 'Administrator' },
		{ id: 'editor', label: 'Editor' }
	];

	for (const role of roles) {
		logger.debug(`Checking for existing role: ${role.id}`);
		const existing = await db.select().from(schema.role).where(eq(schema.role.id, role.id));

		if (existing.length === 0) {
			logger.info(`Inserting new role: ${role.id}`);
			await db.insert(schema.role).values({ id: role.id, name: role.label });
		} else {
			logger.debug(`Role ${role.id} already exists, skipping...`);
		}
	}
	logger.info('Role seeding completed');
}

try {
	await seedInitialRoles();
	logger.info('Database seeding completed successfully!');
} catch (error) {
	logger.error('Error during database seeding:', error);
	process.exit(1);
}
