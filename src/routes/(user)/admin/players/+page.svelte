<script lang="ts">
	import { players } from '$lib/data/players';
	import type { Player } from '$lib/data/players';
	import { goto } from '$app/navigation';
	import { m } from '$lib/paraglide/messages';

	import IconParkSolidEdit from '~icons/icon-park-solid/edit';
	import type { PageProps } from './$types';
	import { getLocale } from '$lib/paraglide/runtime';

	let searchQuery = $state('');
	let selectedPlayer: Player | null = $state(null);
	let isAddingNew = $state(false);
	let isEditing = $state(false);
	let errorMessage = $state('');
	let successMessage = $state('');
	let isImporting = $state(false);
	let newPlayer: Partial<Player> = $state({
		id: '',
		name: '',
		nationality: undefined,
		aliases: [],
		gameAccounts: []
	});

	let { data }: PageProps = $props();

	let filteredPlayers = $derived(
		Object.values(players).filter((player) => {
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
	);

	function handleAddPlayer() {
		isAddingNew = true;
		isEditing = false;
		selectedPlayer = null;
		newPlayer = {
			id: '',
			name: '',
			nationality: undefined,
			aliases: [],
			gameAccounts: []
		};
	}

	function handleEditPlayer(player: Player) {
		selectedPlayer = player;
		isEditing = true;
		isAddingNew = false;
		newPlayer = { ...player };
	}

	async function handleSavePlayer() {
		errorMessage = '';
		successMessage = '';

		const formData = new FormData();
		formData.append('id', newPlayer.id || '');
		formData.append('name', newPlayer.name || '');
		formData.append('nationality', newPlayer.nationality || '');
		formData.append('aliases', JSON.stringify(newPlayer.aliases || []));
		formData.append('gameAccounts', JSON.stringify(newPlayer.gameAccounts || []));

		try {
			const response = await fetch('?/create', {
				method: 'POST',
				body: formData
			});

			const result = await response.json();

			if (result.error) {
				errorMessage = result.error;
			} else {
				successMessage = m.player_saved_successfully();
				isAddingNew = false;
				isEditing = false;
				selectedPlayer = null;
				goto('/admin/players', { invalidateAll: true });
			}
		} catch (e) {
			errorMessage = 'Failed to save player';
			console.error('Error saving player:', e);
		}
	}

	async function handleUpdatePlayer() {
		errorMessage = '';
		successMessage = '';

		const formData = new FormData();
		formData.append('id', newPlayer.id || '');
		formData.append('name', newPlayer.name || '');
		formData.append('nationality', newPlayer.nationality || '');
		formData.append('aliases', JSON.stringify(newPlayer.aliases || []));
		formData.append('gameAccounts', JSON.stringify(newPlayer.gameAccounts || []));

		try {
			const response = await fetch('?/update', {
				method: 'POST',
				body: formData
			});

			const result = await response.json();

			if (result.error) {
				errorMessage = result.error;
			} else {
				successMessage = m.player_updated_successfully();
				isAddingNew = false;
				isEditing = false;
				selectedPlayer = null;
				goto('/admin/players', { invalidateAll: true });
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

	function addGameAccount() {
		if (!newPlayer.gameAccounts) {
			newPlayer.gameAccounts = [];
		}
		newPlayer.gameAccounts.push({
			accountId: 0,
			currentName: '',
			region: undefined
		});
	}

	function removeGameAccount(index: number) {
		newPlayer.gameAccounts?.splice(index, 1);
	}

	function addAlias() {
		if (!newPlayer.aliases) {
			newPlayer.aliases = [];
		}
		newPlayer.aliases.push('');
	}

	function removeAlias(index: number) {
		newPlayer.aliases?.splice(index, 1);
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
</script>

<main class="mx-auto max-w-screen-lg px-4">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-2xl font-bold">{m.admin_dashboard()}</h1>
		<div class="flex gap-2">
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
		<div class="mb-6 rounded-lg border border-slate-800 bg-slate-900/70 p-6 shadow-lg">
			<h2 class="mb-4 text-xl font-semibold text-white">
				{isAddingNew ? m.add_new_player() : m.edit_player()}
			</h2>
			<form
				onsubmit={(e) => {
					e.preventDefault();
					isAddingNew ? handleSavePlayer() : handleUpdatePlayer();
				}}
				class="space-y-4"
			>
				<div>
					<label class="block text-sm font-medium text-slate-300" for="playerId">ID</label>
					<input
						type="text"
						id="playerId"
						bind:value={newPlayer.id}
						class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
						placeholder={m.player_id()}
					/>
				</div>
				<div>
					<label class="block text-sm font-medium text-slate-300" for="playerName">Name</label>
					<input
						type="text"
						id="playerName"
						bind:value={newPlayer.name}
						class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
						placeholder={m.display_name()}
					/>
				</div>
				<div>
					<label class="block text-sm font-medium text-slate-300" for="playerNationality">
						{m.nationality()}
					</label>
					<select
						id="playerNationality"
						bind:value={newPlayer.nationality}
						class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
					>
						<option value={undefined}>{m.select_nationality()}</option>
						{#each ['KR', 'JP', 'TW', 'US', 'VN', 'ID', 'CN'] as code}
							<option value={code}>
								{new Intl.DisplayNames([getLocale()], { type: 'region' }).of(code)}
							</option>
						{/each}
					</select>
					<div>
						<label class="block text-sm font-medium text-slate-300" for="aliases">Aliases</label>
						{#each newPlayer.aliases || [] as alias, i}
							<div class="mt-2 flex gap-2">
								<input
									type="text"
									id="aliases"
									bind:value={newPlayer.aliases![i]}
									class="block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
									placeholder={m.alias()}
								/>
								<button
									type="button"
									class="text-red-400 hover:text-red-300"
									onclick={() => removeAlias(i)}
								>
									{m.remove()}
								</button>
							</div>
						{/each}
						<button
							type="button"
							class="mt-2 text-yellow-500 hover:text-yellow-400"
							onclick={addAlias}
						>
							+ {m.add_alias()}
						</button>
					</div>

					<div>
						<label class="block text-sm font-medium text-slate-300" for="gameAccounts">
							{m.game_accounts()}
						</label>
						{#each newPlayer.gameAccounts || [] as account, i}
							<div class="mt-2 rounded-lg border border-slate-700 bg-slate-800 p-4">
								<div class="grid grid-cols-2 gap-4">
									<div>
										<label class="block text-sm font-medium text-slate-300" for="accountId">
											{m.account_id()}
										</label>
										<input
											type="number"
											id="accountId"
											bind:value={account.accountId}
											class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
										/>
									</div>
									<div>
										<label class="block text-sm font-medium text-slate-300" for="currentName">
											{m.current_name()}
										</label>
										<input
											type="text"
											id="currentName"
											bind:value={account.currentName}
											class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
										/>
									</div>
									<div>
										<label class="block text-sm font-medium text-slate-300" for="region">
											{m.region()}
										</label>
										<select
											id="region"
											bind:value={account.region}
											class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
										>
											<option value={undefined}>{m.select_region()}</option>
											<option value="NA">{m.north_america()}</option>
											<option value="APAC">{m.asia_pacific()}</option>
										</select>
									</div>
								</div>
								<button
									type="button"
									class="mt-2 text-red-400 hover:text-red-300"
									onclick={() => removeGameAccount(i)}
								>
									{m.remove_account()}
								</button>
							</div>
						{/each}
						<button
							type="button"
							class="mt-2 text-yellow-500 hover:text-yellow-400"
							onclick={addGameAccount}
						>
							+ {m.add_game_account()}
						</button>
					</div>

					<div class="mt-6 flex justify-end gap-4">
						<button
							type="button"
							class="rounded-md border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-800"
							onclick={handleCancel}
						>
							{m.cancel()}
						</button>
						<button
							type="submit"
							class="rounded-md bg-yellow-500 px-4 py-2 font-medium text-black hover:bg-yellow-600"
						>
							{isAddingNew ? m.create_player() : m.update_player()}
						</button>
					</div>
				</div>
			</form>
		</div>
	{/if}

	<div class="mb-4">
		<input
			type="text"
			bind:value={searchQuery}
			placeholder={m.search_players()}
			class="w-full rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
		/>
	</div>

	<div class="overflow-x-auto">
		<table class="w-full table-auto border-collapse border-y-2 border-gray-500 bg-gray-800">
			<thead>
				<tr class="border-b-2 border-gray-500 text-left text-sm text-gray-400">
					<th class="px-4 py-1">{m.player_id()}</th>
					<th class="px-4 py-1">{m.player_name()}</th>
					<th class="px-4 py-1">{m.nationality()}</th>
					<th class="px-4 py-1">{m.game_accounts()}</th>
					<th class="px-4 py-1">{m.actions()}</th>
				</tr>
			</thead>
			<tbody>
				{#each filteredPlayers as player}
					<tr class="border-b-1 border-gray-500 bg-gray-800 px-4 py-2 shadow-2xl">
						<td class="px-4 py-1 text-white">{player.id}</td>
						<td class="px-4 py-1 text-white">{player.name}</td>
						<td class="px-4 py-1 text-gray-300">{player.nationality || '-'}</td>
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
						<td class="px-4 py-1">
							<button
								class="flex items-center gap-1 text-yellow-500 hover:text-yellow-400"
								onclick={() => handleEditPlayer(player)}
							>
								<IconParkSolidEdit class="h-4 w-4" />
								{m.edit()}
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</main>
