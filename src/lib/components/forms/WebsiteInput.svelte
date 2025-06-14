<script lang="ts">
	import IconParkSolidDelete from '~icons/icon-park-solid/delete';
	import IconParkSolidAdd from '~icons/icon-park-solid/add';
	import { m } from '$lib/paraglide/messages';

	interface Props {
		websites?: Array<{
			url: string;
			label?: string;
		}>;
	}

	let { websites = $bindable([]) }: Props = $props();

	function addWebsite() {
		websites = [...websites, { url: '', label: '' }];
	}

	function removeWebsite(index: number) {
		websites = websites.filter((_, i) => i !== index);
	}
</script>

<div class="space-y-4">
	{#each websites as website, index}
		<div class="flex items-center gap-4 rounded-lg border border-slate-700 bg-slate-800 p-4">
			<div class="flex-1">
				<label class="mb-2 block text-sm font-medium text-slate-300" for="website-url-{index}">
					{m.url()}
				</label>
				<input
					id="website-url-{index}"
					type="url"
					bind:value={website.url}
					class="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
					required
				/>
			</div>
			<div class="flex-1">
				<label class="mb-2 block text-sm font-medium text-slate-300" for="website-label-{index}">
					{m.label()}
				</label>
				<input
					id="website-label-{index}"
					type="text"
					bind:value={website.label}
					placeholder={m.none()}
					class="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
				/>
			</div>
			<button
				type="button"
				class="mt-6 text-red-500 hover:text-red-400"
				onclick={() => removeWebsite(index)}
				title={m.remove()}
			>
				<IconParkSolidDelete class="h-5 w-5" />
			</button>
		</div>
	{/each}
	<button
		type="button"
		class="flex items-center gap-2 text-yellow-500 hover:text-yellow-400"
		onclick={addWebsite}
	>
		<IconParkSolidAdd class="h-5 w-5" />
		{m.add()}
	</button>
</div>
