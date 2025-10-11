<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import IconParkSolidDelete from '~icons/icon-park-solid/delete';
	import IconParkSolidAdd from '~icons/icon-park-solid/add';
	import Combobox from '$lib/components/Combobox.svelte';
	import countryCodeToFlagEmoji from 'country-code-to-flag-emoji';
	import type { GameAccount } from '$lib/server/db/schema';
	import type { TCountryCode } from 'countries-list';

	type Caster = {
		playerId: string;
		role: 'host' | 'analyst' | 'commentator';
	};

	let {
		players,
		casters = $bindable([])
	}: {
		players: {
			id: string;
			name: string;
			slug: string;
			gameAccounts: Omit<GameAccount, 'playerId'>[];
			nationalities: TCountryCode[];
			aliases: string[];
		}[];
		casters: Caster[];
	} = $props();

	const roleOptions = [
		{ value: 'host', label: m.role_host() },
		{ value: 'analyst', label: m.role_analyst() },
		{ value: 'commentator', label: m.role_commentator() }
	] as const;

	function addCaster() {
		casters = [
			...casters,
			{
				playerId: '',
				role: 'commentator'
			}
		];
	}

	function removeCaster(index: number) {
		casters = casters.filter((_: Caster, i: number) => i !== index);
	}

	function updateCaster(index: number, field: 'playerId' | 'role', value: string) {
		casters = casters.map((c: Caster, i: number) => (i === index ? { ...c, [field]: value } : c));
	}

	// Helper function to check for duplicate players
	function getPlayerValidationStatus(playerId: string) {
		const entries = casters.filter((c: Caster) => c.playerId === playerId);

		if (entries.length > 1) {
			return {
				type: 'error',
				message: m.duplicate_caster()
			};
		}

		return null;
	}
</script>

<div class="flex flex-col gap-4">
	{#if casters.length === 0}
		<div class="rounded-md border border-dashed border-slate-700 p-4 text-center text-slate-400">
			{m.no_casters()}
		</div>
	{:else}
		{#each casters as caster, i (caster.playerId)}
			<div class="flex flex-col gap-2 rounded-lg border border-slate-700 bg-slate-800 p-4">
				<div class="flex items-center justify-between">
					<h4 class="text-lg font-medium text-slate-300">Caster {i + 1}</h4>
					<button
						type="button"
						onclick={() => removeCaster(i)}
						class="text-red-400 hover:text-red-300"
					>
						<IconParkSolidDelete class="h-5 w-5" />
					</button>
				</div>
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div class="flex flex-col gap-2">
						<label for={`caster-player-${i}`} class="text-sm font-medium text-slate-300"
							>Player</label
						>
						<Combobox
							id={`caster-player-${i}`}
							items={players.map((p) => ({
								...p,
								id: p.id,
								name: p.name,
								gameAccounts: p.gameAccounts || [],
								group: casters.some((c) => c.playerId === p.id) ? 'selected' : 'available',
								aliases: p.aliases,
								nationalities: p.nationalities
							}))}
							bind:value={caster.playerId}
							placeholder={m.search_players()}
							groups={[
								{ id: 'selected', label: 'Selected' },
								{ id: 'available', label: 'Available' }
							]}
							class="mt-1 px-4 py-2"
							filterFunction={(item, searchTerm) => {
								if (!searchTerm) return true;
								const searchLower = searchTerm.toLowerCase();
								return (
									item.id?.toLowerCase().includes(searchLower) ||
									item.name?.toLowerCase().includes(searchLower) ||
									item.slug?.toLowerCase().includes(searchLower) ||
									item.aliases?.some((alias) => alias.toLowerCase().includes(searchLower)) ||
									item.gameAccounts?.some(
										(gameAccount) =>
											gameAccount.currentName.toLowerCase().includes(searchLower) ||
											gameAccount.accountId.toString().toLowerCase().includes(searchLower)
									)
								);
							}}
							secondaryTextFunction={(item) => {
								return `${countryCodeToFlagEmoji(item.nationalities[0] ?? 'ZZ')} ${item.aliases?.join(', ') ?? ''}`;
							}}
						/>
					</div>

					<div class="flex flex-col gap-2">
						<label for={`caster-role-${i}`} class="text-sm font-medium text-slate-300">Role</label>
						<select
							id={`caster-role-${i}`}
							bind:value={caster.role}
							onchange={(e) => updateCaster(i, 'role', e.currentTarget.value)}
							class="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
						>
							{#each roleOptions as { value, label } (value)}
								<option {value}>{label}</option>
							{/each}
						</select>
					</div>
				</div>

				{#if caster.playerId}
					{@const validation = getPlayerValidationStatus(caster.playerId)}
					{#if validation}
						<div class="text-sm {validation.type === 'error' ? 'text-red-400' : 'text-yellow-400'}">
							{validation.message}
						</div>
					{/if}
				{/if}
			</div>
		{/each}
	{/if}

	<button
		type="button"
		onclick={addCaster}
		class="flex items-center justify-center gap-2 rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-yellow-500 hover:bg-slate-700"
	>
		<IconParkSolidAdd class="h-5 w-5" />
		{m.add()}
	</button>
</div>
