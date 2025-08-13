<script lang="ts">
	import type { PageProps } from './$types';
	import IconParkSolidPeoples from '~icons/icon-park-solid/peoples';
	import IconParkSolidCalendar from '~icons/icon-park-solid/calendar';
	import PhRankingFill from '~icons/ph/ranking-fill';
	import { m } from '$lib/paraglide/messages';
	import MatchCard from '$lib/components/MatchCard.svelte';
	import RegionTag from '$lib/components/tags/RegionTag.svelte';
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import ContentActionLink from '$lib/components/ContentActionLink.svelte';
	import { safeGetTimestamp } from '$lib/utils/date';
	import TeamMember from './TeamMember.svelte';
	import {
		isActive,
		isSubstitute,
		isCoaching,
		isManager,
		isOwner,
		isFormer
	} from '$lib/data/teams';

	let { data }: PageProps = $props();
</script>

{#if data.team}
	<Breadcrumbs currentTitle={data.team.name} />
	<main class="mx-auto max-w-screen-lg px-4 py-4">
		<!-- Info -->

		<section class="glass mb-6 rounded-lg p-6">
			<div class="flex flex-col gap-4 sm:flex-row sm:items-center">
				<div class="flex items-center gap-4">
					{#if data.team.logoURL}
						<img src={data.team.logoURL} alt={data.team.name} class="h-24 w-24 rounded-full" />
					{/if}
					<div>
						<h1 class="text-3xl font-bold">
							{data.team.name}
						</h1>
					</div>
				</div>

				<div class="flex flex-wrap gap-2">
					{#if data.team.region}
						<RegionTag region={data.team.region} />
					{/if}
					<div
						class={[
							'flex items-center gap-2 rounded-sm bg-gray-700/50 px-2 py-1',
							data.teamStatistics.ranking === 1 && 'bg-yellow-500',
							data.teamStatistics.ranking === 2 && 'bg-blue-500',
							data.teamStatistics.ranking === 3 && 'bg-red-500'
						]}
					>
						<PhRankingFill class="h-4 w-4" />
						<p>
							{m.global_rank({ number: data.teamStatistics.ranking })}
						</p>
					</div>
				</div>

				{#if ['admin', 'editor'].some((role) => data.user?.roles.includes(role))}
					<ContentActionLink href={`/admin/teams?action=edit&id=${data.team.id}`} type="edit" />
				{/if}
			</div>
		</section>

		<!-- Team Members -->
		{#if data.team.players?.length}
			<!-- Active Players -->
			{#if data.team.players.filter((p) => isActive(p.teamPlayer)).length}
				<h2 class="my-5 flex items-center text-xl font-bold">
					<IconParkSolidPeoples class="mr-2 inline-block text-green-400" />Active Players
					<span class="ml-2 text-sm font-normal text-gray-500">
						({data.team.players.filter((p) => isActive(p.teamPlayer)).length})
					</span>
				</h2>
				<ul class="flex flex-wrap gap-4">
					{#each data.team.players
						.filter((p) => isActive(p.teamPlayer))
						.toSorted((a, b) => (data.teamMemberStatistics?.[b.player.id ?? '']?.rating ?? 0) - (data.teamMemberStatistics?.[a.player.id ?? '']?.rating ?? 0)) as teamPlayer (teamPlayer.player.id)}
						<TeamMember
							{teamPlayer}
							teamMemberStatistics={data.teamMemberStatistics}
							globalRank={teamPlayer.globalRank}
						/>
					{/each}
				</ul>
			{/if}

			<!-- Substitute Players -->
			{#if data.team.players.filter((p) => isSubstitute(p.teamPlayer)).length}
				<h2 class="my-5 flex items-center text-xl font-bold">
					<IconParkSolidPeoples class="mr-2 inline-block text-blue-400" />Substitutes
					<span class="ml-2 text-sm font-normal text-gray-500">
						({data.team.players.filter((p) => isSubstitute(p.teamPlayer)).length})
					</span>
				</h2>
				<ul class="flex flex-wrap gap-4">
					{#each data.team.players
						.filter((p) => isSubstitute(p.teamPlayer))
						.toSorted((a, b) => (data.teamMemberStatistics?.[b.player.id ?? '']?.rating ?? 0) - (data.teamMemberStatistics?.[a.player.id ?? '']?.rating ?? 0)) as teamPlayer (teamPlayer.player.id)}
						<TeamMember
							{teamPlayer}
							teamMemberStatistics={data.teamMemberStatistics}
							globalRank={teamPlayer.globalRank}
						/>
					{/each}
				</ul>
			{/if}

			<!-- Coaches -->
			{#if data.team.players.filter((p) => isCoaching(p.teamPlayer)).length}
				<h2 class="my-5 flex items-center text-xl font-bold">
					<IconParkSolidPeoples class="mr-2 inline-block text-purple-400" />Coaches
					<span class="ml-2 text-sm font-normal text-gray-500">
						({data.team.players.filter((p) => isCoaching(p.teamPlayer)).length})
					</span>
				</h2>
				<ul class="flex flex-wrap gap-4">
					{#each data.team.players.filter( (p) => isCoaching(p.teamPlayer) ) as teamPlayer (teamPlayer.player.id)}
						<TeamMember
							{teamPlayer}
							teamMemberStatistics={data.teamMemberStatistics}
							globalRank={teamPlayer.globalRank}
						/>
					{/each}
				</ul>
			{/if}

			<!-- Managers -->
			{#if data.team.players.filter((p) => isManager(p.teamPlayer)).length}
				<h2 class="my-5 flex items-center text-xl font-bold">
					<IconParkSolidPeoples class="mr-2 inline-block text-orange-400" />Managers
					<span class="ml-2 text-sm font-normal text-gray-500">
						({data.team.players.filter((p) => isManager(p.teamPlayer)).length})
					</span>
				</h2>
				<ul class="flex flex-wrap gap-4">
					{#each data.team.players.filter( (p) => isManager(p.teamPlayer) ) as teamPlayer (teamPlayer.player.id)}
						<TeamMember
							{teamPlayer}
							teamMemberStatistics={data.teamMemberStatistics}
							globalRank={teamPlayer.globalRank}
						/>
					{/each}
				</ul>
			{/if}

			<!-- Owners -->
			{#if data.team.players.filter((p) => isOwner(p.teamPlayer)).length}
				<h2 class="my-5 flex items-center text-xl font-bold">
					<IconParkSolidPeoples class="mr-2 inline-block text-yellow-400" />Owners
					<span class="ml-2 text-sm font-normal text-gray-500">
						({data.team.players.filter((p) => isOwner(p.teamPlayer)).length})
					</span>
				</h2>
				<ul class="flex flex-wrap gap-4">
					{#each data.team.players.filter( (p) => isOwner(p.teamPlayer) ) as teamPlayer (teamPlayer.player.id)}
						<TeamMember
							{teamPlayer}
							teamMemberStatistics={data.teamMemberStatistics}
							globalRank={teamPlayer.globalRank}
						/>
					{/each}
				</ul>
			{/if}

			<!-- Former Players (Hidden but count shown) -->
			{#if data.team.players.filter((p) => isFormer(p.teamPlayer)).length}
				<div class="my-5 text-center text-sm text-gray-500">
					+{data.team.players.filter((p) => isFormer(p.teamPlayer)).length} former players (not displayed)
				</div>
			{/if}
		{:else}
			<h2 class="my-5 flex items-center text-xl font-bold">
				<IconParkSolidPeoples class="mr-2 inline-block text-yellow-300" />{m.active_members()}
			</h2>
			<div class="text-center text-gray-400">{m.no_data()}</div>
		{/if}
		<!-- Statistics -->
		<!-- Achievements -->
		<!-- Previous members -->
		<!-- TODO: Add server matches -->
		<!-- 
		<h2 class="my-5 flex items-center text-xl font-bold">
			<IconParkSolidCalendar class="mr-2 inline-block text-yellow-300" />{m.matches()}
		</h2>
		{#if data.teamMatches}
			<ul class="grid grid-cols-1 gap-3">
				{#each data.teamMatches.toSorted((a, b) => {
					// Safe date parsing to prevent RangeError
					const dateA = safeGetTimestamp(a.event.date);
					const dateB = safeGetTimestamp(b.event.date);
					return dateB - dateA;
				}) as match (match.id)}
					{#if match}
						<MatchCard {match} event={match.event} teamIndex={match.teamIndex} teams={data.teams} />
					{/if}
				{/each}
			</ul>
		{/if} -->

		<h2 class="my-5 flex items-center text-xl font-bold">
			<IconParkSolidCalendar class="mr-2 inline-block text-yellow-300" />{m.recent_matches()}
		</h2>
		{#if data.teamMatches}
			<ul class="flex flex-col gap-2">
				{#each data.teamMatches.toSorted((a, b) => {
					// Safe date parsing to prevent RangeError
					const dateA = safeGetTimestamp(a.event.date);
					const dateB = safeGetTimestamp(b.event.date);
					return dateB - dateA;
				}) as match (match.id)}
					{#if match}
						<MatchCard {match} teamIndex={match.teamIndex} event={match.event} />
					{/if}
				{/each}
			</ul>
		{:else}
			<li class="text-center text-gray-400">{m.no_data()}</li>
		{/if}
		<!-- News -->
	</main>
{/if}
