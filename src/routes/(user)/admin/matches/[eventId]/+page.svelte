<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import type { PageProps } from './$types';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { invalidateAll } from '$app/navigation';
	import MaterialSymbolsSearchRounded from '~icons/material-symbols/search-rounded';
	import IconParkSolidEdit from '~icons/icon-park-solid/edit';
	import TypcnArrowUnsorted from '~icons/typcn/arrow-unsorted';
	import TypcnArrowSortedDown from '~icons/typcn/arrow-sorted-down';
	import TypcnArrowSortedUp from '~icons/typcn/arrow-sorted-up';
	import IconParkSolidDelete from '~icons/icon-park-solid/delete';
	import IconVideo from '~icons/icon-park-outline/video';
	import { goto } from '$app/navigation';
	import MatchEdit from './MatchEdit.svelte';
	import {
		type Match,
		type MatchTeam,
		type MatchMap,
		type Team,
		type Map as MapSchema
	} from '$lib/server/db/schema';
	import type { Game, GamePlayerScore, GameTeam, GameVod } from '$lib/server/db/schemas/game/match';
	import StageEdit from './StageEdit.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import BracketEdit from './BracketEdit.svelte';
	import GameEdit from './GameEdit.svelte';
	import type { GameParticipant } from './+page.server';
	import { MAP_NAMES, type GameMap } from '$lib/data/game';

	let { data }: PageProps = $props();

	$inspect('[admin/matches] data', data);

	let action:
		| 'editMatch'
		| 'editStage'
		| 'newMatch'
		| 'newStage'
		| 'editGame'
		| 'newGame'
		| 'editBracket'
		| 'deleteGame'
		| null = $state(null);
	let actionParams = $state<{
		id?: string | number;
		stageId?: number;
		gameId?: number;
		matchId?: string;
		delete?: boolean;
	} | null>(null);

	$effect(() => {
		const url = new URL(window.location.href);
		if (action) {
			url.searchParams.set('action', action);
			if (actionParams) {
				if (actionParams.id) {
					url.searchParams.set('id', actionParams.id.toString());
				}
				if (actionParams.stageId) {
					url.searchParams.set('stageId', actionParams.stageId.toString());
				}
				if (actionParams.gameId) {
					url.searchParams.set('gameId', actionParams.gameId.toString());
				}
				if (actionParams.matchId) {
					url.searchParams.set('matchId', actionParams.matchId.toString());
				}
				if (actionParams.delete) {
					url.searchParams.set('delete', 'true');
				}
			}
		} else {
			url.searchParams.delete('action');
			url.searchParams.delete('id');
			url.searchParams.delete('stageId');
			url.searchParams.delete('gameId');
			url.searchParams.delete('matchId');
			url.searchParams.delete('delete');
		}
		goto(url.pathname + url.search, { replaceState: true });
	});

	// Handle URL parameters for modal state
	$effect(() => {
		if (data.action === 'editMatch' && data.id) {
			action = 'editMatch';
			actionParams = { id: data.id };
			// Find the match to edit
			for (const stageData of Object.values(data.stages)) {
				const match = stageData.matches.find((m) => m.id === data.id);
				if (match) {
					editingMatch = {
						match,
						matchTeams: match.matchTeams.map((t) => ({
							matchId: match.id,
							teamId: t.teamId,
							position: t.position,
							score: t.score
						})),
						matchMaps: match.matchMaps.map((m) => ({
							...m,
							action: m.action as 'ban' | 'pick' | 'decider' | null
						}))
					};

					// Check if we should show delete modal
					if (data.delete === 'true') {
						showDeleteModal = true;
						actionParams = { ...actionParams, delete: true };
					}
					break;
				}
			}
		} else if (data.action === 'editStage' && data.id) {
			action = 'editStage';
			actionParams = { id: parseInt(data.id) };
			// Find the stage to edit
			const stageId = parseInt(data.id);
			const stageData = data.stages[stageId];
			if (stageData) {
				selectedStage = stageData.stage;
				showStageEdit = true;
			}
		} else if (data.action === 'newMatch') {
			action = 'newMatch';
			const stageId = data.stageId ? parseInt(data.stageId) : null;
			actionParams = stageId ? { stageId } : null;
			// Pre-populate stageId if provided in URL
			editingMatch = {
				match: {
					format: 'bo1',
					stageId: stageId
				},
				matchTeams: [],
				matchMaps: []
			};
		} else if (data.action === 'newStage') {
			action = 'newStage';
			actionParams = null;
			selectedStage = undefined;
			showStageEdit = true;
		} else if (data.action === 'editGame' && data.id) {
			action = 'editGame';
			const gameId = parseInt(data.id);
			actionParams = { gameId };
			// Find the game to edit and open the game edit modal
			if (gameId) {
				for (const stageData of Object.values(data.stages)) {
					for (const match of stageData.matches) {
						const game = match.games?.find((g) => g.id === gameId);
						if (game) {
							editingGame = {
								game,
								matchId: match.id,
								teams: [match.matchTeams[0].team, match.matchTeams[1].team],
								rosters: [
									match.matchTeams[0]?.team?.id
										? (data.teamRosters.get(match.matchTeams[0].team.id) ?? [])
										: [],
									match.matchTeams[1]?.team?.id
										? (data.teamRosters.get(match.matchTeams[1].team.id) ?? [])
										: []
								],
								match: {
									maps: match.matchMaps.map((map) => ({
										id: map.id,
										matchId: map.matchId,
										mapId: map.mapId,
										// Convert nullable fields to non-nullable for GameEdit
										order: map.order ?? 0,
										side: map.side ?? 0,
										map_picker_position: map.map_picker_position ?? 0,
										side_picker_position: map.side_picker_position ?? 0,
										// Add the missing map property with proper type
										map: { id: map.map?.id || map.mapId },
										// Only include action when defined
										...(map.action ? { action: map.action } : {})
									})),
									games: match.games
								}
							};
							break;
						}
					}
					if (editingGame) break;
				}
			}
		} else if (data.action === 'newGame' && page.url.searchParams.get('matchId')) {
			action = 'newGame';
			const matchId = page.url.searchParams.get('matchId');
			actionParams = { matchId: matchId || undefined };
			// Find the match to add a game to and open the game edit modal
			if (matchId) {
				for (const stageData of Object.values(data.stages)) {
					const match = stageData.matches.find((m) => m.id === matchId);
					if (match) {
						editingGame = {
							matchId: match.id,
							teams: [match.matchTeams[0].team, match.matchTeams[1].team],
							rosters: [
								match.matchTeams[0]?.team?.id
									? (data.teamRosters.get(match.matchTeams[0].team.id) ?? [])
									: [],
								match.matchTeams[1]?.team?.id
									? (data.teamRosters.get(match.matchTeams[1].team.id) ?? [])
									: []
							],
							match: {
								maps: match.matchMaps.map((map) => ({
									id: map.id,
									matchId: map.matchId,
									mapId: map.mapId,
									// Convert nullable fields to non-nullable for GameEdit
									order: map.order ?? 0,
									side: map.side ?? 0,
									map_picker_position: map.map_picker_position ?? 0,
									side_picker_position: map.side_picker_position ?? 0,
									// Add the missing map property with proper type
									map: { id: map.map?.id || map.mapId },
									// Only include action when defined
									...(map.action ? { action: map.action } : {})
								})),
								games: match.games
							}
						};
						break;
					}
				}
			}
		} else if (data.action === 'deleteGame' && data.id) {
			action = 'deleteGame';
			const gameId = parseInt(data.id);
			actionParams = { gameId };
			// Find the game to delete and open the delete confirmation modal
			if (gameId) {
				for (const stageData of Object.values(data.stages)) {
					for (const match of stageData.matches) {
						const game = match.games?.find((g) => g.id === gameId);
						if (game) {
							deletingGame = { game, matchId: match.id };
							break;
						}
					}
					if (deletingGame) break;
				}
			}
		} else if (data.action === 'editBracket' && data.stageId) {
			action = 'editBracket';
			actionParams = { stageId: parseInt(data.stageId) };
			// Find the stage to edit and open the bracket edit modal
			if (data.stages) {
				const stageId = parseInt(data.stageId);
				const stageData = data.stages[stageId];
				if (stageData) {
					selectedStage = stageData.stage;
					showBracketEdit = true;
				}
			}
		} else {
			action = null;
			actionParams = null;
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
							createdAt: Date | null;
							updatedAt: Date | null;
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
							id: GameMap;
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
							id: GameMap;
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
						vods?: GameVod[];
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

	let sortBy: 'id-asc' | 'id-desc' | 'format-asc' | 'format-desc' = $state('id-asc');
	let editingMatch = $state<{
		match: Partial<Match>;
		matchTeams: MatchTeam[];
		matchMaps: MatchMap[];
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

	type EditingGame = {
		game?: {
			id: number;
			matchId: string;
			mapId: string;
			duration: number;
			winner: number;
			playerScores: GamePlayerScore[];
			teams: {
				teamId: string;
				position: number;
				score: number;
			}[];
			vods: GameVod[];
			map: {
				id: GameMap;
			};
		}; // For editing, undefined for new
		matchId: string;
		teams: [
			{ id: string; name: string; logo?: string | null } | null,
			{ id: string; name: string; logo?: string | null } | null
		];
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
		match?: {
			maps: Array<{
				id: number;
				matchId: string;
				mapId: string;
				order: number;
				side: number;
				map_picker_position: number;
				side_picker_position: number;
				map: { id: string };
				action?: string;
			}>;
			games: Array<{
				id: number;
				matchId: string;
				mapId: string;
				duration: number;
				winner: number;
			}>;
		};
	};

	let editingGame = $state<EditingGame | null>(null);
	$inspect('[admin/matches] editingGame', editingGame);

	let deletingGame = $state<{ game: any; matchId: string } | null>(null);
	let isDeletingGame = $state(false);

	function openGameModal(
		match: (typeof data.stages)[number]['matches'][number],
		eventId: string,
		game?:
			| {
					id: number;
					matchId: string;
					mapId: string;
					duration: number;
					winner: number;
					playerScores: GamePlayerScore[];
					teams: {
						teamId: string;
						position: number;
						score: number;
					}[];
					vods: GameVod[];
					map: {
						id: GameMap;
					};
			  }
			| undefined
	) {
		action = game ? 'editGame' : 'newGame';
		actionParams = game ? { gameId: game.id } : null;
		editingGame = {
			game,
			matchId: match.id,
			teams: [match.matchTeams[0].team, match.matchTeams[1].team],
			rosters: [
				match.matchTeams[0]?.team?.id
					? (data.teamRosters.get(match.matchTeams[0].team.id) ?? [])
					: [],
				match.matchTeams[1]?.team?.id
					? (data.teamRosters.get(match.matchTeams[1].team.id) ?? [])
					: []
			],
			match: {
				maps: match.matchMaps.map((map) => ({
					id: map.id,
					matchId: map.matchId,
					mapId: map.mapId,
					// Convert nullable fields to non-nullable for GameEdit
					order: map.order ?? 0,
					side: map.side ?? 0,
					map_picker_position: map.map_picker_position ?? 0,
					side_picker_position: map.side_picker_position ?? 0,
					// Add the missing map property with proper type
					map: { id: map.map?.id || map.mapId },
					// Only include action when defined
					...(map.action ? { action: map.action } : {})
				})),
				games: match.games
			}
		};
	}

	function closeGameModal() {
		editingGame = null;
		action = null;
		actionParams = null;
		// Invalidate the page data to refresh the games list
		invalidateAll();
	}

	function closeDeleteGameModal() {
		deletingGame = null;
		isDeletingGame = false;
		action = null;
		actionParams = null;
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
		} catch (error) {
			console.error('Error deleting game:', error);
			isDeletingGame = false;
		}
	}
	// Get total matches count for the selected event
	let totalMatches = $derived(
		Object.values(data.stages).reduce((total, stageData) => total + stageData.matches.length, 0)
	);

	// Get total games count for the selected event
	let totalGames = $derived(
		Object.values(data.stages).reduce(
			(total, stageData) =>
				total +
				stageData.matches.reduce((matchTotal, match) => matchTotal + (match.games?.length || 0), 0),
			0
		)
	);

	// type StageMatch = Match & {
	// 	matchMaps: MatchMap & { map: MapSchema }[];
	// 	matchTeams: MatchTeam & { team: Team }[];
	// 	games: Game &
	// 		{
	// 			gameTeams: GameTeam & { team: Team }[];
	// 			gamePlayerScores: GamePlayerScore[];
	// 			gameVods: GameVod[];
	// 			map: MapSchema;
	// 		}[];
	// };

	// Get sorted matches for a stage
	function getSortedMatches(matches: (typeof data.stages)[number]['matches']) {
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

	const MAP_2_IMAGE: Record<GameMap, string> = {
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
		ocarnus:
			'https://static.wikitide.net/strinovawiki/thumb/9/9d/Intro_Ocarnus.png/450px-Intro_Ocarnus.png'
	};

	function handleDeleteSubmit() {
		return async ({ update }: { update: () => Promise<void> }) => {
			await update();
			closeDeleteGameModal();
			action = null;
			actionParams = null;
			goto(`/admin/matches/${data.event.id}`, {
				replaceState: true,
				noScroll: true,
				keepFocus: true
			});
			invalidateAll();
		};
	}

	function closeStageEdit() {
		showStageEdit = false;
		action = null;
		actionParams = null;
		successMessage = '';
		errorMessage = '';
	}

	function openBracketEdit() {
		if (!selectedStage) {
			errorMessage = 'Please select a stage first';
			return;
		}
		action = 'editBracket';
		actionParams = { stageId: selectedStage.id };
		showBracketEdit = true;
	}

	function closeBracketEdit() {
		showBracketEdit = false;
		action = null;
		actionParams = null;
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
		selectedStage
			? Object.values(data.stages)
					.find((s) => s.stage.id === selectedStage?.id)
					?.matches.map((match) => ({
						id: match.id,
						format: match.format,
						stageId: match.stageId,
						teams: match.matchTeams.map((team) => ({
							matchId: team.matchId,
							teamId: team.teamId,
							position: team.position ?? 0,
							score: team.score ?? 0,
							team: {
								...team.team,
								createdAt: team.team?.createdAt || null,
								updatedAt: team.team?.updatedAt || null
							} as Team
						})),
						maps: match.matchMaps.map((map) => ({
							id: map.id,
							matchId: map.matchId,
							mapId: map.mapId,
							// Keep nullable fields for BracketEdit
							order: map.order,
							side: map.side,
							// Convert undefined to null for BracketEdit
							action: map.action === undefined ? null : map.action,
							map_picker_position: map.map_picker_position,
							side_picker_position: map.side_picker_position,
							// Keep the original map object
							map: map.map
						}))
					})) || []
			: []
	);

	// Get bracket data for selected stage
	let stageRounds = $derived(selectedStage ? data.stages[selectedStage.id]?.rounds || [] : []);

	let stageNodes = $derived(selectedStage ? data.stages[selectedStage.id]?.nodes || [] : []);
</script>

<svelte:head>
	<title>{m.matches()} | {m.admin_panel()} | LemonTV</title>
</svelte:head>

<div class="mx-auto max-w-7xl p-4">
	<div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<h1 class="text-2xl font-bold">{m.matches()}</h1>
		<button
			onclick={() => goto('/admin/matches')}
			class="cursor-pointer rounded-md border border-white/20 px-4 py-2 text-slate-400 backdrop-blur-2xl transition-colors hover:text-white"
		>
			← Back to Event Selection
		</button>
	</div>
	<div class="mb-4 flex items-center justify-between">
		<h2 class="text-xl font-semibold">
			{m.matches_for_event({ name: data.event.name })}
		</h2>
		<div class="flex items-center gap-4">
			<div class="text-sm text-gray-400">
				{m.total_matches_games({ matches: totalMatches, games: totalGames })}
			</div>
			<button
				onclick={() => {
					goto(`/admin/matches/${data.event.id}?action=newStage`, {
						replaceState: true,
						noScroll: true,
						keepFocus: true
					});
				}}
				class="rounded-md bg-yellow-500 px-4 py-2 text-sm font-medium text-black hover:bg-yellow-400 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
			>
				{m.add_stage()}
			</button>
		</div>
	</div>
	<!-- db.query.match.findMany({
			where: inArray(table.match.stageId, stageIds),
			with: {
				matchTeams: { with: { team: true } },
				matchMaps: { with: { map: true } },
				games: {
					with: {
						gameTeams: { with: { team: true } },
						gamePlayerScores: true,
						gameVods: true,
						map: true
					}
				}
			}
		}), -->
	{#each Object.values(data.stages) as stage (stage.stage.id)}
		<div class="mb-8">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-lg font-semibold">
					<a
						href={`/events/${data.event.slug}?stage=${stage.stage.id}`}
						class="hover:text-yellow-500"
					>
						{m.stage_info({
							title: stage.stage.title,
							stage: stage.stage.stage,
							format: stage.stage.format
						})}
					</a>
				</h3>
				<div class="flex items-center gap-4">
					<span class="text-sm text-gray-400"
						>{m.matches_count({ count: stage.matches.length })}</span
					>
					<span class="text-sm text-gray-400">
						{m.games_count({
							count: stage.matches.reduce((total, match) => total + (match.games?.length || 0), 0)
						})}
					</span>
					<button
						onclick={() => {
							goto(`/admin/matches/${data.event.id}?action=newMatch&stageId=${stage.stage.id}`, {
								replaceState: true,
								noScroll: true,
								keepFocus: true
							});
						}}
						class="rounded-md bg-yellow-500 px-2 py-1 text-xs font-medium text-black hover:bg-yellow-400"
						title={m.add_match_to_stage()}
					>
						{m.add_match()}
					</button>
					<button
						onclick={() => {
							selectedStage = stage.stage;
							openBracketEdit();
						}}
						class="rounded-md bg-green-600 px-2 py-1 text-xs font-medium text-white hover:bg-green-700"
						title={m.edit_bracket_structure()}
					>
						{m.edit_bracket()}
					</button>
					<button
						onclick={() => {
							goto(`/admin/matches/${data.event.id}?action=editStage&id=${stage.stage.id}`, {
								replaceState: true,
								noScroll: true,
								keepFocus: true
							});
						}}
						class="text-yellow-500 hover:text-yellow-400"
						title={m.edit_stage()}
					>
						<IconParkSolidEdit class="h-4 w-4" />
					</button>
					<form
						method="POST"
						action="?/deleteStage"
						onsubmit={(e) => {
							if (!confirm(m.delete_stage_confirmation())) {
								e.preventDefault();
							}
						}}
						class="inline"
					>
						<input type="hidden" name="id" value={stage.stage.id} />
						<button type="submit" class="text-red-400 hover:text-red-300" title={m.delete_stage()}>
							<IconParkSolidDelete class="h-4 w-4" />
						</button>
					</form>
				</div>
			</div>
			<div class="styled-scroll-horizontal overflow-x-auto overflow-y-hidden">
				<table class="w-full table-auto border-collapse border-y-2 border-gray-500 bg-gray-800">
					<thead>
						<tr class="border-b-2 border-gray-500 text-left text-sm text-gray-400">
							<th class="px-4 py-1">
								<button
									class="flex items-center gap-1 text-left"
									class:text-white={sortBy === 'id-asc' || sortBy === 'id-desc'}
									onclick={() => (sortBy = sortBy === 'id-asc' ? 'id-desc' : 'id-asc')}
								>
									{m.match_id()}
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
									onclick={() => (sortBy = sortBy === 'format-asc' ? 'format-desc' : 'format-asc')}
								>
									{m.format()}
									{#if sortBy === 'format-asc'}
										<TypcnArrowSortedUp class="inline-block" />
									{:else if sortBy === 'format-desc'}
										<TypcnArrowSortedDown class="inline-block" />
									{:else}
										<TypcnArrowUnsorted class="inline-block" />
									{/if}
								</button>
							</th>
							<th class="px-4 py-1 text-center">{m.matchup()}</th>
							<th class="px-4 py-1">{m.maps()}</th>
							<th class="px-4 py-1">{m.games()}</th>
							<th class="sticky right-0 z-10 h-12 bg-gray-800 px-4 py-1">{m.actions()}</th>
						</tr>
					</thead>
					<tbody>
						{#each getSortedMatches(stage.matches) as match (match.id)}
							<tr class="border-b border-gray-700 hover:bg-gray-700/50">
								<td class="min-w-max px-4 py-1 whitespace-nowrap">
									<a
										href="/matches/{match.id}"
										class="text-xs text-gray-300 transition-colors hover:text-yellow-500"
									>
										{match.id}
									</a>
								</td>
								<td class="min-w-max px-4 py-1 whitespace-nowrap text-gray-300">{match.format}</td>
								<!-- Matchup -->
								<td class="px-4 py-1">
									<div class="flex items-center justify-center gap-4">
										<div
											class="flex min-w-32 items-center gap-2 rounded-lg bg-gray-700/50 px-3 py-1 text-nowrap break-keep"
										>
											{#if match.matchTeams[0]}
												{#if match.matchTeams[0].team?.logo}
													<img
														src={match.matchTeams[0].team.logo}
														alt={match.matchTeams[0].team.name}
														class="h-6 w-6 rounded"
													/>
												{/if}
												<span class="text-gray-300"
													>{match.matchTeams[0].team?.name || m.tbd()}</span
												>
											{:else}
												<span class="text-gray-500">{m.tbd()}</span>
											{/if}
										</div>
										<div class="flex items-center gap-2">
											<span
												class="font-semibold {getScoreColor(
													match.matchTeams[0]?.score ?? null,
													match.matchTeams[1]?.score ?? null,
													0
												)}">{match.matchTeams[0]?.score ?? '-'}</span
											>
											<span class="text-gray-500">{m.versus()}</span>
											<span
												class="font-semibold {getScoreColor(
													match.matchTeams[0]?.score ?? null,
													match.matchTeams[1]?.score ?? null,
													1
												)}">{match.matchTeams[1]?.score ?? '-'}</span
											>
										</div>
										<div
											class="flex min-w-32 items-center gap-2 rounded-lg bg-gray-700/50 px-3 py-1 text-nowrap break-keep"
										>
											{#if match.matchTeams[1]}
												{#if match.matchTeams[1].team?.logo}
													<img
														src={match.matchTeams[1].team.logo}
														alt={match.matchTeams[1].team.name}
														class="h-6 w-6 rounded"
													/>
												{/if}
												<span class="text-gray-300"
													>{match.matchTeams[1].team?.name || m.tbd()}</span
												>
											{:else}
												<span class="text-gray-500">{m.tbd()}</span>
											{/if}
										</div>
									</div>
								</td>
								<!-- Maps -->
								<td class="min-w-64 px-4 py-2">
									<div class="flex flex-col gap-1.5">
										{#if match.matchMaps && match.matchMaps.length > 0}
											{#each match.matchMaps.toSorted((a, b) => (a.order ?? 0) - (b.order ?? 0)) as map (map.id)}
												<div class="flex items-center gap-2 whitespace-nowrap">
													<div class="relative">
														<img
															src={MAP_2_IMAGE[map.map.id]}
															alt={MAP_NAMES[map.map.id]()}
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
																	>{MAP_NAMES[map.map.id]()}
																</span>
																<div
																	class="invisible absolute top-4 -right-1 z-10 rounded bg-gray-800 px-2 py-1 text-xs text-gray-300 opacity-0 transition-all group-hover/map:visible group-hover/map:opacity-100"
																>
																	{match.matchTeams[map.map_picker_position]?.team?.name || m.tbd()}
																</div>
															</div>
														{:else}
															<span class="text-sm text-gray-300">{MAP_NAMES[map.map.id]()} </span>
														{/if}
														{#if map.side_picker_position !== null}
															<div class="group/side relative">
																<span class="cursor-help text-xs text-gray-400"
																	>{getSideText(map.side ?? 0)}</span
																>
																<div
																	class="invisible absolute -bottom-4 -left-1 z-10 rounded bg-gray-800 px-2 py-1 text-xs text-gray-300 opacity-0 transition-all group-hover/side:visible group-hover/side:opacity-100"
																>
																	{match.matchTeams[map.side_picker_position]?.team?.name ||
																		m.tbd()}
																</div>
															</div>
														{:else}
															<span class="text-xs text-gray-400"
																>{map.side !== null ? getSideText(map.side ?? 0) : m.tbd()}</span
															>
														{/if}
													</div>
												</div>
											{/each}
										{:else}
											<span class="text-xs text-gray-500 italic">{m.no_data()}</span>
										{/if}
									</div>
								</td>
								<td class="px-4 py-2">
									<div class="flex flex-col gap-1.5">
										{#each match.games.sort((a, b) => a.id - b.id) as game, idx (idx)}
											<button
												class="group flex w-full min-w-80 cursor-pointer items-center justify-between gap-2 rounded-lg bg-gray-700/50 px-3 py-1 text-left transition-all hover:scale-[1.02] hover:bg-gray-600 hover:shadow-lg hover:shadow-gray-900/50"
												onclick={() => openGameModal(match, data.event.id, game)}
											>
												<div class="flex items-center gap-2">
													<img
														src={MAP_2_IMAGE[game.map.id]}
														alt={MAP_NAMES[game.map.id]()}
														class="h-4 w-6 rounded object-cover"
													/>
													<span class="text-xs text-gray-300">{MAP_NAMES[game.map.id]()} </span>
													<span class="text-xs text-gray-500"
														>({formatDuration(game.duration)})</span
													>
												</div>
												{#if game.gameVods && game.gameVods.length > 0}
													<span class="flex gap-1 text-xs text-blue-400" title="Has VODs">
														<IconVideo class="h-4 w-4" />
														{game.gameVods.length}
													</span>
												{/if}
												<div class="flex items-center gap-2">
													<span
														class="text-xs font-semibold {getScoreColor(
															game.gameTeams[0]?.score ?? null,
															game.gameTeams[1]?.score ?? null,
															0
														)}">{game.gameTeams[0]?.score ?? '-'}</span
													>
													<span class="text-xs text-gray-500">{m.versus()}</span>
													<span
														class="text-xs font-semibold {getScoreColor(
															game.gameTeams[0]?.score ?? null,
															game.gameTeams[1]?.score ?? null,
															1
														)}">{game.gameTeams[1]?.score ?? '-'}</span
													>
													{#if game.winner !== null}
														<span
															class="text-xs font-medium {game.winner === 0
																? 'text-yellow-500'
																: 'text-yellow-500'}"
														>
															({game.winner === 0 ? m.team_a_wins() : m.team_b_wins()})
														</span>
													{/if}
												</div>
											</button>
										{/each}
										{#if match.games.length === 0}
											<span class="text-xs text-gray-500 italic">{m.no_games_recorded()}</span>
										{/if}
										<!-- Add game area -->
										<button
											onclick={() => openGameModal(match, data.event.id)}
											class="mt-2 w-full rounded-lg border border-emerald-500/30 bg-emerald-500/10 py-2 text-xs font-medium text-emerald-400 transition-all hover:bg-emerald-500/20 hover:text-emerald-300 active:scale-[0.98]"
										>
											{m.add_game()}
										</button>
									</div>
								</td>
								<td class="sticky right-0 z-10 h-12 min-w-max bg-gray-800 whitespace-nowrap">
									<div class="flex h-full items-center gap-2 border-l border-gray-700 px-4 py-1">
										<button
											onclick={() => {
												goto(`/admin/matches/${data.event.id}?action=editMatch&id=${match.id}`, {
													replaceState: true,
													noScroll: true,
													keepFocus: true
												});
											}}
											class="flex items-center gap-1 text-yellow-500 hover:text-yellow-400"
											title={m.edit_match()}
										>
											<IconParkSolidEdit class="h-4 w-4" />
										</button>
										<button
											onclick={() => {
												goto(
													`/admin/matches/${data.event.id}?action=editMatch&id=${match.id}&delete=true`,
													{ replaceState: true, noScroll: true, keepFocus: true }
												);
											}}
											class="flex items-center gap-1 text-red-500 hover:text-red-400"
											title={m.delete_match()}
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
</div>

{#if editingMatch}
	<!-- TODO: Add stages to other events like the original -->
	<!-- 		stages={Object.values(data.events)
			.flatMap((eventData) =>
				Object.values(eventData.stages).map((stageData) => ({
					id: stageData.stage.id.toString(),
					name: stageData.stage.title,
					eventName: eventData.event.name
				}))
			)
			.filter((stage, index, self) => index === self.findIndex((s) => s.id === stage.id))} -->
	<MatchEdit
		match={editingMatch.match}
		matchTeams={editingMatch.matchTeams}
		matchMaps={editingMatch.matchMaps.map((map) => ({
			...map,
			action: map.action as 'ban' | 'pick' | 'decider' | null
		}))}
		teams={data.teams}
		stages={Object.values(data.stages).map(({ stage }) => ({
			id: stage.id.toString(),
			name: stage.title,
			eventName: data.event.name
		}))}
		onCancel={() => {
			editingMatch = null;
			action = null;
			actionParams = null;
			goto(`/admin/matches/${data.event.id}`, {
				replaceState: true,
				noScroll: true,
				keepFocus: true
			});
		}}
		onSuccess={() => {
			editingMatch = null;
			action = null;
			actionParams = null;
			goto(`/admin/matches/${data.event.id}`, {
				replaceState: true,
				noScroll: true,
				keepFocus: true
			});
			// Refresh the page to show updated data
			invalidateAll();
		}}
	/>
{/if}

{#if showDeleteModal && editingMatch}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<div class="mx-auto w-full max-w-md rounded-lg border border-slate-700 bg-slate-800 p-6">
			<div class="space-y-4">
				<h3 class="text-lg font-semibold text-white">{m.delete_match()}</h3>
				<p class="text-gray-300">
					{m.delete_match_confirmation()}
				</p>

				<div class="flex justify-end gap-2">
					<button
						class="rounded-md bg-gray-700 px-4 py-2 font-medium text-white hover:bg-gray-600"
						onclick={closeDeleteGameModal}
					>
						{m.cancel()}
					</button>
					<form method="POST" action="?/delete" use:enhance={handleDeleteSubmit} class="inline">
						<input type="hidden" name="id" value={editingMatch.match.id} />
						<button
							type="submit"
							class="rounded-md bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-500"
							disabled={isDeleting}
						>
							{isDeleting ? m.deleting() : m.delete()}
						</button>
					</form>
				</div>
			</div>
		</div>
	</div>
{/if}

<!-- Stage Edit Modal -->
{#if showStageEdit}
	<StageEdit
		stage={selectedStage}
		eventId={selectedEvent.id}
		onCancel={closeStageEdit}
		onSuccess={handleStageSuccess}
	/>
{/if}

<!-- Bracket Edit Modal -->
{#if showBracketEdit && selectedStage}
	<Modal show={true} title={m.edit_bracket()} onClose={closeBracketEdit}>
		<BracketEdit
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
	<GameEdit data={editingGame} onCancel={closeGameModal} onSuccess={closeGameModal} />
{/if}

<!-- Game Delete Modal -->
{#if deletingGame}
	<Modal show={true} title={m.delete_game()} onClose={closeDeleteGameModal} dismissible={false}>
		<div class="p-4">
			<p class="mb-4 text-slate-200">{m.delete_game_confirmation()}</p>
			<div class="flex justify-end gap-2">
				<button
					type="button"
					class="rounded-md border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-800"
					onclick={closeDeleteGameModal}
					disabled={isDeletingGame}>{m.cancel()}</button
				>
				<button
					type="button"
					class="rounded-md bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
					onclick={handleDeleteGameSubmit}
					disabled={isDeletingGame}>{isDeletingGame ? m.deleting() : m.delete()}</button
				>
			</div>
		</div>
	</Modal>
{/if}
