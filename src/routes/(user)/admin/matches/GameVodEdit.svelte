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
		{ value: 'main', label: 'Main Stream' },
		{ value: 'sub', label: 'Secondary Stream' },
		{ value: 'restream', label: 'Restream' },
		{ value: 'pov', label: 'Player POV' },
		{ value: 'archive', label: 'Archive' },
		{ value: 'clip', label: 'Highlights' },
		{ value: 'analysis', label: 'Analysis' }
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
				successMessage = 'VOD saved successfully';
				editingVod = null;
				onSuccess();
			} else if (result.type === 'failure') {
				errorMessage = result.data?.error || 'Failed to save VOD';
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
				successMessage = 'VOD deleted successfully';
				deletingVod = null;
				onSuccess();
			} else {
				const data = await res.json().catch(() => ({}));
				errorMessage = data?.error || 'Failed to delete VOD';
			}
		} catch (e) {
			console.error('Error deleting VOD:', e);
			errorMessage = 'An error occurred while deleting';
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
		<h3 class="text-lg font-semibold text-slate-300">VODs</h3>
		<button
			type="button"
			onclick={() => startEdit()}
			class="flex items-center gap-2 rounded bg-yellow-500 px-3 py-1 text-sm text-black hover:bg-yellow-600"
		>
			<IconParkSolidAdd class="h-4 w-4" />
			Add VOD
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
				{editingVod.url ? 'Edit VOD' : 'Add VOD'}
			</h4>
			<form method="POST" action="?/saveGameVod" use:enhance={handleEnhance} class="space-y-3">
				<input type="hidden" name="gameId" value={gameId} />

				<div>
					<label for="vodUrl" class="block text-sm font-medium text-slate-300">VOD URL *</label>
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
					<label for="vodType" class="block text-sm font-medium text-slate-300">Type *</label>
					<select
						id="vodType"
						name="type"
						bind:value={editingVod.type}
						required
						class="mt-1 block w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-white shadow-sm focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none"
					>
						{#each vodTypes as type}
							<option value={type.value}>{type.label}</option>
						{/each}
					</select>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div>
						<label for="vodTitle" class="block text-sm font-medium text-slate-300">Title</label>
						<input
							type="text"
							id="vodTitle"
							name="title"
							bind:value={editingVod.title}
							class="mt-1 block w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-white shadow-sm focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none"
							placeholder="VOD title"
						/>
					</div>

					<div>
						<label for="vodPlatform" class="block text-sm font-medium text-slate-300"
							>Platform</label
						>
						<select
							id="vodPlatform"
							name="platform"
							bind:value={editingVod.platform}
							class="mt-1 block w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-white shadow-sm focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none"
						>
							<option value="">Select platform</option>
							{#each platforms as platform}
								<option value={platform.value}>{platform.label}</option>
							{/each}
						</select>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div>
						<label for="vodLanguage" class="block text-sm font-medium text-slate-300"
							>Language</label
						>
						<input
							type="text"
							id="vodLanguage"
							name="language"
							bind:value={editingVod.language}
							class="mt-1 block w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-white shadow-sm focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none"
							placeholder="en, zh, etc."
						/>
					</div>

					<div>
						<label for="vodStartTime" class="block text-sm font-medium text-slate-300"
							>Start Time (seconds)</label
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
							>Player ID</label
						>
						<input
							type="text"
							id="vodPlayerId"
							name="playerId"
							bind:value={editingVod.playerId}
							class="mt-1 block w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-white shadow-sm focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none"
							placeholder="For POV VODs"
						/>
					</div>

					<div>
						<label for="vodTeamId" class="block text-sm font-medium text-slate-300">Team ID</label>
						<input
							type="text"
							id="vodTeamId"
							name="teamId"
							bind:value={editingVod.teamId}
							class="mt-1 block w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-white shadow-sm focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none"
							placeholder="For team-specific VODs"
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
						<span class="text-sm text-slate-300">Official VOD</span>
					</label>

					<label class="flex items-center gap-2">
						<input
							type="checkbox"
							name="available"
							bind:checked={editingVod.available}
							class="rounded border-slate-700 bg-slate-800 text-yellow-500 focus:ring-yellow-500"
						/>
						<span class="text-sm text-slate-300">Available</span>
					</label>
				</div>

				<div class="flex gap-2">
					<button
						type="submit"
						class="rounded bg-yellow-500 px-4 py-2 text-black hover:bg-yellow-600"
					>
						Save
					</button>
					<button
						type="button"
						onclick={cancelEdit}
						class="rounded border border-slate-700 bg-slate-800 px-4 py-2 text-slate-300 hover:bg-slate-700"
					>
						Cancel
					</button>
				</div>
			</form>
		</div>
	{/if}

	{#if vods.length === 0}
		<div
			class="rounded border border-dashed border-slate-700 bg-slate-800/50 p-4 text-center text-slate-400"
		>
			No VODs added yet
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
								<span class="rounded bg-green-600 px-2 py-1 text-xs text-white">Official</span>
							{/if}
							{#if !vod.available}
								<span class="rounded bg-red-600 px-2 py-1 text-xs text-white">Unavailable</span>
							{/if}
						</div>
						<div class="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
							<span>Type: {vod.type}</span>
							{#if vod.platform}
								<span>Platform: {vod.platform}</span>
							{/if}
							{#if vod.language}
								<span>Language: {vod.language}</span>
							{/if}
							{#if vod.startTime}
								<span
									>Start: {Math.floor(vod.startTime / 60)}:{(vod.startTime % 60)
										.toString()
										.padStart(2, '0')}</span
								>
							{/if}
							<span>Added: {new Date(vod.createdAt).toLocaleDateString()}</span>
						</div>
					</div>
					<div class="flex gap-2">
						<button
							type="button"
							onclick={() => startEdit(vod)}
							class="rounded bg-slate-700 p-1 text-slate-300 hover:bg-slate-600"
							title="Edit VOD"
						>
							<IconParkSolidEdit class="h-4 w-4" />
						</button>
						<button
							type="button"
							onclick={() => handleDeleteVod(vod)}
							class="rounded bg-red-900/50 p-1 text-red-400 hover:bg-red-800/50"
							title="Delete VOD"
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
