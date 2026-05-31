/**
 * PII projection for MCP read-tool output.
 *
 * The data-layer getters (`getPlayer`, `getTeam`, …) join the `user` table and
 * include `user.email`, `user.username`, and the player↔account linkage. None of
 * that may go over MCP, so read tools project it away. Kept DB-free and
 * unit-tested — this is a security boundary.
 */
type Rec = Record<string, unknown>;

/** Remove the joined `user` account object (email/username/linkage) from a record. */
export function stripUser(record: Rec): Rec {
	const clone = { ...record };
	delete clone.user;
	return clone;
}

/** Strip `user` PII from every roster entry's nested `player` on a team object. */
export function stripRosterUserPII(team: Rec): Rec {
	if (!Array.isArray(team.players)) return team;
	const players = team.players.map((entry) => {
		if (entry && typeof entry === 'object' && 'player' in entry) {
			const e = entry as Rec;
			if (e.player && typeof e.player === 'object') {
				return { ...e, player: stripUser(e.player as Rec) };
			}
		}
		return entry;
	});
	return { ...team, players };
}
