<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import type { PageProps } from './$types';
	import OrganizerTypeBadge from '$lib/components/OrganizerTypeBadge.svelte';
	import IconChevronDown from '~icons/mdi/chevron-down';
	import ContentActionLink from '$lib/components/ContentActionLink.svelte';

	let { data }: PageProps = $props();
	let selectedType = $state<string | null>(null);
	let filtersExpanded = $state(false);

	const typeLabels: Record<string, string> = {
		individual: m.individual(),
		organization: m.organization(),
		community: m.community(),
		tournament_series: m.tournament_series(),
		league: m.league()
	};

	const typeColors: Record<string, string> = {
		individual: 'bg-blue-500/10 text-blue-500 border-blue-500',
		organization: 'bg-purple-500/10 text-purple-500 border-purple-500',
		community: 'bg-green-500/10 text-green-500 border-green-500',
		tournament_series: 'bg-yellow-500/10 text-yellow-500 border-yellow-500',
		league: 'bg-red-500/10 text-red-500 border-red-500'
	};

	let filteredOrganizers = $derived(
		data.organizers.filter((organizer) => !selectedType || organizer.type === selectedType)
	);
</script>

<main class="mx-auto max-w-screen-lg md:px-4">
	<h1 class="mx-0 my-10 flex items-center gap-4 text-2xl font-bold md:mx-4">
		{m.organizers()}
		{#if ['admin', 'editor'].some((role) => data.user?.roles.includes(role))}
			<ContentActionLink href="/admin/organizers" type="edit" />
		{/if}
	</h1>

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
						<label for="type-filter" class="text-sm font-medium text-gray-300">{m.type()}</label>
						<div id="type-filter" class="flex flex-wrap gap-2">
							<button
								class={[
									'flex items-center gap-1 rounded-full border px-2 py-1 text-sm transition-colors',
									selectedType === null
										? 'border-yellow-500 bg-yellow-500/10 text-yellow-500'
										: 'border-gray-700 text-gray-400 hover:bg-gray-700'
								]}
								onclick={() => (selectedType = null)}
							>
								{m.view_all()}
							</button>
							{#each Object.entries(typeLabels) as [type, label]}
								<button
									class={[
										'flex items-center gap-1 rounded-full border px-2 py-1 text-sm transition-colors',
										selectedType === type
											? typeColors[type]
											: 'border-gray-700 text-gray-400 hover:bg-gray-700'
									]}
									onclick={() => (selectedType = type)}
								>
									{label}
								</button>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each filteredOrganizers as organizer}
			<a
				href="/organizers/{organizer.slug}"
				class="glass-card flex flex-col items-center gap-4 p-4 transition-all duration-200 hover:bg-gray-700"
			>
				<img
					src={organizer.logo}
					alt={organizer.name}
					class="h-24 w-24 rounded-full object-cover"
				/>
				<div class="text-center">
					<h2 class="text-xl font-bold">{organizer.name}</h2>
					{#if organizer.type}
						<div class="mt-2">
							<OrganizerTypeBadge type={organizer.type} />
						</div>
					{/if}
				</div>
			</a>
		{/each}
	</div>
</main>
