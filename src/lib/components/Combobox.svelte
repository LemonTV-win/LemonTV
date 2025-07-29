<!-- src/lib/components/Combobox.svelte -->
<script lang="ts">
	import { m } from '$lib/paraglide/messages';

	let {
		id = undefined,
		items = [],
		value = $bindable(''),
		placeholder = '',
		groups = [],
		disabled = false,
		class: className = '',
		name = '',
		onChange
	}: {
		id?: string;
		items: Array<{ id: string; name: string; group?: string }>;
		value: string;
		placeholder: string;
		groups: Array<{ id: string; label: string }>;
		disabled?: boolean;
		class: string;
		name?: string;
		onChange?: (item: { id: string; name: string }) => void;
	} = $props();

	let isOpen = $state(false);
	let search = $state('');
	let inputElement: HTMLInputElement;

	// Set initial search value without triggering filter
	$effect(() => {
		if (value) {
			const selectedItem = items.find((item) => item.id === value);
			if (selectedItem) {
				search = selectedItem.name;
			}
		}
	});

	// Open popup when value changes
	$effect(() => {
		if (value) {
			isOpen = true;
		}
	});

	function handleSelect(item: { id: string; name: string }) {
		search = item.name;
		value = item.id;
		onChange?.(item);
		isOpen = false;
	}

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		search = target.value;
	}

	function handleFocus() {
		isOpen = true;
		// Don't clear search when opening to preserve current state
	}

	function handleBlur() {
		setTimeout(() => {
			isOpen = false;
			// Restore selected item name when closing
			if (value) {
				const selectedItem = items.find((item) => item.id === value);
				if (selectedItem) {
					search = selectedItem.name;
				}
			}
		}, 200);
	}

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.combobox')) {
			isOpen = false;
			// Restore selected item name when closing
			if (value) {
				const selectedItem = items.find((item) => item.id === value);
				if (selectedItem) {
					search = selectedItem.name;
				}
			}
		}
	}

	$effect(() => {
		if (isOpen) {
			window.addEventListener('click', handleClickOutside);
		}
		return () => {
			window.removeEventListener('click', handleClickOutside);
		};
	});

	// Get filtered and grouped items
	function getFilteredAndGroupedItems() {
		// First, filter items based on search
		const filtered = search
			? items.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
			: items;

		// Then, group them if groups are provided
		if (groups.length > 0) {
			return groups.map((group, index) => ({
				...group,
				id: index === groups.length - 1 ? `${group.id}-last` : group.id,
				items: filtered.filter((item) => item.group === group.id)
			}));
		}

		return [{ id: 'all-last', label: '', items: filtered }];
	}

	// Get the current filtered and grouped items
	let currentItems = $state(getFilteredAndGroupedItems());

	// Update items when search changes
	$effect(() => {
		currentItems = getFilteredAndGroupedItems();
	});
</script>

<div class="combobox relative">
	{#if name}
		<input type="hidden" {name} {value} />
	{/if}
	<input
		{id}
		bind:this={inputElement}
		type="text"
		value={search}
		{placeholder}
		{disabled}
		oninput={handleInput}
		onfocus={handleFocus}
		onblur={handleBlur}
		class={[
			'block w-full rounded-md border border-slate-700 bg-slate-800 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
			className
		]}
		title={value}
	/>

	{#if isOpen}
		<div
			class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-slate-700 bg-slate-800 py-1 shadow-lg"
		>
			{#each currentItems as group (group.id)}
				{#if group.items && group.items.length > 0}
					{#if group.label}
						<div class="px-3 py-1 text-xs font-medium text-slate-400">
							{group.label}
						</div>
					{/if}
					{#each group.items as item (item.id)}
						<button
							type="button"
							class="w-full px-4 py-2 text-left text-sm text-white hover:bg-slate-700"
							onmousedown={() => handleSelect(item)}
						>
							{item.name}
						</button>
					{/each}
					{#if group.label && !group.id.endsWith('last')}
						<div class="my-1 border-t border-slate-700"></div>
					{/if}
				{/if}
			{/each}
			{#if currentItems.every((group) => !group.items.length)}
				<div class="px-4 py-2 text-sm text-slate-400">{m.no_data()}</div>
			{/if}
		</div>
	{/if}
</div>
