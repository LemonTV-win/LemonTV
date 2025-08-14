<script lang="ts">
	import NationalityFlag from '$lib/components/NationalityFlag.svelte';
	import { m } from '$lib/paraglide/messages';
	import IconParkSolidPeoples from '~icons/icon-park-solid/peoples';

	let {
		participant
	}: {
		participant: {
			team: {
				name: string;
				slug: string;
				logoURL?: string | null;
				region: string | null;
			} | null;
			main: Array<null | {
				name: string;
				slug: string;
				nationalities: string[];
			}>;
			reserve: Array<null | {
				name: string;
				slug: string;
				nationalities: string[];
			}>;
			coach: Array<null | {
				name: string;
				slug: string;
				nationalities: string[];
			}>;
		};
	} = $props();
</script>

{#snippet playerLink(player: { name: string; slug: string; nationalities: string[] })}
	<a href={`/players/${player.slug}`} class="hover:text-yellow-500">
		{#if player.nationalities?.length}
			{#each player.nationalities as nationality, idx (idx)}
				<NationalityFlag {nationality} />
			{/each}
		{/if}
		{player.name}
	</a>
{/snippet}

{#if participant?.team}
	<li class="glass grid min-w-48 grid-cols-2 grid-rows-[auto_1fr] gap-2 p-4">
		<h3 class="col-span-2 font-bold">
			<a href={`/teams/${participant.team.slug}`} class="hover:text-yellow-500">
				{participant.team.name}
			</a>
		</h3>
		<div class="flex flex-col items-center justify-center gap-2">
			{#if participant.team.logoURL}
				<img
					src={participant.team.logoURL}
					alt={participant.team.name}
					class="h-24 w-24 rounded-full"
				/>
			{:else}
				<IconParkSolidPeoples class="h-16 w-16 text-gray-300" />
			{/if}
			<span class="text-gray-400">({participant.team.region})</span>
		</div>
		<ul class="text-sm">
			{#each participant.main as player, idx (idx)}
				{#if player}
					<li>
						{@render playerLink(player)}
					</li>
				{/if}
			{/each}
			{#each participant.reserve as player, idx (idx)}
				{#if player}
					<li class="text-white/50">
						{@render playerLink(player)}
						<span class="text-xs text-white/50">({m['content.teams.substitute']()})</span>
					</li>
				{/if}
			{/each}
			{#if participant.coach?.length}
				<hr class="my-2 border-white/10" />
				{#each participant.coach as player, idx (idx)}
					{#if player}
						<li class="text-white/50">
							{@render playerLink(player)}
							<span class="text-xs text-white/50">({m['content.teams.coach']()})</span>
						</li>
					{/if}
				{/each}
			{/if}
		</ul>
	</li>
{:else}
	<li>???</li>
{/if}
