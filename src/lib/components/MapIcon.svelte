<script lang="ts">
	import { MAP_NAMES, MAP_IMAGES, type GameMap } from '$lib/data/game';

	let { mapId, class: className = '' }: { mapId: GameMap | null; class?: string } = $props();
</script>

{#if mapId}
	<img
		class={['h-9 w-12 rounded object-cover', className]}
		src={MAP_IMAGES[mapId]}
		alt={MAP_NAMES[mapId]()}
		title={MAP_NAMES[mapId]()}
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
