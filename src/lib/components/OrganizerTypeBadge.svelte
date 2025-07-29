<script lang="ts">
	import { m } from '$lib/paraglide/messages';

	export let type: string | null | undefined;

	const typeLabels: Record<string, () => string> = {
		individual: m.individual,
		organization: m.organization,
		community: m.community,
		tournament_series: m.tournament_series,
		league: m.league
	};

	const typeColors: Record<string, string> = {
		individual: 'bg-blue-500/10 text-blue-500',
		organization: 'bg-purple-500/10 text-purple-500',
		community: 'bg-green-500/10 text-green-500',
		tournament_series: 'bg-yellow-500/10 text-yellow-500',
		league: 'bg-red-500/10 text-red-500'
	};
</script>

{#if type}
	<span
		class={`inline-flex items-center rounded-md border border-current/20 px-2 py-1 text-sm ${typeColors[type] || 'bg-gray-500/10 text-gray-500'}`}
	>
		{typeLabels[type as keyof typeof typeLabels]() || type}
	</span>
{/if}
