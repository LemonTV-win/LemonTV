<script lang="ts">
	import EventCard from '$lib/components/EventCard.svelte';
	import { m } from '$lib/paraglide/messages';
	import type { PageProps } from './$types';
	import NationalityFlag from '$lib/components/NationalityFlag.svelte';

	let { data }: PageProps = $props();

	let sortedEvents = $derived(
		data.events.sort((a, b) => {
			return (
				1 * (new Date(b.date.split('/')[0]).getTime() - new Date(a.date.split('/')[0]).getTime())
			);
		})
	);

	let ongoingEvents = $derived(sortedEvents.filter((event) => event.status === 'live').slice(0, 3));
	let upcomingEvents = $derived(
		sortedEvents.filter((event) => event.status === 'upcoming').slice(0, 3)
	);
	let finishedEvents = $derived(
		sortedEvents.filter((event) => event.status === 'finished').slice(0, 2)
	);
</script>

{#if !data.user}
	<section class="relative flex min-h-[60vh] items-center justify-center px-4 text-center">
		<div class="absolute inset-0 z-0 bg-gradient-to-b from-black/80 to-transparent"></div>
		<div class="relative z-10 max-w-3xl">
			<h1
				class="text-whit mb-4 text-4xl font-bold drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] md:text-6xl"
			>
				{m.welcome_to_lemon_tv()}
			</h1>
			<p
				class="mb-8 text-xl text-gray-200 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] md:text-2xl"
			>
				{m.hero_description()}
			</p>
			<div class="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
				<a
					href="/events"
					class="inline-block rounded-lg bg-yellow-500 px-8 py-3 text-lg font-bold text-black drop-shadow-[0_0_10px_oklch(79.5%_0.184_86.047_/_20%)] transition-all duration-200 hover:bg-yellow-400 hover:drop-shadow-[0_0_10px_oklch(79.5%_0.184_86.047_/_30%)]"
				>
					{m.watch_live()}
				</a>
				<a
					href="/login?tab=register"
					class="inline-block rounded-lg border-2 border-white px-8 py-3 text-lg font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] backdrop-blur-sm transition-all duration-200 hover:bg-white/10 hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
					title={m.sign_up_description()}
				>
					{m.sign_up()}
				</a>
			</div>
		</div>
	</section>
{/if}

<main class="mx-auto grid max-w-screen-lg gap-6 p-4 sm:gap-10 md:grid-cols-[1fr_auto]">
	<div class="flex flex-col">
		<h2 class="my-5 text-2xl font-bold">
			<a href="/events" class="transition-all duration-200 hover:opacity-80">
				{m.events()}
			</a>
		</h2>

		<section class="flex flex-col gap-4">
			{#if ongoingEvents.length > 0}
				<ul class="flex flex-col gap-2">
					{#each ongoingEvents as event, i (i)}
						<EventCard {event} />
					{/each}
				</ul>
			{/if}

			{#if upcomingEvents.length > 0}
				<h3 class="mb-4 text-xl font-bold">{m.upcoming()}</h3>
				<ul class="flex flex-col gap-2">
					{#each upcomingEvents as event, i (i)}
						<EventCard {event} />
					{/each}
				</ul>
			{/if}

			<section>
				<h3 class="mb-4 text-xl font-bold">{m.finished()}</h3>
				<ul class="glass-card-container">
					{#each finishedEvents as event, i (i)}
						<li>
							<EventCard {event} />
						</li>
					{/each}
				</ul>
				<a href="/events" class="glass-card-bottom-button">
					{m.view_all_events()}
				</a>
			</section>
		</section>
	</div>

	<div class="flex flex-col">
		<h2 class="my-5 text-2xl font-bold">{m.rankings()}</h2>
		<section class="flex flex-col">
			<h3 class="mb-4 text-xl font-bold">{m.teams()}</h3>
			<ul class="glass-card-container">
				{#each data.teams
					.toSorted((a, b) => (b.wins ?? 0) - (a.wins ?? 0))
					.slice(0, 5) as team (team.slug)}
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
			<a href="/teams" class="glass-card-bottom-button text-sm">{m.view_all_teams()}</a>
		</section>

		<div class="mt-4 flex flex-col">
			<h3 class="my-4 text-xl font-bold">{m.players()}</h3>
			<ul class="glass-card-container">
				{#each data.players
					.toSorted((a, b) => b.rating - a.rating)
					.slice(0, 5) as player (player.id)}
					<li>
						<a
							href={`/players/${player.id}`}
							class={['grid grid-cols-[1fr_auto] items-center gap-2 px-4 py-2', 'glass-card']}
						>
							<span class="flex items-baseline gap-2 text-white">
								{#each player.nationalities as nationality, idx (idx)}
									<NationalityFlag {nationality} />
								{/each}
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
			<a href="/players" class="glass-card-bottom-button text-sm">{m.view_all_players()}</a>
		</div>
	</div>
</main>

<section class="mx-auto max-w-screen-lg px-4 py-8">
	<h2 class="mb-4 text-2xl font-bold">{m.news_and_announcements()}</h2>
	<div class="glass-card-container">
		<a href="/news" class="glass-card flex flex-col items-center p-6 text-center">
			<div class="mb-4 text-4xl">📰</div>
			<h3 class="mb-2 text-xl font-semibold text-yellow-400">{m.news_coming_soon()}</h3>
			<p class="text-gray-400">{m.news_placeholder_description()}</p>
		</a>
	</div>
</section>

<section class="mx-auto max-w-screen-lg px-4 pb-8">
	<h2 class="mb-4 text-2xl font-bold">{m.platform_statistics()}</h2>
	<div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
		<a
			href="/events?status=live"
			class="glass-card group relative overflow-hidden p-4 transition-all duration-300 hover:bg-white/5"
		>
			<div
				class="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
			></div>
			<div class="relative">
				<span class="block text-3xl font-bold text-yellow-400">{ongoingEvents.length}</span>
				<span class="text-sm text-gray-400">{m.live_events()}</span>
			</div>
		</a>
		<a
			href="/events"
			class="glass-card group relative overflow-hidden p-4 transition-all duration-300 hover:bg-white/5"
		>
			<div
				class="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
			></div>
			<div class="relative">
				<span class="block text-3xl font-bold text-yellow-400">{data.events.length}</span>
				<span class="text-sm text-gray-400">{m.total_events()}</span>
			</div>
		</a>
		<a
			href="/teams"
			class="glass-card group relative overflow-hidden p-4 transition-all duration-300 hover:bg-white/5"
		>
			<div
				class="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
			></div>
			<div class="relative">
				<span class="block text-3xl font-bold text-yellow-400">{data.teams.length}</span>
				<span class="text-sm text-gray-400">{m.total_teams()}</span>
			</div>
		</a>
		<a
			href="/players"
			class="glass-card group relative overflow-hidden p-4 transition-all duration-300 hover:bg-white/5"
		>
			<div
				class="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
			></div>
			<div class="relative">
				<span class="block text-3xl font-bold text-yellow-400">{data.totalPlayers}</span>
				<span class="text-sm text-gray-400">{m.total_players()}</span>
			</div>
		</a>
	</div>
</section>
