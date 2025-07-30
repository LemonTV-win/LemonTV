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
	let inputElement: HTMLInputElement | null = $state(null);
	let selectedIndex = $state(-1);
	let listboxElement: HTMLDivElement | null = $state(null);
	let isFocused = $state(false);
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
		if (value && isFocused) {
			isOpen = true;
		}
	});

	// Reset selected index when items change
	$effect(() => {
		selectedIndex = -1;
	});

	function handleSelect(item: { id: string; name: string }) {
		search = item.name;
		value = item.id;
		onChange?.(item);
		isOpen = false;
		selectedIndex = -1;
	}

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		search = target.value;
		selectedIndex = -1;
	}

	function handleFocus() {
		isFocused = true;
		isOpen = true;
		selectedIndex = -1;
		// Don't clear search when opening to preserve current state
	}

	function handleBlur() {
		isFocused = false;
		setTimeout(() => {
			isOpen = false;
			selectedIndex = -1;
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
			selectedIndex = -1;
			// Restore selected item name when closing
			if (value) {
				const selectedItem = items.find((item) => item.id === value);
				if (selectedItem) {
					search = selectedItem.name;
				}
			}
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (disabled) return;

		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				if (!isOpen) {
					isOpen = true;
					selectedIndex = 0;
				} else {
					selectedIndex = Math.min(selectedIndex + 1, getFlattenedItems().length - 1);
				}
				break;
			case 'ArrowUp':
				e.preventDefault();
				if (isOpen) {
					selectedIndex = Math.max(selectedIndex - 1, 0);
				}
				break;
			case 'Enter':
				e.preventDefault();
				if (isOpen && selectedIndex >= 0) {
					const flattenedItems = getFlattenedItems();
					const selectedItem = flattenedItems[selectedIndex];
					if (selectedItem) {
						handleSelect(selectedItem);
					}
				} else if (isOpen) {
					// If no item is selected but dropdown is open, select the first item
					const flattenedItems = getFlattenedItems();
					if (flattenedItems.length > 0) {
						handleSelect(flattenedItems[0]);
					}
				}
				break;
			case 'Escape':
				e.preventDefault();
				isOpen = false;
				selectedIndex = -1;
				inputElement?.focus();
				break;
			case 'Tab':
				isOpen = false;
				selectedIndex = -1;
				break;
		}
	}

	function getFlattenedItems() {
		const flattened: Array<{ id: string; name: string }> = [];
		currentItems.forEach((group) => {
			if (group.items && group.items.length > 0) {
				flattened.push(...group.items);
			}
		});
		return flattened;
	}

	function getSelectedItem() {
		const flattenedItems = getFlattenedItems();
		return selectedIndex >= 0 && selectedIndex < flattenedItems.length
			? flattenedItems[selectedIndex]
			: null;
	}

	$effect(() => {
		if (isOpen) {
			window.addEventListener('click', handleClickOutside);
		}
		return () => {
			window.removeEventListener('click', handleClickOutside);
		};
	});

	let currentItems = $derived.by(() => {
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
	});

	// ARIA attributes
	let listboxId = $derived.by(() => `${id || 'combobox'}-listbox`);
	let expanded = $derived.by(() => isOpen);
	let hasValue = $derived.by(() => !!value);
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
		onkeydown={handleKeydown}
		role="combobox"
		aria-expanded={expanded}
		aria-autocomplete="list"
		aria-controls={listboxId}
		aria-activedescendant={getSelectedItem() ? `${listboxId}-${getSelectedItem()?.id}` : undefined}
		aria-haspopup="listbox"
		aria-describedby={hasValue ? `${id || 'combobox'}-selected` : undefined}
		class={[
			'block w-full rounded-md border border-slate-700 bg-slate-800 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
			className
		]}
		title={value}
	/>

	{#if hasValue}
		<div id="{id || 'combobox'}-selected" class="sr-only">
			Selected: {getFlattenedItems().find((item) => item.id === value)?.name}
		</div>
	{/if}

	{#if isOpen}
		<div
			bind:this={listboxElement}
			id={listboxId}
			role="listbox"
			aria-label="Options"
			class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-slate-700 bg-slate-800 py-1 shadow-lg"
		>
			{#each currentItems as group (group.id)}
				{#if group.items && group.items.length > 0}
					{#if group.label}
						<div class="px-3 py-1 text-xs font-medium text-slate-400">
							{group.label}
						</div>
					{/if}
					{#each group.items as item, itemIndex (item.id)}
						{@const flattenedIndex = getFlattenedItems().findIndex((i) => i.id === item.id)}
						{@const isSelected = selectedIndex === flattenedIndex}
						<button
							type="button"
							id="{listboxId}-{item.id}"
							role="option"
							aria-selected={isSelected}
							class="w-full px-4 py-2 text-left text-sm text-white hover:bg-slate-700 focus:bg-slate-700 focus:outline-none {isSelected
								? 'bg-slate-700'
								: ''}"
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
				<div class="px-4 py-2 text-sm text-slate-400" role="status" aria-live="polite">
					{m.no_data()}
				</div>
			{/if}
		</div>
	{/if}
</div>
