<script lang="ts">
	import MaterialSymbolsSearchRounded from '~icons/material-symbols/search-rounded';
	import MaterialSymbolsClose from '~icons/material-symbols/close';
	import debounce from 'debounce';
	import { m } from '$lib/paraglide/messages';

	let {
		search = $bindable(''),
		debounce: debounceMs = 250,
		debounced = $bindable(search),
		filtered,
		total
	}: {
		search?: string;
		filtered: number;
		total: number;
		debounce?: number;
		debounced?: string;
	} = $props();

	const update = debounce((value: string) => (debounced = value), debounceMs);

	$effect(() => {
		update(search);
	});

	function clearSearch() {
		search = '';
	}

	// $inspect('[SearchInput] search', search);
	// $inspect('[SearchInput] debounced', debounced);
</script>

<div
	class="focus-within:ring-opacity-100 relative flex w-full max-w-64 items-center gap-2 rounded-md border-white/30 bg-gradient-to-br from-slate-600/60 to-slate-800 px-4 text-gray-400 shadow-2xl ring-1 ring-white/30 backdrop-blur-lg transition-all duration-200 focus-within:text-white focus-within:ring-2 focus-within:ring-white"
>
	<MaterialSymbolsSearchRounded class="h-6 w-6 flex-shrink-0" />
	<input
		type="search"
		placeholder={m.search()}
		bind:value={search}
		class="w-full border-none bg-transparent p-2 ring-0 outline-none focus:text-white focus:outline-none [&::-webkit-search-cancel-button]:hidden"
	/>
	{#if search}
		<button
			type="button"
			onclick={clearSearch}
			class="flex h-6 min-h-6 w-6 min-w-6 flex-shrink-0 cursor-pointer items-center justify-center rounded-full bg-transparent text-gray-400 transition-colors hover:bg-gray-500/50 hover:text-white"
			aria-label={m.clear_search()}
		>
			<MaterialSymbolsClose class="h-4 w-4" />
		</button>
	{/if}
	<span class="flex-shrink-0 text-xs text-gray-500">{filtered}/{total}</span>
</div>
