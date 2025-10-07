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
	import { MAP_NAMES, MAPS } from '$lib/data/game';
	import Modal from '$lib/components/Modal.svelte';
	let {
		match,
		matchTeams,
		matchMaps,
		teams,
		stages,
		onCancel,
		onSuccess: onsuccess
	}: {
		match: Partial<Match>;
		matchTeams: MatchTeam[];
		matchMaps: MatchMap[];
		teams: (Pick<Team, 'id' | 'name' | 'abbr' | 'slug'> & { aliases: string[] })[];
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

	let showDeleteConfirm = $state(false);
	let isDeleting = $state(false);

	async function handleDelete() {
		isDeleting = true;
		errorMessage = '';
		try {
			if (!match.id) return;
			const formData = new FormData();
			formData.append('id', String(match.id));
			const res = await fetch('?/delete', { method: 'POST', body: formData });
			if (res.ok) {
				onsuccess();
			} else {
				const data = await res.json().catch(() => ({}));
				errorMessage = data?.error || m.error_occurred();
			}
		} catch (e) {
			console.error('Error deleting match:', e);
			errorMessage = m.error_occurred();
		} finally {
			isDeleting = false;
			showDeleteConfirm = false;
		}
	}

	const formatOptions = ['BO1', 'BO3', 'BO5'];
	const mapActionOptions = ['pick', 'ban', 'decider', 'set'] as const;

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

<Modal show={true} title={m.edit_match()} onClose={() => {}}>
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

		<div class="styled-scroll flex-1 space-y-4 overflow-y-auto pr-2">
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
					{#each [...stagesByEvent] as [eventName, eventStages], i (i)}
						<optgroup label={eventName}>
							{#each eventStages as stage, j (`${i}-${j}`)}
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
					{#each teamData as team, position (position)}
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
											aliases: t.aliases,
											group: teamData.some((td) => td.teamId === t.id) ? 'selected' : 'available'
										}))}
										bind:value={team.teamId}
										placeholder={m.select_team()}
										filterFunction={(item, searchTerm) => {
											if (!searchTerm) return true;
											const searchLower = searchTerm.toLowerCase();
											return !!(
												(
													item.id.toLowerCase().includes(searchLower) ||
													item.name.toLowerCase().includes(searchLower) ||
													item.slug.toLowerCase().includes(searchLower) ||
													item.abbr?.toLowerCase().includes(searchLower) ||
													item.aliases?.some((alias) => alias.toLowerCase().includes(searchLower))
												)
												// || (item.aliases &&
												// 	Array.isArray(item.aliases) &&
												// 	item.aliases.some(
												// 		(alias) =>
												// 			typeof alias === 'string' && alias.toLowerCase().includes(searchLower)
												// 	))
											);
										}}
										groups={[
											{ id: 'selected', label: m.attending_teams() },
											{ id: 'available', label: m.other_teams() }
										]}
										class="mt-1 px-3 py-2"
										secondaryTextFunction={(item) => {
											return item.abbr ?? '';
										}}
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
					{#each mapData as map, index (index)}
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
										{#each MAPS as map}
											<option value={map}>{MAP_NAMES[map]()}</option>
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

			{#if match.id}
				<div class="mt-8 border-t border-slate-700 pt-6">
					<h3 class="mb-2 text-sm font-semibold text-red-400">{m.danger_zone()}</h3>
					{#if showDeleteConfirm}
						<div class="mb-4 rounded-md bg-red-900/60 p-4 text-red-200">
							<p>{m.delete_match_confirmation()}</p>
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
									disabled={isDeleting}>{isDeleting ? m.deleting() : m.delete_match()}</button
								>
							</div>
						</div>
					{:else}
						<button
							type="button"
							class="rounded-md border border-red-700 bg-red-900/30 px-4 py-2 text-red-300 hover:bg-red-800/60"
							onclick={() => (showDeleteConfirm = true)}
						>
							{m.delete_match()}
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
				{match.id ? m.update_match() : m.create_match()}
			</button>
		</div>
	</form>
</Modal>
