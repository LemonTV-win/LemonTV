<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import CharacterIcon from '$lib/components/CharacterIcon.svelte';
	import { getLocale } from '$lib/paraglide/runtime';
	import { countryCodeToLocalizedName } from '$lib/utils/strings';
	import NationalityFlag from '$lib/components/NationalityFlag.svelte';
	import IconChevronDown from '~icons/mdi/chevron-down';
	import type { TCountryCode } from 'countries-list';
	import type { Character } from '$lib/data/game';

	let {
		uniqueNationalities,
		uniqueSuperstrings,
		selectedNationalities = $bindable([]),
		selectedSuperstrings = $bindable([])
	}: {
		uniqueNationalities: TCountryCode[];
		uniqueSuperstrings: Character[];
		selectedNationalities: TCountryCode[];
		selectedSuperstrings: Character[];
	} = $props();
	let filtersExpanded = $state(false);
</script>

<div class="mb-4 flex flex-col">
	<button
		class="flex items-center justify-between rounded-t-lg border border-white/30 bg-gradient-to-br from-slate-600/60 to-slate-800 px-4 py-2 text-left text-sm font-medium text-gray-300 backdrop-blur-lg transition-colors hover:bg-white/10"
		onclick={() => (filtersExpanded = !filtersExpanded)}
	>
		<span>{m.filters()}</span>
		<IconChevronDown
			class="h-4 w-4 transition-transform duration-200 {filtersExpanded ? 'rotate-180' : ''}"
		/>
	</button>
	<div
		class="grid transition-all duration-200"
		class:grid-rows-[1fr]={filtersExpanded}
		class:grid-rows-[0fr]={!filtersExpanded}
	>
		<div class="overflow-hidden">
			<div
				class="flex flex-col gap-4 rounded-b-lg border border-t-0 border-white/30 bg-gradient-to-br from-slate-600/60 to-slate-800 p-4 shadow-2xl ring-1 ring-white/30 backdrop-blur-lg"
			>
				<div class="flex flex-col gap-2">
					<label for="nationality-filters" class="text-sm font-medium text-gray-300"
						>{m.region()}</label
					>
					<div id="nationality-filters" class="flex flex-wrap gap-2">
						{#each uniqueNationalities as nationality, idx (idx)}
							{#if nationality}
								<button
									class={[
										'flex items-center gap-1 rounded-full border-1 px-2 py-1 text-sm transition-colors',
										selectedNationalities.includes(nationality)
											? 'border-blue-500 bg-blue-500 text-white'
											: 'border-white/30 bg-transparent text-gray-400'
									]}
									onclick={() => {
										selectedNationalities = selectedNationalities.includes(nationality)
											? selectedNationalities.filter((n) => n !== nationality)
											: [...selectedNationalities, nationality];
									}}
								>
									<NationalityFlag {nationality} />
									<span
										class:text-white={selectedNationalities.includes(nationality)}
										class:text-gray-400={!selectedNationalities.includes(nationality)}
									>
										{countryCodeToLocalizedName(nationality, getLocale())}
									</span>
								</button>
							{/if}
						{/each}
					</div>
				</div>

				<div class="flex flex-col gap-2">
					<label for="superstring-filters" class="text-sm font-medium text-gray-300"
						>{m.superstrings()}</label
					>
					<div id="superstring-filters" class="flex flex-wrap gap-2">
						{#each uniqueSuperstrings as superstring (superstring)}
							<button
								class={[
									'flex items-center gap-1 rounded-full border-1 px-2 py-1 text-sm transition-colors',
									selectedSuperstrings.includes(superstring)
										? 'border-blue-500 bg-blue-500 text-white'
										: 'border-white/30 bg-transparent text-gray-400'
								]}
								onclick={() => {
									selectedSuperstrings = selectedSuperstrings.includes(superstring)
										? selectedSuperstrings.filter((s) => s !== superstring)
										: [...selectedSuperstrings, superstring];
								}}
							>
								<CharacterIcon character={superstring} />
								<span
									class:text-white={selectedSuperstrings.includes(superstring)}
									class:text-gray-400={!selectedSuperstrings.includes(superstring)}
								>
									{superstring}
								</span>
							</button>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
