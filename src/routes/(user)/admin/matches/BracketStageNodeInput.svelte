<script lang="ts">
	import IconParkSolidDelete from '~icons/icon-park-solid/delete';
	import type { Match, Node, Round } from './BracketEdit.svelte';

	let {
		nodes,
		matches,
		rounds,
		selectedNodeIndex = $bindable(0),
		confirmRemoveNode,
		addDependency,
		removeDependency,
		getAvailableMatches,
		getAvailableMatchesForDependencies
	}: {
		nodes: Node[];
		selectedNodeIndex: number;
		confirmRemoveNode: (nodeIndex: number) => void;
		addDependency: (nodeIndex: number) => void;
		removeDependency: (nodeIndex: number, depIndex: number) => void;
		getAvailableMatches: (nodeIndex: number) => Match[];
		getAvailableMatchesForDependencies: (nodeIndex: number, depIndex: number) => Match[];
		matches: Match[];
		rounds: Round[];
	} = $props();

	const outcomeTypes = ['winner', 'loser'] as const;
</script>

<section class="space-y-4">
	<select
		bind:value={selectedNodeIndex}
		class="mt-1 block w-64 rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
	>
		{#each nodes as node, nodeIndex (`node-#${nodeIndex}`)}
			{@const match = matches.find((m: (typeof matches)[0]) => m.id === node.matchId)}
			{@const round = rounds.find((r) => r.id === node.roundId || r.id === node.roundId)}
			{@const team1Score = match?.teams[0]?.score || 0}
			{@const team2Score = match?.teams[1]?.score || 0}
			<option value={nodeIndex}>
				{round?.title || round?.type || 'Unknown Round'} - {match
					? `${match.teams[0]?.team?.name || 'TBD'} vs ${match.teams[1]?.team?.name || 'TBD'} (${team1Score}-${team2Score}) - ${match.id}`
					: 'No match'} (#{node.order})
			</option>
		{/each}
		<option disabled>──────────</option>
		<option value={-1}>New Node</option>
	</select>

	{#if selectedNodeIndex >= 0 && nodes[selectedNodeIndex]}
		{@const node = nodes[selectedNodeIndex]}
		{@const nodeIndex = selectedNodeIndex}
		<div class="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
			<div class="space-y-4">
				<div>
					<label for="node-match-{nodeIndex}" class="block text-sm font-medium text-slate-300"
						>Match</label
					>
					<select
						id="node-match-{nodeIndex}"
						bind:value={node.matchId}
						class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
					>
						<option value="">Select Match</option>
						{#each getAvailableMatches(nodeIndex) as match (`match-#${match.id}`)}
							{@const team1Score = match.teams[0]?.score || 0}
							{@const team2Score = match.teams[1]?.score || 0}
							<option value={match.id}>
								{match.teams[0]?.team?.name || 'TBD'} vs {match.teams[1]?.team?.name || 'TBD'}
								({team1Score}-{team2Score}) - {match.id}
							</option>
						{/each}
					</select>
				</div>

				<div class="grid grid-cols-2 gap-4 md:grid-cols-3">
					<div>
						<label for="node-round-{nodeIndex}" class="block text-sm font-medium text-slate-300"
							>Round</label
						>
						<select
							id="node-round-{nodeIndex}"
							bind:value={node.roundId}
							class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
						>
							{#each rounds as round, roundIndex (`round-#${roundIndex}`)}
								<option value={round.id || roundIndex}>
									{round.title || round.type}
								</option>
							{/each}
						</select>
					</div>

					<div>
						<label for="node-order-{nodeIndex}" class="block text-sm font-medium text-slate-300"
							>Order</label
						>
						<input
							id="node-order-{nodeIndex}"
							type="number"
							bind:value={node.order}
							class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
						/>
					</div>

					<div class="flex items-end">
						<button
							type="button"
							class="text-red-500 hover:text-red-400"
							onclick={() => confirmRemoveNode(nodeIndex)}
							aria-label="Remove node"
						>
							<IconParkSolidDelete class="h-4 w-4" />
						</button>
					</div>
				</div>
			</div>

			<!-- Dependencies Section -->
			<div class="mt-4 space-y-2">
				<div class="flex items-center justify-between">
					<span class="text-sm font-medium text-slate-300">Dependencies</span>
					<button
						type="button"
						class="rounded-md bg-slate-600 px-2 py-1 text-xs font-medium text-slate-200 hover:bg-slate-500 focus:ring-2 focus:ring-slate-500 focus:outline-none"
						onclick={() => addDependency(nodeIndex)}
					>
						Add Dependency
					</button>
				</div>

				{#each node.dependencies as dep, depIndex (`dep-#${depIndex}`)}
					<div class="flex items-center gap-2 rounded border border-slate-600 bg-slate-700/50 p-2">
						<select
							id="dep-match-{nodeIndex}-{depIndex}"
							bind:value={dep.dependencyMatchId}
							class="flex-1 rounded border border-slate-600 bg-slate-800 px-2 py-1 text-sm text-white"
						>
							<option value="">Select Match</option>
							{#each getAvailableMatchesForDependencies(nodeIndex, depIndex) as match (`match-#${match.id}`)}
								{@const team1Score = match.teams[0]?.score || 0}
								{@const team2Score = match.teams[1]?.score || 0}
								<option value={match.id}>
									{match.teams[0]?.team?.name || 'TBD'} vs {match.teams[1]?.team?.name || 'TBD'} ({team1Score}-{team2Score})
									- {match.id}
								</option>
							{/each}
						</select>

						<select
							id="dep-outcome-{nodeIndex}-{depIndex}"
							bind:value={dep.outcome}
							class="rounded border border-slate-600 bg-slate-800 px-2 py-1 text-sm text-white"
						>
							{#each outcomeTypes as outcome (outcome)}
								<option value={outcome}>{outcome}</option>
							{/each}
						</select>

						<button
							type="button"
							class="text-red-500 hover:text-red-400"
							onclick={() => removeDependency(nodeIndex, depIndex)}
							aria-label="Remove dependency"
						>
							<IconParkSolidDelete class="h-3 w-3" />
						</button>
					</div>
				{/each}
			</div>
		</div>
	{:else}
		<div class="rounded-lg border border-slate-700 bg-slate-800/50 p-8 text-center">
			<p class="text-slate-400">Select a node from the dropdown above to edit its properties</p>
		</div>
	{/if}
</section>
