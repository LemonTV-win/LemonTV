<script lang="ts">
	import { safeParseDateRange } from '$lib/utils/date';

	interface EventOption {
		id: string;
		name: string;
		date?: string; // e.g. YYYY-MM-DD or YYYY-MM-DD/YYYY-MM-DD
		imageURL?: string;
		image?: string;
	}

	interface Props {
		value?: string | null;
		events?: EventOption[];
		id?: string;
		name?: string;
		placeholder?: string;
		class?: string;
		includeEmptyOption?: boolean;
		sort?: 'date_desc' | 'date_asc' | 'name_asc' | 'name_desc';
	}

	let {
		value = $bindable<string | null>(null),
		events = [],
		id = undefined,
		name = undefined,
		placeholder = 'Select event',
		class: className = '',
		includeEmptyOption = true,
		sort = 'date_desc'
	}: Props = $props();

	function parseStartDate(dateStr?: string): number {
		if (!dateStr) {
			return 0;
		}

		const parsed = safeParseDateRange(dateStr);
		return parsed?.start.getTime() ?? 0;
	}

	const sortedEvents = $derived(
		[...events].sort((a, b) => {
			if (sort === 'name_asc' || sort === 'name_desc') {
				const cmp = a.name.localeCompare(b.name);
				return sort === 'name_asc' ? cmp : -cmp;
			}
			const at = parseStartDate(a.date);
			const bt = parseStartDate(b.date);
			return sort === 'date_desc' ? bt - at : at - bt;
		})
	);
</script>

<select {id} {name} class={className} bind:value>
	{#if includeEmptyOption}
		<option value="">{placeholder}</option>
	{/if}
	{#each sortedEvents as ev (ev.id)}
		<option value={ev.id}>
			{ev.name}{ev.date ? ` (${ev.date})` : ''}
		</option>
	{/each}
</select>
