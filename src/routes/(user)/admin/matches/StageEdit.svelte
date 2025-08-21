<!-- src/routes/(user)/admin/matches/StageEdit.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { m } from '$lib/paraglide/messages';
	import type { ActionResult } from '@sveltejs/kit';

	import Modal from '$lib/components/Modal.svelte';

	let {
		stage,
		eventId,
		onCancel,
		onSuccess
	}: {
		stage?: {
			id: number;
			title: string;
			stage: string;
			format: string;
		};
		eventId: string;
		onCancel: () => void;
		onSuccess: () => void;
	} = $props();

	let newStage = $state({
		title: stage?.title || '',
		stage: stage?.stage || 'group',
		format: stage?.format || 'single'
	});

	let errorMessage = $state('');
	let successMessage = $state('');

	const stageOptions = ['group', 'qualifier', 'showmatch', 'playoff'] as const;
	const formatOptions = ['single', 'double', 'swiss', 'round-robin'] as const;
</script>

<Modal show={true} title={m.edit_stage()} onClose={onCancel} size="compact">
	<form
		method="POST"
		action={stage ? '?/updateStage' : '?/createStage'}
		use:enhance={() => {
			return ({ result }: { result: ActionResult }) => {
				if (result.type === 'success') {
					onSuccess();
				} else if (result.type === 'failure') {
					errorMessage = result.data?.error || m.failed_to_save_stage();
				} else if (result.type === 'error') {
					errorMessage = result.error?.message || m.error_generic_title();
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
			<div class="styled-scroll h-full space-y-4 overflow-y-auto pr-2">
				{#if stage?.id}
					<div>
						<label class="block text-sm font-medium text-slate-300" for="stageId">ID</label>
						<input
							type="text"
							id="stageId"
							name="id"
							value={stage.id}
							readonly
							class="block w-full rounded-md border border-slate-700 bg-slate-800/50 px-3 py-2 text-slate-400 placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none [&:read-only]:cursor-default [&:read-only]:opacity-75 [&:read-only]:select-none"
						/>
					</div>
				{/if}

				<input type="hidden" name="eventId" value={eventId} />

				<div>
					<label class="block text-sm font-medium text-slate-300" for="title"
						>{m.stage_title_label()}</label
					>
					<input
						type="text"
						id="title"
						name="title"
						bind:value={newStage.title}
						required
						class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
					/>
				</div>

				<div>
					<label class="block text-sm font-medium text-slate-300" for="stage"
						>{m.stage_type_label()}</label
					>
					<select
						id="stage"
						name="stage"
						bind:value={newStage.stage}
						required
						class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
					>
						{#each stageOptions as stageOption (stageOption)}
							<option value={stageOption}>{stageOption}</option>
						{/each}
					</select>
				</div>

				<div>
					<label class="block text-sm font-medium text-slate-300" for="format"
						>{m.stage_format_label()}</label
					>
					<select
						id="format"
						name="format"
						bind:value={newStage.format}
						required
						class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
					>
						{#each formatOptions as formatOption (formatOption)}
							<option value={formatOption}>{formatOption}</option>
						{/each}
					</select>
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
				{stage ? m.update_stage() : m.create_stage()}
			</button>
		</div>
	</form>
</Modal>
