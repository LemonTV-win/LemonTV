<script lang="ts">
	import IconParkSolidDelete from '~icons/icon-park-solid/delete';
	import IconParkSolidAdd from '~icons/icon-park-solid/add';
	import { m } from '$lib/paraglide/messages';
	import LanguageSelect from '$lib/components/forms/LanguageSelect.svelte';
	import EventSelect from '$lib/components/forms/EventSelect.svelte';

	interface Slogan {
		id?: number;
		slogan: string;
		language: string | null;
		eventId: string | null;
	}

	interface Props {
		slogans?: Array<Slogan>;
		events?: Array<{ id: string; name: string; date?: string; imageURL?: string }>;
	}

	let { slogans = $bindable([]), events = [] }: Props = $props();

	let newSloganText = $state('');
	let newSloganLang = $state<string | null>(null);
	let newSloganEventId = $state('');

	// No local language helpers; use shared LanguageSelect

	function addSlogan() {
		if (!newSloganText.trim()) return;
		slogans = [
			...slogans,
			{
				id: undefined,
				slogan: newSloganText.trim(),
				language: newSloganLang || null,
				eventId: newSloganEventId || null
			}
		];
		newSloganText = '';
		newSloganLang = '';
		newSloganEventId = '';
	}

	function removeSlogan(index: number) {
		slogans = slogans.filter((_, i) => i !== index);
	}
</script>

<div class="flex flex-col gap-4">
	{#if slogans.length}
		<div class="flex items-center justify-between">
			<h4 class="text-lg font-medium text-slate-300">Existing Slogans</h4>
		</div>

		{#each slogans as s, i (i)}
			<div class="grid grid-cols-[1fr_auto] gap-4">
				<div>
					<label class="block text-sm font-medium text-slate-300" for={`slogan-${i}`}>Slogan</label>
					<input
						type="text"
						id={`slogan-${i}`}
						bind:value={slogans[i].slogan}
						class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
						placeholder="Slogan"
					/>
					<div class="mt-2 grid grid-cols-2 gap-2">
						<div>
							<label class="block text-sm font-medium text-slate-300" for={`slogan-lang-${i}`}
								>Language</label
							>
							<LanguageSelect
								id={`slogan-lang-${i}`}
								class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
								bind:value={slogans[i].language}
								placeholder="Select language"
							/>
						</div>
						<div>
							<label class="block text-sm font-medium text-slate-300" for={`slogan-event-${i}`}
								>Event (optional)</label
							>
							{#if events.length}
								<EventSelect
									id={`slogan-event-${i}`}
									class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
									bind:value={slogans[i].eventId}
									placeholder="Select event (optional)"
									{events}
								/>
							{:else}
								<input
									type="text"
									id={`slogan-event-${i}`}
									bind:value={slogans[i].eventId}
									class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
									placeholder="event-id"
								/>
							{/if}
						</div>
					</div>
				</div>
				<div class="flex items-center">
					<button
						type="button"
						class="mt-[1.625rem] text-red-400 hover:text-red-300"
						onclick={() => removeSlogan(i)}
						title={m.remove()}
					>
						<IconParkSolidDelete class="h-5 w-5" />
					</button>
				</div>
			</div>
			{#if i < slogans.length - 1}
				<div class="my-2 border-t border-slate-700"></div>
			{/if}
		{/each}
	{/if}

	{#if slogans.length}
		<div class="my-4 border-t border-slate-700"></div>
	{/if}

	<div class="grid grid-cols-[1fr_auto] gap-2">
		<div class="grid grid-cols-2 gap-2">
			<input
				type="text"
				bind:value={newSloganText}
				class="block w-full rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
				placeholder="Add slogan"
			/>
			<LanguageSelect
				class="block w-full rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
				bind:value={newSloganLang}
				placeholder="Select language (optional)"
			/>
			{#if events.length}
				<EventSelect
					class="block w-full rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
					bind:value={newSloganEventId}
					placeholder="Select event (optional)"
					{events}
				/>
			{:else}
				<input
					type="text"
					bind:value={newSloganEventId}
					class="block w-full rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
					placeholder="event-id (optional)"
				/>
			{/if}
		</div>
		<button
			type="button"
			onclick={addSlogan}
			class="inline-flex items-center rounded-md bg-yellow-500 px-3 py-2 text-sm font-medium text-black hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-slate-900 focus:outline-none"
		>
			<IconParkSolidAdd class="h-4 w-4" />
		</button>
	</div>
</div>
