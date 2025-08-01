<script module lang="ts">
	export type InitialRound = {
		id: number;
		stageId: number;
		type: string;
		title: string | null;
		bracket: string | null;
		parallelGroup: number | null;
	};

	export type Round = {
		id?: number;
		type: string;
		title: string;
		bracket: string;
		parallelGroup?: number;
		isNew?: boolean;
	};

	export type InitialNode = {
		id: number;
		stageId: number;
		matchId: string;
		roundId: number;
		order: number;
	};

	export type Node = {
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

	export type Match = {
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
	};
</script>

<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { applyAction, deserialize } from '$app/forms';
	import { m } from '$lib/paraglide/messages';
	import type { ActionResult } from '@sveltejs/kit';
	import Brackets from '$lib/components/Brackets.svelte';
	import type { Team } from '$lib/data/teams';
	import type { GameMap } from '$lib/data/game';
	import BracketStructure from './BracketStructure.svelte';
	import BracketStageRoundInput from './BracketStageRoundInput.svelte';
	import BracketStageNodeInput from './BracketStageNodeInput.svelte';
	import Switch from '$lib/components/ui/Switch.svelte';
	let {
		stage,
		matches,
		rounds: initialRounds,
		nodes: initialNodes,
		onCancel,
		onSuccess
	}: {
		stage: {
			id: number;
			title: string;
			stage: string;
			format: string;
		};
		matches: Array<Match>;
		rounds?: InitialRound[];
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
	} = $props();

	// State for managing rounds, nodes, and dependencies
	let rounds = $state<Round[]>([]);

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

	let selectedObject = $state<string>('');

	// Delete confirmation state
	let showRoundDeleteConfirm = $state<number | null>(null);
	let showNodeDeleteConfirm = $state<number | null>(null);

	let errorMessage = $state('');
	let successMessage = $state('');

	// Preview toggle state
	let showPreview = $state(false);

	// Helper function to get available matches for a specific node
	function getAvailableMatches(currentNodeIndex: number) {
		// Get all match IDs that are already assigned to other nodes
		const assignedMatchIds = new Set(
			nodes
				.map((node, index) => ({ node, index }))
				.filter(({ index }) => index !== currentNodeIndex) // Exclude current node
				.map(({ node }) => node.matchId)
				.filter((matchId) => matchId) // Filter out empty strings
		);

		// Return matches that are not already assigned
		return matches.filter((match: (typeof matches)[0]) => !assignedMatchIds.has(match.id));
	}

	// Helper function to get available matches for dependencies
	function getAvailableMatchesForDependencies(currentNodeIndex: number, currentDepIndex: number) {
		const currentNode = nodes[currentNodeIndex];
		if (!currentNode) return matches;

		// Get matches that aren't already dependencies for this node
		const usedMatchIds = new Set(
			currentNode.dependencies
				.filter((_, i) => i !== currentDepIndex)
				.map((d) => d.dependencyMatchId)
		);

		return matches.filter((match) => !usedMatchIds.has(match.id));
	}

	// Initialize with existing data if available
	$effect(() => {
		if (stage) {
			loadExistingData();
		}
	});

	// Auto-create new round when no round is selected
	$effect(() => {
		if (!selectedObject) {
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
				selectedObject = 'round-0'; // Select first round by default
			} else {
				rounds = [];
				selectedObject = '';
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
				// Don't auto-select first node, let user choose
			} else {
				nodes = [];
			}
		} catch (error) {
			console.error('Failed to load existing bracket data:', error);
			errorMessage = 'Failed to load existing bracket data';
		}
	}

	function addRound() {
		console.log('[BracketEdit] add round');
		const newRoundIndex = rounds.length;
		const maxRoundID = Math.max(...rounds.map((r) => r.id || 0));
		rounds = [
			...rounds,
			{
				id: maxRoundID + 1,
				type: 'quarterfinals',
				title: '',
				bracket: 'upper',
				isNew: true
			}
		];
		selectedObject = `round-${newRoundIndex}`;
		addNode(false);
	}

	$inspect(`[BracketEdit] rounds`, rounds);
	$inspect(`[BracketEdit] nodes`, nodes);

	async function removeRound(index: number) {
		const roundToRemove = rounds[index];

		// If the round has an ID (exists in database), delete it via API
		if (roundToRemove.id && !roundToRemove.isNew) {
			try {
				const formData = new FormData();
				formData.append('action', 'deleteStageRound');
				formData.append('id', roundToRemove.id.toString());
				formData.append('stageId', stage.id.toString());

				const response = await fetch('?/deleteStageRound', {
					method: 'POST',
					body: formData
				});

				if (!response.ok) {
					throw new Error('Failed to delete stage round');
				}

				const result: ActionResult = deserialize(await response.text());
				applyAction(result);
			} catch (error) {
				console.error('Failed to delete stage round:', error);
				errorMessage = 'Failed to delete stage round';
				return;
			}
		}

		// Remove from local state
		rounds = rounds.filter((_, i) => i !== index);

		// Also remove nodes that reference this round
		nodes = nodes.filter((node) => node.roundId !== roundToRemove?.id);

		// Update selection
		if (selectedObject === `round-${index}`) {
			selectedObject = rounds.length > 0 ? 'round-0' : '';
		} else if (selectedObject.startsWith('round-')) {
			const currentRoundIndex = parseInt(selectedObject.split('-')[1]);
			if (currentRoundIndex > index) {
				selectedObject = `round-${currentRoundIndex - 1}`;
			}
		}
	}

	function confirmRemoveRound(index: number) {
		showRoundDeleteConfirm = index;
	}

	function cancelRemoveRound() {
		showRoundDeleteConfirm = null;
	}

	function addNode(select: boolean = true) {
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
		if (select) {
			selectedObject = `node-${newNodeIndex}`;
		}
	}

	async function removeNode(index: number) {
		const nodeToRemove = nodes[index];

		// If the node has an ID (exists in database), delete it via API
		if (nodeToRemove.id && !nodeToRemove.isNew) {
			try {
				const formData = new FormData();
				formData.append('action', 'deleteStageNode');
				formData.append('id', nodeToRemove.id.toString());
				formData.append('stageId', stage.id.toString());

				const response = await fetch('?/deleteStageNode', {
					method: 'POST',
					body: formData
				});

				if (!response.ok) {
					throw new Error('Failed to delete stage node');
				}

				const result: ActionResult = deserialize(await response.text());
				applyAction(result);
			} catch (error) {
				console.error('Failed to delete stage node:', error);
				errorMessage = 'Failed to delete stage node';
				return;
			}
		}

		// Remove from local state
		nodes = nodes.filter((_, i) => i !== index);

		// Remove dependencies that reference this node
		nodes.forEach((node) => {
			node.dependencies = node.dependencies.filter(
				(dep) => dep.dependencyMatchId !== nodeToRemove?.matchId
			);
		});

		// Update selection
		if (selectedObject === `node-${index}`) {
			selectedObject = nodes.length > 0 ? 'node-0' : '';
		} else if (selectedObject.startsWith('node-')) {
			const currentNodeIndex = parseInt(selectedObject.split('-')[1]);
			if (currentNodeIndex > index) {
				selectedObject = `node-${currentNodeIndex - 1}`;
			}
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
					formData.append('action', 'createStageRound');
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

					const result: ActionResult = deserialize(await response.text());
					applyAction(result);

					if (result.type === 'success') {
						round.id = result.data?.roundId;
						round.isNew = false;
					}
				} else if (round.id) {
					// Update existing round
					const formData = new FormData();
					formData.append('action', 'updateStageRound');
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

					const result: ActionResult = deserialize(await response.text());
					applyAction(result);
				}
			}

			// Save nodes
			for (const node of nodes) {
				if (node.isNew) {
					// Create new node
					const formData = new FormData();
					formData.append('action', 'createStageNode');
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

					const result: ActionResult = deserialize(await response.text());
					applyAction(result);

					if (result.type === 'success') {
						node.id = result.data?.nodeId;
						node.isNew = false;
					}
				} else if (node.id) {
					// Update existing node
					const formData = new FormData();
					formData.append('action', 'updateStageNode');
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

					const result: ActionResult = deserialize(await response.text());
					applyAction(result);
				}

				// Save dependencies
				if (node.id) {
					for (const dep of node.dependencies) {
						if (!dep.id) {
							// Create new dependency
							const formData = new FormData();
							formData.append('action', 'createStageNodeDependency');
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

							const result: ActionResult = deserialize(await response.text());
							applyAction(result);
						}
					}
				}
			}

			// Invalidate all data to refresh the page
			await invalidateAll();

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
		<div class="mb-4 flex items-center justify-between">
			<h4 class="text-lg font-medium text-white">Bracket Structure</h4>
			<Switch label="Show Preview" bind:checked={showPreview} />
		</div>

		{#if showPreview && stage}
			<div class="mb-4 rounded-md border border-slate-700 bg-slate-800/50 p-4">
				<Brackets
					stage={{
						...stage,
						stage: stage.stage as 'qualifier' | 'playoff' | 'group' | 'showmatch',
						format: stage.format as 'single' | 'double' | 'swiss' | 'round-robin',
						matches: matches.map((match) => ({
							id: match.id,
							teams: [
								{
									team: match.teams[0]?.team?.name || '',
									score: match.teams[0]?.score || 0
								},
								{
									team: match.teams[1]?.team?.name || '',
									score: match.teams[1]?.score || 0
								}
							] as [
								{
									team: string;
									score: number;
								},
								{
									team: string;
									score: number;
								}
							],
							battleOf: (match.format as 'BO1' | 'BO3' | 'BO5') || 'BO1',
							maps: match.maps.map((map) => ({
								map: map.map.id as GameMap,
								pickerId: map.map_picker_position,
								pickedSide: map.side === 0 ? 'Attack' : 'Defense'
							}))
						})),
						structure: {
							rounds: rounds.map((round) => ({
								id: round.id || 0,
								type: round.type as
									| 'quarterfinals'
									| 'semifinals'
									| 'final'
									| 'top16'
									| 'group'
									| 'thirdplace'
									| 'lower'
									| 'grandfinal',
								title: round.title
									? {
											en: round.title,
											es: round.title,
											zh: round.title,
											ko: round.title,
											ja: round.title,
											'pt-br': round.title,
											de: round.title,
											ru: round.title,
											'zh-tw': round.title,
											vi: round.title,
											id: round.title,
											fr: round.title,
											'uk-ua': round.title
										}
									: undefined,
								parallelGroup: round.parallelGroup
							})),
							nodes: nodes.map((node) => ({
								matchId: node.matchId,
								round: node.roundId,
								dependsOn: node.dependencies.map((dep) => ({
									matchId: dep.dependencyMatchId,
									outcome: dep.outcome
								})),
								order: node.order
							}))
						}
					}}
					teams={new Map()}
				/>
			</div>
		{/if}

		<BracketStructure {rounds} {nodes} {matches} bind:selectedObject {addRound} {addNode} />
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
			<div class="flex items-center justify-between">
				<h4 class="text-lg font-medium text-white">
					Selected Item
					{#if selectedObject?.startsWith('round')}
						(Round)
					{:else if selectedObject?.startsWith('node')}
						(Node)
					{/if}
				</h4>
				<select
					bind:value={selectedObject}
					class="mt-1 block w-64 rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
				>
					{#each rounds as round, roundIndex (`round-#${roundIndex}`)}
						<option value={`round-${roundIndex}`}>
							Round {roundIndex + 1}: {round.title || round.type}
						</option>
						{#each nodes.filter((node) => node.roundId === round.id) as node, j (`node-${roundIndex}-${j}`)}
							{@const nodeIndex = nodes.indexOf(node)}
							{@const match = matches.find((m: (typeof matches)[0]) => m.id === node.matchId)}
							{@const team1Score = match?.teams[0]?.score || 0}
							{@const team2Score = match?.teams[1]?.score || 0}
							<option value={`node-${nodeIndex}`}>
								Node #{nodeIndex + 1}: {round?.title || round?.type || 'Unknown Round'} - {match
									? `${match.teams[0]?.team?.name || 'TBD'} vs ${match.teams[1]?.team?.name || 'TBD'} (${team1Score}-${team2Score}) - ${match.id}`
									: 'No match'} (#{node.order})
							</option>
						{/each}
						<option disabled>──────────</option>
					{/each}
					<!-- Orphaned nodes -->
					<optgroup label="Nodes without round">
						{#each nodes.filter((node) => !rounds.some((r) => r.id === node.roundId)) as node, k (`node-#${k}`)}
							{@const nodeIndex = nodes.indexOf(node)}
							{@const match = matches.find((m: (typeof matches)[0]) => m.id === node.matchId)}
							{@const team1Score = match?.teams[0]?.score || 0}
							{@const team2Score = match?.teams[1]?.score || 0}
							<option value={`node-${nodeIndex}`}>
								Node #{nodeIndex + 1}: {match
									? `${match.teams[0]?.team?.name || 'TBD'} vs ${match.teams[1]?.team?.name || 'TBD'} (${team1Score}-${team2Score}) - ${match.id}`
									: 'No match'} (#{node.order})
							</option>
						{/each}
					</optgroup>
					<option disabled>──────────</option>
					<option
						value={{
							type: 'round',
							roundIndex: -1
						}}>New Round</option
					>
					<option
						value={{
							type: 'node',
							nodeIndex: -1
						}}>New Node</option
					>
				</select>
			</div>

			<!-- Stage Rounds Section -->
			<BracketStageRoundInput {rounds} {selectedObject} {confirmRemoveRound} />

			<!-- Stage Nodes Section -->
			<BracketStageNodeInput
				{nodes}
				{matches}
				{rounds}
				{selectedObject}
				{confirmRemoveNode}
				{addDependency}
				{removeDependency}
				{getAvailableMatches}
				{getAvailableMatchesForDependencies}
			/>
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
						onclick={async () => {
							await removeRound(showRoundDeleteConfirm!);
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
						onclick={async () => {
							await removeNode(showNodeDeleteConfirm!);
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
