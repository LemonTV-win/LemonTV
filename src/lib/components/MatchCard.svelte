<script lang="ts">
	import type { Event } from '$lib/data/events';
	import type { Team } from '$lib/data/teams';
	import { calculateWinnerIndex } from '$lib/data';
	import { safeFormatDate } from '$lib/utils/date';
	import IconChevronDown from '~icons/mdi/chevron-down';
	import IconChevronUp from '~icons/mdi/chevron-up';
	import MapIcon from '$lib/components/MapIcon.svelte';
	import type { PlayerScore } from '$lib/data/matches';

	import { getLocale } from '$lib/paraglide/runtime';
	import { MAP_NAMES, type GameMap } from '$lib/data/game';
	import { damage, m } from '$lib/paraglide/messages';
	const dateFormatter = new Intl.DateTimeFormat(getLocale(), {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	});

	let {
		match,
		teamIndex,
		event,
		playerSlug,
		playerId
	}: {
		match: {
			id: string;
			teams: {
				team: Team;
				score: number;
			}[];
			games: {
				id?: number;
				winner: number;
				mapId?: GameMap | null;
				teamScores?: [number, number];
				playerPlayed?: boolean;
				playerScores?: { A: PlayerScore[]; B: PlayerScore[] };
			}[];
		};
		teamIndex: number;
		event:
			| Event
			| {
					id: string;
					slug: string;
					name: string;
					image: string;
					date: string;
					region: string;
					format: string;
					status: string;
					server: string;
					capacity: number;
					official: boolean;
			  };
		playerSlug?: string;
		playerId?: string;
	} = $props();

	let expanded = $state(false);

	$inspect(`[MatchCard] match`, match);
</script>

<li class="group relative">
	<div
		class="glass relative grid grid-cols-1 items-center rounded-sm px-4 shadow-2xl sm:grid-cols-[1fr_1fr_auto] sm:gap-4"
	>
		<a
			href={`/events/${event.slug || event.id}`}
			class="flex origin-left flex-col py-2 transition-all duration-200 hover:scale-105 hover:font-bold sm:py-0"
		>
			<time datetime={event.date} class="text-xs text-gray-400">
				{safeFormatDate(event.date, dateFormatter)}
			</time>
			<span class="text-sm text-yellow-300">{event.name}</span>
		</a>
		<a
			href={`/matches/${match.id}`}
			class="grid grid-cols-[1fr_auto_1fr] items-center gap-4 border-t border-gray-700 transition-all duration-200 hover:scale-105 hover:font-bold sm:border-t-0"
		>
			<span
				class="text-center sm:text-right"
				class:text-gray-200={teamIndex === 0}
				class:text-gray-400={teamIndex === 1}>{match.teams[0]?.team?.name || 'Unknown Team'}</span
			>
			<span
				class="mx-auto grid w-18 grid-cols-[1fr_auto_1fr] items-center justify-center gap-1 p-4 text-center text-white"
				class:bg-green-500={(() => {
					const winnerIndex = calculateWinnerIndex(match);
					return winnerIndex !== null && winnerIndex === teamIndex + 1;
				})()}
				class:bg-red-500={(() => {
					const winnerIndex = calculateWinnerIndex(match);
					return winnerIndex !== null && winnerIndex !== teamIndex + 1;
				})()}
				class:bg-gray-500={(() => {
					const winnerIndex = calculateWinnerIndex(match);
					return winnerIndex === null; // Draw
				})()}
			>
				<span>
					{match.teams[0]?.score || 0}
				</span>
				<span class="text-white">-</span>
				<span>{match.teams[1]?.score || 0}</span>
			</span>
			<span
				class="pb-2 text-center sm:pb-0 sm:text-left"
				class:text-gray-200={teamIndex === 1}
				class:text-gray-400={teamIndex === 0}>{match.teams[1]?.team?.name || 'Unknown Team'}</span
			>
		</a>
		<!-- Toggle anchored to bottom-right of the card -->
		<button
			type="button"
			class="absolute right-2 bottom-2 z-20 flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-white/10 bg-gray-800/80 p-1 text-gray-300 shadow-sm backdrop-blur transition-all duration-200 hover:scale-105 hover:text-white active:scale-95"
			onclick={() => (expanded = !expanded)}
			aria-expanded={expanded}
			aria-label={expanded ? 'Hide maps' : 'Show maps'}
		>
			<div class:rotate-180={expanded} class="transition-transform duration-200">
				<IconChevronDown class="h-6 w-6" />
			</div>
		</button>
	</div>

	{#if expanded}
		<!-- Expanded content outside the card to avoid parent styles -->
		<div
			class="relative z-30 mt-1 rounded-md border border-gray-700 bg-gray-900/70 px-3 py-3 shadow-inner backdrop-blur-sm"
		>
			<div class="flex flex-col gap-3">
				{#each match.games as g, i}
					{#key g.id}
						<a
							class="flex cursor-pointer items-center justify-between gap-3 rounded bg-gray-800/60 p-2 transition-all duration-200 hover:scale-102 hover:bg-gray-800/80"
							href={`/matches/${match.id}?game=${g.id}&sortBy=score-desc`}
							title={m.view_score()}
						>
							<div class="flex items-center gap-2">
								{#if g.mapId}
									<MapIcon mapId={g.mapId} class="h-6 w-10" />
									<span class="font-semibold">{MAP_NAMES[g.mapId]()}</span>
								{:else}
									<div class="h-6 w-10 rounded bg-gray-700"></div>
									<span class="font-semibold">Unknown Map</span>
								{/if}
								<span class="text-gray-400 italic" class:hidden={!g.playerPlayed}>({m.dnp()})</span>
							</div>

							{#if g.playerScores}
								{@const mine = playerId
									? (g.playerScores.A.find((ps) => String(ps.accountId) === String(playerId)) ??
										g.playerScores.B.find((ps) => String(ps.accountId) === String(playerId)))
									: (g.playerScores.A.find((ps) => ps.playerSlug === playerSlug) ??
										g.playerScores.B.find((ps) => ps.playerSlug === playerSlug))}
								{#if mine}
									<div class="flex items-center gap-4 text-xs text-gray-200">
										<span class="flex flex-col items-center gap-1">
											<span class="font-bold">{m.performance_score()}</span>
											{mine.score}
										</span>
										<span class="flex flex-col items-center gap-1">
											<span class="font-bold">{m.damage_score()}</span>
											{mine.damageScore}
										</span>

										<span class="flex flex-col items-center gap-1">
											<span class="font-bold">{m.kills()}</span>
											{mine.kills}
										</span>
										<span class="flex flex-col items-center gap-1">
											<span class="font-bold">({m.knocks()})</span>
											({mine.knocks})
										</span>
										<span class="flex flex-col items-center gap-1 text-gray-400">
											<span class="font-bold">/</span>
											/
										</span>
										<span class="flex flex-col items-center gap-1">
											<span class="font-bold">{m.deaths()}</span>
											{mine.deaths}
										</span>
										<span class="flex flex-col items-center gap-1 text-gray-400">
											<span class="font-bold">/</span>
											/
										</span>
										<span class="flex flex-col items-center gap-1">
											<span class="font-bold">{m.assists()}</span>
											{mine.assists}
										</span>

										<span class="flex flex-col items-center gap-1">
											<span class="font-bold">{m.damage()}</span>
											{mine.damage}
										</span>
									</div>
								{/if}
							{/if}
							<div class="flex items-center justify-end gap-3 text-sm">
								{#if g.teamScores}
									<span
										class={`rounded px-2 py-0.5 text-white ${g.winner === teamIndex ? 'bg-yellow-600' : 'bg-red-600'}`}
									>
										{g.teamScores[0] ?? 0} - {g.teamScores[1] ?? 0}
									</span>
								{/if}
								<span class={g.winner === teamIndex ? 'text-yellow-400' : 'text-red-400'}>
									{g.winner === teamIndex ? m.wins_label() : m.losses_label()}
								</span>
							</div>
						</a>
					{/key}
				{/each}
			</div>
		</div>
	{/if}
</li>
