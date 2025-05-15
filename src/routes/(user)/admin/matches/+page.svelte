<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import type { PageProps } from './$types';
	import MaterialSymbolsFilterListRounded from '~icons/material-symbols/filter-list-rounded';
	import MaterialSymbolsSearchRounded from '~icons/material-symbols/search-rounded';
	import IconParkSolidEdit from '~icons/icon-park-solid/edit';
	import TypcnArrowUnsorted from '~icons/typcn/arrow-unsorted';
	import TypcnArrowSortedDown from '~icons/typcn/arrow-sorted-down';
	import TypcnArrowSortedUp from '~icons/typcn/arrow-sorted-up';
	import { goto } from '$app/navigation';

	let { data }: PageProps = $props();

	type EventData = {
		event: {
			id: string;
			name: string;
			slug: string;
			official: boolean;
			server: string;
			format: string;
			region: string;
			image: string;
			status: 'live' | 'upcoming' | 'finished' | 'cancelled' | 'postponed';
			date: string;
			createdAt: Date;
			updatedAt: Date;
		};
		stages: Record<
			number,
			{
				stage: {
					id: number;
					title: string;
					stage: string;
					format: string;
				};
				matches: Array<{
					id: string;
					format: string | null;
					stageId: number | null;
					teams: Array<{
						matchId: string | null;
						teamId: string | null;
						position: number | null;
						score: number | null;
						team: {
							id: string;
							name: string;
							slug: string;
							abbr: string;
							logo: string;
							region: string;
						};
					}>;
				}>;
			}
		>;
	};

	let searchQuery = $state('');
	let selectedEventId = $state<string | null>(null);
	let sortBy: 'id-asc' | 'id-desc' | 'format-asc' | 'format-desc' = $state('id-asc');

	// Convert eventsByEvent to array and filter based on search query
	let filteredEvents = $derived(
		Object.values(data.events as Record<string, EventData>)
			.filter((eventData) => eventData.event.name.toLowerCase().includes(searchQuery.toLowerCase()))
			.map((eventData) => eventData.event)
	);

	// Get selected event data
	let selectedEventData = $derived(
		selectedEventId ? (data.events as Record<string, EventData>)[selectedEventId] : null
	);

	// Get total matches count for the selected event
	let totalMatches = $derived(
		selectedEventData
			? Object.values(selectedEventData.stages).reduce(
					(total, stageData) => total + stageData.matches.length,
					0
				)
			: 0
	);

	// Get sorted matches for a stage
	function getSortedMatches(
		matches: Array<{
			id: string;
			format: string | null;
			stageId: number | null;
			teams: Array<{
				matchId: string | null;
				teamId: string | null;
				position: number | null;
				score: number | null;
				team: {
					id: string;
					name: string;
					slug: string;
					abbr: string;
					logo: string;
					region: string;
				};
			}>;
		}>
	) {
		return matches.toSorted((a, b) => {
			if (sortBy === 'id-asc') {
				return a.id.localeCompare(b.id);
			} else if (sortBy === 'id-desc') {
				return b.id.localeCompare(a.id);
			} else if (sortBy === 'format-asc') {
				return (a.format ?? '').localeCompare(b.format ?? '');
			} else if (sortBy === 'format-desc') {
				return (b.format ?? '').localeCompare(a.format ?? '');
			}
			return 0;
		});
	}

	function handleEventSelect(eventId: string) {
		selectedEventId = eventId;
		goto(`/admin/matches?event=${eventId}`, { replaceState: true });
	}

	// Handle URL parameters
	$effect(() => {
		if (data.event) {
			selectedEventId = data.event;
		}
	});
</script>

<div class="mx-auto max-w-7xl p-4">
	<div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<h1 class="text-2xl font-bold">Matches Manager</h1>
		<div class="flex flex-col gap-4 sm:flex-row">
			<div class="relative">
				<MaterialSymbolsSearchRounded
					class="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400"
				/>
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Search events..."
					class="w-full rounded-lg border border-gray-700 bg-gray-800 py-2 pr-4 pl-10 text-white placeholder-gray-400 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none"
				/>
			</div>
		</div>
	</div>

	<div class="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
		{#each filteredEvents as event}
			<button
				class="flex items-start gap-4 rounded-lg border p-4 text-left transition-all {selectedEventId ===
				event.id
					? 'border-yellow-500 bg-gray-700 shadow-lg shadow-yellow-500/10'
					: 'border-gray-700 bg-gray-800 hover:border-gray-600 hover:bg-gray-700'}"
				onclick={() => handleEventSelect(event.id)}
			>
				{#if event.image}
					<img
						src={event.image}
						alt={event.name}
						class="h-16 w-16 flex-shrink-0 rounded-lg object-cover"
					/>
				{/if}
				<div class="flex-1">
					<div class="flex items-center justify-between">
						<h3
							class="max-w-[200px] truncate font-semibold {selectedEventId === event.id
								? 'text-white'
								: 'text-gray-300'}"
						>
							{event.name}
						</h3>
						<span
							class="inline-flex rounded-full px-2 text-xs leading-5 font-semibold {event.status ===
							'live'
								? 'bg-green-900 text-green-200'
								: event.status === 'upcoming'
									? 'bg-blue-900 text-blue-200'
									: event.status === 'cancelled'
										? 'bg-red-900 text-red-200'
										: event.status === 'postponed'
											? 'bg-yellow-900 text-yellow-200'
											: 'bg-gray-900 text-gray-200'}"
						>
							{event.status}
						</span>
					</div>
					<div
						class="mt-1 text-sm {selectedEventId === event.id ? 'text-gray-300' : 'text-gray-500'}"
					>
						<div class="flex items-center gap-2">
							<span>{event.server}</span>
							<span>•</span>
							<span>{event.format}</span>
							<span>•</span>
							<span>{event.region}</span>
						</div>
						<div class="mt-1">
							{#if event.date.includes('/')}
								{(() => {
									const [start, end] = event.date.split('/');
									return `${new Date(start).toLocaleDateString()} - ${new Date(end).toLocaleDateString()}`;
								})()}
							{:else}
								{new Date(event.date).toLocaleDateString()}
							{/if}
						</div>
					</div>
				</div>
			</button>
		{/each}
	</div>

	{#if selectedEventData}
		<div class="mb-4 flex items-center justify-between">
			<h2 class="text-xl font-semibold">Matches for {selectedEventData.event.name}</h2>
			<div class="text-sm text-gray-400">
				Total matches: {totalMatches}
			</div>
		</div>
		{#each Object.entries(selectedEventData.stages) as [stageId, { stage, matches }]}
			<div class="mb-8">
				<div class="mb-4 flex items-center justify-between">
					<h3 class="text-lg font-semibold">
						{stage.title} ({stage.stage} - {stage.format})
					</h3>
					<span class="text-sm text-gray-400">{matches.length} matches</span>
				</div>
				<div
					class="overflow-x-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb:hover]:bg-slate-500 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-slate-800"
				>
					<table class="w-full table-auto border-collapse border-y-2 border-gray-500 bg-gray-800">
						<thead>
							<tr class="border-b-2 border-gray-500 text-left text-sm text-gray-400">
								<th class="px-4 py-1">
									<button
										class="flex items-center gap-1 text-left"
										class:text-white={sortBy === 'id-asc' || sortBy === 'id-desc'}
										onclick={() => (sortBy = sortBy === 'id-asc' ? 'id-desc' : 'id-asc')}
									>
										Match ID
										{#if sortBy === 'id-asc'}
											<TypcnArrowSortedUp class="inline-block" />
										{:else if sortBy === 'id-desc'}
											<TypcnArrowSortedDown class="inline-block" />
										{:else}
											<TypcnArrowUnsorted class="inline-block" />
										{/if}
									</button>
								</th>
								<th class="px-4 py-1">
									<button
										class="flex items-center gap-1 text-left"
										class:text-white={sortBy === 'format-asc' || sortBy === 'format-desc'}
										onclick={() =>
											(sortBy = sortBy === 'format-asc' ? 'format-desc' : 'format-asc')}
									>
										Format
										{#if sortBy === 'format-asc'}
											<TypcnArrowSortedUp class="inline-block" />
										{:else if sortBy === 'format-desc'}
											<TypcnArrowSortedDown class="inline-block" />
										{:else}
											<TypcnArrowUnsorted class="inline-block" />
										{/if}
									</button>
								</th>
								<th class="px-4 py-1 text-center">Matchup</th>
								<th class="sticky right-0 z-10 h-12 bg-gray-800 px-4 py-1">Actions</th>
							</tr>
						</thead>
						<tbody>
							{#each getSortedMatches(matches) as match}
								<tr class="border-b border-gray-700 hover:bg-gray-700/50">
									<td class="min-w-max px-4 py-1 whitespace-nowrap">
										<span class="text-xs text-gray-300">{match.id}</span>
									</td>
									<td class="min-w-max px-4 py-1 whitespace-nowrap text-gray-300">{match.format}</td
									>
									<td class="px-4 py-1">
										<div class="flex items-center justify-center gap-4">
											<div class="flex items-center gap-2 rounded-lg bg-gray-700/50 px-3 py-1">
												{#if match.teams[0]}
													{#if match.teams[0].team.logo}
														<img
															src={match.teams[0].team.logo}
															alt={match.teams[0].team.name}
															class="h-6 w-6 rounded"
														/>
													{/if}
													<span class="text-gray-300">{match.teams[0].team.name}</span>
												{:else}
													<span class="text-gray-500">TBD</span>
												{/if}
											</div>
											<div class="flex items-center gap-2">
												<span class="font-semibold text-yellow-500"
													>{match.teams[0]?.score ?? '-'}</span
												>
												<span class="text-gray-500">vs.</span>
												<span class="font-semibold text-yellow-500"
													>{match.teams[1]?.score ?? '-'}</span
												>
											</div>
											<div class="flex items-center gap-2 rounded-lg bg-gray-700/50 px-3 py-1">
												{#if match.teams[1]}
													{#if match.teams[1].team.logo}
														<img
															src={match.teams[1].team.logo}
															alt={match.teams[1].team.name}
															class="h-6 w-6 rounded"
														/>
													{/if}
													<span class="text-gray-300">{match.teams[1].team.name}</span>
												{:else}
													<span class="text-gray-500">TBD</span>
												{/if}
											</div>
										</div>
									</td>
									<td class="sticky right-0 z-10 h-12 min-w-max bg-gray-800 whitespace-nowrap">
										<div class="flex h-full items-center gap-2 border-l border-gray-700 px-4 py-1">
											<a
												href="/admin/matches/{match.id}"
												class="flex items-center gap-1 text-yellow-500 hover:text-yellow-400"
												title="Edit Match"
											>
												<IconParkSolidEdit class="h-4 w-4" />
											</a>
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{/each}
	{:else}
		<div class="rounded-lg border border-gray-700 bg-gray-800 p-8 text-center text-gray-400">
			<p>Select an event to view its matches</p>
		</div>
	{/if}
</div>
