<script lang="ts">
	import { error } from '@sveltejs/kit';
	import type { PageProps } from './$types';
	import type { Stage } from '$lib/data/events';

	import { m } from '$lib/paraglide/messages';
	import { settings } from '$lib/settings.svelte';
	import IconEye from '~icons/mdi/eye';

	let { data }: PageProps = $props();

	if (!data.event) {
		throw error(404, 'Event not found');
	}

	$inspect('[Content][Event] data.event', data.event);

	import BracketGraph from '$lib/components/Brackets.svelte';
	import OrganizerChip from '$lib/components/OrganizerChip.svelte';
	import GgOrganisation from '~icons/gg/organisation';
	import IconParkSolidPeoples from '~icons/icon-park-solid/peoples';
	import IconParkSolidCalendar from '~icons/icon-park-solid/calendar';
	import IconParkSolidLocalPin from '~icons/icon-park-solid/local-pin';
	import IconParkSolidCheckOne from '~icons/icon-park-solid/check-one';
	import IconParkSolidComputer from '~icons/icon-park-solid/computer';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import ContentActionLink from '$lib/components/ContentActionLink.svelte';
	import NationalityFlag from '$lib/components/NationalityFlag.svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import CasterCard from './CasterCard.svelte';
	import { safeFormatEventDate } from '$lib/utils/date';

	let activeStage = $state<Stage | null>(data.initialStage ?? null);
	let showResults = $state(false);

	// Update URL when activeStage changes
	$effect(() => {
		if (activeStage) {
			const url = new URL(window.location.href);
			url.searchParams.set('stage', activeStage.id.toString());
			goto(url.pathname + url.search, { replaceState: true });
		} else {
			const url = new URL(window.location.href);
			url.searchParams.delete('stage');
			goto(url.pathname + url.search, { replaceState: true });
		}
	});

	$inspect(activeStage);

	const sortedResults = (data.event.results ?? []).slice().sort((a, b) => a.rank - b.rank);
	const top3 = sortedResults.slice(0, 3);
	const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;
</script>

{#if data.event}
	<Breadcrumbs currentTitle={data.event.name} />
	<div
		class="banner flex min-h-48 flex-col gap-2 bg-cover bg-top p-4 text-white"
		style:--banner-image={`url(${data.event.imageURL})`}
	>
		<h1 class="my-2 flex items-center gap-2 text-3xl font-bold">
			{data.event.name}
			{#if ['admin', 'editor'].some((role) => data.user?.roles.includes(role))}
				<ContentActionLink href={`/admin/events?action=edit&id=${data.event.id}`} type="edit" />
				<ContentActionLink
					href={`/admin/matches?event=${data.event.id}`}
					type="edit"
					label={m.edit_matches()}
				/>
			{/if}
		</h1>
		<div class="flex flex-col gap-2 py-2">
			<div class="gap-2 text-gray-400">
				<span class="inline-flex items-center gap-1">
					<GgOrganisation class="inline-block h-4 w-4" />
					{m.organized_by({ name: '' })}
					<!-- TODO: Add appropriate locale insertion -->

					{#each data.event.organizers as organizer (organizer.id)}
						<OrganizerChip {organizer} />
					{/each}
				</span>
				<span class="inline-flex items-center gap-1">
					<IconParkSolidLocalPin class="inline-block h-4 w-4" />
					<span>{data.event.region}</span>
				</span>
				<span class="inline-flex items-center gap-1">
					<IconParkSolidComputer class="inline-block h-4 w-4" />
					<span>
						{#if data.event.format === 'lan'}
							{m.format_lan()}
						{:else if data.event.format === 'online'}
							{m.format_online()}
						{:else if data.event.format === 'hybrid'}
							{m.format_hybrid()}
						{/if}
					</span>
				</span>
				{#if data.event.official}
					<span class="inline-flex items-center gap-1">
						<IconParkSolidCheckOne class="inline-block h-4 w-4" />
						<span>{m.official()}</span>
					</span>
				{/if}
				<br />
				<span class="inline-flex items-center gap-1">
					<IconParkSolidPeoples class="inline-block h-4 w-4" />{m.teams_count({
						count:
							data.event.participants.length === data.event.capacity
								? data.event.participants.length
								: data.event.participants.length + '/' + data.event.capacity
					})}</span
				>・<span class="inline-flex items-center gap-1">
					<IconParkSolidCalendar class="inline-block h-4 w-4" />
					<time datetime={data.event.date}>{safeFormatEventDate(data.event.date)}</time>
				</span>
			</div>
			<div class="flex flex-wrap gap-2">
				{#if data.event.websites}
					{#each data.event.websites as website (website.url)}
						<a
							href={website.url}
							class="w-fit rounded-sm border-2 border-yellow-500 bg-yellow-500/10 px-2 py-1 text-yellow-500 hover:border-yellow-500 hover:bg-yellow-500 hover:text-white"
						>
							{website.label ? `${m.visit_website()} (${website.label})` : m.visit_website()}
						</a>
					{/each}
				{/if}
			</div>
		</div>
		<nav class="m-2 flex overflow-clip rounded-sm bg-gray-200/50">
			<button
				class={[
					'px-4 py-2 hover:bg-gray-200 hover:text-black',
					!activeStage ? 'bg-gray-300 font-bold text-black' : 'bg-transparent font-normal'
				]}
				onclick={() => (activeStage = null)}
			>
				{m.overview()}
			</button>

			<!-- TODO: Results 1st place, 2nd place, 3rd place -->

			{#each data.event.stages as stage (stage.id)}
				<button
					onclick={() => (activeStage = stage)}
					class={[
						'px-4 py-2 hover:bg-gray-200 hover:text-black',
						activeStage?.id === stage.id
							? 'bg-gray-300 font-bold text-black'
							: 'bg-transparent font-normal'
					]}
				>
					{stage.title === 'Main Bracket' ? m.main_bracket() : stage.title}
				</button>
			{/each}
		</nav>
	</div>
	<div class="flex flex-col gap-4 px-8">
		<!-- <h2 class="text-2xl font-bold text-white">Brackets</h2> -->
		{#if activeStage}
			<!-- TODO Use tab -->
			<div class="flex gap-4">
				<h2 class="text-2xl font-bold text-white">
					{activeStage.title === 'Main Bracket' ? m.main_bracket() : activeStage.title}
				</h2>
				<div class="flex gap-2">
					{#if ['admin', 'editor'].some((role) => data.user?.roles.includes(role))}
						<ContentActionLink
							href={`/admin/matches?event=${data.event.id}&action=editStage&stageId=${activeStage.id}`}
							type="edit"
						/>
						<ContentActionLink
							href={`/admin/matches?event=${data.event.id}&action=editBracket&stageId=${activeStage.id}`}
							type="edit"
							label={m.edit_bracket()}
						/>
					{/if}
				</div>
			</div>
			<BracketGraph stage={activeStage} />
		{:else}
			{#each data.event.stages as stage (stage.id)}
				<h2 class="text-2xl font-bold text-white">
					{stage.title === 'Main Bracket' ? m.main_bracket() : stage.title}
				</h2>
				<BracketGraph {stage} />
			{/each}
		{/if}
		{#if data.event.results}
			<div class="relative">
				<h2 class="my-4 text-2xl font-bold text-white">{m.results()}</h2>
				<div class="flex h-100 items-end justify-center gap-6 px-4">
					{#each podiumOrder as result, idx (idx)}
						<div
							class="glass flex min-w-72 flex-col items-center justify-between gap-2 p-4 {result.rank ===
							1
								? 'z-10 h-[100%]'
								: result.rank === 2
									? 'h-[80%]'
									: 'h-[70%]'}"
						>
							<div
								class="text-4xl font-bold {result.rank === 1
									? 'py-8 text-6xl text-yellow-400'
									: result.rank === 2
										? 'py-4 text-5xl text-gray-300'
										: 'py-2 text-amber-700'}"
							>
								#{result.rank}{result.rankTo ? `-${result.rankTo}` : ''}
							</div>
							{#if result.team.logoURL}
								<img
									src={result.team.logoURL}
									alt={result.team.name}
									class={['h-24 w-24 rounded-full', result.rank === 1 ? 'h-32 w-32' : 'h-24 w-24']}
								/>
							{:else}
								<IconParkSolidPeoples
									class={['h-24 w-24 text-gray-300', result.rank === 1 ? 'h-32 w-32' : 'h-24 w-24']}
								/>
							{/if}
							<div class="flex flex-col items-center gap-2">
								<div class="text-center">
									<div
										class="font-bold {result.rank === 1
											? 'text-2xl'
											: result.rank === 2
												? 'text-xl'
												: 'text-lg'}"
									>
										<a href={`/teams/${result.team.id}`} class="hover:text-yellow-500">
											{result.team.name}
										</a>
									</div>
									<div class="text-gray-400">({result.team.region})</div>
								</div>
								<div class="flex flex-col items-center gap-1">
									{#each result.prizes as prize, idx (idx)}
										<div class="text-yellow-500">
											{prize.amount.toLocaleString()}
											{prize.currency}
										</div>
									{/each}
								</div>
							</div>
						</div>
					{/each}
				</div>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
					{#each data.event.results.sort((a, b) => a.rank - b.rank).slice(3) as result, idx (idx)}
						<div class="glass flex flex-col items-center gap-2 p-4">
							<div class="text-4xl font-bold text-yellow-600">
								#{result.rank}{result.rankTo ? `-${result.rankTo}` : ''}
							</div>
							{#if result.team.logoURL}
								<img
									src={result.team.logoURL}
									alt={result.team.name}
									class="h-16 w-16 rounded-full"
								/>
							{:else}
								<IconParkSolidPeoples class="h-16 w-16 text-gray-300" />
							{/if}
							<div class="text-center">
								<div class="font-bold">
									<a href={`/teams/${result.team.id}`} class="hover:text-yellow-500">
										{result.team.name}
									</a>
								</div>
								<div class="text-gray-400">({result.team.region})</div>
							</div>
							<div class="flex flex-col items-center gap-1">
								{#each result.prizes as prize, idx (idx)}
									<div class="text-yellow-500">
										{prize.amount.toLocaleString()}
										{prize.currency}
									</div>
								{/each}
							</div>
						</div>
					{/each}
				</div>

				{#if settings.spoilerMode}
					<button
						class={[
							'absolute inset-0 z-10 grid cursor-pointer place-content-center',
							{
								'bg-black/30 text-gray-300 backdrop-blur-xl hover:bg-black/0 hover:text-white':
									!showResults,
								'bg-transparent': showResults
							}
						]}
						onclick={() => (showResults = true)}
					>
						{#if !showResults}
							<div class="flex items-center justify-center gap-2">
								<IconEye class="h-6 w-6" />
								{m.show_results()}
							</div>
						{/if}
					</button>
				{/if}
			</div>
		{/if}
		{#if data.event.videos?.some((v) => v.type === 'clip')}
			<section>
				<h2 class="my-4 text-2xl font-bold text-white">{m.highlights()}</h2>
				<ul class="flex flex-wrap gap-4">
					{#each data.event.videos.filter((v) => v.type === 'clip') as video (video.url)}
						{#if video.platform === 'twitch'}
							<li>
								<iframe
									src={`https://clips.twitch.tv/embed?clip=${video.url.split('/').pop()}&parent=${page.url.host}`}
									allowfullscreen
									title={video.title ?? `${data.event.name} - ${video.url}`}
									frameborder="0"
									scrolling="no"
									height="378"
									width="620"
								>
								</iframe>
							</li>
						{/if}
					{/each}
				</ul>
			</section>
		{/if}
		{#if data.event.casters?.length}
			<section>
				<h2 class="my-4 text-2xl font-bold text-white">{m.casters()}</h2>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{#each data.event.casters as caster (caster.player.id)}
						<CasterCard {caster} />
					{/each}
				</div>
			</section>
		{/if}
		<section>
			<h2 class="my-4 text-2xl font-bold text-white">{m.attending_teams()}</h2>
			<ul class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
				{#each [...data.event.participants, ...Array.from({ length: data.event.capacity - data.event.participants.length }, () => null)] as participant, idx (idx)}
					{#if participant}
						{@const { team, main, reserve, coach } = participant}
						{#if team}
							<li class="glass grid min-w-48 grid-cols-2 grid-rows-[auto_1fr] gap-2 p-4">
								<h3 class="col-span-2 font-bold">
									<a href={`/teams/${team.slug}`} class="hover:text-yellow-500">
										{team.name}
									</a>
								</h3>
								<div class="flex flex-col items-center justify-center gap-2">
									{#if team.logoURL}
										<img src={team.logoURL} alt={team.name} class="h-24 w-24 rounded-full" />
									{:else}
										<IconParkSolidPeoples class="h-16 w-16 text-gray-300" />
									{/if}
									<span class="text-gray-400">({team.region})</span>
								</div>
								<ul class="text-sm">
									{#each main as player, idx (idx)}
										{#if player}
											<li>
												{#each player.nationalities as nationality, idx (idx)}
													<NationalityFlag {nationality} />
												{/each}
												<a href={`/players/${player.slug}`} class="hover:text-yellow-500">
													{player.name}
												</a>
											</li>
										{/if}
									{/each}
									{#each reserve as player, idx (idx)}
										{#if player}
											<li class="text-white/50">
												{#each player.nationalities as nationality, idx (idx)}
													<NationalityFlag {nationality} />
												{/each}
												<a href={`/players/${player.slug}`} class="hover:text-yellow-500">
													{player.name}
												</a>
											</li>
										{/if}
									{/each}
									{#each coach as player, idx (idx)}
										{#if player}
											<li class="text-white/50">
												{#each player.nationalities as nationality, idx (idx)}
													<NationalityFlag {nationality} />
												{/each}
												<a href={`/players/${player.slug}`} class="hover:text-yellow-500">
													({player.name})
												</a>
											</li>
										{/if}
									{/each}
								</ul>
							</li>
						{:else}
							???
						{/if}
					{:else}
						<li class="glass flex min-h-48 min-w-48 flex-col items-center gap-2 p-2">
							<div class="flex h-full w-full flex-col items-center justify-center gap-2">
								<IconParkSolidPeoples class="h-16 w-16 text-gray-500" />
								<div class="text-2xl font-bold text-gray-500">TBD</div>
							</div>
						</li>
					{/if}
				{/each}
			</ul>
		</section>
	</div>
{/if}

<style lang="postcss">
	.banner {
		background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 1)), var(--banner-image);
		/* @apply h-96 bg-cover bg-center; */
	}
</style>
