<script lang="ts">
	import type { Player } from '$lib/data/players';
	import UnifiedEditHistory from '../UnifiedEditHistory.svelte';

	let {
		player
	}: {
		player: Player;
	} = $props();
</script>

<UnifiedEditHistory recordType="player" record={player} />
