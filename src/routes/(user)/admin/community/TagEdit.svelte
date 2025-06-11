<script lang="ts">
	import { enhance } from '$app/forms';
	import type { CommunityTag } from '$lib/server/db/schemas/about/community';
	import { m } from '$lib/paraglide/messages';

	let {
		tag,
		onCancel,
		onSuccess
	}: {
		tag: Partial<CommunityTag>;
		onCancel: () => void;
		onSuccess: () => void;
	} = $props();

	let category = $state(tag.category || '');
	let value = $state(tag.value || '');
	let name = $state(tag.name || '');
</script>

<form
	method="POST"
	action="?/tag"
	use:enhance={() => {
		return async ({ update }) => {
			await update();
			onSuccess();
		};
	}}
	class="flex flex-col gap-4"
>
	<input type="hidden" name="id" value={tag.id} />

	<div class="flex flex-col gap-2">
		<label for="name" class="text-sm font-medium text-gray-300">{m.name()}</label>
		<input
			type="text"
			id="name"
			name="name"
			bind:value={name}
			required
			placeholder="Enter display name"
			class="rounded-md border border-slate-700 bg-slate-800 p-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
		/>
	</div>

	<div class="flex flex-col gap-2">
		<label for="category" class="text-sm font-medium text-gray-300">{m.category()}</label>
		<input
			type="text"
			id="category"
			name="category"
			bind:value={category}
			required
			placeholder="Enter category (e.g., language, type, status)"
			class="rounded-md border border-slate-700 bg-slate-800 p-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
		/>
	</div>

	<div class="flex flex-col gap-2">
		<label for="value" class="text-sm font-medium text-gray-300">{m.value()}</label>
		<input
			type="text"
			id="value"
			name="value"
			bind:value
			required
			placeholder="Enter value"
			class="rounded-md border border-slate-700 bg-slate-800 p-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
		/>
	</div>

	<div class="flex justify-end gap-2">
		<button
			type="button"
			onclick={onCancel}
			class="rounded-md bg-gray-700 px-4 py-2 font-medium text-white hover:bg-gray-600"
		>
			{m.cancel()}
		</button>
		<button
			type="submit"
			class="rounded-md bg-yellow-500 px-4 py-2 font-medium text-black hover:bg-yellow-600"
		>
			{tag.id ? m.save() : m.create()}
		</button>
	</div>
</form>
