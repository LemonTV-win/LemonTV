export type UserRole = 'admin' | 'editor';

export interface User {
	id: string;
	email: string;
	username: string;
	roles: UserRole[];
}
