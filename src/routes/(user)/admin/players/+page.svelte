<script lang="ts">
	import { players } from '$lib/data/players';
	import type { Player } from '$lib/data/players';
	import { goto } from '$app/navigation';
	import { m } from '$lib/paraglide/messages';

	import IconParkSolidEdit from '~icons/icon-park-solid/edit';

	let searchQuery = '';
	let selectedPlayer: Player | null = null;
	let isAddingNew = false;
	let isEditing = false;
	let errorMessage = '';
	let successMessage = '';
	let newPlayer: Partial<Player> = {
		id: '',
		name: '',
		nationality: undefined,
		aliases: [],
		gameAccounts: []
	};

	$: filteredPlayers = Object.values(players).filter((player) => {
		const searchLower = searchQuery.toLowerCase();
		return (
			player.name.toLowerCase().includes(searchLower) ||
			player.id.toLowerCase().includes(searchLower) ||
			player.aliases?.some((alias) => alias.toLowerCase().includes(searchLower)) ||
			player.gameAccounts?.some((account) =>
				account.currentName.toLowerCase().includes(searchLower)
			)
		);
	});

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
				successMessage = 'Player saved successfully';
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
				successMessage = 'Player updated successfully';
				isAddingNew = false;
				isEditing = false;
				selectedPlayer = null;
				goto('/admin/players', { invalidateAll: true });
			}
		} catch (e) {
			errorMessage = 'Failed to update player';
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
</script>

<main class="mx-auto max-w-screen-lg px-4">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-2xl font-bold">{m.admin_dashboard()}</h1>
		<button
			class="rounded-md bg-yellow-500 px-4 py-2 font-medium text-black hover:bg-yellow-600"
			on:click={handleAddPlayer}
		>
			Add New Player
		</button>
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
				{isAddingNew ? 'Add New Player' : 'Edit Player'}
			</h2>
			<form
				on:submit|preventDefault={isAddingNew ? handleSavePlayer : handleUpdatePlayer}
				class="space-y-4"
			>
				<div>
					<label class="block text-sm font-medium text-slate-300" for="playerId">ID</label>
					<input
						type="text"
						id="playerId"
						bind:value={newPlayer.id}
						class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
						placeholder="Player ID"
					/>
				</div>
				<div>
					<label class="block text-sm font-medium text-slate-300" for="playerName">Name</label>
					<input
						type="text"
						id="playerName"
						bind:value={newPlayer.name}
						class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
						placeholder="Display Name"
					/>
				</div>
				<div>
					<label class="block text-sm font-medium text-slate-300" for="playerNationality">
						Nationality
					</label>
					<select
						id="playerNationality"
						bind:value={newPlayer.nationality}
						class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
					>
						<option value={undefined}>Select Nationality</option>
						<option value="KR">Korea</option>
						<option value="JP">Japan</option>
						<option value="TW">Taiwan</option>
						<option value="US">United States</option>
						<option value="VN">Vietnam</option>
						<option value="ID">Indonesia</option>
						<option value="CN">China</option>
					</select>
				</div>

				<div>
					<label class="block text-sm font-medium text-slate-300" for="aliases">Aliases</label>
					{#each newPlayer.aliases || [] as alias, i}
						<div class="mt-2 flex gap-2">
							<input
								type="text"
								id="aliases"
								bind:value={newPlayer.aliases![i]}
								class="block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
								placeholder="Alias"
							/>
							<button
								type="button"
								class="text-red-400 hover:text-red-300"
								on:click={() => removeAlias(i)}
							>
								Remove
							</button>
						</div>
					{/each}
					<button
						type="button"
						class="mt-2 text-yellow-500 hover:text-yellow-400"
						on:click={addAlias}
					>
						+ Add Alias
					</button>
				</div>

				<div>
					<label class="block text-sm font-medium text-slate-300" for="gameAccounts">
						Game Accounts
					</label>
					{#each newPlayer.gameAccounts || [] as account, i}
						<div class="mt-2 rounded-lg border border-slate-700 bg-slate-800 p-4">
							<div class="grid grid-cols-2 gap-4">
								<div>
									<label class="block text-sm font-medium text-slate-300" for="accountId">
										Account ID
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
										Current Name
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
										Region
									</label>
									<select
										id="region"
										bind:value={account.region}
										class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
									>
										<option value={undefined}>Select Region</option>
										<option value="NA">North America</option>
										<option value="APAC">Asia Pacific</option>
									</select>
								</div>
							</div>
							<button
								type="button"
								class="mt-2 text-red-400 hover:text-red-300"
								on:click={() => removeGameAccount(i)}
							>
								Remove Account
							</button>
						</div>
					{/each}
					<button
						type="button"
						class="mt-2 text-yellow-500 hover:text-yellow-400"
						on:click={addGameAccount}
					>
						+ Add Game Account
					</button>
				</div>

				<div class="mt-6 flex justify-end gap-4">
					<button
						type="button"
						class="rounded-md border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-800"
						on:click={handleCancel}
					>
						Cancel
					</button>
					<button
						type="submit"
						class="rounded-md bg-yellow-500 px-4 py-2 font-medium text-black hover:bg-yellow-600"
					>
						{isAddingNew ? 'Create' : 'Update'}
					</button>
				</div>
			</form>
		</div>
	{/if}

	<div class="mb-4">
		<input
			type="text"
			bind:value={searchQuery}
			placeholder="Search players..."
			class="w-full rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
		/>
	</div>

	<div class="overflow-x-auto">
		<table class="w-full table-auto border-collapse border-y-2 border-gray-500 bg-gray-800">
			<thead>
				<tr class="border-b-2 border-gray-500 text-left text-sm text-gray-400">
					<th class="px-4 py-1">ID</th>
					<th class="px-4 py-1">Name</th>
					<th class="px-4 py-1">Nationality</th>
					<th class="px-4 py-1">Game Accounts</th>
					<th class="px-4 py-1">Actions</th>
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
								on:click={() => handleEditPlayer(player)}
							>
								<IconParkSolidEdit class="h-4 w-4" /> Edit
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</main>
