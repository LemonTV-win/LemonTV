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
	createdAt?: string | null;
	updatedAt?: string | null;
	players?: TeamPlayer[];
	wins?: number;
	aliases?: string[];
}

export function alreadyEnded(tp: { endedOn?: TeamPlayerRole['endedOn'] }) {
	return tp.endedOn ? new Date(tp.endedOn) < new Date() : false;
}

export function isActive(tp: {
	role: TeamPlayerRole['role'];
	endedOn?: TeamPlayerRole['endedOn'];
}) {
	return tp.role === 'active' && !alreadyEnded(tp);
}

export function isSubstitute(tp: {
	role: TeamPlayerRole['role'];
	endedOn?: TeamPlayerRole['endedOn'];
}) {
	return tp.role === 'substitute' && !alreadyEnded(tp);
}

export function isCoaching(tp: {
	role: TeamPlayerRole['role'];
	endedOn?: TeamPlayerRole['endedOn'];
}) {
	return tp.role === 'coach' && !alreadyEnded(tp);
}

export function isManager(tp: {
	role: TeamPlayerRole['role'];
	endedOn?: TeamPlayerRole['endedOn'];
}) {
	return tp.role === 'manager' && !alreadyEnded(tp);
}

export function isOwner(tp: { role: TeamPlayerRole['role']; endedOn?: TeamPlayerRole['endedOn'] }) {
	return tp.role === 'owner' && !alreadyEnded(tp);
}

export function isFormer(tp: {
	role: TeamPlayerRole['role'];
	endedOn?: TeamPlayerRole['endedOn'];
}) {
	return !isActive(tp) && !isCoaching(tp) && !isSubstitute(tp) && !isManager(tp) && !isOwner(tp);
}
