<script lang="ts">
	import EventCard from '$lib/components/EventCard.svelte';
	import { m } from '$lib/paraglide/messages';
	import type { PageProps } from './$types';
	import NationalityFlag from '$lib/components/NationalityFlag.svelte';

	let { data }: PageProps = $props();

	let sortedEvents = $derived(
		data.events
			.sort((a, b) => {
				return (
					1 * (new Date(b.date.split('/')[0]).getTime() - new Date(a.date.split('/')[0]).getTime())
				);
			})
			.slice(0, 5)
	);

	let ongoingEvents = $derived(sortedEvents.filter((event) => event.status === 'live'));
	let upcomingEvents = $derived(sortedEvents.filter((event) => event.status === 'upcoming'));
	let finishedEvents = $derived(sortedEvents.filter((event) => event.status === 'finished'));
</script>

{#if !data.user}
	<section class="relative flex min-h-[60vh] items-center justify-center px-4 text-center">
		<div class="absolute inset-0 z-0 bg-gradient-to-b from-black/80 to-transparent"></div>
		<div class="relative z-10 max-w-3xl">
			<h1 class="mb-4 text-4xl font-bold text-white md:text-6xl">
				{m.welcome_to_lemon_tv()}
			</h1>
			<p class="mb-8 text-xl text-gray-200 md:text-2xl">
				{m.hero_description()}
			</p>
			<div class="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
				<a
					href="/events"
					class="inline-block rounded-lg bg-yellow-500 px-8 py-3 text-lg font-bold text-black transition-all duration-200 hover:bg-yellow-600"
				>
					{m.watch_live()}
				</a>
				<a
					href="/login?tab=register"
					class="inline-block rounded-lg border-2 border-white px-8 py-3 text-lg font-bold text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/10"
					title={m.sign_up_description()}
				>
					{m.sign_up()}
				</a>
			</div>
		</div>
	</section>
{/if}

<main class="mx-auto grid max-w-screen-lg gap-6 p-4 sm:gap-10 md:grid-cols-[1fr_auto]">
	<div>
		<h2 class="my-5 text-2xl font-bold">
			<a href="/events" class="transition-all duration-200 hover:opacity-80">
				{m.events()}
			</a>
		</h2>

		{#each ongoingEvents as event}
			<EventCard {event} />
		{/each}

		{#if upcomingEvents.length > 0}
			<h3 class="my-4 text-xl font-bold">{m.upcoming()}</h3>
			<ul class="flex flex-col gap-2">
				{#each upcomingEvents as event}
					<EventCard {event} />
				{/each}
			</ul>
		{/if}

		<h3 class="my-4 text-xl font-bold">{m.finished()}</h3>
		<ul class="glass-card-container">
			{#each finishedEvents as event}
				<li>
					<EventCard {event} />
				</li>
			{/each}
		</ul>
		<a
			href="/events"
			class="mt-2 block w-full px-4 text-center text-lg font-bold transition-all duration-200 hover:opacity-80"
		>
			{m.view_all_events()}
		</a>
	</div>

	<div class="flex flex-col gap-2">
		<div class="flex flex-col gap-2">
			<h2 class="my-5 text-2xl font-bold">{m.teams()}</h2>
			<ul class="glass-card-container">
				{#each data.teams.toSorted((a, b) => (b.wins ?? 0) - (a.wins ?? 0)).slice(0, 5) as team}
					<li>
						<a
							class={['grid grid-cols-[1fr_auto] items-center gap-2 px-4 py-2', 'glass-card']}
							href={`/teams/${team.slug}`}
						>
							<span class="flex items-baseline gap-2 text-white">
								<span
									class={[
										'flex h-5 w-5 items-center justify-center bg-gray-700 text-sm text-gray-400',
										team.rank === 1 && 'bg-yellow-500 text-white',
										team.rank === 2 && 'bg-neutral-500 text-white',
										team.rank === 3 && 'bg-red-500 text-white'
									]}
								>
									{team.rank}</span
								>
								{team.name}
								<span class="text-xs text-gray-400" title={m.wins()}>{team.region}</span>
							</span>
							<!-- TODO: Introduce rating -->
							<span class="font-semibold text-yellow-300" title={m.wins()}>{team.wins}</span>
						</a>
					</li>
				{/each}
			</ul>
			<!-- TODO: Add locale -->
			<a
				href="/teams"
				class="mt-2 px-4 text-center text-lg font-bold transition-all duration-200 hover:opacity-80"
				>{m.view_all_teams()}</a
			>
		</div>

		<div class="flex flex-col gap-2">
			<h2 class="my-5 text-2xl font-bold">{m.players()}</h2>
			<ul class="glass-card-container">
				{#each data.players.toSorted((a, b) => b.rating - a.rating).slice(0, 5) as player}
					<li>
						<a
							href={`/players/${player.id}`}
							class={['grid grid-cols-[1fr_auto] items-center gap-2 px-4 py-2', 'glass-card']}
						>
							<span class="flex items-baseline gap-2 text-white">
								<NationalityFlag nationality={player.nationality} />
								{player.name}
								{#if player.teams.length > 0}
									<span class="text-xs text-gray-400" title={m.teams()}>
										{player.teams[0]}
									</span>
								{/if}
							</span>
							<span class="flex items-center gap-2">
								<span class="font-semibold text-yellow-300" title={m.rating()}>
									{player.rating.toFixed(2)}
								</span>
							</span>
						</a>
					</li>
				{/each}
			</ul>
			<a
				href="/players"
				class="mt-2 px-4 text-center text-lg font-bold transition-all duration-200 hover:opacity-80"
				>{m.view_all_players()}</a
			>
		</div>
	</div>
</main>
