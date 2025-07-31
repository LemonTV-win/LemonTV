<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Team, TeamPlayer, TeamAlias } from '$lib/server/db/schema';
	import type { Player } from '$lib/server/db/schema';
	import { m } from '$lib/paraglide/messages';
	import IconParkSolidAdd from '~icons/icon-park-solid/add';
	import IconParkSolidDelete from '~icons/icon-park-solid/delete';
	import ImageUpload from '$lib/components/ImageUpload.svelte';
	import PlayerInput from '$lib/components/forms/PlayerInput.svelte';
	import { formatSlug } from '$lib/utils/strings';

	let {
		team,
		players,
		teamPlayers,
		teamAliases,
		onCancel
	}: {
		team: Partial<Team>;
		players: Player[];
		teamPlayers: TeamPlayer[];
		teamAliases: TeamAlias[];
		onCancel: () => void;
	} = $props();

	let newTeam = $state<Team>(team);
	let errorMessage = $state('');
	let successMessage = $state('');
	let lastTeamName = $state(team.name || '');

	$effect(() => {
		// Only update slug if:
		// 1. Team name has changed AND
		// 2. No slug exists yet
		if (newTeam.name && newTeam.name !== lastTeamName) {
			if (!newTeam.slug) {
				newTeam.slug = formatSlug(newTeam.name);
			}
			lastTeamName = newTeam.name;
		}
	});

	let aliases = $state<string[]>(teamAliases.map((a: TeamAlias) => a.alias));
	let selectedPlayers = $state<
		{
			playerId: string;
			role: string;
			startedOn?: string;
			endedOn?: string;
			note?: string;
		}[]
	>(
		teamPlayers.map((tp: TeamPlayer) => ({
			playerId: tp.playerId,
			role: tp.role,
			startedOn: tp.startedOn || undefined,
			endedOn: tp.endedOn || undefined,
			note: tp.note || undefined
		}))
	);

	let newAlias = $state('');

	function addAlias() {
		if (newAlias && !aliases.includes(newAlias)) {
			aliases = [...aliases, newAlias];
			newAlias = '';
		}
	}

	function removeAlias(alias: string) {
		aliases = aliases.filter((a) => a !== alias);
	}
</script>

<form
	method="POST"
	action={team.id ? '?/update' : '?/create'}
	use:enhance={({ formData }) => {
		// Add aliases data
		formData.append('aliases', JSON.stringify(aliases));
		// Add players data
		formData.append('players', JSON.stringify(selectedPlayers));

		console.log('[Admin][Teams][TeamEdit] Form data:', [...formData.entries()]);

		return async ({ result }) => {
			if (result.type === 'success') {
				onCancel();
			} else if (result.type === 'failure') {
				errorMessage =
					(result as { type: 'failure'; data?: { error?: string } }).data?.error ??
					'An error occurred';
			} else if (result.type === 'error') {
				errorMessage =
					(result as { type: 'error'; error: { message: string } }).error?.message ??
					'An error occurred';
			}
		};
	}}
	class="flex h-full flex-col"
>
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

	<div
		class="flex-1 space-y-4 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb:hover]:bg-slate-500 [&::-webkit-scrollbar-track]:bg-slate-800"
	>
		{#if team.id}
			<div>
				<label class="block text-sm font-medium text-slate-300" for="eventId">ID</label>
				<input
					type="text"
					id="teamId"
					name="id"
					value={team.id}
					readonly
					class="block w-full rounded-md border border-slate-700 bg-slate-800/50 px-3 py-2 text-slate-400 placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none [&:read-only]:cursor-default [&:read-only]:opacity-75 [&:read-only]:select-none"
				/>
			</div>
		{/if}
		<div class="grid grid-cols-2 gap-4">
			<div>
				<label for="teamName" class="block text-sm font-medium text-slate-300">
					{m.team_name()}
				</label>
				<input
					type="text"
					id="teamName"
					name="name"
					bind:value={newTeam.name}
					class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
					placeholder={m.team_name()}
					required
				/>
			</div>
			<div>
				<label for="teamRegion" class="block text-sm font-medium text-slate-300">
					{m.region()}
				</label>
				<select
					id="teamRegion"
					name="region"
					bind:value={newTeam.region}
					class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
				>
					<option value="">{m.select_region()}</option>
					{#each Object.entries( { NA: m.north_america(), EU: m.europe(), APAC: m.asia_pacific(), CN: m.china() } ) as [region, label] (region)}
						<option value={region}>{label}</option>
					{/each}
				</select>
			</div>
			<div>
				<label for="teamSlug" class="block text-sm font-medium text-slate-300">
					{m.slug()}
				</label>
				<input
					type="text"
					id="teamSlug"
					name="slug"
					bind:value={newTeam.slug}
					class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
					placeholder={m.slug()}
				/>
			</div>
			<div>
				<label for="teamAbbr" class="block text-sm font-medium text-slate-300">
					{m.abbr()}
				</label>
				<input
					type="text"
					id="teamAbbr"
					name="abbr"
					bind:value={newTeam.abbr}
					class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
					placeholder={m.abbr()}
				/>
			</div>
		</div>

		<div>
			<label for="teamLogo" class="block text-sm font-medium text-slate-300">
				{m.logo()}
			</label>
			<ImageUpload bind:value={newTeam.logo} prefix="teams" />
			<input type="hidden" name="logo" value={newTeam.logo} />
		</div>

		<div>
			<div class="flex items-center justify-between">
				<label for="aliases-section" class="block text-sm font-medium text-slate-300"
					>{m.aliases()}</label
				>
			</div>
			<div id="aliases-section" class="mt-2 rounded-lg border border-slate-700 bg-slate-800 p-4">
				<!-- <input type="hidden" id="aliases" name="aliases" value={aliases} /> -->
				{#each aliases as alias, i (i)}
					<div
						class="grid grid-cols-[1fr_auto] gap-4 {i > 0
							? 'mt-4 border-t border-slate-700 pt-4'
							: ''}"
					>
						<div>
							<label class="block text-sm font-medium text-slate-300" for="alias-{i}">
								{m.alias()}
							</label>
							<input
								type="text"
								id="alias-{i}"
								value={alias}
								oninput={(e) => (aliases[i] = e.currentTarget.value)}
								class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
								placeholder={m.alias()}
							/>
						</div>
						<div class="flex items-center">
							<button
								type="button"
								class="mt-[1.625rem] text-red-400 hover:text-red-300"
								onclick={() => removeAlias(alias)}
								title={m.remove()}
							>
								<IconParkSolidDelete class="h-5 w-5" />
							</button>
						</div>
					</div>
				{/each}
				{#if aliases.length > 0}
					<div class="my-4 border-t border-slate-700"></div>
				{/if}
				<div class="flex items-center gap-2">
					<input
						type="text"
						bind:value={newAlias}
						class="block w-full rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
						placeholder={m.add_alias()}
					/>
					<button
						type="button"
						onclick={addAlias}
						class="inline-flex items-center rounded-md bg-yellow-500 px-3 py-2 text-sm font-medium text-black hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-slate-900 focus:outline-none"
					>
						<IconParkSolidAdd class="h-4 w-4" />
					</button>
				</div>
			</div>
		</div>

		<div>
			<div class="flex items-center justify-between">
				<label for="players-section" class="block text-sm font-medium text-slate-300"
					>{m.players()}</label
				>
			</div>
			<div id="players-section" class="mt-2 rounded-lg border border-slate-700 bg-slate-800 p-4">
				<PlayerInput {players} bind:selectedPlayers />
			</div>
		</div>
	</div>

	<div class="mt-6 flex justify-end gap-4 border-t border-slate-700 pt-4">
		<button
			type="button"
			class="rounded-md border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-800"
			onclick={onCancel}
		>
			{m.cancel()}
		</button>
		<button
			type="submit"
			class="rounded-md bg-yellow-500 px-4 py-2 font-medium text-black hover:bg-yellow-600"
		>
			{newTeam.id ? m.update_team() : m.create_team()}
		</button>
	</div>
</form>
