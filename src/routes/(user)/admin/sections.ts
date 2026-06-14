// Single source of truth for the admin navigation (sidebar + dashboard cards).
// Keeping one list avoids the sidebar and dashboard drifting out of sync.

import type { Component } from 'svelte';
import { m } from '$lib/paraglide/messages';

import IconParkSolidHome from '~icons/icon-park-solid/home';
import IconParkSolidUser from '~icons/icon-park-solid/user';
import IconParkSolidPeople from '~icons/icon-park-solid/people';
import IconParkSolidEveryUser from '~icons/icon-park-solid/every-user';
import IconParkSolidCalendar from '~icons/icon-park-solid/calendar';
import IconParkSolidGame from '~icons/icon-park-solid/game';
import IconParkSolidTrophy from '~icons/icon-park-solid/trophy';
import IconParkSolidMessage from '~icons/icon-park-solid/message';
import IconParkSolidHistory from '~icons/icon-park-solid/history-query';
import IconParkSolidDelete from '~icons/icon-park-solid/delete';
import IconParkSolidKey from '~icons/icon-park-solid/key';

export type AdminRole = 'admin' | 'editor';
export type AdminCardColor = 'blue' | 'green' | 'red' | 'purple' | 'yellow';

export interface AdminSection {
	href: string;
	/** Localized label getter (call at render time so it tracks locale). */
	label: () => string;
	icon: Component;
	/** Optional localized description (used by the dashboard cards). */
	description?: () => string;
	/** When set, the section is only shown to users holding this role. */
	requiredRole?: AdminRole;
	/** Whether this section appears as a dashboard card. */
	card?: boolean;
	/** Accent color for the dashboard card. */
	color?: AdminCardColor;
}

/** The "Home" link — sidebar only (not a dashboard card). */
export const adminHome: AdminSection = {
	href: '/admin',
	label: () => m.home(),
	icon: IconParkSolidHome
};

export const adminSections: AdminSection[] = [
	{
		href: '/admin/users',
		label: () => m.users(),
		icon: IconParkSolidUser,
		description: () => m.admin_users_desc(),
		requiredRole: 'admin',
		card: true,
		color: 'blue'
	},
	{
		href: '/admin/players',
		label: () => m.players(),
		icon: IconParkSolidPeople,
		description: () => m.admin_players_desc(),
		card: true,
		color: 'green'
	},
	{
		href: '/admin/teams',
		label: () => m.teams(),
		icon: IconParkSolidEveryUser,
		description: () => m.admin_teams_desc(),
		card: true,
		color: 'red'
	},
	{
		href: '/admin/events',
		label: () => m.events(),
		icon: IconParkSolidCalendar,
		description: () => m.admin_events_desc(),
		card: true,
		color: 'purple'
	},
	{
		href: '/admin/matches',
		label: () => m.matches(),
		icon: IconParkSolidGame,
		description: () => m.admin_matches_desc(),
		card: true,
		color: 'blue'
	},
	{
		href: '/admin/organizers',
		label: () => m.organizers(),
		icon: IconParkSolidTrophy,
		description: () => m.admin_organizers_desc(),
		card: true,
		color: 'yellow'
	},
	{
		href: '/admin/community',
		label: () => m.community(),
		icon: IconParkSolidMessage,
		description: () => m.admin_community_desc(),
		card: true,
		color: 'purple'
	},
	{
		href: '/admin/edit-history',
		label: () => m['editing.history.edit_history'](),
		icon: IconParkSolidHistory,
		description: () => m['editing.history.edit_history_desc'](),
		card: true,
		color: 'yellow'
	},
	{
		href: '/admin/trash',
		label: () => m.trash_title(),
		icon: IconParkSolidDelete,
		description: () => m.trash_card_desc(),
		card: true,
		color: 'red'
	},
	{
		href: '/admin/mcp-log',
		label: () => m.mcp_log_title(),
		icon: IconParkSolidKey,
		description: () => m.mcp_log_card_desc(),
		requiredRole: 'admin',
		card: true,
		color: 'green'
	}
];

/** Filter sections by the roles a user holds. */
export function visibleSections(
	sections: AdminSection[],
	roles: readonly string[] | undefined
): AdminSection[] {
	return sections.filter((s) => !s.requiredRole || (roles?.includes(s.requiredRole) ?? false));
}
