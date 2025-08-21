<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { ROUND_NAMES } from '$lib/data/matches';
	import IconParkSolidDelete from '~icons/icon-park-solid/delete';
	import type { Round } from './BracketEdit.svelte';

	let {
		rounds,
		selectedObject,
		confirmRemoveRound
	}: {
		rounds: Round[];
		selectedObject: string;
		confirmRemoveRound: (roundIndex: number) => void;
	} = $props();

	const roundTypes = [
		'quarterfinals',
		'semifinals',
		'final',
		'top16',
		'group',
		'thirdplace',
		'lower',
		'grandfinal'
	] as const;
	const bracketTypes = {
		upper: m.upper_bracket,
		lower: m.lower_bracket,
		group: m.group_bracket
	} as const;

	// Computed property to get the selected round index
	let selectedRoundIndex = $derived(
		selectedObject.startsWith('round-') ? parseInt(selectedObject.split('-')[1]) : -1
	);
</script>

<section class="space-y-4">
	{#if selectedRoundIndex >= 0 && rounds[selectedRoundIndex]}
		{@const round = rounds[selectedRoundIndex]}
		{@const roundIndex = selectedRoundIndex}
		<div class="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
			<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
				<div>
					<label for="round-type-{roundIndex}" class="block text-sm font-medium text-slate-300"
						>{m.type()}</label
					>
					<select
						id="round-type-{roundIndex}"
						bind:value={round.type}
						class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
					>
						{#each roundTypes as type (type)}
							<option value={type}
								>{ROUND_NAMES[type as keyof typeof ROUND_NAMES]?.() || type}</option
							>
						{/each}
					</select>
				</div>

				<div>
					<label for="round-title-{roundIndex}" class="block text-sm font-medium text-slate-300"
						>{m.label()}</label
					>
					<input
						id="round-title-{roundIndex}"
						type="text"
						bind:value={round.title}
						class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
					/>
				</div>

				<div>
					<label for="round-bracket-{roundIndex}" class="block text-sm font-medium text-slate-300"
						>{m.bracket()}</label
					>
					<select
						id="round-bracket-{roundIndex}"
						bind:value={round.bracket}
						class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
					>
						{#each Object.entries(bracketTypes) as [bracket, bracketLabel]}
							<option value={bracket}>{bracketLabel()}</option>
						{/each}
					</select>
				</div>

				<div>
					<label
						for="round-parallel-group-{roundIndex}"
						class="block text-sm font-medium text-slate-300">{m.parallel_group()}</label
					>
					<select
						id="round-parallel-group-{roundIndex}"
						bind:value={round.parallelGroup}
						class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
					>
						<option value={undefined}>None</option>
						{#each rounds.filter((r) => r.parallelGroup === undefined && r.id !== round.id) as availableRound (`available-round-#${availableRound.id}`)}
							<option value={availableRound.id}>
								{availableRound.title ||
									ROUND_NAMES[availableRound.type as keyof typeof ROUND_NAMES]?.() ||
									availableRound.type}
							</option>
						{/each}
					</select>
				</div>
			</div>

			<div class="mt-3 flex justify-end">
				<button
					type="button"
					class="cursor-pointer text-red-500 hover:text-red-400"
					onclick={() => confirmRemoveRound(roundIndex)}
					aria-label="Remove round"
				>
					<IconParkSolidDelete class="h-4 w-4" />
				</button>
			</div>
		</div>
	{:else}
		<div class="rounded-lg border border-slate-700 bg-slate-800/50 p-8 text-center">
			<p class="text-slate-400">{m.select_round()}</p>
		</div>
	{/if}
</section>
