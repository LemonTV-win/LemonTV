<script lang="ts">
	import type { PageProps } from './$types';

	import { MAP_NAMES, type GameMap } from '$lib/data/game';

	let { data }: PageProps = $props();

	$inspect(`[Content][Match][${data.match.id}]`, data.match);

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

	import Scoreboard from './Scoreboard.svelte';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import ContentActionLink from '$lib/components/ContentActionLink.svelte';
	import VodDisplay from './VodDisplay.svelte';
	import { goto } from '$app/navigation';
	import { MAP_IMAGES } from '$lib/data/game';
	import { m } from '$lib/paraglide/messages';

	function getMapIDFromGameId(gameId: number): number {
		return data.match.games.findIndex((g) => g.id === gameId);
	}

	let currentMapID: number = $state(data.gameId ? getMapIDFromGameId(data.gameId) : 0);
	let currentGameId: number | undefined = $derived(data.match.games[currentMapID]?.id);

	$effect(() => {
		const url = new URL(window.location.href);
		url.searchParams.set('sortBy', sortBy);
		if (currentGameId !== undefined) {
			url.searchParams.set('game', currentGameId.toString());
		}
		goto(url.toString(), { replaceState: true, noScroll: true, keepFocus: true });
	});

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

	{#if data.match.games && data.match.games.length > 0}
		{@const team0Wins =
			data.match.result?.[0] ?? data.match.games.filter((g) => g.winner === 0).length}
		{@const team1Wins =
			data.match.result?.[1] ?? data.match.games.filter((g) => g.winner === 1).length}
		<div
			class="flex w-full flex-col items-center justify-center border-y border-white/20 bg-slate-700/50 px-4 py-3 backdrop-blur-lg"
		>
			<div class="grid grid-cols-[1fr_2em_auto_2em_1fr] items-center justify-center gap-8">
				<span class={['text-2xl font-semibold', team0Wins > team1Wins ? 'text-win' : 'text-loss']}
					>{data.match.teams[0]?.team?.name}</span
				>
				<div class="flex flex-col items-center">
					<span
						class={[
							'text-3xl font-bold',
							team0Wins > team1Wins
								? 'text-win drop-shadow-[0_0_4px_rgba(245,158,11,0.3)]'
								: 'text-loss'
						]}>{team0Wins}</span
					>
				</div>
				<div class="text-xl font-semibold text-gray-300">&ndash;</div>
				<div class="flex flex-col items-center">
					<span
						class={[
							'text-3xl font-bold',
							team0Wins < team1Wins
								? 'text-win drop-shadow-[0_0_4px_rgba(245,158,11,0.3)]'
								: 'text-loss'
						]}>{team1Wins}</span
					>
				</div>
				<span
					class={[
						'text-2xl font-semibold',
						team0Wins < team1Wins
							? 'text-win drop-shadow-[0_0_4px_rgba(245,158,11,0.3)]'
							: 'text-loss'
					]}>{data.match.teams[1]?.team?.name}</span
				>
			</div>
			<div class="text-xs text-gray-300">
				{data.match.battleOf ?? m.match()}
			</div>
		</div>
	{/if}
	<div
		class="banner flex min-h-48 flex-col gap-2 bg-cover bg-top p-4 text-white"
		style:--banner-image={`url(${MAP_IMAGES[maps[currentMapID].map]})`}
	>
		<div class="flex items-center justify-between">
			<nav class="my-2 flex gap-4 rounded-sm">
				{#each maps as map, index (index)}
					<button
						class="relative cursor-pointer overflow-clip rounded-md bg-white/40 text-center backdrop-blur-sm"
						onclick={() => (currentMapID = index)}
						disabled={index >= (data.match.games?.length ?? 0)}
						style:opacity={index >= (data.match.games?.length ?? 0) ? '0.5' : '1'}
						class:active={index === currentMapID}
					>
						<img src={MAP_IMAGES[map.map]} class="h-10 w-full" alt={MAP_NAMES[map.map]()} />

						<span class="px-2 text-sm">{MAP_NAMES[map.map]()}</span>
						<span class="px-2 text-sm text-yellow-300"
							>{formatDuration(data.match.games?.[index]?.duration ?? 0)}</span
						>
					</button>
				{/each}
			</nav>

			<div class="flex items-center gap-4">
				{#if ['admin', 'editor'].some((role) => data.user?.roles.includes(role))}
					<ContentActionLink
						href={`/admin/matches/${data.match.event.id}?action=editMatch&id=${data.match.id}`}
						type="edit"
					/>
				{/if}

				<!-- Game Score Display -->
				<span class="rounded-md bg-white/40 px-3 py-1 text-center text-2xl backdrop-blur-sm">
					<span
						class={[
							data.match.games?.[currentMapID]?.winner === 0 && 'text-yellow-400',
							data.match.games?.[currentMapID]?.winner === 1 && 'text-red-500'
						]}
					>
						{data.match.games?.[currentMapID]?.result?.[0]}
					</span>
					<span class="text-gray-300">&ndash;</span>
					<span
						class={[
							data.match.games?.[currentMapID]?.winner === 1 && 'text-yellow-400',
							data.match.games?.[currentMapID]?.winner === 0 && 'text-red-500'
						]}
					>
						{data.match.games?.[currentMapID]?.result?.[1]}
					</span>
				</span>
			</div>
		</div>
		<!-- Scoreboard -->
		{#if data.match.games?.[currentMapID] && data.match.teams[0]?.team && data.match.teams[1]?.team}
			<Scoreboard
				scores={data.match.games?.[currentMapID].scores}
				winner={data.match.games?.[currentMapID].winner}
				result={data.match.games?.[currentMapID].result}
				teams={[data.match.teams[0].team, data.match.teams[1].team]}
				bind:sortBy
			/>
		{/if}
	</div>

	<!-- VOD Display -->
	{#if data.match.games?.[currentMapID]?.vods}
		<div class="p-4">
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
