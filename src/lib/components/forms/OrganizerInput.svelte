<script lang="ts">
	import type { Organizer } from '$lib/server/db/schema';

	interface Props {
		organizers: Organizer[];
		selectedOrganizers: string[];
		id?: string;
	}

	let { organizers, selectedOrganizers = $bindable([]), id = 'organizers' }: Props = $props();
</script>

<div>
	<div class="flex gap-2">
		<select
			{id}
			name="organizers"
			bind:value={selectedOrganizers}
			multiple
			class="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb]:hover:bg-slate-500 [&::-webkit-scrollbar-track]:bg-slate-800"
		>
			{#each organizers as organizer (organizer.id)}
				<option
					class="checked:bg-slate-500 hover:bg-slate-700 hover:checked:bg-slate-500 focus:bg-slate-500"
					value={organizer.id}>{organizer.name}</option
				>
			{/each}
		</select>
		<button
			type="button"
			class="mt-1 rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-400 hover:bg-slate-800"
			onclick={() => (selectedOrganizers = [])}
			title="Clear all organizers"
		>
			Clear
		</button>
	</div>
	<p class="mt-1 text-sm text-slate-400">
		Hold Ctrl/Cmd to select multiple organizers. You can add organizers later.
	</p>
</div>
