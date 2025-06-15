<script lang="ts">
	import IconParkSolidDelete from '~icons/icon-park-solid/delete';
	import IconParkSolidAdd from '~icons/icon-park-solid/add';
	import IconWarning from '~icons/ion/warning';
	import IconError from '~icons/tdesign/error-circle';
	import { m } from '$lib/paraglide/messages';
	import Combobox from '$lib/components/Combobox.svelte';
	import type { Team, Player } from '$lib/server/db/schema';

	interface Props {
		teams: Team[];
		players: Player[];
		selectedTeams: string[];
		eventTeamPlayers: Array<{
			teamId: string;
			playerId: string;
			role: 'main' | 'sub' | 'coach';
		}>;
		teamPlayers: Array<{
			teamId: string;
			playerId: string;
			role: string;
		}>;
	}

	let {
		teams,
		players,
		selectedTeams = $bindable([]),
		eventTeamPlayers = $bindable([]),
		teamPlayers = []
	}: Props = $props();

	$inspect('eventTeamPlayers', eventTeamPlayers);

	// Track which teams are expanded
	let expandedTeams = $state<Set<string>>(new Set());

	const roleOptions = ['main', 'sub', 'coach'];

	function addTeam(teamId: string) {
		if (!selectedTeams.includes(teamId)) {
			selectedTeams = [...selectedTeams, teamId];
			// Only add players that belong to this team
			const teamMembers = teamPlayers.filter((tp) => tp.teamId === teamId);
			const newTeamPlayers = teamMembers
				.filter(
					(tp) =>
						!eventTeamPlayers.some((etp) => etp.teamId === teamId && etp.playerId === tp.playerId)
				)
				.map((tp) => {
					// Find the player's existing role in other teams
					const existingRole = eventTeamPlayers.find((etp) => etp.playerId === tp.playerId)?.role;
					return {
						teamId,
						playerId: tp.playerId,
						role: existingRole || ('main' as const)
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
		// Remove from expanded teams
		expandedTeams.delete(teamId);
	}

	function toggleTeam(teamId: string) {
		if (expandedTeams.has(teamId)) {
			expandedTeams.delete(teamId);
		} else {
			expandedTeams.add(teamId);
		}
		expandedTeams = new Set(expandedTeams); // Trigger reactivity
	}

	function addTeamPlayer(teamId: string) {
		const teamMembers = players.filter(
			(p) =>
				teamPlayers.some((tp) => tp.playerId === p.id) &&
				!eventTeamPlayers.some((etp) => etp.playerId === p.id)
		);
		eventTeamPlayers = [
			...eventTeamPlayers,
			{
				teamId,
				playerId: teamMembers?.length > 0 ? teamMembers[0].id : '',
				role: 'main'
			}
		];
	}

	function removeTeamPlayer(teamPlayer: { teamId: string; playerId: string; role: string }) {
		eventTeamPlayers = eventTeamPlayers.filter(
			(tp) => !(tp.teamId === teamPlayer.teamId && tp.playerId === teamPlayer.playerId)
		);
	}

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
						name: team.name
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
		{#each teams.filter((team) => selectedTeams.includes(team.id)) as team}
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
							{#each Object.entries(getTeamRoleCounts(team.id)) as [role, count]}
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
								expandedTeams = new Set(expandedTeams);
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
						{#if eventTeamPlayers.filter((tp) => tp.teamId === team.id).length > 0}
							<div class="divide-y divide-slate-700">
								{#each eventTeamPlayers.filter((tp) => tp.teamId === team.id) as teamPlayer, index}
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
													items={(() => {
														const filteredPlayers = players.map((p) => ({
															id: p.id,
															name: p.name,
															group: eventTeamPlayers.some(
																(tp) => tp.teamId === team.id && tp.playerId === p.id
															)
																? 'team'
																: 'other'
														}));
														return filteredPlayers;
													})()}
													bind:value={teamPlayer.playerId}
													placeholder={m.search_players()}
													groups={[
														{ id: 'team', label: m.team_players() },
														{ id: 'other', label: m.other_players() }
													]}
													disabled={false}
													class="px-2 py-1 text-sm"
												/>
												{#if teamPlayer.playerId}
													{#if getPlayerValidationStatus(team.id, teamPlayer.playerId)}
														<div class="mt-1 space-y-1">
															{#each getPlayerValidationStatus(team.id, teamPlayer.playerId) ?? [] as validation}
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
												{#each roleOptions as role}
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
