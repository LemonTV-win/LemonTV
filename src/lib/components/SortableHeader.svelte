<script lang="ts">
	import TypcnArrowSortedUp from '~icons/typcn/arrow-sorted-up';
	import TypcnArrowSortedDown from '~icons/typcn/arrow-sorted-down';

	let {
		label,
		active = false,
		direction = 'asc',
		onsort,
		class: className = 'px-4 py-1'
	}: {
		label: string;
		/** Whether this column is the one currently sorted. */
		active?: boolean;
		/** Current sort direction (only shown when active). */
		direction?: 'asc' | 'desc';
		onsort: () => void;
		class?: string;
	} = $props();
</script>

<th class={className}>
	<button
		type="button"
		class="flex items-center gap-1 transition-colors hover:text-white"
		class:text-white={active}
		onclick={onsort}
	>
		<span>{label}</span>
		{#if active && direction === 'asc'}
			<TypcnArrowSortedUp class="inline-block" />
		{:else if active && direction === 'desc'}
			<TypcnArrowSortedDown class="inline-block" />
		{/if}
	</button>
</th>
