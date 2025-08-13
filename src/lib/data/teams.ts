import type { Player } from './players';

export interface TeamPlayerRole {
	role: 'active' | 'substitute' | 'former' | 'coach' | 'manager' | 'owner';
	startedOn?: string;
	endedOn?: string;
	note?: string;
}

export interface TeamPlayer {
	player: Player;
	teamPlayer: TeamPlayerRole;
}

export interface Team {
	id: string;
	slug: string;
	name: string;
	abbr: string | null;
	region: string | null;
	logo: string | null;
	createdAt: string | null;
	updatedAt: string | null;
	players?: TeamPlayer[];
	wins?: number;
	aliases?: string[];
}

export function isActive(tp: {
	role: TeamPlayerRole['role'];
	endedOn?: TeamPlayerRole['endedOn'];
}) {
	return tp.role === 'active' && !tp.endedOn;
}

export function isSubstitute(tp: {
	role: TeamPlayerRole['role'];
	endedOn?: TeamPlayerRole['endedOn'];
}) {
	return tp.role === 'substitute' && !tp.endedOn;
}

export function isCoaching(tp: {
	role: TeamPlayerRole['role'];
	endedOn?: TeamPlayerRole['endedOn'];
}) {
	return tp.role === 'coach' && !tp.endedOn;
}

export function isManager(tp: {
	role: TeamPlayerRole['role'];
	endedOn?: TeamPlayerRole['endedOn'];
}) {
	return tp.role === 'manager' && !tp.endedOn;
}

export function isOwner(tp: { role: TeamPlayerRole['role']; endedOn?: TeamPlayerRole['endedOn'] }) {
	return tp.role === 'owner' && !tp.endedOn;
}

export function isFormer(tp: {
	role: TeamPlayerRole['role'];
	endedOn?: TeamPlayerRole['endedOn'];
}) {
	return !isActive(tp) && !isCoaching(tp) && !isSubstitute(tp) && !isManager(tp) && !isOwner(tp);
}
