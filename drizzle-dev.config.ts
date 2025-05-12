import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

const DATABASE_URL = 'file:./dev.db';

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	out: './drizzle',
	dialect: 'turso',
	dbCredentials: {
		url: DATABASE_URL
	},
	verbose: true,
	strict: true
});
