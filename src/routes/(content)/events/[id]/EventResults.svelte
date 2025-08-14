<script lang="ts">
	import { m } from '$lib/paraglide/messages';

	import IconParkSolidPeoples from '~icons/icon-park-solid/peoples';
	import { settings } from '$lib/settings.svelte';
	import IconEye from '~icons/mdi/eye';
	let {
		results
	}: {
		results: {
			rank: number;
			rankTo?: number;
			team: {
				id: string;
				name: string;
				logoURL: string | null;
				region?: string | null;
			};
			prizes: {
				amount: number;
				currency: string;
			}[];
		}[];
	} = $props();

	let showResults = $state(false);

	let sortedResults = $derived((results ?? []).toSorted((a, b) => a.rank - b.rank));
	let top3 = $derived(sortedResults.slice(0, 3));
	let podiumOrder = $derived(top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3);
	let rest = $derived(sortedResults.slice(3));
</script>

<div class="relative">
	<h2 class="my-4 text-2xl font-bold text-white">{m.results()}</h2>
	<div class="flex h-100 items-end justify-center gap-6 px-4">
		{#each podiumOrder as result, idx (idx)}
			<div
				class="glass flex min-w-72 flex-col items-center justify-between gap-2 p-4 {result.rank ===
				1
					? 'z-10 h-[100%]'
					: result.rank === 2
						? 'h-[80%]'
						: 'h-[70%]'}"
			>
				<div
					class="text-4xl font-bold {result.rank === 1
						? 'py-8 text-6xl text-yellow-400'
						: result.rank === 2
							? 'py-4 text-5xl text-gray-300'
							: 'py-2 text-amber-700'}"
				>
					#{result.rank}{result.rankTo ? `-${result.rankTo}` : ''}
				</div>
				{#if result.team.logoURL}
					<img
						src={result.team.logoURL}
						alt={result.team.name}
						class={['h-24 w-24 rounded-full', result.rank === 1 ? 'h-32 w-32' : 'h-24 w-24']}
					/>
				{:else}
					<IconParkSolidPeoples
						class={['h-24 w-24 text-gray-300', result.rank === 1 ? 'h-32 w-32' : 'h-24 w-24']}
					/>
				{/if}
				<div class="flex flex-col items-center gap-2">
					<div class="text-center">
						<div
							class="font-bold {result.rank === 1
								? 'text-2xl'
								: result.rank === 2
									? 'text-xl'
									: 'text-lg'}"
						>
							<a href={`/teams/${result.team.id}`} class="hover:text-yellow-500">
								{result.team.name}
							</a>
						</div>
						<div class="text-gray-400">({result.team.region})</div>
					</div>
					<div class="flex flex-col items-center gap-1">
						{#each result.prizes as prize, idx (idx)}
							<div class="text-yellow-500">
								{prize.amount.toLocaleString()}
								{prize.currency}
							</div>
						{/each}
					</div>
				</div>
			</div>
		{/each}
	</div>
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
		{#each rest as result, idx (idx)}
			<div class="glass flex flex-col items-center gap-2 p-4">
				<div class="text-4xl font-bold text-yellow-600">
					#{result.rank}{result.rankTo ? `-${result.rankTo}` : ''}
				</div>
				{#if result.team.logoURL}
					<img src={result.team.logoURL} alt={result.team.name} class="h-16 w-16 rounded-full" />
				{:else}
					<IconParkSolidPeoples class="h-16 w-16 text-gray-300" />
				{/if}
				<div class="text-center">
					<div class="font-bold">
						<a href={`/teams/${result.team.id}`} class="hover:text-yellow-500">
							{result.team.name}
						</a>
					</div>
					<div class="text-gray-400">({result.team.region})</div>
				</div>
				<div class="flex flex-col items-center gap-1">
					{#each result.prizes as prize, idx (idx)}
						<div class="text-yellow-500">
							{prize.amount.toLocaleString()}
							{prize.currency}
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>

	{#if settings.spoilerMode}
		<button
			class={[
				'absolute inset-0 z-10 grid cursor-pointer place-content-center',
				{
					'bg-black/30 text-gray-300 backdrop-blur-xl hover:bg-black/0 hover:text-white':
						!showResults,
					'bg-transparent': showResults
				}
			]}
			onclick={() => (showResults = true)}
		>
			{#if !showResults}
				<div class="flex items-center justify-center gap-2">
					<IconEye class="h-6 w-6" />
					{m.show_results()}
				</div>
			{/if}
		</button>
	{/if}
</div>
