<script lang="ts">
	import IconParkSolidDelete from '~icons/icon-park-solid/delete';
	import IconParkSolidAdd from '~icons/icon-park-solid/add';
	import IconWarning from '~icons/ion/warning';
	import IconError from '~icons/tdesign/error-circle';
	import { m } from '$lib/paraglide/messages';
	import Combobox from '$lib/components/Combobox.svelte';
	import type { Team, Player, GameAccount } from '$lib/server/db/schema';
	import { SvelteSet } from 'svelte/reactivity';
	import { isActive, isSubstitute, isCoaching } from '$lib/data/teams';
	import LanguageSelect from '$lib/components/forms/LanguageSelect.svelte';
	import countryCodeToFlagEmoji from 'country-code-to-flag-emoji';
	import type { Nationality } from '$lib/server/data/players';
	import { formatGameAccountID } from '$lib/data/players';

	interface Slogan {
		id?: number;
		slogan: string;
		language: string | null;
		eventId: string | null;
		teamId?: string;
	}

	interface Props {
		teams: Team[];
		players: (Omit<Player, 'nationality'> & { gameAccounts: GameAccount[] } & {
			nationalities: Nationality[];
		})[];
		selectedTeams: string[];
		eventTeamPlayers: Array<{
			teamId: string;
			playerId: string;
			role: 'main' | 'sub' | 'coach';
		}>;
		eventTeams: Array<{
			teamId: string;
			entry:
				| 'open'
				| 'invited'
				| 'qualified'
				| 'host'
				| 'defending_champion'
				| 'regional_slot'
				| 'exhibition'
				| 'wildcard';
			status: 'active' | 'disqualified' | 'withdrawn' | 'eliminated';
		}>;
		teamPlayers: Array<{
			teamId: string;
			playerId: string;
			role: 'active' | 'substitute' | 'coach' | 'manager' | 'owner' | 'former';
			startedOn?: string;
			endedOn?: string;
		}>;
		currentEventId?: string | undefined;
		teamSlogans?: Slogan[];
		onSlogansChange?: (slogans: Slogan[]) => void;
	}

	let {
		teams,
		players,
		selectedTeams = $bindable([]),
		eventTeamPlayers = $bindable([]),
		eventTeams = $bindable([]),
		teamPlayers,
		currentEventId,
		teamSlogans = [],
		onSlogansChange
	}: Props = $props();

	// Local slogan state
	let teamSlogansValue = $state<Slogan[]>(teamSlogans || []);

	$inspect('[TeamPlayersInput] eventTeamPlayers', eventTeamPlayers);
	$inspect('[TeamPlayersInput] eventTeams', eventTeams);

	// Track which teams are expanded
	let expandedTeams = new SvelteSet<string>();

	// Slogan management state for each team
	let teamSlogansState = $state<Record<string, Slogan[]>>({});
	let newSloganState = $state<Record<string, { text: string; language: string | null }>>({});

	const roleOptions = ['main', 'sub', 'coach'];
	const entryOptions = [
		'open',
		'invited',
		'qualified',
		'host',
		'defending_champion',
		'regional_slot',
		'exhibition',
		'wildcard'
	] as const;
	const statusOptions = ['active', 'disqualified', 'withdrawn', 'eliminated'] as const;

	const ENTRY_NAMES: Record<(typeof entryOptions)[number], () => string> = {
		open: m['content.teams.entry.open'],
		invited: m['content.teams.entry.invited'],
		qualified: m['content.teams.entry.qualified'],
		host: m['content.teams.entry.host'],
		defending_champion: m['content.teams.entry.defending_champion'],
		regional_slot: m['content.teams.entry.regional_slot'],
		exhibition: m['content.teams.entry.exhibition'],
		wildcard: m['content.teams.entry.wildcard']
	};

	const STATUS_NAMES: Record<(typeof statusOptions)[number], () => string> = {
		active: m['content.teams.status.active'],
		disqualified: m['content.teams.status.disqualified'],
		withdrawn: m['content.teams.status.withdrawn'],
		eliminated: m['content.teams.status.eliminated']
	};

	function upsertEventTeamMeta(
		teamId: string,
		patch: Partial<{ entry: (typeof entryOptions)[number]; status: (typeof statusOptions)[number] }>
	) {
		const exists = eventTeams.some((et) => et.teamId === teamId);
		if (exists) {
			eventTeams = eventTeams.map((et) => (et.teamId === teamId ? { ...et, ...patch } : et));
		} else {
			eventTeams = [
				...eventTeams,
				{
					teamId,
					entry: (patch.entry ?? 'open') as (typeof entryOptions)[number],
					status: (patch.status ?? 'active') as (typeof statusOptions)[number]
				}
			];
		}
	}

	function addTeam(teamId: string) {
		if (!selectedTeams.includes(teamId)) {
			selectedTeams = [...selectedTeams, teamId];
			// Ensure meta defaults exist
			if (!eventTeams.some((et) => et.teamId === teamId)) {
				eventTeams = [...eventTeams, { teamId, entry: 'open', status: 'active' }];
			}
			// Only add players that belong to this team AND are active, substitutes, or coaches
			const teamMembers = teamPlayers.filter(
				(tp) => tp.teamId === teamId && (isActive(tp) || isSubstitute(tp) || isCoaching(tp))
			);
			const newTeamPlayers = teamMembers
				.filter(
					(tp) =>
						!eventTeamPlayers.some((etp) => etp.teamId === teamId && etp.playerId === tp.playerId)
				)
				.map((tp) => {
					// Find the player's existing role in other teams
					const existingRole = eventTeamPlayers.find((etp) => etp.playerId === tp.playerId)?.role;
					// Use the helper function to determine the appropriate role
					const defaultRole = getEventRole(tp);
					return {
						teamId,
						playerId: tp.playerId,
						role: existingRole || defaultRole
					};
				});
			eventTeamPlayers = [...eventTeamPlayers, ...newTeamPlayers];
			// Expand the team when adding it
			expandedTeams.add(teamId);
		}
	}

	function removeTeam(teamId: string) {
		selectedTeams = selectedTeams.filter((id) => id !== teamId);
		// Remove all players associated with this team
		eventTeamPlayers = eventTeamPlayers.filter((tp) => tp.teamId !== teamId);
		// Remove meta for this team
		eventTeams = eventTeams.filter((et) => et.teamId !== teamId);
		// Remove from expanded teams
		expandedTeams.delete(teamId);
	}

	function toggleTeam(teamId: string) {
		if (expandedTeams.has(teamId)) {
			expandedTeams.delete(teamId);
		} else {
			expandedTeams.add(teamId);
		}
	}

	function addTeamPlayer(teamId: string) {
		const teamMembers = players.filter(
			(p) =>
				teamPlayers.some(
					(tp) =>
						tp.playerId === p.id &&
						tp.teamId === teamId &&
						(isActive(tp) || isSubstitute(tp) || isCoaching(tp))
				) && !eventTeamPlayers.some((etp) => etp.playerId === p.id)
		);

		if (teamMembers.length > 0) {
			const playerId = teamMembers[0].id;
			const teamPlayer = teamPlayers.find((tp) => tp.teamId === teamId && tp.playerId === playerId);
			const defaultRole = getEventRole(teamPlayer);

			eventTeamPlayers = [
				...eventTeamPlayers,
				{
					teamId,
					playerId,
					role: defaultRole
				}
			];
		}
	}

	function removeTeamPlayer(teamPlayer: { teamId: string; playerId: string; role: string }) {
		eventTeamPlayers = eventTeamPlayers.filter(
			(tp) => !(tp.teamId === teamPlayer.teamId && tp.playerId === teamPlayer.playerId)
		);
	}

	function addTeamSlogan(teamId: string) {
		const newSlogan = newSloganState[teamId];
		if (!newSlogan || !newSlogan.text.trim()) return;

		const slogan: Slogan = {
			id: undefined,
			slogan: newSlogan.text.trim(),
			language: newSlogan.language && newSlogan.language !== '' ? newSlogan.language : null,
			eventId: currentEventId || null,
			teamId: teamId
		};

		// Update local state
		teamSlogansValue = [...teamSlogansValue, slogan];

		// Update local state
		if (!teamSlogansState[teamId]) {
			teamSlogansState[teamId] = [];
		}
		teamSlogansState[teamId] = [...teamSlogansState[teamId], slogan];

		// Notify parent of change
		onSlogansChange?.(teamSlogansValue);

		// Reset input
		newSloganState[teamId] = { text: '', language: '' };
	}

	function removeTeamSlogan(teamId: string, sloganIndex: number) {
		if (teamSlogansState[teamId] && teamSlogansState[teamId][sloganIndex]) {
			const sloganToRemove = teamSlogansState[teamId][sloganIndex];

			// Update local state
			teamSlogansValue = teamSlogansValue.filter((s: Slogan) => s !== sloganToRemove);

			// Update local state
			teamSlogansState[teamId] = teamSlogansState[teamId].filter(
				(_, index) => index !== sloganIndex
			);

			// Notify parent of change
			onSlogansChange?.(teamSlogansValue);
		}
	}

	function initializeSloganState() {
		// Initialize slogan state from prop
		teamSlogansValue = teamSlogans || [];
		selectedTeams.forEach((teamId) => {
			const existingSlogans = teamSlogansValue.filter((slogan: Slogan) => slogan.teamId === teamId);
			if (existingSlogans.length > 0) {
				teamSlogansState[teamId] = existingSlogans;
			}
			if (!newSloganState[teamId]) {
				newSloganState[teamId] = { text: '', language: '' };
			}
		});
	}

	// Initialize slogan state when component loads or when selected teams change
	$effect(() => {
		initializeSloganState();
	});

	// Sync with prop changes
	$effect(() => {
		if (teamSlogans) {
			teamSlogansValue = teamSlogans;
			initializeSloganState();
		}
	});

	// Helper function to get role counts for a team
	function getTeamRoleCounts(teamId: string) {
		const counts = { main: 0, sub: 0, coach: 0 };
		eventTeamPlayers
			.filter((tp) => tp.teamId === teamId)
			.forEach((tp) => {
				counts[tp.role as keyof typeof counts]++;
			});
		return counts;
	}

	// Helper function to check for duplicate players
	function getPlayerValidationStatus(teamId: string, playerId: string) {
		const sameTeamEntries = eventTeamPlayers.filter(
			(tp) => tp.teamId === teamId && tp.playerId === playerId
		);
		const otherTeamEntries = eventTeamPlayers.filter(
			(tp) => tp.teamId !== teamId && tp.playerId === playerId
		);

		const validations = [];

		if (sameTeamEntries.length > 1) {
			validations.push({
				type: 'error',
				message: 'This player appears multiple times in the same team'
			});
		}

		if (otherTeamEntries.length > 0) {
			const otherTeamNames = otherTeamEntries
				.map((tp) => teams.find((t) => t.id === tp.teamId)?.name)
				.filter(Boolean)
				.join(', ');
			validations.push({
				type: 'warning',
				message: `Player is already in other teams: ${otherTeamNames}`
			});
		}

		return validations.length > 0 ? validations : null;
	}

	// Helper function to determine the appropriate event role based on team player status
	function getEventRole(teamPlayer: any | undefined): 'main' | 'sub' | 'coach' {
		if (!teamPlayer) return 'main'; // Default for players not in team
		if (isActive(teamPlayer)) return 'main';
		if (isSubstitute(teamPlayer)) return 'sub';
		if (isCoaching(teamPlayer)) return 'coach';
		return 'main'; // Fallback
	}
</script>

<div class="space-y-4">
	<!-- Team Selection -->
	<div class="mb-6">
		<label for="team-select" class="mb-2 block text-sm font-medium text-slate-300"
			>Select Teams</label
		>
		<div class="w-full">
			<Combobox
				items={teams
					.filter((team) => !selectedTeams.includes(team.id))
					.map((team) => ({
						id: team.id,
						name: team.name,
						gameAccounts: [] // Teams don't have game accounts
					}))}
				value=""
				placeholder={m.select_team()}
				groups={[]}
				disabled={false}
				class="px-3 py-2"
				onChange={(item) => {
					addTeam(item.id);
				}}
			/>
		</div>
		<p class="mt-1 text-sm text-slate-400">Select a team to add it to the event</p>
	</div>

	<!-- Team Players -->
	<div class="mt-2 space-y-4">
		{#each teams.filter((team) => selectedTeams.includes(team.id)) as team (team.id)}
			<div class="rounded-lg border border-slate-700 bg-slate-800">
				<div
					role="button"
					tabindex="0"
					class="flex w-full cursor-pointer items-center justify-between p-4 text-left"
					onclick={() => toggleTeam(team.id)}
					onkeydown={(e) => e.key === 'Enter' && toggleTeam(team.id)}
				>
					<div class="flex items-center gap-2">
						<h4 class="text-md font-medium text-slate-300">{team.name}</h4>
						<div class="flex items-center gap-1.5">
							{#each Object.entries(getTeamRoleCounts(team.id)) as [role, count] (role)}
								{#if count > 0}
									<span
										class="rounded-full px-1.5 py-0.5 text-xs font-medium {role === 'main'
											? 'bg-blue-900/50 text-blue-300'
											: role === 'sub'
												? 'bg-purple-900/50 text-purple-300'
												: 'bg-amber-900/50 text-amber-300'}"
										title={`${count} ${role}${count === 1 ? '' : 's'}`}
									>
										{count}
									</span>
								{/if}
							{/each}
							{#if !Object.values(getTeamRoleCounts(team.id)).some((count) => count > 0)}
								<span
									class="rounded-full bg-slate-700 px-1.5 py-0.5 text-xs text-slate-400"
									title="No players"
								>
									0
								</span>
							{/if}
						</div>
						<button
							type="button"
							class="text-red-400 hover:text-red-300"
							onclick={(e) => {
								e.stopPropagation();
								removeTeam(team.id);
							}}
							title={m.remove_team()}
						>
							<IconParkSolidDelete class="h-5 w-5" />
						</button>
					</div>
					<div class="flex items-center gap-2">
						<button
							type="button"
							class="flex items-center gap-2 rounded-md border border-dashed border-slate-700 bg-slate-800/50 px-3 py-1.5 text-yellow-500 transition-colors hover:border-yellow-500 hover:bg-slate-800"
							onclick={(e) => {
								e.stopPropagation();
								addTeamPlayer(team.id);
								expandedTeams.add(team.id);
							}}
						>
							<IconParkSolidAdd class="h-4 w-4" />
							<span class="text-sm">{m.add_new_player()}</span>
						</button>
						<svg
							class="h-5 w-5 transform text-slate-400 transition-transform {expandedTeams.has(
								team.id
							)
								? 'rotate-180'
								: ''}"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 9l-7 7-7-7"
							/>
						</svg>
					</div>
				</div>

				{#if expandedTeams.has(team.id)}
					<div class="border-t border-slate-700">
						<div
							class="flex items-center gap-3 border-b border-slate-700 bg-slate-800 px-4 py-3 text-xs"
						>
							<label class="text-slate-400" for={`entry-${team.id}`}
								>{m['content.teams.entry.entry']()}</label
							>
							<select
								id={`entry-${team.id}`}
								class="min-w-32 rounded border border-slate-600 bg-slate-900 px-2 py-1 text-xs text-slate-200"
								value={eventTeams.find((et) => et.teamId === team.id)?.entry ?? 'open'}
								onchange={(e) => {
									const newEntry = (e.target as HTMLSelectElement)
										.value as (typeof entryOptions)[number];
									upsertEventTeamMeta(team.id, { entry: newEntry });
								}}
							>
								{#each entryOptions as entry (entry)}
									<option value={entry}>{ENTRY_NAMES[entry]?.()}</option>
								{/each}
							</select>
							<label class="ml-2 text-slate-400" for={`status-${team.id}`}
								>{m['content.teams.status.status']()}</label
							>
							<select
								id={`status-${team.id}`}
								class="min-w-32 rounded border border-slate-600 bg-slate-900 px-2 py-1 text-xs text-slate-200"
								value={eventTeams.find((et) => et.teamId === team.id)?.status ?? 'active'}
								onchange={(e) => {
									const newStatus = (e.target as HTMLSelectElement)
										.value as (typeof statusOptions)[number];
									upsertEventTeamMeta(team.id, { status: newStatus });
								}}
							>
								{#each statusOptions as status (status)}
									<option value={status}>{STATUS_NAMES[status]?.()}</option>
								{/each}
							</select>
						</div>

						<!-- Slogans Section -->
						<div class="border-b border-slate-700 px-4 py-4">
							<h5 class="text-sm font-medium text-slate-300">{m['slogans.team_slogans']()}</h5>

							<!-- Existing Slogans -->
							{#if teamSlogansState[team.id] && teamSlogansState[team.id].length > 0}
								<div class="space-y-2">
									{#each teamSlogansState[team.id] as slogan, sloganIndex (sloganIndex)}
										<div
											class="grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-md bg-slate-700/50 p-2"
										>
											{#if slogan.language}
												<div class="text-xs text-slate-400">{slogan.language}</div>
											{/if}
											<div class="text-sm text-slate-200">{slogan.slogan}</div>
											<button
												type="button"
												class="text-red-400 hover:text-red-300"
												onclick={() => removeTeamSlogan(team.id, sloganIndex)}
												title={m.remove()}
											>
												<IconParkSolidDelete class="h-4 w-4" />
											</button>
										</div>
									{/each}
								</div>
							{/if}

							<!-- Add New Slogan -->
							<div class="mt-1 flex gap-2">
								<LanguageSelect
									id={`slogan-lang`}
									class="block w-1/3 rounded-md border border-slate-600 bg-slate-800 px-2 py-1 text-sm text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
									value={newSloganState[team.id]?.language || ''}
									onchange={({ value }) => {
										if (!newSloganState[team.id])
											newSloganState[team.id] = { text: '', language: '' };
										newSloganState[team.id].language = value || null;
									}}
									placeholder={m['select_language_optional']()}
								/>
								<input
									type="text"
									value={newSloganState[team.id]?.text || ''}
									placeholder={m['slogans.add_slogan']()}
									oninput={(e) => {
										if (!newSloganState[team.id])
											newSloganState[team.id] = { text: '', language: '' };
										newSloganState[team.id].text = (e.target as HTMLInputElement).value;
									}}
									class="flex-1 rounded-md border border-slate-600 bg-slate-800 px-2 py-1 text-sm text-white placeholder:text-slate-400 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
								/>

								<button
									type="button"
									class="rounded-md bg-yellow-500 px-3 py-1 text-sm font-medium text-black hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
									onclick={() => addTeamSlogan(team.id)}
									disabled={!newSloganState[team.id]?.text.trim()}
								>
									<IconParkSolidAdd class="h-4 w-4" />
								</button>
							</div>
						</div>

						{#if eventTeamPlayers.filter((tp) => tp.teamId === team.id).length > 0}
							<div class="divide-y divide-slate-700">
								{#each eventTeamPlayers.filter((tp) => tp.teamId === team.id) as teamPlayer, index (teamPlayer.playerId)}
									<div class="flex items-start gap-3 px-4 py-2 hover:bg-slate-800/50">
										<div class="flex-1">
											<label
												class="block text-sm font-medium text-slate-300"
												for="player-{team.id}-{index}"
											>
												{m.player()}
											</label>
											<div class="mt-1">
												<Combobox
													items={players.map((p) => ({
														id: p.id,
														name: p.name,
														gameAccounts: p.gameAccounts || [],
														group: eventTeamPlayers.some(
															(tp) => tp.teamId === team.id && tp.playerId === p.id
														)
															? 'team'
															: 'other',
														nationalities: p.nationalities
													}))}
													bind:value={teamPlayer.playerId}
													placeholder={m.search_players()}
													groups={[
														{ id: 'team', label: m.team_players() },
														{ id: 'other', label: m.other_players() }
													]}
													disabled={false}
													class="px-2 py-1 text-sm"
													secondaryTextFunction={(item) => {
														return `${countryCodeToFlagEmoji(item.nationalities[0] ?? 'ZZ')} ${item.gameAccounts.map((ga) => formatGameAccountID(ga)).join(', ')}`;
													}}
												/>
												{#if teamPlayer.playerId}
													{#if getPlayerValidationStatus(team.id, teamPlayer.playerId)}
														<div class="mt-1 space-y-1">
															{#each getPlayerValidationStatus(team.id, teamPlayer.playerId) ?? [] as validation (validation.message)}
																<div
																	class="flex items-center gap-1 text-sm {validation.type ===
																	'error'
																		? 'text-red-400'
																		: 'text-yellow-400'}"
																	title={validation.message}
																>
																	{#if validation.type === 'error'}
																		<IconError class="h-4 w-4" />
																	{:else}
																		<IconWarning class="h-4 w-4" />
																	{/if}
																	{validation.message}
																</div>
															{/each}
														</div>
													{/if}
												{/if}
											</div>
										</div>
										<div class="w-24">
											<label
												class="block text-sm font-medium text-slate-300"
												for="role-{team.id}-{index}"
											>
												{m.role()}
											</label>
											<select
												id="role-{team.id}-{index}"
												bind:value={teamPlayer.role}
												class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-sm text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
											>
												{#each roleOptions as role (role)}
													<option value={role}>{role}</option>
												{/each}
											</select>
										</div>
										<button
											type="button"
											class="mt-auto mb-2 text-red-400 hover:text-red-300"
											onclick={() => removeTeamPlayer(teamPlayer)}
											title={m.remove()}
										>
											<IconParkSolidDelete class="h-4 w-4" />
										</button>
									</div>
								{/each}
							</div>
						{:else}
							<p class="px-4 py-2 text-sm text-slate-400">{m.no_data()}</p>
						{/if}
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>
