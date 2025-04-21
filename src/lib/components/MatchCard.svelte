<script lang="ts">
	import type { Match } from '$lib/data/matches';
	import { calculateWinnerIndex, type Event } from '$lib/data';

	import { getLocale } from '$lib/paraglide/runtime';
	const dateFormatter = new Intl.DateTimeFormat(getLocale(), {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	});
	let { match, teamIndex, event }: { match: Match; teamIndex: number; event: Event } = $props();
</script>

<li
	class="grid grid-cols-[1fr_1fr_auto_1fr] items-center gap-4 rounded-sm bg-gray-800 px-4 shadow-2xl"
>
	<a href={`/events/${event.id}`} class="flex flex-col">
		<time datetime={event.date} class="text-xs text-gray-400">
			{dateFormatter.format(new Date(event.date))}
		</time>
		<span class="text-sm text-yellow-300">{event.name}</span>
	</a>
	<a href={`/matches/${match.id}`} class="contents">
		<span
			class="text-right"
			class:text-gray-200={teamIndex === 0}
			class:text-gray-400={teamIndex === 1}>{match.teams[0].team.name}</span
		>
		<span
			class="grid w-18 grid-cols-[1fr_auto_1fr] items-center justify-center gap-1 p-4 text-center text-white"
			class:bg-green-500={calculateWinnerIndex(match) === teamIndex + 1}
			class:bg-red-500={calculateWinnerIndex(match) !== teamIndex + 1}
		>
			<span>
				{match.teams[0].score}
			</span>
			<span class="text-white">-</span>
			<span>{match.teams[1].score}</span>
		</span>
		<span
			class="text-left"
			class:text-gray-200={teamIndex === 1}
			class:text-gray-400={teamIndex === 0}>{match.teams[1].team.name}</span
		>
	</a>
</li>
