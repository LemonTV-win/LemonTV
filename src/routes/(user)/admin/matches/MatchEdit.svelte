<!-- src/routes/(user)/admin/matches/MatchEdit.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Match, MatchTeam, MatchMap, Team, Map as GameMap } from '$lib/server/db/schema';
	import { m } from '$lib/paraglide/messages';
	import type { ActionResult } from '@sveltejs/kit';

	import IconParkSolidDelete from '~icons/icon-park-solid/delete';
	import IconParkSolidAdd from '~icons/icon-park-solid/add';

	let {
		match,
		matchTeams,
		matchMaps,
		teams,
		maps,
		stages,
		onCancel,
		onSuccess: onsuccess
	}: {
		match: Partial<Match>;
		matchTeams: MatchTeam[];
		matchMaps: MatchMap[];
		teams: Team[];
		maps: GameMap[];
		stages: { id: string; name: string; eventName: string }[];
		onCancel: () => void;
		onSuccess: () => void;
	} = $props();

	let newMatch = $state({
		id: match.id || '',
		format: match.format || '',
		stageId: match.stageId ? match.stageId.toString() : null
	});

	let teamData = $state([
		{
			teamId: matchTeams.find((mt) => mt.position === 0)?.teamId || '',
			score: matchTeams.find((mt) => mt.position === 0)?.score || 0
		},
		{
			teamId: matchTeams.find((mt) => mt.position === 1)?.teamId || '',
			score: matchTeams.find((mt) => mt.position === 1)?.score || 0
		}
	]);

	let mapData = $state(
		matchMaps.map((mm) => ({
			mapId: mm.mapId,
			order: mm.order,
			side: mm.side,
			action: mm.action || null,
			map_picker_position: mm.map_picker_position,
			side_picker_position: mm.side_picker_position
		}))
	);

	let errorMessage = $state('');
	let successMessage = $state('');

	const formatOptions = ['BO1', 'BO3', 'BO5'];
	const sideOptions = ['Attack', 'Defense'];
	const mapActionOptions = ['pick', 'ban', 'decider'] as const;
	type MapAction = (typeof mapActionOptions)[number] | null;

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

	// Group stages by event
	let stagesByEvent: Map<string, { id: string; name: string }[]> = $derived.by(() => {
		const groups = new Map<string, { id: string; name: string }[]>();
		stages.forEach((stage) => {
			if (!groups.has(stage.eventName)) {
				groups.set(stage.eventName, []);
			}
			groups.get(stage.eventName)?.push({ id: stage.id, name: stage.name });
		});
		return groups;
	});

	// Prepare form data before submission
	function prepareFormData() {
		return {
			...newMatch,
			teams: teamData.map((team, index) => ({
				teamId: team.teamId,
				position: index,
				score: team.score
			})),
			maps: mapData
		};
	}
</script>

<form
	method="POST"
	action={match.id ? '?/update' : '?/create'}
	use:enhance={() => {
		return ({ result }: { result: ActionResult }) => {
			if (result.type === 'success') {
				onsuccess();
			} else if (result.type === 'failure') {
				errorMessage = result.data?.error || m.failed_to_change_password();
			} else if (result.type === 'error') {
				errorMessage = result.error?.message || m.error_occurred();
			}
		};
	}}
	class="flex h-full flex-col"
>
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
			class="h-full space-y-4 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb]:hover:bg-slate-500 [&::-webkit-scrollbar-track]:bg-slate-800"
		>
			{#if match.id}
				<div>
					<label class="block text-sm font-medium text-slate-300" for="matchId">ID</label>
					<input
						type="text"
						id="matchId"
						name="id"
						value={match.id}
						readonly
						class="block w-full rounded-md border border-slate-700 bg-slate-800/50 px-3 py-2 text-slate-400 placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none [&:read-only]:cursor-default [&:read-only]:opacity-75 [&:read-only]:select-none"
					/>
				</div>
			{/if}

			<div>
				<label class="block text-sm font-medium text-slate-300" for="matchStage">
					{m.stage()}
				</label>
				<select
					id="matchStage"
					name="stageId"
					bind:value={newMatch.stageId}
					class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
				>
					<option value={null}>{m.select_stage()}</option>
					{#each [...stagesByEvent] as [eventName, eventStages]}
						<optgroup label={eventName}>
							{#each eventStages as stage}
								<option value={stage.id}>{stage.name}</option>
							{/each}
						</optgroup>
					{/each}
				</select>
			</div>

			<div>
				<label class="block text-sm font-medium text-slate-300" for="matchFormat">
					{m.match_format()}
				</label>
				<select
					id="matchFormat"
					name="format"
					bind:value={newMatch.format}
					class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
				>
					{#each formatOptions as format}
						<option value={format}>{format}</option>
					{/each}
				</select>
			</div>

			<div>
				<label class="block text-sm font-medium text-slate-300" for="matchTeams">
					{m.teams()}
				</label>
				<div class="mt-2 rounded-lg border border-slate-700 bg-slate-800 p-4">
					{#each teamData as team, position}
						<div
							class="grid grid-cols-[1fr_1fr_auto] gap-4 {position > 0
								? 'mt-4 border-t border-slate-700 pt-4'
								: ''}"
						>
							<div>
								<label class="block text-sm font-medium text-slate-300" for="team-{position}">
									{m.team()}
								</label>
								<select
									id="team-{position}"
									name="teams[{position}].teamId"
									bind:value={team.teamId}
									class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
								>
									<option value="">{m.select_team()}</option>
									{#each teams as teamOption}
										<option value={teamOption.id}>{teamOption.name}</option>
									{/each}
								</select>
							</div>
							<div>
								<label class="block text-sm font-medium text-slate-300" for="score-{position}">
									{m.score()}
								</label>
								<input
									type="number"
									id="score-{position}"
									name="teams[{position}].score"
									bind:value={team.score}
									min="0"
									class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
								/>
							</div>
							<div class="flex items-center">
								<button
									type="button"
									class="mt-[1.625rem] text-red-400 hover:text-red-300"
									onclick={() => {
										teamData = teamData.filter((_, index) => index !== position);
									}}
									title={m.remove_team()}
								>
									<IconParkSolidDelete class="h-5 w-5" />
								</button>
							</div>
						</div>
					{/each}
					{#if teamData.length > 0}
						<div class="my-4 border-t border-slate-700"></div>
					{/if}
					<button
						type="button"
						class="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-slate-700 bg-slate-800/50 px-4 py-2 text-yellow-500 transition-colors hover:border-yellow-500 hover:bg-slate-800"
						onclick={() => {
							teamData = [
								...teamData,
								{
									teamId: '',
									score: 0
								}
							];
						}}
					>
						<IconParkSolidAdd class="h-5 w-5" />
						<span>{m.add_team()}</span>
					</button>
				</div>
			</div>

			<div>
				<label class="block text-sm font-medium text-slate-300" for="matchMaps">
					{m.maps()}
				</label>
				<div class="mt-2 rounded-lg border border-slate-700 bg-slate-800 p-4">
					{#each mapData as map, index}
						<div
							class="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 {index > 0
								? 'mt-4 border-t border-slate-700 pt-4'
								: ''}"
						>
							<div>
								<label class="block text-sm font-medium text-slate-300" for="map-{index}">
									{m.map()}
								</label>
								<select
									id="map-{index}"
									name="maps[{index}].mapId"
									bind:value={map.mapId}
									class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
								>
									<option value={null}>{m.select_map()}</option>
									{#each maps as mapOption}
										<option value={mapOption.id}>{MAP_2_NAME[mapOption.id]}</option>
									{/each}
								</select>
							</div>
							<div>
								<label class="block text-sm font-medium text-slate-300" for="action-{index}">
									{m.action()}
								</label>
								<select
									id="action-{index}"
									name="maps[{index}].action"
									bind:value={map.action}
									class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
								>
									<option value={null}>{m.none()}</option>
									{#each mapActionOptions as action}
										<option value={action}>{action}</option>
									{/each}
								</select>
							</div>
							<div>
								<label class="block text-sm font-medium text-slate-300" for="side-{index}">
									{m.side()}
								</label>
								<select
									id="side-{index}"
									name="maps[{index}].side"
									bind:value={map.side}
									class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
								>
									<option value={null}>{m.none()}</option>
									<option value={0}>{m.attack()}</option>
									<option value={1}>{m.defense()}</option>
								</select>
							</div>
							<div class="flex items-center">
								<button
									type="button"
									class="mt-[1.625rem] text-red-400 hover:text-red-300"
									onclick={() => {
										mapData = mapData.filter((_, index) => index !== index);
									}}
									title={m.remove_map()}
								>
									<IconParkSolidDelete class="h-5 w-5" />
								</button>
							</div>
						</div>
					{/each}
					{#if mapData.length > 0}
						<div class="my-4 border-t border-slate-700"></div>
					{/if}
					<button
						type="button"
						class="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-slate-700 bg-slate-800/50 px-4 py-2 text-yellow-500 transition-colors hover:border-yellow-500 hover:bg-slate-800"
						onclick={() => {
							mapData = [
								...mapData,
								{
									mapId: '',
									order: mapData.length,
									side: 0,
									action: null,
									map_picker_position: null,
									side_picker_position: null
								}
							];
						}}
					>
						<IconParkSolidAdd class="h-5 w-5" />
						<span>{m.add_map()}</span>
					</button>
				</div>
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
			type="submit"
			class="rounded-md bg-yellow-500 px-4 py-2 font-medium text-black hover:bg-yellow-600"
		>
			{match.id ? m.update_match() : m.create_match()}
		</button>
	</div>
</form>
