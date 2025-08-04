<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';
	import type { GameVod } from '$lib/server/db/schemas/game/match';
	import IconParkSolidDelete from '~icons/icon-park-solid/delete';
	import IconParkSolidEdit from '~icons/icon-park-solid/edit';
	import IconParkSolidAdd from '~icons/icon-park-solid/add';
	import { m } from '$lib/paraglide/messages';
	import { detectPlatform } from '$lib/utils/video';

	let {
		gameId,
		vods,
		onSuccess
	}: {
		gameId: number;
		vods: GameVod[];
		onSuccess: () => void;
	} = $props();

	let errorMessage = $state('');
	let successMessage = $state('');
	let isExtractingMetadata = $state(false);
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
	let deletingVod = $state<GameVod | null>(null);
	let isDeleting = $state(false);

	const vodTypes = [
		{ value: 'main', label: m.main_stream },
		{ value: 'sub', label: m.secondary_stream },
		{ value: 'restream', label: m.restream },
		{ value: 'pov', label: m.player_pov },
		{ value: 'archive', label: m.archive },
		{ value: 'clip', label: m.highlights },
		{ value: 'analysis', label: m.analysis }
	] as const;

	const platforms = [
		{ value: 'youtube', label: 'YouTube' },
		{ value: 'bilibili', label: 'Bilibili' },
		{ value: 'twitch', label: 'Twitch' }
	] as const;

	async function extractMetadata(url: string) {
		if (!url || !detectPlatform(url)) return;

		isExtractingMetadata = true;
		errorMessage = '';

		try {
			const formData = new FormData();
			formData.append('url', url);
			const res = await fetch('/api/video-metadata', { method: 'POST', body: formData });

			if (res.ok) {
				const metadata = await res.json();
				if (editingVod) {
					editingVod.title = metadata.title;
					editingVod.platform = metadata.platform;
					// Also extract start time if available
					if (metadata.startTime !== undefined) {
						editingVod.startTime = metadata.startTime;
					}
				}
			} else {
				const data = await res.json().catch(() => ({}));
				console.warn('Failed to extract metadata:', data.error);
			}
		} catch (e) {
			console.error('Error extracting metadata:', e);
		} finally {
			isExtractingMetadata = false;
		}
	}

	function handleUrlChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const url = target.value;

		if (editingVod) {
			editingVod.url = url;
			// Auto-detect platform
			const detectedPlatform = detectPlatform(url);
			if (detectedPlatform) {
				editingVod.platform = detectedPlatform;
			}
			// Extract metadata if URL is complete
			if (url && url.length > 10) {
				extractMetadata(url);
			}
		}
	}

	function handleEnhance() {
		return ({ result }: { result: ActionResult }) => {
			if (result.type === 'success') {
				successMessage = m.vod_saved_successfully();
				editingVod = null;
				onSuccess();
			} else if (result.type === 'failure') {
				errorMessage = result.data?.error || m.failed_to_save_vod();
			} else if (result.type === 'error') {
				errorMessage = result.error?.message || 'An error occurred';
			}
		};
	}

	async function handleDeleteVod(vod: GameVod) {
		deletingVod = vod;
		isDeleting = true;
		errorMessage = '';
		try {
			const formData = new FormData();
			formData.append('gameId', vod.gameId.toString());
			formData.append('url', vod.url);
			const res = await fetch('?/deleteGameVod', { method: 'POST', body: formData });
			if (res.ok) {
				successMessage = m.vod_deleted_successfully();
				deletingVod = null;
				onSuccess();
			} else {
				const data = await res.json().catch(() => ({}));
				errorMessage = data?.error || m.failed_to_delete_vod();
			}
		} catch (e) {
			console.error('Error deleting VOD:', e);
			errorMessage = m.error_deleting_vod();
		} finally {
			isDeleting = false;
		}
	}

	function startEdit(vod?: GameVod) {
		editingVod = vod
			? {
					url: vod.url,
					type: vod.type as 'main' | 'sub' | 'restream' | 'pov' | 'archive' | 'clip' | 'analysis',
					playerId: vod.playerId || undefined,
					teamId: vod.teamId || undefined,
					language: vod.language || undefined,
					platform: vod.platform as 'youtube' | 'bilibili' | 'twitch' | undefined,
					title: vod.title || undefined,
					official: vod.official,
					startTime: vod.startTime || undefined,
					available: vod.available
				}
			: {
					url: '',
					type: 'main',
					official: true,
					available: true
				};
		errorMessage = '';
		successMessage = '';
	}

	function cancelEdit() {
		editingVod = null;
		errorMessage = '';
		successMessage = '';
	}
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<h3 class="text-lg font-semibold text-slate-300">{m.vods()}</h3>
		<button
			type="button"
			onclick={() => startEdit()}
			class="flex items-center gap-2 rounded bg-yellow-500 px-3 py-1 text-sm text-black hover:bg-yellow-600"
		>
			<IconParkSolidAdd class="h-4 w-4" />
			{m.add_vod()}
		</button>
	</div>

	{#if errorMessage}
		<div class="rounded bg-red-900/50 p-3 text-red-200">{errorMessage}</div>
	{/if}

	{#if successMessage}
		<div class="rounded bg-green-900/50 p-3 text-green-200">{successMessage}</div>
	{/if}

	{#if editingVod}
		<div class="rounded border border-slate-700 bg-slate-800 p-4">
			<h4 class="mb-3 font-medium text-slate-300">
				{editingVod.url ? m.edit_vod() : m.add_vod()}
			</h4>
			<form method="POST" action="?/saveGameVod" use:enhance={handleEnhance} class="space-y-3">
				<input type="hidden" name="gameId" value={gameId} />

				<div>
					<label for="vodUrl" class="block text-sm font-medium text-slate-300">{m.vod_url()}</label>
					<div class="relative">
						<input
							type="url"
							id="vodUrl"
							name="url"
							bind:value={editingVod.url}
							oninput={handleUrlChange}
							required
							class="mt-1 block w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-white shadow-sm focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none"
							placeholder="https://example.com/vod"
						/>
						{#if isExtractingMetadata}
							<div class="absolute top-1/2 right-3 -translate-y-1/2">
								<div
									class="h-4 w-4 animate-spin rounded-full border-2 border-yellow-500 border-t-transparent"
								></div>
							</div>
						{/if}
					</div>
				</div>

				<div>
					<label for="vodType" class="block text-sm font-medium text-slate-300"
						>{m.vod_type()}</label
					>
					<select
						id="vodType"
						name="type"
						bind:value={editingVod.type}
						required
						class="mt-1 block w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-white shadow-sm focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none"
					>
						{#each vodTypes as type}
							<option value={type.value}>{type.label()}</option>
						{/each}
					</select>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div>
						<label for="vodTitle" class="block text-sm font-medium text-slate-300"
							>{m.vod_title()}</label
						>
						<input
							type="text"
							id="vodTitle"
							name="title"
							bind:value={editingVod.title}
							class="mt-1 block w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-white shadow-sm focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none"
							placeholder={m.vod_title_placeholder()}
						/>
					</div>

					<div>
						<label for="vodPlatform" class="block text-sm font-medium text-slate-300"
							>{m.vod_platform()}</label
						>
						<select
							id="vodPlatform"
							name="platform"
							bind:value={editingVod.platform}
							class="mt-1 block w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-white shadow-sm focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none"
						>
							<option value="">{m.select_platform()}</option>
							{#each platforms as platform}
								<option value={platform.value}>{platform.label}</option>
							{/each}
						</select>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div>
						<label for="vodLanguage" class="block text-sm font-medium text-slate-300"
							>{m.vod_language()}</label
						>
						<input
							type="text"
							id="vodLanguage"
							name="language"
							bind:value={editingVod.language}
							class="mt-1 block w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-white shadow-sm focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none"
							placeholder={m.language_placeholder()}
						/>
					</div>

					<div>
						<label for="vodStartTime" class="block text-sm font-medium text-slate-300"
							>{m.vod_start_time()}</label
						>
						<input
							type="number"
							id="vodStartTime"
							name="startTime"
							bind:value={editingVod.startTime}
							min="0"
							class="mt-1 block w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-white shadow-sm focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none"
							placeholder="0"
						/>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div>
						<label for="vodPlayerId" class="block text-sm font-medium text-slate-300"
							>{m.vod_player_id()}</label
						>
						<input
							type="text"
							id="vodPlayerId"
							name="playerId"
							bind:value={editingVod.playerId}
							class="mt-1 block w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-white shadow-sm focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none"
							placeholder={m.for_pov_vods()}
						/>
					</div>

					<div>
						<label for="vodTeamId" class="block text-sm font-medium text-slate-300"
							>{m.vod_team_id()}</label
						>
						<input
							type="text"
							id="vodTeamId"
							name="teamId"
							bind:value={editingVod.teamId}
							class="mt-1 block w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-white shadow-sm focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none"
							placeholder={m.for_team_specific_vods()}
						/>
					</div>
				</div>

				<div class="flex gap-4">
					<label class="flex items-center gap-2">
						<input
							type="checkbox"
							name="official"
							bind:checked={editingVod.official}
							class="rounded border-slate-700 bg-slate-800 text-yellow-500 focus:ring-yellow-500"
						/>
						<span class="text-sm text-slate-300">{m.official_vod()}</span>
					</label>

					<label class="flex items-center gap-2">
						<input
							type="checkbox"
							name="available"
							bind:checked={editingVod.available}
							class="rounded border-slate-700 bg-slate-800 text-yellow-500 focus:ring-yellow-500"
						/>
						<span class="text-sm text-slate-300">{m.available()}</span>
					</label>
				</div>

				<div class="flex gap-2">
					<button
						type="submit"
						class="rounded bg-yellow-500 px-4 py-2 text-black hover:bg-yellow-600"
					>
						{m.save()}
					</button>
					<button
						type="button"
						onclick={cancelEdit}
						class="rounded border border-slate-700 bg-slate-800 px-4 py-2 text-slate-300 hover:bg-slate-700"
					>
						{m.cancel()}
					</button>
				</div>
			</form>
		</div>
	{/if}

	{#if vods.length === 0}
		<div
			class="rounded border border-dashed border-slate-700 bg-slate-800/50 p-4 text-center text-slate-400"
		>
			{m.no_vods_added_yet()}
		</div>
	{:else}
		<div class="space-y-2">
			{#each vods as vod}
				<div
					class="flex items-center justify-between rounded border border-slate-700 bg-slate-800 p-3"
				>
					<div class="flex-1">
						<div class="flex items-center gap-2">
							<a
								href={vod.url}
								target="_blank"
								rel="noopener noreferrer"
								class="text-yellow-500 hover:text-yellow-400"
							>
								{vod.title || vod.url}
							</a>
							{#if vod.official}
								<span class="rounded bg-green-600 px-2 py-1 text-xs text-white">{m.official()}</span
								>
							{/if}
							{#if !vod.available}
								<span class="rounded bg-red-600 px-2 py-1 text-xs text-white"
									>{m.unavailable()}</span
								>
							{/if}
						</div>
						<div class="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
							<span>{m.type_label()} {vod.type}</span>
							{#if vod.platform}
								<span>{m.platform_label()} {vod.platform}</span>
							{/if}
							{#if vod.language}
								<span>{m.language_label()} {vod.language}</span>
							{/if}
							{#if vod.startTime}
								<span
									>{m.start_label()}
									{Math.floor(vod.startTime / 60)}:{(vod.startTime % 60)
										.toString()
										.padStart(2, '0')}</span
								>
							{/if}
							<span>{m.added_label()} {new Date(vod.createdAt).toLocaleDateString()}</span>
						</div>
					</div>
					<div class="flex gap-2">
						<button
							type="button"
							onclick={() => startEdit(vod)}
							class="rounded bg-slate-700 p-1 text-slate-300 hover:bg-slate-600"
							title={m.edit_vod_title()}
						>
							<IconParkSolidEdit class="h-4 w-4" />
						</button>
						<button
							type="button"
							onclick={() => handleDeleteVod(vod)}
							class="rounded bg-red-900/50 p-1 text-red-400 hover:bg-red-800/50"
							title={m.delete_vod_title()}
							disabled={isDeleting && deletingVod === vod}
						>
							<IconParkSolidDelete class="h-4 w-4" />
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
