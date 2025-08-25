<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { ROUND_NAMES } from '$lib/data/matches';
	import type { Team } from '$lib/data/teams';
	import IconDragHandle from '~icons/material-symbols/drag-handle';

	// Define a type for the round object for better type safety
	type Round = {
		id?: number;
		type: string;
		title: string;
		bracket: string;
		parallelGroup?: number;
		isNew?: boolean;
	};

	type Node = {
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
	};

	let {
		rounds,
		nodes,
		matches,
		selectedObject = $bindable(''),
		addRound,
		addNode
	}: {
		rounds: Round[];
		nodes: Node[];
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
				order: number | null;
				side: number | null;
				action: string | null;
				map_picker_position: number | null;
				side_picker_position: number | null;
				map: {
					id: string;
				};
			}>;
		}[];
		selectedObject: string;
		addRound: () => void;
		addNode: () => void;
	} = $props();

	// Drag and drop state
	let draggedNode = $state<Node | null>(null);
	let draggedOverData = $state<{ node: Node | null; roundId: number | null }>({
		node: null,
		roundId: null
	});
	let isDragging = $state(false);
	// State to determine if dropping before or after a node
	let dropPosition: 'before' | 'after' = $state('before');

	// Drag event handlers
	function handleDragStart(event: DragEvent, node: Node) {
		draggedNode = node;
		isDragging = true;
		if (event.dataTransfer) {
			event.dataTransfer.effectAllowed = 'move';
			event.dataTransfer.setData('text/plain', node.matchId);
		}
	}

	function handleDragOver(event: DragEvent, dropTarget: { node?: Node; roundId: number }) {
		event.preventDefault();
		event.stopPropagation();
		if (!draggedNode) return;

		// Determine if the drop will be in the top or bottom half of the target node
		if (dropTarget.node) {
			const targetElement = event.currentTarget as HTMLElement;
			const rect = targetElement.getBoundingClientRect();
			dropPosition = event.clientY > rect.top + rect.height / 2 ? 'after' : 'before';
		}

		draggedOverData = { node: dropTarget.node ?? null, roundId: dropTarget.roundId };
	}

	function handleDragLeave() {
		draggedOverData = { node: null, roundId: null };
	}

	function handleDrop(
		event: DragEvent,
		dropTarget: { targetNode?: Node; round: Round; roundIndex: number }
	) {
		event.preventDefault();
		event.stopPropagation();
		if (!draggedNode) return;

		const { targetNode, round, roundIndex } = dropTarget;
		if (draggedNode === targetNode) {
			handleDragEnd();
			return;
		}

		const sourceRoundId = draggedNode.roundId;
		const dropRoundId = round.id ?? roundIndex;

		const newNodes = [...nodes];
		const fromIndex = newNodes.findIndex((n) => n === draggedNode);
		if (fromIndex === -1) return;
		const [movedNode] = newNodes.splice(fromIndex, 1);
		movedNode.roundId = dropRoundId;

		let toIndex;
		if (targetNode) {
			// Find the target's index in the array *after* the dragged node was removed
			toIndex = newNodes.findIndex((n) => n === targetNode);
			// If dropping 'after', the insertion index should be one greater
			if (dropPosition === 'after') {
				toIndex++;
			}
		} else {
			// If dropping on a container, add to the end of that round
			const lastNodeInRoundIndex = newNodes.map((n) => n.roundId).lastIndexOf(dropRoundId);
			toIndex = lastNodeInRoundIndex + 1;
		}

		newNodes.splice(toIndex, 0, movedNode);

		// Recalculate the 'order' property for all affected rounds
		const affectedRoundIds = new Set([sourceRoundId, dropRoundId]);
		affectedRoundIds.forEach((rId) => {
			let orderCounter = 1;
			newNodes.forEach((node) => {
				if (node.roundId === rId) {
					node.order = orderCounter++;
				}
			});
		});

		nodes = newNodes;
		handleDragEnd();
	}

	function handleDragEnd() {
		draggedNode = null;
		draggedOverData = { node: null, roundId: null };
		isDragging = false;
	}
</script>

{#snippet addRoundPseudoColumn()}
	<div class="flex flex-col items-center">
		<div class="mb-2 text-center">
			<span
				class="inline-block rounded-full bg-slate-500/20 px-3 py-1 text-xs font-medium text-slate-300"
			>
				{m.new_round()}
			</span>
		</div>
		<div class="flex w-full flex-col gap-2">
			<button
				type="button"
				class="cursor-pointer rounded border-2 border-dashed border-slate-600 bg-slate-700/30 px-3 py-8 text-center text-sm text-slate-400 transition-colors hover:border-slate-500 hover:bg-slate-700/50 hover:text-slate-300"
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
					<span>{m.add_round()}</span>
				</div>
			</button>
		</div>
	</div>
{/snippet}

{#snippet addNodePseudoElement(round: Round, roundIndex: number)}
	{@const roundId = round.id ?? roundIndex}
	<button
		type="button"
		class={[
			'cursor-pointer rounded border-2 border-dashed border-slate-600 bg-slate-700/30 px-3 py-2 text-center text-xs text-slate-400 transition-colors hover:border-slate-500 hover:bg-slate-700/50 hover:text-slate-300',
			{
				'border-blue-400 bg-blue-500/20':
					isDragging && !draggedOverData.node && draggedOverData.roundId === roundId
			}
		]}
		onclick={() => {
			const roundNodes = nodes.filter((node) => node.roundId === roundId);
			const maxOrder =
				roundNodes.length > 0 ? Math.max(...roundNodes.map((node) => node.order)) : 0;
			addNode();
			if (nodes.length > 0) {
				const newNode = nodes[nodes.length - 1];
				newNode.roundId = roundId;
				newNode.order = maxOrder + 1;
			}
		}}
		ondragover={(e) => handleDragOver(e, { roundId })}
		ondragleave={handleDragLeave}
		ondrop={(e) => handleDrop(e, { round, roundIndex })}
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
			<span>{m.add_node()}</span>
		</div>
	</button>
{/snippet}

{#snippet nodeElement(node: Node, round: Round, roundIndex: number)}
	{@const match = matches.find((m) => m.id === node.matchId)}
	{@const globalNodeIndex = nodes.findIndex((n) => n === node)}
	{@const roundId = round.id ?? roundIndex}
	<div
		class="relative"
		role="listitem"
		ondragover={(e) => handleDragOver(e, { node, roundId })}
		ondragleave={handleDragLeave}
		ondrop={(e) => handleDrop(e, { targetNode: node, round, roundIndex })}
	>
		<!-- **FIX 1**: Drop position indicator for clear visual feedback -->
		{#if isDragging && draggedNode !== node && draggedOverData.node === node}
			<div
				class="pointer-events-none absolute right-0 left-0 z-10 h-1 bg-blue-400"
				style:top={dropPosition === 'before' ? '-3px' : 'auto'}
				style:bottom={dropPosition === 'after' ? '-3px' : 'auto'}
			></div>
		{/if}

		<button
			type="button"
			class={[
				'w-full cursor-pointer rounded border px-3 py-2 text-left text-sm text-white transition-colors',
				{
					'border-yellow-500': match,
					'border-slate-500': !match,
					'border-2 border-yellow-400 bg-yellow-500/30 font-medium shadow-lg shadow-yellow-500/25 hover:bg-yellow-500/40':
						selectedObject === `node-${globalNodeIndex}`,
					'bg-slate-700 hover:bg-slate-600': selectedObject !== `node-${globalNodeIndex}`,
					'opacity-50': isDragging && draggedNode === node
				}
			]}
			onclick={() => (selectedObject = `node-${globalNodeIndex}`)}
		>
			<div class="flex items-center gap-2">
				<div
					role="button"
					tabindex="0"
					class="flex-shrink-0 cursor-grab text-slate-400 hover:text-slate-300 active:cursor-grabbing"
					draggable="true"
					ondragstart={(e) => handleDragStart(e, node)}
					ondragend={handleDragEnd}
					onclick={(e) => e.stopPropagation()}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							selectedObject = `node-${globalNodeIndex}`;
						} else if (e.key === 'Up') {
							// TODO: Move up
						} else if (e.key === 'Down') {
							// TODO: Move down
						}
					}}
				>
					<IconDragHandle class="h-4 w-4" />
				</div>
				<div class="min-w-0 flex-1">
					{#if match}
						<div class="flex items-center justify-between">
							<span class="truncate">
								{match.teams[0]?.team?.name || 'TBD'} vs {match.teams[1]?.team?.name || 'TBD'}
							</span>
							<span class="text-xs text-slate-400">#{node.order}</span>
						</div>
					{:else}
						<div class="flex items-center justify-between">
							<span class="text-slate-400">{m.no_match_assigned()}</span>
							<span class="text-xs text-slate-500">#{node.order}</span>
						</div>
					{/if}
				</div>
			</div>
		</button>
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
			<p>{m.no_rounds_configured()}</p>
		</div>
	{:else}
		<div class="styled-scroll-horizontal overflow-x-auto">
			<div
				class="inline-grid gap-4 pr-2 pb-2"
				style="grid-template-columns: repeat({rounds.length + 1}, 200px);"
			>
				{#each rounds as round, roundIndex (round.id ?? roundIndex)}
					{@const roundId = round.id ?? roundIndex}
					<div class="flex flex-col items-center">
						<div class="mb-2 text-center">
							<button
								type="button"
								class={[
									'cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors *:inline-block',
									{
										'bg-yellow-500/20 text-yellow-300': selectedObject === `round-${roundIndex}`,
										'bg-slate-600/20 text-slate-300 hover:bg-yellow-500/30':
											selectedObject !== `round-${roundIndex}`
									}
								]}
								onclick={() => (selectedObject = `round-${roundIndex}`)}
							>
								{roundIndex + 1}: {round.title ||
									ROUND_NAMES[round.type as keyof typeof ROUND_NAMES]?.() ||
									round.type}
							</button>
							{#if round.parallelGroup !== undefined}
								<span
									class="ml-1 inline-block rounded-full bg-blue-500/20 px-2 py-1 text-xs text-blue-300"
								>
									{m.group()}
									{round.parallelGroup}
								</span>
							{/if}
						</div>

						<div
							class="flex w-full flex-col gap-2"
							role="list"
							ondragover={(e) => handleDragOver(e, { roundId })}
							ondragleave={handleDragLeave}
							ondrop={(e) => handleDrop(e, { round, roundIndex })}
						>
							<!-- **FIX 2**: Key by the node object itself for stable identity -->
							{#each nodes
								.filter((node) => node.roundId === roundId)
								.sort((a, b) => a.order - b.order) as node (node)}
								{@render nodeElement(node, round, roundIndex)}
							{:else}
								<div
									class="rounded border border-dashed border-slate-600 px-3 py-2 text-center text-xs text-slate-500"
									role="listitem"
								>
									{m.no_nodes()}
								</div>
							{/each}

							{@render addNodePseudoElement(round, roundIndex)}
						</div>
					</div>
				{/each}

				{@render addRoundPseudoColumn()}
			</div>
		</div>

		<div class="mt-4 flex justify-between text-xs text-slate-400">
			<span>{m.total_rounds()}: {rounds.length}</span>
			<span>{m.total_nodes()}: {nodes.length}</span>
			<span>{m.assigned_matches()}: {nodes.filter((n) => n.matchId).length}</span>
		</div>
	{/if}
</div>
