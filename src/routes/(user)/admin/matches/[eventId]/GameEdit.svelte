<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';
	import CharacterSelect from '$lib/components/CharacterSelect.svelte';
	import AccountIdCombobox from '$lib/components/AccountIdCombobox.svelte';
	import GameJsonInput from './GameJsonInput.svelte';
	import GameJsonExport from './GameJsonExport.svelte';
	import GameVodEdit from './GameVodEdit.svelte';
	import type { GameParticipant } from './+page.server';
	import type { GamePlayerScore, GameVod } from '$lib/server/db/schemas';
	import type { Character } from '$lib/data/game';
	import { CHARACTERS, MAP_NAMES, MAPS } from '$lib/data/game';
	import IconTrophy from '~icons/icon-park-solid/trophy';

	import Modal from '$lib/components/Modal.svelte';
	import { m } from '$lib/paraglide/messages';
	import IconParkSolidAdd from '~icons/icon-park-solid/add';
	import IconParkSolidEdit from '~icons/icon-park-solid/edit';
	import IconParkSolidDelete from '~icons/icon-park-solid/delete';
	import MinuteSecondTimeInput from '$lib/components/MinuteSecondTimeInput.svelte';
	let {
		onCancel,
		onSuccess,
		data
	}: {
		onCancel: () => void;
		onSuccess: () => void;
		data: {
			game?: {
				id: number;
				matchId: string;
				mapId: string;
				duration: number;
				winner: number;
				teams: {
					teamId: string;
					position: number;
					score: number;
				}[];
				playerScores: GamePlayerScore[];
				vods: GameVod[];
			};
			matchId: string;
			teams: [
				{ id: string; name: string; logo?: string | null } | null,
				{ id: string; name: string; logo?: string | null } | null
			];
			roasters: [
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
		};
	} = $props();

	$inspect('[admin/matches/GameEdit] game', data?.game);
	$inspect('[admin/matches/GameEdit] teams', data?.teams);
	$inspect('[admin/matches/GameEdit] roasters', data?.roasters);
	$inspect('[admin/matches/GameEdit] match', data?.match);

	// Calculate the next map to be played based on match's map pick order
	function getNextMapToPlay(): string {
		if (!data.match || !data.game) return ''; // If editing existing game, don't change map

		// Sort maps by order
		const sortedMaps = data.match.maps.sort((a, b) => a.order - b.order);

		// Get maps that have been played (exist in games)
		const playedMapIds = new Set(data.match.games.map((game) => game.mapId));

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
		mapId: data.game?.mapId || getNextMapToPlay(),
		duration: data.game?.duration || '',
		winner: data.game?.winner ?? ''
	});

	// Automatically calculate winner based on team score difference
	let calculatedWinner = $derived.by(() => {
		if (teamData[0].score > teamData[1].score) {
			return '0'; // Team A wins
		} else if (teamData[1].score > teamData[0].score) {
			return '1'; // Team B wins
		} else {
			return '-1'; // Tie or no winner
		}
	});

	let errorMessage = $state('');
	let showDeleteConfirm = $state(false);
	let isDeleting = $state(false);
	let showImportModal = $state(false);
	let showExportModal = $state(false);

	// Add state for teams and player scores
	let teamData = $state([
		data.game?.teams?.[0]
			? {
					teamId: data.game.teams[0].teamId,
					position: 0,
					score: data.game.teams[0].score
				}
			: { teamId: data.teams[0]?.id || '', position: 0, score: 0 },
		data.game?.teams?.[1]
			? {
					teamId: data.game.teams[1].teamId,
					position: 1,
					score: data.game.teams[1].score
				}
			: { teamId: data.teams[1]?.id || '', position: 1, score: 0 }
	]);

	$inspect('[admin/matches/GameEdit] teamData', teamData);

	let playerScoresA: (Omit<GamePlayerScore, 'id' | 'gameId' | 'accountId'> & {
		accountId: number | null;
	})[] = $state(
		data.game?.playerScores?.filter((ps: GamePlayerScore) => ps.teamId === teamData[0].teamId) ??
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
					accountId: null,
					teamId: teamData[0].teamId
				}))
	);
	let playerScoresB = $state(
		data.game?.playerScores?.filter((ps: any) => ps.teamId === teamData[1].teamId) ??
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
					accountId: null,
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
		if (!data.game) return;
		isDeleting = true;
		errorMessage = '';
		try {
			const formData = new FormData();
			formData.append('id', data.game.id.toString());
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

	function roastersToGameAccountIDMap(
		roasters: {
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
		for (const roaster of roasters) {
			for (const account of roaster.player.gameAccounts) {
				map.set(account.accountId, roaster);
			}
		}
		return map;
	}

	let compiledGameAccountIDMaps = $derived([
		roastersToGameAccountIDMap(data?.roasters?.[0] ?? []),
		roastersToGameAccountIDMap(data?.roasters?.[1] ?? [])
	]);

	$inspect('[admin/matches/GameEdit] compiledGameAccountIDMaps', compiledGameAccountIDMaps);

	let teamAFirstHalfSide: 'unknown' | 'attacker' | 'defender' = $state('unknown');
	let teamBFirstHalfSide: 'unknown' | 'attacker' | 'defender' = $derived(
		teamAFirstHalfSide === 'unknown'
			? 'unknown'
			: teamAFirstHalfSide === 'attacker'
				? 'defender'
				: 'attacker'
	);

	$inspect('[admin/matches/GameEdit] calculatedWinner', calculatedWinner);
</script>

<Modal
	show={true}
	title={data?.game ? m.edit_game() : m.add_game()}
	onClose={onCancel}
	dismissible={false}
>
	{#snippet actionArea()}
		<div class="mr-4 flex items-center justify-end gap-2">
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
	{/snippet}
	<form
		method="POST"
		action={data.game ? '?/updateGame' : '?/createGame'}
		use:enhance={handleEnhance}
		class="flex h-full flex-col"
	>
		<input type="hidden" name="matchId" value={data.matchId} />
		{#if data.game}
			<input type="hidden" name="id" value={data.game.id} />
		{/if}

		{#if errorMessage}
			<div class="mb-4 rounded-md bg-red-900/50 p-4 text-red-200" role="alert">
				<span class="block sm:inline">{errorMessage}</span>
			</div>
		{/if}

		<div class="styled-scroll flex-1 space-y-4 overflow-y-auto pr-2">
			<div class="grid grid-cols-2 gap-4">
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
						{#each MAPS as map (map)}
							<option value={map}>{MAP_NAMES[map]()}</option>
						{/each}
					</select>
				</div>
				<div>
					<label class="block text-sm font-medium text-slate-300" for="duration-sec"
						>{m.duration()}</label
					>
					<MinuteSecondTimeInput
						class="mt-1"
						name="duration"
						id="duration"
						bind:value={formData.duration}
					/>
				</div>
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
								{#if data.teams && data.teams[idx]?.logo}
									<img
										src={data.teams[idx].logo}
										alt={data.teams[idx].name}
										class="h-6 w-6 rounded"
									/>
								{/if}
								<span
									>{data.teams && data.teams[idx]?.name
										? data.teams[idx].name
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
			<section class="flex flex-col gap-4">
				<!-- Player scores editing -->
				<h3 class="text-sm font-medium text-slate-300">{m.player_scores()}</h3>
				{#snippet playerScoreInput(
					team: 'A' | 'B',
					firstHalfSide: 'attacker' | 'defender' | 'unknown',
					ps: {
						accountId: number | null;
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
							value={ps.accountId ?? ''}
							options={new Map(
								Array.from(compiledGameAccountIDMaps[team === 'A' ? 0 : 1].entries()).map(
									([accountId, roaster]) => {
										// Find the specific game account to get the server
										const account = roaster.player.gameAccounts.find(
											(a) => a.accountId === accountId
										);
										const serverName =
											account?.server === 'Strinova' ? m.strinova_server() : m.calabiyau_server();
										return [
											accountId,
											`${roaster.player.name} ${roaster.player.aliases.map((a) => `(${a})`).join(' ')} (${serverName})`
										];
									}
								)
							)}
							placeholder={m.enter_account_id()}
							name={`playerScores${team}[${idx}].accountId`}
							onchange={(value) => {
								ps.accountId = value;
								if (!ps.player) {
									const roaster = compiledGameAccountIDMaps[team === 'A' ? 0 : 1].get(value);
									if (roaster) {
										const account = roaster.player.gameAccounts.find((a) => a.accountId === value);
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
								side={firstHalfSide === 'unknown' ? 'unknown' : firstHalfSide}
							/>
							<CharacterSelect
								value={ps.characterSecondHalf as Character | null}
								onChange={(v) => (ps.characterSecondHalf = v)}
								name={`playerScores${team}[${idx}].characterSecondHalf`}
								class="col-span-1"
								characters={availableCharactersSecondHalf}
								side={firstHalfSide === 'unknown'
									? 'unknown'
									: firstHalfSide === 'attacker'
										? 'defender'
										: 'attacker'}
							/>
						</div>
						<div class="grid grid-cols-7 gap-1">
							<input
								type="number"
								name={`playerScores${team}[${idx}].score`}
								bind:value={ps.score}
								placeholder={m.performance_score()}
								title={m.performance_score()}
								onfocus={(e) => e.currentTarget.select()}
								class="col-span-1 rounded border border-slate-700 bg-slate-800 px-2 py-1 text-slate-200"
							/>
							<input
								type="number"
								name={`playerScores${team}[${idx}].damageScore`}
								bind:value={ps.damageScore}
								placeholder={m.damage_score()}
								title={m.damage_score()}
								onfocus={(e) => e.currentTarget.select()}
								class="col-span-1 rounded border border-slate-700 bg-slate-800 px-2 py-1 text-slate-200"
							/>
							<input
								type="number"
								name={`playerScores${team}[${idx}].kills`}
								bind:value={ps.kills}
								placeholder={m.kills()}
								title={m.kills()}
								onfocus={(e) => e.currentTarget.select()}
								class="col-span-1 rounded border border-slate-700 bg-slate-800 px-2 py-1 text-slate-200"
							/>
							<input
								type="number"
								name={`playerScores${team}[${idx}].knocks`}
								bind:value={ps.knocks}
								placeholder={m.knocks()}
								title={m.knocks()}
								onfocus={(e) => e.currentTarget.select()}
								class="col-span-1 rounded border border-slate-700 bg-slate-800 px-2 py-1 text-slate-200"
							/>
							<input
								type="number"
								name={`playerScores${team}[${idx}].deaths`}
								bind:value={ps.deaths}
								placeholder={m.deaths()}
								title={m.deaths()}
								onfocus={(e) => e.currentTarget.select()}
								class="col-span-1 rounded border border-slate-700 bg-slate-800 px-2 py-1 text-slate-200"
							/>
							<input
								type="number"
								name={`playerScores${team}[${idx}].assists`}
								bind:value={ps.assists}
								placeholder={m.assists()}
								title={m.assists()}
								onfocus={(e) => e.currentTarget.select()}
								class="col-span-1 rounded border border-slate-700 bg-slate-800 px-2 py-1 text-slate-200"
							/>
							<input
								type="number"
								name={`playerScores${team}[${idx}].damage`}
								bind:value={ps.damage}
								placeholder={m.damage()}
								title={m.damage()}
								onfocus={(e) => e.currentTarget.select()}
								class="col-span-1 rounded border border-slate-700 bg-slate-800 px-2 py-1 text-slate-200"
							/>
						</div>
					</div>
				{/snippet}
				<section>
					<div class="flex items-center justify-between">
						<h4 class="block text-sm font-medium text-slate-300">
							{data.teams[0]?.name || m.team_a()}
						</h4>
						<!-- TODO: Based on map ban-pick -->
						<select
							name="firstHalfSide"
							bind:value={teamAFirstHalfSide}
							class="min-w-48 rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-slate-300 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
						>
							<option value="attacker">{m.attack()}</option>
							<option value="defender">{m.defense()}</option>
							<option value="unknown">{m.unknown()}</option>
						</select>
					</div>
					<div class="mt-2 grid grid-cols-1 gap-2">
						{#each playerScoresA as ps, idx (idx)}
							{@render playerScoreInput(
								'A',
								teamAFirstHalfSide,
								ps,
								idx,
								CHARACTERS.filter(
									(char) =>
										!playerScoresA.some(
											(
												ps: Omit<GamePlayerScore, 'id' | 'gameId' | 'accountId'> & {
													accountId: number | null;
												},
												i: number
											) => i !== idx && ps.player && ps.characterFirstHalf === char
										)
								),
								CHARACTERS.filter(
									(char) =>
										!playerScoresA.some(
											(
												ps: Omit<GamePlayerScore, 'id' | 'gameId' | 'accountId'> & {
													accountId: number | null;
												},
												i: number
											) => i !== idx && ps.player && ps.characterSecondHalf === char
										)
								)
							)}
						{/each}
					</div>
				</section>
				<section>
					<div class="flex items-center justify-between">
						<h4 class="block text-sm font-medium text-slate-300">
							{data.teams[1]?.name || m.team_b()}
						</h4>
						<input
							name="teamBFirstHalfSide"
							value={teamBFirstHalfSide === 'attacker'
								? m.attack()
								: teamBFirstHalfSide === 'defender'
									? m.defense()
									: m.unknown()}
							readonly
							class="min-w-48 rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-slate-300 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
						/>
					</div>
					<div class="mt-2 grid grid-cols-1 gap-2">
						{#each playerScoresB as ps, idx (idx)}
							{@render playerScoreInput(
								'B',
								teamBFirstHalfSide,
								ps,
								idx,
								CHARACTERS.filter(
									(char) =>
										!playerScoresB.some(
											(
												ps: Omit<GamePlayerScore, 'id' | 'gameId' | 'accountId'> & {
													accountId: number | null;
												},
												i: number
											) => i !== idx && ps.player && ps.characterFirstHalf === char
										)
								),
								CHARACTERS.filter(
									(char) =>
										!playerScoresB.some(
											(
												ps: Omit<GamePlayerScore, 'id' | 'gameId' | 'accountId'> & {
													accountId: number | null;
												},
												i: number
											) => i !== idx && ps.player && ps.characterSecondHalf === char
										)
								)
							)}
						{/each}
					</div>
				</section>
			</section>

			<section>
				<!-- VOD creation for new games -->
				{#if !data.game}
					<div class="mt-8 border-t border-slate-700 pt-6">
						<GameVodEdit
							mode="create"
							vods={[]}
							onSuccess={() => {
								// VODs will be included in the form submission via hidden inputs
							}}
						/>
					</div>
				{/if}

				{#if data.game}
					<div class="mt-8 border-t border-slate-700 pt-6">
						<GameVodEdit
							gameId={data.game.id}
							vods={data.game.vods || []}
							onSuccess={() => {
								// Refresh the page data
								window.location.reload();
							}}
						/>
					</div>
				{/if}
			</section>

			<section>
				{#if data.game}
					<div class="mt-8 border-t border-slate-700 pt-6">
						<h3 class="mb-2 text-sm font-semibold text-red-400">{m.danger_zone()}</h3>
						{#if showDeleteConfirm}
							<div class="mb-4 rounded-md bg-red-900/60 p-4 text-red-200">
								<p>{m.delete_game_confirm()}</p>
								<div class="mt-4 flex justify-end gap-2">
									<button
										type="button"
										class="cursor-pointer rounded-md border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-800"
										onclick={() => (showDeleteConfirm = false)}
										disabled={isDeleting}>{m.cancel()}</button
									>
									<button
										type="button"
										class="cursor-pointer rounded-md bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
										onclick={handleDelete}
										disabled={isDeleting}>{isDeleting ? m.deleting() : m.delete_game()}</button
									>
								</div>
							</div>
						{:else}
							<button
								type="button"
								class="cursor-pointer rounded-md border border-red-700 bg-red-900/30 px-4 py-2 text-red-300 hover:bg-red-800/60"
								onclick={() => (showDeleteConfirm = true)}
							>
								{m.delete_game()}
							</button>
						{/if}
					</div>
				{/if}
			</section>
		</div>

		<div class="mt-6 flex justify-end gap-4 border-t border-slate-700 pt-4">
			<button
				type="button"
				class="cursor-pointer rounded-md border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-800"
				onclick={onCancel}
			>
				{m.cancel()}
			</button>
			<button
				type="submit"
				class="cursor-pointer rounded-md bg-yellow-500 px-4 py-2 font-medium text-black hover:bg-yellow-600"
			>
				{data.game ? m.save_game() : m.add_game()}
			</button>
		</div>
	</form>

	<!-- TODO: Fix types, don't use as -->
	{#if showImportModal}
		<GameJsonInput
			showModal={showImportModal}
			playerScoresA={playerScoresA as GamePlayerScore[]}
			playerScoresB={playerScoresB as GamePlayerScore[]}
			{teamData}
			{compiledGameAccountIDMaps}
			bind:formData
			onClose={() => (showImportModal = false)}
		/>
	{/if}

	{#if showExportModal}
		<GameJsonExport
			showModal={showExportModal}
			playerScoresA={playerScoresA as GamePlayerScore[]}
			playerScoresB={playerScoresB as GamePlayerScore[]}
			{teamData}
			{formData}
			onClose={() => (showExportModal = false)}
		/>
	{/if}
</Modal>
