<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Team, TeamPlayer, TeamAlias } from '$lib/server/db/schema';
	import type { Player } from '$lib/server/db/schema';
	import { m } from '$lib/paraglide/messages';
	import IconParkSolidAdd from '~icons/icon-park-solid/add';
	import IconParkSolidDelete from '~icons/icon-park-solid/delete';
	import ImageUpload from '$lib/components/ImageUpload.svelte';
	import TeamPlayerInput from './subforms/TeamPlayerInput.svelte';
	import SloganInput from './subforms/SloganInput.svelte';
	import { formatSlug } from '$lib/utils/strings';
	import { SITE_CANONICAL_HOST } from '$lib/consts';
	import type { TCountryCode } from 'countries-list';

	interface Props {
		team: Partial<Team>;
		players: {
			id: string;
			name: string;
			slug: string;
			avatar: string | null;
			nationalities: TCountryCode[];
		}[];
		teamPlayers: TeamPlayer[];
		teamAliases: TeamAlias[];
		teamSlogans?: Array<{
			id?: number;
			slogan: string;
			language?: string | null;
			eventId?: string | null;
		}>;
		onCancel: () => void;
		events?: Array<{ id: string; name: string; date?: string; imageURL?: string }>;
	}

	let { team, players, teamPlayers, teamAliases, teamSlogans, onCancel, events }: Props = $props();

	let newTeam: Partial<Team> & { logo: string | null } = $state({
		...team,
		logo: team.logo ?? null
	});
	let errorMessage = $state('');
	let successMessage = $state('');
	let hasFile = $state(false);
	let uploaded = $state(false);
	let lastTeamName = $state(team.name || '');

	$effect(() => {
		// Only update slug if:
		// 1. Team name has changed AND
		// 2. No slug exists yet
		if (newTeam.name && newTeam.name !== lastTeamName) {
			if (!newTeam.slug) {
				newTeam.slug = formatSlug(newTeam.name);
			}
			lastTeamName = newTeam.name;
		}
	});

	let aliases = $state<string[]>(teamAliases.map((a: TeamAlias) => a.alias));
	let selectedPlayers = $state<
		{
			playerId: string;
			role: string;
			startedOn?: string;
			endedOn?: string;
			note?: string;
		}[]
	>(
		teamPlayers.map((tp: TeamPlayer) => ({
			playerId: tp.playerId,
			role: tp.role,
			startedOn: tp.startedOn || undefined,
			endedOn: tp.endedOn || undefined,
			note: tp.note || undefined
		}))
	);

	let newAlias = $state('');

	// Slogans state
	let slogans = $state<
		Array<{ id?: number; slogan: string; language: string | null; eventId: string | null }>
	>(
		(teamSlogans || []).map(
			(s: { id?: number; slogan: string; language?: string | null; eventId?: string | null }) => ({
				id: s.id,
				slogan: s.slogan,
				language: s.language ?? null,
				eventId: s.eventId ?? null
			})
		)
	);
	let newSloganText = $state('');
	let newSloganLang = $state('');

	function addAlias() {
		if (newAlias && !aliases.includes(newAlias)) {
			aliases = [...aliases, newAlias];
			newAlias = '';
		}
	}

	function removeAlias(alias: string) {
		aliases = aliases.filter((a) => a !== alias);
	}

	function addSlogan() {
		if (newSloganText.trim()) {
			slogans = [
				...slogans,
				{
					id: undefined,
					slogan: newSloganText.trim(),
					language: newSloganLang || null,
					eventId: null as string | null
				}
			];
			newSloganText = '';
			newSloganLang = '';
		}
	}

	function removeSlogan(index: number) {
		slogans.splice(index, 1);
		slogans = [...slogans];
	}
</script>

<form
	method="POST"
	action={team.id ? '?/update' : '?/create'}
	use:enhance={({ formData }) => {
		// Add aliases data
		formData.append('aliases', JSON.stringify(aliases));
		// Add players data
		formData.append('players', JSON.stringify(selectedPlayers));
		// Add slogans data
		formData.append(
			'slogans',
			JSON.stringify(
				slogans
					.filter((s) => s.slogan?.trim())
					.map((s) => ({
						slogan: s.slogan.trim(),
						language: s.language ?? null,
						eventId: s.eventId ?? null
					}))
			)
		);

		// Prevent submission if there's a pending file upload
		if (hasFile && !uploaded) {
			errorMessage = 'Please upload the selected image before saving the team.';
			return;
		}

		return async ({ result }) => {
			if (result.type === 'success') {
				onCancel();
			} else if (result.type === 'failure') {
				errorMessage =
					(result as { type: 'failure'; data?: { error?: string } }).data?.error ??
					'An error occurred';
			} else if (result.type === 'error') {
				errorMessage =
					(result as { type: 'error'; error: { message: string } }).error?.message ??
					'An error occurred';
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
		{#if team.id}
			<div>
				<label class="block text-sm font-medium text-slate-300" for="eventId">ID</label>
				<input
					type="text"
					id="teamId"
					name="id"
					value={team.id}
					readonly
					class="block w-full rounded-md border border-slate-700 bg-slate-800/50 px-3 py-2 text-slate-400 placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none [&:read-only]:cursor-default [&:read-only]:opacity-75 [&:read-only]:select-none"
				/>
			</div>
		{/if}
		<div class="grid grid-cols-2 gap-4">
			<div>
				<label for="teamName" class="block text-sm font-medium text-slate-300">
					{m.team_name()}
				</label>
				<input
					type="text"
					id="teamName"
					name="name"
					bind:value={newTeam.name}
					class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
					placeholder={m.team_name()}
					required
				/>
			</div>
			<div>
				<label for="teamRegion" class="block text-sm font-medium text-slate-300">
					{m.region()}
				</label>
				<select
					id="teamRegion"
					name="region"
					bind:value={newTeam.region}
					class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
				>
					<option value="">{m.select_region()}</option>
					{#each Object.entries( { NA: m.north_america(), EU: m.europe(), APAC: m.asia_pacific(), CN: m.china() } ) as [region, label] (region)}
						<option value={region}>{label}</option>
					{/each}
				</select>
			</div>
			<div>
				<label for="teamSlug" class="block text-sm font-medium text-slate-300">
					{m.slug()}
				</label>
				<input
					type="text"
					id="teamSlug"
					name="slug"
					bind:value={newTeam.slug}
					class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
					placeholder={`${SITE_CANONICAL_HOST}/teams/⟨${m.slug().toLocaleLowerCase()}⟩`}
				/>
			</div>
			<div>
				<label for="teamAbbr" class="block text-sm font-medium text-slate-300">
					{m.abbr()}
				</label>
				<input
					type="text"
					id="teamAbbr"
					name="abbr"
					bind:value={newTeam.abbr}
					class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
					placeholder={m.abbr()}
				/>
			</div>
		</div>

		<div>
			<label for="teamLogo" class="block text-sm font-medium text-slate-300">
				{m.logo()}
			</label>
			<ImageUpload bind:value={newTeam.logo} prefix="teams" bind:hasFile bind:uploaded />
			<input type="hidden" name="logo" value={newTeam.logo} />
		</div>

		<div>
			<div class="flex items-center justify-between">
				<label for="aliases-section" class="block text-sm font-medium text-slate-300"
					>{m.aliases()}</label
				>
			</div>
			<div id="aliases-section" class="mt-2 rounded-lg border border-slate-700 bg-slate-800 p-4">
				<!-- <input type="hidden" id="aliases" name="aliases" value={aliases} /> -->
				{#each aliases as alias, i (i)}
					<div
						class="grid grid-cols-[1fr_auto] gap-4 {i > 0
							? 'mt-4 border-t border-slate-700 pt-4'
							: ''}"
					>
						<div>
							<label class="block text-sm font-medium text-slate-300" for="alias-{i}">
								{m.alias()}
							</label>
							<input
								type="text"
								id="alias-{i}"
								value={alias}
								oninput={(e) => (aliases[i] = e.currentTarget.value)}
								class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
								placeholder={m.alias()}
							/>
						</div>
						<div class="flex items-center">
							<button
								type="button"
								class="mt-[1.625rem] text-red-400 hover:text-red-300"
								onclick={() => removeAlias(alias)}
								title={m.remove()}
							>
								<IconParkSolidDelete class="h-5 w-5" />
							</button>
						</div>
					</div>
				{/each}
				{#if aliases.length > 0}
					<div class="my-4 border-t border-slate-700"></div>
				{/if}
				<div class="flex items-center gap-2">
					<input
						type="text"
						bind:value={newAlias}
						class="block w-full rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
						placeholder={m.add_alias()}
					/>
					<button
						type="button"
						onclick={addAlias}
						class="inline-flex items-center rounded-md bg-yellow-500 px-3 py-2 text-sm font-medium text-black hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-slate-900 focus:outline-none"
					>
						<IconParkSolidAdd class="h-4 w-4" />
					</button>
				</div>
			</div>
		</div>

		<div>
			<div class="flex items-center justify-between">
				<label for="players-section" class="block text-sm font-medium text-slate-300"
					>{m.players()}</label
				>
			</div>
			<div id="players-section" class="mt-2 rounded-lg border border-slate-700 bg-slate-800 p-4">
				<TeamPlayerInput {players} bind:selectedPlayers />
			</div>
		</div>

		<!-- Slogans -->
		<div>
			<div class="flex items-center justify-between">
				<label for="slogans-section" class="block text-sm font-medium text-slate-300">Slogans</label
				>
			</div>
			<div id="slogans-section" class="mt-2 rounded-lg border border-slate-700 bg-slate-800 p-4">
				<SloganInput
					bind:slogans
					events={events?.map(
						(e: { id: string; name: string; date?: string; imageURL?: string }) => ({
							id: e.id,
							name: e.name,
							date: e.date,
							imageURL: e.imageURL
						})
					) ?? []}
				/>
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
			{newTeam.id ? m.update_team() : m.create_team()}
		</button>
	</div>
</form>
