<script lang="ts">
	import type { Team, TeamPlayer, TeamAlias } from '$lib/server/db/schema';
	import type { Player } from '$lib/server/db/schema';
	import { m } from '$lib/paraglide/messages';
	import IconParkSolidAdd from '~icons/icon-park-solid/add';
	import IconParkSolidDelete from '~icons/icon-park-solid/delete';

	let { team, players, teamPlayers, teamAliases, onSave, onCancel } = $props<{
		team: Partial<Team>;
		players: Player[];
		teamPlayers: TeamPlayer[];
		teamAliases: TeamAlias[];
		onSave: (team: Partial<Team> & { aliases?: string[]; players?: any[] }) => void;
		onCancel: () => void;
	}>();

	let newTeam = $state<Team>(team);

	function formatSlug(name: string): string {
		return name
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '');
	}

	$effect(() => {
		if (newTeam.name) {
			newTeam.slug = formatSlug(newTeam.name);
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

	function addAlias() {
		if (newAlias && !aliases.includes(newAlias)) {
			aliases = [...aliases, newAlias];
			newAlias = '';
		}
	}

	function removeAlias(alias: string) {
		aliases = aliases.filter((a) => a !== alias);
	}

	function addPlayer() {
		if (
			newPlayer.playerId &&
			!selectedPlayers.some((p: { playerId: string }) => p.playerId === newPlayer.playerId)
		) {
			selectedPlayers = [...selectedPlayers, { ...newPlayer }];
			newPlayer = {
				playerId: '',
				role: 'active'
			};
		}
	}

	function removePlayer(playerId: string) {
		selectedPlayers = selectedPlayers.filter((p: { playerId: string }) => p.playerId !== playerId);
	}

	function handleSubmit() {
		onSave({
			...newTeam,
			aliases,
			players: selectedPlayers
		});
	}
</script>

<form onsubmit={handleSubmit} class="flex h-full flex-col">
	<div
		class="flex-1 space-y-4 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb:hover]:bg-slate-500 [&::-webkit-scrollbar-track]:bg-slate-800"
	>
		<div class="grid grid-cols-2 gap-4">
			<div>
				<label for="teamName" class="block text-sm font-medium text-slate-300">
					{m.team_name()}
				</label>
				<input
					type="text"
					id="teamName"
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
					bind:value={newTeam.region}
					class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
				>
					<option value="">{m.select_region()}</option>
					{#each Object.entries( { NA: m.north_america(), EU: m.europe(), APAC: m.asia_pacific(), CN: m.china() } ) as [region, label]}
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
					bind:value={newTeam.abbr}
					class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
					placeholder={m.abbr()}
				/>
			</div>
		</div>

		<div>
			<label for="teamLogo" class="block text-sm font-medium text-slate-300">
				{m.logo_url()}
			</label>
			<input
				type="text"
				id="teamLogo"
				bind:value={newTeam.logo}
				class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
				placeholder={m.logo_url()}
			/>
		</div>

		<div>
			<div class="flex items-center justify-between">
				<label for="aliases-section" class="block text-sm font-medium text-slate-300"
					>{m.aliases()}</label
				>
			</div>
			<div id="aliases-section" class="mt-2 rounded-lg border border-slate-700 bg-slate-800 p-4">
				{#each aliases as alias, i}
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
				<div class="grid grid-cols-5 gap-4">
					<div>
						<label for="playerSelect" class="block text-sm font-medium text-slate-300">
							{m.player()}
						</label>
						<select
							id="playerSelect"
							bind:value={newPlayer.playerId}
							class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
						>
							<option value="">{m.select_player()}</option>
							{#each players as player}
								<option value={player.id}>{player.name}</option>
							{/each}
						</select>
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
					<div>
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
					<div>
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
					<div class="flex items-end">
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
									{players.find((p: Player) => p.id === player.playerId)?.name}
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
