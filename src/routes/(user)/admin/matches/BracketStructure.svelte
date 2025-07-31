<script lang="ts">
	import type { Team } from '$lib/data/teams';
	let {
		rounds,
		nodes,
		matches,
		selectedRoundIndex = $bindable(0),
		selectedNodeIndex = $bindable(0),
		addRound,
		addNode
	}: {
		rounds: {
			id?: number;
			type: string;
			title: string;
			bracket: string;
			parallelGroup?: number;
			isNew?: boolean;
		}[];
		nodes: {
			id?: number;
			matchId: string;
			roundId: number;
			order: number;
			dependencies: Array<{
				id?: number;
				dependencyMatchId: string;
				outcome: 'winner' | 'loser';
			}>;
			isNew?: boolean;
		}[];
		matches: {
			id: string;
			format: string | null;
			stageId: number | null;
			teams: Array<{
				matchId: string | null;
				teamId: string | null;
				position: number;
				score: number;
				team: Team;
			}>;
			maps: Array<{
				id: number;
				matchId: string;
				mapId: string;
				order: number;
				side: number;
				action: string | null;
				map_picker_position: number;
				side_picker_position: number;
				map: {
					id: string;
				};
			}>;
		}[];
		selectedRoundIndex: number;
		selectedNodeIndex: number;
		addRound: () => void;
		addNode: () => void;
	} = $props();
</script>

{#snippet addRoundPseudoColumn()}
	<div class="flex flex-col items-center">
		<div class="mb-2 text-center">
			<span
				class="inline-block rounded-full bg-slate-500/20 px-3 py-1 text-xs font-medium text-slate-300"
			>
				New Round
			</span>
		</div>
		<div class="flex w-full flex-col gap-2">
			<button
				type="button"
				class="rounded border-2 border-dashed border-slate-600 bg-slate-700/30 px-3 py-8 text-center text-sm text-slate-400 transition-colors hover:border-slate-500 hover:bg-slate-700/50 hover:text-slate-300"
				onclick={addRound}
			>
				<div class="flex flex-col items-center gap-2">
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 6v6m0 0v6m0-6h6m-6 0H6"
						/>
					</svg>
					<span>Add Round</span>
				</div>
			</button>
		</div>
	</div>
{/snippet}

{#snippet addNodePseudoElement(
	round: {
		id?: number;
		type: string;
		title: string;
		bracket: string;
		parallelGroup?: number;
	},
	roundIndex: number
)}
	<button
		type="button"
		class="rounded border-2 border-dashed border-slate-600 bg-slate-700/30 px-3 py-2 text-center text-xs text-slate-400 transition-colors hover:border-slate-500 hover:bg-slate-700/50 hover:text-slate-300"
		onclick={() => {
			const targetRoundId = round.id || roundIndex;

			// Find the largest order within the target round
			const roundNodes = nodes.filter((node) => node.roundId === targetRoundId);
			const maxOrder =
				roundNodes.length > 0 ? Math.max(...roundNodes.map((node) => node.order)) : 0;

			addNode();
			// Set the new node's roundId and order
			if (nodes.length > 0) {
				nodes[nodes.length - 1].roundId = targetRoundId;
				nodes[nodes.length - 1].order = maxOrder + 1;
			}
		}}
	>
		<div class="flex items-center justify-center gap-1">
			<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 6v6m0 0v6m0-6h6m-6 0H6"
				/>
			</svg>
			<span>Add Node</span>
		</div>
	</button>
{/snippet}

{#snippet nodeElement(node: {
	id?: number;
	matchId: string;
	roundId: number;
	order: number;
	dependencies: Array<{
		id?: number;
		dependencyMatchId: string;
		outcome: 'winner' | 'loser';
	}>;
	isNew?: boolean;
})}
	{@const match = matches.find((m: (typeof matches)[0]) => m.id === node.matchId)}
	{@const globalNodeIndex = nodes.findIndex((n) => n === node)}
	<div class="relative">
		<button
			class={[
				'w-full rounded border px-3 py-2 text-left text-sm text-white transition-colors',
				{
					'border-yellow-500': match,
					'border-slate-500': !match,
					'border-2 border-yellow-400 bg-yellow-500/30 font-medium shadow-lg shadow-yellow-500/25 hover:bg-yellow-500/40':
						selectedNodeIndex === globalNodeIndex,
					'bg-slate-700 hover:bg-slate-600': selectedNodeIndex !== globalNodeIndex
				}
			]}
			onclick={() => (selectedNodeIndex = globalNodeIndex)}
		>
			{#if match}
				<div class="flex items-center justify-between">
					<span class="truncate">
						{match.teams[0]?.team?.name || 'TBD'} vs {match.teams[1]?.team?.name || 'TBD'}
					</span>
					<span class="text-xs text-slate-400">#{node.order}</span>
				</div>
			{:else}
				<div class="flex items-center justify-between">
					<span class="text-slate-400">No match assigned</span>
					<span class="text-xs text-slate-500">#{node.order}</span>
				</div>
			{/if}
		</button>

		<!-- Dependencies indicator -->
		{#if node.dependencies.length > 0}
			<div class="absolute -top-1 -right-1">
				<span
					class="inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-xs text-white"
				>
					{node.dependencies.length}
				</span>
			</div>
		{/if}
	</div>
{/snippet}

<div class="mt-4 rounded-lg border border-slate-700 bg-slate-800/50 p-4">
	{#if rounds.length === 0}
		<div class="text-center text-slate-400">
			<p>No rounds configured yet. Add rounds to see the bracket structure.</p>
		</div>
	{:else}
		<div
			class="overflow-x-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb]:hover:bg-slate-500 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-slate-800"
		>
			<div
				class="inline-grid gap-4 pr-2 pb-2"
				style="grid-template-columns: repeat({rounds.length + 1}, 200px);"
			>
				{#each rounds as round, roundIndex (roundIndex)}
					<div class="flex flex-col items-center">
						<div class="mb-2 text-center">
							<button
								type="button"
								class={[
									'rounded-full px-3 py-1 text-xs font-medium transition-colors *:inline-block',
									{
										'bg-yellow-500/20 text-yellow-300': selectedRoundIndex === roundIndex,
										'bg-slate-600/20 text-slate-300 hover:bg-yellow-500/30':
											selectedRoundIndex !== roundIndex
									}
								]}
								onclick={() => (selectedRoundIndex = roundIndex)}
							>
								{roundIndex + 1}: {round.title || round.type}
							</button>
							{#if round.parallelGroup !== undefined}
								<span
									class="ml-1 inline-block rounded-full bg-blue-500/20 px-2 py-1 text-xs text-blue-300"
								>
									Group {round.parallelGroup}
								</span>
							{/if}
						</div>

						<div class="flex w-full flex-col gap-2">
							{#each nodes.filter((node) => node.roundId === round.id) as node, idx (`${roundIndex}-${idx}`)}
								{@render nodeElement(node)}
							{:else}
								<div
									class="rounded border border-dashed border-slate-600 px-3 py-2 text-center text-xs text-slate-500"
								>
									No nodes
								</div>
							{/each}

							{@render addNodePseudoElement(round, roundIndex)}
						</div>
					</div>
				{/each}

				{@render addRoundPseudoColumn()}
			</div>
		</div>

		<!-- Summary stats -->
		<div class="mt-4 flex justify-between text-xs text-slate-400">
			<span>Total Rounds: {rounds.length}</span>
			<span>Total Nodes: {nodes.length}</span>
			<span>Assigned Matches: {nodes.filter((n) => n.matchId).length}</span>
		</div>
	{/if}
</div>
