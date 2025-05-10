<script lang="ts">
	import type { Team, TeamPlayer, TeamAlias } from '$lib/server/db/schemas/game/teams';
	import type { Player } from '$lib/data/players';
	import { goto } from '$app/navigation';
	import { m } from '$lib/paraglide/messages';

	import IconParkSolidEdit from '~icons/icon-park-solid/edit';
	import IconParkSolidDelete from '~icons/icon-park-solid/delete';
	import TypcnArrowUnsorted from '~icons/typcn/arrow-unsorted';
	import TypcnArrowSortedDown from '~icons/typcn/arrow-sorted-down';
	import TypcnArrowSortedUp from '~icons/typcn/arrow-sorted-up';

	import Modal from '$lib/components/Modal.svelte';
	import TeamEdit from './TeamEdit.svelte';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let searchQuery = $state('');
	let selectedTeam = $state<Team | null>(null);
	let isAddingNew = $state(false);
	let isEditing = $state(false);
	let errorMessage = $state('');
	let successMessage = $state('');
	let isImporting = $state(false);
	let isDeleting = $state(false);
	let teamToDelete = $state<Team | null>(null);
	let sortBy = $state<
		'id-asc' | 'id-desc' | 'name-asc' | 'name-desc' | 'region-asc' | 'region-desc'
	>('name-asc');

	let filteredTeams = $derived(
		data.teams
			.filter((team: Team) => {
				const searchLower = searchQuery.toLowerCase();
				return (
					team.name.toLowerCase().includes(searchLower) ||
					team.id.toLowerCase().includes(searchLower) ||
					team.region?.toLowerCase().includes(searchLower) ||
					team.slug?.toLowerCase().includes(searchLower) ||
					team.abbr?.toLowerCase().includes(searchLower) ||
					data.teamAliases
						.filter((ta: TeamAlias) => ta.teamId === team.id)
						.some((ta: TeamAlias) => ta.alias.toLowerCase().includes(searchLower))
				);
			})
			.toSorted((a: Team, b: Team) => {
				if (sortBy === 'id-asc') {
					return a.id.localeCompare(b.id);
				} else if (sortBy === 'id-desc') {
					return b.id.localeCompare(a.id);
				} else if (sortBy === 'name-asc') {
					return a.name.localeCompare(b.name);
				} else if (sortBy === 'name-desc') {
					return b.name.localeCompare(a.name);
				} else if (sortBy === 'region-asc') {
					return (a.region ?? '').localeCompare(b.region ?? '');
				} else if (sortBy === 'region-desc') {
					return (b.region ?? '').localeCompare(a.region ?? '');
				}
				return 0;
			})
	);

	function handleAddTeam() {
		isAddingNew = true;
		isEditing = false;
		selectedTeam = null;
		goto('/admin/teams?action=new', { replaceState: true });
	}

	function handleEditTeam(team: Team) {
		selectedTeam = team;
		isEditing = true;
		isAddingNew = false;
		goto(`/admin/teams?action=edit&id=${team.id}`, { replaceState: true });
	}

	async function handleSaveTeam(team: Partial<Team> & { aliases?: string[]; players?: any[] }) {
		errorMessage = '';
		successMessage = '';

		const formData = new FormData();
		formData.append('id', team.id || '');
		formData.append('name', team.name || '');
		formData.append('logo', team.logo || '');
		formData.append('region', team.region || '');
		formData.append('slug', team.slug || '');
		formData.append('abbr', team.abbr || '');
		formData.append('aliases', JSON.stringify(team.aliases || []));
		formData.append('players', JSON.stringify(team.players || []));

		try {
			const response = await fetch(team.id ? '?/update' : '?/create', {
				method: 'POST',
				body: formData
			});

			const result = await response.json();

			if (result.error) {
				errorMessage = result.error;
			} else {
				isAddingNew = false;
				isEditing = false;
				selectedTeam = null;
				await goto('/admin/teams', { invalidateAll: true });
				successMessage = team.id ? 'Team updated successfully' : 'Team created successfully';
			}
		} catch (e) {
			errorMessage = team.id ? 'Failed to update team' : 'Failed to create team';
			console.error('Error saving team:', e);
		}
	}

	function handleCancel() {
		isAddingNew = false;
		isEditing = false;
		selectedTeam = null;
		goto('/admin/teams', { replaceState: true });
	}

	async function handleDeleteTeam(team: Team) {
		errorMessage = '';
		successMessage = '';

		try {
			const formData = new FormData();
			formData.append('id', team.id);
			const response = await fetch('?/delete', {
				method: 'POST',
				body: formData
			});

			const result = await response.json();

			if (result.error) {
				errorMessage = result.error;
			} else {
				isDeleting = false;
				teamToDelete = null;
				await goto('/admin/teams', { invalidateAll: true });
				successMessage = 'Team deleted successfully';
			}
		} catch (e) {
			errorMessage = 'Failed to delete team';
			console.error('Error deleting team:', e);
		}
	}

	function getTeamPlayers(teamId: string) {
		return data.teamPlayers.filter((tp: TeamPlayer) => tp.teamId === teamId);
	}

	function getTeamAliases(teamId: string) {
		return data.teamAliases.filter((ta: TeamAlias) => ta.teamId === teamId);
	}

	function getPlayerName(playerId: string) {
		const player = (data as any).players?.find((p: Player) => p.id === playerId);
		return player?.name || playerId;
	}

	function getPlayerSlug(playerId: string) {
		const player = (data as any).players?.find((p: Player) => p.id === playerId);
		return player?.slug || playerId;
	}

	async function handleImport(event: Event) {
		errorMessage = '';
		successMessage = '';
		isImporting = true;

		const formData = new FormData();
		const fileInput = event.target as HTMLInputElement;
		if (!fileInput.files?.length) {
			isImporting = false;
			return;
		}

		formData.append('file', fileInput.files[0]);

		try {
			const response = await fetch('?/import', {
				method: 'POST',
				body: formData
			});

			const result = await response.json();

			if (result.error) {
				errorMessage = result.error;
			} else {
				successMessage = result.message || 'Teams imported successfully';
				goto('/admin/teams', { invalidateAll: true });
			}
		} catch (e) {
			errorMessage = 'Failed to import teams';
			console.error('Error importing teams:', e);
		} finally {
			isImporting = false;
		}
	}

	async function handleExport() {
		errorMessage = '';
		successMessage = '';

		try {
			const response = await fetch('/admin/teams/export');
			const result = await response.json();

			if (result.error) {
				errorMessage = result.error;
			} else {
				// Create and download file
				const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
				const url = URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = 'teams.json';
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				URL.revokeObjectURL(url);
			}
		} catch (e) {
			errorMessage = 'Failed to export teams';
			console.error('Error exporting teams:', e);
		}
	}

	// Handle URL parameters
	$effect(() => {
		if (data.action === 'new') {
			handleAddTeam();
		} else if (data.action === 'edit' && data.id) {
			const teamToEdit = data.teams.find((t) => t.id === data.id);
			if (teamToEdit) {
				handleEditTeam(teamToEdit);
			}
		}
	});
</script>

<main class="mx-auto max-w-screen-lg px-4">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-2xl font-bold">{m.admin_dashboard()}</h1>
		<div class="flex gap-2">
			{#if data.user?.roles.includes('admin')}
				<label
					class="cursor-pointer rounded-md bg-slate-700 px-4 py-2 font-medium text-white hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
					class:opacity-50={isImporting}
				>
					{#if isImporting}
						{m.importing()}
					{:else}
						{m.import_json()}
					{/if}
					<input
						type="file"
						accept=".json"
						class="hidden"
						onchange={handleImport}
						disabled={isImporting}
					/>
				</label>
			{/if}
			<button
				class="rounded-md bg-slate-700 px-4 py-2 font-medium text-white hover:bg-slate-600"
				onclick={handleExport}
			>
				{m.export_json()}
			</button>
			<button
				class="rounded-md bg-yellow-500 px-4 py-2 font-medium text-black hover:bg-yellow-600"
				onclick={handleAddTeam}
			>
				{m.add_new_team()}
			</button>
		</div>
	</div>

	{#if errorMessage}
		<div class="mb-4 rounded-md bg-red-900/50 p-4 text-red-200" role="alert">
			<span class="block sm:inline">{errorMessage}</span>
		</div>
	{/if}

	{#if successMessage}
		<div class="mb-4 rounded-md bg-green-900/50 p-4 text-green-200" role="alert">
			<span class="block sm:inline">{successMessage}</span>
		</div>
	{/if}

	<div class="mb-4">
		<input
			type="text"
			bind:value={searchQuery}
			placeholder="Search teams..."
			class="w-full rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
		/>
	</div>

	<div
		class="overflow-x-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb:hover]:bg-slate-500 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-slate-800"
	>
		<table class="w-full table-auto border-collapse border-y-2 border-gray-500 bg-gray-800">
			<thead>
				<tr class="border-b-2 border-gray-500 text-left text-sm text-gray-400">
					<th class="px-4 py-1">
						<button
							class="flex items-center gap-1 text-left"
							class:text-white={sortBy === 'id-asc' || sortBy === 'id-desc'}
							onclick={() => (sortBy = sortBy === 'id-asc' ? 'id-desc' : 'id-asc')}
						>
							Team ID
							{#if sortBy === 'id-asc'}
								<TypcnArrowSortedUp class="inline-block" />
							{:else if sortBy === 'id-desc'}
								<TypcnArrowSortedDown class="inline-block" />
							{:else}
								<TypcnArrowUnsorted class="inline-block" />
							{/if}
						</button>
					</th>
					<th class="px-4 py-1">
						<button
							class="flex items-center gap-1 text-left"
							class:text-white={sortBy === 'name-asc' || sortBy === 'name-desc'}
							onclick={() => (sortBy = sortBy === 'name-asc' ? 'name-desc' : 'name-asc')}
						>
							Team Name
							{#if sortBy === 'name-asc'}
								<TypcnArrowSortedUp class="inline-block" />
							{:else if sortBy === 'name-desc'}
								<TypcnArrowSortedDown class="inline-block" />
							{:else}
								<TypcnArrowUnsorted class="inline-block" />
							{/if}
						</button>
					</th>
					<th class="px-4 py-1">
						<button
							class="flex items-center gap-1 text-left"
							class:text-white={sortBy === 'region-asc' || sortBy === 'region-desc'}
							onclick={() => (sortBy = sortBy === 'region-asc' ? 'region-desc' : 'region-asc')}
						>
							{m.region()}
							{#if sortBy === 'region-asc'}
								<TypcnArrowSortedUp class="inline-block" />
							{:else if sortBy === 'region-desc'}
								<TypcnArrowSortedDown class="inline-block" />
							{:else}
								<TypcnArrowUnsorted class="inline-block" />
							{/if}
						</button>
					</th>
					<th class="px-4 py-1">{m.players()}</th>
					<th class="px-4 py-1">{m.aliases()}</th>
					<th class="sticky right-0 z-10 h-12 bg-gray-800 px-4 py-1">{m.actions()}</th>
				</tr>
			</thead>
			<tbody>
				{#each filteredTeams as team}
					<tr class="border-b-1 border-gray-500 bg-gray-800 px-4 py-2 shadow-2xl">
						<td class="max-w-32 truncate px-4 py-1 font-mono text-xs text-gray-300" title={team.id}>
							{team.id}
						</td>
						<td class="max-w-32 truncate px-4 py-1 text-white">
							<div class="flex items-center">
								{#if team.logo}
									<img src={team.logo} alt={team.name} class="mr-2 h-8 w-8 rounded-full" />
								{/if}
								<div class="flex flex-col">
									<span>{team.name}</span>
									<div class="flex gap-2 text-xs">
										<span class="text-yellow-400">{team.abbr || '-'}</span>
										<a class="text-slate-400" href={`/teams/${team.slug}`}>{team.slug || '-'}</a>
									</div>
								</div>
							</div>
						</td>
						<td class="px-4 py-1 text-gray-300">{team.region || '-'}</td>
						<td class="px-4 py-1 text-gray-300">
							{#if getTeamPlayers(team.id)?.length}
								<ul class="list-inside list-disc">
									{#each getTeamPlayers(team.id) as player}
										{@const playerObj = (data as any).players?.find(
											(p: Player) => p.id === player.playerId
										)}
										<li>
											<a
												href="/players/{playerObj?.slug}"
												class="text-sm text-white hover:text-yellow-400"
												title={player.playerId}
											>
												{playerObj?.name}
											</a>
											<span class="text-gray-400">({player.role})</span>
										</li>
									{/each}
								</ul>
							{:else}
								-
							{/if}
						</td>
						<td class="px-4 py-1 text-gray-300">
							{#if getTeamAliases(team.id)?.length}
								<div class="flex flex-wrap gap-1">
									{#each getTeamAliases(team.id) as alias}
										<span
											class="inline-flex items-center rounded-full bg-gray-700 px-2 py-0.5 text-xs font-medium text-gray-200"
										>
											{alias.alias}
										</span>
									{/each}
								</div>
							{:else}
								-
							{/if}
						</td>
						<td class="sticky right-0 z-10 h-12 bg-gray-800">
							<div class="flex h-full items-center gap-2 border-l border-gray-700 px-4 py-1">
								<button
									class="flex items-center gap-1 text-yellow-500 hover:text-yellow-400"
									onclick={() => handleEditTeam(team)}
									title={m.edit()}
								>
									<IconParkSolidEdit class="h-4 w-4" />
								</button>
								<button
									class="flex items-center gap-1 text-red-500 hover:text-red-400"
									onclick={() => {
										teamToDelete = team;
										isDeleting = true;
									}}
									title={m.delete()}
								>
									<IconParkSolidDelete class="h-4 w-4" />
								</button>
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</main>

{#if isAddingNew || isEditing}
	<Modal
		show={true}
		title={isAddingNew ? m.add_new_team() : m.edit_team()}
		onClose={handleCancel}
		dismissible={false}
	>
		<TeamEdit
			team={selectedTeam || {}}
			players={data.players}
			teamPlayers={getTeamPlayers(selectedTeam?.id || '')}
			teamAliases={getTeamAliases(selectedTeam?.id || '')}
			onSave={handleSaveTeam}
			onCancel={handleCancel}
		/>
	</Modal>
{/if}

{#if isDeleting && teamToDelete}
	<Modal show={true} title={m.delete_team()} onClose={() => (isDeleting = false)}>
		<div class="flex flex-col gap-6">
			<div class="space-y-2">
				<p class="text-slate-300">
					{m.delete_team_confirmation()}
					<span class="font-bold text-white">{teamToDelete.name}</span>?
				</p>
				<p class="text-sm text-slate-400">
					{m.delete_team_confirmation_description()}
				</p>
			</div>
			<div class="flex justify-end gap-4">
				<button
					type="button"
					class="rounded-md border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-800"
					onclick={() => {
						isDeleting = false;
						teamToDelete = null;
					}}
				>
					{m.cancel()}
				</button>
				<button
					type="button"
					class="rounded-md bg-red-500 px-4 py-2 font-medium text-white hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900 focus:outline-none"
					onclick={() => teamToDelete && handleDeleteTeam(teamToDelete)}
				>
					{m.delete()}
				</button>
			</div>
		</div>
	</Modal>
{/if}
