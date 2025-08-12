import { describe, it, expect, beforeEach } from 'bun:test';
import { checkPermissions } from './permission';
import type { UserRole } from '$lib/data/user';

// Mock App.Locals type for testing
type MockLocals = {
	user?: {
		id: string;
		username: string;
		roles: UserRole[];
	} | null;
	session: any; // Mock session property
};

describe('checkPermissions', () => {
	let mockLocals: MockLocals;

	beforeEach(() => {
		mockLocals = {
			user: {
				id: 'user-123',
				username: 'testuser',
				roles: ['admin']
			},
			session: {}
		};
	});

	describe('success cases', () => {
		it('should return success when user has required role', () => {
			const result = checkPermissions(mockLocals as any, ['admin']);

			expect(result.status).toBe('success');
			if (result.status === 'success') {
				expect(result.userId).toBe('user-123');
			}
		});

		it('should return success when user has one of multiple required roles', () => {
			mockLocals.user!.roles = ['admin'];
			const result = checkPermissions(mockLocals as any, ['admin', 'editor']);

			expect(result.status).toBe('success');
			if (result.status === 'success') {
				expect(result.userId).toBe('user-123');
			}
		});

		it('should return success when user has multiple required roles', () => {
			mockLocals.user!.roles = ['admin', 'editor'];
			const result = checkPermissions(mockLocals as any, ['admin', 'editor']);

			expect(result.status).toBe('success');
			if (result.status === 'success') {
				expect(result.userId).toBe('user-123');
			}
		});

		it('should return success when user has more roles than required', () => {
			mockLocals.user!.roles = ['admin', 'editor'];
			const result = checkPermissions(mockLocals as any, ['admin']);

			expect(result.status).toBe('success');
			if (result.status === 'success') {
				expect(result.userId).toBe('user-123');
			}
		});
	});

	describe('error cases', () => {
		it('should return 401 error when user is not authenticated (no user)', () => {
			mockLocals.user = null;
			const result = checkPermissions(mockLocals as any, ['admin']);

			expect(result.status).toBe('error');
			if (result.status === 'error') {
				expect(result.error).toBe('Unauthorized');
				expect(result.statusCode).toBe(401);
			}
		});

		it('should return 401 error when user is not authenticated (no user.id)', () => {
			mockLocals.user = {
				id: '',
				username: 'testuser',
				roles: ['admin']
			};
			const result = checkPermissions(mockLocals as any, ['admin']);

			expect(result.status).toBe('error');
			if (result.status === 'error') {
				expect(result.error).toBe('Unauthorized');
				expect(result.statusCode).toBe(401);
			}
		});

		it('should return 401 error when user is not authenticated (undefined user.id)', () => {
			mockLocals.user = {
				id: undefined as any,
				username: 'testuser',
				roles: ['admin']
			};
			const result = checkPermissions(mockLocals as any, ['admin']);

			expect(result.status).toBe('error');
			if (result.status === 'error') {
				expect(result.error).toBe('Unauthorized');
				expect(result.statusCode).toBe(401);
			}
		});

		it('should return 403 error when user lacks required roles', () => {
			mockLocals.user!.roles = ['admin'];
			const result = checkPermissions(mockLocals as any, ['editor']);

			expect(result.status).toBe('error');
			if (result.status === 'error') {
				expect(result.error).toBe('Insufficient permissions');
				expect(result.statusCode).toBe(403);
			}
		});

		it('should return 403 error when user has no roles', () => {
			mockLocals.user!.roles = [];
			const result = checkPermissions(mockLocals as any, ['admin']);

			expect(result.status).toBe('error');
			if (result.status === 'error') {
				expect(result.error).toBe('Insufficient permissions');
				expect(result.statusCode).toBe(403);
			}
		});

		it('should return 403 error when user has different roles than required', () => {
			mockLocals.user!.roles = ['admin'];
			const result = checkPermissions(mockLocals as any, ['editor']);

			expect(result.status).toBe('error');
			if (result.status === 'error') {
				expect(result.error).toBe('Insufficient permissions');
				expect(result.statusCode).toBe(403);
			}
		});

		it('should return 403 error when required roles array is empty', () => {
			const result = checkPermissions(mockLocals as any, []);

			expect(result.status).toBe('error');
			if (result.status === 'error') {
				expect(result.error).toBe('Insufficient permissions');
				expect(result.statusCode).toBe(403);
			}
		});
	});

	describe('edge cases', () => {
		it('should handle undefined locals.user gracefully', () => {
			mockLocals.user = undefined;
			const result = checkPermissions(mockLocals as any, ['admin']);

			expect(result.status).toBe('error');
			if (result.status === 'error') {
				expect(result.error).toBe('Unauthorized');
				expect(result.statusCode).toBe(401);
			}
		});

		it('should handle empty string roles gracefully', () => {
			mockLocals.user!.roles = ['admin', '' as any];
			const result = checkPermissions(mockLocals as any, ['admin']);

			expect(result.status).toBe('success');
			if (result.status === 'success') {
				expect(result.userId).toBe('user-123');
			}
		});

		it('should handle case-sensitive role matching', () => {
			mockLocals.user!.roles = ['Admin' as any];
			const result = checkPermissions(mockLocals as any, ['admin']);

			expect(result.status).toBe('error');
			if (result.status === 'error') {
				expect(result.error).toBe('Insufficient permissions');
				expect(result.statusCode).toBe(403);
			}
		});
	});
});
