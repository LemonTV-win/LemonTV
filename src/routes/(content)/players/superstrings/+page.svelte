<script lang="ts">
	import type { PageProps } from './$types';
	import { goto } from '$app/navigation';
	import SuperstringRanking from './SuperstringRanking.svelte';

	let { data }: PageProps = $props();

	let sortBy = $state(data.sortBy);
	let selectedCharacter = $state(data.selectedCharacter);

	$effect(() => {
		const params = new URLSearchParams(window.location.search);
		if (sortBy) params.set('sortBy', sortBy);
		if (selectedCharacter) params.set('character', selectedCharacter);
		goto(`/players/superstrings?${params.toString()}`, { replaceState: true, noScroll: true });
	});
</script>

<SuperstringRanking
	players={data.allPlayers}
	superstringPowerData={data.superstringPowerData}
	bind:sortBy
	bind:selectedCharacter
/>
