import { db } from '.';
import * as schema from './schemas';

export const REQUIRED_ROLES = [
	{ id: 'admin', name: 'Administrator' }, // Has access to all features
	{ id: 'editor', name: 'Editor' } // Has access to all features except for user management
];

export async function syncRoles() {
	await db.insert(schema.role).values(REQUIRED_ROLES).onConflictDoNothing();
}
