<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';
	import CharacterSelect from '$lib/components/CharacterSelect.svelte';
	import AccountIdCombobox from '$lib/components/AccountIdCombobox.svelte';
	import PlayerScoreJsonInput from './PlayerScoreJsonInput.svelte';
	import PlayerScoreJsonExport from './PlayerScoreJsonExport.svelte';
	import type { GameParticipant } from './+page.server';
	import type { GamePlayerScore } from '$lib/server/db/schemas';
	import type { Character } from '$lib/data/game';
	import { CHARACTERS } from '$lib/data/game';
	import IconTrophy from '~icons/icon-park-solid/trophy';
	import { m } from '$lib/paraglide/messages';
	let {
		game,
		matchId,
		maps,
		onCancel,
		onSuccess,
		teams,
		rosters
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
	} = $props();

	$inspect('[admin/matches/GameEdit] game', game);
	$inspect('[admin/matches/GameEdit] teams', teams);
	$inspect('[admin/matches/GameEdit] rosters', rosters);

	let formData = $state({
		mapId: game?.mapId || '',
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
