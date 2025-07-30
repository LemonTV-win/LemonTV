<script lang="ts">
	import type { GameMap } from '$lib/data/game';
	import { m } from '$lib/paraglide/messages.js';

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
		ocarnus:
			'https://static.wikitide.net/strinovawiki/thumb/9/9d/Intro_Ocarnus.png/450px-Intro_Ocarnus.png'
	};

	let { mapId, class: className = '' }: { mapId: GameMap | null; class?: string } = $props();
</script>

{#if mapId}
	<img
		class={['h-9 w-12 rounded object-cover', className]}
		src={MAP_2_IMAGE[mapId]}
		alt={m[mapId]()}
		title={m[mapId]()}
	/>
{:else}
	<div
		class={[
			'flex h-9 w-12 items-center justify-center rounded bg-gray-600 text-gray-400',
			className
		]}
	>
		?
	</div>
{/if}
