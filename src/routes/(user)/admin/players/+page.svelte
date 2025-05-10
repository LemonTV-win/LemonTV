<script lang="ts">
	import type { Player } from '$lib/data/players';
	import { goto } from '$app/navigation';
	import { m } from '$lib/paraglide/messages';

	import IconParkSolidEdit from '~icons/icon-park-solid/edit';
	import IconParkSolidDelete from '~icons/icon-park-solid/delete';
	import IconParkSolidHistory from '~icons/icon-park-solid/history-query';
	import TypcnArrowUnsorted from '~icons/typcn/arrow-unsorted';
	import TypcnArrowSortedDown from '~icons/typcn/arrow-sorted-down';
	import TypcnArrowSortedUp from '~icons/typcn/arrow-sorted-up';

	import SocialLinks from '$lib/components/SocialLinks.svelte';
	import NationalityFlag from '$lib/components/NationalityFlag.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import EditHistory from './EditHistory.svelte';
	import PlayerEdit from './PlayerEdit.svelte';

	import type { PageProps } from './$types';
	import { countries } from 'countries-list';

	let searchQuery = $state('');
	let selectedPlayer: Player | null = $state(null);
	let isAddingNew = $state(false);
	let isEditing = $state(false);
	let errorMessage = $state('');
	let successMessage = $state('');
	let isImporting = $state(false);
	let isDeleting = $state(false);
	let playerToDelete: Player | null = $state(null);
	let sortBy:
		| 'id-asc'
		| 'id-desc'
		| 'name-asc'
		| 'name-desc'
		| 'nationality-asc'
		| 'nationality-desc'
		| 'slug-asc'
		| 'slug-desc'
		| 'gameAccount-asc'
		| 'gameAccount-desc' = $state('name-asc');
	let newPlayer: Partial<Player> = $state({
		name: '',
		nationality: undefined,
		aliases: [],
		gameAccounts: [],
		socialAccounts: []
	});

	let { data }: PageProps = $props();

	// Handle editId from URL
	$effect(() => {
		if (data.editId) {
			const playerToEdit = data.players.find((p) => p.id === data.editId);
			if (playerToEdit) {
				handleEditPlayer(playerToEdit);
			}
		}
	});

	let topCountries = $derived(
		Object.entries(
			data.players
				.map((player) => player.nationality)
				.reduce(
					(acc, country) => {
						if (country) {
							acc[country] = (acc[country] || 0) + 1;
						}
						return acc;
					},
					{} as Record<string, number>
				)
		)
			.toSorted((a, b) => b[1] - a[1])
			.slice(0, 10)
	);

	let filteredPlayers = $derived(
		data.players
			.filter((player) => {
				const searchLower = searchQuery.toLowerCase();
				return (
					player.name.toLowerCase().includes(searchLower) ||
					player.id.toLowerCase().includes(searchLower) ||
					player.aliases?.some((alias) => alias.toLowerCase().includes(searchLower)) ||
					player.gameAccounts?.some((account) =>
						account.currentName.toLowerCase().includes(searchLower)
					)
				);
			})
			.toSorted((a, b) => {
				if (sortBy === 'id-asc') {
					return a.id.localeCompare(b.id);
				} else if (sortBy === 'id-desc') {
					return b.id.localeCompare(a.id);
				} else if (sortBy === 'name-asc') {
					return a.name.localeCompare(b.name);
				} else if (sortBy === 'name-desc') {
					return b.name.localeCompare(a.name);
				} else if (sortBy === 'nationality-asc') {
					return (a.nationality ?? '').localeCompare(b.nationality ?? '');
				} else if (sortBy === 'nationality-desc') {
					return (b.nationality ?? '').localeCompare(a.nationality ?? '');
				} else if (sortBy === 'slug-asc') {
					return (a.slug ?? a.id).localeCompare(b.slug ?? b.id);
				} else if (sortBy === 'slug-desc') {
					return (b.slug ?? b.id).localeCompare(a.slug ?? a.id);
				} else if (sortBy === 'gameAccount-asc') {
					const aAccountId = a.gameAccounts?.[0]?.accountId ?? '';
					const bAccountId = b.gameAccounts?.[0]?.accountId ?? '';
					return Number(aAccountId) - Number(bAccountId);
				} else if (sortBy === 'gameAccount-desc') {
					const aAccountId = a.gameAccounts?.[0]?.accountId ?? '';
					const bAccountId = b.gameAccounts?.[0]?.accountId ?? '';
					return Number(bAccountId) - Number(aAccountId);
				}
				return 0;
			})
	);

	let copySuccess = $state(false);

	let showHistoryModal = $state(false);

	function closeHistoryModal() {
		showHistoryModal = false;
		selectedPlayer = null;
	}

	function handleAddPlayer() {
		isAddingNew = true;
		isEditing = false;
		selectedPlayer = null;
	}

	function handleEditPlayer(player: Player) {
		selectedPlayer = player;
		isEditing = true;
		isAddingNew = false;
	}

	async function handleSavePlayer(player: Partial<Player>) {
		errorMessage = '';
		successMessage = '';

		const formData = new FormData();
		formData.append('id', player.id || '');
		formData.append('name', player.name || '');
		formData.append('nationality', player.nationality || '');
		formData.append('aliases', JSON.stringify(player.aliases || []));
		formData.append('gameAccounts', JSON.stringify(player.gameAccounts || []));
		formData.append('socialAccounts', JSON.stringify(player.socialAccounts || []));
		formData.append('slug', player.slug || '');

		try {
			const response = await fetch('?/create', {
				method: 'POST',
				body: formData
			});

			const result = await response.json();

			if (result.error) {
				errorMessage = result.error;
			} else {
				isAddingNew = false;
				isEditing = false;
				selectedPlayer = null;
				await goto('/admin/players', { invalidateAll: true });
				successMessage = m.player_saved_successfully();
			}
		} catch (e) {
			errorMessage = 'Failed to save player';
			console.error('Error saving player:', e);
		}
	}

	async function handleUpdatePlayer(player: Partial<Player>) {
		errorMessage = '';
		successMessage = '';

		const formData = new FormData();
		formData.append('id', player.id || '');
		formData.append('name', player.name || '');
		formData.append('nationality', player.nationality || '');
		formData.append('aliases', JSON.stringify(player.aliases || []));
		formData.append('gameAccounts', JSON.stringify(player.gameAccounts || []));
		formData.append('socialAccounts', JSON.stringify(player.socialAccounts || []));
		formData.append('slug', player.slug || '');

		try {
			const response = await fetch('?/update', {
				method: 'POST',
				body: formData
			});

			const result = await response.json();

			if (result.error) {
				errorMessage = result.error;
			} else {
				isAddingNew = false;
				isEditing = false;
				selectedPlayer = null;
				await goto('/admin/players', { invalidateAll: true });
				successMessage = m.player_updated_successfully();
			}
		} catch (e) {
			errorMessage = m.failed_to_update_player();
			console.error('Error updating player:', e);
		}
	}

	function handleCancel() {
		isAddingNew = false;
		isEditing = false;
		selectedPlayer = null;
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
				successMessage = result.message || m.player_imported_successfully();
				goto('/admin/players', { invalidateAll: true });
			}
		} catch (e) {
			errorMessage = m.failed_to_import_players();
			console.error('Error importing players:', e);
		} finally {
			isImporting = false;
		}
	}

	async function handleExport() {
		errorMessage = '';
		successMessage = '';

		try {
			const response = await fetch('/admin/players/export');
			const result = await response.json();

			if (result.error) {
				errorMessage = result.error;
			} else {
				// Create and download file
				const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
				const url = URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = 'players.json';
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				URL.revokeObjectURL(url);
			}
		} catch (e) {
			errorMessage = m.failed_to_export_players();
			console.error('Error exporting players:', e);
		}
	}

	async function handleDeletePlayer() {
		if (!playerToDelete) return;

		errorMessage = '';
		successMessage = '';

		try {
			const formData = new FormData();
			formData.append('id', playerToDelete.id);

			const response = await fetch('?/delete', {
				method: 'POST',
				body: formData
			});

			const result = await response.json();

			if (result.error) {
				errorMessage = result.error;
			} else {
				successMessage = m.player_deleted_successfully();
				playerToDelete = null;
				isDeleting = false;
				goto('/admin/players', { invalidateAll: true });
			}
		} catch (e) {
			errorMessage = m.failed_to_delete_player();
			console.error('Error deleting player:', e);
		}
	}
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
				onclick={handleAddPlayer}
			>
				{m.add_new_player()}
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

	{#if isAddingNew || isEditing}
		<Modal
			show={true}
			title={isAddingNew ? m.add_new_player() : m.edit_player()}
			onClose={handleCancel}
			dismissible={false}
		>
			<PlayerEdit
				player={selectedPlayer || {}}
				socialPlatforms={data.socialPlatforms}
				{topCountries}
				onSave={isAddingNew ? handleSavePlayer : handleUpdatePlayer}
				onCancel={handleCancel}
			/>
		</Modal>
	{/if}

	{#if isDeleting && playerToDelete}
		<Modal
			show={true}
			title={m.delete_player()}
			onClose={() => {
				isDeleting = false;
				playerToDelete = null;
			}}
		>
			<div class="flex flex-col gap-6">
				<div class="space-y-2">
					<p class="text-slate-300">
						{m.delete_player_confirmation()}
						<span class="font-bold text-white">{playerToDelete.name}</span>?
					</p>
					<p class="text-sm text-slate-400">
						{m.delete_player_confirmation_description()}
					</p>
				</div>
				<div class="flex justify-end gap-4">
					<button
						type="button"
						class="rounded-md border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-800"
						onclick={() => {
							isDeleting = false;
							playerToDelete = null;
						}}
					>
						{m.cancel()}
					</button>
					<button
						type="button"
						class="rounded-md bg-red-500 px-4 py-2 font-medium text-white hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900 focus:outline-none"
						onclick={handleDeletePlayer}
					>
						{m.delete()}
					</button>
				</div>
			</div>
		</Modal>
	{/if}

	{#if showHistoryModal}
		<Modal show={true} title="Edit History" onClose={closeHistoryModal}>
			{#if selectedPlayer}
				<EditHistory player={selectedPlayer} />
			{/if}
		</Modal>
	{/if}

	<div class="mb-4">
		<input
			type="text"
			bind:value={searchQuery}
			placeholder={m.search_players()}
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
							{m.player_id()}
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
							class:text-white={sortBy === 'slug-asc' || sortBy === 'slug-desc'}
							onclick={() => (sortBy = sortBy === 'slug-asc' ? 'slug-desc' : 'slug-asc')}
						>
							{m.slug()}
							{#if sortBy === 'slug-asc'}
								<TypcnArrowSortedUp class="inline-block" />
							{:else if sortBy === 'slug-desc'}
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
							{m.player_name()}
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
							class:text-white={sortBy === 'nationality-asc' || sortBy === 'nationality-desc'}
							onclick={() =>
								(sortBy = sortBy === 'nationality-asc' ? 'nationality-desc' : 'nationality-asc')}
						>
							{m.nationality()}
							{#if sortBy === 'nationality-asc'}
								<TypcnArrowSortedUp class="inline-block" />
							{:else if sortBy === 'nationality-desc'}
								<TypcnArrowSortedDown class="inline-block" />
							{:else}
								<TypcnArrowUnsorted class="inline-block" />
							{/if}
						</button>
					</th>
					<th class="px-4 py-1">
						<button
							class="flex items-center gap-1 text-left"
							class:text-white={sortBy === 'gameAccount-asc' || sortBy === 'gameAccount-desc'}
							onclick={() =>
								(sortBy = sortBy === 'gameAccount-asc' ? 'gameAccount-desc' : 'gameAccount-asc')}
						>
							{m.game_accounts()}
							{#if sortBy === 'gameAccount-asc'}
								<TypcnArrowSortedUp class="inline-block" />
							{:else if sortBy === 'gameAccount-desc'}
								<TypcnArrowSortedDown class="inline-block" />
							{:else}
								<TypcnArrowUnsorted class="inline-block" />
							{/if}
						</button>
					</th>
					<th class="px-4 py-1">{m.social_accounts()}</th>
					<th class="px-4 py-1">{m.teams()}</th>
					<th class="sticky right-0 z-10 h-12 bg-gray-800 px-4 py-1">{m.actions()}</th>
				</tr>
			</thead>
			<tbody>
				{#each filteredPlayers as player}
					<tr class="border-b-1 border-gray-500 bg-gray-800 px-4 py-2 shadow-2xl">
						<td
							class="max-w-32 truncate px-4 py-1 font-mono text-xs text-gray-300"
							title={player.id}
						>
							{player.id}
						</td>
						<td class="max-w-32 truncate px-4 py-1 text-white">
							<a href={`/players/${player.slug}`} class="hover:text-yellow-400" title={player.slug}>
								{player.slug}
							</a>
						</td>
						<td class="max-w-32 truncate px-4 py-1 text-white">{player.name}</td>
						<td class="px-4 py-1 text-gray-300">
							<NationalityFlag nationality={player.nationality} />
						</td>
						<td class="px-4 py-1 text-gray-300">
							{#if player.gameAccounts?.length}
								<ul class="list-inside list-disc">
									{#each player.gameAccounts as account}
										<li>
											<span class="text-sm text-gray-400">{account.accountId}</span>
											{account.currentName}
											{#if account.region}
												<span class="text-gray-400">({account.region})</span>
											{/if}
										</li>
									{/each}
								</ul>
							{:else}
								-
							{/if}
						</td>
						<td class="px-4 py-1 text-gray-300">
							{#if player.socialAccounts?.length}
								<SocialLinks
									socialAccounts={player.socialAccounts}
									socialPlatforms={data.socialPlatforms}
								/>
							{:else}
								-
							{/if}
						</td>
						<td class="px-4 py-1 text-gray-300">
							{#if data.playersTeams[player.id ?? '']?.length}
								<ul class="list-inside list-disc">
									{#each data.playersTeams[player.id ?? ''] as team}
										<li>
											<a href={`/teams/${team.slug}`} class="text-yellow-500 hover:text-yellow-400">
												{team.name}
											</a>
										</li>
									{/each}
								</ul>
							{:else}
								-
							{/if}
						</td>
						<td class="sticky right-0 z-10 h-12 bg-gray-800">
							<div class="flex h-full items-center gap-2 border-l border-gray-700 px-4 py-1">
								<button
									class="flex items-center gap-1 text-yellow-500 hover:text-yellow-400"
									onclick={() => handleEditPlayer(player)}
									title={m.edit()}
								>
									<IconParkSolidEdit class="h-4 w-4" />
								</button>
								<button
									type="button"
									class="text-gray-600 hover:text-gray-800"
									title="View edit history"
									onclick={() => {
										selectedPlayer = player;
										showHistoryModal = true;
									}}
								>
									<IconParkSolidHistory class="h-4 w-4" />
								</button>
								<button
									class="flex items-center gap-1 text-red-500 hover:text-red-400"
									onclick={() => {
										playerToDelete = player;
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
