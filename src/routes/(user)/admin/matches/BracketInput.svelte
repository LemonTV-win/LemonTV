<!-- src/routes/(user)/admin/matches/BracketInput.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { m } from '$lib/paraglide/messages';
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
			} else {
				rounds = [];
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
			} else {
				nodes = [];
			}
		} catch (error) {
			console.error('Failed to load existing bracket data:', error);
			errorMessage = 'Failed to load existing bracket data';
		}
	}

	function addRound() {
		rounds = [
			...rounds,
			{
				type: 'round',
				title: '',
				bracket: 'upper',
				isNew: true
			}
		];
	}

	function removeRound(index: number) {
		rounds = rounds.filter((_, i) => i !== index);
		// Also remove nodes that reference this round
		nodes = nodes.filter((node) => node.roundId !== rounds[index]?.id);
	}

	function addNode() {
		if (rounds.length === 0) {
			errorMessage = 'Please add at least one round before adding nodes';
			return;
		}

		nodes = [
			...nodes,
			{
				matchId: '',
				roundId: rounds[0]?.id || 0,
				order: nodes.length,
				dependencies: [],
				isNew: true
			}
		];
	}

	function removeNode(index: number) {
		const nodeToRemove = nodes[index];
		nodes = nodes.filter((_, i) => i !== index);

		// Remove dependencies that reference this node
		nodes.forEach((node) => {
			node.dependencies = node.dependencies.filter(
				(dep) => dep.dependencyMatchId !== nodeToRemove?.matchId
			);
		});
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
	<div class="mb-4 flex items-center justify-between">
		<h3 class="text-xl font-semibold text-white">Edit Bracket Structure</h3>
		<button
			type="button"
			class="rounded-full bg-gray-800 p-1 text-white shadow hover:bg-gray-700"
			onclick={onCancel}
			aria-label="Close"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-5 w-5"
				viewBox="0 0 20 20"
				fill="currentColor"
			>
				<path
					fill-rule="evenodd"
					d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
					clip-rule="evenodd"
				/>
			</svg>
		</button>
	</div>

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
			class="h-full space-y-6 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb]:hover:bg-slate-500 [&::-webkit-scrollbar-track]:bg-slate-800"
		>
			<!-- Stage Rounds Section -->
			<div class="space-y-4">
				<div class="flex items-center justify-between">
					<h4 class="text-lg font-medium text-white">Stage Rounds</h4>
					<button
						type="button"
						class="rounded-md bg-yellow-500 px-4 py-2 font-medium text-black hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
						onclick={addRound}
					>
						Add Round
					</button>
				</div>

				{#each rounds as round, roundIndex (round.id || roundIndex)}
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
								<input
									id="round-parallel-group-{roundIndex}"
									type="number"
									bind:value={round.parallelGroup}
									class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
								/>
							</div>
						</div>

						<div class="mt-3 flex justify-end">
							<button
								type="button"
								class="rounded-md bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
								onclick={() => removeRound(roundIndex)}
							>
								Remove
							</button>
						</div>
					</div>
				{/each}
			</div>

			<!-- Stage Nodes Section -->
			<div class="space-y-4">
				<div class="flex items-center justify-between">
					<h4 class="text-lg font-medium text-white">Stage Nodes</h4>
					<button
						type="button"
						class="rounded-md bg-yellow-500 px-4 py-2 font-medium text-black hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
						onclick={addNode}
					>
						Add Node
					</button>
				</div>

				{#each nodes as node, nodeIndex (node.id || nodeIndex)}
					<div class="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
						<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
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
										</option>
									{/each}
								</select>
							</div>

							<div>
								<label for="node-round-{nodeIndex}" class="block text-sm font-medium text-slate-300"
									>Round</label
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
									class="rounded-md bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
									onclick={() => removeNode(nodeIndex)}
								>
									Remove
								</button>
							</div>
						</div>

						<!-- Dependencies Section -->
						<div class="mt-4 space-y-2">
							<div class="flex items-center justify-between">
								<span class="text-sm font-medium text-slate-300">Dependencies</span>
								<button
									type="button"
									class="rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700"
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
													'TBD'}
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
										class="rounded-md bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700"
										onclick={() => removeDependency(nodeIndex, depIndex)}
									>
										×
									</button>
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>

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
