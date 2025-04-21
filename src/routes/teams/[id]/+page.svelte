<script lang="ts">
	import { error } from '@sveltejs/kit';
	import type { PageProps } from './$types';
	import { calculateWinnerIndex } from '$lib/data';

	let { data }: PageProps = $props();

	if (!data.team) {
		throw error(404, 'Team not found');
	}
</script>

{#if data.team}
	<main class="mx-auto max-w-screen-lg">
		<!-- Info -->
		<div>
			<h1 class="my-10 text-2xl font-bold">{data.team.name}</h1>
			<p>{data.team.region}</p>
			{#if data.team.logo}
				<img src={data.team.logo} alt={data.team.name} />
			{/if}
		</div>
		<h2 class="my-5 text-xl font-bold">Active members</h2>
		{#if data.team.players}
			<ul>
				{#each data.team.players as player}
					<li>
						<a href={`/players/${player.id}`}>{player.name}</a>
					</li>
				{/each}
			</ul>
		{/if}
		<!-- Statistics -->
		<!-- Achievements -->
		<!-- Previous members -->

		<h2 class="my-5 text-xl font-bold">Matches</h2>
		{#if data.teamMatches}
			<ul class="grid grid-cols-1 gap-4">
				{#each data.teamMatches as match}
					{#if match}
						<li
							class="grid grid-cols-[1fr_auto_1fr] items-center gap-2 gap-4 rounded-sm bg-gray-800 shadow-2xl"
						>
							<a href={`/matches/${match.id}`} class="contents">
								<span
									class="text-right"
									class:text-gray-200={match.teamIndex === 0}
									class:text-gray-400={match.teamIndex === 1}>{match.teams[0].team.name}</span
								>
								<span
									class="grid w-18 grid-cols-[1fr_auto_1fr] items-center justify-center gap-1 p-4 text-center text-white"
									class:bg-green-500={calculateWinnerIndex(match) === match.teamIndex + 1}
									class:bg-red-500={calculateWinnerIndex(match) !== match.teamIndex + 1}
								>
									<span>
										{match.teams[0].score}
									</span>
									<span class="text-white">-</span>
									<span>{match.teams[1].score}</span>
								</span>
								<span
									class="text-left"
									class:text-gray-200={match.teamIndex === 1}
									class:text-gray-400={match.teamIndex === 0}>{match.teams[1].team.name}</span
								>
							</a>
						</li>
					{/if}
				{/each}
			</ul>
		{/if}
		<!-- News -->
	</main>
{/if}

<style lang="postcss">
</style>
