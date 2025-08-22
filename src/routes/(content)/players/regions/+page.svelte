<script lang="ts">
	import type { PageProps } from './$types';
	import RegionRanking from './RegionRanking.svelte';
	import { goto } from '$app/navigation';

	let { data }: PageProps = $props();

	let sortBy = $state(data.sortBy);

	$effect(() => {
		const params = new URLSearchParams(window.location.search);
		if (sortBy) params.set('sortBy', sortBy);
		goto(`/players/regions?${params.toString()}`, { replaceState: true, noScroll: true });
	});
</script>

<div>
	<h1>Region Ranking</h1>
</div>

<RegionRanking data={data.regionRankingData} bind:sortBy />
