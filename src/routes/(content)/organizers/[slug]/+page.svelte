<script lang="ts">
	import type { PageData } from './$types';
	import IconParkSolidCalendar from '~icons/icon-park-solid/calendar';
	import IconParkSolidLocalPin from '~icons/icon-park-solid/local-pin';
	import IconParkSolidComputer from '~icons/icon-park-solid/computer';
	import { m } from '$lib/paraglide/messages';

	export let data: PageData;
	const { organizer, events } = data;
</script>

<div class="mx-auto max-w-4xl px-4 py-8">
	<div class="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
		<div class="flex flex-col items-start gap-6 md:flex-row">
			<div class="relative h-32 w-32 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
				<img src={organizer.logo} alt={organizer.name} class="h-full w-full object-cover" />
			</div>

			<div class="flex-1">
				<h1 class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
					{organizer.name}
				</h1>

				<a
					href={organizer.url}
					target="_blank"
					rel="noopener noreferrer"
					class="w-fit rounded-sm border-2 border-yellow-500 bg-yellow-500/10 px-2 py-1 text-yellow-500 hover:border-yellow-500 hover:bg-yellow-500 hover:text-white"
				>
					{m.visit_website()}
				</a>
			</div>
		</div>
	</div>

	{#if events.length > 0}
		<div class="mt-8">
			<h2 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">{m.organized_events()}</h2>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				{#each events as event}
					<a
						href={`/events/${event.id}`}
						class="group block overflow-hidden rounded-lg bg-white shadow-lg transition-transform hover:scale-[1.02] dark:bg-gray-800"
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
