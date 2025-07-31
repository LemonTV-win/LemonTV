<script lang="ts">
	import NationalityFlag from '$lib/components/NationalityFlag.svelte';
	import { m } from '$lib/paraglide/messages';
	import IconParkSolidPeoples from '~icons/icon-park-solid/peoples';
	let {
		caster
	}: {
		caster: {
			player: {
				name: string;
				slug: string;
				nationalities: string[];
			};
			role: string;
		};
	} = $props();
</script>

<div class="glass flex flex-col items-center gap-2 p-4">
	{#each caster.player.nationalities as nationality, idx (idx)}
		<NationalityFlag {nationality} />
	{/each}
	<a href={`/players/${caster.player.slug}`} class="contents text-center hover:text-yellow-500">
		<!-- TODO: Add image -->
		<IconParkSolidPeoples class="h-16 w-16 text-gray-300" />
		<div class="font-bold">{caster.player.name}</div>
		<div class="text-sm text-gray-400">
			{#if caster.role === 'host'}
				{m.role_host()}
			{:else if caster.role === 'analyst'}
				{m.role_analyst()}
			{:else if caster.role === 'commentator'}
				{m.role_commentator()}
			{/if}
		</div>
	</a>
</div>
