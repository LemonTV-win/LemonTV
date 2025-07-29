<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import type { PageProps } from './$types';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { invalidateAll } from '$app/navigation';
	import MaterialSymbolsFilterListRounded from '~icons/material-symbols/filter-list-rounded';
	import MaterialSymbolsSearchRounded from '~icons/material-symbols/search-rounded';
	import IconParkSolidEdit from '~icons/icon-park-solid/edit';
	import TypcnArrowUnsorted from '~icons/typcn/arrow-unsorted';
	import TypcnArrowSortedDown from '~icons/typcn/arrow-sorted-down';
	import TypcnArrowSortedUp from '~icons/typcn/arrow-sorted-up';
	import IconParkSolidDelete from '~icons/icon-park-solid/delete';
	import { goto } from '$app/navigation';
	import MatchEdit from './MatchEdit.svelte';
	import type { Match, MatchTeam, MatchMap } from '$lib/server/db/schema';
	import StageEdit from './StageEdit.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import BracketInput from './BracketInput.svelte';
	import GameEdit from './GameEdit.svelte';
	import type { GameParticipant } from './+page.server';

	let { data }: PageProps = $props();

	$inspect('[admin/matches] data', data);

	// Handle URL parameters for modal state
	$effect(() => {
		if (data.action === 'editMatch' && data.id) {
			// Find the match to edit
			if (selectedEventData) {
				for (const stageData of Object.values(selectedEventData.stages)) {
					const match = stageData.matches.find((m) => m.id === data.id);
					if (match) {
						editingMatch = {
							match,
							matchTeams: match.teams.map((t) => ({
								matchId: match.id,
								teamId: t.teamId,
								position: t.position,
								score: t.score
							})),
							matchMaps: match.maps.map((m) => ({
								...m,
								action: m.action as 'ban' | 'pick' | 'decider' | null
							}))
						};

						// Check if we should show delete modal
						if (data.delete === 'true') {
							showDeleteModal = true;
						}
						break;
					}
				}
			}
		} else if (data.action === 'editStage' && data.id) {
			// Find the stage to edit
			if (selectedEventData) {
				const stageId = parseInt(data.id);
				const stageData = selectedEventData.stages[stageId];
				if (stageData) {
					editingStage = { stage: stageData.stage };
				}
			}
		} else if (data.action === 'newMatch') {
			editingMatch = {
				match: {
					format: 'bo1',
					stageId: null
				},
				matchTeams: [],
				matchMaps: []
			};
		} else if (data.action === 'newStage') {
			editingStage = {};
		}
	});

	type EventData = {
		event: {
			id: string;
			name: string;
			slug: string;
			official: boolean;
			server: string;
			format: string;
			region: string;
			image: string;
			status: 'live' | 'upcoming' | 'finished' | 'cancelled' | 'postponed';
			date: string;
			createdAt: Date;
			updatedAt: Date;
		};
		stages: Record<
			number,
			{
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
						position: number | null;
						score: number | null;
						team: {
							id: string;
							name: string;
							slug: string;
							abbr: string;
							logo: string;
							region: string;
						};
					}>;
					maps: Array<{
						id: number;
						matchId: string;
						mapId: string;
						order: number;
						side: number;
						map_picker_position: number;
						side_picker_position: number;
						map: {
							id: string;
						};
						action?: string;
					}>;
					games: Array<{
						id: number;
						matchId: string;
						mapId: string;
						duration: number;
						winner: number;
						map: {
							id: string;
						};
						teams: Array<{
							gameId: number;
							teamId: string;
							position: number;
							score: number;
							team: {
								id: string;
								name: string;
								slug: string;
								abbr: string;
								logo: string;
								region: string;
							};
						}>;
						playerScores: Array<{
							id: number;
							gameId: number;
							teamId: string;
							accountId: number;
							player: string;
							characterFirstHalf: string | null;
							characterSecondHalf: string | null;
							score: number;
							damageScore: number;
							kills: number;
							knocks: number;
							deaths: number;
							assists: number;
							damage: number;
						}>;
					}>;
				}>;
				rounds: Array<{
					id: number;
					stageId: number;
					type: string;
					title: string | null;
					bracket: string | null;
					parallelGroup: number | null;
				}>;
				nodes: Array<{
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
			}
		>;
	};

	let searchQuery = $state(data.searchQuery ?? '');
	let selectedEventId = $state<string | null>(null);
	let sortBy: 'id-asc' | 'id-desc' | 'format-asc' | 'format-desc' = $state('id-asc');
	let editingMatch = $state<{
		match: Partial<Match>;
		matchTeams: MatchTeam[];
		matchMaps: MatchMap[];
	} | null>(null);
	let editingStage = $state<{
		stage?: {
			id: number;
			title: string;
			stage: string;
			format: string;
		};
	} | null>(null);
	let showDeleteModal = $state(false);
	let isDeleting = $state(false);
	let selectedEvent = $state(data.event || '');
	let selectedStage = $state<
		| {
				id: number;
				title: string;
				stage: string;
				format: string;
		  }
		| undefined
	>(undefined);
	let showStageEdit = $state(false);
	let showBracketEdit = $state(false);
	let errorMessage = $state('');
	let successMessage = $state('');
	let editingGame = $state<{
		game?: any; // For editing, undefined for new
		matchId: string;
		matchTeamA: { id: string; name: string; logo?: string };
		matchTeamB: { id: string; name: string; logo?: string };
		rosters: [
			{
				player: GameParticipant;
				job: 'main' | 'sub' | 'coach';
			}[],
			{
				player: GameParticipant;
				job: 'main' | 'sub' | 'coach';
			}[]
		];
	} | null>(null);
	$inspect('[admin/matches] editingGame', editingGame);

	let deletingGame = $state<{ game: any; matchId: string } | null>(null);
	let isDeletingGame = $state(false);

	function openGameModal(match: StageMatch, eventData: EventData, game?: any) {
		editingGame = {
			game,
			matchId: match.id,
			matchTeamA: match.teams[0].team,
			matchTeamB: match.teams[1].team,
			rosters: [
				// data.teamRoasters: Map<string, Map<string, { player: GameParticipant; job: 'main' | 'sub' | 'coach' }[]>
				data.teamRosters.get(eventData.event.id)?.get(match.teams[0].team.id) ?? [],
				data.teamRosters.get(eventData.event.id)?.get(match.teams[1].team.id) ?? []
			]
		};
	}

	function closeGameModal() {
		editingGame = null;
		// Invalidate the page data to refresh the games list
		invalidateAll();
	}

	function openDeleteGameModal(game: any, matchId: string) {
		deletingGame = { game, matchId };
	}
	function closeDeleteGameModal() {
		deletingGame = null;
		isDeletingGame = false;
	}
	async function handleDeleteGameSubmit() {
		isDeletingGame = true;
		try {
			if (!deletingGame) return;
			const formData = new FormData();
			formData.append('id', deletingGame.game.id);
			await fetch('?/deleteGame', { method: 'POST', body: formData });
			closeDeleteGameModal();
			invalidateAll();
		} catch (e) {
			isDeletingGame = false;
		}
	}

	// Convert eventsByEvent to array and filter based on search query
	let filteredEvents = $derived(
		Object.values(data.events as Record<string, EventData>)
			.filter((eventData) => eventData.event.name.toLowerCase().includes(searchQuery.toLowerCase()))
			.map((eventData) => eventData.event)
	);

	// Get selected event data
	let selectedEventData = $derived(
		selectedEventId ? (data.events as Record<string, EventData>)[selectedEventId] : null
	);

	// Get total matches count for the selected event
	let totalMatches = $derived(
		selectedEventData
			? Object.values(selectedEventData.stages).reduce(
					(total, stageData) => total + stageData.matches.length,
					0
				)
			: 0
	);

	// Get total games count for the selected event
	let totalGames = $derived(
		selectedEventData
			? Object.values(selectedEventData.stages).reduce(
					(total, stageData) =>
						total +
						stageData.matches.reduce(
							(matchTotal, match) => matchTotal + (match.games?.length || 0),
							0
						),
					0
				)
			: 0
	);

	type StageMatch = {
		id: string;
		format: string | null;
		stageId: number | null;
		teams: Array<{
			matchId: string | null;
			teamId: string | null;
			position: number | null;
			score: number | null;
			team: {
				id: string;
				name: string;
				slug: string;
				abbr: string;
				logo: string;
				region: string;
			};
		}>;
		maps: Array<{
			id: number;
			matchId: string;
			mapId: string;
			order: number;
			side: number;
			map_picker_position: number;
			side_picker_position: number;
			map: {
				id: string;
			};
			action?: string;
		}>;
		games: Array<{
			id: number;
			matchId: string;
			mapId: string;
			duration: number;
			winner: number;
			map: {
				id: string;
			};
			teams: Array<{
				gameId: number;
				teamId: string;
				position: number;
				score: number;
				team: {
					id: string;
					name: string;
					slug: string;
					abbr: string;
					logo: string;
					region: string;
				};
			}>;
			playerScores: Array<{
				id: number;
				gameId: number;
				teamId: string;
				accountId: number;
				player: string;
				characterFirstHalf: string | null;
				characterSecondHalf: string | null;
				score: number;
				damageScore: number;
				kills: number;
				knocks: number;
				deaths: number;
				assists: number;
				damage: number;
			}>;
		}>;
	};

	// Get sorted matches for a stage
	function getSortedMatches(matches: StageMatch[]) {
		return matches.toSorted((a, b) => {
			if (sortBy === 'id-asc') {
				return a.id.localeCompare(b.id);
			} else if (sortBy === 'id-desc') {
				return b.id.localeCompare(a.id);
			} else if (sortBy === 'format-asc') {
				return (a.format ?? '').localeCompare(b.format ?? '');
			} else if (sortBy === 'format-desc') {
				return (b.format ?? '').localeCompare(a.format ?? '');
			}
			return 0;
		});
	}

	function handleEventSelect(eventId: string) {
		selectedEventId = eventId;
		goto(`/admin/matches?event=${eventId}`, { replaceState: true });
	}

	// Handle URL parameters
	$effect(() => {
		if (data.event) {
			selectedEventId = data.event;
		}
	});

	// Handle URL parameters from page store
	$effect(() => {
		const eventParam = page.url.searchParams.get('event');
		if (eventParam && eventParam !== selectedEventId) {
			selectedEventId = eventParam;
		}
	});

	// Sync searchQuery changes to URL
	$effect(() => {
		if (searchQuery) {
			const url = new URL(window.location.href);
			url.searchParams.set('search', searchQuery);
			goto(url.pathname + url.search, { replaceState: true });
		} else {
			const url = new URL(window.location.href);
			url.searchParams.delete('search');
			goto(url.pathname + url.search, { replaceState: true });
		}
	});

	// Helper function to get side text
	function getSideText(side: number) {
		return side === 0 ? 'Attack' : 'Defense';
	}

	// Helper function to format duration
	function formatDuration(seconds: number): string {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
	}

	// Helper function to get map name
	function getMapName(mapId: string): string {
		return MAP_2_NAME[mapId] || mapId;
	}

	// Helper function to determine score color
	function getScoreColor(score1: number | null, score2: number | null, position: number): string {
		if (score1 === null || score2 === null) return 'text-gray-500';
		if (position === 0) {
			return score1 > score2
				? 'text-yellow-500'
				: score1 < score2
					? 'text-red-500'
					: 'text-gray-500';
		} else {
			return score2 > score1
				? 'text-yellow-500'
				: score2 < score1
					? 'text-red-500'
					: 'text-gray-500';
		}
	}

	const MAP_2_IMAGE: Record<string, string> = {
		base_404:
			'https://klbq-web-cms.strinova.com/prod/strinova_web/images/202411/830d991d-24ce-4c00-92e9-2b4eb5ff703c.jpg',
		area_88:
			'https://klbq-web-cms.strinova.com/prod/strinova_web/images/202411/24c1ac4e-40d0-4383-a060-15bb59db183e.jpg',
		port_euler:
			'https://klbq-web-cms.strinova.com/prod/strinova_web/images/202411/e46ea826-5ff4-465a-b575-fe5f29e02cd5.jpg',
		windy_town:
			'https://klbq-web-cms.strinova.com/prod/strinova_web/images/202411/47755586-4bf9-465d-9e88-566c70fab0bc.jpg',
		space_lab:
			'https://klbq-web-cms.strinova.com/prod/strinova_web/images/202411/be6f044e-0ace-4b85-89f5-0c8710b9c1fd.jpg',
		cauchy_district:
			'https://klbq-web-cms.strinova.com/prod/strinova_web/images/202411/f704a413-6e0b-476b-bec5-a442a890079e.jpg',
		cosmite:
			'https://klbq-web-cms.strinova.com/prod/strinova_web/images/202411/c0951e88-691f-4698-8c27-e65ab25ff166.jpg',
		orcanus:
			'https://static.wikitide.net/strinovawiki/thumb/9/9d/Intro_Ocarnus.png/450px-Intro_Ocarnus.png'
	};

	const MAP_2_NAME: Record<string, string> = {
		base_404: m.base_404(),
		area_88: m.area_88(),
		port_euler: m.port_euler(),
		windy_town: m.windy_town(),
		space_lab: m.space_lab(),
		cauchy_district: m.cauchy_district(),
		cosmite: m.cosmite(),
		orcanus: m.orcanus()
	};

	function handleDeleteSubmit() {
		return async ({ update }: { update: () => Promise<void> }) => {
			await update();
			closeDeleteGameModal();
			goto(`/admin/matches?event=${selectedEventId}`, { replaceState: true });
			invalidateAll();
		};
	}

	function handleEventChange(eventId: string) {
		selectedEvent = eventId;
		selectedStage = undefined;
	}

	function handleStageSelect(stage: { id: number; title: string; stage: string; format: string }) {
		selectedStage = stage;
	}

	function openStageEdit() {
		showStageEdit = true;
	}

	function closeStageEdit() {
		showStageEdit = false;
		successMessage = '';
		errorMessage = '';
	}

	function openBracketEdit() {
		if (!selectedStage) {
			errorMessage = 'Please select a stage first';
			return;
		}
		showBracketEdit = true;
	}

	function closeBracketEdit() {
		showBracketEdit = false;
		successMessage = '';
		errorMessage = '';
	}

	function handleStageSuccess() {
		successMessage = 'Stage updated successfully';
		closeStageEdit();
		// Refresh the page to get updated data
		invalidateAll();
	}

	function handleBracketSuccess() {
		successMessage = 'Bracket structure updated successfully';
		closeBracketEdit();
		// Refresh the page to get updated data
		invalidateAll();
	}

	// Get matches for selected stage
	let stageMatches = $derived(
		selectedEventId && selectedStage
			? selectedEventData?.stages[selectedStage.id]?.matches.map((match) => ({
					id: match.id,
					format: match.format,
					stageId: match.stageId,
					teams: match.teams.map((team) => ({
						matchId: team.matchId,
						teamId: team.teamId,
						position: team.position ?? 0,
						score: team.score ?? 0,
						team: team.team
					})),
					maps: match.maps.map((map) => ({
						id: map.id,
						matchId: map.matchId,
						mapId: map.mapId,
						order: map.order,
						side: map.side,
						action: map.action ?? null,
						map_picker_position: map.map_picker_position,
						side_picker_position: map.side_picker_position,
						map: map.map
					}))
				})) || []
			: []
	);

	// Get bracket data for selected stage
	let stageRounds = $derived(
		selectedEventId && selectedStage
			? selectedEventData?.stages[selectedStage.id]?.rounds || []
			: []
	);

	let stageNodes = $derived(
		selectedEventId && selectedStage ? selectedEventData?.stages[selectedStage.id]?.nodes || [] : []
	);
</script>

<svelte:head>
	<title>{m.matches()} | {m.admin_panel()} | LemonTV</title>
</svelte:head>

<div class="mx-auto max-w-7xl p-4">
	<div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<h1 class="text-2xl font-bold">{m.matches()}</h1>
		<div class="flex flex-col gap-4 sm:flex-row">
			<div class="relative">
				<MaterialSymbolsSearchRounded
					class="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400"
				/>
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Search events..."
					class="w-full rounded-lg border border-gray-700 bg-gray-800 py-2 pr-4 pl-10 text-white placeholder-gray-400 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none"
				/>
			</div>
		</div>
	</div>

	<div class="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
		{#each filteredEvents as event}
			<button
				class="flex items-start gap-4 rounded-lg border p-4 text-left transition-all {selectedEventId ===
				event.id
					? 'border-yellow-500 bg-gray-700 shadow-lg shadow-yellow-500/10'
					: 'border-gray-700 bg-gray-800 hover:border-gray-600 hover:bg-gray-700'}"
				onclick={() => handleEventSelect(event.id)}
			>
				{#if event.image}
					<img
						src={event.image}
						alt={event.name}
						class="h-16 w-16 flex-shrink-0 rounded-lg object-cover"
					/>
				{/if}
				<div class="flex-1">
					<div class="flex items-center justify-between">
						<h3
							class="max-w-[200px] truncate font-semibold {selectedEventId === event.id
								? 'text-white'
								: 'text-gray-300'}"
						>
							{event.name}
						</h3>
						<span
							class="inline-flex rounded-full px-2 text-xs leading-5 font-semibold {event.status ===
							'live'
								? 'bg-green-900 text-green-200'
								: event.status === 'upcoming'
									? 'bg-blue-900 text-blue-200'
									: event.status === 'cancelled'
										? 'bg-red-900 text-red-200'
										: event.status === 'postponed'
											? 'bg-yellow-900 text-yellow-200'
											: 'bg-gray-900 text-gray-200'}"
						>
							{event.status}
						</span>
					</div>
					<div
						class="mt-1 text-sm {selectedEventId === event.id ? 'text-gray-300' : 'text-gray-500'}"
					>
						<div class="flex items-center gap-2">
							<span>{event.server}</span>
							<span>•</span>
							<span>{event.format}</span>
							<span>•</span>
							<span>{event.region}</span>
						</div>
						<div class="mt-1">
							{#if event.date.includes('/')}
								{(() => {
									const [start, end] = event.date.split('/');
									return `${new Date(start).toLocaleDateString()} - ${new Date(end).toLocaleDateString()}`;
								})()}
							{:else}
								{new Date(event.date).toLocaleDateString()}
							{/if}
						</div>
					</div>
				</div>
			</button>
		{/each}
	</div>

	{#if selectedEventData}
		<div class="mb-4 flex items-center justify-between">
			<h2 class="text-xl font-semibold">Matches for {selectedEventData.event.name}</h2>
			<div class="flex items-center gap-4">
				<div class="text-sm text-gray-400">
					{totalMatches} matches, {totalGames} games
				</div>
				<button
					onclick={() => {
						goto(`/admin/matches?event=${selectedEventId}&action=newStage`, { replaceState: true });
					}}
					class="rounded-md bg-yellow-500 px-4 py-2 text-sm font-medium text-black hover:bg-yellow-400 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
				>
					Add Stage
				</button>
				<button
					onclick={() => {
						goto(`/admin/matches?event=${selectedEventId}&action=newMatch`, { replaceState: true });
					}}
					class="rounded-md bg-yellow-500 px-4 py-2 text-sm font-medium text-black hover:bg-yellow-400 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
				>
					Add Match
				</button>
			</div>
		</div>
		{#each Object.entries(selectedEventData.stages) as [stageId, { stage, matches }]}
			<div class="mb-8">
				<div class="mb-4 flex items-center justify-between">
					<h3 class="text-lg font-semibold">
						{stage.title} ({stage.stage} - {stage.format})
					</h3>
					<div class="flex items-center gap-4">
						<span class="text-sm text-gray-400">{matches.length} matches</span>
						<span class="text-sm text-gray-400">
							{matches.reduce((total, match) => total + (match.games?.length || 0), 0)} games
						</span>
						<button
							onclick={() => {
								selectedStage = stage;
								openBracketEdit();
							}}
							class="rounded-md bg-green-600 px-2 py-1 text-xs font-medium text-white hover:bg-green-700"
							title="Edit Bracket Structure"
						>
							Edit Bracket
						</button>
						<button
							onclick={() => {
								goto(`/admin/matches?event=${selectedEventId}&action=editStage&id=${stage.id}`, {
									replaceState: true
								});
							}}
							class="text-yellow-500 hover:text-yellow-400"
							title="Edit Stage"
						>
							<IconParkSolidEdit class="h-4 w-4" />
						</button>
						<form
							method="POST"
							action="?/deleteStage"
							onsubmit={(e) => {
								if (
									!confirm(
										'Are you sure you want to delete this stage? This will also delete all matches in this stage.'
									)
								) {
									e.preventDefault();
								}
							}}
							class="inline"
						>
							<input type="hidden" name="id" value={stage.id} />
							<button type="submit" class="text-red-400 hover:text-red-300" title="Delete Stage">
								<IconParkSolidDelete class="h-4 w-4" />
							</button>
						</form>
					</div>
				</div>
				<div
					class="overflow-x-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb:hover]:bg-slate-500 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-slate-800"
				>
					<table class="w-full table-auto border-collapse border-y-2 border-gray-500 bg-gray-800">
						<thead>
							<tr class="border-b-2 border-gray-500 text-left text-sm text-gray-400">
								<th class="px-4 py-1">
									<button
										class="flex items-center gap-1 text-left"
										class:text-white={sortBy === 'id-asc' || sortBy === 'id-desc'}
										onclick={() => (sortBy = sortBy === 'id-asc' ? 'id-desc' : 'id-asc')}
									>
										Match ID
										{#if sortBy === 'id-asc'}
											<TypcnArrowSortedUp class="inline-block" />
										{:else if sortBy === 'id-desc'}
											<TypcnArrowSortedDown class="inline-block" />
										{:else}
											<TypcnArrowUnsorted class="inline-block" />
										{/if}
									</button>
								</th>
								<th class="px-4 py-1">
									<button
										class="flex items-center gap-1 text-left"
										class:text-white={sortBy === 'format-asc' || sortBy === 'format-desc'}
										onclick={() =>
											(sortBy = sortBy === 'format-asc' ? 'format-desc' : 'format-asc')}
									>
										Format
										{#if sortBy === 'format-asc'}
											<TypcnArrowSortedUp class="inline-block" />
										{:else if sortBy === 'format-desc'}
											<TypcnArrowSortedDown class="inline-block" />
										{:else}
											<TypcnArrowUnsorted class="inline-block" />
										{/if}
									</button>
								</th>
								<th class="px-4 py-1 text-center">Matchup</th>
								<th class="px-4 py-1">Maps</th>
								<th class="px-4 py-1">Games</th>
								<th class="sticky right-0 z-10 h-12 bg-gray-800 px-4 py-1">Actions</th>
							</tr>
						</thead>
						<tbody>
							{#each getSortedMatches(matches) as match}
								<tr class="border-b border-gray-700 hover:bg-gray-700/50">
									<td class="min-w-max px-4 py-1 whitespace-nowrap">
										<a
											href="/matches/{match.id}"
											class="text-xs text-gray-300 transition-colors hover:text-yellow-500"
										>
											{match.id}
										</a>
									</td>
									<td class="min-w-max px-4 py-1 whitespace-nowrap text-gray-300">{match.format}</td
									>
									<td class="px-4 py-1">
										<div class="flex items-center justify-center gap-4">
											<div class="flex items-center gap-2 rounded-lg bg-gray-700/50 px-3 py-1">
												{#if match.teams[0]}
													{#if match.teams[0].team.logo}
														<img
															src={match.teams[0].team.logo}
															alt={match.teams[0].team.name}
															class="h-6 w-6 rounded"
														/>
													{/if}
													<span class="text-gray-300">{match.teams[0].team.name}</span>
												{:else}
													<span class="text-gray-500">TBD</span>
												{/if}
											</div>
											<div class="flex items-center gap-2">
												<span
													class="font-semibold {getScoreColor(
														match.teams[0]?.score ?? null,
														match.teams[1]?.score ?? null,
														0
													)}">{match.teams[0]?.score ?? '-'}</span
												>
												<span class="text-gray-500">vs.</span>
												<span
													class="font-semibold {getScoreColor(
														match.teams[0]?.score ?? null,
														match.teams[1]?.score ?? null,
														1
													)}">{match.teams[1]?.score ?? '-'}</span
												>
											</div>
											<div class="flex items-center gap-2 rounded-lg bg-gray-700/50 px-3 py-1">
												{#if match.teams[1]}
													{#if match.teams[1].team.logo}
														<img
															src={match.teams[1].team.logo}
															alt={match.teams[1].team.name}
															class="h-6 w-6 rounded"
														/>
													{/if}
													<span class="text-gray-300">{match.teams[1].team.name}</span>
												{:else}
													<span class="text-gray-500">TBD</span>
												{/if}
											</div>
										</div>
									</td>
									<td class="px-4 py-2">
										<div class="flex flex-col gap-1.5">
											{#each match.maps.sort((a, b) => a.order - b.order) as map}
												<div class="flex items-center gap-2 whitespace-nowrap">
													<div class="relative">
														<img
															src={MAP_2_IMAGE[map.map.id]}
															alt={MAP_2_NAME[map.map.id]}
															class="h-6 w-10 rounded object-cover"
														/>
														{#if map.action === 'ban' || map.action === 'pick'}
															<span
																class="absolute -top-1 -right-1 rounded px-1 text-[10px] font-medium {map.action ===
																'ban'
																	? 'border border-red-700/50 bg-red-900 text-red-200'
																	: map.action === 'pick'
																		? 'border border-green-700/50 bg-green-900 text-green-200'
																		: 'border border-yellow-700/50 bg-yellow-900 text-yellow-200'}"
															>
																{map.action.charAt(0).toUpperCase() + map.action.slice(1)}
															</span>
														{/if}
													</div>
													<div class="flex items-center gap-1.5">
														{#if map.map_picker_position !== null}
															<div class="group/map relative">
																<span class="cursor-help text-sm text-gray-300"
																	>{MAP_2_NAME[map.map.id]}</span
																>
																<div
																	class="invisible absolute top-4 -right-1 z-10 rounded bg-gray-800 px-2 py-1 text-xs text-gray-300 opacity-0 transition-all group-hover/map:visible group-hover/map:opacity-100"
																>
																	{match.teams[map.map_picker_position]?.team.name}
																</div>
															</div>
														{:else}
															<span class="text-sm text-gray-300">{MAP_2_NAME[map.map.id]}</span>
														{/if}
														{#if map.side_picker_position !== null}
															<div class="group/side relative">
																<span class="cursor-help text-xs text-gray-400"
																	>{getSideText(map.side)}</span
																>
																<div
																	class="invisible absolute -bottom-4 -left-1 z-10 rounded bg-gray-800 px-2 py-1 text-xs text-gray-300 opacity-0 transition-all group-hover/side:visible group-hover/side:opacity-100"
																>
																	{match.teams[map.side_picker_position]?.team.name}
																</div>
															</div>
														{:else}
															<span class="text-xs text-gray-400">{getSideText(map.side)}</span>
														{/if}
													</div>
												</div>
											{/each}
										</div>
									</td>
									<td class="px-4 py-2">
										<div class="flex flex-col gap-1.5">
											{#each match.games.sort((a, b) => a.id - b.id) as game, idx (idx)}
												<button
													class="group flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg bg-gray-700/50 px-3 py-1 text-left transition-all hover:scale-[1.02] hover:bg-gray-600 hover:shadow-lg hover:shadow-gray-900/50"
													onclick={() => openGameModal(match, selectedEventData, game)}
												>
													<div class="flex items-center gap-2">
														<img
															src={MAP_2_IMAGE[game.map.id]}
															alt={getMapName(game.map.id)}
															class="h-4 w-6 rounded object-cover"
														/>
														<span class="text-xs text-gray-300">{getMapName(game.map.id)}</span>
														<span class="text-xs text-gray-500"
															>({formatDuration(game.duration)})</span
														>
													</div>
													<div class="flex items-center gap-2">
														<span
															class="text-xs font-semibold {getScoreColor(
																game.teams[0]?.score ?? null,
																game.teams[1]?.score ?? null,
																0
															)}">{game.teams[0]?.score ?? '-'}</span
														>
														<span class="text-xs text-gray-500">vs</span>
														<span
															class="text-xs font-semibold {getScoreColor(
																game.teams[0]?.score ?? null,
																game.teams[1]?.score ?? null,
																1
															)}">{game.teams[1]?.score ?? '-'}</span
														>
														{#if game.winner !== null}
															<span
																class="text-xs font-medium {game.winner === 0
																	? 'text-yellow-500'
																	: 'text-yellow-500'}"
															>
																({game.winner === 0 ? 'A' : 'B'} wins)
															</span>
														{/if}
													</div>
												</button>
											{/each}
											{#if match.games.length === 0}
												<span class="text-xs text-gray-500 italic">No games recorded</span>
											{/if}
											<!-- Add game area -->
											<button
												onclick={() => openGameModal(match, selectedEventData)}
												class="mt-2 w-full rounded-lg border border-emerald-500/30 bg-emerald-500/10 py-2 text-xs font-medium text-emerald-400 transition-all hover:bg-emerald-500/20 hover:text-emerald-300 active:scale-[0.98]"
											>
												+ Add game
											</button>
										</div>
									</td>
									<td class="sticky right-0 z-10 h-12 min-w-max bg-gray-800 whitespace-nowrap">
										<div class="flex h-full items-center gap-2 border-l border-gray-700 px-4 py-1">
											<button
												onclick={() => {
													goto(
														`/admin/matches?event=${selectedEventId}&action=editMatch&id=${match.id}`,
														{ replaceState: true }
													);
												}}
												class="flex items-center gap-1 text-yellow-500 hover:text-yellow-400"
												title="Edit Match"
											>
												<IconParkSolidEdit class="h-4 w-4" />
											</button>
											<button
												onclick={() => {
													goto(
														`/admin/matches?event=${selectedEventId}&action=editMatch&id=${match.id}&delete=true`,
														{ replaceState: true }
													);
												}}
												class="flex items-center gap-1 text-red-500 hover:text-red-400"
												title="Delete Match"
											>
												<IconParkSolidDelete class="h-4 w-4" />
											</button>
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{/each}
	{:else}
		<div class="rounded-lg border border-gray-700 bg-gray-800 p-8 text-center text-gray-400">
			<p>Select an event to view its matches</p>
		</div>
	{/if}
</div>

{#if editingStage}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<div
			class="mx-auto flex h-[90vh] w-full max-w-3xl flex-col rounded-lg border border-slate-700 bg-slate-800 p-6"
		>
			<StageEdit
				stage={editingStage.stage}
				eventId={selectedEventId!}
				onCancel={() => {
					editingStage = null;
					goto(`/admin/matches?event=${selectedEventId}`, { replaceState: true });
				}}
				onSuccess={() => {
					editingStage = null;
					goto(`/admin/matches?event=${selectedEventId}`, { replaceState: true });
					// Refresh the page to show updated data
					invalidateAll();
				}}
			/>
		</div>
	</div>
{/if}

{#if editingMatch}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<div
			class="mx-auto flex h-[90vh] w-full max-w-3xl flex-col rounded-lg border border-slate-700 bg-slate-800 p-6"
		>
			<MatchEdit
				match={editingMatch.match}
				matchTeams={editingMatch.matchTeams}
				matchMaps={editingMatch.matchMaps.map((map) => ({
					...map,
					action: map.action as 'ban' | 'pick' | 'decider' | null
				}))}
				teams={data.teams}
				maps={data.maps}
				stages={Object.values(data.events)
					.flatMap((eventData) =>
						Object.values(eventData.stages).map((stageData) => ({
							id: stageData.stage.id.toString(),
							name: stageData.stage.title,
							eventName: eventData.event.name
						}))
					)
					.filter((stage, index, self) => index === self.findIndex((s) => s.id === stage.id))}
				onCancel={() => {
					editingMatch = null;
					goto(`/admin/matches?event=${selectedEventId}`, { replaceState: true });
				}}
				onSuccess={() => {
					editingMatch = null;
					goto(`/admin/matches?event=${selectedEventId}`, { replaceState: true });
					// Refresh the page to show updated data
					invalidateAll();
				}}
			/>
		</div>
	</div>
{/if}

{#if showDeleteModal && editingMatch}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<div class="mx-auto w-full max-w-md rounded-lg border border-slate-700 bg-slate-800 p-6">
			<div class="space-y-4">
				<h3 class="text-lg font-semibold text-white">Delete Match</h3>
				<p class="text-gray-300">
					Are you sure you want to delete this match? This action cannot be undone.
				</p>

				<div class="flex justify-end gap-2">
					<button
						class="rounded-md bg-gray-700 px-4 py-2 font-medium text-white hover:bg-gray-600"
						onclick={closeDeleteGameModal}
					>
						Cancel
					</button>
					<form method="POST" action="?/delete" use:enhance={handleDeleteSubmit} class="inline">
						<input type="hidden" name="id" value={editingMatch.match.id} />
						<button
							type="submit"
							class="rounded-md bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-500"
							disabled={isDeleting}
						>
							{isDeleting ? 'Deleting...' : 'Delete'}
						</button>
					</form>
				</div>
			</div>
		</div>
	</div>
{/if}

<!-- Stage Edit Modal -->
{#if showStageEdit}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<div class="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-lg bg-slate-900 shadow-xl">
			<StageEdit
				stage={selectedStage}
				eventId={selectedEvent}
				onCancel={closeStageEdit}
				onSuccess={handleStageSuccess}
			/>
		</div>
	</div>
{/if}

<!-- Bracket Edit Modal -->
{#if showBracketEdit && selectedStage}
	<Modal show={true} title="Edit Bracket" onClose={closeBracketEdit}>
		<BracketInput
			stage={selectedStage}
			matches={stageMatches}
			rounds={stageRounds}
			nodes={stageNodes}
			onCancel={closeBracketEdit}
			onSuccess={handleBracketSuccess}
		/>
	</Modal>
{/if}

<!-- Game Edit/Create Modal -->
{#if editingGame}
	<Modal
		show={true}
		title={editingGame.game ? 'Edit Game' : 'Add Game'}
		onClose={closeGameModal}
		dismissible={false}
	>
		<GameEdit
			game={editingGame.game}
			matchId={editingGame.matchId}
			maps={data.maps.map((map) => ({ id: map.id, name: MAP_2_NAME[map.id] }))}
			onCancel={closeGameModal}
			onSuccess={closeGameModal}
			teams={[editingGame.matchTeamA, editingGame.matchTeamB]}
			rosters={editingGame.rosters}
		/>
	</Modal>
{/if}

<!-- Game Delete Modal -->
{#if deletingGame}
	<Modal show={true} title="Delete Game" onClose={closeDeleteGameModal} dismissible={false}>
		<div class="p-4">
			<p class="mb-4 text-slate-200">Are you sure you want to delete this game?</p>
			<div class="flex justify-end gap-2">
				<button
					type="button"
					class="rounded-md border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-800"
					onclick={closeDeleteGameModal}
					disabled={isDeletingGame}>Cancel</button
				>
				<button
					type="button"
					class="rounded-md bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
					onclick={handleDeleteGameSubmit}
					disabled={isDeletingGame}>{isDeletingGame ? 'Deleting...' : 'Delete'}</button
				>
			</div>
		</div>
	</Modal>
{/if}
