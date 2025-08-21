<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { ROUND_NAMES } from '$lib/data/matches';
	import type { Node, Round, Match } from './BracketEdit.svelte';

	let {
		rounds,
		nodes,
		matches,
		selectedObject = $bindable()
	}: {
		rounds: Round[];
		nodes: Node[];
		matches: Match[];
		selectedObject: string;
	} = $props();

	let orphanedNodes = $derived(nodes.filter((node) => !rounds.some((r) => r.id === node.roundId)));
</script>

<select
	bind:value={selectedObject}
	class="mt-1 block w-72 rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
>
	{#each rounds as round, roundIndex (`round-#${roundIndex}`)}
		<option value={`round-${roundIndex}`}>
			{m.stage_round()}
			{roundIndex + 1}: {round.title ||
				ROUND_NAMES[round.type as keyof typeof ROUND_NAMES]?.() ||
				round.type}
		</option>
		{#each nodes.filter((node) => node.roundId === round.id) as node, j (`node-${roundIndex}-${j}`)}
			{@const nodeIndex = nodes.indexOf(node)}
			{@const match = matches.find((m: (typeof matches)[0]) => m.id === node.matchId)}
			{@const team1Score = match?.teams[0]?.score || 0}
			{@const team2Score = match?.teams[1]?.score || 0}
			<option value={`node-${nodeIndex}`}>
				- {m.stage_node()} #{nodeIndex + 1}: {match
					? `${match.teams[0]?.team?.name || 'TBD'} vs ${match.teams[1]?.team?.name || 'TBD'} (${team1Score}-${team2Score}) - ${match.id}`
					: m.no_match()} (#{node.order})
			</option>
		{/each}
		<option disabled>──────────</option>
	{/each}

	{#if orphanedNodes.length > 0}
		<optgroup label={m.nodes_without_round()}>
			{#each orphanedNodes as node, k (`node-#${k}`)}
				{@const nodeIndex = nodes.indexOf(node)}
				{@const match = matches.find((m: (typeof matches)[0]) => m.id === node.matchId)}
				{@const team1Score = match?.teams[0]?.score || 0}
				{@const team2Score = match?.teams[1]?.score || 0}
				<option value={`node-${nodeIndex}`}>
					{m.stage_node()} #{nodeIndex + 1}: {match
						? `${match.teams[0]?.team?.name || 'TBD'} vs ${match.teams[1]?.team?.name || 'TBD'} (${team1Score}-${team2Score}) - ${match.id}`
						: m.no_match()} (#{node.order})
				</option>
			{/each}
		</optgroup>
		<option disabled>──────────</option>
	{/if}
	<option
		value={{
			type: 'round',
			roundIndex: -1
		}}>{m.new_round()}</option
	>
	<option
		value={{
			type: 'node',
			nodeIndex: -1
		}}>{m.new_node()}</option
	>
</select>
