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
				abbr: string | null;
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
			entry?:
				| 'open'
				| 'invited'
				| 'qualified'
				| 'host'
				| 'defending_champion'
				| 'regional_slot'
				| 'exhibition'
				| 'wildcard';
			status?: 'active' | 'disqualified' | 'withdrawn';
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
		class={[
			'glass group relative min-w-48 overflow-hidden border border-white/10 p-4 transition-all hover:-translate-y-0.5 hover:border-yellow-500/40 hover:shadow-[0_8px_30px_rgba(255,199,0,0.15)]',
			['withdrawn', 'disqualified'].includes(participant.status ?? '') &&
				'overflow-visible bg-gradient-to-b from-gray-900 to-gray-900/50 opacity-80 brightness-90 contrast-95'
		]}
	>
		{#if participant.entry === 'invited'}
			<span
				class="pointer-events-none absolute top-6 -right-10 inline-flex rotate-35 items-center justify-center bg-gradient-to-r from-yellow-400 to-amber-500 px-16 py-1.5 text-sm leading-tight font-extrabold tracking-widest text-black uppercase shadow-[0_8px_30px_rgba(255,199,0,0.5)] ring-1 ring-yellow-200/80"
			>
				{m['content.teams.entry.invited']()}
			</span>
		{/if}
		{#if participant.status === 'disqualified'}
			<span
				class="pointer-events-none absolute top-3 left-2 z-10 -rotate-12 rounded border-2 border-red-600/70 bg-red-600/30 px-2 py-1 text-xl font-black tracking-widest text-red-600 uppercase shadow-[inset_0_0_0_1px_rgba(0,0,0,0.2)]"
			>
				{m['content.teams.status.disqualified']()}
			</span>
		{/if}
		{#if participant.status === 'withdrawn'}
			<span
				class="pointer-events-none absolute top-3 left-2 z-10 -rotate-12 rounded border-2 border-red-600/70 bg-red-600/30 px-2 py-1 text-xl font-black tracking-widest text-red-600 uppercase shadow-[inset_0_0_0_1px_rgba(0,0,0,0.2)]"
			>
				{m['content.teams.status.withdrawn']()}
			</span>
		{/if}

		<div
			class={[
				'grid grid-cols-2 grid-rows-[auto_1fr_auto] gap-2',
				['withdrawn', 'disqualified'].includes(participant.status ?? '') &&
					'opacity-80 brightness-90 contrast-95 grayscale'
			]}
		>
			<h3 class="col-span-2 text-lg font-bold md:text-xl">
				<a href={`/teams/${participant.team.slug}`} class="hover:text-yellow-500">
					{participant.team.name}
				</a>
				{#if participant.team.abbr}
					<span class="text-xs text-gray-300">({participant.team.abbr})</span>
				{/if}
			</h3>
			<div class="flex flex-col items-center justify-center gap-2">
				<a href={`/teams/${participant.team.slug}`} class="hover:text-yellow-500">
					{#if participant.team.logoURL}
						<img
							src={participant.team.logoURL}
							alt={participant.team.name}
							class="h-28 w-28 rounded-full ring-2 ring-white/10 transition group-hover:ring-yellow-400/50"
						/>
					{:else}
						<IconParkSolidPeoples class="h-16 w-16 text-gray-300" />
					{/if}
				</a>
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
		</div>
	</li>
{:else}
	<li>???</li>
{/if}
