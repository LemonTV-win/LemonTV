<script lang="ts">
	import { calculateWinnerIndex } from '$lib/data';
	import type { Stage } from '$lib/data/events';
	import { type Match, ROUND_NAMES } from '$lib/data/matches';
	import type { Team } from '$lib/data/teams';
	import { m } from '$lib/paraglide/messages';
	import { getLocale, type Locale } from '$lib/paraglide/runtime';
	import { settings } from '$lib/settings.svelte';
	import { onMount, tick } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import IconEye from '~icons/mdi/eye';
	let { stage }: { stage: Stage } = $props();

	if (!stage) console.error('Stage is required');

	$inspect('[Brackets] stage', stage);

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
				matches
					.filter((m) => stage.structure.nodes.find((n) => n.matchId === m.id)?.round === r.id)
					.sort((a, b) => {
						// Get the node IDs for both matches
						const nodeA = stage.structure.nodes.find((n) => n.matchId === a.id);
						const nodeB = stage.structure.nodes.find((n) => n.matchId === b.id);
						// Sort by node ID to preserve the order defined in STAGE_NODES
						return (nodeA?.order ?? 0) - (nodeB?.order ?? 0);
					})
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
					r.title?.[getLocale() as Locale] ??
						m[r.type as 'thirdplace' | 'semifinals' | 'final' | 'quarterfinals'](),
					matches
						.filter((m) => stage.structure.nodes.find((n) => n.matchId === m.id)?.round === r.id)
						.sort((a, b) => {
							// Get the node IDs for both matches
							const nodeA = stage.structure.nodes.find((n) => n.matchId === a.id);
							const nodeB = stage.structure.nodes.find((n) => n.matchId === b.id);
							// Sort by node ID to preserve the order defined in STAGE_NODES
							return (nodeA?.order ?? 0) - (nodeB?.order ?? 0);
						})
				]
			])
		)
	);

	// Check if any matches are found through nodes
	let hasNodeMatches = $derived(
		stage.structure.nodes.some((n) => n.matchId !== null) &&
			matches.some((m) => stage.structure.nodes.some((n) => n.matchId === m.id))
	);

	// For your case, we want the third-place match to be in the same column as the final
	// So let's just use the original grid layout and position parallel rounds correctly
	let gridColumns = $derived(rounds.length);

	let container = $state<HTMLDivElement>();
	let positions = new SvelteMap<string, { x: number; y: number }>();
	function register(el: HTMLElement, matchId: string) {
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

	let matchRefs = new SvelteMap<string, HTMLElement>();

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

	function isWinner(
		match: {
			teams: {
				team: Team;
				score: number;
			}[];
			games: {
				winner: number;
			}[];
		},
		team: Team | undefined
	) {
		if (!team) return false;

		const winnerIndex = calculateWinnerIndex(match);
		if (winnerIndex === null) return false; // Draw - no winner

		return (
			(winnerIndex === 1 && team.id === match.teams[0].team.id) ||
			(winnerIndex === 2 && team.id === match.teams[1].team.id)
		);
	}

	let tooltipID = $state<string>();

	let highlightingTeam = $state<string>();

	let show = $state(false);
</script>

{#snippet matchContainer(match: {
	id: string;
	teams: {
		team: Team;
		score: number;
	}[];
	games: {
		winner: number;
		result: [number, number];
	}[];
})}
	<div
		class="relative z-10 cursor-pointer bg-zinc-800 text-white decoration-0 shadow-md transition-shadow duration-200 hover:shadow-lg"
		use:register={match.id}
	>
		<!-- your MatchCard or custom markup -->
		<a
			href={`/matches/${match.id}`}
			class="match"
			onmouseenter={() => {
				tooltipID = match.id;
				console.log('Tooltip triggered for match:', match.id, 'Games:', match.games?.length);
			}}
			onmouseleave={() => (tooltipID = undefined)}
		>
			<button
				class={[
					'flex w-full justify-between gap-4 border-b-1 border-l-4 border-gray-500 px-2 py-1',
					isWinner(match, match.teams[0].team)
						? 'border-l-yellow-400 font-semibold'
						: 'border-l-red-500 text-gray-300'
				]}
				onmouseenter={() => (highlightingTeam = match.teams[0].team.id)}
				onmouseleave={() => (highlightingTeam = undefined)}
				class:bg-gray-700={highlightingTeam === match.teams[0].team.id}
			>
				{match.teams[0].team.name ?? match.teams[0].team.id}
				{#if match.teams[0].score !== undefined}
					<span class="score">{match.teams[0].score}</span>
				{/if}
			</button>
			<button
				class={[
					'flex w-full justify-between gap-4 border-l-4 border-gray-500 px-2 py-1',
					isWinner(match, match.teams[1].team)
						? 'border-l-4 border-yellow-500 font-semibold'
						: 'border-l-4 border-red-500 text-gray-300'
				]}
				onmouseenter={() => (highlightingTeam = match.teams[1].team.id)}
				onmouseleave={() => (highlightingTeam = undefined)}
				class:bg-gray-700={highlightingTeam === match.teams[1].team.id}
			>
				{match.teams[1].team.name ?? match.teams[1].team.id}
				{#if match.teams[1].score !== undefined}
					<span class="score">{match.teams[1].score}</span>
				{/if}
			</button>
		</a>
		{#if match.games && tooltipID === match.id}
			{@const results = match.games.map((g) => g.result)}
			<div
				id={`${match.id}-games`}
				class="absolute top-0 left-full grid h-full w-fit text-center"
				style:grid-template-columns={`repeat(${results.length}, 1fr)`}
			>
				{#each [0, 1] as rowIndex (`${match.id}-row-${rowIndex}`)}
					{#each results as result, colIndex (`${match.id}-${rowIndex}-${colIndex}`)}
						<span
							class="w-8 border-gray-500 p-1 text-white"
							class:border-l={colIndex > 0}
							class:border-t={rowIndex > 0}
							class:bg-blue-500={result[0] === result[1]}
							class:bg-yellow-500={(rowIndex === 0 && result[0] > result[1]) ||
								(rowIndex === 1 && result[0] < result[1])}
							class:bg-red-500={(rowIndex === 0 && result[0] < result[1]) ||
								(rowIndex === 1 && result[0] > result[1])}
						>
							{result[rowIndex]}
						</span>
					{/each}
				{/each}
			</div>
		{/if}
	</div>
{/snippet}

<div
	bind:this={container}
	class="relative grid auto-rows-min justify-items-center gap-x-8 gap-y-0 overflow-x-auto bg-zinc-900 px-4 py-8"
	style="grid-template-columns: repeat({gridColumns}, 1fr);"
>
	{#each rounds as r, i (`round-header-${i}`)}
		<h4 class="mb-4">
			{r.title?.[getLocale() as Locale] ??
				ROUND_NAMES[r.type as keyof typeof ROUND_NAMES]?.() ??
				r.type}
		</h4>
	{/each}
	{#each rounds as r, i (`round-content-${i}`)}
		{@const roundMatches = hasNodeMatches
			? (matchesByRound.get(r.id) ?? [])
			: i === 0
				? matches
				: []}
		<div class="flex flex-col items-center justify-center" style:grid-column={i + 1}>
			<div class="flex flex-col gap-6">
				{#each roundMatches as match (`match-${r.id}-${match.id}`)}
					{@render matchContainer(match)}
				{/each}
			</div>
		</div>
	{/each}

	{#each parallelRounds as r (`parallel-${r.parallelGroup ?? 0}-${r.id}`)}
		{@const [title, roundMatches] = hasNodeMatches
			? (parallelMatchesByRound.get(r.parallelGroup ?? 0) ?? ['', []])
			: [
					r.title?.[getLocale() as Locale] ??
						m[r.type as 'thirdplace' | 'semifinals' | 'final' | 'quarterfinals'](),
					matches
				]}
		{@const targetColumn = r.type === 'thirdplace' ? gridColumns : 1}
		<div class="flex flex-col items-center justify-center" style:grid-column={targetColumn}>
			<div class="flex flex-col gap-6">
				<h4 class="text-center">{title}</h4>
				{#each roundMatches as match (`parallel-match-${r.parallelGroup ?? 0}-${r.id}-${match.id}`)}
					{@render matchContainer(match)}
				{/each}
			</div>
		</div>
	{/each}

	<svg class="pointer-events-none absolute top-0 left-0 h-full w-full">
		{#each stage.structure.nodes as node, nodeIndex (`node-${node.matchId}-${nodeIndex}`)}
			{#if node.dependsOn}
				{#each node.dependsOn as dep, depIndex (`dep-${node.matchId}-${nodeIndex}-${dep.matchId}-${depIndex}`)}
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

	{#if settings.spoilerMode}
		<button
			class={[
				'absolute inset-0 z-10 grid cursor-pointer place-content-center',
				{
					'bg-black/30  text-gray-300  backdrop-blur-lg hover:bg-black/0 hover:text-white': !show,
					'bg-transparent': show
				}
			]}
			onclick={() => (show = true)}
		>
			{#if !show}
				<div class="flex items-center justify-center gap-2">
					<IconEye class="h-6 w-6" />
					{m.show_brackets()}
				</div>
			{/if}
		</button>
	{/if}
</div>
