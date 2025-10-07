<script lang="ts">
	import IconParkSolidDelete from '~icons/icon-park-solid/delete';
	import IconParkSolidAdd from '~icons/icon-park-solid/add';
	import { m } from '$lib/paraglide/messages';
	import Combobox from '$lib/components/Combobox.svelte';
	import type { Team } from '$lib/server/db/schema';

	interface Props {
		results?: Array<{
			teamId: string;
			rank: number;
			rankTo?: number;
			prizeAmount: number;
			prizeCurrency: string;
		}>;
		teams: (Pick<Team, 'id' | 'name' | 'abbr' | 'slug'> & { aliases: string[] })[];
		selectedTeams: string[];
	}

	let { results = $bindable([]), teams, selectedTeams }: Props = $props();

	function addResult() {
		results = [
			...results,
			{
				teamId: '',
				rank: results.length + 1,
				rankTo: undefined,
				prizeAmount: 0,
				prizeCurrency: 'Bablo'
			}
		];
	}

	function removeResult(index: number) {
		results = results
			.filter((_, i) => i !== index)
			.map((result, i) => ({
				...result,
				rank: i + 1
			}));
	}
</script>

<div class="space-y-4">
	{#each results as result, index (index)}
		<div
			class="grid grid-cols-[1fr_auto_auto_auto_auto] items-start gap-4 rounded-lg border border-slate-700 bg-slate-800 p-4"
		>
			<div>
				<label class="mb-2 block text-sm font-medium text-slate-300" for="team-{index}">
					{m.team()}
				</label>
				<Combobox
					items={(() => {
						const filteredTeams = teams.map((t) => ({
							id: t.id,
							name: t.name,
							group: selectedTeams.includes(t.id) ? 'participating' : 'other',
							abbr: t.abbr,
							slug: t.slug
							// TODO: Aliases
						}));
						return filteredTeams;
					})()}
					bind:value={result.teamId}
					placeholder={m.select_team()}
					groups={[
						{ id: 'participating', label: m.attending_teams() },
						{ id: 'other', label: m.other_teams() }
					]}
					disabled={false}
					class="mt-1 px-4 py-2"
					filterFunction={(item, searchTerm): boolean => {
						if (!searchTerm) return true;
						const searchLower = searchTerm.toLowerCase();
						return (
							item.id.toLowerCase().includes(searchLower) ||
							item.name.toLowerCase().includes(searchLower) ||
							item.slug.toLowerCase().includes(searchLower) ||
							(item.abbr !== null && item.abbr.toLowerCase().includes(searchLower))
						);
					}}
				/>
			</div>
			<div>
				<label class="mb-2 block text-sm font-medium text-slate-300" for="rank-{index}">
					{m.rank()}
				</label>
				<div class="flex items-center gap-2">
					<input
						id="rank-{index}"
						type="number"
						name="rank"
						bind:value={result.rank}
						min="1"
						class="w-15 rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
						required
					/>
					<span class="text-slate-400">–</span>
					<input
						id="rankTo-{index}"
						type="number"
						name="rankTo"
						bind:value={result.rankTo}
						min={result.rank}
						class="w-15 rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
						placeholder=""
					/>
				</div>
			</div>
			<div>
				<label class="mb-2 block text-sm font-medium text-slate-300" for="prize-amount-{index}">
					{m.amount()}
				</label>
				<input
					id="prize-amount-{index}"
					type="number"
					name="prizeAmount"
					bind:value={result.prizeAmount}
					min="0"
					class="w-20 rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
					required
				/>
			</div>
			<div>
				<label class="mb-2 block text-sm font-medium text-slate-300" for="prize-currency-{index}">
					{m.currency()}
				</label>
				<input
					id="prize-currency-{index}"
					type="text"
					name="prizeCurrency"
					bind:value={result.prizeCurrency}
					class="w-20 rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
					required
				/>
			</div>
			<button
				type="button"
				class="mt-6 text-red-500 hover:text-red-400"
				onclick={() => removeResult(index)}
			>
				<IconParkSolidDelete class="h-5 w-5" />
			</button>
		</div>
	{/each}
	<button
		type="button"
		class="flex w-full items-center justify-center gap-2 rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-yellow-500 hover:bg-slate-700"
		onclick={addResult}
	>
		<IconParkSolidAdd class="h-5 w-5" />
		{m.add()}
	</button>
</div>
