<script lang="ts">
	let {
		value,
		options,
		placeholder = 'Enter or select account ID',
		class: className = '',
		name,
		required = false,
		onchange
	} = $props<{
		value: number | string;
		options: Map<number, string>;
		placeholder?: string;
		class?: string;
		name?: string;
		required?: boolean;
		onchange?: (value: number) => void;
	}>();

	let inputValue = $state(value?.toString() || '');
	let showDropdown = $state(false);

	$effect(() => {
		inputValue = value?.toString() || '';
	});

	function getFilteredOptions() {
		const entries: [number, any][] = Array.from(options.entries());
		const searchTerm = inputValue.toLowerCase();

		return entries
			.filter(([accountId, playerName]) => {
				return (
					accountId.toString().includes(searchTerm) || playerName.toLowerCase().includes(searchTerm)
				);
			})
			.slice(0, 10);
	}

	function getCurrentPlayerName() {
		const numValue = parseInt(inputValue);
		if (!isNaN(numValue) && options.has(numValue)) {
			return options.get(numValue);
		}
		return '';
	}

	function handleInputChange(event: Event) {
		const target = event.target as HTMLInputElement;
		inputValue = target.value;
		showDropdown = true;

		const numValue = parseInt(inputValue);
		const newValue = isNaN(numValue) ? inputValue : numValue;

		onchange(newValue);
	}

	function handleOptionSelect(accountId: number) {
		inputValue = accountId.toString();
		showDropdown = false;
		onchange(accountId);
	}

	function handleBlur() {
		setTimeout(() => {
			showDropdown = false;
		}, 150);
	}

	function handleFocus() {
		showDropdown = true;
	}
</script>

<div class="relative">
	<div class="relative">
		<input
			type="text"
			{name}
			{required}
			{placeholder}
			bind:value={inputValue}
			oninput={handleInputChange}
			onblur={handleBlur}
			onfocus={handleFocus}
			class="w-full rounded border border-slate-700 bg-slate-800 px-2 py-1 pr-24 text-slate-200 {className}"
			autocomplete="off"
		/>
		{#if getCurrentPlayerName()}
			<div
				class="absolute top-1/2 right-2 max-w-20 -translate-y-1/2 truncate text-sm text-slate-400"
			>
				{getCurrentPlayerName()}
			</div>
		{/if}
	</div>

	{#if showDropdown && getFilteredOptions().length > 0}
		<div
			class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-slate-700 bg-slate-800 shadow-lg"
		>
			{#each getFilteredOptions() as [accountId, playerName]}
				<button
					type="button"
					class="w-full px-3 py-2 text-left text-slate-200 hover:bg-slate-700 focus:bg-slate-700 focus:outline-none"
					onclick={() => handleOptionSelect(accountId)}
				>
					<div class="flex justify-between">
						<span class="font-mono">{accountId}</span>
						<span class="text-slate-400">{playerName}</span>
					</div>
				</button>
			{/each}
		</div>
	{/if}
</div>
