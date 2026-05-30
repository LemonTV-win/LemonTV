import { describe, it, expect } from 'bun:test';
import { stripUser, stripRosterUserPII } from './project';

describe('stripUser', () => {
	it('removes the user account object (email/username/linkage)', () => {
		const player = {
			id: 'p1',
			name: 'Alice',
			user: { id: 'u1', email: 'a@example.com', username: 'alice', roles: ['editor'] }
		};
		const out = stripUser(player);
		expect('user' in out).toBe(false);
		expect(out).toEqual({ id: 'p1', name: 'Alice' });
	});

	it('is a no-op when there is no user field', () => {
		expect(stripUser({ id: 'p1', name: 'Bob' })).toEqual({ id: 'p1', name: 'Bob' });
	});

	it('does not mutate the input', () => {
		const player = { id: 'p1', user: { email: 'a@example.com' } };
		stripUser(player);
		expect(player.user).toBeDefined();
	});
});

describe('stripRosterUserPII', () => {
	it('strips user from each roster entry player', () => {
		const team = {
			id: 't1',
			name: 'Team',
			players: [
				{ role: 'active', player: { id: 'p1', name: 'A', user: { email: 'a@x.com' } } },
				{ role: 'sub', player: { id: 'p2', name: 'B', user: { email: 'b@x.com' } } }
			]
		};
		const out = stripRosterUserPII(team);
		const roster = out.players as { player: Record<string, unknown> }[];
		for (const entry of roster) {
			expect('user' in entry.player).toBe(false);
		}
		expect(roster[0].player).toEqual({ id: 'p1', name: 'A' });
	});

	it('handles a team with no players', () => {
		expect(stripRosterUserPII({ id: 't1', name: 'Team' })).toEqual({ id: 't1', name: 'Team' });
	});

	it('tolerates roster entries without a player object', () => {
		const team = { id: 't1', players: [{ role: 'active' }] };
		expect(stripRosterUserPII(team)).toEqual(team);
	});
});
