<script lang="ts">
	import MaterialSymbolsSearchRounded from '~icons/material-symbols/search-rounded';

	let {
		search = $bindable(''),
		filtered,
		total
	}: { search: string; filtered: number; total: number } = $props();
</script>

<div
	class="flex w-full max-w-64 items-center gap-2 rounded-md border-2 border-gray-500 bg-gray-800 px-4 text-gray-400 focus-within:border-gray-400 hover:border-gray-400"
>
	<MaterialSymbolsSearchRounded class="h-6 w-6" />
	<input
		type="search"
		placeholder="Search"
		bind:value={search}
		class="w-full border-none bg-transparent p-2 ring-0 outline-none focus:outline-none"
	/>
	<span class="text-xs text-gray-500">{filtered}/{total}</span>
</div>
