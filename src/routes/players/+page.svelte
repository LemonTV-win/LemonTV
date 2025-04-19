<script lang="ts">
	import type { PageProps } from './$types';

	import { m } from '$lib/paraglide/messages.js';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import CharacterIcon from '$lib/components/CharacterIcon.svelte';
	import TypcnArrowUnsorted from '~icons/typcn/arrow-unsorted';
	import TypcnArrowSortedDown from '~icons/typcn/arrow-sorted-down';
	import TypcnArrowSortedUp from '~icons/typcn/arrow-sorted-up';

	let { data }: PageProps = $props();

	let sortBy: 'name-abc' | 'name-cba' | 'wins-asc' | 'wins-desc' = $state('name-abc');

	let sorted = $derived(
		data.players.toSorted((a, b) => {
			if (sortBy === 'name-abc') {
				return a.name.localeCompare(b.name);
			} else if (sortBy === 'name-cba') {
				return b.name.localeCompare(a.name);
			} else if (sortBy === 'wins-asc') {
				return a.wins - b.wins;
			} else if (sortBy === 'wins-desc') {
				return b.wins - a.wins;
			}
			return 0;
		})
	);

	$effect(() => {
		goto(`/players?sortBy=${sortBy}`);
	});

	onMount(() => {
		const url = new URL(window.location.href);
		const urlSortBy = url.searchParams.get('sortBy');
		if (
			urlSortBy &&
			(urlSortBy === 'name-abc' ||
				urlSortBy === 'name-cba' ||
				urlSortBy === 'wins-asc' ||
				urlSortBy === 'wins-desc')
		) {
			sortBy = urlSortBy;
		}
	});
</script>

<main class="mx-auto max-w-screen-lg">
	<h1 class="my-10 text-2xl font-bold">{m.players()}</h1>

	<table class="w-full table-auto border-collapse border-y-2 border-gray-500 bg-gray-800">
		<thead>
			<tr class="border-b-2 border-gray-500 text-left text-sm text-gray-400">
				<th class="px-4 py-1">
					<button
						class="text-left"
						onclick={() => (sortBy = sortBy === 'name-abc' ? 'name-cba' : 'name-abc')}
						>{m.name()}
						{#if sortBy === 'name-abc'}
							<TypcnArrowSortedUp class="inline-block" />
						{:else if sortBy === 'name-cba'}
							<TypcnArrowSortedDown class="inline-block" />
						{:else}
							<TypcnArrowUnsorted class="inline-block" />
						{/if}
					</button>
				</th>
				<th class="px-4 py-1">{m.teams()}</th>
				<th class="px-4 py-1">{m.superstrings()}</th>
				<th class="px-4 py-1">
					<button
						class="text-left"
						onclick={() => (sortBy = sortBy === 'wins-asc' ? 'wins-desc' : 'wins-asc')}
						>{m.wins()}
						{#if sortBy === 'wins-asc'}
							<TypcnArrowSortedUp class="inline-block" />
						{:else if sortBy === 'wins-desc'}
							<TypcnArrowSortedDown class="inline-block" />
						{:else}
							<TypcnArrowUnsorted class="inline-block" />
						{/if}
					</button>
				</th>
			</tr>
		</thead>
		<tbody>
			{#each sorted as player}
				<tr class="border-b-1 border-gray-500 bg-gray-800 px-4 py-2 shadow-2xl">
					<td class="px-4 py-1">
						<a href={`/players/${player.id}`}
							>{player.name}
							{#if player.gameAccounts}
								{#each player.gameAccounts as account}
									{#if account.currentName !== player.name}
										<span class="text-gray-400">
											({account.currentName})
										</span>
									{/if}
								{/each}
							{/if}</a
						>
					</td>
					<td class="px-4 py-1 text-sm">
						{#each data.playersTeams[player.id ?? ''] as team, i}
							<a href={`/teams/${team.name}`}>{team.name}</a
							>{#if i < data.playersTeams[player.id ?? ''].length - 1}
								<span class="mx-1 text-gray-400">|</span>
							{/if}
						{/each}
					</td>
					<td class="flex flex-wrap gap-1">
						{#each data.playersAgents[player.id ?? ''] as superstring}
							<CharacterIcon character={superstring[0]} />
						{/each}
					</td>
					<td class="px-4 py-1 text-gray-300">{player.wins}</td>
				</tr>
			{/each}
		</tbody>
	</table>
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
