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

	const startersCount = $derived(participant?.main?.filter(Boolean).length ?? 0);
	const subsCount = $derived(participant?.reserve?.filter(Boolean).length ?? 0);
	const coachesCount = $derived(participant?.coach?.filter(Boolean).length ?? 0);
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
	<li
		class="glass group relative grid min-w-48 grid-cols-2 grid-rows-[auto_1fr_auto] gap-2 overflow-hidden border border-white/10 p-4 transition-all hover:-translate-y-0.5 hover:border-yellow-500/40 hover:shadow-[0_8px_30px_rgba(255,199,0,0.15)]"
	>
		<h3 class="col-span-2 text-lg font-bold md:text-xl">
			<a href={`/teams/${participant.team.slug}`} class="hover:text-yellow-500">
				{participant.team.name}
			</a>
		</h3>
		<div class="flex flex-col items-center justify-center gap-2">
			{#if participant.team.logoURL}
				<img
					src={participant.team.logoURL}
					alt={participant.team.name}
					class="h-28 w-28 rounded-full ring-2 ring-white/10 transition group-hover:ring-yellow-400/50"
				/>
			{:else}
				<IconParkSolidPeoples class="h-16 w-16 text-gray-300" />
			{/if}
			{#if participant.team.region}
				<span
					class="mt-1 rounded-sm border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-gray-300"
				>
					{participant.team.region}
				</span>
			{/if}
		</div>
		<ul class="text-sm">
			{#if startersCount}
				<li class="mb-1 text-xs tracking-wide text-white/60 uppercase">
					{m['content.teams.member_count.starters']({
						count: startersCount
					})} ({startersCount})
				</li>
			{/if}
			{#each participant.main as player, idx (idx)}
				{#if player}
					<li>
						{@render playerLink(player)}
					</li>
				{/if}
			{/each}
			{#if subsCount}
				<li class="my-2 h-px bg-white/10"></li>
				<li class="mb-1 text-xs tracking-wide text-white/60 uppercase">
					{m['content.teams.member_count.reserves']({
						count: subsCount
					})} ({subsCount})
				</li>
			{/if}
			{#each participant.reserve as player, idx (idx)}
				{#if player}
					<li>
						{@render playerLink(player)}
					</li>
				{/if}
			{/each}
			{#if participant.coach?.length}
				<li class="my-2 h-px bg-white/10"></li>
				<li class="mb-1 text-xs tracking-wide text-white/60 uppercase">
					{m['content.teams.member_count.coaches']({
						count: coachesCount
					})} ({coachesCount})
				</li>
				{#each participant.coach as player, idx (idx)}
					{#if player}
						<li>
							{@render playerLink(player)}
						</li>
					{/if}
				{/each}
			{/if}
		</ul>
	</li>
{:else}
	<li>???</li>
{/if}
