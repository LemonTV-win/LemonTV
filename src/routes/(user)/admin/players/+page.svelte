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

	import IconParkSolidFilter from '~icons/icon-park-solid/filter';

	import SocialLinks from '$lib/components/SocialLinks.svelte';
	import NationalityFlag from '$lib/components/NationalityFlag.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import EditHistory from '../EditHistory.svelte';
	import PlayerEdit from './PlayerEdit.svelte';
	import PlayerBatchImport from './PlayerBatchImport.svelte';

	import type { PageProps } from './$types';
	import { countryCodeToLocalizedName } from '$lib/utils/strings';
	import { getLocale } from '$lib/paraglide/runtime';
	import ContentActionLink from '$lib/components/ContentActionLink.svelte';

	let { data }: PageProps = $props();

	let searchQuery = $state(data.searchQuery || '');
	let selectedPlayer: Player | null = $state(null);
	let isAddingNew = $state(false);
	let isEditing = $state(false);
	let errorMessage = $state('');
	let successMessage = $state('');
	let isDeleting = $state(false);
	let playerToDelete: Player | null = $state(null);
	let selectedNationalities = $state<string[]>([]);
	let filtersExpanded = $state(false);
	let selectedTeam = $state('');
	let isTeamComboboxOpen = $state(false);
	let teamInputRect = $state<DOMRect | null>(null);
	let showBatchImportModal = $state(false);
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

	$effect(() => {
		const url = new URL(window.location.href);
		if (searchQuery) {
			url.searchParams.set('searchQuery', searchQuery);
		} else {
			url.searchParams.delete('searchQuery');
		}
		goto(url.toString(), { replaceState: true, noScroll: true, keepFocus: true });
	});

	// Handle URL parameters
	$effect(() => {
		if (data.action === 'new') {
			handleAddPlayer();
		} else if (data.action === 'edit' && data.id) {
			const playerToEdit = data.players.find((p) => p.id === data.id);
			if (playerToEdit) {
				handleEditPlayer(playerToEdit);
			}
		}
	});

	let topCountries = $derived(
		Object.entries(
			data.players
				.map((player) => player.nationalities[0])
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
				const matchesSearch =
					player.name.toLowerCase().includes(searchLower) ||
					player.id.toLowerCase().includes(searchLower) ||
					player.aliases?.some((alias) => alias.toLowerCase().includes(searchLower)) ||
					player.gameAccounts?.some(
						(account) =>
							account.currentName.toLowerCase().includes(searchLower) ||
							account.accountId.toString().toLowerCase().includes(searchLower)
					);

				const matchesNationality =
					selectedNationalities.length === 0 ||
					player.nationalities.some((nationality) => selectedNationalities.includes(nationality));
				const matchesTeam =
					!selectedTeam ||
					data.playersTeams[player.id ?? '']?.some((team) => team.name === selectedTeam);

				return matchesSearch && matchesNationality && matchesTeam;
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
					return (a.nationalities[0] ?? '').localeCompare(b.nationalities[0] ?? '');
				} else if (sortBy === 'nationality-desc') {
					return (b.nationalities[0] ?? '').localeCompare(a.nationalities[0] ?? '');
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

	let showHistoryModal = $state(false);

	// Get unique nationalities for filter options
	let uniqueNationalities = $derived([
		...new Set(data.players.map((p) => p.nationalities[0]).filter(Boolean))
	]);

	// Get unique teams for combobox
	let uniqueTeams = $derived([
		...new Set(
			Object.values(data.playersTeams)
				.flat()
				.map((team) => team.name)
		)
	]);

	let filteredTeams = $derived(
		uniqueTeams.filter((team) => team.toLowerCase().includes(selectedTeam.toLowerCase()))
	);

	function closeHistoryModal() {
		showHistoryModal = false;
		selectedPlayer = null;
	}

	function handleAddPlayer() {
		isAddingNew = true;
		isEditing = false;
		selectedPlayer = null;
		goto('/admin/players?action=new', { replaceState: true, noScroll: true, keepFocus: true });
	}

	function handleEditPlayer(player: Player) {
		selectedPlayer = player;
		isEditing = true;
		isAddingNew = false;
		goto(`/admin/players?action=edit&id=${player.id}`, {
			replaceState: true,
			noScroll: true,
			keepFocus: true
		});
	}

	function handleCancel() {
		isAddingNew = false;
		isEditing = false;
		selectedPlayer = null;
		goto('/admin/players', { replaceState: true, noScroll: true, keepFocus: true });
	}

	function handleBatchImport() {
		showBatchImportModal = true;
	}

	function handleBatchImportClose() {
		showBatchImportModal = false;
	}

	function handleBatchImportSuccess(message: string) {
		successMessage = message;
		showBatchImportModal = false;
		goto('/admin/players', { invalidateAll: true, noScroll: true, keepFocus: true });
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
				goto('/admin/players', { invalidateAll: true, noScroll: true, keepFocus: true });
			}
		} catch (e) {
			errorMessage = m.failed_to_delete_player();
			console.error('Error deleting player:', e);
		}
	}
</script>

<svelte:head>
	<title>{m.players()} | {m.admin_panel()} | LemonTV</title>
</svelte:head>

<main class="mx-auto max-w-screen-lg px-4">
	<div class="mb-6 flex items-center justify-between">
		<div class="flex items-center gap-4">
			<h1 class="text-2xl font-bold">{m.players()}</h1>
			<ContentActionLink href="/players" type="view" />
		</div>
		<div class="flex gap-2">
			{#if data.user?.roles.includes('admin')}
				<button
					class="rounded-md bg-slate-700 px-4 py-2 font-medium text-white hover:bg-slate-600"
					onclick={handleBatchImport}
				>
					{m.import_json()}
				</button>
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
				users={data.users}
				onSuccess={() => {
					handleCancel();
					successMessage = isAddingNew
						? m.player_saved_successfully()
						: m.player_updated_successfully();
				}}
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
				<EditHistory recordType="player" record={selectedPlayer} />
			{/if}
		</Modal>
	{/if}

	{#if showBatchImportModal}
		<PlayerBatchImport
			showModal={true}
			onClose={handleBatchImportClose}
			onSuccess={handleBatchImportSuccess}
			existingPlayers={data.players.map((p) => ({
				id: p.id,
				name: p.name,
				slug: p.slug,
				gameAccounts: p.gameAccounts?.map((ga) => ({
					accountId: ga.accountId,
					server: ga.server
				}))
			}))}
		/>
	{/if}

	<div class="mb-4">
		<input
			type="text"
			bind:value={searchQuery}
			placeholder={m.search_players()}
			class="w-full rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
		/>
	</div>

	<div class="mb-4 flex flex-col">
		<button
			class="flex items-center justify-between rounded-t-lg border border-white/30 bg-gradient-to-br from-slate-600/60 to-slate-800 px-4 py-2 text-left text-sm font-medium text-gray-300 backdrop-blur-lg transition-colors hover:bg-white/10"
			onclick={() => (filtersExpanded = !filtersExpanded)}
		>
			<span>{m.filters()}</span>
			<IconParkSolidFilter
				class="h-4 w-4 transition-transform duration-200 {filtersExpanded ? 'rotate-180' : ''}"
			/>
		</button>
		<div
			class="grid transition-all duration-200"
			class:grid-rows-[1fr]={filtersExpanded}
			class:grid-rows-[0fr]={!filtersExpanded}
		>
			<div class="overflow-hidden">
				<div
					class="flex flex-col gap-4 rounded-b-lg border border-t-0 border-white/30 bg-gradient-to-br from-slate-600/60 to-slate-800 p-4 shadow-2xl ring-1 ring-white/30 backdrop-blur-lg"
				>
					<div class="flex flex-col gap-2">
						<label for="nationality-filters" class="text-sm font-medium text-gray-300"
							>{m.region()}</label
						>
						<div id="nationality-filters" class="flex flex-wrap gap-2">
							{#each uniqueNationalities as nationality, idx (idx)}
								{#if nationality}
									<button
										class={[
											'flex items-center gap-1 rounded-full border-1 px-2 py-1 text-sm transition-colors',
											selectedNationalities.includes(nationality)
												? 'border-blue-500 bg-blue-500 text-white'
												: 'border-white/30 bg-transparent text-gray-400'
										]}
										onclick={() => {
											selectedNationalities = selectedNationalities.includes(nationality)
												? selectedNationalities.filter((n) => n !== nationality)
												: [...selectedNationalities, nationality];
										}}
									>
										<NationalityFlag {nationality} />
										<span
											class:text-white={selectedNationalities.includes(nationality)}
											class:text-gray-400={!selectedNationalities.includes(nationality)}
										>
											{countryCodeToLocalizedName(nationality, getLocale())}
										</span>
									</button>
								{/if}
							{/each}
						</div>
					</div>

					<div class="flex flex-col gap-2">
						<label for="team-filter" class="text-sm font-medium text-gray-300">{m.teams()}</label>
						<div class="relative">
							<input
								type="text"
								id="team-filter"
								bind:value={selectedTeam}
								onfocus={(e) => {
									isTeamComboboxOpen = true;
									teamInputRect = e.currentTarget.getBoundingClientRect();
								}}
								onblur={() => setTimeout(() => (isTeamComboboxOpen = false), 200)}
								placeholder={m.search()}
								class="w-full rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	{#if isTeamComboboxOpen && filteredTeams.length > 0 && teamInputRect}
		<div
			class="fixed z-50 overflow-auto rounded-md border border-slate-700 bg-slate-800 py-1 shadow-lg"
			style="
				top: {teamInputRect.bottom + window.scrollY}px;
				left: {teamInputRect.left + window.scrollX}px;
				width: {teamInputRect.width}px;
				max-height: 240px;
			"
		>
			{#each filteredTeams as team (team)}
				<button
					class="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-slate-700"
					onmousedown={() => {
						selectedTeam = team;
						isTeamComboboxOpen = false;
					}}
				>
					{team}
				</button>
			{/each}
		</div>
	{/if}

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
					<th class="px-4 py-1">{m.user_id()}</th>
					<th class="sticky right-0 z-10 h-12 bg-gray-800 px-4 py-1">{m.actions()}</th>
				</tr>
			</thead>
			<tbody>
				{#each filteredPlayers as player (player.id)}
					<tr class="border-b-1 border-gray-500 bg-gray-800 px-4 py-2 shadow-2xl">
						<td
							class="max-w-16 truncate px-4 py-1 font-mono text-xs text-gray-300"
							title={player.id}
						>
							{player.id}
						</td>
						<td class="max-w-32 truncate px-4 py-1 text-white">
							<a href={`/players/${player.slug}`} class="hover:text-yellow-400" title={player.slug}>
								{player.slug}
							</a>
						</td>
						<td class="px-4 py-1 text-white">
							{player.name}
							{#if player.aliases?.length}
								<div
									class="flex flex-col text-sm whitespace-nowrap text-gray-400"
									title={m.aliases()}
								>
									{#each player.aliases as alias (alias)}
										<span>{alias}</span>
									{/each}
								</div>
							{/if}
						</td>
						<td class="max-w-6 px-4 py-1 text-gray-300">
							{#each player.nationalities as nationality, idx (idx)}
								<NationalityFlag {nationality} />
							{/each}
						</td>
						<td class="px-4 py-1 text-gray-300">
							{#if player.gameAccounts?.length}
								<ul>
									{#each player.gameAccounts as account (account.accountId)}
										<li class="break-keep whitespace-nowrap">
											<span class="text-xs text-gray-400">{account.accountId}</span>
											{account.currentName}
											{#if account.region}
												<span class="text-xs text-gray-400">({account.region})</span>
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
								<ul>
									{#each data.playersTeams[player.id ?? ''] as team (team.id)}
										<li class="break-keep whitespace-nowrap">
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
						<td class="px-4 py-1 text-gray-300">
							{#if player.user}
								<div class="flex flex-col">
									<span class="text-xs text-gray-400">{player.user.id}</span>
									<span>{player.user.username}</span>
								</div>
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
