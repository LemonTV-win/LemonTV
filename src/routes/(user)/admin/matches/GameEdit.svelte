<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';
	import CharacterSelect from '$lib/components/CharacterSelect.svelte';
	import AccountIdCombobox from '$lib/components/AccountIdCombobox.svelte';
	import PlayerScoreJsonInput from './PlayerScoreJsonInput.svelte';
	import PlayerScoreJsonExport from './PlayerScoreJsonExport.svelte';
	import GameVodEdit from './GameVodEdit.svelte';
	import type { GameParticipant } from './+page.server';
	import type { GamePlayerScore } from '$lib/server/db/schemas';
	import type { Character } from '$lib/data/game';
	import { CHARACTERS } from '$lib/data/game';
	import IconTrophy from '~icons/icon-park-solid/trophy';
	import { m } from '$lib/paraglide/messages';
	import IconParkSolidAdd from '~icons/icon-park-solid/add';
	import IconParkSolidEdit from '~icons/icon-park-solid/edit';
	import IconParkSolidDelete from '~icons/icon-park-solid/delete';
	let {
		game,
		matchId,
		maps,
		onCancel,
		onSuccess,
		teams,
		rosters,
		match
	}: {
		game?: any;
		matchId: string;
		maps: Array<{ id: string; name?: string }>;
		onCancel: () => void;
		onSuccess: () => void;
		teams: [
			{ id: string; name: string; logo?: string },
			{ id: string; name: string; logo?: string }
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
			}>;
		};
	} = $props();

	$inspect('[admin/matches/GameEdit] game', game);
	$inspect('[admin/matches/GameEdit] teams', teams);
	$inspect('[admin/matches/GameEdit] rosters', rosters);
	$inspect('[admin/matches/GameEdit] match', match);

	// Calculate the next map to be played based on match's map pick order
	function getNextMapToPlay(): string {
		if (!match || !game) return ''; // If editing existing game, don't change map

		// Sort maps by order
		const sortedMaps = match.maps.sort((a, b) => a.order - b.order);

		// Get maps that have been played (exist in games)
		const playedMapIds = new Set(match.games.map((game) => game.mapId));

		// Find the first map that hasn't been played yet
		for (const map of sortedMaps) {
			if (!playedMapIds.has(map.mapId)) {
				return map.mapId;
			}
		}

		// If all maps have been played, return empty string
		return '';
	}

	let formData = $state({
		mapId: game?.mapId || getNextMapToPlay(),
		duration: game?.duration || '',
		winner: game?.winner ?? ''
	});

	// Automatically calculate winner based on team score difference
	let calculatedWinner = $derived.by(() => {
		if (teamData[0].score > teamData[1].score) {
			return '0'; // Team A wins
		} else if (teamData[1].score > teamData[0].score) {
			return '1'; // Team B wins
		} else {
			return ''; // Tie or no winner
		}
	});

	let errorMessage = $state('');
	let showDeleteConfirm = $state(false);
	let isDeleting = $state(false);
	let showImportModal = $state(false);
	let showExportModal = $state(false);

	// Add state for VODs during game creation
	let gameVods = $state<
		Array<{
			url: string;
			type: 'main' | 'sub' | 'restream' | 'pov' | 'archive' | 'clip' | 'analysis';
			playerId?: string;
			teamId?: string;
			language?: string;
			platform?: 'youtube' | 'bilibili' | 'twitch';
			title?: string;
			official: boolean;
			startTime?: number;
			available: boolean;
		}>
	>([]);

	let showVodForm = $state(false);
	let editingVod = $state<{
		url: string;
		type: 'main' | 'sub' | 'restream' | 'pov' | 'archive' | 'clip' | 'analysis';
		playerId?: string;
		teamId?: string;
		language?: string;
		platform?: 'youtube' | 'bilibili' | 'twitch';
		title?: string;
		official: boolean;
		startTime?: number;
		available: boolean;
	} | null>(null);

	const vodTypes = [
		{ value: 'main', label: m.main_stream() },
		{ value: 'sub', label: m.secondary_stream() },
		{ value: 'restream', label: m.restream() },
		{ value: 'pov', label: m.player_pov() },
		{ value: 'archive', label: m.archive() },
		{ value: 'clip', label: m.highlights() },
		{ value: 'analysis', label: m.analysis() }
	] as const;

	const platforms = [
		{ value: 'youtube', label: 'YouTube' },
		{ value: 'bilibili', label: 'Bilibili' },
		{ value: 'twitch', label: 'Twitch' }
	] as const;

	function startEditVod(vod?: any) {
		editingVod = vod
			? { ...vod }
			: {
					url: '',
					type: 'main',
					official: true,
					available: true
				};
		showVodForm = true;
	}

	function cancelEditVod() {
		editingVod = null;
		showVodForm = false;
	}

	function saveVod() {
		if (editingVod && editingVod.url) {
			const vodIndex = gameVods.findIndex((v) => v.url === editingVod!.url);
			if (vodIndex >= 0) {
				gameVods[vodIndex] = { ...editingVod };
			} else {
				gameVods = [...gameVods, { ...editingVod }];
			}
			cancelEditVod();
		}
	}

	function removeVod(index: number) {
		gameVods = gameVods.filter((_, i) => i !== index);
	}

	// Add state for teams and player scores
	let teamData = $state([
		game?.teams?.[0]
			? {
					teamId: game.teams[0].teamId,
					position: 0,
					score: game.teams[0].score
				}
			: { teamId: teams[0].id, position: 0, score: 0 },
		game?.teams?.[1]
			? {
					teamId: game.teams[1].teamId,
					position: 1,
					score: game.teams[1].score
				}
			: { teamId: teams[1].id, position: 1, score: 0 }
	]);

	$inspect('[admin/matches/GameEdit] teamData', teamData);

	let playerScoresA: GamePlayerScore[] = $state(
		game?.playerScores?.filter((ps: GamePlayerScore) => ps.teamId === teamData[0].teamId) ??
			Array(5)
				.fill(null)
				.map(() => ({
					player: '',
					characterFirstHalf: '',
					characterSecondHalf: '',
					score: 0,
					damageScore: 0,
					kills: 0,
					knocks: 0,
					deaths: 0,
					assists: 0,
					damage: 0,
					accountId: '',
					teamId: teamData[0].teamId
				}))
	);
	let playerScoresB = $state(
		game?.playerScores?.filter((ps: any) => ps.teamId === teamData[1].teamId) ??
			Array(5)
				.fill(null)
				.map(() => ({
					player: '',
					characterFirstHalf: '',
					characterSecondHalf: '',
					score: 0,
					damageScore: 0,
					kills: 0,
					knocks: 0,
					deaths: 0,
					assists: 0,
					damage: 0,
					accountId: '',
					teamId: teamData[1].teamId
				}))
	);

	function handleEnhance() {
		return ({ result }: { result: ActionResult }) => {
			if (result.type === 'success') {
				onSuccess();
			} else if (result.type === 'failure') {
				errorMessage = result.data?.error || 'Failed to save game';
			} else if (result.type === 'error') {
				errorMessage = result.error?.message || 'An error occurred';
			}
		};
	}

	async function handleDelete() {
		if (!game) return;
		isDeleting = true;
		errorMessage = '';
		try {
			const formData = new FormData();
			formData.append('id', game.id);
			const res = await fetch('?/deleteGame', { method: 'POST', body: formData });
			if (res.ok) {
				onSuccess();
			} else {
				const data = await res.json().catch(() => ({}));
				errorMessage = data?.error || 'Failed to delete game';
			}
		} catch (e) {
			console.error('Error deleting game:', e);
			errorMessage = 'An error occurred while deleting';
		} finally {
			isDeleting = false;
			showDeleteConfirm = false;
		}
	}

	function rostersToGameAccountIDMap(
		rosters: {
			player: GameParticipant;
			job: 'main' | 'sub' | 'coach';
		}[]
	) {
		const map = new Map<
			number,
			{
				player: GameParticipant;
				job: 'main' | 'sub' | 'coach';
			}
		>();
		for (const roster of rosters) {
			for (const account of roster.player.gameAccounts) {
				map.set(account.accountId, roster);
			}
		}
		return map;
	}

	let compiledGameAccountIDMaps = $derived([
		rostersToGameAccountIDMap(rosters[0]),
		rostersToGameAccountIDMap(rosters[1])
	]);

	$inspect('[admin/matches/GameEdit] compiledGameAccountIDMaps', compiledGameAccountIDMaps);
</script>

<form
	method="POST"
	action={game ? '?/updateGame' : '?/createGame'}
	use:enhance={handleEnhance}
	class="flex h-full flex-col"
>
	<input type="hidden" name="matchId" value={matchId} />
	{#if game}
		<input type="hidden" name="id" value={game.id} />
	{/if}

	<!-- Hidden inputs for VOD data during game creation -->
	{#if !game}
		{#each gameVods as vod, index (index)}
			<input type="hidden" name={`gameVods[${index}].url`} value={vod.url} />
			<input type="hidden" name={`gameVods[${index}].type`} value={vod.type} />
			<input type="hidden" name={`gameVods[${index}].playerId`} value={vod.playerId || ''} />
			<input type="hidden" name={`gameVods[${index}].teamId`} value={vod.teamId || ''} />
			<input type="hidden" name={`gameVods[${index}].language`} value={vod.language || ''} />
			<input type="hidden" name={`gameVods[${index}].platform`} value={vod.platform || ''} />
			<input type="hidden" name={`gameVods[${index}].title`} value={vod.title || ''} />
			<input type="hidden" name={`gameVods[${index}].official`} value={vod.official ? 'on' : ''} />
			<input type="hidden" name={`gameVods[${index}].startTime`} value={vod.startTime || ''} />
			<input
				type="hidden"
				name={`gameVods[${index}].available`}
				value={vod.available ? 'on' : ''}
			/>
		{/each}
	{/if}

	{#if errorMessage}
		<div class="mb-4 rounded-md bg-red-900/50 p-4 text-red-200" role="alert">
			<span class="block sm:inline">{errorMessage}</span>
		</div>
	{/if}

	<div
		class="flex-1 space-y-4 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb:hover]:bg-slate-500 [&::-webkit-scrollbar-track]:bg-slate-800"
	>
		<div>
			<label class="block text-sm font-medium text-slate-300" for="mapId">{m.map()}</label>
			<select
				id="mapId"
				name="mapId"
				bind:value={formData.mapId}
				class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-300 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
				required
			>
				<option value="">{m.select_map()}</option>
				{#each maps as map (map.id)}
					<option value={map.id}>{map.name || map.id}</option>
				{/each}
			</select>
		</div>
		<div>
			<label class="block text-sm font-medium text-slate-300" for="duration">{m.duration()}</label>
			<input
				type="number"
				id="duration"
				name="duration"
				min="0"
				bind:value={formData.duration}
				class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-300 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
				required
			/>
		</div>
		<input type="hidden" name="winner" value={calculatedWinner} />
		<!-- Teams editing -->
		<fieldset>
			<legend class="block text-sm font-medium text-slate-300">{m.teams()}</legend>
			<div class="mt-2 grid grid-cols-2 gap-4">
				{#each teamData as team, idx (idx)}
					<input type="hidden" name={`gameTeams[${idx}].teamId`} value={team.teamId} />
					<input type="hidden" name={`gameTeams[${idx}].position`} value={team.position} />
					<div class="rounded-lg border border-slate-700 bg-slate-800 p-4">
						<div class="mb-2 flex items-center gap-2 font-semibold text-slate-200">
							{#if teams && teams[idx]?.logo}
								<img src={teams[idx].logo} alt={teams[idx].name} class="h-6 w-6 rounded" />
							{/if}
							<span
								>{teams && teams[idx]?.name
									? teams[idx].name
									: idx === 0
										? m.team_a()
										: m.team_b()}</span
							>
							{#if calculatedWinner === idx.toString()}
								<IconTrophy class="h-4 w-4 text-yellow-500" />
							{/if}
						</div>
						<div>
							<label class="block text-xs text-slate-400" for={`gameTeams[${idx}].score`}>
								{m.score()}
							</label>
							<input
								type="number"
								id={`gameTeams[${idx}].score`}
								name={`gameTeams[${idx}].score`}
								bind:value={team.score}
								class={[
									'mt-1 block w-full rounded border px-2 py-1 text-slate-200 ',
									calculatedWinner === idx.toString()
										? 'border-yellow-500 bg-yellow-500/10'
										: calculatedWinner !== '' && calculatedWinner !== idx.toString()
											? 'border-red-500 bg-red-500/10'
											: 'border-slate-700 bg-slate-900'
								]}
								required
							/>
						</div>
					</div>
				{/each}
			</div>
		</fieldset>
		<!-- Player scores editing -->
		<div class="mb-4 flex items-center justify-between">
			<h3 class="text-sm font-medium text-slate-300">{m.player_scores()}</h3>
			<div class="flex gap-2">
				<button
					type="button"
					class="cursor-pointer rounded-md border border-slate-600 bg-slate-800 px-3 py-1 text-sm text-slate-300 hover:bg-slate-700"
					onclick={() => (showImportModal = true)}
				>
					{m.import_json_data()}
				</button>
				<button
					type="button"
					class="cursor-pointer rounded-md border border-slate-600 bg-slate-800 px-3 py-1 text-sm text-slate-300 hover:bg-slate-700"
					onclick={() => (showExportModal = true)}
				>
					{m.export_json_data()}
				</button>
			</div>
		</div>
		{#snippet playerScoreInput(
			team: 'A' | 'B',
			ps: {
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
			},
			idx: number,
			availableCharactersFirstHalf: readonly Character[],
			availableCharactersSecondHalf: readonly Character[]
		)}
			<div class="flex flex-col gap-1 rounded bg-slate-900 p-2">
				<AccountIdCombobox
					value={ps.accountId}
					options={new Map(
						Array.from(compiledGameAccountIDMaps[team === 'A' ? 0 : 1].entries()).map(
							([accountId, roster]) => [
								accountId,
								`${roster.player.name} ${roster.player.aliases.map((a) => `(${a})`).join(' ')}`
							]
						)
					)}
					placeholder={m.enter_account_id()}
					name={`playerScores${team}[${idx}].accountId`}
					onchange={(value) => {
						ps.accountId = value;
						if (!ps.player) {
							const roster = compiledGameAccountIDMaps[team === 'A' ? 0 : 1].get(value);
							if (roster) {
								const account = roster.player.gameAccounts.find((a) => a.accountId === value);
								if (account) {
									ps.player = account.currentName;
								}
							}
						}
					}}
				/>
				<div class="flex gap-1">
					<input
						type="text"
						name={`playerScores${team}[${idx}].player`}
						bind:value={ps.player}
						placeholder={m.player()}
						class="col-span-2 rounded border border-slate-700 bg-slate-800 px-2 py-1 text-slate-200"
						required
					/>
					<CharacterSelect
						value={ps.characterFirstHalf as Character | null}
						onChange={(v) => (ps.characterFirstHalf = v)}
						name={`playerScores${team}[${idx}].characterFirstHalf`}
						class="col-span-1"
						characters={availableCharactersFirstHalf}
					/>
					<CharacterSelect
						value={ps.characterSecondHalf as Character | null}
						onChange={(v) => (ps.characterSecondHalf = v)}
						name={`playerScores${team}[${idx}].characterSecondHalf`}
						class="col-span-1"
						characters={availableCharactersSecondHalf}
					/>
				</div>
				<div class="grid grid-cols-7 gap-1">
					<input
						type="number"
						name={`playerScores${team}[${idx}].score`}
						bind:value={ps.score}
						placeholder={m.performance_score()}
						title={m.performance_score()}
						class="col-span-1 rounded border border-slate-700 bg-slate-800 px-2 py-1 text-slate-200"
					/>
					<input
						type="number"
						name={`playerScores${team}[${idx}].damageScore`}
						bind:value={ps.damageScore}
						placeholder={m.damage_score()}
						title={m.damage_score()}
						class="col-span-1 rounded border border-slate-700 bg-slate-800 px-2 py-1 text-slate-200"
					/>
					<input
						type="number"
						name={`playerScores${team}[${idx}].kills`}
						bind:value={ps.kills}
						placeholder={m.kills()}
						title={m.kills()}
						class="col-span-1 rounded border border-slate-700 bg-slate-800 px-2 py-1 text-slate-200"
					/>
					<input
						type="number"
						name={`playerScores${team}[${idx}].knocks`}
						bind:value={ps.knocks}
						placeholder={m.knocks()}
						title={m.knocks()}
						class="col-span-1 rounded border border-slate-700 bg-slate-800 px-2 py-1 text-slate-200"
					/>
					<input
						type="number"
						name={`playerScores${team}[${idx}].deaths`}
						bind:value={ps.deaths}
						placeholder={m.deaths()}
						title={m.deaths()}
						class="col-span-1 rounded border border-slate-700 bg-slate-800 px-2 py-1 text-slate-200"
					/>
					<input
						type="number"
						name={`playerScores${team}[${idx}].assists`}
						bind:value={ps.assists}
						placeholder={m.assists()}
						title={m.assists()}
						class="col-span-1 rounded border border-slate-700 bg-slate-800 px-2 py-1 text-slate-200"
					/>
					<input
						type="number"
						name={`playerScores${team}[${idx}].damage`}
						bind:value={ps.damage}
						placeholder={m.damage()}
						title={m.damage()}
						class="col-span-1 rounded border border-slate-700 bg-slate-800 px-2 py-1 text-slate-200"
					/>
				</div>
			</div>
		{/snippet}
		<div>
			<h3 class="block text-sm font-medium text-slate-300">
				{m.player_scores()} ({teams[0].name})
			</h3>
			<div class="mt-2 grid grid-cols-1 gap-2">
				{#each playerScoresA as ps, idx (idx)}
					{@render playerScoreInput(
						'A',
						ps,
						idx,
						CHARACTERS.filter(
							(char) =>
								!playerScoresA.some(
									(ps: GamePlayerScore, i: number) =>
										i !== idx && ps.player && ps.characterFirstHalf === char
								)
						),
						CHARACTERS.filter(
							(char) =>
								!playerScoresA.some(
									(ps: GamePlayerScore, i: number) =>
										i !== idx && ps.player && ps.characterSecondHalf === char
								)
						)
					)}
				{/each}
			</div>
		</div>
		<div>
			<h3 class="block text-sm font-medium text-slate-300">
				{m.player_scores()} ({teams[1].name})
			</h3>
			<div class="mt-2 grid grid-cols-1 gap-2">
				{#each playerScoresB as ps, idx (idx)}
					{@render playerScoreInput(
						'B',
						ps,
						idx,
						CHARACTERS.filter(
							(char) =>
								!playerScoresB.some(
									(ps: GamePlayerScore, i: number) =>
										i !== idx && ps.player && ps.characterFirstHalf === char
								)
						),
						CHARACTERS.filter(
							(char) =>
								!playerScoresB.some(
									(ps: GamePlayerScore, i: number) =>
										i !== idx && ps.player && ps.characterSecondHalf === char
								)
						)
					)}
				{/each}
			</div>
		</div>

		<!-- VOD creation for new games -->
		{#if !game}
			<div class="mt-8 border-t border-slate-700 pt-6">
				<div class="mb-4 flex items-center justify-between">
					<h3 class="text-lg font-semibold text-slate-300">{m.vods()}</h3>
					<button
						type="button"
						onclick={() => startEditVod()}
						class="flex items-center gap-2 rounded bg-yellow-500 px-3 py-1 text-sm text-black hover:bg-yellow-600"
					>
						<IconParkSolidAdd class="h-4 w-4" />
						{m.add_vod()}
					</button>
				</div>

				{#if gameVods.length > 0}
					<div class="space-y-2">
						{#each gameVods as vod, index (index)}
							<div
								class="flex items-center justify-between rounded border border-slate-700 bg-slate-800 p-3"
							>
								<div class="flex-1">
									<div class="flex items-center gap-2">
										<span class="text-sm font-medium text-slate-300">{vod.title || vod.url}</span>
										<span class="text-xs text-slate-500"
											>({vodTypes.find((t) => t.value === vod.type)?.label})</span
										>
										{#if vod.official}
											<span class="rounded bg-yellow-500/20 px-1 text-xs text-yellow-300"
												>Official</span
											>
										{/if}
									</div>
									<div class="mt-1 text-xs text-slate-400">{vod.url}</div>
								</div>
								<div class="flex gap-2">
									<button
										type="button"
										onclick={() => startEditVod(vod)}
										class="text-slate-400 hover:text-slate-300"
									>
										<IconParkSolidEdit class="h-4 w-4" />
									</button>
									<button
										type="button"
										onclick={() => removeVod(index)}
										class="text-red-400 hover:text-red-300"
									>
										<IconParkSolidDelete class="h-4 w-4" />
									</button>
								</div>
							</div>
						{/each}
					</div>
				{/if}

				{#if showVodForm && editingVod}
					<div class="mt-4 rounded border border-slate-700 bg-slate-800 p-4">
						<h4 class="mb-3 font-medium text-slate-300">
							{editingVod.url ? m.edit_vod() : m.add_vod()}
						</h4>
						<div class="space-y-3">
							<div>
								<label class="block text-xs text-slate-400" for="vod-url">{m.url()}</label>
								<input
									type="url"
									id="vod-url"
									bind:value={editingVod.url}
									placeholder="https://..."
									class="mt-1 block w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-slate-300 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
									required
								/>
							</div>
							<div class="grid grid-cols-2 gap-3">
								<div>
									<label class="block text-xs text-slate-400" for="vod-type">{m.type()}</label>
									<select
										id="vod-type"
										bind:value={editingVod.type}
										class="mt-1 block w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-slate-300 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
									>
										{#each vodTypes as type}
											<option value={type.value}>{type.label}</option>
										{/each}
									</select>
								</div>
								<div>
									<label class="block text-xs text-slate-400" for="vod-platform"
										>{m.platform()}</label
									>
									<select
										id="vod-platform"
										bind:value={editingVod.platform}
										class="mt-1 block w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-slate-300 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
									>
										<option value="">{m.select_platform()}</option>
										{#each platforms as platform}
											<option value={platform.value}>{platform.label}</option>
										{/each}
									</select>
								</div>
							</div>
							<div>
								<label class="block text-xs text-slate-400" for="vod-title">{m.vod_title()}</label>
								<input
									type="text"
									id="vod-title"
									bind:value={editingVod.title}
									placeholder={m.vod_title_placeholder()}
									class="mt-1 block w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-slate-300 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
								/>
							</div>
							<div class="grid grid-cols-2 gap-3">
								<div>
									<label class="block text-xs text-slate-400" for="vod-start-time"
										>{m.vod_start_time()}</label
									>
									<input
										type="number"
										id="vod-start-time"
										bind:value={editingVod.startTime}
										placeholder="0"
										class="mt-1 block w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-slate-300 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
									/>
								</div>
								<div>
									<label class="block text-xs text-slate-400" for="vod-language"
										>{m.language()}</label
									>
									<input
										type="text"
										id="vod-language"
										bind:value={editingVod.language}
										placeholder="en"
										class="mt-1 block w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-slate-300 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
									/>
								</div>
							</div>
							<div class="flex gap-4">
								<label class="flex items-center gap-2">
									<input
										type="checkbox"
										bind:checked={editingVod.official}
										class="rounded border-slate-600 bg-slate-800 text-yellow-500 focus:ring-yellow-500"
									/>
									<span class="text-sm text-slate-300">{m.official()}</span>
								</label>
								<label class="flex items-center gap-2">
									<input
										type="checkbox"
										bind:checked={editingVod.available}
										class="rounded border-slate-600 bg-slate-800 text-yellow-500 focus:ring-yellow-500"
									/>
									<span class="text-sm text-slate-300">{m.available()}</span>
								</label>
							</div>
							<div class="flex justify-end gap-2">
								<button
									type="button"
									onclick={cancelEditVod}
									class="rounded border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-800"
								>
									{m.cancel()}
								</button>
								<button
									type="button"
									onclick={saveVod}
									class="rounded bg-yellow-500 px-4 py-2 text-black hover:bg-yellow-600"
								>
									{m.save()}
								</button>
							</div>
						</div>
					</div>
				{/if}
			</div>
		{/if}

		{#if game}
			<div class="mt-8 border-t border-slate-700 pt-6">
				<GameVodEdit
					gameId={game.id}
					vods={game.vods || []}
					onSuccess={() => {
						// Refresh the page data
						window.location.reload();
					}}
				/>
			</div>
		{/if}

		{#if game}
			<div class="mt-8 border-t border-slate-700 pt-6">
				<h3 class="mb-2 text-sm font-semibold text-red-400">{m.danger_zone()}</h3>
				{#if showDeleteConfirm}
					<div class="mb-4 rounded-md bg-red-900/60 p-4 text-red-200">
						<p>{m.delete_game_confirm()}</p>
						<div class="mt-4 flex justify-end gap-2">
							<button
								type="button"
								class="rounded-md border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-800"
								onclick={() => (showDeleteConfirm = false)}
								disabled={isDeleting}>{m.cancel()}</button
							>
							<button
								type="button"
								class="rounded-md bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
								onclick={handleDelete}
								disabled={isDeleting}>{isDeleting ? m.deleting() : m.delete_game()}</button
							>
						</div>
					</div>
				{:else}
					<button
						type="button"
						class="rounded-md border border-red-700 bg-red-900/30 px-4 py-2 text-red-300 hover:bg-red-800/60"
						onclick={() => (showDeleteConfirm = true)}
					>
						{m.delete_game()}
					</button>
				{/if}
			</div>
		{/if}
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
			type="submit"
			class="rounded-md bg-yellow-500 px-4 py-2 font-medium text-black hover:bg-yellow-600"
		>
			{game ? m.save_game() : m.add_game()}
		</button>
	</div>
</form>

{#if showImportModal}
	<PlayerScoreJsonInput
		showModal={showImportModal}
		{playerScoresA}
		{playerScoresB}
		{teamData}
		{compiledGameAccountIDMaps}
		onClose={() => (showImportModal = false)}
	/>
{/if}

{#if showExportModal}
	<PlayerScoreJsonExport
		showModal={showExportModal}
		{playerScoresA}
		{playerScoresB}
		{teamData}
		onClose={() => (showExportModal = false)}
	/>
{/if}
