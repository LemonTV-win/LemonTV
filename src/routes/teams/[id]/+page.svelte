<script lang="ts">
	import { error } from '@sveltejs/kit';
	import type { PageProps } from './$types';
	import { calculateWinnerIndex } from '$lib/data';
	import PlayerAvatar from '$lib/components/PlayerAvatar.svelte';
	import CharacterIcon from '$lib/components/CharacterIcon.svelte';
	import IconParkSolidPeoples from '~icons/icon-park-solid/peoples';
	import IconParkSolidCalendar from '~icons/icon-park-solid/calendar';
	import IconParkSolidLocal from '~icons/icon-park-solid/local';
	import PhRankingFill from '~icons/ph/ranking-fill';
	import { getLocale } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';
	let { data }: PageProps = $props();

	if (!data.team) {
		throw error(404, 'Team not found');
	}

	const dateFormatter = new Intl.DateTimeFormat(getLocale(), {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	});
</script>

{#if data.team}
	<main class="mx-auto max-w-screen-lg py-4">
		<!-- Info -->

		<section>
			<div class="flex items-center gap-4">
				<h1 class="my-6 text-3xl font-bold">{data.team.name}</h1>
				<div class="flex items-center gap-2 rounded-sm bg-gray-700/50 px-2 py-1">
					<IconParkSolidLocal class="h-4 w-4" />
					<span>{data.team.region}</span>
				</div>
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
						<a class="px-1 text-lg font-semibold" href={`/players/${player.id}`}>{player.name}</a>
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
						<li
							class="grid grid-cols-[1fr_1fr_auto_1fr] items-center gap-4 rounded-sm bg-gray-800 px-4 shadow-2xl"
						>
							<a href={`/events/${match.event.id}`} class="flex flex-col">
								<time datetime={match.event.date} class="text-xs text-gray-400">
									{dateFormatter.format(new Date(match.event.date))}
								</time>
								<span class="text-sm text-yellow-300">{match.event.name}</span>
							</a>
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
