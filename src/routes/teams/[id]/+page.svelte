<script lang="ts">
	import { error } from '@sveltejs/kit';
	import type { PageProps } from './$types';
	import PlayerAvatar from '$lib/components/PlayerAvatar.svelte';
	import CharacterIcon from '$lib/components/CharacterIcon.svelte';
	import IconParkSolidPeoples from '~icons/icon-park-solid/peoples';
	import IconParkSolidCalendar from '~icons/icon-park-solid/calendar';
	import PhRankingFill from '~icons/ph/ranking-fill';
	import { m } from '$lib/paraglide/messages';
	import MatchCard from '$lib/components/MatchCard.svelte';
	import RegionTag from '$lib/components/tags/RegionTag.svelte';
	import { getAllNames } from '$lib/data/players';
	let { data }: PageProps = $props();

	if (!data.team) {
		throw error(404, 'Team not found');
	}
</script>

{#if data.team}
	<main class="mx-auto max-w-screen-lg py-4">
		<!-- Info -->

		<section>
			<div class="flex items-center gap-4">
				<h1 class="my-6 text-3xl font-bold">{data.team.name}</h1>
				{#if data.team.region}
					<RegionTag region={data.team.region} />
				{/if}
				<div
					class={[
						'flex items-center gap-2 rounded-sm bg-gray-700/50 px-2 py-1',
						data.teamStatistics.ranking === 1 && 'bg-yellow-500',
						data.teamStatistics.ranking === 2 && 'bg-blue-500',
						data.teamStatistics.ranking === 3 && 'bg-red-500'
					]}
				>
					<PhRankingFill class="h-4 w-4" />
					<p>
						{m.global_rank({ number: data.teamStatistics.ranking })}
					</p>
				</div>
			</div>
			{#if data.team.logo}
				<img src={data.team.logo} alt={data.team.name} />
			{/if}
		</section>
		<h2 class="my-5 flex items-center text-xl font-bold">
			<IconParkSolidPeoples class="mr-2 inline-block text-yellow-300" />{m.active_members()}
		</h2>
		{#if data.team.players}
			<ul class="flex flex-wrap gap-4">
				{#each data.team.players.toSorted((a, b) => (data.teamMemberStatistics?.[b.id ?? '']?.rating ?? 0) - (data.teamMemberStatistics?.[a.id ?? '']?.rating ?? 0)) as player}
					<li
						class="gap-y- grid min-w-32 grid-cols-[auto_1fr] grid-rows-[auto_auto] items-center gap-x-4 gap-y-2 rounded-sm bg-gray-800 px-2 py-2"
					>
						<PlayerAvatar {player} class="row-span-2 h-16 w-16 rounded-full" />
						<a class="flex gap-1 px-1 text-lg font-semibold" href={`/players/${player.id}`}
							>{player.name}{#each getAllNames(player).filter((name) => name !== player.name) as name}
								<span class="text-gray-400">
									({name})
								</span>
							{/each}
						</a>
						{#if player.id}
							{#if data.teamMemberStatistics?.[player.id]}
								<div class="flex gap-2">
									<div
										class="flex min-w-16 flex-col items-center rounded-sm bg-gray-700/50 px-2 py-1"
									>
										<span class="text-xs text-gray-400">{m.rating()}</span>
										<span class="text-sm text-yellow-300">
											{data.teamMemberStatistics[player.id].rating.toFixed(2)}
										</span>
									</div>
									<div
										class="flex min-w-16 flex-col items-center rounded-sm bg-gray-700/50 px-2 py-1"
									>
										<span class="text-xs text-gray-400">{m.kd_ratio()}</span>
										<span class="text-sm">
											{data.teamMemberStatistics[player.id].kd.toFixed(2)}
										</span>
									</div>
									<div class="flex flex-wrap items-center justify-center -space-x-3">
										{#each data.teamMemberStatistics[player.id].characters
											.toSorted((a, b) => b[1] - a[1])
											.map(([character, count]) => character)
											.slice(0, 3)
											.concat(Array(3).fill(null))
											.slice(0, 3) as character, i}
											<CharacterIcon
												{character}
												class={`h-3 w-3 shadow-md ${i === 0 ? 'z-3' : i === 1 ? 'z-2' : 'z-1'}`}
											/>
										{/each}
									</div>
								</div>
							{/if}
						{/if}
					</li>
				{/each}
			</ul>
		{/if}
		<!-- Statistics -->
		<!-- Achievements -->
		<!-- Previous members -->

		<h2 class="my-5 flex items-center text-xl font-bold">
			<IconParkSolidCalendar class="mr-2 inline-block text-yellow-300" />{m.matches()}
		</h2>
		{#if data.teamMatches}
			<ul class="grid grid-cols-1 gap-3">
				{#each data.teamMatches as match}
					{#if match}
						<MatchCard {match} event={match.event} teamIndex={match.teamIndex} />
					{/if}
				{/each}
			</ul>
		{/if}
		<!-- News -->
	</main>
{/if}
