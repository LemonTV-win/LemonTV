<script lang="ts">
	import type { Player } from '$lib/server/db/schema';
	import { m } from '$lib/paraglide/messages';
	import IconParkSolidAdd from '~icons/icon-park-solid/add';
	import IconParkSolidDelete from '~icons/icon-park-solid/delete';
	import Combobox from '$lib/components/Combobox.svelte';

	interface Props {
		players: Player[];
		selectedPlayers?: Array<{
			playerId: string;
			role: string;
			startedOn?: string;
			endedOn?: string;
			note?: string;
		}>;
	}

	let { players, selectedPlayers = $bindable([]) }: Props = $props();

	let newPlayer = $state<{
		playerId: string;
		role: string;
		startedOn?: string;
		endedOn?: string;
		note?: string;
	}>({
		playerId: '',
		role: 'active'
	});

	const roles = ['active', 'substitute', 'former', 'coach', 'manager', 'owner'];

	function addPlayer() {
		if (newPlayer.playerId && !selectedPlayers.some((p) => p.playerId === newPlayer.playerId)) {
			selectedPlayers = [...selectedPlayers, { ...newPlayer }];
			newPlayer = {
				playerId: '',
				role: 'active'
			};
		}
	}

	function removePlayer(playerId: string) {
		selectedPlayers = selectedPlayers.filter((p) => p.playerId !== playerId);
	}
</script>

<div class="space-y-4">
	<div class="grid grid-cols-[1fr_1fr_auto] gap-4">
		<div>
			<label for="playerSelect" class="block text-sm font-medium text-slate-300">
				{m.player()}
			</label>
			<div class="mt-1">
				<Combobox
					id="playerSelect"
					items={players.map((p) => ({
						id: p.id,
						name: p.name,
						group: selectedPlayers.some((sp) => sp.playerId === p.id) ? 'team' : 'other'
					}))}
					bind:value={newPlayer.playerId}
					placeholder={m.search_players()}
					groups={[
						{ id: 'team', label: m.team_players() },
						{ id: 'other', label: m.other_players() }
					]}
					class="mt-1 px-4 py-2"
				/>
			</div>
		</div>

		<div>
			<label for="roleSelect" class="block text-sm font-medium text-slate-300">
				{m.role()}
			</label>
			<select
				id="roleSelect"
				bind:value={newPlayer.role}
				class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
			>
				{#each roles as role}
					<option value={role}>{role}</option>
				{/each}
			</select>
		</div>

		<div class="col-start-1 row-start-2">
			<label for="startDate" class="block text-sm font-medium text-slate-300">
				{m.start_date()}
			</label>
			<input
				type="date"
				id="startDate"
				bind:value={newPlayer.startedOn}
				class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
			/>
		</div>

		<div class="col-start-2 row-start-2">
			<label for="endDate" class="block text-sm font-medium text-slate-300">
				{m.end_date()}
			</label>
			<input
				type="date"
				id="endDate"
				bind:value={newPlayer.endedOn}
				class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
			/>
		</div>

		<div class="col-start-3 row-start-2 flex items-end">
			<button
				type="button"
				onclick={addPlayer}
				class="inline-flex items-center rounded-md bg-yellow-500 px-3 py-2 text-sm font-medium text-black hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-slate-900 focus:outline-none"
			>
				<IconParkSolidAdd class="h-4 w-4" />
			</button>
		</div>
	</div>

	{#if selectedPlayers.length > 0}
		<div class="my-4 border-t border-slate-700"></div>
		<div class="space-y-2">
			{#each selectedPlayers as player}
				<div class="grid grid-cols-5 items-center gap-4">
					<span class="text-sm text-slate-300">
						{players.find((p) => p.id === player.playerId)?.name}
					</span>
					<span class="text-sm text-slate-300">{player.role}</span>
					<span class="text-sm text-slate-300">{player.startedOn}</span>
					<span class="text-sm text-slate-300">{player.endedOn}</span>
					<button
						type="button"
						onclick={() => removePlayer(player.playerId)}
						class="inline-flex items-center rounded-md bg-red-500/20 px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/30 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900 focus:outline-none"
					>
						<IconParkSolidDelete class="h-4 w-4" />
					</button>
				</div>
			{/each}
		</div>
	{/if}
</div>
