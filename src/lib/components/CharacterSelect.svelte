<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import CharacterIcon from './CharacterIcon.svelte';
	import {
		CHARACTERS,
		CHARACTER_NAMES,
		type Character,
		// --- Start: Added imports for faction grouping ---
		PUS_CHARACTERS,
		SCISORS_CHARACTERS,
		URBINO_CHARACTERS,
		FACTION_NAMES,
		type Faction
		// --- End: Added imports for faction grouping ---
	} from '$lib/data/game';

	// TODO: Add side filter (attacker/defender)

	let {
		value = null,
		onChange,
		class: className = '',
		name = '',
		characters = CHARACTERS
	}: {
		value?: Character | null;
		onChange?: (character: Character | null) => void;
		class?: string;
		name?: string;
		characters?: readonly Character[];
	} = $props();

	let isOpen = $state(false);
	let search = $state('');

	function toggle() {
		isOpen = !isOpen;
		// Delay focus to ensure the input is rendered
		setTimeout(() => searchInput?.focus(), 0);
	}

	function select(character: Character | null) {
		value = character;
		onChange?.(character);
		isOpen = false;
	}

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.character-select')) {
			isOpen = false;
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

	let searchInput: HTMLInputElement | null = $state(null);

	// --- Start: Logic to group and filter characters by faction ---
	let characterGroups = $derived(
		[
			{
				faction: 'PUS' as Faction,
				characters: PUS_CHARACTERS.filter((c) => characters.includes(c)),
				color: 'text-blue-500'
			},
			{
				faction: 'Scissors' as Faction,
				characters: SCISORS_CHARACTERS.filter((c) => characters.includes(c)),
				color: 'text-red-500'
			},
			{
				faction: 'Urbino' as Faction,
				characters: URBINO_CHARACTERS.filter((c) => characters.includes(c)),
				color: 'text-yellow-500'
			}
		].filter((group) => group.characters.length > 0)
	);

	let filteredGroups = $derived(
		search
			? characterGroups
					.map((group) => ({
						...group,
						characters: group.characters.filter((c) =>
							(CHARACTER_NAMES[c]() ?? c).toLowerCase().includes(search.toLowerCase())
						)
					}))
					.filter((group) => group.characters.length > 0)
			: characterGroups
	);
	// --- End: Logic to group and filter characters by faction ---
</script>

<div class={['character-select relative w-full', className]}>
	{#if name}
		<input type="hidden" {name} {value} />
	{/if}
	<button
		type="button"
		class="flex w-full items-center gap-2 rounded border border-slate-700 bg-slate-800 px-3 py-2 text-left text-white hover:border-yellow-500 focus:border-yellow-500 focus:outline-none"
		onclick={toggle}
	>
		<CharacterIcon character={value} class="h-6 w-6" />
		{#if value}
			<span>{CHARACTER_NAMES[value as Character]() ?? value}</span>
		{:else}
			<span class="text-gray-400">{m.character()}...</span>
		{/if}
		<span class="ml-auto text-gray-400">▼</span>
	</button>
	{#if isOpen}
		<div
			class="styled-scroll absolute z-50 mt-1 max-h-128 w-full overflow-auto rounded-md border border-slate-700 bg-slate-800 px-1 shadow-lg"
		>
			<div class="sticky top-0 mb-1 border-b border-slate-700 bg-slate-800 px-1.5 py-1.5">
				<input
					type="text"
					placeholder={m.select_character()}
					bind:value={search}
					bind:this={searchInput}
					class="mb-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-1.5 text-white focus:border-yellow-500 focus:outline-none"
				/>
			</div>
			<button
				type="button"
				class="flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left text-gray-400 hover:bg-slate-700"
				onclick={() => select(null)}
			>
				<CharacterIcon character={null} class="h-6 w-6" />
				<span class="">None</span>
			</button>

			{#each filteredGroups as group (group.faction)}
				<div
					class={[
						'px-3 pt-2 pb-1 text-xs font-semibold tracking-wider uppercase select-none',
						group.color
					]}
				>
					{FACTION_NAMES[group.faction]()}
				</div>
				{#each group.characters as character (character)}
					<button
						type="button"
						class="flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left hover:bg-slate-700"
						onclick={() => select(character)}
					>
						<CharacterIcon {character} class="h-6 w-6" />
						<span>{CHARACTER_NAMES[character as Character]() ?? character}</span>
					</button>
				{/each}
			{/each}
		</div>
	{/if}
</div>
