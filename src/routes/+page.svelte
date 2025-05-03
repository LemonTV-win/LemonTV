<script lang="ts">
	import EventCard from '$lib/components/EventCard.svelte';
	import { m } from '$lib/paraglide/messages';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let ongoingEvents = data.events.filter((event) => event.status === 'live');
	let upcomingEvents = data.events.filter((event) => event.status === 'upcoming');
	let finishedEvents = data.events.filter((event) => event.status === 'finished');
</script>

<main class="mx-auto grid max-w-screen-lg gap-6 p-4 sm:grid-cols-[1fr_auto] sm:gap-10">
	<div class="row-span-2">
		<h2 class="my-5 text-2xl font-bold">{m.events()}</h2>

		{#each ongoingEvents as event}
			<EventCard {event} live />
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
		<ul>
			{#each finishedEvents as event}
				<li>
					<EventCard {event} />
				</li>
			{/each}
		</ul>
	</div>

	<div class="flex flex-col gap-2">
		<h2 class="my-5 text-2xl font-bold">{m.teams()}</h2>
		<ul>
			{#each data.teams.toSorted((a, b) => b.wins - a.wins).slice(0, 5) as team}
				<li>
					<a
						class="grid grid-cols-[1fr_auto] items-center gap-2 border-b-1 border-gray-500 bg-gray-800 px-4 py-2 shadow-2xl"
						href={`/teams/${team.id}`}
					>
						<span class="text-white">
							{team.name}
							<span class="text-xs text-gray-400" title="Wins">{team.region}</span>
						</span>
						<!-- TODO: Introduce rating -->
						<span class="text-yellow-500" title="Wins">{team.wins}</span>
					</a>
				</li>
			{/each}
		</ul>
		<!-- TODO: Add locale -->
		<a href="/teams" class="mt-2 px-4 text-center text-lg font-bold">{m.view_all_teams()}</a>
	</div>

	<div class="flex flex-col gap-2">
		<h2 class="my-5 text-2xl font-bold">{m.players()}</h2>
		<ul>
			{#each data.players.toSorted((a, b) => b.rating - a.rating).slice(0, 5) as player}
				<li>
					<a
						href={`/players/${player.id}`}
						class="grid grid-cols-[1fr_auto] items-center gap-2 border-b-1 border-gray-500 bg-gray-800 px-4 py-2 shadow-2xl"
					>
						<span class="text-white">
							{player.name}
							{#if player.teams.length > 0}
								<span class="text-xs text-gray-400" title="Team">
									{player.teams[0]}
								</span>
							{/if}
						</span>
						<!-- TODO: Introduce rating -->
						<span class="text-yellow-500" title={m.rating()}>{player.rating.toFixed(2)}</span>
					</a>
				</li>
			{/each}
		</ul>
		<a href="/players" class="mt-2 px-4 text-center text-lg font-bold">{m.view_all_players()}</a>
	</div>
</main>

<style>
	:global(body) {
		background-image:
			linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 1)),
			url(https://klbq-web-cms.strinova.com/prod/strinova_web/images/202411/430c6088-8945-4472-9f79-59a32875b96c.jpg);
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
		min-height: 100dvh;
	}
</style>
