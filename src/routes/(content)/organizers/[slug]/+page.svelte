<script lang="ts">
	import type { PageData } from './$types';
	import IconParkSolidCalendar from '~icons/icon-park-solid/calendar';
	import IconParkSolidLocalPin from '~icons/icon-park-solid/local-pin';
	import IconParkSolidComputer from '~icons/icon-park-solid/computer';
	import { m } from '$lib/paraglide/messages';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import IconParkSolidEdit from '~icons/icon-park-solid/edit';

	export let data: PageData;
	const { organizer, events } = data;
</script>

<Breadcrumbs currentTitle={organizer.name} />

<div class="mx-auto max-w-4xl px-4 py-8">
	<div class="glass glass-card-container p-6">
		<div class="flex flex-col items-start gap-6 md:flex-row">
			<div class="relative h-32 w-32 overflow-hidden bg-gray-100/10">
				<img src={organizer.logo} alt={organizer.name} class="h-full w-full object-cover" />
			</div>

			<div class="flex flex-1 flex-col gap-4">
				<h1 class="flex items-center gap-2 text-3xl font-bold text-white">
					{organizer.name}
					{#if ['admin', 'editor'].some((role) => data.user?.roles.includes(role))}
						<a
							href={`/admin/organizers?action=edit&id=${organizer.id}`}
							class="flex items-center gap-1 rounded-md border border-gray-700 px-2 py-1 text-sm text-gray-400 transition-all duration-200 hover:bg-gray-700"
						>
							<IconParkSolidEdit class="h-4 w-4" />
							{m.edit()}
						</a>
					{/if}
				</h1>

				<p class="text-gray-400">{organizer.description}</p>

				<a
					href={organizer.url}
					target="_blank"
					rel="noopener noreferrer"
					class="w-fit border-2 border-yellow-500 bg-yellow-500/10 px-2 py-1 text-yellow-500 hover:border-yellow-500 hover:bg-yellow-500 hover:text-white"
				>
					{m.visit_website()}
				</a>
			</div>
		</div>
	</div>

	{#if events.length > 0}
		<div class="mt-8">
			<h2 class="mb-4 text-2xl font-bold text-white">{m.organized_events()}</h2>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				{#each events as event}
					<a
						href={`/events/${event.id}`}
						class="glass-card group block overflow-hidden transition-transform hover:scale-[1.02]"
					>
						<div class="relative h-48">
							<img src={event.image} alt={event.name} class="h-full w-full object-cover" />
							<div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
							<div class="absolute right-0 bottom-0 left-0 p-4 text-white">
								<h3 class="text-xl font-bold">{event.name}</h3>
								<div class="mt-2 flex flex-wrap gap-2 text-sm text-gray-200">
									<span class="inline-flex items-center gap-1">
										<IconParkSolidCalendar class="h-4 w-4" />
										<time datetime={event.date}>{event.date.replace('/', ' - ')}</time>
									</span>
									<span class="inline-flex items-center gap-1">
										<IconParkSolidLocalPin class="h-4 w-4" />
										{event.region}
									</span>
									<span class="inline-flex items-center gap-1">
										<IconParkSolidComputer class="h-4 w-4" />
										{event.format}
									</span>
								</div>
							</div>
						</div>
					</a>
				{/each}
			</div>
		</div>
	{/if}
</div>
