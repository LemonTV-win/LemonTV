<!-- src/routes/(user)/admin/matches/BracketInput.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { m } from '$lib/paraglide/messages';
	import IconParkSolidDelete from '~icons/icon-park-solid/delete';
	import type { ActionResult } from '@sveltejs/kit';

	let {
		stage,
		matches,
		rounds: initialRounds,
		nodes: initialNodes,
		onCancel,
		onSuccess
	} = $props<{
		stage: {
			id: number;
			title: string;
			stage: string;
			format: string;
		};
		matches: Array<{
			id: string;
			format: string | null;
			stageId: number | null;
			teams: Array<{
				matchId: string | null;
				teamId: string | null;
				position: number;
				score: number;
				team: any;
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
				map: any;
			}>;
		}>;
		rounds?: Array<{
			id: number;
			stageId: number;
			type: string;
			title: string | null;
			bracket: string | null;
			parallelGroup: number | null;
		}>;
		nodes?: Array<{
			id: number;
			stageId: number;
			matchId: string;
			roundId: number;
			order: number;
			dependencies: Array<{
				id: number;
				nodeId: number;
				dependencyMatchId: string;
				outcome: string;
			}>;
		}>;
		onCancel: () => void;
		onSuccess: () => void;
	}>();

	// State for managing rounds, nodes, and dependencies
	let rounds = $state<
		Array<{
			id?: number;
			type: string;
			title: string;
			bracket: string;
			parallelGroup?: number;
			isNew?: boolean;
		}>
	>([]);

	let nodes = $state<
		Array<{
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
		}>
	>([]);

	let selectedRoundIndex = $state<number>(-1);
	let selectedNodeIndex = $state<number>(-1);

	// Delete confirmation state
	let showRoundDeleteConfirm = $state<number | null>(null);
	let showNodeDeleteConfirm = $state<number | null>(null);

	let errorMessage = $state('');
	let successMessage = $state('');

	// Available options
	const roundTypes = [
		'round',
		'quarterfinals',
		'semifinals',
		'final',
		'top16',
		'group',
		'thirdplace',
		'lower',
		'grandfinal'
	] as const;

	const bracketTypes = ['upper', 'lower', 'group'] as const;
	const outcomeTypes = ['winner', 'loser'] as const;

	// Initialize with existing data if available
	$effect(() => {
		if (stage) {
			loadExistingData();
		}
	});

	// Auto-create new round when "New Round" is selected
	$effect(() => {
		if (selectedRoundIndex === -1) {
			addRound();
		}
	});

	async function loadExistingData() {
		try {
			// Load existing rounds from props
			if (initialRounds && initialRounds.length > 0) {
				rounds = initialRounds.map((round: (typeof initialRounds)[0]) => ({
					id: round.id,
					type: round.type,
					title: round.title || '',
					bracket: round.bracket || 'upper',
					parallelGroup: round.parallelGroup || undefined,
					isNew: false
				}));
				selectedRoundIndex = 0; // Select first round by default
			} else {
				rounds = [];
				selectedRoundIndex = -1;
			}

			// Load existing nodes from props
			if (initialNodes && initialNodes.length > 0) {
				nodes = initialNodes.map((node: (typeof initialNodes)[0]) => ({
					id: node.id,
					matchId: node.matchId,
					roundId: node.roundId,
					order: node.order,
					dependencies: node.dependencies.map((dep: (typeof node.dependencies)[0]) => ({
						id: dep.id,
						dependencyMatchId: dep.dependencyMatchId,
						outcome: dep.outcome as 'winner' | 'loser'
					})),
					isNew: false
				}));
				selectedNodeIndex = 0; // Select first node by default
			} else {
				nodes = [];
				selectedNodeIndex = -1;
			}
		} catch (error) {
			console.error('Failed to load existing bracket data:', error);
			errorMessage = 'Failed to load existing bracket data';
		}
	}

	function addRound() {
		const newRoundIndex = rounds.length;
		rounds = [
			...rounds,
			{
				type: 'round',
				title: '',
				bracket: 'upper',
				isNew: true
			}
		];
		selectedRoundIndex = newRoundIndex;
	}

	function removeRound(index: number) {
		rounds = rounds.filter((_, i) => i !== index);
		// Also remove nodes that reference this round
		nodes = nodes.filter((node) => node.roundId !== rounds[index]?.id);

		// Update selection
		if (selectedRoundIndex === index) {
			selectedRoundIndex = rounds.length > 0 ? 0 : -1;
		} else if (selectedRoundIndex > index) {
			selectedRoundIndex--;
		}
	}

	function confirmRemoveRound(index: number) {
		showRoundDeleteConfirm = index;
	}

	function cancelRemoveRound() {
		showRoundDeleteConfirm = null;
	}

	function addNode() {
		if (rounds.length === 0) {
			errorMessage = 'Please add at least one round before adding nodes';
			return;
		}

		const newNodeIndex = nodes.length;
		const targetRoundId = rounds[0]?.id || 0;

		// Find the largest order within the target round
		const roundNodes = nodes.filter((node) => node.roundId === targetRoundId);
		const maxOrder = roundNodes.length > 0 ? Math.max(...roundNodes.map((node) => node.order)) : 0;

		nodes = [
			...nodes,
			{
				matchId: '',
				roundId: targetRoundId,
				order: maxOrder + 1,
				dependencies: [],
				isNew: true
			}
		];
		selectedNodeIndex = newNodeIndex;
	}

	// Auto-create new node when "New Node" is selected
	$effect(() => {
		if (selectedNodeIndex === -1 && selectedRoundIndex >= 0) {
			addNode();
		}
	});

	function removeNode(index: number) {
		const nodeToRemove = nodes[index];
		nodes = nodes.filter((_, i) => i !== index);

		// Remove dependencies that reference this node
		nodes.forEach((node) => {
			node.dependencies = node.dependencies.filter(
				(dep) => dep.dependencyMatchId !== nodeToRemove?.matchId
			);
		});

		// Update selection
		if (selectedNodeIndex === index) {
			selectedNodeIndex = nodes.length > 0 ? 0 : -1;
		} else if (selectedNodeIndex > index) {
			selectedNodeIndex--;
		}
	}

	function confirmRemoveNode(index: number) {
		showNodeDeleteConfirm = index;
	}

	function cancelRemoveNode() {
		showNodeDeleteConfirm = null;
	}

	function addDependency(nodeIndex: number) {
		if (!nodes[nodeIndex]) return;

		nodes[nodeIndex].dependencies = [
			...nodes[nodeIndex].dependencies,
			{
				dependencyMatchId: '',
				outcome: 'winner'
			}
		];
	}

	function removeDependency(nodeIndex: number, depIndex: number) {
		if (!nodes[nodeIndex]) return;

		nodes[nodeIndex].dependencies = nodes[nodeIndex].dependencies.filter((_, i) => i !== depIndex);
	}

	function saveBracketStructure() {
		// Validate data
		if (rounds.length === 0) {
			errorMessage = 'At least one round is required';
			return;
		}

		if (nodes.length === 0) {
			errorMessage = 'At least one node is required';
			return;
		}

		// Check for circular dependencies
		const hasCircularDependency = checkCircularDependencies();
		if (hasCircularDependency) {
			errorMessage = 'Circular dependencies detected';
			return;
		}

		// Save data
		saveData();
	}

	function checkCircularDependencies(): boolean {
		const visited = new Set<string>();
		const recursionStack = new Set<string>();

		function hasCycle(matchId: string): boolean {
			if (recursionStack.has(matchId)) return true;
			if (visited.has(matchId)) return false;

			visited.add(matchId);
			recursionStack.add(matchId);

			const node = nodes.find((n) => n.matchId === matchId);
			if (node) {
				for (const dep of node.dependencies) {
					if (hasCycle(dep.dependencyMatchId)) return true;
				}
			}

			recursionStack.delete(matchId);
			return false;
		}

		for (const node of nodes) {
			if (hasCycle(node.matchId)) return true;
		}

		return false;
	}

	async function saveData() {
		try {
			// Save rounds first
			for (const round of rounds) {
				if (round.isNew) {
					// Create new round
					const formData = new FormData();
					formData.append('stageId', stage.id.toString());
					formData.append('type', round.type);
					formData.append('title', round.title);
					formData.append('bracket', round.bracket);
					if (round.parallelGroup) {
						formData.append('parallelGroup', round.parallelGroup.toString());
					}

					const response = await fetch('?/createStageRound', {
						method: 'POST',
						body: formData
					});

					if (!response.ok) {
						throw new Error('Failed to create stage round');
					}

					const result = await response.json();
					if (result.type === 'success') {
						round.id = result.data?.roundId;
						round.isNew = false;
					}
				} else if (round.id) {
					// Update existing round
					const formData = new FormData();
					formData.append('id', round.id.toString());
					formData.append('stageId', stage.id.toString());
					formData.append('type', round.type);
					formData.append('title', round.title);
					formData.append('bracket', round.bracket);
					if (round.parallelGroup) {
						formData.append('parallelGroup', round.parallelGroup.toString());
					}

					const response = await fetch('?/updateStageRound', {
						method: 'POST',
						body: formData
					});

					if (!response.ok) {
						throw new Error('Failed to update stage round');
					}
				}
			}

			// Save nodes
			for (const node of nodes) {
				if (node.isNew) {
					// Create new node
					const formData = new FormData();
					formData.append('stageId', stage.id.toString());
					formData.append('matchId', node.matchId);
					formData.append('roundId', node.roundId.toString());
					formData.append('order', node.order.toString());

					const response = await fetch('?/createStageNode', {
						method: 'POST',
						body: formData
					});

					if (!response.ok) {
						throw new Error('Failed to create stage node');
					}

					const result = await response.json();
					if (result.type === 'success') {
						node.id = result.data?.nodeId;
						node.isNew = false;
					}
				} else if (node.id) {
					// Update existing node
					const formData = new FormData();
					formData.append('id', node.id.toString());
					formData.append('stageId', stage.id.toString());
					formData.append('matchId', node.matchId);
					formData.append('roundId', node.roundId.toString());
					formData.append('order', node.order.toString());

					const response = await fetch('?/updateStageNode', {
						method: 'POST',
						body: formData
					});

					if (!response.ok) {
						throw new Error('Failed to update stage node');
					}
				}

				// Save dependencies
				if (node.id) {
					for (const dep of node.dependencies) {
						if (!dep.id) {
							// Create new dependency
							const formData = new FormData();
							formData.append('nodeId', node.id.toString());
							formData.append('dependencyMatchId', dep.dependencyMatchId);
							formData.append('outcome', dep.outcome);

							const response = await fetch('?/createStageNodeDependency', {
								method: 'POST',
								body: formData
							});

							if (!response.ok) {
								throw new Error('Failed to create stage node dependency');
							}
						}
					}
				}
			}

			successMessage = 'Bracket structure saved successfully';
			setTimeout(() => {
				onSuccess();
			}, 1000);
		} catch (error) {
			console.error('Failed to save bracket structure:', error);
			errorMessage = 'Failed to save bracket structure';
		}
	}
</script>

<div class="flex h-full flex-col">
	<section class="mb-4">
		<h4 class="text-lg font-medium text-white">Bracket Structure Preview</h4>

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
						{#each rounds as round, roundIndex}
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
										{round.title || round.type}
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
									{#each nodes.filter((node) => node.roundId === (round.id || roundIndex)) as node, nodeIndex}
										{@const match = matches.find((m: any) => m.id === node.matchId)}
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
															{match.teams[0]?.team?.name || 'TBD'} vs {match.teams[1]?.team
																?.name || 'TBD'}
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
									{:else}
										<div
											class="rounded border border-dashed border-slate-600 px-3 py-2 text-center text-xs text-slate-500"
										>
											No nodes
										</div>
									{/each}

									<!-- Add Node Pseudo Element -->
									<button
										type="button"
										class="rounded border-2 border-dashed border-slate-600 bg-slate-700/30 px-3 py-2 text-center text-xs text-slate-400 transition-colors hover:border-slate-500 hover:bg-slate-700/50 hover:text-slate-300"
										onclick={() => {
											const targetRoundId = round.id || roundIndex;

											// Find the largest order within the target round
											const roundNodes = nodes.filter((node) => node.roundId === targetRoundId);
											const maxOrder =
												roundNodes.length > 0
													? Math.max(...roundNodes.map((node) => node.order))
													: 0;

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
								</div>
							</div>
						{/each}

						<!-- Add Round Pseudo Column -->
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
	</section>

	{#if errorMessage}
		<div class="mb-4 rounded-md bg-red-900/50 p-4 text-red-200" role="alert">
			<span class="block sm:inline">{errorMessage}</span>
		</div>
	{/if}

	{#if successMessage}
		<div class="mb-4 rounded-md bg-green-900/50 p-4 text-green-200" role="alert">
			<span class="block sm:inline">{successMessage}</span>
		</div>
	{/if}

	<div class="min-h-0 flex-1">
		<div
			class="h-full space-y-4 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb:hover]:bg-slate-500 [&::-webkit-scrollbar-track]:bg-slate-800"
		>
			<!-- Stage Rounds Section -->
			<section class="space-y-4">
				<div class="flex items-center justify-between">
					<h4 class="text-lg font-medium text-white">Selected Stage Round</h4>
					<select
						bind:value={selectedRoundIndex}
						class="mt-1 block w-64 rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
					>
						{#each rounds as round, roundIndex}
							<option value={roundIndex}>{round.title || round.type}</option>
						{/each}
						<option disabled>──────────</option>
						<option value={-1}>New Round</option>
					</select>
				</div>

				{#if selectedRoundIndex >= 0 && rounds[selectedRoundIndex]}
					{@const round = rounds[selectedRoundIndex]}
					{@const roundIndex = selectedRoundIndex}
					<div class="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
						<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
							<div>
								<label
									for="round-type-{roundIndex}"
									class="block text-sm font-medium text-slate-300">Type</label
								>
								<select
									id="round-type-{roundIndex}"
									bind:value={round.type}
									class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
								>
									{#each roundTypes as type}
										<option value={type}>{type}</option>
									{/each}
								</select>
							</div>

							<div>
								<label
									for="round-title-{roundIndex}"
									class="block text-sm font-medium text-slate-300">Title</label
								>
								<input
									id="round-title-{roundIndex}"
									type="text"
									bind:value={round.title}
									class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
								/>
							</div>

							<div>
								<label
									for="round-bracket-{roundIndex}"
									class="block text-sm font-medium text-slate-300">Bracket</label
								>
								<select
									id="round-bracket-{roundIndex}"
									bind:value={round.bracket}
									class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
								>
									{#each bracketTypes as bracket}
										<option value={bracket}>{bracket}</option>
									{/each}
								</select>
							</div>

							<div>
								<label
									for="round-parallel-group-{roundIndex}"
									class="block text-sm font-medium text-slate-300">Parallel Group</label
								>
								<select
									id="round-parallel-group-{roundIndex}"
									bind:value={round.parallelGroup}
									class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
								>
									<option value={undefined}>None</option>
									{#each rounds.filter((r) => r.parallelGroup === undefined && r.id !== round.id) as availableRound}
										<option value={availableRound.id}>
											{availableRound.title || availableRound.type}
										</option>
									{/each}
								</select>
							</div>
						</div>

						<div class="mt-3 flex justify-end">
							<button
								type="button"
								class="text-red-500 hover:text-red-400"
								onclick={() => confirmRemoveRound(roundIndex)}
								aria-label="Remove round"
							>
								<IconParkSolidDelete class="h-4 w-4" />
							</button>
						</div>
					</div>
				{:else}
					<div class="rounded-lg border border-slate-700 bg-slate-800/50 p-8 text-center">
						<p class="text-slate-400">
							Select a round from the preview above to edit its properties
						</p>
					</div>
				{/if}
			</section>

			<!-- Stage Nodes Section -->
			<section class="space-y-4">
				<div class="flex items-center justify-between">
					<h4 class="text-lg font-medium text-white">Selected Stage Node</h4>
					<select
						bind:value={selectedNodeIndex}
						class="mt-1 block w-64 rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
					>
						{#each nodes as node, nodeIndex}
							{@const match = matches.find((m: any) => m.id === node.matchId)}
							{@const round = rounds.find((r) => r.id === node.roundId || r.id === node.roundId)}
							<option value={nodeIndex}>
								{round?.title || round?.type || 'Unknown Round'} - {match
									? `${match.teams[0]?.team?.name || 'TBD'} vs ${match.teams[1]?.team?.name || 'TBD'} (${match.id})`
									: 'No match'} (#{node.order})
							</option>
						{/each}
						<option disabled>──────────</option>
						<option value={-1}>New Node</option>
					</select>
				</div>

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
									{#each matches as match}
										<option value={match.id}>
											{match.teams[0]?.team?.name || 'TBD'} vs {match.teams[1]?.team?.name || 'TBD'}
											({match.id})
										</option>
									{/each}
								</select>
							</div>

							<div class="grid grid-cols-2 gap-4 md:grid-cols-3">
								<div>
									<label
										for="node-round-{nodeIndex}"
										class="block text-sm font-medium text-slate-300">Round</label
									>
									<select
										id="node-round-{nodeIndex}"
										bind:value={node.roundId}
										class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
									>
										{#each rounds as round, roundIndex}
											<option value={round.id || roundIndex}>
												{round.title || round.type}
											</option>
										{/each}
									</select>
								</div>

								<div>
									<label
										for="node-order-{nodeIndex}"
										class="block text-sm font-medium text-slate-300">Order</label
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

							{#each node.dependencies as dep, depIndex}
								<div
									class="flex items-center gap-2 rounded border border-slate-600 bg-slate-700/50 p-2"
								>
									<select
										id="dep-match-{nodeIndex}-{depIndex}"
										bind:value={dep.dependencyMatchId}
										class="flex-1 rounded border border-slate-600 bg-slate-800 px-2 py-1 text-sm text-white"
									>
										<option value="">Select Match</option>
										{#each matches as match}
											<option value={match.id}>
												{match.teams[0]?.team?.name || 'TBD'} vs {match.teams[1]?.team?.name ||
													'TBD'} ({match.id})
											</option>
										{/each}
									</select>

									<select
										id="dep-outcome-{nodeIndex}-{depIndex}"
										bind:value={dep.outcome}
										class="rounded border border-slate-600 bg-slate-800 px-2 py-1 text-sm text-white"
									>
										{#each outcomeTypes as outcome}
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
						<p class="text-slate-400">
							Select a node from the dropdown above to edit its properties
						</p>
					</div>
				{/if}
			</section>
		</div>
	</div>

	<!-- Delete Confirmation Dialogs -->
	{#if showRoundDeleteConfirm !== null}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
			<div class="rounded-lg border border-slate-700 bg-slate-800 p-6 shadow-xl">
				<h3 class="mb-4 text-lg font-medium text-white">Confirm Delete Round</h3>
				<p class="mb-6 text-slate-300">
					Are you sure you want to delete the round "{rounds[showRoundDeleteConfirm]?.title ||
						rounds[showRoundDeleteConfirm]?.type}"? This will also remove all nodes associated with
					this round.
				</p>
				<div class="flex justify-end gap-3">
					<button
						type="button"
						class="rounded-md border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-700"
						onclick={cancelRemoveRound}
					>
						Cancel
					</button>
					<button
						type="button"
						class="rounded-md bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none"
						onclick={() => {
							removeRound(showRoundDeleteConfirm!);
							showRoundDeleteConfirm = null;
						}}
					>
						Delete Round
					</button>
				</div>
			</div>
		</div>
	{/if}

	{#if showNodeDeleteConfirm !== null}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
			<div class="rounded-lg border border-slate-700 bg-slate-800 p-6 shadow-xl">
				<h3 class="mb-4 text-lg font-medium text-white">Confirm Delete Node</h3>
				<p class="mb-6 text-slate-300">
					Are you sure you want to delete this node? This action cannot be undone.
				</p>
				<div class="flex justify-end gap-3">
					<button
						type="button"
						class="rounded-md border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-700"
						onclick={cancelRemoveNode}
					>
						Cancel
					</button>
					<button
						type="button"
						class="rounded-md bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none"
						onclick={() => {
							removeNode(showNodeDeleteConfirm!);
							showNodeDeleteConfirm = null;
						}}
					>
						Delete Node
					</button>
				</div>
			</div>
		</div>
	{/if}

	<div class="mt-6 flex justify-end gap-4 border-t border-slate-700 pt-4">
		<button
			type="button"
			class="rounded-md border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-800"
			onclick={onCancel}
		>
			{m.cancel()}
		</button>
		<button
			type="button"
			class="rounded-md bg-yellow-500 px-4 py-2 font-medium text-black hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
			onclick={saveBracketStructure}
		>
			Save Bracket Structure
		</button>
	</div>
</div>
