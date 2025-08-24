<script lang="ts">
	import { error } from '@sveltejs/kit';
	import type { PageProps } from './$types';

	import { MAP_NAMES, type GameMap } from '$lib/data/game';

	let { data }: PageProps = $props();

	$inspect(`[Content][Match][${data.match.id}]`, data.match);

	if (!data.match) {
		throw error(404, 'Event not found');
	}

	let sortBy:
		| 'score-asc'
		| 'score-desc'
		| 'damageScore-asc'
		| 'damageScore-desc'
		| 'kills-asc'
		| 'kills-desc'
		| 'deaths-asc'
		| 'deaths-desc'
		| 'assists-asc'
		| 'assists-desc'
		| 'damage-asc'
		| 'damage-desc'
		| 'player-asc'
		| 'player-desc' = $state(data.sortBy || 'score-desc');

	$effect(() => {
		const url = new URL(window.location.href);
		url.searchParams.set('sortBy', sortBy);
		goto(url.toString(), { replaceState: true, noScroll: true, keepFocus: true });
	});

	import Scoreboard from './Scoreboard.svelte';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import ContentActionLink from '$lib/components/ContentActionLink.svelte';
	import VodDisplay from './VodDisplay.svelte';
	import { goto } from '$app/navigation';
	import { MAP_IMAGES } from '$lib/data/game';

	let currentMapID: number = $state(0);

	function formatDuration(seconds: number): string {
		const hrs = Math.floor(seconds / 3600);
		const mins = Math.floor((seconds % 3600) / 60);
		const secs = Math.floor(seconds % 60);

		const padded = (num: number) => String(num).padStart(2, '0');

		if (hrs > 0) {
			return `${padded(hrs)}:${padded(mins)}:${padded(secs)}`;
		} else {
			return `${padded(mins)}:${padded(secs)}`;
		}
	}

	let maps: {
		map: GameMap;
	}[] = $derived(
		data.match.maps && data.match.maps.length > 0
			? data.match.maps
			: data.match.games.map((g) => ({
					map: g.map
				}))
	);
</script>

<svelte:head>
	<title>{data.match.teams[0]?.team?.name} vs. {data.match.teams[1]?.team?.name} | LemonTV</title>
</svelte:head>

{#if data.match}
	<Breadcrumbs
		currentTitle={`${data.match.teams[0]?.team?.name} vs. ${data.match.teams[1]?.team?.name}`}
		customSegments={['events', data.match.event.name, data.match.id.toString()]}
		customUrls={[
			'/events',
			`/events/${data.match.event.id}`,
			`/events/${data.match.event.id}/matches`
		]}
	/>
	<div
		class="banner flex min-h-48 flex-col gap-2 bg-cover bg-top p-4 text-white"
		style:--banner-image={`url(${MAP_IMAGES[maps[currentMapID].map]})`}
	>
		<div class="flex items-center justify-between">
			<nav class="my-2 flex gap-4 rounded-sm">
				{#each maps as map, index (index)}
					<button
						class="cursor-pointer overflow-clip rounded-md bg-white/40 text-center backdrop-blur-sm"
						onclick={() => (currentMapID = index)}
						disabled={index >= (data.match.games?.length ?? 0)}
						style:opacity={index >= (data.match.games?.length ?? 0) ? '0.5' : '1'}
						class:active={index === currentMapID}
					>
						<img src={MAP_IMAGES[map.map]} class="h-10 w-full" alt={MAP_NAMES[map.map]()} />
						<span class="px-4 text-sm">{MAP_NAMES[map.map]()}</span>
						<span class="px-4 text-sm text-yellow-300"
							>{formatDuration(data.match.games?.[index]?.duration ?? 0)}</span
						>
					</button>
				{/each}
			</nav>
			{#if ['admin', 'editor'].some((role) => data.user?.roles.includes(role))}
				<ContentActionLink
					href={`/admin/matches/${data.match.event.id}?action=editMatch&id=${data.match.id}`}
					type="edit"
				/>
			{/if}
		</div>
		<!-- Scoreboard -->
		{#if data.match.games?.[currentMapID] && data.match.teams[0]?.team && data.match.teams[1]?.team}
			<Scoreboard
				scores={data.match.games?.[currentMapID].scores}
				winner={data.match.games?.[currentMapID].winner}
				teams={[data.match.teams[0].team, data.match.teams[1].team]}
				bind:sortBy
			/>
		{/if}
	</div>

	<!-- VOD Display -->
	{#if data.match.games?.[currentMapID]?.vods}
		<div class="px-8 py-4">
			<VodDisplay
				vods={data.match.games[currentMapID].vods || []}
				gameId={data.match.games[currentMapID].id}
				mapName={MAP_NAMES[data.match.maps?.[currentMapID]?.map ?? 'base_404']()}
			/>
		</div>
	{/if}
{/if}

<style lang="postcss">
	.banner {
		background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 1)), var(--banner-image);
	}
	.active {
		box-shadow: 0 0 10px 0 rgba(221, 255, 255, 0.8);
	}
</style>
