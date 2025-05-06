<script lang="ts">
	import { error } from '@sveltejs/kit';
	import type { PageProps } from './$types';

	import type { GameMap } from '$lib/data/game';

	let { data }: PageProps = $props();

	if (!data.match) {
		throw error(404, 'Event not found');
	}

	import Scoreboard from '$lib/components/Scoreboard.svelte';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';

	const MAP_2_IMAGE: Record<GameMap, string> = {
		base_404:
			'https://klbq-web-cms.strinova.com/prod/strinova_web/images/202411/830d991d-24ce-4c00-92e9-2b4eb5ff703c.jpg',
		area_88:
			'https://klbq-web-cms.strinova.com/prod/strinova_web/images/202411/24c1ac4e-40d0-4383-a060-15bb59db183e.jpg',
		port_euler:
			'https://klbq-web-cms.strinova.com/prod/strinova_web/images/202411/e46ea826-5ff4-465a-b575-fe5f29e02cd5.jpg',
		windy_town:
			'https://klbq-web-cms.strinova.com/prod/strinova_web/images/202411/47755586-4bf9-465d-9e88-566c70fab0bc.jpg',
		space_lab:
			'https://klbq-web-cms.strinova.com/prod/strinova_web/images/202411/be6f044e-0ace-4b85-89f5-0c8710b9c1fd.jpg',
		cauchy_district:
			'https://klbq-web-cms.strinova.com/prod/strinova_web/images/202411/f704a413-6e0b-476b-bec5-a442a890079e.jpg',
		cosmite:
			'https://klbq-web-cms.strinova.com/prod/strinova_web/images/202411/c0951e88-691f-4698-8c27-e65ab25ff166.jpg',
		orcanus:
			'https://static.wikitide.net/strinovawiki/thumb/9/9d/Intro_Ocarnus.png/450px-Intro_Ocarnus.png'
	};

	const MAP_2_NAME: Record<GameMap, string> = {
		base_404: 'Base 404',
		area_88: 'Area 88',
		port_euler: 'Port Euler',
		windy_town: 'Windy Town',
		space_lab: 'Space Lab',
		cauchy_district: 'Cauchy District',
		cosmite: 'Cosmite',
		orcanus: 'Orcanus'
	};

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
</script>

{#if data.match}
	<Breadcrumbs
		currentTitle={`${data.match.teams[0].team.name} vs. ${data.match.teams[1].team.name}`}
		customSegments={['events', data.match.event.name, data.match.id.toString()]}
		customUrls={[
			'/events',
			`/events/${data.match.event.id}`,
			`/events/${data.match.event.id}/matches`
		]}
	/>
	<div
		class="banner flex min-h-48 flex-col gap-2 bg-cover bg-top p-4 text-white"
		style:--banner-image={`url(${MAP_2_IMAGE[data.match.maps?.[currentMapID]?.map ?? 'base_404']})`}
	>
		<nav class="m-2 flex gap-4 rounded-sm">
			{#each data.match.maps as map, index}
				<button
					class="overflow-clip rounded-sm bg-gray-200/50"
					onclick={() => (currentMapID = index)}
					disabled={index >= (data.match.games?.length ?? 0)}
					style:opacity={index >= (data.match.games?.length ?? 0) ? '0.5' : '1'}
					class:active={index === currentMapID}
				>
					<img src={MAP_2_IMAGE[map.map]} class="h-10 w-full" alt={MAP_2_NAME[map.map]} />
					<span class="px-4 text-sm">{MAP_2_NAME[map.map]}</span>
					<span class="px-4 text-sm text-yellow-300"
						>{formatDuration(data.match.games?.[index]?.duration ?? 0)}</span
					>
				</button>
			{/each}
		</nav>
		<!-- Scoreboard -->
		{#if data.match.games?.[currentMapID]}
			<Scoreboard
				scores={data.match.games?.[currentMapID].scores}
				winner={data.match.games?.[currentMapID].winner}
				teams={[data.match.teams[0].team, data.match.teams[1].team]}
			/>
		{/if}
	</div>
{/if}

<style lang="postcss">
	.banner {
		background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 1)), var(--banner-image);
	}
	.active {
		box-shadow: 0 0 10px 0 rgba(221, 255, 255, 0.8);
	}
</style>
