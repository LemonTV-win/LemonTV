import type { User, UserRole } from '$lib/data/user';
import { db } from '$lib/server/db';
import * as schemas from '$lib/server/db/schemas/auth';

export async function getUsers(): Promise<User[]> {
	const users = await db.select().from(schemas.user);
	const roles = await db.select().from(schemas.role);
	const userRoles = await db.select().from(schemas.userRole);

	return users.map((user) => ({
		...user,
		roles: userRoles
			.filter((userRole) => userRole.userId === user.id)
			.map((userRole) => roles.find((role) => role.id === userRole.roleId)?.name as UserRole)
	}));
}
