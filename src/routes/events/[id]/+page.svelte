<script lang="ts">
	import { error } from '@sveltejs/kit';
	import type { PageProps } from './$types';
	import type { Stage } from '$lib/data';

	import { m } from '$lib/paraglide/messages';

	let { data }: PageProps = $props();

	if (!data.event) {
		throw error(404, 'Event not found');
	}

	import BracketGraph from '$lib/components/Brackets.svelte';

	let activeStage = $state<Stage | null>(null);

	$inspect(activeStage);
</script>

{#if data.event}
	<div
		class="banner flex min-h-48 flex-col gap-2 bg-cover bg-center bg-top p-4 text-white"
		style:--banner-image={`url(${data.event.image})`}
	>
		<h1 class="my-3 text-3xl font-bold">{data.event.name}</h1>
		<div class="flex flex-col gap-2 py-2">
			<div class="text-gray-400">
				Organized by <a
					href={data.event.organizer.url}
					class="ml-1 inline-flex items-baseline gap-1 text-white"
				>
					{#if data.event.organizer.logo}
						<img
							src={data.event.organizer.logo}
							class="h-4 w-4 rounded-full"
							alt={data.event.organizer.name}
						/>
					{/if}
					{data.event.organizer.name}
				</a>
			</div>
			<div class="text-gray-400">
				{data.event.capacity} Teams・<time datetime={data.event.date}
					>{data.event.date.replace('/', ' - ')}</time
				>
			</div>
			{#if data.event.website}
				<a href={data.event.website} class="text-gray-400"> Visit Website </a>
			{/if}
		</div>
		<nav class="m-2 flex rounded-sm bg-gray-200/50">
			<button
				class={[
					'px-4 py-2 hover:bg-gray-200',
					!activeStage ? 'bg-gray-200 font-bold' : 'bg-transparent font-normal'
				]}
				onclick={() => (activeStage = null)}
			>
				Overview
			</button>

			<!-- TODO: Results 1st place, 2nd place, 3rd place -->

			{#each data.event.stages as stage}
				<button
					onclick={() => (activeStage = stage)}
					class={[
						'p-2 hover:bg-gray-200',
						activeStage?.id === stage.id ? 'bg-gray-200 font-bold' : 'bg-transparent font-normal'
					]}
				>
					{stage.title}
				</button>
			{/each}
		</nav>
	</div>
	<div class="flex flex-col gap-4 px-8">
		<!-- <h2 class="text-2xl font-bold text-white">Brackets</h2> -->
		{#if activeStage}
			<!-- TODO Use tab -->
			<h2 class="text-2xl font-bold text-white">{activeStage.title}</h2>
			<BracketGraph stage={activeStage} />
		{:else}
			{#each data.event.stages as stage}
				<h2 class="text-2xl font-bold text-white">{stage.title}</h2>
				<BracketGraph {stage} />
			{/each}
		{/if}
		<h2 class="my-4 text-2xl font-bold text-white">{m.attending_teams()}</h2>
		<ul class="flex flex-wrap gap-4">
			{#each data.event.teams as team}
				<li class="flex min-w-48 flex-col items-center gap-2 rounded-sm bg-gray-200/10 p-2">
					{#if team.logo}
						<img src={team.logo} alt={team.name} class="h-4 w-4 rounded-full" />
					{/if}
					{team.name}
					<span class="text-gray-400">({team.region})</span>
					<ul>
						{#each team.players ?? [] as player}
							{#if player}
								<li>
									<a href={`/players/${player.id}`}>{player.name}</a>
								</li>
							{/if}
						{/each}
						{#each team.substitutes ?? [] as player}
							{#if player}
								<li class="text-white/50">
									<a href={`/players/${player.id}`}>{player.name}</a>
								</li>
							{/if}
						{/each}
					</ul>
				</li>
			{/each}
		</ul>
	</div>
{/if}

<style lang="postcss">
	.banner {
		background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 1)), var(--banner-image);
		/* @apply h-96 bg-cover bg-center; */
	}
</style>
