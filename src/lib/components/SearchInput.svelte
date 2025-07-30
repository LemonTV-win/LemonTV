<script lang="ts">
	import MaterialSymbolsSearchRounded from '~icons/material-symbols/search-rounded';

	let {
		search = $bindable(''),
		filtered,
		total
	}: { search: string; filtered: number; total: number } = $props();
</script>

<div
	class="focus-within:ring-opacity-100 relative flex w-full max-w-64 items-center gap-2 rounded-md border-white/30 bg-gradient-to-br from-slate-600/60 to-slate-800 px-4 text-gray-400 shadow-2xl ring-1 ring-white/30 backdrop-blur-lg transition-all duration-200 focus-within:text-white focus-within:ring-2 focus-within:ring-white"
>
	<MaterialSymbolsSearchRounded class="h-6 w-6" />
	<input
		type="search"
		placeholder="Search"
		bind:value={search}
		class="w-full border-none bg-transparent p-2 ring-0 outline-none focus:text-white focus:outline-none"
	/>
	<span class="text-xs text-gray-500">{filtered}/{total}</span>
</div>
