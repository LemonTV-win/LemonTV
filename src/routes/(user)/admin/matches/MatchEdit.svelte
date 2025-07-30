<!-- src/routes/(user)/admin/matches/MatchEdit.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Match, MatchTeam, MatchMap, Team, Map as GameMap } from '$lib/server/db/schema';
	import { m } from '$lib/paraglide/messages';
	import type { ActionResult } from '@sveltejs/kit';
	import Combobox from '$lib/components/Combobox.svelte';

	import IconParkSolidDelete from '~icons/icon-park-solid/delete';
	import IconParkSolidAdd from '~icons/icon-park-solid/add';
	import { SvelteMap } from 'svelte/reactivity';
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
	const mapActionOptions = ['pick', 'ban', 'decider', 'set'] as const;

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
	let stagesByEvent: SvelteMap<string, { id: string; name: string }[]> = $derived.by(() => {
		const groups = new SvelteMap<string, { id: string; name: string }[]>();
		stages.forEach((stage) => {
			if (!groups.has(stage.eventName)) {
				groups.set(stage.eventName, []);
			}
			groups.get(stage.eventName)?.push({ id: stage.id, name: stage.name });
		});
		return groups;
	});

	function addTeam() {
		teamData = [
			...teamData,
			{
				teamId: '',
				score: 0
			}
		];
	}

	function removeTeam(index: number) {
		teamData = teamData.filter((_, i) => i !== index);
	}

	function addMap() {
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
	}

	function removeMap(index: number) {
		mapData = mapData.filter((_, i) => i !== index);
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

	<div
		class="flex-1 space-y-4 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb:hover]:bg-slate-500 [&::-webkit-scrollbar-track]:bg-slate-800"
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
					class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800/50 px-3 py-2 text-slate-400 placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none [&:read-only]:cursor-default [&:read-only]:opacity-75 [&:read-only]:select-none"
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
				{#each [...stagesByEvent] as [eventName, eventStages] (eventName)}
					<optgroup label={eventName}>
						{#each eventStages as stage (stage.id)}
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
				{#each formatOptions as format (format)}
					<option value={format}>{format}</option>
				{/each}
			</select>
		</div>

		<fieldset>
			<legend class="block text-sm font-medium text-slate-300">{m.teams()}</legend>
			<div class="mt-2 space-y-4">
				{#each teamData as team, position (team.teamId)}
					<div class="rounded-lg border border-slate-700 bg-slate-800 p-4">
						<div class="grid grid-cols-[1fr_auto_auto] gap-4">
							<div>
								<label class="block text-sm font-medium text-slate-300" for="team-{position}">
									{m.team()}
								</label>
								<input type="hidden" name="teams[{position}].position" value={position} />
								<Combobox
									id="team-{position}"
									name="teams[{position}].teamId"
									items={teams.map((t) => ({
										id: t.id,
										name: t.name,
										slug: t.slug,
										abbr: t.abbr,
										group: teamData.some((td) => td.teamId === t.id) ? 'selected' : 'available'
									}))}
									bind:value={team.teamId}
									placeholder={m.select_team()}
									searchLabels={['slug', 'abbr', 'aliases']}
									groups={[
										{ id: 'selected', label: m.attending_teams() },
										{ id: 'available', label: m.other_teams() }
									]}
									class="mt-1 px-3 py-2"
								/>
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
									onclick={() => removeTeam(position)}
									title={m.remove_team()}
								>
									<IconParkSolidDelete class="h-5 w-5" />
								</button>
							</div>
						</div>
					</div>
				{/each}
				<button
					type="button"
					class="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-slate-700 bg-slate-800/50 px-4 py-2 text-yellow-500 transition-colors hover:border-yellow-500 hover:bg-slate-800"
					onclick={addTeam}
				>
					<IconParkSolidAdd class="h-5 w-5" />
					<span>{m.add_team()}</span>
				</button>
			</div>
		</fieldset>

		<fieldset>
			<legend class="block text-sm font-medium text-slate-300">{m.maps()}</legend>
			<div class="mt-2 space-y-4">
				{#each mapData as map, index (map.mapId)}
					<div class="rounded-lg border border-slate-700 bg-slate-800 p-4">
						<div class="grid grid-cols-[1fr_1fr_1fr_auto] gap-4">
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
									{#each maps as mapOption (mapOption.id)}
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
									{#each mapActionOptions as action (action)}
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
									onclick={() => removeMap(index)}
									title={m.remove_map()}
								>
									<IconParkSolidDelete class="h-5 w-5" />
								</button>
							</div>
						</div>
					</div>
				{/each}
				<button
					type="button"
					class="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-slate-700 bg-slate-800/50 px-4 py-2 text-yellow-500 transition-colors hover:border-yellow-500 hover:bg-slate-800"
					onclick={addMap}
				>
					<IconParkSolidAdd class="h-5 w-5" />
					<span>{m.add_map()}</span>
				</button>
			</div>
		</fieldset>
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
