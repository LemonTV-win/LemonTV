<script lang="ts">
	import { calculateWinnerIndex, type Stage } from '$lib/data';
	import type { Match } from '$lib/data/matches';
	import type { Team } from '$lib/data/teams';
	import { m } from '$lib/paraglide/messages';
	import { getLocale, type Locale } from '$lib/paraglide/runtime';
	import { onMount, tick } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';

	let { stage }: { stage: Stage } = $props();

	if (!stage) console.error('Stage is required');

	let rounds = $derived(
		stage.structure.rounds
			.filter((r) => r.parallelGroup === undefined)
			.toSorted((a, b) => a.id - b.id)
	);

	let matches = $derived(stage.matches);
	let matchesByRound: Map<number, Match[]> = $derived(
		new Map(
			rounds.map((r) => [
				r.id,
				matches.filter((m) => stage.structure.nodes.find((n) => n.matchId === m.id)?.round === r.id)
			])
		)
	);

	let parallelRounds = $derived(
		stage.structure.rounds.filter((r) => r.parallelGroup !== undefined)
	);
	let parallelMatchesByRound: Map<number, [title: string, matches: Match[]]> = $derived(
		new Map(
			parallelRounds.map((r) => [
				r.parallelGroup ?? 0,
				[
					r.title?.[getLocale() as Locale] ?? m[r.type as keyof typeof m](),
					matches.filter(
						(m) => stage.structure.nodes.find((n) => n.matchId === m.id)?.round === r.id
					)
				]
			])
		)
	);

	let container = $state<HTMLDivElement>();
	let positions = new SvelteMap<number, { x: number; y: number }>();
	function register(el: HTMLElement, matchId: number) {
		if (!container) {
			tick().then(() => register(el, matchId));
			return;
		}
		matchRefs.set(matchId, el);
		const rect = el.getBoundingClientRect();
		// relative to container’s top‑left:
		const cRect = container.getBoundingClientRect();
		positions.set(matchId, {
			x: rect.left + rect.width / 2 - cRect.left,
			y: rect.top + rect.height / 2 - cRect.top
		});
	}

	$inspect('container', container);

	// $inspect('positions', positions);
	$effect(() => {
		console.log('positions', positions);
	});

	let matchRefs = new SvelteMap<number, HTMLElement>();

	onMount(() => {
		const recalc = () => {
			if (!container) return;
			positions.clear();
			for (const [matchId, el] of matchRefs) {
				const rect = el.getBoundingClientRect();
				const cRect = container.getBoundingClientRect();
				positions.set(matchId, {
					x: rect.left + rect.width / 2 - cRect.left,
					y: rect.top + rect.height / 2 - cRect.top
				});
			}
		};

		window.addEventListener('resize', recalc);
		container?.addEventListener('scroll', recalc);

		// optionally trigger once after mount
		recalc();

		return () => {
			window.removeEventListener('resize', recalc);
			container?.removeEventListener('scroll', recalc);
		};
	});

	function isWinner(match: Match, team: Team) {
		if (!team || !calculateWinnerIndex(match)) return false;
		return (
			(calculateWinnerIndex(match) === 1 && team === match.teams[0].team) ||
			(calculateWinnerIndex(match) === 2 && team === match.teams[1].team)
		);
	}
</script>

{#snippet matchContainer(match: Match, i: number)}
	<div
		class="relative z-10 cursor-pointer bg-zinc-800 text-white decoration-0 shadow-md transition-shadow duration-200 hover:shadow-lg"
		use:register={match.id}
	>
		<!-- your MatchCard or custom markup -->
		<a href={`/matches/${match.id}`} class="match">
			<div
				class={[
					'flex justify-between gap-4 border-b-1 border-l-4 border-gray-500 px-2 py-1',
					isWinner(match, match.teams[0].team)
						? 'border-l-yellow-400 font-semibold'
						: 'border-l-red-500 text-gray-300'
				]}
			>
				{match.teams[0].team.name}
				{#if match.teams[0].score !== undefined}
					<span class="score">{match.teams[0].score}</span>
				{/if}
			</div>
			<div
				class={[
					'flex justify-between gap-4 border-l-4 border-gray-500 px-2 py-1',
					isWinner(match, match.teams[1].team)
						? 'border-l-4 border-yellow-500 font-semibold'
						: 'border-l-4 border-red-500 text-gray-300'
				]}
			>
				{match.teams[1].team.name}
				{#if match.teams[1].score !== undefined}
					<span class="score">{match.teams[1].score}</span>
				{/if}
			</div>
		</a>
	</div>
{/snippet}

<div
	bind:this={container}
	class="relative grid auto-rows-min justify-items-center gap-x-8 gap-y-0 overflow-x-auto bg-zinc-900 px-4 py-8"
	style="grid-template-columns: repeat({rounds.length}, 1fr);"
>
	{#each rounds as r}
		<h4 class="mb-4">{r.title?.[getLocale() as Locale] ?? m[r.type as keyof typeof m]()}</h4>
	{/each}
	{#each rounds as r, i}
		<div class="flex flex-col items-center justify-center" style:grid-column={i + 1}>
			<div class="flex flex-col gap-6">
				{#each matchesByRound.get(r.id) ?? [] as match (match.id)}
					{@render matchContainer(match, i)}
				{/each}
			</div>
		</div>
	{/each}

	{#each rounds as r, i}
		{@const [title, matches] = parallelMatchesByRound.get(r.id) ?? ['', []]}
		<div class="flex flex-col items-center justify-center" style:grid-column={i + 1}>
			<div class="flex flex-col gap-6">
				<h4 class="text-center">{title}</h4>
				{#each matches as match (match.id)}
					{@render matchContainer(match, i)}
				{/each}
			</div>
		</div>
	{/each}

	<svg class="pointer-events-none absolute top-0 left-0 h-full w-full">
		{#each stage.structure.nodes as node}
			{#if node.dependsOn}
				{#each node.dependsOn as dep}
					{#if positions.has(dep.matchId) && positions.has(node.matchId)}
						{@const from = positions.get(dep.matchId) ?? { x: 0, y: 0 }}
						{@const to = positions.get(node.matchId) ?? { x: 0, y: 0 }}
						<!-- draw a bent line: horizontal then vertical -->
						<polyline
							points="
                {from.x},{from.y}
                {(from.x + to.x) / 2},{from.y}
                {(from.x + to.x) / 2},{to.y}
                {to.x},{to.y}
              "
							fill="none"
							class="stroke-gray-500"
							stroke-width="1"
						/>
					{/if}
				{/each}
			{/if}
		{/each}
	</svg>
</div>
